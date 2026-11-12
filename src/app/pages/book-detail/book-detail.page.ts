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
  template: `
    @if (book(); as b) {
      <div class="mx-auto max-w-[1400px] p-3 sm:p-4">
        <nav class="crumbs mb-3" aria-label="Breadcrumb">
          <a routerLink="/" class="link">Home</a> / <a routerLink="/" class="link">{{ b.genres[0] }}</a> /
          <a routerLink="/" class="link">{{ b.category }}</a>
        </nav>

        <div class="grid gap-6 lg:grid-cols-[1fr_17rem]">
          <div>
            <div class="grid gap-5 md:grid-cols-[minmax(0,26rem)_1fr]">
              <!-- Covers -->
              <div class="grid grid-cols-2 gap-2">
                <bw-book-cover [book]="b" />
                <div class="relative aspect-[2/3]">
                  <div class="flex h-full flex-col justify-between overflow-hidden p-3 text-[10px] leading-snug"
                       [style.background]="b.cover.bg" [style.color]="b.cover.fg">
                    <p class="text-center font-medium italic">“{{ b.description.split('.')[0] }}.”</p>
                    <div>
                      <p class="mb-1 font-bold">About the Author</p>
                      <p class="line-clamp-6">{{ writer()?.bio }}</p>
                    </div>
                    <div class="flex items-end justify-between"><span class="grid h-6 w-6 place-items-center rounded-full border-2 border-current font-bold">a</span>
                      <span class="h-7 w-14 bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px)]"></span></div>
                  </div>
                </div>
              </div>

              <!-- Info -->
              <div class="text-xs">
                <h1 class="text-lg leading-tight font-semibold">{{ b.title }}</h1>
                <p class="mt-1">by <a routerLink="/writers" [queryParams]="{ name: b.author }" class="link">{{ b.author }}</a></p>
                <p class="mt-2 text-[#c6c6c6]">{{ b.description }}</p>
                <p class="mt-3 text-[#c6c6c6]">Published by: <a routerLink="/" (click)="browseBrand(b.publisher)" class="link">{{ b.publisher }}</a></p>
                <p class="mt-3">{{ b.format }}</p>
                <p class="mt-0.5">
                  @for (g of b.genres; track g; let last = $last) {<span class="link">{{ g }}</span>@if (!last) {<span>, </span>}}
                </p>

                <p class="mt-4 text-2xl font-semibold" data-testid="detail-price">
                  {{ b.price | inr }}
                  @if (b.discountPercent) {<span class="ml-2 text-xs font-normal text-ok">{{ b.discountPercent }}% off at checkout</span>}
                </p>
                <p class="mt-1 text-[#c6c6c6]">Delivery by <strong class="text-white">{{ b | delivery }}</strong></p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <button type="button" class="btn-primary min-w-32 justify-between" (click)="addToCart()" data-testid="add-to-cart">
                    {{ inCart() ? 'Added · Go to cart' : 'Add to Cart' }} <bw-icon name="cart" [size]="14" />
                  </button>
                  <button type="button" class="btn-secondary min-w-32 justify-between" (click)="wishlist.toggle(b)"
                          [attr.aria-pressed]="wished()" data-testid="add-to-wishlist">
                    {{ wished() ? 'In Wishlist' : 'Add to Wishlist' }} <bw-icon name="heart" [size]="14" [filled]="wished()" />
                  </button>
                </div>

                <dl class="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-3">
                  <div><dt class="text-muted">Language</dt><dd class="link mt-0.5 inline-block">{{ b.language }}</dd></div>
                  <div><dt class="text-muted">Rating</dt><dd class="mt-0.5"><bw-stars [value]="b.rating" /></dd></div>
                  <div><dt class="text-muted">Sells</dt><dd class="mt-0.5 font-semibold">{{ b.sold }} copies sold</dd></div>
                </dl>
              </div>
            </div>

            <!-- About the writer -->
            <section class="mt-8" aria-labelledby="writer-h">
              <h2 id="writer-h" class="mb-3 text-sm font-semibold">About the writer</h2>
              <div class="flex gap-4 text-xs">
                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#393939] text-lg font-semibold">{{ initials(b.author) }}</span>
                <div>
                  <p class="mb-1 font-medium">{{ b.author }}</p>
                  <p class="leading-relaxed text-[#c6c6c6]">{{ writer()?.bio }}</p>
                </div>
              </div>
            </section>

            <!-- Reviews -->
            <section class="mt-8" aria-labelledby="rev-h">
              <h2 id="rev-h" class="mb-3 text-sm font-semibold">Reviews</h2>
              <div class="grid gap-6 md:grid-cols-2">
                <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" novalidate>
                  <label class="field-label flex justify-between" for="review">Leave Your Review <span>{{ reviewForm.controls.text.value.length }}/100</span></label>
                  <textarea id="review" rows="4" maxlength="100" class="field resize-none" placeholder="Placeholder text"
                            formControlName="text" [class.invalid]="reviewBad('text')"></textarea>
                  @if (reviewBad('text')) {<p class="field-error">Write at least 5 characters.</p>}
                  <div class="mt-2 flex items-center justify-between">
                    <div role="radiogroup" aria-label="Your rating" class="flex gap-0.5 text-xl">
                      @for (n of [1, 2, 3, 4, 5]; track n) {
                        <button type="button" role="radio" [attr.aria-checked]="rating() === n" (click)="rating.set(n)"
                                [class]="n <= rating() ? 'text-warn' : 'text-[#6f6f6f] hover:text-warn'" [attr.aria-label]="n + ' stars'">{{ n <= rating() ? '★' : '☆' }}</button>
                      }
                    </div>
                    <button type="submit" class="btn-primary min-w-24 justify-between">Submit <bw-icon name="arrow" [size]="14" /></button>
                  </div>
                  @if (reviewBad('rating')) {<p class="field-error">Please choose a star rating.</p>}
                </form>

                <ul class="space-y-4 text-xs">
                  @for (r of reviews(); track r.id) {
                    <li>
                      <p class="mb-1 font-medium">{{ r.author }} <span class="font-normal text-muted">· {{ r.date | date: 'mediumDate' }}</span></p>
                      <p class="text-[#c6c6c6]">{{ r.text }}</p>
                      <bw-stars class="mt-1 block" [value]="r.rating" />
                    </li>
                  } @empty {<li class="text-muted">No reviews yet. Be the first to review this book.</li>}
                </ul>
              </div>
            </section>
          </div>

          <!-- Related -->
          <aside class="border-line lg:border-l lg:pl-5" aria-labelledby="rel-h">
            <h2 id="rel-h" class="mb-3 text-sm font-semibold">Related Reads</h2>
            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              @for (r of related(); track r.id) {
                <article class="flex gap-3 text-xs">
                  <a [routerLink]="['/book', r.id]" class="block w-20 shrink-0 self-start" [attr.aria-label]="'View ' + r.title"><bw-book-cover [book]="r" /></a>
                  <div class="min-w-0">
                    <h3 class="text-sm leading-tight font-medium"><a [routerLink]="['/book', r.id]" class="hover:underline">{{ r.title }}</a></h3>
                    <p class="text-[#c6c6c6]">by <a routerLink="/writers" [queryParams]="{ name: r.author }" class="link">{{ r.author }}</a></p>
                    <p class="mt-1 line-clamp-2 text-[11px] text-[#c6c6c6]">{{ r.description }}</p>
                    <p class="mt-1 text-[#c6c6c6]">{{ r.format }}</p>
                    <p class="text-[11px]"><span class="link">{{ r.genres.join(', ') }}</span></p>
                    <p class="mt-1 text-sm font-semibold">{{ r.price | inr }}</p>
                    <p class="text-[11px] text-[#c6c6c6]">Delivery by <strong class="text-white">{{ r | delivery }}</strong></p>
                    <button type="button" class="btn-ghost btn-sm mt-1.5" (click)="cart.add(r)">Add to Cart</button>
                  </div>
                </article>
              }
            </div>
          </aside>
        </div>
      </div>
    } @else {
      <div class="mx-auto max-w-md p-10 text-center">
        <p class="mb-3 text-sm">Sorry, we couldn't find that book.</p>
        <a routerLink="/" class="btn-primary">Back to the store</a>
      </div>
    }
  `,
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
