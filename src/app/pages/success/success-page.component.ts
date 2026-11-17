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
  templateUrl: './success-page.component.html',
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
