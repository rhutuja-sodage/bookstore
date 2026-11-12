# Book Worm – Online Bookstore (Angular 20 + Tailwind CSS)

A responsive, dark-themed online bookstore built from the supplied screenshots and requirements document.
Customers can browse, filter, buy and cancel book orders end-to-end. All data is stored in the browser (`localStorage`), so no backend is required.

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Karma + Jasmine, needs Chrome)
npm run build      # production build -> dist/bookworm
```

**Demo account:** `demo@bookworm.com` / `Demo@123` (has a previous order, a saved address and 120 gift points).
Guests can browse and fill a cart; login is required at checkout.

## Customer journey → where it lives

| Requirement | Implementation |
|---|---|
| Login with email + password | `pages/login` (register + login, `returnUrl` support), `core/auth.service.ts` |
| Buy Again + recommendations from order history | `OrderService.boughtBooks / recommendations` → used on Home, Cart, My Orders |
| Category sidebar, search, language / format / price / sort filters (all combined, live) | `pages/home`, `core/catalog.service.ts` (`filterBooks` is a pure, unit-tested function) |
| Browse by brand | "Brand (Publisher)" filter + "Published by" link on book page |
| Tentative delivery date on every book | `delivery` pipe (`shared/pipes.ts`) |
| Related products | Book page "Related Reads", cart suggestions |
| Add to basket / wishlist, qty +/-, remove, totals, badge, persisted | `core/cart.service.ts` (`CartService`, `WishlistService`), `pages/cart` |
| Address form with validation, "Use Saved Address" | `pages/checkout` |
| Totals: subtotal, tax, free delivery, discount %, coupon, total | `core/pricing.ts` – discount & tax per item read from the product object |
| Coupons | `BOOKS10`, `WELCOME100` (min ₹300), `READMORE15` (min ₹700) |
| Gift points (earn on order based on past order totals; redeem balance) | `giftPointsEarned` (5 %, 7 % once earlier orders total ≥ ₹1,000); "Use gift points" at checkout |
| Payment: Credit / Debit card, UPI, Wallet (+ COD) with validation | `pages/payment` (Luhn card check, expiry, CVV, UPI id, wallet) |
| Payment confirmation page → thank-you page with unique order no., date, delivery date | `pages/confirm`, `pages/success` |
| Cancel within 48 hours | `OrderService.canCancel / cancel`, My Orders page |
| Reusable navbar & card components | `shared/navbar.component.ts`, `shared/book-card.component.ts` |

## Project layout

```
src/app
  core/     models, pricing rules, catalog data, services (auth, cart, order, checkout, toast), route guards
  shared/   navbar, book-card, book-cover (SVG), qty-stepper, stars, price-rows, backdrop, toasts, icons, pipes
  pages/    home, book-detail, cart, checkout, payment, confirm, success, orders, wishlist, writers, profile, login
```

* Standalone components, signals, new control flow, lazy-loaded routes, `OnPush` everywhere.
* Tailwind CSS v4 with shared design tokens in `src/styles.css` so every page uses the same colours, fonts and form styles.
* Book covers are generated as inline SVG – no image assets to download.
* Route guards: checkout/payment/confirm require login, a non-empty cart, an address and a payment choice, in that order.
* Only a masked card reference (`•••• 4242`) is stored – never the full card number or CVV.

## Notes / assumptions

* "Cancel within 48 hrs" is measured from the time the order was placed (payment confirmed).
  Cancelling reverses gift points earned/used.
* Payments are simulated (no gateway); the architecture's shipping and payment gateway are represented by the confirmation flow.
