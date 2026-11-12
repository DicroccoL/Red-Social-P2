import type { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

// En Safari, el service worker puede reenviar un formulario con la foto vacía.
export const formularioInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  if (solicitud.url.startsWith(environment.apiUrl + '/') && solicitud.body instanceof FormData) {
    return siguiente(solicitud.clone({ setHeaders: { 'ngsw-bypass': 'true' } }));
  }
  return siguiente(solicitud);
};
