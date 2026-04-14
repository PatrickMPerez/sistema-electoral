<?php
namespace App\Http\Controllers;

use App\Exports\ReporteExport;
use App\Models\Votante;
use App\Models\Zona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class MonitoreoController extends Controller
{
    /**
     * Totales globales en tiempo real.
     * GET /monitoreo/resumen
     */
    public function resumen(Request $request): JsonResponse
    {
        $query = Votante::filtrarPorRol($request->user());

        $total      = (clone $query)->count();
        $yaVotaron  = (clone $query)->where('estado_votacion', 'ya_voto')->count();
        $pendientes = $total - $yaVotaron;
        $porcentaje = $total > 0 ? round(($yaVotaron / $total) * 100, 2) : 0;

        return response()->json([
            'total'               => $total,
            'ya_votaron'          => $yaVotaron,
            'pendientes'          => $pendientes,
            'porcentaje'          => $porcentaje,
            'ultima_actualizacion' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Faltantes (quienes aún no votaron).
     * Filtros opcionales: zona_id, coordinador_id, local_id.
     * ?exportar=1 devuelve Excel.
     * GET /monitoreo/faltantes
     */
    public function faltantes(Request $request)
    {
        $query = Votante::with(['zona', 'coordinador', 'localVotacion'])
            ->filtrarPorRol($request->user())
            ->where('estado_votacion', 'registrado')
            ->when($request->filled('zona_id'),        fn($q) => $q->where('zona_id', $request->zona_id))
            ->when($request->filled('coordinador_id'), fn($q) => $q->where('coordinador_id', $request->coordinador_id))
            ->when($request->filled('local_id'),       fn($q) => $q->where('local_votacion_id', $request->local_id))
            ->orderBy('numero_orden');

        if ($request->boolean('exportar')) {
            $data = $query->get()->map(fn($v) => collect([
                $v->nombre_completo,
                $v->telefono,
                $v->numero_orden,
                $v->localVotacion?->nombre_local,
                $v->zona?->nombre_zona,
                $v->coordinador?->nombre_completo,
                $v->coordinador?->telefono,
            ]));

            return Excel::download(
                new ReporteExport($data, ['Nombre', 'Teléfono', 'N° Orden', 'Local', 'Zona', 'Coordinador', 'Tel. Coordinador']),
                'faltantes.xlsx'
            );
        }

        return response()->json($query->paginate(100));
    }

    /**
     * Avance por zona.
     * El jefe_zona solo ve su propia zona.
     * ?exportar=1 devuelve Excel.
     * GET /monitoreo/por-zona
     */
    public function porZona(Request $request)
    {
        $user = $request->user();

        $zonas = Zona::withCount([
            'votantes',
            'votantes as ya_votaron' => fn($q) => $q->where('estado_votacion', 'ya_voto'),
        ])
            ->when($user->isJefeZona(), fn($q) => $q->where('id', $user->zona_id))
            ->with('jefeZona')
            ->get()
            ->map(fn($z) => [
                'nombre'      => $z->nombre_zona,
                'jefe_zona'   => $z->jefeZona?->nombre_completo,
                'total'       => $z->votantes_count,
                'ya_votaron'  => $z->ya_votaron,
                'pendientes'  => $z->votantes_count - $z->ya_votaron,
                'porcentaje'  => $z->votantes_count > 0
                    ? round(($z->ya_votaron / $z->votantes_count) * 100, 2)
                    : 0,
            ]);

        if ($request->boolean('exportar')) {
            return Excel::download(
                new ReporteExport($zonas, ['Zona', 'Jefe de Zona', 'Total Registrados', 'Ya Votaron', 'Pendientes', '% Avance']),
                'avance-por-zona.xlsx'
            );
        }

        return response()->json($zonas);
    }
}
