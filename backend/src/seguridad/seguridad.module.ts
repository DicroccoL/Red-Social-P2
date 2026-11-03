import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TokensService } from './tokens.service';
import { SesionGuard } from './sesion.guard';
import { CookieSesionService } from './cookie-sesion.service';
import { OrigenGuard } from './origen.guard';

@Module({
  imports: [JwtModule.register({}), UsuariosModule],
  providers: [TokensService, SesionGuard, CookieSesionService, OrigenGuard],
  // Reexportamos UsuariosModule: el guard también se instancia en los módulos que lo usan.
  exports: [TokensService, SesionGuard, CookieSesionService, OrigenGuard, UsuariosModule],
})
export class SeguridadModule {}
