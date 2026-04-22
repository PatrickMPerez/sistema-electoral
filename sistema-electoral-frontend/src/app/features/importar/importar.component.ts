import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { ApiService } from '../../core/services/api.service';

type Paso = 'seleccion' | 'preview' | 'confirmando' | 'resultado';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressBarModule, MatStepperModule
  ],
  template: `
  <div class="page-card">
    <h2 style="margin-top:0">Importar Votantes desde Excel</h2>
    <p style="color:#666">Cargue un archivo .xlsx con los datos de votantes. El sistema validará y mostrará una vista previa antes de confirmar.</p>

    @switch (paso()) {
      @case ('seleccion') {
        <!-- Drop zone -->
        <div class="drop-zone"
             (dragover)="$event.preventDefault()"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <mat-icon style="font-size:56px;width:56px;height:56px;color:#1a237e">upload_file</mat-icon>
          <h3>Arrastra tu archivo aquí</h3>
          <p>o haz click para seleccionar</p>
          <p style="font-size:12px;color:#999">Formatos: .xlsx, .xls</p>
        </div>
        <input #fileInput type="file" accept=".xlsx,.xls" style="display:none" (change)="onFile($event)">

        <!-- Formato esperado -->
        <mat-card style="margin-top:16px;background:#f5f5f5">
          <mat-card-header><mat-card-title>Columnas del archivo (formato padrón electoral)</mat-card-title></mat-card-header>
          <mat-card-content>
            <p style="font-family:monospace;font-size:13px;line-height:2">
              <strong style="color:#b71c1c">Obligatorias:</strong>
              <code>numero_ced</code> | <code>nombre</code> | <code>apellido</code> |
              <code>desc_dep</code> | <code>desc_dis</code> | <code>desc_sec</code> |
              <code>mesa</code> | <code>orden</code><br>
              <strong style="color:#1565c0">Opcionales:</strong>
              <code>desc_locanr</code> | <code>fecha_naci</code> | <code>direccion</code> |
              <code>fecha_afil</code> | <code>nroreg</code> |
              <code>cod_dpto</code> | <code>cod_dist</code> | <code>codigo_sec</code> | <code>slocal</code>
            </p>
            <p style="font-size:12px;color:#888;margin-top:4px">
              La zona y el coordinador se asignan manualmente después de la importación.
              El local de votación se vincula automáticamente si <code>desc_local</code> coincide con un local registrado.
            </p>
          </mat-card-content>
        </mat-card>
      }

      @case ('preview') {
        <div class="preview-header">
          <div class="stats-mini">
            <span class="chip green">{{ previewData().validas?.length ?? 0 }} válidos</span>
            <span class="chip red">{{ previewData().errores?.length ?? 0 }} con errores</span>
          </div>
          <div class="preview-actions">
            <button mat-stroked-button (click)="resetear()"><mat-icon>arrow_back</mat-icon> Volver</button>
            <button mat-raised-button color="primary" (click)="confirmar()"
                    [disabled]="!previewData().validas?.length">
              <mat-icon>check</mat-icon> Confirmar Importación
            </button>
          </div>
        </div>

        @if (previewData().validas?.length) {
          <h4>Vista previa — primeros registros válidos</h4>
          <table mat-table [dataSource]="previewData().validas.slice(0, 10)" class="mat-elevation-z0">
            <ng-container matColumnDef="numero_orden">
              <th mat-header-cell *matHeaderCellDef>N° Orden</th>
              <td mat-cell *matCellDef="let r">{{ r.numero_orden }}</td>
            </ng-container>
            <ng-container matColumnDef="cedula">
              <th mat-header-cell *matHeaderCellDef>Cédula</th>
              <td mat-cell *matCellDef="let r">{{ r.cedula }}</td>
            </ng-container>
            <ng-container matColumnDef="nombres">
              <th mat-header-cell *matHeaderCellDef>Nombres</th>
              <td mat-cell *matCellDef="let r">{{ r.nombres }}</td>
            </ng-container>
            <ng-container matColumnDef="apellidos">
              <th mat-header-cell *matHeaderCellDef>Apellidos</th>
              <td mat-cell *matCellDef="let r">{{ r.apellidos }}</td>
            </ng-container>
            <ng-container matColumnDef="departamento">
              <th mat-header-cell *matHeaderCellDef>Departamento</th>
              <td mat-cell *matCellDef="let r">{{ r.departamento }}</td>
            </ng-container>
            <ng-container matColumnDef="distrito">
              <th mat-header-cell *matHeaderCellDef>Distrito</th>
              <td mat-cell *matCellDef="let r">{{ r.distrito }}</td>
            </ng-container>
            <ng-container matColumnDef="seccional">
              <th mat-header-cell *matHeaderCellDef>Seccional</th>
              <td mat-cell *matCellDef="let r">{{ r.seccional }}</td>
            </ng-container>
            <ng-container matColumnDef="mesa">
              <th mat-header-cell *matHeaderCellDef>Mesa</th>
              <td mat-cell *matCellDef="let r">{{ r.mesa }}</td>
            </ng-container>
            <ng-container matColumnDef="local_nombre">
              <th mat-header-cell *matHeaderCellDef>Local (desc_local)</th>
              <td mat-cell *matCellDef="let r">{{ r.local_nombre || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="local_encontrado">
              <th mat-header-cell *matHeaderCellDef>Local vinculado</th>
              <td mat-cell *matCellDef="let r">
                <span [style.color]="r.local_encontrado === 'Sí' ? '#388e3c' : (r.local_encontrado === '—' ? '#999' : '#e65100')">
                  {{ r.local_encontrado }}
                </span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="previewCols"></tr>
            <tr mat-row *matRowDef="let row; columns: previewCols;"></tr>
          </table>
        }

        @if (previewData().errores?.length) {
          <h4 style="color:#c62828;margin-top:16px">Registros con errores (no se importarán)</h4>
          @for (e of previewData().errores; track $index) {
            <div class="error-row">Fila {{ e.fila }}: {{ e.errores?.join(', ') ?? e.mensaje }}</div>
          }
        }
      }

      @case ('confirmando') {
        <div style="text-align:center;padding:40px">
          <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
          <p style="margin-top:16px;color:#666">Importando registros, por favor espere...</p>
        </div>
      }

      @case ('resultado') {
        <div class="resultado-panel">
          <mat-icon style="font-size:64px;width:64px;height:64px;color:#388e3c;display:block;margin:0 auto 16px">check_circle</mat-icon>
          <h3>¡Importación completada!</h3>
          <div class="stats-mini" style="justify-content:center">
            <span class="chip green">{{ resultado().importados }} importados</span>
            <span class="chip orange">{{ resultado().saltados }} saltados (duplicados)</span>
          </div>
          <button mat-raised-button color="primary" (click)="resetear()" style="margin-top:24px">
            <mat-icon>upload_file</mat-icon> Nueva Importación
          </button>
        </div>
      }
    }

    @if (errorGeneral()) {
      <div class="error-banner"><mat-icon>error_outline</mat-icon> {{ errorGeneral() }}</div>
    }
  </div>

  <!-- ── Vincular Locales de Votación ── -->
  <div class="page-card" style="margin-top:16px">
    <h3 style="margin-top:0;color:#1a237e">
      <mat-icon style="vertical-align:middle;margin-right:8px">link</mat-icon>
      Vincular Locales de Votación
    </h3>
    <p style="color:#666;font-size:14px">
      Si los votantes importados no tienen Local de Votación asignado, subí el mismo Excel aquí.
      El sistema buscará la columna <code>desc_locanr</code> y vinculará cada votante al local correspondiente
      sin re-importar datos.
    </p>

    @if (!relinkResultado()) {
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <button mat-raised-button color="accent" (click)="relinkInput.click()" [disabled]="relinkCargando()">
          <mat-icon>upload</mat-icon>
          {{ relinkCargando() ? 'Procesando...' : 'Subir Excel para vincular locales' }}
        </button>
        <input #relinkInput type="file" accept=".xlsx,.xls" style="display:none" (change)="onRelinkFile($event)">
        <span style="font-size:13px;color:#888">Mismas columnas que el padrón importado</span>
      </div>
    }

    @if (relinkResultado()) {
      <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-top:12px">
        <div style="font-weight:600;color:#2e7d32;margin-bottom:8px">Vinculación completada</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <span class="chip green">{{ relinkResultado().actualizados }} vinculados</span>
          <span class="chip green">{{ relinkResultado().creados }} locales nuevos creados</span>
          <span class="chip orange">{{ relinkResultado().sin_local }} sin local en Excel</span>
          <span class="chip red">{{ relinkResultado().no_encontrado }} cédulas no encontradas</span>
        </div>
        <button mat-stroked-button style="margin-top:12px" (click)="relinkResultado.set(null)">
          <mat-icon>refresh</mat-icon> Reintentar
        </button>
      </div>
    }

    @if (relinkError()) {
      <div class="error-banner" style="margin-top:12px"><mat-icon>error_outline</mat-icon> {{ relinkError() }}</div>
    }
  </div>
  `,
  styles: [`
    .drop-zone {
      border:3px dashed #1a237e; border-radius:12px; padding:48px;
      text-align:center; cursor:pointer; transition:.2s;
    }
    .drop-zone:hover { background:#e8eaf6; }
    .drop-zone h3 { margin:8px 0 4px; color:#1a237e; }
    .drop-zone p  { margin:0; color:#666; font-size:14px; }
    .preview-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
    .preview-actions { display:flex; gap:8px; }
    .stats-mini { display:flex; gap:8px; flex-wrap:wrap; }
    .chip { padding:4px 12px; border-radius:16px; font-size:13px; font-weight:600; }
    .chip.green  { background:#e8f5e9; color:#388e3c; }
    .chip.red    { background:#ffebee; color:#c62828; }
    .chip.orange { background:#fff8e1; color:#f57c00; }
    .error-row { background:#ffebee; color:#c62828; padding:8px 12px; border-radius:4px; margin-bottom:4px; font-size:13px; }
    .resultado-panel { text-align:center; padding:32px 0; }
    .error-banner { background:#ffebee; color:#c62828; padding:12px 16px; border-radius:6px; margin-top:16px; display:flex; align-items:center; gap:8px; }
  `]
})
export class ImportarComponent {
  private api = inject(ApiService);

