import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AutorPoblado, autorPublico, CAMPOS_AUTOR } from '../compartido/autor-publico';
import { Publicacion } from '../publicaciones/schemas/publicacion.schema';
import { UsuarioAutenticado } from '../seguridad/usuario-autenticado';
import { Comentario } from './schemas/comentario.schema';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { MensajeComentarioDto } from './dto/mensaje-comentario.dto';

// Gestiona el listado paginado y la escritura sin mezclarlo con la lectura usada por el perfil.
@Injectable()
export class GestionComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarios: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicaciones: Model<Publicacion>,
  ) {}

  private async comprobarPublicacion(id: string) {
    if (!(await this.publicaciones.exists({ _id: id, activo: true }))) {
      throw new NotFoundException('La publicación ya no está disponible.');
    }
  }

  private async obtenerComentario(id: string) {
    const comentario = await this.comentarios
      .findById(id)
      .populate<{ usuario: AutorPoblado | null }>('usuario', CAMPOS_AUTOR)
      .exec();
    if (!comentario) throw new NotFoundException('El comentario no está disponible.');
    return {
      _id: comentario._id.toString(),
      mensaje: comentario.mensaje,
      fechaCreacion: comentario.fechaCreacion,
      modificado: comentario.modificado,
      autor: autorPublico(comentario.usuario),
    };
  }

  async listar(publicacionId: string, consulta: ListarComentariosDto) {
    await this.comprobarPublicacion(publicacionId);
    const filtro = { publicacion: new Types.ObjectId(publicacionId), activo: true };
    const [comentarios, total] = await Promise.all([
      this.comentarios
        .find(filtro)
        .sort({ fechaCreacion: -1, _id: -1 })
        .skip(consulta.offset)
        .limit(consulta.limit)
        .populate<{ usuario: AutorPoblado | null }>('usuario', CAMPOS_AUTOR)
        .exec(),
      this.comentarios.countDocuments(filtro).exec(),
    ]);
    return {
      comentarios: comentarios.map((comentario) => ({
        _id: comentario._id.toString(),
        mensaje: comentario.mensaje,
        fechaCreacion: comentario.fechaCreacion,
        modificado: comentario.modificado,
        autor: autorPublico(comentario.usuario),
      })),
      total,
      offset: consulta.offset,
      limit: consulta.limit,
      hayMas: consulta.offset + consulta.limit < total,
    };
  }

  async crear(
    publicacionId: string,
    datos: MensajeComentarioDto,
    usuario: UsuarioAutenticado,
  ) {
    await this.comprobarPublicacion(publicacionId);
    const comentario = await this.comentarios.create({
      publicacion: new Types.ObjectId(publicacionId),
      usuario: new Types.ObjectId(usuario.id),
      mensaje: datos.mensaje.trim(),
    });
    return this.obtenerComentario(comentario._id.toString());
  }

  async editar(
    publicacionId: string,
    comentarioId: string,
    datos: MensajeComentarioDto,
    usuario: UsuarioAutenticado,
  ) {
    await this.comprobarPublicacion(publicacionId);
    const comentario = await this.comentarios
      .findOne({
        _id: comentarioId,
        publicacion: publicacionId,
        activo: true,
      })
      .exec();
    if (!comentario) throw new NotFoundException('El comentario no está disponible.');
    if (comentario.usuario.toString() !== usuario.id) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios.');
    }
    comentario.mensaje = datos.mensaje.trim();
    comentario.modificado = true;
    await comentario.save();
    return this.obtenerComentario(comentarioId);
  }
}
