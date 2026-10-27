import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { AvisoModalComponent } from '../../shared/aviso-modal/aviso-modal.component';
import { mensajeErrorCampo } from '../../shared/validadores-formulario';
import { mensajeErrorApi } from '../../shared/mensaje-error-api';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, AvisoModalComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnDestroy {
  showPassword = false;
  submitted = false;
  enviando = false;
  aviso: string | null = null;
  private solicitud?: Subscription;

  readonly formulario = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
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
  });

  constructor(
    private readonly autenticacion: AutenticacionService,
    private readonly router: Router,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  errorCampo(nombre: string) {
    const control = this.formulario.get(nombre);
    if ((this.submitted || control?.touched) && control?.hasError('pattern'))
      return 'La contraseña debe incluir una mayúscula y un número.';
    return mensajeErrorCampo(control, this.submitted);
  }

  iniciarSesion() {
    if (this.enviando) return;
    this.submitted = true;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    this.enviando = true;
    this.solicitud = this.autenticacion.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: (respuesta) => {
        this.autenticacion.usuarioActual = respuesta.usuario;
        this.formulario.controls.contrasena.reset();
        this.enviando = false;
        this.router.navigate(['/publicaciones']);
        this.cambios.markForCheck();
      },
      error: (error) => {
        this.enviando = false;
        this.aviso = mensajeErrorApi(error);
        this.cambios.markForCheck();
      },
    });
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
  }
}
