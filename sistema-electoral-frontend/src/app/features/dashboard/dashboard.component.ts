import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { MonitoreoResumen, ZonaResumen } from '../../core/models/votante.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule,
    MatProgressBarModule, MatTableModule, MatButtonModule, RouterLink
  ],
  template: `
  <div>
    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1a237e">
          <mat-icon>people</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ resumen()?.total ?? '—' }}</div>
          <div class="stat-label">Total Votantes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#388e3c">
          <mat-icon>how_to_vote</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ resumen()?.ya_votaron ?? '—' }}</div>
          <div class="stat-label">Ya Votaron</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#f57c00">
          <mat-icon>person_off</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ resumen()?.pendientes ?? '—' }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:#6a1b9a">
          <mat-icon>percent</mat-icon>
        </div>
        <div>
          <div class="stat-value">{{ resumen()?.porcentaje ?? 0 | number:'1.1-1' }}%</div>
          <div class="stat-label">Participación</div>
        </div>
      </div>
    </div>

    <!-- Barra progreso -->
    @if (resumen()) {
      <mat-card class="page-card" style="margin-bottom:24px">
        <mat-card-header>
          <mat-card-title>Progreso de Votación</mat-card-title>
        </mat-card-header>
        <mat-card-content style="padding-top:16px">
          <mat-progress-bar
            mode="determinate"
            [value]="resumen()!.porcentaje"
            color="primary"
            style="height:12px; border-radius:6px">
          </mat-progress-bar>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px;color:#666">
            <span>0%</span>
            <span><strong>{{ resumen()!.porcentaje | number:'1.1-1' }}%</strong> completado</span>
            <span>100%</span>
          </div>
        </mat-card-content>
      </mat-card>
    }

    <!-- Tabla por zona (solo admin/jefe) -->
    @if (isAdmin() && zonas().length) {
      <mat-card class="page-card">
        <mat-card-header>
          <mat-card-title>Resultados por Zona</mat-card-title>
          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/faltantes">Ver Faltantes</a>
        </mat-card-header>
        <mat-card-content style="padding-top:8px">
          <table mat-table [dataSource]="zonas()" style="width:100%">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Zona</th>
              <td mat-cell *matCellDef="let z">{{ z.nombre }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let z">{{ z.total }}</td>
            </ng-container>
            <ng-container matColumnDef="ya_votaron">
              <th mat-header-cell *matHeaderCellDef>Votaron</th>
              <td mat-cell *matCellDef="let z"><span class="badge-voto">{{ z.ya_votaron }}</span></td>
            </ng-container>
            <ng-container matColumnDef="pendientes">
              <th mat-header-cell *matHeaderCellDef>Pendientes</th>
              <td mat-cell *matCellDef="let z"><span class="badge-pend">{{ z.pendientes }}</span></td>
            </ng-container>
            <ng-container matColumnDef="porcentaje">
              <th mat-header-cell *matHeaderCellDef>%</th>
              <td mat-cell *matCellDef="let z">
                <mat-progress-bar mode="determinate" [value]="z.porcentaje" style="max-width:120px;display:inline-block"></mat-progress-bar>
                {{ z.porcentaje | number:'1.0-0' }}%
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="zonaCols"></tr>
            <tr mat-row *matRowDef="let row; columns: zonaCols;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    }
  </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-xl); }
    .stat-card { background: #fff; padding: var(--space-lg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: var(--space-md); border: 1px solid var(--c-border); }
    .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--c-text-main); font-family: var(--font-family-heading); line-height: 1.2; }
    .stat-label { font-size: 0.85rem; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .page-card { border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--c-border); margin-bottom: var(--space-xl); }
    .badge-voto { background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: var(--radius-full); font-weight: 600; font-size: 0.8rem; }
    .badge-pend { background: #fff3e0; color: #ef6c00; padding: 4px 8px; border-radius: var(--radius-full); font-weight: 600; font-size: 0.8rem; }
    .spacer { flex: 1; }
  `]
})
export class DashboardComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  resumen = signal<MonitoreoResumen | null>(null);
  zonas   = signal<ZonaResumen[]>([]);
  zonaCols = ['nombre','total','ya_votaron','pendientes','porcentaje'];

  isAdmin = () => this.auth.hasRole('administrador','jefe_zona');

  ngOnInit(): void {
    this.api.getResumen().subscribe(r => this.resumen.set(r));
    if (this.isAdmin()) {
      this.api.getPorZona().subscribe(z => this.zonas.set(z));
    }
  }
}
