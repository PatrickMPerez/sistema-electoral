<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Carga completa del padrón electoral:
 *   – 10 zonas (departamentos de Paraguay)
 *   – 50 jefes zonales
 *   – 60 coordinadores (6 por zona)
 *   – 20 locales de votación (2 por zona)
 *   – 1 admin + 40 veedores + 1 usuario por jefe/coord de muestra
 *   – 8 000 votantes con todos los campos obligatorios
 *
 * Uso:
 *   php artisan db:seed --class=PadronRealSeeder
 */
class PadronRealSeeder extends Seeder
{
    // ── Datos geográficos de Paraguay ───────────────────────────────────
    private array $departamentos = [
        1  => ['dpto' => 'CONCEPCIÓN',       'distritos' => ['CONCEPCIÓN', 'HORQUETA', 'BELÉN', 'LORETO', 'SGT. JOSÉ F. LÓPEZ']],
        2  => ['dpto' => 'SAN PEDRO',        'distritos' => ['SAN PEDRO DEL YKUAMANDYYU', 'GENERAL RESQUÍN', 'LIMA', 'ANTEQUERA', 'CHORE']],
        3  => ['dpto' => 'CORDILLERA',       'distritos' => ['CAACUPÉ', 'ALTOS', 'EMBOSCADA', 'ITACURUBÍ DE LA CORDILLERA', 'PIRIBEBUY']],
        4  => ['dpto' => 'GUAIRÁ',           'distritos' => ['VILLARRICA', 'CORONEL MARTÍNEZ', 'MBOCAYATY', 'BORJA', 'FÉLIX PÉREZ CARDOZO']],
        5  => ['dpto' => 'CAAGUAZÚ',         'distritos' => ['CORONEL OVIEDO', 'CAAGUAZÚ', 'DR. JUAN EULOGIO ESTIGARRIBIA', 'REPATRIACIÓN', 'YHÚ']],
        6  => ['dpto' => 'CAAZAPÁ',          'distritos' => ['CAAZAPÁ', 'YUTY', 'SAN JUAN NEPOMUCENO', 'TAVAI', 'BUENA VISTA']],
        7  => ['dpto' => 'ITAPÚA',           'distritos' => ['ENCARNACIÓN', 'FRAM', 'TRINIDAD', 'CORONEL BOGADO', 'CAMBYRETÁ']],
        8  => ['dpto' => 'MISIONES',         'distritos' => ['SAN JUAN BAUTISTA', 'SANTA ROSA', 'SAN MIGUEL', 'AYOLAS', 'SANTIAGO']],
        9  => ['dpto' => 'PARAGUARÍ',        'distritos' => ['PARAGUARÍ', 'CARAPEGUÁ', 'SAPUCAI', 'YBYCUÍ', 'ACAHAY']],
        10 => ['dpto' => 'ALTO PARANÁ',      'distritos' => ['CIUDAD DEL ESTE', 'PRESIDENTE FRANCO', 'HERNANDARIAS', 'MINGA GUAZÚ', 'SANTA RITA']],
    ];

    private array $localesPorDpto = [
        1  => ['ESC. BÁSICA Nº 1 DR. ELIGIO AYALA',    'COL. NAC. CONCEPCIÓN'],
        2  => ['ESC. BÁSICA Nº 2 MARISCAL ESTIGARRIBIA','COL. NAC. SAN PEDRO'],
        3  => ['ESC. BÁSICA Nº 3 DEFENSORES DEL CHACO', 'CTRO. REG. EDU. CAACUPÉ'],
        4  => ['ESC. BÁSICA Nº 4 MCAL. FRANCISCO S. LÓPEZ','COL. NAC. VILLARRICA'],
        5  => ['ESC. BÁSICA Nº 5 BERNARDINO CABALLERO', 'CTRO. REG. EDU. OVIEDO'],
        6  => ['ESC. BÁSICA Nº 6 GRAL. DÍAZ',          'COL. NAC. CAAZAPÁ'],
        7  => ['ESC. BÁSICA Nº 7 CARLOS A. LÓPEZ',     'CTRO. REG. EDU. ENCARNACIÓN'],
        8  => ['ESC. BÁSICA Nº 8 JUAN DE SALAZAR',     'COL. NAC. SAN JUAN BAUTISTA'],
        9  => ['ESC. BÁSICA Nº 9 PEDRO JUAN CABALLERO', 'CTRO. REG. EDU. PARAGUARÍ'],
        10 => ['ESC. BÁSICA Nº 10 FULGENCIO YEGROS',   'CTRO. REG. EDU. CDE'],
    ];

