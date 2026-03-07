import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreateClubComponent } from './create-club.component';
import { BookClubService } from '../../core/services/book-club.service';

describe('CreateClubComponent', () => {
  let component: CreateClubComponent;
  let fixture: ComponentFixture<CreateClubComponent>;

  beforeEach(async () => {
    const mockBookClubService = jasmine.createSpyObj('BookClubService', ['createClub', 'searchUsers']);

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
});
