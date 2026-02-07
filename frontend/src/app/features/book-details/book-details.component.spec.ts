import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BookDetailsComponent } from './book-details.component';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { ReadingStatus, BookDetails, UserBook } from '../../core/models/book.model';

describe('BookDetailsComponent', () => {
  let component: BookDetailsComponent;
  let fixture: ComponentFixture<BookDetailsComponent>;
  let mockSearchService: jasmine.SpyObj<SearchService>;
  let mockLibraryService: jasmine.SpyObj<LibraryService>;
  let router: Router;

  const mockBookDetails: BookDetails = {
    googleBooksId: 'test-id',
    title: 'Test Book',
    authors: ['Author One'],
    description: '<p>A great book</p>',
    pageCount: 300,
    publishedDate: '2024',
  };

  const mockUserBook: UserBook = {
    id: 'ub1',
    googleBooksId: 'test-id',
    title: 'Test Book',
    authors: ['Author One'],
    status: ReadingStatus.CurrentlyReading,
    rating: 4,
    notes: 'Great read',
    addedAt: '2024-01-01',
  };

  function createComponent(routeId: string | null = 'test-id') {
    mockSearchService = jasmine.createSpyObj('SearchService', ['getBookDetails'], {
      searchResults: signal({ items: [], totalItems: 0 }),
      isLoading: signal(false),
    });

    mockLibraryService = jasmine.createSpyObj('LibraryService', [
      'loadLibrary', 'addBook', 'updateBook', 'removeBook',
    ], {
      library: signal<UserBook[]>([]),
      isLoading: signal(false),
    });

    const mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      user: signal(null),
      isAuthenticated: signal(true),
    });

    TestBed.configureTestingModule({
      imports: [BookDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: mockSearchService },
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(routeId ? { id: routeId } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  }

  it('should create', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(null));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set loading to false when no id in route', async () => {
    createComponent(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.loading()).toBe(false);
    expect(mockSearchService.getBookDetails).not.toHaveBeenCalled();
  });

  it('should fetch book details on init', async () => {
    createComponent('test-id');
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockSearchService.getBookDetails).toHaveBeenCalledWith('test-id');
    expect(component.book()).toEqual(mockBookDetails);
    expect(component.loading()).toBe(false);
  });

  it('should add book to library', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    const addedBook: UserBook = { ...mockUserBook, status: ReadingStatus.WantToRead };
    mockLibraryService.addBook.and.returnValue(Promise.resolve(addedBook));

    await component.addToLibrary();
    expect(mockLibraryService.addBook).toHaveBeenCalledWith({
      googleBooksId: 'test-id',
      status: ReadingStatus.WantToRead,
    });
    expect(component.userBook()).toEqual(addedBook);
    expect(component.notification()).toContain('Added to library');
  });

  it('should not add to library when book is null', async () => {
    createComponent(null);
    fixture.detectChanges();
    await fixture.whenStable();

    await component.addToLibrary();
    expect(mockLibraryService.addBook).not.toHaveBeenCalled();
  });

  it('should update book status', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    component.userBook.set(mockUserBook);
    component.selectedStatus = ReadingStatus.Finished;

    const updatedBook = { ...mockUserBook, status: ReadingStatus.Finished };
    mockLibraryService.updateBook.and.returnValue(Promise.resolve(updatedBook));

    await component.updateStatus();
    expect(mockLibraryService.updateBook).toHaveBeenCalledWith('ub1', { status: ReadingStatus.Finished });
    expect(component.notification()).toContain('Status updated');
  });

  it('should not update status when userBook is null', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(null));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());
    fixture.detectChanges();
    await fixture.whenStable();

    await component.updateStatus();
    expect(mockLibraryService.updateBook).not.toHaveBeenCalled();
  });

  it('should set rating', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    component.userBook.set(mockUserBook);

    const updatedBook = { ...mockUserBook, rating: 5 };
    mockLibraryService.updateBook.and.returnValue(Promise.resolve(updatedBook));

    await component.setRating(5);
    expect(component.selectedRating).toBe(5);
    expect(mockLibraryService.updateBook).toHaveBeenCalledWith('ub1', { rating: 5 });
    expect(component.notification()).toContain('Rating saved');
  });

  it('should update notes', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    component.userBook.set(mockUserBook);
    component.notes = 'Updated notes';

    const updatedBook = { ...mockUserBook, notes: 'Updated notes' };
    mockLibraryService.updateBook.and.returnValue(Promise.resolve(updatedBook));

    await component.updateNotes();
    expect(mockLibraryService.updateBook).toHaveBeenCalledWith('ub1', { notes: 'Updated notes' });
    expect(component.notification()).toContain('Notes saved');
  });

  it('should remove book from library', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    component.userBook.set(mockUserBook);
    mockLibraryService.removeBook.and.returnValue(Promise.resolve(true));

    await component.removeFromLibrary();
    expect(mockLibraryService.removeBook).toHaveBeenCalledWith('ub1');
    expect(component.userBook()).toBeNull();
    expect(component.selectedRating).toBeUndefined();
    expect(component.notes).toBe('');
    expect(component.notification()).toContain('Removed from library');
  });

  it('should not remove when userBook is null', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(null));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());
    fixture.detectChanges();
    await fixture.whenStable();

    await component.removeFromLibrary();
    expect(mockLibraryService.removeBook).not.toHaveBeenCalled();
  });

  it('should navigate back to /library on goBack', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(null));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());
    fixture.detectChanges();
    await fixture.whenStable();

    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/library']);
  });

  it('should sanitize description', async () => {
    createComponent();
    mockSearchService.getBookDetails.and.returnValue(Promise.resolve(mockBookDetails));
    mockLibraryService.loadLibrary.and.returnValue(Promise.resolve());

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.sanitizedDescription()).toBeTruthy();
  });

  it('should return empty string for sanitizedDescription when no book', () => {
    createComponent(null);
    fixture.detectChanges();
    expect(component.sanitizedDescription()).toBe('');
  });
});
