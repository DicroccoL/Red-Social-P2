import { Injectable } from '@nestjs/common';

// Devuelve el mensaje de estado que utiliza AppController.
@Injectable()
export class AppService {
  obtenerEstado() {
    return { mensaje: 'La API de Red Social está funcionando.' };
  }
}