  paso         = signal<Paso>('seleccion');
  previewData  = signal<any>({});
  resultado    = signal<any>({});
  errorGeneral = signal('');
  relinkCargando  = signal(false);
  relinkResultado = signal<any>(null);
  relinkError     = signal('');
  private file: File | null = null;

  previewCols = ['numero_orden','cedula','apellidos','nombres','departamento','distrito','seccional','mesa','local_nombre','local_encontrado'];

  onFile(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.cargarPreview(f);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const f = event.dataTransfer?.files?.[0];
    if (f) this.cargarPreview(f);
  }

  cargarPreview(file: File): void {
    this.file = file;
    this.errorGeneral.set('');
    this.api.importarPreview(file).subscribe({
      next: data => { this.previewData.set(data); this.paso.set('preview'); },
      error: err => this.errorGeneral.set(err?.error?.message ?? 'Error al leer el archivo')
    });
  }

  confirmar(): void {
    if (!this.file) return;
    this.paso.set('confirmando');
    this.api.importarConfirmar(this.file).subscribe({
      next: data => { this.resultado.set(data); this.paso.set('resultado'); },
      error: err => {
        this.errorGeneral.set(err?.error?.message ?? 'Error al importar');
        this.paso.set('preview');
      }
    });
  }

  onRelinkFile(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.relinkCargando.set(true);
    this.relinkError.set('');
    this.relinkResultado.set(null);
    this.api.relinkLocal(f).subscribe({
      next: data => { this.relinkResultado.set(data); this.relinkCargando.set(false); },
      error: err => {
        this.relinkError.set(err?.error?.message ?? 'Error al procesar el archivo');
        this.relinkCargando.set(false);
      }
    });
  }

  resetear(): void {
    this.paso.set('seleccion');
    this.previewData.set({});
    this.resultado.set({});
    this.errorGeneral.set('');
    this.file = null;
  }
}
