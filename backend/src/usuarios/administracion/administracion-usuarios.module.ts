import { Module } from "@nestjs/common";
import { AutenticacionModule } from "../../autenticacion/autenticacion.module";
import { SeguridadModule } from "../../seguridad/seguridad.module";
import { UsuariosController } from "./usuarios.controller";

@Module({
  imports: [SeguridadModule, AutenticacionModule],
  controllers: [UsuariosController],
})
export class AdministracionUsuariosModule {}
