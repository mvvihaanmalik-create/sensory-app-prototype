// Data behind the Home-linked list pages (Figma section 905:17958).
// Each venue has a hidden sense profile so the Sound / Lighting / Crowd / Temperature / Seating
// chips can really sort the list. null = unknown, and unknown always sorts last.
// s sound (1 quiet - 5 loud), l light (1 dim - 5 bright), c crowd (1 calm - 5 packed), t temp (1 cool - 5 warm)
import e1 from './assets/lists/event1.png';
import e2 from './assets/lists/event2.png';
import e3 from './assets/lists/event3.png';
import e4 from './assets/lists/event4.png';
import m1 from './assets/lists/more1.png';
import m2 from './assets/lists/more2.png';
import m3 from './assets/lists/more3.png';
import m4 from './assets/lists/more4.png';
import m5 from './assets/lists/more5.png';
import m6 from './assets/lists/more6.png';

export const SORTS = {
  sound: { label: 'Sound', any: 'Any sound', minW: 111, opts: [['quiet', 'Quietest first'], ['talk', 'Easy to talk first'], ['lively', 'Liveliest first'], ['loud', 'Loud first']] },
  light: { label: 'Lighting', any: 'Any lighting', minW: 115, opts: [['dim', 'Dimmest first'], ['bright', 'Brightest first'], ['natural', 'Natural light first']] },
  crowd: { label: 'Crowd', any: 'Any crowd', minW: 107, opts: [['calm', 'Calmest first'], ['busy', 'Busiest first']] },
  temp: { label: 'Temperature', any: 'Any temperature', minW: 137, opts: [['cool', 'Coolest first'], ['warm', 'Warmest first']] },
  seating: { label: 'Seating', any: 'Any seating', minW: 107, opts: [['outdoor', 'Outdoor first'], ['booth', 'Booths and corners first']] },
};
export const SORT_ORDER = ['sound', 'light', 'crowd', 'temp', 'seating'];
export const sortLabel = (sense, key) => (SORTS[sense].opts.find((o) => o[0] === key) || [])[1];
const shortKey = { quiet: 'Quietest', talk: 'Easy to talk', lively: 'Liveliest', loud: 'Loud', dim: 'Dimmest', bright: 'Brightest', natural: 'Natural', calm: 'Calmest', busy: 'Busiest', cool: 'Coolest', warm: 'Warmest', outdoor: 'Outdoor', booth: 'Booths' };
export const chipText = (sense, key) => (key ? `${SORTS[sense].label} · ${shortKey[key]}` : SORTS[sense].label);

const score = (v, sense, key) => {
  const n = (x) => (x == null ? null : x);
  switch (`${sense}:${key}`) {
    case 'sound:quiet': return n(v.s);
    case 'sound:talk': return v.s == null ? null : Math.abs(v.s - 2);
    case 'sound:lively': return v.s == null ? null : Math.abs(v.s - 4);
    case 'sound:loud': return v.s == null ? null : -v.s;
    case 'light:dim': return n(v.l);
    case 'light:bright': return v.l == null ? null : -v.l;
    case 'light:natural': return v.l == null ? null : Math.abs(v.l - 4);
    case 'crowd:calm': return n(v.c);
    case 'crowd:busy': return v.c == null ? null : -v.c;
    case 'temp:cool': return n(v.t);
    case 'temp:warm': return v.t == null ? null : -v.t;
    case 'seating:outdoor': return v.seat ? (v.seat.includes('outdoor') ? 0 : 1) : null;
    case 'seating:booth': return v.seat ? (v.seat.includes('booth') ? 0 : 1) : null;
    default: return 0;
  }
};
// sorts = [[sense, key], ...] in the order they were applied; the latest is the primary sort
export function sortRows(rows, sorts) {
  if (!sorts.length) return rows;
  const order = [...sorts].reverse();
  return [...rows].sort((a, b) => {
    for (const [sense, key] of order) {
      const x = score(a, sense, key), y = score(b, sense, key);
      if (x == null && y == null) continue;
      if (x == null) return 1;
      if (y == null) return -1;
      if (x !== y) return x - y;
    }
    return 0;
  });
}

