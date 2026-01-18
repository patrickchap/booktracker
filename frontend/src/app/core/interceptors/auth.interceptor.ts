import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { from } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Only intercept requests to our API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Add credentials for cookie-based refresh token
  // Add Authorization header for access token
  const token = authService.token();
  let authReq = req.clone({
    withCredentials: true,
    ...(token && { setHeaders: { Authorization: `Bearer ${token}` } })
  });

  // Skip retry logic for auth endpoints
  if (req.url.includes('/auth/google') || req.url.includes('/auth/refresh')) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return from(authService.refreshAuthToken()).pipe(
          switchMap((success) => {
            if (success) {
              // Retry with new token
              const newToken = authService.token();
              const retryReq = req.clone({
                withCredentials: true,
                ...(newToken && { setHeaders: { Authorization: `Bearer ${newToken}` } })
              });
              return next(retryReq);
            }
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
