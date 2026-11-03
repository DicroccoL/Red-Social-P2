import type { Request } from 'express';

export interface UsuarioAutenticado {
  id: string;
  perfil: string;
}

// El guard completa este dato después de verificar el token y consultar al usuario.
export interface SolicitudAutenticada extends Request {
  usuario: UsuarioAutenticado;
}
