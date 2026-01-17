import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="max-w-md w-full">
        <div class="card text-center">
          <div class="mb-8">
            <svg class="w-16 h-16 mx-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">BookTracker</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Track your reading journey
            </p>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Sign in to start tracking your books, discover new reads, and keep a record of your reading progress.
            </p>

            <div id="google-signin-button" class="flex justify-center"></div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/library']);
      return;
    }

    this.authService.initGoogleSignIn();
  }
}
