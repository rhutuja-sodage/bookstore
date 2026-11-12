import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { CheckoutService } from './checkout.service';

/** Redirects guests to /login and returns them to the requested page afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const cartNotEmptyGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  const router = inject(Router);
  return cart.count() > 0 || router.createUrlTree(['/cart']);
};

/** Payment screen needs a saved delivery address from the previous step. */
export const addressGuard: CanActivateFn = () => {
  const checkout = inject(CheckoutService);
  const router = inject(Router);
  return !!checkout.address() || router.createUrlTree(['/checkout']);
};

/** Confirmation screen needs a chosen payment method. */
export const paymentGuard: CanActivateFn = () => {
  const checkout = inject(CheckoutService);
  const router = inject(Router);
  return !!checkout.payment() || router.createUrlTree(['/payment']);
};
