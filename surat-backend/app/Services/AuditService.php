<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    /**
     * Mencatat satu entri audit ke tabel audit_logs.
     *
     * Method ini dipanggil setelah setiap aksi penting (create, update, delete,
     * approve, reject, dsb.) untuk memastikan traceability penuh.
     *
     * @param  string    $action     Kode aksi, e.g. 'gap.approved', 'letter.created'
     * @param  string    $tableName  Nama tabel yang terdampak
     * @param  int       $recordId   Primary key record yang terdampak
     * @param  array|null $oldData   State data sebelum perubahan (null jika create)
     * @param  array|null $newData   State data setelah perubahan (null jika delete)
     * @param  int|null  $userId     ID user yang melakukan aksi; default ke user yang sedang login
     * @return AuditLog             Instance AuditLog yang baru dibuat
     */
    public function log(
        string $action,
        string $tableName,
        int $recordId,
        ?array $oldData = null,
        ?array $newData = null,
        ?int $userId = null
    ): AuditLog {
        $translations = [
            'letter.created' => 'Surat Dibuat',
            'letter.create' => 'Surat Dibuat',
            'letter.voided' => 'Surat Dibatalkan',
            'gap.approved' => 'Gap Disetujui',
            'gap.rejected' => 'Gap Ditolak',
            'gap.requested' => 'Gap Diminta',
            'user.created' => 'User Dibuat',
            'user.create' => 'User Dibuat',
            'user.updated' => 'User Diperbarui',
            'user.update' => 'User Diperbarui',
            'user.deleted' => 'User Dihapus',
            'user.delete' => 'User Dihapus',
            'user.toggled' => 'Status User Diubah',
            'user.toggle_active' => 'Status User Diubah',
            'user.change_password' => 'Password User Diubah',
            'classification.created' => 'Klasifikasi Dibuat',
            'classification.create' => 'Klasifikasi Dibuat',
            'classification.updated' => 'Klasifikasi Diperbarui',
            'classification.update' => 'Klasifikasi Diperbarui',
            'classification.toggled' => 'Status Klasifikasi Diubah',
            'classification.toggle_active' => 'Status Klasifikasi Diubah',
            'sequence.updated' => 'Sequence Diperbarui',
            'profile.updated' => 'Profil Diperbarui',
            'auth.login' => 'Masuk',
        ];

        $translatedAction = $translations[$action] ?? $action;

        return AuditLog::create([
            'user_id'    => $userId ?? Auth::id(),
            'action'     => $translatedAction,
            'table_name' => $tableName,
            'record_id'  => $recordId,
            'old_data'   => $oldData,
            'new_data'   => $newData,
            'ip_address' => request()?->ip(),
        ]);
    }
}
