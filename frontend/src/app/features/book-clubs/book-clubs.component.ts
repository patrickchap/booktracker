import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookClubService } from '../../core/services/book-club.service';
import { AuthService } from '../../core/services/auth.service';
import { ClubCardComponent } from '../../shared/components/club-card/club-card.component';
import { BookClub } from '../../core/models/book-club.model';

type Tab = 'mine' | 'public';

@Component({
  selector: 'app-book-clubs',
  standalone: true,
  imports: [CommonModule, RouterLink, ClubCardComponent],
  templateUrl: './book-clubs.component.html'
})
export class BookClubsComponent implements OnInit {
  bookClubService = inject(BookClubService);
  private authService = inject(AuthService);
  activeTab = signal<Tab>('mine');
  publicTabLoaded = false;

  isOwner(club: BookClub): boolean {
    const user = this.authService.user();
    return !!user && club.createdByUserId === user.id;
  }

  async ngOnInit(): Promise<void> {
    await this.bookClubService.loadMyClubs();
  }

  async switchTab(tab: Tab): Promise<void> {
    this.activeTab.set(tab);
    if (tab === 'public' && !this.publicTabLoaded) {
      try {
        await this.bookClubService.loadPublicClubs();
        this.publicTabLoaded = true;
      } catch {
        // leave publicTabLoaded false so next switch attempt retries
      }
    }
  }
}
