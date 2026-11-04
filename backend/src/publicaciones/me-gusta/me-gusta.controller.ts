import { Controller, Delete, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IdMongoPipe } from '../../compartido/id-mongo.pipe';
import { SesionGuard } from '../../seguridad/sesion.guard';
import type { SolicitudAutenticada } from '../../seguridad/usuario-autenticado';
import { MeGustaService } from './me-gusta.service';

// Recibe las acciones de dar y quitar me gusta de la persona autenticada.
@Controller('publicaciones/:id/me-gusta')
@UseGuards(SesionGuard)
export class MeGustaController {
  constructor(private readonly meGusta: MeGustaService) {}

  @Post()
  @HttpCode(200)
  dar(@Param('id', IdMongoPipe) id: string, @Req() solicitud: SolicitudAutenticada) {
    return this.meGusta.dar(id, solicitud.usuario);
  }

  @Delete()
  quitar(@Param('id', IdMongoPipe) id: string, @Req() solicitud: SolicitudAutenticada) {
    return this.meGusta.quitar(id, solicitud.usuario);
  }
}
