<?php

namespace App\Models;

use App\Observers\GapRequestObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy(GapRequestObserver::class)]
class GapRequest extends Model
{
    /**
     * Hanya created_at — perubahan status (review) dicatat di reviewed_at / number.
     * Tidak perlu updated_at karena record tidak diperbaharui secara generik.
     */
    const UPDATED_AT = null;

    /**
     * Flag static untuk menandakan bahwa perubahan status sedang diproses oleh
     * GapRequestService — sehingga GapRequestObserver tidak menduplikasi log audit.
     * Di-set true sebelum save() di GapRequestService, di-reset false sesudahnya.
     */
    public static bool $auditedByService = false;

    protected $fillable = [
        'requested_by',
        'reviewed_by',
        'classification_id',
        'number',
        'gap_date',
        'status',
        'subject',
        'destination',
        'sifat_surat',
        'reason',
        'rejection_reason',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'gap_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    /**
     * User yang mengajukan permintaan gap ini.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Admin yang mereview permintaan gap ini (null jika belum direview).
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Klasifikasi surat yang dimintakan nomor gap-nya.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(LetterClassification::class);
    }
}
