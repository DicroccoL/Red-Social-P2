import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AutenticacionService } from "../../autenticacion/autenticacion.service";
import { IdMongoPipe } from "../../compartido/id-mongo.pipe";
import {
  TAMANO_MAXIMO_IMAGEN,
  validarImagen,
} from "../../imagenes/validacion-imagen";
import { AdministradorGuard } from "../../seguridad/administrador.guard";
import { SesionGuard } from "../../seguridad/sesion.guard";
import type { SolicitudAutenticada } from "../../seguridad/usuario-autenticado";
import { esCorreoAdministrador } from "../perfil-efectivo";
import { usuarioPublico } from "../usuario-publico";
import { UsuariosService } from "../usuarios.service";
import { CrearUsuarioDto } from "./crear-usuario.dto";

@Controller("usuarios")
@UseGuards(SesionGuard, AdministradorGuard)
export class UsuariosController {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly autenticacion: AutenticacionService,
  ) {}

  @Get()
  @Header("Cache-Control", "private, no-store")
  async listar() {
    return (await this.usuarios.listar()).map(usuarioPublico);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("imagenPerfil", {
      limits: { fileSize: TAMANO_MAXIMO_IMAGEN, files: 1 },
    }),
  )
  async crear(
    @Body() datos: CrearUsuarioDto,
    @UploadedFile(validarImagen(true)) imagen: Express.Multer.File,
  ) {
    return usuarioPublico(await this.autenticacion.crearCuenta(datos, imagen, datos.perfil));
  }

  @Delete(":id")
  async deshabilitar(
    @Param("id", IdMongoPipe) id: string,
    @Req() solicitud: SolicitudAutenticada,
  ) {
    if (id === solicitud.usuario.id) {
      throw new ForbiddenException("No podés deshabilitar tu propia cuenta.");
    }
    const cuenta = await this.usuarios.buscarPorId(id);
    if (cuenta && esCorreoAdministrador(cuenta.correo)) {
      throw new ForbiddenException("No podés deshabilitar la cuenta administradora original.");
    }
    return usuarioPublico(await this.usuarios.cambiarEstado(id, false));
  }

  @Post(":id/habilitar")
  async habilitar(@Param("id", IdMongoPipe) id: string) {
    return usuarioPublico(await this.usuarios.cambiarEstado(id, true));
  }
}
