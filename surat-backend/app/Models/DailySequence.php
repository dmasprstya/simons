<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailySequence extends Model
{
    /**
     * Hanya updated_at yang digunakan — karena tabel ini selalu di-update
     * saat nomor baru dikeluarkan, bukan di-insert ulang.
     */
    const CREATED_AT = null;

    protected $fillable = [
        'date',
        'classification_id',
        'last_number',
        'gap_size',
        'next_start',
    ];

    protected function casts(): array
    {
        return [
            'date'        => 'date',
            'last_number' => 'integer',
            'gap_size'    => 'integer',
            'next_start'  => 'integer',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    /**
     * Klasifikasi surat yang dimiliki sequence ini.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(LetterClassification::class);
    }
}
