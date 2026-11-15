// Map (Figma "Map" section 568:1903): Default, Sheet half / tall / full, four sense layers, Filters.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react';
import { uri } from './svgs.js';
import { Glass, GENTLE, NAVY, useScale } from './ui.jsx';
import { TAP, t } from './flow.jsx';
import { Ph } from './phosphor.jsx';
import { FSeg, FSwitch, FRow, FHead, FCard, Any } from './settingsKit.jsx';
import { VP } from './venuePhotos.js';
import mapTiles from './assets/map-tiles.jpg';

const INK = '#2a2650', SUB = '#5e5a7e';
// Sheet tops: full screen, tall, half, peek (Default).
export const SNAP = { full: 0, tall: 302, half: 616, peek: 764 };
const SNAPS = [SNAP.full, SNAP.tall, SNAP.half, SNAP.peek];
const ALIAS = { hidden: 'peek' };

const RECS = [
  { id: 'foxy', title: 'Fern & Fable', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Fits you · Quiet · natural light', photo: VP.garden },
  { id: 'sentient', title: 'The Sentient', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Fits you · Quiet · natural light', photo: VP.bar },
  { id: 'gallery', title: 'Juniper Coffee', meta: 'Level 3 · 0.5 mi · Updated 1h ago', reason: 'Mostly fits · More crowded', photo: VP.indoor },
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

function Pin({ icon, ring, level, i, layer }) {
  return (
    <motion.div className="abs" style={{ left: SLOTS[i][0], top: SLOTS[i][1], width: 44, height: 44 }}
      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.04 + i * 0.05 }}>
      {ring && <span className="mp-ping" style={{ '--c': ring, '--d': `${PULSE[level]}s`, animationDelay: `${-i * 0.6}s` }} />}
      <div className="abs" style={{ inset: 0, borderRadius: 22, background: '#fff', border: `2.5px solid ${ring || 'rgba(42,38,80,0.25)'}`, boxShadow: '0 4px 10px rgba(20,26,38,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className={ring ? `mp-ico mp-${layer.toLowerCase()}` : ''} style={{ '--d': `${PULSE[level ?? 0]}s`, display: 'flex' }}><Ph n={icon} size={22} fill={INK} /></span>
      </div>
    </motion.div>
  );
}

const CHIPS = ['All', 'Cafés', 'Dining', 'Nightlife', 'Events'];
const SENSES = [
  { key: 'Sound', icon: 'speaker-high' },
  { key: 'Light', icon: 'sun' },
  { key: 'Crowd', icon: 'users' },
  { key: 'Temperature', icon: 'thermometer', short: 'Temp' },
];

// ---------- Filters (Figma 1378:326) ----------
const F_DEFAULT = { mode: null, sort: 'Best fit', open: true, dist: 'Walk', price: 'Any', verified: false };
function Filters({ value, onChange, onClose }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <motion.div className="abs" style={{ inset: 0, background: '#f7f5f1', zIndex: 30 }}
      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={GENTLE}>
      <div className="scroll" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ padding: '124px 24px 150px', display: 'flex', flexDirection: 'column' }}>
          <FHead>MODE</FHead>
          <div className="hscroll" style={{ margin: '18px -24px 0', padding: '6px 24px 20px', display: 'flex', gap: 8 }}>
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
            <FRow icon="speaker-high" label="Sound"><Any /></FRow>
            <FRow icon="sun" label="Light"><Any /></FRow>
            <FRow icon="users" label="Crowd"><Any /></FRow>
            <FRow icon="thermometer-simple" label="Temperature"><Any /></FRow>
            <FRow icon="armchair" label="Seating" last><Any /></FRow>
          </FCard>
          <div style={{ height: 24 }} />
          <FHead>MORE</FHead>
          <div style={{ height: 24 }} />
          <FCard>
            <FRow icon="squares-four" label="Place type"><Any v="All" /></FRow>
            <FRow icon="check-circle" label="Looking for"><Any /></FRow>
            <FRow icon="prohibit" label="Not for me"><Any v="None" /></FRow>
            <FRow icon="wind" label="Smells I’d skip"><Any v="None" /></FRow>
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
    </motion.div>
  );
}

