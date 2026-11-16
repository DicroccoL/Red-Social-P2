import { Pipe, PipeTransform } from '@angular/core';

// Muestra «Habilitada» si la cuenta está activa y «Deshabilitada» si está inactiva.
@Pipe({ name: 'estadoCuenta' })
export class EstadoCuentaPipe implements PipeTransform {
  transform(activo: boolean): string {
    return activo ? 'Habilitada' : 'Deshabilitada';
  }
}
