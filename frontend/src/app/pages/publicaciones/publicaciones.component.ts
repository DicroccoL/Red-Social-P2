import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicacionPublica } from '../../models/publicacion.model';
import { AutenticacionService } from '../../services/autenticacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { PublicacionComponent } from '../../shared/publicacion/publicacion.component';
import { FormularioPublicacionComponent } from '../../shared/formulario-publicacion/formulario-publicacion.component';
import { PaginacionComponent } from '../../shared/paginacion/paginacion.component';
import { ConfirmarAccionComponent } from '../../shared/confirmar-accion/confirmar-accion.component';
import { PetPostPreviewComponent } from '../../shared/pet-post-preview/pet-post-preview.component';

@Component({
  selector: 'app-publicaciones',
  imports: [
    PetPostPreviewComponent,
    PublicacionComponent,
    FormularioPublicacionComponent,
    PaginacionComponent,
    ConfirmarAccionComponent,
  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css',
})
export class PublicacionesComponent implements OnInit, OnDestroy {
  publicaciones: PublicacionPublica[] = [];
  orden: 'fecha' | 'meGusta' = 'fecha';
  offset = 0;
  readonly limit = 6;
  total = 0;
  cargando = false;
  mostrarFormulario = false;
  accionPendiente: string | null = null;
  publicacionParaEliminar: PublicacionPublica | null = null;
  error = '';
  private readonly suscripciones = new Subscription();
  private consulta?: Subscription;

  constructor(
    readonly autenticacion: AutenticacionService,
    private readonly servicio: PublicacionesService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.autenticacion.usuarioActual) this.cargar();
  }

  cargar() {
    this.consulta?.unsubscribe();
    this.cargando = true;
    this.error = '';
    this.consulta = this.servicio
      .listar({ orden: this.orden, offset: this.offset, limit: this.limit })
      .subscribe({
        next: (pagina) => {
          if (!pagina.publicaciones.length && this.offset > 0) {
            this.offset = Math.max(0, this.offset - this.limit);
            this.cargar();
            return;
          }
          this.publicaciones = pagina.publicaciones;
          this.total = pagina.total;
          this.cargando = false;
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.cargando = false;
          this.error = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      });
  }

  cambiarOrden(evento: Event) {
    this.orden = (evento.target as HTMLSelectElement).value === 'meGusta' ? 'meGusta' : 'fecha';
    this.cambiarPagina(0);
  }

  cambiarPagina(offset: number) {
    this.offset = Math.max(0, offset);
    this.cargar();
  }
  publicacionCreada() {
    this.mostrarFormulario = false;
    this.cambiarPagina(0);
  }

  cambiarMeGusta(publicacion: PublicacionPublica) {
    if (this.accionPendiente) return;
    this.accionPendiente = publicacion._id;
    this.error = '';
    this.suscripciones.add(
      this.servicio.cambiarMeGusta(publicacion).subscribe({
        next: (actualizada) => {
          this.accionPendiente = null;
          this.publicaciones = this.publicaciones.map((elemento) =>
            elemento._id === actualizada._id ? actualizada : elemento,
          );
          if (this.orden === 'meGusta') this.cargar();
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.accionPendiente = null;
          this.error = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      }),
    );
  }

  confirmarBaja() {
    const publicacion = this.publicacionParaEliminar;
    this.publicacionParaEliminar = null;
    if (!publicacion || this.accionPendiente) return;
    this.accionPendiente = publicacion._id;
    this.suscripciones.add(
      this.servicio.eliminar(publicacion._id).subscribe({
        next: () => {
          this.accionPendiente = null;
          this.cargar();
        },
        error: (error) => {
          this.accionPendiente = null;
          this.error = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      }),
    );
  }

  ngOnDestroy() {
    this.consulta?.unsubscribe();
    this.suscripciones.unsubscribe();
  }
}
