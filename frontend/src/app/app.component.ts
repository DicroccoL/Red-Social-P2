import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SoloInvitadosDirective } from './directivas/solo-invitados.directive';
import { AutenticacionService } from './services/autenticacion.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SoloInvitadosDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  constructor(protected readonly autenticacion: AutenticacionService) {}
}
