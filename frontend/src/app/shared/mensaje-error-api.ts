import { HttpErrorResponse } from '@angular/common/http';

export function mensajeErrorApi(error: HttpErrorResponse): string {
  if (error.status === 0) return 'No pudimos conectar. Volvé a intentarlo en unos momentos.';
  if (error.status >= 500)
    return 'No pudimos completar la solicitud. Intentá nuevamente más tarde.';
  if (error.status === 413) return 'La imagen es demasiado grande. Elegí una de menos de 2 MiB.';
  const mensaje = error.error?.message;
  if (typeof mensaje === 'string') return mensaje;
  if (Array.isArray(mensaje)) {
    return mensaje.filter((parte: unknown) => typeof parte === 'string').join('\n');
  }
  return 'No pudimos completar la solicitud. Revisá los datos e intentá nuevamente.';
}
