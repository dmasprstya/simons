<?php

use App\Models\LetterNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update all existing formatted_number records to match the new format (W7.CODE-NUMBER).
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
        // To reverse, we'd need to manually define the old format logic, 
        // but since this is a requirement change, we usually don't rollback data format changes.
    }
};
