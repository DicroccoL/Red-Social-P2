import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// La misma entrada segmentada del cine, conservando el valor ISO del formulario.
@Component({
  selector: 'app-selector-fecha',
  templateUrl: './selector-fecha.component.html',
  styleUrl: './selector-fecha.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorFechaComponent),
      multi: true,
    },
  ],
})
export class SelectorFechaComponent implements ControlValueAccessor {
  @Input({ required: true }) inputId = '';
  @Input() invalid = false;
  @Input() describedBy = '';
  dia = '';
  mes = '';
  anio = '';
  deshabilitado = false;
  private alCambiar: (valor: string) => void = () => {};
  private alTocar: () => void = () => {};

  escribir(segmento: 'dia' | 'mes' | 'anio', evento: Event) {
    const input = evento.target as HTMLInputElement;
    this[segmento] = input.value.replace(/\D/g, '').slice(0, segmento === 'anio' ? 4 : 2);
    input.value = this[segmento];
    this.emitir();
  }

  completar(segmento: 'dia' | 'mes' | 'anio') {
    if (segmento !== 'anio' && this[segmento]) this[segmento] = this[segmento].padStart(2, '0');
    this.emitir();
    this.alTocar();
  }

  private emitir() {
    const { dia, mes, anio } = this;
    // Vacío solamente si los tres segmentos están vacíos. Las fechas imposibles
    // o incompletas llegan al validador, sin convertirse en un campo requerido.
    if (!dia && !mes && !anio) {
      this.alCambiar('');
      return;
    }
    const fecha = new Date(0);
    fecha.setFullYear(Number(anio), Number(mes) - 1, Number(dia));
    const valida =
      anio.length === 4 &&
      Number(anio) > 0 &&
      !!dia &&
      !!mes &&
      fecha.getFullYear() === Number(anio) &&
      fecha.getMonth() === Number(mes) - 1 &&
      fecha.getDate() === Number(dia);
    this.alCambiar(
      valida ? `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}` : 'fecha-invalida',
    );
  }

  writeValue(valor: string | null) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor ?? '');
    this.anio = partes?.[1] ?? '';
    this.mes = partes?.[2] ?? '';
    this.dia = partes?.[3] ?? '';
  }
  registerOnChange(fn: (valor: string) => void) {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void) {
    this.alTocar = fn;
  }
  setDisabledState(valor: boolean) {
    this.deshabilitado = valor;
  }
}
