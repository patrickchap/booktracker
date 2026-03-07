import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrentBook } from '../../../core/models/book-club.model';

@Component({
  selector: 'app-club-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './club-card.component.html'
})
export class ClubCardComponent {
  id = input.required<string>();
  name = input.required<string>();
  coverImageUrl = input<string | null>(null);
  privacy = input.required<'Public' | 'Private'>();
  memberCount = input.required<number>();
  currentBook = input<CurrentBook | null>(null);
  showDelete = input(false);
  deleting = input(false);

  deleteClicked = output<void>();
}
