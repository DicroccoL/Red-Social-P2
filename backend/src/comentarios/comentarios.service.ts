import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { autorPublico, CAMPOS_AUTOR, AutorPoblado } from '../compartido/autor-publico';
import { Comentario } from './schemas/comentario.schema';

export interface ComentarioPublico {
  _id: string;
  mensaje: string;
  fechaCreacion: Date;
  modificado: boolean;
  autor: ReturnType<typeof autorPublico>;
}

// Consulta comentarios activos y los agrupa por publicación para mostrarlos en el perfil.
@Injectable()
export class ComentariosService {
  constructor(@InjectModel(Comentario.name) private readonly comentarios: Model<Comentario>) {}

  async contarPorPublicacion(identificadores: Types.ObjectId[]): Promise<Map<string, number>> {
    if (!identificadores.length) return new Map();
    const totales = await this.comentarios
      .aggregate<{ _id: Types.ObjectId; total: number }>([
        { $match: { publicacion: { $in: identificadores }, activo: true } },
        { $group: { _id: '$publicacion', total: { $sum: 1 } } },
      ])
      .exec();
    return new Map(totales.map(({ _id, total }) => [_id.toString(), total]));
  }

  async agruparPorPublicacion(identificadores: Types.ObjectId[]) {
    const agrupados: Record<string, ComentarioPublico[]> = {};
    if (!identificadores.length) return agrupados;
    const encontrados = await this.comentarios
      .find({ publicacion: { $in: identificadores }, activo: true })
      .sort({ fechaCreacion: -1, _id: -1 })
      .populate<{ usuario: AutorPoblado | null }>('usuario', CAMPOS_AUTOR)
      .exec();

    for (const comentario of encontrados) {
      const clave = comentario.publicacion.toString();
      agrupados[clave] ??= [];
      agrupados[clave].push({
        _id: comentario._id.toString(),
        mensaje: comentario.mensaje,
        fechaCreacion: comentario.fechaCreacion,
        modificado: comentario.modificado,
        autor: autorPublico(comentario.usuario),
      });
    }
    return agrupados;
  }
}
