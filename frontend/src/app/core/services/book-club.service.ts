import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookClub, CreateClubRequest, UserSearchResult } from '../models/book-club.model';

@Injectable({ providedIn: 'root' })
export class BookClubService {
  private http = inject(HttpClient);

  private myClubsSignal = signal<BookClub[]>([]);
  private publicClubsSignal = signal<BookClub[]>([]);
  private loadingMine = signal<boolean>(false);
  private loadingPublic = signal<boolean>(false);

  readonly myClubs = this.myClubsSignal.asReadonly();
  readonly publicClubs = this.publicClubsSignal.asReadonly();
  readonly isLoadingMine = this.loadingMine.asReadonly();
  readonly isLoadingPublic = this.loadingPublic.asReadonly();

  async loadMyClubs(): Promise<void> {
    this.loadingMine.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<BookClub[]>(`${environment.apiUrl}/clubs/mine`)
      );
      if (response) {
        this.myClubsSignal.set(response);
      }
    } catch (error) {
      console.error('Failed to load my clubs:', error);
    } finally {
      this.loadingMine.set(false);
    }
  }

  async loadPublicClubs(page = 1, pageSize = 20): Promise<void> {
    this.loadingPublic.set(true);
    try {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());
      const response = await firstValueFrom(
        this.http.get<BookClub[]>(`${environment.apiUrl}/clubs/public`, { params })
      );
      if (response) {
        this.publicClubsSignal.set(response);
      }
    } catch (error) {
      console.error('Failed to load public clubs:', error);
    } finally {
      this.loadingPublic.set(false);
    }
  }

  async createClub(request: CreateClubRequest): Promise<BookClub> {
    return firstValueFrom(
      this.http.post<BookClub>(`${environment.apiUrl}/clubs`, request)
    );
  }

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return firstValueFrom(
      this.http.get<UserSearchResult[]>(`${environment.apiUrl}/clubs/users/search`, { params })
    );
  }

  async getClub(id: string): Promise<BookClub> {
    return firstValueFrom(
      this.http.get<BookClub>(`${environment.apiUrl}/clubs/${id}`)
    );
  }

  async deleteClub(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${id}`)
    );
    this.myClubsSignal.update(clubs => clubs.filter(c => c.id !== id));
  }
}
