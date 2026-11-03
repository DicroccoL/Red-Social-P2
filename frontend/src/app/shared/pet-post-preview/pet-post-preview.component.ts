import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Vista de demostración: las interacciones permanecen en este componente. */
@Component({
  selector: 'app-pet-post-preview',
  imports: [RouterLink],
  templateUrl: './pet-post-preview.component.html',
  styleUrl: './pet-post-preview.component.css',
  host: { '[class.compact]': 'compact' },
})
export class PetPostPreviewComponent {
  @Input() compact = false;
  liked = false;
  showComment = false;
  comment = '';

  addComment(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    this.comment = value;
    input.value = '';
    this.showComment = false;
  }
}
