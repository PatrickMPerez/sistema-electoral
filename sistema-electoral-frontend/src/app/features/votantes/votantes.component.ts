import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../core/services/api.service';
import { GeografiaService } from '../../core/services/geografia.service';
import { AuthService } from '../../core/services/auth.service';
import { Votante, PaginatedResponse } from '../../core/models/votante.model';
import { VotanteDialogComponent } from './votante-dialog.component';
import { AsignarVotanteDialogComponent } from './asignar-votante-dialog.component';

@Component({
  selector: 'app-votantes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatCardModule, MatProgressSpinnerModule,
    MatTooltipModule, MatExpansionModule, MatBadgeModule
  ],
  template: `
  <div class="page-card">

    <!-- ══ Panel de filtros ══ -->
    <mat-expansion-panel class="filter-panel" [(expanded)]="filtrosAbiertos">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon style="margin-right:6px;color:#b71c1c">filter_list</mat-icon>
          Filtros
          @if (filtrosActivos() > 0) {
            <span class="filtros-badge">{{ filtrosActivos() }} activo(s)</span>
          }
        </mat-panel-title>
      </mat-expansion-panel-header>

      <div class="filters-grid">

        <!-- Búsqueda libre -->
        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Buscar por nombre o cédula</mat-label>
          <input matInput [(ngModel)]="filtros.buscar"
                 (ngModelChange)="onFiltro()"
                 placeholder="Nombre, apellido, cédula...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <!-- Departamento -->
        <mat-form-field appearance="outline">
          <mat-label>Departamento</mat-label>
          <mat-select [(ngModel)]="filtros.departamento"
                      (selectionChange)="onDepartamentoFiltro($event)">
            <mat-option value="">Todos</mat-option>
            @for (d of departamentos(); track d) {
              <mat-option [value]="d">{{ d }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Distrito -->
        <mat-form-field appearance="outline">
          <mat-label>Distrito</mat-label>
          <mat-select [(ngModel)]="filtros.distrito"
                      (selectionChange)="onFiltro()"
                      [disabled]="!distritosFiltrables().length">
            <mat-option value="">Todos</mat-option>
            @for (d of distritosFiltrables(); track d) {
              <mat-option [value]="d">{{ d }}</mat-option>
            }
          </mat-select>
          @if (!distritosFiltrables().length && !filtros.departamento) {
            <mat-hint>Seleccione un departamento primero</mat-hint>
          }
        </mat-form-field>

        <!-- Zona -->
        <mat-form-field appearance="outline">
          <mat-label>Zona</mat-label>
          <mat-select [(ngModel)]="filtros.zona_id" (ngModelChange)="onFiltro()">
            <mat-option value="">Todas</mat-option>
            @for (z of zonasFiltradas(); track z.id) {
              <mat-option [value]="z.id">{{ z.nombre_zona }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Estado -->
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="filtros.estado_votacion" (ngModelChange)="onFiltro()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="registrado">Pendiente (no votó)</mat-option>
            <mat-option value="ya_voto">Ya votó</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Coordinador (solo jefe_zona y administrador) -->
        @if (mostrarCoordinador()) {
          <mat-form-field appearance="outline" class="span-2">
            <mat-label>Coordinador</mat-label>
            <mat-select [(ngModel)]="filtros.coordinador_id" (ngModelChange)="onFiltro()">
              <mat-option value="">Todos los coordinadores</mat-option>
              <mat-option value="sin_asignar">— Sin coordinador asignado —</mat-option>
              @for (c of coordinadores(); track c.id) {
                <mat-option [value]="c.id">{{ c.nombre_completo }}</mat-option>
              }
            </mat-select>
            <mat-icon matSuffix>supervisor_account</mat-icon>
          </mat-form-field>
        }

        <!-- Acciones -->
        <div class="filter-actions span-2">
          <button mat-stroked-button color="warn" (click)="limpiarFiltros()">
            <mat-icon>clear</mat-icon> Limpiar filtros
          </button>
          @if (esAdmin()) {
            <button mat-raised-button color="primary" (click)="abrirDialog()">
              <mat-icon>person_add</mat-icon> Nuevo Votante
            </button>
          }
        </div>
      </div>
    </mat-expansion-panel>

    <!-- ══ Carga ══ -->
    @if (loading()) {
      <div class="loading-wrap"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {

      <!-- ══ Vista móvil: tarjetas ══ -->
      <div class="mobile-cards">
        @if (votantes().length === 0) {
          <div class="no-data">No se encontraron votantes con los filtros seleccionados</div>
        }
        @for (v of votantes(); track v.id) {
          <div class="voter-card">
            <div class="card-top">
              <div class="card-info">
                <span class="card-nombre">{{ v.nombres }} {{ v.apellidos }}</span>
                <span class="card-cedula">CI: {{ v.cedula }}</span>
                @if (mostrarCoordinador()) {
                  <span class="card-coord">
                    <mat-icon class="icon-sm">supervisor_account</mat-icon>
                    {{ v.coordinador?.nombre_completo ?? '—' }}
                  </span>
                }
              </div>
              <span [class]="v.estado_votacion === 'ya_voto' ? 'badge-voto' : 'badge-pend'">
                {{ v.estado_votacion === 'ya_voto' ? '✓ Votó' : '○ Pendiente' }}
              </span>
            </div>
            <div class="card-bottom">
              <span class="card-meta">Mesa {{ v.mesa ?? '—' }} · {{ v.distrito ?? '—' }}</span>
              <button mat-icon-button color="primary"
                      [matTooltip]="esAdmin() ? 'Editar' : 'Asignar'"
                      (click)="abrirDialog(v)">
                <mat-icon>{{ esAdmin() ? 'edit' : 'how_to_reg' }}</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- ══ Vista escritorio: tabla ══ -->
      <div class="table-wrap">
        <table mat-table [dataSource]="votantes()" class="mat-elevation-z0 full-table">

          <ng-container matColumnDef="numero_orden">
            <th mat-header-cell *matHeaderCellDef>N° Orden</th>
            <td mat-cell *matCellDef="let v">{{ v.numero_orden }}</td>
          </ng-container>

          <ng-container matColumnDef="cedula">
            <th mat-header-cell *matHeaderCellDef>Cédula</th>
            <td mat-cell *matCellDef="let v">{{ v.cedula }}</td>
          </ng-container>

          <ng-container matColumnDef="nombres">
            <th mat-header-cell *matHeaderCellDef>Nombres</th>
            <td mat-cell *matCellDef="let v">{{ v.nombres }}</td>
          </ng-container>

          <ng-container matColumnDef="apellidos">
            <th mat-header-cell *matHeaderCellDef>Apellidos</th>
            <td mat-cell *matCellDef="let v">{{ v.apellidos }}</td>
          </ng-container>

          <ng-container matColumnDef="coordinador">
            <th mat-header-cell *matHeaderCellDef>Coordinador</th>
            <td mat-cell *matCellDef="let v">{{ v.coordinador?.nombre_completo ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="departamento">
            <th mat-header-cell *matHeaderCellDef>Departamento</th>
            <td mat-cell *matCellDef="let v">{{ v.departamento ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="distrito">
            <th mat-header-cell *matHeaderCellDef>Distrito</th>
            <td mat-cell *matCellDef="let v">{{ v.distrito ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="seccional">
            <th mat-header-cell *matHeaderCellDef>Seccional</th>
            <td mat-cell *matCellDef="let v">{{ v.seccional ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="local">
            <th mat-header-cell *matHeaderCellDef>Local</th>
            <td mat-cell *matCellDef="let v">{{ v.local_votacion?.nombre_local ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="mesa">
            <th mat-header-cell *matHeaderCellDef>Mesa</th>
            <td mat-cell *matCellDef="let v">{{ v.mesa ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let v">
              <span [class]="v.estado_votacion === 'ya_voto' ? 'badge-voto' : 'badge-pend'">
                {{ v.estado_votacion === 'ya_voto' ? 'Votó' : 'Pendiente' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let v">
              <button mat-icon-button color="primary"
                      [matTooltip]="esAdmin() ? 'Editar' : 'Asignar'"
                      (click)="abrirDialog(v)">
                <mat-icon>{{ esAdmin() ? 'edit' : 'how_to_reg' }}</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns()"></tr>
          <tr mat-row *matRowDef="let row; columns: columns();"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="columns().length"
                style="text-align:center;padding:32px;color:#999">
              No se encontraron votantes con los filtros seleccionados
            </td>
          </tr>
        </table>
      </div>

      <div class="paginator-row">
        <span class="total-label">Total: <strong>{{ total() }}</strong> votantes</span>
        <mat-paginator
          [length]="total()"
          [pageSize]="perPage"
          [pageSizeOptions]="[25, 50, 100]"
          (page)="onPage($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    }
  </div>
  `,
  styles: [`
    .filter-panel {
      margin-bottom: 16px;
      border-radius: 8px !important;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
      padding: 8px 0 4px;
    }
    .span-2 { grid-column: 1 / -1; }
    .filter-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0 8px;
    }
    .filtros-badge {
      background: #b71c1c;
      color: #fff;
      font-size: 11px;
      border-radius: 10px;
      padding: 1px 8px;
      margin-left: 8px;
    }
    .loading-wrap { display: flex; justify-content: center; padding: 48px; }

    /* ── Desktop: tabla ── */
    .mobile-cards { display: none; }
    .table-wrap { overflow-x: auto; }
    .full-table { width: 100%; min-width: 960px; }
    th.mat-header-cell {
      font-weight: 700;
      white-space: nowrap;
      background: #fafafa;
    }
    td.mat-cell { white-space: nowrap; font-size: 13px; }

    /* ── Badges de estado ── */
    .badge-voto {
      background: #e8f5e9; color: #2e7d32;
      padding: 3px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 600;
    }
    .badge-pend {
      background: #fff3e0; color: #e65100;
      padding: 3px 10px; border-radius: 12px;
      font-size: 12px; font-weight: 600;
    }

    /* ── Paginador ── */
    .paginator-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .total-label { font-size: 13px; color: #555; }

    /* ── Mobile: tarjetas ── */
    @media (max-width: 767px) {
      .mobile-cards  { display: block; }
      .table-wrap    { display: none; }
      .filters-grid  { grid-template-columns: 1fr; }
      .span-2        { grid-column: 1; }
      .filter-actions { flex-direction: column; gap: 8px; align-items: stretch; }
      .filter-actions button { width: 100%; }
    }
    .voter-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      gap: 8px;
    }
    .card-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .card-nombre {
      font-weight: 600;
      font-size: 15px;
      color: #1a237e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-cedula { font-size: 13px; color: #666; }
    .card-coord {
      font-size: 12px;
      color: #555;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .icon-sm { font-size: 14px !important; width: 14px !important; height: 14px !important; }
    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f0f0f0;
      padding-top: 8px;
    }
    .card-meta { font-size: 12px; color: #888; }
    .no-data { text-align: center; padding: 32px; color: #999; }
  `]
})
export class VotantesComponent implements OnInit {
  private api    = inject(ApiService);
  private dialog = inject(MatDialog);
  private geo    = inject(GeografiaService);
  private auth   = inject(AuthService);

