import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UsuarioPublico } from '../models/usuario.model';

@Directive({
  selector: '[appSoloInvitados]',
})
export class SoloInvitadosDirective {
  private contenidoVisible = false;

  constructor(
    private readonly plantilla: TemplateRef<unknown>,
    private readonly contenedor: ViewContainerRef,
  ) {}

  // Angular ejecuta este setter cuando cambia el usuario recibido desde el HTML.
  @Input({ required: true })
  set appSoloInvitados(usuario: UsuarioPublico | null) {
    const debeMostrarContenido = usuario === null;

    if (debeMostrarContenido && !this.contenidoVisible) {
      this.contenedor.createEmbeddedView(this.plantilla);
      this.contenidoVisible = true;
    } else if (!debeMostrarContenido && this.contenidoVisible) {
      this.contenedor.clear();
      this.contenidoVisible = false;
    }
  }
}
