import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// Valida título y descripción; la identidad del autor se obtiene de la sesión.
export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El título no puede contener solo espacios.' })
  @MaxLength(120)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El mensaje no puede contener solo espacios.' })
  @MaxLength(2000)
  descripcion: string;
}
