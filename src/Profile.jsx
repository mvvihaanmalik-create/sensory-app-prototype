// Profile section (Figma 737:2787): Default, Posts you liked, Saved collections, All saved, App comfort,
// Reservations (ticket wallet) and Booking confirmed.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Glass, GENTLE, useScale } from './ui.jsx';
import { TAP, t } from './flow.jsx';
import { modeSummary } from './Modes.jsx';
import { Ph } from './phosphor.jsx';
import { FSeg, FSwitch, FRow, FHead, FCard, IconBtn } from './settingsKit.jsx';
import { Ticket, ticketFor, BookingConfirmed } from './BookTable.jsx';
import { VP } from './venuePhotos.js';
import { PHOTO } from './remainingPhotos.js';
import nora from './assets/people/nora.jpg';

const INK = '#2a2650', SUB = '#5e5a7e';
const SLIDE = { initial: { x: 440 }, animate: { x: 0 }, exit: { x: 440 }, transition: { type: 'spring', stiffness: 300, damping: 34 } };

// ---------- Default ----------
function StatTile({ icon, label, onClick }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.96 }} transition={TAP} style={{ position: 'relative', flex: '1 0 0', height: 82, textAlign: 'left' }}>
      <Glass radius={24} angle="143.8deg" style={{ inset: 0 }} contentStyle={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 5, padding: '18px 20px' }}>
        <Ph n={icon} size={24} fill={INK} /><span style={t(13, 400, SUB)}>{label}</span>
      </Glass>
    </motion.button>
  );
}

function SettingsRow({ icon, label, onClick }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.98 }} transition={GENTLE} style={{ position: 'relative', width: 392, height: 56, textAlign: 'left' }}>
      <Glass radius={28} angle="171deg" style={{ inset: 0 }} contentStyle={{ gap: 12, padding: '0 19px 0 22px' }}>
        <Ph n={icon} size={24} fill={INK} /><span style={{ ...t(16, 500, INK), flex: '1 0 0' }}>{label}</span><Ph n="caret-right" size={18} fill={SUB} />
      </Glass>
    </motion.button>
  );
}

// Swipe the card to change the active mode; the last page adds a new one.
function MyModes({ modes, activeId, onPick, onEdit, onAdd }) {
  const [view, setView] = useState(activeId);
  const scale = useScale(), gesture = useRef(null), dragged = useRef(false);
  const pages = [...modes.map((m) => m.id), 'add'];
  const index = Math.max(0, pages.indexOf(view));
  const mode = modes.find((m) => m.id === view);
  const [dir, setDir] = useState(1);
  useEffect(() => { setView(activeId); }, [activeId]);
  const choose = (i) => { const k = Math.max(0, Math.min(pages.length - 1, i)); setDir(k >= index ? 1 : -1); const next = pages[k]; setView(next); if (next !== 'add') onPick(next); };
  const begin = (e) => { if (e.button !== 0) return; dragged.current = false; gesture.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const move = (e) => {
    const g = gesture.current; if (!g) return;
    const dx = (e.clientX - g.x) / scale, dy = (e.clientY - g.y) / scale;
    if (!g.moved && Math.max(Math.abs(dx), Math.abs(dy)) > 6) {
      if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      g.moved = true; dragged.current = true; e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const end = (e) => { const g = gesture.current; gesture.current = null; if (g?.moved) { const dx = (e.clientX - g.x) / scale; if (Math.abs(dx) > 32) choose(index + (dx < 0 ? 1 : -1)); } };
  const edit = () => { if (dragged.current) return; mode ? onEdit(mode.id) : onAdd(); };
  return (
    <div data-profile-modes style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <p style={t(15, 700, SUB)}>My modes</p>
      <div style={{ position: 'relative', height: 152 }}>
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.div key={view} data-profile-mode={view} role="button" tabIndex={0} aria-label={mode ? `${mode.name}. Edit mode` : 'Add mode'}
            initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={GENTLE}
            onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; }} onClick={edit}
            onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); choose(index + (e.key === 'ArrowRight' ? 1 : -1)); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dragged.current = false; edit(); } }}
            style={{ position: 'absolute', inset: 0, cursor: 'grab', touchAction: 'pan-y', userSelect: 'none' }}>
            <Glass radius={24} style={{ inset: 0 }} contentStyle={{ display: 'block' }}>
              <span className="abs nowrap" style={{ left: 16, top: 15, ...t(22, 600, INK), lineHeight: '26px' }}>{mode ? mode.name : 'Add mode'}</span>
              {mode ? <>
                {mode.desc && <span className="abs nowrap" style={{ left: 16, top: 47, ...t(14, 400, SUB) }}>{mode.desc}</span>}
                <span className="abs nowrap" style={{ left: 16, top: 76, width: 284, height: 32, padding: '7px 11px', borderRadius: 12, background: 'rgba(255,255,255,0.8)', ...t(13, 400, SUB), overflow: 'hidden', textOverflow: 'ellipsis' }}>{modeSummary(mode)}</span>
                <span className="abs nowrap" style={{ left: 16, top: 120, ...t(14, 600, SUB), whiteSpace: 'pre' }}>{'Edit mode  ›'}</span>
                {mode.id === activeId && <span className="abs" style={{ right: 16, top: 15, ...t(10, 700, SUB) }}>ACTIVE</span>}
              </> : <span className="abs nowrap" style={{ left: 16, top: 47, ...t(14, 400, SUB) }}>Make a mode for another setting</span>}
            </Glass>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Posts you liked ----------
