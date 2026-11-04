import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AutenticacionService } from './autenticacion.service';

// Unifica el cierre local ante un 401 en cualquier solicitud a nuestra API.
export const sesionInterceptor: HttpInterceptorFn = (solicitud, siguiente) => {
  const autenticacion = inject(AutenticacionService);
  const router = inject(Router);
  return siguiente(solicitud).pipe(
    catchError((error) => {
      if (solicitud.url.startsWith('/api/') && error.status === 401) {
        autenticacion.limpiarSesion();
        // Durante el arranque los guards resuelven el destino y permiten abrir el registro.
        if (!autenticacion.cargandoSesion) router.navigate(['/login'], { replaceUrl: true });
      }
      return throwError(() => error);
    }),
  );
};
