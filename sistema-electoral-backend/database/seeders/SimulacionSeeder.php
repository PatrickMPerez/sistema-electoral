<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Simulacro electoral — Distrito de Horqueta, Dpto. Concepción
 *
 * Estructura:
 *   10  Zonas (sectores de Horqueta)
 *  100  Jefes Zonales  (10 por zona)
 *   60  Coordinadores  (6 por zona)
 *   20  Locales de Votación (2 por zona)
 *   40  Veedores (4 por zona) + 1 admin
 * 10 000 Votantes (1 000 por zona · 166-167 por coordinador)
 *
 * Credenciales: admin / simulacro2026
 *               jefe01…jefe100  / simulacro2026
 *               coord01…coord60 / simulacro2026
 *               veedor01…veedor40 / simulacro2026
 *
 * Uso:
 *   php artisan db:seed --class=SimulacionSeeder
 */
class SimulacionSeeder extends Seeder
{
    // ── Constantes del simulacro ─────────────────────────────────────────
    const DEPARTAMENTO = 'CONCEPCIÓN';
    const DISTRITO     = 'HORQUETA';
    const TOTAL_VOTANTES   = 10_000;
    const TOTAL_JEFES      = 100;
    const TOTAL_COORDS     = 60;
    const TOTAL_VEEDORES   = 40;

    // ── Zonas / sectores de Horqueta ────────────────────────────────────
    private array $zonas = [
        [
            'nombre'    => 'Zona Centro',
            'localidad' => 'Centro',
            'locales'   => [
                'ESC. BÁS. Nº 1 "MARISCAL F. SOLANO LÓPEZ"',
                'COL. NAC. DE HORQUETA',
            ],
            'seccionales' => [101, 102, 103, 104, 105],
        ],
        [
            'nombre'    => 'Zona San Blas',
            'localidad' => 'Barrio San Blas',
            'locales'   => [
                'ESC. BÁS. Nº 2 "DEFENSORES DEL CHACO"',
                'ESC. BÁS. Nº 3 "DR. J. G. RODRÍGUEZ DE FRANCIA"',
            ],
            'seccionales' => [106, 107, 108, 109, 110],
        ],
        [
            'nombre'    => 'Zona Mbocayaty',
            'localidad' => 'Compañía Mbocayaty',
            'locales'   => [
                'ESC. BÁS. Nº 4 "MCAL. ESTIGARRIBIA"',
                'ESC. BÁS. Nº 5 "PEDRO JUAN CABALLERO"',
            ],
            'seccionales' => [111, 112, 113, 114, 115],
        ],
        [
            'nombre'    => 'Zona Santa Rosa',
            'localidad' => 'Compañía Santa Rosa',
            'locales'   => [
                'ESC. BÁS. Nº 6 "BERNARDINO CABALLERO"',
                'ESC. BÁS. Nº 7 "CARLOS A. LÓPEZ"',
            ],
            'seccionales' => [116, 117, 118, 119, 120],
        ],
        [
            'nombre'    => 'Zona San Antonio',
            'localidad' => 'Compañía San Antonio',
            'locales'   => [
                'ESC. BÁS. Nº 8 "GRAL. DÍAZ"',
                'ESC. BÁS. Nº 9 "FULGENCIO YEGROS"',
            ],
            'seccionales' => [121, 122, 123, 124, 125],
        ],
        [
            'nombre'    => 'Zona La Pastora',
            'localidad' => 'Compañía La Pastora',
            'locales'   => [
                'ESC. BÁS. Nº 10 "REPÚBLICA DEL PARAGUAY"',
                'ESC. BÁS. Nº 11 "JUAN DE SALAZAR"',
            ],
            'seccionales' => [126, 127, 128, 129, 130],
        ],
        [
            'nombre'    => 'Zona Virgen del Pilar',
            'localidad' => 'Barrio Virgen del Pilar',
            'locales'   => [
                'ESC. BÁS. Nº 12 "JOSÉ ASUNCIÓN FLORES"',
                'ESC. BÁS. Nº 13 "AUGUSTO ROA BASTOS"',
            ],
            'seccionales' => [131, 132, 133, 134, 135],
        ],
        [
            'nombre'    => 'Zona San Cristóbal',
            'localidad' => 'Compañía San Cristóbal',
            'locales'   => [
                'ESC. BÁS. Nº 14 "GRAL. CABALLERO"',
                'ESC. BÁS. Nº 15 "EUGENIO GARAY"',
            ],
            'seccionales' => [136, 137, 138, 139, 140],
        ],
        [
            'nombre'    => 'Zona Ybycuá',
            'localidad' => 'Compañía Ybycuá',
            'locales'   => [
                'ESC. BÁS. Nº 16 "MARIANO ROQUE ALONSO"',
                'ESC. BÁS. Nº 17 "ELIGIO AYALA"',
            ],
            'seccionales' => [141, 142, 143, 144, 145],
        ],
        [
            'nombre'    => 'Zona Trinidad',
            'localidad' => 'Compañía Trinidad',
            'locales'   => [
                'ESC. BÁS. Nº 18 "SGT. JOSÉ F. LÓPEZ"',
                'CTRO. REG. EDU. HORQUETA',
            ],
            'seccionales' => [146, 147, 148, 149, 150],
        ],
    ];

