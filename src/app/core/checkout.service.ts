import { Injectable, computed, inject, signal } from '@angular/core';
import { Address, Coupon, PaymentInfo } from './models';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { CatalogService } from './catalog.service';
import { findCoupon, netAmount, priceCart } from './pricing';
import { store } from './utils';

const CHECKOUT_KEY = 'checkout';

interface CheckoutDraft {
  address: Address | null;
  couponCode: string | null;
  usePoints: boolean;
}

export const EMPTY_ADDRESS: Address = {
  firstName: '', lastName: '', line1: '', email: '', city: '', pin: '',
  countryCode: '+91', phone: '', state: '', country: 'India',
};

/** Holds the in-progress checkout (address, coupon, gift points) between the cart, payment and confirm pages. */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);

  private readonly draft = signal<CheckoutDraft>(
    store.read<CheckoutDraft>(CHECKOUT_KEY, { address: null, couponCode: null, usePoints: false }),
  );
  readonly payment = signal<PaymentInfo | null>(null);

  readonly address = computed(() => this.draft().address);
  readonly usePoints = computed(() => this.draft().usePoints);

  readonly coupon = computed<Coupon | null>(() => {
    const code = this.draft().couponCode;
    return code ? findCoupon(this.catalog.coupons(), code, netAmount(this.cart.items())).coupon : null;
  });

  readonly pointsBalance = computed(() => this.auth.user()?.giftPoints ?? 0);

  readonly pricing = computed(() =>
    priceCart(this.cart.items(), this.coupon(), this.usePoints() ? this.pointsBalance() : 0),
  );

  applyCoupon(code: string): string | null {
    const { coupon, error } = findCoupon(this.catalog.coupons(), code, netAmount(this.cart.items()));
    if (!coupon) return error;
    this.update({ couponCode: coupon.code });
    return null;
  }

  removeCoupon(): void {
    this.update({ couponCode: null });
  }

  setUsePoints(value: boolean): void {
    this.update({ usePoints: value });
  }

  setAddress(address: Address): void {
    this.update({ address });
  }

  /** Code of the applied coupon (sent to the server, which validates it again), or null. */
  couponCode(): string | null {
    return this.coupon()?.code ?? null;
  }

  reset(): void {
    this.payment.set(null);
    this.draft.set({ address: null, couponCode: null, usePoints: false });
    store.remove(CHECKOUT_KEY);
  }

  private update(patch: Partial<CheckoutDraft>): void {
    this.draft.update((d) => ({ ...d, ...patch }));
    store.write(CHECKOUT_KEY, this.draft());
  }
}
