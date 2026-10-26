import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword = false;
  submitted = false;

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
  }
}
