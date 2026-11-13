import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { UsuarioPublico } from '../../models/usuario.model';
import { AdministracionService } from '../../services/administracion.service';
import { AutenticacionService } from '../../services/autenticacion.service';
import { AvisoModalComponent } from '../../shared/aviso-modal/aviso-modal.component';
import {
  contrasenasIguales,
  fechaNoFutura,
  mensajeErrorCampo,
} from '../../shared/validadores-formulario';
import { mensajeErrorApi } from '../../shared/mensaje-error-api';
import { SelectorFechaComponent } from '../../shared/selector-fecha/selector-fecha.component';

// Gestiona el formulario reactivo de registro, la foto de perfil y el resultado de la solicitud.
@Component({
  selector: 'app-registro',
  imports: [RouterLink, ReactiveFormsModule, AvisoModalComponent, SelectorFechaComponent],
  templateUrl: './registro.component.html',
  styles: `
    .registro-administrativo {
      margin: 1rem 0;
    }
    .registro-administrativo .auth-card-wrap {
      padding: 0;
    }
    .perfil-registro {
      margin: 1rem 0;
      padding: 0.7rem;
      border: 1px solid #d7bfc9;
      border-radius: 0.5rem;
    }
    .perfil-registro label {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-right: 1rem;
    }
    .perfil-registro input[type='radio'] {
      width: 1rem;
      height: 1rem;
      flex: none;
      margin: 0;
      padding: 0;
    }
    .perfil-registro input[type='radio']:focus {
      outline: none;
      background: transparent;
    }
    .perfil-registro input[type='radio']:focus-visible {
      outline: 2px dashed var(--wine);
      outline-offset: 3px;
    }
  `,
})
export class RegistroComponent implements OnDestroy {
  @Input() desdeAdministracion = false;
  @Output() cuentaCreada = new EventEmitter<UsuarioPublico>();
  readonly perfil = new FormControl<UsuarioPublico['perfil']>('usuario', { nonNullable: true });

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
        validators: [Validators.required, fechaNoFutura],
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
    private readonly administracion: AdministracionService,
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
    const solicitud = this.desdeAdministracion
      ? this.administracion
          .crearUsuario(datos, imagen, this.perfil.value)
          .pipe(map((usuario) => ({ usuario, mensaje: 'Creaste la cuenta.' })))
      : this.autenticacion.registrar(datos, imagen).pipe(
          map((respuesta) => {
            this.autenticacion.guardarSesion(respuesta);
            return respuesta;
          }),
        );
    this.solicitud = solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        if (this.desdeAdministracion) {
          this.cuentaCreada.emit(respuesta.usuario);
          return;
        }
        this.formulario.controls.contrasena.reset();
        this.formulario.controls.repetirContrasena.reset();
        this.aviso = { titulo: 'Tu cuenta está lista', mensaje: respuesta.mensaje, exito: true };
        this.cambios.markForCheck();
      },
      error: (error) => {
        this.enviando = false;
        this.aviso = {
          titulo: this.desdeAdministracion
            ? 'No pudimos crear la cuenta'
            : 'No pudimos crear tu cuenta',
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
    if (exito) this.router.navigate(['/publicaciones']);
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
  }
}
