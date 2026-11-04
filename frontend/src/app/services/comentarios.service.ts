import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ComentarioPublico } from '../models/publicacion.model';
import { PaginaComentarios } from '../models/comentario.model';

// Consulta, crea y edita comentarios; el backend comprueba el autor con la cookie.
@Injectable({ providedIn: 'root' })
export class ComentariosService {
  constructor(private readonly http: HttpClient) {}
  private ruta(publicacionId: string) {
    return environment.apiUrl + '/publicaciones/' + publicacionId + '/comentarios';
  }
  listar(id: string, offset: number, limit = 5) {
    return this.http.get<PaginaComentarios>(this.ruta(id), {
      withCredentials: true,
      params: new HttpParams().set('offset', offset).set('limit', limit),
    });
  }
  crear(id: string, mensaje: string) {
    return this.http.post<ComentarioPublico>(
      this.ruta(id),
      { mensaje },
      { withCredentials: true },
    );
  }
  editar(id: string, comentarioId: string, mensaje: string) {
    return this.http.put<ComentarioPublico>(
      this.ruta(id) + '/' + comentarioId,
      { mensaje },
      { withCredentials: true },
    );
  }
}
