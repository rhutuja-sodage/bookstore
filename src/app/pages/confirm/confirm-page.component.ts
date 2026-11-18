import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { CheckoutService } from '../../core/checkout.service';
import { OrderService } from '../../core/order.service';
import { ToastService } from '../../core/toast.service';
import { giftPointsEarned } from '../../core/pricing';
import { PriceRowsComponent } from '../../shared/price-rows.component';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';
import { BackdropComponent } from '../../shared/backdrop.component';

/** Step between payment details and the thank-you page: shows the full bill before the order is placed. */
@Component({
  selector: 'bw-confirm',
  imports: [RouterLink, PriceRowsComponent, BookCoverComponent, DeliveryPipe, InrPipe, BackdropComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-page.component.html',
})
export class ConfirmPage {
  protected readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly pricing = this.checkout.pricing;
  protected readonly address = this.checkout.address;
  protected readonly payment = this.checkout.payment;
  protected readonly busy = signal(false);
  protected readonly willEarn = computed(() => giftPointsEarned(this.pricing().total, this.orders.previousOrdersTotal()));

  protected async confirm(): Promise<void> {
    const address = this.address();
    const payment = this.payment();
    if (this.busy() || !address || !payment || !this.cart.items().length) return;
    this.busy.set(true);
    try {
      // The server re-prices the order from the catalog; the bill shown here is only a preview.
      const order = await this.orders.place(
        this.cart.items(), address, payment, this.checkout.couponCode(), this.checkout.usePoints(),
      );
      this.cart.clear();
      this.checkout.reset();
      await this.router.navigate(['/success', order.number]);
    } catch (e) {
      this.busy.set(false);
      this.toast.error(e instanceof Error ? e.message : 'We could not place your order. Please try again.');
    }
  }
}