    // ── Nombres ──────────────────────────────────────────────────────────
    private array $nombresM = [
        'MARIO','CARLOS','JUAN','PEDRO','LUIS','FRANCISCO','JOSE','ANTONIO',
        'MIGUEL','RAFAEL','FERNANDO','EDGAR','RODRIGO','PABLO','VICTOR',
        'GABRIEL','DANIEL','JORGE','RAMON','NELSON','ALEX','ROBERTO',
        'SERGIO','FELIX','HUGO','OSCAR','SANTIAGO','ANDRES','REINALDO',
        'ISMAEL','ARNALDO','BLAS','CEFERINO','DAMIAN','EMILIO','FAUSTO',
        'GILBERTO','HOMERO','IGNACIO','JULIO','KEVIN','LEONARDO','OMAR',
        'PATRICIO','RUBEN','SERGIO','TOMAS','ULISES','VALENTIN','WALTER',
    ];
    private array $nombresF = [
        'MARIA','ANA','ROSA','PATRICIA','SANDRA','CLAUDIA','LAURA',
        'JESSICA','NATALIA','CAROLINA','ANDREA','LORENA','MONICA','SILVIA',
        'ELIZABETH','VIRGINIA','DIANA','TERESA','GLORIA','BEATRIZ','ELENA',
        'FATIMA','LIDIA','GLADYS','ZUNILDA','HERMELINDA','MARISOL',
        'ANTONIA','MIRTA','OLGA','CELIA','LUCIANA','KARINA','NORMA',
        'SUSANA','VIVIANA','ROXANA','FERNANDA','ANGELA','BLANCA',
        'CATALINA','DOLORES','ESTELA','FABIOLA','HILDA','IRENE','JULIA',
        'LOURDES','MERCEDES','NIDIA','OFELIA','PILAR','RAQUEL','SOLEDAD',
    ];
    private array $apellidos = [
        'GONZALEZ','BENITEZ','GIMENEZ','RODRIGUEZ','MARTINEZ','LOPEZ',
        'GARCIA','SANCHEZ','PEREZ','FERNANDEZ','RAMIREZ','TORRES',
        'FLORES','ROMERO','DIAZ','MORALES','JIMENEZ','ORTIZ','GOMEZ',
        'HERRERA','ALVAREZ','RUIZ','MENDOZA','VARGAS','CABRERA','SILVA',
        'ROJAS','ACOSTA','VERA','RAMOS','MOLINA','GUERRERO','MEDINA',
        'CASTILLO','REYES','RIOS','LEIVA','SOTO','AGUERO','FIGUEROA',
        'SUAREZ','IBARRA','ESQUIVEL','BARRIOS','AYALA','GAONA',
        'VALLEJOS','DUARTE','BOGADO','BRITEZ','AMARILLA','INSAURRALDE',
        'OZUNA','AQUINO','FRANCO','LUGO','LEZCANO','ZARATE','GODOY',
        'VAZQUEZ','YEGROS','CABALLERO','ESTIGARRIBIA','ARANDA','ENCISO',
        'MOREL','MEZA','JARA','CENTURION','COLMAN','VILLALBA','CACERES',
    ];

    // ── Estado interno ───────────────────────────────────────────────────
    private int   $cedulaBase  = 1_000_000;
    private array $cedulasUsadas = [];

    // ════════════════════════════════════════════════════════════════════
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🇵🇾  SIMULACRO ELECTORAL — Horqueta, Concepción');
        $this->command->info('    10.000 votantes · 100 jefes · 60 coordinadores · 40 veedores');
        $this->command->info('');

        // ── 1. Limpiar ────────────────────────────────────────────────
        $this->limpiar();

