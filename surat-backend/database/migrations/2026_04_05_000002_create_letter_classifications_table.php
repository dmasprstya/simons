<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel klasifikasi surat dengan struktur hierarki 3 level.
     * Self-referencing: parent_id → letter_classifications.id
     * Level 1 = kategori utama, Level 2 = sub, Level 3 = leaf (is_leaf = true).
     */
    public function up(): void
    {
        Schema::create('letter_classifications', function (Blueprint $table) {
            $table->id();

            // Self-referencing FK untuk hierarki parent-child
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('letter_classifications')
                ->nullOnDelete();

            $table->string('code')->unique();
            $table->tinyInteger('level')->unsigned(); // 1, 2, atau 3
            $table->string('name');
            $table->enum('type', ['substantif', 'fasilitatif']);

            // Hanya klasifikasi leaf (level 3) yang bisa digunakan untuk penomoran surat
            $table->boolean('is_leaf')->default(false);
            $table->boolean('is_active')->default(true);

            // Tidak ada updated_at karena data klasifikasi jarang berubah
            $table->timestamp('created_at')->useCurrent();

            // Indices
            $table->index('parent_id');
            $table->index(['type', 'is_active']);
            $table->index('is_leaf');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_classifications');
    }
};
