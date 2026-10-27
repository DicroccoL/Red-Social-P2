import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresá un correo válido.' })
  @MaxLength(254)
  correo: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(64)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])[\s\S]+$/, {
    message: 'La contraseña debe incluir una mayúscula y un número.',
  })
  contrasena: string;
}
