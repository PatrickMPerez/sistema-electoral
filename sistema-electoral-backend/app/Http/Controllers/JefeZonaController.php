<?php
namespace App\Http\Controllers;
use App\Models\JefeZona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JefeZonaController extends Controller
{
    public function index(): JsonResponse { return response()->json(JefeZona::all()); }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'cedula'          => 'required|string|max:20|unique:jefes_zona,cedula',
            'telefono'        => 'nullable|string|max:20',
        ]);
        return response()->json(JefeZona::create($data), 201);
    }

    public function update(Request $request, JefeZona $jefeZona): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'sometimes|string|max:255',
            'cedula'          => 'sometimes|string|max:20|unique:jefes_zona,cedula,' . $jefeZona->id,
            'telefono'        => 'nullable|string|max:20',
            'activo'          => 'sometimes|boolean',
        ]);
        $jefeZona->update($data);
        return response()->json($jefeZona);
    }
}
