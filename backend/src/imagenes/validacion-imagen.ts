import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

// Una sola configuración para fotos de perfil obligatorias e imágenes de post opcionales.
export function validarImagen(obligatoria: boolean) {
  return new ParseFilePipe({
    fileIsRequired: obligatoria,
    validators: [
      new MaxFileSizeValidator({ maxSize: TAMANO_MAXIMO_IMAGEN }),
      new FileTypeValidator({
        fileType: /^image\/(jpeg|png|webp)$/,
        overrideMimeType: true,
        errorMessage: 'La imagen debe ser un archivo JPG, PNG o WebP válido.',
      }),
    ],
  });
}
