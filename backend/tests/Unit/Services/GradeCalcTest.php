<?php

namespace Tests\Unit\Services;

use App\Models\Grade;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Tests unitaires du calcul de moyenne.
 * Grade::getMoyenneAttribute() = moyenne des notes non-null (CC, TP, Exam).
 */
class GradeCalcTest extends TestCase
{
    #[Test]
    public function moyenne_is_average_of_three_components(): void
    {
        $grade = new Grade(['cc' => 12, 'tp' => 14, 'exam' => 16]);

        $this->assertEquals(14.0, $grade->moyenne);
    }

    #[Test]
    public function moyenne_ignores_null_components(): void
    {
        $grade = new Grade(['cc' => 10, 'tp' => null, 'exam' => 14]);

        $this->assertEquals(12.0, $grade->moyenne);
    }

    #[Test]
    public function moyenne_is_null_when_no_component_filled(): void
    {
        $grade = new Grade(['cc' => null, 'tp' => null, 'exam' => null]);

        $this->assertNull($grade->moyenne);
    }

    #[Test]
    public function moyenne_rounds_to_two_decimal_places(): void
    {
        $grade = new Grade(['cc' => 10, 'tp' => 11, 'exam' => 12]);

        $this->assertEquals(11.0, $grade->moyenne);
    }

    #[Test]
    public function moyenne_handles_zero_notes(): void
    {
        $grade = new Grade(['cc' => 0, 'tp' => 0, 'exam' => 0]);

        $this->assertEquals(0.0, $grade->moyenne);
    }

    #[Test]
    public function moyenne_handles_max_notes(): void
    {
        $grade = new Grade(['cc' => 20, 'tp' => 20, 'exam' => 20]);

        $this->assertEquals(20.0, $grade->moyenne);
    }
}
