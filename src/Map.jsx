import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { uri, paths } from './svgs.js';
import { Glass, Icon, GENTLE, NAVY, MUTED, useScale } from './ui.jsx';
import mapTiles from './assets/map-tiles.jpg';

// The expanded sheet meets the category row's lower edge (128 + 44).
// Half and hidden retain their existing Figma positions.
export const SNAP = { full: 172, half: 616, hidden: 956 };
const SNAPS = [SNAP.full, SNAP.half, SNAP.hidden];

const RECS = [
  { title: 'Foxy Loxy Café', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Good fit · Quiet · natural light' },
  { title: 'The Sentient', meta: 'Level 2 · 0.5 mi · Updated 1h ago', reason: 'Good fit · Quiet · natural light' },
  { title: 'Gallery Café', meta: 'Level 3 · 0.5 mi · Updated 1h ago', reason: 'Mixed fit · More crowded' },
];

function Recommendation({ r, onOpen }) {
  const [saved, setSaved] = useState(false);
  return (
    <div onClick={onOpen} style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 8, cursor: onOpen ? 'pointer' : 'default' }}>
      <div style={{ width: 400, height: 191, borderRadius: 8, background: '#d7d7d7' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 400 }}>
        <div style={{ width: 344, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 17, lineHeight: 1.3, color: '#383838' }}>{r.title}</p>
          <p style={{ fontSize: 12, color: '#6a6478' }}>{r.meta}</p>
        </div>
        <motion.button aria-label="Save venue" onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
          whileTap={{ scale: 0.8 }} style={{ position: 'relative', width: 44, height: 44, flex: 'none' }}>
          <img src={uri('heart')} alt="" className="abs" style={{ left: 12, top: 10, width: 20, height: 20 }} />
          <motion.svg className="abs" style={{ left: 12, top: 10 }} width="20" height="20" viewBox="0 0 20 20"
            initial={false} animate={{ scale: saved ? 1 : 0, opacity: saved ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
            <path d="M17.3436 3.4842C16.8994 3.01343 16.372 2.64003 15.7915 2.38537C15.211 2.1307 14.5889 1.99975 13.9607 2C13.3324 2.00025 12.7104 2.1317 12.1301 2.38682C11.5498 2.64195 11.0227 3.01576 10.5788 3.48689L9.99934 4.10844L9.42472 3.48824L9.42098 3.48428C8.97696 3.01373 8.44983 2.64046 7.86969 2.3858C7.28955 2.13113 6.66776 2.00006 6.03982 2.00006C5.41187 2.00006 4.79008 2.13113 4.20994 2.3858C3.6298 2.64046 3.10267 3.01373 2.65865 3.48428L2.40051 3.75784C1.50378 4.70816 1 5.99708 1 7.34103C1 8.68499 1.50378 9.9739 2.40051 10.9242L9.21339 18.1441L9.98275 18.9984L10.0011 18.9789L10.021 19L10.7418 18.194L17.6018 10.9241C18.4971 9.97302 19 8.6844 19 7.34091C19 5.99743 18.4971 4.7088 17.6018 3.75772L17.3436 3.4842Z" fill="#5D5970" />
          </motion.svg>
        </motion.button>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: 1.3, color: '#6b6b6b' }}>{r.reason}</p>
    </div>
  );
}

const PINS = [
  { k: 'pinGallery', left: 98, top: 264, size: 64 },
  { k: 'pinFoxy', left: 216, top: 340, size: 72 },
  { k: 'pinSentient', left: 240, top: 606, size: 64 },
];
const LABELS = [
  { text: 'Gallery Café · Quiet', left: 39, top: 320, ga: '166.5deg' },
  { text: 'Foxy Loxy · Soft chatter', left: 127, top: 404, ga: '168.2deg' },
  { text: 'The Sentient · Busy café', left: 168, top: 662, ga: '168.3deg' },
];
const CHIPS = ['All', 'Cafés', 'Dining', 'Nightlife', 'Events'];
const SENSES = [
  { key: 'Sound', d: paths.speaker },
  { key: 'Light', d: paths.sun },
  { key: 'Crowd', d: paths.users },
];

