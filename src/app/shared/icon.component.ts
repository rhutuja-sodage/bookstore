import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PATHS: Record<string, string> = {
  logo: 'M3 6c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v12c-3-1.500-6-1.500-9 .5-3-2-6-2-9-.5V6ZM12 6.500V18.500',
  menu: 'M4 7h16M4 12h16M4 17h16',
  cart: 'M3 4h2l2.4 11h10.2L20 8H6.2M9.5 20a1 1 0 1 0 0-.01M17 20a1 1 0 1 0 0-.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M6 9l6 6 6-6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v8',
  logout: 'M9 4H5v16h4M15 8l4 4-4 4M19 12H9',
  info: 'M12 8v.01M12 11v5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
};

/** Tiny inline-SVG icon set so the app needs no icon font / network request. */
@Component({
  selector: 'bw-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  styles: `:host { display: inline-flex; line-height: 0; }`,
})
export class IconComponent {
  readonly name = input.required<keyof typeof PATHS | string>();
  readonly size = input(16);
  readonly filled = input(false);
  protected readonly path = computed(() => PATHS[this.name()] ?? '');
}
