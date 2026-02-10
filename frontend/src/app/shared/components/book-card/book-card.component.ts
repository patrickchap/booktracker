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
        return 'bg-status-want-muted text-status-want border border-status-want/20';
      case ReadingStatus.CurrentlyReading:
        return 'bg-status-reading-muted text-status-reading border border-status-reading/20';
      case ReadingStatus.Finished:
        return 'bg-status-finished-muted text-status-finished border border-status-finished/20';
      default:
        return '';
    }
  }

  getStatusDotClass(): string {
    switch (this.status) {
      case ReadingStatus.WantToRead:
        return 'bg-status-want';
      case ReadingStatus.CurrentlyReading:
        return 'bg-status-reading animate-pulse';
      case ReadingStatus.Finished:
        return 'bg-status-finished';
      default:
        return '';
    }
  }

  getCardBorderClass(): string {
    switch (this.status) {
      case ReadingStatus.CurrentlyReading:
        return 'ring-2 ring-status-reading/30';
      default:
        return '';
    }
  }
}
