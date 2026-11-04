import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TAMANO_MAXIMO_IMAGEN, validarImagen } from '../../imagenes/validacion-imagen';
import { SesionGuard } from '../../seguridad/sesion.guard';
import type { SolicitudAutenticada } from '../../seguridad/usuario-autenticado';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { PerfilService } from './perfil.service';

// El ID siempre sale de la sesión: la URL no permite editar otras cuentas.
@Controller('usuarios/mi-perfil')
@UseGuards(SesionGuard)
export class PerfilController {
  constructor(private readonly perfil: PerfilService) {}

  @Get()
  obtener(@Req() solicitud: SolicitudAutenticada) {
    return this.perfil.obtener(solicitud.usuario.id);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor('imagenPerfil', { limits: { fileSize: TAMANO_MAXIMO_IMAGEN, files: 1 } }),
  )
  actualizar(
    @Req() solicitud: SolicitudAutenticada,
    @Body() datos: ActualizarPerfilDto,
    @UploadedFile(validarImagen(false)) imagen?: Express.Multer.File,
  ) {
    return this.perfil.actualizar(solicitud.usuario.id, datos, imagen);
  }
}
