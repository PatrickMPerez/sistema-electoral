<?php
namespace App\Http\Controllers;
use App\Models\Coordinador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoordinadorController extends Controller
{
    public function index(): JsonResponse { return response()->json(Coordinador::with(['zona','jefeZona'])->get()); }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'cedula'          => 'required|string|max:20|unique:coordinadores,cedula',
            'telefono'        => 'nullable|string|max:20',
            'zona_id'         => 'required|exists:zonas,id',
            'jefe_zona_id'    => 'nullable|exists:jefes_zona,id',
        ]);
        return response()->json(Coordinador::create($data)->load(['zona','jefeZona']), 201);
    }

    public function update(Request $request, Coordinador $coordinador): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'sometimes|string|max:255',
            'cedula'          => 'sometimes|string|max:20|unique:coordinadores,cedula,' . $coordinador->id,
            'telefono'        => 'nullable|string|max:20',
            'zona_id'         => 'sometimes|exists:zonas,id',
            'jefe_zona_id'    => 'nullable|exists:jefes_zona,id',
            'activo'          => 'sometimes|boolean',
        ]);
        $coordinador->update($data);
        return response()->json($coordinador);
    }
}
