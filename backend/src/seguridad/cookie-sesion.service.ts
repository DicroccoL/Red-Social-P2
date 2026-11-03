import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { DURACION_SESION_SEGUNDOS } from './configuracion-sesion';

export const NOMBRE_COOKIE = 'floppy_sesion';

@Injectable()
export class CookieSesionService {
  private opciones(): CookieOptions {
    return {
      httpOnly: true, // JavaScript del navegador no puede leer el JWT.
      secure: !!process.env['VERCEL'] || process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/api',
    };
  }

  guardar(respuesta: Response, token: string) {
    // Cookie y JWT duran lo mismo. maxAge usa milisegundos; expiresIn usa segundos.
    respuesta.cookie(NOMBRE_COOKIE, token, {
      ...this.opciones(), maxAge: DURACION_SESION_SEGUNDOS * 1000,
    });
  }

  eliminar(respuesta: Response) {
    respuesta.clearCookie(NOMBRE_COOKIE, this.opciones());
  }
}