  esAdmin = computed(() => this.auth.role() === 'administrador');
  mostrarCoordinador = computed(() =>
    this.auth.role() === 'jefe_zona' || this.auth.role() === 'administrador'
  );

  columns = computed(() => {
    const cols = ['numero_orden', 'cedula', 'nombres', 'apellidos'];
    if (this.mostrarCoordinador()) cols.push('coordinador');
    cols.push('departamento', 'distrito', 'seccional', 'local', 'mesa', 'estado', 'acciones');
    return cols;
  });

  votantes      = signal<Votante[]>([]);
  total         = signal(0);
  loading       = signal(true);
  coordinadores = signal<any[]>([]);
  perPage       = 25;
  page          = 1;
  filtrosAbiertos = true;

  departamentos       = signal<string[]>([]);
  distritosFiltrables = signal<string[]>([]);
  zonas               = signal<any[]>([]);
  zonasFiltradas      = signal<any[]>([]);

  filtros = {
    buscar:          '',
    departamento:    '',
    distrito:        '',
    zona_id:         '' as string | number,
    estado_votacion: '',
    coordinador_id:  '' as string | number,
  };

  ngOnInit(): void {
    this.departamentos.set(this.geo.getDepartamentos());
    this.api.getZonas().subscribe(z => {
      this.zonas.set(z);
      this.zonasFiltradas.set(z);
    });
    if (this.mostrarCoordinador()) {
      this.api.getCoordinadores().subscribe(c => this.coordinadores.set(c));
    }
    this.cargar();
  }

