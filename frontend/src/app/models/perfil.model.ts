import { UsuarioPublico } from './usuario.model';

// Datos personales editables; los permisos de la cuenta se mantienen fuera del formulario.
export interface DatosPerfil {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
}

export interface RespuestaPerfil {
  usuario: UsuarioPublico;
  mensaje?: string;
}
