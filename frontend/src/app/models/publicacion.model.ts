// Tipos compartidos para publicaciones, autores, comentarios y consultas paginadas de la API.
export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfilUrl: string;
}

export interface ComentarioPublico {
  _id: string;
  mensaje: string;
  fechaCreacion: string;
  modificado: boolean;
  autor: AutorPublicacion;
}

export interface PublicacionPublica {
  _id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  imagenUrl?: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  cantidadComentarios: number;
  meGustaDelUsuario: boolean;
  puedeEliminar: boolean;
  comentarios?: ComentarioPublico[];
}

export interface ConsultaPublicaciones {
  orden?: 'fecha' | 'meGusta';
  offset?: number;
  limit?: number;
  usuarioId?: string;
  incluirComentarios?: boolean;
}

export interface PaginaPublicaciones {
  publicaciones: PublicacionPublica[];
  total: number;
  offset: number;
  limit: number;
  hayMas: boolean;
}
