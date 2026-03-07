import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClubDetailComponent } from './club-detail.component';
import { BookClubService } from '../../core/services/book-club.service';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core';

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
});
