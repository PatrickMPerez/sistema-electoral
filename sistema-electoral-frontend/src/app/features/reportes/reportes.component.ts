import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatCardModule, MatExpansionModule, MatDividerModule, MatChipsModule
  ],
  template: `
<div class="rep-wrap">

  <mat-tab-group animationDuration="150ms" (selectedTabChange)="onTab($event.index)">

    <!-- ═══════════════════════════════════════════════════════════
         TAB 1: DÍA D
    ═══════════════════════════════════════════════════════════════ -->
    <mat-tab>
      <ng-template mat-tab-label>
        <span class="material-symbols-outlined tab-icon">how_to_vote</span>
        Operativo Día D
      </ng-template>

      <!-- Avance por coordinador -->
      <div class="section">
        <div class="section-head">
          <span class="material-symbols-outlined sec-icon blue">groups</span>
          <div>
            <h3>Avance por Coordinador</h3>
            <p>Comparativa de rendimiento · ordenado de peor a mejor</p>
          </div>
        </div>

        @if (loadingCoord()) {
          <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
        } @else if (porCoordinador().length === 0) {
          <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin datos</div>
        } @else {
          <table mat-table [dataSource]="porCoordinador()" class="rep-table">
            <ng-container matColumnDef="coordinador">
              <th mat-header-cell *matHeaderCellDef>Coordinador</th>
              <td mat-cell *matCellDef="let r">{{ r.coordinador }}</td>
            </ng-container>
            <ng-container matColumnDef="zona">
              <th mat-header-cell *matHeaderCellDef>Zona</th>
              <td mat-cell *matCellDef="let r">{{ r.zona ?? '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let r">{{ r.total }}</td>
            </ng-container>
            <ng-container matColumnDef="ya_votaron">
              <th mat-header-cell *matHeaderCellDef>Votaron</th>
              <td mat-cell *matCellDef="let r"><span class="badge-v">{{ r.ya_votaron }}</span></td>
            </ng-container>
            <ng-container matColumnDef="pendientes">
              <th mat-header-cell *matHeaderCellDef>Pendientes</th>
              <td mat-cell *matCellDef="let r"><span class="badge-p">{{ r.pendientes }}</span></td>
            </ng-container>
            <ng-container matColumnDef="porcentaje">
              <th mat-header-cell *matHeaderCellDef>Avance</th>
              <td mat-cell *matCellDef="let r">
                <div class="prog-cell">
                  <mat-progress-bar mode="determinate" [value]="r.porcentaje"
                    [color]="r.porcentaje >= 75 ? 'primary' : 'warn'"
                    style="flex:1;border-radius:4px"></mat-progress-bar>
                  <span class="prog-pct">{{ r.porcentaje | number:'1.0-1' }}%</span>
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="coordCols"></tr>
            <tr mat-row *matRowDef="let r; columns: coordCols;"></tr>
          </table>
        }
      </div>

      <!-- Avance por local (solo admin y jefe) -->
      @if (isAdminOrJefe()) {
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon green">location_on</span>
            <div>
              <h3>Avance por Local de Votación</h3>
              <p>Ordenado por mayor cantidad de faltantes</p>
            </div>
          </div>

          @if (loadingLocal()) {
            <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
          } @else if (porLocal().length === 0) {
            <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin datos</div>
          } @else {
            <table mat-table [dataSource]="porLocal()" class="rep-table">
              <ng-container matColumnDef="local">
                <th mat-header-cell *matHeaderCellDef>Local</th>
                <td mat-cell *matCellDef="let r">{{ r.local }}</td>
              </ng-container>
              <ng-container matColumnDef="localidad">
                <th mat-header-cell *matHeaderCellDef>Localidad</th>
                <td mat-cell *matCellDef="let r">{{ r.localidad }}</td>
              </ng-container>
              <ng-container matColumnDef="zona">
                <th mat-header-cell *matHeaderCellDef>Zona</th>
                <td mat-cell *matCellDef="let r">{{ r.zona ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let r">{{ r.total }}</td>
              </ng-container>
              <ng-container matColumnDef="ya_votaron">
                <th mat-header-cell *matHeaderCellDef>Votaron</th>
                <td mat-cell *matCellDef="let r"><span class="badge-v">{{ r.ya_votaron }}</span></td>
              </ng-container>
              <ng-container matColumnDef="pendientes">
                <th mat-header-cell *matHeaderCellDef>Pendientes</th>
                <td mat-cell *matCellDef="let r"><span class="badge-p">{{ r.pendientes }}</span></td>
              </ng-container>
              <ng-container matColumnDef="porcentaje">
                <th mat-header-cell *matHeaderCellDef>Avance</th>
                <td mat-cell *matCellDef="let r">
                  <div class="prog-cell">
                    <mat-progress-bar mode="determinate" [value]="r.porcentaje" style="flex:1;border-radius:4px"></mat-progress-bar>
                    <span class="prog-pct">{{ r.porcentaje | number:'1.0-1' }}%</span>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="localCols"></tr>
              <tr mat-row *matRowDef="let r; columns: localCols;"></tr>
            </table>
          }
        </div>
      }

      <!-- Velocidad por hora (solo admin) -->
      @if (isAdmin()) {
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon orange">speed</span>
            <div>
              <h3>Velocidad de Marcación por Hora</h3>
              <p>Total acumulado y marcaciones por franja horaria</p>
            </div>
          </div>

          @if (velocidad()) {
            <div class="vel-summary">
              <span class="vel-total">{{ velocidad().total_marcaciones }}</span>
              <span class="vel-label">marcaciones totales</span>
            </div>
            <table mat-table [dataSource]="velocidad().por_hora" class="rep-table">
              <ng-container matColumnDef="hora">
                <th mat-header-cell *matHeaderCellDef>Hora</th>
                <td mat-cell *matCellDef="let r">{{ r.hora }}</td>
              </ng-container>
              <ng-container matColumnDef="marcaciones">
                <th mat-header-cell *matHeaderCellDef>Marcaciones</th>
                <td mat-cell *matCellDef="let r"><span class="badge-v">{{ r.marcaciones }}</span></td>
              </ng-container>
              <ng-container matColumnDef="acumulado">
                <th mat-header-cell *matHeaderCellDef>Acumulado</th>
                <td mat-cell *matCellDef="let r">{{ r.acumulado }}</td>
              </ng-container>
              <ng-container matColumnDef="porcentaje">
                <th mat-header-cell *matHeaderCellDef>% Acum.</th>
                <td mat-cell *matCellDef="let r">
                  <div class="prog-cell">
                    <mat-progress-bar mode="determinate" [value]="r.porcentaje" style="flex:1;border-radius:4px"></mat-progress-bar>
                    <span class="prog-pct">{{ r.porcentaje | number:'1.0-1' }}%</span>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="velCols"></tr>
              <tr mat-row *matRowDef="let r; columns: velCols;"></tr>
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="4" style="text-align:center;padding:24px;color:#999">
                  Sin marcaciones aún
                </td>
              </tr>
            </table>
          } @else {
            <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin marcaciones registradas aún</div>
          }
        </div>
      }
    </mat-tab>

    <!-- ═══════════════════════════════════════════════════════════
         TAB 2: PADRÓN
    ═══════════════════════════════════════════════════════════════ -->
    <mat-tab>
      <ng-template mat-tab-label>
        <span class="material-symbols-outlined tab-icon">list_alt</span>
        Padrón
      </ng-template>

      <div class="padron-grid">

        <!-- Padrón completo (admin) -->
        @if (isAdmin()) {
          <mat-card class="padron-card">
            <div class="padron-icon" style="background:#1a237e20;color:#1a237e">
              <span class="material-symbols-outlined">table_view</span>
            </div>
            <h4>Padrón Completo</h4>
            <p>Todos los votantes registrados con todos sus datos.</p>
            <div class="padron-chip-row">
              <span class="chip chip-blue">Solo Admin</span>
              <span class="chip chip-green">Excel</span>
            </div>
            <button mat-flat-button color="primary" class="dl-btn"
              [disabled]="downloading === 'completo'"
              (click)="descargarPadronCompleto()">
              @if (downloading === 'completo') {
                <mat-spinner diameter="18" style="margin-right:8px"></mat-spinner>
              } @else {
                <span class="material-symbols-outlined">download</span>
              }
              Descargar Excel
            </button>
          </mat-card>
        }

        <!-- Padrón por zona (admin y jefe) -->
        @if (isAdminOrJefe()) {
          <mat-card class="padron-card">
            <div class="padron-icon" style="background:#1b5e2020;color:#1b5e20">
              <span class="material-symbols-outlined">map</span>
            </div>
            <h4>Padrón por Zona</h4>
            <p>Votantes filtrados por zona geográfica.</p>
            <div class="padron-chip-row">
              <span class="chip chip-blue">Admin · Jefe</span>
              <span class="chip chip-green">Excel</span>
            </div>
            @if (isAdmin()) {
              <mat-form-field appearance="outline" style="width:100%;margin-top:8px">
                <mat-label>Seleccioná la zona</mat-label>
                <mat-select [(ngModel)]="selectedZonaId">
                  @for (z of zonas(); track z.id) {
                    <mat-option [value]="z.id">{{ z.nombre_zona }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            <button mat-flat-button color="primary" class="dl-btn"
              [disabled]="downloading === 'zona' || (isAdmin() && !selectedZonaId)"
              (click)="descargarPadronZona()">
              @if (downloading === 'zona') {
                <mat-spinner diameter="18" style="margin-right:8px"></mat-spinner>
              } @else {
                <span class="material-symbols-outlined">download</span>
              }
              Descargar Excel
            </button>
          </mat-card>
        }

        <!-- Padrón por coordinador (admin y coordinador) -->
        <mat-card class="padron-card">
          <div class="padron-icon" style="background:#e65100 20;color:#e65100">
            <span class="material-symbols-outlined" style="color:#e65100">person_pin</span>
          </div>
          <h4>Padrón por Coordinador</h4>
          <p>Solo los votantes asignados a ese coordinador.</p>
          <div class="padron-chip-row">
            <span class="chip chip-blue">Admin · Coord</span>
            <span class="chip chip-green">Excel</span>
          </div>
          @if (isAdmin()) {
            <mat-form-field appearance="outline" style="width:100%;margin-top:8px">
              <mat-label>Seleccioná el coordinador</mat-label>
              <mat-select [(ngModel)]="selectedCoordId">
                @for (c of coordinadores(); track c.id) {
                  <mat-option [value]="c.id">{{ c.nombre_completo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          <button mat-flat-button color="primary" class="dl-btn"
            [disabled]="downloading === 'coord' || (isAdmin() && !selectedCoordId)"
            (click)="descargarPadronCoordinador()">
            @if (downloading === 'coord') {
              <mat-spinner diameter="18" style="margin-right:8px"></mat-spinner>
            } @else {
              <span class="material-symbols-outlined">download</span>
            }
            Descargar Excel
          </button>
        </mat-card>

        <!-- Faltantes Excel -->
        <mat-card class="padron-card">
          <div class="padron-icon" style="background:#b71c1c20;color:#b71c1c">
            <span class="material-symbols-outlined">person_off</span>
          </div>
          <h4>Lista de Faltantes</h4>
          <p>Votantes que aún no marcaron, con teléfono y coordinador.</p>
          <div class="padron-chip-row">
            <span class="chip chip-blue">Admin · Jefe · Coord</span>
            <span class="chip chip-green">Excel</span>
          </div>
          <button mat-flat-button color="warn" class="dl-btn"
            [disabled]="downloading === 'faltantes'"
            (click)="descargarFaltantes()">
            @if (downloading === 'faltantes') {
              <mat-spinner diameter="18" style="margin-right:8px"></mat-spinner>
            } @else {
              <span class="material-symbols-outlined">download</span>
            }
            Descargar Excel
          </button>
        </mat-card>

      </div>
    </mat-tab>

    <!-- ═══════════════════════════════════════════════════════════
         TAB 3: AUDITORÍA (solo admin)
    ═══════════════════════════════════════════════════════════════ -->
    @if (isAdmin()) {
      <mat-tab>
        <ng-template mat-tab-label>
          <span class="material-symbols-outlined tab-icon">gavel</span>
          Auditoría
        </ng-template>

        <!-- Marcaciones de voto -->
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon purple">fact_check</span>
            <div>
              <h3>Registro de Marcaciones de Voto</h3>
              <p>Cada marcación con veedor, mesa y hora exacta</p>
            </div>
          </div>

          @if (loadingAudit()) {
            <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
          } @else if (marcaciones().length === 0) {
            <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin marcaciones registradas</div>
          } @else {
            <table mat-table [dataSource]="marcaciones()" class="rep-table">
              <ng-container matColumnDef="numero_orden">
                <th mat-header-cell *matHeaderCellDef>N° Orden</th>
                <td mat-cell *matCellDef="let r">{{ r.numero_orden }}</td>
              </ng-container>
              <ng-container matColumnDef="nombre_votante">
                <th mat-header-cell *matHeaderCellDef>Votante</th>
                <td mat-cell *matCellDef="let r">{{ r.nombre_votante }}</td>
              </ng-container>
              <ng-container matColumnDef="veedor">
                <th mat-header-cell *matHeaderCellDef>Veedor</th>
                <td mat-cell *matCellDef="let r">{{ r.veedor ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="mesa">
                <th mat-header-cell *matHeaderCellDef>Mesa</th>
                <td mat-cell *matCellDef="let r">{{ r.mesa ?? '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="fecha_hora">
                <th mat-header-cell *matHeaderCellDef>Fecha / Hora</th>
                <td mat-cell *matCellDef="let r">{{ r.fecha_hora }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="marcaCols"></tr>
              <tr mat-row *matRowDef="let r; columns: marcaCols;"></tr>
            </table>
            <p class="total-hint">Mostrando primeros 100 · Total: <strong>{{ marcacionesTotal() }}</strong></p>
          }
        </div>

        <!-- Datos similares -->
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon red">content_copy</span>
            <div>
              <h3>Detección de Datos Similares</h3>
              <p>Teléfonos duplicados y nombres con sonido similar</p>
            </div>
          </div>

          @if (!datosSimilares()) {
            <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
          } @else {
            <mat-accordion>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="material-symbols-outlined" style="margin-right:8px;color:#e53935">phone</span>
                    Teléfonos duplicados
                    <span class="badge-count">{{ datosSimilares().telefonos_duplicados.length }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                @if (datosSimilares().telefonos_duplicados.length === 0) {
                  <p style="color:#777;padding:8px 0">Sin duplicados detectados.</p>
                } @else {
                  <table mat-table [dataSource]="datosSimilares().telefonos_duplicados" class="rep-table" style="margin-top:8px">
                    <ng-container matColumnDef="votante_1">
                      <th mat-header-cell *matHeaderCellDef>Votante 1</th>
                      <td mat-cell *matCellDef="let r">{{ r.votante_1 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="votante_2">
                      <th mat-header-cell *matHeaderCellDef>Votante 2</th>
                      <td mat-cell *matCellDef="let r">{{ r.votante_2 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="valor">
                      <th mat-header-cell *matHeaderCellDef>Teléfono</th>
                      <td mat-cell *matCellDef="let r"><strong>{{ r.valor }}</strong></td>
                    </ng-container>
                    <ng-container matColumnDef="coordinador_a">
                      <th mat-header-cell *matHeaderCellDef>Coord. A</th>
                      <td mat-cell *matCellDef="let r">{{ r.coordinador_a ?? '—' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="coordinador_b">
                      <th mat-header-cell *matHeaderCellDef>Coord. B</th>
                      <td mat-cell *matCellDef="let r">{{ r.coordinador_b ?? '—' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="dupCols"></tr>
                    <tr mat-row *matRowDef="let r; columns: dupCols;"></tr>
                  </table>
                }
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <span class="material-symbols-outlined" style="margin-right:8px;color:#fb8c00">person</span>
                    Nombres similares (SOUNDEX)
                    <span class="badge-count">{{ datosSimilares().nombres_similares.length }}</span>
                  </mat-panel-title>
                </mat-expansion-panel-header>
                @if (datosSimilares().nombres_similares.length === 0) {
                  <p style="color:#777;padding:8px 0">Sin similitudes detectadas.</p>
                } @else {
                  <table mat-table [dataSource]="datosSimilares().nombres_similares" class="rep-table" style="margin-top:8px">
                    <ng-container matColumnDef="votante_1">
                      <th mat-header-cell *matHeaderCellDef>Votante 1</th>
                      <td mat-cell *matCellDef="let r">{{ r.votante_1 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="votante_2">
                      <th mat-header-cell *matHeaderCellDef>Votante 2</th>
                      <td mat-cell *matCellDef="let r">{{ r.votante_2 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="coordinador_a">
                      <th mat-header-cell *matHeaderCellDef>Coord. A</th>
                      <td mat-cell *matCellDef="let r">{{ r.coordinador_a ?? '—' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="coordinador_b">
                      <th mat-header-cell *matHeaderCellDef>Coord. B</th>
                      <td mat-cell *matCellDef="let r">{{ r.coordinador_b ?? '—' }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="simCols"></tr>
                    <tr mat-row *matRowDef="let r; columns: simCols;"></tr>
                  </table>
                }
              </mat-expansion-panel>
            </mat-accordion>
          }
        </div>
      </mat-tab>
    }

    <!-- ═══════════════════════════════════════════════════════════
         TAB 4: GESTIÓN (solo admin)
    ═══════════════════════════════════════════════════════════════ -->
    @if (isAdmin()) {
      <mat-tab>
        <ng-template mat-tab-label>
          <span class="material-symbols-outlined tab-icon">account_tree</span>
          Gestión
        </ng-template>

        <!-- Estructura territorial -->
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon blue">account_tree</span>
            <div>
              <h3>Estructura Territorial Completa</h3>
              <p>Árbol: zonas → jefes → coordinadores → votantes</p>
            </div>
          </div>

          @if (loadingGestion()) {
            <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
          } @else if (estructura().length === 0) {
            <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin datos</div>
          } @else {
            <mat-accordion multi>
              @for (zona of estructura(); track zona.zona) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <span class="material-symbols-outlined" style="margin-right:8px;font-size:18px">map</span>
                      {{ zona.zona }}
                    </mat-panel-title>
                    <mat-panel-description>
                      Jefe: {{ zona.jefe_zona ?? '—' }} · {{ zona.coordinadores.length }} coordinadores
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  <table mat-table [dataSource]="zona.coordinadores" class="rep-table">
                    <ng-container matColumnDef="coordinador">
                      <th mat-header-cell *matHeaderCellDef>Coordinador</th>
                      <td mat-cell *matCellDef="let c">{{ c.coordinador }}</td>
                    </ng-container>
                    <ng-container matColumnDef="total_votantes">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let c">{{ c.total_votantes }}</td>
                    </ng-container>
                    <ng-container matColumnDef="ya_votaron">
                      <th mat-header-cell *matHeaderCellDef>Votaron</th>
                      <td mat-cell *matCellDef="let c"><span class="badge-v">{{ c.ya_votaron }}</span></td>
                    </ng-container>
                    <ng-container matColumnDef="pendientes">
                      <th mat-header-cell *matHeaderCellDef>Pendientes</th>
                      <td mat-cell *matCellDef="let c"><span class="badge-p">{{ c.pendientes }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="estructCols"></tr>
                    <tr mat-row *matRowDef="let c; columns: estructCols;"></tr>
                    <tr class="mat-row" *matNoDataRow>
                      <td class="mat-cell" colspan="4" style="text-align:center;padding:16px;color:#999">Sin coordinadores</td>
                    </tr>
                  </table>
                </mat-expansion-panel>
              }
            </mat-accordion>
          }
        </div>

        <!-- Carga por usuario -->
        <div class="section">
          <div class="section-head">
            <span class="material-symbols-outlined sec-icon green">upload</span>
            <div>
              <h3>Votantes Cargados por Usuario</h3>
              <p>Cuántos votantes registró cada digitador o coordinador</p>
            </div>
          </div>

          @if (loadingCarga()) {
            <div class="spinner-wrap"><mat-spinner diameter="36"></mat-spinner></div>
          } @else if (cargaPorUsuario().length === 0) {
            <div class="empty-state"><span class="material-symbols-outlined">info</span> Sin datos</div>
          } @else {
            <table mat-table [dataSource]="cargaPorUsuario()" class="rep-table">
              <ng-container matColumnDef="usuario">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let r">{{ r.usuario }}</td>
              </ng-container>
              <ng-container matColumnDef="rol">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let r"><span class="chip chip-blue">{{ r.rol }}</span></td>
              </ng-container>
              <ng-container matColumnDef="votantes_cargados">
                <th mat-header-cell *matHeaderCellDef>Votantes cargados</th>
                <td mat-cell *matCellDef="let r"><strong>{{ r.votantes_cargados }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="primera_carga">
                <th mat-header-cell *matHeaderCellDef>Primera carga</th>
                <td mat-cell *matCellDef="let r">{{ r.primera_carga | date:'dd/MM/yy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="ultima_carga">
                <th mat-header-cell *matHeaderCellDef>Última carga</th>
                <td mat-cell *matCellDef="let r">{{ r.ultima_carga | date:'dd/MM/yy HH:mm' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cargaCols"></tr>
              <tr mat-row *matRowDef="let r; columns: cargaCols;"></tr>
            </table>
          }
        </div>

      </mat-tab>
    }

  </mat-tab-group>
</div>
  `,
  styles: [`
    .rep-wrap { max-width: 1200px; }
    .tab-icon { font-size: 18px; margin-right: 6px; vertical-align: middle; }

    .section { background: #fff; border: 1px solid var(--c-border); border-radius: var(--radius-lg); padding: 20px; margin-top: 20px; }
    .section-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
    .sec-icon { font-size: 28px; margin-top: 2px; }
    .sec-icon.blue   { color: #1565c0; }
    .sec-icon.green  { color: #2e7d32; }
    .sec-icon.orange { color: #e65100; }
    .sec-icon.purple { color: #6a1b9a; }
    .sec-icon.red    { color: #c62828; }
    .section-head h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--c-text-main); }
    .section-head p  { margin: 2px 0 0; font-size: 0.82rem; color: var(--c-text-muted); }

    .rep-table { width: 100%; }
    .prog-cell { display: flex; align-items: center; gap: 8px; min-width: 140px; }
    .prog-pct  { font-size: 12px; font-weight: 600; color: var(--c-text-muted); min-width: 38px; text-align: right; }
    .badge-v { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-p { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-count { background: #e3e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 10px; }

    .spinner-wrap { display: flex; justify-content: center; padding: 32px; }
    .empty-state { display: flex; align-items: center; gap: 8px; color: #999; padding: 24px; font-size: 14px; }

    .vel-summary { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
    .vel-total { font-size: 2rem; font-weight: 700; color: var(--c-primary); }
    .vel-label { font-size: 0.9rem; color: var(--c-text-muted); }

    .padron-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
    .padron-card { padding: 20px !important; display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--c-border) !important; border-radius: var(--radius-lg) !important; }
    .padron-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .padron-icon .material-symbols-outlined { font-size: 26px; }
    .padron-card h4 { margin: 0; font-size: 1rem; font-weight: 600; }
    .padron-card p  { margin: 0; font-size: 0.83rem; color: var(--c-text-muted); line-height: 1.4; flex: 1; }
    .padron-chip-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .dl-btn { margin-top: 4px; display: flex; align-items: center; gap: 6px; }

    .chip { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
    .chip-blue  { background: #e3f2fd; color: #1565c0; }
    .chip-green { background: #e8f5e9; color: #2e7d32; }

    .total-hint { font-size: 12px; color: #999; text-align: right; margin-top: 8px; }

    @media (max-width: 768px) {
      .padron-grid { grid-template-columns: 1fr; }
      .prog-cell { min-width: 100px; }
    }
  `]
})
export class ReportesComponent implements OnInit {
  private api  = inject(ApiService);
  auth = inject(AuthService);

