<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom sifat_surat ke tabel letter_numbers.
     *
     * Nilai enum disesuaikan dengan ketentuan klasifikasi sifat surat
     * pada umumnya di instansi pemerintah/organisasi:
     *   - sangat_segera : Sangat Segera
     *   - segera        : Segera
     *   - biasa         : Biasa
     *   - rahasia       : Rahasia
     *
     * Kolom ditempatkan setelah 'destination' agar konsisten dengan
     * urutan pengisian formulir di frontend.
     */
    public function up(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            // Catatan: default('biasa') hanya digunakan agar SQLite dapat menambahkan
            // kolom NOT NULL pada tabel yang sudah berisi data. Nilai ini tidak
            // berpengaruh pada record baru — validasi di aplikasi mewajibkan
            // pengguna memilih salah satu nilai secara eksplisit.
            $table->enum('sifat_surat', ['sangat_segera', 'segera', 'biasa', 'rahasia'])
                  ->default('biasa')
                  ->after('destination');
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->dropColumn('sifat_surat');
        });
    }
};