    // ── Pool de nombres paraguayos ───────────────────────────────────────
    private array $nombres = [
        'MARIO','CARLOS','JUAN','PEDRO','LUIS','FRANCISCO','JOSE','ANTONIO',
        'MIGUEL','RAFAEL','FERNANDO','EDGAR','RODRIGO','PABLO','VICTOR',
        'GABRIEL','DANIEL','JORGE','RAMON','NELSON','CRISTIAN','ALEX',
        'ROBERTO','SERGIO','FELIX','HUGO','OSCAR','SANTIAGO','ANDRES',
        'MARIA','ANA','ROSA','PATRICIA','SANDRA','CLAUDIA','LAURA',
        'JESSICA','NATALIA','CAROLINA','ANDREA','LORENA','MONICA','SILVIA',
        'ELIZABETH','VIRGINIA','DIANA','TERESA','GLORIA','BEATRIZ','ELENA',
        'FATIMA','LIDIA','GLADYS','ZUNILDA','HERMELINDA','APARECIDA',
        'MARISOL','ANTONIA','MIRTA','OLGA','CELIA','LUCIANA','KARINA',
        'RAMON ANTONIO','MARIO ALBERTO','CARLOS MIGUEL','JUAN CARLOS',
        'JOSE ANTONIO','PEDRO PABLO','LUIS ALFREDO','VICTOR HUGO',
        'MARIA DE LOS ANGELES','ANA MARIA','ROSA MARIA','MARIA ELENA',
    ];

    private array $apellidos = [
        'GONZALEZ','BENITEZ','GIMENEZ','RODRIGUEZ','MARTINEZ','LOPEZ',
        'GARCIA','SANCHEZ','PEREZ','FERNANDEZ','RAMIREZ','TORRES',
        'FLORES','ROMERO','DIAZ','MORALES','JIMENEZ','ORTIZ',
        'GOMEZ','HERRERA','ALVAREZ','RUIZ','MENDOZA','VARGAS',
        'CABRERA','SILVA','ROJAS','ACOSTA','VERA','RAMOS',
        'MOLINA','GUERRERO','MEDINA','CASTILLO','REYES','RIOS',
        'LEIVA','SOTO','AGUERO','FIGUEROA','SUAREZ','IBARRA',
        'ESQUIVEL','BARRIOS','AYALA','GAONA','VALLEJOS','DUARTE',
        'BOGADO','BRITEZ','AMARILLA','INSAURRALDE','OZUNA','AQUINO',
        'FRANCO','LUGO','LEZCANO','ZÁRATE','GODOY','VÁZQUEZ',
        'YEGROS','CABALLERO','ESTIGARRIBIA','ARANDA','ENCISO','MOREL',
        'MEZA','JARA','CENTURION','COLMAN','VILLALBA','CÁCERES',
    ];

    public function run(): void
    {
        $this->command->info('🗑️  Limpiando base de datos...');
        $this->limpiar();

        $this->command->info('📋  Creando movimiento político...');
        $movimientoId = $this->crearMovimiento();

        $this->command->info('👤  Creando 50 jefes zonales...');
        $jefesIds = $this->crearJefesZonales(50);

        $this->command->info('🗺️   Creando 10 zonas (departamentos)...');
        $zonasIds = $this->crearZonas($jefesIds);

        $this->command->info('👥  Creando 60 coordinadores...');
        $coordsIds = $this->crearCoordinadores(60, $zonasIds, $jefesIds);

        $this->command->info('🏫  Creando 20 locales de votación...');
        $localesMap = $this->crearLocales($zonasIds);  // [zona_id => [local_id, local_id]]

        $this->command->info('🔐  Creando usuarios (admin + 40 veedores)...');
        $adminId = $this->crearUsuarios($zonasIds, $jefesIds, $coordsIds);

        $this->command->info('🗳️   Insertando 8.000 votantes...');
        $this->crearVotantes(8000, $zonasIds, $coordsIds, $jefesIds, $localesMap, $movimientoId, $adminId);

        $this->command->info('');
        $this->command->info('✅  Padrón cargado exitosamente:');
        $this->command->info('   Jefes zonales : 50');
        $this->command->info('   Zonas         : 10');
        $this->command->info('   Coordinadores : 60');
        $this->command->info('   Locales       : 20');
        $this->command->info('   Veedores      : 40');
        $this->command->info('   Votantes      : 8.000');
        $this->command->info('');
        $this->command->info('🔑  Acceso: admin / admin2026');
    }

