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
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';

@Injectable()
export class AutenticacionService {
  private readonly logger = new Logger(AutenticacionService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
    private readonly imagenesService: ImagenesService,
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

    return {
      mensaje: 'Iniciaste sesión correctamente.',
      usuario: this.obtenerDatosPublicos(usuario),
    };
  }

  async registrar(datos: RegistroDto, imagen: Express.Multer.File) {
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

    try {
      const usuario = await this.usuariosService.crear({
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo.trim().toLowerCase(),
        nombreUsuario: datos.nombreUsuario,
        passwordHash,
        fechaNacimiento,
        descripcion: datos.descripcion,
        imagenPerfilUrl: foto.url,
        imagenPerfilPublicId: foto.publicId,
        perfil: 'usuario',
        activo: true,
      });

      return {
        mensaje: 'Tu cuenta se creó correctamente.',
        usuario: this.obtenerDatosPublicos(usuario),
      };
    } catch (error) {
      await this.imagenesService.eliminar(foto.publicId).catch(() => {
        this.logger.error('No se pudo eliminar la foto de un registro fallido.');
      });

      throw error;
    }
  }

  private obtenerDatosPublicos(usuario: UsuarioDocument) {
    return {
      _id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento,
      descripcion: usuario.descripcion,
      imagenPerfilUrl: usuario.imagenPerfilUrl,
      perfil: usuario.perfil,
      activo: usuario.activo,
    };
  }
}
