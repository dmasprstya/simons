<?php

use App\Models\LetterNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update all existing formatted_number records to match the new format (W.7-CODE-NUMBER).
     */
    public function up(): void
    {
        LetterNumber::with('classification')
            ->chunkById(100, function ($letters) {
                foreach ($letters as $letter) {
                    if ($letter->classification) {
                        $newFormattedNumber = LetterNumber::buildFormattedNumber(
                            $letter->classification->code,
                            $letter->number
                        );

                        DB::table('letter_numbers')
                            ->where('id', $letter->id)
                            ->update(['formatted_number' => $newFormattedNumber]);
                    }
                }
            });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        // No rollback for format changes.
    }
};