  filtrosActivos(): number {
    return Object.values(this.filtros).filter(v => v !== '' && v !== null).length;
  }

  onDepartamentoFiltro(event: MatSelectChange): void {
    const dpto = event.value as string;
    this.filtros.distrito = '';
    this.filtros.zona_id  = '';

    if (dpto) {
      this.distritosFiltrables.set(this.geo.getDistritos(dpto));
      const kw = dpto.split(' ')[0].toUpperCase();
      const zf = this.zonas().filter(z => z.nombre_zona.toUpperCase().includes(kw));
      this.zonasFiltradas.set(zf.length ? zf : this.zonas());
    } else {
      this.distritosFiltrables.set([]);
      this.zonasFiltradas.set(this.zonas());
    }

    this.onFiltro();
  }

  onFiltro(): void { this.page = 1; this.cargar(); }

  limpiarFiltros(): void {
    this.filtros.buscar          = '';
    this.filtros.departamento    = '';
    this.filtros.distrito        = '';
    this.filtros.zona_id         = '';
    this.filtros.estado_votacion = '';
    this.filtros.coordinador_id  = '';
    this.distritosFiltrables.set([]);
    this.zonasFiltradas.set(this.zonas());
    this.onFiltro();
  }

  onPage(e: PageEvent): void {
    this.page    = e.pageIndex + 1;
    this.perPage = e.pageSize;
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const params: Record<string, any> = {
      ...this.filtros,
      page:     this.page,
      per_page: this.perPage,
    };
    this.api.getVotantes(params).subscribe({
      next: r => {
        this.votantes.set(r.data);
        this.total.set(r.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  abrirDialog(votante?: Votante): void {
    const role = this.auth.role();
    const usarAsignar = role === 'jefe_zona' || role === 'coordinador';

    if (usarAsignar && votante) {
      const ref = this.dialog.open(AsignarVotanteDialogComponent, {
        width: '560px',
        maxHeight: '90vh',
        data: votante
      });
      ref.afterClosed().subscribe(ok => { if (ok) this.cargar(); });
    } else {
      const ref = this.dialog.open(VotanteDialogComponent, {
        width: '700px',
        maxHeight: '90vh',
        data: votante ?? null
      });
      ref.afterClosed().subscribe(ok => { if (ok) this.cargar(); });
    }
  }
}
