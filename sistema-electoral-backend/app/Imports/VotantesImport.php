<?php
namespace App\Imports;
use App\Models\LocalVotacion;
use App\Models\Votante;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class VotantesImport implements ToCollection, WithHeadingRow
{
    private bool  $soloPreview;
    private ?int  $usuarioCargaId;
    private array $validas    = [];
    private array $errores    = [];
    private int   $importados = 0;
    private int   $saltados   = 0;

    // Cache de locales para no consultar BD en cada fila
    private ?Collection $localesCache = null;

    public function __construct(bool $soloPreview = true, ?int $usuarioCargaId = null)
    {
        $this->soloPreview    = $soloPreview;
        $this->usuarioCargaId = $usuarioCargaId;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $fila        = $index + 2;
            $erroresFila = [];
            $r           = $row->toArray();

            // ── Normalizar columnas del padrón electoral ──────────────
            // Soporta tanto el formato del padrón (nombre, apellido, orden...)
            // como el formato interno anterior (nombres, apellidos, numero_orden...)
            $cedula      = trim($r['numero_ced'] ?? $r['numero_ce']  ?? $r['cedula']       ?? '');
            $nombres     = trim($r['nombre']     ?? $r['nombres']                         ?? '');
            $apellidos   = trim($r['apellido']   ?? $r['apellidos']                       ?? '');
            $departamento = trim($r['desc_dep']  ?? $r['departamento']                    ?? '');
            $distrito    = trim($r['desc_dis']   ?? $r['distrito']                        ?? '');
            $seccional   = trim($r['desc_sec']   ?? $r['seccional']                       ?? '');
            $mesa        = trim((string)($r['mesa'] ?? ''));
            $numeroOrden = trim((string)($r['orden'] ?? $r['numero_orden']                ?? ''));
            $descLocal   = trim($r['desc_locanr'] ?? $r['desc_local']                    ?? '');

            // Campos opcionales
            $fechaNac    = $r['fecha_naci'] ?? $r['fecha_nac'] ?? $r['fecha_nacimiento'] ?? null;
            $direccion   = trim($r['direccion'] ?? '');
            $fechaAfil   = $r['fecha_afil']  ?? $r['fecha_afiliacion']  ?? null;
            $telefono    = trim($r['telefono'] ?? '');
            $localidad   = trim($r['localidad'] ?? '');

            // ── Validaciones requeridas ───────────────────────────────
            if ($cedula === '')       $erroresFila[] = 'Cédula requerida (columna numero_ced)';
            if ($nombres === '')      $erroresFila[] = 'Nombres requeridos (columna nombre)';
            if ($apellidos === '')    $erroresFila[] = 'Apellidos requeridos (columna apellido)';
            if ($departamento === '') $erroresFila[] = 'Departamento requerido (columna desc_dep)';
            if ($distrito === '')     $erroresFila[] = 'Distrito requerido (columna desc_dis)';
            if ($seccional === '')    $erroresFila[] = 'Seccional requerida (columna desc_sec)';
            if ($mesa === '')         $erroresFila[] = 'Mesa requerida';
            if ($numeroOrden === '')  $erroresFila[] = 'Número de orden requerido (columna orden)';

            if (! empty($erroresFila)) {
                $this->errores[] = ['fila' => $fila, 'errores' => $erroresFila, 'datos' => $r];
                continue;
            }

            // ── Duplicado por cédula ──────────────────────────────────
            if (Votante::where('cedula', $cedula)->exists()) {
                $this->saltados++;
                $this->errores[] = ['fila' => $fila, 'errores' => ['Cédula duplicada: ' . $cedula], 'datos' => $r];
                continue;
            }

            // ── Buscar local de votación por nombre ───────────────────
            $localVotacionId = null;
            if ($descLocal !== '') {
                $localVotacionId = $this->buscarLocal($descLocal)?->id;
            }

            // ── Preparar fechas ───────────────────────────────────────
            $fechaNacParseada  = $this->parseFecha($fechaNac);
            $fechaAfilParseada = $this->parseFecha($fechaAfil);

            $datos = [
                'cedula'           => $cedula,
                'nombres'          => $nombres,
                'apellidos'        => $apellidos,
                'nombre_completo'  => $nombres . ' ' . $apellidos,
                'departamento'     => $departamento,
                'distrito'         => $distrito,
                'seccional'        => $seccional,
                'mesa'             => (int) $mesa,
                'numero_orden'     => (int) $numeroOrden,
                'local_votacion_id'=> $localVotacionId,
                'fecha_nacimiento' => $fechaNacParseada,
                'direccion'        => $direccion ?: null,
                'fecha_afiliacion' => $fechaAfilParseada,
                'telefono'         => $telefono ?: null,
                'localidad'        => $localidad ?: null,
                // zona_id y coordinador_id se asignan manualmente después
            ];

            $this->validas[] = array_merge($datos, [
                'local_nombre' => $descLocal,
                'local_encontrado' => $localVotacionId ? 'Sí' : ($descLocal ? 'No encontrado' : '—'),
            ]);

            if (! $this->soloPreview) {
                Votante::create(array_merge($datos, [
                    'usuario_carga_id' => $this->usuarioCargaId,
                ]));
                $this->importados++;
            }
        }
    }

    private function buscarLocal(string $nombre): ?LocalVotacion
    {
        if ($this->localesCache === null) {
            $this->localesCache = LocalVotacion::all();
        }
        return $this->localesCache->first(
            fn($l) => mb_strtolower(trim($l->nombre_local)) === mb_strtolower($nombre)
        );
    }

    private function parseFecha(mixed $valor): ?string
    {
        if (empty($valor)) return null;

        // Si es número (Excel serial date)
        if (is_numeric($valor)) {
            try {
                $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $valor);
                return $date->format('Y-m-d');
            } catch (\Exception) {
                return null;
            }
        }

        // Si es string, intentar parse
        try {
            return \Carbon\Carbon::parse($valor)->format('Y-m-d');
        } catch (\Exception) {
            return null;
        }
    }

    public function getValidas(): array  { return $this->validas; }
    public function getErrores(): array  { return $this->errores; }
    public function getTotal(): int      { return count($this->validas) + count($this->errores); }
    public function getImportados(): int { return $this->importados; }
    public function getSaltados(): int   { return $this->saltados; }
}
