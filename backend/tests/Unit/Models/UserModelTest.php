<?php

namespace Tests\Unit\Models;

use App\Models\User;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    #[Test]
    public function isAdmin_returns_true_for_admin_roles(): void
    {
        $this->assertTrue((new User(['role' => 'admin']))->isAdmin());
        $this->assertTrue((new User(['role' => 'super_admin']))->isAdmin());
    }

    #[Test]
    public function isAdmin_returns_false_for_non_admins(): void
    {
        foreach (['professeur', 'etudiant_concours', 'etudiant_externe', 'membre_administratif'] as $role) {
            $this->assertFalse((new User(['role' => $role]))->isAdmin(), "Rôle {$role} ne devrait pas être admin");
        }
    }

    #[Test]
    public function isStudent_returns_true_for_student_roles(): void
    {
        $this->assertTrue((new User(['role' => 'etudiant_concours']))->isStudent());
        $this->assertTrue((new User(['role' => 'etudiant_externe']))->isStudent());
    }

    #[Test]
    public function isProfessor_returns_true_only_for_professor(): void
    {
        $this->assertTrue((new User(['role' => 'professeur']))->isProfessor());
        $this->assertFalse((new User(['role' => 'admin']))->isProfessor());
    }

    #[Test]
    public function password_is_hidden_from_serialization(): void
    {
        $user = User::factory()->create();
        $arr  = $user->toArray();

        $this->assertArrayNotHasKey('password', $arr);
        $this->assertArrayNotHasKey('remember_token', $arr);
    }

    #[Test]
    public function booleans_are_cast_correctly(): void
    {
        $user = User::factory()->create(['is_active' => 1, 'payment_blocked' => 0]);

        $this->assertIsBool($user->is_active);
        $this->assertIsBool($user->payment_blocked);
        $this->assertTrue($user->is_active);
        $this->assertFalse($user->payment_blocked);
    }
}
