import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookClubService } from '../../core/services/book-club.service';
import { BookClub, UserSearchResult } from '../../core/models/book-club.model';

@Component({
  selector: 'app-create-club',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-club.component.html'
})
export class CreateClubComponent implements OnDestroy {
  private bookClubService = inject(BookClubService);
  private router = inject(Router);

  name = '';
  privacy: 'Public' | 'Private' = 'Public';
  searchQuery = '';
  invitedUsers = signal<UserSearchResult[]>([]);
  searchResults = signal<UserSearchResult[]>([]);
  isSearching = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  showDropdown = signal(false);

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = null;
    }
  }

  onSearchInput(): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      this.showDropdown.set(false);
      return;
    }
    this.searchDebounce = setTimeout(() => this.runSearch(), 300);
  }

  private async runSearch(): Promise<void> {
    this.isSearching.set(true);
    try {
      const results = await this.bookClubService.searchUsers(this.searchQuery);
      const invitedIds = this.invitedUsers().map(u => u.id);
      this.searchResults.set(results.filter(r => !invitedIds.includes(r.id)));
      this.showDropdown.set(true);
    } catch {
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  addUser(user: UserSearchResult): void {
    this.invitedUsers.update(list => [...list, user]);
    this.searchQuery = '';
    this.searchResults.set([]);
    this.showDropdown.set(false);
  }

  removeUser(userId: string): void {
    this.invitedUsers.update(list => list.filter(u => u.id !== userId));
  }

  closeDropdown(): void {
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  get canSubmit(): boolean {
    return this.name.trim().length > 0 && !this.isSubmitting();
  }

  async submit(): Promise<void> {
    if (!this.canSubmit) return;
    this.isSubmitting.set(true);
    this.error.set(null);
    let club: BookClub;
    try {
      club = await this.bookClubService.createClub({
        name: this.name.trim(),
        privacy: this.privacy,
        invitedUserIds: this.invitedUsers().map(u => u.id)
      });
    } catch {
      this.error.set('Failed to create club. Please try again.');
      this.isSubmitting.set(false);
      return;
    }
    await this.router.navigate(['/clubs', club.id]);
    this.isSubmitting.set(false);
  }
}
