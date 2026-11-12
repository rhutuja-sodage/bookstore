import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService, WishlistService } from '../../core/cart.service';
import { OrderService } from '../../core/order.service';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { priceCart } from '../../core/pricing';
import { BookCardComponent } from '../../shared/book-card.component';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { QtyStepperComponent } from '../../shared/qty-stepper.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';
import { IconComponent } from '../../shared/icon.component';
import { Book } from '../../core/models';

@Component({
  selector: 'bw-cart',
  imports: [RouterLink, BookCoverComponent, BookCardComponent, QtyStepperComponent, DeliveryPipe, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1400px] p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb"><a routerLink="/" class="link">Home</a> / Cart</nav>
      <h1 class="mb-4 text-lg font-semibold">Shopping Cart <span class="text-sm font-normal text-muted">({{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }})</span></h1>

      @if (cart.items().length) {
        <div class="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
          <ul class="panel divide-y divide-line" data-testid="cart-items">
            @for (i of cart.items(); track i.book.id) {
              <li class="flex gap-3 p-3 text-xs sm:gap-4 sm:p-4">
                <a [routerLink]="['/book', i.book.id]" class="block w-20 shrink-0 self-start sm:w-24" [attr.aria-label]="'View ' + i.book.title">
                  <bw-book-cover [book]="i.book" />
                </a>
                <div class="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 class="text-sm font-medium"><a [routerLink]="['/book', i.book.id]" class="hover:underline">{{ i.book.title }}</a></h2>
                  <p class="text-[#c6c6c6]">by <a routerLink="/writers" [queryParams]="{ name: i.book.author }" class="link">{{ i.book.author }}</a></p>
                  <p class="line-clamp-2 text-[11px] text-[#c6c6c6]">{{ i.book.description }}</p>
                  <p class="text-[#c6c6c6]">{{ i.book.format }}</p>
                  <p class="text-[11px] text-[#c6c6c6]">Delivery by <strong class="text-white">{{ i.book | delivery }}</strong></p>
                  <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <bw-qty-stepper [value]="i.qty" (changed)="cart.setQty(i.book.id, $event)" />
                    <button type="button" class="inline-flex items-center gap-1 text-link hover:underline" (click)="cart.remove(i.book.id)"
                            [attr.aria-label]="'Remove ' + i.book.title"><bw-icon name="trash" [size]="13" /> Remove</button>
                    <button type="button" class="text-link hover:underline" (click)="moveToWishlist(i.book)">Save for later</button>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold">{{ i.book.price * i.qty | inr }}</p>
                  @if (i.qty > 1) {<p class="text-[11px] text-muted">{{ i.book.price | inr }} each</p>}
                </div>
              </li>
            }
          </ul>

          <aside class="panel p-4 lg:sticky lg:top-14" aria-label="Order summary">
            <h2 class="mb-3 text-sm font-semibold">Order Summary</h2>
            <dl class="space-y-1.5 text-xs">
              <div class="flex justify-between"><dt>Subtotal ({{ pricing().itemCount }} items)</dt><dd data-testid="cart-subtotal">{{ pricing().subtotal | inr }}</dd></div>
              <div class="flex justify-between"><dt>Discount</dt><dd>-{{ pricing().productDiscount | inr }}</dd></div>
              <div class="flex justify-between"><dt>Tax</dt><dd>{{ pricing().tax | inr }}</dd></div>
              <div class="flex justify-between"><dt>Delivery</dt><dd class="text-ok">Free</dd></div>
            </dl>
            <div class="mt-3 flex justify-between border-t border-line pt-3 text-sm font-semibold"><span>Grand Total</span><span data-testid="cart-total">{{ pricing().total | inr }}</span></div>
            <button type="button" class="btn-primary mt-4 w-full" (click)="checkout()" data-testid="checkout">Proceed to Checkout</button>
            <a routerLink="/" class="btn-ghost mt-2 w-full">Continue Shopping</a>
          </aside>
        </div>
      } @else {
        <div class="panel grid place-items-center gap-3 p-10 text-center" data-testid="empty-cart">
          <bw-icon name="cart" [size]="36" />
          <p class="text-sm">Your cart is empty.</p>
          <a routerLink="/" class="btn-primary">Browse books</a>
        </div>
      }

      @if (suggestions().length) {
        <section class="mt-8" aria-labelledby="sug">
          <h2 id="sug" class="mb-3 text-sm font-semibold">{{ auth.isLoggedIn() && orders.boughtBooks().length ? 'Recommended based on your order history' : 'You might also like' }}</h2>
          <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            @for (b of suggestions(); track b.id) {
              <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="cart.add($event)" (wishlist)="wishlist.toggle($event)" />
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly orders = inject(OrderService);
  protected readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  protected readonly pricing = computed(() => priceCart(this.cart.items()));

  protected readonly suggestions = computed<Book[]>(() => {
    const inCart = new Set(this.cart.items().map((i) => i.book.id));
    const fromHistory = this.orders.recommendations().filter((b) => !inCart.has(b.id));
    const fromCart = this.cart.items().flatMap((i) => this.catalog.related(i.book, 3)).filter((b) => !inCart.has(b.id));
    const merged = [...fromHistory, ...fromCart, ...this.catalog.bestsellers(6)];
    return merged.filter((b, idx) => !inCart.has(b.id) && merged.indexOf(b) === idx).slice(0, 3);
  });

  protected moveToWishlist(book: Book): void {
    if (!this.wishlist.has(book.id)) this.wishlist.toggle(book);
    this.cart.remove(book.id);
  }

  protected checkout(): void {
    this.router.navigateByUrl(this.auth.isLoggedIn() ? '/checkout' : '/login?returnUrl=/checkout');
  }
}
