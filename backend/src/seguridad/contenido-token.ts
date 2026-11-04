// Datos firmados del usuario y tiempos del JWT, expresados en segundos.
export interface ContenidoToken {
  sub: string;
  correo: string;
  perfil: string;
  iat: number;
  exp: number;
}
