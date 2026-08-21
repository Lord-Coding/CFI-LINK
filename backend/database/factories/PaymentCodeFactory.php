<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code'       => 'PAY-' . strtoupper(fake()->lexify('??????')),
            'student_id' => User::factory()->student(),
            'month'      => fake()->monthName() . ' ' . fake()->year(),
            'used'       => false,
        ];
    }
}
