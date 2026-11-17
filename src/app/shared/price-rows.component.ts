import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PriceBreakdown } from '../core/models';
import { InrPipe } from './pipes';

/** Itemised price rows reused on checkout, payment and confirmation pages. */
@Component({
  selector: 'bw-price-rows',
  imports: [InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-rows.component.html',
})
export class PriceRowsComponent {
  readonly pricing = input.required<PriceBreakdown>();
}
