import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PublicacionPublica } from '../../models/publicacion.model';

@Component({
  selector: 'app-publicacion',
  imports: [DatePipe],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.css',
})
export class PublicacionComponent {
  @Input({ required: true }) publicacion!: PublicacionPublica;
  @Input() procesando = false;
  @Output() cambiarMeGusta = new EventEmitter<PublicacionPublica>();
  @Output() eliminar = new EventEmitter<PublicacionPublica>();
  fotoFallida = false;
}