export default function MapScreen({ command, onOpenVenue, onOpenSearch, savedIds = [], onToggleSaved = () => {}, onOverlay = () => {} }) {
  const scale = useScale();
  const top = useMotionValue(SNAP.peek);
  const [state, setState] = useState('peek');
  const [chip, setChip] = useState('All');
  const [sense, setSense] = useState('None');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(F_DEFAULT);
  const listRef = useRef(null);
  const g = useRef(null);

  // Rail and recenter sit just above the peeking sheet; they fade once the sheet rises past them.
  const ctrl = useTransform(top, [560, 700], [0, 1], { clamp: true });
  const ctrlEvents = useTransform(ctrl, (v) => (v > 0.6 ? 'auto' : 'none'));
  const credit = useTransform(top, (v) => Math.min(839, v - 21));
  const pad = useTransform(top, [SNAP.full, SNAP.tall], [42, 0], { clamp: true });
  const listTop = useTransform(pad, (v) => 80 + v);
  const titleTop = useTransform(pad, (v) => 36 + v);
  const listOp = useTransform(top, [SNAP.peek, SNAP.half], [0, 1], { clamp: true });
  const handleOp = useTransform(top, [SNAP.full, 120], [0, 1], { clamp: true });

  const go = (name, velocity = 0) => {
    name = ALIAS[name] || name;
    if (name !== 'full' && listRef.current) listRef.current.scrollTop = 0;
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
      if (d.source === 'list' && state === 'full' && (dy < 0 || (listRef.current?.scrollTop ?? 0) > 0)) { g.current = null; return; }
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
      <div className="abs" style={{ inset: 0, background: '#eef0ea' }}>
        <img src={mapTiles} alt="" className="abs" style={{ left: 0, top: 0, width: 440, height: 956, objectFit: 'cover' }} />
      </div>

      {/* Layer / pins: category pins by default, sense-coloured pins once a layer is on */}
      <AnimatePresence mode="popLayout">
        {pins.map(([icon, ring, , , lvl], i) => <Pin key={sense + i} i={i} icon={icon} ring={ring} level={lvl} layer={sense} />)}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {pins.map(([, , name, lx], i) => (
          <motion.div key={sense + 'l' + i} className="abs" style={{ left: lx, top: SLOTS[i][1] + 48 }}
            initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ ...GENTLE, delay: 0.1 + i * 0.05 }}>
            <Glass radius={22} angle="166deg" style={{ position: 'relative', height: 44 }} contentStyle={{ padding: '0 15px' }}>
              <span className="nowrap" style={t(14, 500, INK)}>{name}</span>
            </Glass>
          </motion.div>
        ))}
      </AnimatePresence>
      <img src={uri('you')} alt="" className="abs" style={{ left: 154, top: 478, width: 44, height: 44 }} />

      {/* Search + filter */}
      <Glass radius={26} angle="170deg" style={{ left: 24, top: 80, width: 328, height: 52 }} contentStyle={{ gap: 12, padding: '0 16.5px' }}>
        <Ph n="magnifying-glass" size={22} fill={INK} />
        <button type="button" onClick={onOpenSearch} className="nowrap" style={{ ...t(16, 500, INK), position: 'absolute', inset: 0, paddingLeft: 51, textAlign: 'left' }}>Search places</button>
      </Glass>
      <motion.button aria-label="Filters" className="abs" onClick={() => setFiltersOpen(true)} whileTap={{ scale: 0.92 }} transition={TAP} style={{ left: 364, top: 80, width: 52, height: 52 }}>
        <Glass radius={26} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><Ph n="sliders-horizontal" size={22} fill={INK} /></Glass>
      </motion.button>

      {/* Category chips */}
      <div className="abs hscroll" style={{ left: 0, top: 138, width: 440, height: 100, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 8, padding: '8px 24px 40px', width: 'max-content' }}>
          {CHIPS.map((c) => {
            const on = chip === c;
            return (
              <motion.button key={c} onClick={() => setChip(c)} whileTap={{ scale: 0.95 }} transition={GENTLE}
                className="glass" style={{ position: 'relative', height: 44, borderRadius: 22, pointerEvents: 'auto', borderColor: on ? '#fff' : 'rgba(255,255,255,.95)', '--ga': '157.6deg' }}>
                <div className="g-bg" style={on ? { background: 'rgba(255,255,255,0.92)' } : undefined} />
                <span className="g-c nowrap" style={{ padding: '0 22px', fontSize: 15, fontWeight: on ? 600 : 500, color: on ? INK : 'rgba(42,38,80,0.8)' }}>{c}</span>
                <div className="g-in" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.p className="abs nowrap" style={{ left: 24, top: credit, fontSize: 11, fontWeight: 500, color: SUB }}>Map: Esri, HERE, Garmin, OpenStreetMap contributors</motion.p>

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
      <motion.button aria-label="Recenter" className="abs" whileTap={{ scale: 0.9 }} transition={TAP} style={{ left: 373, top: 700, width: 48, height: 48, opacity: ctrl, pointerEvents: ctrlEvents }}>
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
          style={{ inset: 'auto', left: 0, top: listTop, opacity: listOp, bottom: 0, width: 440, overflowY: state === 'full' ? 'auto' : 'hidden', touchAction: state === 'full' ? 'pan-y' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 20px 112px' }}>
            {RECS.map((r, i) => <Recommendation key={r.id} r={r} saved={savedIds.includes(r.id)} onToggleSaved={onToggleSaved} onOpen={i === 0 ? onOpenVenue : undefined} />)}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>{filtersOpen && <Filters value={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />}</AnimatePresence>
    </div>
  );
}
