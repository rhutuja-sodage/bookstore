import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { AuthService } from '../../core/auth.service';
import { CheckoutService, EMPTY_ADDRESS } from '../../core/checkout.service';
import { COUPONS } from '../../core/pricing';
import { Address } from '../../core/models';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { QtyStepperComponent } from '../../shared/qty-stepper.component';
import { PriceRowsComponent } from '../../shared/price-rows.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';
import { IconComponent } from '../../shared/icon.component';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'United Arab Emirates'];
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

const noBlank = (c: AbstractControl): ValidationErrors | null =>
  typeof c.value === 'string' && c.value.length > 0 && c.value.trim().length === 0 ? { blank: true } : null;

@Component({
  selector: 'bw-checkout',
  imports: [ReactiveFormsModule, RouterLink, BookCoverComponent, QtyStepperComponent, PriceRowsComponent, DeliveryPipe, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1400px] p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb">
        <a routerLink="/" class="link">Home</a> / <a routerLink="/cart" class="link">Cart</a> / Checkout
      </nav>
      <h1 class="mb-3 text-lg font-semibold">Shopping Cart</h1>

      <!-- Cart items -->
      <section class="panel mb-5 p-3 sm:p-5" aria-label="Items in your cart">
        <ul class="grid gap-5 md:grid-cols-2" data-testid="checkout-items">
          @for (i of cart.items(); track i.book.id) {
            <li class="flex gap-3 text-xs sm:gap-4">
              <div class="w-24 shrink-0 self-start sm:w-32"><bw-book-cover [book]="i.book" /></div>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <h2 class="text-sm font-medium">{{ i.book.title }}</h2>
                <p class="text-[#c6c6c6]">by <span class="link">{{ i.book.author }}</span></p>
                <p class="line-clamp-2 text-[11px] text-[#c6c6c6]">{{ i.book.description }}</p>
                <p class="text-[#c6c6c6]">{{ i.book.format }}</p>
                <p class="text-[11px]"><span class="text-muted">{{ i.book.category }} · </span><span class="link">{{ i.book.genres.join(', ') }}</span></p>
                <p class="mt-1 text-base font-semibold">{{ i.book.price | inr }}</p>
                <p class="text-[11px] text-[#c6c6c6]">Delivery by <strong class="text-white">{{ i.book | delivery }}</strong></p>
                <bw-qty-stepper class="mt-1" [value]="i.qty" (changed)="cart.setQty(i.book.id, $event)" />
              </div>
            </li>
          }
        </ul>
      </section>

      <div class="grid items-start gap-5 lg:grid-cols-[1fr_22rem]">
        <!-- Address -->
        <section class="panel p-4 sm:p-5" aria-labelledby="addr-h">
          <h2 id="addr-h" class="mb-3 text-sm font-semibold">Address</h2>
          <label class="mb-4 inline-flex cursor-pointer items-center gap-2 text-xs" [class.opacity-50]="!savedAddress()">
            <input type="checkbox" class="h-3.5 w-3.5 accent-[#0f62fe]" [checked]="useSaved()" [disabled]="!savedAddress()" (change)="toggleSaved($any($event.target).checked)"
                   data-testid="use-saved" />
            Use Saved Address
            @if (!savedAddress()) {<span class="text-muted">(none saved yet)</span>}
          </label>

          <form [formGroup]="form" novalidate id="address-form" class="grid gap-x-4 gap-y-3.5 sm:grid-cols-6" (ngSubmit)="payNow()">
            <div class="sm:col-span-2">
              <label class="field-label" for="firstName">First Name</label>
              <input id="firstName" class="field" formControlName="firstName" placeholder="First Name" autocomplete="given-name" [class.invalid]="bad('firstName')" />
              @if (bad('firstName')) {<p class="field-error">{{ err('firstName') }}</p>}
            </div>
            <div class="sm:col-span-2">
              <label class="field-label" for="lastName">Last Name</label>
              <input id="lastName" class="field" formControlName="lastName" placeholder="Last Name" autocomplete="family-name" [class.invalid]="bad('lastName')" />
              @if (bad('lastName')) {<p class="field-error">{{ err('lastName') }}</p>}
            </div>
            <div class="sm:col-span-2">
              <label class="field-label" for="line1">Address</label>
              <input id="line1" class="field" formControlName="line1" placeholder="Address Line 2" autocomplete="street-address" [class.invalid]="bad('line1')" />
              @if (bad('line1')) {<p class="field-error">{{ err('line1') }}</p>}
            </div>

            <div class="sm:col-span-3">
              <label class="field-label" for="email">e-mail</label>
              <input id="email" type="email" class="field" formControlName="email" placeholder="e-mail" autocomplete="email" [class.invalid]="bad('email')" />
              @if (bad('email')) {<p class="field-error">{{ err('email') }}</p>}
            </div>
            <div class="sm:col-span-2">
              <label class="field-label" for="city">City</label>
              <input id="city" class="field" formControlName="city" placeholder="City" autocomplete="address-level2" [class.invalid]="bad('city')" />
              @if (bad('city')) {<p class="field-error">{{ err('city') }}</p>}
            </div>
            <div class="sm:col-span-1">
              <label class="field-label" for="pin">Pin</label>
              <input id="pin" class="field" formControlName="pin" placeholder="000000" inputmode="numeric" maxlength="6" autocomplete="postal-code" [class.invalid]="bad('pin')" />
              @if (bad('pin')) {<p class="field-error">{{ err('pin') }}</p>}
            </div>

            <div class="sm:col-span-3">
              <label class="field-label" for="phone">Phone Number</label>
              <div class="flex gap-2">
                <select class="field !w-20 shrink-0" formControlName="countryCode" aria-label="Country code">
                  @for (c of codes; track c) {<option [value]="c">{{ c }}</option>}
                </select>
                <input id="phone" class="field" formControlName="phone" placeholder="12345567890" inputmode="tel" maxlength="10" autocomplete="tel-national" [class.invalid]="bad('phone')" />
              </div>
              @if (bad('phone')) {<p class="field-error">{{ err('phone') }}</p>}
            </div>
            <div class="sm:col-span-2">
              <label class="field-label" for="state">State</label>
              <select id="state" class="field" formControlName="state" [class.invalid]="bad('state')">
                <option value="" disabled>State</option>
                @for (s of states; track s) {<option [value]="s">{{ s }}</option>}
              </select>
              @if (bad('state')) {<p class="field-error">{{ err('state') }}</p>}
            </div>
            <div class="sm:col-span-1">
              <label class="field-label" for="country">Country</label>
              <select id="country" class="field" formControlName="country" [class.invalid]="bad('country')">
                @for (c of countries; track c) {<option [value]="c">{{ c }}</option>}
              </select>
            </div>

            <label class="flex cursor-pointer items-center gap-2 text-xs sm:col-span-6">
              <input type="checkbox" class="h-3.5 w-3.5 accent-[#0f62fe]" formControlName="remember" />
              Save this address for next time
            </label>
          </form>
        </section>

        <!-- Grand total -->
        <aside class="panel p-4 sm:p-5 lg:sticky lg:top-14" aria-labelledby="gt-h">
          <div class="grid grid-cols-[6rem_1fr] gap-4">
            <div class="hidden self-stretch overflow-hidden bg-[#1b3d5f] sm:block" aria-hidden="true">
              <svg viewBox="0 0 100 160" class="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <rect width="100" height="160" fill="#1b4a7a" />
                <rect x="10" y="20" width="60" height="30" fill="#c8693a" transform="rotate(-12 40 35)" />
                <rect x="22" y="60" width="64" height="22" fill="#e3a72f" />
                <rect x="14" y="82" width="70" height="20" fill="#27628f" />
                <path d="M10 125l40-8 40 8-4 24-36-8-36 8z" fill="#e9dcc2" />
                <circle cx="80" cy="25" r="5" fill="#d6a243" />
              </svg>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <h2 id="gt-h" class="mb-3 text-sm font-semibold">Grand Total</h2>
              <bw-price-rows [pricing]="checkout.pricing()" />
            </div>
          </div>

          <!-- Coupon -->
          <div class="mt-3 border-t border-line pt-3">
            <label class="field-label" for="coupon">Apply Coupon</label>
            @if (checkout.coupon(); as c) {
              <div class="flex items-center justify-between bg-[#0e2b17] px-3 py-2 text-xs" data-testid="coupon-applied">
                <span><strong>{{ c.code }}</strong> applied – {{ c.description }}</span>
                <button type="button" class="link" (click)="removeCoupon()">Remove</button>
              </div>
            } @else {
              <div class="flex gap-2">
                <input id="coupon" class="field" [value]="couponInput()" (input)="couponInput.set($any($event.target).value)"
                       (keydown.enter)="applyCoupon($event)" placeholder="Apply Coupon" autocomplete="off" />
                <button type="button" class="btn-primary btn-sm shrink-0" (click)="applyCoupon()" data-testid="apply-coupon">Apply</button>
              </div>
              @if (couponError()) {<p class="field-error" role="alert">{{ couponError() }}</p>}
              <p class="mt-1.5 text-[10px] text-muted">Try: {{ couponHints }}</p>
            }
          </div>

          <!-- Gift points -->
          @if (auth.isLoggedIn()) {
            <label class="mt-3 flex cursor-pointer items-start gap-2 border-t border-line pt-3 text-xs" [class.opacity-50]="checkout.pointsBalance() === 0">
              <input type="checkbox" class="mt-0.5 h-3.5 w-3.5 accent-[#0f62fe]" [checked]="checkout.usePoints()" [disabled]="checkout.pointsBalance() === 0"
                     (change)="checkout.setUsePoints($any($event.target).checked)" data-testid="use-points" />
              <span>Use gift points <span class="text-muted">(balance: {{ checkout.pointsBalance() }} pts · 1 pt = ₹1)</span></span>
            </label>
          }

          <button type="submit" form="address-form" class="btn-primary mt-4 ml-auto flex min-w-28 justify-between" data-testid="pay-now">
            Pay Now <bw-icon name="card" [size]="14" />
          </button>
        </aside>
      </div>
    </div>
  `,
})
export class CheckoutPage {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  protected readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly states = STATES;
  protected readonly countries = COUNTRIES;
  protected readonly codes = ['+91', '+1', '+44', '+61', '+65', '+971'];
  protected readonly couponHints = COUPONS.map((c) => c.code).join(', ');

  protected readonly savedAddress = computed(() => this.auth.user()?.address ?? null);
  protected readonly useSaved = signal(false);
  protected readonly submitted = signal(false);
  protected readonly couponInput = signal('');
  protected readonly couponError = signal('');

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, noBlank, Validators.pattern(/^[A-Za-z][A-Za-z .'-]*$/), Validators.minLength(2)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, noBlank, Validators.pattern(/^[A-Za-z][A-Za-z .'-]*$/)] }),
    line1: new FormControl('', { nonNullable: true, validators: [Validators.required, noBlank, Validators.minLength(5)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required, noBlank, Validators.pattern(/^[A-Za-z][A-Za-z .'-]*$/)] }),
    pin: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)] }),
    countryCode: new FormControl('+91', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)] }),
    state: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl('India', { nonNullable: true, validators: [Validators.required] }),
    remember: new FormControl(false, { nonNullable: true }),
  });

  private static readonly MESSAGES: Record<string, Record<string, string>> = {
    firstName: { required: 'First name is required.', pattern: 'Use letters only.', minlength: 'Too short.', blank: 'First name is required.' },
    lastName: { required: 'Last name is required.', pattern: 'Use letters only.', blank: 'Last name is required.' },
    line1: { required: 'Address is required.', minlength: 'Enter a complete address (min 5 characters).', blank: 'Address is required.' },
    email: { required: 'E-mail is required.', email: 'Enter a valid e-mail address.' },
    city: { required: 'City is required.', pattern: 'Use letters only.', blank: 'City is required.' },
    pin: { required: 'PIN is required.', pattern: 'Enter a valid 6-digit PIN.' },
    phone: { required: 'Phone number is required.', pattern: 'Enter a valid 10-digit mobile number.' },
    state: { required: 'Select a state.' },
    country: { required: 'Select a country.' },
  };

  constructor() {
    const e = this.auth.user()?.email;
    this.form.patchValue({ ...(this.checkout.address() ?? { ...EMPTY_ADDRESS, email: e ?? '' }) });
    effect(() => {
      // keep the optional "email" prefilled for a logged in user without an address
      const user = this.auth.user();
      if (user && !this.form.controls.email.value) this.form.controls.email.setValue(user.email);
    });
  }

  protected bad(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty || this.submitted());
  }

  protected err(name: string): string {
    const errors = this.form.get(name)?.errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    return CheckoutPage.MESSAGES[name]?.[key] ?? 'Invalid value.';
  }

  protected toggleSaved(checked: boolean): void {
    this.useSaved.set(checked);
    const saved = this.savedAddress();
    if (checked && saved) {
      this.form.patchValue({ ...saved });
      this.form.disable();
      this.form.controls.remember.disable();
    } else {
      this.form.enable();
      this.form.reset({ ...EMPTY_ADDRESS, email: this.auth.user()?.email ?? '', remember: false });
    }
  }

  protected applyCoupon(event?: Event): void {
    event?.preventDefault();
    const error = this.checkout.applyCoupon(this.couponInput());
    this.couponError.set(error ?? '');
    if (!error) this.couponInput.set('');
  }

  protected removeCoupon(): void {
    this.checkout.removeCoupon();
    this.couponError.set('');
  }

  protected payNow(): void {
    this.submitted.set(true);
    if (!this.cart.items().length) {
      this.router.navigateByUrl('/cart');
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('.field.invalid')?.focus();
      return;
    }
    const { remember, ...raw } = this.form.getRawValue();
    const address: Address = { ...raw, firstName: raw.firstName.trim(), lastName: raw.lastName.trim(), line1: raw.line1.trim(), city: raw.city.trim() };
    this.checkout.setAddress(address);
    if (remember && !this.useSaved()) this.auth.saveAddress(address);
    this.router.navigateByUrl('/payment');
  }
}
