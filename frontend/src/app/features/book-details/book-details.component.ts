import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { BookDetails, ReadingStatus, UserBook } from '../../core/models/book.model';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, LoadingSpinnerComponent],
  template: `
    <app-navbar />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (book()) {
        <div class="card">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Cover Image -->
            <div class="flex-shrink-0">
              @if (book()!.coverImageUrl) {
                <img [src]="book()!.coverImageUrl"
                     [alt]="book()!.title"
                     class="w-48 h-72 object-cover rounded-lg shadow-lg">
              } @else {
                <div class="w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                  </svg>
                </div>
              }
            </div>

            <!-- Book Info -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ book()!.title }}
              </h1>

              @if (book()!.authors.length) {
                <p class="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  by {{ book()!.authors.join(', ') }}
                </p>
              }

              <div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-500">
                @if (book()!.publishedDate) {
                  <span>Published: {{ book()!.publishedDate }}</span>
                }
                @if (book()!.publisher) {
                  <span>Publisher: {{ book()!.publisher }}</span>
                }
                @if (book()!.pageCount) {
                  <span>{{ book()!.pageCount }} pages</span>
                }
              </div>

              @if (book()!.categories?.length) {
                <div class="flex flex-wrap gap-2 mt-4">
                  @for (category of book()!.categories; track category) {
                    <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                      {{ category }}
                    </span>
                  }
                </div>
              }

              <!-- Library Actions -->
              <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                @if (userBook()) {
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select [(ngModel)]="selectedStatus"
                              (change)="updateStatus()"
                              class="input">
                        <option [ngValue]="ReadingStatus.WantToRead">Want to Read</option>
                        <option [ngValue]="ReadingStatus.CurrentlyReading">Currently Reading</option>
                        <option [ngValue]="ReadingStatus.Finished">Finished</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rating
                      </label>
                      <div class="flex gap-1">
                        @for (star of [1,2,3,4,5]; track star) {
                          <button (click)="setRating(star)"
                                  class="focus:outline-none">
                            <svg [class]="star <= (selectedRating || 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'"
                                 class="w-8 h-8 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </button>
                        }
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea [(ngModel)]="notes"
                                rows="3"
                                class="input"
                                placeholder="Add your thoughts..."></textarea>
                      <button (click)="updateNotes()"
                              class="btn btn-secondary mt-2 text-sm">
                        Save Notes
                      </button>
                    </div>

                    <button (click)="removeFromLibrary()"
                            class="text-red-600 hover:text-red-700 text-sm font-medium">
                      Remove from Library
                    </button>
                  </div>
                } @else {
                  <button (click)="addToLibrary()"
                          class="btn btn-primary w-full">
                    Add to Library
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Description -->
          @if (book()!.description) {
            <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <div class="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                   [innerHTML]="book()!.description">
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">Book not found.</p>
          <button (click)="goBack()" class="btn btn-primary mt-4">
            Go Back
          </button>
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
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private libraryService = inject(LibraryService);

  book = signal<BookDetails | null>(null);
  userBook = signal<UserBook | null>(null);
  loading = signal(true);
  notification = signal<string | null>(null);

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
