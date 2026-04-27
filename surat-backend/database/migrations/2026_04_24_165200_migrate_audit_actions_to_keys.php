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
        $mappings = [
            // Letter Actions
            'Surat Dibuat' => 'letter.created',
            'Letter Created' => 'letter.created',
            'Surat Dibatalkan' => 'letter.voided',
            'Letter Voided' => 'letter.voided',
            'Detail Surat Diperbarui' => 'letter.updated',
            'Letter Details Updated' => 'letter.updated',

            // Gap Actions
            'Gap Disetujui' => 'gap.approved',
            'Gap Approved' => 'gap.approved',
            'Gap Ditolak' => 'gap.rejected',
            'Gap Rejected' => 'gap.rejected',
            'Permintaan Gap Diajukan' => 'gap_request.created',
            'Gap Request Created' => 'gap_request.created',
            'Status Gap Diubah' => 'gap_request.status_changed',
            'Gap Status Changed' => 'gap_request.status_changed',

            // User Actions
            'User Dibuat' => 'user.created',
            'User Created' => 'user.created',
            'User Diperbarui' => 'user.updated',
            'User Updated' => 'user.updated',
            'User Dihapus' => 'user.deleted',
            'User Deleted' => 'user.deleted',
            'Status User Diubah' => 'user.toggled',
            'User Status Toggled' => 'user.toggled',
            'Password User Diubah' => 'user.change_password',
            'User Password Changed' => 'user.change_password',

            // Profile Actions
            'Profil Diperbarui' => 'profile.update',
            'Profile Updated' => 'profile.update',
            'Password Profil Diubah' => 'profile.change_password',
            'Profile Password Changed' => 'profile.change_password',
            'Foto Profil Diunggah' => 'profile.photo_upload',
            'Profile Photo Uploaded' => 'profile.photo_upload',
            'Foto Profil Dihapus' => 'profile.photo_delete',
            'Profile Photo Deleted' => 'profile.photo_delete',

            // Classification Actions
            'Klasifikasi Dibuat' => 'classification.created',
            'Classification Created' => 'classification.created',
            'Klasifikasi Diperbarui' => 'classification.updated',
            'Classification Updated' => 'classification.updated',
            'Klasifikasi Dihapus' => 'classification.deleted',
            'Classification Deleted' => 'classification.deleted',

            // Auth & Other
            'Masuk' => 'auth.login',
            'Login' => 'auth.login',
            'Keluar' => 'auth.logout',
            'Logout' => 'auth.logout',
            'Laporan Diekspor' => 'report.exported',
            'Report Exported' => 'report.exported',
        ];

        foreach ($mappings as $old => $new) {
            DB::table('audit_logs')
                ->where('action', $old)
                ->update(['action' => $new]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No easy way to reverse this as we don't know the original locale.
    }
};
