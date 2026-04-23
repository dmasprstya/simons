<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->enum('source', ['regular', 'gap'])->default('regular')->after('destination');
        });

        // Infer source for existing records based on daily_gaps
        DB::statement("
            UPDATE letter_numbers 
            SET source = 'gap' 
            WHERE EXISTS (
                SELECT 1 FROM daily_gaps 
                WHERE daily_gaps.date = letter_numbers.issued_date 
                AND letter_numbers.number BETWEEN daily_gaps.gap_start AND daily_gaps.gap_end
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
