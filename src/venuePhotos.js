// Foxy Loxy photos, picked from the Figma "Venue photo sets" frame.
import hero from './assets/venue/hero.jpg';
import patio from './assets/venue/patio.jpg';
import garden from './assets/venue/garden.jpg';
import indoor from './assets/venue/indoor.jpg';
import bar from './assets/venue/bar.jpg';
import counter from './assets/venue/counter.jpg';
import tacos from './assets/venue/tacos.jpg';
import pie from './assets/venue/pie.jpg';
import store from './assets/venue/store.jpg';

export const VP = { hero, patio, garden, indoor, bar, counter, tacos, pie, store };
// One photo per seating zone on the Book a table map, in map order.
export const ZONES = [['Patio', patio], ['Garden pond', garden], ['Indoor', indoor], ['Bar', bar]];
// Photos tab grid, column by column.
export const GRID = [[patio, garden, bar, tacos], [indoor, hero, store, counter]];
export const REVIEW_PICS = [garden, patio, indoor, counter, bar, tacos, pie, store, hero];
