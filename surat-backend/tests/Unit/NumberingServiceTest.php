<?php

namespace Tests\Unit;

use App\Exceptions\GapAlreadyUsedException;
use App\Models\DailySequence;
use App\Models\GapRequest;
use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use App\Services\NumberingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Unit test untuk NumberingService.
 *
 * Database: SQLite in-memory via RefreshDatabase (dikonfigurasi di phpunit.xml).
 * TIDAK menggunakan browser atau dev server.
 *
 * Logika blok yang diuji (default_start=1000, gap_size=10):
 *   Blok 0 → aktif: 1000–1009 | zona gap: 1010–1019
 *   Blok 1 → aktif: 1020–1029 | zona gap: 1030–1039
 */
class NumberingServiceTest extends TestCase
{
    use RefreshDatabase;

    private NumberingService $service;
    private LetterClassification $classification;
    private User $user;
    private Carbon $date;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new NumberingService();
        $this->date    = Carbon::parse('2026-04-05');

        // Buat user dummy untuk foreign key requirement
        // role hanya menerima 'admin' atau 'user' (sesuai enum di migration)
        $this->user = User::create([
            'name'      => 'Test User',
            'email'     => 'test@example.com',
            'password'  => bcrypt('password'),
            'role'      => 'user',
            'is_active' => true,
        ]);

