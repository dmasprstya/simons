<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_gaps', function (Blueprint $table) {
            // Hapus unique constraint tunggal pada date agar satu tanggal
            // bisa memiliki lebih dari satu zona gap (terjadi saat overflow blok dalam satu hari)
            $table->dropUnique(['date']);

            // Ganti dengan unique composite (date + gap_start) untuk mencegah
            // duplikasi baris zona gap yang persis sama, tapi memperbolehkan
            // beberapa blok berbeda pada tanggal yang sama
            $table->unique(['date', 'gap_start'], 'daily_gaps_date_gap_start_unique');
        });
    }

    public function down(): void
    {
        Schema::table('daily_gaps', function (Blueprint $table) {
            $table->dropUnique('daily_gaps_date_gap_start_unique');
            $table->unique('date');
        });
    }
};
