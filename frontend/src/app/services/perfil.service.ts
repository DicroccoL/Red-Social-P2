import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatosPerfil, RespuestaPerfil } from '../models/perfil.model';
import { prepararFormularioImagen } from '../shared/preparar-formulario-imagen';

// Consulta y modifica la cuenta identificada por la cookie, sin recibir IDs desde el formulario.
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly ruta = environment.apiUrl + '/usuarios/mi-perfil';
  constructor(private readonly http: HttpClient) {}
  obtener() {
    return this.http.get<RespuestaPerfil>(this.ruta, { withCredentials: true });
  }
  actualizar(datos: DatosPerfil, imagen: File | null) {
    const formulario = new FormData();
    for (const [campo, valor] of Object.entries(datos)) formulario.append(campo, valor);
    return prepararFormularioImagen(formulario, 'imagenPerfil', imagen).pipe(
      switchMap((cuerpo) =>
        this.http.put<RespuestaPerfil>(this.ruta, cuerpo, { withCredentials: true }),
      ),
    );
  }
}
