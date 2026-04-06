<?php

namespace App\Observers;

use App\Models\GapRequest;
use App\Services\AuditService;

class GapRequestObserver
{
    public function __construct(private readonly AuditService $auditService) {}

    /**
     * Mencatat audit untuk perubahan status GapRequest yang TIDAK melalui GapRequestService.
     *
     * GapRequestService (approve/reject) sudah memanggil AuditService secara eksplisit,
     * sehingga perubahan dari sana tidak perlu dicatat dua kali di sini.
     *
     * Observer ini berfungsi sebagai safety-net: jika ada kode lain yang mengubah status
     * GapRequest secara langsung (misalnya command Artisan, seeder, atau admin override),
     * perubahan tersebut tetap terekam di audit_logs.
     *
     * Guard:
     *   - Jika status tidak berubah, langsung return.
     *   - GapRequestService men-set flag GapRequest::$auditedByService = true sebelum save()
     *     agar observer dapat mendeteksi dan melewati duplikasi log.
     */
    public function updated(GapRequest $gapRequest): void
    {
        // Guard 1: Jika kolom status tidak berubah, tidak ada yang perlu dicatat
        if (!$gapRequest->isDirty('status')) {
            return;
        }

        // Guard 2: Jika perubahan ini sudah dihandle oleh GapRequestService,
        // skip logging di sini untuk menghindari duplikasi tabel audit_logs.
        // GapRequestService sudah log sendiri saat approve/reject.
        if (GapRequest::$auditedByService ?? false) {
            return;
        }

        // Catat perubahan status yang terjadi di luar GapRequestService
        $this->auditService->log(
            'gap_request.status_changed',
            'gap_requests',
            $gapRequest->id,
            ['status' => $gapRequest->getOriginal('status')],
            ['status' => $gapRequest->status]
        );
    }
}
