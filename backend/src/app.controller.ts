import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Expone la ruta /api/estado para comprobar que la API responde.
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('estado')
  obtenerEstado() {
    return this.appService.obtenerEstado();
  }
}
