import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule, MatExpansionModule
  ],
  template: `
  <div class="page-card">
    <h2 style="margin-top:0">Registro de Auditoría</h2>

    <div class="filters-row">
      <mat-form-field appearance="outline" style="min-width:180px">
        <mat-label>Acción</mat-label>
        <mat-select [(ngModel)]="filtros.accion" (ngModelChange)="onFiltro()">
          <mat-option value="">Todas</mat-option>
          <mat-option value="crear">Crear</mat-option>
          <mat-option value="editar">Editar</mat-option>
          <mat-option value="marcar_voto">Marcar voto</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="min-width:180px">
        <mat-label>Tabla</mat-label>
        <mat-select [(ngModel)]="filtros.tabla" (ngModelChange)="onFiltro()">
          <mat-option value="">Todas</mat-option>
          <mat-option value="votantes">Votantes</mat-option>
          <mat-option value="marcaciones_voto">Marcaciones</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="registros()" class="mat-elevation-z0">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let r">{{ r.created_at | date:'dd/MM/yy HH:mm' }}</td>
        </ng-container>
        <ng-container matColumnDef="usuario">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let r">{{ r.usuario?.name ?? '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="accion">
          <th mat-header-cell *matHeaderCellDef>Acción</th>
          <td mat-cell *matCellDef="let r">
            <span class="accion-badge" [style.background]="colorAccion(r.accion)">{{ r.accion }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="tabla">
          <th mat-header-cell *matHeaderCellDef>Tabla</th>
          <td mat-cell *matCellDef="let r">{{ r.tabla }}</td>
        </ng-container>
        <ng-container matColumnDef="registro_id">
          <th mat-header-cell *matHeaderCellDef>ID Registro</th>
          <td mat-cell *matCellDef="let r"># {{ r.registro_id }}</td>
        </ng-container>
        <ng-container matColumnDef="ip">
          <th mat-header-cell *matHeaderCellDef>IP</th>
          <td mat-cell *matCellDef="let r">{{ r.ip ?? '—' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="columns.length" style="text-align:center;padding:24px;color:#999">
            No hay registros de auditoría
          </td>
        </tr>
      </table>
      <mat-paginator
        [length]="total()"
        [pageSize]="perPage"
        [pageSizeOptions]="[25,50,100]"
        (page)="onPage($event)"
        showFirstLastButtons>
      </mat-paginator>
    }
  </div>
  `,
  styles: [`
    .filters-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
    .accion-badge { padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; color:white; }
  `]
})
export class AuditoriaComponent implements OnInit {
  private api = inject(ApiService);

  columns  = ['fecha','usuario','accion','tabla','registro_id','ip'];
  registros = signal<any[]>([]);
  total    = signal(0);
  loading  = signal(true);
  perPage  = 25;
  page     = 1;
  filtros: any = { accion: '', tabla: '' };

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.api.getAuditoria({ ...this.filtros, page: this.page, per_page: this.perPage }).subscribe({
      next: r => {
        this.registros.set(r.data);
        this.total.set(r.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  colorAccion(a: string): string {
    const map: Record<string, string> = { crear: '#388e3c', editar: '#1976d2', marcar_voto: '#7b1fa2' };
    return map[a] ?? '#757575';
  }

  onFiltro(): void { this.page = 1; this.cargar(); }
  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.perPage = e.pageSize; this.cargar(); }
}
