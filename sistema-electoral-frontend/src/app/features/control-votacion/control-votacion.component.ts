import { Component, OnInit, inject, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

type Estado = 'setup' | 'idle' | 'buscando' | 'encontrado' | 'marcando' | 'votado' | 'ya_voto' | 'error';

@Component({
  selector: 'app-control-votacion',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
  <div class="cv-wrapper">
    <mat-card class="cv-card">

      <!-- ══ Encabezado ══ -->
      <div class="cv-header">
        <mat-icon class="cv-logo">how_to_vote</mat-icon>
        <h2>Control de Votación</h2>
        <div class="cv-user-info">
          <span class="cv-veedor">{{ user()?.name }}</span>
          @if (mesaActiva()) {
            <span class="cv-mesa-badge">
              <mat-icon class="icon-sm">table_restaurant</mat-icon>
              Mesa {{ mesaActiva() }}
            </span>
          }
        </div>
      </div>

      <!-- ══ PASO 1: Ingresar mesa ══ -->
      @if (estado() === 'setup') {
        <div class="setup-section">
          <div class="setup-icon">
            <mat-icon>table_restaurant</mat-icon>
          </div>
          <h3 class="setup-title">Ingrese su número de mesa</h3>
          <p class="setup-hint">
            Indique la mesa donde está operando.<br>
            Solo podrá registrar votos de esa mesa.
          </p>

          <mat-form-field appearance="outline" class="mesa-field">
            <mat-label>Número de Mesa</mat-label>
            <mat-icon matPrefix>tag</mat-icon>
            <input matInput #mesaRef
                   [(ngModel)]="mesaInput"
                   (keyup.enter)="confirmarMesa()"
                   placeholder="Ej: 1, 2, 15..."
                   autocomplete="off"
                   inputmode="numeric">
          </mat-form-field>

          @if (errorSetup()) {
            <div class="setup-error">
              <mat-icon>warning</mat-icon> {{ errorSetup() }}
            </div>
          }

          <button mat-raised-button color="primary" class="btn-confirmar"
                  (click)="confirmarMesa()"
                  [disabled]="!mesaInput.trim()">
            <mat-icon>check_circle</mat-icon>
            Confirmar Mesa
          </button>
        </div>
      }

      <!-- ══ PASO 2: Registro de voto ══ -->
      @if (estado() !== 'setup') {
        <!-- Barra con mesa activa + botón cambiar -->
        <div class="mesa-bar">
          <div class="mesa-bar-left">
            <mat-icon>table_restaurant</mat-icon>
            <span>Mesa <strong>{{ mesaActiva() }}</strong></span>
          </div>
          <button mat-button color="warn" class="btn-cambiar-mesa" (click)="cambiarMesa()">
            <mat-icon>edit</mat-icon> Cambiar mesa
          </button>
        </div>

        <!-- Formulario de búsqueda -->
        <div class="search-section">
          <div class="search-fields">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>N° de Orden</mat-label>
              <mat-icon matPrefix>tag</mat-icon>
              <input matInput #ordenRef
                     [(ngModel)]="numeroOrden"
                     (keyup.enter)="focusCedula()"
                     [disabled]="buscando()"
                     placeholder="Ej: 125"
                     autocomplete="off"
                     inputmode="numeric">
            </mat-form-field>

            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Número de Cédula</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <input matInput #cedulaRef
                     [(ngModel)]="cedula"
                     (keyup.enter)="buscar()"
                     [disabled]="buscando()"
                     placeholder="Ej: 1234567"
                     autocomplete="off"
                     inputmode="numeric">
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" class="btn-buscar"
                  (click)="buscar()"
                  [disabled]="!puedeSearch || buscando()">
            @if (buscando()) {
              <mat-spinner diameter="20" color="accent"></mat-spinner>
            } @else {
              <mat-icon>search</mat-icon>
            }
            Buscar
          </button>
        </div>

        <!-- ── Resultados ── -->
        @switch (estado()) {

          @case ('encontrado') {
            <div class="result-card result-ok">
              <div class="result-header">
                <div class="avatar-circle ok">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="voter-main">
                  <div class="voter-nombre">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
                  <div class="voter-sub">CI: {{ votante()?.cedula }}</div>
                </div>
                <span class="status-badge pendiente">No votó</span>
              </div>

              <mat-divider style="margin:12px 0"></mat-divider>

              <div class="info-grid">
                <span class="info-label">N° Orden</span>
                <span class="info-value">{{ votante()?.numero_orden }}</span>
                <span class="info-label">Mesa</span>
                <span class="info-value fw">{{ votante()?.mesa ?? '—' }}</span>
                @if (votante()?.seccional) {
                  <span class="info-label">Seccional</span>
                  <span class="info-value">{{ votante()?.seccional }}</span>
                }
                @if (votante()?.local_votacion) {
                  <span class="info-label">Local</span>
                  <span class="info-value">{{ votante()?.local_votacion?.nombre_local }}</span>
                }
                @if (votante()?.distrito) {
                  <span class="info-label">Distrito</span>
                  <span class="info-value">{{ votante()?.distrito }}</span>
                }
              </div>

              <div class="actions-row">
                <button mat-stroked-button (click)="resetearBusqueda()">
                  <mat-icon>close</mat-icon> Cancelar
                </button>
                <button mat-raised-button color="primary" (click)="marcar()">
                  <mat-icon>how_to_vote</mat-icon> Confirmar Voto
                </button>
              </div>
            </div>
          }

          @case ('marcando') {
            <div class="result-card result-ok centered">
              <mat-spinner diameter="48" style="margin:0 auto 16px"></mat-spinner>
              <p class="muted">Registrando voto...</p>
            </div>
          }

          @case ('votado') {
            <div class="result-card result-success centered">
              <div class="avatar-circle success">
                <mat-icon>check</mat-icon>
              </div>
              <div class="success-msg">¡Voto registrado!</div>
              <div class="voter-nombre" style="margin:4px 0 16px">
                {{ votante()?.nombres }} {{ votante()?.apellidos }}
              </div>
              <button mat-raised-button color="primary" (click)="resetearBusqueda()">
                <mat-icon>refresh</mat-icon> Nueva búsqueda
              </button>
            </div>
          }

          @case ('ya_voto') {
            <div class="result-card result-warn centered">
              <div class="avatar-circle warn">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="warn-msg">Este votante ya ejerció su voto</div>
              <div class="voter-nombre" style="margin:4px 0 4px">
                {{ votante()?.nombres }} {{ votante()?.apellidos }}
              </div>
              <div class="muted" style="font-size:13px;margin-bottom:16px">
                CI: {{ votante()?.cedula }}
              </div>
              <button mat-stroked-button (click)="resetearBusqueda()">
                <mat-icon>refresh</mat-icon> Nueva búsqueda
              </button>
            </div>
          }

          @case ('error') {
            <div class="result-card" [class]="esMesaIncorrecta() ? 'result-mesa-error' : 'result-error'">
              <div class="result-error-content centered">
                <div class="avatar-circle" [class]="esMesaIncorrecta() ? 'mesa-err' : 'error'">
                  <mat-icon>{{ esMesaIncorrecta() ? 'table_restaurant' : 'error_outline' }}</mat-icon>
                </div>
                <div [class]="esMesaIncorrecta() ? 'mesa-err-msg' : 'error-msg'">
                  {{ errorMsg() }}
                </div>
                @if (esMesaIncorrecta()) {
                  <p class="muted" style="margin:4px 0 16px">
                    Vuelva a ingresar el número de su mesa correcta.
                  </p>
                  <button mat-raised-button color="primary" (click)="cambiarMesa()">
                    <mat-icon>table_restaurant</mat-icon> Reingresar mi mesa
                  </button>
                } @else {
                  <button mat-stroked-button (click)="resetearBusqueda()" style="margin-top:16px">
                    <mat-icon>refresh</mat-icon> Intentar de nuevo
                  </button>
                }
              </div>
            </div>
          }

        }
      }

    </mat-card>
  </div>
  `,
  styles: [`
    .cv-wrapper {
      display: flex;
      justify-content: center;
      padding: 16px;
    }
    .cv-card {
      width: 100%;
      max-width: 560px;
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
    }

    /* ── Encabezado ── */
    .cv-header {
      text-align: center;
      background: #1a237e;
      color: white;
      padding: 24px 24px 18px;
    }
    .cv-logo { font-size: 48px; width: 48px; height: 48px; color: #ffeb3b; }
    .cv-header h2 { margin: 8px 0 10px; font-size: 22px; }
    .cv-user-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .cv-veedor { font-size: 14px; opacity: .85; }
    .cv-mesa-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ffeb3b;
      color: #1a237e;
      font-weight: 700;
      font-size: 13px;
      padding: 3px 10px;
      border-radius: 20px;
    }
    .icon-sm { font-size: 14px !important; width: 14px !important; height: 14px !important; }

    /* ── Setup de mesa ── */
    .setup-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 28px 28px;
      text-align: center;
    }
    .setup-icon {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: #e8eaf6;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .setup-icon mat-icon { font-size: 36px; width: 36px; height: 36px; color: #1a237e; }
    .setup-title { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #1a237e; }
    .setup-hint { margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.5; }
    .mesa-field { width: 100%; max-width: 260px; }
    .setup-error {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #b71c1c;
      font-size: 13px;
      margin: 8px 0 12px;
    }
    .btn-confirmar {
      margin-top: 8px;
      width: 100%;
      max-width: 260px;
      height: 44px;
      font-size: 15px;
    }

    /* ── Barra de mesa activa ── */
    .mesa-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: #e8eaf6;
      border-bottom: 1px solid #c5cae9;
      font-size: 14px;
      color: #1a237e;
    }
    .mesa-bar-left {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .mesa-bar-left mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn-cambiar-mesa { font-size: 12px; padding: 0 8px; }

    /* ── Formulario de búsqueda ── */
    .search-section {
      padding: 18px 24px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .search-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .search-field { width: 100%; }
    .btn-buscar {
      width: 100%;
      height: 44px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    /* ── Tarjetas de resultado ── */
    .result-card {
      margin: 12px 24px 24px;
      padding: 20px;
      border-radius: 10px;
    }
    .result-ok         { background: #f1f8e9; border: 2px solid #aed581; }
    .result-success    { background: #e8f5e9; border: 2px solid #66bb6a; }
    .result-warn       { background: #fff8e1; border: 2px solid #ffd54f; }
    .result-error      { background: #ffebee; border: 2px solid #ef9a9a; }
    .result-mesa-error { background: #fce4ec; border: 2px solid #f48fb1; }
    .centered { text-align: center; }
    .result-error-content { display: flex; flex-direction: column; align-items: center; }

    /* ── Avatar ── */
    .result-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 4px;
    }
    .avatar-circle {
      width: 54px; height: 54px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .avatar-circle mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .avatar-circle.ok       { background: #c8e6c9; color: #2e7d32; }
    .avatar-circle.success  { background: #a5d6a7; color: #1b5e20; }
    .avatar-circle.warn     { background: #ffe082; color: #e65100; }
    .avatar-circle.error    { background: #ffcdd2; color: #b71c1c; }
    .avatar-circle.mesa-err { background: #f8bbd0; color: #880e4f; }

    /* ── Info votante ── */
    .voter-main { flex: 1; min-width: 0; }
    .voter-nombre { font-size: 18px; font-weight: 700; color: #1a237e; }
    .voter-sub { font-size: 13px; color: #666; margin-top: 2px; }
    .status-badge {
      padding: 4px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }
    .pendiente { background: #fff3e0; color: #e65100; }

    .info-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .info-label { color: #777; }
    .info-value { font-weight: 600; color: #222; }
    .fw { color: #1a237e; font-size: 15px; }

    .actions-row {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    /* ── Mensajes ── */
    .success-msg  { font-size: 20px; font-weight: 700; color: #2e7d32; margin: 12px 0 4px; }
    .warn-msg     { font-size: 18px; font-weight: 700; color: #e65100; margin: 12px 0 4px; }
    .error-msg    { font-size: 15px; color: #b71c1c; font-weight: 600; margin: 12px 0 4px; text-align: center; }
    .mesa-err-msg { font-size: 15px; color: #880e4f; font-weight: 600; margin: 12px 0 4px; text-align: center; }
    .muted        { color: #777; font-size: 14px; }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .cv-wrapper { padding: 8px; }
      .search-fields { grid-template-columns: 1fr; }
      .search-section { padding: 14px 16px 8px; }
      .result-card { margin: 8px 16px 16px; padding: 16px; }
      .result-header { flex-wrap: wrap; }
      .actions-row { flex-direction: column; }
      .actions-row button { width: 100%; }
      .voter-nombre { font-size: 16px; }
      .setup-section { padding: 24px 20px; }
    }
  `]
})
export class ControlVotacionComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  @ViewChild('mesaRef')  mesaRef!:  ElementRef;
  @ViewChild('ordenRef') ordenRef!: ElementRef;
  @ViewChild('cedulaRef') cedulaRef!: ElementRef;

  user = this.auth.user;

  estado    = signal<Estado>('setup');
  votante   = signal<any>(null);
  errorMsg  = signal('');
  errorSetup = signal('');
  mesaActiva = signal('');

  numeroOrden = '';
  cedula      = '';
  mesaInput   = '';

  buscando    = computed(() => this.estado() === 'buscando');
  get puedeSearch(): boolean { return this.numeroOrden.trim().length > 0 || this.cedula.trim().length > 0; }
  esMesaIncorrecta = computed(() => this._esMesaIncorrecta);

  private _esMesaIncorrecta = false;

  ngOnInit(): void {
    // Si el admin pre-asignó mesa al usuario, saltar el setup
    const mesaPreAsignada = this.user()?.mesa;
    if (mesaPreAsignada) {
      this.mesaActiva.set(mesaPreAsignada);
      this.estado.set('idle');
    } else {
      this.estado.set('setup');
      setTimeout(() => this.mesaRef?.nativeElement?.focus(), 150);
    }
  }

  confirmarMesa(): void {
    const m = this.mesaInput.trim();
    if (!m) {
      this.errorSetup.set('Ingrese el número de mesa para continuar.');
      return;
    }
    this.errorSetup.set('');
    this.mesaActiva.set(m);
    this.mesaInput = '';
    this.estado.set('idle');
    setTimeout(() => this.ordenRef?.nativeElement?.focus(), 150);
  }

  cambiarMesa(): void {
    this._esMesaIncorrecta = false;
    this.mesaActiva.set('');
    this.mesaInput = '';
    this.errorSetup.set('');
    this.resetearBusqueda();
    this.estado.set('setup');
    setTimeout(() => this.mesaRef?.nativeElement?.focus(), 150);
  }

  focusCedula(): void {
    this.cedulaRef?.nativeElement?.focus();
  }

  buscar(): void {
    if (!this.puedeSearch) return;
    this._esMesaIncorrecta = false;
    this.estado.set('buscando');
    this.api.buscarVotante({
      numero_orden: this.numeroOrden.trim(),
      cedula:       this.cedula.trim(),
      mesa:         this.mesaActiva(),
    }).subscribe({
      next: res => {
        this.votante.set(res);
        this.estado.set(res.estado_votacion === 'ya_voto' ? 'ya_voto' : 'encontrado');
      },
      error: err => {
        const esMesa = err?.error?.code === 'mesa_incorrecta' || err?.status === 403;
        this._esMesaIncorrecta = esMesa;
        this.errorMsg.set(err?.error?.message ?? 'No se pudo encontrar al votante.');
        this.estado.set('error');
      }
    });
  }

  marcar(): void {
    this.estado.set('marcando');
    this.api.marcarVoto({
      numero_orden: this.votante().numero_orden,
      cedula:       this.votante().cedula,
      mesa:         this.mesaActiva(),
    }).subscribe({
      next: () => this.estado.set('votado'),
      error: err => {
        if (err.status === 409) {
          this.estado.set('ya_voto');
        } else if (err.status === 403) {
          this._esMesaIncorrecta = true;
          this.errorMsg.set(err?.error?.message ?? 'Mesa incorrecta.');
          this.estado.set('error');
        } else {
          this._esMesaIncorrecta = false;
          this.errorMsg.set(err?.error?.message ?? 'Error al registrar el voto.');
          this.estado.set('error');
        }
      }
    });
  }

  resetearBusqueda(): void {
    if (this.estado() !== 'setup') {
      this.estado.set('idle');
    }
    this.votante.set(null);
    this.numeroOrden = '';
    this.cedula      = '';
    this.errorMsg.set('');
    this._esMesaIncorrecta = false;
    setTimeout(() => this.ordenRef?.nativeElement?.focus(), 100);
  }
}
