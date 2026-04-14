<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Coordinador extends Model
{
    protected $table = 'coordinadores';
    protected $fillable = ['nombre_completo', 'cedula', 'telefono', 'zona_id', 'jefe_zona_id', 'activo'];
    protected $casts = ['activo' => 'boolean'];
    public function zona()     { return $this->belongsTo(Zona::class); }
    public function jefeZona() { return $this->belongsTo(JefeZona::class); }
    public function votantes() { return $this->hasMany(Votante::class); }
}
