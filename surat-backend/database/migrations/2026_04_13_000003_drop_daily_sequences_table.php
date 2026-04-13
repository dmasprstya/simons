<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Drop tabel daily_sequences — digantikan oleh global_sequence.
     */
    public function up(): void
    {
        Schema::dropIfExists('daily_sequences');
    }

    /**
     * Recreate original daily_sequences structure (dari migration 2026_04_05_000003).
     */
    public function down(): void
    {
        Schema::create('daily_sequences', function (Blueprint $table) {
            $table->id();
            $table->date('date');

            $table->foreignId('classification_id')
                ->constrained('letter_classifications')
                ->restrictOnDelete();

            // Nomor terakhir yang telah dikeluarkan dalam blok aktif saat ini
            $table->integer('last_number')->default(0);

            // Nilai gap_size dan next_start disimpan per-record agar perubahan config
            // tidak merusak sequence yang sudah berjalan di hari/blok sebelumnya
            $table->integer('gap_size')->default(10);
            $table->integer('next_start')->default(1000);

            // Hanya updated_at karena tabel ini selalu di-update, tidak perlu created_at
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Satu record per tanggal per klasifikasi
            $table->unique(['date', 'classification_id']);
        });
    }
};
