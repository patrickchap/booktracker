import { Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { SkeletonBookCardComponent } from '../../shared/components/skeleton-book-card/skeleton-book-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ReadingStatus, BookSearchResult } from '../../core/models/book.model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, distinctUntilKeyChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent, SkeletonBookCardComponent, NavbarComponent],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  searchService = inject(SearchService);
  destroyRef = inject(DestroyRef)
  private libraryService = inject(LibraryService);

  searchQuery = signal<string>('');
  notification = signal<string | null>(null);


  constructor() {
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query =>
          this.searchService.searchBooks(query.trim())
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  search(event: Event): void {
    event.preventDefault();
    if (this.searchQuery().trim()) {
      this.searchService.searchBooks(this.searchQuery());
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
