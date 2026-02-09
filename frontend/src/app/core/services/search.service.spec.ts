import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SearchService } from './search.service';
import { environment } from '../../../environments/environment';
import { SearchResponse } from '../models/book.model';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SearchService,
      ],
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchBooks', () => {
    it('should make a GET request with correct params', async () => {
      const mockResponse: SearchResponse = {
        items: [{ googleBooksId: '1', title: 'Angular', authors: ['Author'] }],
        totalItems: 1,
      };

      const promise = service.searchBooks('Angular');
      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/search` &&
          r.params.get('q') === 'Angular' &&
          r.params.get('startIndex') === '0' &&
          r.params.get('maxResults') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
      await promise;

      expect(service.searchResults()).toEqual(mockResponse);
      expect(service.query()).toBe('Angular');
    });

    it('should pass custom startIndex and maxResults', async () => {
      const promise = service.searchBooks('test', 10, 5);
      const req = httpMock.expectOne(
        r => r.params.get('startIndex') === '10' &&
          r.params.get('maxResults') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ items: [], totalItems: 0 });
      await promise;
    });

    it('should set loading to true during request and false after', async () => {
      expect(service.isLoading()).toBe(false);

      const promise = service.searchBooks('Angular');
      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/search`);
      req.flush({ items: [], totalItems: 0 });
      await promise;

      expect(service.isLoading()).toBe(false);
    });

    it('should clear results when query is empty', async () => {
      await service.searchBooks('');

      expect(service.searchResults()).toEqual({ items: [], totalItems: 0 });
      expect(service.query()).toBe('');
    });

    it('should clear results when query is only whitespace', async () => {
      await service.searchBooks('   ');

      expect(service.searchResults()).toEqual({ items: [], totalItems: 0 });
      expect(service.query()).toBe('');
    });

    it('should handle HTTP errors and reset results', async () => {
      spyOn(console, 'error');

      const promise = service.searchBooks('Angular');
      const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/search`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      await promise;

      expect(service.searchResults()).toEqual({ items: [], totalItems: 0 });
      expect(service.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getBookDetails', () => {
    it('should fetch book details by googleBooksId', async () => {
      const mockDetails = {
        googleBooksId: 'abc123',
        title: 'Test Book',
        authors: ['Author'],
        description: 'A test book',
        pageCount: 200,
      };

      const promise = service.getBookDetails('abc123');
      const req = httpMock.expectOne(`${environment.apiUrl}/books/abc123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);

      const result = await promise;
      expect(result).toEqual(mockDetails);
    });

    it('should return null on HTTP error', async () => {
      spyOn(console, 'error');

      const promise = service.getBookDetails('abc123');
      const req = httpMock.expectOne(`${environment.apiUrl}/books/abc123`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      const result = await promise;
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearResults', () => {
    it('should reset results and query', async () => {
      // First populate with a search
      const promise = service.searchBooks('Angular');
      const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/search`);
      req.flush({
        items: [{ googleBooksId: '1', title: 'Angular', authors: ['Author'] }],
        totalItems: 1,
      });
      await promise;

      expect(service.searchResults().totalItems).toBe(1);
      expect(service.query()).toBe('Angular');

      service.clearResults();

      expect(service.searchResults()).toEqual({ items: [], totalItems: 0 });
      expect(service.query()).toBe('');
    });
  });
});
