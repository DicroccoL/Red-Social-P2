import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

// Las páginas de la aplicación requieren la sesión recuperada al arrancar.
export const sesionGuard: CanActivateFn = () =>
  inject(AutenticacionService).usuarioActual ? true : inject(Router).createUrlTree(['/login']);

export const invitadoGuard: CanActivateFn = () =>
  inject(AutenticacionService).usuarioActual
    ? inject(Router).createUrlTree(['/publicaciones'])
    : true;
