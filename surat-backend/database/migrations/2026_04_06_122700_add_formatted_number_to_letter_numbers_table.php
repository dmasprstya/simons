<?php

use App\Models\LetterNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom formatted_number untuk menyimpan format nomor surat lengkap.
     * Format: W7-{classificationCode}-{number}
     */
    public function up(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->string('formatted_number', 100)->nullable()->after('number');
            $table->index('formatted_number');
        });

        // Backfill data lama: isi formatted_number pada record yang sudah ada
        LetterNumber::with('classification')
            ->whereNull('formatted_number')
            ->each(function (LetterNumber $letter) {
                if ($letter->classification) {
                    $letter->update([
                        'formatted_number' => LetterNumber::buildFormattedNumber(
                            $letter->classification->code,
                            $letter->number
                        ),
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letter_numbers', function (Blueprint $table) {
            $table->dropIndex(['formatted_number']);
            $table->dropColumn('formatted_number');
        });
    }
};
