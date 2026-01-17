import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/library" class="flex items-center">
              <svg class="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">BookTracker</span>
            </a>
          </div>

          <div class="flex items-center space-x-4">
            <a routerLink="/search"
               routerLinkActive="text-primary-600"
               class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
              Search
            </a>
            <a routerLink="/library"
               routerLinkActive="text-primary-600"
               class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium">
              My Library
            </a>

            @if (authService.user(); as user) {
              <div class="flex items-center space-x-3">
                @if (user.avatarUrl) {
                  <img [src]="user.avatarUrl" [alt]="user.displayName" class="w-8 h-8 rounded-full">
                } @else {
                  <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {{ user.displayName.charAt(0).toUpperCase() }}
                  </div>
                }
                <button (click)="logout()"
                        class="text-gray-600 dark:text-gray-300 hover:text-red-600 text-sm font-medium">
                  Logout
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
