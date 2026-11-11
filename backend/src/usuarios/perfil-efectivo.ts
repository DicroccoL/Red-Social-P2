export const CORREO_ADMINISTRADOR = "lucasdicrocco@hotmail.com";

export function esCorreoAdministrador(correo: string): boolean {
  return correo.trim().toLowerCase() === CORREO_ADMINISTRADOR;
}

export function perfilEfectivo(correo: string): "usuario" | "administrador" {
  return esCorreoAdministrador(correo) ? "administrador" : "usuario";
}
