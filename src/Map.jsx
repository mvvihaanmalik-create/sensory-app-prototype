// Map (Figma "Map" section 568:1903): Default, Sheet half / tall / full, four sense layers, Filters.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react';
import { uri } from './svgs.js';
import { Glass, GENTLE, NAVY, useScale } from './ui.jsx';
import { TAP, t } from './flow.jsx';
import { Ph } from './phosphor.jsx';
import { FSeg, FSwitch, FRow, FHead, FCard, Any } from './settingsKit.jsx';
import { SheetFrame } from './sheets.jsx';
import { PLACES as SEARCH_PLACES } from './searchData.js';
import { PHOTO } from './remainingPhotos.js';
import mapTiles from './assets/map-tiles.jpg';

const INK = '#2a2650', SUB = '#5e5a7e';
// Sheet tops: full screen, tall, half, peek (Default).
export const SNAP = { full: 0, tall: 302, half: 616, peek: 764 };
const SNAPS = [SNAP.full, SNAP.tall, SNAP.half, SNAP.peek];
const ALIAS = { hidden: 'peek' };

const RECS = [
  { id: 'foxy', title: 'Fern & Fable', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Fits you · Quiet · natural light', photo: PHOTO.p0602 },
  { id: 'sentient', title: 'The Sentient', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Fits you · Quiet · natural light', photo: PHOTO.p0607 },
  { id: 'gallery', title: 'Juniper Coffee', meta: 'Level 3 · 0.5 mi · Updated 1h ago', reason: 'Mostly fits · More crowded', photo: PHOTO.p0608 },
];

function Recommendation({ r, onOpen, saved, onToggleSaved }) {
  return (
    <div onClick={onOpen} style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 8, cursor: onOpen ? 'pointer' : 'default' }}>
      <div style={{ width: 400, height: 191, borderRadius: 8, background: `#d7d7d7 url(${r.photo}) center / cover` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 400 }}>
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={t(17, 600, INK)}>{r.title}</p>
          <p style={t(12, 400, SUB)}>{r.meta}</p>
        </div>
        <motion.button aria-label="Save venue" aria-pressed={saved} onClick={(e) => { e.stopPropagation(); onToggleSaved(r.id); }}
          whileTap={{ scale: 0.8 }} transition={TAP} style={{ width: 44, height: 44, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={saved ? 'on' : 'off'} initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
              <Ph n={saved ? 'bookmark-simple-fill' : 'bookmark-simple'} size={20} fill={SUB} />
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
      <p style={t(12, 400, SUB)}>{r.reason}</p>
    </div>
  );
}

// Four pin slots, same spots on every layer. [pin x, pin y, label x]
const SLOTS = [[83, 228], [278, 223], [218, 368], [73, 553]];
// Each layer: [icon, ring colour, place, label x, intensity 0-2 (drives the pulse speed)]
const LAYERS = {
  None: [['coffee', null, 'Juniper Coffee', 51], ['fork-knife', null, 'Willow Table', 256], ['martini', null, "Lanie's", 203], ['ticket', null, 'Art Walk', 53]],
  Sound: [['speaker-none', '#3fa06b', 'Juniper Coffee', 51, 0], ['speaker-high', '#d84b43', "Lanie's", 263, 2], ['speaker-high', '#f29a3a', 'Fern & Fable', 186, 1], ['speaker-low', '#3fa06b', 'Willow Table', 51, 0]],
  Light: [['sun-horizon', '#ddb65c', 'Copper Window Café', 45, 1], ['sun-dim', '#8e89a8', 'Husk', 269, 0], ['sun', '#f4d77a', 'Page & Co.', 190, 2], ['lamp', '#b79a72', 'Fern & Fable', 41, 1]],
  Crowd: [['user', '#3fa06b', 'Cotton & Rye', 47, 0], ['users-three', '#d84b43', 'Treehouse', 252, 2], ['users', '#f29a3a', 'The Sentient', 184, 1], ['user', '#3fa06b', 'Juniper Coffee', 41, 0]],
  Temperature: [['thermometer', '#b9b4cc', 'Willow Table', 61, 0], ['snowflake', '#8db8e8', 'Copper Window Café', 240, 1], ['sun', '#f2a65a', 'The Sentient', 184, 1], ['snowflake', '#3e73c9', 'Juniper Coffee', 41, 2]],
};
const PULSE = [3.2, 2.2, 1.4];


// ---------- Live map tiles + extra places ----------
// Map space = pixels at tile zoom 16, with (0,0) at the top-left of the default screen. Pins live in this space.
const Z0 = 16, WORLD = 256 * 2 ** Z0, CENTER = [32.0735, -81.094];
const mercPx = (lat, lng) => [((lng + 180) / 360) * WORLD, ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * WORLD];
const [CPX, CPY] = mercPx(CENTER[0], CENTER[1]);
const ORIGIN = [CPX - 220, CPY - 478];
const TILE_HOSTS = ['a', 'b', 'c', 'd'];
// Tiles: CARTO Voyager (double resolution). If a CARTO tile ever fails, that tile falls back to keyless OpenStreetMap.
const CARTO_KEY = 'cb1_59q2_1_a2c0989975efa436121208af';
const tileUrl = (z, x, y) => `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png?key=${CARTO_KEY}`;
const osmUrl = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const MINZ = 0.3, MAXZ = 3.2, REACH = 2600;
const bounds = (s) => ({ minX: 220 - s * (220 + REACH), maxX: 220 + s * (REACH - 220), minY: 478 - s * (478 + REACH), maxY: 478 + s * (REACH - 478) });

function Tiles({ view, onLoaded }) {
  const [set, setSet] = useState({ z: Z0, x0: 0, x1: -1, y0: 0, y1: -1 });
  useEffect(() => {
    const calc = () => {
      const s = view.s.get(), vx = view.x.get(), vy = view.y.get();
      const z = Math.max(13, Math.min(19, Math.round(Z0 + Math.log2(s))));
      const size = 256 * 2 ** (Z0 - z); // tile edge in map px
      const wx0 = -vx / s + ORIGIN[0] - size, wy0 = -vy / s + ORIGIN[1] - size;
      const wx1 = (440 - vx) / s + ORIGIN[0], wy1 = (956 - vy) / s + ORIGIN[1];
      const next = { z, x0: Math.floor(wx0 / size), x1: Math.floor(wx1 / size), y0: Math.floor(wy0 / size), y1: Math.floor(wy1 / size) };
      setSet((cur) => (cur.z === next.z && cur.x0 === next.x0 && cur.x1 === next.x1 && cur.y0 === next.y0 && cur.y1 === next.y1 ? cur : next));
    };
    calc();
    const offs = [view.x.on('change', calc), view.y.on('change', calc), view.s.on('change', calc)];
    return () => offs.forEach((o) => o());
  }, []);
  const layers = [];
  for (const z of [Math.max(13, set.z - 2), set.z]) {
    const k = 2 ** (set.z - z); // coarser underlay covers the same ground with bigger tiles
    const size = 256 * 2 ** (Z0 - z);
    const x0 = Math.floor(set.x0 / k), x1 = Math.floor(set.x1 / k), y0 = Math.floor(set.y0 / k), y1 = Math.floor(set.y1 / k);
    for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) {
      layers.push(<img key={`${z}/${tx}/${ty}`} className="mp-tile abs" alt="" draggable={false} src={tileUrl(z, tx, ty)} onLoad={(e) => { e.currentTarget.style.opacity = 1; onLoaded(); }} onError={(e) => { if (!e.currentTarget.dataset.fb) { e.currentTarget.dataset.fb = '1'; e.currentTarget.src = osmUrl(z, tx, ty); } }}
        style={{ opacity: 0, transition: 'opacity .25s', left: tx * size - ORIGIN[0], top: ty * size - ORIGIN[1], width: size + 0.6, height: size + 0.6, pointerEvents: 'none' }} />);
    }
  }
  return <motion.div className="abs" style={{ left: 0, top: 0, width: 0, height: 0, transformOrigin: '0 0', x: view.x, y: view.y, scale: view.s, pointerEvents: 'none' }}>{layers}</motion.div>;
}

// Made-up places around the default screen. Sense values 0 calm .. 2 intense (temperature 0 cold .. 3 warm).
const EXTRA_NAMES = {
  Cafés: ['Moon River Coffee', 'Tide & Tin', 'Sugar Maple Café', 'Little Owl Roasters', 'Chatham Bean', 'Marigold Café', 'Oak & Ember Coffee', 'The Quiet Cup', 'Bay Leaf Bakery', 'Pelican Espresso', 'Sable Coffee Co.', 'Verbena Café', 'Daybreak Roasters', 'Linden Tea House'],
  Dining: ['Harbor Table', 'Magnolia Kitchen', 'The Lantern Room', 'Saltmarsh Supper Club', 'Olive & Oak', 'Cedar Hearth', 'Bluebird Bistro', 'Camellia Dining', 'The Garden Gate', 'Rosemary & Rye', 'Tybee Tide Kitchen', 'Orchard Street Eatery', 'Fig & Thistle', 'Lowcountry Pantry'],
  Nightlife: ['Velvet Anchor', 'The Copper Door', 'Lamplight Lounge', 'Nightjar', 'Dockside Social', 'Gaslight Bar', 'The Low Tide', 'Juniper & Rye', 'Starboard', 'The Blue Heron', 'Palmetto Room', 'Amber Hour', 'Crescent Club', 'Whistle Stop'],
  Events: ['Riverfront Art Walk', 'Square Jazz Evening', 'Sunday Makers Market', 'Poetry in the Park', 'Lantern Walk', 'Quiet Morning Yoga', 'Harbor Film Night', 'Farmers Market', 'Gallery Late Hours', 'Storytelling Circle', 'Garden Open Day', 'Acoustic on the Green', 'Craft Fair', 'Book Swap Social'],
};
const CAT_ICON = { Cafés: 'coffee', Dining: 'fork-knife', Nightlife: 'martini', Events: 'ticket' };
const EXTRAS = (() => {
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const out = [], taken = [];
  const inDefault = (x, y) => x > -50 && x < 490 && y > 20 && y < 1000; // keep the default screen exactly as designed
  const nearForsyth = (x, y) => x > 90 && x < 360 && y > 660 && y < 1060; // park
  for (const cat of Object.keys(EXTRA_NAMES)) EXTRA_NAMES[cat].forEach((name) => {
    let x, y, tries = 0;
    do { x = -700 + rnd() * 1900; y = 230 + rnd() * 1500; tries++; }
    while (tries < 60 && (inDefault(x, y) || nearForsyth(x, y) || taken.some(([a, b]) => Math.hypot(a - x, b - y) < 70)));
    taken.push([x, y]);
    const sound = Math.floor(rnd() * 3), light = Math.floor(rnd() * 3), crowd = Math.floor(rnd() * 3), temp = Math.floor(rnd() * 4);
    out.push({ id: `x-${out.length}`, name, cat, x, y, sound, light, crowd, temp, level: 1 + Math.round((sound + light + crowd) / 3) });
  });
  return out;
})();
// Same icons and colours as the sense layers on the original pins.
const SENSE_LOOK = {
  Sound: [['speaker-low', '#3fa06b'], ['speaker-high', '#f29a3a'], ['speaker-high', '#d84b43']],
  Light: [['sun-dim', '#8e89a8'], ['lamp', '#b79a72'], ['sun', '#f4d77a']],
  Crowd: [['user', '#3fa06b'], ['users', '#f29a3a'], ['users-three', '#d84b43']],
  Temperature: [['snowflake', '#3e73c9'], ['snowflake', '#8db8e8'], ['thermometer', '#b9b4cc'], ['sun', '#f2a65a']],
};
const SENSE_KEY = { Sound: 'sound', Light: 'light', Crowd: 'crowd', Temperature: 'temp' };

function ExtraPin({ v, sense, view, selected, onSelect }) {
  const look = sense === 'None' ? null : SENSE_LOOK[sense][v[SENSE_KEY[sense]]];
  const icon = look ? look[0] : CAT_ICON[v.cat], ring = look ? look[1] : null;
  const small = useTransform(view.s, [0.55, 0.9], [0.68, 1], { clamp: true });
  const lvl = look ? (sense === 'Temperature' ? Math.min(2, v.temp) : v[SENSE_KEY[sense]]) : 0;
  const showLabel = useTransform(view.s, (s) => (s >= 1.25 ? 1 : 0));
  return (
    <Anchored wx={v.x} wy={v.y} view={view}>
      <motion.div className="abs" style={{ left: -22, top: -22, width: 44, height: 44, scale: small, zIndex: selected ? 5 : 1, pointerEvents: 'auto', cursor: 'pointer' }}
        initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(e) => e.stopPropagation()} onClick={() => onSelect(selected ? null : v.id)} whileTap={{ scale: 0.9 }}>
        {ring && <span className="mp-ping" style={{ '--c': ring, '--d': `${PULSE[lvl]}s`, animationDelay: `${-(v.x % 7) * 0.3}s` }} />}
        <div className="abs" style={{ inset: 0, borderRadius: 22, background: '#fff', border: `2.5px solid ${ring || 'rgba(42,38,80,0.25)'}`, boxShadow: selected ? '0 6px 16px rgba(20,26,38,0.32)' : '0 4px 10px rgba(20,26,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: selected ? 'scale(1.12)' : undefined, transition: 'transform .15s' }}>
          <span className={ring ? `mp-ico mp-${sense.toLowerCase()}` : ''} style={{ '--d': `${PULSE[lvl]}s`, display: 'flex' }}><Ph n={icon} size={22} fill={INK} /></span>
        </div>
      </motion.div>
      <motion.div className="abs" style={{ left: 0, top: 30, opacity: selected ? 1 : showLabel, pointerEvents: 'none', x: '-50%' }}>
        <Glass radius={22} angle="166deg" style={{ position: 'relative', height: 36 }} contentStyle={{ padding: '0 13px' }}>
          <span className="nowrap" style={t(13, 500, INK)}>{v.name}{selected ? ` · Level ${v.level}` : ''}</span>
        </Glass>
      </motion.div>
    </Anchored>
  );
}

// Pins and labels live in map space: they follow pan and zoom but keep their size.
function Anchored({ wx, wy, view, children }) {
  const x = useTransform([view.x, view.s], ([vx, s]) => wx * s + vx);
  const y = useTransform([view.y, view.s], ([vy, s]) => wy * s + vy);
  return <motion.div className="abs" style={{ left: 0, top: 0, width: 0, height: 0, x, y, pointerEvents: 'none' }}>{children}</motion.div>;
}

function Pin({ icon, ring, level, i, layer, view }) {
  const small = useTransform(view.s, [0.55, 0.9], [0.68, 1], { clamp: true });
  return (
    <Anchored wx={SLOTS[i][0]} wy={SLOTS[i][1]} view={view}>
    <motion.div className="abs" style={{ left: 0, top: 0, width: 44, height: 44, scale: small }}>
    <motion.div className="abs" style={{ left: 0, top: 0, width: 44, height: 44 }}
      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.04 + i * 0.05 }}>
      {ring && <span className="mp-ping" style={{ '--c': ring, '--d': `${PULSE[level]}s`, animationDelay: `${-i * 0.6}s` }} />}
      <div className="abs" style={{ inset: 0, borderRadius: 22, background: '#fff', border: `2.5px solid ${ring || 'rgba(42,38,80,0.25)'}`, boxShadow: '0 4px 10px rgba(20,26,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className={ring ? `mp-ico mp-${layer.toLowerCase()}` : ''} style={{ '--d': `${PULSE[level ?? 0]}s`, display: 'flex' }}><Ph n={icon} size={22} fill={INK} /></span>
      </div>
    </motion.div>
    </motion.div>
    </Anchored>
  );
}

function PinLabel({ i, name, lx, sense, view }) {
  const vis = useTransform(view.s, [0.6, 0.8], [0, 1], { clamp: true });
  return (
    <Anchored wx={SLOTS[i][0]} wy={SLOTS[i][1]} view={view}>
      <motion.div className="abs" style={{ left: lx - SLOTS[i][0], top: 48, opacity: vis }}>
      <motion.div className="abs" style={{ left: 0, top: 0 }}
        initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ ...GENTLE, delay: 0.1 + i * 0.05 }}>
        <Glass radius={22} angle="166deg" style={{ position: 'relative', height: 44 }} contentStyle={{ padding: '0 15px' }}>
          <span className="nowrap" style={t(14, 500, INK)}>{name}</span>
        </Glass>
      </motion.div>
      </motion.div>
    </Anchored>
  );
}

