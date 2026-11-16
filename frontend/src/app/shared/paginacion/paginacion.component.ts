import { Component, EventEmitter, Input, Output } from '@angular/core';

// Muestra el rango de resultados y emite el offset de la página elegida.
@Component({
  selector: 'app-paginacion',
  templateUrl: './paginacion.component.html',
  styleUrl: './paginacion.component.css',
})
export class PaginacionComponent {
  @Input() offset = 0;
  @Input() limit = 6;
  @Input() total = 0;
  @Input() cargando = false;
  @Output() paginaCambiada = new EventEmitter<number>();

  get rangoResultados(): string {
    const primero = this.offset + 1;
    const ultimo = Math.min(this.offset + this.limit, this.total);
    return primero < ultimo ? `${primero} a ${ultimo}` : String(primero);
  }
}
