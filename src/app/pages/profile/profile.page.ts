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
  template: `
    <div class="mx-auto max-w-2xl p-3 sm:p-4">
      <nav class="crumbs mb-2" aria-label="Breadcrumb"><a routerLink="/" class="link">Home</a> / Profile</nav>
      <h1 class="mb-4 text-lg font-semibold">My Profile</h1>

      @if (auth.user(); as u) {
        <section class="panel p-5 text-xs" data-testid="profile">
          <div class="flex items-center gap-4">
            <span class="grid h-14 w-14 place-items-center rounded-full bg-brand text-lg font-semibold">{{ u.name.charAt(0).toUpperCase() }}</span>
            <div><p class="text-base font-semibold">{{ u.name }}</p><p class="text-[#c6c6c6]">{{ u.email }}</p></div>
          </div>

          <dl class="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
            <div><dt class="text-muted">Gift points</dt><dd class="mt-0.5 text-lg font-semibold text-ok" data-testid="gift-points">{{ u.giftPoints }}</dd></div>
            <div><dt class="text-muted">Orders placed</dt><dd class="mt-0.5 text-lg font-semibold">{{ orders.orders().length }}</dd></div>
            <div><dt class="text-muted">Total spent</dt><dd class="mt-0.5 text-lg font-semibold">{{ spent() | inr }}</dd></div>
          </dl>

          <div class="mt-5 border-t border-line pt-4">
            <p class="mb-1 font-medium">Saved delivery address</p>
            @if (u.address; as a) {
              <p class="text-[#c6c6c6]">{{ a.firstName }} {{ a.lastName }}, {{ a.line1 }}, {{ a.city }}, {{ a.state }} {{ a.pin }}, {{ a.country }}</p>
              <p class="text-[#c6c6c6]">{{ a.countryCode }} {{ a.phone }}</p>
            } @else {
              <p class="text-muted">No address saved yet. Tick “Save this address” at checkout.</p>
            }
          </div>

          <div class="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            <a routerLink="/orders" class="btn-ghost btn-sm"><bw-icon name="box" [size]="13" /> My Orders</a>
            <button type="button" class="btn-ghost btn-sm" (click)="logout()" data-testid="logout"><bw-icon name="logout" [size]="13" /> Log out</button>
          </div>
        </section>
      }
    </div>
  `,
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