const LIKED = [
  { id: 'maya', photo: PHOTO.p0404, text: 'My favorite courtyard reset. Coffee, shade, and room to breathe.', who: 'maya.sav', when: '1 day ago', likes: 128 },
  { id: 'jules', photo: PHOTO.p0406, text: 'A sunny seat for a slow morning.', who: 'jules.jpg', when: '4 days ago', likes: 94 },
  { id: 'eli', photo: PHOTO.p0405, text: 'Dinner with a cozy corner booth.', who: 'eli.explores', when: '3 days ago', likes: 76 },
  { id: 'nina', photo: PHOTO.p0407, text: 'An afternoon of clay, color, and a little creative reset.', who: 'nina.makes', when: '1 wk ago', likes: 53 },
];
function LikedCard({ p, onOpen }) {
  const [on, setOn] = useState(true);
  return (
    <motion.div whileTap={{ scale: 0.98 }} transition={TAP} onClick={onOpen} style={{ position: 'relative', width: 191, cursor: onOpen ? 'pointer' : 'default' }}>
      <Glass radius={24} style={{ position: 'relative' }} contentStyle={{ display: 'block', padding: 8 }}>
        <div style={{ width: 176, height: 232, borderRadius: 18, background: `#ddd url(${p.photo}) center / cover` }} />
        <p style={{ ...t(13, 400, INK), padding: '14px 10px 0' }}>{p.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 10px 10px' }}>
          <span style={{ width: 26, height: 26, borderRadius: 13, background: '#e5e3f0', flex: 'none' }} />
          <span style={{ flex: '1 0 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span className="nowrap" style={{ ...t(12, 500, INK), lineHeight: '14px' }}>{p.who}</span>
            <span className="nowrap" style={{ ...t(11, 400, SUB), lineHeight: '13px' }}>{p.when}</span>
          </span>
          <motion.button aria-label={on ? 'Unlike' : 'Like'} aria-pressed={on} whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); setOn(!on); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28 }}>
            <motion.span key={on ? 1 : 0} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} style={{ display: 'flex' }}>
              <Ph n={on ? 'heart-fill' : 'heart'} size={14} fill={SUB} />
            </motion.span>
            <span style={{ ...t(12, 500, SUB), lineHeight: '14px' }}>{p.likes - (on ? 0 : 1)}</span>
          </motion.button>
        </div>
      </Glass>
    </motion.div>
  );
}

