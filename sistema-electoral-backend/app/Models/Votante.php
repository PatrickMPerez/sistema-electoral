<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Votante extends Model
{
    protected $table = 'votantes';
    protected $fillable = [
        'nombre_completo', 'nombres', 'apellidos',
        'cedula', 'telefono', 'localidad',
        'departamento', 'distrito', 'seccional', 'mesa',
        'numero_orden', 'estado_votacion',
        'fecha_nacimiento', 'direccion', 'fecha_afiliacion',
        'zona_id', 'coordinador_id', 'jefe_zona_id',
        'movimiento_id', 'local_votacion_id', 'usuario_carga_id',
    ];

    protected static function booted(): void
    {
        static::saving(function (Votante $votante) {
            if ($votante->nombres || $votante->apellidos) {
                $votante->nombre_completo = trim(($votante->nombres ?? '') . ' ' . ($votante->apellidos ?? ''));
            }
        });
    }

    public function zona()          { return $this->belongsTo(Zona::class); }
    public function coordinador()   { return $this->belongsTo(Coordinador::class); }
    public function jefeZona()      { return $this->belongsTo(JefeZona::class); }
    public function movimiento()    { return $this->belongsTo(Movimiento::class); }
    public function localVotacion() { return $this->belongsTo(LocalVotacion::class, 'local_votacion_id'); }
    public function usuarioCarga()  { return $this->belongsTo(User::class, 'usuario_carga_id'); }
    public function marcaciones()   { return $this->hasMany(MarcacionVoto::class); }

    public function yaVoto(): bool { return $this->estado_votacion === 'ya_voto'; }

    public function scopeFiltrarPorRol(Builder $query, User $user): Builder
    {
        return match ($user->role) {
            'jefe_zona'   => $query, // jefe_zona ve todos los votantes del padrón
            'coordinador' => $query->where(fn($q) => $q
                ->whereNull('coordinador_id')
                ->orWhere('coordinador_id', $user->coordinador_id)
            ),
            default       => $query,
        };
    }
}
