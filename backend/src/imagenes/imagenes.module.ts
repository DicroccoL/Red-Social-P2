import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service';

// Exportamos el servicio para que AutenticacionModule pueda inyectarlo.
@Module({
  providers: [ImagenesService],
  exports: [ImagenesService],
})
export class ImagenesModule {}
