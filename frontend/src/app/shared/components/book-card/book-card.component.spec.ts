import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookCardComponent } from './book-card.component';
import { ReadingStatus } from '../../../core/models/book.model';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;
    component.googleBooksId = 'test-id';
    component.title = 'Test Book';
    component.authors = ['Author One'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the book title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Book');
  });

  it('should display authors', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Author One');
  });

  it('should display cover image when provided', () => {
    component.coverImageUrl = 'https://example.com/cover.jpg';
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('example.com/cover.jpg');
  });

  it('should show placeholder when no cover image', () => {
    component.coverImageUrl = undefined;
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeFalsy();
  });

  it('should show View Details link by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('View Details');
  });

  it('should hide View Details when showViewDetails is false', () => {
    component.showViewDetails = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('View Details');
  });

  it('should show Add to Library button when showAddToLibrary is true', () => {
    component.showAddToLibrary = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Add to Library');
  });

  it('should hide Add to Library button by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Add to Library');
  });

  it('should emit addToLibrary event when Add to Library is clicked', () => {
    component.showAddToLibrary = true;
    fixture.detectChanges();
    spyOn(component.addToLibrary, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.addToLibrary.emit).toHaveBeenCalled();
  });

  describe('getStatusLabel', () => {
    it('should return "Want to Read" for WantToRead status', () => {
      component.status = ReadingStatus.WantToRead;
      expect(component.getStatusLabel()).toBe('Want to Read');
    });

    it('should return "Currently Reading" for CurrentlyReading status', () => {
      component.status = ReadingStatus.CurrentlyReading;
      expect(component.getStatusLabel()).toBe('Currently Reading');
    });

    it('should return "Finished" for Finished status', () => {
      component.status = ReadingStatus.Finished;
      expect(component.getStatusLabel()).toBe('Finished');
    });

    it('should return empty string for undefined status', () => {
      component.status = undefined;
      expect(component.getStatusLabel()).toBe('');
    });
  });

  describe('getStatusClass', () => {
    it('should return blue classes for WantToRead', () => {
      component.status = ReadingStatus.WantToRead;
      expect(component.getStatusClass()).toContain('bg-blue-50');
    });

    it('should return amber classes for CurrentlyReading', () => {
      component.status = ReadingStatus.CurrentlyReading;
      expect(component.getStatusClass()).toContain('bg-amber-50');
    });

    it('should return green classes for Finished', () => {
      component.status = ReadingStatus.Finished;
      expect(component.getStatusClass()).toContain('bg-green-50');
    });
  });

  describe('getCardBorderClass', () => {
    it('should return ring classes for CurrentlyReading', () => {
      component.status = ReadingStatus.CurrentlyReading;
      expect(component.getCardBorderClass()).toContain('ring-2');
    });

    it('should return empty string for other statuses', () => {
      component.status = ReadingStatus.Finished;
      expect(component.getCardBorderClass()).toBe('');
    });
  });
});
