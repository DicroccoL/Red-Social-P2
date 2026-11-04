import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { RelojSesionService } from '../../services/reloj-sesion.service';
import { mensajeErrorApi } from '../mensaje-error-api';

// Ofrece renovar la cookie antes del vencimiento, sin leer el JWT desde Angular.
@Component({
  selector: 'app-aviso-sesion',
  templateUrl: './aviso-sesion.component.html',
  styleUrl: './aviso-sesion.component.css',
})
export class AvisoSesionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;
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
