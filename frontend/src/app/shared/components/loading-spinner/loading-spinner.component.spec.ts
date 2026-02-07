import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to medium size', () => {
    expect(component.size).toBe('md');
    expect(component.sizeClass).toBe('h-10 w-10');
  });

  it('should return correct size class for sm', () => {
    component.size = 'sm';
    expect(component.sizeClass).toBe('h-6 w-6');
  });

  it('should return correct size class for lg', () => {
    component.size = 'lg';
    expect(component.sizeClass).toBe('h-16 w-16');
  });

  it('should default fullScreen to false', () => {
    expect(component.fullScreen).toBe(false);
    expect(component.containerClass).toBe('py-8');
  });

  it('should return min-h-screen container class when fullScreen is true', () => {
    component.fullScreen = true;
    expect(component.containerClass).toBe('min-h-screen');
  });

  it('should render the spinner element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });
});
