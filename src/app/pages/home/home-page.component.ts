import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { CartService, WishlistService } from '../../core/cart.service';
import { OrderService } from '../../core/order.service';
import { AuthService } from '../../core/auth.service';
import { CATEGORIES, FEATURED, FORMATS, LANGUAGES, PRICE_RANGES, SORT_OPTIONS } from '../../core/catalog.data';
import { Book } from '../../core/models';
import { BookCardComponent } from '../../shared/book-card.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'bw-home',
  imports: [FormsModule, BookCardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.component.html',
})
export class HomePage {
  protected readonly catalog = inject(CatalogService);
  protected readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);

  protected readonly categories = CATEGORIES;
  protected readonly loading = this.catalog.loading;
  protected readonly loadFailed = this.catalog.loadFailed;
  protected readonly filters = this.catalog.filters;
  protected readonly results = this.catalog.results;

  protected readonly showResults = computed(
    () => this.catalog.isFiltering() || this.filters().sort !== 'Relevance',
  );

  protected readonly selects = computed(() => {
    const f = this.filters();
    return [
      { id: 'language', label: 'Language', value: f.language, options: LANGUAGES, patch: (v: string) => ({ language: v }) },
      { id: 'format', label: 'Format (Paperback, eBook etc)', value: f.format, options: FORMATS, patch: (v: string) => ({ format: v }) },
      { id: 'price', label: 'Price Range', value: f.price, options: PRICE_RANGES.map((r) => r.label), patch: (v: string) => ({ price: v }) },
      { id: 'brand', label: 'Brand (Publisher)', value: f.brand, options: this.catalog.brands(), patch: (v: string) => ({ brand: v }) },
      { id: 'sort', label: 'Sort by', value: f.sort, options: SORT_OPTIONS, patch: (v: string) => ({ sort: v }) },
    ];
  });

  /** Books from earlier orders, shown only to logged-in users with history */
  protected readonly buyAgain = computed(() => (this.auth.isLoggedIn() ? this.orders.boughtBooks().slice(0, 3) : []));

  /** Three sections; a book appears in only one of them. Personalised picks come first for users with order history. */
  protected readonly sections = computed(() => {
    const byIds = (ids: string[]) => ids.map((id) => this.catalog.byId(id)).filter((b): b is Book => !!b);
    const used = new Set<string>();
    const take = (preferred: Book[], fallback: Book[]): Book[] => {
      const picks: Book[] = [];
      for (const b of [...preferred, ...fallback]) {
        if (picks.length === 3) break;
        if (!used.has(b.id)) {
          used.add(b.id);
          picks.push(b);
        }
      }
      return picks;
    };
    const recommended = take(this.orders.recommendations(), byIds(FEATURED.recommended));
    const bestsellers = take(byIds(FEATURED.bestsellers), this.catalog.bestsellers(12));
    const launches = take(byIds(FEATURED.newLaunches), this.catalog.newLaunches(12));
    return [
      { title: 'Recommended for You', books: recommended },
      { title: 'Bestsellers this Month', books: bestsellers },
      { title: 'New Launches', books: launches },
    ];
  });

  protected add(book: Book): void {
    this.cart.add(book);
  }
}
