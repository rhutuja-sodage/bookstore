import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/order.service';
import { CartService, WishlistService } from '../../core/cart.service';
import { ToastService } from '../../core/toast.service';
import { CatalogService } from '../../core/catalog.service';
import { Order } from '../../core/models';
import { BookCardComponent } from '../../shared/book-card.component';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';

@Component({
  selector: 'bw-orders',
  imports: [DatePipe, RouterLink, BookCardComponent, BookCoverComponent, DeliveryPipe, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-page.component.html',
})
export class OrdersPage {
  protected readonly orders = inject(OrderService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly catalog = inject(CatalogService);

  protected readonly pending = signal<Order | null>(null);
  protected readonly hasOrders = computed(() => this.orders.orders().length > 0);

  protected book(id: string) {
    return this.catalog.byId(id);
  }

  protected async confirmCancel(order: Order): Promise<void> {
    const result = await this.orders.cancel(order.number);
    this.pending.set(null);
    if (result.ok) this.toast.show(`Order ${order.number} cancelled. Refund initiated.`, 'info');
    else this.toast.error(result.error ?? 'Could not cancel order.');
  }
}
