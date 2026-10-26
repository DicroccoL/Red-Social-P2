import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  buscarPorCorreo(correo: string) {
    return this.usuarioModel
      .findOne({ correo: correo.trim().toLowerCase() })
      .exec();
  }

  async crear(datos: Usuario) {
    // Esperamos al índice único antes de aceptar el primer registro.
    await this.usuarioModel.init();

    try {
      return await this.usuarioModel.create(datos);
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('Ya existe una cuenta con ese correo.');
      }

      throw error;
    }
  }
}
