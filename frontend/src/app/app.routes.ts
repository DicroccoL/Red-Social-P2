import { Routes } from '@angular/router';
import { administradorGuard, invitadoGuard, sesionGuard } from './guards/sesion.guard';

// Define las páginas y las carga con lazy loading cuando se navega a su ruta.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/cargando/cargando.component').then(
        (componente) => componente.CargandoComponent,
      ),
  },
  { path: 'cargando', redirectTo: '', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((componente) => componente.LoginComponent),
    title: 'Entrar | floppy',
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () =>
      import('./pages/registro/registro.component').then(
        (componente) => componente.RegistroComponent,
      ),
    title: 'Registro | floppy',
  },
  {
    path: 'publicaciones',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones.component').then(
        (componente) => componente.PublicacionesComponent,
      ),
    title: 'La manada | floppy',
  },
  {
    path: 'mi-perfil',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.component').then(
        (componente) => componente.MiPerfilComponent,
      ),
    title: 'Mi perfil | floppy',
  },
  {
    path: 'publicaciones/:id',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./pages/publicacion/publicacion.component').then(
        (componente) => componente.DetallePublicacionComponent,
      ),
    title: 'Publicación | floppy',
  },
  {
    path: 'dashboard',
    canActivateChild: [administradorGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/dashboard/usuarios.component').then(
            (componente) => componente.DashboardUsuariosComponent,
          ),
        title: 'Usuarios | floppy',
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./pages/dashboard/estadisticas.component').then(
            (componente) => componente.DashboardEstadisticasComponent,
          ),
        title: 'Estadísticas | floppy',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
