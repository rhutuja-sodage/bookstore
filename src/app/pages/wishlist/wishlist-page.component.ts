import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, WishlistService } from '../../core/cart.service';
import { BookCardComponent } from '../../shared/book-card.component';

@Component({
  selector: 'bw-wishlist',
  imports: [RouterLink, BookCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist-page.component.html',
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistService);
  protected readonly cart = inject(CartService);
}
