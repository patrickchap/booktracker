import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ClubDetailComponent } from './club-detail.component';
import { BookClubService } from '../../core/services/book-club.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';
import { BookClub } from '../../core/models/book-club.model';

describe('ClubDetailComponent', () => {
  let component: ClubDetailComponent;
  let fixture: ComponentFixture<ClubDetailComponent>;

  beforeEach(async () => {
    const mockBookClubService = jasmine.createSpyObj('BookClubService', ['getClub', 'deleteClub']);
    mockBookClubService.getClub.and.rejectWith(new Error('Not found'));

    const mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: signal(null),
    });

    await TestBed.configureTestingModule({
      imports: [ClubDetailComponent],
      providers: [
        provideRouter([]),
        { provide: BookClubService, useValue: mockBookClubService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when club loads successfully', () => {
    let successComponent: ClubDetailComponent;
    let successFixture: ComponentFixture<ClubDetailComponent>;

    const mockClub: BookClub = {
      id: 'club-1',
      name: 'Test Club',
      description: null,
      coverImageUrl: null,
      privacy: 'Public',
      memberCount: 3,
      currentBook: null,
      createdByUserId: 'user-1',
    };

    beforeEach(async () => {
      TestBed.resetTestingModule();
      const mockBookClubService = jasmine.createSpyObj('BookClubService', ['getClub', 'deleteClub']);
      mockBookClubService.getClub.and.resolveTo(mockClub);
      const mockAuthService = jasmine.createSpyObj('AuthService', [], { user: signal(null) });

      await TestBed.configureTestingModule({
        imports: [ClubDetailComponent],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'club-1' } } } },
          { provide: BookClubService, useValue: mockBookClubService },
          { provide: AuthService, useValue: mockAuthService },
        ],
      }).compileComponents();

      successFixture = TestBed.createComponent(ClubDetailComponent);
      successComponent = successFixture.componentInstance;
      successFixture.detectChanges();
      await successFixture.whenStable();
    });

    it('should set club signal and clear error on successful load', () => {
      expect(successComponent.club()).toEqual(mockClub);
      expect(successComponent.error()).toBeNull();
      expect(successComponent.loading()).toBe(false);
    });
  });
});
