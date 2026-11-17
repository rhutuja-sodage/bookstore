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
  templateUrl: './cart-page.component.html',
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
