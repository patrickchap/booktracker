import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/services/library.service';
import { BookCardComponent } from '../../shared/components/book-card.component';
import { SkeletonBookCardComponent } from '../../shared/components/skeleton-book-card.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ReadingStatus } from '../../core/models/book.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent, SkeletonBookCardComponent, NavbarComponent],
  template: `
    <app-navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">My Library</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Track your reading journey</p>
        </div>
        <a routerLink="/search" class="btn btn-primary inline-flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Books
        </a>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ libraryService.stats().total }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Books</div>
        </div>
        <div class="card text-center bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
          <div class="text-3xl font-bold text-blue-600">{{ libraryService.stats().wantToRead }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Want to Read</div>
        </div>
        <div class="card text-center bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800">
          <div class="text-3xl font-bold text-amber-600">{{ libraryService.stats().currentlyReading }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Currently Reading</div>
        </div>
        <div class="card text-center bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
          <div class="text-3xl font-bold text-green-600">{{ libraryService.stats().finished }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Finished</div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div [style.animation-delay]="(i * 100) + 'ms'" class="animate-fade-in">
              <app-skeleton-book-card />
            </div>
          }
        </div>
      } @else if (getFilteredBooks().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (book of getFilteredBooks(); track book.id; let i = $index) {
            <div [style.animation-delay]="(i * 50) + 'ms'" class="animate-slide-up opacity-0" style="animation-fill-mode: forwards">
              <app-book-card
                [googleBooksId]="book.googleBooksId"
                [title]="book.title"
                [authors]="book.authors"
                [coverImageUrl]="book.coverImageUrl"
                [status]="book.status"
                [rating]="book.rating" />
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16 animate-fade-in">
          <div class="relative inline-block">
            <div class="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 rounded-full flex items-center justify-center mb-6">
              @switch (activeTab()) {
                @case (null) {
                  <svg class="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                }
                @case (ReadingStatus.WantToRead) {
                  <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                }
                @case (ReadingStatus.CurrentlyReading) {
                  <svg class="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
                @case (ReadingStatus.Finished) {
                  <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              }
            </div>
            <div class="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
          </div>

          <h3 class="text-xl font-display font-semibold text-gray-900 dark:text-white mb-2">
            @switch (activeTab()) {
              @case (null) {
                Your reading journey starts here
              }
              @case (ReadingStatus.WantToRead) {
                Build your reading wishlist
              }
              @case (ReadingStatus.CurrentlyReading) {
                Ready to dive into a book?
              }
              @case (ReadingStatus.Finished) {
                Complete your first book
              }
            }
          </h3>

          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            @switch (activeTab()) {
              @case (null) {
                Discover new books, track your progress, and build your personal library.
              }
              @case (ReadingStatus.WantToRead) {
                Find books you'd love to read and save them for later.
              }
              @case (ReadingStatus.CurrentlyReading) {
                Pick up a book and start tracking your reading progress.
              }
              @case (ReadingStatus.Finished) {
                Once you finish a book, it'll appear here with your rating.
              }
            }
          </p>

          <a routerLink="/search" class="btn btn-primary inline-flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Discover Books
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
