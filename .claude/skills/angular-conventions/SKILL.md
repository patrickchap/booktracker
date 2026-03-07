# Angular Component Conventions

Apply these conventions whenever creating or modifying Angular components.

## 1. Three-File Rule

Every component requires exactly three files:
- `component-name.component.ts` — class and decorator
- `component-name.component.html` — template (via `templateUrl`)
- `component-name.component.spec.ts` — Jasmine/Karma tests

**Never** use inline `` template: `...` `` in the `@Component` decorator.

## 2. Signal-Based Inputs and Outputs

Always use the signals API. Never use `@Input()`, `@Output()`, or `EventEmitter`.

```typescript
import { Component, input, output, model } from '@angular/core';

// Required input (no default) — throws if parent omits it
title = input.required<string>();

// Optional input with default
size = input<'sm' | 'md' | 'lg'>('md');

// Output (replaces @Output() + EventEmitter)
addToLibrary = output<void>();

// Two-way bindable (replaces @Input + @Output pair)
value = model<string>('');
```

## 3. Template Access

Signal inputs must be called with `()` in templates and in TypeScript methods:

```html
<!-- Templates -->
{{ title() }}
@if (coverImageUrl()) { ... }
[src]="coverImageUrl()"
[disabled]="loading()"
(click)="addToLibrary.emit()"
```

```typescript
// TypeScript — call as function
getStatusLabel(): string {
  switch (this.status()) { ... }
}
```

## 4. Local State

```typescript
// Mutable local state
count = signal(0);

// Derived / computed values
doubled = computed(() => this.count() * 2);
```

## 5. Standalone Components

All components must be standalone. Always include `standalone: true` and declare all dependencies in `imports`.

## 6. Test Pattern

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [provideRouter([])],  // include if component uses RouterLink
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    // Set required signal inputs BEFORE detectChanges:
    fixture.componentRef.setInput('title', 'Test Value');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

Key rules:
- Use `fixture.componentRef.setInput('inputName', value)` to set signal inputs (not direct assignment)
- Provide `provideRouter([])` whenever the component or its children use `RouterLink`
- Mock injected services with `jasmine.createSpyObj`; provide signal properties via the third argument:
  ```typescript
  jasmine.createSpyObj('AuthService', ['logout'], {
    user: signal(null),
    isAuthenticated: signal(false),
  })
  ```
