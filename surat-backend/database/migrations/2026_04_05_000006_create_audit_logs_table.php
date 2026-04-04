<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel audit log untuk mencatat semua aksi penting dalam sistem.
     * Insert-only: tidak ada update/delete pada tabel ini.
     * user_id nullable untuk menangani aksi sistem (tanpa user, misalnya job).
     *
     * Contoh action: 'letter.created', 'letter.voided', 'gap.approved', 'gap.rejected'
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Nullable karena bisa ada aksi sistem (tanpa user)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Format: 'entity.action', max 100 karakter
            $table->string('action', 100);
            $table->string('table_name', 100);
            $table->unsignedBigInteger('record_id');

            // Snapshot data sebelum dan sesudah perubahan
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();

            // IP pengguna saat aksi terjadi (IPv4/IPv6 max 45 char)
            $table->string('ip_address', 45)->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indices untuk query audit dan investigasi
            $table->index(['user_id', 'created_at']);
            $table->index('action');
            $table->index(['table_name', 'record_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
