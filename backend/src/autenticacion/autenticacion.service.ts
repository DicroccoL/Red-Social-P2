import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { ImagenesService } from '../imagenes/imagenes.service';
import { esCorreoAdministrador } from '../usuarios/perfil-efectivo';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { usuarioPublico } from '../usuarios/usuario-publico';
import { TokensService } from '../seguridad/tokens.service';
import { ContenidoToken } from '../seguridad/contenido-token';

// Aplica las reglas de registro y login, y devuelve los datos públicos del usuario.
@Injectable()
export class AutenticacionService {
  private readonly logger = new Logger(AutenticacionService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
    private readonly imagenesService: ImagenesService,
    private readonly tokensService: TokensService,
  ) {}

  async iniciarSesion(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(datos.correo);
    // verify también comprueba un hash de prueba cuando el usuario no existe.
    const contrasenaValida = await this.passwordHasher.verify(
      datos.contrasena,
      usuario?.passwordHash,
    );

    if (!usuario || !contrasenaValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada.');
    }

    return this.crearSesion(usuario, 'Iniciaste sesión correctamente.');
  }

  async registrar(datos: RegistroDto, imagen: Express.Multer.File) {
    this.tokensService.comprobarConfiguracion();
    const usuario = await this.crearCuenta(datos, imagen);
    return this.crearSesion(usuario, 'Tu cuenta se creó correctamente.');
  }

  async crearCuenta(
    datos: RegistroDto,
    imagen: Express.Multer.File,
    perfil: 'usuario' | 'administrador' = 'usuario',
  ) {
    if (esCorreoAdministrador(datos.correo)) {
      throw new ForbiddenException('Este correo está reservado para la cuenta administradora.');
    }
    if (datos.contrasena !== datos.repetirContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const fechaNacimiento = new Date(datos.fechaNacimiento);

    if (fechaNacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(imagen.mimetype)) {
      throw new BadRequestException('La imagen debe ser JPG, PNG o WebP.');
    }

    const existente = await this.usuariosService.buscarPorCorreo(datos.correo);

    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await this.passwordHasher.hash(datos.contrasena);
    const foto = await this.imagenesService.subirPerfil(imagen);
    let usuario: UsuarioDocument;
    try {
      usuario = await this.usuariosService.crear({
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo.trim().toLowerCase(),
        nombreUsuario: datos.nombreUsuario,
        passwordHash,
        fechaNacimiento,
        descripcion: datos.descripcion,
        imagenPerfilUrl: foto.url,
        imagenPerfilPublicId: foto.publicId,
        perfil,
        activo: true,
      });
    } catch (error) {
      // Si falla el guardado del usuario, eliminamos la foto subida para ese intento.
      await this.imagenesService.eliminar(foto.publicId).catch(() => {
        this.logger.error('No se pudo eliminar la foto de un registro fallido.');
      });

      throw error;
    }
    return usuario;
  }

  async recuperarSesion(id: string, vencimiento: number) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) throw new UnauthorizedException('El usuario de esta sesión ya no existe.');
    if (!usuario.activo) throw new ForbiddenException('Tu cuenta está deshabilitada.');
    return { usuario: usuarioPublico(usuario), vencimiento };
  }

  async refrescarSesion(contenido: ContenidoToken) {
    const datos = await this.recuperarSesion(contenido.sub, contenido.exp * 1000);
    const renovacion = await this.tokensService.generar(datos.usuario._id, datos.usuario.correo, datos.usuario.perfil);
    return { ...datos, ...renovacion, mensaje: 'Extendiste tu sesión por 15 minutos.' };
  }

  private async crearSesion(usuario: UsuarioDocument, mensaje: string) {
    const datos = usuarioPublico(usuario);
    const sesion = await this.tokensService.generar(datos._id, datos.correo, datos.perfil);
    return { mensaje, ...sesion, usuario: datos };
  }
}