const FOXY = { id: 'foxy', name: 'Foxy Loxy Cafe', venue: true, s: 4, l: 3, c: 4, t: 3, seat: ['outdoor'] };
const SENTIENT = { id: 'sentient', name: 'The Sentient', s: 2, l: 4, c: 2, t: 3, seat: null };
const GALLERY = { id: 'gallery', name: 'Gallery Café', s: null, l: 4, c: 3, t: 3, seat: ['booth'] };

export const PAGES = {
  cafes: {
    title: 'Cafés', sub: 'Savannah, GA', chips: true, kind: 'venue',
    rows: [
      { ...FOXY, meta: 'Café · 0.5 mi', tags: [['blue', 'Lively inside'], ['blue', 'Patio available']] },
      { ...SENTIENT, meta: 'Café · 0.8 mi', tags: [['grey', 'Seating unknown']] },
      { ...GALLERY, meta: 'Café · 1.1 mi', tags: [['grey', 'Sound unknown']] },
      { id: 'bean', name: 'Sentient Bean', meta: 'Café · 1.4 mi · illustrative', tags: [['blue', 'Calm atmosphere']], s: 1, l: 3, c: 1, t: 3, seat: ['booth'] },
    ],
  },
  dining: {
    title: 'Dining', sub: 'Savannah, GA', chips: true, kind: 'venue',
    rows: [
      { id: 'grey', name: 'The Grey', meta: 'American · 0.7 mi · illustrative', tags: [['blue', 'Calm dining room'], ['blue', 'Dim lighting']], s: 2, l: 2, c: 2, t: 3, seat: ['indoor'] },
      { id: 'husk', name: 'Husk Savannah', meta: 'Southern · 0.9 mi · illustrative', tags: [['grey', 'Sound unknown'], ['blue', 'Indoor seating']], s: null, l: 3, c: 4, t: 3, seat: ['indoor'] },
      { id: 'cotton', name: 'Cotton & Rye', meta: 'American · 1.2 mi · illustrative', tags: [['blue', 'Moderate crowd']], s: 3, l: 3, c: 3, t: 3, seat: ['indoor', 'booth'] },
      { id: 'kitchen', name: 'The Public Kitchen', meta: 'American · 1.5 mi · illustrative', tags: [['grey', 'Lighting unknown']], s: 3, l: null, c: 3, t: 3, seat: ['indoor'] },
    ],
  },
  nightlife: {
    title: 'Nightlife', sub: 'Savannah, GA', chips: true, kind: 'venue',
    rows: [
      { id: 'rocks', name: 'Rocks on the Roof', meta: 'Bar · 0.4 mi · illustrative', tags: [['red', 'Louder evenings'], ['blue', 'Rooftop seating']], s: 5, l: 2, c: 5, t: 2, seat: ['outdoor'] },
      { id: 'lanie', name: "Lanie's", meta: 'Jazz bar · 0.8 mi · illustrative', tags: [['blue', 'Live jazz'], ['grey', 'Lighting unknown']], s: 4, l: null, c: 4, t: 3, seat: ['booth'] },
      { id: 'alligator', name: 'Alligator Soul', meta: 'Cocktail bar · 1.0 mi · illustrative', tags: [['blue', 'Calm atmosphere']], s: 2, l: 2, c: 2, t: 3, seat: ['booth'] },
      { id: 'treehouse', name: 'Treehouse', meta: 'Bar · 1.3 mi · illustrative', tags: [['grey', 'Crowd unknown']], s: 3, l: 2, c: null, t: 3, seat: ['outdoor'] },
    ],
  },
  events: {
    title: 'Events', sub: 'Example schedule · November 2026', chips: true, kind: 'event',
    rows: [
      { id: 'strings', img: e1, when: 'Sun, Nov 15 · 2–4 PM', name: 'Lunchtime Strings', meta: 'The Sentient · 0.8 mi · Sound unknown', s: null, l: 3, c: 3, t: 3, seat: ['indoor'] },
      { id: 'jazz', img: e2, when: 'Mon, Nov 16 · 7–9 PM', name: 'Jazz Fest – Quiet Set', meta: 'The Lucas Theatre · 0.6 mi · Seated', s: 2, l: 2, c: 4, t: 3, seat: ['indoor'] },
      { id: 'walk', img: e3, when: 'Wed, Nov 18 · 10 AM–12 PM', name: 'Morning Art Walk', meta: 'Forsyth Park · 0.3 mi · Outdoor', s: 2, l: 5, c: 2, t: 3, seat: ['outdoor'] },
      { id: 'opening', img: e4, when: 'Fri, Nov 20 · 6:30–10 PM', name: 'Gallery Opening', meta: 'Gallery Café · 1.1 mi · Sound unknown', s: null, l: 4, c: 4, t: 3, seat: ['indoor'] },
    ],
  },
  more: {
    title: 'More', chips: true, kind: 'more', back: 52, head: 62,
    rows: [
      { id: 'zen', img: m1, name: 'Zen Massage Studio', dist: '0.4 mi', type: 'Massage & Spa', checks: ['Quiet', 'Dim'], s: 1, l: 2, c: 1, t: 4, seat: null },
      { id: 'gloss', img: m2, name: 'Gloss Nail Bar', dist: '0.6 mi', type: 'Nail Salon', checks: ['Moderate', 'Bright'], s: 3, l: 5, c: 3, t: 3, seat: null },
      { id: 'bloom', img: m3, name: 'Bloom Hair Studio', dist: '0.8 mi', type: 'Hair Salon', checks: ['Loud', 'Busy'], s: 5, l: 4, c: 5, t: 3, seat: null },
      { id: 'page', img: m4, name: 'Page & Co.', dist: '1.1 mi', type: 'Bookstore', checks: ['Quiet', 'Warm'], s: 1, l: 3, c: 1, t: 4, seat: null },
      { id: 'core', img: m5, name: 'Core Fitness', dist: '1.2 mi', type: 'Gym', checks: ['Moderate', 'Bright'], s: 3, l: 5, c: 3, t: 2, seat: null },
      { id: 'white', img: m6, name: 'The White Space', dist: '1.4 mi', type: 'Art Gallery', checks: ['Quiet', 'Natural'], s: 1, l: 4, c: 1, t: 3, seat: null },
    ],
  },
  foryou: {
    title: 'For You', banner: true, kind: 'pick', back: 52, head: 61,
    rows: [
      { ...SENTIENT, meta: 'Café · 0.8 mi', line: 'Quiet hour 2–4 pm · seating unknown' },
      { ...FOXY, meta: 'Café · 0.5 mi', line: 'Back patio · art gallery feel' },
      { id: 'graveface', name: 'Graveface Books', meta: 'Bookstore · 0.6 mi · illustrative', line: 'Very quiet · indoor seating' },
      { ...GALLERY, meta: 'Café · 1.1 mi', line: 'Sound and seating unknown' },
    ],
  },
  popular: {
    title: 'Popular Around You', sub: 'Savannah, GA', kind: 'rank', back: 71, head: 75, listTop: 161,
    rows: [
      { ...FOXY, meta: 'Café · 0.5 mi', line: 'Busiest café in the area' },
      { ...SENTIENT, meta: 'Café · 0.8 mi', line: 'Popular for patio dining' },
      { ...GALLERY, meta: 'Café · 1.1 mi', line: 'Trending in Midtown · illustrative' },
      { id: 'grey', name: 'The Grey', meta: 'American · 0.7 mi · illustrative', line: 'High visits this week · illustrative' },
    ],
  },
};
export const PAGE_IDS = Object.keys(PAGES);
