import 'dotenv/config';
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DURACION_SESION_SEGUNDOS } from './configuracion-sesion';
import { ContenidoToken } from './contenido-token';

// Genera JWT con vencimiento y comprueba su firma usando JWT_SECRET del backend.
@Injectable()
export class TokensService {
  constructor(private readonly jwt: JwtService) {}

  private obtenerClave() {
    const clave = process.env['JWT_SECRET'];
    if (!clave || clave.length < 32) {
      throw new ServiceUnavailableException(
        'Configurá JWT_SECRET en el backend (al menos 32 caracteres).',
      );
    }
    return clave;
  }

  comprobarConfiguracion() {
    this.obtenerClave();
  }

  async generar(usuarioId: string, correo: string, perfil: string) {
    const ahora = Math.floor(Date.now() / 1000);
    const token = await this.jwt.signAsync(
      { sub: usuarioId, correo, perfil, iat: ahora },
      {
        secret: this.obtenerClave(),
        algorithm: 'HS256',
        expiresIn: DURACION_SESION_SEGUNDOS,
      },
    );
    return { token, vencimiento: (ahora + DURACION_SESION_SEGUNDOS) * 1000 };
  }

  renovar(contenido: ContenidoToken) {
    // Conserva identidad y rol; actualiza los tiempos de emisión y vencimiento.
    return this.generar(contenido.sub, contenido.correo, contenido.perfil);
  }

  async verificar(token: string): Promise<ContenidoToken> {
    const clave = this.obtenerClave();
    try {
      const contenido = await this.jwt.verifyAsync<ContenidoToken>(token, {
        secret: clave,
        algorithms: ['HS256'],
      });
      if (
        typeof contenido.sub !== 'string' ||
        typeof contenido.correo !== 'string' ||
        !['usuario', 'administrador'].includes(contenido.perfil) ||
        typeof contenido.exp !== 'number' ||
        typeof contenido.iat !== 'number'
      ) {
        throw new Error('El token no tiene los datos de sesión esperados.');
      }
      return contenido;
    } catch {
      throw new UnauthorizedException('La sesión venció o no es válida. Volvé a ingresar.');
    }
  }
}
