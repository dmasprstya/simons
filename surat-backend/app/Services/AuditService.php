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
        return AuditLog::create([
            'user_id'    => $userId ?? Auth::id(),
            'action'     => $action,
            'table_name' => $tableName,
            'record_id'  => $recordId,
            'old_data'   => $oldData,
            'new_data'   => $newData,
            'ip_address' => request()?->ip(),
        ]);
    }
}
