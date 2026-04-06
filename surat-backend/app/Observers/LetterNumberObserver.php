<?php

namespace App\Observers;

use App\Models\LetterNumber;
use App\Services\AuditService;

class LetterNumberObserver
{
    public function __construct(private readonly AuditService $auditService) {}

    /**
     * Mencatat audit ketika nomor surat baru diterbitkan.
     * Dipanggil otomatis setelah LetterNumber::create() berhasil.
     */
    public function created(LetterNumber $letterNumber): void
    {
        $this->auditService->log(
            'letter.created',
            'letter_numbers',
            $letterNumber->id,
            null,
            $letterNumber->toArray()
        );
    }

    /**
     * Mencatat audit hanya ketika status berubah menjadi 'voided'.
     *
     * Guard isDirty('status') memastikan observer tidak menulis audit
     * untuk update kolom lain (subject, destination, dll) yang tidak relevan.
     * Perubahan ke status selain 'voided' diabaikan secara eksplisit.
     */
    public function updated(LetterNumber $letterNumber): void
    {
        // Hanya proses jika kolom status berubah ke 'voided'
        if ($letterNumber->isDirty('status') && $letterNumber->status === 'voided') {
            $this->auditService->log(
                'letter.voided',
                'letter_numbers',
                $letterNumber->id,
                ['status' => 'active'],
                [
                    'status'    => 'voided',
                    'voided_by' => $letterNumber->voided_by,
                    'voided_at' => $letterNumber->voided_at,
                ]
            );
        }
    }
}