        // ── 2. Movimiento ─────────────────────────────────────────────
        $movId = DB::table('movimientos')->insertGetId([
            'nombre_movimiento' => 'Movimiento Elección Municipal Horqueta 2026',
            'nombre_candidato'  => 'Candidato Municipal',
            'lista'             => '1',
            'partido'           => 'Partido Municipal',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // ── 3. Admin ──────────────────────────────────────────────────
        $pass  = Hash::make('simulacro2026');
        $adminId = DB::table('users')->insertGetId([
            'name'       => 'Administrador',
            'username'   => 'admin',
            'email'      => 'admin@horqueta.py',
            'password'   => $pass,
            'role'       => 'administrador',
            'activo'     => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── 4. Jefes zonales (100): crear todos primero ───────────────
        $this->command->info('👤  Creando 100 jefes zonales...');
        $jefesIds = $this->crearJefes(self::TOTAL_JEFES, $pass);

        // ── 5. Zonas + coordinadores + locales + votantes ─────────────
        $numCoord   = 1;
        $numVeedor  = 1;
        $ordenGlobal = 1;
        $votantesBatch = [];

        $votantesPorZona = intdiv(self::TOTAL_VOTANTES, count($this->zonas)); // 1000
        $coordsPorZona   = intdiv(self::TOTAL_COORDS, count($this->zonas));   // 6
        $jefesPorZona    = intdiv(self::TOTAL_JEFES, count($this->zonas));    // 10
        $veedoresPorZona = intdiv(self::TOTAL_VEEDORES, count($this->zonas)); // 4

        // Cuántos votantes asignar a cada coordinador dentro de la zona
        $votsPorCoord = intdiv($votantesPorZona, $coordsPorZona); // 166

        foreach ($this->zonas as $zi => $zConf) {
            $this->command->info("  ▶ {$zConf['nombre']}");

            // Bloque de jefes para esta zona (10 por zona)
            $jefesBloque = array_slice($jefesIds, $zi * $jefesPorZona, $jefesPorZona);
            $jefeZonaId  = $jefesBloque[0]; // primer jefe = líder de la zona

            // Zona
            $zonaId = DB::table('zonas')->insertGetId([
                'nombre_zona'  => $zConf['nombre'],
                'jefe_zona_id' => $jefeZonaId,
                'activo'       => true,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // Actualizar los 10 jefes con zona (para trazabilidad)
            // (los jefes ya existen, solo usamos sus IDs)

            // Usuario jefe principal
            DB::table('users')->insert([
                'name'         => 'Jefe ' . $zConf['nombre'],
                'username'     => 'jefe' . str_pad($zi + 1, 2, '0', STR_PAD_LEFT),
                'email'        => 'jefe' . ($zi + 1) . '@horqueta.py',
                'password'     => $pass,
                'role'         => 'jefe_zona',
                'activo'       => true,
                'zona_id'      => $zonaId,
                'jefe_zona_id' => $jefeZonaId,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // Locales de votación
            $localIds = [];
            foreach ($zConf['locales'] as $li => $nombreLocal) {
                $localIds[] = DB::table('locales_votacion')->insertGetId([
                    'nombre_local' => $nombreLocal,
                    'localidad'    => $zConf['localidad'],
                    'direccion'    => 'Calle ' . rand(1, 50) . ' Nº ' . rand(100, 999) . ', ' . $zConf['localidad'],
                    'zona_id'      => $zonaId,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }

            // 6 Coordinadores por zona
            $coordIds = [];
            for ($ci = 0; $ci < $coordsPorZona; $ci++) {
                $jefeAsig = $jefesBloque[$ci % $jefesPorZona]; // rotar entre los 10 jefes del bloque
                $nombre   = $this->nombre();
                $coordId  = DB::table('coordinadores')->insertGetId([
                    'nombre_completo' => $nombre,
                    'cedula'          => $this->cedula(),
                    'telefono'        => $this->telefono(),
                    'zona_id'         => $zonaId,
                    'jefe_zona_id'    => $jefeAsig,
                    'activo'          => true,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);

                DB::table('users')->insert([
                    'name'           => 'Coord ' . $numCoord,
                    'username'       => 'coord' . str_pad($numCoord, 2, '0', STR_PAD_LEFT),
                    'email'          => 'coord' . $numCoord . '@horqueta.py',
                    'password'       => $pass,
                    'role'           => 'coordinador',
                    'activo'         => true,
                    'zona_id'        => $zonaId,
                    'coordinador_id' => $coordId,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                $coordIds[] = ['id' => $coordId, 'jefe_id' => $jefeAsig];
                $numCoord++;
            }

            // 4 Veedores por zona
            for ($vi = 0; $vi < $veedoresPorZona; $vi++) {
                DB::table('users')->insert([
                    'name'       => 'Veedor ' . $numVeedor,
                    'username'   => 'veedor' . str_pad($numVeedor, 2, '0', STR_PAD_LEFT),
                    'email'      => 'veedor' . $numVeedor . '@horqueta.py',
                    'password'   => $pass,
                    'role'       => 'vedor',
                    'activo'     => true,
                    'zona_id'    => $zonaId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $numVeedor++;
            }

            // 1.000 votantes distribuidos entre 6 coordinadores
            $seccionales = $zConf['seccionales'];

            foreach ($coordIds as $cIdx => $coordData) {
                // Últimos coordinadores absorben los votantes sobrantes
                $cantidad = ($cIdx === count($coordIds) - 1)
                    ? $votantesPorZona - ($votsPorCoord * (count($coordIds) - 1))
                    : $votsPorCoord;

                for ($v = 0; $v < $cantidad; $v++) {
                    $localId  = $localIds[$v % count($localIds)];
                    $seccNum  = $seccionales[$v % count($seccionales)];
                    $mesa     = ($v % 15) + 1;
                    $esMujer  = rand(0, 1);
                    $nombres  = $this->nombreBase($esMujer);
                    $apellido = $this->apellidoDoble();

                    $votantesBatch[] = [
                        'nombre_completo'   => $nombres . ' ' . $apellido,
                        'nombres'           => $nombres,
                        'apellidos'         => $apellido,
                        'cedula'            => $this->cedula(),
                        'telefono'          => $this->telefono(),
                        'localidad'         => $zConf['localidad'],
                        'departamento'      => self::DEPARTAMENTO,
                        'distrito'          => self::DISTRITO,
                        'seccional'         => 'Seccional Nº ' . $seccNum,
                        'mesa'              => $mesa,
                        'numero_orden'      => $ordenGlobal++,
                        'estado_votacion'   => 'registrado',
                        'local_votacion_id' => $localId,
                        'zona_id'           => $zonaId,
                        'coordinador_id'    => $coordData['id'],
                        'jefe_zona_id'      => $coordData['jefe_id'],
                        'movimiento_id'     => $movId,
                        'usuario_carga_id'  => $adminId,
                        'created_at'        => now(),
                        'updated_at'        => now(),
                    ];

                    if (count($votantesBatch) >= 500) {
                        DB::table('votantes')->insert($votantesBatch);
                        $votantesBatch = [];
                        $this->command->getOutput()->write('.');
                    }
                }
            }
        }

        // Insertar resto
        if (!empty($votantesBatch)) {
            DB::table('votantes')->insert($votantesBatch);
        }

        // ── Resumen ───────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('');
        $this->command->info('✅  Simulacro cargado exitosamente');
        $this->command->table(
            ['Entidad', 'Cantidad'],
            [
                ['Zonas',                            10],
                ['Jefes Zonales',                   100],
                ['Coordinadores',                    60],
                ['Veedores',                         40],
                ['Locales de Votación',              20],
                ['Seccionales',                      50],
                ['Votantes — Horqueta, Concepción', '10.000'],
            ]
        );
        $this->command->info('');
        $this->command->info('🔑  Credenciales (contraseña: simulacro2026)');
        $this->command->info('    admin            → Administrador');
        $this->command->info('    jefe01 – jefe10  → Jefes líderes de zona (usuarios)');
        $this->command->info('    coord01 – coord60 → Coordinadores');
        $this->command->info('    veedor01 – veedor40 → Veedores');
        $this->command->info('');
        $this->command->info('🗳️   ¡Listo para el simulacro!');
    }

    // ── Helpers ──────────────────────────────────────────────────────────

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

    /** Crea los 100 jefes zonales y devuelve sus IDs */
    private function crearJefes(int $cantidad, string $pass): array
    {
        $ids = [];
        for ($i = 1; $i <= $cantidad; $i++) {
            $ids[] = DB::table('jefes_zona')->insertGetId([
                'nombre_completo' => $this->nombre(),
                'cedula'          => $this->cedula(),
                'telefono'        => $this->telefono(),
                'activo'          => true,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
        return $ids;
    }

    private function cedula(): string
    {
        do {
            $c = (string) ($this->cedulaBase + rand(0, 8_000_000));
        } while (isset($this->cedulasUsadas[$c]));
        $this->cedulasUsadas[$c] = true;
        return $c;
    }

    private function telefono(): string
    {
        return '09' . rand(71, 99) . rand(100_000, 999_999);
    }

    private function nombreBase(bool $esMujer = false): string
    {
        $pool   = $esMujer ? $this->nombresF : $this->nombresM;
        $nombre = $pool[array_rand($pool)];
        if (rand(1, 10) <= 3) {
            $n2 = $pool[array_rand($pool)];
            if ($n2 !== $nombre) $nombre .= ' ' . $n2;
        }
        return $nombre;
    }

    private function apellidoDoble(): string
    {
        return $this->apellidos[array_rand($this->apellidos)]
             . ' '
             . $this->apellidos[array_rand($this->apellidos)];
    }

    private function nombre(): string
    {
        return $this->nombreBase((bool) rand(0, 1)) . ' ' . $this->apellidoDoble();
    }
}
