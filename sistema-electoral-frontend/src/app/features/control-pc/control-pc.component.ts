import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type Estado = 'idle' | 'buscando' | 'encontrado' | 'ya_paso' | 'marcando' | 'marcado' | 'error';
type Filtro = '' | 'pendiente' | 'paso_pc';

@Component({
  selector: 'app-control-pc',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
  <div class="pc-wrapper">
    <mat-card class="pc-card">

      <div class="pc-header">
        <mat-icon class="pc-logo">redeem</mat-icon>
        <h2>Puesto de Comando</h2>
        <span class="pc-user">{{ user()?.name }}</span>
      </div>

      <!-- Búsqueda -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Número de Cédula</mat-label>
          <mat-icon matPrefix>badge</mat-icon>
          <input matInput #cedulaRef
                 [(ngModel)]="cedula"
                 (keyup.enter)="buscar()"
                 [disabled]="estado() === 'buscando' || estado() === 'marcando'"
                 placeholder="Ej: 1234567"
                 autocomplete="off"
                 inputmode="numeric">
        </mat-form-field>
        <button mat-raised-button color="primary" class="btn-buscar"
                (click)="buscar()"
                [disabled]="!cedula.trim() || estado() === 'buscando' || estado() === 'marcando'">
          @if (estado() === 'buscando') {
            <mat-spinner diameter="20" color="accent"></mat-spinner>
          } @else {
            <mat-icon>search</mat-icon>
          }
          Buscar
        </button>
      </div>

      <!-- Resultados -->
      @switch (estado()) {

        @case ('encontrado') {
          <div class="result-card result-ok">
            <div class="result-header">
              <div class="avatar-circle ok"><mat-icon>person</mat-icon></div>
              <div class="voter-main">
                <div class="voter-nombre">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
                <div class="voter-sub">CI: {{ votante()?.cedula }}</div>
              </div>
              <span class="status-badge pendiente">Sin retirar</span>
            </div>
            <mat-divider style="margin:12px 0"></mat-divider>
            <div class="info-grid">
              <span class="info-label">N° Orden</span>
              <span class="info-value">{{ votante()?.numero_orden ?? '—' }}</span>
              <span class="info-label">Mesa</span>
              <span class="info-value">{{ votante()?.mesa ?? '—' }}</span>
            </div>
            <mat-checkbox [(ngModel)]="premioEntregado" style="margin-top:12px">Premio / incentivo entregado</mat-checkbox>
            <div class="actions-row">
              <button mat-stroked-button (click)="resetear()"><mat-icon>close</mat-icon> Cancelar</button>
              <button mat-raised-button color="primary" (click)="marcar()">
                <mat-icon>redeem</mat-icon> Marcar paso por PC
              </button>
            </div>
          </div>
        }

        @case ('marcando') {
          <div class="result-card result-ok centered">
            <mat-spinner diameter="48" style="margin:0 auto 16px"></mat-spinner>
            <p class="muted">Registrando...</p>
          </div>
        }

        @case ('marcado') {
          <div class="result-card result-success centered">
            <div class="avatar-circle success"><mat-icon>check</mat-icon></div>
            <div class="success-msg">¡Paso por PC registrado!</div>
            <div class="voter-nombre" style="margin:4px 0 16px">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
            <button mat-raised-button color="primary" (click)="resetear()">
              <mat-icon>refresh</mat-icon> Nueva búsqueda
            </button>
          </div>
        }

        @case ('ya_paso') {
          <div class="result-card result-error centered">
            <div class="avatar-circle error"><mat-icon>block</mat-icon></div>
            <div class="error-msg">Este elector ya retiró su incentivo</div>
            <div class="voter-nombre" style="margin:4px 0 4px">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
            <div class="muted" style="font-size:13px">CI: {{ votante()?.cedula }}</div>
            @if (votante()?.marcado_por || votante()?.marcado_en) {
              <div class="muted" style="font-size:13px;margin:8px 0 16px">
                Registrado por <strong>{{ votante()?.marcado_por ?? '—' }}</strong>
                @if (votante()?.marcado_en) { el {{ votante()?.marcado_en | date:'dd/MM/yyyy HH:mm' }} }
              </div>
            }
            <button mat-stroked-button (click)="resetear()"><mat-icon>refresh</mat-icon> Nueva búsqueda</button>
          </div>
        }

        @case ('error') {
          <div class="result-card result-error centered">
            <div class="avatar-circle error"><mat-icon>error_outline</mat-icon></div>
            <div class="error-msg">{{ errorMsg() }}</div>
            <button mat-stroked-button (click)="resetear()" style="margin-top:16px">
              <mat-icon>refresh</mat-icon> Intentar de nuevo
            </button>
          </div>
        }
      }

      <!-- Listado en tiempo real -->
      <mat-divider style="margin:8px 0 0"></mat-divider>
      <div class="list-section">
        <div class="list-head">
          <h3>Listado de electores</h3>
          <button mat-icon-button (click)="cargarListado()" title="Actualizar"><mat-icon>refresh</mat-icon></button>
        </div>
        <div class="list-filters">
          <mat-form-field appearance="outline" class="filter-search">
            <mat-label>Buscar nombre o cédula</mat-label>
            <input matInput [(ngModel)]="buscarTexto" (keyup.enter)="aplicarFiltros()" autocomplete="off">
          </mat-form-field>
          <div class="chips">
            <button class="chip" [class.active]="filtro() === ''"        (click)="setFiltro('')">Todos</button>
            <button class="chip" [class.active]="filtro() === 'pendiente'" (click)="setFiltro('pendiente')">Sin retirar</button>
            <button class="chip" [class.active]="filtro() === 'paso_pc'"   (click)="setFiltro('paso_pc')">Retiraron</button>
          </div>
        </div>

        @if (cargandoLista()) {
          <div class="centered" style="padding:16px"><mat-spinner diameter="28"></mat-spinner></div>
        } @else {
          @for (v of lista(); track v.id) {
            <div class="list-row">
              <div class="list-main">
                <div class="list-name">{{ v.nombre_completo }}</div>
                <div class="list-sub">CI {{ v.cedula }} · Mesa {{ v.mesa ?? '—' }} · Orden {{ v.numero_orden ?? '—' }}</div>
              </div>
              <span class="status-badge" [class.pendiente]="!v.paso_por_pc" [class.retiro]="v.paso_por_pc">
                {{ v.paso_por_pc ? 'Retiró' : 'Pendiente' }}
              </span>
            </div>
          } @empty {
            <p class="muted centered" style="padding:16px">Sin resultados</p>
          }
          @if (lastPage() > 1) {
            <div class="pager">
              <button mat-button [disabled]="page() <= 1" (click)="irPagina(page() - 1)"><mat-icon>chevron_left</mat-icon></button>
              <span>Página {{ page() }} de {{ lastPage() }} · {{ total() }} electores</span>
              <button mat-button [disabled]="page() >= lastPage()" (click)="irPagina(page() + 1)"><mat-icon>chevron_right</mat-icon></button>
            </div>
          }
        }
      </div>

    </mat-card>
  </div>
  `,
  styles: [`
    .pc-wrapper { display: flex; justify-content: center; padding: 16px; }
    .pc-card { width: 100%; max-width: 640px; border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; }
    .pc-header { text-align: center; background: #e65100; color: #fff; padding: 24px 24px 18px; }
    .pc-logo { font-size: 48px; width: 48px; height: 48px; color: #ffeb3b; }
    .pc-header h2 { margin: 8px 0 6px; font-size: 22px; }
    .pc-user { font-size: 14px; opacity: .9; }

    .search-section { display: flex; gap: 12px; align-items: flex-start; padding: 20px 20px 4px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 200px; }
    .btn-buscar { height: 56px; min-width: 120px; display: flex; align-items: center; gap: 6px; }

    .result-card { margin: 8px 20px 20px; padding: 18px; border-radius: 10px; border: 1px solid #ddd; }
    .result-ok { background: #f5f9ff; border-color: #90caf9; }
    .result-success { background: #e8f5e9; border-color: #81c784; }
    .result-error { background: #ffebee; border-color: #ef9a9a; }
    .centered { text-align: center; }
    .muted { color: #666; }
    .result-header { display: flex; align-items: center; gap: 12px; }
    .voter-main { flex: 1; min-width: 0; }
    .voter-nombre { font-size: 18px; font-weight: 700; }
    .voter-sub { font-size: 13px; color: #666; }
    .avatar-circle { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
    .result-header .avatar-circle { margin: 0; flex-shrink: 0; }
    .avatar-circle mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    .avatar-circle.ok { background: #1976d2; }
    .avatar-circle.success { background: #388e3c; }
    .avatar-circle.error { background: #d32f2f; }
    .success-msg { font-size: 20px; font-weight: 700; color: #2e7d32; }
    .error-msg { font-size: 18px; font-weight: 700; color: #c62828; }
    .info-grid { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-size: 14px; }
    .info-label { color: #666; }
    .info-value { font-weight: 600; }
    .actions-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; flex-wrap: wrap; }

    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .status-badge.pendiente { background: #fff3e0; color: #ef6c00; }
    .status-badge.retiro { background: #e8f5e9; color: #2e7d32; }

    .list-section { padding: 16px 20px 20px; }
    .list-head { display: flex; align-items: center; justify-content: space-between; }
    .list-head h3 { margin: 0; font-size: 16px; }
    .list-filters { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .filter-search { width: 100%; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .chip { border: 1px solid #ccc; background: #fff; border-radius: 16px; padding: 4px 14px; font-size: 13px; cursor: pointer; }
    .chip.active { background: #e65100; border-color: #e65100; color: #fff; }
    .list-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .list-main { min-width: 0; }
    .list-name { font-weight: 600; font-size: 14px; }
    .list-sub { font-size: 12px; color: #777; }
    .pager { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; font-size: 13px; }
  `]
})
export class ControlPCComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  @ViewChild('cedulaRef') cedulaRef!: ElementRef;

  user = this.auth.user;

  estado   = signal<Estado>('idle');
  votante  = signal<any>(null);
  errorMsg = signal('');

  cedula = '';
  premioEntregado = true;

  // Listado
  lista         = signal<any[]>([]);
  cargandoLista = signal(false);
  filtro        = signal<Filtro>('');
  page          = signal(1);
  lastPage      = signal(1);
  total         = signal(0);
  buscarTexto   = '';

  ngOnInit(): void {
    this.cargarListado();
    setTimeout(() => this.cedulaRef?.nativeElement?.focus(), 150);
  }

  buscar(): void {
    const cedula = this.cedula.trim();
    if (!cedula) return;
    this.estado.set('buscando');
    this.api.buscarPC(cedula).subscribe({
      next: res => {
        this.votante.set(res);
        this.premioEntregado = true;
        this.estado.set(res.paso_por_pc ? 'ya_paso' : 'encontrado');
      },
      error: err => {
        this.errorMsg.set(err?.error?.message ?? 'No se pudo encontrar al elector.');
        this.estado.set('error');
      }
    });
  }

  marcar(): void {
    this.estado.set('marcando');
    this.api.marcarPC({ cedula: this.votante().cedula, premio_entregado: this.premioEntregado }).subscribe({
      next: () => {
        this.estado.set('marcado');
        this.cargarListado();
      },
      error: err => {
        if (err.status === 422 && err?.error?.marcado_en !== undefined) {
          this.votante.update(v => ({ ...v, marcado_por: err.error.marcado_por, marcado_en: err.error.marcado_en }));
          this.estado.set('ya_paso');
        } else {
          this.errorMsg.set(err?.error?.message ?? 'Error al registrar el paso por PC.');
          this.estado.set('error');
        }
      }
    });
  }

  resetear(): void {
    this.estado.set('idle');
    this.votante.set(null);
    this.cedula = '';
    this.errorMsg.set('');
    setTimeout(() => this.cedulaRef?.nativeElement?.focus(), 100);
  }

  // ── Listado ──
  cargarListado(): void {
    this.cargandoLista.set(true);
    this.api.getListadoPC({ estado: this.filtro(), buscar: this.buscarTexto.trim(), page: this.page() }).subscribe({
      next: res => {
        this.lista.set(res.data);
        this.lastPage.set(res.last_page);
        this.total.set(res.total);
        this.cargandoLista.set(false);
      },
      error: () => this.cargandoLista.set(false)
    });
  }

  setFiltro(f: Filtro): void {
    this.filtro.set(f);
    this.page.set(1);
    this.cargarListado();
  }

  aplicarFiltros(): void {
    this.page.set(1);
    this.cargarListado();
  }

  irPagina(p: number): void {
    this.page.set(p);
    this.cargarListado();
  }
}
