import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Campos editables por el dueño de la cuenta; no admite ID, rol, estado ni contraseña.
export class ActualizarPerfilDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(60)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(60)
  apellido: string;

  @IsEmail({}, { message: 'Ingresá un correo válido.' })
  @MaxLength(254)
  correo: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^\S+$/, { message: 'El nombre de usuario no puede contener espacios.' })
  nombreUsuario: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(300)
  descripcion: string;
}
