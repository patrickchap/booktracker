import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'library',
        loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'clubs',
        loadComponent: () => import('./features/book-clubs/book-clubs.component').then(m => m.BookClubsComponent)
      },
      {
        path: 'book/:id',
        loadComponent: () => import('./features/book-details/book-details.component').then(m => m.BookDetailsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'library' }
];
