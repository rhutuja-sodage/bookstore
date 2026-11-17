import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { OrderService } from '../../core/order.service';
import { ToastService } from '../../core/toast.service';
import { InrPipe } from '../../shared/pipes';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'bw-profile',
  imports: [RouterLink, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected spent(): number {
    return this.orders.previousOrdersTotal();
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.show('You have been logged out', 'info');
    this.router.navigateByUrl('/');
  }
}
