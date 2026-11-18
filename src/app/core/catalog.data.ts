export const CATEGORIES = [
  'All', 'Romance', 'Mystery', 'Science Fiction', 'Fantasy', 'Historical', 'Biography',
  'Self-help', 'Memoir', 'Travel', 'Cooking', "Children's", 'Young Adult',
  'Comics & Graphic Novels', 'Poetry', 'Drama', 'Science', 'Philosophy', 'Religion',
  'Language Learning',
];

export const LANGUAGES = ['All', 'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Other'];
export const FORMATS = ['All', 'Paperback', 'Hardcover', 'E-book', 'Audiobook'];

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹199', min: 0, max: 199 },
  { label: '₹200 – ₹399', min: 200, max: 399 },
  { label: '₹400 – ₹599', min: 400, max: 599 },
  { label: '₹600 – ₹999', min: 600, max: 999 },
  { label: 'Above ₹1,000', min: 1000, max: Infinity },
];

export const SORT_OPTIONS = [
  'Relevance', 'Popularity', 'Price: Low to High', 'Price: High to Low', 'Newest First', 'Highest Rated',
];

/** Merchandising lists for the landing page sections (shown to guests / users without history). */
export const FEATURED = {
  recommended: ['art-of-focus', 'art-of-learning', 'path-to-success'],
  bestsellers: ['midnight-hour', 'beneath-the-stars', 'final-frontier'],
  newLaunches: ['joy-of-minimalism', 'vanishing-house', 'lost-kitten'],
};
