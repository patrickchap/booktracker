import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SearchResponse, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  private results = signal<SearchResponse>({ items: [], totalItems: 0 });
  private loading = signal<boolean>(false);
  private currentQuery = signal<string>('');

  readonly searchResults = this.results.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly query = this.currentQuery.asReadonly();

  async searchBooks(query: string, startIndex: number = 0, maxResults: number = 20): Promise<void> {
    if (!query.trim()) {
      this.clearResults();
      return;
    }

    this.loading.set(true);
    this.currentQuery.set(query);

    try {
      const params = new HttpParams()
        .set('q', query)
        .set('startIndex', startIndex.toString())
        .set('maxResults', maxResults.toString());

      const response = await firstValueFrom(this.http.get<SearchResponse>(
        `${environment.apiUrl}/search`,
        { params }
      ));

      if (response) {
        this.results.set(response);
      }
    } catch (error) {
      console.error('Search failed:', error);
      this.results.set({ items: [], totalItems: 0 });
    } finally {
      this.loading.set(false);
    }
  }

  async getBookDetails(googleBooksId: string): Promise<BookDetails | null> {
    try {
      const response = await firstValueFrom(this.http.get<BookDetails>(
        `${environment.apiUrl}/books/${googleBooksId}`
      ));
      return response || null;
    } catch (error) {
      console.error('Failed to get book details:', error);
      return null;
    }
  }

  clearResults(): void {
    this.results.set({ items: [], totalItems: 0 });
    this.currentQuery.set('');
  }
}
