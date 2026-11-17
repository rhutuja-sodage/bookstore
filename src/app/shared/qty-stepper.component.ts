import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'bw-qty-stepper',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qty-stepper.component.html',
})
export class QtyStepperComponent {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(10);
  readonly changed = output<number>();
}
