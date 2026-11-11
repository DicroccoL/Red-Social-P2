import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AutenticacionService } from './services/autenticacion.service';
import { sesionInterceptor } from './services/sesion.interceptor';

// Registra HTTP y rutas; espera la recuperación de sesión antes de mostrar la aplicación.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([sesionInterceptor])),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() }),
    provideAppInitializer(() => inject(AutenticacionService).recuperarSesion()),
  ],
};
