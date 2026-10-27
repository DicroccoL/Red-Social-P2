import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DatosRegistro, RespuestaAutenticacion, UsuarioPublico } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  // Los datos viven en memoria. La sesión con JWT se implementará en su sprint.
  usuarioActual: UsuarioPublico | null = null;

  constructor(private readonly http: HttpClient) {}

  registrar(datos: DatosRegistro, imagen: File) {
    const formulario = new FormData();
    for (const [campo, valor] of Object.entries(datos)) {
      formulario.append(campo, valor);
    }
    formulario.append('imagenPerfil', imagen);

    // El navegador agrega Content-Type y el boundary de FormData.
    return this.http.post<RespuestaAutenticacion>(
      `${environment.apiUrl}/autenticacion/registro`,
      formulario,
    );
  }

  iniciarSesion(datos: { correo: string; contrasena: string }) {
    return this.http.post<RespuestaAutenticacion>(
      `${environment.apiUrl}/autenticacion/login`,
      datos,
    );
  }

  cerrarSesion() {
    this.usuarioActual = null;
  }

  urlImagen(ruta: string) {
    if (/^https?:\/\//i.test(ruta)) return ruta;
    const servidor = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${servidor}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  }
}
