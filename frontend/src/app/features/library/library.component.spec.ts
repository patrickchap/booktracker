import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LibraryComponent } from './library.component';
import { LibraryService } from '../../core/services/library.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { ReadingStatus, UserBook } from '../../core/models/book.model';

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;
  let mockLibraryService: jasmine.SpyObj<LibraryService>;

  const mockBooks: UserBook[] = [
    { id: '1', googleBooksId: 'g1', title: 'Book A', authors: ['Author A'], status: ReadingStatus.WantToRead, addedAt: '2024-01-01' },
    { id: '2', googleBooksId: 'g2', title: 'Book B', authors: ['Author B'], status: ReadingStatus.CurrentlyReading, addedAt: '2024-01-02' },
    { id: '3', googleBooksId: 'g3', title: 'Book C', authors: ['Author C'], status: ReadingStatus.Finished, addedAt: '2024-01-03' },
  ];

  beforeEach(async () => {
    mockLibraryService = jasmine.createSpyObj('LibraryService', ['loadLibrary'], {
      library: signal(mockBooks),
      isLoading: signal(false),
      wantToRead: signal(mockBooks.filter(b => b.status === ReadingStatus.WantToRead)),
      currentlyReading: signal(mockBooks.filter(b => b.status === ReadingStatus.CurrentlyReading)),
      finished: signal(mockBooks.filter(b => b.status === ReadingStatus.Finished)),
      stats: signal({ total: 3, wantToRead: 1, currentlyReading: 1, finished: 1 }),
    });

    const mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      user: signal(null),
      isAuthenticated: signal(true),
    });

    await TestBed.configureTestingModule({
      imports: [LibraryComponent],
      providers: [
        provideRouter([]),
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadLibrary on init', () => {
    expect(mockLibraryService.loadLibrary).toHaveBeenCalled();
  });

  it('should have 4 tabs', () => {
    expect(component.tabs.length).toBe(4);
    expect(component.tabs[0].label).toBe('All');
    expect(component.tabs[1].label).toBe('Want to Read');
    expect(component.tabs[2].label).toBe('Currently Reading');
    expect(component.tabs[3].label).toBe('Finished');
  });

  it('should default to All tab (null)', () => {
    expect(component.activeTab()).toBeNull();
  });

  describe('getCount', () => {
    it('should return total for null status', () => {
      expect(component.getCount(null)).toBe(3);
    });

    it('should return wantToRead count', () => {
      expect(component.getCount(ReadingStatus.WantToRead)).toBe(1);
    });

    it('should return currentlyReading count', () => {
      expect(component.getCount(ReadingStatus.CurrentlyReading)).toBe(1);
    });

    it('should return finished count', () => {
      expect(component.getCount(ReadingStatus.Finished)).toBe(1);
    });
  });

  describe('getFilteredBooks', () => {
    it('should return all books when activeTab is null', () => {
      component.activeTab.set(null);
      expect(component.getFilteredBooks()).toEqual(mockBooks);
    });

    it('should return wantToRead books', () => {
      component.activeTab.set(ReadingStatus.WantToRead);
      const result = component.getFilteredBooks();
      expect(result!.length).toBe(1);
      expect(result![0].title).toBe('Book A');
    });

    it('should return currentlyReading books', () => {
      component.activeTab.set(ReadingStatus.CurrentlyReading);
      const result = component.getFilteredBooks();
      expect(result!.length).toBe(1);
      expect(result![0].title).toBe('Book B');
    });

    it('should return finished books', () => {
      component.activeTab.set(ReadingStatus.Finished);
      const result = component.getFilteredBooks();
      expect(result!.length).toBe(1);
      expect(result![0].title).toBe('Book C');
    });
  });
});
