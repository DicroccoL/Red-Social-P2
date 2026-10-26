import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AutenticacionService {
  private readonly logger = new Logger(AutenticacionService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

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
    const extension = imagen.mimetype.split('/')[1];
    const nombreArchivo = `${randomUUID()}.${extension}`;
    const carpeta = join(process.cwd(), 'uploads', 'perfiles');
    const rutaArchivo = join(carpeta, nombreArchivo);
    const imagenPerfilUrl = `/uploads/perfiles/${nombreArchivo}`;

    await mkdir(carpeta, { recursive: true });
    await writeFile(rutaArchivo, imagen.buffer, { flag: 'wx' });

    try {
      const usuario = await this.usuariosService.crear({
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo.trim().toLowerCase(),
        nombreUsuario: datos.nombreUsuario,
        passwordHash,
        fechaNacimiento,
        descripcion: datos.descripcion,
        imagenPerfilUrl,
        perfil: 'usuario',
        activo: true,
      });

      return {
        mensaje: 'Tu cuenta se creó correctamente.',
        usuario: {
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
        },
      };
    } catch (error) {
      await unlink(rutaArchivo).catch(() => {
        this.logger.error('No se pudo eliminar la foto de un registro fallido.');
      });

      throw error;
    }
  }
}
