import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, Votante, MonitoreoResumen, ZonaResumen } from '../models/votante.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Votantes ────────────────────────────────────────────────
  getVotantes(params: Record<string, any> = {}): Observable<PaginatedResponse<Votante>> {
    let qp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get<PaginatedResponse<Votante>>(`${this.base}/votantes`, { params: qp });
  }

  getVotante(id: number): Observable<Votante> {
    return this.http.get<Votante>(`${this.base}/votantes/${id}`);
  }

  createVotante(data: Partial<Votante>): Observable<Votante> {
    return this.http.post<Votante>(`${this.base}/votantes`, data);
  }

  updateVotante(id: number, data: Partial<Votante>): Observable<Votante> {
    return this.http.put<Votante>(`${this.base}/votantes/${id}`, data);
  }

  importarPreview(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('archivo', file);
    return this.http.post(`${this.base}/votantes/importar/preview`, fd);
  }

  importarConfirmar(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('archivo', file);
    return this.http.post(`${this.base}/votantes/importar/confirmar`, fd);
  }

  // ── Control Votación ────────────────────────────────────────
  buscarVotante(numeroOrden: string): Observable<any> {
    return this.http.get(`${this.base}/control-votacion/buscar/${numeroOrden}`);
  }

  marcarVoto(numero_orden: number): Observable<any> {
    return this.http.post(`${this.base}/control-votacion/marcar`, { numero_orden });
  }

  // ── Monitoreo ───────────────────────────────────────────────
  getResumen(): Observable<MonitoreoResumen> {
    return this.http.get<MonitoreoResumen>(`${this.base}/monitoreo/resumen`);
  }

  getFaltantes(params: Record<string, any> = {}): Observable<PaginatedResponse<Votante>> {
    let qp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get<PaginatedResponse<Votante>>(`${this.base}/monitoreo/faltantes`, { params: qp });
  }

  getPorZona(): Observable<ZonaResumen[]> {
    return this.http.get<ZonaResumen[]>(`${this.base}/monitoreo/por-zona`);
  }

  // ── Catálogos ───────────────────────────────────────────────
  getZonas(): Observable<any[]>         { return this.http.get<any[]>(`${this.base}/zonas`); }
  getJefesZona(): Observable<any[]>     { return this.http.get<any[]>(`${this.base}/jefes-zona`); }
  getCoordinadores(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/coordinadores`); }
  getMovimientos(): Observable<any[]>   { return this.http.get<any[]>(`${this.base}/movimientos`); }
  getLocales(): Observable<any[]>       { return this.http.get<any[]>(`${this.base}/locales`); }

  createZona(data: any): Observable<any>         { return this.http.post(`${this.base}/zonas`, data); }
  updateZona(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/zonas/${id}`, data); }
  createJefeZona(data: any): Observable<any>     { return this.http.post(`${this.base}/jefes-zona`, data); }
  updateJefeZona(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/jefes-zona/${id}`, data); }
  createCoordinador(data: any): Observable<any>  { return this.http.post(`${this.base}/coordinadores`, data); }
  updateCoordinador(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/coordinadores/${id}`, data); }
  createLocal(data: any): Observable<any>        { return this.http.post(`${this.base}/locales`, data); }
  updateLocal(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/locales/${id}`, data); }
  createMovimiento(data: any): Observable<any>   { return this.http.post(`${this.base}/movimientos`, data); }
  updateMovimiento(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/movimientos/${id}`, data); }

  // ── Usuarios ────────────────────────────────────────────────
  getUsuarios(): Observable<any[]>  { return this.http.get<any[]>(`${this.base}/usuarios`); }
  createUsuario(data: any): Observable<any>  { return this.http.post(`${this.base}/usuarios`, data); }
  updateUsuario(id: number, data: any): Observable<any>  { return this.http.put(`${this.base}/usuarios/${id}`, data); }

  // ── Auditoría ───────────────────────────────────────────────
  getAuditoria(params: Record<string, any> = {}): Observable<PaginatedResponse<any>> {
    let qp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get<PaginatedResponse<any>>(`${this.base}/auditoria`, { params: qp });
  }

  // ── Reportes - datos JSON ────────────────────────────────────
  getReportePorCoordinador(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/por-coordinador`);
  }

  getReportePorLocal(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/por-local`);
  }

  getReporteVelocidadPorHora(): Observable<any> {
    return this.http.get<any>(`${this.base}/reportes/velocidad-por-hora`);
  }

  getReporteMarcaciones(params: Record<string, any> = {}): Observable<PaginatedResponse<any>> {
    let qp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get<PaginatedResponse<any>>(`${this.base}/reportes/marcaciones`, { params: qp });
  }

  getReporteDatosSimilares(): Observable<any> {
    return this.http.get<any>(`${this.base}/reportes/datos-similares`);
  }

  getReporteEstructura(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/estructura`);
  }

  getReporteCargaPorUsuario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/reportes/carga-por-usuario`);
  }

  // ── Reportes - descargas Excel (blob) ───────────────────────
  descargarPadronCompleto(params: Record<string, any> = {}): Observable<Blob> {
    let qp = new HttpParams().set('exportar', '1');
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get(`${this.base}/reportes/padron-completo`, { params: qp, responseType: 'blob' });
  }

  descargarPadronZona(zonaId: number): Observable<Blob> {
    return this.http.get(`${this.base}/reportes/padron-zona/${zonaId}`, {
      params: new HttpParams().set('exportar', '1'),
      responseType: 'blob'
    });
  }

  descargarPadronCoordinador(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/reportes/padron-coordinador/${id}`, {
      params: new HttpParams().set('exportar', '1'),
      responseType: 'blob'
    });
  }

  descargarFaltantes(params: Record<string, any> = {}): Observable<Blob> {
    let qp = new HttpParams().set('exportar', '1');
    Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') qp = qp.set(k, v); });
    return this.http.get(`${this.base}/monitoreo/faltantes`, { params: qp, responseType: 'blob' });
  }
}
