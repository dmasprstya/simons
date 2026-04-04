<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LetterClassification extends Model
{
    /**
     * Kolom created_at ada, updated_at tidak ada.
     * Data klasifikasi jarang berubah, sehingga updated_at tidak diperlukan.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'parent_id',
        'code',
        'level',
        'name',
        'type',
        'is_leaf',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'level'     => 'integer',
            'is_leaf'   => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relasi Hierarki ─────────────────────────────────────────────────────

    /**
     * Klasifikasi induk (parent) dari klasifikasi ini.
     * Null jika ini adalah level 1 (root).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Semua klasifikasi anak langsung dari klasifikasi ini.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    // ─── Relasi Domain ───────────────────────────────────────────────────────

    /**
     * Semua nomor surat yang terbit dengan klasifikasi ini.
     */
    public function letterNumbers(): HasMany
    {
        return $this->hasMany(LetterNumber::class);
    }

    /**
     * Semua record sequence harian untuk klasifikasi ini.
     */
    public function dailySequences(): HasMany
    {
        return $this->hasMany(DailySequence::class);
    }

    /**
     * Semua permintaan gap yang berkaitan dengan klasifikasi ini.
     */
    public function gapRequests(): HasMany
    {
        return $this->hasMany(GapRequest::class);
    }
}
