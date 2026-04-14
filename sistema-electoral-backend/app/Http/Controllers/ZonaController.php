<?php
namespace App\Http\Controllers;
use App\Models\Zona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZonaController extends Controller
{
    public function index(): JsonResponse { return response()->json(Zona::with('jefeZona')->get()); }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_zona'  => 'required|string|max:255',
            'jefe_zona_id' => 'nullable|exists:jefes_zona,id',
        ]);
        return response()->json(Zona::create($data), 201);
    }

    public function update(Request $request, Zona $zona): JsonResponse
    {
        $data = $request->validate([
            'nombre_zona'  => 'sometimes|string|max:255',
            'jefe_zona_id' => 'nullable|exists:jefes_zona,id',
            'activo'       => 'sometimes|boolean',
        ]);
        $zona->update($data);
        return response()->json($zona);
    }
}
