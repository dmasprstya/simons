<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GapRequest extends Model
{
    /**
     * Hanya created_at — perubahan status (review) dicatat di reviewed_at / number.
     * Tidak perlu updated_at karena record tidak diperbaharui secara generik.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'requested_by',
        'reviewed_by',
        'classification_id',
        'number',
        'gap_date',
        'status',
        'reason',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'number'      => 'integer',
            'gap_date'    => 'date',
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
