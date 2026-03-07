import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookClubService } from '../../core/services/book-club.service';
import { AuthService } from '../../core/services/auth.service';
import { BookClub } from '../../core/models/book-club.model';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './club-detail.component.html'
})
export class ClubDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookClubService = inject(BookClubService);
  private authService = inject(AuthService);

  club = signal<BookClub | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  deleting = signal(false);

  isOwner() {
    const c = this.club();
    const user = this.authService.user();
    return c && user && c.createdByUserId === user.id;
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Club not found.');
      this.loading.set(false);
      return;
    }
    try {
      const club = await this.bookClubService.getClub(id);
      this.club.set(club);
    } catch {
      this.error.set('Club not found.');
    } finally {
      this.loading.set(false);
    }
  }

  async onDelete() {
    const c = this.club();
    if (!c) return;
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    this.deleting.set(true);
    try {
      await this.bookClubService.deleteClub(c.id);
      this.router.navigate(['/clubs']);
    } catch {
      this.deleting.set(false);
    }
  }
}
