import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PublicacionPublica } from '../../models/publicacion.model';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { mensajeErrorCampo } from '../validadores-formulario';

@Component({
  selector: 'app-formulario-publicacion',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-publicacion.component.html',
  styleUrl: './formulario-publicacion.component.css',
})
export class FormularioPublicacionComponent implements OnDestroy {
  @Output() publicada = new EventEmitter<PublicacionPublica>();
  @Output() cancelado = new EventEmitter<void>();
  enviado = false;
  enviando = false;
  error = '';
  errorImagen = '';
  vistaPrevia: string | null = null;
  private solicitud?: Subscription;

  readonly formulario = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)],
    }),
    imagen: new FormControl<File | null>(null),
  });

  constructor(
    private readonly publicaciones: PublicacionesService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  errorCampo(nombre: string) {
    return mensajeErrorCampo(this.formulario.get(nombre), this.enviado);
  }

  seleccionarImagen(evento: Event) {
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
    this.vistaPrevia = null;
    this.errorImagen = '';
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.formulario.controls.imagen.setValue(archivo);
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.errorImagen = 'Elegí una imagen JPG, PNG o WebP.';
    } else if (archivo.size >= 2 * 1024 * 1024) {
      this.errorImagen = 'La imagen debe ocupar menos de 2 MiB.';
    }
    if (this.errorImagen) {
      this.formulario.controls.imagen.setErrors({ archivoInvalido: true });
    } else this.vistaPrevia = URL.createObjectURL(archivo);
  }

  publicar() {
    if (this.enviando) return;
    this.enviado = true;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const datos = this.formulario.getRawValue();
    this.enviando = true;
    this.error = '';
    this.solicitud = this.publicaciones
      .crear(datos.titulo, datos.descripcion, datos.imagen)
      .subscribe({
        next: (publicacion) => {
          this.enviando = false;
          this.publicada.emit(publicacion);
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.enviando = false;
          this.error = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      });
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
  }
}
