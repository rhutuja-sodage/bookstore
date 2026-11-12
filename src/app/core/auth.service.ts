import { Injectable, computed, signal } from '@angular/core';
import { Address, Order, User } from './models';
import { store } from './utils';
import { deliveryFromNow, generateOrderNumber } from './utils';
import { priceCart } from './pricing';
import { BOOKS } from './catalog.data';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const ORDERS_KEY = 'orders';

export const DEMO_USER: User = {
  name: 'Demo Reader',
  email: 'demo@bookworm.com',
  password: 'Demo@123',
  giftPoints: 120,
  address: {
    firstName: 'Demo',
    lastName: 'Reader',
    line1: '12, Lotus Apartments, MG Road',
    email: 'demo@bookworm.com',
    city: 'Pune',
    pin: '411001',
    countryCode: '+91',
    phone: '9876543210',
    state: 'Maharashtra',
    country: 'India',
  },
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = signal<User[]>(this.loadUsers());
  private readonly sessionEmail = signal<string | null>(store.read<string | null>(SESSION_KEY, null));

  readonly user = computed(() => this.users().find((u) => u.email === this.sessionEmail()) ?? null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  private loadUsers(): User[] {
    const saved = store.read<User[]>(USERS_KEY, []);
    if (!saved.some((u) => u.email === DEMO_USER.email)) {
      saved.unshift({ ...DEMO_USER });
      store.write(USERS_KEY, saved);
      this.seedDemoOrder();
    }
    return saved;
  }

  /** Gives the demo account an older order so "Buy Again" and recommendations have data. */
  private seedDemoOrder(): void {
    const book = BOOKS.find((b) => b.id === 'art-of-focus');
    if (!book || !DEMO_USER.address) return;
    const placed = new Date();
    placed.setDate(placed.getDate() - 20);
    const pricing = priceCart([{ book, qty: 1 }]);
    const order: Order = {
      id: 'seed-1',
      number: generateOrderNumber(placed),
      userEmail: DEMO_USER.email,
      placedAt: placed.toISOString(),
      deliveryDate: deliveryFromNow(-15).toISOString(),
      lines: [
        {
          bookId: book.id, title: book.title, author: book.author, description: book.description,
          format: book.format, genres: book.genres, price: book.price, qty: 1,
          deliveryDate: deliveryFromNow(-15).toISOString(),
        },
      ],
      address: DEMO_USER.address,
      payment: { mode: 'UPI', detail: 'demo@upi' },
      pricing,
      pointsEarned: 0,
      status: 'Placed',
    };
    const orders = store.read<Order[]>(ORDERS_KEY, []);
    orders.push(order);
    store.write(ORDERS_KEY, orders);
  }

  login(email: string, password: string): { ok: boolean; error?: string } {
    const found = this.users().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.password !== password) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    this.sessionEmail.set(found.email);
    store.write(SESSION_KEY, found.email);
    return { ok: true };
  }

  register(name: string, email: string, password: string): { ok: boolean; error?: string } {
    const clean = email.trim().toLowerCase();
    if (this.users().some((u) => u.email.toLowerCase() === clean)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const user: User = { name: name.trim(), email: clean, password, giftPoints: 0 };
    this.persistUsers([...this.users(), user]);
    this.sessionEmail.set(user.email);
    store.write(SESSION_KEY, user.email);
    return { ok: true };
  }

  logout(): void {
    this.sessionEmail.set(null);
    store.remove(SESSION_KEY);
  }

  saveAddress(address: Address): void {
    this.updateUser((u) => ({ ...u, address }));
  }

  adjustPoints(delta: number): void {
    this.updateUser((u) => ({ ...u, giftPoints: Math.max(0, u.giftPoints + delta) }));
  }

  private updateUser(fn: (u: User) => User): void {
    const current = this.user();
    if (!current) return;
    this.persistUsers(this.users().map((u) => (u.email === current.email ? fn(u) : u)));
  }

  private persistUsers(list: User[]): void {
    this.users.set(list);
    store.write(USERS_KEY, list);
  }
}
