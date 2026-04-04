<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DailySequenceSeeder extends Seeder
{
    /**
     * Verifikasi konfigurasi penomoran.
     *
     * Tabel daily_sequences TIDAK di-seed di sini.
     * NumberingService akan membuat row sequence secara lazy
     * saat nomor pertama kali diminta untuk hari/klasifikasi tertentu.
     *
     * Seeder ini hanya memastikan config/numbering.php terbaca
     * dengan benar sehingga NumberingService tidak menemui nilai null.
     */
    public function run(): void
    {
        // Baca konfigurasi global penomoran — harus 1000 dan 10
        $start   = config('numbering.default_start');
        $gapSize = config('numbering.default_gap_size');

        // Catat ke log agar mudah di-trace saat troubleshoot
        Log::info("Numbering config: start={$start}, gap={$gapSize}");

        // Validasi nilai konfigurasi tidak null / tidak terdefinisi
        if ($start === null || $gapSize === null) {
            $this->command->error(
                'DailySequenceSeeder: config numbering.php tidak lengkap! '
                . 'Pastikan default_start dan default_gap_size terdefinisi.'
            );
            return;
        }

        $this->command->info(
            "DailySequenceSeeder: config OK — default_start={$start}, default_gap_size={$gapSize}. "
            . 'Tabel daily_sequences dibiarkan kosong (lazy-created oleh NumberingService).'
        );
    }
}
