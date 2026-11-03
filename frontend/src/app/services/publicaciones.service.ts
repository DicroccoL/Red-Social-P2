import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  ConsultaPublicaciones,
  PaginaPublicaciones,
  PublicacionPublica,
} from '../models/publicacion.model';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly ruta = `${environment.apiUrl}/publicaciones`;

  constructor(
    private readonly http: HttpClient,
  ) {}

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
    if (imagen) formulario.append('imagen', imagen);
    return this.http.post<PublicacionPublica>(this.ruta, formulario, this.opciones());
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