export default function MapScreen({ command, onOpenVenue, onOpenSearch }) {
  const scale = useScale();
  const top = useMotionValue(SNAP.half);
  const [state, setState] = useState('half');
  const [chip, setChip] = useState('Cafés');
  const [sense, setSense] = useState('Sound');
  const listRef = useRef(null);
  const g = useRef(null);

  // Floating map controls only appear once the sheet is out of the way (Sheet hidden frame).
  const p = useTransform(top, [SNAP.half, SNAP.hidden], [0, 1], { clamp: true });
  const ctrlX = useTransform(p, [0, 1], [24, 0]);
  const ctrlEvents = useTransform(p, (v) => (v > 0.6 ? 'auto' : 'none'));

  const go = (name, velocity = 0) => {
    if (name !== 'full' && listRef.current) listRef.current.scrollTop = 0;
    setState(name);
    animate(top, SNAP[name], { ...GENTLE, velocity });
  };
  useEffect(() => { if (command) go(command.state); }, [command]);

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
      if (d.source === 'header') go(state === 'full' ? 'half' : 'full');
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

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1', overflow: 'hidden' }}>
      <div className="abs" style={{ inset: 0, background: '#eef0ea' }}>
        <img src={mapTiles} alt="" className="abs" style={{ left: 0, top: 0, width: 440, height: 956, objectFit: 'cover' }} />
      </div>

      {/* Layer / Sensory pins */}
      {PINS.map((pn, i) => (
        <motion.img key={pn.k} src={uri(pn.k)} alt="" className="abs" style={{ left: pn.left, top: pn.top, width: pn.size, height: pn.size }}
          initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...GENTLE, delay: 0.12 + i * 0.06 }} />
      ))}
      {LABELS.map((l, i) => (
        <motion.div key={l.text} className="abs" style={{ left: l.left, top: l.top }}
          initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...GENTLE, delay: 0.18 + i * 0.06 }}>
          <Glass radius={22} angle={l.ga} style={{ position: 'relative', height: 44 }} contentStyle={{ gap: 8, padding: '0 14.5px 0 10.5px' }}>
            <img src={uri('mapPin')} alt="" style={{ width: 20, height: 20, display: 'block' }} />
            <span className="nowrap" style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{l.text}</span>
          </Glass>
        </motion.div>
      ))}
      <img src={uri('you')} alt="" className="abs" style={{ left: 154, top: 478, width: 44, height: 44 }} />

      {/* Search + filter */}
      <Glass radius={26} angle="170deg" style={{ left: 24, top: 62, width: 328, height: 52 }} contentStyle={{ gap: 12, padding: '0 16.5px' }}>
        <img src={uri('mapSearch')} alt="" style={{ width: 22, height: 22, display: 'block' }} />
        <button type="button" onClick={onOpenSearch} className="nowrap" style={{ fontSize: 16, fontWeight: 500, color: NAVY, position: 'absolute', inset: 0, paddingLeft: 51, textAlign: 'left' }}>Search places</button>
      </Glass>
      <Glass radius={26} style={{ left: 364, top: 62, width: 52, height: 52 }} contentStyle={{ justifyContent: 'center' }} className="press">
        <img src={uri('sliders')} alt="" style={{ width: 22, height: 22, display: 'block' }} />
      </Glass>

      {/* Category chips (scrolls past the screen edge like the Figma row) */}
      <div className="abs hscroll" style={{ left: 0, top: 120, width: 440, height: 100, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 8, padding: '8px 24px 40px', width: 'max-content' }}>
          {CHIPS.map((c) => {
            const on = chip === c;
            return (
              <motion.button key={c} onClick={() => setChip(c)} whileTap={{ scale: 0.95 }} transition={GENTLE}
                className="glass" style={{ position: 'relative', height: 44, borderRadius: 22, pointerEvents: 'auto', borderColor: on ? '#fff' : 'rgba(255,255,255,.95)', '--ga': '157.6deg' }}>
                <div className="g-bg" style={on ? { background: 'rgba(255,255,255,0.92)' } : undefined} />
                <span className="g-c nowrap" style={{ padding: '0 18.5px', fontSize: 15, fontWeight: on ? 600 : 500, color: on ? NAVY : 'rgba(42,38,80,0.8)' }}>{c}</span>
                <div className="g-in" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="abs nowrap" style={{ left: 24, top: 839, fontSize: 9, fontWeight: 500, color: 'rgba(90,98,112,0.85)' }}>Map: Esri, HERE, Garmin, OpenStreetMap contributors</p>

      {/* Sensitivity filters + Recenter (visible when the sheet is hidden) */}
      <motion.div className="abs" style={{ left: 349, top: 280, width: 67, height: 191, opacity: p, x: ctrlX, pointerEvents: ctrlEvents }}>
        <Glass radius={32} angle="109.3deg" style={{ inset: 0 }} contentStyle={{ flexDirection: 'column', gap: 4, padding: 2.5, alignItems: 'center', justifyContent: 'flex-start' }}>
          {SENSES.map((s) => {
            const on = sense === s.key;
            return (
              <motion.button key={s.key} layout onClick={() => setSense(s.key)} transition={GENTLE}
                style={{ position: 'relative', width: 56, height: on ? 68 : 52, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flex: 'none' }}>
                {on && <motion.div layoutId="sense-pill" transition={GENTLE} className="abs" style={{ inset: 0, borderRadius: 28, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />}
                <motion.div layout="position" style={{ position: 'relative' }}><Icon d={s.d} fill={on ? NAVY : MUTED} /></motion.div>
                {on && <motion.span layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative', fontSize: 12, fontWeight: 600, color: NAVY }}>{s.key}</motion.span>}
              </motion.button>
            );
          })}
        </Glass>
      </motion.div>
      <motion.div className="abs" style={{ left: 368, top: 487, width: 48, height: 48, opacity: p, pointerEvents: ctrlEvents }}>
        <div className="glass press" style={{ inset: 0, borderRadius: 24, border: 'none', boxShadow: '0 14px 36px rgba(42,38,80,0.1)' }}>
          <div className="g-bg" />
          <div className="g-c" style={{ justifyContent: 'center' }}><img src={uri('iconPin')} alt="" style={{ width: 22, height: 22, display: 'block' }} /></div>
          <div className="g-in" />
        </div>
      </motion.div>

      {/* Pull up / hotspot (Sheet hidden) */}
      {state === 'hidden' && <div className="abs" style={{ left: 0, top: 822, width: 440, height: 120, touchAction: 'none', cursor: 'grab' }} {...handlers('hotspot')} />}

      {/* Recommendation sheet */}
      <motion.div className="abs" data-map-sheet={state} style={{ left: 0, top, bottom: 0, width: 440, background: '#fff', borderRadius: '22px 22px 0 0', overflow: 'hidden', boxShadow: '0 -6px 24px rgba(42,38,80,0.06)' }}>
        <div className="abs" style={{ left: 0, top: 0, width: 440, height: 80, cursor: 'grab', touchAction: 'none', zIndex: 2 }} {...handlers('header')}>
          <div className="abs" style={{ left: 170, top: 10, width: 100, height: 5, borderRadius: 100, background: '#d9d9d9' }} />
          <p className="abs" style={{ left: 20, top: 36, fontSize: 26, fontWeight: 700, color: '#2b2638', lineHeight: 'normal' }}>For You</p>
        </div>
        <div ref={listRef} className="abs scroll" {...handlers('list')}
          style={{ inset: 'auto', left: 0, top: 80, bottom: 0, width: 440, overflowY: state === 'full' ? 'auto' : 'hidden', touchAction: state === 'full' ? 'pan-y' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 20px 112px' }}>
            {RECS.map((r, i) => <Recommendation key={r.title} r={r} onOpen={i === 0 ? onOpenVenue : undefined} />)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

