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
            'letter.updated' => 'Detail Surat Diperbarui',
            'gap_request.status_changed' => 'Status Gap Diubah',
            'classification.deleted' => 'Klasifikasi Dihapus',
            'classification.delete' => 'Klasifikasi Dihapus',
            'classification.restored' => 'Klasifikasi Dipulihkan',
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
