import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { Subscription } from 'rxjs';
import { PublicacionPublica } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { PublicacionComponent } from '../../shared/publicacion/publicacion.component';
import { ConfirmarAccionComponent } from '../../shared/confirmar-accion/confirmar-accion.component';
import { EditarPerfilComponent } from '../../shared/editar-perfil/editar-perfil.component';
import { PerfilService } from '../../services/perfil.service';
import { UsuarioPublico } from '../../models/usuario.model';

// Muestra los datos del usuario y sus últimas publicaciones con comentarios, y permite cerrar sesión.
@Component({
  selector: 'app-mi-perfil',
  imports: [
    RouterLink,
    DatePipe,
    PublicacionComponent,
    ConfirmarAccionComponent,
    EditarPerfilComponent,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent implements OnInit, OnDestroy {
  imagenFallida = false;
  misPublicaciones: PublicacionPublica[] = [];
  cargando = false;
  accionPendiente = false;
  cerrandoSesion = false;
  error = '';
  editando = false;
  cargandoPerfil = false;
  errorPerfil = '';
  mensajePerfil = '';
  publicacionParaEliminar: PublicacionPublica | null = null;
  private readonly suscripciones = new Subscription();

  constructor(
    readonly autenticacion: AutenticacionService,
    private readonly router: Router,
    private readonly publicaciones: PublicacionesService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
    private readonly perfil: PerfilService,
  ) {}

  ngOnInit() {
    this.cargarPerfil();
    this.cargarPublicaciones();
  }

  cargarPerfil() {
    this.cargandoPerfil = true;
    this.errorPerfil = '';
    this.suscripciones.add(
      this.perfil.obtener().subscribe({
        next: (respuesta) => {
          this.autenticacion.actualizarUsuario(respuesta.usuario);
          this.cargandoPerfil = false;
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.errorPerfil = this.errores.obtenerMensaje(error);
          this.cargandoPerfil = false;
          this.cambios.markForCheck();
        },
      }),
    );
  }

  perfilGuardado(usuario: UsuarioPublico) {
    this.autenticacion.actualizarUsuario(usuario);
    this.imagenFallida = false;
    this.editando = false;
    this.mensajePerfil = 'Tu perfil se actualizó correctamente.';
    this.cargarPublicaciones();
  }

  cargarPublicaciones() {
    const usuario = this.autenticacion.usuarioActual;
    if (!usuario) return;
    this.cargando = true;
    this.error = '';
    this.suscripciones.add(
      this.publicaciones
        .listar({ usuarioId: usuario._id, limit: 3, incluirComentarios: true })
        .subscribe({
          next: (pagina) => {
            this.misPublicaciones = pagina.publicaciones;
            this.cargando = false;
            this.cambios.markForCheck();
          },
          error: (error) => {
            this.error = this.errores.obtenerMensaje(error);
            this.cargando = false;
            this.cambios.markForCheck();
          },
        }),
    );
  }

  cambiarMeGusta(publicacion: PublicacionPublica) {
    if (this.accionPendiente) return;
    this.accionPendiente = true;
    this.error = '';
    this.suscripciones.add(
      this.publicaciones.cambiarMeGusta(publicacion).subscribe({
        next: (actualizada) => {
          this.misPublicaciones = this.misPublicaciones.map((elemento) =>
            elemento._id === actualizada._id
              ? { ...actualizada, comentarios: elemento.comentarios }
              : elemento,
          );
          this.accionPendiente = false;
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.error = this.errores.obtenerMensaje(error);
          this.accionPendiente = false;
          this.cambios.markForCheck();
        },
      }),
    );
  }

  confirmarBaja() {
    const publicacion = this.publicacionParaEliminar;
    this.publicacionParaEliminar = null;
    if (!publicacion || this.accionPendiente) return;
    this.accionPendiente = true;
    this.suscripciones.add(
      this.publicaciones.eliminar(publicacion._id).subscribe({
        next: () => {
          this.accionPendiente = false;
          this.cargarPublicaciones();
        },
        error: (error) => {
          this.error = this.errores.obtenerMensaje(error);
          this.accionPendiente = false;
          this.cambios.markForCheck();
        },
      }),
    );
  }

  cerrarSesion() {
    if (this.cerrandoSesion) return;
    this.cerrandoSesion = true;
    this.error = '';
    this.suscripciones.add(
      this.autenticacion.cerrarSesion().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => {
          this.cerrandoSesion = false;
          this.error = 'No se pudo cerrar la sesión. Intentá nuevamente.';
          this.cambios.markForCheck();
        },
      }),
    );
  }

  ngOnDestroy() {
    this.suscripciones.unsubscribe();
  }
}
