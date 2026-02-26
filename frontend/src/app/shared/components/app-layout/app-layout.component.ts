import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BottomTabsComponent } from '../bottom-tabs/bottom-tabs.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BottomTabsComponent],
  template: `
    <app-navbar />
    <app-sidebar [collapsed]="sidebarCollapsed()" (collapsedChange)="onSidebarToggle($event)" />
    <app-bottom-tabs />

    <main
      [class]="sidebarCollapsed() ? 'md:pl-16' : 'md:pl-56'"
      class="pt-16 pb-16 md:pb-0 min-h-screen transition-all duration-300">
      <router-outlet />
    </main>
  `
})
export class AppLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);

  ngOnInit(): void {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      this.sidebarCollapsed.set(saved === 'true');
    }
  }

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }
}