  isAdmin       = () => this.auth.hasRole('administrador');
  isAdminOrJefe = () => this.auth.hasRole('administrador', 'jefe_zona');

  // Data
  porCoordinador   = signal<any[]>([]);
  porLocal         = signal<any[]>([]);
  velocidad        = signal<any>(null);
  marcaciones      = signal<any[]>([]);
  marcacionesTotal = signal(0);
  datosSimilares   = signal<any>(null);
  estructura       = signal<any[]>([]);
  cargaPorUsuario  = signal<any[]>([]);
  zonas            = signal<any[]>([]);
  coordinadores    = signal<any[]>([]);

  // Loading
  loadingCoord   = signal(false);
  loadingLocal   = signal(false);
  loadingAudit   = signal(false);
  loadingGestion = signal(false);
  loadingCarga   = signal(false);

  // Downloads
  downloading: string | null = null;

  // Selects (ngModel)
  selectedZonaId: number | null = null;
  selectedCoordId: number | null = null;

  // Columns
  coordCols   = ['coordinador','zona','total','ya_votaron','pendientes','porcentaje'];
  localCols   = ['local','localidad','zona','total','ya_votaron','pendientes','porcentaje'];
  velCols     = ['hora','marcaciones','acumulado','porcentaje'];
  marcaCols   = ['numero_orden','nombre_votante','veedor','mesa','fecha_hora'];
  dupCols     = ['votante_1','votante_2','valor','coordinador_a','coordinador_b'];
  simCols     = ['votante_1','votante_2','coordinador_a','coordinador_b'];
  estructCols = ['coordinador','total_votantes','ya_votaron','pendientes'];
  cargaCols   = ['usuario','rol','votantes_cargados','primera_carga','ultima_carga'];

