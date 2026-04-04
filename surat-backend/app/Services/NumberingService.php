<?php

namespace App\Services;

use App\Exceptions\GapAlreadyUsedException;
use App\Exceptions\NumberingLockException;
use App\Models\DailySequence;
use App\Models\GapRequest;
use App\Models\LetterNumber;
use Carbon\Carbon;
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
     * @param  int  $nextStart   Nilai next_start dari DailySequence (awal blok 0)
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

    // ─── Sequence Management ─────────────────────────────────────────────────

    /**
     * Lazy-create: buat row sequence hanya saat pertama kali dibutuhkan.
     * Jika sequence untuk tanggal + klasifikasi sudah ada, kembalikan yang lama.
     *
     * Implementasi menggunakan INSERT IGNORE + SELECT (via updateOrInsert + find)
     * untuk menghindari UNIQUE constraint error di SQLite saat dipanggil dari
     * dalam DB::transaction (savepoint) yang menyebabkan firstOrCreate gagal.
     *
     * @param  int     $classificationId
     * @param  Carbon  $date
     * @return DailySequence
     */
    public function getOrCreateSequence(int $classificationId, Carbon $date): DailySequence
    {
        $dateStr = $date->toDateString(); // format 'Y-m-d' konsisten

        // Lazy-create: buat row sequence hanya saat pertama kali dibutuhkan.
        // insertOrIgnore: hanya INSERT jika row belum ada -- jika sudah ada, tidak ada update.
        // Ini penting: last_number tidak boleh di-reset ke 0 jika sequence sudah ada.
        DB::table('daily_sequences')->insertOrIgnore([
            'date'              => $dateStr,
            'classification_id' => $classificationId,
            'last_number'       => 0,
            'gap_size'          => config('numbering.default_gap_size'),
            'next_start'        => config('numbering.default_start'),
            'updated_at'        => now(),
        ]);

        // Ambil model Eloquent yang sudah ada (dijamin ada setelah insertOrIgnore)
        return DailySequence::where('date', $dateStr)
            ->where('classification_id', $classificationId)
            ->firstOrFail();
    }

    // ─── Acquire Number ──────────────────────────────────────────────────────

    /**
     * Mengambil (acquire) nomor surat berikutnya untuk klasifikasi dan tanggal tertentu.
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
     * @param  int     $classificationId
     * @param  Carbon  $date
     * @return int  Nomor surat yang berhasil di-acquire (selalu dalam zona aktif)
     *
     * @throws NumberingLockException  Jika terjadi deadlock atau lock timeout
     */
    public function acquireNumber(int $classificationId, Carbon $date): int
    {
        // Pastikan sequence sudah ada SEBELUM masuk transaksi locking.
        // getOrCreateSequence menggunakan updateOrInsert (idempotent) yang
        // aman dipanggil di luar transaksi utama.
        $sequence = $this->getOrCreateSequence($classificationId, $date);
        $sequenceId = $sequence->id;

        $attempts    = 0;
        $maxAttempts = 3;

        while (true) {
            try {
                return DB::transaction(function () use ($classificationId, $date, $sequenceId) {
                    // Query by primary key -- lebih reliable dari where('date',...) di SQLite
                    $sequence = $this->withLock(
                        DailySequence::where('id', $sequenceId)
                    )->first();

                    if (!$sequence) {
                        // Tidak seharusnya terjadi -- sequence sudah dibuat sebelum transaksi
                        throw new NumberingLockException("Sequence ID={$sequenceId} tidak dapat di-load.");
                    }

                    // Hitung nomor kandidat berikutnya berdasarkan last_number yang tersimpan
                    $candidate = $sequence->next_start + $sequence->last_number;

                    // Tentukan posisi dalam blok (setiap blok = gap_size aktif + gap_size cadangan)
                    $blockSize  = $sequence->gap_size * 2;
                    $posInBlock = ($candidate - $sequence->next_start) % $blockSize;

                    // Jika candidate jatuh di zona gap, lompat ke aktif_start blok berikutnya
                    if ($posInBlock >= $sequence->gap_size) {
                        $currentBlock = (int) floor(($candidate - $sequence->next_start) / $blockSize);
                        $nextBlock    = $this->calculateBlock($sequence->next_start, $sequence->gap_size, $currentBlock + 1);
                        $candidate    = $nextBlock['aktifStart'];
                        // Sinkronkan last_number dengan posisi baru (sebelum increment)
                        $sequence->last_number = $candidate - $sequence->next_start;
                    }

                    // Verifikasi nomor belum dipakai (guard terhadap race condition residual)
                    $alreadyUsed = LetterNumber::where('classification_id', $classificationId)
                        ->where('issued_date', $date->toDateString())
                        ->where('number', $candidate)
                        ->exists();

                    if ($alreadyUsed) {
                        throw new NumberingLockException("Nomor {$candidate} sudah digunakan.");
                    }

                    // Increment last_number: posisi relatif dari next_start + 1 (untuk nomor selanjutnya)
                    $sequence->last_number = $candidate - $sequence->next_start + 1;
                    $sequence->save();

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
     * @throws \RuntimeException        Jika sequence tidak ditemukan
     * @throws GapAlreadyUsedException  Jika nomor bukan zona gap atau sudah diterbitkan
     */
    public function releaseGapNumber(GapRequest $gapRequest): LetterNumber
    {
        return DB::transaction(function () use ($gapRequest) {
            $dateStr  = $gapRequest->gap_date->toDateString();
            $sequence = $this->withLock(
                DailySequence::where('date', $dateStr)
                    ->where('classification_id', $gapRequest->classification_id)
            )->first();

            if (!$sequence) {
                throw new \RuntimeException("Sequence tidak ditemukan untuk tanggal dan klasifikasi ini.");
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
            $exists = LetterNumber::where('classification_id', $gapRequest->classification_id)
                ->where('issued_date', $dateStr)
                ->where('number', $gapRequest->number)
                ->exists();

            if ($exists) {
                throw new GapAlreadyUsedException("Nomor gap {$gapRequest->number} sudah diterbitkan.");
            }

            return LetterNumber::create([
                'user_id'           => $gapRequest->requested_by,
                'classification_id' => $gapRequest->classification_id,
                'number'            => $gapRequest->number,
                'issued_date'       => $gapRequest->gap_date,
                'subject'           => 'Gap request #' . $gapRequest->id,
                'destination'       => '-',
                'status'            => 'active',
            ]);
        });
    }

    // ─── Prepare Next Day ────────────────────────────────────────────────────

    /**
     * Menyiapkan sequence untuk hari berikutnya berdasarkan sequence hari ini.
     *
     * Logika: temukan blok terakhir yang dipakai hari ini, lalu set next_start
     * hari berikutnya ke awal blok setelahnya (melewati sisa zona aktif + zona gap
     * yang belum terpakai hari ini). Ini memastikan nomor tidak overlap antar hari.
     *
     * Contoh: jika hari ini pakai nomor 1000-1005 (blok 0, gap_size=10),
     *   currentBlock = 0
     *   next_start besok = 1000 + (0+1) * 20 = 1020
     *
     * @param  DailySequence  $sequence  Sequence hari ini yang akan dilanjutkan
     * @return void
     */
    public function prepareNextDay(DailySequence $sequence): void
    {
        // Hitung next_start untuk hari berikutnya:
        // Blok terakhir yang dipakai + 1 blok penuh (aktif + gap)
        $lastNumber   = $sequence->next_start + $sequence->last_number - 1;
        $blockSize    = $sequence->gap_size * 2;
        $currentBlock = (int) floor(($lastNumber - $sequence->next_start) / $blockSize);
        $nextStart    = $sequence->next_start + ($currentBlock + 1) * $blockSize;

        DailySequence::updateOrCreate(
            [
                'date'              => now()->addDay()->toDateString(),
                'classification_id' => $sequence->classification_id,
            ],
            [
                'last_number' => 0,
                'gap_size'    => $sequence->gap_size,
                'next_start'  => $nextStart,
            ]
        );
    }
}
