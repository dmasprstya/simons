<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helper ──────────────────────────────────────────────────────────────

    /**
     * Buat user aktif dengan role dan password tertentu.
     */
    private function makeUser(string $role = 'user', bool $isActive = true): User
    {
        return User::factory()->create([
            'role'      => $role,
            'is_active' => $isActive,
            'password'  => bcrypt('password123'),
        ]);
    }

    // ─── Test Cases ───────────────────────────────────────────────────────────

    /**
     * Login dengan kredensial valid harus mengembalikan 200 dan token.
     */
    public function test_login_returns_token(): void
    {
        $user = $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => ['token', 'user'],
                     'message',
                 ]);

        // Pastikan token tidak kosong
        $this->assertNotEmpty($response->json('data.token'));
    }

    /**
     * Login dengan password salah harus mengembalikan 401.
     */
    public function test_login_with_wrong_password(): void
    {
        $user = $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Login dengan akun nonaktif (is_active=false) harus mengembalikan 403.
     */
    public function test_login_with_inactive_account(): void
    {
        $user = $this->makeUser(isActive: false);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Logout harus menghapus token sehingga tidak bisa dipakai lagi.
     *
     * Setelah logout, token dihapus dari tabel personal_access_tokens.
     * Verifikasi dilakukan langsung ke DB (lebih reliable di testing in-memory
     * karena refreshApplication() akan menghapus state DB RefreshDatabase).
     */
    public function test_logout_revokes_token(): void
    {
        $user    = $this->makeUser();
        $tokenResult = $user->createToken('api-token');
        $plainToken  = $tokenResult->plainTextToken;
        $tokenId     = $tokenResult->accessToken->id;

        // Pastikan token ada sebelum logout
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $tokenId]);

        // Logout menggunakan Bearer token eksplisit
        $this->withToken($plainToken)
             ->postJson('/api/auth/logout')
             ->assertStatus(200);

        // Verifikasi token benar-benar dihapus dari DB — bukan bisa dipakai lagi
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    /**
     * User dengan role 'user' tidak boleh mengakses route admin (GET /api/users).
     */
    public function test_user_cannot_access_admin_route(): void
    {
        $user = $this->makeUser(role: 'user');

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/users');

        $response->assertStatus(403);
    }
}
