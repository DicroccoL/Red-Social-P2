import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [RouterLink],
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  showPassword = false;
  submitted = false;

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
  }
}
