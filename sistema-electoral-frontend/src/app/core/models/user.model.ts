export type Rol = 'administrador' | 'jefe_zona' | 'coordinador' | 'vedor';

export interface User {
  id: number;
  name: string;
  username: string;
  role: Rol;
  activo: boolean;
  mesa?: string;
  zona_id?: number;
  jefe_zona_id?: number;
  coordinador_id?: number;
  zona?: { id: number; nombre: string };
  jefe_zona?: { id: number; nombre: string };
  coordinador?: { id: number; nombre: string };
}

export interface LoginResponse {
  user: User;
  token: string;
}
