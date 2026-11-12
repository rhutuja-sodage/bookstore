import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'bw-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-0.5 text-warn" [attr.aria-label]="value() + ' out of 5 stars'" role="img">
      @for (s of stars(); track $index) {
        <span [class.opacity-30]="!s" class="leading-none" [style.font-size.px]="size()">★</span>
      }
    </span>
  `,
})
export class StarsComponent {
  readonly value = input.required<number>();
  readonly size = input(13);
  protected readonly stars = computed(() => [1, 2, 3, 4, 5].map((n) => this.value() >= n - 0.5));
}
