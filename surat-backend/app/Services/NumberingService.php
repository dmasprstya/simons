<?php

namespace App\Services;

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use App\Models\DailyGap;
use App\Models\GapRequest;
use App\Models\GlobalSequence;
use App\Models\LetterNumber;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

    // ─── Archive Gap Zone ─────────────────────────────────────────────────────

    /**
     * Arsipkan satu zona gap ke tabel daily_gaps.
     *
     * Menggunakan firstOrCreate dengan kunci (date, gap_start) sehingga aman
     * dipanggil lebih dari sekali untuk zona yang sama (idempoten).
     * Constraint unique composite (date, gap_start) menjamin tidak ada duplikasi
     * bahkan jika dua thread memanggil ini bersamaan di bawah transaksi berbeda.
     *
     * @param  \Illuminate\Support\Carbon  $date      Tanggal zona gap
     * @param  int                          $gapStart  Awal nomor zona gap
     * @param  int                          $gapEnd    Akhir nomor zona gap
     * @return void
     */
    private function archiveGapZone(\Illuminate\Support\Carbon $date, int $gapStart, int $gapEnd): void
    {
        DailyGap::firstOrCreate(
            ['date' => $date, 'gap_start' => $gapStart],
            ['gap_end' => $gapEnd]
        );
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

                    // ─── Deteksi pergantian hari ──────────────────────────────
                    // Jika last_issued_date ada dan bukan hari ini, berarti hari telah berganti.
                    // Zona gap dari blok kemarin harus diarsipkan ke daily_gaps,
                    // lalu sequence dilompat ke aktifStart blok baru hari ini.
                    if ($seq->last_issued_date !== null && !$seq->last_issued_date->isToday()) {
                        $blockSize = $seq->gap_size * 2;

                        // Hitung indeks blok yang sedang berjalan saat hari terakhir
                        // last_number sudah di-increment (+1) saat acquire terakhir, sehingga
                        // posisi efektif kandidat kemarin = next_start + last_number - 1
                        $lastIssuedOffset = $seq->last_number - 1; // -1 karena last_number sudah +1
                        $oldBlockIndex    = (int) floor($lastIssuedOffset / $blockSize);

                        $oldBlock = $this->calculateBlock($seq->next_start, $seq->gap_size, $oldBlockIndex);

                        // Hitung zona gap blok kemarin
                        $oldGapStart = $oldBlock['aktifEnd'] + 1;                   // = oldBlock['gapStart']
                        $oldGapEnd   = $oldGapStart + $seq->gap_size - 1;           // = oldBlock['gapEnd']

                        // Arsipkan zona gap blok kemarin ke tabel daily_gaps
                        $this->archiveGapZone($seq->last_issued_date, $oldGapStart, $oldGapEnd);

                        Log::info('NumberingService: day rolled over', [
                            'old_date'    => $seq->last_issued_date->toDateString(),
                            'old_gap'     => "{$oldGapStart}–{$oldGapEnd}",
                            'next_block'  => $oldBlockIndex + 1,
                        ]);

                        // Lompat ke aktifStart blok berikutnya sebagai kandidat pertama hari ini
                        $nextBlock = $this->calculateBlock($seq->next_start, $seq->gap_size, $oldBlockIndex + 1);
                        $candidate = $nextBlock['aktifStart'];

                        // Sinkronkan last_number dengan posisi kandidat baru (sebelum increment)
                        $seq->last_number = $candidate - $seq->next_start;
                    }
                    // ─────────────────────────────────────────────────────────

                    // Hitung nomor kandidat berikutnya berdasarkan last_number yang tersimpan
                    $candidate = $seq->next_start + $seq->last_number;

                    // Tentukan posisi dalam blok (setiap blok = gap_size aktif + gap_size cadangan)
                    $blockSize  = $seq->gap_size * 2;
                    $posInBlock = ($candidate - $seq->next_start) % $blockSize;

                    // Jika candidate jatuh di zona gap, lompat ke aktif_start blok berikutnya
                    // (guard reaktif: terjadi bila hari ini masih dalam blok yang sama)
                    // Kondisi ini terjadi saat jumlah surat dalam 1 hari melebihi gap_size (overflow blok).
                    if ($posInBlock >= $seq->gap_size) {
                        $currentBlock = (int) floor(($candidate - $seq->next_start) / $blockSize);
                        $overflowBlock = $this->calculateBlock($seq->next_start, $seq->gap_size, $currentBlock);

                        // Arsipkan zona gap blok yang dilewati hari ini (overflow intra-hari)
                        $issuedDate = $seq->last_issued_date ?? today();
                        $this->archiveGapZone($issuedDate, $overflowBlock['gapStart'], $overflowBlock['gapEnd']);

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

                    // Selalu catat tanggal terbit terakhir agar deteksi pergantian hari berfungsi
                    $seq->last_issued_date = today();
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

    // ─── Ensure Day Is Current ────────────────────────────────────────────────

    /**
     * Cek dan lakukan rollover zona gap jika hari telah berganti, tanpa menerbitkan nomor baru.
     *
     * Dipanggil oleh controller (misal GapNumberController, DailySequenceController)
     * saat user membuka halaman yang membutuhkan data zona gap terkini.
     * Dengan ini, zona gap hari sebelumnya langsung tersedia meski belum ada nomor
     * baru yang diterbitkan pada hari ini.
     *
     * Jika server mati semalam dan baru nyala pagi ini, pemanggilan method ini
     * sudah cukup untuk menjamin daily_gaps terisi sebelum user melihat daftar nomor kosong.
     *
     * @return void
     */
    public function ensureDayIsCurrent(): void
    {
        DB::transaction(function () {
            $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

            // Jika belum ada record atau last_issued_date belum ada, belum ada nomor yang pernah diterbitkan
            if (!$seq || $seq->last_issued_date === null) {
                return;
            }

            // Jika last_issued_date sudah hari ini, tidak perlu rollover
            if ($seq->last_issued_date->isToday()) {
                return;
            }

            // Hari telah berganti — arsipkan zona gap hari terakhir
            $blockSize = $seq->gap_size * 2;
            $lastIssuedOffset = $seq->last_number - 1;
            $oldBlockIndex    = (int) floor($lastIssuedOffset / $blockSize);
            $oldBlock         = $this->calculateBlock($seq->next_start, $seq->gap_size, $oldBlockIndex);

            $this->archiveGapZone($seq->last_issued_date, $oldBlock['gapStart'], $oldBlock['gapEnd']);

            Log::info('NumberingService@ensureDayIsCurrent: gap archived', [
                'old_date' => $seq->last_issued_date->toDateString(),
                'gap'      => "{$oldBlock['gapStart']}–{$oldBlock['gapEnd']}",
            ]);
        });
    }

    // ─── Reset Sequence ───────────────────────────────────────────────────────

    /**
     * Mereset sequence penomoran ke titik awal baru.
     *
     * Alur reset:
     *   1. Lock GlobalSequence row tunggal (pessimistic lock).
     *   2. Arsipkan zona gap blok yang sedang berjalan (jika ada nomor yang pernah diterbitkan).
     *   3. Set next_start ke nilai baru, last_number ke 0, dan opsional perbarui gap_size.
     *   4. Hapus last_issued_date agar logika pergantian hari dimulai ulang.
     *
     * Only can be called by admin. Caught and logged via AuditService in controller.
     *
     * @param  int  $nextStart  New starting number (new next_start)
     * @return array<string, mixed>  GlobalSequence state after reset
     *
     * @throws NumberingLockException  If deadlock occurs during lock
     */
    public function resetSequence(int $nextStart): array
    {
        return DB::transaction(function () use ($nextStart) {
            $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

            if (!$seq) {
                throw new NumberingLockException("GlobalSequence tidak ditemukan.");
            }

            // Archive the gap zone of the current block before reset
            if ($seq->last_issued_date !== null && $seq->last_number > 0) {
                $blockSize        = $seq->gap_size * 2;
                $lastOffset       = $seq->last_number - 1;
                $currentBlockIdx  = (int) floor($lastOffset / $blockSize);
                $currentBlock     = $this->calculateBlock($seq->next_start, $seq->gap_size, $currentBlockIdx);

                $this->archiveGapZone(
                    $seq->last_issued_date,
                    $currentBlock['gapStart'],
                    $currentBlock['gapEnd']
                );
            }

            $seq->next_start       = $nextStart;
            $seq->last_number      = 0;
            $seq->last_issued_date = null;

            $seq->save();

            return [
                'next_start'  => $seq->next_start,
                'gap_size'    => $seq->gap_size,
                'last_number' => $seq->last_number,
                'next_number' => $seq->next_start,
            ];
        });
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
