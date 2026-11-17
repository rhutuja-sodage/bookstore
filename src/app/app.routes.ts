import { Routes } from '@angular/router';
import { addressGuard, authGuard, cartNotEmptyGuard, paymentGuard } from './core/guards';

export const routes: Routes = [
  { path: '', title: 'Book Worm - Online Bookstore', loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePage) },
  { path: 'login', title: 'Log in - Book Worm', loadComponent: () => import('./pages/login/login-page.component').then((m) => m.LoginPage) },
  { path: 'book/:id', title: 'Book details - Book Worm', loadComponent: () => import('./pages/book-detail/book-detail-page.component').then((m) => m.BookDetailPage) },
  { path: 'cart', title: 'Shopping cart - Book Worm', loadComponent: () => import('./pages/cart/cart-page.component').then((m) => m.CartPage) },
  { path: 'wishlist', title: 'My Wishlist - Book Worm', loadComponent: () => import('./pages/wishlist/wishlist-page.component').then((m) => m.WishlistPage) },
  { path: 'writers', title: 'My Writers - Book Worm', loadComponent: () => import('./pages/writers/writers-page.component').then((m) => m.WritersPage) },
  {
    path: 'orders',
    title: 'My Orders - Book Worm',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders-page.component').then((m) => m.OrdersPage),
  },
  {
    path: 'profile',
    title: 'My Profile - Book Worm',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile-page.component').then((m) => m.ProfilePage),
  },
  {
    path: 'checkout',
    title: 'Checkout - Book Worm',
    canActivate: [authGuard, cartNotEmptyGuard],
    loadComponent: () => import('./pages/checkout/checkout-page.component').then((m) => m.CheckoutPage),
  },
  {
    path: 'payment',
    title: 'Complete Payment - Book Worm',
    canActivate: [authGuard, cartNotEmptyGuard, addressGuard],
    loadComponent: () => import('./pages/payment/payment-page.component').then((m) => m.PaymentPage),
  },
  {
    path: 'confirm',
    title: 'Payment confirmation - Book Worm',
    canActivate: [authGuard, cartNotEmptyGuard, addressGuard, paymentGuard],
    loadComponent: () => import('./pages/confirm/confirm-page.component').then((m) => m.ConfirmPage),
  },
  {
    path: 'success/:number',
    title: 'Order placed - Book Worm',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/success/success-page.component').then((m) => m.SuccessPage),
  },
  { path: '**', redirectTo: '' },
];
