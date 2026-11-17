import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Decorative dark-blue illustrated backdrop used on payment and success pages. */
@Component({
  selector: 'bw-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './backdrop.component.html',
  styles: `:host { display: block; }`,
})
export class BackdropComponent {}
