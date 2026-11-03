import { Types } from 'mongoose';

export interface AutorPoblado {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfilUrl: string;
}

export const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfilUrl';

export function autorPublico(autor: AutorPoblado | null) {
  return {
    _id: autor?._id.toString() ?? '',
    nombre: autor?.nombre ?? 'Cuenta eliminada',
    apellido: autor?.apellido ?? '',
    nombreUsuario: autor?.nombreUsuario ?? '',
    imagenPerfilUrl: autor?.imagenPerfilUrl ?? '',
  };
}
