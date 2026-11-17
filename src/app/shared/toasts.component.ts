import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'bw-toasts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toasts.component.html',
})
export class ToastsComponent {
  protected readonly toast = inject(ToastService);
}
