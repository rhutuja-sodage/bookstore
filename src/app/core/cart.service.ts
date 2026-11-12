import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Book, CartItem, CartLine } from './models';
import { BOOKS } from './catalog.data';
import { store } from './utils';
import { ToastService } from './toast.service';

const CART_KEY = 'cart';
const WISHLIST_KEY = 'wishlist';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly toast = inject(ToastService);
  private readonly lines = signal<CartLine[]>(store.read<CartLine[]>(CART_KEY, []));

  readonly items = computed<CartItem[]>(() =>
    this.lines()
      .map((l) => ({ book: BOOKS.find((b) => b.id === l.bookId), qty: l.qty }))
      .filter((i): i is CartItem => !!i.book),
  );
  readonly count = computed(() => this.lines().reduce((n, l) => n + l.qty, 0));

  constructor() {
    effect(() => store.write(CART_KEY, this.lines()));
  }

  add(book: Book, qty = 1, silent = false): void {
    this.lines.update((ls) => {
      const found = ls.find((l) => l.bookId === book.id);
      return found
        ? ls.map((l) => (l.bookId === book.id ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
        : [...ls, { bookId: book.id, qty }];
    });
    if (!silent) this.toast.show(`“${book.title}” added to your cart`);
  }

  setQty(bookId: string, qty: number): void {
    if (qty < 1) return this.remove(bookId);
    this.lines.update((ls) => ls.map((l) => (l.bookId === bookId ? { ...l, qty: Math.min(10, qty) } : l)));
  }

  remove(bookId: string): void {
    this.lines.update((ls) => ls.filter((l) => l.bookId !== bookId));
  }

  has(bookId: string): boolean {
    return this.lines().some((l) => l.bookId === bookId);
  }

  clear(): void {
    this.lines.set([]);
  }
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly toast = inject(ToastService);
  readonly ids = signal<string[]>(store.read<string[]>(WISHLIST_KEY, []));
  readonly books = computed(() =>
    this.ids().map((id) => BOOKS.find((b) => b.id === id)).filter((b): b is Book => !!b),
  );
  readonly count = computed(() => this.ids().length);

  constructor() {
    effect(() => store.write(WISHLIST_KEY, this.ids()));
  }

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  toggle(book: Book): void {
    if (this.has(book.id)) {
      this.ids.update((l) => l.filter((x) => x !== book.id));
      this.toast.show(`Removed “${book.title}” from wishlist`, 'info');
    } else {
      this.ids.update((l) => [...l, book.id]);
      this.toast.show(`“${book.title}” added to wishlist`);
    }
  }

  remove(id: string): void {
    this.ids.update((l) => l.filter((x) => x !== id));
  }
}
