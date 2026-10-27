import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login')
  @HttpCode(200)
  iniciarSesion(@Body() datos: LoginDto) {
    return this.autenticacionService.iniciarSesion(datos);
  }

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      limits: { fileSize: TAMANO_MAXIMO_IMAGEN, files: 1 },
    }),
  )
  registrar(
    @Body() datos: RegistroDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: TAMANO_MAXIMO_IMAGEN }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
            overrideMimeType: true,
            errorMessage: 'La imagen debe ser un archivo JPG, PNG o WebP válido.',
          }),
        ],
      }),
    )
    imagen: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(datos, imagen);
  }
}
