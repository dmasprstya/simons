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
        Schema::table('global_sequence', function (Blueprint $table) {
            $table->date('last_issued_date')->nullable()->after('gap_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('global_sequence', function (Blueprint $table) {
            $table->dropColumn('last_issued_date');
        });
    }
};
