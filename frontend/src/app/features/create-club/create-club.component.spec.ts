import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CreateClubComponent } from './create-club.component';
import { BookClubService } from '../../core/services/book-club.service';
import { BookClub } from '../../core/models/book-club.model';

describe('CreateClubComponent', () => {
  let component: CreateClubComponent;
  let fixture: ComponentFixture<CreateClubComponent>;
  let mockBookClubService: jasmine.SpyObj<BookClubService>;

  beforeEach(async () => {
    mockBookClubService = jasmine.createSpyObj('BookClubService', ['createClub', 'searchUsers']);

    await TestBed.configureTestingModule({
      imports: [CreateClubComponent],
      providers: [
        provideRouter([]),
        { provide: BookClubService, useValue: mockBookClubService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchUsers after debounce and update searchResults', fakeAsync(async () => {
    const mockUsers = [{ id: '1', displayName: 'Alice', email: 'alice@test.com', avatarUrl: undefined }];
    mockBookClubService.searchUsers.and.resolveTo(mockUsers);

    component.searchQuery = 'alice';
    component.onSearchInput();
    tick(300);
    await fixture.whenStable();

    expect(mockBookClubService.searchUsers).toHaveBeenCalledWith('alice');
    expect(component.searchResults()).toEqual(mockUsers);
  }));

  it('should call createClub with form data and navigate on successful submit', async () => {
    const mockClub: BookClub = {
      id: 'club-1', name: 'My Club', description: null, coverImageUrl: null,
      privacy: 'Public', memberCount: 1, currentBook: null, createdByUserId: 'user-1',
    };
    mockBookClubService.createClub.and.resolveTo(mockClub);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    component.name = 'My Club';
    await component.submit();

    expect(mockBookClubService.createClub).toHaveBeenCalledWith({
      name: 'My Club',
      privacy: 'Public',
      invitedUserIds: [],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'club-1']);
  });
});
