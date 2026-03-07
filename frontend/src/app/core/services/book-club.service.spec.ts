import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookClubService } from './book-club.service';
import { environment } from '../../../environments/environment';
import { BookClub } from '../models/book-club.model';

describe('BookClubService', () => {
  let service: BookClubService;
  let httpMock: HttpTestingController;

  const mockClub: BookClub = {
    id: '1',
    name: 'Test Club',
    description: null,
    coverImageUrl: null,
    privacy: 'Public',
    memberCount: 5,
    currentBook: null,
    createdByUserId: 'user-1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BookClubService,
      ],
    });

    service = TestBed.inject(BookClubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadMyClubs', () => {
    it('loadMyClubs_SetsMyClubsSignal', async () => {
      const promise = service.loadMyClubs();
      const req = httpMock.expectOne(`${environment.apiUrl}/clubs/mine`);
      expect(req.request.method).toBe('GET');
      req.flush([mockClub]);
      await promise;

      expect(service.myClubs()).toEqual([mockClub]);
    });

    it('loadMyClubs_SetsLoadingMine_DuringRequest', async () => {
      expect(service.isLoadingMine()).toBe(false);

      const promise = service.loadMyClubs();
      expect(service.isLoadingMine()).toBe(true);

      const req = httpMock.expectOne(`${environment.apiUrl}/clubs/mine`);
      req.flush([]);
      await promise;

      expect(service.isLoadingMine()).toBe(false);
    });
  });

  describe('deleteClub', () => {
    it('deleteClub_RemovesClubFromMyClubs', async () => {
      const promise = service.loadMyClubs();
      httpMock.expectOne(`${environment.apiUrl}/clubs/mine`).flush([mockClub]);
      await promise;

      const deletePromise = service.deleteClub('1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/1`).flush(null, { status: 204, statusText: 'No Content' });
      await deletePromise;

      expect(service.myClubs()).toEqual([]);
    });
  });

  describe('loadPublicClubs', () => {
    it('loadPublicClubs_SetsPublicClubsSignal', async () => {
      const promise = service.loadPublicClubs();
      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/clubs/public` &&
          r.params.get('page') === '1' &&
          r.params.get('pageSize') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockClub]);
      await promise;

      expect(service.publicClubs()).toEqual([mockClub]);
    });

    it('loadPublicClubs_UsesCustomPagination', async () => {
      const promise = service.loadPublicClubs(2, 5);
      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/clubs/public` &&
          r.params.get('page') === '2' &&
          r.params.get('pageSize') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
      await promise;
    });

    it('loadPublicClubs_SetsLoadingPublic_DuringRequest', async () => {
      expect(service.isLoadingPublic()).toBe(false);

      const promise = service.loadPublicClubs();
      expect(service.isLoadingPublic()).toBe(true);

      const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/clubs/public`);
      req.flush([]);
      await promise;

      expect(service.isLoadingPublic()).toBe(false);
    });
  });
});
