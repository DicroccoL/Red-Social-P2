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
  templateUrl: './confirmar-accion.component.html',
  styleUrl: './confirmar-accion.component.css',
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
