import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Book } from '../core/models';

/**
 * Generates a book cover as inline SVG from the book's cover style, so the
 * project ships without binary image assets. Aspect ratio is fixed at 2:3.
 */
@Component({
  selector: 'bw-book-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-cover.component.html',
  styles: `:host { display: block; height: 100%; aspect-ratio: 2 / 3; overflow: hidden; }`,
})
export class BookCoverComponent {
  readonly book = input.required<Book>();
  protected readonly c = computed(() => this.book().cover);
  protected readonly titleLines = computed(() => {
    const words = this.book().title.toUpperCase().split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > 13 && line) {
        lines.push(line);
        line = w;
      } else {
        line = (line + ' ' + w).trim();
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 4);
  });
  protected readonly titleY = computed(() => 40);
}
