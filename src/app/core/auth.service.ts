import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Address, User } from './models';
import { API_BASE, TOKEN_KEY, apiError } from './api';
import { ToastService } from './toast.service';
import { store } from './utils';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

/** Session state. Accounts, passwords and gift points live on the server; only the JWT is kept in the browser. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly user = signal<User | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  /** Re-opens the session from a saved token (called once at app start). */
  async restore(): Promise<void> {
    if (!store.has(TOKEN_KEY)) return;
    await this.refresh();
  }

  /** Re-reads the profile, e.g. to pick up gift points after an order was placed or cancelled. */
  async refresh(): Promise<void> {
    try {
      this.user.set(await firstValueFrom(this.http.get<User>(`${API_BASE}/users/me`)));
    } catch {
      /* 401 is handled by the interceptor; other failures keep the current state */
    }
  }

  login(email: string, password: string): Promise<AuthResult> {
    return this.authenticate('login', { email: email.trim(), password });
  }

  register(name: string, email: string, password: string): Promise<AuthResult> {
    return this.authenticate('register', { name: name.trim(), email: email.trim(), password });
  }

  logout(): void {
    store.remove(TOKEN_KEY);
    this.user.set(null);
  }

  /** Called by the interceptor when the server rejects the saved token. */
  expire(): void {
    if (!this.isLoggedIn() && !store.has(TOKEN_KEY)) return;
    this.logout();
    this.toast.show('Your session has expired. Please log in again.', 'info');
  }

  async saveAddress(address: Address): Promise<void> {
    try {
      this.user.set(await firstValueFrom(this.http.put<User>(`${API_BASE}/users/me/address`, address)));
    } catch (e) {
      this.toast.error(apiError(e, 'Could not save your address.'));
    }
  }

  private async authenticate(path: 'login' | 'register', body: object): Promise<AuthResult> {
    try {
      const res = await firstValueFrom(this.http.post<TokenResponse>(`${API_BASE}/auth/${path}`, body));
      store.write(TOKEN_KEY, res.accessToken);
      this.user.set(res.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiError(e) };
    }
  }
}