  ngOnInit(): void {
    this.cargarTab0();
    if (this.isAdmin()) {
      this.api.getZonas().subscribe(z => this.zonas.set(z));
      this.api.getCoordinadores().subscribe(c => this.coordinadores.set(c));
    }
  }

  onTab(index: number): void {
    if (index === 0) this.cargarTab0();
    if (index === 1 && this.isAdmin() && this.zonas().length === 0) {
      this.api.getZonas().subscribe(z => this.zonas.set(z));
      this.api.getCoordinadores().subscribe(c => this.coordinadores.set(c));
    }
    // Admin has tabs 0,1,2,3 → indices 2=Auditoría, 3=Gestión
    if (this.isAdmin()) {
      if (index === 2 && this.marcaciones().length === 0) this.cargarAuditoria();
      if (index === 3 && this.estructura().length === 0)  this.cargarGestion();
    }
  }

  private cargarTab0(): void {
    if (this.porCoordinador().length > 0) return;
    this.loadingCoord.set(true);
    this.api.getReportePorCoordinador().subscribe({
      next: d => { this.porCoordinador.set(d); this.loadingCoord.set(false); },
      error: () => this.loadingCoord.set(false)
    });

    if (this.isAdminOrJefe()) {
      this.loadingLocal.set(true);
      this.api.getReportePorLocal().subscribe({
        next: d => { this.porLocal.set(d); this.loadingLocal.set(false); },
        error: () => this.loadingLocal.set(false)
      });
    }

    if (this.isAdmin()) {
      this.api.getReporteVelocidadPorHora().subscribe(d => this.velocidad.set(d));
    }
  }

