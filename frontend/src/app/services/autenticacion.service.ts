import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DatosRegistro,
  RespuestaAutenticacion,
  UsuarioPublico,
} from '../models/usuario.model';
import { Router } from '@angular/router';
import { RelojSesionService } from './reloj-sesion.service';

// Comunica registro y sesión con la API y conserva al usuario actual; el navegador administra la cookie.
@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  usuarioActual: UsuarioPublico | null = null;
  cargandoSesion = true;

  constructor(
    private readonly http: HttpClient,
    private readonly reloj: RelojSesionService,
    private readonly router: Router,
  ) {
    this.reloj.sesionVencida.subscribe(() => {
      this.limpiarSesion();
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

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
    return this.http
      .post(`${environment.apiUrl}/autenticacion/salir`, {}, { withCredentials: true })
      .pipe(tap(() => this.limpiarSesion()));
  }

  limpiarSesion() {
    this.usuarioActual = null;
    this.reloj.detener();
  }

  guardarSesion(respuesta: { usuario: UsuarioPublico; vencimiento: number }) {
    this.usuarioActual = respuesta.usuario;
    this.reloj.iniciar(respuesta.vencimiento);
  }

  actualizarUsuario(usuario: UsuarioPublico) {
    // Editar datos personales no concede tiempo extra a la sesión.
    this.usuarioActual = usuario;
  }

  refrescarSesion() {
    return this.http
      .post<RespuestaAutenticacion>(
        `${environment.apiUrl}/autenticacion/refrescar`,
        {},
        { withCredentials: true },
      )
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  async recuperarSesion(): Promise<void> {
    this.cargandoSesion = true;
    // Angular espera esta consulta antes de mostrar las vistas y evaluar las directivas.
    // El navegador envía la cookie; nuestro JavaScript nunca necesita leer el JWT.
    try {
      const respuesta = await firstValueFrom(
        this.http
          .post<{ usuario: UsuarioPublico; vencimiento: number }>(
            `${environment.apiUrl}/autenticacion/autorizar`,
            {},
            { withCredentials: true },
          )
          .pipe(timeout(15000)),
      );
      this.guardarSesion(respuesta);
    } catch {
      this.limpiarSesion();
    } finally {
      this.cargandoSesion = false;
    }
  }

  urlImagen(ruta: string) {
    if (/^https?:\/\//i.test(ruta)) return ruta;
    const servidor = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${servidor}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  }
}
