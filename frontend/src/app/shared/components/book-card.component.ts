import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReadingStatus } from '../../core/models/book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          @if (coverImageUrl) {
            <img [src]="coverImageUrl"
                 [alt]="title"
                 class="w-24 h-36 object-cover rounded-lg shadow-sm">
          } @else {
            <div class="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
          }
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
            {{ title }}
          </h3>
          @if (authors.length) {
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ authors.join(', ') }}
            </p>
          }
          @if (publishedDate) {
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ publishedDate }}
            </p>
          }
          @if (status !== undefined) {
            <span [class]="getStatusClass()" class="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium">
              {{ getStatusLabel() }}
            </span>
          }
          @if (rating) {
            <div class="flex items-center mt-2">
              @for (star of [1,2,3,4,5]; track star) {
                <svg [class]="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                     class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              }
            </div>
          }
        </div>
      </div>

      <div class="mt-4 flex gap-2 flex-wrap">
        @if (showViewDetails) {
          <a [routerLink]="['/book', googleBooksId]"
             class="btn btn-secondary text-sm">
            View Details
          </a>
        }
        @if (showAddToLibrary) {
          <button (click)="addToLibrary.emit()"
                  class="btn btn-primary text-sm">
            Add to Library
          </button>
        }
      </div>
    </div>
  `
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ReadingStatus.CurrentlyReading:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ReadingStatus.Finished:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return '';
    }
  }
}
