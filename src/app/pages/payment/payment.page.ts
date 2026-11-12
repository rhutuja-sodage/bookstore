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
  template: `
    <bw-backdrop>
      <section class="w-full max-w-[44rem] bg-[#262626] text-xs shadow-2xl" aria-labelledby="pay-h">
        <header class="flex items-center justify-between gap-3 border-b border-brand/0 bg-[#262626] px-4 py-3">
          <h1 id="pay-h" class="text-sm font-normal">Complete Payment</h1>
          <p class="text-sm font-semibold" data-testid="payable">Payable Amount: ₹{{ total() }}</p>
        </header>

        <div class="grid sm:grid-cols-[9rem_1fr]">
          <div class="flex overflow-x-auto border-t border-line bg-[#161616] sm:block sm:overflow-visible" role="tablist" aria-label="Payment modes" aria-orientation="vertical">
            @for (m of modes; track m) {
              <button type="button" role="tab" [attr.aria-selected]="mode() === m" (click)="select(m)"
                      class="relative w-full min-w-28 border-b border-line px-4 py-3.5 text-left whitespace-nowrap transition-colors"
                      [class]="mode() === m ? 'bg-[#262626] text-white' : 'bg-[#393939] text-[#c6c6c6] hover:bg-[#4a4a4a]'">
                @if (mode() === m) {<span class="absolute inset-y-0 left-0 w-1 bg-brand"></span>}
                {{ m }}
              </button>
            }
          </div>

          <form [formGroup]="form" (ngSubmit)="pay()" novalidate class="flex flex-col justify-between gap-4 border-t border-line p-4" role="tabpanel">
            <div class="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              @switch (mode()) {
                @case ('Credit card') { <ng-container *ngTemplateOutlet="cardFields" /> }
                @case ('Debit card') { <ng-container *ngTemplateOutlet="cardFields" /> }
                @case ('UPI') {
                  <div class="sm:col-span-2">
                    <label class="field-label" for="upi">UPI ID</label>
                    <input id="upi" class="field" formControlName="upi" placeholder="name&#64;bank" autocomplete="off" [class.invalid]="bad('upi')" />
                    @if (bad('upi')) {<p class="field-error">Enter a valid UPI ID, e.g. name&#64;okhdfc.</p>}
                  </div>
                }
                @case ('Wallet') {
                  <div class="sm:col-span-2">
                    <label class="field-label" for="wallet">Choose wallet</label>
                    <select id="wallet" class="field" formControlName="wallet" [class.invalid]="bad('wallet')">
                      <option value="" disabled>Select a wallet</option>
                      @for (w of wallets; track w) {<option [value]="w">{{ w }}</option>}
                    </select>
                    @if (bad('wallet')) {<p class="field-error">Select a wallet.</p>}
                  </div>
                }
                @case ('Cash on delivery') {
                  <p class="text-[#c6c6c6] sm:col-span-2">Pay in cash when your order is delivered. Please keep the exact amount ready.</p>
                }
              }
            </div>

            <div class="flex justify-end">
              <button type="submit" class="btn-primary min-w-32 justify-between" data-testid="submit-payment">
                {{ mode() === 'Cash on delivery' ? 'Place Order' : 'Pay Now' }} <bw-icon name="lock" [size]="14" />
              </button>
            </div>
      <ng-template #cardFields>
        <div>
          <label class="field-label" for="cardNumber">Card Number</label>
          <input id="cardNumber" class="field" formControlName="cardNumber" placeholder="XXXX-XXXX-XXXX-XXXX" inputmode="numeric" maxlength="19"
                 autocomplete="cc-number" (input)="formatCard($event)" [class.invalid]="bad('cardNumber')" />
          @if (bad('cardNumber')) {<p class="field-error">Enter a valid card number.</p>}
        </div>
        <div>
          <label class="field-label" for="cardName">Name on Card</label>
          <input id="cardName" class="field" formControlName="cardName" placeholder="Name" autocomplete="cc-name" [class.invalid]="bad('cardName')" />
          @if (bad('cardName')) {<p class="field-error">Enter the name as printed on the card.</p>}
        </div>
        <div>
          <label class="field-label" for="cvv">CVV</label>
          <input id="cvv" type="password" class="field" formControlName="cvv" placeholder="XXX" inputmode="numeric" maxlength="4" autocomplete="cc-csc"
                 [class.invalid]="bad('cvv')" />
          @if (bad('cvv')) {<p class="field-error">CVV must be 3 or 4 digits.</p>}
        </div>
        <div>
          <label class="field-label" for="expiry">Date of Expiry</label>
          <input id="expiry" class="field" formControlName="expiry" placeholder="MM/YYYY" maxlength="7" autocomplete="cc-exp" (input)="formatExpiry($event)"
                 [class.invalid]="bad('expiry')" />
          @if (bad('expiry')) {<p class="field-error">{{ form.controls.expiry.errors?.['expired'] ? 'This card has expired.' : 'Use MM/YYYY format.' }}</p>}
        </div>
      </ng-template>
          </form>
        </div>
      </section>

    </bw-backdrop>
  `,
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
