<?php

namespace App\Providers;

use App\Models\MarcacionVoto;
use App\Models\Votante;
use App\Observers\MarcacionVotoObserver;
use App\Observers\VotanteObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Votante::observe(VotanteObserver::class);
        MarcacionVoto::observe(MarcacionVotoObserver::class);
    }
}
