import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import type { SolicitudAutenticada } from '../seguridad/usuario-autenticado';
import { CookieSesionService } from '../seguridad/cookie-sesion.service';
import { SesionGuard } from '../seguridad/sesion.guard';
import { OrigenGuard } from '../seguridad/origen.guard';

const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

@Controller('autenticacion')
@UseGuards(OrigenGuard)
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly cookieSesion: CookieSesionService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async iniciarSesion(@Body() datos: LoginDto, @Res({ passthrough: true }) respuesta: Response) {
    const { token, ...datosPublicos } = await this.autenticacionService.iniciarSesion(datos);
    this.cookieSesion.guardar(respuesta, token);
    return datosPublicos;
  }

  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(SesionGuard)
  recuperarSesion(@Req() solicitud: SolicitudAutenticada) {
    return this.autenticacionService.recuperarSesion(solicitud.usuario.id);
  }

  @Post('salir')
  @HttpCode(200)
  cerrarSesion(@Res({ passthrough: true }) respuesta: Response) {
    this.cookieSesion.eliminar(respuesta);
    return { mensaje: 'Cerraste sesión correctamente.' };
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
