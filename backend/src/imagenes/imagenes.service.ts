import 'dotenv/config';
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImagenesService {
  private readonly logger = new Logger(ImagenesService.name);

  private configurar() {
    const cloudName = process.env['CLOUDINARY_CLOUD_NAME'];
    const apiKey = process.env['CLOUDINARY_API_KEY'];
    const apiSecret = process.env['CLOUDINARY_API_SECRET'];

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'La subida de fotos todavía no está configurada. Intentá más tarde.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async subirPerfil(imagen: Express.Multer.File) {
    this.configurar();

    // El archivo ya está en memoria. Base64 lo representa como texto para
    // enviarlo al SDK; no necesitamos crear archivos en el disco de Vercel.
    const contenido = `data:${imagen.mimetype};base64,${imagen.buffer.toString('base64')}`;

    try {
      const resultado = await cloudinary.uploader.upload(contenido, {
        folder: 'floppy/perfiles',
        resource_type: 'image',
        timeout: 30000,
      });

      return {
        url: resultado.secure_url,
        publicId: resultado.public_id,
      };
    } catch {
      this.logger.error('Cloudinary no pudo guardar la foto de perfil.');
      throw new BadGatewayException(
        'No se pudo subir la foto. Intentá nuevamente en unos minutos.',
      );
    }
  }

  async eliminar(publicId: string) {
    this.configurar();
    // public_id identifica la imagen para poder eliminarla en Cloudinary.
    const resultado = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    if (!['ok', 'not found'].includes(resultado.result)) {
      throw new Error('Cloudinary no confirmó la eliminación de la foto.');
    }
  }
}
