<?php
namespace App\Http\Controllers;

use App\Exports\ReporteExport;
use App\Models\Coordinador;
use App\Models\LocalVotacion;
use App\Models\MarcacionVoto;
use App\Models\Votante;
use App\Models\Zona;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ReportesController extends Controller
{
    // ──────────────────────────────────────────────────────────────
    // OPERATIVOS DEL DÍA D
    // ──────────────────────────────────────────────────────────────

    /**
     * Avance por coordinador.
     * Roles: admin (todos), jefe_zona (su zona), coordinador (solo él).
     * GET /reportes/por-coordinador
     */
    public function porCoordinador(Request $request): JsonResponse
    {
        $user = $request->user();

        $coordinadores = Coordinador::with('zona')
            ->when($user->isJefeZona(),    fn($q) => $q->where('zona_id', $user->zona_id))
            ->when($user->isCoordinador(), fn($q) => $q->where('id', $user->coordinador_id))
            ->withCount([
                'votantes',
                'votantes as ya_votaron' => fn($q) => $q->where('estado_votacion', 'ya_voto'),
            ])
            ->get()
            ->map(fn($c) => [
                'coordinador' => $c->nombre_completo,
                'zona'        => $c->zona?->nombre_zona,
                'total'       => $c->votantes_count,
                'ya_votaron'  => $c->ya_votaron,
                'pendientes'  => $c->votantes_count - $c->ya_votaron,
                'porcentaje'  => $c->votantes_count > 0
                    ? round(($c->ya_votaron / $c->votantes_count) * 100, 2)
                    : 0,
            ])
            ->sortBy('porcentaje')
            ->values();

        return response()->json($coordinadores);
    }

    /**
     * Avance por local de votación.
     * Roles: admin (todos), jefe_zona (su zona).
     * GET /reportes/por-local
     */
    public function porLocal(Request $request): JsonResponse
    {
        $user = $request->user();

        $locales = LocalVotacion::with('zona')
            ->when($user->isJefeZona(), fn($q) => $q->where('zona_id', $user->zona_id))
            ->withCount([
                'votantes',
                'votantes as ya_votaron' => fn($q) => $q->where('estado_votacion', 'ya_voto'),
            ])
            ->get()
            ->map(fn($l) => [
                'local'      => $l->nombre_local,
                'localidad'  => $l->localidad,
                'zona'       => $l->zona?->nombre_zona,
                'total'      => $l->votantes_count,
                'ya_votaron' => $l->ya_votaron,
                'pendientes' => $l->votantes_count - $l->ya_votaron,
                'porcentaje' => $l->votantes_count > 0
                    ? round(($l->ya_votaron / $l->votantes_count) * 100, 2)
                    : 0,
            ])
            ->sortByDesc('pendientes')
            ->values();

        return response()->json($locales);
    }

    /**
     * Velocidad de marcación por hora (solo día D).
     * Roles: solo admin.
     * GET /reportes/velocidad-por-hora
     */
    public function velocidadPorHora(): JsonResponse
    {
        $marcaciones = MarcacionVoto::selectRaw(
            'HOUR(fecha_hora_marcacion) as hora, COUNT(*) as total_hora'
        )
            ->groupByRaw('HOUR(fecha_hora_marcacion)')
            ->orderBy('hora')
            ->get();

        $totalGlobal = $marcaciones->sum('total_hora');
        $acumulado   = 0;

        $porHora = $marcaciones->map(function ($m) use (&$acumulado, $totalGlobal) {
            $acumulado += $m->total_hora;
            return [
                'hora'        => sprintf('%02d:00 - %02d:00', $m->hora, $m->hora + 1),
                'marcaciones' => $m->total_hora,
                'acumulado'   => $acumulado,
                'porcentaje'  => $totalGlobal > 0
                    ? round(($acumulado / $totalGlobal) * 100, 2)
                    : 0,
            ];
        });

        return response()->json([
            'total_marcaciones' => $totalGlobal,
            'por_hora'          => $porHora,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // PADRÓN INTERNO (exportable Excel)
    // ──────────────────────────────────────────────────────────────

    /**
     * Padrón completo exportable.
     * Roles: solo admin.
     * GET /reportes/padron-completo[?exportar=1&zona_id=&coordinador_id=&local_id=&estado=]
     */
    public function padronCompleto(Request $request)
    {
        $query = Votante::with(['zona', 'coordinador', 'localVotacion'])
            ->when($request->filled('zona_id'),        fn($q) => $q->where('zona_id', $request->zona_id))
            ->when($request->filled('coordinador_id'), fn($q) => $q->where('coordinador_id', $request->coordinador_id))
            ->when($request->filled('local_id'),       fn($q) => $q->where('local_votacion_id', $request->local_id))
            ->when($request->filled('estado'),         fn($q) => $q->where('estado_votacion', $request->estado))
            ->orderBy('numero_orden');

        if ($request->boolean('exportar')) {
            $data = $query->get()->map(fn($v) => collect([
                $v->nombres,
                $v->apellidos,
                $v->cedula,
                $v->telefono,
                $v->departamento,
                $v->distrito,
                $v->seccional,
                $v->localVotacion?->nombre_local,
                $v->mesa,
                $v->numero_orden,
                $v->zona?->nombre_zona,
                $v->coordinador_id,
                $v->coordinador?->nombre_completo,
                $v->jefe_zona_id,
                $v->estado_votacion === 'ya_voto' ? 'Votó' : 'Pendiente',
            ]));

            return Excel::download(
                new ReporteExport($data, [
                    'Nombres', 'Apellidos', 'Cédula', 'Teléfono',
                    'Departamento', 'Distrito', 'Seccional',
                    'Local de Votación', 'Mesa', 'N° Orden',
                    'Zona', 'ID Coordinador', 'Coordinador', 'ID Jefe Zonal', 'Estado',
                ]),
                'padron-completo.xlsx'
            );
        }

        return response()->json($query->paginate(100));
    }

    /**
     * Padrón por zona (exportable Excel).
     * Roles: admin (cualquier zona), jefe_zona (solo su zona).
     * GET /reportes/padron-zona/{zona_id}[?exportar=1]
     */
    public function padronZona(Request $request, int $zona_id)
    {
        $user = $request->user();

        if ($user->isJefeZona() && $user->zona_id !== $zona_id) {
            return response()->json(['error' => 'Sin acceso a esta zona.'], 403);
        }

        $query = Votante::with(['coordinador', 'localVotacion'])
            ->where('zona_id', $zona_id)
            ->orderBy('numero_orden');

        if ($request->boolean('exportar')) {
            $data = $query->get()->map(fn($v) => collect([
                $v->nombres,
                $v->apellidos,
                $v->cedula,
                $v->telefono,
                $v->departamento,
                $v->distrito,
                $v->seccional,
                $v->localVotacion?->nombre_local,
                $v->mesa,
                $v->numero_orden,
                $v->coordinador_id,
                $v->coordinador?->nombre_completo,
                $v->jefe_zona_id,
                $v->estado_votacion === 'ya_voto' ? 'Votó' : 'Pendiente',
            ]));

            return Excel::download(
                new ReporteExport($data, [
                    'Nombres', 'Apellidos', 'Cédula', 'Teléfono',
                    'Departamento', 'Distrito', 'Seccional',
                    'Local de Votación', 'Mesa', 'N° Orden',
                    'ID Coordinador', 'Coordinador', 'ID Jefe Zonal', 'Estado',
                ]),
                "padron-zona-{$zona_id}.xlsx"
            );
        }

        return response()->json($query->paginate(100));
    }

    /**
     * Padrón por coordinador (exportable Excel).
     * Roles: admin (cualquier coordinador), coordinador (solo el suyo).
     * GET /reportes/padron-coordinador/{id}[?exportar=1]
     */
    public function padronCoordinador(Request $request, int $id)
    {
        $user = $request->user();

        if ($user->isCoordinador() && $user->coordinador_id !== $id) {
            return response()->json(['error' => 'Sin acceso a este coordinador.'], 403);
        }

        $query = Votante::with(['localVotacion'])
            ->where('coordinador_id', $id)
            ->orderBy('numero_orden');

        if ($request->boolean('exportar')) {
            $data = $query->get()->map(fn($v) => collect([
                $v->nombres,
                $v->apellidos,
                $v->cedula,
                $v->telefono,
                $v->departamento,
                $v->distrito,
                $v->seccional,
                $v->localVotacion?->nombre_local,
                $v->mesa,
                $v->numero_orden,
                $v->coordinador_id,
                $v->jefe_zona_id,
                $v->estado_votacion === 'ya_voto' ? 'Votó' : 'Pendiente',
            ]));

            return Excel::download(
                new ReporteExport($data, [
                    'Nombres', 'Apellidos', 'Cédula', 'Teléfono',
                    'Departamento', 'Distrito', 'Seccional',
                    'Local de Votación', 'Mesa', 'N° Orden',
                    'ID Coordinador', 'ID Jefe Zonal', 'Estado',
                ]),
                "padron-coordinador-{$id}.xlsx"
            );
        }

        return response()->json($query->paginate(100));
    }

    // ──────────────────────────────────────────────────────────────
    // DETECCIÓN DE DATOS SIMILARES
    // ──────────────────────────────────────────────────────────────

    /**
     * Detecta teléfonos duplicados y nombres con sonido similar (SOUNDEX).
     * Roles: solo admin.
     * GET /reportes/datos-similares
     */
    public function datosSimilares(): JsonResponse
    {
        $telefonosDuplicados = DB::select("
            SELECT
                v1.nombre_completo  AS votante_1,
                v2.nombre_completo  AS votante_2,
                'telefono'          AS campo_similar,
                v1.telefono         AS valor,
                c1.nombre_completo  AS coordinador_a,
                c2.nombre_completo  AS coordinador_b
            FROM votantes v1
            JOIN votantes v2
                ON v1.id < v2.id
               AND v1.telefono = v2.telefono
               AND v1.telefono IS NOT NULL
               AND v1.telefono != ''
            LEFT JOIN coordinadores c1 ON c1.id = v1.coordinador_id
            LEFT JOIN coordinadores c2 ON c2.id = v2.coordinador_id
            LIMIT 300
        ");

        $nombresSimilares = DB::select("
            SELECT
                v1.nombre_completo              AS votante_1,
                v2.nombre_completo              AS votante_2,
                'nombre'                        AS campo_similar,
                SOUNDEX(v1.nombre_completo)     AS valor,
                c1.nombre_completo              AS coordinador_a,
                c2.nombre_completo              AS coordinador_b
            FROM votantes v1
            JOIN votantes v2
                ON v1.id < v2.id
               AND v1.cedula != v2.cedula
               AND SOUNDEX(v1.nombre_completo) = SOUNDEX(v2.nombre_completo)
            LEFT JOIN coordinadores c1 ON c1.id = v1.coordinador_id
            LEFT JOIN coordinadores c2 ON c2.id = v2.coordinador_id
            LIMIT 300
        ");

        return response()->json([
            'telefonos_duplicados' => $telefonosDuplicados,
            'nombres_similares'    => $nombresSimilares,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // AUDITORÍA
    // ──────────────────────────────────────────────────────────────

    /**
     * Registro detallado de marcaciones de voto.
     * Roles: solo admin.
     * GET /reportes/marcaciones[?desde=&hasta=]
     */
    public function marcaciones(Request $request): JsonResponse
    {
        $paginated = MarcacionVoto::with(['votante', 'usuarioVeedor'])
            ->when($request->filled('desde'), fn($q) => $q->where('fecha_hora_marcacion', '>=', $request->desde))
            ->when($request->filled('hasta'), fn($q) => $q->where('fecha_hora_marcacion', '<=', $request->hasta))
            ->orderByDesc('fecha_hora_marcacion')
            ->paginate(100);

        $result = $paginated->through(fn($m) => [
            'numero_orden'   => $m->numero_orden,
            'nombre_votante' => $m->votante?->nombre_completo,
            'veedor'         => $m->usuarioVeedor?->name,
            'mesa'           => $m->mesa,
            'fecha_hora'     => $m->fecha_hora_marcacion?->format('d/m/Y H:i:s'),
            'observacion'    => $m->observacion,
        ]);

        return response()->json($result);
    }

    // ──────────────────────────────────────────────────────────────
    // GESTIÓN Y CONFIGURACIÓN
    // ──────────────────────────────────────────────────────────────

    /**
     * Árbol completo: zonas → jefes → coordinadores → conteos de votantes.
     * Roles: solo admin.
     * GET /reportes/estructura
     */
    public function estructura(): JsonResponse
    {
        $rows = DB::table('zonas as z')
            ->leftJoin('jefes_zona as jz', 'jz.id', '=', 'z.jefe_zona_id')
            ->leftJoin('coordinadores as c', 'c.zona_id', '=', 'z.id')
            ->leftJoin('votantes as v', 'v.coordinador_id', '=', 'c.id')
            ->selectRaw('
                z.id           AS zona_id,
                z.nombre_zona,
                jz.nombre_completo                                            AS jefe_zona,
                c.id           AS coord_id,
                c.nombre_completo                                             AS coordinador,
                COUNT(v.id)                                                   AS total_votantes,
                SUM(CASE WHEN v.estado_votacion = "ya_voto" THEN 1 ELSE 0 END) AS ya_votaron
            ')
            ->groupBy('z.id', 'z.nombre_zona', 'jz.nombre_completo', 'c.id', 'c.nombre_completo')
            ->orderBy('z.nombre_zona')
            ->get();

        $zonas = $rows->groupBy('zona_id')->map(function ($group) {
            $first = $group->first();
            return [
                'zona'          => $first->nombre_zona,
                'jefe_zona'     => $first->jefe_zona,
                'coordinadores' => $group
                    ->filter(fn($r) => $r->coord_id !== null)
                    ->map(fn($r) => [
                        'coordinador'    => $r->coordinador,
                        'total_votantes' => (int) $r->total_votantes,
                        'ya_votaron'     => (int) $r->ya_votaron,
                        'pendientes'     => (int) $r->total_votantes - (int) $r->ya_votaron,
                    ])->values(),
            ];
        })->values();

        return response()->json($zonas);
    }

    /**
     * Cuántos votantes registró cada usuario (digitador/coordinador).
     * Roles: solo admin.
     * GET /reportes/carga-por-usuario
     */
    public function cargaPorUsuario(): JsonResponse
    {
        $resultado = DB::table('votantes')
            ->join('users', 'votantes.usuario_carga_id', '=', 'users.id')
            ->selectRaw('
                users.id,
                users.name              AS usuario,
                users.role              AS rol,
                COUNT(*)                AS votantes_cargados,
                MIN(votantes.created_at) AS primera_carga,
                MAX(votantes.created_at) AS ultima_carga
            ')
            ->groupBy('users.id', 'users.name', 'users.role')
            ->orderByDesc('votantes_cargados')
            ->get()
            ->map(fn($r) => [
                'usuario'           => $r->usuario,
                'rol'               => $r->rol,
                'votantes_cargados' => $r->votantes_cargados,
                'primera_carga'     => $r->primera_carga,
                'ultima_carga'      => $r->ultima_carga,
            ]);

        return response()->json($resultado);
    }
}
