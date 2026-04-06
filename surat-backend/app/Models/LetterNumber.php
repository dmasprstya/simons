<?php

namespace App\Models;

use App\Observers\LetterNumberObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy(LetterNumberObserver::class)]
class LetterNumber extends Model
{
    /**
     * Hanya created_at — nomor surat tidak pernah diupdate setelah diterbitkan.
     * Perubahan status (void) dicatat di kolom voided_at dan voided_by.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'classification_id',
        'number',
        'issued_date',
        'subject',
        'destination',
        'status',
        'voided_at',
        'voided_by',
    ];

    protected function casts(): array
    {
        return [
            'number'      => 'integer',
            'issued_date' => 'date',
            'voided_at'   => 'datetime',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    /**
     * User yang menerbitkan nomor surat ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Klasifikasi surat dari nomor ini.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(LetterClassification::class);
    }

    /**
     * User yang melakukan void pada nomor surat ini.
     */
    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }
}
