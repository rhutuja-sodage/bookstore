import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/order.service';
import { CartService, WishlistService } from '../../core/cart.service';
import { ToastService } from '../../core/toast.service';
import { BOOKS } from '../../core/catalog.data';
import { Order } from '../../core/models';
import { BookCardComponent } from '../../shared/book-card.component';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';

@Component({
  selector: 'bw-orders',
  imports: [DatePipe, RouterLink, BookCardComponent, BookCoverComponent, DeliveryPipe, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1100px] p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb"><a routerLink="/" class="link">Home</a> / My Orders</nav>
      <h1 class="mb-4 text-lg font-semibold">My Orders</h1>

      @if (orders.boughtBooks().length) {
        <section class="mb-8" aria-labelledby="buy-again">
          <h2 id="buy-again" class="mb-3 text-sm font-semibold">Buy Again</h2>
          <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            @for (b of orders.boughtBooks().slice(0, 6); track b.id) {
              <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="cart.add($event)" (wishlist)="wishlist.toggle($event)" />
            }
          </div>
        </section>
      }

      @if (orders.recommendations().length) {
        <section class="mb-8" aria-labelledby="rec">
          <h2 id="rec" class="mb-3 text-sm font-semibold">Recommended based on your order history</h2>
          <div class="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            @for (b of orders.recommendations().slice(0, 3); track b.id) {
              <bw-book-card [book]="b" [wished]="wishlist.has(b.id)" (addToCart)="cart.add($event)" (wishlist)="wishlist.toggle($event)" />
            }
          </div>
        </section>
      }

      <section aria-labelledby="hist">
        <h2 id="hist" class="mb-3 text-sm font-semibold">Order history</h2>
        @for (o of orders.orders(); track o.id) {
          <article class="panel mb-4" [attr.data-testid]="'order-' + o.number">
            <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line bg-[#262626] px-4 py-2.5 text-xs">
              <div><span class="text-muted">Order </span><strong>{{ o.number }}</strong></div>
              <div><span class="text-muted">Placed </span>{{ o.placedAt | date: 'd MMM y, h:mm a' }}</div>
              <div><span class="text-muted">Total </span><strong>{{ o.pricing.total | inr }}</strong></div>
              <span class="px-2 py-0.5 text-[11px] font-medium" [class]="o.status === 'Cancelled' ? 'bg-danger/20 text-danger' : 'bg-ok/20 text-ok'">{{ o.status }}</span>
            </header>
            <ul class="divide-y divide-line">
              @for (l of o.lines; track l.bookId) {
                <li class="flex gap-3 p-4 text-xs">
                  <div class="w-14 shrink-0 self-start">
                    @if (book(l.bookId); as b) {<bw-book-cover [book]="b" />}
                  </div>
                  <div class="min-w-0 flex-1">
                    <a [routerLink]="['/book', l.bookId]" class="text-sm font-medium hover:underline">{{ l.title }}</a>
                    <p class="text-[#c6c6c6]">by {{ l.author }} · {{ l.format }}</p>
                    <p class="text-[#c6c6c6]">{{ l.price | inr }} × {{ l.qty }}</p>
                    @if (o.status === 'Placed') {<p class="text-[11px] text-[#c6c6c6]">Delivery by <strong class="text-white">{{ l.deliveryDate | delivery }}</strong></p>}
                  </div>
                  @if (book(l.bookId); as b) {
                    <button type="button" class="btn-ghost btn-sm self-start" (click)="cart.add(b)">Buy again</button>
                  }
                </li>
              }
            </ul>
            <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-xs">
              <span class="text-muted">
                Paid via {{ o.payment.mode }}
                @if (o.status === 'Placed' && o.pointsEarned) { · earned {{ o.pointsEarned }} gift points }
                @if (o.status === 'Cancelled') { · cancelled {{ o.cancelledAt | date: 'd MMM y' }} }
              </span>
              @if (o.status === 'Placed') {
                @if (orders.canCancel(o)) {
                  <span class="flex items-center gap-3">
                    <span class="text-[11px] text-muted">Free cancellation for {{ orders.hoursLeftToCancel(o) }} more hrs</span>
                    <button type="button" class="btn-ghost btn-sm !border-danger text-danger" (click)="pending.set(o)" data-testid="cancel-order">Cancel order</button>
                  </span>
                } @else {
                  <span class="text-[11px] text-muted">Cancellation window (48 hrs) has passed</span>
                }
              }
            </footer>
          </article>
        } @empty {
          <div class="panel grid place-items-center gap-3 p-10 text-center text-sm">
            <p>You haven't placed any orders yet.</p>
            <a routerLink="/" class="btn-primary">Start shopping</a>
          </div>
        }
      </section>
    </div>

    @if (pending(); as o) {
      <div class="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-h">
        <div class="w-full max-w-sm bg-[#262626] p-5 text-xs">
          <h2 id="cancel-h" class="mb-2 text-sm font-semibold">Cancel order {{ o.number }}?</h2>
          <p class="mb-4 text-[#c6c6c6]">Your payment of {{ o.pricing.total | inr }} will be refunded and any gift points used will be returned.</p>
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-ghost btn-sm" (click)="pending.set(null)">Keep order</button>
            <button type="button" class="btn-primary btn-sm !bg-danger" (click)="confirmCancel(o)" data-testid="confirm-cancel">Yes, cancel</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class OrdersPage {
  protected readonly orders = inject(OrderService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);

  protected readonly pending = signal<Order | null>(null);
  protected readonly hasOrders = computed(() => this.orders.orders().length > 0);

  protected book(id: string) {
    return BOOKS.find((b) => b.id === id);
  }

  protected confirmCancel(order: Order): void {
    const result = this.orders.cancel(order.number);
    this.pending.set(null);
    if (result.ok) this.toast.show(`Order ${order.number} cancelled. Refund initiated.`, 'info');
    else this.toast.error(result.error ?? 'Could not cancel order.');
  }
}
