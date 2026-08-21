<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id'   => User::factory()->student(),
            'month'        => fake()->monthName() . ' ' . fake()->year(),
            'amount'       => 25000,
            'method'       => fake()->randomElement(['cash', 'mobile_money', 'card']),
            'status'       => 'pending',
            'reference'    => null,
            'confirmed_at' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(['status' => 'confirmed', 'confirmed_at' => now()]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => 'rejected']);
    }
}
