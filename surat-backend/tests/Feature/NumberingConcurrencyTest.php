<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\User;
use App\Services\NumberingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NumberingConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    // ─── Test Cases ───────────────────────────────────────────────────────────

    /**
     * Simulasi 5 request bersamaan ke acquireNumber() harus menghasilkan
     * 5 nomor yang semuanya unik (tidak ada duplikat).
     *
     * Catatan implementasi:
     *   Ini adalah integration test — bukan real parallel HTTP request.
     *   Simulasi dilakukan dengan memanggil acquireNumber() 5 kali berturutan
     *   dalam satu proses PHP (array of closures). Ini cukup untuk memverifikasi
     *   bahwa logika sequence dan last_number increment berjalan benar
     *   tanpa race condition pada level single-process.
     *
     *   Untuk production dengan MySQL, pessimistic locking (lockForUpdate)
     *   di withLock() menjamin isolasi antar proses nyata.
     */
    public function test_concurrent_requests_produce_unique_numbers(): void
    {
        // Siapkan classification dan user
        $classification = LetterClassification::create([
            'code'      => 'CONC-001',
            'level'     => 3,
            'name'      => 'Concurrency Test Classification',
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role'      => 'user',
            'is_active' => true,
        ]);

        $service = app(NumberingService::class);
        $date    = Carbon::today();

        // Simulasikan 5 request bersamaan sebagai array of closures
        // Setiap closure mewakili satu "request" yang memanggil acquireNumber
        $requests = array_fill(0, 5, fn () => $service->acquireNumber($classification->id, $date));

        // Eksekusi semua closures dan kumpulkan hasilnya
        $numbers = array_map(fn ($closure) => $closure(), $requests);

        // Verifikasi bahwa semua 5 nomor unik (tidak ada duplikat)
        $uniqueNumbers = array_unique($numbers);
        $this->assertCount(
            5,
            $uniqueNumbers,
            "Diharapkan 5 nomor unik, tetapi ada duplikat: " . implode(', ', $numbers)
        );

        // Verifikasi semua nomor berada dalam range yang valid (>= 1000)
        foreach ($numbers as $number) {
            $this->assertGreaterThanOrEqual(
                1000,
                $number,
                "Nomor {$number} seharusnya >= 1000 (default_start)"
            );
        }

        // Verifikasi nomor pertama adalah 1000 (karena mulai dari blok baru)
        sort($numbers);
        $this->assertEquals(1000, $numbers[0], "Nomor pertama seharusnya 1000");

        // Verifikasi nomor ke-1 hingga ke-5 berurutan (1000-1004, masih dalam blok aktif)
        // gap_size=10, jadi 5 nomor pertama pasti masih di blok aktif (1000-1009)
        for ($i = 0; $i < 5; $i++) {
            $this->assertEquals(1000 + $i, $numbers[$i], "Nomor ke-" . ($i + 1) . " seharusnya " . (1000 + $i));
        }
    }
}
