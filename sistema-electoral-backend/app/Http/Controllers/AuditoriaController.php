<?php
namespace App\Http\Controllers;
use App\Models\Auditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Auditoria::with('usuario');

        if ($request->filled('tabla'))      $query->where('tabla_afectada', $request->tabla);
        if ($request->filled('accion'))     $query->where('accion', $request->accion);
        if ($request->filled('usuario_id')) $query->where('usuario_id', $request->usuario_id);
        if ($request->filled('desde'))      $query->where('created_at', '>=', $request->desde);
        if ($request->filled('hasta'))      $query->where('created_at', '<=', $request->hasta);

        return response()->json($query->orderByDesc('created_at')->paginate(100));
    }
}