const CHIPS = ['All', 'Cafés', 'Dining', 'Nightlife', 'Events'];
// Pin slot k is always one category: Cafés, Dining, Nightlife, Events
const SLOT_CHIP = ['Cafés', 'Dining', 'Nightlife', 'Events'];
const CHIP_TYPE = { Cafés: 'Café', Dining: 'Restaurant', Nightlife: 'Bar', Events: 'Event' };
const recsFor = (chip) => {
  if (chip === 'All' || chip === 'Cafés') return RECS;
  return SEARCH_PLACES.filter((p) => p.type === CHIP_TYPE[chip]).slice(0, 4).map((p) => ({ id: p.id, title: p.name, meta: `Level ${p.level} · ${p.distance} · Updated 1h ago`, reason: `${p.sound} · ${p.light}`, photo: p.photo }));
};
const SENSES = [
  { key: 'Sound', icon: 'speaker-high' },
  { key: 'Light', icon: 'sun' },
  { key: 'Crowd', icon: 'users' },
  { key: 'Temperature', icon: 'thermometer', short: 'Temp' },
];

// ---------- Filters (Figma 1378:326) ----------
const F_DEFAULT = { mode: null, sort: 'Best fit', open: true, dist: 'Walk', price: 'Any', verified: false, sound: 'Any', light: 'Any', crowd: 'Any', temp: 'Any', seat: 'Any', place: 'All', looking: 'Any', avoid: 'None', smell: 'None' };
const PICK = {
  sound: ['Any', 'Quiet', 'Easy to talk', 'Moderate', 'Lively', 'Loud'],
  light: ['Any', 'Dim', 'Soft', 'Bright', 'Natural daylight'],
  crowd: ['Any', 'Relaxed', 'Moderate', 'Busy'],
  temp: ['Any', 'Cool', 'Mild', 'Warm'],
  seat: ['Any', 'Booth', 'Corner seat', 'Patio'],
  place: ['All', 'Cafés', 'Dining', 'Nightlife', 'Events'],
  looking: ['Any', 'Quiet', 'Natural light', 'Outdoor seating', 'Less crowded'],
  avoid: ['None', 'Loud', 'Crowded', 'Bright'],
  smell: ['None', 'Smoke', 'Perfume', 'Cooking'],
};
function Filters({ value, onChange, onClose }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  const [picker, setPicker] = useState(null);
  const pick = (key, label, icon, last) => (
    <FRow icon={icon} label={label} last={last} onClick={() => setPicker({ key, label })}><Any v={value[key]} /></FRow>
  );
  return (
    <motion.div className="abs" style={{ inset: 0, background: '#f7f5f1', zIndex: 30 }}
      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={GENTLE}>
      <div className="scroll" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ padding: '124px 24px 150px', display: 'flex', flexDirection: 'column' }}>
          <FHead>MODE</FHead>
          <div className="hscroll" style={{ margin: '0 -24px -20px', padding: '24px 24px 40px', display: 'flex', gap: 8 }}>
            {['Everyday', 'Study', 'Hang out', 'Date', 'Night out', 'Family'].map((m) => {
              const on = value.mode === m;
              return (
                <motion.button key={m} onClick={() => set('mode')(on ? null : m)} whileTap={{ scale: 0.95 }} transition={GENTLE}
                  className="glass" style={{ position: 'relative', height: 44, borderRadius: 22, flex: 'none', '--ga': '157.6deg' }}>
                  <div className="g-bg" style={on ? { background: 'rgba(255,255,255,0.92)' } : undefined} />
                  <span className="g-c nowrap" style={{ padding: '0 22px', ...t(15, on ? 600 : 500, on ? INK : 'rgba(42,38,80,0.8)') }}>{m}</span>
                  <div className="g-in" />
                </motion.button>
              );
            })}
          </div>
          <FHead>BASICS</FHead>
          <div style={{ height: 24 }} />
          <FCard>
            <FRow icon="sort-ascending" label="Sort"><FSeg options={['Best fit', 'Nearest', 'Top rated']} value={value.sort} onChange={set('sort')} /></FRow>
            <FRow icon="clock" label="Open now"><FSwitch on={value.open} onChange={set('open')} /></FRow>
            <FRow icon="person-simple-walk" label="Distance"><FSeg options={['Walk', '1 mi', '5 mi']} value={value.dist} onChange={set('dist')} /></FRow>
            <FRow icon="currency-dollar" label="Price" last><FSeg options={['$', '$$', '$$$', 'Any']} value={value.price} onChange={set('price')} /></FRow>
          </FCard>
          <div style={{ height: 24 }} />
          <FHead>COMFORT</FHead>
          <div style={{ height: 24 }} />
          <FCard>
            {pick('sound', 'Sound', 'speaker-high')}
            {pick('light', 'Light', 'sun')}
            {pick('crowd', 'Crowd', 'users')}
            {pick('temp', 'Temperature', 'thermometer-simple')}
            {pick('seat', 'Seating', 'armchair', true)}
          </FCard>
          <div style={{ height: 24 }} />
          <FHead>MORE</FHead>
          <div style={{ height: 24 }} />
          <FCard>
            {pick('place', 'Place type', 'squares-four')}
            {pick('looking', 'Looking for', 'check-circle')}
            {pick('avoid', 'Not for me', 'prohibit')}
            {pick('smell', 'Smells I’d skip', 'wind')}
            <FRow icon="seal-check" label="Verified info only" last><FSwitch on={value.verified} onChange={set('verified')} /></FRow>
          </FCard>
        </div>
      </div>
      <div className="abs" style={{ left: 0, top: 0, width: 440, height: 120, background: 'linear-gradient(#f7f5f1 70%, rgba(247,245,241,0))', pointerEvents: 'none' }} />
      <motion.button className="abs" aria-label="Back" onClick={onClose} whileTap={{ scale: 0.9 }} transition={TAP} style={{ left: 24, top: 62, width: 48, height: 48 }}>
        <Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><Ph n="caret-left" size={22} fill={INK} /></Glass>
      </motion.button>
      <p className="abs nowrap" style={{ left: 84, top: 72, ...t(24, 600, INK), lineHeight: '29px' }}>Filters</p>
      <motion.button className="abs" whileTap={{ scale: 0.94 }} onClick={() => onChange(F_DEFAULT)} style={{ right: 16, top: 64, height: 44, padding: '0 8px', ...t(15, 500, SUB) }}>Reset</motion.button>
      <Glass radius={0} className="abs" style={{ left: 0, top: 842, width: 440, height: 114 }} contentStyle={{ alignItems: 'flex-start', padding: '16px 25px 0 26px', justifyContent: 'space-between' }}>
        <motion.button whileTap={{ scale: 0.94 }} onClick={() => onChange(F_DEFAULT)} style={{ height: 63, ...t(15, 500, SUB) }}>Clear all</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} transition={TAP} onClick={onClose} className="gl"
          style={{ height: 63, padding: '0 36px', borderRadius: 32, boxShadow: '0 14px 36px rgba(42,38,80,0.1), inset 0 1px 0 rgba(255,255,255,0.9)', ...t(17, 600, INK) }}>Show 24 places</motion.button>
      </Glass>
      <AnimatePresence>
        {picker && (
          <SheetFrame key="picker" z={40} height={80 + PICK[picker.key].length * 56 + 24} onClose={() => setPicker(null)}>
            <p className="abs nowrap" style={{ left: 24, top: 36, ...t(20, 700, INK) }}>{picker.label}</p>
            <div className="abs" style={{ left: 12, right: 12, top: 80 }}>
              {PICK[picker.key].map((o) => {
                const on = value[picker.key] === o;
                return (
                  <motion.button key={o} whileTap={{ scale: 0.98 }} transition={TAP} onClick={() => { set(picker.key)(o); setPicker(null); }}
                    style={{ width: '100%', height: 56, padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, background: on ? 'rgba(42,38,80,0.05)' : 'transparent' }}>
                    <span className="nowrap" style={t(16, on ? 600 : 500, INK)}>{o}</span>
                    {on && <Ph n="check-circle" size={22} fill={INK} />}
                  </motion.button>
                );
              })}
            </div>
          </SheetFrame>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MapScreen({ command, onOpenVenue, onOpenSearch, savedIds = [], onToggleSaved = () => {}, onOverlay = () => {} }) {
  const scale = useScale();
  const top = useMotionValue(SNAP.peek);
  const [state, setState] = useState('peek');
  const [chip, setChip] = useState('All');
  const [sense, setSense] = useState('None');
  const [tilesOk, setTilesOk] = useState(false);
  const [picked, setPicked] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(F_DEFAULT);
  const listRef = useRef(null);
  const g = useRef(null);

  // ---- map pan and zoom: drag to pan, pinch / wheel / double tap to zoom ----
  const view = { x: useMotionValue(0), y: useMotionValue(0), s: useMotionValue(1) };
  const mapRef = useRef(null);
  const pts = useRef(new Map());
  const gest = useRef({ pan: null, pinch: null, anims: [], lastTap: 0 });
  const MW = 440, MH = 956;
  const SNAPPY = { type: 'spring', stiffness: 260, damping: 32 };
  const clampXY = (x, y, s) => { const b = bounds(s); return [Math.min(b.maxX, Math.max(b.minX, x)), Math.min(b.maxY, Math.max(b.minY, y))]; };
  const stopAnims = () => { gest.current.anims.forEach((a) => a.stop()); gest.current.anims = []; };
  const local = (e) => { const r = mapRef.current.getBoundingClientRect(); const k = r.width / MW; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
  const zoomAt = (fx, fy, s2, animated) => {
    const s = view.s.get(); s2 = Math.min(MAXZ, Math.max(MINZ, s2));
    const [nx, ny] = clampXY(fx - (fx - view.x.get()) * (s2 / s), fy - (fy - view.y.get()) * (s2 / s), s2);
    stopAnims();
    if (animated) gest.current.anims = [animate(view.s, s2, SNAPPY), animate(view.x, nx, SNAPPY), animate(view.y, ny, SNAPPY)];
    else { view.s.set(s2); view.x.set(nx); view.y.set(ny); }
  };
  const recenterMap = () => { stopAnims(); gest.current.anims = [animate(view.s, 1, SNAPPY), animate(view.x, 0, SNAPPY), animate(view.y, 0, SNAPPY)]; };
  const startPan = (id) => { const [x, y] = [pts.current.get(id).x, pts.current.get(id).y]; gest.current.pan = { x, y, tx: view.x.get(), ty: view.y.get(), moved: false, samples: [{ t: performance.now(), x: view.x.get(), y: view.y.get() }] }; };
  const mapDown = (e) => {
    setPicked(null);
    stopAnims();
    const [x, y] = local(e); pts.current.set(e.pointerId, { x, y });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const G = gest.current;
    if (pts.current.size === 1) { startPan(e.pointerId); G.tapAt = [x, y]; }
    else if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      G.pan = null; G.tapAt = null;
      G.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: view.s.get(), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: view.x.get(), ty: view.y.get() };
    }
  };
  const mapMove = (e) => {
    if (!pts.current.has(e.pointerId)) return;
    const [x, y] = local(e); pts.current.set(e.pointerId, { x, y });
    const G = gest.current;
    if (G.pinch && pts.current.size >= 2) {
      const [a, b] = [...pts.current.values()]; const P = G.pinch;
      const s2 = Math.min(MAXZ, Math.max(MINZ, P.s * (Math.hypot(a.x - b.x, a.y - b.y) / P.d)));
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const wx = (P.mx - P.tx) / P.s, wy = (P.my - P.ty) / P.s;
      const [nx, ny] = clampXY(mx - wx * s2, my - wy * s2, s2);
      view.s.set(s2); view.x.set(nx); view.y.set(ny);
    } else if (G.pan) {
      const P = G.pan, dx = x - P.x, dy = y - P.y;
      if (!P.moved && Math.hypot(dx, dy) < 4) return;
      P.moved = true;
      const [nx, ny] = clampXY(P.tx + dx, P.ty + dy, view.s.get());
      view.x.set(nx); view.y.set(ny);
      P.samples.push({ t: performance.now(), x: nx, y: ny }); if (P.samples.length > 6) P.samples.shift();
    }
  };
  const mapUp = (e) => {
    const G = gest.current; const had = pts.current.has(e.pointerId);
    pts.current.delete(e.pointerId); if (!had) return;
    if (G.pinch) { G.pinch = null; if (pts.current.size === 1) startPan([...pts.current.keys()][0]); G.tapAt = null; return; }
    const P = G.pan; if (!P) return; G.pan = null;
    if (!P.moved) {
      const now = performance.now();
      if (now - G.lastTap < 300) { const [fx, fy] = G.tapAt || [MW / 2, MH / 2]; zoomAt(fx, fy, view.s.get() > 1.5 ? 1 : 2.2, true); G.lastTap = 0; } else G.lastTap = now;
      return;
    }
    const a = P.samples[0], b = P.samples[P.samples.length - 1];
    const dt = Math.max(1, b.t - a.t); if (performance.now() - b.t > 80) return;
    const s = view.s.get();
    const bd = bounds(s);
    const fly = (mv, v, min, max) => animate(mv, mv.get(), { type: 'inertia', velocity: v, min, max, power: 0.6, timeConstant: 260, bounceStiffness: 400, bounceDamping: 40 });
    G.anims = [fly(view.x, ((b.x - a.x) / dt) * 1000, bd.minX, bd.maxX), fly(view.y, ((b.y - a.y) / dt) * 1000, bd.minY, bd.maxY)];
  };
  useEffect(() => {
    const el = mapRef.current; if (!el) return;
    const wheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect(); const k = r.width / MW;
      zoomAt((e.clientX - r.left) / k, (e.clientY - r.top) / k, view.s.get() * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), false);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  // Rail and recenter sit just above the peeking sheet; they fade once the sheet rises past them.
  const ctrl = useTransform(top, [560, 700], [0, 1], { clamp: true });
  const ctrlEvents = useTransform(ctrl, (v) => (v > 0.6 ? 'auto' : 'none'));
  const pad = useTransform(top, [SNAP.full, SNAP.tall], [42, 0], { clamp: true });
  const listTop = useTransform(pad, (v) => 80 + v);
  const titleTop = useTransform(pad, (v) => 36 + v);
  const listOp = useTransform(top, [SNAP.peek, SNAP.half], [0, 1], { clamp: true });
  const handleOp = useTransform(top, [SNAP.full, 120], [0, 1], { clamp: true });

  const go = (name, velocity = 0) => {
    name = ALIAS[name] || name;
    if ((name === 'peek' || name === 'half') && listRef.current) listRef.current.scrollTop = 0;
    setState(name);
    animate(top, SNAP[name], { ...GENTLE, velocity });
  };
  useEffect(() => { if (command) go(command.state); }, [command]);
  useEffect(() => { onOverlay(filtersOpen); return () => onOverlay(false); }, [filtersOpen]);

  // ---- drag handling (pointer deltas are divided by the device scale) ----
  const begin = (e, source) => {
    top.stop();
    g.current = { y: e.clientY, startTop: top.get(), moved: false, source, last: [{ t: performance.now(), y: top.get() }], el: e.currentTarget, id: e.pointerId };
  };
  const move = (e) => {
    const d = g.current; if (!d) return;
    const dy = (e.clientY - d.y) / scale;
    if (!d.moved) {
      if (Math.abs(dy) < 5) return;
      // Tall and full: the list scrolls; only a downward pull from its very top moves the sheet.
      if (d.source === 'list' && (state === 'full' || state === 'tall') && (dy < 0 || (listRef.current?.scrollTop ?? 0) > 0)) { g.current = null; return; }
      d.moved = true;
      try { d.el.setPointerCapture(d.id); } catch (_) {}
    }
    let next = d.startTop + dy;
    if (next < SNAP.full) next = SNAP.full - (SNAP.full - next) * 0.25;
    top.set(next);
    d.last.push({ t: performance.now(), y: next });
    if (d.last.length > 6) d.last.shift();
  };
  const end = () => {
    const d = g.current; g.current = null; if (!d) return;
    if (!d.moved) {
      if (d.source === 'header') go(state === 'full' ? 'half' : state === 'peek' ? 'half' : 'full');
      if (d.source === 'hotspot') go('half');
      return;
    }
    const a = d.last[0], b = d.last[d.last.length - 1];
    const v = b.t > a.t ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0;
    const projected = top.get() + v * 0.18;
    const target = SNAPS.reduce((best, s) => (Math.abs(s - projected) < Math.abs(best - projected) ? s : best), SNAPS[0]);
    go(Object.keys(SNAP).find((k) => SNAP[k] === target), v);
  };
  const handlers = (source) => ({
    onPointerDown: (e) => begin(e, source), onPointerMove: move, onPointerUp: end, onPointerCancel: end,
  });

  const pins = LAYERS[sense];
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1', overflow: 'hidden' }}>
      <div ref={mapRef} className="abs" aria-label="Map" onPointerDown={mapDown} onPointerMove={mapMove} onPointerUp={mapUp} onPointerCancel={mapUp}
        style={{ inset: 0, background: '#eef0ea', overflow: 'hidden', touchAction: 'none', cursor: 'grab', userSelect: 'none' }}>
        <motion.img src={mapTiles} alt="" draggable={false} className="abs" animate={{ opacity: tilesOk ? 0 : 1 }} transition={{ duration: 0.3 }} style={{ left: 0, top: 0, width: 440, height: 956, objectFit: 'cover', transformOrigin: '0 0', x: view.x, y: view.y, scale: view.s, pointerEvents: 'none' }} />
        <Tiles view={view} onLoaded={() => setTilesOk(true)} />
      </div>

      {/* Layer / pins: category pins by default, sense-coloured pins once a layer is on */}
      <AnimatePresence mode="popLayout">
        {pins.map(([icon, ring, , , lvl], i) => (chip !== 'All' && SLOT_CHIP[i] !== chip) ? null : <Pin key={sense + i} i={i} icon={icon} ring={ring} level={lvl} layer={sense} view={view} />)}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {pins.map(([, , name, lx], i) => (chip !== 'All' && SLOT_CHIP[i] !== chip) ? null : <PinLabel key={sense + 'l' + i} i={i} name={name} lx={lx} sense={sense} view={view} />)}
      </AnimatePresence>
      <AnimatePresence>
        {EXTRAS.filter((v) => chip === 'All' || v.cat === chip).map((v) => <ExtraPin key={v.id + sense} v={v} sense={sense} view={view} selected={picked === v.id} onSelect={setPicked} />)}
      </AnimatePresence>
      <Anchored wx={154} wy={478} view={view}><img src={uri('you')} alt="" className="abs" style={{ left: 0, top: 0, width: 44, height: 44 }} /></Anchored>

      {/* Search + filter */}
      <Glass radius={26} angle="170deg" style={{ left: 24, top: 80, width: 328, height: 52 }} contentStyle={{ gap: 12, padding: '0 16.5px' }}>
        <Ph n="magnifying-glass" size={22} fill={INK} />
        <button type="button" onClick={onOpenSearch} className="nowrap" style={{ ...t(16, 500, INK), position: 'absolute', inset: 0, paddingLeft: 51, textAlign: 'left' }}>Search places</button>
      </Glass>
      <motion.button aria-label="Filters" className="abs" onClick={() => setFiltersOpen(true)} whileTap={{ scale: 0.92 }} transition={TAP} style={{ left: 364, top: 80, width: 52, height: 52 }}>
        <Glass radius={26} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><Ph n="sliders-horizontal" size={22} fill={INK} /></Glass>
      </motion.button>

      {/* Category chips */}
      <div className="abs hscroll" style={{ left: 0, top: 118, width: 440, height: 140, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 8, padding: '28px 24px 48px', width: 'max-content' }}>
          {CHIPS.map((c) => {
            const on = chip === c;
            return (
              <motion.button key={c} onClick={() => { setChip(c); setFilters((f) => ({ ...f, place: c })); listRef.current && (listRef.current.scrollTop = 0); }} whileTap={{ scale: 0.95 }} transition={GENTLE}
                className="glass" style={{ position: 'relative', height: 44, borderRadius: 22, pointerEvents: 'auto', borderColor: on ? '#fff' : 'rgba(255,255,255,.95)', '--ga': '157.6deg' }}>
                <div className="g-bg" style={on ? { background: 'rgba(255,255,255,0.92)' } : undefined} />
                <span className="g-c nowrap" style={{ padding: '0 22px', fontSize: 15, fontWeight: on ? 600 : 500, color: on ? INK : 'rgba(42,38,80,0.8)' }}>{c}</span>
                <div className="g-in" />
              </motion.button>
            );
          })}
        </div>
      </div>


      {/* Sense layers rail + Recenter. Tap the active sense again to turn layers off. */}
      <motion.div className="abs" style={{ left: 364, top: 441, width: 67, opacity: ctrl, pointerEvents: ctrlEvents }}>
        <Glass radius={32} angle="109.3deg" style={{ position: 'relative' }} contentStyle={{ flexDirection: 'column', gap: 4, padding: 6, alignItems: 'center' }}>
          {SENSES.map((s) => {
            const on = sense === s.key;
            return (
              <motion.button key={s.key} layout aria-pressed={on} aria-label={`${s.key} layer`} onClick={() => setSense(on ? 'None' : s.key)} transition={GENTLE}
                style={{ position: 'relative', width: 56, height: on ? 68 : 52, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flex: 'none' }}>
                {on && <motion.div layoutId="sense-pill" transition={GENTLE} className="abs" style={{ inset: 0, borderRadius: 28, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />}
                <motion.div layout="position" style={{ position: 'relative' }}><Ph n={s.icon} size={24} fill={on ? INK : SUB} /></motion.div>
                {on && <motion.span layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', ...t(12, 600, INK) }}>{s.short || s.key}</motion.span>}
              </motion.button>
            );
          })}
        </Glass>
      </motion.div>
      <motion.button aria-label="Recenter" onClick={recenterMap} className="abs" whileTap={{ scale: 0.9 }} transition={TAP} style={{ left: 373, top: 700, width: 48, height: 48, opacity: ctrl, pointerEvents: ctrlEvents }}>
        <div className="glass" style={{ position: 'absolute', inset: 0, borderRadius: 24, border: 'none', boxShadow: '0 14px 36px rgba(42,38,80,0.1)' }}>
          <div className="g-bg" />
          <div className="g-c" style={{ justifyContent: 'center' }}><Ph n="navigation-arrow" size={22} fill={INK} /></div>
          <div className="g-in" />
        </div>
      </motion.button>

      {/* Recommendation sheet */}
      <motion.div className="abs" data-map-sheet={state} style={{ left: 0, top, bottom: 0, width: 440, background: '#fff', borderRadius: '22px 22px 0 0', overflow: 'hidden', boxShadow: '0 -6px 24px rgba(42,38,80,0.06)' }}>
        <motion.div className="abs" style={{ left: 0, top: 0, width: 440, height: listTop, cursor: 'grab', touchAction: 'none', zIndex: 2 }} {...handlers('header')}>
          <motion.div className="abs" style={{ left: 170, top: 10, width: 100, height: 5, borderRadius: 100, background: '#d9d9d9', opacity: handleOp }} />
          <motion.p className="abs nowrap" style={{ left: 20, top: titleTop, ...t(26, 700, INK) }}>Popular around you</motion.p>
        </motion.div>
        <motion.div ref={listRef} className="abs scroll" {...handlers('list')}
          style={{ inset: 'auto', left: 0, top: listTop, opacity: listOp, bottom: 0, width: 440, overflowY: state === 'peek' ? 'hidden' : 'auto', touchAction: state === 'full' || state === 'tall' ? 'pan-y' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 20px 112px' }}>
            {recsFor(chip).map((r, i) => <Recommendation key={chip + r.id} r={r} saved={savedIds.includes(r.id)} onToggleSaved={onToggleSaved} onOpen={r.id === 'foxy' ? onOpenVenue : undefined} />)}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>{filtersOpen && <Filters value={filters} onChange={(v) => { setFilters(v); if (v.place !== filters.place) setChip(v.place); }} onClose={() => setFiltersOpen(false)} />}</AnimatePresence>
    </div>
  );
}
