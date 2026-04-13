<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel global sequence untuk menyimpan state penomoran surat secara global
     * (tidak per-hari dan tidak per-klasifikasi). Hanya boleh ada satu baris.
     */
    public function up(): void
    {
        Schema::create('global_sequence', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('last_number')->default(0);
            $table->unsignedInteger('next_start')->default(1000);
            $table->unsignedInteger('gap_size')->default(10);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('global_sequence')->insert([
            'last_number' => 0,
            'next_start'  => config('numbering.default_start', 1000),
            'gap_size'    => config('numbering.default_gap_size', 10),
            'updated_at'  => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('global_sequence');
    }
};
