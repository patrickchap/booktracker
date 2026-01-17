import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="animate-spin rounded-full border-t-2 border-b-2 border-primary-600"
           [class]="sizeClass">
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullScreen = false;

  get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'h-6 w-6';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-10 w-10';
    }
  }

  get containerClass(): string {
    return this.fullScreen ? 'min-h-screen' : 'py-8';
  }
}
