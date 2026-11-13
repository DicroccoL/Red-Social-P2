import { Component, EventEmitter, Input, Output } from '@angular/core';

// Muestra el rango de resultados y emite el offset de la página elegida.
@Component({
  selector: 'app-paginacion',
  template: `
    <nav aria-label="Páginas de publicaciones">
      <p class="resumen" role="status">
        Mostrando
        <strong>{{ rangoResultados }}</strong>
        de <strong>{{ total }}</strong> {{ total === 1 ? 'publicación' : 'publicaciones' }}
      </p>
      <div class="controles">
        <button
          type="button"
          class="button button-outline"
          [disabled]="cargando || offset === 0"
          (click)="paginaCambiada.emit(offset - limit)"
        >
          <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <use href="icons.svg#arrow-left" />
          </svg>
          Anterior
        </button>
        <button
          type="button"
          class="button button-outline"
          [disabled]="cargando || offset + limit >= total"
          (click)="paginaCambiada.emit(offset + limit)"
        >
          Siguiente
          <svg class="ui-icon flecha-siguiente" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <use href="icons.svg#arrow-left" />
          </svg>
        </button>
      </div>
    </nav>
  `,
  styles: [
    `
      nav {
        display: grid;
        justify-items: center;
        gap: 14px;
        max-width: 760px;
        margin: 28px auto 0;
        padding-top: 20px;
        border-top: 1px solid var(--line);
      }
      .resumen {
        margin: 0;
        color: var(--paper);
        font-size: 14px;
        text-align: center;
      }
      .controles {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        width: min(100%, 300px);
      }
      .button {
        justify-content: center;
        gap: 8px;
        padding: 10px;
        border-radius: 8px;
        font-size: 14px;
      }
      .button:disabled {
        background: transparent;
        border-color: var(--line);
        color: var(--muted);
      }
      .ui-icon {
        width: 16px;
        height: 16px;
        flex: none;
      }
      .flecha-siguiente {
        transform: rotate(180deg);
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

  get rangoResultados(): string {
    const primero = this.offset + 1;
    const ultimo = Math.min(this.offset + this.limit, this.total);
    return primero < ultimo ? `${primero} a ${ultimo}` : String(primero);
  }
}
