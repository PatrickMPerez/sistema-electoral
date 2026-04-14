import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { Votante } from '../../core/models/votante.model';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
  <div class="page-card">
    <h2 style="margin-top:0">Búsqueda de Votantes</h2>

    <div class="search-row">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar por nombre, cédula o número de orden</mat-label>
        <input matInput [(ngModel)]="query" (keyup.enter)="buscar()" autofocus>
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="buscar()" [disabled]="!query || loading()">
        @if (loading()) { <mat-spinner diameter="20" color="accent"></mat-spinner> }
        @else { <mat-icon>search</mat-icon> }
        Buscar
      </button>
    </div>

    @if (buscado() && !loading()) {
      <div style="margin-top:16px">
        <p style="color:#666;font-size:14px">{{ resultados().length }} resultado(s) para "{{ query }}"</p>

        @for (v of resultados(); track v.id) {
          <mat-card class="votante-card">
            <mat-card-content>
              <div class="votante-row">
                <mat-icon [style.color]="v.estado_votacion === 'ya_voto' ? '#388e3c' : '#f57c00'" style="font-size:36px;width:36px;height:36px">
                  {{ v.estado_votacion === 'ya_voto' ? 'how_to_vote' : 'person' }}
                </mat-icon>
                <div class="votante-info">
                  <div class="votante-nombre">{{ v.nombres }} {{ v.apellidos }}</div>
                  <div class="meta">
                    <span>Cédula: <strong>{{ v.cedula }}</strong></span>
                    <span>Orden: <strong>{{ v.numero_orden }}</strong></span>
                    <span>Mesa: <strong>{{ v.mesa ?? '—' }}</strong></span>
                  </div>
                  <div class="meta meta-padron">
                    @if (v.departamento) { <span>Dpto.: <strong>{{ v.departamento }}</strong></span> }
                    @if (v.distrito)     { <span>Distrito: <strong>{{ v.distrito }}</strong></span> }
                    @if (v.seccional)    { <span>Seccional: <strong>{{ v.seccional }}</strong></span> }
                    @if (v.local_votacion) { <span>Local: <strong>{{ v.local_votacion.nombre_local }}</strong></span> }
                    @if (v.coordinador)  { <span>Coord.: <strong>{{ v.coordinador.nombre_completo }}</strong></span> }
                  </div>
                </div>
                <span [class]="v.estado_votacion === 'ya_voto' ? 'badge-voto' : 'badge-pend'" class="estado">
                  {{ v.estado_votacion === 'ya_voto' ? 'Ya Votó' : 'Pendiente' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        } @empty {
          <div class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>No se encontraron votantes con esa búsqueda</p>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .search-row { display:flex; gap:12px; align-items:center; }
    .search-field { flex:1; }
    .votante-card { margin-bottom:8px; border-radius:8px !important; }
    .votante-row { display:flex; align-items:center; gap:16px; }
    .votante-info { flex:1; }
    .votante-nombre { font-size:16px; font-weight:600; }
    .meta { display:flex; gap:16px; flex-wrap:wrap; font-size:13px; color:#555; margin-top:4px; }
    .meta-padron { margin-top:2px; }
    .estado { white-space:nowrap; }
    .empty-state { text-align:center; padding:40px; color:#999; }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 8px; }
  `]
})
export class BusquedaComponent {
  private api = inject(ApiService);

  query      = '';
  resultados = signal<Votante[]>([]);
  loading    = signal(false);
  buscado    = signal(false);

  buscar(): void {
    if (!this.query.trim()) return;
    this.loading.set(true);
    this.api.getVotantes({ buscar: this.query.trim(), per_page: 50 }).subscribe({
      next: r => {
        this.resultados.set(r.data);
        this.loading.set(false);
        this.buscado.set(true);
      },
      error: () => this.loading.set(false)
    });
  }
}
