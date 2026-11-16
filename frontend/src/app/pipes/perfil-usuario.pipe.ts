import { Pipe, PipeTransform } from '@angular/core';
import { UsuarioPublico } from '../models/usuario.model';

// Muestra el perfil como «Administrador» o «Usuario» en la tabla de usuarios.
@Pipe({ name: 'perfilUsuario' })
export class PerfilUsuarioPipe implements PipeTransform {
  transform(perfil: UsuarioPublico['perfil']): string {
    return perfil === 'administrador' ? 'Administrador' : 'Usuario';
  }
}
