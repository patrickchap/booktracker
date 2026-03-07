import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BottomTabsComponent } from './bottom-tabs.component';

describe('BottomTabsComponent', () => {
  let component: BottomTabsComponent;
  let fixture: ComponentFixture<BottomTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomTabsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
