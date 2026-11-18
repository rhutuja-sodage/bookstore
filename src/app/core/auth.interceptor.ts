import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE, TOKEN_KEY } from './api';
import { AuthService } from './auth.service';
import { store } from './utils';

/** Adds the bearer token to API calls and signs the user out when the server says the token is no longer valid. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const token = store.read<string | null>(TOKEN_KEY, null);
  const isApi = req.url.startsWith(API_BASE);
  const authed = token && isApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((e: unknown) => {
      const isAuthCall = req.url.startsWith(`${API_BASE}/auth/`);
      if (e instanceof HttpErrorResponse && e.status === 401 && token && isApi && !isAuthCall) {
        injector.get(AuthService).expire();
      }
      return throwError(() => e);
    }),
  );
};
