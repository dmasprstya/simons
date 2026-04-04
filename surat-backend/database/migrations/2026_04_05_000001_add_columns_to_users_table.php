<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom division, role, dan is_active ke tabel users.
     * Dibuat sebagai migration addColumn terpisah agar kolom existing tidak terhapus.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('division')->after('name')->nullable();
            $table->enum('role', ['admin', 'user'])->after('division')->default('user');
            $table->boolean('is_active')->after('role')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['division', 'role', 'is_active']);
        });
    }
};
