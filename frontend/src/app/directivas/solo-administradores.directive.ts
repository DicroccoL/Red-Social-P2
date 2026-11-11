import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UsuarioPublico } from '../models/usuario.model';

@Directive({ selector: '[appSoloAdministradores]' })
export class SoloAdministradoresDirective {
  private readonly plantilla = inject(TemplateRef);
  private readonly contenedor = inject(ViewContainerRef);

  @Input({ required: true })
  set appSoloAdministradores(usuario: UsuarioPublico | null) {
    if (usuario?.perfil === 'administrador') {
      if (!this.contenedor.length) this.contenedor.createEmbeddedView(this.plantilla);
    } else {
      this.contenedor.clear();
    }
  }
}
