import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsuarioPublico } from '../../models/usuario.model';
import { PerfilService } from '../../services/perfil.service';
import { ErroresApiService } from '../../services/errores-api.service';
import { fechaNoFutura, mensajeErrorCampo } from '../validadores-formulario';
import { SelectorFechaComponent } from '../selector-fecha/selector-fecha.component';

// Formulario de datos personales y foto opcional, separado de las publicaciones del perfil.
@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, SelectorFechaComponent],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css',
})
export class EditarPerfilComponent implements OnInit, OnDestroy {
  @Input({ required: true }) usuario!: UsuarioPublico;
  @Output() guardado = new EventEmitter<UsuarioPublico>();
  @Output() cancelado = new EventEmitter<void>();
  enviado = false;
  guardando = false;
  error = '';
  vistaPrevia: string | null = null;
  private solicitud?: Subscription;
  readonly formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)],
    }),
    apellido: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    nombreUsuario: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^\S+$/),
      ],
    }),
    fechaNacimiento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, fechaNoFutura],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(300)],
    }),
    imagen: new FormControl<File | null>(null),
  });
  constructor(
    private readonly perfil: PerfilService,
    private readonly errores: ErroresApiService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.formulario.patchValue({
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      correo: this.usuario.correo,
      nombreUsuario: this.usuario.nombreUsuario,
      fechaNacimiento: this.usuario.fechaNacimiento.slice(0, 10),
      descripcion: this.usuario.descripcion,
    });
  }

  errorCampo(nombre: string) {
    return mensajeErrorCampo(this.formulario.get(nombre), this.enviado);
  }

  seleccionarImagen(evento: Event) {
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
    this.vistaPrevia = null;
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    const control = this.formulario.controls.imagen;
    control.setValue(archivo);
    control.markAsTouched();
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type))
      control.setErrors({ tipoImagen: true });
    else if (archivo.size >= 2 * 1024 * 1024) control.setErrors({ tamanoImagen: true });
    else this.vistaPrevia = URL.createObjectURL(archivo);
  }

  guardar() {
    this.enviado = true;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.guardando) return;
    const { imagen, ...datos } = this.formulario.getRawValue();
    this.guardando = true;
    this.error = '';
    this.solicitud = this.perfil.actualizar(datos, imagen).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        this.guardado.emit(respuesta.usuario);
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
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
  }
}
