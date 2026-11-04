import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AutenticacionService } from './autenticacion.service';
import { mensajeErrorApi } from '../shared/mensaje-error-api';

// Traduce errores de la API y vuelve al login cuando una solicitud protegida recibe 401.
@Injectable({ providedIn: 'root' })
export class ErroresApiService {
  constructor(
    private readonly autenticacion: AutenticacionService,
    private readonly router: Router,
  ) {}

  obtenerMensaje(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.autenticacion.limpiarSesion();
      this.router.navigate(['/login']);
      return 'Tu sesión terminó. Volvé a ingresar.';
    }
    return mensajeErrorApi(error);
  }
}
