import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { BaseDatosModule } from './base-datos/base-datos.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';

// El módulo principal reúne los módulos de la aplicación.
@Module({
  imports: [
    // La configuración de MongoDB está separada en este módulo.
    BaseDatosModule,
    AutenticacionModule,
    UsuariosModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
