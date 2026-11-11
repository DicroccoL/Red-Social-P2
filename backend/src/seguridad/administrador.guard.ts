import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { SolicitudAutenticada } from "./usuario-autenticado";

@Injectable()
export class AdministradorGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const solicitud = contexto
      .switchToHttp()
      .getRequest<SolicitudAutenticada>();
    if (solicitud.usuario?.perfil !== "administrador") {
      throw new ForbiddenException(
        "Esta acción requiere una cuenta administradora.",
      );
    }
    return true;
  }
}
