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
        DB::table('audit_logs')
            ->where('action', 'auth.login')
            ->update(['action' => 'Masuk']);
            
        DB::table('audit_logs')
            ->where('action', 'auth.logout')
            ->update(['action' => 'Keluar']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
