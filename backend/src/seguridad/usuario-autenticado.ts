import type { Request } from 'express';
import type { ContenidoToken } from './contenido-token';

// Identidad que SesionGuard agrega a la solicitud después de comprobar el token y la cuenta.
export interface UsuarioAutenticado {
  id: string;
  perfil: string;
}

// El guard completa este dato después de verificar el token y consultar al usuario.
export interface SolicitudAutenticada extends Request {
  usuario: UsuarioAutenticado;
  sesion: ContenidoToken;
}
