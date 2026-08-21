<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'action'     => fake()->sentence(3),
            'details'    => fake()->sentence(),
            'category'   => fake()->randomElement(['auth', 'user', 'payment', 'code', 'document', 'system', 'grade']),
            'ip_address' => fake()->ipv4(),
        ];
    }
}
