import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { ComentariosService } from './comentarios.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { Publicacion, PublicacionSchema } from '../publicaciones/schemas/publicacion.schema';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { GestionComentariosService } from './gestion-comentarios.service';
import { ComentariosController } from './comentarios.controller';

// Comparte la lectura del perfil y registra las rutas protegidas para gestionar comentarios.
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
    UsuariosModule,
    SeguridadModule,
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService, GestionComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
