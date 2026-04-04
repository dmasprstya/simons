<?php

namespace App\Services;

use App\Models\GapRequest;
use App\Models\LetterNumber;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GapRequestService
{
    /**
     * GapRequestService mengorkestrasi alur approve/reject gap request.
     *
     * Bergantung pada:
     *   - NumberingService: untuk menerbitkan nomor dari zona gap
     *   - AuditService: untuk mencatat setiap perubahan status ke audit_logs
     */
    public function __construct(
        private readonly NumberingService $numberingService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Menyetujui (approve) sebuah gap request.
     *
     * Alur:
     *   1. Validasi status: hanya 'pending' yang boleh diapprove
     *   2. Dalam satu DB::transaction:
     *      a. Terbitkan nomor dari zona gap via NumberingService::releaseGapNumber()
     *      b. Perbarui status GapRequest → 'approved', simpan reviewer & nomor
     *      c. Catat aksi ke audit_logs via AuditService
     *   3. Kembalikan LetterNumber yang diterbitkan
     *
     * @param  GapRequest  $gapRequest  Request gap yang akan diapprove
     * @param  User        $reviewer    Admin yang melakukan approval
     * @return LetterNumber             Nomor surat baru yang diterbitkan dari zona gap
     *
     * @throws \InvalidArgumentException  Jika status bukan 'pending'
     * @throws \App\Exceptions\GapAlreadyUsedException  Jika nomor sudah dipakai
     */
    public function approve(GapRequest $gapRequest, User $reviewer): LetterNumber
    {
        // Hanya gap request berstatus pending yang dapat diapprove
        if ($gapRequest->status !== 'pending') {
            throw new \InvalidArgumentException("Hanya request berstatus pending yang bisa diapprove.");
        }

        return DB::transaction(function () use ($gapRequest, $reviewer) {
            // Terbitkan nomor dari zona gap — validasi zona & duplikat dilakukan di dalam service ini
            $letterNumber = $this->numberingService->releaseGapNumber($gapRequest);

            // Perbarui status GapRequest beserta metadata review
            $gapRequest->update([
                'status'      => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'number'      => $letterNumber->number,
            ]);

            // Catat aksi approval ke audit_logs untuk traceability
            $this->auditService->log(
                'gap.approved',
                'gap_requests',
                $gapRequest->id,
                ['status' => 'pending'],
                ['status' => 'approved', 'number' => $letterNumber->number],
                $reviewer->id
            );

            return $letterNumber;
        });
    }

    /**
     * Menolak (reject) sebuah gap request.
     *
     * Tidak memerlukan transaksi database karena hanya menyentuh satu tabel
     * (gap_requests), tidak ada operasi sequence atau LetterNumber.
     *
     * @param  GapRequest  $gapRequest  Request gap yang akan direject
     * @param  User        $reviewer    Admin yang melakukan penolakan
     * @param  string      $reason      Alasan penolakan (disertakan di audit log)
     * @return GapRequest               Instance GapRequest yang telah diperbarui (fresh)
     *
     * @throws \InvalidArgumentException  Jika status bukan 'pending'
     */
    public function reject(GapRequest $gapRequest, User $reviewer, string $reason): GapRequest
    {
        // Hanya gap request berstatus pending yang dapat direject
        if ($gapRequest->status !== 'pending') {
            throw new \InvalidArgumentException("Hanya request berstatus pending yang bisa direject.");
        }

        // Perbarui status GapRequest beserta metadata review
        $gapRequest->update([
            'status'      => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        // Catat aksi rejection ke audit_logs; reason disimpan di new_data untuk referensi
        $this->auditService->log(
            'gap.rejected',
            'gap_requests',
            $gapRequest->id,
            ['status' => 'pending'],
            ['status' => 'rejected', 'reason' => $reason],
            $reviewer->id
        );

        // Kembalikan instance terbaru dari database (setelah update)
        return $gapRequest->fresh();
    }
}
