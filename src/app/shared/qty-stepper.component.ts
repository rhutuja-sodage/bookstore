import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'bw-qty-stepper',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center border-b border-[#8d8d8d] bg-field text-xs" role="group" aria-label="Quantity">
      <button type="button" class="px-2 py-1.5 hover:bg-[#4c4c4c] disabled:opacity-40" (click)="changed.emit(value() - 1)"
              [disabled]="value() <= min()" aria-label="Decrease quantity">
        <bw-icon name="minus" [size]="12" />
      </button>
      <span class="min-w-8 text-center tabular-nums" aria-live="polite">{{ value() }}</span>
      <button type="button" class="px-2 py-1.5 hover:bg-[#4c4c4c] disabled:opacity-40" (click)="changed.emit(value() + 1)"
              [disabled]="value() >= max()" aria-label="Increase quantity">
        <bw-icon name="plus" [size]="12" />
      </button>
    </div>
  `,
})
export class QtyStepperComponent {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(10);
  readonly changed = output<number>();
}
