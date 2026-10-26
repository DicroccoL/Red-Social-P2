import { Module } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';

@Module({
  imports: [UsuariosModule],
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    { provide: PasswordHasher, useValue: new PasswordHasher() },
  ],
})
export class AutenticacionModule {}
