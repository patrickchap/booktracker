import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonBookCardComponent } from './skeleton-book-card.component';

describe('SkeletonBookCardComponent', () => {
  let component: SkeletonBookCardComponent;
  let fixture: ComponentFixture<SkeletonBookCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBookCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonBookCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the skeleton card with animate-pulse', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.animate-pulse');
    expect(card).toBeTruthy();
  });

  it('should render placeholder elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const placeholders = compiled.querySelectorAll('.bg-gray-200');
    expect(placeholders.length).toBeGreaterThan(0);
  });
});
