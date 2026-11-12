import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConsultaPublicaciones,
  PaginaPublicaciones,
  PublicacionPublica,
} from '../models/publicacion.model';
import { prepararFormularioImagen } from '../shared/preparar-formulario-imagen';

// Centraliza las solicitudes HTTP de publicaciones y me gusta, enviando la cookie de sesión.
@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly ruta = `${environment.apiUrl}/publicaciones`;

  constructor(private readonly http: HttpClient) {}

  private opciones() {
    return { withCredentials: true };
  }

  listar(consulta: ConsultaPublicaciones = {}) {
    const params = new HttpParams({
      fromObject: {
        orden: consulta.orden ?? 'fecha',
        offset: consulta.offset ?? 0,
        limit: consulta.limit ?? 6,
        ...(consulta.usuarioId ? { usuarioId: consulta.usuarioId } : {}),
        ...(consulta.incluirComentarios ? { incluirComentarios: 'true' } : {}),
      },
    });
    return this.http.get<PaginaPublicaciones>(this.ruta, { ...this.opciones(), params });
  }

  crear(titulo: string, descripcion: string, imagen: File | null) {
    const formulario = new FormData();
    formulario.append('titulo', titulo);
    formulario.append('descripcion', descripcion);
    return prepararFormularioImagen(formulario, 'imagen', imagen).pipe(
      switchMap((cuerpo) => this.http.post<PublicacionPublica>(this.ruta, cuerpo, this.opciones())),
    );
  }

  obtener(id: string) {
    return this.http.get<PublicacionPublica>(`${this.ruta}/${id}`, this.opciones());
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.ruta}/${id}`, this.opciones());
  }

  cambiarMeGusta(publicacion: PublicacionPublica) {
    const ruta = `${this.ruta}/${publicacion._id}/me-gusta`;
    return publicacion.meGustaDelUsuario
      ? this.http.delete<PublicacionPublica>(ruta, this.opciones())
      : this.http.post<PublicacionPublica>(ruta, {}, this.opciones());
  }
}
