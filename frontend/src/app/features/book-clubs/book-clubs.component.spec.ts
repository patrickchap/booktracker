import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookClubsComponent } from './book-clubs.component';
import { BookClubService } from '../../core/services/book-club.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { BookClub } from '../../core/models/book-club.model';

describe('BookClubsComponent', () => {
  let component: BookClubsComponent;
  let fixture: ComponentFixture<BookClubsComponent>;
  let mockBookClubService: jasmine.SpyObj<BookClubService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockClub: BookClub = {
    id: 'club-1',
    name: 'Test Club',
    description: null,
    coverImageUrl: null,
    privacy: 'Public',
    memberCount: 3,
    currentBook: null,
    createdByUserId: 'user-1'
  };

  beforeEach(async () => {
    mockBookClubService = jasmine.createSpyObj('BookClubService', ['loadMyClubs', 'loadPublicClubs', 'deleteClub'], {
      myClubs: signal([]),
      publicClubs: signal([]),
      isLoadingMine: signal(false),
      isLoadingPublic: signal(false),
    });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: signal({ id: 'user-1', email: 'test@example.com', displayName: 'Test', avatarUrl: null }),
    });

    mockBookClubService.loadMyClubs.and.resolveTo();
    mockBookClubService.loadPublicClubs.and.resolveTo();
    mockBookClubService.deleteClub.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [BookClubsComponent],
      providers: [
        provideRouter([]),
        { provide: BookClubService, useValue: mockBookClubService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookClubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_CallsLoadMyClubs', () => {
    expect(mockBookClubService.loadMyClubs).toHaveBeenCalled();
  });

  it('activeTab_DefaultsToMine', () => {
    expect(component.activeTab()).toBe('mine');
  });

  it('switchTab_ChangesActiveTab', async () => {
    await component.switchTab('public');
    expect(component.activeTab()).toBe('public');
  });

  it('switchToPublicTab_CallsLoadPublicClubs_OnFirstSwitch', async () => {
    await component.switchTab('public');
    expect(mockBookClubService.loadPublicClubs).toHaveBeenCalledTimes(1);
  });

  it('switchToPublicTab_DoesNotReloadOnSubsequentSwitches', async () => {
    await component.switchTab('public');
    await component.switchTab('mine');
    await component.switchTab('public');
    expect(mockBookClubService.loadPublicClubs).toHaveBeenCalledTimes(1);
  });

  it('isOwner_ReturnsTrueWhenCurrentUserIsCreator', () => {
    expect(component.isOwner(mockClub)).toBeTrue();
  });

  it('isOwner_ReturnsFalseWhenCurrentUserIsNotCreator', () => {
    const otherClub = { ...mockClub, createdByUserId: 'other-user' };
    expect(component.isOwner(otherClub)).toBeFalse();
  });
});
