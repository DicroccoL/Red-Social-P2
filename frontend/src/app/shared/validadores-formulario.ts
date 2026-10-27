import { AbstractControl, ValidationErrors } from '@angular/forms';

export function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('contrasena')?.value === grupo.get('repetirContrasena')?.value
    ? null
    : { contrasenasDiferentes: true };
}

export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(`${control.value}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Number.isNaN(fecha.getTime()) || fecha > hoy ? { fechaInvalida: true } : null;
}

export function mensajeErrorCampo(control: AbstractControl | null, enviado: boolean): string {
  if (!control || !(control.touched || enviado)) return '';
  if (control.hasError('required')) return 'Completá este campo.';
  if (control.hasError('email')) return 'Ingresá un correo válido.';
  if (control.hasError('minlength')) {
    return `Usá al menos ${control.errors?.['minlength'].requiredLength} caracteres.`;
  }
  if (control.hasError('maxlength')) {
    return `Usá hasta ${control.errors?.['maxlength'].requiredLength} caracteres.`;
  }
  if (control.hasError('pattern')) return 'Revisá el formato de este campo.';
  if (control.hasError('fechaInvalida')) return 'Ingresá una fecha válida que no sea futura.';
  if (control.hasError('tipoImagen')) return 'Seleccioná una imagen JPG, PNG o WebP.';
  if (control.hasError('tamanoImagen')) return 'La imagen debe ocupar menos de 2 MiB.';
  return '';
}
