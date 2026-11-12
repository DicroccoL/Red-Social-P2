import { HttpErrorResponse } from '@angular/common/http';
import { ErrorLecturaImagen } from './preparar-formulario-imagen';

// Convierte la respuesta de error del servidor en un mensaje para mostrar en pantalla.
export function mensajeErrorApi(error: HttpErrorResponse | ErrorLecturaImagen): string {
  if (error instanceof ErrorLecturaImagen) return error.message;
  if (error.status === 0) return 'No pudimos conectar. Volvé a intentarlo en unos momentos.';
  const mensaje = error.error?.message;
  if (
    error.status === 400 &&
    typeof mensaje === 'string' &&
    /unexpected end of (form|multipart data)/i.test(mensaje)
  )
    return 'El formulario llegó incompleto. Si elegiste una foto, volvé a seleccionarla e intentá de nuevo.';
  // Estos mensajes del backend son públicos; los errores internos conservan un texto genérico.
  const mensajesPublicos = [
    'La subida de fotos todavía no está configurada. Intentá más tarde.',
    'No se pudo subir la foto. Intentá nuevamente en unos minutos.',
  ];
  if ([502, 503].includes(error.status) && mensajesPublicos.includes(mensaje)) return mensaje;
  if (error.status === 504)
    return 'El servidor tardó demasiado en responder. Revisá si se guardaron los cambios antes de reintentar.';
  if (error.status >= 500)
    return 'No pudimos completar la solicitud. Intentá nuevamente más tarde.';
  if (error.status === 413) return 'La imagen es demasiado grande. Elegí una de menos de 2 MiB.';
  if (typeof mensaje === 'string') return mensaje;
  if (Array.isArray(mensaje)) {
    return mensaje.filter((parte: unknown) => typeof parte === 'string').join('\n');
  }
  return 'No pudimos completar la solicitud. Revisá los datos e intentá nuevamente.';
}
