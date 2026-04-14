<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class LocalVotacion extends Model
{
    protected $table = 'locales_votacion';
    protected $fillable = ['nombre_local', 'localidad', 'direccion', 'zona_id'];
    public function zona()     { return $this->belongsTo(Zona::class); }
    public function votantes() { return $this->hasMany(Votante::class, 'local_votacion_id'); }
}
