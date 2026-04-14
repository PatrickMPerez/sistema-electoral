<?php
namespace App\Http\Controllers;
use App\Http\Requests\StoreVotanteRequest;
use App\Http\Requests\UpdateVotanteRequest;
use App\Models\Auditoria;
use App\Models\Votante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\VotantesImport;

class VotanteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Votante::with(['zona', 'coordinador', 'jefeZona', 'localVotacion', 'movimiento'])
            ->filtrarPorRol($request->user());

        if ($request->filled('zona_id'))          $query->where('zona_id', $request->zona_id);
        if ($request->filled('coordinador_id'))   $query->where('coordinador_id', $request->coordinador_id);
        if ($request->filled('estado_votacion'))  $query->where('estado_votacion', $request->estado_votacion);
        if ($request->filled('departamento'))     $query->where('departamento', $request->departamento);
        if ($request->filled('distrito'))         $query->where('distrito', $request->distrito);
        if ($request->filled('buscar')) {
            $q = $request->buscar;
            $query->where(fn($w) => $w
                ->where('nombres',    'like', "%$q%")
                ->orWhere('apellidos','like', "%$q%")
                ->orWhere('cedula',   'like', "%$q%")
            );
        }

        return response()->json($query->paginate(50));
    }

    public function store(StoreVotanteRequest $request): JsonResponse
    {
        $votante = Votante::create(array_merge($request->validated(), [
            'usuario_carga_id' => $request->user()->id,
        ]));

        return response()->json($votante->load(['zona', 'coordinador', 'jefeZona', 'localVotacion', 'movimiento']), 201);
    }

    public function show(Votante $votante): JsonResponse
    {
        return response()->json($votante->load(['zona', 'coordinador', 'jefeZona', 'movimiento', 'localVotacion', 'marcaciones.usuarioVeedor']));
    }

    public function update(UpdateVotanteRequest $request, Votante $votante): JsonResponse
    {
        $votante->update($request->validated());
        return response()->json($votante->fresh(['zona', 'coordinador', 'jefeZona', 'localVotacion', 'movimiento']));
    }

    public function importarPreview(Request $request): JsonResponse
    {
        $request->validate(['archivo' => 'required|file|mimes:xlsx,xls,csv']);
        $import = new VotantesImport(true);
        Excel::import($import, $request->file('archivo'));

        return response()->json([
            'validas'  => $import->getValidas(),
            'errores'  => $import->getErrores(),
            'total'    => $import->getTotal(),
        ]);
    }

    public function importarConfirmar(Request $request): JsonResponse
    {
        $request->validate(['archivo' => 'required|file|mimes:xlsx,xls,csv']);
        $import = new VotantesImport(false, $request->user()->id);
        Excel::import($import, $request->file('archivo'));

        Auditoria::registrar('votantes', 0, 'importar', null,
            ['importados' => $import->getImportados(), 'saltados' => $import->getSaltados()],
            $request->user()->id, $request->ip()
        );

        return response()->json([
            'importados' => $import->getImportados(),
            'saltados'   => $import->getSaltados(),
        ]);
    }
}
