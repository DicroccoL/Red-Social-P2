import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { ComentariosService } from './comentarios.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comentario.name, schema: ComentarioSchema }]),
    UsuariosModule,
  ],
  providers: [ComentariosService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
