<?php

use App\Models\LetterNumber;
use Illuminate\Database\Migrations\Migration;

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
                        $letter->update([
                            'formatted_number' => LetterNumber::buildFormattedNumber(
                                $letter->classification->code,
                                $letter->number
                            ),
                        ]);
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
