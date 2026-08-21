<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ValidationCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code'       => 'EXT-' . strtoupper(fake()->lexify('??????')),
            'used'       => false,
            'used_by'    => null,
            'expires_at' => now()->addDays(30),
        ];
    }

    public function expired(): static
    {
        return $this->state(['expires_at' => now()->subDay()]);
    }

    public function used(\App\Models\User $user): static
    {
        return $this->state(['used' => true, 'used_by' => $user->id]);
    }
}
