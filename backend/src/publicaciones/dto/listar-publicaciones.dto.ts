import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Valida filtros y paginación; offset indica cuántos resultados omitir y limit cuántos traer.
export class ListarPublicacionesDto {
  @IsIn(['fecha', 'meGusta'])
  orden: 'fecha' | 'meGusta' = 'fecha';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 6;

  @IsOptional()
  @IsMongoId()
  usuarioId?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  incluirComentarios?: 'true' | 'false';
}
