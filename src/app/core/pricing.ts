import { CartItem, Coupon, PriceBreakdown } from './models';
import { roundMoney } from './utils';

export const SHIPPING_CHARGE = 0; // delivery is free

export const COUPONS: Coupon[] = [
  { code: 'BOOKS10', description: '10% off (max ₹200)', percent: 10, maxDiscount: 200, minOrder: 0 },
  { code: 'WELCOME100', description: '₹100 off on orders above ₹300', flat: 100, minOrder: 300 },
  { code: 'READMORE15', description: '15% off (max ₹300) on orders above ₹700', percent: 15, maxDiscount: 300, minOrder: 700 },
];

export interface CouponResult {
  coupon: Coupon | null;
  error: string | null;
}

export function findCoupon(code: string, netAmount: number): CouponResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { coupon: null, error: 'Enter a coupon code.' };
  const coupon = COUPONS.find((c) => c.code === normalized);
  if (!coupon) return { coupon: null, error: 'Invalid coupon code.' };
  if (netAmount < coupon.minOrder) {
    return { coupon: null, error: `Coupon needs a minimum order of ₹${coupon.minOrder}.` };
  }
  return { coupon, error: null };
}

export function couponValue(coupon: Coupon, netAmount: number): number {
  let value = coupon.flat ?? (netAmount * (coupon.percent ?? 0)) / 100;
  if (coupon.maxDiscount !== undefined) value = Math.min(value, coupon.maxDiscount);
  return roundMoney(Math.min(value, netAmount));
}

/**
 * Per item: discount = price x qty x discount%;
 *           tax      = (price x qty - discount) x tax%
 * Both percentages are read from the product object.
 */
export function priceCart(items: CartItem[], coupon: Coupon | null = null, pointsToUse = 0): PriceBreakdown {
  let itemCount = 0;
  let subtotal = 0;
  let productDiscount = 0;
  let tax = 0;

  for (const { book, qty } of items) {
    const gross = book.price * qty;
    const discount = (gross * book.discountPercent) / 100;
    const taxable = gross - discount;
    itemCount += qty;
    subtotal += gross;
    productDiscount += discount;
    tax += (taxable * book.taxPercent) / 100;
  }

  subtotal = roundMoney(subtotal);
  productDiscount = roundMoney(productDiscount);
  tax = roundMoney(tax);

  const net = subtotal - productDiscount;
  const shipping = items.length ? SHIPPING_CHARGE : 0;
  const couponDiscount = coupon && net >= coupon.minOrder ? couponValue(coupon, net) : 0;

  const beforePoints = roundMoney(net + tax + shipping - couponDiscount);
  const pointsUsed = Math.max(0, Math.min(Math.floor(pointsToUse), Math.floor(beforePoints)));

  return {
    itemCount,
    subtotal,
    productDiscount,
    productDiscountPercent: subtotal ? roundMoney((productDiscount / subtotal) * 100) : 0,
    tax,
    shipping,
    couponCode: couponDiscount > 0 && coupon ? coupon.code : null,
    couponDiscount,
    pointsUsed,
    total: roundMoney(beforePoints - pointsUsed),
  };
}

/** The net (post product discount) amount used to check coupon eligibility */
export function netAmount(items: CartItem[]): number {
  return roundMoney(
    items.reduce((sum, { book, qty }) => sum + book.price * qty * (1 - book.discountPercent / 100), 0),
  );
}

/**
 * Gift points earned on an order.
 * 5% of the amount paid, plus a 2% loyalty bonus once the customer's previous
 * (non cancelled) orders add up to ₹1,000 or more.
 */
export const LOYALTY_THRESHOLD = 1000;

export function giftPointRate(previousOrdersTotal: number): number {
  return previousOrdersTotal >= LOYALTY_THRESHOLD ? 0.07 : 0.05;
}

export function giftPointsEarned(orderTotal: number, previousOrdersTotal: number): number {
  return Math.floor(orderTotal * giftPointRate(previousOrdersTotal));
}
