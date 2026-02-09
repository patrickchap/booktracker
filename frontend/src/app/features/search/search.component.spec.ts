import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchComponent } from './search.component';
import { SearchService } from '../../core/services/search.service';
import { LibraryService } from '../../core/services/library.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { BookSearchResult, ReadingStatus } from '../../core/models/book.model';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockSearchService: jasmine.SpyObj<SearchService>;
  let mockLibraryService: jasmine.SpyObj<LibraryService>;

  beforeEach(async () => {
    mockSearchService = jasmine.createSpyObj('SearchService', ['searchBooks'], {
      searchResults: signal({ items: [], totalItems: 0 }),
      isLoading: signal(false),
      query: signal(''),
    });
    mockSearchService.searchBooks.and.returnValue(Promise.resolve());

    mockLibraryService = jasmine.createSpyObj('LibraryService', ['addBook']);

    const mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      user: signal(null),
      isAuthenticated: signal(true),
    });

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: mockSearchService },
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchService.searchBooks on search with non-empty query', () => {
    component.searchQuery.set('Angular');
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    component.search(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
  });

  it('should not search with empty query via form submit', () => {
    component.searchQuery.set('   ');
    const event = new Event('submit');
    component.search(event);
    // Only the initial constructor call (from signal default '') should have occurred
    const manualCalls = mockSearchService.searchBooks.calls.allArgs()
      .filter(args => args[0] === '   ');
    expect(manualCalls.length).toBe(0);
  });

  describe('reactive search pipe', () => {
    beforeEach(() => {
      mockSearchService.searchBooks.calls.reset();
    });

    it('should trigger search after debounce when query changes', (done) => {
      component.searchQuery.set('Angular');
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
        done();
      }, 400);
    });

    it('should not trigger search before debounce time elapses', (done) => {
      component.searchQuery.set('Angular');
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockSearchService.searchBooks).not.toHaveBeenCalled();
      }, 100);
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
        done();
      }, 400);
    });

    it('should only search with the latest query when typing fast', (done) => {
      component.searchQuery.set('Ang');
      fixture.detectChanges();
      setTimeout(() => {
        component.searchQuery.set('Angul');
        fixture.detectChanges();
      }, 100);
      setTimeout(() => {
        component.searchQuery.set('Angular');
        fixture.detectChanges();
      }, 200);
      setTimeout(() => {
        const calls = mockSearchService.searchBooks.calls.allArgs();
        expect(calls.length).toBe(1);
        expect(calls[0][0]).toBe('Angular');
        done();
      }, 600);
    });

    it('should not trigger duplicate searches for the same query', (done) => {
      component.searchQuery.set('Angular');
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledTimes(1);
        mockSearchService.searchBooks.calls.reset();
        // Set same value again
        component.searchQuery.set('Angular');
        fixture.detectChanges();
      }, 400);
      setTimeout(() => {
        expect(mockSearchService.searchBooks).not.toHaveBeenCalled();
        done();
      }, 800);
    });

    it('should search again when query changes to a different value', (done) => {
      component.searchQuery.set('Angular');
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
        mockSearchService.searchBooks.calls.reset();
        component.searchQuery.set('React');
        fixture.detectChanges();
      }, 400);
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledWith('React');
        done();
      }, 800);
    });

    it('should trim the query before searching', (done) => {
      component.searchQuery.set('  Angular  ');
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
        done();
      }, 400);
    });
  });

  it('should add book to library and show success notification', async () => {
    const book: BookSearchResult = {
      googleBooksId: 'abc123',
      title: 'Test Book',
      authors: ['Author'],
    };
    mockLibraryService.addBook.and.returnValue(Promise.resolve({
      id: '1',
      googleBooksId: 'abc123',
      title: 'Test Book',
      authors: ['Author'],
      status: ReadingStatus.WantToRead,
      addedAt: new Date().toISOString(),
    }));

    await component.addToLibrary(book);
    expect(mockLibraryService.addBook).toHaveBeenCalledWith({
      googleBooksId: 'abc123',
      status: ReadingStatus.WantToRead,
    });
    expect(component.notification()).toContain('Test Book');
    expect(component.notification()).toContain('added to your library');
  });

  it('should show fallback notification when book already in library', async () => {
    const book: BookSearchResult = {
      googleBooksId: 'abc123',
      title: 'Test Book',
      authors: ['Author'],
    };
    mockLibraryService.addBook.and.returnValue(Promise.resolve(null));

    await component.addToLibrary(book);
    expect(component.notification()).toContain('already be in your library');
  });

  it('should clear notification after 3 seconds', fakeAsync(() => {
    (component as any).showNotification('test message');
    expect(component.notification()).toBe('test message');
    tick(3000);
    expect(component.notification()).toBeNull();
  }));
});
