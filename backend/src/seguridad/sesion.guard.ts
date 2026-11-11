import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { perfilEfectivo } from '../usuarios/perfil-efectivo';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TokensService } from './tokens.service';
import type { SolicitudAutenticada } from './usuario-autenticado';
import { NOMBRE_COOKIE } from './cookie-sesion.service';
import { comprobarOrigen } from './origen.guard';

// Valida el JWT recibido y agrega a la solicitud la identidad de un usuario activo de MongoDB.
@Injectable()
export class SesionGuard implements CanActivate {
  constructor(
    private readonly tokens: TokensService,
    private readonly usuarios: UsuariosService,
  ) {}

  async canActivate(contexto: ExecutionContext) {
    const solicitud = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    comprobarOrigen(solicitud);
    const partes = solicitud.headers.authorization?.split(' ');
    const cookie = solicitud.cookies?.[NOMBRE_COOKIE];
    const token =
      typeof cookie === 'string' && cookie
        ? cookie
        : partes?.length === 2 && partes[0] === 'Bearer'
          ? partes[1]
          : undefined;
    if (!token) {
      throw new UnauthorizedException('Iniciá sesión para realizar esta acción.');
    }
    const contenido = await this.tokens.verificar(token);
    if (typeof contenido.sub !== 'string' || !Types.ObjectId.isValid(contenido.sub)) {
      throw new UnauthorizedException('La sesión no identifica un usuario válido.');
    }
    const usuario = await this.usuarios.buscarPorId(contenido.sub);
    if (!usuario) throw new UnauthorizedException('El usuario de esta sesión ya no existe.');
    if (!usuario.activo) throw new ForbiddenException('Tu cuenta está deshabilitada.');

    // La cuenta administradora se identifica por el correo actual guardado en MongoDB.
    solicitud.usuario = { id: usuario._id.toString(), perfil: perfilEfectivo(usuario.correo) };
    solicitud.sesion = contenido;
    return true;
  }
}
