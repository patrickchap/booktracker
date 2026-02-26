import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV_ITEMS, NavItem } from '../../navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside
      [class]="collapsed() ? 'w-16' : 'w-56'"
      class="hidden md:flex flex-col fixed left-0 top-16 bottom-0 bg-surface-elevated border-r border-white/[0.06] z-40 transition-all duration-300">

      <!-- Toggle button -->
      <button (click)="collapsedChange.emit(!collapsed())"
              [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
              [attr.aria-expanded]="!collapsed()"
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
             [title]="item.label"
             [attr.aria-label]="collapsed() ? item.label : null">
            <lucide-icon [img]="item.icon" class="w-5 h-5 flex-shrink-0" aria-hidden="true"></lucide-icon>
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

  navItems: NavItem[] = NAV_ITEMS;
}
