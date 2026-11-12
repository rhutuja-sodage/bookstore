import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOOKS, WRITERS } from '../../core/catalog.data';
import { CartService, WishlistService } from '../../core/cart.service';
import { BookCardComponent } from '../../shared/book-card.component';

@Component({
  selector: 'bw-writers',
  imports: [RouterLink, BookCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1100px] p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb"><a routerLink="/" class="link">Home</a> / My Writers</nav>
      <h1 class="mb-4 text-lg font-semibold">My Writers</h1>

      <div class="grid gap-6 md:grid-cols-[16rem_1fr]">
        <ul class="panel max-h-[70vh] divide-y divide-line self-start overflow-y-auto" aria-label="Writers">
          @for (w of writers; track w.slug) {
            <li>
              <a routerLink="/writers" [queryParams]="{ name: w.name }"
                 class="flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-[#2c2c2c]"
                 [class.bg-brand]="selected().name === w.name">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#393939] text-[11px] font-semibold">{{ initials(w.name) }}</span>
                <span class="min-w-0"><span class="block truncate font-medium">{{ w.name }}</span>
                  <span class="text-muted" [class.text-white]="selected().name === w.name">{{ count(w.name) }} {{ count(w.name) === 1 ? 'book' : 'books' }}</span></span>
              </a>
            </li>
          }
        </ul>

        <section aria-live="polite">
          @if (selected(); as w) {
            <div class="mb-5 flex gap-4 text-xs">
              <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#393939] text-xl font-semibold">{{ initials(w.name) }}</span>
              <div>
                <h2 class="text-base font-semibold">{{ w.name }}</h2>
                <p class="text-muted">{{ w.location }}</p>
                <p class="mt-2 leading-relaxed text-[#c6c6c6]">{{ w.bio }}</p>
              </div>
            </div>
            <h3 class="mb-3 text-sm font-semibold">Books by {{ w.name }}</h3>
            <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              @for (b of booksBy(); track b.id) {
                <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="cart.add($event)" (wishlist)="wishlist.toggle($event)" />
              }
            </div>
          } @else {
            <p class="panel p-8 text-center text-sm text-[#c6c6c6]">Select a writer to see their profile and books.</p>
          }
        </section>
      </div>
    </div>
  `,
})
export class WritersPage {
  /** bound from the ?name= query parameter */
  readonly name = input<string>();
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly writers = WRITERS;

  protected readonly selected = computed(() => WRITERS.find((w) => w.name === this.name()) ?? WRITERS[0]);
  protected readonly booksBy = computed(() => BOOKS.filter((b) => b.author === this.selected()?.name));

  protected count(name: string): number {
    return BOOKS.filter((b) => b.author === name).length;
  }

  protected initials(name: string): string {
    return name.split(' ').filter((p) => /^[A-Za-z]/.test(p) && !p.endsWith('.')).slice(0, 2).map((p) => p[0]).join('');
  }
}
