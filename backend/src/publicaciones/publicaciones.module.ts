import { Comentario, ComentarioSchema } from '../comentarios/schemas/comentario.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { EstadisticasController } from './estadisticas/estadisticas.controller';
import { EstadisticasService } from './estadisticas/estadisticas.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosModule } from '../comentarios/comentarios.module';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { MeGustaController } from './me-gusta/me-gusta.controller';
import { PublicacionesService } from './publicaciones.service';
import { ConsultasPublicacionesService } from './consultas-publicaciones.service';
import { MeGustaService } from './me-gusta/me-gusta.service';

// Conecta el modelo y los servicios de publicaciones y me gusta con seguridad, imágenes y comentarios.
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    ImagenesModule,
    SeguridadModule,
    ComentariosModule,
  ],
  controllers: [PublicacionesController, MeGustaController, EstadisticasController],
  providers: [PublicacionesService, ConsultasPublicacionesService, MeGustaService, EstadisticasService],
})
export class PublicacionesModule {}
