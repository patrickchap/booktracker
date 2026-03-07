import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html'
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  fullScreen = input(false);

  get sizeClass(): string {
    switch (this.size()) {
      case 'sm':
        return 'h-6 w-6';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-10 w-10';
    }
  }

  get containerClass(): string {
    return this.fullScreen() ? 'min-h-screen' : 'py-8';
  }
}
