import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ORIGENES_PERMITIDOS } from './origenes-permitidos';
import { NOMBRE_COOKIE } from './cookie-sesion.service';

export function comprobarOrigen(solicitud: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(solicitud.method)) return;
  const origen = solicitud.headers.origin;
  // Las cookies se envían automáticamente: comprobar Origin evita acciones desde otros sitios.
  if ((origen && !ORIGENES_PERMITIDOS.includes(origen)) ||
      (!origen && solicitud.cookies?.[NOMBRE_COOKIE])) {
    throw new ForbiddenException('El origen de la solicitud no está permitido.');
  }
}

@Injectable()
export class OrigenGuard implements CanActivate {
  canActivate(contexto: ExecutionContext) {
    comprobarOrigen(contexto.switchToHttp().getRequest<Request>());
    return true;
  }
}
