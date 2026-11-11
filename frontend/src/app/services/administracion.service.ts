import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { DatosRegistro, UsuarioPublico } from '../models/usuario.model';

export interface ConteoEstadistica {
  _id: string;
  nombre?: string;
  cantidad: number;
}

export interface Estadisticas {
  publicacionesPorUsuario: ConteoEstadistica[];
  comentariosPorDia: ConteoEstadistica[];
  comentariosPorPublicacion: ConteoEstadistica[];
}

@Injectable({ providedIn: 'root' })
export class AdministracionService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  private readonly credenciales = { withCredentials: true };

  listarUsuarios() {
    return this.http.get<UsuarioPublico[]>(this.url + '/usuarios', this.credenciales);
  }

  crearUsuario(datos: DatosRegistro, imagen: File, perfil: UsuarioPublico['perfil']) {
    const formulario = new FormData();
    for (const [campo, valor] of Object.entries(datos)) formulario.append(campo, valor);
    formulario.append('imagenPerfil', imagen);
    formulario.append('perfil', perfil);
    return this.http.post<UsuarioPublico>(this.url + '/usuarios', formulario, this.credenciales);
  }

  cambiarEstado(id: string, habilitar: boolean) {
    const ruta = this.url + '/usuarios/' + id;
    return habilitar
      ? this.http.post<UsuarioPublico>(ruta + '/habilitar', {}, this.credenciales)
      : this.http.delete<UsuarioPublico>(ruta, this.credenciales);
  }

  estadisticas(desde: string, hasta: string) {
    return this.http.get<Estadisticas>(this.url + '/estadisticas', {
      ...this.credenciales,
      params: { desde, hasta },
    });
  }
}
