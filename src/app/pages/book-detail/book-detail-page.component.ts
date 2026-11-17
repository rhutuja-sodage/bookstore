import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { CartService, WishlistService } from '../../core/cart.service';
import { ReviewService } from '../../core/order.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { WRITERS } from '../../core/catalog.data';
import { BookCoverComponent } from '../../shared/book-cover.component';
import { StarsComponent } from '../../shared/stars.component';
import { DeliveryPipe, InrPipe } from '../../shared/pipes';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'bw-book-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, BookCoverComponent, StarsComponent, DeliveryPipe, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-detail-page.component.html',
})
export class BookDetailPage {
  readonly id = input.required<string>();

  private readonly catalog = inject(CatalogService);
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly reviewsSvc = inject(ReviewService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly book = computed(() => this.catalog.byId(this.id()));
  protected readonly related = computed(() => {
    const b = this.book();
    return b ? this.catalog.related(b, 3) : [];
  });
  protected readonly writer = computed(() => WRITERS.find((w) => w.name === this.book()?.author));
  protected readonly inCart = computed(() => {
    const b = this.book();
    return !!b && this.cart.items().some((i) => i.book.id === b.id);
  });
  protected readonly wished = computed(() => {
    const b = this.book();
    return !!b && this.wishlist.ids().includes(b.id);
  });
  protected readonly reviews = computed(() => {
    this.reviewsSvc.version();
    return this.reviewsSvc.forBook(this.id());
  });

  protected readonly rating = signal(0);
  protected readonly submitted = signal(false);
  protected readonly reviewForm = new FormGroup({
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5), Validators.maxLength(100)] }),
  });

  constructor() {
    // Scroll to top when moving between books
    effect(() => {
      this.id();
      window.scrollTo({ top: 0 });
    });
  }

  protected initials(name: string): string {
    return name.split(' ').filter((p) => /^[A-Za-z]/.test(p)).slice(0, 2).map((p) => p[0]).join('');
  }

  protected addToCart(): void {
    const b = this.book();
    if (!b) return;
    if (this.inCart()) {
      this.router.navigateByUrl('/cart');
      return;
    }
    this.cart.add(b);
  }

  protected browseBrand(publisher: string): void {
    this.catalog.reset();
    this.catalog.patch({ brand: publisher });
  }

  protected reviewBad(field: 'text' | 'rating'): boolean {
    if (!this.submitted()) return false;
    return field === 'rating' ? this.rating() === 0 : this.reviewForm.controls.text.invalid;
  }

  protected submitReview(): void {
    this.submitted.set(true);
    if (this.reviewForm.invalid || this.rating() === 0) return;
    const name = this.auth.user()?.name ?? 'Guest reader';
    this.reviewsSvc.add(this.id(), name, this.rating(), this.reviewForm.controls.text.value.trim());
    this.reviewForm.reset();
    this.rating.set(0);
    this.submitted.set(false);
    this.toast.show('Thanks! Your review has been posted.');
  }
}
