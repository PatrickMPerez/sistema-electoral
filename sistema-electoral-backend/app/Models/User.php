<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password',
        'role', 'activo', 'zona_id', 'jefe_zona_id', 'coordinador_id', 'veedor_id', 'mesa',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'activo'   => 'boolean',
        ];
    }

    public function isAdmin(): bool       { return $this->role === 'administrador'; }
    public function isJefeZona(): bool    { return $this->role === 'jefe_zona'; }
    public function isCoordinador(): bool { return $this->role === 'coordinador'; }
    public function isVedor(): bool       { return $this->role === 'vedor'; }

    public function zona()        { return $this->belongsTo(Zona::class); }
    public function jefeZona()    { return $this->belongsTo(JefeZona::class); }
    public function coordinador() { return $this->belongsTo(Coordinador::class); }
    public function veedor()      { return $this->belongsTo(Veedor::class); }
    public function marcaciones(): HasMany { return $this->hasMany(MarcacionVoto::class, 'usuario_veedor_id'); }
    public function auditoria(): HasMany   { return $this->hasMany(Auditoria::class, 'usuario_id'); }
}
