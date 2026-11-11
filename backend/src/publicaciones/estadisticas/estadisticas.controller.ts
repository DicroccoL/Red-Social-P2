import { Controller, Get, Header, Query, UseGuards } from "@nestjs/common";
import { AdministradorGuard } from "../../seguridad/administrador.guard";
import { SesionGuard } from "../../seguridad/sesion.guard";
import { EstadisticasService } from "./estadisticas.service";
import { RangoEstadisticasDto } from "./rango-estadisticas.dto";

@Controller("estadisticas")
@UseGuards(SesionGuard, AdministradorGuard)
export class EstadisticasController {
  constructor(private readonly estadisticas: EstadisticasService) {}

  @Get()
  @Header("Cache-Control", "private, no-store")
  obtener(@Query() rango: RangoEstadisticasDto) {
    return this.estadisticas.obtener(rango);
  }
}
