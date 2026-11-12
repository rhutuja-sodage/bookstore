import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/order.service';
import { BOOKS } from '../../core/catalog.data';
import { BackdropComponent } from '../../shared/backdrop.component';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'bw-success',
  imports: [DatePipe, RouterLink, BackdropComponent, BookCoverComponent, DeliveryPipe, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bw-backdrop>
      @if (order(); as o) {
        <section class="w-full max-w-3xl bg-[#262626] px-4 py-6 text-center text-xs shadow-2xl sm:px-8" aria-labelledby="ok-h">
          <span class="mx-auto grid h-9 w-9 place-items-center rounded-full bg-ok text-black"><bw-icon name="check" [size]="22" /></span>
          <h1 id="ok-h" class="mx-auto mt-3 max-w-xs text-sm font-normal">Your purchase of the following reads is successful</h1>
          <p class="mt-3 text-[#c6c6c6]">Thank you for shopping with Book Worm!</p>

          <dl class="mx-auto mt-3 grid max-w-md grid-cols-1 gap-1 bg-[#161616] p-3 text-left sm:grid-cols-3 sm:text-center" data-testid="order-summary">
            <div><dt class="text-muted">Order number</dt><dd class="font-semibold break-all" data-testid="order-number">{{ o.number }}</dd></div>
            <div><dt class="text-muted">Order date</dt><dd class="font-semibold">{{ o.placedAt | date: 'd MMM y' }}</dd></div>
            <div><dt class="text-muted">Tentative delivery</dt><dd class="font-semibold">{{ o.deliveryDate | delivery }}</dd></div>
          </dl>

          <ul class="mt-5 grid gap-4 text-left sm:grid-cols-2">
            @for (l of o.lines; track l.bookId) {
              <li class="flex gap-3">
                <div class="w-24 shrink-0 self-start">
                  @if (book(l.bookId); as b) {<bw-book-cover [book]="b" />}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium">{{ l.title }}</p>
                  <p class="text-[#c6c6c6]">by <span class="link">{{ l.author }}</span></p>
                  <p class="line-clamp-2 text-[11px] text-[#c6c6c6]">{{ l.description }}</p>
                  <p class="mt-0.5 text-[#c6c6c6]">{{ l.format }}</p>
                  <p class="text-[11px]"><span class="link">{{ l.genres.join(', ') }}</span></p>
                  <p class="mt-1 text-base font-semibold">{{ l.price | inr }} <span class="text-[11px] font-normal text-muted">× {{ l.qty }}</span></p>
                  <p class="text-[11px] text-[#c6c6c6]">Delivery by <strong class="text-white">{{ l.deliveryDate | delivery }}</strong></p>
                </div>
              </li>
            }
          </ul>

          <p class="mt-4 text-[11px] text-muted">
            Total paid <strong class="text-white">{{ o.pricing.total | inr }}</strong> via {{ o.payment.mode }} ·
            You earned <strong class="text-ok">{{ o.pointsEarned }}</strong> gift points ·
            You can cancel this order within 48 hours from <a routerLink="/orders" class="link">My Orders</a>.
          </p>

          <button type="button" class="btn-primary mx-auto mt-5 min-w-44 justify-between" (click)="continueShopping()" data-testid="continue-shopping">
            Continue your Shopping <bw-icon name="arrow" [size]="14" />
          </button>
        </section>
      } @else {
        <section class="w-full max-w-sm bg-[#262626] p-6 text-center text-xs">
          <p class="mb-3 text-sm">We couldn't find that order.</p>
          <a routerLink="/orders" class="btn-primary">Go to My Orders</a>
        </section>
      }
    </bw-backdrop>
  `,
})
export class SuccessPage {
  readonly number = input.required<string>();
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly order = computed(() => this.orders.byNumber(this.number()));
  protected book(id: string) {
    return BOOKS.find((b) => b.id === id);
  }

  protected continueShopping(): void {
    this.router.navigateByUrl('/');
  }
}
