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
            'sifat_surat'       => 'biasa',
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
            'sifat_surat'       => 'biasa',
            'reason'            => 'Ngawur',
        ]);

        $this->expectException(GapAlreadyUsedException::class);
        $this->service->releaseGapNumber($gapRequest);
    }

    /**
     * Test 6: Mengabaikan hari Sabtu dan Minggu saat rollover.
     */
    public function test_rollover_mengabaikan_sabtu_dan_minggu(): void
    {
        // Jumat, 2026-04-24
        Carbon::setTestNow('2026-04-24 10:00:00');
        $this->service->acquireNumber(); // 1000

        // Senin, 2026-04-27
        Carbon::setTestNow('2026-04-27 10:00:00');
        $n2 = $this->service->acquireNumber(); 
        
        // Terakhir Jumat: 1000.
        // Sabtu & Minggu libur -> tidak ada gap.
        // Rollover Jumat -> Gap 1001-1010.
        // Nomor Senin = 1011.
        $this->assertEquals(1011, $n2);

        // Verifikasi arsip gap hanya untuk Jumat
        $this->assertDatabaseHas('daily_gaps', ['date' => '2026-04-24 00:00:00']);
        $this->assertDatabaseMissing('daily_gaps', ['date' => '2026-04-25 00:00:00']); // Sabtu
        $this->assertDatabaseMissing('daily_gaps', ['date' => '2026-04-26 00:00:00']); // Minggu
    }

    /**
     * Test 7: Menangani lompatan beberapa hari kerja (misal Senin ke Rabu).
     */
    public function test_rollover_menangani_lompatan_beberapa_hari_kerja(): void
    {
        // Senin, 2026-04-20
        Carbon::setTestNow('2026-04-20 10:00:00');
        $this->service->acquireNumber(); // 1000

        // Rabu, 2026-04-22 (Selasa dilewati)
        Carbon::setTestNow('2026-04-22 10:00:00');
        $n2 = $this->service->acquireNumber(); 
        
        // Senin: terakhir 1000.
        // Rollover Senin -> Gap 1001-1010.
        // Selasa (kerja) dilewati -> Gap 1011-1020.
        // Nomor Rabu = 1021.
        $this->assertEquals(1021, $n2);

        $this->assertDatabaseHas('daily_gaps', ['date' => '2026-04-20 00:00:00', 'gap_start' => 1001, 'gap_end' => 1010]);
        $this->assertDatabaseHas('daily_gaps', ['date' => '2026-04-21 00:00:00', 'gap_start' => 1011, 'gap_end' => 1020]);
    }

    /**
     * Test 8: Reset tahunan tetap berjalan di dalam lompatan hari.
     * New year harus selalu mulai dari 1, meskipun hari pertama kerja di tahun baru terlewati.
     */
    public function test_rollover_menangani_reset_tahunan_di_tengah_lompatan(): void
    {
        // Rabu, 2025-12-31 
        Carbon::setTestNow('2025-12-31 10:00:00');
        $this->service->acquireNumber(); // 1000

        // Jumat, 2026-01-02 (Jan 1 Kamis dilewati)
        Carbon::setTestNow('2026-01-02 10:00:00');
        $n2 = $this->service->acquireNumber(); 
        
        // Des 31: 1000.
        // Rollover Des 31 -> Gap diarsipkan.
        // Masuk Jan 1 -> Reset ke 0. 
        // Karena last_number = 0, Jan 1 tidak dibuatkan gap (start of year clean slate).
        // Jan 2 -> Candidate 1.
        $this->assertEquals(1, $n2);
    }
}


