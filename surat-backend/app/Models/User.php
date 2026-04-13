<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nip',
        'division',
        'email',
        'password',
        'role',
        'is_active',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────

    /**
     * Nomor surat yang diterbitkan oleh user ini.
     */
    public function letterNumbers(): HasMany
    {
        return $this->hasMany(LetterNumber::class);
    }

    /**
     * Permintaan gap yang diajukan oleh user ini.
     */
    public function gapRequests(): HasMany
    {
        return $this->hasMany(GapRequest::class, 'requested_by');
    }

    /**
     * Audit log yang tercatat atas aksi user ini.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
