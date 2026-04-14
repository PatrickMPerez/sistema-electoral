<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MarcacionVoto extends Model
{
    protected $table = 'marcaciones_voto';
    protected $fillable = [
        'votante_id', 'numero_orden', 'fecha_hora_marcacion',
        'usuario_veedor_id', 'mesa', 'observacion', 'ip_address',
    ];
    protected $casts = ['fecha_hora_marcacion' => 'datetime'];

    public function votante()      { return $this->belongsTo(Votante::class); }
    public function usuarioVeedor(){ return $this->belongsTo(User::class, 'usuario_veedor_id'); }
}
