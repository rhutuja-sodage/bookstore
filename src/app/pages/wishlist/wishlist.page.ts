import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, WishlistService } from '../../core/cart.service';
import { BookCardComponent } from '../../shared/book-card.component';

@Component({
  selector: 'bw-wishlist',
  imports: [RouterLink, BookCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1100px] p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb"><a routerLink="/" class="link">Home</a> / My Wishlist</nav>
      <h1 class="mb-4 text-lg font-semibold">My Wishlist <span class="text-sm font-normal text-muted">({{ wishlist.count() }})</span></h1>

      @if (wishlist.books().length) {
        <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="wishlist-items">
          @for (b of wishlist.books(); track b.id) {
            <bw-book-card [book]="b" [wished]="true" (addToCart)="cart.add($event)" (wishlist)="wishlist.toggle($event)" />
          }
        </div>
      } @else {
        <div class="panel grid place-items-center gap-3 p-10 text-center text-sm">
          <p>Your wishlist is empty. Tap the heart on any book to save it here.</p>
          <a routerLink="/" class="btn-primary">Browse books</a>
        </div>
      }
    </div>
  `,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistService);
  protected readonly cart = inject(CartService);
}
