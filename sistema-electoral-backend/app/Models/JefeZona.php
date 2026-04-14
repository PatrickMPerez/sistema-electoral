<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class JefeZona extends Model
{
    protected $table = 'jefes_zona';
    protected $fillable = ['nombre_completo', 'cedula', 'telefono', 'activo'];
    protected $casts = ['activo' => 'boolean'];
    public function zonas()         { return $this->hasMany(Zona::class); }
    public function coordinadores() { return $this->hasMany(Coordinador::class); }
    public function votantes()      { return $this->hasMany(Votante::class); }
}
