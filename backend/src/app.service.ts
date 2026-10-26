import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  obtenerEstado() {
    return { mensaje: 'La API de Red Social está funcionando.' };
  }
}
