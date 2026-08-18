<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CalendarEventController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = CalendarEvent::where(fn($q) => $q
            ->whereNull('target_role')
            ->orWhere('target_role', 'all')
            ->orWhere('target_role', $user->role)
        );

        if ($request->boolean('upcoming')) {
            $query->where('date', '>=', now()->toDateString())
                  ->where('date', '<=', now()->addDays(30)->toDateString());
        }

        return response()->json($query->orderBy('date')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date_format:Y-m-d',
            'time'        => 'nullable|date_format:H:i',
            'type'        => ['required', Rule::in(['exam','deadline','event','holiday','meeting'])],
            'target_role' => 'nullable|string',
        ]);

        $event = CalendarEvent::create([...$data, 'created_by' => $request->user()->id]);

        return response()->json($event, 201);
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'date'        => 'sometimes|date_format:Y-m-d',
            'time'        => 'sometimes|nullable|date_format:H:i',
            'type'        => ['sometimes', Rule::in(['exam','deadline','event','holiday','meeting'])],
            'target_role' => 'sometimes|nullable|string',
        ]);

        $calendarEvent->update($data);
        return response()->json($calendarEvent);
    }

    public function destroy(CalendarEvent $calendarEvent)
    {
        $calendarEvent->delete();
        return response()->json(['message' => 'Événement supprimé.']);
    }
}
