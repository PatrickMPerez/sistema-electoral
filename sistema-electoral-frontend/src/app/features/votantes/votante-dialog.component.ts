import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../../core/services/api.service';
import { GeografiaService } from '../../core/services/geografia.service';
import { Votante } from '../../core/models/votante.model';

@Component({
  selector: 'app-votante-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatDividerModule, MatIconModule,
    MatAutocompleteModule
  ],
  template: `
  <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Votante</h2>

  <mat-dialog-content>
    <form [formGroup]="form">

      <!-- ── Datos Personales ── -->
      <p class="section-label">Datos Personales</p>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nombres *</mat-label>
          <input matInput formControlName="nombres" placeholder="Ej: TEOFILO RAMON">
          <mat-error *ngIf="form.get('nombres')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Apellidos *</mat-label>
          <input matInput formControlName="apellidos" placeholder="Ej: ARMOA VAZQUEZ">
          <mat-error *ngIf="form.get('apellidos')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cédula de Identidad *</mat-label>
          <input matInput formControlName="cedula" placeholder="Ej: 3305634">
          <mat-error *ngIf="form.get('cedula')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono">
        </mat-form-field>
      </div>

      <!-- ── Datos Electorales (jerárquicos) ── -->
      <p class="section-label">Datos Electorales</p>
      <div class="form-grid">

        <!-- Nivel 1: Departamento -->
        <mat-form-field appearance="outline">
          <mat-label>Departamento *</mat-label>
          <mat-select formControlName="departamento"
                      (selectionChange)="onDepartamentoChange($event)">
            <mat-option value="">— Seleccione departamento —</mat-option>
            @for (d of departamentos(); track d) {
              <mat-option [value]="d">{{ d }}</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="form.get('departamento')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <!-- Nivel 2: Distrito (filtrado por departamento) -->
        <mat-form-field appearance="outline">
          <mat-label>Distrito *</mat-label>
          <mat-select formControlName="distrito">
            <mat-option value="">— Seleccione distrito —</mat-option>
            @for (d of distritosDisponibles(); track d) {
              <mat-option [value]="d">{{ d }}</mat-option>
            }
          </mat-select>
          @if (!distritosDisponibles().length) {
            <mat-hint>Primero seleccione un departamento</mat-hint>
          }
          <mat-error *ngIf="form.get('distrito')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <!-- Zona (opcional, se asigna manualmente después) -->
        <mat-form-field appearance="outline">
          <mat-label>Zona</mat-label>
          <mat-select formControlName="zona_id">
            <mat-option [value]="null">— Sin asignar —</mat-option>
            @for (z of zonasFiltradas(); track z.id) {
              <mat-option [value]="z.id">{{ z.nombre_zona }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Seccional *</mat-label>
          <input matInput formControlName="seccional" placeholder="Ej: Seccional Nº 127">
          <mat-error *ngIf="form.get('seccional')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" style="grid-column:1/-1">
          <mat-label>Local de Votación *</mat-label>
          <mat-select formControlName="local_votacion_id">
            <mat-option [value]="null">— Seleccione local —</mat-option>
            @for (l of locales(); track l.id) {
              <mat-option [value]="l.id">{{ l.nombre_local }}</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="form.get('local_votacion_id')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Mesa *</mat-label>
          <input matInput type="number" formControlName="mesa" placeholder="Ej: 6">
          <mat-error *ngIf="form.get('mesa')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>N° Orden *</mat-label>
          <input matInput type="number" formControlName="numero_orden" placeholder="Ej: 339">
          <mat-error *ngIf="form.get('numero_orden')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>
      </div>

      <!-- ── Asignación Organizativa ── -->
      <p class="section-label">Asignación</p>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Coordinador</mat-label>
          <input matInput [matAutocomplete]="autoCoord"
                 [value]="displayCoord(form.get('coordinador_id')?.value)"
                 (input)="filtroCoord.set($any($event.target).value)"
                 (focus)="filtroCoord.set('')"
                 placeholder="Buscar por nombre o cédula...">
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete #autoCoord="matAutocomplete"
                            (optionSelected)="onCoordinadorSelected($event.option.value)">
            <mat-option [value]="null">— Sin asignar —</mat-option>
            @for (c of coordFiltrados(); track c.id) {
              <mat-option [value]="c.id">{{ c.nombre_completo }}{{ c.cedula ? ' — ' + c.cedula : '' }}</mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Jefe Zonal</mat-label>
          <mat-select formControlName="jefe_zona_id">
            <mat-option [value]="null">— Ninguno —</mat-option>
            @for (j of jefesZona(); track j.id) {
              <mat-option [value]="j.id">{{ j.nombre_completo }}</mat-option>
            }
          </mat-select>
          @if (jefeZonalAutoAsignado()) {
            <mat-hint style="color:#388e3c">Asignado automáticamente por coordinador</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Movimiento</mat-label>
          <mat-select formControlName="movimiento_id">
            <mat-option [value]="null">— Ninguno —</mat-option>
            @for (m of movimientos(); track m.id) {
              <mat-option [value]="m.id">{{ m.nombre_movimiento ?? m.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Localidad / Dirección</mat-label>
          <input matInput formControlName="localidad">
        </mat-form-field>
      </div>

    </form>

    @if (error()) {
      <div class="err-msg">
        <mat-icon style="font-size:16px;vertical-align:middle">error_outline</mat-icon>
        {{ error() }}
      </div>
    }
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancelar</button>
    <button mat-raised-button color="primary" (click)="guardar()" [disabled]="loading()">
      @if (loading()) { <mat-spinner diameter="18" color="accent"></mat-spinner> }
      @else { Guardar }
    </button>
  </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
      padding-top: 4px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: #b71c1c;
      text-transform: uppercase;
      letter-spacing: .8px;
      margin: 16px 0 4px;
      border-bottom: 2px solid #ffcdd2;
      padding-bottom: 4px;
    }
    .err-msg {
      color: #c62828;
      font-size: 13px;
      margin-top: 8px;
      background: #ffebee;
      padding: 8px 12px;
      border-radius: 4px;
    }
    mat-dialog-content { max-height: 72vh; }
  `]
})
export class VotanteDialogComponent implements OnInit {
  private fb  = inject(FormBuilder);
  private api = inject(ApiService);
  private geo = inject(GeografiaService);
  private ref = inject(MatDialogRef<VotanteDialogComponent>);

