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
            $table->enum('sifat_surat', ['sangat_segera', 'segera', 'penting', 'biasa', 'rahasia'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->enum('sifat_surat', ['sangat_segera', 'segera', 'biasa', 'rahasia'])->change();
        });
    }
};
