import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicacionPublica } from '../../models/publicacion.model';

// Tarjeta reutilizable: recibe la publicación por Input y emite acciones por Output.
@Component({
  selector: 'app-publicacion',
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.css',
})
export class PublicacionComponent {
  @Input({ required: true }) publicacion!: PublicacionPublica;
  @Input() cantidadComentariosDetalle: number | null = null;
  @Input() procesando = false;
  @Input() mostrarEnlace = true;
  @Input() mostrarComentarios = true;
  @Output() cambiarMeGusta = new EventEmitter<PublicacionPublica>();
  @Output() eliminar = new EventEmitter<PublicacionPublica>();
  fotoFallida = false;

  get cantidadComentarios(): number {
    return this.cantidadComentariosDetalle ?? this.publicacion.cantidadComentarios;
  }

  enfocarComentario() {
    document.getElementById('nuevo-comentario')?.focus();
  }
}
