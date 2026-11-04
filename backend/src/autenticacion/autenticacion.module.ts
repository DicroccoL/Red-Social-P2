import { Module } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ImagenesModule } from '../imagenes/imagenes.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';

// Reúne registro y login con los servicios de usuarios, imágenes, JWT y hash de contraseñas.
@Module({
  imports: [UsuariosModule, ImagenesModule, SeguridadModule],
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    { provide: PasswordHasher, useValue: new PasswordHasher() },
  ],
})
export class AutenticacionModule {}
