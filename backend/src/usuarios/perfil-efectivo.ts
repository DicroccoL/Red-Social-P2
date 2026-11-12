export const CORREO_ADMINISTRADOR = "lucasdicrocco@hotmail.com";

export function esCorreoAdministrador(correo: string): boolean {
  return correo.trim().toLowerCase() === CORREO_ADMINISTRADOR;
}

export function perfilEfectivo(correo: string, perfilGuardado?: string): "usuario" | "administrador" {
  // La cuenta original conserva sus permisos aunque su rol guardado sea anterior al panel.
  return esCorreoAdministrador(correo) || perfilGuardado === "administrador"
    ? "administrador"
    : "usuario";
}
