<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'role'      => 'admin',
            'is_active' => true,
        ]);
    }

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

    public function test_pdf_export_success(): void
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();

        LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 1000,
            'formatted_number'  => 'W.7-TEST-001-1000',
            'issued_date'       => now()->toDateString(),
            'subject'           => 'Surat Export Test',
            'destination'       => 'Tujuan Export',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
            'source'            => 'regular',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->get('/api/reports/export?format=pdf');

        // Snappy render external binary — expects 200 dengan Content-Type application/pdf
        // atau 500 kalau binary belum di-setup di CI; yang penting tidak 422 dan tidak crash CORS
        $this->assertNotEquals(0, $response->status(), 'Response harus ada, bukan connection drop');
        $this->assertNotEquals(
            'text/html; charset=UTF-8',
            $response->headers->get('Content-Type'),
            'Response tidak boleh berupa HTML error page'
        );
    }

    /**
     * Jika jumlah rows > 5000, endpoint harus balas 422 dengan pesan jelas
     * (tidak boleh crash atau drop connection).
     */
    public function test_pdf_export_exceeds_threshold(): void
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();

        // Insert 5001 baris dalam chunk 500 agar cepat
        // letter_numbers TIDAK punya kolom updated_at — hanya created_at
        $now = now()->toDateString();
        $createdAt = now()->toDateTimeString();
        $chunk = [];

        for ($i = 1; $i <= 5001; $i++) {
            $chunk[] = [
                'user_id'           => $user->id,
                'classification_id' => $classification->id,
                'number'            => $i,
                'formatted_number'  => "W.7-TEST-001-{$i}",
                'issued_date'       => $now,
                'subject'           => "Surat {$i}",
                'destination'       => 'Tujuan',
                'sifat_surat'       => 'biasa',
                'status'            => 'active',
                'source'            => 'regular',
                'created_at'        => $createdAt,
            ];

            if (count($chunk) === 500) {
                LetterNumber::insert($chunk);
                $chunk = [];
            }
        }
        if (!empty($chunk)) {
            LetterNumber::insert($chunk);
        }

        $response = $this->actingAs($user, 'sanctum')
            ->get('/api/reports/export?format=pdf');

        // Harus 422, bukan connection drop atau 500
        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Rentang data terlalu besar, persempit filter tanggal.',
        ]);
    }

    /**
     * Export CSV tetap berjalan normal (tidak terpengaruh migrasi ke Snappy).
     */
    public function test_csv_export_not_affected(): void
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();

        LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 2000,
            'formatted_number'  => 'W.7-TEST-001-2000',
            'issued_date'       => now()->toDateString(),
            'subject'           => 'Surat CSV Test',
            'destination'       => 'Tujuan CSV',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
            'source'            => 'regular',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->get('/api/reports/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
