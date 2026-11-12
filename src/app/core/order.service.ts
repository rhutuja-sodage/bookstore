import { Injectable, computed, inject, signal } from '@angular/core';
import { Address, Book, CartItem, Order, PaymentInfo, PriceBreakdown, Review } from './models';
import { BOOKS } from './catalog.data';
import { AuthService } from './auth.service';
import { HOURS_48_MS, deliveryFromNow, generateOrderNumber, store, uid } from './utils';
import { giftPointsEarned } from './pricing';

const ORDERS_KEY = 'orders';
const REVIEWS_KEY = 'reviews';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly auth = inject(AuthService);
  private readonly all = signal<Order[]>(store.read<Order[]>(ORDERS_KEY, []));

  /** Orders of the logged-in user, newest first */
  readonly orders = computed(() => {
    const email = this.auth.user()?.email;
    return this.all()
      .filter((o) => o.userEmail === email)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  });

  /** Distinct books the user has bought before (non-cancelled orders) */
  readonly boughtBooks = computed<Book[]>(() => {
    const seen = new Set<string>();
    const result: Book[] = [];
    for (const order of this.orders()) {
      if (order.status === 'Cancelled') continue;
      for (const line of order.lines) {
        const book = BOOKS.find((b) => b.id === line.bookId);
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
   * Falls back to the highest rated books for users with no history.
   */
  readonly recommendations = computed<Book[]>(() => {
    const bought = this.boughtBooks();
    const boughtIds = new Set(bought.map((b) => b.id));
    if (!bought.length) return [];
    const categories = new Set(bought.map((b) => b.category));
    const authors = new Set(bought.map((b) => b.author));
    const genres = new Set(bought.flatMap((b) => b.genres));
    return BOOKS.filter((b) => !boughtIds.has(b.id))
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

  /** Total of previous, non-cancelled orders of this user */
  previousOrdersTotal(): number {
    return this.orders()
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.pricing.total, 0);
  }

  place(items: CartItem[], address: Address, payment: PaymentInfo, pricing: PriceBreakdown): Order {
    const user = this.auth.user();
    if (!user) throw new Error('Not logged in');

    const placed = new Date();
    const farthest = Math.max(...items.map((i) => i.book.deliveryDays));
    const pointsEarned = giftPointsEarned(pricing.total, this.previousOrdersTotal());

    const order: Order = {
      id: uid('ord'),
      number: generateOrderNumber(placed),
      userEmail: user.email,
      placedAt: placed.toISOString(),
      deliveryDate: deliveryFromNow(farthest).toISOString(),
      lines: items.map(({ book, qty }) => ({
        bookId: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        format: book.format,
        genres: book.genres,
        price: book.price,
        qty,
        deliveryDate: deliveryFromNow(book.deliveryDays).toISOString(),
      })),
      address,
      payment,
      pricing,
      pointsEarned,
      status: 'Placed',
    };

    this.persist([...this.all(), order]);
    this.auth.adjustPoints(pointsEarned - pricing.pointsUsed);
    return order;
  }

  byNumber(number: string): Order | undefined {
    return this.orders().find((o) => o.number === number);
  }

  /** Cancellation is only allowed within 48 hours of placing the order */
  canCancel(order: Order, now = Date.now()): boolean {
    return order.status === 'Placed' && now - new Date(order.placedAt).getTime() <= HOURS_48_MS;
  }

  hoursLeftToCancel(order: Order, now = Date.now()): number {
    const left = HOURS_48_MS - (now - new Date(order.placedAt).getTime());
    return Math.max(0, Math.ceil(left / 3_600_000));
  }

  cancel(number: string): { ok: boolean; error?: string } {
    const order = this.byNumber(number);
    if (!order) return { ok: false, error: 'Order not found.' };
    if (order.status === 'Cancelled') return { ok: false, error: 'Order is already cancelled.' };
    if (!this.canCancel(order)) {
      return { ok: false, error: 'Orders can only be cancelled within 48 hours of payment.' };
    }
    this.persist(
      this.all().map((o) =>
        o.id === order.id ? { ...o, status: 'Cancelled', cancelledAt: new Date().toISOString() } : o,
      ),
    );
    // Reverse the gift-point movements of this order
    this.auth.adjustPoints(order.pricing.pointsUsed - order.pointsEarned);
    return { ok: true };
  }

  private persist(list: Order[]): void {
    this.all.set(list);
    store.write(ORDERS_KEY, list);
  }
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly all = signal<Review[]>(store.read<Review[]>(REVIEWS_KEY, []));

  private readonly seeded: Review[] = [
    {
      id: 'seed-r1', bookId: 'joy-of-minimalism', author: 'John Smith', rating: 5, date: '2026-06-28',
      text: 'The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion.',
    },
  ];

  forBook(bookId: string): Review[] {
    return [...this.all().filter((r) => r.bookId === bookId), ...this.seeded.filter((r) => r.bookId === bookId)];
  }

  add(bookId: string, author: string, rating: number, text: string): void {
    const review: Review = { id: uid('rev'), bookId, author, rating, text, date: new Date().toISOString() };
    this.all.update((l) => [review, ...l]);
    store.write(REVIEWS_KEY, this.all());
  }

  readonly version = this.all;
}
