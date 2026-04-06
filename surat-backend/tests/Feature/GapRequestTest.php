<?php

namespace Tests\Feature;

use App\Models\DailySequence;
use App\Models\GapRequest;
use App\Models\LetterClassification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GapRequestTest extends TestCase
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
     * Buat admin aktif.
     */
    private function makeAdmin(): User
    {
        return User::factory()->create([
            'role'      => 'admin',
            'is_active' => true,
        ]);
    }

    /**
     * Buat leaf classification yang valid.
     */
    private function makeClassification(): LetterClassification
    {
        return LetterClassification::create([
            'code'      => 'GAP-001',
            'level'     => 3,
            'name'      => 'Gap Test Classification',
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);
    }

    /**
     * Buat DailySequence untuk klasifikasi dan tanggal tertentu.
     * Dengan default_start=1000 dan gap_size=10:
     *   - Blok 0: aktif 1000-1009, gap 1010-1019
     *
     * Agar releaseGapNumber() bisa berhasil, sequence perlu ada
     * dan last_number perlu >= gap_size (sudah melewati zona aktif blok 0).
     *
     * @param  LetterClassification  $classification
     * @param  string                $date  Format Y-m-d
     * @param  int                   $lastNumber  Jumlah nomor yang sudah dipakai (relative dari next_start)
     */
    private function makeSequence(
        LetterClassification $classification,
        string $date,
        int $lastNumber = 10
    ): DailySequence {
        // Gunakan insertOrIgnore + find untuk menghindari konflik unique constraint
        \Illuminate\Support\Facades\DB::table('daily_sequences')->insertOrIgnore([
            'date'              => $date,
            'classification_id' => $classification->id,
            'last_number'       => $lastNumber,
            'gap_size'          => 10,
            'next_start'        => 1000,
            'updated_at'        => now(),
        ]);

        return DailySequence::where('date', $date)
            ->where('classification_id', $classification->id)
            ->firstOrFail();
    }

    /**
     * Buat GapRequest pending dengan nomor gap dan tanggal tertentu.
     */
    private function makePendingGapRequest(
        User $user,
        LetterClassification $classification,
        string $gapDate,
        int $gapNumber
    ): GapRequest {
        return GapRequest::create([
            'requested_by'      => $user->id,
            'classification_id' => $classification->id,
            'gap_date'          => $gapDate,
            'reason'            => 'Alasan pengajuan gap request untuk keperluan testing',
            'status'            => 'pending',
            'number'            => $gapNumber,
        ]);
    }

    // ─── Test Cases ───────────────────────────────────────────────────────────

    /**
     * User dapat membuat gap request baru → 201, status=pending.
     */
    public function test_user_can_create_gap_request(): void
    {
        $user           = $this->makeUser();
        $classification = $this->makeClassification();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/gap-requests', [
                             'classification_id' => $classification->id,
                             'gap_date'          => today()->toDateString(),
                             'reason'            => 'Surat yang sebelumnya hilang perlu diganti dengan nomor cadangan',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.status', 'pending');
    }

    /**
     * Admin dapat menyetujui gap request → 200, status=approved, ada letter_number.
     */
    public function test_admin_can_approve_gap_request(): void
    {
        $user           = $this->makeUser();
        $admin          = $this->makeAdmin();
        $classification = $this->makeClassification();
        $today          = today()->toDateString();

        // Siapkan sequence dengan last_number=10 (blok 0 sudah penuh)
        // sehingga nomor gap 1010 valid (posInBlock = 10 >= gap_size=10 adalah gap zone)
        $this->makeSequence($classification, $today, 10);

        // Buat gap request dengan nomor gap yang valid (1010 = gap zone blok 0)
        $gapRequest = $this->makePendingGapRequest($user, $classification, $today, 1010);

        $response = $this->actingAs($admin, 'sanctum')
                         ->patchJson("/api/gap-requests/{$gapRequest->id}/approve");

        $response->assertStatus(200)
                 ->assertJsonPath('data.status', 'approved');

        // Harus ada number (nomor gap yang diterbitkan)
        $this->assertNotNull($response->json('data.number'));
    }

    /**
     * Nomor yang dihasilkan dari approval gap request harus berada di zona gap blok pertama.
     *
     * Zona gap blok 0: 1010-1019 (dengan default_start=1000, gap_size=10)
     */
    public function test_approved_gap_number_is_in_gap_zone(): void
    {
        $user           = $this->makeUser();
        $admin          = $this->makeAdmin();
        $classification = $this->makeClassification();
        $today          = today()->toDateString();

        // Siapkan sequence dengan blok aktif sudah penuh (last_number=10)
        $this->makeSequence($classification, $today, 10);

        // Minta nomor 1010 (awal zona gap blok 0)
        $gapRequest = $this->makePendingGapRequest($user, $classification, $today, 1010);

        $response = $this->actingAs($admin, 'sanctum')
                         ->patchJson("/api/gap-requests/{$gapRequest->id}/approve");

        $response->assertStatus(200);

        $number = $response->json('data.number');

        // Nomor yang diterbitkan harus berada di zona gap blok pertama: 1010-1019
        $this->assertGreaterThanOrEqual(1010, $number, "Nomor {$number} seharusnya >= 1010 (zona gap)");
        $this->assertLessThanOrEqual(1019, $number, "Nomor {$number} seharusnya <= 1019 (zona gap)");
    }

    /**
     * Admin dapat menolak gap request → 200, status=rejected.
     */
    public function test_admin_can_reject_gap_request(): void
    {
        $user           = $this->makeUser();
        $admin          = $this->makeAdmin();
        $classification = $this->makeClassification();

        $gapRequest = $this->makePendingGapRequest(
            $user,
            $classification,
            today()->toDateString(),
            1010
        );

        $response = $this->actingAs($admin, 'sanctum')
                         ->patchJson("/api/gap-requests/{$gapRequest->id}/reject", [
                             'reason' => 'Gap request tidak memenuhi syarat administratif',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.status', 'rejected');
    }

    /**
     * Menyetujui gap request yang sudah diapprove dua kali harus ditolak → 422.
     */
    public function test_cannot_approve_already_approved_request(): void
    {
        $user           = $this->makeUser();
        $admin          = $this->makeAdmin();
        $classification = $this->makeClassification();
        $today          = today()->toDateString();

        // Siapkan sequence
        $this->makeSequence($classification, $today, 10);

        // Buat gap request dengan nomor 1010
        $gapRequest = $this->makePendingGapRequest($user, $classification, $today, 1010);

        // Approve pertama kali — harus berhasil
        $this->actingAs($admin, 'sanctum')
             ->patchJson("/api/gap-requests/{$gapRequest->id}/approve")
             ->assertStatus(200);

        // Approve kedua kali — harus ditolak dengan 422
        $response = $this->actingAs($admin, 'sanctum')
                         ->patchJson("/api/gap-requests/{$gapRequest->id}/approve");

        $response->assertStatus(422);
    }
}
