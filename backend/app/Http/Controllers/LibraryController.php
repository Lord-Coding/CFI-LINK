<?php

namespace App\Http\Controllers;

use App\Models\LibraryItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $query = LibraryItem::with('addedBy:id,nom_complet');

        if ($request->has('search')) {
            $q = $request->search;
            $query->where(fn($sq) => $sq
                ->where('title',       'like', "%$q%")
                ->orWhere('author',    'like', "%$q%")
                ->orWhere('description','like', "%$q%")
            );
        }

        if ($request->has('filiere'))  $query->where('filiere', $request->filiere);
        if ($request->has('category')) $query->where('category', $request->category);

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'author'      => 'required|string|max:255',
            'category'    => ['required', Rule::in(['book','article','thesis','guide','manual'])],
            'filiere'     => 'nullable|string',
            'description' => 'nullable|string',
            'file_type'   => ['required', Rule::in(['pdf','doc','video'])],
            'size'        => 'nullable|string',
            'file_url'    => 'nullable|string',
        ]);

        $item = LibraryItem::create([...$data, 'added_by' => $request->user()->id]);

        return response()->json($item, 201);
    }

    public function incrementDownload(LibraryItem $libraryItem)
    {
        $libraryItem->increment('downloads');
        return response()->json(['downloads' => $libraryItem->downloads]);
    }

    public function destroy(LibraryItem $libraryItem)
    {
        $libraryItem->delete();
        return response()->json(['message' => 'Élément supprimé.']);
    }
}
