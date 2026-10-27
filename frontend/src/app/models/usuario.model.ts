export interface UsuarioPublico {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfilUrl: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
}

export interface RespuestaAutenticacion {
  mensaje: string;
  usuario: UsuarioPublico;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasena: string;
  repetirContrasena: string;
  fechaNacimiento: string;
  descripcion: string;
}
