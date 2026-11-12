import { BOOKS } from './catalog.data';
import { filterBooks, DEFAULT_FILTERS } from './catalog.service';
import { COUPONS, findCoupon, giftPointsEarned, netAmount, priceCart } from './pricing';
import { luhnValid, generateOrderNumber } from './utils';
import { CartItem } from './models';

const book = (id: string) => BOOKS.find((b) => b.id === id)!;
const items = (...pairs: [string, number][]): CartItem[] => pairs.map(([id, qty]) => ({ book: book(id), qty }));

describe('pricing', () => {
  it('calculates subtotal, discount, tax and total from product objects', () => {
    // art-of-focus: 399, 10% discount, 12% tax
    const p = priceCart(items(['art-of-focus', 2]));
    expect(p.itemCount).toBe(2);
    expect(p.subtotal).toBe(798);
    expect(p.productDiscount).toBe(79.8);
    expect(p.tax).toBe(86.18); // (798 - 79.8) * 12%
    expect(p.shipping).toBe(0);
    expect(p.total).toBe(804.38);
  });

  it('returns zeros for an empty cart', () => {
    const p = priceCart([]);
    expect(p.total).toBe(0);
    expect(p.itemCount).toBe(0);
  });

  it('applies a percentage coupon with a cap', () => {
    const cart = items(['ultimate-guide-wealth', 1]);
    const net = netAmount(cart);
    const { coupon } = findCoupon('books10', net);
    expect(coupon?.code).toBe('BOOKS10');
    const p = priceCart(cart, coupon);
    expect(p.couponDiscount).toBe(107.91); // 10% of 1079.10, under the 200 cap
    expect(p.couponCode).toBe('BOOKS10');
  });

  it('rejects unknown coupons and coupons below the minimum order', () => {
    expect(findCoupon('NOPE', 1000).error).toBe('Invalid coupon code.');
    expect(findCoupon('READMORE15', 100).coupon).toBeNull();
    expect(findCoupon('', 100).error).toBeTruthy();
    expect(COUPONS.length).toBeGreaterThan(0);
  });

  it('never lets gift points exceed the payable amount (whole rupees only)', () => {
    // 99 + 5% tax = 103.95 payable
    const p = priceCart(items(['vanishing-house', 1]), null, 5000);
    expect(p.pointsUsed).toBe(103);
    expect(p.total).toBe(0.95);
  });

  it('uses a higher gift point rate once previous orders reach ₹1,000', () => {
    expect(giftPointsEarned(1000, 0)).toBe(50);
    expect(giftPointsEarned(1000, 1500)).toBe(70);
  });
});

describe('catalog filters', () => {
  const base = DEFAULT_FILTERS;

  it('returns everything by default', () => {
    expect(filterBooks(BOOKS, base).length).toBe(BOOKS.length);
  });

  it('searches title, author, publisher and genre', () => {
    expect(filterBooks(BOOKS, { ...base, query: 'minimalism' }).map((b) => b.id)).toContain('joy-of-minimalism');
    expect(filterBooks(BOOKS, { ...base, query: 'arjun' }).length).toBe(1);
    expect(filterBooks(BOOKS, { ...base, query: 'nightfall' }).length).toBeGreaterThan(0);
    expect(filterBooks(BOOKS, { ...base, query: 'thriller' }).length).toBeGreaterThan(0);
  });

  it('combines all filters with AND', () => {
    const r = filterBooks(BOOKS, { ...base, category: 'Fantasy', language: 'English', format: 'Paperback', price: '₹400 – ₹599' });
    expect(r.map((b) => b.id)).toEqual(['dragon-crown']);
  });

  it('sorts by price both ways', () => {
    const asc = filterBooks(BOOKS, { ...base, sort: 'Price: Low to High' });
    const desc = filterBooks(BOOKS, { ...base, sort: 'Price: High to Low' });
    expect(asc[0].price).toBeLessThanOrEqual(asc[1].price);
    expect(desc[0].price).toBeGreaterThanOrEqual(desc[1].price);
  });
});

describe('utils', () => {
  it('validates card numbers with Luhn', () => {
    expect(luhnValid('4242424242424242')).toBeTrue();
    expect(luhnValid('4242424242424241')).toBeFalse();
  });

  it('generates unique order numbers', () => {
    const set = new Set(Array.from({ length: 200 }, () => generateOrderNumber()));
    expect(set.size).toBe(200);
    expect([...set][0]).toMatch(/^BW-\d{8}-[A-Z0-9]{6}$/);
  });
});
