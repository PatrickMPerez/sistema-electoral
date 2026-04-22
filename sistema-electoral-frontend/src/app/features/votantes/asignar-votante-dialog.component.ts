import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Votante } from '../../core/models/votante.model';

@Component({
  selector: 'app-asignar-votante-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
  <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
    <mat-icon style="color:#1a237e">how_to_reg</mat-icon>
    Asignar Votante
  </h2>

  <mat-dialog-content style="min-width:360px;max-width:520px">

    <!-- Info del votante (solo lectura) -->
    <div class="voter-info">
      <div class="info-name">{{ votante.nombres }} {{ votante.apellidos }}</div>
      <div class="info-row">
        <span class="info-label">Cédula:</span>
        <span>{{ votante.cedula }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Departamento:</span>
        <span>{{ votante.departamento ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Distrito:</span>
        <span>{{ votante.distrito ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Seccional:</span>
        <span>{{ votante.seccional ?? '—' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mesa:</span>
        <span>{{ votante.mesa ?? '—' }}</span>
      </div>
      @if (votante.local_votacion) {
        <div class="info-row">
          <span class="info-label">Local:</span>
          <span>{{ votante.local_votacion.nombre_local }}</span>
        </div>
      }
    </div>

    <mat-divider style="margin:16px 0"></mat-divider>

    <!-- Asignación -->
    <h4 style="margin:0 0 12px;color:#1a237e">Asignación y datos adicionales</h4>

    <!-- Coordinador (solo jefe_zona) -->
    @if (esJefeZona()) {
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Coordinador</mat-label>
        <mat-select [(ngModel)]="form.coordinador_id">
          <mat-option [value]="null">— Sin asignar —</mat-option>
          @for (c of coordinadores(); track c.id) {
            <mat-option [value]="c.id">{{ c.nombre_completo }}</mat-option>
          }
        </mat-select>
        <mat-icon matSuffix>supervisor_account</mat-icon>
      </mat-form-field>
    }

    @if (esCoordinador()) {
      <div class="coord-self-msg">
        <mat-icon style="color:#388e3c;font-size:18px;width:18px;height:18px">check_circle</mat-icon>
        El votante será asociado a su coordinación
      </div>
    }

    <!-- Teléfono -->
    <mat-form-field appearance="outline" style="width:100%">
      <mat-label>Teléfono (opcional)</mat-label>
      <input matInput [(ngModel)]="form.telefono" placeholder="09X XXX XXX" maxlength="20">
      <mat-icon matSuffix>phone</mat-icon>
    </mat-form-field>

    <!-- Localidad -->
    <mat-form-field appearance="outline" style="width:100%">
      <mat-label>Barrio / Localidad (opcional)</mat-label>
      <input matInput [(ngModel)]="form.localidad" placeholder="Ej: Villa Elisa, San Antonio..." maxlength="255">
      <mat-icon matSuffix>place</mat-icon>
    </mat-form-field>

    @if (error()) {
      <div class="error-msg"><mat-icon>error_outline</mat-icon> {{ error() }}</div>
    }
  </mat-dialog-content>

  <mat-dialog-actions align="end" style="gap:8px;padding:16px">
    <button mat-stroked-button [mat-dialog-close]="false">Cancelar</button>
    <button mat-raised-button color="primary" (click)="guardar()" [disabled]="guardando()">
      @if (guardando()) { <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner> }
      <mat-icon>save</mat-icon> Guardar
    </button>
  </mat-dialog-actions>
  `,
  styles: [`
    .voter-info {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .info-name {
      font-size: 17px;
      font-weight: 700;
      color: #1a237e;
      margin-bottom: 4px;
    }
    .info-row {
      display: flex;
      gap: 8px;
      font-size: 13px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 100px;
    }
    .coord-self-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e8f5e9;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      color: #2e7d32;
      margin-bottom: 16px;
    }
    .error-msg {
      background: #ffebee;
      color: #c62828;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      margin-top: 8px;
    }
  `]
})
export class AsignarVotanteDialogComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private ref    = inject(MatDialogRef<AsignarVotanteDialogComponent>);
  votante        = inject<Votante>(MAT_DIALOG_DATA);

  coordinadores = signal<any[]>([]);
  guardando     = signal(false);
  error         = signal('');

  form = {
    coordinador_id: (this.votante as any).coordinador_id ?? null as number | null,
    telefono:       (this.votante as any).telefono  ?? '',
    localidad:      (this.votante as any).localidad ?? '',
  };

  esJefeZona()   { return this.auth.role() === 'jefe_zona'; }
  esCoordinador() { return this.auth.role() === 'coordinador'; }

  ngOnInit(): void {
    if (this.esJefeZona()) {
      this.api.getCoordinadores().subscribe(c => this.coordinadores.set(c));
    }
  }

  guardar(): void {
    this.guardando.set(true);
    this.error.set('');

    const payload: Record<string, any> = {
      telefono: this.form.telefono || null,
      localidad: this.form.localidad || null,
    };

    if (this.esJefeZona()) {
      payload['coordinador_id'] = this.form.coordinador_id ?? null;
    }

    this.api.updateVotante(this.votante.id!, payload).subscribe({
      next: () => { this.guardando.set(false); this.ref.close(true); },
      error: err => {
        this.guardando.set(false);
        this.error.set(err?.error?.message ?? 'Error al guardar. Intente nuevamente.');
      }
    });
  }
}
