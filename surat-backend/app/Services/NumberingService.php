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

                    $isNewDay = $seq->last_issued_date !== null && 
                                $seq->last_issued_date->format('Y-m-d') !== today()->format('Y-m-d');

                    if ($isNewDay) {
                        // 1. Rollover: Terjadi ganti hari
                        $gapStart = $seq->last_number + 1;
                        $gapEnd   = $seq->last_number + $seq->gap_size;

                        // Arsipkan gap hari kemarin
                        $this->archiveGapZone($seq->last_issued_date, $gapStart, $gapEnd);

                        // Nomor kandidat hari ini melompati gap
                        $candidate = $gapEnd + 1;

                        Log::info('NumberingService: daily rollover gap applied', [
                            'old_date' => $seq->last_issued_date->toDateString(),
                            'gap' => "{$gapStart}–{$gapEnd}",
                        ]);
                    } else {
                        // 2. Hari yang sama atau nomor pertama kali
                        if ($seq->last_number === 0) {
                            // First time use: start from default or provided initial
                            $candidate = config('numbering.default_start', 1000);
                        } else {
                            $candidate = $seq->last_number + 1;
                        }
                    }

                    // Verifikasi nomor belum dipakai
                    if (LetterNumber::where('number', $candidate)->exists()) {
                        throw new NumberingLockException("Nomor {$candidate} sudah digunakan.");
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
                'subject'      => 'Gap request #' . $gapRequest->id,
                'destination'  => '-',
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
            'last_issued_date' => $seq->last_issued_date,
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

            if (!$seq || $seq->last_issued_date === null) {
                return;
            }

            $isNewDay = $seq->last_issued_date->format('Y-m-d') !== today()->format('Y-m-d');

            if (!$isNewDay) {
                return;
            }

            // Ganti hari: arsipkan gap (jika ada nomor yang sudah digunakan)
            if ($seq->last_number > 0) {
                $gapStart = $seq->last_number + 1;
                $gapEnd   = $seq->last_number + $seq->gap_size;

                $this->archiveGapZone($seq->last_issued_date, $gapStart, $gapEnd);

                Log::info('NumberingService@ensureDayIsCurrent: rollover applied', [
                    'old_date' => $seq->last_issued_date->toDateString(),
                    'gap' => "{$gapStart}–{$gapEnd}",
                ]);
            }

            $seq->last_issued_date = today();
            $seq->save();
        });
    }

    /**
     * Reset sequence.
     */
    public function resetSequence(int $startNumber): array
    {
        return DB::transaction(function () use ($startNumber) {
            $seq = $this->withLock(GlobalSequence::query()->where('id', 1))->first();

            if (!$seq) {
                $seq = GlobalSequence::getInstance();
            }

            // Sebelum reset, arsipkan gap berjalan jika ada
            if ($seq->last_issued_date !== null && $seq->last_number > 0) {
                $this->archiveGapZone($seq->last_issued_date, $seq->last_number + 1, $seq->last_number + $seq->gap_size);
            }

            $seq->last_number = 0; // Will start from $startNumber on next acquire
            // We can't actually set 'start' in GlobalSequence if next_start is deleted,
            // so we might need to handle this manually or store start somewhere.
            // But per AGENTS.md, we just use last_number.
            // If we want to start from $startNumber, we can set last_number = $startNumber - 1.
            $seq->last_number = $startNumber - 1;
            $seq->last_issued_date = today();
            $seq->save();

            return $this->getSequenceInfo();
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
