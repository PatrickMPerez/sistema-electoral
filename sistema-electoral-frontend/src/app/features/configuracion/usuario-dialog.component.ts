import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatSlideToggleModule,
    MatIconModule, MatAutocompleteModule
  ],
  template: `
  <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Usuario</h2>
  <mat-dialog-content>
    <form [formGroup]="form" class="form-col">

      <mat-form-field appearance="outline">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name">
        <mat-error>Requerido</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Usuario (login)</mat-label>
        <input matInput formControlName="username">
        <mat-error>Requerido</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Contraseña {{ data ? '(dejar vacío para no cambiar)' : '*' }}</mat-label>
        <input matInput type="password" formControlName="password" autocomplete="new-password">
        <mat-error *ngIf="form.get('password')?.hasError('required')">Requerido</mat-error>
        <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
      </mat-form-field>

      @if (!data || form.get('password')?.value) {
        <mat-form-field appearance="outline">
          <mat-label>Confirmar Contraseña *</mat-label>
          <input matInput type="password" formControlName="password_confirmation" autocomplete="new-password">
          <mat-error *ngIf="form.get('password_confirmation')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.errors?.['mismatch']">Las contraseñas no coinciden</mat-error>
        </mat-form-field>
      }

      <!-- Rol -->
      <mat-form-field appearance="outline">
        <mat-label>Rol *</mat-label>
        <mat-select formControlName="role" (selectionChange)="onRolChange($event.value)">
          <mat-option value="administrador">Administrador</mat-option>
          <mat-option value="jefe_zona">Jefe de Zona</mat-option>
          <mat-option value="coordinador">Coordinador</mat-option>
          <mat-option value="vedor">Vedor</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Jefe de Zona asociado -->
      @if (rolActual() === 'jefe_zona') {
        <mat-form-field appearance="outline">
          <mat-label>Jefe de Zona asociado *</mat-label>
          <input matInput [matAutocomplete]="autoJefe"
                 [value]="displayJefe(form.get('jefe_zona_id')?.value)"
                 (input)="filtroJefe.set($any($event.target).value)"
                 (focus)="filtroJefe.set('')"
                 placeholder="Buscar por nombre o CI...">
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete #autoJefe="matAutocomplete"
                            (optionSelected)="form.get('jefe_zona_id')?.setValue($event.option.value); filtroJefe.set('')">
            <mat-option [value]="null">— Ninguno —</mat-option>
            @for (j of jefeFiltrados(); track j.id) {
              <mat-option [value]="j.id">
                <span style="font-weight:500">{{ j.nombre_completo }}</span>
                <span style="color:#666;font-size:12px;margin-left:8px">CI: {{ j.cedula }}</span>
              </mat-option>
            }
            @if (jefeFiltrados().length === 0) {
              <mat-option disabled>Sin resultados</mat-option>
            }
          </mat-autocomplete>
          <mat-hint>Persona registrada como Jefe de Zona</mat-hint>
        </mat-form-field>
      }

      <!-- Coordinador asociado -->
      @if (rolActual() === 'coordinador') {
        <mat-form-field appearance="outline">
          <mat-label>Coordinador asociado *</mat-label>
          <input matInput [matAutocomplete]="autoCoord"
                 [value]="displayCoord(form.get('coordinador_id')?.value)"
                 (input)="filtroCoord.set($any($event.target).value)"
                 (focus)="filtroCoord.set('')"
                 placeholder="Buscar por nombre o CI...">
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete #autoCoord="matAutocomplete"
                            (optionSelected)="form.get('coordinador_id')?.setValue($event.option.value); filtroCoord.set('')">
            <mat-option [value]="null">— Ninguno —</mat-option>
            @for (c of coordFiltrados(); track c.id) {
              <mat-option [value]="c.id">
                <span style="font-weight:500">{{ c.nombre_completo }}</span>
                <span style="color:#666;font-size:12px;margin-left:8px">CI: {{ c.cedula }}</span>
              </mat-option>
            }
            @if (coordFiltrados().length === 0) {
              <mat-option disabled>Sin resultados</mat-option>
            }
          </mat-autocomplete>
          <mat-hint>Persona registrada como Coordinador</mat-hint>
        </mat-form-field>
      }

      <!-- Veedor asociado -->
      @if (rolActual() === 'vedor') {
        <mat-form-field appearance="outline">
          <mat-label>Veedor asociado *</mat-label>
          <input matInput [matAutocomplete]="autoVeedor"
                 [value]="displayVeedor(form.get('veedor_id')?.value)"
                 (input)="filtroVeedor.set($any($event.target).value)"
                 (focus)="filtroVeedor.set('')"
                 placeholder="Buscar por nombre o CI...">
          <mat-icon matSuffix>search</mat-icon>
          <mat-autocomplete #autoVeedor="matAutocomplete"
                            (optionSelected)="form.get('veedor_id')?.setValue($event.option.value); filtroVeedor.set('')">
            <mat-option [value]="null">— Ninguno —</mat-option>
            @for (v of veedoresFiltrados(); track v.id) {
              <mat-option [value]="v.id">
                <span style="font-weight:500">{{ v.nombre_completo }}</span>
                <span style="color:#666;font-size:12px;margin-left:8px">CI: {{ v.cedula }}{{ v.mesa ? ' · Mesa ' + v.mesa : '' }}</span>
              </mat-option>
            }
            @if (veedoresFiltrados().length === 0) {
              <mat-option disabled>Sin resultados</mat-option>
            }
          </mat-autocomplete>
          <mat-hint>Persona registrada como Veedor</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Mesa asignada</mat-label>
          <mat-icon matPrefix>table_restaurant</mat-icon>
          <input matInput formControlName="mesa" placeholder="Ej: 1, 2, 15...">
          <mat-hint>Mesa donde operará el veedor</mat-hint>
        </mat-form-field>
      }

      <mat-slide-toggle formControlName="activo" color="primary">Usuario activo</mat-slide-toggle>
    </form>

    @if (error()) {
      <div style="color:#c62828;font-size:13px;margin-top:8px">{{ error() }}</div>
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
  styles: [`.form-col { display:flex; flex-direction:column; gap:4px; padding-top:8px; min-width:400px; }`]
})
export class UsuarioDialogComponent implements OnInit {
  private fb  = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<UsuarioDialogComponent>);

  jefes         = signal<any[]>([]);
  coordinadores = signal<any[]>([]);
  veedores      = signal<any[]>([]);
  filtroJefe    = signal('');
  filtroCoord   = signal('');
  filtroVeedor  = signal('');
  rolActual     = signal('coordinador');
  loading       = signal(false);
  error         = signal('');

  jefeFiltrados = computed(() => {
    const q = this.filtroJefe().toLowerCase().trim();
    if (!q) return this.jefes();
    return this.jefes().filter(j =>
      j.nombre_completo.toLowerCase().includes(q) || j.cedula.includes(q)
    );
  });

  coordFiltrados = computed(() => {
    const q = this.filtroCoord().toLowerCase().trim();
    if (!q) return this.coordinadores();
    return this.coordinadores().filter(c =>
      c.nombre_completo.toLowerCase().includes(q) || c.cedula.includes(q)
    );
  });

  veedoresFiltrados = computed(() => {
    const q = this.filtroVeedor().toLowerCase().trim();
    if (!q) return this.veedores();
    return this.veedores().filter(v =>
      v.nombre_completo.toLowerCase().includes(q) || v.cedula.includes(q)
    );
  });

  form = this.fb.group({
    name:                  ['', Validators.required],
    username:              ['', Validators.required],
    password:              ['', [Validators.minLength(6)]],
    password_confirmation: [''],
    role:                  ['coordinador', Validators.required],
    jefe_zona_id:          [null as number | null],
    coordinador_id:        [null as number | null],
    veedor_id:             [null as number | null],
    mesa:                  [null as string | null],
    activo:                [true]
  }, { validators: this.passwordMatch });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any | null) {}

  ngOnInit(): void {
    this.api.getJefesZona().subscribe(j => this.jefes.set(j));
    this.api.getCoordinadores(true).subscribe(c => this.coordinadores.set(c));
    this.api.getVeedores(true).subscribe(v => this.veedores.set(v));

    if (this.data) {
      this.form.patchValue(this.data);
      this.rolActual.set(this.data.role ?? 'coordinador');
    } else {
      this.form.get('password')?.addValidators(Validators.required);
      this.form.get('password_confirmation')?.addValidators(Validators.required);
    }
  }

  onRolChange(rol: string): void {
    this.rolActual.set(rol);
    // Limpiar asociaciones al cambiar de rol
    this.form.patchValue({ jefe_zona_id: null, coordinador_id: null, veedor_id: null });
  }

  displayJefe(id: number | null | undefined): string {
    if (!id) return '';
    const j = this.jefes().find(x => x.id === id);
    return j ? `${j.nombre_completo} (CI: ${j.cedula})` : '';
  }

  displayCoord(id: number | null | undefined): string {
    if (!id) return '';
    const c = this.coordinadores().find(x => x.id === id);
    return c ? `${c.nombre_completo} (CI: ${c.cedula})` : '';
  }

  displayVeedor(id: number | null | undefined): string {
    if (!id) return '';
    const v = this.veedores().find(x => x.id === id);
    return v ? `${v.nombre_completo} (CI: ${v.cedula})` : '';
  }

  private passwordMatch(group: AbstractControl): ValidationErrors | null {
    const pass    = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    if (!pass && !confirm) return null;
    return pass === confirm ? null : { mismatch: true };
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const val: any = { ...this.form.value };
    if (!val.password) {
      delete val.password;
      delete val.password_confirmation;
    }

    const obs = this.data
      ? this.api.updateUsuario(this.data.id, val)
      : this.api.createUsuario(val);

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
