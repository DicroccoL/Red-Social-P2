import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

// Programa el aviso cuando faltan 5 minutos y el cierre al vencer el token.
@Injectable({ providedIn: 'root' })
export class RelojSesionService {
  readonly avisoPendiente = new BehaviorSubject(false);
  readonly sesionVencida = new Subject<void>();
  private aviso?: ReturnType<typeof setTimeout>;
  private vencimiento?: ReturnType<typeof setTimeout>;

  iniciar(fechaVencimiento: number) {
    this.detener();
    const restante = Math.max(0, fechaVencimiento - Date.now());
    this.aviso = setTimeout(
      () => this.avisoPendiente.next(true),
      Math.max(0, restante - 5 * 60 * 1000),
    );
    this.vencimiento = setTimeout(() => this.sesionVencida.next(), restante);
  }

  ocultarAviso() {
    this.avisoPendiente.next(false);
  }

  detener() {
    clearTimeout(this.aviso);
    clearTimeout(this.vencimiento);
    this.ocultarAviso();
  }
}
