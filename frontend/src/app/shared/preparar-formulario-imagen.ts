import { defer, of } from 'rxjs';

export class ErrorLecturaImagen extends Error {
  constructor() {
    super('No pudimos leer la foto completa. Volvé a seleccionarla e intentá de nuevo.');
  }
}

export function prepararFormularioImagen(formulario: FormData, campo: string, imagen: File | null) {
  if (!imagen) return of(formulario);

  return defer(async () => {
    // La copia en memoria evita que WebKit envíe vacío el archivo de la fototeca.
    const bytes = await imagen.arrayBuffer().catch(() => {
      throw new ErrorLecturaImagen();
    });
    if (!bytes.byteLength || bytes.byteLength !== imagen.size) throw new ErrorLecturaImagen();

    formulario.set(campo, new Blob([bytes], { type: imagen.type }), imagen.name);
    return formulario;
  });
}
