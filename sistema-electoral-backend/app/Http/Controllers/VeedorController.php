<?php

namespace App\Http\Controllers;

use App\Models\Veedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VeedorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Veedor::query();
        if (! $request->boolean('todos')) {
            $query->where('activo', true);
        }
        return response()->json($query->orderBy('nombre_completo')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'cedula'          => 'required|string|max:20|unique:veedores,cedula',
            'telefono'        => 'nullable|string|max:20',
            'mesa'            => 'nullable|string|max:20',
        ]);
        return response()->json(Veedor::create($data), 201);
    }

    public function update(Request $request, Veedor $veedor): JsonResponse
    {
        $data = $request->validate([
            'nombre_completo' => 'sometimes|string|max:255',
            'cedula'          => 'sometimes|string|max:20|unique:veedores,cedula,' . $veedor->id,
            'telefono'        => 'nullable|string|max:20',
            'mesa'            => 'nullable|string|max:20',
            'activo'          => 'sometimes|boolean',
        ]);
        $veedor->update($data);
        return response()->json($veedor);
    }
}
