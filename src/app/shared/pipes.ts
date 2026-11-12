import { Pipe, PipeTransform } from '@angular/core';
import { deliveryFromNow } from '../core/utils';

/** Book (or a number of days) -> "Mon, 21 Jul" tentative delivery label. */
@Pipe({ name: 'delivery' })
export class DeliveryPipe implements PipeTransform {
  transform(value: { deliveryDays: number } | number | string): string {
    const date =
      typeof value === 'string'
        ? new Date(value)
        : deliveryFromNow(typeof value === 'number' ? value : value.deliveryDays);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
}

/** 1499 -> "₹1,499" (hides .00, keeps paise when present) */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number): string {
    const hasPaise = Math.round(value * 100) % 100 !== 0;
    return '₹' + value.toLocaleString('en-IN', {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    });
  }
}
