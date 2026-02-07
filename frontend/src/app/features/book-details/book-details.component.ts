import { Component, OnInit, inject, signal, computed, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { BookDetails, ReadingStatus, UserBook } from '../../core/models/book.model';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LoadingSpinnerComponent],
  templateUrl: './book-details.component.html'
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private libraryService = inject(LibraryService);
  private sanitizer = inject(DomSanitizer);

  book = signal<BookDetails | null>(null);
  userBook = signal<UserBook | null>(null);
  loading = signal(true);
  notification = signal<string | null>(null);

  sanitizedDescription = computed(() => {
    const description = this.book()?.description;
    if (!description) return '';
    return this.sanitizer.sanitize(SecurityContext.HTML, description) || '';
  });

  selectedStatus: ReadingStatus = ReadingStatus.WantToRead;
  selectedRating: number | undefined;
  notes = '';

  ReadingStatus = ReadingStatus;

  async ngOnInit(): Promise<void> {
    const googleBooksId = this.route.snapshot.paramMap.get('id');
    if (!googleBooksId) {
      this.loading.set(false);
      return;
    }

    const bookDetails = await this.searchService.getBookDetails(googleBooksId);
    this.book.set(bookDetails);

    // Check if book is in user's library
    await this.libraryService.loadLibrary();
    const existingBook = this.libraryService.library().find(b => b.googleBooksId === googleBooksId);
    if (existingBook) {
      this.userBook.set(existingBook);
      this.selectedStatus = existingBook.status;
      this.selectedRating = existingBook.rating;
      this.notes = existingBook.notes || '';
    }

    this.loading.set(false);
  }

  async addToLibrary(): Promise<void> {
    const bookDetails = this.book();
    if (!bookDetails) return;

    const result = await this.libraryService.addBook({
      googleBooksId: bookDetails.googleBooksId,
      status: ReadingStatus.WantToRead
    });

    if (result) {
      this.userBook.set(result);
      this.selectedStatus = result.status;
      this.showNotification('Added to library!');
    }
  }

  async updateStatus(): Promise<void> {
    const book = this.userBook();
    if (!book) return;

    const result = await this.libraryService.updateBook(book.id, {
      status: this.selectedStatus
    });

    if (result) {
      this.userBook.set(result);
      this.showNotification('Status updated!');
    }
  }

  async setRating(rating: number): Promise<void> {
    const book = this.userBook();
    if (!book) return;

    this.selectedRating = rating;
    const result = await this.libraryService.updateBook(book.id, { rating });

    if (result) {
      this.userBook.set(result);
      this.showNotification('Rating saved!');
    }
  }

  async updateNotes(): Promise<void> {
    const book = this.userBook();
    if (!book) return;

    const result = await this.libraryService.updateBook(book.id, {
      notes: this.notes
    });

    if (result) {
      this.userBook.set(result);
      this.showNotification('Notes saved!');
    }
  }

  async removeFromLibrary(): Promise<void> {
    const book = this.userBook();
    if (!book) return;

    const success = await this.libraryService.removeBook(book.id);
    if (success) {
      this.userBook.set(null);
      this.selectedRating = undefined;
      this.notes = '';
      this.showNotification('Removed from library.');
    }
  }

  goBack(): void {
    this.router.navigate(['/library']);
  }

  private showNotification(message: string): void {
    this.notification.set(message);
    setTimeout(() => this.notification.set(null), 3000);
  }
}
