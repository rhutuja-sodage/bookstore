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
  template: `
    <div class="mx-auto grid max-w-md gap-4 px-3 py-8 sm:py-14">
      <div class="panel p-5 sm:p-7">
        <div class="mb-1 flex items-center gap-2"><bw-icon name="logo" [size]="22" /><h1 class="text-lg font-semibold">
          {{ mode() === 'login' ? 'Log in to Book Worm' : 'Create your account' }}</h1></div>
        <p class="mb-5 text-xs text-muted">
          {{ mode() === 'login' ? 'Welcome back! Sign in with your email and password.' : 'Join to save your orders, wishlist and gift points.' }}
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-3.5" data-testid="login-form">
          @if (mode() === 'register') {
            <div>
              <label class="field-label" for="name">Full name</label>
              <input id="name" class="field" formControlName="name" autocomplete="name" [class.invalid]="bad('name')" />
              @if (bad('name')) {<p class="field-error">Name must be at least 2 characters.</p>}
            </div>
          }
          <div>
            <label class="field-label" for="email">Email</label>
            <input id="email" type="email" class="field" formControlName="email" autocomplete="email" placeholder="you@example.com"
                   [class.invalid]="bad('email')" />
            @if (bad('email')) {<p class="field-error">Enter a valid email address.</p>}
          </div>
          <div>
            <label class="field-label" for="password">Password</label>
            <div class="relative">
              <input id="password" [type]="show() ? 'text' : 'password'" class="field !pr-14" formControlName="password"
                     [autocomplete]="mode() === 'login' ? 'current-password' : 'new-password'" [class.invalid]="bad('password')" />
              <button type="button" class="absolute top-1/2 right-2 -translate-y-1/2 text-[11px] text-link" (click)="show.set(!show())">
                {{ show() ? 'Hide' : 'Show' }}</button>
            </div>
            @if (bad('password')) {
              <p class="field-error">{{ mode() === 'login' ? 'Password is required.' : 'Use at least 6 characters.' }}</p>
            }
          </div>

          @if (error()) {<p class="border-l-4 border-danger bg-[#2d1b1d] px-3 py-2 text-xs" role="alert">{{ error() }}</p>}

          <button type="submit" class="btn-primary w-full">{{ mode() === 'login' ? 'Log in' : 'Register' }}</button>
        </form>

        <p class="mt-4 text-center text-xs text-[#c6c6c6]">
          @if (mode() === 'login') {
            New to Book Worm? <button type="button" class="link" (click)="switchMode('register')">Create an account</button>
          } @else {
            Already registered? <button type="button" class="link" (click)="switchMode('login')">Log in</button>
          }
        </p>
      </div>

      <div class="border border-dashed border-line p-3 text-xs text-[#c6c6c6]">
        <p class="mb-1 font-medium text-white">Demo account</p>
        <p>Email: <code>demo&#64;bookworm.com</code> · Password: <code>Demo&#64;123</code></p>
        <button type="button" class="link mt-1" (click)="fillDemo()">Fill demo credentials</button>
      </div>
      <p class="text-center text-xs"><a routerLink="/" class="link">Continue browsing as guest</a></p>
    </div>
  `,
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

  protected submit(): void {
    this.submitted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    const result = this.isLogin() ? this.auth.login(email, password) : this.auth.register(name, email, password);
    if (!result.ok) {
      this.error.set(result.error ?? 'Something went wrong.');
      return;
    }
    this.toast.show(this.isLogin() ? 'Logged in successfully' : 'Account created');
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
  }
}
