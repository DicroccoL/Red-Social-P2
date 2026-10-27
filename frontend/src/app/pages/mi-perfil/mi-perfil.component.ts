import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterLink, DatePipe],
  templateUrl: './mi-perfil.component.html',
})
export class MiPerfilComponent {
  imagenFallida = false;

  constructor(
    readonly autenticacion: AutenticacionService,
    private readonly router: Router,
  ) {}

  cerrarSesion() {
    this.autenticacion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
