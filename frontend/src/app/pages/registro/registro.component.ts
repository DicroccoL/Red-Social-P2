import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { AvisoModalComponent } from '../../shared/aviso-modal/aviso-modal.component';
import {
  contrasenasIguales,
  fechaNoFutura,
  mensajeErrorCampo,
} from '../../shared/validadores-formulario';
import { mensajeErrorApi } from '../../shared/mensaje-error-api';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, ReactiveFormsModule, AvisoModalComponent],
  templateUrl: './registro.component.html',
})
export class RegistroComponent implements OnDestroy {
  showPassword = false;
  submitted = false;
  enviando = false;
  vistaPrevia: string | null = null;
  aviso: { titulo: string; mensaje: string; exito: boolean } | null = null;
  private solicitud?: Subscription;

  readonly formulario = new FormGroup(
    {
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
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])[\s\S]+$/),
        ],
      }),
      repetirContrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      fechaNacimiento: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/), fechaNoFutura],
      }),
      descripcion: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(300)],
      }),
      imagenPerfil: new FormControl<File | null>(null, Validators.required),
    },
    { validators: contrasenasIguales },
  );

  constructor(
    private readonly autenticacion: AutenticacionService,
    private readonly router: Router,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  errorCampo(nombre: string) {
    const control = this.formulario.get(nombre);
    const mostrar = this.submitted || !!control?.touched;
    if (mostrar && control?.hasError('pattern') && nombre === 'contrasena')
      return 'Incluí al menos una mayúscula y un número.';
    if (mostrar && control?.hasError('pattern') && nombre === 'nombreUsuario')
      return 'El nombre de usuario no puede contener espacios.';
    const mensaje = mensajeErrorCampo(control, this.submitted);
    if (mensaje) return mensaje;
    if (
      nombre === 'repetirContrasena' &&
      mostrar &&
      this.formulario.hasError('contrasenasDiferentes')
    )
      return 'Las contraseñas no coinciden.';
    return '';
  }

  seleccionarImagen(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0] ?? null;
    const control = this.formulario.controls.imagenPerfil;
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
    this.vistaPrevia = null;
    control.setValue(archivo);
    control.markAsTouched();
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      control.setErrors({ tipoImagen: true });
      return;
    }
    if (archivo.size >= 2 * 1024 * 1024) {
      control.setErrors({ tamanoImagen: true });
      return;
    }
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  registrar() {
    if (this.enviando) return;
    this.submitted = true;
    this.formulario.markAllAsTouched();
    const imagen = this.formulario.controls.imagenPerfil.value;
    if (this.formulario.invalid || !imagen) return;
    const { imagenPerfil, ...datos } = this.formulario.getRawValue();
    this.enviando = true;
    this.solicitud = this.autenticacion.registrar(datos, imagen).subscribe({
      next: (respuesta) => {
        this.enviando = false;
        this.formulario.controls.contrasena.reset();
        this.formulario.controls.repetirContrasena.reset();
        this.aviso = { titulo: 'Tu cuenta está lista', mensaje: respuesta.mensaje, exito: true };
        this.cambios.markForCheck();
      },
      error: (error) => {
        this.enviando = false;
        this.aviso = {
          titulo: 'No pudimos crear tu cuenta',
          mensaje: mensajeErrorApi(error),
          exito: false,
        };
        this.cambios.markForCheck();
      },
    });
  }

  cerrarAviso() {
    const exito = this.aviso?.exito;
    this.aviso = null;
    if (exito) this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
  }
}
