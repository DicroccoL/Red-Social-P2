import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdMongoPipe } from '../compartido/id-mongo.pipe';
import { TAMANO_MAXIMO_IMAGEN, validarImagen } from '../imagenes/validacion-imagen';
import { SesionGuard } from '../seguridad/sesion.guard';
import type { SolicitudAutenticada } from '../seguridad/usuario-autenticado';
import { ConsultasPublicacionesService } from './consultas-publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
@UseGuards(SesionGuard)
export class PublicacionesController {
  constructor(
    private readonly publicaciones: PublicacionesService,
    private readonly consultas: ConsultasPublicacionesService,
  ) {}

  @Get()
  listar(@Query() consulta: ListarPublicacionesDto, @Req() solicitud: SolicitudAutenticada) {
    return this.consultas.listar(consulta, solicitud.usuario);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', { limits: { fileSize: TAMANO_MAXIMO_IMAGEN, files: 1 } }),
  )
  crear(
    @Body() datos: CrearPublicacionDto,
    @Req() solicitud: SolicitudAutenticada,
    @UploadedFile(validarImagen(false)) imagen?: Express.Multer.File,
  ) {
    return this.publicaciones.crear(datos, solicitud.usuario, imagen);
  }

  @Delete(':id')
  eliminar(@Param('id', IdMongoPipe) id: string, @Req() solicitud: SolicitudAutenticada) {
    return this.publicaciones.darDeBaja(id, solicitud.usuario);
  }
}
