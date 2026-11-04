import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

// Inicia Angular con el componente raíz y los proveedores de app.config.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
