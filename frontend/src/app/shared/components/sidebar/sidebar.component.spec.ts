import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit collapsedChange with true when toggle is clicked and collapsed is false', () => {
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();

    let emitted: boolean | undefined;
    component.collapsedChange.subscribe((val: boolean) => emitted = val);

    const toggleBtn = fixture.debugElement.query(By.css('button'));
    toggleBtn.nativeElement.click();

    expect(emitted).toBe(true);
  });

  it('should emit collapsedChange with false when toggle is clicked and collapsed is true', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    let emitted: boolean | undefined;
    component.collapsedChange.subscribe((val: boolean) => emitted = val);

    const toggleBtn = fixture.debugElement.query(By.css('button'));
    toggleBtn.nativeElement.click();

    expect(emitted).toBe(false);
  });

  it('should apply w-16 class on aside when collapsed is true', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();
    const aside = fixture.debugElement.query(By.css('aside'));
    expect(aside.nativeElement.classList).toContain('w-16');
  });

  it('should apply w-56 class on aside when collapsed is false', () => {
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();
    const aside = fixture.debugElement.query(By.css('aside'));
    expect(aside.nativeElement.classList).toContain('w-56');
  });
});
