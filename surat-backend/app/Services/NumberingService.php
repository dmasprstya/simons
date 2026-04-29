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
    /**
     * Terapkan pessimistic locking (SELECT ... FOR UPDATE) hanya jika driver MySQL.
     *
     * @param  Builder  $query
     * @return Builder
     */
    private function withLock(Builder $query): Builder
    {
        if (DB::getDriverName() === 'mysql') {
            return $query->lockForUpdate();
        }

        return $query;
    }

    /**
     * Arsipkan zona gap ke tabel daily_gaps.
     *
     * @param  \Illuminate\Support\Carbon  $date
     * @param  int                          $gapStart
     * @param  int                          $gapEnd
     * @return void
     */
    private function archiveGapZone(\Illuminate\Support\Carbon $date, int $gapStart, int $gapEnd): void
    {
        DailyGap::firstOrCreate(
            ['date' => $date, 'gap_start' => $gapStart],
            ['gap_end' => $gapEnd]
        );
    }

    /**
     * Menangani rollover harian dan tahunan untuk semua hari yang terlewat.
     * Mengabaikan hari Sabtu dan Minggu sesuai aturan hari libur.
     *
     * @param  GlobalSequence  $seq
     * @return void
     */
    private function performRollover(GlobalSequence $seq): void
    {
        if ($seq->last_issued_date === null) {
            return;
        }

        $cursorDate = $seq->last_issued_date->copy();
        $today = today();

        while ($cursorDate->lt($today)) {
            // Abaikan Sabtu dan Minggu untuk pembuatan gap
            if (!$cursorDate->isWeekend() && $seq->last_number > 0) {
                $gapStart = $seq->last_number + 1;
                $gapEnd   = $seq->last_number + $seq->gap_size;

                $this->archiveGapZone($cursorDate, $gapStart, $gapEnd);

                $seq->last_number = $gapEnd;

                Log::info('NumberingService: daily rollover gap applied', [
                    'date' => $cursorDate->toDateString(),
                    'gap' => "{$gapStart}–{$gapEnd}",
                ]);
            }

            $prevYear = $cursorDate->year;
            $cursorDate->addDay();

            // Deteksi Ganti Tahun dalam perulangan lompatan hari
            if ($cursorDate->year > $prevYear) {
                $seq->last_number = 0;
                Log::info('NumberingService: yearly reset applied during rollover', [
                    'new_year' => $cursorDate->year,
                ]);
            }
        }

        $seq->last_issued_date = $today;
    }

    /**
     * Mengambil (acquire) nomor surat berikutnya dari GlobalSequence.
     * Mengikuti alur linear dengan gap saat ganti hari (rollover).
     *
     * @return int
     * @throws NumberingLockException
     */
    public function acquireNumber(): int
    {
        $attempts = 0;
        $maxAttempts = 3;

        while (true) {
            try {
                return DB::transaction(function () {
                    $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

                    if (!$seq) {
                        $seq = GlobalSequence::getInstance();
                    }

                    if ($seq->last_issued_date === null) {
                        // Penggunaan pertama kali
                        $candidate = config('numbering.default_start', 1000);
                    } else {
                        // Jalankan rollover (harian/tahunan/lompatan hari)
                        $this->performRollover($seq);
                        $candidate = $seq->last_number + 1;
                    }

                    // Verifikasi nomor belum dipakai di tahun yang sama
                    if (LetterNumber::where('number', $candidate)
                        ->whereYear('issued_date', today()->year)
                        ->exists()) {
                        throw new NumberingLockException("Nomor {$candidate} sudah digunakan di tahun ini.");
                    }

                    // Update sequence
                    $seq->last_number      = $candidate;
                    $seq->last_issued_date = today();
                    $seq->save();

                    return $candidate;
                });
            } catch (\Illuminate\Database\QueryException $e) {
                if ($e->errorInfo[1] === 1213 && ++$attempts < $maxAttempts) {
                    continue;
                }
                throw new NumberingLockException("Database lock error.");
            }
        }
    }


    /**
     * Menerbitkan nomor dari zona gap berdasarkan GapRequest yang sudah diapprove.
     *
     * @param  GapRequest  $gapRequest
     * @return LetterNumber
     * @throws GapAlreadyUsedException
     */
    public function releaseGapNumber(GapRequest $gapRequest): LetterNumber
    {
        return DB::transaction(function () use ($gapRequest) {
            // 1. Validasi nomor ada di tabel daily_gaps untuk tanggal tersebut
            $isValidGap = DailyGap::where('date', $gapRequest->gap_date)
                ->where('gap_start', '<=', $gapRequest->number)
                ->where('gap_end', '>=', $gapRequest->number)
                ->exists();

            if (!$isValidGap) {
                throw new GapAlreadyUsedException("Nomor {$gapRequest->number} bukan nomor gap yang valid untuk tanggal tersebut.");
            }

            // 2. Pastikan belum digunakan
            if (LetterNumber::where('number', $gapRequest->number)->exists()) {
                throw new GapAlreadyUsedException("Nomor gap {$gapRequest->number} sudah diterbitkan.");
            }

            $classification = \App\Models\LetterClassification::find($gapRequest->classification_id);

            return LetterNumber::create([
                'user_id'           => $gapRequest->requested_by,
                'classification_id' => $gapRequest->classification_id,
                'number'            => $gapRequest->number,
                'formatted_number'  => LetterNumber::buildFormattedNumber(
                    $classification->code,
                    $gapRequest->number
                ),
                'issued_date'  => $gapRequest->gap_date,
                'subject'      => $gapRequest->subject,
                'destination'  => $gapRequest->destination,
                'sifat_surat'  => $gapRequest->sifat_surat,
                'source'       => 'gap',
                'status'       => 'active',
            ]);
        });
    }

    /**
     * Memberikan info sequence saat ini.
     */
    public function getSequenceInfo(): array
    {
        $seq = GlobalSequence::getInstance();
        
        $nextNumber = 0;
        if ($seq->last_number === 0) {
            $nextNumber = config('numbering.default_start', 1000);
        } else {
            // Check if rollover would happen
            $isNewDay = $seq->last_issued_date !== null && 
                        $seq->last_issued_date->format('Y-m-d') !== today()->format('Y-m-d');
            
            $nextNumber = $isNewDay ? $seq->last_number + $seq->gap_size + 1 : $seq->last_number + 1;
        }

        return [
            'next_number'      => $nextNumber,
            'last_number'      => $seq->last_number,
            'gap_size'         => $seq->gap_size,
            'last_issued_date' => $seq->last_issued_date?->toDateString(),
            'updated_at'       => $seq->updated_at,
        ];
    }

    /**
     * Cek dan lakukan rollover tanpa ambil nomor.
     */
    public function ensureDayIsCurrent(): void
    {
        DB::transaction(function () {
            $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

            if (!$seq || $seq->last_issued_date === null || $seq->last_issued_date->isToday()) {
                return;
            }

            $this->performRollover($seq);
            $seq->save();
        });
    }



    /**
     * Update gap size.
     */
    public function updateGapSize(int $newGapSize): void
    {
        DB::transaction(function () use ($newGapSize) {
            $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();
            $seq->gap_size = $newGapSize;
            $seq->save();
        });
    }
}
