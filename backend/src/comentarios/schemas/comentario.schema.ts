import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

// En este sprint solo se leen. Las rutas de escritura corresponden al sprint 3.
@Schema()
export class Comentario {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Publicacion', required: true })
  publicacion: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: false })
  modificado: boolean;

  @Prop({ default: true })
  activo: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
ComentarioSchema.index({ publicacion: 1, activo: 1, fechaCreacion: -1 });
