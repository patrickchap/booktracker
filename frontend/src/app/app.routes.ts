import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'book/:id',
    loadComponent: () => import('./features/book-details/book-details.component').then(m => m.BookDetailsComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'library' }
];
