<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── votantes ────────────────────────────────────────────────
        // estado_votacion se filtra en TODOS los endpoints de monitoreo y reportes
        Schema::table('votantes', function (Blueprint $table) {
            $table->index('estado_votacion', 'idx_votantes_estado');

            // Composite: zona + estado → porZona, resumen filtrado por zona
            $table->index(['zona_id', 'estado_votacion'], 'idx_votantes_zona_estado');

            // Composite: coordinador + estado → porCoordinador, padronCoordinador
            $table->index(['coordinador_id', 'estado_votacion'], 'idx_votantes_coord_estado');

            // Composite: local + estado → porLocal, faltantes filtrado por local
            $table->index(['local_votacion_id', 'estado_votacion'], 'idx_votantes_local_estado');

            // Filtros de búsqueda del VotanteController::index
            $table->index('departamento', 'idx_votantes_departamento');
            $table->index('distrito',     'idx_votantes_distrito');

            // Self-join en datosSimilares para detectar teléfonos duplicados
            $table->index('telefono', 'idx_votantes_telefono');
        });

        // ── marcaciones_voto ────────────────────────────────────────
        // fecha_hora_marcacion: rangos WHERE y GROUP BY HOUR(...) en velocidadPorHora y marcaciones
        Schema::table('marcaciones_voto', function (Blueprint $table) {
            $table->index('fecha_hora_marcacion', 'idx_marcaciones_fecha');
            $table->index('numero_orden',         'idx_marcaciones_orden');
        });

        // ── auditoria ───────────────────────────────────────────────
        // Búsquedas por entidad afectada (tabla + id)
        Schema::table('auditoria', function (Blueprint $table) {
            $table->index(['tabla_afectada', 'registro_id'], 'idx_auditoria_tabla_registro');
            $table->index('created_at', 'idx_auditoria_created_at');
        });
    }

    public function down(): void
    {
        Schema::table('votantes', function (Blueprint $table) {
            $table->dropIndex('idx_votantes_estado');
            $table->dropIndex('idx_votantes_zona_estado');
            $table->dropIndex('idx_votantes_coord_estado');
            $table->dropIndex('idx_votantes_local_estado');
            $table->dropIndex('idx_votantes_departamento');
            $table->dropIndex('idx_votantes_distrito');
            $table->dropIndex('idx_votantes_telefono');
        });

        Schema::table('marcaciones_voto', function (Blueprint $table) {
            $table->dropIndex('idx_marcaciones_fecha');
            $table->dropIndex('idx_marcaciones_orden');
        });

        Schema::table('auditoria', function (Blueprint $table) {
            $table->dropIndex('idx_auditoria_tabla_registro');
            $table->dropIndex('idx_auditoria_created_at');
        });
    }
};
