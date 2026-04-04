<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel utama yang menyimpan nomor surat yang telah diterbitkan.
     * Unique constraint (classification_id, number, issued_date) memastikan
     * tidak ada duplikasi nomor dalam satu klasifikasi dan satu hari.
     *
     * voided_by dan voided_at di-set saat status berubah menjadi 'voided'.
     */
    public function up(): void
    {
        Schema::create('letter_numbers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('classification_id')
                ->constrained('letter_classifications')
                ->restrictOnDelete();

            $table->unsignedInteger('number');
            $table->date('issued_date');
            $table->string('subject');
            $table->string('destination');

            $table->enum('status', ['active', 'voided'])->default('active');

            // Kolom audit untuk proses void
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('created_at')->useCurrent();

            // Satu nomor tidak boleh duplikat per klasifikasi per hari
            $table->unique(['classification_id', 'number', 'issued_date']);

            // Indices untuk query performa
            $table->index(['user_id', 'issued_date']);
            $table->index(['classification_id', 'issued_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_numbers');
    }
};