  private cargarAuditoria(): void {
    this.loadingAudit.set(true);
    this.api.getReporteMarcaciones().subscribe({
      next: r => {
        this.marcaciones.set(r.data);
        this.marcacionesTotal.set(r.total);
        this.loadingAudit.set(false);
      },
      error: () => this.loadingAudit.set(false)
    });
    this.api.getReporteDatosSimilares().subscribe(d => this.datosSimilares.set(d));
  }

  private cargarGestion(): void {
    this.loadingGestion.set(true);
    this.loadingCarga.set(true);
    this.api.getReporteEstructura().subscribe({
      next: d => { this.estructura.set(d); this.loadingGestion.set(false); },
      error: () => this.loadingGestion.set(false),
    });
    this.api.getReporteCargaPorUsuario().subscribe({
      next: d => { this.cargaPorUsuario.set(d); this.loadingCarga.set(false); },
      error: () => this.loadingCarga.set(false),
    });
  }

  descargarPadronCompleto(): void {
    this.downloading = 'completo';
    this.api.descargarPadronCompleto().subscribe({
      next: blob => { this.triggerDownload(blob, 'padron-completo.xlsx'); this.downloading = null; },
      error: () => { this.downloading = null; }
    });
  }

  descargarPadronZona(): void {
    const zonaId = this.selectedZonaId ?? this.auth.user()?.zona_id;
    if (!zonaId) return;
    this.downloading = 'zona';
    this.api.descargarPadronZona(zonaId).subscribe({
      next: blob => { this.triggerDownload(blob, `padron-zona-${zonaId}.xlsx`); this.downloading = null; },
      error: () => { this.downloading = null; }
    });
  }

  descargarPadronCoordinador(): void {
    const coordId = this.selectedCoordId ?? this.auth.user()?.coordinador_id;
    if (!coordId) return;
    this.downloading = 'coord';
    this.api.descargarPadronCoordinador(coordId).subscribe({
      next: blob => { this.triggerDownload(blob, `padron-coord-${coordId}.xlsx`); this.downloading = null; },
      error: () => { this.downloading = null; }
    });
  }

  descargarFaltantes(): void {
    this.downloading = 'faltantes';
    this.api.descargarFaltantes().subscribe({
      next: blob => { this.triggerDownload(blob, 'faltantes.xlsx'); this.downloading = null; },
      error: () => { this.downloading = null; }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download  = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
