import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { BookCardComponent } from '../../shared/components/book-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ReadingStatus, BookSearchResult } from '../../core/models/book.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent, LoadingSpinnerComponent, NavbarComponent],
  template: `
    <app-navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Search Books</h1>

        <form (submit)="search($event)" class="flex gap-4">
          <input type="text"
                 [(ngModel)]="searchQuery"
                 name="query"
                 placeholder="Search by title, author, or ISBN..."
                 class="input flex-1">
          <button type="submit"
                  [disabled]="searchService.isLoading()"
                  class="btn btn-primary">
            @if (searchService.isLoading()) {
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            } @else {
              Search
            }
          </button>
        </form>
      </div>

      @if (searchService.isLoading()) {
        <app-loading-spinner />
      } @else if (searchService.searchResults().items.length) {
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Found {{ searchService.searchResults().totalItems }} results for "{{ searchService.query() }}"
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (book of searchService.searchResults().items; track book.googleBooksId) {
            <app-book-card
              [googleBooksId]="book.googleBooksId"
              [title]="book.title"
              [authors]="book.authors"
              [coverImageUrl]="book.coverImageUrl"
              [publishedDate]="book.publishedDate"
              [showAddToLibrary]="true"
              (addToLibrary)="addToLibrary(book)" />
          }
        </div>
      } @else if (searchService.query()) {
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-4 text-gray-600 dark:text-gray-400">No books found for your search.</p>
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            Search for books by title, author, or ISBN.
          </p>
        </div>
      }

      @if (notification()) {
        <div class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {{ notification() }}
        </div>
      }
    </main>
  `
})
export class SearchComponent {
  searchService = inject(SearchService);
  private libraryService = inject(LibraryService);

  searchQuery = '';
  notification = signal<string | null>(null);

  search(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      this.searchService.searchBooks(this.searchQuery);
    }
  }

  async addToLibrary(book: BookSearchResult): Promise<void> {
    const result = await this.libraryService.addBook({
      googleBooksId: book.googleBooksId,
      status: ReadingStatus.WantToRead
    });

    if (result) {
      this.showNotification(`"${book.title}" added to your library!`);
    } else {
      this.showNotification('Book may already be in your library.');
    }
  }

  private showNotification(message: string): void {
    this.notification.set(message);
    setTimeout(() => this.notification.set(null), 3000);
  }
}
