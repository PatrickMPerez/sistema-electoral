<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Zona extends Model
{
    protected $fillable = ['nombre_zona', 'jefe_zona_id', 'activo'];
    protected $casts = ['activo' => 'boolean'];
    public function jefeZona()      { return $this->belongsTo(JefeZona::class); }
    public function coordinadores() { return $this->hasMany(Coordinador::class); }
    public function locales()       { return $this->hasMany(LocalVotacion::class); }
    public function votantes()      { return $this->hasMany(Votante::class); }
}
