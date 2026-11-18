import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book, Coupon, Writer } from './models';
import { PRICE_RANGES } from './catalog.data';
import { API_BASE } from './api';

export interface BookFilters {
  query: string;
  category: string;
  language: string;
  format: string;
  price: string;
  sort: string;
  /** Publisher / brand */
  brand: string;
}

export const DEFAULT_FILTERS: BookFilters = {
  query: '',
  category: 'All',
  language: 'All',
  format: 'All',
  price: 'All Prices',
  sort: 'Relevance',
  brand: 'All',
};

/** Pure function - every filter is AND-ed together. Exported for unit tests. */
export function filterBooks(books: Book[], f: BookFilters): Book[] {
  const q = f.query.trim().toLowerCase();
  const range = PRICE_RANGES.find((r) => r.label === f.price) ?? PRICE_RANGES[0];
  const mainLanguages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Malayalam', 'Bengali'];

  const result = books.filter((b) => {
    if (q) {
      const haystack = [b.title, b.author, b.publisher, b.category, ...b.genres].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.category !== 'All' && b.category !== f.category) return false;
    if (f.language === 'Other') {
      if (mainLanguages.includes(b.language)) return false;
    } else if (f.language !== 'All' && b.language !== f.language) return false;
    if (f.format !== 'All' && b.format !== f.format) return false;
    if (f.brand !== 'All' && b.publisher !== f.brand) return false;
    if (b.price < range.min || b.price > range.max) return false;
    return true;
  });

  const sorted = [...result];
  switch (f.sort) {
    case 'Popularity':
      sorted.sort((a, b) => b.sold - a.sold);
      break;
    case 'Price: Low to High':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'Price: High to Low':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'Newest First':
      sorted.sort((a, b) => b.published.localeCompare(a.published));
      break;
    case 'Highest Rated':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
  }
  return sorted;
}

/**
 * The catalog (books, writers, coupons) is loaded once from the API at app start.
 * Search / filter / sort then run in the browser so the page reacts instantly while typing.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly books = signal<Book[]>([]);
  readonly writers = signal<Writer[]>([]);
  readonly coupons = signal<Coupon[]>([]);
  readonly loading = signal(false);
  readonly loadFailed = signal(false);
  readonly filters = signal<BookFilters>({ ...DEFAULT_FILTERS });

  readonly results = computed(() => filterBooks(this.books(), this.filters()));
  readonly isFiltering = computed(() => {
    const f = this.filters();
    return (
      f.query.trim() !== '' || f.category !== 'All' || f.language !== 'All' || f.format !== 'All' ||
      f.price !== 'All Prices' || f.brand !== 'All'
    );
  });
  readonly brands = computed(() => ['All', ...Array.from(new Set(this.books().map((b) => b.publisher))).sort()]);

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadFailed.set(false);
    try {
      const [books, writers, coupons] = await Promise.all([
        firstValueFrom(this.http.get<Book[]>(`${API_BASE}/books`, { params: { limit: 500 } })),
        firstValueFrom(this.http.get<Writer[]>(`${API_BASE}/writers`)),
        firstValueFrom(this.http.get<Coupon[]>(`${API_BASE}/coupons`)),
      ]);
      this.books.set(books);
      this.writers.set(writers);
      this.coupons.set(coupons);
    } catch {
      this.loadFailed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  patch(p: Partial<BookFilters>): void {
    this.filters.update((f) => ({ ...f, ...p }));
  }

  reset(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  byId(id: string): Book | undefined {
    return this.books().find((b) => b.id === id);
  }

  related(book: Book, limit = 3): Book[] {
    return this.books()
      .filter((b) => b.id !== book.id)
      .map((b) => ({
        b,
        score:
          (b.category === book.category ? 3 : 0) +
          (b.author === book.author ? 2 : 0) +
          b.genres.filter((g) => book.genres.includes(g)).length,
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.b.rating - a.b.rating)
      .slice(0, limit)
      .map((x) => x.b);
  }

  bestsellers(limit = 3): Book[] {
    return [...this.books()].sort((a, b) => b.sold - a.sold).slice(0, limit);
  }

  newLaunches(limit = 3): Book[] {
    return [...this.books()].sort((a, b) => b.published.localeCompare(a.published)).slice(0, limit);
  }
}
