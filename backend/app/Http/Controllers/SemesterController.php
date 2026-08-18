<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SemesterController extends Controller
{
    public function __construct(private AuditService $audit) {}

    public function index()
    {
        return response()->json(Semester::orderByDesc('year')->orderBy('type')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:50',
            'year'       => 'required|string|max:9',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
            'is_active'  => 'boolean',
            'type'       => ['required', Rule::in(['S1','S2','S3','S4','S5','S6'])],
        ]);

        $semester = Semester::create($data);
        $this->audit->log($request->user(), 'Création semestre', "Semestre {$semester->name} créé", 'system');

        return response()->json($semester, 201);
    }

    public function update(Request $request, Semester $semester)
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:50',
            'year'       => 'sometimes|string|max:9',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date',
            'is_active'  => 'sometimes|boolean',
            'type'       => ['sometimes', Rule::in(['S1','S2','S3','S4','S5','S6'])],
        ]);

        $semester->update($data);
        return response()->json($semester);
    }

    public function setActive(Request $request, Semester $semester)
    {
        Semester::query()->update(['is_active' => false]);
        $semester->update(['is_active' => true]);
        $this->audit->log($request->user(), 'Activation semestre', "Semestre {$semester->name} activé", 'system');

        return response()->json($semester);
    }

    public function destroy(Semester $semester)
    {
        $semester->delete();
        return response()->json(['message' => 'Semestre supprimé.']);
    }
}
