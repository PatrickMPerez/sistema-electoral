<?php
namespace App\Http\Controllers;
use App\Models\Coordinador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CoordinadorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Coordinador::with(['jefeZona']);
        if (! $request->boolean('todos')) {
            $query->where('activo', true);
        }
        if ($user && $user->role === 'jefe_zona' && $user->jefe_zona_id) {
            $query->where('jefe_zona_id', $user->jefe_zona_id);
        }
        return response()->json($query->orderBy('nombre_completo')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'cedula'          => 'required|string|max:20|unique:coordinadores,cedula',
            'telefono'        => 'nullable|string|max:20',
            'jefe_zona_id'    => 'required|exists:jefes_zona,id',
        ]);
        return response()->json(Coordinador::create($data)->load(['jefeZona']), 201);
    }

    public function update(Request $request, Coordinador $coordinador): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'sometimes|string|max:255',
            'cedula'          => 'sometimes|string|max:20|unique:coordinadores,cedula,' . $coordinador->id,
            'telefono'        => 'nullable|string|max:20',
            'jefe_zona_id'    => 'sometimes|required|exists:jefes_zona,id',
            'activo'          => 'sometimes|boolean',
        ]);
        $coordinador->update($data);
        return response()->json($coordinador->load(['jefeZona']));
    }
}
