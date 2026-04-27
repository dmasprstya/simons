<?php

namespace Tests\Feature;

use App\Models\LetterClassification;
use App\Models\LetterNumber;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LetterUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'role'      => 'user',
            'is_active' => true,
        ]);
    }

    private function makeClassification(string $code = 'TEST-001'): LetterClassification
    {
        return LetterClassification::create([
            'code'      => $code,
            'level'     => 3,
            'name'      => 'Test Classification ' . $code,
            'type'      => 'substantif',
            'is_leaf'   => true,
            'is_active' => true,
        ]);
    }

    public function test_user_can_update_their_own_letter()
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();
        
        $letter = LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 1000,
            'formatted_number'  => LetterNumber::buildFormattedNumber($classification->code, 1000),
            'issued_date'       => today(),
            'subject'           => 'Original Subject',
            'destination'       => 'Original Destination',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $classification->id,
                'subject'           => 'Updated Subject',
                'destination'       => 'Updated Destination',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('letter_numbers', [
            'id'          => $letter->id,
            'subject'     => 'Updated Subject',
            'destination' => 'Updated Destination',
        ]);
    }

    public function test_formatted_number_updates_when_classification_changes()
    {
        $user = $this->makeUser();
        $class1 = $this->makeClassification('CODE-001');
        $class2 = $this->makeClassification('CODE-002');
        
        $letter = LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $class1->id,
            'number'            => 1000,
            'formatted_number'  => LetterNumber::buildFormattedNumber($class1->code, 1000),
            'issued_date'       => today(),
            'subject'           => 'Subject',
            'destination'       => 'Destination',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
        ]);

        $oldFormattedNumber = $letter->formatted_number;

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $class2->id,
                'subject'           => 'Subject',
                'destination'       => 'Destination',
            ]);

        $response->assertStatus(200);
        
        $letter->refresh();
        $this->assertEquals($class2->id, $letter->classification_id);
        $this->assertNotEquals($oldFormattedNumber, $letter->formatted_number);
        $this->assertStringContainsString('CODE-002', $letter->formatted_number);
    }

    public function test_user_cannot_update_others_letter()
    {
        $userA = $this->makeUser();
        $userB = $this->makeUser();
        $classification = $this->makeClassification();
        
        $letter = LetterNumber::create([
            'user_id'           => $userB->id,
            'classification_id' => $classification->id,
            'number'            => 1000,
            'formatted_number'  => LetterNumber::buildFormattedNumber($classification->code, 1000),
            'issued_date'       => today(),
            'subject'           => 'Original Subject',
            'destination'       => 'Original Destination',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
        ]);

        $response = $this->actingAs($userA, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $classification->id,
                'subject'           => 'Updated Subject',
                'destination'       => 'Updated Destination',
            ]);

        $response->assertStatus(403);
    }

    public function test_cannot_update_voided_letter()
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();
        
        $letter = LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 1000,
            'formatted_number'  => LetterNumber::buildFormattedNumber($classification->code, 1000),
            'issued_date'       => today(),
            'subject'           => 'Original Subject',
            'destination'       => 'Original Destination',
            'sifat_surat'       => 'biasa',
            'status'            => 'voided',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $classification->id,
                'subject'           => 'Updated Subject',
                'destination'       => 'Updated Destination',
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Surat yang sudah dibatalkan tidak dapat diedit.');
    }

    public function test_edit_limit_2_days()
    {
        $user = $this->makeUser();
        $classification = $this->makeClassification();
        
        // Day 0: Create
        Carbon::setTestNow('2026-04-01 10:00:00');
        $letter = LetterNumber::create([
            'user_id'           => $user->id,
            'classification_id' => $classification->id,
            'number'            => 1000,
            'formatted_number'  => LetterNumber::buildFormattedNumber($classification->code, 1000),
            'issued_date'       => today(),
            'subject'           => 'Subject',
            'destination'       => 'Destination',
            'sifat_surat'       => 'biasa',
            'status'            => 'active',
        ]);

        // Day 1: Still can edit (diffInDays = 1)
        Carbon::setTestNow('2026-04-02 10:00:00');
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $classification->id,
                'subject'           => 'Updated Day 1',
                'destination'       => 'Destination',
            ]);
        $response->assertStatus(200);

        // Day 2: Cannot edit (diffInDays = 2)
        Carbon::setTestNow('2026-04-03 10:00:00');
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/letters/{$letter->id}", [
                'classification_id' => $classification->id,
                'subject'           => 'Updated Day 2',
                'destination'       => 'Destination',
            ]);
        $response->assertStatus(422);
        $response->assertJsonPath('message', 'Surat hanya dapat diedit dalam 2 hari sejak tanggal penerbitan.');

        Carbon::setTestNow();
    }
}