// ---------- Saved ----------
const PLACES = {
  fern: { name: 'Fern & Fable', meta: 'Café · 0.5 mi', note: 'Back patio', photo: PHOTO.p0602, venue: true },
  sentient: { name: 'The Sentient', meta: 'Café · 0.8 mi', note: 'Natural light', photo: PHOTO.p0607 },
  juniper: { name: 'Juniper Coffee', meta: 'Café · 1.1 mi', note: 'Art gallery', photo: PHOTO.p0608 },
  willow: { name: 'Willow Table', meta: 'American · 0.7 mi', photo: PHOTO.p0610 },
};
const COLLECTIONS = [
  { id: 'all', name: 'All saved', items: ['fern', 'sentient', 'juniper', 'willow'] },
  { id: 'coffee', name: 'Coffee spots', items: ['fern', 'sentient', 'juniper'] },
  { id: 'dinner', name: 'Dinner plans', items: ['willow'] },
];
const count = (n) => `${n} saved place${n === 1 ? '' : 's'}`;

function Collections({ onOpen, collections }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {collections.map((c, i) => (
        <motion.button key={c.id} onClick={() => onOpen(c)} whileTap={{ scale: 0.98 }} transition={TAP}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ width: 392, height: 170, borderRadius: 28, background: 'rgba(255,255,255,0.85)', padding: 17, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', width: '100%', height: 44 }}>
            <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ ...t(19, 700, INK), lineHeight: '23px' }}>{c.name}</span>
              <span style={{ ...t(14, 500, SUB), lineHeight: '17px' }}>{count(c.items.length)}</span>
            </span>
            <Ph n="caret-right" size={22} fill={SUB} />
          </span>
          <span style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2, 3].map((k) => {
              const p = PLACES[c.items[k]];
              return <span key={k} style={{ width: 80, height: 80, borderRadius: 16, background: p ? `url(${p.photo}) center / cover` : 'rgba(94,90,126,0.07)' }} />;
            })}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function SavedGrid({ items, onOpenVenue }) {
  if (!items.length) return <p style={{ ...t(16, 400, SUB), padding: '32px 0', textAlign: 'center' }}>No saved places yet</p>;
  // Two columns, left cards a little taller (Figma "Saved place grid").
  const cols = [[], []];
  items.forEach((id, i) => cols[i % 2].push([id, i % 2 ? 188 : 206]));
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 188 }}>
          {col.map(([id, h], k) => {
            const p = PLACES[id];
            return (
              <motion.button key={id} onClick={() => p.venue && onOpenVenue()} whileTap={{ scale: 0.97 }} transition={TAP}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { ...GENTLE, delay: 0.05 * (k * 2 + ci) } }}
                style={{ width: 188, borderRadius: 32, background: '#f4f3f3', padding: 7, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ width: 174, height: h, borderRadius: 25, background: `url(${p.photo}) center / cover` }} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '1px 7px 8px' }}>
                  <span className="nowrap" style={{ ...t(17, 700, INK), lineHeight: '20px' }}>{p.name}</span>
                  <span style={{ ...t(13, 500, SUB), lineHeight: '16px' }}>{p.meta}</span>
                  {p.note && <span style={{ ...t(13, 500, SUB), lineHeight: '16px' }}>{p.note}</span>}
                </span>
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------- Reservations: a wallet of stacked tickets ----------
const OTHER_TICKETS = {
  grey: { theme: 'grey', name: 'The Grey', when: 'Sat, Nov 21 · 7:00 PM', guests: 2, seat: 'Patio · Table 4', held: '5:45 PM' },
  willow: { theme: 'willow', name: 'Willow Table', when: 'Fri, Nov 20 · 6:00 PM', guests: 2, seat: 'Patio · Table 4', held: '5:45 PM' },
};
function Wallet({ booking, onOpenBooking }) {
  const [order, setOrder] = useState(['grey', 'willow', 'fern']);
  const moving = useRef(false);
  const front = order[order.length - 1];
  const tap = (id) => {
    if (id === front) { if (id === 'fern' && !moving.current) onOpenBooking(); return; }
    moving.current = true;
    setOrder(current => [...current.filter(x => x !== id), id]);
  };
  return (
    <div style={{ position: 'relative', width: 340, height: 620, margin: '0 auto' }}>
      {['grey', 'willow', 'fern'].map(id => {
        const i = order.indexOf(id);
        const data = id === 'fern' ? { theme: 'fern', ...ticketFor(booking) } : OTHER_TICKETS[id];
        return (
          <motion.div key={id} role="button" tabIndex={0} aria-label={`${data.name || 'Fern & Fable'} reservation`} aria-pressed={id === front}
            initial={false} animate={{ y: i * 76 }} transition={{ type: 'spring', stiffness: 300, damping: 36 }}
            onAnimationComplete={() => { if (id === front) moving.current = false; }} onClick={() => tap(id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(id); } }}
            data-wallet-ticket={id} className="abs" style={{ left: 0, top: 0, zIndex: i, cursor: 'pointer', touchAction: 'pan-y', scale: '1', translate: 'none', filter: 'none', transition: 'none' }}>
            <Ticket {...data} animatedArt nameTop />
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------- App comfort ----------
export const COMFORT_DEFAULT = { theme: 'Light', text: 'Default', colors: 'Soft', motion: 'Standard', haptics: true };
let COMFORT_SAVED = COMFORT_DEFAULT; // survives leaving and re-opening the Profile tab
function AppComfort({ value, onChange }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <div style={{ padding: '206px 24px 60px', display: 'flex', flexDirection: 'column' }}>
      <FHead>DISPLAY</FHead><div style={{ height: 24 }} />
      <FCard>
        <FRow icon="sun-dim" label="Theme"><FSeg options={['Light', 'Dark', 'System']} value={value.theme} onChange={set('theme')} /></FRow>
        <FRow icon="text-aa" label="Text size"><FSeg options={['Default', 'Large', 'Larger']} value={value.text} onChange={set('text')} /></FRow>
        <FRow icon="palette" label="Colors" last><FSeg options={['Soft', 'Vivid']} value={value.colors} onChange={set('colors')} /></FRow>
      </FCard>
      <div style={{ height: 24 }} /><FHead>FEEL</FHead><div style={{ height: 24 }} />
      <FCard>
        <FRow icon="sparkle" label="Motion"><FSeg options={['Standard', 'Reduced']} value={value.motion} onChange={set('motion')} /></FRow>
        <FRow icon="vibrate" label="Haptics" last><FSwitch on={value.haptics} onChange={set('haptics')} /></FRow>
      </FCard>
    </div>
  );
}

// ---------- Page shell ----------
function Page({ title, sub, right, onBack, children, top = 151, bg = '#f7f5f1' }) {
  return (
    <motion.div className="abs" style={{ inset: 0, background: bg }} {...SLIDE}>
      <div className="scroll" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ padding: `${top}px 24px 140px` }}>{children}</div>
      </div>
      <div className="abs" style={{ left: 0, top: 0, width: 440, height: 130, background: `linear-gradient(${bg} 75%, rgba(247,245,241,0))`, pointerEvents: 'none' }} />
      <IconBtn icon="caret-left" label="Back" onClick={onBack} left={24} />
      {title && <div className="abs" style={{ left: 92, top: sub ? 72 : 83, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="nowrap" style={{ ...t(22, 600, INK), lineHeight: '26px' }}>{title}</span>
        {sub && <span className="nowrap" style={{ ...t(15, 500, SUB), lineHeight: '18px' }}>{sub}</span>}
      </div>}
      {right}
    </motion.div>
  );
}

export default function Profile({ onScroll, modes, activeId, onPickMode, onEditMode, onAddMode, onOpenVenue, onOpenPost, booking, onOverlay = () => {}, onTheme }) {
  const [stack, setStack] = useState([]);
  const viewportRef = useRef(null);
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [collections, setCollections] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('sensory-custom-collections') || '[]'); return [...COLLECTIONS, ...saved.filter(c => typeof c.id === 'string' && typeof c.name === 'string' && Array.isArray(c.items))]; }
    catch { return COLLECTIONS; }
  });
  const [creatingCollection, setCreatingCollection] = useState(false);
  const createCollection = name => {
    const next = [...collections, { id: `collection-${Date.now()}`, name, items: [] }];
    setCollections(next);
    try { localStorage.setItem('sensory-custom-collections', JSON.stringify(next.filter(c => !COLLECTIONS.some(seed => seed.id === c.id)))); } catch {}
    setCreatingCollection(false);
  };
  const [comfort, setComfort] = useState(COMFORT_SAVED);
  const [alerts, setAlerts] = useState(false);
  const top = stack[stack.length - 1];
  useLayoutEffect(() => {
    viewportRef.current?.querySelectorAll('.scroll').forEach(el => { el.scrollTop = 0; });
    onScroll?.(0);
  }, [top]);
  const push = (p) => setStack((s) => [...s, p]);
  const pop = () => setStack((s) => s.slice(0, -1));
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.reduceMotion = comfort.motion === 'Reduced' ? 'on' : 'off';
    r.dataset.vivid = comfort.colors === 'Vivid' ? 'on' : 'off';
    COMFORT_SAVED = comfort;
    onTheme?.(comfort.theme === 'Dark'); // Dark shows the app's dark Home (the Good night scene)
  }, [comfort]);
  // App comfort and the booking screen cover the tab bar, as in Figma.
  useEffect(() => { onOverlay(top === 'comfort' || top === 'booking' || creatingCollection); }, [top, creatingCollection]);
  useEffect(() => () => onOverlay(false), []);

  return (
    <div ref={viewportRef} className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <div className="scroll" onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)} aria-hidden={!!top || undefined}>
        <div style={{ padding: '77px 24px 140px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ marginTop: 9, width: 74, height: 74, borderRadius: 37, padding: 1.5, background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 20px rgba(42,38,80,0.08)', flex: 'none' }}>
              <img src={nora} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 292 }}>
              <span style={{ ...t(44, 600, INK), lineHeight: '53px', letterSpacing: -0.5 }}>Nora</span>
              <span style={{ ...t(14, 400, SUB), lineHeight: '17px' }}>New in town, just looking for my quiet little corners. 🌿</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <StatTile icon="bookmarks-simple" label="Saved" onClick={() => push('collections')} />
            <StatTile icon="heart" label="Liked" onClick={() => push('liked')} />
            <StatTile icon="note-pencil" label="My Reviews" />
          </div>
          <div style={{ marginTop: 24 }}><MyModes modes={modes} activeId={activeId} onPick={onPickMode} onEdit={onEditMode} onAdd={onAddMode} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            <SettingsRow icon="calendar-blank" label="My Reservations" onClick={() => push('reservations')} />
            <SettingsRow icon="map-pin" label="My Address" />
            <SettingsRow icon="sliders-horizontal" label="App comfort" onClick={() => push('comfort')} />
            <SettingsRow icon="gear" label="General" />
            <div style={{ position: 'relative', width: 392, height: 56 }}>
              <Glass radius={32} angle="170.7deg" style={{ inset: 0 }} contentStyle={{ gap: 12, padding: '0 13px 0 22px' }}>
                <Ph n="bell" size={22} fill={INK} /><span style={{ ...t(16, 500, INK), flex: '1 0 0' }}>Sensory change alerts</span>
                <FSwitch big on={alerts} onChange={setAlerts} />
              </Glass>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {stack.includes('liked') && <Page key="liked" title="Posts You Liked" onBack={pop}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {[[LIKED[0], LIKED[2]], [LIKED[1], LIKED[3]]].map((col, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{col.map((p) => <LikedCard key={p.id} p={p} onOpen={p.id === 'maya' ? onOpenPost : undefined} />)}</div>
            ))}
          </div>
        </Page>}
        {stack.includes('collections') && <Page key="collections" title="Saved Collections" top={150} onBack={pop}
          right={<IconBtn icon="plus" label="New collection" onClick={() => setCreatingCollection(true)} right={24} />}>
          <Collections collections={collections} onOpen={(c) => { setCollection(c); push('allsaved'); }} />
        </Page>}
        {stack.includes('allsaved') && <Page key="allsaved" title={collection.name} sub={count(collection.items.length)} onBack={pop}
          right={<IconBtn icon="export" label="Share collection" right={24} />}>
          <SavedGrid items={collection.items} onOpenVenue={onOpenVenue} />
        </Page>}
        {stack.includes('reservations') && <Page key="reservations" title="Reservations" top={192} onBack={pop}>
          <Wallet booking={booking} onOpenBooking={() => push('booking')} />
        </Page>}
        {stack.includes('comfort') && <motion.div key="comfort" className="abs" data-app-comfort style={{ inset: 0, background: '#f7f5f1' }} {...SLIDE}>
          <div className="scroll" style={{ position: 'absolute', inset: 0 }}><AppComfort value={comfort} onChange={setComfort} /></div>
          <IconBtn icon="caret-left" label="Back" onClick={pop} left={24} />
          <p className="abs nowrap" style={{ left: 24, top: 134, ...t(30, 600, INK), lineHeight: '44px' }}>App comfort</p>
        </motion.div>}
        {stack.includes('booking') && <motion.div key="booking" className="abs" style={{ inset: 0, zIndex: 5 }} {...SLIDE}>
          <BookingConfirmed booking={booking} onClose={pop} onChange={pop} />
        </motion.div>}
      </AnimatePresence>
      {creatingCollection && <CreateCollection onClose={() => setCreatingCollection(false)} onCreate={createCollection} />}
    </div>
  );
}

