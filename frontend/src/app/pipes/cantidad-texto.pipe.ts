import { Pipe, PipeTransform } from '@angular/core';

// Formatea la cantidad con el formato argentino y elige singular o plural.
@Pipe({ name: 'cantidadTexto' })
export class CantidadTextoPipe implements PipeTransform {
  private readonly numero = new Intl.NumberFormat('es-AR');

  transform(cantidad: number, singular: string, plural: string): string {
    return this.numero.format(cantidad) + ' ' + (cantidad === 1 ? singular : plural);
  }
}
