<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use Prunable;
    /**
     * Insert-only table — tidak ada update atau delete.
     * Hanya created_at yang digunakan sebagai timestamp aksi.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'table_name',
        'record_id',
        'old_data',
        'new_data',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'old_data'  => 'array',
            'new_data'  => 'array',
            'record_id' => 'integer',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    /**
     * User yang melakukan aksi ini.
     * Nullable: bisa null untuk aksi sistem/job yang tidak memiliki user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prunable()
    {
        return static::where('created_at', '<=', now()->subDays(env('AUDIT_LOG_RETENTION_DAYS', 30)));
    }
}
