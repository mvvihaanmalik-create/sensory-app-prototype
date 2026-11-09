import { PAGES } from './listData.js';
import { PLACES as DISCOVERY_PLACES, rankPlaces, SOUND_W, LIGHT_W, CROWD_W } from './discoverData.js';

// Search fixtures for interaction testing, not live hours or sensory measurements.
export const SEARCH_GROUPS = [
  { name: 'Made for you', cards: [
    ['Fits you tonight', 'FitsYouTonight', '#c7cedf', 'Fits you\ntonight'],
    ['Like your saved places', 'LikeYourSavedPlaces', '#b6d6cf', 'Like your\nsaved\nplaces'],
    ['New in Savannah', 'NewInSavannah', '#efcbc6', 'New in\nSavannah'],
  ] },
  { name: 'Moods', cards: [
    ['Cozy', 'Cozy', '#e7cfba'], ['Low-key', 'LowKey', '#cfd7bb'],
    ['Buzzing', 'Buzzing', '#bedbe8'], ['Romantic', 'Romantic', '#e9c2cd'],
  ] },
  { name: 'Activities', cards: [
    ['Brunch', 'Brunch', '#eddbad'], ['Catchup', 'Catchup', '#c2ddd2'],
    ['Study & work', 'StudyWork', '#c8d6e4', 'Study &\nwork'], ['Live music', 'LiveMusic', '#d8cae2'],
  ] },
  { name: 'Sensory picks', cards: [
    ['Quiet now', 'QuietNow', '#c4dcd5'], ['Natural light', 'NaturalLight', '#eee0ba', 'Natural\nlight'],
    ['Outdoor seating', 'OutdoorSeating', '#ccddbe', 'Outdoor\nseating'], ['Booths & corners', 'BoothsCorners', '#e3cdbf', 'Booths &\ncorners'],
  ] },
  { name: 'Place types', cards: [
    ['Cafés', 'Cafes', '#dccdbc'], ['Restaurants', 'Restaurants', '#eccbbf'],
    ['Bakeries', 'Bakeries', '#ebd7b4'], ['Events', 'Events', '#d9cbe6'],
  ] },
];

export const FILTERS = ['Quiet', 'Natural light', 'Outdoor seating', 'Less crowded'];
// Reuse the canonical Home/list/Discovery inventory. Category membership is a
// prototype mapping; numeric sensory values and unknowns come from the repo.
const inventory = new Map();
for (const [key, page] of Object.entries(PAGES)) {
  for (const row of page.rows) {
    if (inventory.has(row.id)) continue;
    const discovered = DISCOVERY_PLACES.find(p => p.id === row.id);
    inventory.set(row.id, { ...discovered, ...row, page: key, type: row.type || (key === 'cafes' ? 'Café' : key === 'dining' ? 'Restaurant' : key === 'nightlife' ? 'Bar' : key === 'events' ? 'Event' : discovered?.cat || row.meta?.split(' · ')[0] || 'Place') });
  }
}
const artwork = { cafes: ['Cafes', '#dccdbc'], dining: ['Restaurants', '#eccbbf'], nightlife: ['Romantic', '#e9c2cd'], events: ['Events', '#d9cbe6'], more: ['LowKey', '#cfd7bb'], foryou: ['StudyWork', '#c8d6e4'] };
export const PLACES = [...inventory.values()].map(p => {
  // Foxy's venue screen explicitly describes Natural light and Patio seating.
  const lightLevel = p.id === 'foxy' ? 4 : p.l;
  const [art, color] = artwork[p.page] || artwork.more;
  const tags = [];
  const add = (condition, ...labels) => { if (condition) tags.push(...labels); };
  add(p.type === 'Café', 'Cafés', 'Brunch', 'Catchup', 'Like your saved places');
  add(p.type === 'Restaurant', 'Restaurants', 'Brunch', 'Catchup');
  add(p.type === 'Event', 'Events');
  add(/jazz|strings/i.test(p.name), 'Live music');
  add(p.s != null && p.s <= 2, 'Quiet now', 'Low-key');
  add(p.s != null && p.s >= 4, 'Buzzing');
  add(lightLevel != null && lightLevel >= 4, 'Natural light');
  add(p.seat?.includes('outdoor'), 'Outdoor seating');
  add(p.seat?.includes('booth'), 'Booths & corners', 'Cozy');
  add(p.s != null && p.s <= 2 && p.type !== 'Event', 'Cozy');
  add(p.l != null && p.l <= 2 && p.s != null && p.s <= 3, 'Romantic');
  add(p.s != null && p.s <= 2 && ['Café', 'Bookstore'].includes(p.type), 'Study & work');
  add(p.id === 'opening', 'New in Savannah');
  return { ...p, l: lightLevel, tags, art, color, area: p.type === 'Event' ? p.meta?.split(' · ')[0] || 'Savannah' : 'Savannah', distance: p.dist || p.meta?.match(/[0-9.]+ mi/)?.[0] || 'Nearby', sound: SOUND_W[p.s] || 'Unknown', light: LIGHT_W[lightLevel] || 'Unknown', crowd: CROWD_W[p.c] || 'Unknown', seating: p.seat?.includes('outdoor') ? 'Patio' : p.seat?.includes('booth') ? 'Booths' : p.seat?.includes('indoor') ? 'Indoor' : 'Unknown' };
});
// Figma includes Bakeries; the existing inventory has none. One explicit fixture
// keeps this card usable until bakery data is supplied.
PLACES.push({ id: 'bakery-demo', name: 'Auspicious Baking Co.', type: 'Bakery', area: 'Savannah', distance: '2.1 mi', s: 2, l: 4, c: 2, seat: ['outdoor'], sound: 'Quiet', light: 'Natural', crowd: 'Calm', seating: 'Patio', art: 'Bakeries', color: '#ebd7b4', tags: ['Bakeries', 'Brunch', 'Low-key', 'Cozy', 'Quiet now', 'Outdoor seating', 'Natural light', 'New in Savannah'] });

export function matchesFilters(place, filters) {
  return filters.every(f => f === 'Quiet' ? place.s != null && place.s <= 2 : f === 'Natural light' ? place.light === 'Natural' : f === 'Outdoor seating' ? ['Patio', 'Outdoor'].includes(place.seating) : place.c != null && place.c <= 2);
}
export function searchPlaces(query, category, filters, hasSavedPlace, mode) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (category === 'Like your saved places' && !hasSavedPlace) return [];
  const candidates = category === 'Fits you tonight' ? rankPlaces(mode?.prefs || {}, PLACES) : PLACES;
  return candidates.filter(p => (!category || category === 'Fits you tonight' || p.tags.includes(category)) && matchesFilters(p, filters) && words.every(word => normalize([p.name, p.type, p.area, ...p.tags].join(' ')).includes(word)));
}
