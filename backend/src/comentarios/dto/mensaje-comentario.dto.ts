import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// El cliente solo envía el mensaje; el autor y la fecha se asignan en el servidor.
export class MensajeComentarioDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El comentario no puede contener solo espacios.' })
  @MaxLength(2000)
  mensaje: string;
}
