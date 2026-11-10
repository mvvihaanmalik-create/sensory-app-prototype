import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useMotionValue, animate, AnimatePresence } from 'motion/react';
import { paths, profileIcons as pi } from './svgs.js';
import { Icon, GENTLE, INK, INK2, NAVY, MUTED } from './ui.jsx';
import { BackBtn, VenueRow } from './Lists.jsx';
import { PLACES, SOUND_W, LIGHT_W, CROWD_W, metaOf } from './discoverData.js';

// Glass surface used by Stat tile / Sense tile / Settings row / Toggle row
// (fill glass/light/fill + 135° sheen, 1.5 stroke glass/light/stroke, bg blur, 0 14 36 shadow)
const glass = (r) => ({
  position: 'relative', borderRadius: r, border: '1.5px solid rgba(255,255,255,0.95)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 100%), rgba(255,255,255,0.55)',
  WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)', boxShadow: '0 14px 36px rgba(42,38,80,0.1)',
});

function Svg({ d, size, vb, fill }) {
  return <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none" style={{ display: 'block', flex: 'none' }}><path d={d} fill={fill} /></svg>;
}

const rise = (i) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { ...GENTLE, delay: 0.05 + i * 0.05 } });

function SettingsRow({ icon, label, i }) {
  return (
    <motion.button {...rise(i)} whileTap={{ scale: 0.98 }}
      style={{ ...glass(28), width: 392, height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16.5px 0 18.5px', textAlign: 'left' }}>
      <Svg d={icon} size={22} vb={22} fill={NAVY} />
      <span style={{ flex: '1 0 0', fontSize: 16, fontWeight: 500, color: NAVY }}>{label}</span>
      <Svg d={pi.caret} size={18} vb={18} fill={MUTED} />
    </motion.button>
  );
}

const GREEN = '#386b5e', MINT = '#e5f0e8';
const STEP = 392 + 16; // one card plus the gap between cards in the track
const prefLine = (p) => [p.sound, p.light?.b, p.crowd].filter(Boolean).join(' · ') || 'Anything goes';

function ModeCard({ m, active, onEdit }) {
  return (
    <div style={{ position: 'relative', width: 392, height: 152, borderRadius: 24, background: '#fff', flex: 'none' }}>
      <p className="abs nowrap" style={{ left: 16, top: 15, fontSize: 22, fontWeight: 600, color: INK, lineHeight: '26px' }}>{m.name}</p>
      <p className="abs nowrap" style={{ left: 16, top: 47, fontSize: 14, color: INK2, lineHeight: '17px' }}>{m.desc || 'Your own mode'}</p>
      <div className="abs" style={{ left: 16, top: 76, width: 284, height: 32, borderRadius: 12, background: MINT }} />
      <p className="abs nowrap" style={{ left: 27, top: 83, width: 262, fontSize: 13, color: GREEN, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prefLine(m.prefs)}</p>
      <button onClick={onEdit} className="abs nowrap" style={{ left: 4, top: 112, height: 32, padding: '0 12px', fontSize: 14, fontWeight: 600, color: GREEN, display: 'flex', alignItems: 'center' }}>Edit mode&nbsp; ›</button>
      {active && <span className="abs nowrap" style={{ right: 16, top: 15, fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 0.3 }}>ACTIVE</span>}
    </div>
  );
}
function AddModeCard({ onAdd }) {
  return (
    <button onClick={onAdd} style={{ position: 'relative', display: 'block', width: 392, height: 152, borderRadius: 24, background: MINT, flex: 'none', textAlign: 'left' }}>
      <p className="abs nowrap" style={{ left: 16, top: 15, fontSize: 22, fontWeight: 600, color: INK, lineHeight: '26px' }}>Add mode</p>
      <p className="abs nowrap" style={{ left: 16, top: 47, fontSize: 14, color: INK2, lineHeight: '17px' }}>Make a mode for another setting</p>
      <p className="abs nowrap" style={{ left: 27, top: 83, fontSize: 13, color: GREEN, lineHeight: '18px', whiteSpace: 'pre' }}>{'＋  Add new mode'}</p>
    </button>
  );
}

// Swipeable "My modes" carousel (Figma 1025:1141): one card per mode, then Add mode. Landing on a mode makes it the active one.
function MyModes({ modes, activeId, onPick, onEdit, onAdd }) {
  const n = modes.length + 1;
  const at = Math.max(0, modes.findIndex((m) => m.id === activeId));
  const [idx, setIdx] = useState(at);
  const x = useMotionValue(-at * STEP);
  const dragged = useRef(false);
  const go = (i, fromUser = true) => {
    const k = Math.max(0, Math.min(n - 1, i));
    setIdx(k);
    animate(x, -k * STEP, { type: 'spring', stiffness: 320, damping: 34 });
    if (fromUser && k < modes.length && modes[k].id !== activeId) onPick(modes[k].id);
  };
  // Follow the active mode when it changes elsewhere (mode sheet, deleting a mode), but never yank the Add page away
  useEffect(() => { if (idx < modes.length && modes[idx]?.id !== activeId) go(at, false); }, [activeId, modes.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const end = (_, info) => {
    const dir = info.offset.x < -50 || info.velocity.x < -450 ? 1 : info.offset.x > 50 || info.velocity.x > 450 ? -1 : 0;
    go(idx + dir);
    setTimeout(() => { dragged.current = false; }, 0);
  };
  return (
    <motion.div {...rise(3)} style={{ position: 'relative', width: 392, height: 211, flex: 'none' }}>
      <p className="abs nowrap" style={{ left: 0, top: 0, fontSize: 15, fontWeight: 700, color: GREEN }}>My modes</p>
      <p className="abs nowrap" style={{ right: 0, top: 2, fontSize: 12, fontWeight: 700, color: GREEN }}>Swipe to change mode</p>
      <div className="abs" style={{ left: 0, top: 29, width: 392, height: 152, borderRadius: 24, overflow: 'hidden' }}>
        <motion.div drag="x" dragMomentum={false} dragElastic={0.18} dragConstraints={{ left: -(n - 1) * STEP, right: 0 }}
          onDragStart={() => { dragged.current = true; }} onDragEnd={end}
          style={{ x, display: 'flex', gap: 16, width: n * STEP, cursor: 'grab' }}>
          {modes.map((m, i) => (
            <div key={m.id} aria-hidden={i !== idx} onClickCapture={(e) => { if (dragged.current) e.stopPropagation(); }}>
              <ModeCard m={m} active={m.id === activeId} onEdit={() => onEdit(m.id)} />
            </div>
          ))}
          <div aria-hidden={idx !== modes.length} onClickCapture={(e) => { if (dragged.current) e.stopPropagation(); }}><AddModeCard onAdd={onAdd} /></div>
        </motion.div>
      </div>
      <div className="abs" style={{ left: 0, top: 186, width: 392, height: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {Array.from({ length: n }, (_, i) => (
          <button key={i} aria-label={i < modes.length ? `Show ${modes[i].name} mode` : 'Show Add mode'} onClick={() => go(i)}
            style={{ width: 18, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: i === idx ? GREEN : MINT, transition: 'background .25s' }} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Saved places (Figma 1025:6461): the venue rows from Cafés and Dining, plus anything saved from Discover.
const SAVED_BASE = [
  { id: 'foxy', venue: true, name: 'Foxy Loxy Cafe', meta: 'Café · 0.5 mi', tags: [['blue', 'Lively inside'], ['blue', 'Patio available']] },
  { id: 'grey', name: 'The Grey', meta: 'American · 0.7 mi · illustrative', tags: [['blue', 'Calm dining room'], ['blue', 'Dim lighting']] },
];
const savedFromDiscover = (decided) => PLACES.filter((p) => decided[p.id] === 'save' && !SAVED_BASE.some((b) => b.id === p.id)).map((p) => ({
  id: p.id, venue: p.venue, name: p.name, meta: metaOf(p),
  tags: [p.s && ['blue', `${SOUND_W[p.s]} sound`], p.l && ['blue', `${LIGHT_W[p.l]} lighting`], !p.s && !p.l && p.c && ['blue', `${CROWD_W[p.c]} crowd`]].filter(Boolean).slice(0, 2),
}));
function SavedPlaces({ decided, onBack, onOpenVenue, onNote }) {
  const rows = [...SAVED_BASE, ...savedFromDiscover(decided)];
  return (
    <motion.div className="abs" style={{ inset: 0, background: '#f7f5f1', zIndex: 20 }} initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
      <div className="scroll hide-sb" style={{ inset: 0 }}>
        <div style={{ padding: '118px 24px 140px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="nowrap" style={{ fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: INK }}>Saved places</p>
          {rows.map((v) => <VenueRow key={v.id} v={v} onOpen={() => (v.venue ? onOpenVenue() : onNote('Only Foxy Loxy Cafe has a full page so far'))} />)}
        </div>
      </div>
      <BackBtn onClick={onBack} top={54} />
    </motion.div>
  );
}

export default function Profile({ onScroll, savedCount = 0, decided = {}, modes, activeId, onPickMode, onEditMode, onAddMode, onOpenVenue, onNote }) {
  const knob = useAnimationControls();
  const [savedOpen, setSavedOpen] = useState(false);
  // "Coming soon": the switch only nudges, it does not turn on.
  const nudge = () => knob.start({ x: [0, 6, 0], transition: { duration: 0.45, ease: 'easeInOut' } });
  return (
    <>
    <div className="scroll" style={{ background: '#f7f5f1' }} onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}>
      <div style={{ position: 'relative', width: 440, minHeight: 956, paddingBottom: 140 }}>
        <p className="abs nowrap" style={{ left: 24, top: 59, fontSize: 15, fontWeight: 500, color: INK2 }}>Savannah, GA</p>
        <p className="abs nowrap" style={{ left: 24, top: 90, fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: INK }}>Profile</p>

        <div style={{ position: 'relative', top: 160, left: 24, width: 392, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Profile header */}
          <motion.div {...rise(0)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ ...glass(32), width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={paths.user} size={28} fill={NAVY} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>Raph</span>
              <span style={{ fontSize: 14, color: MUTED }}>Find places that feel right.</span>
            </div>
          </motion.div>

          {/* Stat tiles: Saved opens the saved places */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[[String(12 + savedCount), 'Saved', () => setSavedOpen(true)], ['4', 'Lists'], ['3', 'Posts']].map(([v, l, fn], i) => (
              <motion.button key={l} {...rise(1 + i * 0.5)} whileTap={{ scale: 0.96 }} onClick={fn}
                style={{ ...glass(24), flex: '1 0 0', height: 82, padding: '14.5px 16.5px', display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', cursor: fn ? 'pointer' : 'default' }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: NAVY, lineHeight: '29px' }}>{v}</span>
                <span style={{ fontSize: 13, color: MUTED }}>{l}</span>
              </motion.button>
            ))}
          </div>

          <MyModes modes={modes} activeId={activeId} onPick={onPickMode} onEdit={onEditMode} onAdd={onAddMode} />

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SettingsRow icon={pi.export} label="Share comfort profile" i={4} />
            <SettingsRow icon={pi.sliders} label="App comfort" i={4.5} />
            <motion.button {...rise(5)} onClick={nudge}
              style={{ ...glass(32), width: 392, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '10.5px 10.5px 10.5px 18.5px', textAlign: 'left' }}>
              <Svg d={pi.bell} size={22} vb={22} fill={NAVY} />
              <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: NAVY }}>Sensory change alerts</span>
                <span style={{ fontSize: 13, color: MUTED }}>Coming soon</span>
              </span>
              <span style={{ width: 52, height: 32, borderRadius: 16, background: 'rgba(42,38,80,0.12)', padding: 3, display: 'flex', alignItems: 'center' }}>
                <motion.span animate={knob} style={{ width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: '0 2px 6px rgba(42,38,80,0.15)' }} />
              </span>
            </motion.button>
          </div>
        </div>

      </div>
    </div>
    <AnimatePresence>
      {savedOpen && <SavedPlaces key="saved" decided={decided} onBack={() => setSavedOpen(false)} onOpenVenue={onOpenVenue} onNote={onNote} />}
    </AnimatePresence>
    </>
  );
}
