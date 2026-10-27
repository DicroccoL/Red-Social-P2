import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  @Prop({ required: true, trim: true, maxlength: 60 })
  nombre: string;

  @Prop({ required: true, trim: true, maxlength: 60 })
  apellido: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  correo: string;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 30 })
  nombreUsuario: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, type: Date })
  fechaNacimiento: Date;

  @Prop({ required: true, trim: true, maxlength: 300 })
  descripcion: string;

  @Prop({ required: true })
  imagenPerfilUrl: string;

  // Opcional para admitir cuentas anteriores con fotos guardadas localmente.
  @Prop()
  imagenPerfilPublicId?: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: string;

  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
