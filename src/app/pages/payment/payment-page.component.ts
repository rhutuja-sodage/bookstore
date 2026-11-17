import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from '../../core/checkout.service';
import { PaymentMode } from '../../core/models';
import { luhnValid } from '../../core/utils';
import { BackdropComponent } from '../../shared/backdrop.component';
import { IconComponent } from '../../shared/icon.component';

const MODES: PaymentMode[] = ['Credit card', 'Debit card', 'UPI', 'Wallet', 'Cash on delivery'];
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'];

function cardNumber(c: AbstractControl): ValidationErrors | null {
  const digits = String(c.value ?? '').replace(/\s+/g, '');
  if (!digits) return null; // handled by required
  return /^\d{13,19}$/.test(digits) && luhnValid(digits) ? null : { cardNumber: true };
}

function expiry(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value ?? '');
  if (!v) return null;
  const m = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(v);
  if (!m) return { format: true };
  const month = Number(m[1]);
  const year = Number(m[2]);
  const now = new Date();
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  return expired || year > now.getFullYear() + 20 ? { expired: true } : null;
}

@Component({
  selector: 'bw-payment',
  imports: [ReactiveFormsModule, NgTemplateOutlet, BackdropComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-page.component.html',
})
export class PaymentPage {
  private readonly checkout = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly modes = MODES;
  protected readonly wallets = WALLETS;
  protected readonly mode = signal<PaymentMode>('Credit card');
  protected readonly submitted = signal(false);
  protected readonly total = computed(() => this.checkout.pricing().total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  protected readonly form = new FormGroup({
    cardNumber: new FormControl('', { nonNullable: true }),
    cardName: new FormControl('', { nonNullable: true }),
    cvv: new FormControl('', { nonNullable: true }),
    expiry: new FormControl('', { nonNullable: true }),
    upi: new FormControl('', { nonNullable: true }),
    wallet: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.applyValidators('Credit card');
  }

  protected select(mode: PaymentMode): void {
    this.mode.set(mode);
    this.submitted.set(false);
    this.form.reset();
    this.applyValidators(mode);
  }

  private applyValidators(mode: PaymentMode): void {
    const c = this.form.controls;
    const all = [c.cardNumber, c.cardName, c.cvv, c.expiry, c.upi, c.wallet];
    all.forEach((x) => x.clearValidators());
    if (mode === 'Credit card' || mode === 'Debit card') {
      c.cardNumber.setValidators([Validators.required, cardNumber]);
      c.cardName.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .'-]{1,}$/)]);
      c.cvv.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      c.expiry.setValidators([Validators.required, expiry]);
    } else if (mode === 'UPI') {
      c.upi.setValidators([Validators.required, Validators.pattern(/^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/)]);
    } else if (mode === 'Wallet') {
      c.wallet.setValidators([Validators.required]);
    }
    all.forEach((x) => x.updateValueAndValidity());
  }

  protected bad(name: 'cardNumber' | 'cardName' | 'cvv' | 'expiry' | 'upi' | 'wallet'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected formatCard(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    input.value = formatted;
    this.form.controls.cardNumber.setValue(formatted, { emitEvent: false });
    this.form.controls.cardNumber.updateValueAndValidity();
  }

  protected formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    input.value = formatted;
    this.form.controls.expiry.setValue(formatted, { emitEvent: false });
    this.form.controls.expiry.updateValueAndValidity();
  }

  protected pay(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const mode = this.mode();
    let detail = '';
    if (mode === 'Credit card' || mode === 'Debit card') detail = `•••• ${v.cardNumber.replace(/\s/g, '').slice(-4)}`;
    else if (mode === 'UPI') detail = v.upi;
    else if (mode === 'Wallet') detail = v.wallet;
    else detail = 'Pay on delivery';
    // Raw card data is intentionally never stored - only a masked reference.
    this.checkout.payment.set({ mode, detail });
    this.router.navigateByUrl('/confirm');
  }
}
