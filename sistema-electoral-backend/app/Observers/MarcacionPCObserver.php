<?php
namespace App\Observers;
use App\Models\Auditoria;
use App\Models\MarcacionPC;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class MarcacionPCObserver
{
    public function created(MarcacionPC $marcacion): void
    {
        Auditoria::registrar('marcaciones_pc', $marcacion->id, 'marcar_pc', null, $marcacion->toArray(), Auth::id(), Request::ip());
    }
}
