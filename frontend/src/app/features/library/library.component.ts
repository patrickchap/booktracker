import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/services/library.service';
import { BookCardComponent } from '../../shared/components/book-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ReadingStatus } from '../../core/models/book.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent, LoadingSpinnerComponent, NavbarComponent],
  template: `
    <app-navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Library</h1>
        <a routerLink="/search" class="btn btn-primary">
          + Add Books
        </a>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ libraryService.stats().total }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Books</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600">{{ libraryService.stats().wantToRead }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Want to Read</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ libraryService.stats().currentlyReading }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Currently Reading</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600">{{ libraryService.stats().finished }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Finished</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex space-x-8">
          @for (tab of tabs; track tab.status) {
            <button (click)="activeTab.set(tab.status)"
                    [class]="activeTab() === tab.status
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                    class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
              {{ tab.label }}
              <span class="ml-2 py-0.5 px-2 rounded-full text-xs"
                    [class]="activeTab() === tab.status ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'">
                {{ getCount(tab.status) }}
              </span>
            </button>
          }
        </nav>
      </div>

      @if (libraryService.isLoading()) {
        <app-loading-spinner />
      } @else if (getFilteredBooks().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (book of getFilteredBooks(); track book.id) {
            <app-book-card
              [googleBooksId]="book.googleBooksId"
              [title]="book.title"
              [authors]="book.authors"
              [coverImageUrl]="book.coverImageUrl"
              [status]="book.status"
              [rating]="book.rating" />
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            @switch (activeTab()) {
              @case (null) {
                Your library is empty. Start by adding some books!
              }
              @case (ReadingStatus.WantToRead) {
                No books in your "Want to Read" list.
              }
              @case (ReadingStatus.CurrentlyReading) {
                You're not currently reading any books.
              }
              @case (ReadingStatus.Finished) {
                You haven't finished any books yet.
              }
            }
          </p>
          <a routerLink="/search" class="btn btn-primary mt-4 inline-block">
            Find Books
          </a>
        </div>
      }
    </main>
  `
})
export class LibraryComponent implements OnInit {
  libraryService = inject(LibraryService);

  activeTab = signal<ReadingStatus | null>(null);
  ReadingStatus = ReadingStatus;

  tabs = [
    { status: null as ReadingStatus | null, label: 'All' },
    { status: ReadingStatus.WantToRead, label: 'Want to Read' },
    { status: ReadingStatus.CurrentlyReading, label: 'Currently Reading' },
    { status: ReadingStatus.Finished, label: 'Finished' }
  ];

  ngOnInit(): void {
    this.libraryService.loadLibrary();
  }

  getCount(status: ReadingStatus | null): number {
    if (status === null) {
      return this.libraryService.stats().total;
    }
    switch (status) {
      case ReadingStatus.WantToRead:
        return this.libraryService.stats().wantToRead;
      case ReadingStatus.CurrentlyReading:
        return this.libraryService.stats().currentlyReading;
      case ReadingStatus.Finished:
        return this.libraryService.stats().finished;
    }
  }

  getFilteredBooks() {
    const tab = this.activeTab();
    if (tab === null) {
      return this.libraryService.library();
    }
    switch (tab) {
      case ReadingStatus.WantToRead:
        return this.libraryService.wantToRead();
      case ReadingStatus.CurrentlyReading:
        return this.libraryService.currentlyReading();
      case ReadingStatus.Finished:
        return this.libraryService.finished();
    }
  }
}