function CreateCollection({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const form = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    form.current?.querySelector('input')?.focus();
    return () => previous?.focus();
  }, []);
  return <div className="abs" style={{ inset: 0, zIndex: 20, background: 'rgba(42,38,80,.25)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 180 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form ref={form} role="dialog" aria-modal="true" aria-labelledby="collection-title" onSubmit={e => { e.preventDefault(); if (name.trim()) onCreate(name.trim()); }}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
        if (e.key === 'Tab') {
          const controls = [...form.current.querySelectorAll('input, button:not(:disabled)')];
          const first = controls[0], last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }} style={{ width: 392, padding: 24, borderRadius: 28, background: '#f7f5f1', boxShadow: '0 20px 50px rgba(42,38,80,.2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 id="collection-title" style={t(24, 600, INK)}>New collection</h2>
      <label style={{ ...t(15, 500, SUB), display: 'flex', flexDirection: 'column', gap: 10 }}>Collection name
        <input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="e.g. Quiet coffee spots" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(94,90,126,.2)', borderRadius: 16, padding: '14px 16px', background: '#fff', ...t(17, 400, INK) }} />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ padding: '12px 20px', borderRadius: 24, ...t(16, 600, SUB) }}>Cancel</button>
        <button type="submit" disabled={!name.trim()} style={{ padding: '12px 20px', borderRadius: 24, background: INK, opacity: name.trim() ? 1 : .4, ...t(16, 600, '#fff') }}>Create</button>
      </div>
    </form>
  </div>;
}
