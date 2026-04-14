<?php
namespace App\Http\Controllers;
use App\Models\LocalVotacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocalVotacionController extends Controller
{
    public function index(): JsonResponse { return response()->json(LocalVotacion::with('zona')->get()); }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_local' => 'required|string|max:255',
            'localidad'    => 'required|string|max:255',
            'direccion'    => 'nullable|string|max:255',
            'zona_id'      => 'required|exists:zonas,id',
        ]);
        return response()->json(LocalVotacion::create($data)->load('zona'), 201);
    }

    public function update(Request $request, LocalVotacion $localVotacion): JsonResponse
    {
        $data = $request->validate([
            'nombre_local' => 'sometimes|string|max:255',
            'localidad'    => 'sometimes|string|max:255',
            'direccion'    => 'nullable|string|max:255',
            'zona_id'      => 'sometimes|exists:zonas,id',
        ]);
        $localVotacion->update($data);
        return response()->json($localVotacion);
    }
}
