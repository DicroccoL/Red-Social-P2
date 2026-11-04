import { UsuarioDocument } from './schemas/usuario.schema';

// Selecciona los datos de la cuenta que pueden devolverse, sin hash ni identificadores de Cloudinary.
export function usuarioPublico(usuario: UsuarioDocument) {
  return {
    _id: usuario._id.toString(),
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    nombreUsuario: usuario.nombreUsuario,
    fechaNacimiento: usuario.fechaNacimiento,
    descripcion: usuario.descripcion,
    imagenPerfilUrl: usuario.imagenPerfilUrl,
    perfil: usuario.perfil,
    activo: usuario.activo,
  };
}
