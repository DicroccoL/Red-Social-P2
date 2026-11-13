import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

const ANTICIPACION_AVISO_MS = 30_000;

// Programa el aviso y el cierre a partir del vencimiento que envía la API.
@Injectable({ providedIn: 'root' })
export class RelojSesionService {
  readonly avisoPendiente = new BehaviorSubject(false);
  readonly sesionVencida = new Subject<void>();
  private aviso?: ReturnType<typeof setTimeout>;
  private vencimiento?: ReturnType<typeof setTimeout>;
  private fechaVencimiento = 0;

  iniciar(fechaVencimiento: number) {
    this.detener();
    this.fechaVencimiento = fechaVencimiento;
    const restante = Math.max(0, fechaVencimiento - Date.now());
    this.aviso = setTimeout(
      () => {
        if (this.segundosRestantes() > 0) this.avisoPendiente.next(true);
      },
      Math.max(0, restante - ANTICIPACION_AVISO_MS),
    );
    this.vencimiento = setTimeout(() => this.sesionVencida.next(), restante);
  }

  segundosRestantes(): number {
    return Math.max(0, Math.ceil((this.fechaVencimiento - Date.now()) / 1000));
  }

  ocultarAviso() {
    this.avisoPendiente.next(false);
  }

  detener() {
    clearTimeout(this.aviso);
    clearTimeout(this.vencimiento);
    this.fechaVencimiento = 0;
    this.ocultarAviso();
  }
}
