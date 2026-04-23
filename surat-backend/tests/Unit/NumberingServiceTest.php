<?php

namespace Tests\Unit;

use App\Exceptions\GapAlreadyUsedException;
use App\Models\DailyGap;
use App\Models\GapRequest;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use App\Services\NumberingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Unit test untuk NumberingService (Linear Daily Gap Model).
 *
 * Logika:
 *   - Nomor meningkat secara linear tanpa ada blok tetap.
 *   - Gap hanya muncul saat berganti hari (rollover).
 *   - Contoh (start=1000, gap=10):
 *     Senin: 1000, 1001, 1002 (sampai tak hingga)
 *     Selasa: Lompati 10 nomor (1003-1012), mulai dari 1013.
 */
class NumberingServiceTest extends TestCase
{
    use RefreshDatabase;

    private NumberingService $service;
    private LetterClassification $classification;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new NumberingService();

        $this->user = User::create([
            'name'      => 'Test User',
            'email'     => 'test@example.com',
            'password'  => bcrypt('password'),
            'role'      => 'user',
            'is_active' => true,
        ]);

        $this->classification = LetterClassification::create([
            'code'      => 'TEST',
            'name'      => 'Test Classification',
            'level'     => 3,
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);
    }

    private function acquireMultiple(int $count): array
    {
        $numbers = [];
        for ($i = 0; $i < $count; $i++) {
            $numbers[] = $this->service->acquireNumber();
        }
        return $numbers;
    }

    /**
     * Test 1: Nomor pertama dimulai dari 1000.
     */
    public function test_nomor_pertama_sama_dengan_default_start(): void
    {
        $number = $this->service->acquireNumber();
        $this->assertEquals(1000, $number);
    }

    /**
     * Test 2: Nomor meningkat linear pada hari yang sama.
     */
    public function test_nomor_meningkat_linear_pada_hari_yang_sama(): void
    {
        $numbers = $this->acquireMultiple(50); // 1000 - 1049
        $this->assertCount(50, $numbers);
        $this->assertEquals(1000, $numbers[0]);
        $this->assertEquals(1049, $numbers[49]);
    }

    /**
     * Test 3: Terjadi lompatan nomor saat ganti hari.
     */
    public function test_nomor_melompat_saat_ganti_hari(): void
    {
        Carbon::setTestNow('2026-04-20 10:00:00');
        $n1 = $this->service->acquireNumber(); // 1000
        $this->assertEquals(1000, $n1);

        Carbon::setTestNow('2026-04-21 10:00:00');
        $n2 = $this->service->acquireNumber(); 
        
        // Gap size default=10. 
        // Senin: terakhir 1000.
        // Selasa: gap 1001-1010. Nomor pertama Selasa = 1011.
        $this->assertEquals(1011, $n2);

        // Verifikasi arsip gap
        $this->assertDatabaseHas('daily_gaps', [
            'date' => '2026-04-20 00:00:00',
            'gap_start' => 1001,
            'gap_end' => 1010
        ]);
    }

    /**
     * Test 4: Merilis nomor dari gap yang sudah diarsipkan.
     */
    public function test_release_gap_number_berhasil_untuk_nomor_di_zona_gap(): void
    {
        Carbon::setTestNow('2026-04-20 10:00:00');
        $this->service->acquireNumber(); // 1000

        Carbon::setTestNow('2026-04-21 10:00:00');
        $this->service->acquireNumber(); // Mengarsipkan 1001-1010

        // Ambil nomor gap 1005 untuk tanggal 2026-04-20
        $gapRequest = GapRequest::create([
            'requested_by'      => $this->user->id,
            'classification_id' => $this->classification->id,
            'number'            => 1005,
            'gap_date'          => '2026-04-20',
            'status'            => 'approved',
            'subject'           => 'Perihal Surat Testing',
            'destination'       => 'Tujuan Surat Testing',
            'reason'            => 'Butuh nomor mundur',
        ]);

        $letterNumber = $this->service->releaseGapNumber($gapRequest);
        $this->assertEquals(1005, $letterNumber->number);
        $this->assertEquals('2026-04-20', $letterNumber->issued_date->toDateString());
    }

    /**
     * Test 5: Gagal rilis nomor jika tidak ada di arsip gap.
     */
    public function test_release_gap_number_gagal_jika_tidak_di_arsip_gap(): void
    {
        Carbon::setTestNow('2026-04-20 10:00:00');
        $this->service->acquireNumber(); // 1000

        Carbon::setTestNow('2026-04-21 10:00:00');
        
        $gapRequest = GapRequest::create([
            'requested_by'      => $this->user->id,
            'classification_id' => $this->classification->id,
            'number'            => 1050, // Jauh dari gap yang ada (1001-1010)
            'gap_date'          => '2026-04-20',
            'status'            => 'approved',
            'subject'           => 'Perihal Surat Testing',
            'destination'       => 'Tujuan Surat Testing',
            'reason'            => 'Ngawur',
        ]);

        $this->expectException(GapAlreadyUsedException::class);
        $this->service->releaseGapNumber($gapRequest);
    }

}
