import 'dotenv/config';
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DURACION_SESION_SEGUNDOS } from './configuracion-sesion';

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

  generar(usuarioId: string) {
    return this.jwt.signAsync(
      { sub: usuarioId },
      {
        secret: this.obtenerClave(),
        algorithm: 'HS256',
        expiresIn: DURACION_SESION_SEGUNDOS,
      },
    );
  }

  async verificar(token: string): Promise<{ sub: string }> {
    const clave = this.obtenerClave();
    try {
      return await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: clave,
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('La sesión venció o no es válida. Volvé a ingresar.');
    }
  }
}
