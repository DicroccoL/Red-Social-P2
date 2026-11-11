import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioPublico } from '../../models/usuario.model';
import { EstadoCuentaPipe } from '../../pipes/estado-cuenta.pipe';
import { PerfilUsuarioPipe } from '../../pipes/perfil-usuario.pipe';
import { AdministracionService } from '../../services/administracion.service';
import { AutenticacionService } from '../../services/autenticacion.service';
import { ConfirmarAccionComponent } from '../../shared/confirmar-accion/confirmar-accion.component';
import { mensajeErrorApi } from '../../shared/mensaje-error-api';
import { RegistroComponent } from '../registro/registro.component';
import { NavegacionDashboardComponent } from './navegacion-dashboard.component';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [
    NavegacionDashboardComponent,
    RegistroComponent,
    ConfirmarAccionComponent,
    PerfilUsuarioPipe,
    EstadoCuentaPipe,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './dashboard.css',
})
export class DashboardUsuariosComponent {
  private readonly administracion = inject(AdministracionService);
  private readonly destruccion = inject(DestroyRef);
  protected readonly sesion = inject(AutenticacionService);
  protected readonly usuarios = signal<UsuarioPublico[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly creando = signal(false);
  protected readonly procesando = signal(false);
  protected readonly pendiente = signal<UsuarioPublico | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.administracion
      .listarUsuarios()
      .pipe(takeUntilDestroyed(this.destruccion))
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
          this.cargando.set(false);
        },
        error: (error) => {
          this.error.set(mensajeErrorApi(error));
          this.cargando.set(false);
        },
      });
  }

  protected usuarioCreado(usuario: UsuarioPublico) {
    this.creando.set(false);
    this.mensaje.set('Creaste la cuenta de ' + usuario.nombreUsuario + '.');
    this.cargar();
  }

  protected confirmarEstado() {
    const usuario = this.pendiente();
    if (!usuario || this.procesando()) return;
    this.pendiente.set(null);
    this.procesando.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.administracion
      .cambiarEstado(usuario._id, !usuario.activo)
      .pipe(takeUntilDestroyed(this.destruccion))
      .subscribe({
        next: (actualizado) => {
          this.usuarios.update((usuarios) =>
            usuarios.map((actual) => (actual._id === actualizado._id ? actualizado : actual)),
          );
          this.mensaje.set('Cuenta ' + (actualizado.activo ? 'habilitada.' : 'deshabilitada.'));
          this.procesando.set(false);
        },
        error: (error) => {
          this.error.set(mensajeErrorApi(error));
          this.procesando.set(false);
        },
      });
  }
}
