<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function __construct(private NotificationService $notifService) {}

    // GET /api/attendance
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = AttendanceRecord::with(['student:id,nom_complet', 'course:id,name']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isProfessor()) {
            $query->whereHas('course', fn($q) => $q->where('teacher_id', $user->id));
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        return response()->json($query->orderByDesc('date')->get());
    }

    // POST /api/attendance/upsert
    public function upsert(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id'  => 'required|exists:courses,id',
            'date'       => 'required|date_format:Y-m-d',
            'status'     => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
        ]);

        $previous = AttendanceRecord::where([
            'student_id' => $data['student_id'],
            'course_id'  => $data['course_id'],
            'date'       => $data['date'],
        ])->first();

        $record = AttendanceRecord::updateOrCreate(
            ['student_id' => $data['student_id'], 'course_id' => $data['course_id'], 'date' => $data['date']],
            ['status' => $data['status'], 'marked_by' => $request->user()->id]
        );

        // Notifier si nouvelle absence
        if ($data['status'] === 'absent' && (! $previous || $previous->status !== 'absent')) {
            $course = $record->course;
            $this->notifService->send(
                userId: $data['student_id'],
                type:    'systeme',
                title:   'Absence enregistrée',
                message: "Une absence a été enregistrée pour le cours \"{$course?->name}\" le " . date('d/m/Y', strtotime($data['date'])) . '.',
            );
        }

        return response()->json($record, 201);
    }

    // GET /api/attendance/stats/{studentId}
    public function stats(int $studentId)
    {
        $records = AttendanceRecord::where('student_id', $studentId)->get();
        $total   = $records->count();
        $present = $records->where('status', 'present')->count();
        $absent  = $records->where('status', 'absent')->count();
        $late    = $records->where('status', 'late')->count();
        $excused = $records->where('status', 'excused')->count();

        return response()->json([
            'total'   => $total,
            'present' => $present,
            'absent'  => $absent,
            'late'    => $late,
            'excused' => $excused,
            'rate'    => $total > 0 ? round(($present + $late) / $total * 100) : 100,
        ]);
    }
}
