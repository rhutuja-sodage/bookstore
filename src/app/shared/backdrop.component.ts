import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Decorative dark-blue illustrated backdrop used on payment and success pages. */
@Component({
  selector: 'bw-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative isolate flex min-h-[calc(100vh-2.75rem)] items-center justify-center overflow-hidden bg-[#1b3d5f] px-3 py-8">
      <svg class="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1200" height="700" fill="#1a3b5c" />
        <circle cx="90" cy="60" r="150" fill="#235081" opacity=".6" />
        <path d="M1050 -10c10 70 80 100 160 70V-10z" fill="#c8693a" />
        <rect x="640" y="-20" width="130" height="200" rx="10" fill="#27628f" />
        <g transform="rotate(-18 230 210)"><rect x="150" y="110" width="250" height="170" rx="8" fill="#c8693a" /><rect x="205" y="145" width="80" height="55" fill="#a8452a" /><rect x="150" y="260" width="250" height="26" fill="#e9dcc2" /></g>
        <g transform="rotate(-6 330 560)"><rect x="210" y="500" width="330" height="60" rx="5" fill="#27628f" /><rect x="190" y="560" width="350" height="55" rx="5" fill="#e3a72f" /></g>
        <g transform="rotate(8 880 590)"><path d="M720 540l150-35 120 35-10 90-110-30-140 40z" fill="#e9dcc2" /><path d="M720 540l-25 95 130-5z" fill="#c8693a" /></g>
        <rect x="140" y="130" width="22" height="22" fill="#c8693a" transform="rotate(20 150 140)" />
        <rect x="560" y="95" width="26" height="26" fill="#d6a243" transform="rotate(35 570 105)" />
        <rect x="920" y="130" width="22" height="22" fill="#b64d6b" transform="rotate(-15 930 140)" />
        <rect x="1040" y="310" width="20" height="20" fill="#d6a243" transform="rotate(30 1050 320)" />
        <circle cx="980" cy="270" r="18" fill="#c8693a" />
        <path d="M130 230c50-40 100 10 150-20" stroke="#c9873a" stroke-width="5" fill="none" />
        <path d="M850 330c40-50 80 40 120-10s70 60 150 10" stroke="#c9873a" stroke-width="5" fill="none" />
      </svg>
      <ng-content />
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class BackdropComponent {}
