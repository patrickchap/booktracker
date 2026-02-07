import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/services/library.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { SkeletonBookCardComponent } from '../../shared/components/skeleton-book-card/skeleton-book-card.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ReadingStatus } from '../../core/models/book.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink, BookCardComponent, SkeletonBookCardComponent, NavbarComponent],
  templateUrl: './library.component.html'
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
