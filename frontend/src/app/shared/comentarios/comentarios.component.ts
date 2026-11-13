import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ComentarioPublico } from '../../models/publicacion.model';
import { ComentariosService } from '../../services/comentarios.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { ComentarioComponent } from '../comentario/comentario.component';

// Mantiene los comentarios ya visibles y agrega otra página cuando se pide «Cargar más».
@Component({
  selector: 'app-comentarios',
  imports: [ReactiveFormsModule, ComentarioComponent],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.css',
})
export class ComentariosComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) publicacionId!: string;
  @Input({ required: true }) totalInicial!: number;
  comentarios: ComentarioPublico[] = [];
  hayMas = false;
  cargando = false;
  enviando = false;
  errorLectura = '';
  errorEnvio = '';
  private totalConsultado: number | null = null;
  private offset = 0;
  private consulta?: Subscription;
  private envio?: Subscription;
  readonly formulario = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)],
    }),
  });
  constructor(
    private readonly servicio: ComentariosService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
    route: ActivatedRoute,
    elemento: ElementRef<HTMLElement>,
  ) {
    afterNextRender(() => {
      if (route.snapshot.fragment === 'nuevo-comentario') {
        elemento.nativeElement.querySelector<HTMLTextAreaElement>('#nuevo-comentario')?.focus();
      }
    });
  }

  get total(): number {
    return this.totalConsultado ?? this.totalInicial;
  }

  ngOnChanges(cambios: SimpleChanges) {
    if (!cambios['publicacionId']) return;
    this.consulta?.unsubscribe();
    this.envio?.unsubscribe();
    this.comentarios = [];
    this.offset = 0;
    this.totalConsultado = null;
    this.cargando = false;
    this.enviando = false;
    this.formulario.reset();
    this.cargar();
  }

  cargar() {
    if (this.cargando || this.enviando) return;
    this.cargando = true;
    this.errorLectura = '';
    this.consulta = this.servicio.listar(this.publicacionId, this.offset).subscribe({
      next: (pagina) => {
        const existentes = new Set(this.comentarios.map((comentario) => comentario._id));
        this.comentarios = [
          ...this.comentarios,
          ...pagina.comentarios.filter((comentario) => !existentes.has(comentario._id)),
        ];
        this.offset += pagina.comentarios.length;
        this.totalConsultado = pagina.total;
        this.hayMas = pagina.hayMas;
        this.cargando = false;
        this.cambios.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.errorLectura = this.errores.obtenerMensaje(error);
        this.cambios.markForCheck();
      },
    });
  }

  comentar() {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.enviando || this.cargando) return;
    this.enviando = true;
    this.errorEnvio = '';
    this.envio = this.servicio
      .crear(this.publicacionId, this.formulario.controls.mensaje.value)
      .subscribe({
        next: (comentario) => {
          this.comentarios = [comentario, ...this.comentarios];
          this.totalConsultado = this.total + 1;
          this.offset++;
          this.formulario.reset();
          this.enviando = false;
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.enviando = false;
          this.errorEnvio = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      });
  }

  actualizar(comentario: ComentarioPublico) {
    this.comentarios = this.comentarios.map((actual) =>
      actual._id === comentario._id ? comentario : actual,
    );
  }

  ngOnDestroy() {
    this.consulta?.unsubscribe();
    this.envio?.unsubscribe();
  }
}
