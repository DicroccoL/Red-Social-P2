import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

// Solicita confirmar una acción y emite la decisión para que el padre realice la acción.
@Component({
  selector: 'app-confirmar-accion',
  template: `<dialog #dialogo (cancel)="cancelar($event)">
    <h2>{{ titulo }}</h2>
    <p>{{ mensaje }}</p>
    <div>
      <button type="button" (click)="cancelar()" autofocus>Cancelar</button>
      <button type="button" (click)="confirmar()">{{ etiquetaConfirmar }}</button>
    </div>
  </dialog>`,
  styles: [
    `
      dialog {
        width: min(92vw, 540px);
        padding: 30px;
        border: 1px solid var(--wine);
        background: var(--pink);
        color: var(--wine);
      }
      dialog::backdrop {
        background: #250010b8;
      }
      h2 {
        font-size: 30px;
      }
      p {
        line-height: 1.7;
      }
      div {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 26px;
      }
      button {
        padding: 12px;
        border: 1px solid var(--wine);
        background: transparent;
        color: var(--wine);
      }
      button:last-child {
        background: var(--wine);
        color: var(--pink);
      }
    `,
  ],
})
export class ConfirmarAccionComponent implements AfterViewInit {
  @Input() etiquetaConfirmar = 'Eliminar publicación';
  @Input() titulo = 'Eliminar publicación';
  @Input() mensaje = 'La publicación dejará de aparecer en el feed. ¿Querés continuar?';
  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;

  ngAfterViewInit() {
    this.dialogo.nativeElement.showModal();
  }
  confirmar() {
    this.dialogo.nativeElement.close();
    this.confirmado.emit();
  }
  cancelar(evento?: Event) {
    evento?.preventDefault();
    this.dialogo.nativeElement.close();
    this.cancelado.emit();
  }
}
