import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../core/models';
import { BookCoverComponent } from './book-cover.component';
import { DeliveryPipe, InrPipe } from './pipes';
import { IconComponent } from './icon.component';

/** Reusable book card used in listings, recommendations and related reads. */
@Component({
  selector: 'bw-book-card',
  imports: [RouterLink, BookCoverComponent, DeliveryPipe, InrPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-card.component.html',
})
export class BookCardComponent {
  readonly book = input.required<Book>();
  readonly showActions = input(true);
  readonly wished = input(false);
  readonly addToCart = output<Book>();
  readonly wishlist = output<Book>();
}
