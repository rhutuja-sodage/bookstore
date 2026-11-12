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
  template: `
    <div class="mx-auto flex max-w-[1400px] flex-col md:flex-row">
      <!-- LEFT SIDEBAR: categories -->
      <aside class="shrink-0 border-b border-line md:sticky md:top-11 md:h-[calc(100vh-2.75rem)] md:w-44 md:overflow-y-auto md:border-r md:border-b-0 lg:w-52"
             aria-label="Book categories">
        <ul class="flex gap-1 overflow-x-auto p-2 md:block md:space-y-px md:p-0">
          @for (c of categories; track c) {
            <li class="shrink-0">
              <button type="button" (click)="catalog.patch({ category: c })"
                      class="w-full whitespace-nowrap px-3 py-2 text-left text-xs transition-colors md:py-1.5"
                      [class]="filters().category === c ? 'bg-brand font-medium text-white' : 'text-[#e0e0e0] hover:bg-[#2c2c2c]'"
                      [attr.aria-current]="filters().category === c ? 'true' : null">{{ c }}</button>
            </li>
          }
        </ul>
      </aside>

      <main class="min-w-0 flex-1 p-3 sm:p-4">
        <!-- SEARCH + FILTER TOOLBAR -->
        <form class="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-[2fr_repeat(5,1fr)]" role="search" (submit)="$event.preventDefault()">
          <div class="relative col-span-2 lg:col-span-1">
            <label for="q" class="sr-only">Search books</label>
            <input id="q" type="search" name="q" class="field !pr-16 !pl-3" placeholder="Search you want to read here"
                   [ngModel]="filters().query" (ngModelChange)="catalog.patch({ query: $event })" autocomplete="off" />
            @if (filters().query) {
              <button type="button" class="absolute top-1/2 right-8 -translate-y-1/2 text-muted hover:text-white"
                      (click)="catalog.patch({ query: '' })" aria-label="Clear search"><bw-icon name="close" [size]="14" /></button>
            }
            <span class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#c6c6c6]"><bw-icon name="search" [size]="15" /></span>
          </div>

          @for (s of selects(); track s.id) {
            <div>
              <label [for]="s.id" class="field-label !mb-0.5 !text-[10px] text-muted">{{ s.label }}</label>
              <select [id]="s.id" [name]="s.id" class="field cursor-pointer" [ngModel]="s.value" (ngModelChange)="catalog.patch(s.patch($event))">
                @for (o of s.options; track o) {<option [value]="o">{{ o }}</option>}
              </select>
            </div>
          }
        </form>

        @if (filters().category !== 'All' || catalog.isFiltering()) {
          <div class="mb-3 flex items-center justify-between text-xs text-[#c6c6c6]">
            <span>{{ results().length }} {{ results().length === 1 ? 'book' : 'books' }} found</span>
            <button type="button" class="link" (click)="catalog.reset()">Reset all filters</button>
          </div>
        }

        @if (showResults()) {
          @if (results().length) {
            <section aria-label="Search results">
              <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="results">
                @for (b of results(); track b.id) {
                  <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="add($event)" (wishlist)="wishlist.toggle($event)" />
                }
              </div>
            </section>
          } @else {
            <div class="panel p-8 text-center text-sm text-[#c6c6c6]" data-testid="no-results">
              <p>No books match your search and filters.</p>
              <button type="button" class="btn-primary btn-sm mt-3" (click)="catalog.reset()">Clear filters</button>
            </div>
          }
        } @else {
          @if (buyAgain().length) {
            <section class="mb-7">
              <h2 class="mb-3 text-sm font-semibold">Buy Again</h2>
              <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                @for (b of buyAgain(); track b.id) {
                  <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="add($event)" (wishlist)="wishlist.toggle($event)" />
                }
              </div>
            </section>
          }
          @for (s of sections(); track s.title) {
            <section class="mb-7">
              <h2 class="mb-3 text-sm font-semibold">{{ s.title }}</h2>
              <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                @for (b of s.books; track b.id) {
                  <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="add($event)" (wishlist)="wishlist.toggle($event)" />
                }
              </div>
            </section>
          }
        }
      </main>
    </div>
  `,
})
export class HomePage {
  protected readonly catalog = inject(CatalogService);
  protected readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);

  protected readonly categories = CATEGORIES;
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
      { id: 'brand', label: 'Brand (Publisher)', value: f.brand, options: this.catalog.brands, patch: (v: string) => ({ brand: v }) },
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
