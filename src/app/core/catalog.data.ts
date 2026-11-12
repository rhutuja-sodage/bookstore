import { Book, BookFormat, CoverStyle, Writer } from './models';
import { slugify } from './utils';

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

const cover = (bg: string, fg: string, accent: string, motif: CoverStyle['motif']): CoverStyle => ({
  bg, fg, accent, motif,
});

interface Seed {
  id: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  category: string;
  genres: string[];
  language?: string;
  format?: BookFormat;
  price: number;
  discount?: number;
  tax?: number;
  days: number;
  rating: number;
  ratingCount?: number;
  sold: number;
  published: string;
  cover: CoverStyle;
}

const seeds: Seed[] = [
  { id: 'joy-of-minimalism', title: 'The Joy of Minimalism', author: 'Daniel Reed', publisher: 'ABC Publishers',
    description: 'Declutter your life to uncover peace, clarity, and joy. A practical guide to mastering what matters and letting go of the rest.',
    category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 149, discount: 10, tax: 5, days: 4, rating: 4.8, ratingCount: 312, sold: 145, published: '2026-06-20',
    cover: cover('#fdd10b', '#1a1a1a', '#1a1a1a', 'sun') },
  { id: 'art-of-focus', title: 'The Art of Focus', author: 'Arjun Patel', publisher: 'Lotus House',
    description: 'Practical guide to mastering focus and boosting productivity every day, with simple routines you can start today.',
    category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 399, discount: 10, tax: 12, days: 4, rating: 4.6, ratingCount: 540, sold: 920, published: '2025-11-02',
    cover: cover('#f4f0e8', '#1a1a1a', '#d9392b', 'target') },
  { id: 'art-of-learning', title: 'The Art of Learning', author: 'Raj Patel', publisher: 'Lotus House',
    description: 'Master the mindset and methods for effective lifelong learning, from memory techniques to deliberate practice.',
    category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 259, discount: 5, tax: 12, days: 4, rating: 4.4, ratingCount: 410, sold: 780, published: '2025-09-14',
    cover: cover('#d93a22', '#ffffff', '#f9c74f', 'bulb') },
  { id: 'path-to-success', title: 'The Path to Success', author: 'James Wright', publisher: 'ABC Publishers',
    description: 'A practical guide to achieving goals with clarity and confidence, one deliberate step at a time.',
    category: 'Self-help', genres: ['Non-fiction', 'Self Help'], price: 359, discount: 15, tax: 12, days: 4, rating: 4.7, ratingCount: 633, sold: 1210, published: '2026-02-11',
    cover: cover('#0e7490', '#fde047', '#fde047', 'arrow') },
  { id: 'midnight-hour', title: 'The Midnight Hour', author: 'James Adams', publisher: 'Nightfall Press',
    description: 'Haunting tale of a man’s journey and the shadows of a forgotten past that refuse to stay buried.',
    category: 'Mystery', genres: ['Fiction', 'Thriller', 'Horror'], price: 299, discount: 10, tax: 12, days: 5, rating: 4.3, ratingCount: 288, sold: 1540, published: '2026-03-03',
    cover: cover('#14213d', '#e5e5e5', '#fca311', 'moon') },
  { id: 'beneath-the-stars', title: 'Beneath the Stars', author: 'Jessica Martin', publisher: 'Heartline Books',
    description: 'A heartwarming tale where two souls discover who they really are under one endless sky.',
    category: 'Romance', genres: ['Fiction', 'Love', 'Drama'], format: 'Hardcover', price: 499, discount: 12, tax: 12, days: 6, rating: 4.5, ratingCount: 702, sold: 1380, published: '2026-01-19',
    cover: cover('#7b2d4f', '#ffe8d6', '#ffb4a2', 'stars') },
  { id: 'final-frontier', title: 'The Final Frontier', author: 'Laura Mitchell', publisher: 'Orbit Lane',
    description: 'A mission to space secrets to change humanity forever, and the crew who must choose what to reveal.',
    category: 'Science Fiction', genres: ['Fiction', 'Sci-fi'], price: 359, discount: 8, tax: 12, days: 5, rating: 4.4, ratingCount: 351, sold: 1105, published: '2026-04-27',
    cover: cover('#0b3d6b', '#ffffff', '#ff7b54', 'rocket') },
  { id: 'vanishing-house', title: 'The Vanishing House', author: 'Clara Nelson', publisher: 'Nightfall Press',
    description: 'A chilling mystery unfolds within a house that disappears, and the family who swears it never existed.',
    category: 'Mystery', genres: ['Fiction', 'Horror'], format: 'E-book', price: 99, discount: 0, tax: 5, days: 1, rating: 4.1, ratingCount: 190, sold: 640, published: '2026-07-01',
    cover: cover('#10302b', '#cfe8dc', '#7fb99f', 'house') },
  { id: 'lost-kitten', title: 'The Lost Kitten', author: 'Emily Parker', publisher: 'Little Sprout',
    description: 'A heartwarming tale of courage, friendship and finding a way home, for readers aged 4 to 8.',
    category: "Children's", genres: ['Fiction', 'Children'], format: 'Hardcover', price: 339, discount: 10, tax: 5, days: 5, rating: 4.9, ratingCount: 450, sold: 860, published: '2026-05-30',
    cover: cover('#f97316', '#fff7ed', '#fff7ed', 'cat') },
  { id: 'dragon-crown', title: 'The Dragon’s Crown', author: 'Aria Stone', publisher: 'Orbit Lane',
    description: 'An exiled princess must unite three warring clans to reclaim a crown guarded by the last dragon.',
    category: 'Fantasy', genres: ['Fiction', 'Fantasy'], price: 449, discount: 10, tax: 12, days: 5, rating: 4.7, ratingCount: 820, sold: 2100, published: '2025-12-12',
    cover: cover('#3b0764', '#fde68a', '#fbbf24', 'crown') },
  { id: 'realm-of-embers', title: 'Realm of Embers', author: 'Aria Stone', publisher: 'Orbit Lane',
    description: 'The sequel to The Dragon’s Crown: a kingdom burns, and only a forgotten spell can quench it.',
    category: 'Fantasy', genres: ['Fiction', 'Fantasy'], format: 'Audiobook', price: 299, discount: 5, tax: 18, days: 1, rating: 4.5, ratingCount: 312, sold: 990, published: '2026-06-02',
    cover: cover('#7c2d12', '#ffedd5', '#fb923c', 'crown') },
  { id: 'echoes-of-empire', title: 'Echoes of Empire', author: 'Henry Collins', publisher: 'Chronicle House',
    description: 'A sweeping account of the rise and fall of a great empire, told through the people who lived it.',
    category: 'Historical', genres: ['Non-fiction', 'History'], format: 'Hardcover', price: 799, discount: 10, tax: 12, days: 7, rating: 4.6, ratingCount: 260, sold: 430, published: '2025-08-21',
    cover: cover('#4a3728', '#f5e6c8', '#c9a227', 'globe') },
  { id: 'letters-from-lahore', title: 'Letters from Lahore', author: 'Meera Kapoor', publisher: 'Chronicle House',
    description: 'A family saga woven through letters exchanged across a divided border over four decades.',
    category: 'Historical', genres: ['Fiction', 'History'], price: 429, discount: 10, tax: 12, days: 5, rating: 4.5, ratingCount: 377, sold: 510, published: '2026-02-28',
    cover: cover('#52796f', '#f1faee', '#e9c46a', 'book') },
  { id: 'steve-unscripted', title: 'Unscripted: The Life of a Maker', author: 'Rahul Verma', publisher: 'ABC Publishers',
    description: 'The candid biography of an inventor who failed forty times before building a company that changed an industry.',
    category: 'Biography', genres: ['Non-fiction', 'Biography'], price: 549, discount: 12, tax: 12, days: 5, rating: 4.4, ratingCount: 288, sold: 705, published: '2026-03-18',
    cover: cover('#1f2937', '#f9fafb', '#38bdf8', 'bulb') },
  { id: 'quiet-mornings', title: 'Quiet Mornings', author: 'Sofia Alvarez', publisher: 'Heartline Books',
    description: 'A memoir of leaving the city, learning to farm and discovering a slower, kinder way to live.',
    category: 'Memoir', genres: ['Non-fiction', 'Memoir'], price: 379, discount: 8, tax: 12, days: 5, rating: 4.3, ratingCount: 144, sold: 330, published: '2026-04-05',
    cover: cover('#fde68a', '#3f3f46', '#f97316', 'sun') },
  { id: 'roads-less-travelled', title: 'Roads Less Travelled', author: 'Karan Mehta', publisher: 'Wanderlust Media',
    description: 'Thirty offbeat journeys across India, with maps, budgets and stories from the road.',
    category: 'Travel', genres: ['Non-fiction', 'Travel'], price: 649, discount: 15, tax: 12, days: 6, rating: 4.6, ratingCount: 232, sold: 475, published: '2026-05-10',
    cover: cover('#065f46', '#ecfdf5', '#fcd34d', 'globe') },
  { id: 'spice-route-kitchen', title: 'The Spice Route Kitchen', author: 'Anita Rao', publisher: 'Wanderlust Media',
    description: 'One hundred home-style recipes that follow the old spice routes, from Kerala to Kashmir.',
    category: 'Cooking', genres: ['Non-fiction', 'Cooking'], format: 'Hardcover', price: 899, discount: 10, tax: 5, days: 7, rating: 4.8, ratingCount: 505, sold: 1320, published: '2025-10-09',
    cover: cover('#b91c1c', '#fff7ed', '#facc15', 'leaf') },
  { id: 'robot-who-dreamed', title: 'The Robot Who Dreamed', author: 'Tina Bose', publisher: 'Little Sprout',
    description: 'Beep is a little robot who wants to dream. A funny, tender adventure for young readers.',
    category: "Children's", genres: ['Fiction', 'Children'], price: 189, discount: 5, tax: 5, days: 3, rating: 4.7, ratingCount: 210, sold: 640, published: '2026-06-25',
    cover: cover('#0ea5e9', '#ffffff', '#fde047', 'rocket') },
  { id: 'summer-of-fireflies', title: 'Summer of Fireflies', author: 'Nora Ellis', publisher: 'Heartline Books',
    description: 'Seventeen, restless and in love for the first time during one unforgettable summer.',
    category: 'Young Adult', genres: ['Fiction', 'Young Adult', 'Love'], price: 249, discount: 10, tax: 12, days: 4, rating: 4.2, ratingCount: 398, sold: 870, published: '2026-05-15',
    cover: cover('#312e81', '#fef9c3', '#fde047', 'stars') },
  { id: 'neon-city-chronicles', title: 'Neon City Chronicles', author: 'Vikram Shah', publisher: 'Panel Pulse',
    description: 'A cyberpunk graphic novel following a courier who uncovers the city’s darkest data.',
    category: 'Comics & Graphic Novels', genres: ['Fiction', 'Graphic Novel'], price: 599, discount: 10, tax: 12, days: 5, rating: 4.5, ratingCount: 276, sold: 610, published: '2026-07-04',
    cover: cover('#111827', '#22d3ee', '#e879f9', 'moon') },
  { id: 'monsoon-verses', title: 'Monsoon Verses', author: 'Ishita Das', publisher: 'Heartline Books',
    description: 'A collection of poems on rain, memory, and the quiet strength of ordinary days.',
    category: 'Poetry', genres: ['Poetry'], price: 179, discount: 0, tax: 5, days: 3, rating: 4.6, ratingCount: 120, sold: 260, published: '2026-03-30',
    cover: cover('#164e63', '#cffafe', '#67e8f9', 'waves') },
  { id: 'the-last-act', title: 'The Last Act', author: 'Devika Menon', publisher: 'Stagecraft',
    description: 'Three one-act plays set backstage on the final night of a legendary theatre.',
    category: 'Drama', genres: ['Fiction', 'Drama'], price: 329, discount: 10, tax: 12, days: 5, rating: 4.1, ratingCount: 98, sold: 190, published: '2025-12-01',
    cover: cover('#450a0a', '#fecaca', '#f87171', 'heart') },
  { id: 'cosmos-explained', title: 'Cosmos Explained', author: 'Dr. Nikhil Sen', publisher: 'Orbit Lane',
    description: 'From black holes to the Big Bang: modern physics explained without the maths.',
    category: 'Science', genres: ['Non-fiction', 'Science'], format: 'Paperback', price: 479, discount: 10, tax: 12, days: 5, rating: 4.8, ratingCount: 610, sold: 1650, published: '2026-01-08',
    cover: cover('#0f172a', '#e0f2fe', '#38bdf8', 'stars') },
  { id: 'living-with-stoics', title: 'Living with the Stoics', author: 'Marcus Hale', publisher: 'Lotus House',
    description: 'Ancient wisdom for a modern mind: how Stoic philosophy can calm anxiety and build resilience.',
    category: 'Philosophy', genres: ['Non-fiction', 'Philosophy'], price: 399, discount: 10, tax: 12, days: 4, rating: 4.7, ratingCount: 455, sold: 1020, published: '2026-02-02',
    cover: cover('#44403c', '#fafaf9', '#d6d3d1', 'book') },
  { id: 'many-paths-one-truth', title: 'Many Paths, One Truth', author: 'Swami Anand', publisher: 'Lotus House',
    description: 'A gentle comparative look at the world’s great religions and what they share.',
    category: 'Religion', genres: ['Non-fiction', 'Religion'], price: 349, discount: 5, tax: 5, days: 5, rating: 4.4, ratingCount: 160, sold: 300, published: '2025-07-19',
    cover: cover('#7c3aed', '#faf5ff', '#fde68a', 'sun') },
  { id: 'hindi-in-30-days', title: 'Learn Hindi in 30 Days', author: 'Pooja Sharma', publisher: 'ABC Publishers',
    description: 'A daily-practice workbook with phrases, scripts and audio drills for absolute beginners.',
    category: 'Language Learning', genres: ['Non-fiction', 'Language'], language: 'English', price: 249, discount: 10, tax: 12, days: 3, rating: 4.3, ratingCount: 205, sold: 540, published: '2026-04-14',
    cover: cover('#ea580c', '#fff7ed', '#ffffff', 'book') },
  { id: 'madhurima', title: 'मधुरिमा', author: 'Sunita Joshi', publisher: 'Heartline Books',
    description: 'प्रेम, परिवार और परंपरा की एक मधुर कहानी जो हर पाठक को अपने गाँव की याद दिला देगी।',
    category: 'Romance', genres: ['Fiction', 'Love'], language: 'Hindi', price: 199, discount: 5, tax: 5, days: 4, rating: 4.4, ratingCount: 175, sold: 410, published: '2026-03-12',
    cover: cover('#be185d', '#fdf2f8', '#fbcfe8', 'heart') },
  { id: 'kokan-diaries', title: 'कोकण डायरी', author: 'Aditya Kulkarni', publisher: 'Wanderlust Media',
    description: 'कोकणातील गावे, चवी आणि माणसांच्या आठवणींचा सुंदर प्रवास.',
    category: 'Travel', genres: ['Non-fiction', 'Travel'], language: 'Marathi', format: 'E-book', price: 149, discount: 0, tax: 5, days: 1, rating: 4.5, ratingCount: 90, sold: 220, published: '2026-06-11',
    cover: cover('#0f766e', '#f0fdfa', '#99f6e4', 'waves') },
  { id: 'chennai-nights', title: 'Chennai Nights', author: 'Lakshmi Iyer', publisher: 'Nightfall Press',
    description: 'A detective returns to her hometown to solve a murder in the city’s old film district.',
    category: 'Mystery', genres: ['Fiction', 'Thriller'], language: 'Tamil', price: 279, discount: 10, tax: 12, days: 5, rating: 4.2, ratingCount: 130, sold: 350, published: '2026-05-22',
    cover: cover('#1e293b', '#f8fafc', '#f59e0b', 'moon') },
  { id: 'gitanjali-reborn', title: 'Gitanjali Reborn', author: 'Subrata Sen', publisher: 'Heartline Books',
    description: 'Fresh Bengali verse inspired by Tagore, reimagined for a new generation of readers.',
    category: 'Poetry', genres: ['Poetry'], language: 'Bengali', format: 'Audiobook', price: 99, discount: 0, tax: 5, days: 1, rating: 4.6, ratingCount: 75, sold: 180, published: '2025-11-30',
    cover: cover('#9a3412', '#ffedd5', '#fdba74', 'leaf') },
  { id: 'ultimate-guide-wealth', title: 'The Wealth Blueprint', author: 'Rohan Gupta', publisher: 'ABC Publishers',
    description: 'A premium collector’s edition on building long-term wealth, with worksheets and case studies.',
    category: 'Self-help', genres: ['Non-fiction', 'Finance'], format: 'Hardcover', price: 1199, discount: 10, tax: 12, days: 7, rating: 4.9, ratingCount: 890, sold: 2400, published: '2026-07-08',
    cover: cover('#052e16', '#ecfccb', '#facc15', 'crown') },
];

