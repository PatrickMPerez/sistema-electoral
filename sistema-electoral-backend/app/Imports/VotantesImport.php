<?php
namespace App\Imports;
use App\Models\Votante;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class VotantesImport implements ToCollection, WithHeadingRow
{
    private bool $soloPreview;
    private ?int $usuarioCargaId;
    private array $validas   = [];
    private array $errores   = [];
    private int $importados  = 0;
    private int $saltados    = 0;

    public function __construct(bool $soloPreview = true, ?int $usuarioCargaId = null)
    {
        $this->soloPreview    = $soloPreview;
        $this->usuarioCargaId = $usuarioCargaId;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $fila = $index + 2;
            $erroresFila = [];

            // Campos obligatorios del padrón electoral
            if (empty($row['cedula']))           $erroresFila[] = 'Cédula requerida';
            if (empty($row['nombres']))          $erroresFila[] = 'Nombres requeridos';
            if (empty($row['apellidos']))        $erroresFila[] = 'Apellidos requeridos';
            if (empty($row['departamento']))     $erroresFila[] = 'Departamento requerido';
            if (empty($row['distrito']))         $erroresFila[] = 'Distrito requerido';
            if (empty($row['seccional']))        $erroresFila[] = 'Seccional requerida';
            if (empty($row['local_votacion_id'])) $erroresFila[] = 'local_votacion_id requerido';
            if (empty($row['mesa']))             $erroresFila[] = 'Mesa requerida';
            if (empty($row['numero_orden']))     $erroresFila[] = 'Número de orden requerido';
            if (empty($row['zona_id']))          $erroresFila[] = 'zona_id requerido';
            if (empty($row['coordinador_id']))   $erroresFila[] = 'coordinador_id requerido';

            if (! empty($erroresFila)) {
                $this->errores[] = ['fila' => $fila, 'errores' => $erroresFila, 'datos' => $row->toArray()];
                continue;
            }

            if (Votante::where('cedula', $row['cedula'])->exists()) {
                $this->saltados++;
                $this->errores[] = ['fila' => $fila, 'errores' => ['Cédula duplicada'], 'datos' => $row->toArray()];
                continue;
            }

            $this->validas[] = $row->toArray();

            if (! $this->soloPreview) {
                $nombres   = trim($row['nombres']);
                $apellidos = trim($row['apellidos']);

                Votante::create([
                    'nombres'          => $nombres,
                    'apellidos'        => $apellidos,
                    'nombre_completo'  => $nombres . ' ' . $apellidos,
                    'cedula'           => $row['cedula'],
                    'telefono'         => $row['telefono'] ?? null,
                    'localidad'        => $row['localidad'] ?? null,
                    'departamento'     => $row['departamento'],
                    'distrito'         => $row['distrito'],
                    'seccional'        => $row['seccional'],
                    'mesa'             => (int) $row['mesa'],
                    'numero_orden'     => (int) $row['numero_orden'],
                    'local_votacion_id'=> (int) $row['local_votacion_id'],
                    'zona_id'          => (int) $row['zona_id'],
                    'coordinador_id'   => (int) $row['coordinador_id'],
                    'jefe_zona_id'     => isset($row['jefe_zona_id']) ? (int) $row['jefe_zona_id'] : null,
                    'movimiento_id'    => isset($row['movimiento_id']) ? (int) $row['movimiento_id'] : null,
                    'usuario_carga_id' => $this->usuarioCargaId,
                ]);
                $this->importados++;
            }
        }
    }

    public function getValidas(): array   { return $this->validas; }
    public function getErrores(): array   { return $this->errores; }
    public function getTotal(): int       { return count($this->validas) + count($this->errores); }
    public function getImportados(): int  { return $this->importados; }
    public function getSaltados(): int    { return $this->saltados; }
}
