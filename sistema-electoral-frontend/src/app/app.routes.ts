import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },

      {
        path: 'votantes',
        loadComponent: () => import('./features/votantes/votantes.component').then(m => m.VotantesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },

      {
        path: 'importar',
        loadComponent: () => import('./features/importar/importar.component').then(m => m.ImportarComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },

      {
        path: 'busqueda',
        loadComponent: () => import('./features/busqueda/busqueda.component').then(m => m.BusquedaComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },

      {
        path: 'control-votacion',
        loadComponent: () => import('./features/control-votacion/control-votacion.component').then(m => m.ControlVotacionComponent),
        canActivate: [roleGuard],
        data: { roles: ['vedor'] }
      },

      {
        path: 'faltantes',
        loadComponent: () => import('./features/faltantes/faltantes.component').then(m => m.FaltantesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },

      {
        path: 'auditoria',
        loadComponent: () => import('./features/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador'] }
      },

      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador', 'jefe_zona'] }
      },

      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
        canActivate: [roleGuard],
        data: { roles: ['administrador','jefe_zona','coordinador'] }
      },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
