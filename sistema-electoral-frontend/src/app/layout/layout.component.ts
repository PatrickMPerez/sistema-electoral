import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; roles: string[] }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule
  ],
  template: `
<div class="app-layout">
  <!-- SIDEBAR -->
  <aside class="sidebar" [class.open]="isSidebarOpen">
    <div class="sidebar-header">
      <div class="logo">
        <span class="material-symbols-outlined logo-icon">how_to_vote</span>
        <h2>Sistema<br><span class="fw-light">Electoral</span></h2>
      </div>
      <button class="icon-btn close-sidebar-btn" (click)="isSidebarOpen = false">
        <span class="material-symbols-outlined">close_fullscreen</span>
      </button>
    </div>
    
    <div class="sidebar-user-mobile">
      <img src="https://ui-avatars.com/api/?name={{ auth.user()?.name || 'A' }}&background=635BFF&color=fff&rounded=true" alt="Avatar">
      <div class="user-info">
        <span class="user-name">{{ auth.user()?.name }}</span>
        <span class="user-role">{{ auth.user()?.role }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <h3 class="nav-heading">Navegación</h3>
      @for (item of navItems(); track item.route) {
        <a class="nav-item"
           [routerLink]="item.route"
           routerLinkActive="active"
           [title]="item.label"
           (click)="isSidebarOpen = false">
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      }
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item logout-btn" (click)="logout()">
        <span class="material-symbols-outlined">logout</span>
        <span class="nav-label">Cerrar Sesión</span>
      </button>
    </div>
  </aside>

  <!-- Overlay on mobile -->
  @if (isSidebarOpen) {
    <div class="sidebar-overlay" (click)="isSidebarOpen = false"></div>
  }

  <!-- MAIN WRAPPER -->
  <div class="main-wrapper">
    <!-- TOPBAR -->
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn menu-toggle-btn" (click)="isSidebarOpen = true">
          <span class="material-symbols-outlined">menu_open</span>
        </button>
        <div class="page-title-modern">{{ pageTitle() }}</div>
      </div>

      <div class="topbar-right">
        <div class="global-search">
          <span class="material-symbols-outlined search-icon">search</span>
          <input type="text" placeholder="Búsqueda rápida..." />
        </div>
        <button class="icon-btn notification-btn">
          <span class="material-symbols-outlined">notifications</span>
          <span class="notification-badge"></span>
        </button>
        <div class="user-profile">
          <div class="user-info text-right">
             <span class="user-name">{{ auth.user()?.name }}</span>
             <span class="user-role">{{ auth.user()?.role }}</span>
          </div>
          <img src="https://ui-avatars.com/api/?name={{ auth.user()?.name || 'A' }}&background=635BFF&color=fff&rounded=true" alt="Avatar" class="avatar-img">
        </div>
      </div>
    </header>

    <!-- CONTENT AREA -->
    <main class="content-area">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
  `,
  styles: [`
.app-layout { display: flex; height: 100vh; overflow: hidden; position: relative; }
.sidebar { width: 280px; background-color: var(--c-primary); color: #fff; display: flex; flex-direction: column; transition: transform var(--transition-normal); z-index: 100; box-shadow: var(--shadow-lg); }
.sidebar-header { height: 70px; padding: 0 var(--space-md); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.logo { display: flex; align-items: center; gap: var(--space-sm); }
.logo-icon { font-size: 32px; color: var(--c-secondary); }
.logo h2 { font-size: 1.1rem; line-height: 1.1; color: #fff; letter-spacing: 0.5px; margin: 0; }
.logo .fw-light { font-weight: 300; opacity: 0.8; }
.close-sidebar-btn { display: none; color: #fff; }
.sidebar-user-mobile { display: none; padding: var(--space-md); border-bottom: 1px solid rgba(255, 255, 255, 0.1); align-items: center; gap: var(--space-sm); }
.sidebar-nav { padding: var(--space-md) 0; flex: 1; overflow-y: auto; }
.nav-heading { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: rgba(255, 255, 255, 0.4); padding: 0 var(--space-lg); margin-bottom: var(--space-sm); }
.nav-item { display: flex; align-items: center; gap: var(--space-md); padding: 12px var(--space-lg); color: rgba(255, 255, 255, 0.7); font-weight: 500; border-left: 3px solid transparent; transition: all var(--transition-fast); text-decoration: none; cursor: pointer;}
.nav-item:hover, .nav-item.active { background-color: var(--c-primary-light); color: #fff; }
.nav-item.active { border-left-color: var(--c-secondary); background-color: rgba(99, 91, 255, 0.15); }
.nav-item .material-symbols-outlined { font-size: 22px; }
.sidebar-footer { padding: var(--space-md) 0; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { width: 100%; background: transparent; border: none; text-align: left; }
.logout-btn:hover { color: var(--c-danger); background-color: rgba(225, 29, 72, 0.1); }
.main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; background-color: var(--c-bg-app); }
.topbar { height: 70px; background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--c-border); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-lg); z-index: 10; }
.page-title-modern { font-family: var(--font-family-heading); font-size: 1.25rem; font-weight: 600; color: var(--c-primary); }
.topbar-left, .topbar-right { display: flex; align-items: center; gap: var(--space-md); }
.icon-btn { background: transparent; border: none; cursor: pointer; color: var(--c-text-muted); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background var(--transition-fast); position: relative; }
.icon-btn:hover { background-color: rgba(0, 0, 0, 0.05); color: var(--c-text-main); }
.menu-toggle-btn { display: none; }
.global-search { display: flex; align-items: center; background-color: #f1f5f9; border-radius: var(--radius-full); padding: 8px 16px; width: 300px; border: 1px solid transparent; transition: border-color var(--transition-fast), background var(--transition-fast); }
.global-search:focus-within { background-color: #fff; border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.1); }
.search-icon { color: var(--c-text-muted); font-size: 20px; margin-right: 8px; }
.global-search input { border: none; background: transparent; outline: none; width: 100%; font-family: inherit; font-size: 0.9rem; color: var(--c-text-main); }
.notification-btn .notification-badge { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background-color: var(--c-danger); border-radius: 50%; border: 2px solid #fff; }
.user-profile { display: flex; align-items: center; gap: 12px; border-left: 1px solid var(--c-border); padding-left: 16px; margin-left: 8px; }
.user-info { display: flex; flex-direction: column; line-height: 1.2; }
.text-right { text-align: right; }
.user-name { font-weight: 600; font-size: 0.9rem; color: var(--c-text-main); }
.user-role { font-size: 0.75rem; color: var(--c-text-muted); text-transform: capitalize; }
.avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--c-primary-light); }
.content-area { flex: 1; padding: var(--space-xl) var(--space-lg); overflow-y: auto; background: var(--c-bg-app); }
.sidebar-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 90; backdrop-filter: blur(2px); }

@media screen and (max-width: 992px) {
  .menu-toggle-btn { display: flex; }
  .sidebar { position: absolute; top: 0; bottom: 0; left: 0; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .close-sidebar-btn { display: flex; }
  .sidebar-user-mobile { display: flex; }
  .topbar-left .user-profile { display: none; }
  .global-search { display: none; }
}
@media screen and (max-width: 768px) {
  .user-profile .user-info { display: none; }
  .content-area { padding: var(--space-lg) var(--space-sm); }
}
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  
  isSidebarOpen = false;

  private allNavItems: NavItem[] = [
    { label: 'Dashboard',        icon: 'dashboard',        route: '/dashboard',        roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Votantes',         icon: 'people',           route: '/votantes',         roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Importar Excel',   icon: 'upload_file',      route: '/importar',         roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Búsqueda',         icon: 'search',           route: '/busqueda',         roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Control Votación', icon: 'how_to_vote',      route: '/control-votacion', roles: ['vedor'] },
    { label: 'Faltantes',        icon: 'person_off',       route: '/faltantes',        roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Reportes',         icon: 'assessment',       route: '/reportes',         roles: ['administrador','jefe_zona','coordinador'] },
    { label: 'Auditoría',        icon: 'history',          route: '/auditoria',        roles: ['administrador'] },
    { label: 'Configuración',    icon: 'settings',         route: '/configuracion',    roles: ['administrador'] },
  ];

  navItems = computed(() => {
    const role = this.auth.role();
    return this.allNavItems.filter(i => !role || i.roles.includes(role));
  });

  pageTitle = computed(() => {
    const url = this.router.url;
    const found = this.allNavItems.find(i => url.startsWith(i.route));
    return found?.label ?? 'Sistema Electoral';
  });

  logout(): void { this.auth.logout(); }
}
