<?php

namespace Tests\Feature\Business;

use App\Models\PaymentCode;
use App\Models\PaymentRecord;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    #[Test]
    public function student_can_submit_payment(): void
    {
        $ctx = $this->actingAsRole('etudiant_concours');

        $this->postJson('/api/payments', [
            'month'  => 'Octobre 2024',
            'amount' => 25000,
            'method' => 'cash',
        ], $ctx['headers'])->assertCreated()->assertJsonPath('status', 'pending');
    }

    #[Test]
    public function admin_can_confirm_payment_and_unblock_student(): void
    {
        $student = User::factory()->blocked()->create();
        $record  = PaymentRecord::factory()->create(['student_id' => $student->id]);

        $this->patchJson("/api/payments/{$record->id}/confirm", [], $this->authHeaders('admin'))
             ->assertOk()
             ->assertJsonPath('status', 'confirmed');

        $student->refresh();
        $this->assertFalse($student->payment_blocked);
    }

    #[Test]
    public function admin_can_reject_payment(): void
    {
        $student = User::factory()->student()->create();
        $record  = PaymentRecord::factory()->create(['student_id' => $student->id]);

        $this->patchJson("/api/payments/{$record->id}/reject", [], $this->authHeaders('admin'))
             ->assertOk()
             ->assertJsonPath('status', 'rejected');
    }

    #[Test]
    public function student_can_validate_payment_code_and_get_unblocked(): void
    {
        $ctx  = $this->actingAsRole('etudiant_concours');
        $user = $ctx['user'];
        $user->update(['payment_blocked' => true]);

        PaymentCode::factory()->create([
            'student_id' => $user->id,
            'month'      => 'Novembre 2024',
            'code'       => 'PAY-UNLOCK',
            'used'       => false,
        ]);

        $this->postJson('/api/payment-codes/validate', ['code' => 'PAY-UNLOCK'], $ctx['headers'])
             ->assertOk();

        $user->refresh();
        $this->assertFalse($user->payment_blocked);
    }

    #[Test]
    public function invalid_payment_code_returns_422(): void
    {
        $ctx = $this->actingAsRole('etudiant_concours');

        $this->postJson('/api/payment-codes/validate', ['code' => 'PAY-INVALID'], $ctx['headers'])
             ->assertStatus(422);
    }

    #[Test]
    public function admin_can_generate_payment_code(): void
    {
        $student = User::factory()->student()->create();

        $this->postJson('/api/payment-codes', [
            'student_id' => $student->id,
            'month'      => 'Décembre 2024',
        ], $this->authHeaders('admin'))
             ->assertCreated()
             ->assertJsonStructure(['code', 'student_id', 'month']);
    }
}
