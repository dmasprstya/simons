<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel untuk menyimpan state sequence penomoran per hari per klasifikasi.
     * gap_size dan next_start diambil dari config saat seeder/pertama kali insert,
     * bukan hardcode di migration, agar fleksibel jika config berubah.
     *
     * next_start: nomor awal blok aktif berikutnya —
     *   dihitung ulang setiap kali blok penuh menggunakan formula gap di AGENTS.md.
     */
    public function up(): void
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_sequences');
    }
};
