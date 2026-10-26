import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistroDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El nombre no puede contener solo espacios.' })
  @MaxLength(60)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El apellido no puede contener solo espacios.' })
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

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(64)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])[\s\S]+$/, {
    message: 'La contraseña debe incluir una mayúscula y un número.',
  })
  contrasena: string;

  @IsString()
  @IsNotEmpty()
  repetirContrasena: string;

  @IsDateString({ strict: true }, { message: 'Ingresá una fecha de nacimiento válida.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de nacimiento debe tener el formato AAAA-MM-DD.',
  })
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'La descripción no puede contener solo espacios.' })
  @MaxLength(300)
  descripcion: string;
}
