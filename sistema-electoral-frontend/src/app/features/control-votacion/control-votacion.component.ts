import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';

type Estado = 'idle' | 'buscando' | 'encontrado' | 'marcando' | 'votado' | 'ya_voto' | 'error';

@Component({
  selector: 'app-control-votacion',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="cv-wrapper">
    <mat-card class="cv-card">
      <div class="cv-header">
        <mat-icon class="cv-logo">how_to_vote</mat-icon>
        <h2>Control de Votación</h2>
        <p>Escanee o ingrese el número de orden</p>
      </div>

      <!-- Búsqueda -->
      <div class="search-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>N° Orden / Cédula</mat-label>
          <input matInput #inputRef
                 [(ngModel)]="numeroOrden"
                 (keyup.enter)="buscar()"
                 [disabled]="estado() === 'buscando' || estado() === 'marcando'"
                 autocomplete="off">
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="buscar()"
                [disabled]="!numeroOrden || estado() === 'buscando'">
          @if (estado() === 'buscando') { <mat-spinner diameter="20" color="accent"></mat-spinner> }
          @else { <mat-icon>search</mat-icon> }
          Buscar
        </button>
      </div>

      <!-- Resultado -->
      @switch (estado()) {
        @case ('encontrado') {
          <div class="result-card result-ok">
            <div class="result-header">
              <mat-icon style="color:#388e3c;font-size:48px;width:48px;height:48px">person</mat-icon>
              <div style="flex:1">
                <div class="votante-nombre">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
                <div class="info-grid">
                  <span class="info-label">Cédula</span>
                  <span class="info-value">{{ votante()?.cedula }}</span>
                  <span class="info-label">N° Orden</span>
                  <span class="info-value">{{ votante()?.numero_orden }}</span>
                  <span class="info-label">Mesa</span>
                  <span class="info-value">{{ votante()?.mesa ?? '—' }}</span>
                  @if (votante()?.departamento) {
                    <span class="info-label">Departamento</span>
                    <span class="info-value">{{ votante()?.departamento }}</span>
                  }
                  @if (votante()?.distrito) {
                    <span class="info-label">Distrito</span>
                    <span class="info-value">{{ votante()?.distrito }}</span>
                  }
                  @if (votante()?.seccional) {
                    <span class="info-label">Seccional</span>
                    <span class="info-value">{{ votante()?.seccional }}</span>
                  }
                  @if (votante()?.local_votacion) {
                    <span class="info-label">Local</span>
                    <span class="info-value">{{ votante()?.local_votacion?.nombre_local }}</span>
                  }
                </div>
              </div>
            </div>
            <div class="estado-badge pendiente">Aún no ha votado</div>
            <div class="actions-row">
              <button mat-stroked-button (click)="resetear()">Cancelar</button>
              <button mat-raised-button color="primary" (click)="marcar()" [disabled]="estado() === 'marcando'">
                <mat-icon>how_to_vote</mat-icon> Confirmar Voto
              </button>
            </div>
          </div>
        }

        @case ('marcando') {
          <div class="result-card result-ok" style="text-align:center">
            <mat-spinner diameter="48" style="margin:0 auto 16px"></mat-spinner>
            <p>Registrando voto...</p>
          </div>
        }

        @case ('votado') {
          <div class="result-card result-success">
            <mat-icon class="big-icon" style="color:#388e3c">check_circle</mat-icon>
            <div class="success-msg">¡Voto registrado exitosamente!</div>
            <div class="votante-nombre">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
            <button mat-raised-button color="primary" (click)="resetear()" style="margin-top:16px">
              <mat-icon>refresh</mat-icon> Nueva Búsqueda
            </button>
          </div>
        }

        @case ('ya_voto') {
          <div class="result-card result-warn">
            <mat-icon class="big-icon" style="color:#f57c00">warning</mat-icon>
            <div class="warn-msg">Este votante ya ejerció su voto</div>
            <div class="votante-nombre">{{ votante()?.nombres }} {{ votante()?.apellidos }}</div>
            <div class="votante-info" style="color:#666">Cédula: {{ votante()?.cedula }}</div>
            <button mat-stroked-button (click)="resetear()" style="margin-top:16px">
              <mat-icon>refresh</mat-icon> Nueva Búsqueda
            </button>
          </div>
        }

        @case ('error') {
          <div class="result-card result-error">
            <mat-icon class="big-icon" style="color:#c62828">error_outline</mat-icon>
            <div class="error-msg">{{ errorMsg() }}</div>
            <button mat-stroked-button (click)="resetear()" style="margin-top:16px">
              <mat-icon>refresh</mat-icon> Intentar de nuevo
            </button>
          </div>
        }
      }
    </mat-card>
  </div>
  `,
  styles: [`
    .cv-wrapper { display:flex; justify-content:center; padding:16px; }
    .cv-card { width:100%; max-width:520px; border-radius:12px !important; overflow:hidden; }
    .cv-header { text-align:center; background:#1a237e; color:white; padding:24px; }
    .cv-logo { font-size:48px; width:48px; height:48px; color:#ffeb3b; }
    .cv-header h2 { margin:8px 0 4px; font-size:22px; }
    .cv-header p  { margin:0; opacity:.8; font-size:14px; }
    .search-row { display:flex; gap:12px; align-items:center; padding:24px 24px 8px; }
    .search-field { flex:1; }
    .result-card { padding:24px; margin:16px 24px 24px; border-radius:8px; }
    .result-ok   { background:#e8f5e9; border:2px solid #a5d6a7; }
    .result-success { background:#e8f5e9; border:2px solid #388e3c; text-align:center; }
    .result-warn { background:#fff8e1; border:2px solid #ffcc02; text-align:center; }
    .result-error { background:#ffebee; border:2px solid #ef9a9a; text-align:center; }
    .result-header { display:flex; gap:16px; align-items:flex-start; margin-bottom:16px; }
    .votante-nombre { font-size:20px; font-weight:700; margin-bottom:8px; }
    .votante-info { font-size:14px; color:#555; margin-top:2px; }
    .info-grid { display:grid; grid-template-columns:auto 1fr; gap:2px 12px; font-size:13px; }
    .info-label { color:#777; white-space:nowrap; }
    .info-value { font-weight:600; color:#222; }
    .estado-badge { display:inline-block; padding:4px 14px; border-radius:16px; font-size:13px; font-weight:600; margin-bottom:16px; }
    .pendiente  { background:#fff8e1; color:#f57c00; }
    .actions-row { display:flex; gap:12px; justify-content:flex-end; }
    .big-icon { font-size:64px; width:64px; height:64px; display:block; margin:0 auto 12px; }
    .success-msg { font-size:18px; font-weight:700; color:#388e3c; margin-bottom:8px; }
    .warn-msg    { font-size:18px; font-weight:700; color:#f57c00; margin-bottom:8px; }
    .error-msg   { font-size:16px; color:#c62828; margin-bottom:8px; }
  `]
})
export class ControlVotacionComponent {
  private api = inject(ApiService);

  @ViewChild('inputRef') inputRef!: ElementRef;

  numeroOrden = '';
  estado  = signal<Estado>('idle');
  votante = signal<any>(null);
  errorMsg = signal('');

  buscar(): void {
    if (!this.numeroOrden.trim()) return;
    this.estado.set('buscando');
    this.api.buscarVotante(this.numeroOrden.trim()).subscribe({
      next: res => {
        this.votante.set(res.votante ?? res);
        const yaVoto = res.ya_voto ?? res.votante?.estado_votacion === 'ya_voto';
        this.estado.set(yaVoto ? 'ya_voto' : 'encontrado');
      },
      error: err => {
        this.errorMsg.set(err?.error?.message ?? 'Votante no encontrado');
        this.estado.set('error');
      }
    });
  }

  marcar(): void {
    this.estado.set('marcando');
    // En el backend se requiere numero_orden. Obtenemos el numero de la variable o del objeto votante
    this.api.marcarVoto(this.votante().numero_orden || this.numeroOrden).subscribe({
      next: () => this.estado.set('votado'),
      error: err => {
        if (err.status === 409) { this.estado.set('ya_voto'); }
        else {
          this.errorMsg.set(err?.error?.message ?? 'Error al registrar voto');
          this.estado.set('error');
        }
      }
    });
  }

  resetear(): void {
    this.estado.set('idle');
    this.votante.set(null);
    this.numeroOrden = '';
    this.errorMsg.set('');
    setTimeout(() => this.inputRef?.nativeElement?.focus(), 100);
  }
}
