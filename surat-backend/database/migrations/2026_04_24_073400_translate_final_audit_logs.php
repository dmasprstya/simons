<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $translations = [
            'gap_request.created' => 'Permintaan Gap Diajukan',
            'profile.update' => 'Profil Diperbarui',
            'profile.change_password' => 'Password Profil Diubah',
            'profile.photo_upload' => 'Foto Profil Diunggah',
            'profile.photo_delete' => 'Foto Profil Dihapus',
            'report.exported' => 'Laporan Diekspor',
        ];

        foreach ($translations as $key => $value) {
            DB::table('audit_logs')
                ->where('action', $key)
                ->update(['action' => $value]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
