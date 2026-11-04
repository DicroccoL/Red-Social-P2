import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

// Limita cada consulta para que el botón «Cargar más» no descargue todos los comentarios.
export class ListarComentariosDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 5;
}