  // Catálogos
  departamentos      = signal<string[]>([]);
  distritosDisponibles = signal<string[]>([]);
  zonas              = signal<any[]>([]);
  zonasFiltradas     = signal<any[]>([]);
  coordinadores      = signal<any[]>([]);
  jefesZona          = signal<any[]>([]);
  movimientos        = signal<any[]>([]);
  locales            = signal<any[]>([]);

  loading = signal(false);
  error   = signal('');
  jefeZonalAutoAsignado = signal(false);
  filtroCoord = signal('');

  coordFiltrados = computed(() => {
    const q = this.filtroCoord().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!q) return this.coordinadores();
    return this.coordinadores().filter(c => {
      const nombre = (c.nombre_completo ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const cedula = (c.cedula ?? '').toLowerCase();
      return nombre.includes(q) || cedula.includes(q);
    });
  });

  form = this.fb.group({
    // Personales
    nombres:           ['', Validators.required],
    apellidos:         ['', Validators.required],
    cedula:            ['', Validators.required],
    telefono:          [''],
    localidad:         [''],
    // Electorales
    departamento:      ['', Validators.required],
    distrito:          ['', Validators.required],
    seccional:         ['', Validators.required],
    local_votacion_id: [null as number | null, Validators.required],
    mesa:              [null as number | null, Validators.required],
    numero_orden:      [null as number | null, Validators.required],
    // Asignación
    zona_id:           [null as number | null],
    coordinador_id:    [null as number | null],
    jefe_zona_id:      [{ value: null as number | null, disabled: true }],
    movimiento_id:     [null as number | null],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Votante | null) {}

  ngOnInit(): void {
    this.departamentos.set(this.geo.getDepartamentos());

    this.api.getZonas().subscribe(z => {
      this.zonas.set(z);
      if (this.data?.departamento) {
        this.filtrarZonas(this.data.departamento);
      } else {
        this.zonasFiltradas.set(z);
      }
    });
    this.api.getCoordinadores().subscribe(c => this.coordinadores.set(c));
    this.api.getJefesZona().subscribe(j => this.jefesZona.set(j));
    this.api.getMovimientos().subscribe(m => this.movimientos.set(m));
    this.api.getLocales().subscribe(l => this.locales.set(l));

    if (this.data) {
      // Normalizar departamento (ej: "CONCEPCION" → "CONCEPCIÓN") para
      // que coincida con las opciones del mat-select que tienen tildes
      const deptNorm = this.geo.matchDepartamento(this.data.departamento ?? '');

      // Primero carga los distritos para que el select los tenga disponibles
      if (deptNorm) {
        this.distritosDisponibles.set(this.geo.getDistritos(deptNorm));
      }

      // patchValue con el departamento normalizado
      // jefe_zona_id está disabled, hay que usar enable temporal o patchValue directamente
      this.form.patchValue({ ...(this.data as any), departamento: deptNorm });
      this.form.get('jefe_zona_id')?.setValue((this.data as any).jefe_zona_id ?? null);
      if ((this.data as any).coordinador_id) {
        this.jefeZonalAutoAsignado.set(true);
      }
    }
  }

  onCoordinadorSelected(coordId: number | null): void {
    this.form.get('coordinador_id')?.setValue(coordId);
    this.filtroCoord.set('');
    if (!coordId) {
      this.jefeZonalAutoAsignado.set(false);
      return;
    }
    const coord = this.coordinadores().find(c => c.id === coordId);
    if (coord?.jefe_zona_id) {
      this.form.get('jefe_zona_id')?.setValue(coord.jefe_zona_id);
      this.jefeZonalAutoAsignado.set(true);
    } else {
      this.jefeZonalAutoAsignado.set(false);
    }
  }

  displayCoord(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.coordinadores().find(x => x.id === id);
    return c ? c.nombre_completo : '';
  }

  onDepartamentoChange(event: MatSelectChange): void {
    const dpto = event.value as string;
    this.form.patchValue({ distrito: '', zona_id: null });
    if (dpto) {
      this.distritosDisponibles.set(this.geo.getDistritos(dpto));
      this.filtrarZonas(dpto);
    } else {
      this.distritosDisponibles.set([]);
      this.zonasFiltradas.set(this.zonas());
    }
  }

  private filtrarZonas(dpto: string): void {
    const keyword = dpto.normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')[0].toUpperCase();
    const filtradas = this.zonas().filter(z =>
      z.nombre_zona.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().includes(keyword)
    );
    this.zonasFiltradas.set(filtradas.length ? filtradas : this.zonas());
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const obs = this.data
      ? this.api.updateVotante(this.data.id, this.form.getRawValue() as any)
      : this.api.createVotante(this.form.getRawValue() as any);

    obs.subscribe({
      next: () => this.ref.close(true),
      error: err => {
        const errors = err?.error?.errors;
        const msg = errors
          ? Object.values(errors).flat().join(' | ')
          : (err?.error?.message ?? 'Error al guardar');
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
