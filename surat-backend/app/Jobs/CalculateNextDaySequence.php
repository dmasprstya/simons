<?php

namespace App\Jobs;

use App\Models\DailySequence;
use App\Services\NumberingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CalculateNextDaySequence implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly NumberingService $numberingService) {}

    /**
     * Menyiapkan DailySequence untuk hari berikutnya.
     *
     * Hanya memproses sequence yang pernah digunakan hari ini (last_number > 0).
     * Sequence yang belum dipakai sama sekali tidak perlu disiapkan karena sistem
     * menggunakan strategi lazy-create — sequence dibuat saat pertama kali dibutuhkan.
     *
     * Dijadwalkan berjalan setiap hari pukul 23:55 agar next_start sudah siap
     * sebelum pergantian hari, sehingga acquireNumber() di hari berikutnya
     * tidak perlu menghitung ulang dari awal.
     */
    public function handle(): void
    {
        // Hanya proses sequence yang pernah dipakai hari ini (last_number > 0)
        // Jangan generate untuk semua klasifikasi — sequence dibuat lazy
        DailySequence::where('date', today()->toDateString())
            ->where('last_number', '>', 0)
            ->each(fn(DailySequence $seq) => $this->numberingService->prepareNextDay($seq));
    }
}
