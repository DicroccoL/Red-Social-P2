import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(componente => componente.LoginComponent),
    title: 'Entrar | floppy',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component')
        .then(componente => componente.RegistroComponent),
    title: 'Registro | floppy',
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones.component')
        .then(componente => componente.PublicacionesComponent),
    title: 'La manada | floppy',
  },
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.component')
        .then(componente => componente.MiPerfilComponent),
    title: 'Mi perfil | floppy',
  },
  { path: '**', redirectTo: 'login' },
];
