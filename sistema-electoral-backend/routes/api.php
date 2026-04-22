<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\CoordinadorController;
use App\Http\Controllers\ControlVotacionController;
use App\Http\Controllers\JefeZonaController;
use App\Http\Controllers\LocalVotacionController;
use App\Http\Controllers\MonitoreoController;
use App\Http\Controllers\MovimientoController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VeedorController;
use App\Http\Controllers\VotanteController;
use App\Http\Controllers\ZonaController;
use Illuminate\Support\Facades\Route;

// Auth - público
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',     [AuthController::class, 'me']);

    // ── Solo administrador ──────────────────────────────────────
    Route::middleware('role:administrador')->group(function () {
        Route::apiResource('zonas',       ZonaController::class)->except(['destroy', 'show']);
        Route::apiResource('jefes-zona',  JefeZonaController::class)->except(['destroy', 'show']);
        Route::apiResource('locales',     LocalVotacionController::class)->except(['destroy', 'show']);
        Route::apiResource('movimientos', MovimientoController::class)->except(['destroy', 'show']);
        Route::apiResource('usuarios',    UsuarioController::class)->except(['destroy', 'show']);
        Route::apiResource('veedores',    VeedorController::class)->except(['destroy', 'show']);

        Route::get('auditoria', [AuditoriaController::class, 'index']);

        // Reportes exclusivos de admin
        Route::get('reportes/velocidad-por-hora', [ReportesController::class, 'velocidadPorHora']);
        Route::get('reportes/padron-completo',    [ReportesController::class, 'padronCompleto']);
        Route::get('reportes/datos-similares',    [ReportesController::class, 'datosSimilares']);
        Route::get('reportes/marcaciones',        [ReportesController::class, 'marcaciones']);
        Route::get('reportes/estructura',         [ReportesController::class, 'estructura']);
        Route::get('reportes/carga-por-usuario',  [ReportesController::class, 'cargaPorUsuario']);
    });

    // ── Administrador + Jefe de zona ────────────────────────────
    Route::middleware('role:administrador,jefe_zona')->group(function () {
        // Coordinadores: ambos pueden crear y editar
        Route::post('coordinadores',              [CoordinadorController::class, 'store']);
        Route::put('coordinadores/{coordinador}', [CoordinadorController::class, 'update']);

        Route::get('reportes/por-local',                    [ReportesController::class, 'porLocal']);
        Route::get('reportes/padron-zona/{zona_id}',        [ReportesController::class, 'padronZona']);
        Route::get('reportes/padron-jefe-zona/{id}',        [ReportesController::class, 'padronJefeZona']);
    });

    // ── Administrador + Jefe de zona + Coordinador ──────────────
    Route::middleware('role:administrador,jefe_zona,coordinador')->group(function () {
        Route::get('votantes',                     [VotanteController::class, 'index']);
        Route::post('votantes',                    [VotanteController::class, 'store']);
        Route::get('votantes/{votante}',           [VotanteController::class, 'show']);
        Route::put('votantes/{votante}',           [VotanteController::class, 'update']);
        Route::post('votantes/importar/preview',      [VotanteController::class, 'importarPreview']);
        Route::post('votantes/importar/confirmar',    [VotanteController::class, 'importarConfirmar']);
        Route::post('votantes/importar/relink-local', [VotanteController::class, 'relinkLocal']);

        Route::get('monitoreo/resumen',          [MonitoreoController::class, 'resumen']);
        Route::get('monitoreo/faltantes',        [MonitoreoController::class, 'faltantes']);
        Route::get('monitoreo/por-zona',         [MonitoreoController::class, 'porZona']);
        Route::get('monitoreo/por-coordinador',  [MonitoreoController::class, 'porCoordinador']);

        Route::get('reportes/por-coordinador',         [ReportesController::class, 'porCoordinador']);
        Route::get('reportes/padron-coordinador/{id}', [ReportesController::class, 'padronCoordinador']);

        Route::get('zonas',         [ZonaController::class, 'index']);
        Route::get('jefes-zona',    [JefeZonaController::class, 'index']);
        Route::get('coordinadores', [CoordinadorController::class, 'index']);
        Route::get('veedores',      [VeedorController::class, 'index']);
        Route::get('movimientos',   [MovimientoController::class, 'index']);
        Route::get('locales',       [LocalVotacionController::class, 'index']);
    });

    // ── Solo vedor ──────────────────────────────────────────────
    Route::middleware('role:vedor')->group(function () {
        Route::post('control-votacion/buscar', [ControlVotacionController::class, 'buscar']);
        Route::post('control-votacion/marcar', [ControlVotacionController::class, 'marcar']);
    });
});
