<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->index('issued_date');
            $table->index('created_at');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->dropIndex(['issued_date']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });
    }
};
