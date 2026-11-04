import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service';

// Comparte el servicio de Cloudinary con autenticación y publicaciones.
@Module({
  providers: [ImagenesService],
  exports: [ImagenesService],
})
export class ImagenesModule {}
