<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    // GET /api/courses
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Course::with('teacher:id,nom_complet');

        if ($user->isStudent()) {
            $query->where('filiere', $user->filiere)->where('annee', $user->annee);
            if ($user->filiere === 'LIC' && $user->annee === 'L3' && $user->option_lic) {
                $query->where(fn($q) => $q->whereNull('option_lic')->orWhere('option_lic', $user->option_lic));
            }
        } elseif ($user->isProfessor()) {
            $query->where('teacher_id', $user->id);
        }

        if ($request->has('filiere'))  $query->where('filiere', $request->filiere);
        if ($request->has('annee'))    $query->where('annee', $request->annee);
        if ($request->has('semester')) $query->where('semester', $request->semester);

        return response()->json($query->get());
    }

    // GET /api/courses/{course}
    public function show(Course $course)
    {
        return response()->json($course->load('teacher:id,nom_complet', 'lessons'));
    }

    // POST /api/courses
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'teacher_id'  => 'nullable|exists:users,id',
            'filiere'     => ['required', Rule::in(['LIC', 'LAP'])],
            'annee'       => ['required', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'  => ['nullable', Rule::in(['GL', 'SR'])],
            'hours'       => 'required|integer|min:1',
            'semester'    => ['required', Rule::in(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'])],
            'description' => 'nullable|string',
        ]);

        return response()->json(Course::create($data), 201);
    }

    // PUT /api/courses/{course}
    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'teacher_id'  => 'sometimes|nullable|exists:users,id',
            'filiere'     => ['sometimes', Rule::in(['LIC', 'LAP'])],
            'annee'       => ['sometimes', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic'  => ['sometimes', 'nullable', Rule::in(['GL', 'SR'])],
            'hours'       => 'sometimes|integer|min:1',
            'semester'    => ['sometimes', Rule::in(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'])],
            'description' => 'sometimes|nullable|string',
        ]);

        $course->update($data);
        return response()->json($course);
    }

    // DELETE /api/courses/{course}
    public function destroy(Course $course)
    {
        $course->delete();
        return response()->json(['message' => 'Cours supprimé.']);
    }

    // GET /api/courses/{course}/lessons
    public function lessons(Course $course)
    {
        return response()->json($course->lessons);
    }

    // POST /api/lessons/{lesson}/progress
    public function markLessonComplete(Request $request, Lesson $lesson)
    {
        $data = $request->validate([
            'score' => 'nullable|integer|min:0|max:100',
        ]);

        $progress = LessonProgress::updateOrCreate(
            ['student_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            [
                'course_id'    => $lesson->course_id,
                'completed'    => true,
                'score'        => $data['score'] ?? null,
                'completed_at' => now(),
            ]
        );

        return response()->json($progress);
    }

    // GET /api/courses/{course}/progress
    public function courseProgress(Request $request, Course $course)
    {
        $studentId    = $request->user()->id;
        $totalLessons = $course->lessons->count();
        $done         = LessonProgress::where('student_id', $studentId)
            ->where('course_id', $course->id)
            ->where('completed', true)
            ->count();

        return response()->json([
            'total'      => $totalLessons,
            'completed'  => $done,
            'percentage' => $totalLessons > 0 ? round($done / $totalLessons * 100) : 0,
        ]);
    }
}
