import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Address, Book, CartItem, Order, PaymentInfo, Review } from './models';
import { CatalogService } from './catalog.service';
import { AuthService } from './auth.service';
import { API_BASE, apiError } from './api';
import { HOURS_48_MS } from './utils';

/** Orders live on the server; this service keeps the logged-in user's copy and talks to /api/orders. */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly all = signal<Order[]>([]);

  /** False until the first load for the current user has finished (lets pages avoid a flash of "not found"). */
  readonly loaded = signal(false);

  /** Orders of the logged-in user, newest first */
  readonly orders = computed(() => [...this.all()].sort((a, b) => b.placedAt.localeCompare(a.placedAt)));

  /** Distinct books the user has bought before (non-cancelled orders) */
  readonly boughtBooks = computed<Book[]>(() => {
    const books = this.catalog.books();
    const seen = new Set<string>();
    const result: Book[] = [];
    for (const order of this.orders()) {
      if (order.status === 'Cancelled') continue;
      for (const line of order.lines) {
        const book = books.find((b) => b.id === line.bookId);
        if (book && !seen.has(book.id)) {
          seen.add(book.id);
          result.push(book);
        }
      }
    }
    return result;
  });

  /**
   * Recommendations based on order history: unbought books that share a
   * category / genre / author with something previously purchased.
   */
  readonly recommendations = computed<Book[]>(() => {
    const bought = this.boughtBooks();
    const boughtIds = new Set(bought.map((b) => b.id));
    if (!bought.length) return [];
    const categories = new Set(bought.map((b) => b.category));
    const authors = new Set(bought.map((b) => b.author));
    const genres = new Set(bought.flatMap((b) => b.genres));
    return this.catalog
      .books()
      .filter((b) => !boughtIds.has(b.id))
      .map((b) => ({
        book: b,
        score:
          (categories.has(b.category) ? 3 : 0) +
          (authors.has(b.author) ? 2 : 0) +
          b.genres.filter((g) => genres.has(g)).length +
          b.rating / 10,
      }))
      .filter((x) => x.score >= 1)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.book);
  });

  constructor() {
    // Load on login / session restore, clear on logout
    effect(() => {
      const email = this.auth.user()?.email;
      untracked(() => (email ? void this.load() : this.reset()));
    });
  }

  async load(): Promise<void> {
    try {
      this.all.set(await firstValueFrom(this.http.get<Order[]>(`${API_BASE}/orders`)));
    } catch {
      /* keep what we have; a 401 is handled by the interceptor */
    } finally {
      this.loaded.set(true);
    }
  }

  private reset(): void {
    this.all.set([]);
    this.loaded.set(false);
  }

  /** Total of previous, non-cancelled orders of this user */
  previousOrdersTotal(): number {
    return this.orders()
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.pricing.total, 0);
  }

  /**
   * Places the order. Only product ids + quantities, the address, the payment reference, the coupon code and the
   * "use gift points" flag are sent - the server prices the order itself. Rejects with a readable Error.
   */
  async place(
    items: CartItem[], address: Address, payment: PaymentInfo, couponCode: string | null, usePoints: boolean,
  ): Promise<Order> {
    try {
      const order = await firstValueFrom(
        this.http.post<Order>(`${API_BASE}/orders`, {
          items: items.map((i) => ({ bookId: i.book.id, qty: i.qty })),
          address, payment, couponCode, usePoints,
        }),
      );
      this.all.update((l) => [...l, order]);
      void this.auth.refresh(); // gift points changed
      return order;
    } catch (e) {
      throw new Error(apiError(e, 'We could not place your order. Please try again.'));
    }
  }

  byNumber(number: string): Order | undefined {
    return this.orders().find((o) => o.number === number);
  }

  /** Cancellation is only allowed within 48 hours of placing the order (the server enforces this too) */
  canCancel(order: Order, now = Date.now()): boolean {
    return order.status === 'Placed' && now - new Date(order.placedAt).getTime() <= HOURS_48_MS;
  }

  hoursLeftToCancel(order: Order, now = Date.now()): number {
    const left = HOURS_48_MS - (now - new Date(order.placedAt).getTime());
    return Math.max(0, Math.ceil(left / 3_600_000));
  }

  async cancel(number: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const updated = await firstValueFrom(this.http.post<Order>(`${API_BASE}/orders/${encodeURIComponent(number)}/cancel`, {}));
      this.all.update((l) => l.map((o) => (o.id === updated.id ? updated : o)));
      void this.auth.refresh(); // gift points were reversed
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiError(e, 'Could not cancel order.') };
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly cache = signal<Record<string, Review[]>>({});

  /** Reviews for a book, as loaded by `load()` (empty until then). */
  forBook(bookId: string): Review[] {
    return this.cache()[bookId] ?? [];
  }

  async load(bookId: string): Promise<void> {
    try {
      const list = await firstValueFrom(this.http.get<Review[]>(`${API_BASE}/books/${encodeURIComponent(bookId)}/reviews`));
      this.cache.update((c) => ({ ...c, [bookId]: list }));
    } catch {
      /* leave the list as it was */
    }
  }

  async add(bookId: string, rating: number, text: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const review = await firstValueFrom(this.http.post<Review>(`${API_BASE}/books/${encodeURIComponent(bookId)}/reviews`, { rating, text }));
      this.cache.update((c) => ({ ...c, [bookId]: [review, ...(c[bookId] ?? [])] }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiError(e, 'Could not post your review.') };
    }
  }
}
