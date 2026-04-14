<?php
namespace App\Http\Controllers;
use App\Http\Requests\MarcarVotoRequest;
use App\Models\MarcacionVoto;
use App\Models\Votante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ControlVotacionController extends Controller
{
    public function buscar(string $numeroOrden): JsonResponse
    {
        $votante = Votante::with(['zona', 'localVotacion', 'coordinador', 'marcaciones.usuarioVeedor'])
            ->where('numero_orden', $numeroOrden)
            ->orWhere('cedula', $numeroOrden)
            ->first();

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
            'departamento'    => $votante->departamento,
            'distrito'        => $votante->distrito,
            'seccional'       => $votante->seccional,
            'estado_votacion' => $votante->estado_votacion,
            'zona'            => $votante->zona ? ['id' => $votante->zona->id, 'nombre_zona' => $votante->zona->nombre_zona] : null,
            'local_votacion'  => $votante->localVotacion ? ['id' => $votante->localVotacion->id, 'nombre_local' => $votante->localVotacion->nombre_local] : null,
        ];

        if ($votante->yaVoto()) {
            $marcacion = $votante->marcaciones->last();
            $response['marcado_por'] = $marcacion?->usuarioVeedor?->name;
            $response['marcado_en']  = $marcacion?->fecha_hora_marcacion;
        }

        return response()->json($response);
    }

    public function marcar(MarcarVotoRequest $request): JsonResponse
    {
        $votante = Votante::where('numero_orden', $request->numero_orden)->first();

        if (! $votante) {
            return response()->json(['message' => 'Votante no encontrado.'], 404);
        }

        if ($votante->yaVoto()) {
            $marcacion = $votante->marcaciones()->with('usuarioVeedor')->latest()->first();
            return response()->json([
                'message'    => 'Este votante ya fue marcado.',
                'marcado_por'=> $marcacion?->usuarioVeedor?->name,
                'marcado_en' => $marcacion?->fecha_hora_marcacion,
            ], 409);
        }

        $votante->update(['estado_votacion' => 'ya_voto']);

        MarcacionVoto::create([
            'votante_id'           => $votante->id,
            'numero_orden'         => $votante->numero_orden,
            'fecha_hora_marcacion' => now(),
            'usuario_veedor_id'    => $request->user()->id,
            'mesa'                 => $request->mesa,
            'observacion'          => $request->observacion,
            'ip_address'           => $request->ip(),
        ]);

        return response()->json(['message' => 'Voto registrado correctamente.'], 201);
    }
}
