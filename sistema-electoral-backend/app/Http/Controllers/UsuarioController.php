<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreUsuarioRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::with(['zona','jefeZona','coordinador','veedor'])->get());
    }

    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'username'       => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'role'           => 'sometimes|in:administrador,jefe_zona,coordinador,vedor',
            'activo'         => 'sometimes|boolean',
            'zona_id'        => 'nullable|exists:zonas,id',
            'jefe_zona_id'   => 'nullable|exists:jefes_zona,id',
            'coordinador_id' => 'nullable|exists:coordinadores,id',
            'veedor_id'      => 'nullable|exists:veedores,id',
            'mesa'           => 'nullable|string|max:20',
        ]);
        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }
        $user->update($data);
        return response()->json($user);
    }
}
