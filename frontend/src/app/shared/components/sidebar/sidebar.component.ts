import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SafeHtmlPipe],
  template: `
    <aside
      [class]="collapsed() ? 'w-16' : 'w-56'"
      class="hidden md:flex flex-col fixed left-0 top-16 bottom-0 bg-surface-elevated border-r border-white/[0.06] z-40 transition-all duration-300">

      <!-- Toggle button -->
      <button (click)="collapsedChange.emit(!collapsed())"
              class="flex items-center justify-center h-10 mx-2 mt-3 mb-1 rounded-lg text-ink-300 hover:text-ink-50 hover:bg-surface-overlay transition-colors duration-200">
        <svg class="w-5 h-5 transition-transform duration-300" [class.rotate-180]="collapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Nav items -->
      <nav class="flex-1 px-2 space-y-1">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="bg-gold-900/20 text-gold-400"
             [routerLinkActiveOptions]="{ exact: item.exact }"
             [class]="collapsed() ? 'justify-center px-0' : 'px-3'"
             class="flex items-center gap-3 py-2.5 rounded-lg text-ink-300 hover:text-ink-50 hover:bg-surface-overlay transition-colors duration-200"
             [title]="item.label">
            <div [innerHTML]="item.icon | safeHtml" class="w-5 h-5 flex-shrink-0"></div>
            @if (!collapsed()) {
              <span class="text-sm font-medium truncate">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  collapsed = input(false);
  collapsedChange = output<boolean>();

  navItems = [
    {
      label: 'My Library',
      route: '/library',
      exact: false,
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>`
    },
    {
      label: 'Search',
      route: '/search',
      exact: false,
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>`
    },
    {
      label: 'Book Clubs',
      route: '/clubs',
      exact: false,
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>`
    }
  ];
}