    // ── Limpieza ─────────────────────────────────────────────────────────
    private function limpiar(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('auditoria')->truncate();
        DB::table('marcaciones_voto')->truncate();
        DB::table('votantes')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('users')->truncate();
        DB::table('coordinadores')->truncate();
        DB::table('locales_votacion')->truncate();
        DB::table('zonas')->truncate();
        DB::table('jefes_zona')->truncate();
        DB::table('movimientos')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    // ── Movimiento ───────────────────────────────────────────────────────
    private function crearMovimiento(): int
    {
        return DB::table('movimientos')->insertGetId([
            'nombre_movimiento' => 'Movimiento Electoral',
            'nombre_candidato'  => 'Candidato Principal',
            'lista'             => '1',
            'partido'           => 'Partido Electoral',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    // ── Jefes Zonales (50) ───────────────────────────────────────────────
    private function crearJefesZonales(int $cantidad): array
    {
        $ids = [];
        $cedulas = $this->generarCedulas($cantidad, 5000000);

        for ($i = 0; $i < $cantidad; $i++) {
            $nombre = $this->nombreAleatorio();
            $ids[] = DB::table('jefes_zona')->insertGetId([
                'nombre_completo' => $nombre,
                'cedula'          => $cedulas[$i],
                'telefono'        => '0981' . rand(100000, 999999),
                'activo'          => true,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
        return $ids;
    }

    // ── Zonas (10) ───────────────────────────────────────────────────────
    private function crearZonas(array $jefesIds): array
    {
        $ids = [];
        foreach ($this->departamentos as $idx => $dpto) {
            $jefeId = $jefesIds[$idx - 1]; // primeros 10 jefes como líderes de zona
            $ids[$idx] = DB::table('zonas')->insertGetId([
                'nombre_zona'  => 'Zona ' . $dpto['dpto'],
                'jefe_zona_id' => $jefeId,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
        return $ids; // [1=>zona_id, 2=>zona_id, ...]
    }

    // ── Coordinadores (60) ───────────────────────────────────────────────
    private function crearCoordinadores(int $cantidad, array $zonasIds, array $jefesIds): array
    {
        $ids = [];
        $cedulas = $this->generarCedulas($cantidad, 6000000);
        $zonaKeys = array_keys($zonasIds); // [1,2,...,10]
        $porZona  = intdiv($cantidad, count($zonaKeys)); // 6 por zona

        $i = 0;
        foreach ($zonaKeys as $zonaKey) {
            $zonaId  = $zonasIds[$zonaKey];
            $jefeId  = $jefesIds[$zonaKey - 1]; // jefe correspondiente a esa zona
            for ($c = 0; $c < $porZona && $i < $cantidad; $c++, $i++) {
                $nombre = $this->nombreAleatorio();
                $ids[]  = DB::table('coordinadores')->insertGetId([
                    'nombre_completo' => $nombre,
                    'cedula'          => $cedulas[$i],
                    'telefono'        => '0971' . rand(100000, 999999),
                    'zona_id'         => $zonaId,
                    'jefe_zona_id'    => $jefeId,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        }
        return $ids;
    }

    // ── Locales de Votación (20) ─────────────────────────────────────────
    private function crearLocales(array $zonasIds): array
    {
        $map = []; // [zona_id => [local_id, local_id]]
        foreach ($this->departamentos as $idx => $dpto) {
            $zonaId   = $zonasIds[$idx];
            $locales  = $this->localesPorDpto[$idx];
            $localIds = [];
            foreach ($locales as $nombre) {
                $localIds[] = DB::table('locales_votacion')->insertGetId([
                    'nombre_local' => $nombre,
                    'localidad'    => $dpto['distritos'][0],
                    'direccion'    => 'Calle ' . rand(1, 200) . ' Nº ' . rand(1, 999),
                    'zona_id'      => $zonaId,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
            $map[$zonaId] = $localIds;
        }
        return $map;
    }

    // ── Usuarios ─────────────────────────────────────────────────────────
    private function crearUsuarios(array $zonasIds, array $jefesIds, array $coordsIds): int
    {
        $now = now();
        $pass = Hash::make('admin2026');

        // Admin
        $adminId = DB::table('users')->insertGetId([
            'name'       => 'Administrador',
            'username'   => 'admin',
            'password'   => $pass,
            'role'       => 'administrador',
            'activo'     => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 40 veedores distribuidos en zonas
        $zonaIds = array_values($zonasIds);
        $veedorPass = Hash::make('veedor2026');
        $cedulas = $this->generarCedulas(40, 7000000);
        for ($i = 1; $i <= 40; $i++) {
            DB::table('users')->insert([
                'name'       => 'Veedor ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'username'   => 'veedor' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'password'   => $veedorPass,
                'role'       => 'vedor',
                'zona_id'    => $zonaIds[($i - 1) % count($zonaIds)],
                'activo'     => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return $adminId;
    }

    // ── Votantes (8 000) ─────────────────────────────────────────────────
    private function crearVotantes(
        int $total,
        array $zonasIds,
        array $coordsIds,
        array $jefesIds,
        array $localesMap,
        int $movimientoId,
        int $adminId
    ): void {
        $zonaKeys  = array_keys($zonasIds);           // [1..10]
        $porZona   = intdiv($total, count($zonaKeys)); // 800
        $cedulas   = $this->generarCedulas($total, 1000000);
        $cedulaIdx = 0;
        $orden     = 1;

        // coordsIds está ordenado: 6 por zona en orden
        $coordsPorZona = array_chunk($coordsIds, 6); // 10 grupos de 6

        $batch = [];
        $now   = now()->toDateTimeString();

        foreach ($zonaKeys as $zi => $zonaKey) {
            $zonaId    = $zonasIds[$zonaKey];
            $dpto      = $this->departamentos[$zonaKey];
            $coords    = $coordsPorZona[$zi] ?? [];
            $jefeId    = $jefesIds[$zonaKey - 1];
            $localIds  = $localesMap[$zonaId];
            $distritos = $dpto['distritos'];
            $seccOffset= ($zonaKey - 1) * 20 + 100; // seccional base por zona

            for ($v = 0; $v < $porZona && $cedulaIdx < count($cedulas); $v++, $cedulaIdx++, $orden++) {
                $coordId   = $coords[$v % count($coords)];
                $localId   = $localIds[$v % count($localIds)];
                $distrito  = $distritos[$v % count($distritos)];
                $seccNum   = $seccOffset + intdiv($v, 40); // ~40 por seccional
                $mesa      = ($v % 15) + 1;                // mesas 1-15
                $nombres   = $this->nombreBase();
                $apellidos = $this->apellidoDoble();

                $batch[] = [
                    'nombre_completo'  => $nombres . ' ' . $apellidos,
                    'nombres'          => $nombres,
                    'apellidos'        => $apellidos,
                    'cedula'           => $cedulas[$cedulaIdx],
                    'telefono'         => '09' . rand(71, 86) . rand(100000, 999999),
                    'localidad'        => $distrito,
                    'departamento'     => $dpto['dpto'],
                    'distrito'         => $distrito,
                    'seccional'        => 'Seccional Nº ' . $seccNum,
                    'mesa'             => $mesa,
                    'numero_orden'     => $orden,
                    'estado_votacion'  => 'registrado',
                    'local_votacion_id'=> $localId,
                    'zona_id'          => $zonaId,
                    'coordinador_id'   => $coordId,
                    'jefe_zona_id'     => $jefeId,
                    'movimiento_id'    => $movimientoId,
                    'usuario_carga_id' => $adminId,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];

                // Insertar en lotes de 500
                if (count($batch) >= 500) {
                    DB::table('votantes')->insert($batch);
                    $batch = [];
                    $this->command->getOutput()->write('.');
                }
            }
        }

        // Insertar resto
        if (!empty($batch)) {
            DB::table('votantes')->insert($batch);
        }

        $this->command->info('');
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private function nombreBase(): string
    {
        $n = $this->nombres[array_rand($this->nombres)];
        // 30% chance de doble nombre
        if (rand(1, 10) <= 3) {
            $n2 = $this->nombres[array_rand($this->nombres)];
            // evitar duplicar exactamente
            if ($n2 !== $n) $n .= ' ' . $n2;
        }
        return $n;
    }

    private function apellidoDoble(): string
    {
        $a1 = $this->apellidos[array_rand($this->apellidos)];
        $a2 = $this->apellidos[array_rand($this->apellidos)];
        return $a1 . ' ' . $a2;
    }

    private function nombreAleatorio(): string
    {
        return $this->nombreBase() . ' ' . $this->apellidoDoble();
    }

    /** Genera cédulas únicas sin puntos ni guiones */
    private function generarCedulas(int $cantidad, int $inicio): array
    {
        $cedulas = [];
        $actual  = $inicio;
        while (count($cedulas) < $cantidad) {
            $cedulas[] = (string) $actual;
            $actual   += rand(1, 5);
        }
        return $cedulas;
    }
}
