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
    mockSearchService.searchBooks.and.callFake((query: string) => {
      return Promise.resolve();
    });

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

  describe('search functionality', () => {
    it('should have reactive search initialized', () => {
      expect(component.searchQuery).toBeDefined();
    });

    it('should trigger manual search correctly', () => {
      component.searchQuery.set('Angular');
      const event = new Event('submit');
      spyOn(event, 'preventDefault');
      component.search(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockSearchService.searchBooks).toHaveBeenCalledWith('Angular');
    });

    it('should not search with empty query', () => {
      component.searchQuery.set('');
      const event = new Event('submit');
      component.search(event);
      expect(mockSearchService.searchBooks).not.toHaveBeenCalledWith('');
    });

    it('should not search with whitespace-only query', () => {
      component.searchQuery.set('   ');
      const event = new Event('submit');
      component.search(event);
      expect(mockSearchService.searchBooks).not.toHaveBeenCalledWith('   ');
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
