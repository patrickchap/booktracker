import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ClubCardComponent } from './club-card.component';

describe('ClubCardComponent', () => {
  let component: ClubCardComponent;
  let fixture: ComponentFixture<ClubCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'club-1');
    fixture.componentRef.setInput('name', 'Test Club');
    fixture.componentRef.setInput('privacy', 'Public');
    fixture.componentRef.setInput('memberCount', 5);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show delete button when showDelete is false', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeNull();
  });

  it('should show delete button when showDelete is true', () => {
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('should emit deleteClicked when delete button is clicked', () => {
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();

    let emitted = false;
    component.deleteClicked.subscribe(() => emitted = true);

    const btn = fixture.debugElement.query(By.css('button'));
    btn.nativeElement.click();

    expect(emitted).toBe(true);
  });

  it('should display Public privacy badge', () => {
    expect(fixture.nativeElement.textContent).toContain('Public');
  });

  it('should display Private privacy badge when privacy is Private', () => {
    fixture.componentRef.setInput('privacy', 'Private');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Private');
  });

  it('should display current book title when currentBook is provided', () => {
    fixture.componentRef.setInput('currentBook', { title: 'Dune', coverImageUrl: null, authors: ['Frank Herbert'] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dune');
  });

  it('should not render cover image when coverImageUrl is null', () => {
    const img = fixture.debugElement.query(By.css('.aspect-video img'));
    expect(img).toBeNull();
  });

  it('should render cover image when coverImageUrl is provided', () => {
    fixture.componentRef.setInput('coverImageUrl', 'https://example.com/cover.jpg');
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('.aspect-video img'));
    expect(img).toBeTruthy();
  });
});
