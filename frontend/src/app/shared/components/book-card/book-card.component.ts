import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReadingStatus } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-card.component.html'
})
export class BookCardComponent {
  @Input() googleBooksId!: string;
  @Input() title!: string;
  @Input() authors: string[] = [];
  @Input() coverImageUrl?: string;
  @Input() publishedDate?: string;
  @Input() status?: ReadingStatus;
  @Input() rating?: number;
  @Input() showViewDetails = true;
  @Input() showAddToLibrary = false;

  @Output() addToLibrary = new EventEmitter<void>();

  getStatusLabel(): string {
    switch (this.status) {
      case ReadingStatus.WantToRead:
        return 'Want to Read';
      case ReadingStatus.CurrentlyReading:
        return 'Currently Reading';
      case ReadingStatus.Finished:
        return 'Finished';
      default:
        return '';
    }
  }

  getStatusClass(): string {
    switch (this.status) {
      case ReadingStatus.WantToRead:
        return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
      case ReadingStatus.CurrentlyReading:
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800';
      case ReadingStatus.Finished:
        return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      default:
        return '';
    }
  }

  getStatusDotClass(): string {
    switch (this.status) {
      case ReadingStatus.WantToRead:
        return 'bg-blue-500';
      case ReadingStatus.CurrentlyReading:
        return 'bg-amber-500 animate-pulse';
      case ReadingStatus.Finished:
        return 'bg-green-500';
      default:
        return '';
    }
  }

  getCardBorderClass(): string {
    switch (this.status) {
      case ReadingStatus.CurrentlyReading:
        return 'ring-2 ring-amber-200 dark:ring-amber-800';
      default:
        return '';
    }
  }
}
