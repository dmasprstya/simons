<?php

namespace Tests\Feature;

use App\Models\GlobalSequence;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use App\Services\NumberingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class NumberingYearlyResetTest extends TestCase
{
    use RefreshDatabase;

    private NumberingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(NumberingService::class);
        
        // Setup default data
        LetterClassification::create([
            'code' => 'TU.01',
            'name' => 'Tata Usaha',
            'level' => 1,
            'type' => 'substantif',
            'is_leaf' => true,
            'is_active' => true,
        ]);
    }

    /**
     * Test ganti tahun: reset nomor ke 1 otomatis.
     */
    public function test_automatic_yearly_reset_to_one()
    {
        // 1. Set waktu ke akhir tahun 2026
        Carbon::setTestNow('2026-12-31 10:00:00');
        
        // Ambil nomor pertama (starts at 1000 per config default_start)
        $num1 = $this->service->acquireNumber();
        $this->assertEquals(1000, $num1);
        
        $num2 = $this->service->acquireNumber();
        $this->assertEquals(1001, $num2);

        // 2. Loncat ke tahun baru 2027
        Carbon::setTestNow('2027-01-01 09:00:00');
        
        // Ambil nomor di tahun baru
        $numNewYear = $this->service->acquireNumber();
        
        // Harus reset ke 1
        $this->assertEquals(1, $numNewYear);
        
        // Verifikasi di database
        $seq = GlobalSequence::first();
        $this->assertEquals(1, $seq->last_number);
        $this->assertEquals('2027-01-01', $seq->last_issued_date->format('Y-m-d'));
        
        // Ambil nomor lagi di hari yang sama
        $numNext = $this->service->acquireNumber();
        $this->assertEquals(2, $numNext);
    }

    /**
     * Test rollover harian di tahun yang sama tidak reset ke 1 tapi pakai gap.
     */
    public function test_daily_rollover_within_same_year_uses_gap()
    {
        Carbon::setTestNow('2026-04-20 10:00:00');
        $this->service->acquireNumber(); // 1000
        
        $seq = GlobalSequence::first();
        $gapSize = $seq->gap_size; // default 10

        // Ganti hari tapi masih tahun yang sama
        Carbon::setTestNow('2026-04-21 10:00:00');
        
        $numNextDay = $this->service->acquireNumber();
        
        // Harus melompati gap (1000 + 10 + 1 = 1011)
        $this->assertEquals(1000 + $gapSize + 1, $numNextDay);
    }
}
