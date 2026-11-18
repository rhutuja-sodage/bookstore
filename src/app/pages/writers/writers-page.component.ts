import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { Writer } from '../../core/models';
import { CartService, WishlistService } from '../../core/cart.service';
import { BookCardComponent } from '../../shared/book-card.component';

@Component({
  selector: 'bw-writers',
  imports: [RouterLink, BookCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './writers-page.component.html',
})
export class WritersPage {
  /** bound from the ?name= query parameter */
  readonly name = input<string>();
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  private readonly catalog = inject(CatalogService);
  protected readonly writers = this.catalog.writers;

  protected readonly selected = computed<Writer | undefined>(() => this.writers().find((w) => w.name === this.name()) ?? this.writers()[0]);
  protected readonly booksBy = computed(() => this.catalog.books().filter((b) => b.author === this.selected()?.name));

  protected count(name: string): number {
    return this.catalog.books().filter((b) => b.author === name).length;
  }

  protected initials(name: string): string {
    return name.split(' ').filter((p) => /^[A-Za-z]/.test(p) && !p.endsWith('.')).slice(0, 2).map((p) => p[0]).join('');
  }
}
