<?php
namespace App\Http\Controllers;
use App\Models\Movimiento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovimientoController extends Controller
{
    public function index(): JsonResponse { return response()->json(Movimiento::all()); }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_movimiento' => 'required|string|max:255',
            'nombre_candidato'  => 'required|string|max:255',
            'lista'             => 'nullable|string|max:20',
            'partido'           => 'nullable|string|max:255',
        ]);
        return response()->json(Movimiento::create($data), 201);
    }

    public function update(Request $request, Movimiento $movimiento): JsonResponse
    {
        $data = $request->validate([
            'nombre_movimiento' => 'sometimes|string|max:255',
            'nombre_candidato'  => 'sometimes|string|max:255',
            'lista'             => 'nullable|string|max:20',
            'partido'           => 'nullable|string|max:255',
            'activo'            => 'sometimes|boolean',
        ]);
        $movimiento->update($data);
        return response()->json($movimiento);
    }
}
