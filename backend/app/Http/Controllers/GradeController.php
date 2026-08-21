<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Course;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    public function __construct(
        private AuditService $audit,
        private NotificationService $notifService,
    ) {}

    // GET /api/grades
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Grade::with(['student:id,nom_complet', 'course:id,name']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id)->where('status', 'published');
        } elseif ($user->isProfessor()) {
            $query->whereHas('course', fn($q) => $q->where('teacher_id', $user->id));
        }

        if ($request->has('course_id'))  $query->where('course_id', $request->course_id);
        if ($request->has('semestre'))   $query->where('semestre', $request->semestre);

        $query->orderBy('student_id');
        $perPage = min((int) ($request->per_page ?? 50), 200);

        if ($request->boolean('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate($perPage));
    }

    // PUT /api/grades/upsert  (prof/admin : créer ou mettre à jour)
    public function upsert(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id'  => 'required|exists:courses,id',
            'semestre'   => 'required|string|max:2',
            'filiere'    => ['required', Rule::in(['LIC', 'LAP'])],
            'annee'      => ['required', Rule::in(['L1', 'L2', 'L3'])],
            'cc'         => 'nullable|numeric|min:0|max:20',
            'tp'         => 'nullable|numeric|min:0|max:20',
            'exam'       => 'nullable|numeric|min:0|max:20',
            'coef'       => 'required|integer|min:1|max:10',
        ]);

        $grade = Grade::updateOrCreate(
            ['student_id' => $data['student_id'], 'course_id' => $data['course_id']],
            [...$data, 'status' => 'draft', 'created_by' => $request->user()->id]
        );

        return response()->json($grade, 201);
    }

    // POST /api/grades/publish/{courseId}
    public function publish(Request $request, int $courseId)
    {
        $grades = Grade::where('course_id', $courseId)->where('status', 'draft')->get();

        Grade::where('course_id', $courseId)->update(['status' => 'published']);

        $course = Course::find($courseId);

        foreach ($grades as $grade) {
            $this->notifService->send(
                userId: $grade->student_id,
                type:    'note',
                title:   'Notes publiées',
                message: "Vos notes pour \"{$course?->name}\" sont maintenant disponibles.",
            );
        }

        $this->audit->log(
            $request->user(),
            'Publication notes',
            "Notes du cours #{$courseId} publiées ({$grades->count()} étudiants)",
            'grade'
        );

        return response()->json(['message' => "{$grades->count()} notes publiées."]);
    }

    // POST /api/grades/unpublish/{courseId}
    public function unpublish(Request $request, int $courseId)
    {
        Grade::where('course_id', $courseId)->update(['status' => 'draft']);

        $this->audit->log($request->user(), 'Dépublication notes', "Notes du cours #{$courseId} dépubliées", 'grade');

        return response()->json(['message' => 'Notes dépubliées.']);
    }

    // DELETE /api/grades/{grade}
    public function destroy(Grade $grade)
    {
        $grade->delete();
        return response()->json(['message' => 'Note supprimée.']);
    }
}
