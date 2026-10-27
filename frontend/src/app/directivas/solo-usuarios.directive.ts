import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UsuarioPublico } from '../models/usuario.model';

@Directive({
  selector: '[appSoloUsuarios]',
})
export class SoloUsuariosDirective {
  private contenidoVisible = false;

  constructor(
    private readonly plantilla: TemplateRef<unknown>,
    private readonly contenedor: ViewContainerRef,
  ) {}

  // Muestra el contenido únicamente cuando recibe un usuario conectado.
  @Input({ required: true })
  set appSoloUsuarios(usuario: UsuarioPublico | null) {
    const debeMostrarContenido = usuario !== null;

    if (debeMostrarContenido && !this.contenidoVisible) {
      this.contenedor.createEmbeddedView(this.plantilla);
      this.contenidoVisible = true;
    } else if (!debeMostrarContenido && this.contenidoVisible) {
      this.contenedor.clear();
      this.contenidoVisible = false;
    }
  }
}
