<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom_complet'     => fake()->name(),
            'email'           => fake()->unique()->safeEmail(),
            'password'        => Hash::make('password'),
            'role'            => 'etudiant_concours',
            'is_active'       => true,
            'payment_blocked' => false,
            'filiere'         => 'LIC',
            'annee'           => 'L1',
            'option_lic'      => null,
            'specialite'      => null,
            'grade'           => null,
            'service'         => null,
            'staff_role'      => null,
        ];
    }

    public function superAdmin(): static
    {
        return $this->state(['role' => 'super_admin', 'filiere' => null, 'annee' => null]);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin', 'filiere' => null, 'annee' => null]);
    }

    public function professor(): static
    {
        return $this->state([
            'role'       => 'professeur',
            'filiere'    => null,
            'annee'      => null,
            'specialite' => 'Informatique',
            'grade'      => 'Maître de conférences',
        ]);
    }

    public function staff(string $staffRole = 'secretariat'): static
    {
        return $this->state([
            'role'       => 'membre_administratif',
            'filiere'    => null,
            'annee'      => null,
            'staff_role' => $staffRole,
            'service'    => 'Administration',
        ]);
    }

    public function student(string $filiere = 'LIC', string $annee = 'L1'): static
    {
        return $this->state([
            'role'    => 'etudiant_concours',
            'filiere' => $filiere,
            'annee'   => $annee,
        ]);
    }

    public function external(): static
    {
        return $this->state(['role' => 'etudiant_externe']);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function blocked(): static
    {
        return $this->state(['payment_blocked' => true]);
    }
}
