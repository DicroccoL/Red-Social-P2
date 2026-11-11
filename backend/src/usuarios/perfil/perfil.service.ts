import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ImagenesService } from '../../imagenes/imagenes.service';
import { esCorreoAdministrador } from '../perfil-efectivo';
import { UsuariosService } from '../usuarios.service';
import { usuarioPublico } from '../usuario-publico';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

// Actualiza el perfil propio y coordina el reemplazo seguro de su foto en Cloudinary.
@Injectable()
export class PerfilService {
  private readonly logger = new Logger(PerfilService.name);
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly imagenes: ImagenesService,
  ) {}

  private async buscarUsuario(id: string) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new NotFoundException('La cuenta no está disponible.');
    return usuario;
  }

  async obtener(id: string) {
    return { usuario: usuarioPublico(await this.buscarUsuario(id)) };
  }

  async actualizar(id: string, datos: ActualizarPerfilDto, imagen?: Express.Multer.File) {
    if (new Date(datos.fechaNacimiento) > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
    }
    const anterior = await this.buscarUsuario(id);
    if (esCorreoAdministrador(anterior.correo) !== esCorreoAdministrador(datos.correo)) {
      throw new ForbiddenException('El correo de la cuenta administradora está reservado.');
    }
    const foto = imagen ? await this.imagenes.subirPerfil(imagen) : undefined;
    let actualizado;
    try {
      actualizado = await this.usuarios.actualizarPerfil(id, datos, foto);
      if (!actualizado) throw new NotFoundException('La cuenta no está disponible.');
    } catch (error) {
      // Si Mongo rechaza los cambios, la foto anterior sigue vigente y se elimina la nueva.
      if (foto)
        await this.imagenes
          .eliminar(foto.publicId)
          .catch(() =>
            this.logger.error('No se pudo eliminar la foto de una actualización fallida.'),
          );
      throw error;
    }
    if (
      foto &&
      anterior.imagenPerfilPublicId &&
      anterior.imagenPerfilPublicId !== foto.publicId
    ) {
      await this.imagenes
        .eliminar(anterior.imagenPerfilPublicId)
        .catch(() =>
          this.logger.error('El perfil se guardó, pero no se pudo eliminar su foto anterior.'),
        );
    }
    return {
      mensaje: 'Tu perfil se actualizó correctamente.',
      usuario: usuarioPublico(actualizado),
    };
  }
}
