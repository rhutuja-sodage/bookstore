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
  template: `
    <header class="sticky top-0 z-50 border-b border-[#262626] bg-nav text-xs">
      <nav class="mx-auto flex h-11 max-w-[1400px] items-center gap-3 px-3 sm:px-4" aria-label="Main navigation">
        <button type="button" class="md:hidden text-white" (click)="open.set(!open())" [attr.aria-expanded]="open()"
                aria-label="Toggle menu">
          <bw-icon [name]="open() ? 'close' : 'menu'" [size]="18" />
        </button>

        <a routerLink="/" class="flex items-center gap-2 text-white" aria-label="Book Worm home">
          <span class="grid h-6 w-6 place-items-center rounded-sm bg-brand"><bw-icon name="logo" [size]="16" /></span>
          <span class="font-semibold tracking-wide">Book Worm</span>
        </a>

        <span class="mx-1 hidden h-4 w-px bg-[#525252] md:block"></span>

        <ul class="hidden items-center gap-1 md:flex">
          @for (l of links; track l.path) {
            <li>
              <a [routerLink]="l.path" routerLinkActive="text-white border-brand" #rla="routerLinkActive"
                 class="inline-block border-b-2 border-transparent px-2.5 py-3 text-[#c6c6c6] transition-colors hover:text-white"
                 [attr.aria-current]="rla.isActive ? 'page' : null">{{ l.label }}</a>
            </li>
          }
        </ul>

        <div class="ml-auto flex items-center gap-4">
          <a routerLink="/cart" class="relative text-[#e0e0e0] transition-colors hover:text-white" aria-label="Shopping cart"
             routerLinkActive="text-white">
            <bw-icon name="cart" [size]="18" />
            @if (cart.count() > 0) {
              <span class="absolute -top-2 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
                    data-testid="cart-count">{{ cart.count() }}</span>
            }
          </a>
          <a [routerLink]="auth.isLoggedIn() ? '/profile' : '/login'" class="flex items-center gap-1.5 text-[#e0e0e0] hover:text-white"
             [attr.aria-label]="auth.isLoggedIn() ? 'My profile' : 'Log in'" routerLinkActive="text-white">
            <bw-icon name="user" [size]="18" />
            @if (firstName()) {
              <span class="hidden max-w-24 truncate lg:inline">{{ firstName() }}</span>
            }
          </a>
        </div>
      </nav>

      @if (open()) {
        <ul class="border-t border-[#262626] bg-nav px-3 py-1 md:hidden">
          @for (l of links; track l.path) {
            <li>
              <a [routerLink]="l.path" routerLinkActive="text-white border-brand" (click)="open.set(false)"
                 class="block border-l-2 border-transparent px-3 py-2.5 text-[#c6c6c6] hover:bg-[#161616] hover:text-white">{{ l.label }}</a>
            </li>
          }
        </ul>
      }
    </header>
  `,
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
