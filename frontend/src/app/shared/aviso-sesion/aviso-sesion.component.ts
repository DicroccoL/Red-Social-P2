import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { interval, map, startWith, Subscription } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { RelojSesionService } from '../../services/reloj-sesion.service';
import { mensajeErrorApi } from '../mensaje-error-api';

// Ofrece renovar la cookie antes del vencimiento, sin leer el JWT desde Angular.
@Component({
  selector: 'app-aviso-sesion',
  imports: [AsyncPipe],
  templateUrl: './aviso-sesion.component.html',
  styleUrl: './aviso-sesion.component.css',
})
export class AvisoSesionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;
  protected readonly tiempoRestante = interval(1000).pipe(
    startWith(0),
    map(() => {
      const segundos = this.reloj.segundosRestantes();
      const minutos = Math.floor(segundos / 60);
      return `${minutos}:${String(segundos % 60).padStart(2, '0')}`;
    }),
  );
  renovando = false;
  error = '';
  private solicitud?: Subscription;
  constructor(
    private readonly autenticacion: AutenticacionService,
    readonly reloj: RelojSesionService,
    private readonly cambios: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.dialogo.nativeElement.showModal();
  }

  extender() {
    if (this.renovando) return;
    this.renovando = true;
    this.error = '';
    this.solicitud = this.autenticacion.refrescarSesion().subscribe({
      error: (error) => {
        this.renovando = false;
        this.error = mensajeErrorApi(error);
        this.cambios.markForCheck();
      },
    });
  }

  posponer(evento?: Event) {
    evento?.preventDefault();
    if (!this.renovando) this.reloj.ocultarAviso();
  }

  ngOnDestroy() {
    this.solicitud?.unsubscribe();
  }
}
