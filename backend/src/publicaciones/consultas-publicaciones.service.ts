import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { ComentariosService } from '../comentarios/comentarios.service';
import { AutorPoblado, CAMPOS_AUTOR } from '../compartido/autor-publico';
import { UsuarioAutenticado } from '../seguridad/usuario-autenticado';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { publicacionPublica } from './respuesta-publicacion';
import { Publicacion } from './schemas/publicacion.schema';

// Obtiene publicaciones activas con orden, paginación y los datos públicos de sus autores.
@Injectable()
export class ConsultasPublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicaciones: Model<Publicacion>,
    private readonly comentarios: ComentariosService,
  ) {}

  async listar(consulta: ListarPublicacionesDto, usuario: UsuarioAutenticado) {
    const filtro: { activo: boolean; usuario?: Types.ObjectId } = { activo: true };
    if (consulta.usuarioId) filtro.usuario = new Types.ObjectId(consulta.usuarioId);
    const orden: Record<string, 1 | -1> =
      consulta.orden === 'meGusta'
        ? { cantidadMeGusta: -1, fechaCreacion: -1, _id: -1 }
        : { fechaCreacion: -1, _id: -1 };

    // Mongo ordena y pagina; no descargamos todos los posts al navegador.
    const etapas: PipelineStage[] = [
      { $match: filtro },
      { $addFields: { cantidadMeGusta: { $size: { $ifNull: ['$meGusta', []] } } } },
      { $sort: orden },
      { $skip: consulta.offset },
      { $limit: consulta.limit },
      { $project: { _id: 1 } },
    ];
    const [identificadores, total] = await Promise.all([
      this.publicaciones.aggregate<{ _id: Types.ObjectId }>(etapas).exec(),
      this.publicaciones.countDocuments(filtro).exec(),
    ]);
    const ids = identificadores.map((resultado) => resultado._id);
    const documentos = await this.publicaciones
      .find({ _id: { $in: ids }, activo: true })
      .populate<{ usuario: AutorPoblado | null }>('usuario', CAMPOS_AUTOR)
      .exec();
    const comentarios =
      consulta.incluirComentarios === 'true'
        ? await this.comentarios.agruparPorPublicacion(ids)
        : null;
    // La segunda consulta no conserva el orden de la agregación: lo reconstruimos con sus IDs.
    const resultados = identificadores.flatMap(({ _id }) => {
      const documento = documentos.find((elemento) => elemento._id.equals(_id));
      if (!documento) return [];
      return [
        {
          ...publicacionPublica(documento, usuario),
          ...(comentarios ? { comentarios: comentarios[_id.toString()] ?? [] } : {}),
        },
      ];
    });
    return {
      publicaciones: resultados,
      total,
      offset: consulta.offset,
      limit: consulta.limit,
      hayMas: consulta.offset + consulta.limit < total,
    };
  }

  async obtener(id: string, usuario: UsuarioAutenticado) {
    const publicacion = await this.publicaciones
      .findOne({ _id: id, activo: true })
      .populate<{ usuario: AutorPoblado | null }>('usuario', CAMPOS_AUTOR)
      .exec();
    if (!publicacion) throw new NotFoundException('La publicación ya no está disponible.');
    return publicacionPublica(publicacion, usuario);
  }
}
