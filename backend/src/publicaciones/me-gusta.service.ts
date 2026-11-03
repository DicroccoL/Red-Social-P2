import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioAutenticado } from '../seguridad/usuario-autenticado';
import { ConsultasPublicacionesService } from './consultas-publicaciones.service';
import { Publicacion } from './schemas/publicacion.schema';

@Injectable()
export class MeGustaService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicaciones: Model<Publicacion>,
    private readonly consultas: ConsultasPublicacionesService,
  ) {}

  async dar(id: string, usuario: UsuarioAutenticado) {
    // addToSet evita duplicados incluso con dos solicitudes simultáneas.
    const resultado = await this.publicaciones.updateOne(
      { _id: id, activo: true },
      {
        $addToSet: { meGusta: new Types.ObjectId(usuario.id) },
      },
    );
    if (!resultado.matchedCount)
      throw new NotFoundException('La publicación ya no está disponible.');
    return this.consultas.obtener(id, usuario);
  }

  async quitar(id: string, usuario: UsuarioAutenticado) {
    const resultado = await this.publicaciones.updateOne(
      { _id: id, activo: true, meGusta: usuario.id },
      {
        $pull: { meGusta: new Types.ObjectId(usuario.id) },
      },
    );
    if (!resultado.matchedCount) {
      const existe = await this.publicaciones.exists({ _id: id, activo: true });
      if (!existe) throw new NotFoundException('La publicación ya no está disponible.');
      throw new ConflictException('No habías indicado me gusta en esta publicación.');
    }
    return this.consultas.obtener(id, usuario);
  }
}
