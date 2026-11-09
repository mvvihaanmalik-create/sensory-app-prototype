import { useRef, useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { uri } from './svgs.js';
import { drops, ripples, toTransition, LOOP } from './fountain.js';
import { GENTLE, INK, INK2, useScale } from './ui.jsx';
import sceneMorning from './assets/scene-morning.jpg';
import { usePullDown } from './Discover.jsx';

const lightGlass = {
  background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 14px rgba(27,42,68,0.1)',
};
const cardGlass = {
  background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 4px 14px rgba(27,42,68,0.05)',
};
const h2 = { fontSize: 24, fontWeight: 600, lineHeight: '28px', letterSpacing: -0.36, color: INK };

function Hero({ reduce, pull }) {
  const fade = useTransform(pull, [0, 120], [1, 0]);
  const pulse = reduce ? {} : {
    animate: { scale: [1, 1.025, 1] },
    transition: { duration: LOOP, times: [0, 0.5, 1], ease: 'easeInOut', repeat: Infinity },
  };
  return (
    <motion.div className="abs" style={{ left: 0, top: 0, width: 440, height: 314, overflow: 'hidden', borderRadius: '0 0 32px 32px', boxShadow: '0 8px 12px rgba(13,15,26,0.12)', opacity: fade }}>
      {/* Scene art + Motion · fountain share one 440x550 frame at y -130, pulsing about its centre */}
      <motion.div className="abs" style={{ left: 0, top: -130, width: 440, height: 550, transformOrigin: '50% 50%' }} {...pulse}>
        <img src={sceneMorning} alt="" className="abs" style={{ left: 0, top: 130, width: 440, height: 314, display: 'block' }} />
        {!reduce && (
          <div className="abs" style={{ left: 0, top: 130, width: 440, height: 314 }}>
            {drops.map((d) => (
              <motion.div key={d.id} className="abs" data-node-id={d.id}
                style={{ left: d.left, top: d.top, width: d.size, height: d.size, borderRadius: '50%', background: '#fff' }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: d.t.x.values, y: d.t.y.values, opacity: d.t.opacity.values }}
                transition={{ x: toTransition(d.t.x), y: toTransition(d.t.y), opacity: toTransition(d.t.opacity) }} />
            ))}
            {ripples.map((r) => (
              <motion.div key={r.id} className="abs" data-node-id={r.id}
                style={{ left: 130, top: 305, width: 34, height: 6, borderRadius: '50%', border: '1.2px solid #fff', transformOrigin: '50% 50%' }}
                initial={{ scale: 0.35, opacity: 0 }}
                animate={{ scale: r.t.scale.values, opacity: r.t.opacity.values }}
                transition={{ scale: toTransition(r.t.scale), opacity: toTransition(r.t.opacity) }} />
            ))}
          </div>
        )}
      </motion.div>
      <div className="abs" style={{ left: 0, top: 0, width: 440, height: 240, background: 'linear-gradient(180deg, rgba(255,252,247,0.85) 0%, rgba(255,252,247,0.62) 60%, rgba(255,252,247,0) 100%)' }} />
    </motion.div>
  );
}

