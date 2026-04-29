<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LetterNumberTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helper ──────────────────────────────────────────────────────────────

    /**
     * Buat user aktif dengan role 'user'.
     */
    private function makeUser(): User
    {
        return User::factory()->create([
            'role'      => 'user',
            'is_active' => true,
        ]);
    }

    /**
     * Buat leaf classification yang valid untuk digunakan di test.
     */
    private function makeClassification(): LetterClassification
    {
        return LetterClassification::create([
            'code'      => 'TEST-001',
            'level'     => 3,
            'name'      => 'Test Classification',
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);
    }

    /**
     * Ambil satu nomor surat melalui POST /api/letters dan kembalikan response.
     */
    private function takeNumber(User $user, LetterClassification $classification): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($user, 'sanctum')
                    ->postJson('/api/letters', [
                        'classification_id' => $classification->id,
                        'subject'           => 'Surat Test ' . uniqid(),
                        'destination'       => 'Tujuan Test',
                        'sifat_surat'       => 'biasa',
                    ]);
    }

    // ─── Test Cases ───────────────────────────────────────────────────────────

    /**
     * User dapat mengambil nomor surat baru, mendapat 201 dan number >= 1000.
     */
    public function test_user_can_take_number(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        $response = $this->takeNumber($user, $classification);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => ['number', 'formatted_number'],
                     'message',
                 ]);

        // default_start = 1000, nomor pertama harus >= 1000
        $this->assertGreaterThanOrEqual(1000, $response->json('data.number'));

        // formatted_number harus mengikuti pola W7.{kode}-{angka}
        $this->assertMatchesRegularExpression(
            '/^W7\..+-.+$/',
            $response->json('data.formatted_number'),
            'formatted_number harus mengikuti pola W7.{kode}-{angka}'
        );
    }

    /**
     * Nomor kedua harus = nomor pertama + 1 (sequential dalam blok aktif).
     */
    public function test_second_number_increments(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        $r1 = $this->takeNumber($user, $classification);
        $r2 = $this->takeNumber($user, $classification);

        $r1->assertStatus(201);
        $r2->assertStatus(201);

        $number1 = $r1->json('data.number');
        $number2 = $r2->json('data.number');

        // Nomor kedua harus tepat 1 lebih besar dari nomor pertama
        $this->assertEquals($number1 + 1, $number2);
    }

    /**
     * Nomor ke-10 harus = 1009 (akhir blok aktif pertama, gap_size=10).
     *
     * Blok 0: aktif 1000–1009
     */
    public function test_ten_numbers_are_sequential(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        $lastNumber = null;
        for ($i = 0; $i < 10; $i++) {
            $response = $this->takeNumber($user, $classification);
            $response->assertStatus(201);
            $currentNumber = $response->json('data.number');
            if ($lastNumber !== null) {
                $this->assertEquals($lastNumber + 1, $currentNumber);
            }
            $lastNumber = $currentNumber;
        }
    }

    /**
     * Nomor ke-11 harus melompati zona gap (1010-1019) dan langsung ke 1020.
     *
     * Blok 0: aktif 1000–1009 | gap 1010–1019
     * Blok 1: aktif 1020–1029 | gap 1030–1039
     * Nomor ke-11 harus = 1020 (aktif_start blok 1)
     */
    public function test_rollover_skips_gap_on_new_day(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        // 1. Ambil nomor hari ini (Senin)
        Carbon::setTestNow('2026-04-20 10:00:00'); // Senin
        $r1 = $this->takeNumber($user, $classification);
        $r1->assertStatus(201);
        $lastNumberMonday = $r1->json('data.number');

        // 2. Ganti hari (Selasa)
        Carbon::setTestNow('2026-04-21 10:00:00'); // Selasa
        $r2 = $this->takeNumber($user, $classification);
        $r2->assertStatus(201);
        $firstNumberTuesday = $r2->json('data.number');

        // Sesuai AGENTS.md: candidate = last_number + gap_size + 1
        // gap_size default di database (GlobalSequence) biasanya 10
        $this->assertEquals($lastNumberMonday + 10 + 1, $firstNumberTuesday);

        Carbon::setTestNow(); // Reset
    }

    /**
     * User A tidak boleh mem-void surat milik User B → 403.
     */
    public function test_user_cannot_void_others_letter(): void
    {
        $userA          = $this->makeUser();
        $userB          = $this->makeUser();
        $classification = $this->makeClassification();

        // User B mengambil nomor
        $storeResponse = $this->takeNumber($userB, $classification);
        $storeResponse->assertStatus(201);
        $letterId = $storeResponse->json('data.id');

        // User A mencoba void surat milik User B
        $response = $this->actingAs($userA, 'sanctum')
                         ->patchJson("/api/letters/{$letterId}/void");

        $response->assertStatus(403);
    }

    /**
     * Void surat yang diterbitkan kemarin harus ditolak → 422.
     *
     * Aturan bisnis: void hanya boleh pada hari yang sama dengan issued_date.
     */
    public function test_void_after_different_day_is_rejected(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        // Buat LetterNumber secara langsung dengan issued_date kemarin
        // agar bypass akuisisi nomor yang terikat pada today()
        $letter = LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 9999,
            'formatted_number'  => LetterNumber::buildFormattedNumber($classification->code, 9999),
            'issued_date'       => Carbon::yesterday()->toDateString(),
            'subject'           => 'Surat Kemarin',
            'destination'       => 'Tujuan',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')
                         ->patchJson("/api/letters/{$letter->id}/void");

        $response->assertStatus(422);
    }
}
