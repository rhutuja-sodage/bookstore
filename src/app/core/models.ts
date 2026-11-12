export type BookFormat = 'Paperback' | 'Hardcover' | 'E-book' | 'Audiobook';

export type CoverMotif =
  | 'sun' | 'target' | 'bulb' | 'arrow' | 'rocket' | 'moon' | 'house'
  | 'cat' | 'crown' | 'waves' | 'leaf' | 'heart' | 'stars' | 'book' | 'globe';

export interface CoverStyle {
  bg: string;
  fg: string;
  accent: string;
  motif: CoverMotif;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  /** Sidebar category (one of CATEGORIES) */
  category: string;
  /** Genre tags shown under the book, e.g. "Non-fiction", "Self Help" */
  genres: string[];
  language: string;
  format: BookFormat;
  /** Selling price in INR (before product discount and tax) */
  price: number;
  /** Product level discount, read from the product object */
  discountPercent: number;
  /** Product level tax, read from the product object */
  taxPercent: number;
  /** Days from today to the tentative delivery date */
  deliveryDays: number;
  rating: number;
  ratingCount: number;
  sold: number;
  /** ISO date */
  published: string;
  cover: CoverStyle;
}

export interface Writer {
  name: string;
  slug: string;
  bio: string;
  location: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  email: string;
  city: string;
  pin: string;
  countryCode: string;
  phone: string;
  state: string;
  country: string;
}

export interface User {
  name: string;
  email: string;
  password: string;
  giftPoints: number;
  address?: Address;
}

export interface CartLine {
  bookId: string;
  qty: number;
}

export interface CartItem {
  book: Book;
  qty: number;
}

export interface Review {
  id: string;
  bookId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Coupon {
  code: string;
  description: string;
  /** percent OR flat amount */
  percent?: number;
  flat?: number;
  maxDiscount?: number;
  minOrder: number;
}

export interface PriceBreakdown {
  itemCount: number;
  /** Sum of price x qty */
  subtotal: number;
  productDiscount: number;
  /** productDiscount / subtotal * 100 */
  productDiscountPercent: number;
  tax: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  pointsUsed: number;
  total: number;
}

export type PaymentMode = 'Credit card' | 'Debit card' | 'UPI' | 'Wallet' | 'Cash on delivery';

export interface PaymentInfo {
  mode: PaymentMode;
  /** Masked, human readable detail e.g. "•••• 4242" */
  detail: string;
}

export interface OrderLine {
  bookId: string;
  title: string;
  author: string;
  description: string;
  format: BookFormat;
  genres: string[];
  price: number;
  qty: number;
  deliveryDate: string;
}

export type OrderStatus = 'Placed' | 'Cancelled';

export interface Order {
  id: string;
  number: string;
  userEmail: string;
  placedAt: string;
  deliveryDate: string;
  lines: OrderLine[];
  address: Address;
  payment: PaymentInfo;
  pricing: PriceBreakdown;
  pointsEarned: number;
  status: OrderStatus;
  cancelledAt?: string;
}
