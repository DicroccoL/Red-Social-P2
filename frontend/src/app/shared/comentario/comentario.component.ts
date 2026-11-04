import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ComentarioPublico } from '../../models/publicacion.model';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ComentariosService } from '../../services/comentarios.service';
import { ErroresApiService } from '../../services/errores-api.service';

// Muestra un comentario y permite a su autor editarlo mediante un formulario reactivo.
@Component({
  selector: 'app-comentario',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './comentario.component.html',
  styleUrl: './comentario.component.css',
})
export class ComentarioComponent implements OnDestroy {
  @Input({ required: true }) comentario!: ComentarioPublico;
  @Input({ required: true }) publicacionId!: string;
  @Output() actualizado = new EventEmitter<ComentarioPublico>();
  editando = false;
  guardando = false;
  error = '';
  readonly formulario = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)],
    }),
  });
  private solicitud?: Subscription;
  constructor(
    readonly autenticacion: AutenticacionService,
    private readonly comentarios: ComentariosService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  editar() {
    this.formulario.controls.mensaje.setValue(this.comentario.mensaje);
    this.formulario.markAsUntouched();
    this.error = '';
    this.editando = true;
  }

  guardar() {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.guardando) return;
    this.guardando = true;
    this.solicitud = this.comentarios
      .editar(this.publicacionId, this.comentario._id, this.formulario.controls.mensaje.value)
      .subscribe({
        next: (comentario) => {
          this.guardando = false;
          this.editando = false;
          this.actualizado.emit(comentario);
          this.cambios.markForCheck();
        },
        error: (error) => {
          this.guardando = false;
          this.error = this.errores.obtenerMensaje(error);
          this.cambios.markForCheck();
        },
      });
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
  }
}
