<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel untuk permintaan nomor gap (nomor cadangan).
     * Alur: user mengajukan (status=pending) → admin review → approved/rejected.
     * Jika approved, kolom 'number' diisi oleh releaseGapNumber() dari NumberingService.
     * Jika rejected, 'number' tetap null.
     */
    public function up(): void
    {
        Schema::create('gap_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('requested_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('classification_id')
                ->constrained('letter_classifications')
                ->restrictOnDelete();

            // Diisi saat request diapprove oleh releaseGapNumber()
            $table->unsignedInteger('number')->nullable();

            $table->date('gap_date');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reason');

            // Waktu review oleh admin
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indices untuk query performa
            $table->index(['requested_by', 'status']);
            $table->index(['classification_id', 'gap_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gap_requests');
    }
};
