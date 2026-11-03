import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosModule } from '../comentarios/comentarios.module';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { MeGustaController } from './me-gusta.controller';
import { PublicacionesService } from './publicaciones.service';
import { ConsultasPublicacionesService } from './consultas-publicaciones.service';
import { MeGustaService } from './me-gusta.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    ImagenesModule,
    SeguridadModule,
    ComentariosModule,
  ],
  controllers: [PublicacionesController, MeGustaController],
  providers: [PublicacionesService, ConsultasPublicacionesService, MeGustaService],
})
export class PublicacionesModule {}
