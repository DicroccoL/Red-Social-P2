import { Types } from 'mongoose';
import { AutorPoblado, autorPublico } from '../compartido/autor-publico';
import { UsuarioAutenticado } from '../seguridad/usuario-autenticado';

export interface PublicacionConAutor {
  _id: Types.ObjectId;
  titulo: string;
  descripcion: string;
  usuario: AutorPoblado | null;
  fechaCreacion: Date;
  imagenUrl?: string;
  meGusta: Types.ObjectId[];
}

// Armamos los datos públicos: no exponemos el identificador de Cloudinary ni la lista de likes.
export function publicacionPublica(
  publicacion: PublicacionConAutor,
  usuario: UsuarioAutenticado,
  cantidadComentarios: number,
) {
  const autor = autorPublico(publicacion.usuario);
  return {
    _id: publicacion._id.toString(),
    titulo: publicacion.titulo,
    descripcion: publicacion.descripcion,
    fechaCreacion: publicacion.fechaCreacion,
    imagenUrl: publicacion.imagenUrl,
    autor,
    cantidadMeGusta: publicacion.meGusta.length,
    cantidadComentarios,
    meGustaDelUsuario: publicacion.meGusta.some((id) => id.toString() === usuario.id),
    puedeEliminar: autor._id === usuario.id || usuario.perfil === 'administrador',
  };
}
