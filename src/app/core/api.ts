import { HttpErrorResponse } from '@angular/common/http';

/** Relative so it works behind the dev-server proxy (proxy.conf.json) and behind a reverse proxy in production. */
export const API_BASE = '/api';
export const TOKEN_KEY = 'token';

/** A user friendly message for a failed API call. */
export function apiError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'Cannot reach the server. Please check that the API is running and try again.';
    const detail = e.error?.detail;
    if (typeof detail === 'string') return detail;
    if (e.status === 422) return 'Some of the details are not valid. Please review them and try again.';
  }
  return fallback;
}
