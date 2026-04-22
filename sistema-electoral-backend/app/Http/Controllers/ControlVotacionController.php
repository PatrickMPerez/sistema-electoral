<?php
namespace App\Http\Controllers;
use App\Http\Requests\MarcarVotoRequest;
use App\Models\MarcacionVoto;
use App\Models\Votante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControlVotacionController extends Controller
{
    public function buscar(Request $request): JsonResponse
    {
        $request->validate([
            'numero_orden' => 'nullable|integer',
            'cedula'       => 'nullable|string',
            'mesa'         => 'required|string',
        ]);

        if (! $request->filled('numero_orden') && ! $request->filled('cedula')) {
            return response()->json(['message' => 'Ingrese el número de orden o la cédula.'], 422);
        }

        $user       = $request->user();
        $mesaVeedor = $user->mesa ?? $request->mesa;

        $query = Votante::with(['zona', 'localVotacion', 'coordinador', 'marcaciones.usuarioVeedor']);

        if ($request->filled('cedula')) {
            // Buscar por cédula (único en todo el padrón)
            $votante = $query->where('cedula', $request->cedula)->first();
        } else {
            // Buscar por número de orden + mesa (el orden se repite entre mesas)
            $votante = $query->where('numero_orden', $request->numero_orden)
                             ->where('mesa', $mesaVeedor)
                             ->first();
        }

        // Si se ingresaron ambos campos, validar que coincidan
        if ($request->filled('numero_orden') && $request->filled('cedula') && $votante) {
            if ((string) $votante->numero_orden !== (string) $request->numero_orden) {
                return response()->json(['message' => 'La cédula no corresponde a ese número de orden.'], 422);
            }
        }

        if (! $votante) {
            return response()->json(['message' => 'Votante no encontrado.'], 404);
        }

        if ((string) $votante->mesa !== (string) $mesaVeedor) {
            return response()->json([
                'message' => "Este votante pertenece a la Mesa {$votante->mesa}. Verifique que ingresó su mesa correctamente.",
                'code'    => 'mesa_incorrecta',
            ], 403);
        }

        $response = [
            'id'              => $votante->id,
            'nombre_completo' => $votante->nombre_completo,
            'nombres'         => $votante->nombres,
            'apellidos'       => $votante->apellidos,
            'cedula'          => $votante->cedula,
            'numero_orden'    => $votante->numero_orden,
            'mesa'            => $votante->mesa,
            'departamento'    => $votante->departamento,
            'distrito'        => $votante->distrito,
            'seccional'       => $votante->seccional,
            'estado_votacion' => $votante->estado_votacion,
            'zona'            => $votante->zona
                ? ['id' => $votante->zona->id, 'nombre_zona' => $votante->zona->nombre_zona]
                : null,
            'local_votacion'  => $votante->localVotacion
                ? ['id' => $votante->localVotacion->id, 'nombre_local' => $votante->localVotacion->nombre_local]
                : null,
        ];

        if ($votante->yaVoto()) {
            $marcacion               = $votante->marcaciones->last();
            $response['marcado_por'] = $marcacion?->usuarioVeedor?->name;
            $response['marcado_en']  = $marcacion?->fecha_hora_marcacion;
        }

        return response()->json($response);
    }

    public function marcar(MarcarVotoRequest $request): JsonResponse
    {
        $user       = $request->user();
        $mesaVeedor = $user->mesa ?? $request->mesa;

        $votante = Votante::where('cedula', $request->cedula)->first();

        if (! $votante) {
            return response()->json(['message' => 'Votante no encontrado.'], 404);
        }

        if ((string) $votante->mesa !== (string) $mesaVeedor) {
            return response()->json([
                'message' => "Este votante no pertenece a la Mesa {$mesaVeedor}.",
                'code'    => 'mesa_incorrecta',
            ], 403);
        }

        if ($votante->yaVoto()) {
            $marcacion = $votante->marcaciones()->with('usuarioVeedor')->latest()->first();
            return response()->json([
                'message'     => 'Este votante ya fue marcado.',
                'marcado_por' => $marcacion?->usuarioVeedor?->name,
                'marcado_en'  => $marcacion?->fecha_hora_marcacion,
            ], 409);
        }

        $votante->update(['estado_votacion' => 'ya_voto']);

        MarcacionVoto::create([
            'votante_id'           => $votante->id,
            'numero_orden'         => $votante->numero_orden,
            'fecha_hora_marcacion' => now(),
            'usuario_veedor_id'    => $user->id,
            'mesa'                 => $mesaVeedor,
            'observacion'          => $request->observacion,
            'ip_address'           => $request->ip(),
        ]);

        return response()->json(['message' => 'Voto registrado correctamente.'], 201);
    }
}
