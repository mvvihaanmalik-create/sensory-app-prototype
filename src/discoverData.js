import { PAGES } from './listData.js';
// Data and matching rules for Hidden Discovery Mode (the pull-down layer under Home).
// Sense values reuse the hidden profiles in listData.js: s sound, l light, c crowd (1 low - 5 high), null = unknown.
// level is the overall sensory level (1 calmest - 5 most intense). Home shows Foxy Loxy 2, The Sentient 2, Gallery Café 1.

export const PLACES = [
  { id: 'sentient', name: 'The Sentient', cat: 'Café', dist: '0.8 mi', level: 2, s: 2, l: 4, c: 2, seat: null, scene: 'quiet', tone: 'warm' },
  { id: 'white', name: 'The White Space', cat: 'Art gallery', dist: '1.4 mi', level: 1, s: 1, l: 4, c: 1, seat: null, scene: 'gallery', tone: 'cool' },
  { id: 'page', name: 'Page & Co.', cat: 'Bookstore', dist: '1.1 mi', level: 1, s: 1, l: 3, c: 1, seat: null, scene: 'books', tone: 'warm' },
  { id: 'walk', name: 'Morning Art Walk', cat: 'Events', dist: '0.3 mi', level: 2, s: 2, l: 5, c: 2, seat: ['outdoor'], scene: 'park', event: 'Wed, Nov 18 · 10 AM–12 PM' },
  { id: 'gallery', name: 'Gallery Café', cat: 'Café', dist: '1.1 mi', level: 1, s: null, l: 4, c: 3, seat: ['booth'], scene: 'gallery', tone: 'warm' },
  { id: 'graveface', name: 'Graveface Books', cat: 'Bookstore', dist: '0.6 mi', level: 1, s: 1, l: null, c: null, seat: ['indoor'], scene: 'books', tone: 'cool', illustrative: true },
  { id: 'grey', name: 'The Grey', cat: 'Dining', dist: '0.7 mi', level: 2, s: 2, l: 2, c: 2, seat: ['indoor'], scene: 'dining', illustrative: true },
  { id: 'foxy', name: 'Foxy Loxy Cafe', cat: 'Café', dist: '0.5 mi', level: 2, s: 4, l: 3, c: 4, seat: ['outdoor'], scene: 'awning', venue: true, perk: 'Back patio and a gallery feel' },
  { id: 'rocks', name: 'Rocks on the Roof', cat: 'Nightlife', dist: '0.4 mi', level: 4, s: 5, l: 2, c: 5, seat: ['outdoor'], scene: 'night', tone: 'indigo', illustrative: true, perk: 'Rooftop seating' },
  { id: 'lanie', name: "Lanie's", cat: 'Nightlife', dist: '0.8 mi', level: 3, s: 4, l: null, c: 4, seat: ['booth'], scene: 'night', tone: 'plum', illustrative: true, perk: 'Live jazz' },
];

export const SOUND_W = [null, 'Very quiet', 'Quiet', 'Moderate', 'Lively', 'Loud'];
export const LIGHT_W = [null, 'Very dim', 'Dim', 'Warm', 'Natural', 'Bright'];
export const CROWD_W = [null, 'Very calm', 'Calm', 'Moderate', 'Busy', 'Packed'];

export const metaOf = (p) => [p.cat, p.dist, p.illustrative ? 'illustrative' : null].filter(Boolean).join(' · ');

// 1 when v sits inside [lo, hi], otherwise falls off over two steps. null (unknown) is neutral.
const fit = (v, lo, hi) => (v == null ? null : v >= lo && v <= hi ? 1 : Math.max(0, 1 - (v < lo ? lo - v : v - hi) / 2));
const RANGE = {
  sound: { Quiet: [1, 2], 'Easy to talk': [2, 3], Moderate: [3, 3], Lively: [4, 4], Loud: [5, 5] },
  bright: { Dim: [1, 2], Soft: [3, 3], Bright: [4, 5] },
  src: { 'Natural daylight': [4, 5], 'Indirect light': [2, 3] },
  crowd: { Relaxed: [1, 2], Moderate: [3, 3], Busy: [4, 5] },
};

