import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImagenesService } from '../imagenes/imagenes.service';
import { UsuarioAutenticado } from '../seguridad/usuario-autenticado';
import { ConsultasPublicacionesService } from './consultas-publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class PublicacionesService {
  private readonly logger = new Logger(PublicacionesService.name);

  constructor(
    @InjectModel(Publicacion.name) private readonly publicaciones: Model<Publicacion>,
    private readonly imagenes: ImagenesService,
    private readonly consultas: ConsultasPublicacionesService,
  ) {}

  async crear(
    datos: CrearPublicacionDto,
    usuario: UsuarioAutenticado,
    imagen?: Express.Multer.File,
  ) {
    const foto = imagen ? await this.imagenes.subirPublicacion(imagen) : null;
    let publicacionId: string;
    try {
      const creada = await this.publicaciones.create({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        usuario: new Types.ObjectId(usuario.id),
        imagenUrl: foto?.url,
        imagenPublicId: foto?.publicId,
      });
      publicacionId = creada._id.toString();
    } catch (error) {
      if (foto)
        await this.imagenes.eliminar(foto.publicId).catch(() => {
          this.logger.error('No se pudo eliminar la imagen de una publicación fallida.');
        });
      throw error;
    }
    return this.consultas.obtener(publicacionId, usuario);
  }

  async darDeBaja(id: string, usuario: UsuarioAutenticado) {
    const publicacion = await this.publicaciones.findOne({ _id: id, activo: true }).exec();
    if (!publicacion) throw new NotFoundException('La publicación ya no está disponible.');
    if (publicacion.usuario.toString() !== usuario.id && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones.');
    }
    const resultado = await this.publicaciones.updateOne(
      { _id: id, activo: true },
      { $set: { activo: false } },
    );
    if (!resultado.modifiedCount) throw new NotFoundException('La publicación ya fue eliminada.');
    // Conservamos el documento y su foto: una baja lógica no destruye los datos.
    return { mensaje: 'La publicación fue eliminada.' };
  }
}
