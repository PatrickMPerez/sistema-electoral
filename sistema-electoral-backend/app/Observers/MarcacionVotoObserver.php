<?php
namespace App\Observers;
use App\Models\Auditoria;
use App\Models\MarcacionVoto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class MarcacionVotoObserver
{
    public function created(MarcacionVoto $marcacion): void
    {
        Auditoria::registrar('marcaciones_voto', $marcacion->id, 'marcar_voto', null, $marcacion->toArray(), Auth::id(), Request::ip());
    }
}
