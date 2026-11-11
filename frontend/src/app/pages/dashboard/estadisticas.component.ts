import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CantidadTextoPipe } from '../../pipes/cantidad-texto.pipe';
import {
  AdministracionService,
  ConteoEstadistica,
  Estadisticas,
} from '../../services/administracion.service';
import { mensajeErrorApi } from '../../shared/mensaje-error-api';
import { SelectorFechaComponent } from '../../shared/selector-fecha/selector-fecha.component';
import { NavegacionDashboardComponent } from './navegacion-dashboard.component';

const DIA_MS = 24 * 60 * 60 * 1000;
const VALIDADORES_FECHA = [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)];
const COLORES = [
  '#802350',
  '#17756c',
  '#d1792d',
  '#4e589b',
  '#b04c67',
  '#467259',
  '#966322',
  '#6d4786',
];

function fechaArgentina(fecha: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).format(
    fecha,
  );
}

function puntosDeActividad(dias: ConteoEstadistica[], desde: string, hasta: string): string {
  const inicio = Date.parse(desde);
  const fin = Date.parse(hasta);
  const valores = new Map<number, number>([
    [inicio, 0],
    [fin, 0],
  ]);
  const maximo = dias.reduce((max, dia) => Math.max(max, dia.cantidad), 1);

  // Rodea los días con actividad con ceros, sin generar un punto por cada día vacío.
  for (const dia of dias) {
    const fecha = Date.parse(dia._id);
    if (fecha > inicio && !valores.has(fecha - DIA_MS)) valores.set(fecha - DIA_MS, 0);
    if (fecha < fin && !valores.has(fecha + DIA_MS)) valores.set(fecha + DIA_MS, 0);
    valores.set(fecha, dia.cantidad);
  }

  return [...valores.entries()]
    .sort(([a], [b]) => a - b)
    .map(([fecha, cantidad]) => {
      const x = inicio === fin ? 300 : 10 + (580 * (fecha - inicio)) / (fin - inicio);
      const y = 150 - (140 * cantidad) / maximo;
      return x + ',' + y;
    })
    .join(' ');
}

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [
    NavegacionDashboardComponent,
    ReactiveFormsModule,
    CantidadTextoPipe,
    SelectorFechaComponent,
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './dashboard.css',
})
export class DashboardEstadisticasComponent {
  private readonly administracion = inject(AdministracionService);
  private readonly destruccion = inject(DestroyRef);
  private readonly ahora = new Date();

  protected readonly rango = new FormGroup({
    desde: new FormControl(fechaArgentina(new Date(this.ahora.getTime() - 29 * DIA_MS)), {
      nonNullable: true,
      validators: VALIDADORES_FECHA,
    }),
    hasta: new FormControl(fechaArgentina(this.ahora), {
      nonNullable: true,
      validators: VALIDADORES_FECHA,
    }),
  });
  protected readonly datos = signal<Estadisticas | null>(null);
  protected readonly aplicado = signal({ desde: '', hasta: '' });
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected puntos = '';
  protected maximoPublicaciones = 1;
  protected totalComentarios = 0;
  protected segmentos: { nombre: string; cantidad: number; color: string }[] = [];
  protected fondoAnillo = '';

  constructor() {
    this.consultar();
  }

  protected consultar() {
    if (this.cargando()) return;
    const { desde, hasta } = this.rango.getRawValue();
    if (this.rango.invalid) {
      this.rango.markAllAsTouched();
      this.error.set('Completá las dos fechas del período con día, mes y año válidos.');
      return;
    }
    if (desde > hasta) {
      this.error.set(
        'Elegí un rango válido. La fecha inicial debe ser anterior o igual a la final.',
      );
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.administracion
      .estadisticas(desde, hasta)
      .pipe(takeUntilDestroyed(this.destruccion))
      .subscribe({
        next: (datos) => {
          this.maximoPublicaciones = datos.publicacionesPorUsuario[0]?.cantidad ?? 1;
          this.totalComentarios = datos.comentariosPorDia.reduce(
            (total, dia) => total + dia.cantidad,
            0,
          );
          this.puntos = puntosDeActividad(datos.comentariosPorDia, desde, hasta);
          this.prepararAnillo(datos.comentariosPorPublicacion);
          this.aplicado.set({ desde, hasta });
          this.datos.set(datos);
          this.cargando.set(false);
        },
        error: (error) => {
          this.error.set(mensajeErrorApi(error));
          this.cargando.set(false);
        },
      });
  }

  private prepararAnillo(publicaciones: ConteoEstadistica[]) {
    const destacados = publicaciones.slice(0, COLORES.length);
    const otros = publicaciones
      .slice(COLORES.length)
      .reduce((total, post) => total + post.cantidad, 0);
    this.segmentos = destacados.map((post, indice) => ({
      nombre: post.nombre || 'Publicación',
      cantidad: post.cantidad,
      color: COLORES[indice],
    }));
    if (otros)
      this.segmentos.push({ nombre: 'Otras publicaciones', cantidad: otros, color: '#666' });

    let avance = 0;
    const porciones = this.segmentos.map(({ cantidad, color }) => {
      const inicio = avance;
      avance += (cantidad / this.totalComentarios) * 100;
      return color + ' ' + inicio + '% ' + avance + '%';
    });
    this.fondoAnillo = porciones.length ? 'conic-gradient(' + porciones.join(', ') + ')' : '';
  }
}
