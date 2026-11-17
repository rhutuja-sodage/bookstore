import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService, WishlistService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { IconComponent } from './icon.component';

/** Reusable top navigation bar: compact, near-black, hamburger on mobile. */
@Component({
  selector: 'bw-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly open = signal(false);
  protected readonly firstName = computed(() => this.auth.user()?.name.split(' ')[0] ?? '');

  protected readonly links = [
    { label: 'My Orders', path: '/orders' },
    { label: 'My Wishlist', path: '/wishlist' },
    { label: 'My Writers', path: '/writers' },
  ];

  constructor() {
    this.router.events.subscribe(() => this.open.set(false));
  }
}
