import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-aviso-modal',
  templateUrl: './aviso-modal.component.html',
  styleUrl: './aviso-modal.component.css',
})
export class AvisoModalComponent implements AfterViewInit {
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() etiquetaBoton = 'Entendido';
  @Output() cerrado = new EventEmitter<void>();
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;

  ngAfterViewInit() {
    this.dialogo.nativeElement.showModal();
  }

  cerrar(evento?: Event) {
    evento?.preventDefault();
    this.dialogo.nativeElement.close();
    this.cerrado.emit();
  }
}
