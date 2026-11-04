import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicacionPublica } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { PublicacionComponent } from '../../shared/publicacion/publicacion.component';
import { ComentariosComponent } from '../../shared/comentarios/comentarios.component';
import { ConfirmarAccionComponent } from '../../shared/confirmar-accion/confirmar-accion.component';

// Muestra una publicación completa y delega la conversación al componente de comentarios.
@Component({
  selector: 'app-detalle-publicacion',
  imports: [RouterLink, PublicacionComponent, ComentariosComponent, ConfirmarAccionComponent],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.css',
})
export class DetallePublicacionComponent implements OnInit, OnDestroy {
  publicacion: PublicacionPublica | null = null;
  cargando = true;
  procesando = false;
  confirmarEliminacion = false;
  error = '';
  private consulta?: Subscription;
  private readonly suscripciones = new Subscription();
  constructor(
    private readonly ruta: ActivatedRoute,
    private readonly router: Router,
    private readonly servicio: PublicacionesService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.suscripciones.add(
      this.ruta.paramMap.subscribe((parametros) => {
        this.consulta?.unsubscribe();
        this.publicacion = null;
        this.cargando = true;
        this.error = '';
        this.consulta = this.servicio.obtener(parametros.get('id') ?? '').subscribe({
          next: (publicacion) => {
            this.publicacion = publicacion;
            this.cargando = false;
            this.cambios.markForCheck();
          },
          error: (error) => {
            this.error = this.errores.obtenerMensaje(error);
            this.cargando = false;
            this.cambios.markForCheck();
          },
        });
      }),
    );
  }

  cambiarMeGusta() {
    if (!this.publicacion || this.procesando) return;
    this.procesando = true;
    this.error = '';
    this.suscripciones.add(
      this.servicio.cambiarMeGusta(this.publicacion).subscribe({
        next: (publicacion) => {
          this.publicacion = publicacion;
          this.procesando = false;
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.error = this.errores.obtenerMensaje(error);
          this.procesando = false;
          this.cambios.markForCheck();
        },
      }),
    );
  }

  eliminar() {
    this.confirmarEliminacion = false;
    if (!this.publicacion || this.procesando) return;
    this.procesando = true;
    this.suscripciones.add(
      this.servicio.eliminar(this.publicacion._id).subscribe({
        next: () => this.router.navigate(['/publicaciones']),
        error: (error) => {
          this.error = this.errores.obtenerMensaje(error);
          this.procesando = false;
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
