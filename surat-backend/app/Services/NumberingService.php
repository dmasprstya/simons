<?php

namespace App\Services;

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use App\Models\GapRequest;
use App\Models\GlobalSequence;
use App\Models\LetterNumber;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class NumberingService
{
    // ─── Kalkulasi Blok ──────────────────────────────────────────────────────

    /**
     * Menghitung batas aktif dan gap untuk blok ke-$blockIndex.
     *
     * Sistem membagi nomor surat menjadi blok. Setiap blok = gap_size nomor aktif
     * + gap_size nomor cadangan (zona gap).
     *
     * Contoh (default_start=1000, gap_size=10):
     *   Blok 0 (N=0) -> aktif: 1000-1009 | zona gap: 1010-1019
     *   Blok 1 (N=1) -> aktif: 1020-1029 | zona gap: 1030-1039
     *   Blok 2 (N=2) -> aktif: 1040-1049 | zona gap: 1050-1059
     *
     * Formula:
     *   aktif_start = next_start + N * (gap_size * 2)
     *   aktif_end   = aktif_start + gap_size - 1
     *   gap_start   = aktif_end + 1
     *   gap_end     = gap_start + gap_size - 1
     *
     * @param  int  $nextStart   Nilai next_start dari GlobalSequence (awal blok 0)
     * @param  int  $gapSize     Jumlah nomor per zona (aktif = gap = gapSize)
     * @param  int  $blockIndex  Indeks blok (0-based)
     * @return array{aktifStart: int, aktifEnd: int, gapStart: int, gapEnd: int}
     */
    private function calculateBlock(int $nextStart, int $gapSize, int $blockIndex): array
    {
        // Menghitung batas aktif dan gap untuk blok ke-$blockIndex
        // blockIndex 0 = blok pertama (aktif: 1000-1009, gap: 1010-1019)
        $aktifStart = $nextStart + $blockIndex * ($gapSize * 2);
        $aktifEnd   = $aktifStart + $gapSize - 1;
        $gapStart   = $aktifEnd + 1;
        $gapEnd     = $gapStart + $gapSize - 1;

        return compact('aktifStart', 'aktifEnd', 'gapStart', 'gapEnd');
    }

    /**
     * Terapkan pessimistic locking (SELECT ... FOR UPDATE) hanya jika driver MySQL.
     *
     * SQLite (digunakan saat testing in-memory) tidak mendukung row-level locking.
     * Di produksi dengan MySQL, lockForUpdate() tetap aktif untuk mencegah race condition.
     * Ini bukan workaround logika bisnis -- hanya adapter agar kode testable.
     *
     * @param  Builder  $query
     * @return Builder
     */
    private function withLock(Builder $query): Builder
    {
        // Aktifkan row-level locking hanya di MySQL -- SQLite tidak support FOR UPDATE
        if (DB::getDriverName() === 'mysql') {
            return $query->lockForUpdate();
        }

        return $query;
    }

    // ─── Acquire Number ──────────────────────────────────────────────────────

    /**
     * Mengambil (acquire) nomor surat berikutnya dari GlobalSequence.
     *
     * Menggunakan pessimistic locking (SELECT ... FOR UPDATE) untuk mencegah
     * race condition saat multiple request tiba bersamaan.
     *
     * Retry manual untuk deadlock: retry dilakukan dengan memanggil DB::transaction
     * baru (bukan menggunakan attempts=3 bawaan Laravel). Ini diperlukan agar
     * kompatibel dengan SQLite testing di mana RefreshDatabase membungkus test dalam
     * outer transaction -- menggunakan attempts>1 di Laravel menyebabkan ROLLBACK TO
     * SAVEPOINT yang membatalkan INSERT dari getOrCreateSequence di savepoint yang sama.
     *
     * Logika lompat (skip) zona gap:
     *   Jika kandidat nomor jatuh di zona gap (posInBlock >= gap_size),
     *   langsung lompat ke aktif_start blok berikutnya.
     *
     * @return int  Nomor surat yang berhasil di-acquire (selalu dalam zona aktif)
     *
     * @throws NumberingLockException  Jika terjadi deadlock atau lock timeout
     */
    public function acquireNumber(): int
    {
        $attempts    = 0;
        $maxAttempts = 3;

        while (true) {
            try {
                return DB::transaction(function () {
                    // Lock GlobalSequence row tunggal (id=1)
                    $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

                    if (!$seq) {
                        throw new NumberingLockException("GlobalSequence tidak ditemukan.");
                    }

                    // Hitung nomor kandidat berikutnya berdasarkan last_number yang tersimpan
                    $candidate = $seq->next_start + $seq->last_number;

                    // Tentukan posisi dalam blok (setiap blok = gap_size aktif + gap_size cadangan)
                    $blockSize  = $seq->gap_size * 2;
                    $posInBlock = ($candidate - $seq->next_start) % $blockSize;

                    // Jika candidate jatuh di zona gap, lompat ke aktif_start blok berikutnya
                    if ($posInBlock >= $seq->gap_size) {
                        $currentBlock = (int) floor(($candidate - $seq->next_start) / $blockSize);
                        $nextBlock    = $this->calculateBlock($seq->next_start, $seq->gap_size, $currentBlock + 1);
                        $candidate    = $nextBlock['aktifStart'];
                        // Sinkronkan last_number dengan posisi baru (sebelum increment)
                        $seq->last_number = $candidate - $seq->next_start;
                    }

                    // Verifikasi nomor belum dipakai (guard terhadap race condition residual)
                    $alreadyUsed = LetterNumber::where('number', $candidate)->exists();

                    if ($alreadyUsed) {
                        throw new NumberingLockException("Nomor {$candidate} sudah digunakan.");
                    }

                    // Increment last_number: posisi relatif dari next_start + 1 (untuk nomor selanjutnya)
                    $seq->last_number = $candidate - $seq->next_start + 1;
                    $seq->save();

                    return $candidate;
                }); // satu attempt per DB::transaction
            } catch (\Illuminate\Database\QueryException $e) {
                // Deadlock MySQL error code: 1213 -- retry hingga maxAttempts kali
                if ($e->errorInfo[1] === 1213 && ++$attempts < $maxAttempts) {
                    continue; // retry manual untuk deadlock
                }
                // Deadlock melebihi batas atau error bukan deadlock
                if ($e->errorInfo[1] === 1213) {
                    throw new NumberingLockException("Deadlock saat mengambil nomor.");
                }
                throw $e;
            }
        }
    }

    // ─── Release Gap Number ──────────────────────────────────────────────────

    /**
     * Menerbitkan nomor dari zona gap berdasarkan GapRequest yang sudah diapprove.
     *
     * Validasi dilakukan dalam 2 tahap:
     *   1. Pastikan nomor target benar-benar berada di zona gap (bukan zona aktif)
     *   2. Pastikan nomor tersebut belum pernah diterbitkan sebelumnya
     *
     * @param  GapRequest  $gapRequest  GapRequest dengan status 'approved'
     * @return LetterNumber  Record LetterNumber yang baru dibuat
     *
     * @throws \RuntimeException        Jika GlobalSequence tidak ditemukan
     * @throws GapAlreadyUsedException  Jika nomor bukan zona gap atau sudah diterbitkan
     */
    public function releaseGapNumber(GapRequest $gapRequest): LetterNumber
    {
        return DB::transaction(function () use ($gapRequest) {
            // Lock GlobalSequence row tunggal (id=1)
            $sequence = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

            if (!$sequence) {
                throw new \RuntimeException("GlobalSequence tidak ditemukan.");
            }

            // Hitung apakah nomor target benar-benar di zona gap
            $blockSize  = $sequence->gap_size * 2;
            $relative   = $gapRequest->number - $sequence->next_start;
            $posInBlock = $relative % $blockSize;

            // posInBlock valid zona gap: gap_size <= posInBlock < blockSize
            if ($posInBlock < $sequence->gap_size || $posInBlock >= $blockSize) {
                throw new GapAlreadyUsedException("Nomor {$gapRequest->number} bukan nomor zona gap yang valid.");
            }

            // Cek nomor belum pernah diterbitkan sebagai LetterNumber
            $exists = LetterNumber::where('number', $gapRequest->number)->exists();

            if ($exists) {
                throw new GapAlreadyUsedException("Nomor gap {$gapRequest->number} sudah diterbitkan.");
            }

            // Fetch kode klasifikasi untuk formatted_number
            $classification = \App\Models\LetterClassification::find($gapRequest->classification_id);

            return LetterNumber::create([
                'user_id'           => $gapRequest->requested_by,
                'classification_id' => $gapRequest->classification_id,
                'number'            => $gapRequest->number,
                'formatted_number'  => LetterNumber::buildFormattedNumber(
                                           $classification->code,
                                           $gapRequest->number
                                       ),
                'issued_date'       => $gapRequest->gap_date,
                'subject'           => 'Gap request #' . $gapRequest->id,
                'destination'       => '-',
                'status'            => 'active',
            ]);
        });
    }

    // ─── Sequence Info ───────────────────────────────────────────────────────

    /**
     * Mengembalikan informasi state GlobalSequence saat ini beserta detail blok aktif.
     *
     * Digunakan oleh admin untuk memantau posisi nomor surat global:
     *   - Nomor berikutnya yang akan diterbitkan
     *   - Rentang zona aktif dan zona gap blok saat ini
     *
     * @return array<string, mixed>
     */
    public function getSequenceInfo(): array
    {
        $seq = GlobalSequence::getInstance();
        $blockSize  = $seq->gap_size * 2;
        $current    = $seq->next_start + $seq->last_number;
        $blockIndex = (int) floor(($current - $seq->next_start) / $blockSize);
        $block      = $this->calculateBlock($seq->next_start, $seq->gap_size, $blockIndex);

        return [
            'next_number'         => $current,
            'gap_size'            => $seq->gap_size,
            'next_start'          => $seq->next_start,
            'last_number'         => $seq->last_number,
            'current_block_aktif' => $block['aktifStart'] . '–' . $block['aktifEnd'],
            'current_block_gap'   => $block['gapStart'] . '–' . $block['gapEnd'],
            'updated_at'          => $seq->updated_at,
        ];
    }

    // ─── Update Gap Size ─────────────────────────────────────────────────────

    /**
     * Memperbarui ukuran zona gap pada GlobalSequence.
     *
     * Perubahan gap_size memengaruhi kalkulasi blok berikutnya — tidak berlaku
     * retroaktif terhadap nomor yang sudah diterbitkan.
     *
     * @param  int  $newGapSize  Ukuran gap baru (jumlah nomor per zona)
     * @return void
     */
    public function updateGapSize(int $newGapSize): void
    {
        DB::transaction(function () use ($newGapSize) {
            $seq           = $this->withLock(GlobalSequence::query()->where('id', 1))->first();
            $seq->gap_size = $newGapSize;
            $seq->save();
        });
    }
}
