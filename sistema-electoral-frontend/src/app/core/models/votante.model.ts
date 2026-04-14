export type EstadoVotacion = 'registrado' | 'ya_voto';

export interface Votante {
  id: number;
  numero_orden: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  telefono?: string;
  localidad?: string;
  departamento: string;
  distrito: string;
  seccional: string;
  mesa: number;
  estado_votacion: EstadoVotacion;
  zona_id?: number;
  local_votacion_id?: number;
  jefe_zona_id?: number;
  coordinador_id?: number;
  movimiento_id?: number;
  usuario_carga_id?: number;
  zona?:           { id: number; nombre_zona: string };
  local_votacion?: { id: number; nombre_local: string };
  coordinador?:    { id: number; nombre_completo: string };
  jefe_zona?:      { id: number; nombre_completo: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MonitoreoResumen {
  total: number;
  ya_votaron: number;
  pendientes: number;
  porcentaje: number;
}

export interface ZonaResumen {
  zona_id: number;
  nombre: string;
  total: number;
  ya_votaron: number;
  pendientes: number;
  porcentaje: number;
}
