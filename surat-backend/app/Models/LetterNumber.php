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
        'formatted_number',
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

    // ─── Helper ──────────────────────────────────────────────────────────────

    /**
     * Bangun formatted_number dari prefix config, kode klasifikasi, dan nomor.
     *
     * Format: {prefix}{separator}{classificationCode}{separator}{number}
     * Contoh: W7-TU.01.02-1001
     */
    public static function buildFormattedNumber(string $classificationCode, int $number): string
    {
        $prefix    = config('numbering.prefix');      // W7
        $separator = config('numbering.separator');    // -

        return "{$prefix}{$separator}{$classificationCode}{$separator}{$number}";
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
