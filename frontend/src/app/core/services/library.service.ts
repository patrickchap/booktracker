import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserBook, ReadingStatus, AddBookRequest, UpdateBookRequest } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private http = inject(HttpClient);

  private books = signal<UserBook[]>([]);
  private loading = signal<boolean>(false);

  readonly library = this.books.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  readonly wantToRead = computed(() =>
    this.books().filter(b => b.status === ReadingStatus.WantToRead)
  );

  readonly currentlyReading = computed(() =>
    this.books().filter(b => b.status === ReadingStatus.CurrentlyReading)
  );

  readonly finished = computed(() =>
    this.books().filter(b => b.status === ReadingStatus.Finished)
  );

  readonly stats = computed(() => ({
    total: this.books().length,
    wantToRead: this.wantToRead().length,
    currentlyReading: this.currentlyReading().length,
    finished: this.finished().length
  }));

  async loadLibrary(status?: ReadingStatus): Promise<void> {
    this.loading.set(true);

    try {
      let params = new HttpParams();
      if (status !== undefined) {
        params = params.set('status', status.toString());
      }

      const response = await this.http.get<UserBook[]>(
        `${environment.apiUrl}/library`,
        { params }
      ).toPromise();

      if (response) {
        this.books.set(response);
      }
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async addBook(request: AddBookRequest): Promise<UserBook | null> {
    try {
      const response = await this.http.post<UserBook>(
        `${environment.apiUrl}/library`,
        request
      ).toPromise();

      if (response) {
        this.books.update(books => [...books, response]);
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to add book:', error);
      return null;
    }
  }

  async updateBook(bookId: string, request: UpdateBookRequest): Promise<UserBook | null> {
    try {
      const response = await this.http.put<UserBook>(
        `${environment.apiUrl}/library/${bookId}`,
        request
      ).toPromise();

      if (response) {
        this.books.update(books =>
          books.map(b => b.id === bookId ? response : b)
        );
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to update book:', error);
      return null;
    }
  }

  async removeBook(bookId: string): Promise<boolean> {
    try {
      await this.http.delete(
        `${environment.apiUrl}/library/${bookId}`
      ).toPromise();

      this.books.update(books => books.filter(b => b.id !== bookId));
      return true;
    } catch (error) {
      console.error('Failed to remove book:', error);
      return false;
    }
  }

  async checkInLibrary(googleBooksId: string): Promise<boolean> {
    try {
      const response = await this.http.get<{ inLibrary: boolean }>(
        `${environment.apiUrl}/library/check/${googleBooksId}`
      ).toPromise();
      return response?.inLibrary || false;
    } catch {
      return false;
    }
  }

  getBookById(bookId: string): UserBook | undefined {
    return this.books().find(b => b.id === bookId);
  }
}
