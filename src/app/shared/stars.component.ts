import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'bw-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stars.component.html',
})
export class StarsComponent {
  readonly value = input.required<number>();
  readonly size = input(13);
  protected readonly stars = computed(() => [1, 2, 3, 4, 5].map((n) => this.value() >= n - 0.5));
}