export const BOOKS: Book[] = seeds.map((s) => ({
  id: s.id,
  title: s.title,
  author: s.author,
  publisher: s.publisher,
  description: s.description,
  category: s.category,
  genres: s.genres,
  language: s.language ?? 'English',
  format: s.format ?? 'Paperback',
  price: s.price,
  discountPercent: s.discount ?? 0,
  taxPercent: s.tax ?? 12,
  deliveryDays: s.days,
  rating: s.rating,
  ratingCount: s.ratingCount ?? 100,
  sold: s.sold,
  published: s.published,
  cover: s.cover,
}));

const BIOS: Record<string, { bio: string; location: string }> = {
  'Daniel Reed': {
    location: 'San Francisco, USA',
    bio: 'Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. With a passion for intentional living, Daniel has dedicated his career to helping individuals simplify their lives - one habit, one space, and one thought at a time. He is the author of The Joy of Minimalism, an acclaimed guide to decluttering both physically and mentally. His other works include Less, But Better and The Focus Reset, which have helped thousands rethink consumerism, prioritize what truly matters, and build sustainable habits for personal growth.',
  },
};

export const WRITERS: Writer[] = Array.from(new Set(BOOKS.map((b) => b.author))).map((name) => ({
  name,
  slug: slugify(name),
  location: BIOS[name]?.location ?? 'India',
  bio:
    BIOS[name]?.bio ??
    `${name} is a published author whose work spans ${Array.from(
      new Set(BOOKS.filter((b) => b.author === name).map((b) => b.category)),
    ).join(', ')}. Readers appreciate the clear voice and the thoughtful, well-researched storytelling.`,
}));

/** Merchandising lists for the landing page sections (shown to guests / users without history). */
export const FEATURED = {
  recommended: ['art-of-focus', 'art-of-learning', 'path-to-success'],
  bestsellers: ['midnight-hour', 'beneath-the-stars', 'final-frontier'],
  newLaunches: ['joy-of-minimalism', 'vanishing-house', 'lost-kitten'],
};
