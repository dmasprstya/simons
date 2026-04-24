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
