import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { NAV_ITEMS, NavItem } from '../../navigation.config';

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SafeHtmlPipe],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-white/[0.06] z-50">
      <div class="flex justify-around items-center h-16">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="text-gold-400"
             [routerLinkActiveOptions]="{ exact: item.exact }"
             class="flex items-center justify-center flex-1 h-full text-ink-300 hover:text-ink-50 transition-colors duration-200"
             [title]="item.label"
             [attr.aria-label]="item.label">
            <div [innerHTML]="item.icon | safeHtml" class="w-6 h-6" aria-hidden="true"></div>
          </a>
        }
      </div>
    </nav>
  `
})
export class BottomTabsComponent {
  navItems: NavItem[] = NAV_ITEMS;
}
