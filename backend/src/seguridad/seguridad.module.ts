import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TokensService } from './tokens.service';
import { SesionGuard } from './sesion.guard';
import { CookieSesionService } from './cookie-sesion.service';
import { AdministradorGuard } from './administrador.guard';
import { OrigenGuard } from './origen.guard';

// Comparte los servicios de JWT, cookies y guards con los módulos que necesitan autenticar usuarios.
@Module({
  imports: [JwtModule.register({}), UsuariosModule],
  providers: [TokensService, SesionGuard, CookieSesionService, AdministradorGuard, OrigenGuard],
  // Reexportamos UsuariosModule: el guard también se instancia en los módulos que lo usan.
  exports: [TokensService, SesionGuard, CookieSesionService, AdministradorGuard, OrigenGuard, UsuariosModule],
})
export class SeguridadModule {}
