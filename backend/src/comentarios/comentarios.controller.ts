import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IdMongoPipe } from '../compartido/id-mongo.pipe';
import { SesionGuard } from '../seguridad/sesion.guard';
import type { SolicitudAutenticada } from '../seguridad/usuario-autenticado';
import { GestionComentariosService } from './gestion-comentarios.service';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { MensajeComentarioDto } from './dto/mensaje-comentario.dto';

// Expone los comentarios dentro de la publicación a la que pertenecen.
@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(SesionGuard)
export class ComentariosController {
  constructor(private readonly comentarios: GestionComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId', IdMongoPipe) id: string,
    @Query() consulta: ListarComentariosDto,
  ) {
    return this.comentarios.listar(id, consulta);
  }

  @Post()
  crear(
    @Param('publicacionId', IdMongoPipe) id: string,
    @Body() datos: MensajeComentarioDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.comentarios.crear(id, datos, solicitud.usuario);
  }

  @Put(':comentarioId')
  editar(
    @Param('publicacionId', IdMongoPipe) publicacionId: string,
    @Param('comentarioId', IdMongoPipe) comentarioId: string,
    @Body() datos: MensajeComentarioDto,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    return this.comentarios.editar(publicacionId, comentarioId, datos, solicitud.usuario);
  }
}
