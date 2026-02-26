import { Component } from '@angular/core';

@Component({
  selector: 'app-book-clubs',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold text-gold-50 tracking-tight">Book Clubs</h1>
        <p class="text-ink-300 mt-1">Connect with fellow readers</p>
      </div>

      <div class="text-center py-16 animate-fade-in">
        <div class="w-32 h-32 mx-auto bg-gradient-to-br from-gold-900/40 to-surface-elevated rounded-full flex items-center justify-center mb-6">
          <svg class="w-16 h-16 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-display font-semibold text-gold-50 mb-2">Coming Soon</h3>
        <p class="text-ink-300 max-w-sm mx-auto">
          Join book clubs, discuss your favorite reads, and discover new books with fellow readers.
        </p>
      </div>
    </div>
  `
})
export class BookClubsComponent {}
