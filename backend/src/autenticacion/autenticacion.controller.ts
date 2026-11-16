import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TAMANO_MAXIMO_IMAGEN, validarImagen } from '../imagenes/validacion-imagen';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import type { SolicitudAutenticada } from '../seguridad/usuario-autenticado';
import { CookieSesionService } from '../seguridad/cookie-sesion.service';
import { SesionGuard } from '../seguridad/sesion.guard';
import { OrigenGuard } from '../seguridad/origen.guard';

// Recibe registro, login y sesión; delega las validaciones y maneja la cookie de respuesta.
@Controller('autenticacion')
@UseGuards(OrigenGuard)
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly cookieSesion: CookieSesionService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async iniciarSesion(
    @Body() datos: LoginDto,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
    const { token, ...datosPublicos } = await this.autenticacionService.iniciarSesion(datos);
    this.cookieSesion.guardar(respuesta, token);
    return datosPublicos;
  }

  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(SesionGuard)
  recuperarSesion(@Req() solicitud: SolicitudAutenticada) {
    return this.autenticacionService.recuperarSesion(
      solicitud.usuario.id,
      solicitud.sesion.exp * 1000,
    );
  }

  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(SesionGuard)
  async refrescarSesion(
    @Req() solicitud: SolicitudAutenticada,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
    const { token, ...datosPublicos } = await this.autenticacionService.refrescarSesion(
      solicitud.sesion,
    );
    this.cookieSesion.guardar(respuesta, token);
    return datosPublicos;
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
  async registrar(
    @Body() datos: RegistroDto,
    @Res({ passthrough: true }) respuesta: Response,
    @UploadedFile(validarImagen(true)) imagen: Express.Multer.File,
  ) {
    const { token, ...datosPublicos } = await this.autenticacionService.registrar(
      datos,
      imagen,
    );
    this.cookieSesion.guardar(respuesta, token);
    return datosPublicos;
  }
}
