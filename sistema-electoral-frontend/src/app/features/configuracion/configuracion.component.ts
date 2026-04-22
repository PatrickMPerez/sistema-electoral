import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioDialogComponent } from './usuario-dialog.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatCardModule,
    MatProgressSpinnerModule, MatSlideToggleModule, MatTooltipModule
  ],
  template: `
  <mat-tab-group>
    <!-- Usuarios (solo admin) -->
    @if (esAdmin()) {
    <mat-tab label="Usuarios">
      <div class="tab-content page-card">
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
          <button mat-raised-button color="primary" (click)="abrirUsuarioDialog()">
            <mat-icon>person_add</mat-icon> Nuevo Usuario
          </button>
        </div>
        @if (loadingUsuarios()) {
          <div style="display:flex;justify-content:center;padding:24px"><mat-spinner diameter="36"></mat-spinner></div>
        } @else {
          <table mat-table [dataSource]="usuarios()" class="mat-elevation-z0">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Usuario</th>
              <td mat-cell *matCellDef="let u">{{ u.username }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let u">{{ u.role }}</td>
            </ng-container>
            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let u">
                <span [class]="u.activo ? 'badge-voto' : 'badge-pend'">{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button color="primary" (click)="abrirUsuarioDialog(u)">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="usuarioCols"></tr>
            <tr mat-row *matRowDef="let row; columns: usuarioCols;"></tr>
          </table>
        }
      </div>
    </mat-tab>
    } <!-- fin @if esAdmin Usuarios -->

    <!-- Zonas y Jefes de Zona (solo admin) -->
    @if (esAdmin()) {
    <mat-tab label="Zonas">
      <div class="tab-content page-card">
        <form [formGroup]="zonaForm" (ngSubmit)="guardarZona()" class="inline-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre de Zona *</mat-label>
            <input matInput formControlName="nombre_zona">
            <mat-error *ngIf="zonaForm.get('nombre_zona')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Jefe de Zona</mat-label>
            <mat-select formControlName="jefe_zona_id">
              <mat-option [value]="null">— Ninguno —</mat-option>
              @for (j of jefes(); track j.id) {
                <mat-option [value]="j.id">{{ j.nombre_completo }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="zonaForm.invalid">
            <mat-icon>add</mat-icon> Agregar
          </button>
        </form>

        @if (errorZona()) { <div class="err-inline">{{ errorZona() }}</div> }

        <table mat-table [dataSource]="zonas()" class="mat-elevation-z0" style="margin-top:16px">
          <ng-container matColumnDef="nombre_zona">
            <th mat-header-cell *matHeaderCellDef>Zona</th>
            <td mat-cell *matCellDef="let z">{{ z.nombre_zona }}</td>
          </ng-container>
          <ng-container matColumnDef="jefe">
            <th mat-header-cell *matHeaderCellDef>Jefe</th>
            <td mat-cell *matCellDef="let z">{{ z.jefe_zona?.nombre_completo ?? '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['nombre_zona','jefe']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['nombre_zona','jefe'];"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="2" style="text-align:center;padding:16px;color:#999">Sin zonas registradas</td>
          </tr>
        </table>
      </div>
    </mat-tab>

    <!-- Jefes de Zona -->
    <mat-tab label="Jefes de Zona">
      <div class="tab-content page-card">
        <form [formGroup]="jefeForm" (ngSubmit)="guardarJefe()" class="inline-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo *</mat-label>
            <input matInput formControlName="nombre_completo">
            <mat-error *ngIf="jefeForm.get('nombre_completo')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cédula *</mat-label>
            <input matInput formControlName="cedula" placeholder="Ej: 1234567">
            <mat-error *ngIf="jefeForm.get('cedula')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="jefeForm.invalid">
            <mat-icon>add</mat-icon> Agregar
          </button>
        </form>

        @if (errorJefe()) { <div class="err-inline">{{ errorJefe() }}</div> }

        <table mat-table [dataSource]="jefes()" class="mat-elevation-z0" style="margin-top:16px">
          <ng-container matColumnDef="nombre_completo">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let j">{{ j.nombre_completo }}</td>
          </ng-container>
          <ng-container matColumnDef="cedula">
            <th mat-header-cell *matHeaderCellDef>Cédula</th>
            <td mat-cell *matCellDef="let j">{{ j.cedula }}</td>
          </ng-container>
          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef>Teléfono</th>
            <td mat-cell *matCellDef="let j">{{ j.telefono ?? '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['nombre_completo','cedula','telefono']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['nombre_completo','cedula','telefono'];"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="3" style="text-align:center;padding:16px;color:#999">Sin jefes de zona registrados</td>
          </tr>
        </table>
      </div>
    </mat-tab>
    } <!-- fin @if esAdmin Zonas+Jefes -->

    <!-- Coordinadores (admin + jefe_zona) -->
    <mat-tab label="Coordinadores">
      <div class="tab-content page-card">
        <form [formGroup]="coordForm" (ngSubmit)="guardarCoord()" class="inline-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo *</mat-label>
            <input matInput formControlName="nombre_completo">
            <mat-error *ngIf="coordForm.get('nombre_completo')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cédula *</mat-label>
            <input matInput formControlName="cedula" placeholder="Ej: 1234567">
            <mat-error *ngIf="coordForm.get('cedula')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Jefe Zonal *</mat-label>
            <mat-select formControlName="jefe_zona_id">
              <mat-option [value]="null" disabled>— Seleccione —</mat-option>
              @for (j of jefes(); track j.id) {
                <mat-option [value]="j.id">{{ j.nombre_completo }}</mat-option>
              }
            </mat-select>
            <mat-icon matSuffix>manage_accounts</mat-icon>
            <mat-error *ngIf="coordForm.get('jefe_zona_id')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <div style="display:flex;gap:8px;align-items:flex-start;padding-top:4px">
            <button mat-raised-button color="primary" type="submit" [disabled]="coordForm.invalid">
              <mat-icon>{{ editandoCoordId() ? 'save' : 'add' }}</mat-icon>
              {{ editandoCoordId() ? 'Guardar' : 'Agregar' }}
            </button>
            @if (editandoCoordId()) {
              <button mat-stroked-button type="button" (click)="cancelarEditCoord()">
                <mat-icon>cancel</mat-icon> Cancelar
              </button>
            }
          </div>
        </form>

        @if (errorCoord()) { <div class="err-inline">{{ errorCoord() }}</div> }

        <table mat-table [dataSource]="coordinadores()" class="mat-elevation-z0" style="margin-top:16px">
          <ng-container matColumnDef="nombre_completo">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let c">{{ c.nombre_completo }}</td>
          </ng-container>
          <ng-container matColumnDef="cedula">
            <th mat-header-cell *matHeaderCellDef>Cédula</th>
            <td mat-cell *matCellDef="let c">{{ c.cedula }}</td>
          </ng-container>
          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef>Teléfono</th>
            <td mat-cell *matCellDef="let c">{{ c.telefono ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="jefe_zona">
            <th mat-header-cell *matHeaderCellDef>Jefe Zonal</th>
            <td mat-cell *matCellDef="let c">
              @if (c.jefe_zona) {
                <span style="font-weight:500;color:#1a237e">{{ c.jefe_zona.nombre_completo }}</span>
              } @else {
                <span style="color:#e65100;font-weight:600">⚠ Sin asignar</span>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="activo">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let c">
              <span [class]="c.activo ? 'badge-voto' : 'badge-pend'">{{ c.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="editarCoord(c)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [color]="c.activo ? 'warn' : 'primary'"
                      [matTooltip]="c.activo ? 'Desactivar' : 'Activar'"
                      (click)="toggleActivoCoord(c)">
                <mat-icon>{{ c.activo ? 'person_off' : 'person' }}</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="coordCols"></tr>
          <tr mat-row *matRowDef="let row; columns: coordCols;"
              [style.background]="editandoCoordId() === row.id ? '#e8eaf6' : ''"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="coordCols.length"
                style="text-align:center;padding:16px;color:#999">Sin coordinadores registrados</td>
          </tr>
        </table>
      </div>
    </mat-tab>

    <!-- Veedores (admin + jefe_zona) -->
    @if (esAdmin() || esJefeZona()) {
    <mat-tab label="Veedores">
      <div class="tab-content page-card">
        <form [formGroup]="veedorForm" (ngSubmit)="guardarVeedor()" class="inline-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo *</mat-label>
            <input matInput formControlName="nombre_completo">
            <mat-error *ngIf="veedorForm.get('nombre_completo')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cédula *</mat-label>
            <input matInput formControlName="cedula" placeholder="Ej: 1234567">
            <mat-error *ngIf="veedorForm.get('cedula')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="telefono">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mesa</mat-label>
            <input matInput formControlName="mesa" placeholder="Ej: 1, 2, 15...">
          </mat-form-field>
          <div style="display:flex;gap:8px;align-items:flex-start;padding-top:4px">
            <button mat-raised-button color="primary" type="submit" [disabled]="veedorForm.invalid">
              <mat-icon>{{ editandoVeedorId() ? 'save' : 'add' }}</mat-icon>
              {{ editandoVeedorId() ? 'Guardar' : 'Agregar' }}
            </button>
            @if (editandoVeedorId()) {
              <button mat-stroked-button type="button" (click)="cancelarEditVeedor()">
                <mat-icon>cancel</mat-icon> Cancelar
              </button>
            }
          </div>
        </form>

        @if (errorVeedor()) { <div class="err-inline">{{ errorVeedor() }}</div> }

        <table mat-table [dataSource]="veedores()" class="mat-elevation-z0" style="margin-top:16px">
          <ng-container matColumnDef="nombre_completo">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let v">{{ v.nombre_completo }}</td>
          </ng-container>
          <ng-container matColumnDef="cedula">
            <th mat-header-cell *matHeaderCellDef>Cédula</th>
            <td mat-cell *matCellDef="let v">{{ v.cedula }}</td>
          </ng-container>
          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef>Teléfono</th>
            <td mat-cell *matCellDef="let v">{{ v.telefono ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="mesa">
            <th mat-header-cell *matHeaderCellDef>Mesa</th>
            <td mat-cell *matCellDef="let v">{{ v.mesa ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="activo">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let v">
              <span [class]="v.activo ? 'badge-voto' : 'badge-pend'">{{ v.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let v">
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="editarVeedor(v)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [color]="v.activo ? 'warn' : 'primary'"
                      [matTooltip]="v.activo ? 'Desactivar' : 'Activar'"
                      (click)="toggleActivoVeedor(v)">
                <mat-icon>{{ v.activo ? 'person_off' : 'person' }}</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="veedorCols"></tr>
          <tr mat-row *matRowDef="let row; columns: veedorCols;"
              [style.background]="editandoVeedorId() === row.id ? '#e8eaf6' : ''"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="veedorCols.length"
                style="text-align:center;padding:16px;color:#999">Sin veedores registrados</td>
          </tr>
        </table>
      </div>
    </mat-tab>
    } <!-- fin @if esAdmin||esJefeZona Veedores -->

    <!-- Movimientos (solo admin) -->
    @if (esAdmin()) {
    <mat-tab label="Movimientos">
      <div class="tab-content page-card">
        <form [formGroup]="movForm" (ngSubmit)="guardarMovimiento()" class="inline-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del Movimiento *</mat-label>
            <input matInput formControlName="nombre_movimiento">
            <mat-error *ngIf="movForm.get('nombre_movimiento')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nombre del Candidato *</mat-label>
            <input matInput formControlName="nombre_candidato">
            <mat-error *ngIf="movForm.get('nombre_candidato')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Lista</mat-label>
            <input matInput formControlName="lista" placeholder="Ej: A1">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Partido</mat-label>
            <input matInput formControlName="partido">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="movForm.invalid">
            <mat-icon>add</mat-icon> Agregar
          </button>
        </form>

        @if (errorMov()) { <div class="err-inline">{{ errorMov() }}</div> }

        <table mat-table [dataSource]="movimientos()" class="mat-elevation-z0" style="margin-top:16px">
          <ng-container matColumnDef="nombre_movimiento">
            <th mat-header-cell *matHeaderCellDef>Movimiento</th>
            <td mat-cell *matCellDef="let m">{{ m.nombre_movimiento }}</td>
          </ng-container>
          <ng-container matColumnDef="nombre_candidato">
            <th mat-header-cell *matHeaderCellDef>Candidato</th>
            <td mat-cell *matCellDef="let m">{{ m.nombre_candidato }}</td>
          </ng-container>
          <ng-container matColumnDef="lista">
            <th mat-header-cell *matHeaderCellDef>Lista</th>
            <td mat-cell *matCellDef="let m">{{ m.lista ?? '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="partido">
            <th mat-header-cell *matHeaderCellDef>Partido</th>
            <td mat-cell *matCellDef="let m">{{ m.partido ?? '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['nombre_movimiento','nombre_candidato','lista','partido']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['nombre_movimiento','nombre_candidato','lista','partido'];"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="4" style="text-align:center;padding:16px;color:#999">Sin movimientos registrados</td>
          </tr>
        </table>
      </div>
    </mat-tab>
    } <!-- fin @if esAdmin Movimientos -->
  </mat-tab-group>
  `,
  styles: [`
    .tab-content { margin-top:16px; }
    .inline-form { display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; margin-bottom:8px; }
    .inline-form mat-form-field { min-width:200px; }
    .err-inline { color:#c62828; background:#ffebee; padding:8px 12px; border-radius:4px; font-size:13px; margin-bottom:8px; }
    .badge-voto { background:#e8f5e9; color:#2e7d32; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; }
    .badge-pend { background:#fff3e0; color:#e65100; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; }
  `]
})
export class ConfiguracionComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private dialog = inject(MatDialog);
  private fb     = inject(FormBuilder);

  esAdmin = computed(() => this.auth.role() === 'administrador');
  esJefeZona = computed(() => this.auth.role() === 'jefe_zona');

  usuarioCols    = ['name','username','role','activo','acciones'];
  coordCols      = ['nombre_completo','cedula','telefono','jefe_zona','activo','acciones'];
  veedorCols     = ['nombre_completo','cedula','telefono','mesa','activo','acciones'];
  usuarios       = signal<any[]>([]);
  zonas          = signal<any[]>([]);
  jefes          = signal<any[]>([]);
  coordinadores  = signal<any[]>([]);
  veedores       = signal<any[]>([]);
  movimientos    = signal<any[]>([]);
  loadingUsuarios = signal(true);
  errorZona      = signal('');
  errorJefe      = signal('');
  errorCoord     = signal('');
  errorVeedor    = signal('');
  errorMov       = signal('');
  editandoCoordId  = signal<number | null>(null);
  editandoVeedorId = signal<number | null>(null);

  zonaForm = this.fb.group({
    nombre_zona:  ['', Validators.required],
    jefe_zona_id: [null as number | null]
  });

  jefeForm = this.fb.group({
    nombre_completo: ['', Validators.required],
    cedula:          ['', Validators.required],
    telefono:        ['']
  });

  coordForm = this.fb.group({
    nombre_completo: ['', Validators.required],
    cedula:          ['', Validators.required],
    telefono:        [''],
    jefe_zona_id:    [null as number | null, Validators.required],
  });

  veedorForm = this.fb.group({
    nombre_completo: ['', Validators.required],
    cedula:          ['', Validators.required],
    telefono:        [''],
    mesa:            [''],
  });

  movForm = this.fb.group({
    nombre_movimiento: ['', Validators.required],
    nombre_candidato:  ['', Validators.required],
    lista:             [''],
    partido:           ['']
  });

  ngOnInit(): void {
    this.api.getJefesZona().subscribe(j => this.jefes.set(j));
    this.api.getCoordinadores(true).subscribe(c => this.coordinadores.set(c));
    this.api.getVeedores(true).subscribe(v => this.veedores.set(v));
    if (this.esAdmin()) {
      this.api.getUsuarios().subscribe(u => { this.usuarios.set(u); this.loadingUsuarios.set(false); });
      this.api.getZonas().subscribe(z => this.zonas.set(z));
      this.api.getMovimientos().subscribe(m => this.movimientos.set(m));
    } else {
      this.loadingUsuarios.set(false);
    }
  }

  abrirUsuarioDialog(u?: any): void {
    const ref = this.dialog.open(UsuarioDialogComponent, { width: '480px', data: u ?? null });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.loadingUsuarios.set(true);
        this.api.getUsuarios().subscribe(u => { this.usuarios.set(u); this.loadingUsuarios.set(false); });
      }
    });
  }

  guardarCoord(): void {
    if (this.coordForm.invalid) { this.coordForm.markAllAsTouched(); return; }
    this.errorCoord.set('');
    const id = this.editandoCoordId();
    const obs = id
      ? this.api.updateCoordinador(id, this.coordForm.value)
      : this.api.createCoordinador(this.coordForm.value);

    obs.subscribe({
      next: () => {
        this.api.getCoordinadores(true).subscribe(c => this.coordinadores.set(c));
        this.cancelarEditCoord();
      },
      error: err => this.errorCoord.set(this.parseError(err))
    });
  }

  editarCoord(c: any): void {
    this.editandoCoordId.set(c.id);
    this.coordForm.patchValue({
      nombre_completo: c.nombre_completo,
      cedula:          c.cedula,
      telefono:        c.telefono ?? '',
      jefe_zona_id:    c.jefe_zona_id ?? null,
    });
    this.errorCoord.set('');
  }

  cancelarEditCoord(): void {
    this.editandoCoordId.set(null);
    this.coordForm.reset({ jefe_zona_id: null });
    this.errorCoord.set('');
  }

  toggleActivoCoord(c: any): void {
    this.api.updateCoordinador(c.id, { activo: !c.activo }).subscribe({
      next: () => this.api.getCoordinadores().subscribe(list => this.coordinadores.set(list)),
      error: err => this.errorCoord.set(this.parseError(err))
    });
  }

  guardarVeedor(): void {
    if (this.veedorForm.invalid) { this.veedorForm.markAllAsTouched(); return; }
    this.errorVeedor.set('');
    const id = this.editandoVeedorId();
    const obs = id
      ? this.api.updateVeedor(id, this.veedorForm.value)
      : this.api.createVeedor(this.veedorForm.value);

    obs.subscribe({
      next: () => {
        this.api.getVeedores(true).subscribe(v => this.veedores.set(v));
        this.cancelarEditVeedor();
      },
      error: err => this.errorVeedor.set(this.parseError(err))
    });
  }

  editarVeedor(v: any): void {
    this.editandoVeedorId.set(v.id);
    this.veedorForm.patchValue({
      nombre_completo: v.nombre_completo,
      cedula:          v.cedula,
      telefono:        v.telefono ?? '',
      mesa:            v.mesa ?? '',
    });
    this.errorVeedor.set('');
  }

  cancelarEditVeedor(): void {
    this.editandoVeedorId.set(null);
    this.veedorForm.reset();
    this.errorVeedor.set('');
  }

  toggleActivoVeedor(v: any): void {
    this.api.updateVeedor(v.id, { activo: !v.activo }).subscribe({
      next: () => this.api.getVeedores(true).subscribe(list => this.veedores.set(list)),
      error: err => this.errorVeedor.set(this.parseError(err))
    });
  }

  guardarZona(): void {
    if (this.zonaForm.invalid) { this.zonaForm.markAllAsTouched(); return; }
    this.errorZona.set('');
    this.api.createZona(this.zonaForm.value).subscribe({
      next: () => {
        this.api.getZonas().subscribe(z => this.zonas.set(z));
        this.zonaForm.reset();
      },
      error: err => this.errorZona.set(this.parseError(err))
    });
  }

  guardarJefe(): void {
    if (this.jefeForm.invalid) { this.jefeForm.markAllAsTouched(); return; }
    this.errorJefe.set('');
    this.api.createJefeZona(this.jefeForm.value).subscribe({
      next: () => {
        this.api.getJefesZona().subscribe(j => this.jefes.set(j));
        this.jefeForm.reset();
      },
      error: err => this.errorJefe.set(this.parseError(err))
    });
  }

  guardarMovimiento(): void {
    if (this.movForm.invalid) { this.movForm.markAllAsTouched(); return; }
    this.errorMov.set('');
    this.api.createMovimiento(this.movForm.value).subscribe({
      next: () => {
        this.api.getMovimientos().subscribe(m => this.movimientos.set(m));
        this.movForm.reset();
      },
      error: err => this.errorMov.set(this.parseError(err))
    });
  }

  private parseError(err: any): string {
    const errors = err?.error?.errors;
    if (errors) return Object.values(errors).flat().join(' | ');
    return err?.error?.message ?? 'Error al guardar';
  }
}
