<?php

namespace Tests\Feature;

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

        // GlobalSequence (next_start=1000, gap_size=10) sudah ada via migration.
        // Nomor 1010 = gap zone blok 0 (posInBlock=10, gap_size=10) — valid.
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

        // GlobalSequence sudah ada via migration. Nomor 1010 = awal zona gap blok 0.
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

        // GlobalSequence sudah ada via migration.
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
