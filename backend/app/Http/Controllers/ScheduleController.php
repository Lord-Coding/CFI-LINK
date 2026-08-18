<?php

namespace App\Http\Controllers;

use App\Models\ScheduleEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = ScheduleEntry::query();

        // Filtre automatique pour les étudiants
        if ($user->isStudent()) {
            $query->where('filiere', $user->filiere)->where('annee', $user->annee);
            if ($user->filiere === 'LIC' && $user->annee === 'L3' && $user->option_lic) {
                $query->where(fn($q) => $q->whereNull('option_lic')->orWhere('option_lic', $user->option_lic));
            }
        } elseif ($user->isProfessor()) {
            $query->where('teacher_id', $user->id);
        }

        // Filtres manuels (admin)
        if ($request->has('filiere'))   $query->where('filiere', $request->filiere);
        if ($request->has('annee'))     $query->where('annee', $request->annee);
        if ($request->has('option_lic')) $query->where('option_lic', $request->option_lic);

        return response()->json($query->orderBy('day')->orderBy('hour')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'day'        => 'required|string',
            'hour'       => 'required|string',
            'subject'    => 'required|string|max:255',
            'room'       => 'nullable|string|max:100',
            'teacher'    => 'nullable|string|max:255',
            'teacher_id' => 'nullable|exists:users,id',
            'filiere'    => ['required', Rule::in(['LIC', 'LAP'])],
            'annee'      => ['required', Rule::in(['L1', 'L2', 'L3'])],
            'option_lic' => ['nullable', Rule::in(['GL', 'SR'])],
            'color'      => 'nullable|string|max:100',
        ]);

        return response()->json(ScheduleEntry::create($data), 201);
    }

    public function update(Request $request, ScheduleEntry $scheduleEntry)
    {
        $data = $request->validate([
            'day'        => 'sometimes|string',
            'hour'       => 'sometimes|string',
            'subject'    => 'sometimes|string|max:255',
            'room'       => 'sometimes|nullable|string',
            'teacher'    => 'sometimes|nullable|string',
            'teacher_id' => 'sometimes|nullable|exists:users,id',
            'color'      => 'sometimes|nullable|string',
        ]);

        $scheduleEntry->update($data);
        return response()->json($scheduleEntry);
    }

    public function destroy(ScheduleEntry $scheduleEntry)
    {
        $scheduleEntry->delete();
        return response()->json(['message' => 'Entrée supprimée.']);
    }
}
