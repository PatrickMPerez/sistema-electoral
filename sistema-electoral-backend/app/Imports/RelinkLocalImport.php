<?php
namespace App\Imports;

use App\Models\LocalVotacion;
use App\Models\Votante;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RelinkLocalImport implements ToCollection, WithHeadingRow
{
    private int   $actualizados = 0;
    private int   $creados      = 0;
    private int   $sinLocal     = 0;
    private int   $noEncontrado = 0;
    private ?Collection $localesCache = null;

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $r = $row->toArray();

            $cedula    = trim($r['numero_ced'] ?? $r['numero_ce'] ?? $r['cedula'] ?? '');
            $descLocal = trim(
                $r['desc_locanr'] ?? $r['desc_local'] ?? $r['local_votacion'] ??
                $r['nombre_local'] ?? $r['establecimiento'] ?? ''
            );

            if ($cedula === '') continue;

            $votante = Votante::where('cedula', $cedula)->first();
            if (! $votante) {
                $this->noEncontrado++;
                continue;
            }

            if ($descLocal === '') {
                $this->sinLocal++;
                continue;
            }

            $local = $this->buscarOCrearLocal($descLocal);
            $votante->update(['local_votacion_id' => $local->id]);
            $this->actualizados++;
        }
    }

    private function buscarOCrearLocal(string $nombre): LocalVotacion
    {
        if ($this->localesCache === null) {
            $this->localesCache = LocalVotacion::all();
        }

        $norm = $this->normalizar($nombre);
        $encontrado = $this->localesCache->first(
            fn($l) => $this->normalizar($l->nombre_local) === $norm
        );

        if ($encontrado) {
            return $encontrado;
        }

        // No existe — crear automáticamente con el nombre tal como viene del Excel
        $nuevo = LocalVotacion::create(['nombre_local' => $nombre]);
        $this->localesCache->push($nuevo);
        $this->creados++;
        return $nuevo;
    }

    /** Quita tildes, normaliza Nº/N°, elimina puntuación extra */
    private function normalizar(string $s): string
    {
        $s = mb_strtoupper(trim($s));
        $s = str_replace(['Nº', 'N°', 'Nro.', 'NRO'], 'N', $s);
        $s = preg_replace('/[""\'"`]/u', '', $s);
        $s = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $s);
        $s = preg_replace('/\s+/', ' ', $s);
        $s = trim($s);
        // Quitar tildes
        $s = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s) ?: $s;
        return $s;
    }

    public function getActualizados(): int { return $this->actualizados; }
    public function getCreados(): int      { return $this->creados; }
    public function getSinLocal(): int     { return $this->sinLocal; }
    public function getNoEncontrado(): int { return $this->noEncontrado; }
}
