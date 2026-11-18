import { Book } from './models';

/** Small slice of the real catalog (same values as backend/app/seed_data/books.json) used by the unit tests. */
const make = (b: Partial<Book> & Pick<Book, 'id' | 'title' | 'author' | 'publisher' | 'category' | 'genres' | 'price'>): Book => ({
  description: '',
  language: 'English',
  format: 'Paperback',
  discountPercent: 10,
  taxPercent: 12,
  deliveryDays: 5,
  rating: 4.5,
  ratingCount: 100,
  sold: 100,
  published: '2026-01-01',
  cover: { bg: '#000', fg: '#fff', accent: '#fff', motif: 'book' },
  ...b,
});

export const TEST_BOOKS: Book[] = [
  make({ id: 'joy-of-minimalism', title: 'The Joy of Minimalism', author: 'Daniel Reed', publisher: 'ABC Publishers', category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 149, taxPercent: 5, published: '2026-06-20' }),
  make({ id: 'art-of-focus', title: 'The Art of Focus', author: 'Arjun Patel', publisher: 'Lotus House', category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 399, sold: 920, published: '2025-11-02' }),
  make({ id: 'vanishing-house', title: 'The Vanishing House', author: 'Clara Nelson', publisher: 'Nightfall Press', category: 'Mystery', genres: ['Fiction', 'Horror'], format: 'E-book', price: 99, discountPercent: 0, taxPercent: 5, deliveryDays: 1, sold: 640, published: '2026-07-01' }),
  make({ id: 'midnight-hour', title: 'The Midnight Hour', author: 'James Adams', publisher: 'Nightfall Press', category: 'Mystery', genres: ['Fiction', 'Thriller', 'Horror'], price: 299, sold: 1540, published: '2026-03-03' }),
  make({ id: 'dragon-crown', title: 'The Dragon’s Crown', author: 'Aria Stone', publisher: 'Orbit Lane', category: 'Fantasy', genres: ['Fiction', 'Fantasy'], price: 449, sold: 2100, published: '2025-12-12' }),
  make({ id: 'realm-of-embers', title: 'Realm of Embers', author: 'Aria Stone', publisher: 'Orbit Lane', category: 'Fantasy', genres: ['Fiction', 'Fantasy'], format: 'Audiobook', price: 299, discountPercent: 5, taxPercent: 18, deliveryDays: 1, sold: 990, published: '2026-06-02' }),
  make({ id: 'ultimate-guide-wealth', title: 'The Wealth Blueprint', author: 'Rohan Gupta', publisher: 'ABC Publishers', category: 'Self-help', genres: ['Non-fiction', 'Finance'], format: 'Hardcover', price: 1199, deliveryDays: 7, sold: 2400, published: '2026-07-08' }),
];

export const TEST_COUPONS = [
  { code: 'BOOKS10', description: '10% off (max ₹200)', percent: 10, maxDiscount: 200, minOrder: 0 },
  { code: 'WELCOME100', description: '₹100 off on orders above ₹300', flat: 100, minOrder: 300 },
  { code: 'READMORE15', description: '15% off (max ₹300) on orders above ₹700', percent: 15, maxDiscount: 300, minOrder: 700 },
];
