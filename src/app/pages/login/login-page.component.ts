import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'bw-login',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly show = signal(false);
  protected readonly error = signal('');
  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly isLogin = computed(() => this.mode() === 'login');

  protected bad(name: 'name' | 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected switchMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set('');
    this.submitted.set(false);
    const { name, password } = this.form.controls;
    name.setValidators(mode === 'register' ? [Validators.required, Validators.minLength(2)] : []);
    password.setValidators(
      mode === 'register' ? [Validators.required, Validators.minLength(6)] : [Validators.required],
    );
    name.updateValueAndValidity();
    password.updateValueAndValidity();
  }

  protected fillDemo(): void {
    this.switchMode('login');
    this.form.patchValue({ email: 'demo@bookworm.com', password: 'Demo@123' });
  }

  protected readonly busy = signal(false);

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    this.submitted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    this.busy.set(true);
    const result = await (this.isLogin() ? this.auth.login(email, password) : this.auth.register(name, email, password));
    this.busy.set(false);
    if (!result.ok) {
      this.error.set(result.error ?? 'Something went wrong.');
      return;
    }
    this.toast.show(this.isLogin() ? 'Logged in successfully' : 'Account created');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
  }
}
