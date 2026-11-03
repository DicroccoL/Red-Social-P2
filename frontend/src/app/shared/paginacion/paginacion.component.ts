import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  template: ` <nav aria-label="Páginas de publicaciones">
    <button
      type="button"
      class="button button-outline"
      [disabled]="cargando || offset === 0"
      (click)="paginaCambiada.emit(offset - limit)"
    >
      Anterior
    </button>
    <span>{{ offset + 1 }}–{{ ultimoResultado }} de {{ total }}</span>
    <button
      type="button"
      class="button button-outline"
      [disabled]="cargando || offset + limit >= total"
      (click)="paginaCambiada.emit(offset + limit)"
    >
      Siguiente
    </button>
  </nav>`,
  styles: [
    `
      nav {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 16px;
        margin: 28px 0;
      }
      span {
        font-size: 13px;
      }
    `,
  ],
})
export class PaginacionComponent {
  @Input() offset = 0;
  @Input() limit = 6;
  @Input() total = 0;
  @Input() cargando = false;
  @Output() paginaCambiada = new EventEmitter<number>();

  get ultimoResultado() {
    return Math.min(this.offset + this.limit, this.total);
  }
}
