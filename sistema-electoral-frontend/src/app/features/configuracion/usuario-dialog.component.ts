import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatSlideToggleModule
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

      <mat-form-field appearance="outline">
        <mat-label>Rol</mat-label>
        <mat-select formControlName="role">
          <mat-option value="administrador">Administrador</mat-option>
          <mat-option value="jefe_zona">Jefe de Zona</mat-option>
          <mat-option value="coordinador">Coordinador</mat-option>
          <mat-option value="vedor">Vedor</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Zona</mat-label>
        <mat-select formControlName="zona_id">
          <mat-option [value]="null">— Ninguna —</mat-option>
          @for (z of zonas(); track z.id) { <mat-option [value]="z.id">{{ z.nombre_zona }}</mat-option> }
        </mat-select>
      </mat-form-field>

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
  styles: [`.form-col { display:flex; flex-direction:column; gap:4px; padding-top:8px; min-width:380px; }`]
})
export class UsuarioDialogComponent implements OnInit {
  private fb  = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<UsuarioDialogComponent>);

  zonas   = signal<any[]>([]);
  loading = signal(false);
  error   = signal('');

  form = this.fb.group({
    name:                  ['', Validators.required],
    username:              ['', Validators.required],
    password:              ['', [Validators.minLength(6)]],
    password_confirmation: [''],
    role:                  ['coordinador', Validators.required],
    zona_id:               [null as number | null],
    activo:                [true]
  }, { validators: this.passwordMatch });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any | null) {}

  ngOnInit(): void {
    this.api.getZonas().subscribe(z => this.zonas.set(z));
    if (this.data) {
      this.form.patchValue(this.data);
    } else {
      // Para nuevo usuario la contraseña es obligatoria
      this.form.get('password')?.addValidators(Validators.required);
      this.form.get('password_confirmation')?.addValidators(Validators.required);
    }
  }

  private passwordMatch(group: AbstractControl): ValidationErrors | null {
    const pass    = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    if (!pass && !confirm) return null;           // editando sin cambiar pass
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
