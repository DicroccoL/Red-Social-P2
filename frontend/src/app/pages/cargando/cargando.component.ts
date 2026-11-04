import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

// Después de la comprobación inicial, elige el inicio de la aplicación según la sesión.
@Component({
  selector: 'app-cargando',
  template:
    '<section class="pantalla-carga" role="status"><span class="spinner" aria-hidden="true"></span><p>Comprobando tu sesión…</p></section>',
})
export class CargandoComponent implements OnInit {
  constructor(
    private readonly autenticacion: AutenticacionService,
    private readonly router: Router,
  ) {}
  ngOnInit() {
    this.router.navigate([this.autenticacion.usuarioActual ? '/publicaciones' : '/login'], {
      replaceUrl: true,
    });
  }
}
