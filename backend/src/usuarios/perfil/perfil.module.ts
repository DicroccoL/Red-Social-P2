import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios.module';
import { ImagenesModule } from '../../imagenes/imagenes.module';
import { SeguridadModule } from '../../seguridad/seguridad.module';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';

// Separa las rutas de perfil del módulo de datos de usuarios, evitando dependencias circulares.
@Module({
  imports: [UsuariosModule, ImagenesModule, SeguridadModule],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
