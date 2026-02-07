import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';
import { User } from '../../../core/models/user.model';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  const userSignal = signal<User | null>(null);

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      user: userSignal,
      isAuthenticated: signal(true),
    });

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the brand name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Book');
    expect(compiled.textContent).toContain('Tracker');
  });

  it('should render Search and My Library links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Search');
    expect(compiled.textContent).toContain('My Library');
  });

  it('should show logout button when user is present', () => {
    userSignal.set({ id: '1', email: 'test@test.com', displayName: 'Test User' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Logout');
  });

  it('should call authService.logout when logout is clicked', () => {
    userSignal.set({ id: '1', email: 'test@test.com', displayName: 'Test User' });
    fixture.detectChanges();
    const logoutButton = fixture.nativeElement.querySelector('button');
    logoutButton.click();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should display user avatar when avatarUrl is provided', () => {
    userSignal.set({ id: '1', email: 'test@test.com', displayName: 'Test User', avatarUrl: 'https://example.com/avatar.jpg' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('example.com/avatar.jpg');
  });

  it('should display initial when no avatarUrl', () => {
    userSignal.set({ id: '1', email: 'test@test.com', displayName: 'Test User' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('T');
  });
});
