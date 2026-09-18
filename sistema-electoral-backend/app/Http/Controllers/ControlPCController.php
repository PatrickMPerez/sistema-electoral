<?php
namespace App\Http\Controllers;
use App\Http\Requests\MarcarPCRequest;
use App\Models\MarcacionPC;
use App\Models\Votante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControlPCController extends Controller
{
    public function buscar(Request $request): JsonResponse
    {
        $request->validate(['cedula' => 'required|string']);

        $votante = Votante::where('cedula', $request->cedula)->first();

        if (! $votante) {
            return response()->json(['message' => 'Votante no encontrado.'], 404);
        }

        $response = [
            'id'              => $votante->id,
            'nombre_completo' => $votante->nombre_completo,
            'nombres'         => $votante->nombres,
            'apellidos'       => $votante->apellidos,
            'cedula'          => $votante->cedula,
            'numero_orden'    => $votante->numero_orden,
            'mesa'            => $votante->mesa,
            'paso_por_pc'     => (bool) $votante->paso_por_pc,
            'estado_votacion' => $votante->estado_votacion,
        ];

        if ($votante->paso_por_pc) {
            $marcacion               = $votante->marcacionesPC()->with('usuarioPc')->latest('fecha_hora_marcacion')->first();
            $response['marcado_por'] = $marcacion?->usuarioPc?->name;
            $response['marcado_en']  = $marcacion?->fecha_hora_marcacion;
        }

        return response()->json($response);
    }

    public function marcar(MarcarPCRequest $request): JsonResponse
    {
        $votante = Votante::where('cedula', $request->cedula)->first();

        if (! $votante) {
            return response()->json(['message' => 'Votante no encontrado.'], 404);
        }

        if ($votante->paso_por_pc) {
            $marcacion = $votante->marcacionesPC()->with('usuarioPc')->latest('fecha_hora_marcacion')->first();
            return response()->json([
                'message'     => 'Este votante ya pasó por el Puesto de Comando.',
                'marcado_por' => $marcacion?->usuarioPc?->name,
                'marcado_en'  => $marcacion?->fecha_hora_marcacion,
            ], 422);
        }

        $votante->update(['paso_por_pc' => true]);

        MarcacionPC::create([
            'votante_id'           => $votante->id,
            'fecha_hora_marcacion' => now(),
            'usuario_pc_id'        => $request->user()->id,
            'premio_entregado'     => $request->boolean('premio_entregado', true),
            'ip_address'           => $request->ip(),
        ]);

        return response()->json(['message' => 'Paso por Puesto de Comando registrado correctamente.'], 201);
    }

    /**
     * Listado de electores para consulta en tiempo real.
     * Filtros: estado (pendiente|paso_pc), buscar (nombre/apellido/cédula).
     */
    public function listado(Request $request): JsonResponse
    {
        $query = Votante::query()
            ->when($request->estado === 'pendiente', fn($q) => $q->where('paso_por_pc', false))
            ->when($request->estado === 'paso_pc',   fn($q) => $q->where('paso_por_pc', true))
            ->when($request->filled('buscar'), function ($q) use ($request) {
                $t = '%' . $request->buscar . '%';
                $q->where(fn($w) => $w
                    ->where('nombres', 'like', $t)
                    ->orWhere('apellidos', 'like', $t)
                    ->orWhere('nombre_completo', 'like', $t)
                    ->orWhere('cedula', 'like', $t));
            })
            ->orderBy('apellidos')
            ->orderBy('nombres');

        $paginado = $query->paginate($request->integer('per_page', 50));

        $paginado->getCollection()->transform(fn($v) => [
            'id'              => $v->id,
            'nombre_completo' => $v->nombre_completo,
            'cedula'          => $v->cedula,
            'numero_orden'    => $v->numero_orden,
            'mesa'            => $v->mesa,
            'paso_por_pc'     => (bool) $v->paso_por_pc,
            'estado_votacion' => $v->estado_votacion,
        ]);

        return response()->json($paginado);
    }
}
