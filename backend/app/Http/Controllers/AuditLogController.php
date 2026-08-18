<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,nom_complet')->orderByDesc('created_at');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        if ($request->has('search')) {
            $query->where(fn($q) => $q
                ->where('action',  'like', "%{$request->search}%")
                ->orWhere('details','like', "%{$request->search}%")
            );
        }

        return response()->json($query->limit(500)->get());
    }
}
