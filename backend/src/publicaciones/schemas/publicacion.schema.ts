import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema';

@Schema()
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 120 })
  titulo: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  descripcion: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Usuario.name, required: true })
  usuario: Types.ObjectId;

  @Prop()
  imagenUrl?: string;

  @Prop()
  imagenPublicId?: string;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  meGusta: Types.ObjectId[];
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
PublicacionSchema.index({ activo: 1, fechaCreacion: -1 });
PublicacionSchema.index({ usuario: 1, activo: 1, fechaCreacion: -1 });
