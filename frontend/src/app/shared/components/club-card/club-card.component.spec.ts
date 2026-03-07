import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
});
