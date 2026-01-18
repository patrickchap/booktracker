import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUser = signal<User | null>(null);
  private accessToken = signal<string | null>(null);
  private tokenExpiresAt = signal<Date | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly token = this.accessToken.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      // User exists, try to refresh token to get a new access token
      this.currentUser.set(JSON.parse(storedUser));
      this.refreshAuthToken().then(success => {
        if (!success) {
          this.clearAuthData();
        }
      });
    }
  }

  initGoogleSignIn(): void {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.setupGoogleSignIn();
      document.head.appendChild(script);
    } else {
      this.setupGoogleSignIn();
    }
  }

  private setupGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleCallback(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large', width: 300 }
    );
  }

  private async handleGoogleCallback(response: any): Promise<void> {
    try {
      const authResponse = await this.http.post<AuthResponse>(
        `${environment.apiUrl}/auth/google`,
        { idToken: response.credential },
        { withCredentials: true }
      ).toPromise();

      if (authResponse) {
        this.setAuthData(authResponse);
        this.router.navigate(['/library']);
      }
    } catch (error) {
      console.error('Google auth failed:', error);
    }
  }

  private setAuthData(authResponse: AuthResponse): void {
    this.currentUser.set(authResponse.user);
    this.accessToken.set(authResponse.accessToken);
    this.tokenExpiresAt.set(new Date(authResponse.expiresAt));

    // Only store user in localStorage - access token stays in memory only
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }

  async refreshAuthToken(): Promise<boolean> {
    try {
      const authResponse = await this.http.post<AuthResponse>(
        `${environment.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      ).toPromise();

      if (authResponse) {
        this.setAuthData(authResponse);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post(
        `${environment.apiUrl}/auth/logout`,
        {},
        { withCredentials: true }
      ).toPromise();
    } catch {
      // Ignore logout API errors
    }

    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private clearAuthData(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    this.tokenExpiresAt.set(null);
    localStorage.removeItem('user');
  }
}
