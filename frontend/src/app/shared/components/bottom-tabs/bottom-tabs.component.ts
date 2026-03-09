import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV_ITEMS, NavItem } from '../../navigation.config';

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './bottom-tabs.component.html'
})
export class BottomTabsComponent {
  navItems: NavItem[] = NAV_ITEMS;
}
