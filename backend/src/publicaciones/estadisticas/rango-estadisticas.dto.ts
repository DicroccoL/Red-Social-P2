import { IsDateString, Matches } from "class-validator";

export class RangoEstadisticasDto {
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  desde: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  hasta: string;
}
