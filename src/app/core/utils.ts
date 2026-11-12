export const HOURS_48_MS = 48 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function deliveryFromNow(days: number): Date {
  return addDays(new Date(), days);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Unique, human friendly order number such as BW-20260712-4F9K2Q */
export function generateOrderNumber(date = new Date()): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `BW-${ymd}-${suffix}`;
}

export function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** Safe localStorage helpers (SSR / private-mode tolerant) */
export const store = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`bw.${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key: string, value: unknown): void {
    try {
      localStorage.setItem(`bw.${key}`, JSON.stringify(value));
    } catch {
      /* storage full or unavailable - ignore */
    }
  },
  has(key: string): boolean {
    try {
      return localStorage.getItem(`bw.${key}`) !== null;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(`bw.${key}`);
    } catch {
      /* ignore */
    }
  },
};
