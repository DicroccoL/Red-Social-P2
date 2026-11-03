import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatosRegistro, RespuestaAutenticacion, UsuarioPublico } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {

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
      { withCredentials: true },
    );
  }

  iniciarSesion(datos: { correo: string; contrasena: string }) {
    return this.http.post<RespuestaAutenticacion>(
      `${environment.apiUrl}/autenticacion/login`,
      datos,
      { withCredentials: true },
    );
  }

  cerrarSesion() {
    return this.http.post(`${environment.apiUrl}/autenticacion/salir`, {}, { withCredentials: true })
      .pipe(tap(() => this.limpiarSesion()));
  }

  limpiarSesion() {
    this.usuarioActual = null;
  }

  guardarSesion(respuesta: RespuestaAutenticacion) {
    this.usuarioActual = respuesta.usuario;
  }

  async recuperarSesion(): Promise<void> {
    // Angular espera esta consulta antes de mostrar las vistas y evaluar las directivas.
    // El navegador envía la cookie; nuestro JavaScript nunca necesita leer el JWT.
    try {
      const respuesta = await firstValueFrom(
        this.http.post<{ usuario: UsuarioPublico }>(
          `${environment.apiUrl}/autenticacion/autorizar`, {}, { withCredentials: true },
        ).pipe(timeout(15000)),
      );
      this.usuarioActual = respuesta.usuario;
    } catch {
      this.limpiarSesion();
    }
  }

  urlImagen(ruta: string) {
    if (/^https?:\/\//i.test(ruta)) return ruta;
    const servidor = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${servidor}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  }
}
