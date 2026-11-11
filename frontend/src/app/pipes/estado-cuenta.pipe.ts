import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoCuenta' })
export class EstadoCuentaPipe implements PipeTransform {
  transform(activo: boolean): string {
    return activo ? 'Habilitada' : 'Deshabilitada';
  }
}