const CATS = [
  { k: 'illCafe', label: 'Café', page: 'cafes', inset: '15.13% 18.49%' },
  { k: 'illDining', label: 'Dining', page: 'dining', inset: '19.93% 13.46%' },
  { k: 'illNightlife', label: 'Nightlife', page: 'nightlife', inset: '12.5% 21.58%' },
  { k: 'illEvents', label: 'Events', page: 'events', inset: '20.73% 13.28%' },
  { k: 'illMore', label: 'More', page: 'more', inset: '15.89% 17.79%' },
];
function Categories({ onOpen }) {
  return (
    <div className="abs" style={{ left: 24, top: 322, width: 392, display: 'flex', justifyContent: 'space-between' }}>
      {CATS.map((c) => (
        <motion.button key={c.k} onClick={() => onOpen?.(c.page)} whileTap={{ scale: 0.92 }} transition={GENTLE}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7.685 }}>
          <img src={uri(c.k)} alt="" style={{ width: 61.481, height: 61.481, display: 'block' }} />
          <span style={{ fontSize: 12, color: INK2, lineHeight: 'normal' }}>{c.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function SectionHeader({ top, title, onSeeAll }) {
  return (
    <div className="abs" style={{ left: 24, top, width: 392, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p className="nowrap" style={h2}>{title}</p>
      <button className="nowrap" onClick={onSeeAll} style={{ fontSize: 13, fontWeight: 700, color: INK }}>See all</button>
    </div>
  );
}

/* ---------- For you stack (component 685:328, variants Front=A/B/C) ---------- */
const VENUES = {
  A: { name: 'Foxy Loxy Café', meta: 'Café · 0.5 mi', level: 'Level 2' },
  B: { name: 'Gallery Café', meta: 'Café · 1.1 mi', level: 'Level 1' },
  C: { name: 'The Sentient', meta: 'Café · 0.8 mi', level: 'Level 2' },
};
const KEYS = ['A', 'B', 'C'];
const ROLE = {
  front: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  right: { x: 99.53, y: 11.25, rotate: 3, scale: 0.8, opacity: 0.55 },
  left: { x: -99.82, y: 0.36, rotate: -3, scale: 0.8, opacity: 0.55 },
};
const Z = { front: 3, right: 2, left: 1 };
const DOT_FOR = { A: 1, B: 2, C: 0 };

function VenueCard({ v }) {
  return (
    <>
      <div className="abs" style={{ inset: 0, background: 'rgba(20,24,31,0.06)' }} />
      <div className="abs" style={{ left: 10, top: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 999,
        background: '#f7f5f1', boxShadow: '0 4px 14px rgba(27,42,68,0.05)' }}>
        <img src={uri('rippleCard')} alt="" style={{ width: 28, height: 28, display: 'block' }} />
        <span className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: INK }}>{v.level}</span>
      </div>
      <div className="abs" style={{ left: 10, top: 224, width: 236, height: 112, borderRadius: 20, border: '1px solid rgba(20,24,31,0.08)',
        WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
        <p className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK }}>{v.name}</p>
        <p className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>{v.meta}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <img src={uri('dot')} alt="" style={{ width: 8, height: 8, display: 'block' }} />
          <span className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: INK }}>Good fit</span>
        </div>
      </div>
    </>
  );
}

function ForYouStack({ onOpenVenue }) {
  const [front, setFront] = useState('A');
  const scale = useScale();
  const drag = useRef(null);
  const [dx, setDx] = useState(0);
  const fi = KEYS.indexOf(front);
  const roleOf = (k) => (k === front ? 'front' : k === KEYS[(fi + 1) % 3] ? 'right' : 'left');

  const dragged = useRef(false);
  const onDown = (e) => { dragged.current = false; drag.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }; };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const delta = (e.clientX - d.x) / scale, vert = (e.clientY - d.y) / scale;
    // axis lock: a mostly vertical gesture belongs to the page (pull down to Discover), so the card lets go of it
    if (!d.moved && Math.max(Math.abs(delta), Math.abs(vert)) > 6) {
      if (Math.abs(delta) > Math.abs(vert)) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); } else { drag.current = null; return; }
    }
    if (d.moved) setDx(delta);
  };
  const onUp = () => {
    const d = drag.current; drag.current = null; if (!d) return;
    dragged.current = d.moved;
    if (d.moved && Math.abs(dx) > 50) setFront(dx < 0 ? KEYS[(fi + 1) % 3] : KEYS[(fi + 2) % 3]);
    setDx(0);
  };

  return (
    <div className="abs" style={{ left: 0, top: 473, width: 440, height: 380 }}>
      {KEYS.map((k) => {
        const role = roleOf(k);
        const isFront = role === 'front';
        return (
          <motion.div key={k} className="abs"
            style={{ left: 90, top: 0, width: 260, height: 350, zIndex: Z[role], transformOrigin: '50% 50%', cursor: isFront ? 'grab' : 'pointer', touchAction: 'pan-y' }}
            initial={false}
            animate={{ ...ROLE[role], x: ROLE[role].x + (isFront ? dx : 0), rotate: ROLE[role].rotate + (isFront ? dx / 40 : 0) }}
            transition={isFront && dx !== 0 ? { type: 'spring', stiffness: 600, damping: 40 } : GENTLE}
            onClick={() => { if (dragged.current) return; if (!isFront) setFront(k); else if (k === 'A') onOpenVenue?.(); }}
            onPointerDown={isFront ? onDown : undefined} onPointerMove={isFront ? onMove : undefined}
            onPointerUp={isFront ? onUp : undefined} onPointerCancel={isFront ? onUp : undefined}
            whileTap={!isFront ? { scale: 0.78 } : undefined}>
            <div className="abs" style={{ inset: 0, borderRadius: 32, overflow: 'hidden', background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 12px 32px rgba(27,42,68,0.06)' }}>
              <VenueCard v={VENUES[k]} />
            </div>
          </motion.div>
        );
      })}
      <div className="abs" style={{ left: 196, top: 364, display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => {
          const on = DOT_FOR[front] === i;
          return <motion.div key={i} initial={false} animate={{ width: on ? 22 : 7, backgroundColor: on ? '#14181f' : '#c9d2de' }} transition={GENTLE}
            style={{ height: 7, borderRadius: 4 }} />;
        })}
      </div>
    </div>
  );
}

function RankingRow({ top, n, name, meta, level, onClick }) {
  return (
    <motion.button className="abs" onClick={onClick} whileTap={{ scale: 0.985 }} transition={GENTLE}
      style={{ left: 24, top, width: 392, height: 92, borderRadius: 24, ...cardGlass, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', textAlign: 'left' }}>
      <span style={{ ...h2, width: 22 }}>{n}</span>
      <img src={uri('photoSlot')} alt="" style={{ width: 56, height: 56, display: 'block' }} />
      <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK }}>{name}</span>
        <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>{meta}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src={uri(level === 1 ? 'ripple1' : 'ripple2')} alt="" style={{ width: 36, height: 36, display: 'block' }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{level}</span>
      </span>
    </motion.button>
  );
}

export default function Home({ onOpenMap, onOpenSearch, onOpenVenue, onOpenPage, onOpenModes, modeLabel = 'Study mode', onScroll, reduceMotion, pull, onDiscover, pullOn = true }) {
  const scrollRef = useRef(null);
  usePullDown({ el: scrollRef, pull, enabled: pullOn, onCommit: onDiscover });
  const r = useTransform(pull, [0, 24], [0, 32]);
  const sh = useTransform(pull, [0, 24], ['0 -10px 28px rgba(42,38,80,0)', '0 -10px 28px rgba(42,38,80,0.12)']);
  return (
    <motion.div className="abs" style={{ inset: 0, y: pull, overflow: 'hidden', background: '#f7f5f1', borderTopLeftRadius: r, borderTopRightRadius: r, boxShadow: sh, zIndex: 1, userSelect: 'none', WebkitUserSelect: 'none' }} onDragStart={(e) => e.preventDefault()}>
    <div ref={scrollRef} className="scroll" style={{ background: '#f7f5f1' }} onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}>
      <div style={{ position: 'relative', width: 440, height: 1753.83 }}>
        <Hero reduce={reduceMotion} pull={pull} />
        <p className="abs nowrap" style={{ left: 24, top: 59, fontSize: 15, fontWeight: 500, color: INK2 }}>Savannah, GA</p>
        <motion.button className="abs nowrap" onClick={onOpenModes} whileTap={{ scale: 0.95 }} transition={GENTLE}
          style={{ right: 22, top: 46, height: 44, padding: '0 16px', borderRadius: 999, ...lightGlass, fontSize: 15, fontWeight: 500, color: INK }}>
          {modeLabel}
        </motion.button>
        <p className="abs nowrap" style={{ left: 24, top: 90, fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: INK }}>Good morning</p>
        <button type="button" onClick={onOpenSearch} className="abs" style={{ left: 23, top: 145, width: 334, height: 52, borderRadius: 999, ...lightGlass, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <img src={uri('searchHome')} alt="" style={{ width: 20, height: 20, display: 'block' }} />
          <span style={{ fontSize: 16, color: '#000' }}>Search places</span>
        </button>
        <motion.button className="abs" whileTap={{ scale: 0.92 }} transition={GENTLE}
          style={{ left: 367, top: 147, width: 48, height: 48, borderRadius: 24, ...lightGlass }}>
          <img src={uri('filterHome')} alt="" className="abs" style={{ left: 11, top: 11, width: 24, height: 24 }} />
        </motion.button>

        <Categories onOpen={onOpenPage} />
        <SectionHeader top={421.17} title="For you" onSeeAll={() => onOpenPage?.('foryou')} />
        <ForYouStack onOpenVenue={onOpenVenue} />

        <SectionHeader top={946} title="Popular Around you" onSeeAll={() => onOpenPage?.('popular')} />
        <RankingRow top={998} n={1} name="Gallery Café" meta="Café · 1.1 mi" level={1} />
        <RankingRow top={1106} n={2} name="Foxy Loxy Café" meta="Café · 0.5 mi" level={2} onClick={onOpenVenue} />
        <RankingRow top={1214} n={3} name="The Sentient" meta="Café · 0.8 mi" level={2} />

        <div className="abs" style={{ left: 24, top: 1346, width: 392, height: 164, borderRadius: 24, overflow: 'hidden', background: 'rgba(20,24,31,0.06)', boxShadow: '0 12px 32px rgba(27,42,68,0.06)' }}>
          <span className="abs nowrap" style={{ left: 24, top: 24, padding: '4px 12px', borderRadius: 999, background: INK, color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(27,42,68,0.12)' }}>Quiet hour</span>
          <p className="abs nowrap" style={{ ...h2, left: 24, top: 60 }}>The Sentient</p>
          <p className="abs nowrap" style={{ left: 24, top: 96, fontSize: 15, fontWeight: 500, color: INK2 }}>2 – 4 pm · 10% off pastries</p>
          <button className="abs nowrap" style={{ left: 24, top: 122, fontSize: 13, fontWeight: 700, color: INK }}>Plan a calm visit</button>
        </div>

        <motion.button className="abs" onClick={onOpenMap} whileTap={{ scale: 0.98 }} transition={GENTLE}
          style={{ left: 24, top: 1550, width: 392, height: 80, borderRadius: 24, ...cardGlass, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 18px 20px', textAlign: 'left' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK }}>Rather see a map?</span>
            <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>Calm spots around you, by noise level</span>
          </span>
          <span className="nowrap" style={{ border: '1.5px solid rgba(20,24,31,0.08)', borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: INK, whiteSpace: 'pre' }}>{'Open map  →'}</span>
        </motion.button>
      </div>
    </div>
    </motion.div>
  );
}

