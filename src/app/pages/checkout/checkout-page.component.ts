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
  templateUrl: './checkout-page.component.html',
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
