<?php
namespace App\Observers;
use App\Models\Auditoria;
use App\Models\Votante;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class VotanteObserver
{
    public function created(Votante $votante): void
    {
        Auditoria::registrar('votantes', $votante->id, 'crear', null, $votante->toArray(), Auth::id(), Request::ip());
    }

    public function updated(Votante $votante): void
    {
        Auditoria::registrar('votantes', $votante->id, 'editar', $votante->getOriginal(), $votante->getDirty(), Auth::id(), Request::ip());
    }

    public function deleted(Votante $votante): void
    {
        Auditoria::registrar('votantes', $votante->id, 'eliminar', $votante->toArray(), null, Auth::id(), Request::ip());
    }
}
