import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SoloInvitadosDirective } from './directivas/solo-invitados.directive';
import { SoloUsuariosDirective } from './directivas/solo-usuarios.directive';
import { AutenticacionService } from './services/autenticacion.service';
import { AsyncPipe } from '@angular/common';
import { RelojSesionService } from './services/reloj-sesion.service';
import { AvisoSesionComponent } from './shared/aviso-sesion/aviso-sesion.component';

// Contiene la navegación común y el espacio donde el router muestra cada página.
@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SoloInvitadosDirective,
    SoloUsuariosDirective,
    AsyncPipe,
    AvisoSesionComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  constructor(
    protected readonly autenticacion: AutenticacionService,
    protected readonly reloj: RelojSesionService,
  ) {}
}
