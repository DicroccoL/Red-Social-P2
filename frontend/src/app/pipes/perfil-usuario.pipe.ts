import { Pipe, PipeTransform } from '@angular/core';
import { UsuarioPublico } from '../models/usuario.model';

@Pipe({ name: 'perfilUsuario' })
export class PerfilUsuarioPipe implements PipeTransform {
  transform(perfil: UsuarioPublico['perfil']): string {
    return perfil === 'administrador' ? 'Administrador' : 'Usuario';
  }
}
