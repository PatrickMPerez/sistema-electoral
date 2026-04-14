import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { Votante } from '../../core/models/votante.model';

@Component({
  selector: 'app-faltantes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatCardModule, MatProgressSpinnerModule
  ],
  template: `
  <div class="page-card">
    <div class="header-row">
      <div>
        <h2 style="margin:0">Votantes Pendientes</h2>
        <p style="margin:4px 0 0;color:#666;font-size:14px">Votantes que aún no han ejercido su voto</p>
      </div>
      <div class="filters">
        <mat-form-field appearance="outline" style="min-width:180px">
          <mat-label>Zona</mat-label>
          <mat-select [(ngModel)]="filtros.zona_id" (ngModelChange)="onFiltro()">
            <mat-option value="">Todas</mat-option>
            @for (z of zonas(); track z.id) {
              <mat-option [value]="z.id">{{ z.nombre_zona }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading()) {
      <div style="display:flex;justify-content:center;padding:40px"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <table mat-table [dataSource]="votantes()" class="mat-elevation-z0">
        <ng-container matColumnDef="numero_orden">
          <th mat-header-cell *matHeaderCellDef>N° Orden</th>
          <td mat-cell *matCellDef="let v">{{ v.numero_orden }}</td>
        </ng-container>
        <ng-container matColumnDef="cedula">
          <th mat-header-cell *matHeaderCellDef>Cédula</th>
          <td mat-cell *matCellDef="let v">{{ v.cedula }}</td>
        </ng-container>
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let v">{{ v.nombre_completo }}</td>
        </ng-container>
        <ng-container matColumnDef="zona">
          <th mat-header-cell *matHeaderCellDef>Zona</th>
          <td mat-cell *matCellDef="let v">{{ v.zona?.nombre_zona ?? '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="telefono">
          <th mat-header-cell *matHeaderCellDef>Teléfono</th>
          <td mat-cell *matCellDef="let v">{{ v.telefono ?? '—' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="columns.length" style="text-align:center;padding:24px;color:#999">
            No hay votantes pendientes
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
    .header-row { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
    .filters { display:flex; gap:12px; }
  `]
})
export class FaltantesComponent implements OnInit {
  private api = inject(ApiService);

  columns  = ['numero_orden','cedula','nombre','zona','telefono'];
  votantes = signal<Votante[]>([]);
  zonas    = signal<any[]>([]);
  total    = signal(0);
  loading  = signal(true);
  perPage  = 25;
  page     = 1;
  filtros: any = { zona_id: '' };

  ngOnInit(): void {
    this.api.getZonas().subscribe(z => this.zonas.set(z));
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.api.getFaltantes({ ...this.filtros, page: this.page, per_page: this.perPage }).subscribe({
      next: r => {
        this.votantes.set(r.data);
        this.total.set(r.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFiltro(): void { this.page = 1; this.cargar(); }
  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.perPage = e.pageSize; this.cargar(); }
}