        // Buat klasifikasi leaf level 3 (hanya leaf yang boleh punya nomor surat)
        // 'type' wajib diisi (enum: 'substantif' | 'fasilitatif')
        // 'level' wajib diisi (NOT NULL), level 3 = leaf
        $this->classification = LetterClassification::create([
            'code'      => 'TEST',
            'name'      => 'Test Classification',
            'level'     => 3,
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    /**
     * Acquire nomor sejumlah $count kali berturut-turut untuk sequence yang sama.
     * Mengembalikan array nomor hasil acquire.
     *
     * @return int[]
     */
    private function acquireMultiple(int $count): array
    {
        $numbers = [];
        for ($i = 0; $i < $count; $i++) {
            $numbers[] = $this->service->acquireNumber($this->classification->id, $this->date);
        }
        return $numbers;
    }

    // ─── Test Cases ──────────────────────────────────────────────────────────

    /**
     * Test 1: Nomor pertama yang dikeluarkan harus sama dengan default_start (1000).
     *
     * Verifikasi: sequence baru → next_start = 1000 → kandidat=1000 → di zona aktif (pos=0) → return 1000.
     */
    public function test_nomor_pertama_sama_dengan_default_start(): void
    {
        $number = $this->service->acquireNumber($this->classification->id, $this->date);

        $this->assertEquals(1000, $number, 'Nomor pertama harus sama dengan default_start (1000)');
    }

    /**
     * Test 2: Nomor kedua harus 1001 (langsung setelah nomor pertama).
     *
     * Verifikasi: setelah acquire 1000, last_number=1 → kandidat=1001 → pos=1 < gap_size=10 → return 1001.
     */
    public function test_nomor_kedua_adalah_1001(): void
    {
        $this->acquireMultiple(1); // ambil nomor 1000

        $number = $this->service->acquireNumber($this->classification->id, $this->date);

        $this->assertEquals(1001, $number, 'Nomor kedua harus 1001');
    }

    /**
     * Test 3: Nomor ke-10 harus 1009 (aktif_end blok pertama).
     *
     * Verifikasi: acquire 10 kali → nomor terakhir = 1009 = aktif_end blok 0.
     * Ini adalah batas akhir zona aktif sebelum zona gap dimulai (1010-1019).
     */
    public function test_nomor_ke_10_adalah_1009_aktif_end_blok_pertama(): void
    {
        // Acquire 9 nomor pertama (1000-1008)
        $this->acquireMultiple(9);

        // Nomor ke-10 harus 1009
        $number = $this->service->acquireNumber($this->classification->id, $this->date);

        $this->assertEquals(1009, $number, 'Nomor ke-10 harus 1009 (aktif_end blok pertama)');
    }

    /**
     * Test 4: Nomor ke-11 harus SKIP zona gap (1010-1019) dan langsung ke 1020.
     *
     * Logika skip:
     *   Setelah acquire 1009 (last_number=10 → kandidat=1010), pos=10 >= gap_size=10 → zona gap!
     *   Service harus lompat ke aktif_start blok 1 = 1000 + 1*(10*2) = 1020.
     */
    public function test_nomor_ke_11_skip_zona_gap_dan_langsung_1020(): void
    {
        // Acquire 10 nomor (1000-1009), mengisi seluruh zona aktif blok 0
        $this->acquireMultiple(10);

        // Nomor ke-11 HARUS melompat melewati zona gap (1010-1019)
        $number = $this->service->acquireNumber($this->classification->id, $this->date);

        $this->assertEquals(
            1020,
            $number,
            'Nomor ke-11 harus skip zona gap 1010-1019 dan langsung ke 1020 (aktif_start blok 1)'
        );
    }

    /**
     * Test 5: releaseGapNumber berhasil menerbitkan nomor yang berada di zona gap.
     *
     * Setup:
     *   - Sequence dengan last_number > 0 (minimal 1 nomor sudah diambil di zona aktif)
     *   - GapRequest dengan nomor 1010 (zona gap blok 0: 1010-1019)
     *
     * Verifikasi: LetterNumber baru dengan number=1010 berhasil dibuat.
     */
    public function test_release_gap_number_berhasil_untuk_nomor_di_zona_gap(): void
    {
        // Pastikan sequence sudah ada dengan mengambil 1 nomor aktif dulu
        $this->service->acquireNumber($this->classification->id, $this->date);

        // Buat GapRequest dengan nomor 1010 (zona gap valid: 1010-1019)
        $gapRequest = GapRequest::create([
            'requested_by'      => $this->user->id,
            'classification_id' => $this->classification->id,
            'number'            => 1010,
            'gap_date'          => $this->date->toDateString(),
            'status'            => 'approved',
            'reason'            => 'Test gap release ke zona gap',
        ]);

        $letterNumber = $this->service->releaseGapNumber($gapRequest);

        // Verifikasi LetterNumber berhasil dibuat dengan nomor gap yang benar
        $this->assertInstanceOf(LetterNumber::class, $letterNumber);
        $this->assertEquals(1010, $letterNumber->number, 'Nomor gap harus 1010');
        $this->assertEquals($this->classification->id, $letterNumber->classification_id);
        $this->assertEquals('active', $letterNumber->status);

        // Verifikasi record benar-benar tersimpan di database
        $this->assertDatabaseHas('letter_numbers', [
            'number'            => 1010,
            'classification_id' => $this->classification->id,
            'status'            => 'active',
        ]);
    }

    /**
     * Test 6: releaseGapNumber harus GAGAL jika nomor bukan di zona gap.
     *
     * Nomor 1000-1009 adalah zona AKTIF (bukan zona gap).
     * releaseGapNumber seharusnya melempar GapAlreadyUsedException.
     */
    public function test_release_gap_number_gagal_jika_nomor_bukan_zona_gap(): void
    {
        // Pastikan sequence sudah ada
        $this->service->acquireNumber($this->classification->id, $this->date);

        // Buat GapRequest dengan nomor 1005 (zona AKTIF, bukan zona gap)
        $gapRequest = GapRequest::create([
            'requested_by'      => $this->user->id,
            'classification_id' => $this->classification->id,
            'number'            => 1005, // zona aktif (1000-1009), BUKAN zona gap
            'gap_date'          => $this->date->toDateString(),
            'status'            => 'approved',
            'reason'            => 'Test nomor aktif — harus ditolak',
        ]);

        // Harus melempar GapAlreadyUsedException karena 1005 ada di zona aktif
        $this->expectException(GapAlreadyUsedException::class);

        $this->service->releaseGapNumber($gapRequest);
    }
}