// One entry per preference the active mode actually sets: { k, fit (null = unknown) }
function checks(p, prefs) {
  const out = [];
  const add = (k, f) => out.push({ k, fit: f });
  if (prefs.sound) add('sound', fit(p.s, ...RANGE.sound[prefs.sound]));
  if (prefs.light?.b) add('light', fit(p.l, ...RANGE.bright[prefs.light.b]));
  else if (prefs.light?.src) add('light', fit(p.l, ...RANGE.src[prefs.light.src]));
  if (prefs.crowd) add('crowd', fit(p.c, ...RANGE.crowd[prefs.crowd]));
  if (prefs.temp) { const t = Object.values(PAGES).flatMap(page => page.rows).find(row => row.id === p.id)?.t; const range = { Cool: [1, 2], Mild: [3, 3], Warm: [4, 5] }[prefs.temp]; add('temp', fit(t, ...range)); }
  const pos = prefs.seat?.pos;
  if (pos === 'Corner seat' || pos === 'Booth') add('seat', p.seat ? (p.seat.includes('booth') ? 1 : 0.3) : null);
  if (pos === 'Patio') add('seat', p.seat ? (p.seat.includes('outdoor') ? 1 : 0.2) : null);
  return out;
}

const score = (p, prefs) => {
  const cs = checks(p, prefs);
  if (!cs.length) return 0.5;
  return cs.reduce((a, c) => a + (c.fit == null ? 0.5 : c.fit), 0) / cs.length;
};

// Best matches first; equal scores keep the authored order.
export function rankPlaces(prefs, places = PLACES) {
  return places.map((p, i) => ({ p, i, sc: score(p, prefs) })).sort((a, b) => b.sc - a.sc || a.i - b.i).map((x) => x.p);
}

const PHRASE = {
  sound: (p) => (p.s <= 2 ? 'Quiet inside' : p.s === 3 ? 'Moderate sound' : p.s === 4 ? 'Lively atmosphere' : 'Loud and energetic'),
  light: (p) => (p.l >= 4 ? 'Plenty of natural light' : p.l <= 2 ? 'Dim, soft lighting' : 'Warm lighting'),
  crowd: (p) => (p.c <= 2 ? 'Usually calm' : p.c === 3 ? 'Steady, not packed' : 'A busy, social crowd'),
  seat: (p, prefs) => (prefs.seat?.pos === 'Patio' ? 'Outdoor seating' : 'Booths and corners'),
};
const CAVEAT = {
  sound: (p) => (p.seat && p.seat.includes('outdoor') ? 'inside runs lively, so ask for the patio' : 'it can get loud'),
  light: () => 'the lighting is not what you asked for',
  crowd: () => 'it gets busy',
  seat: () => 'seating may not match',
};
const low = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const list = (a) => (a.length < 2 ? a[0] : `${[a[0], ...a.slice(1, -1).map(low)].join(', ')} and ${low(a[a.length - 1])}`);

// Why this place is on the card: what matches the active mode, what is unknown, and one honest heads-up.
export function reasonFor(p, prefs, modeName) {
  const cs = checks(p, prefs);
  if (!cs.length) return { line: 'Picked from places near you. Set preferences in your mode to tune this.', note: null };
  const hit = cs.filter((c) => c.fit != null && c.fit >= 0.85).map((c) => PHRASE[c.k](p, prefs)).slice(0, 3);
  const miss = cs.find((c) => c.fit != null && c.fit < 0.5);
  const unknown = cs.filter((c) => c.fit == null).map((c) => (c.k === 'light' ? 'lighting' : c.k === 'seat' ? 'seating' : c.k));
  const line = hit.length ? `${list(hit)}. Fits your ${modeName}.` : p.perk ? `${p.perk}. A softer match for your ${modeName}.` : `Not a full match for your ${modeName} yet.`;
  const note = miss ? `Heads up: ${CAVEAT[miss.k](p)}.` : unknown.length ? `We don't know the ${list(unknown)} here yet.` : null;
  return { line, note };
}

