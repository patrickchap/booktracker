import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { signal, computed } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  function setup(isAuthenticated: boolean) {
    mockAuthService = jasmine.createSpyObj('AuthService', ['initGoogleSignIn'], {
      isAuthenticated: computed(() => isAuthenticated),
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  }

  it('should create', async () => {
    await setup(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to /library if already authenticated', async () => {
    await setup(true);
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/library']);
  });

  it('should not redirect if not authenticated', async () => {
    await setup(false);
    fixture.detectChanges();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should initialize Google Sign-In if not authenticated', async () => {
    await setup(false);
    fixture.detectChanges();
    expect(mockAuthService.initGoogleSignIn).toHaveBeenCalled();
  });

  it('should not initialize Google Sign-In if authenticated', async () => {
    await setup(true);
    fixture.detectChanges();
    expect(mockAuthService.initGoogleSignIn).not.toHaveBeenCalled();
  });

  it('should render the BookTracker heading', async () => {
    await setup(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('BookTracker');
  });

  it('should render the google-signin-button placeholder', async () => {
    await setup(false);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#google-signin-button');
    expect(el).toBeTruthy();
  });
});
