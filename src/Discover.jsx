// Hidden Discovery Mode: the layer under Home. Pull the Home sheet down from the top to reveal it,
// then swipe cards (right saves, left passes, tap opens the place).
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { GENTLE, INK, INK2, NAVY, MUTED, useScale } from './ui.jsx';
import { G, TAP } from './flow.jsx';
import { VIcon } from './venueIcons.jsx';
import { uri } from './svgs.js';
import { DarkCTA, TextBtn } from './sheets.jsx';
import { modeLabel } from './Modes.jsx';
import Scene from './art.jsx';
import { SOUND_W, LIGHT_W, CROWD_W, metaOf, rankPlaces, reasonFor } from './discoverData.js';
import sceneMorning from './assets/scene-morning.jpg';

export const SCREEN_H = 956;
export const THRESH = 140; // how far the sheet must be pulled (design px) before letting go opens Discover
const CAP = 420, K = 1;
const rubber = (dy) => CAP * (1 - Math.exp(-(K * dy) / CAP));
const unrubber = (y) => (-CAP / K) * Math.log(1 - Math.min(y, CAP - 1) / CAP);
export const OPEN_SPRING = { type: 'spring', stiffness: 170, damping: 26 };
export const CLOSE_SPRING = { type: 'spring', stiffness: 190, damping: 27 };

/* ---------- Gesture: pull the page down from the very top ----------
   Touch uses real touch listeners so the pull can cancel native scrolling; mouse and pen use pointer events;
   a trackpad or wheel scroll-up that starts while already at the top works too. Vertical-down wins only when it
   clearly beats horizontal, so the For you card swipe keeps its own axis. */
export function usePullDown({ el, pull, enabled, onCommit }) {
  const scale = useScale();
  const sc = useRef(scale); sc.current = scale;
  const cb = useRef(onCommit); cb.current = onCommit;
  useEffect(() => {
    const node = el.current;
    if (!node || !enabled) return undefined;
    let g = null, ctl = null;
    const stop = () => { if (ctl) ctl.stop(); };
    const back = () => { stop(); ctl = animate(pull, 0, CLOSE_SPRING); };
    const release = () => {
      if (pull.get() >= THRESH) { stop(); ctl = animate(pull, SCREEN_H, OPEN_SPRING); cb.current(); } else back();
    };
    const decide = (gg, dx, dy) => {
      if (Math.hypot(dx, dy) < 6) return;
      gg.lock = dy > 0 && dy > Math.abs(dx) * 1.15 && node.scrollTop <= 0 ? 'pull' : 'other';
    };
    const apply = (gg, dy) => { gg.raw = Math.max(0, gg.raw0 + dy); pull.set(rubber(gg.raw)); };

    const pd = (e) => {
      if (e.pointerType === 'touch' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      stop(); g = { x: e.clientX, y: e.clientY, lock: null, raw0: unrubber(pull.get()), id: e.pointerId };
    };
    const pm = (e) => {
      if (!g || g.touch || e.pointerId !== g.id) return;
      const s = sc.current, dx = (e.clientX - g.x) / s, dy = (e.clientY - g.y) / s;
      if (!g.lock) { decide(g, dx, dy); if (g.lock === 'pull') { try { node.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } } }
      if (g.lock === 'pull') apply(g, dy);
    };
    const pu = () => { if (!g || g.touch) return; const was = g.lock; g = null; if (was === 'pull') release(); };

    const ts = (e) => {
      if (e.touches.length !== 1) { g = null; return; }
      const t = e.touches[0]; stop(); g = { touch: true, x: t.clientX, y: t.clientY, lock: null, raw0: unrubber(pull.get()) };
    };
    const tm = (e) => {
      if (!g || !g.touch || !e.touches.length) return;
      const t = e.touches[0], s = sc.current, dx = (t.clientX - g.x) / s, dy = (t.clientY - g.y) / s;
      if (!g.lock) decide(g, dx, dy);
      if (g.lock === 'pull') { if (e.cancelable) e.preventDefault(); apply(g, dy); }
    };
    const te = () => { if (!g || !g.touch) return; const was = g.lock; g = null; if (was === 'pull') release(); };

    // Wheel / trackpad: only a stream that starts at the top counts, so momentum from scrolling up to the top never triggers it.
    const w = { last: 0, active: false, raw: 0, timer: 0 };
    const wheel = (e) => {
      const now = performance.now(), fresh = now - w.last > 220; w.last = now;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (fresh) { w.active = node.scrollTop <= 0 && dy < 0 && Math.abs(dy) > Math.abs(e.deltaX); w.raw = unrubber(pull.get()); stop(); }
      if (!w.active) return;
      e.preventDefault();
      w.raw = Math.max(0, w.raw - dy); pull.set(rubber(w.raw));
      clearTimeout(w.timer); w.timer = setTimeout(() => { w.active = false; release(); }, 130);
    };

    node.addEventListener('pointerdown', pd);
    node.addEventListener('pointermove', pm);
    node.addEventListener('pointerup', pu);
    node.addEventListener('pointercancel', pu);
    node.addEventListener('touchstart', ts, { passive: true });
    node.addEventListener('touchmove', tm, { passive: false });
    node.addEventListener('touchend', te);
    node.addEventListener('touchcancel', te);
    node.addEventListener('wheel', wheel, { passive: false });
    return () => {
      clearTimeout(w.timer);
      node.removeEventListener('pointerdown', pd); node.removeEventListener('pointermove', pm);
      node.removeEventListener('pointerup', pu); node.removeEventListener('pointercancel', pu);
      node.removeEventListener('touchstart', ts); node.removeEventListener('touchmove', tm);
      node.removeEventListener('touchend', te); node.removeEventListener('touchcancel', te);
      node.removeEventListener('wheel', wheel);
    };
  }, [el, pull, enabled]);
}

/* ---------- "Keep pulling to discover" ---------- */
function PullHint({ pull }) {
  const [ready, setReady] = useState(false);
  useMotionValueEvent(pull, 'change', (v) => { const r = v >= THRESH; setReady((p) => (p === r ? p : r)); });
  // rides just above the sheet edge, below the status bar and the island, so it only shows once the strip is tall enough
  const opacity = useTransform(pull, [76, 104, 330, 500], [0, 1, 1, 0]);
  const top = useTransform(pull, (v) => Math.min(Math.max(58, v - 40), 190));
  return (
    <motion.div className="abs" style={{ left: 0, width: 440, top, opacity, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, height: 24 }}>
        <motion.span animate={{ scale: ready ? 1.25 : 1, rotate: ready ? 90 : 0 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }} style={{ display: 'flex' }}>
          <VIcon name="sparkle" size={18} fill={NAVY} />
        </motion.span>
        <span style={{ position: 'relative', display: 'inline-block', fontSize: 14, fontWeight: 600, color: NAVY, lineHeight: '24px' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={ready ? 'r' : 'k'} className="nowrap" style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
              {ready ? 'Release to discover' : 'Keep pulling to discover'}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </motion.div>
  );
}

/* ---------- Backdrop: soft Savannah dusk, same scene as the Home header ---------- */
function Backdrop() {
  const fade = 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 45%, transparent 90%)';
  return (
    <div className="abs" style={{ inset: 0, background: 'linear-gradient(180deg, #cfe3f3 0%, #e8dfd9 30%, #f5dfc9 52%, #f7ece0 78%, #f7f5f1 100%)' }}>
      <div className="abs" style={{ left: -60, top: 90, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)' }} />
      <div className="abs" style={{ left: 200, top: 360, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(246,196,168,0.35), rgba(246,196,168,0) 70%)' }} />
      <img src={sceneMorning} alt="" draggable={false} className="abs"
        style={{ left: -40, bottom: 0, width: 520, height: 371, maxWidth: 'none', transform: 'scaleX(-1)', opacity: 0.3, pointerEvents: 'none', WebkitMaskImage: fade, maskImage: fade }} />
    </div>
  );
}

/* ---------- Card ---------- */
const Pips = ({ n }) => (
  <span style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: n != null && i <= n ? NAVY : 'rgba(20,24,31,0.12)' }} />)}
  </span>
);
function SenseChip({ label, n, words }) {
  const known = n != null;
  return (
    <div style={{ flex: '1 0 0', minWidth: 0, background: '#f4f2ee', borderRadius: 16, padding: '9px 12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="nowrap" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, lineHeight: '13px' }}>{label}</span>
      <span className="nowrap" style={{ fontSize: 15, fontWeight: known ? 700 : 500, color: known ? INK : INK2, lineHeight: '18px' }}>{known ? words[n] : 'Unknown'}</span>
      <Pips n={n} />
    </div>
  );
}

function CardFace({ p, prefs, modeName, stamps }) {
  const { line, note } = reasonFor(p, prefs, modeName);
  return (
    <div className="abs" style={{ inset: 0, borderRadius: 32, overflow: 'hidden', background: '#fff', border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 12px 32px rgba(27,42,68,0.10)', userSelect: 'none' }}>
      <div className="abs" style={{ left: 0, top: 0, width: 360, height: 330, overflow: 'hidden' }}><Scene kind={p.scene} tone={p.tone} /></div>
      <div className="abs" style={{ left: 14, top: 14, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px 4px 8px', borderRadius: 999, background: '#f7f5f1', boxShadow: '0 4px 14px rgba(27,42,68,0.08)' }}>
        <img src={uri('rippleCard')} alt="" draggable={false} style={{ width: 28, height: 28, display: 'block' }} />
        <span className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: INK }}>Level {p.level}</span>
      </div>
      {stamps && (
        <>
          <motion.div className="abs" style={{ left: 18, top: 70, opacity: stamps.save, rotate: -12, padding: '4px 14px', border: '3px solid #2f62c9', borderRadius: 12, background: 'rgba(255,255,255,0.88)', color: '#2f62c9', fontSize: 24, fontWeight: 800, letterSpacing: 2, pointerEvents: 'none' }}>SAVE</motion.div>
          <motion.div className="abs" style={{ right: 18, top: 70, opacity: stamps.pass, rotate: 12, padding: '4px 14px', border: `3px solid ${INK2}`, borderRadius: 12, background: 'rgba(255,255,255,0.88)', color: INK2, fontSize: 24, fontWeight: 800, letterSpacing: 2, pointerEvents: 'none' }}>PASS</motion.div>
        </>
      )}
      <div className="abs" style={{ left: 0, top: 314, width: 360, height: 276, background: '#fff', borderRadius: '26px 26px 0 0', padding: '18px 20px 0', display: 'flex', flexDirection: 'column' }}>
        <p className="nowrap" style={{ fontSize: 22, fontWeight: 700, color: INK, lineHeight: '26px', letterSpacing: -0.3 }}>{p.name}</p>
        <p className="nowrap" style={{ fontSize: 14, fontWeight: 500, color: INK2, lineHeight: '18px', marginTop: 2 }}>{metaOf(p)}</p>
        {p.event && <p className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: '17px', marginTop: 3 }}>{p.event}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: p.event ? 10 : 14 }}>
          <SenseChip label="Sound" n={p.s} words={SOUND_W} />
          <SenseChip label="Light" n={p.l} words={LIGHT_W} />
          <SenseChip label="Crowd" n={p.c} words={CROWD_W} />
        </div>
        <div style={{ marginTop: 12, borderRadius: 18, background: 'rgba(47,98,201,0.08)', border: '1px solid rgba(47,98,201,0.3)', padding: '10px 14px 11px' }}>
          <p className="nowrap" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: INK2, lineHeight: '13px' }}>Why it fits</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: '19px', marginTop: 3 }}>{line}</p>
          {note && <p style={{ fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '17px', marginTop: 3 }}>{note}</p>}
        </div>
      </div>
    </div>
  );
}

const SLOT = [{ s: 1, y: 0, o: 1 }, { s: 0.94, y: 30, o: 1 }, { s: 0.88, y: 60, o: 1 }];
const STACK_SPRING = { type: 'spring', stiffness: 260, damping: 28 };

function StackCard({ p, depth, prefs, modeName, cmd, onDecide, onTap }) {
  const front = depth === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-13, 0, 13]);
  const save = useTransform(x, [24, 120], [0, 1]);
  const pass = useTransform(x, [-120, -24], [1, 0]);
  const done = useRef(false), dragged = useRef(false), seen = useRef(cmd.n);

  const fly = (dir, v = 0) => {
    if (done.current) return;
    done.current = true;
    let fired = false;
    animate(x, dir * 560, {
      type: 'spring', stiffness: 170, damping: 24, velocity: v,
      onUpdate: (val) => { if (!fired && Math.abs(val) > 430) { fired = true; onDecide(p.id, dir > 0 ? 'save' : 'pass'); } },
    });
  };
  useEffect(() => {
    if (cmd.n === seen.current) return;
    seen.current = cmd.n;
    if (front) fly(cmd.dir);
  }, [cmd.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const end = (_, info) => {
    const ox = info.offset.x, vx = info.velocity.x;
    if (Math.abs(ox) > 110 || (Math.abs(vx) > 600 && Math.abs(ox) > 36)) fly(Math.sign(ox || vx), vx);
    else animate(x, 0, { type: 'spring', stiffness: 420, damping: 30 });
  };

  return (
    <motion.div className="abs" data-card={p.id}
      role={front ? 'button' : undefined} tabIndex={front ? 0 : -1} aria-hidden={front ? undefined : true}
      aria-label={front ? `${p.name}. Tap for details. Swipe right to save, left to pass.` : undefined}
      style={{ left: 0, top: 0, width: 360, height: 590, x, rotate, zIndex: 10 - depth, cursor: front ? 'grab' : 'default', pointerEvents: front ? 'auto' : 'none', transformOrigin: '50% 60%' }}
      initial={false} animate={{ scale: SLOT[depth].s, y: SLOT[depth].y, opacity: SLOT[depth].o }} transition={STACK_SPRING}
      drag={front ? 'x' : false} dragMomentum={false} dragElastic={1}
      onPointerDown={() => { dragged.current = false; }} onDragStart={() => { dragged.current = true; }} onDragEnd={end}
      onTap={() => { if (front && !dragged.current) onTap(p); }}>
      <CardFace p={p} prefs={prefs} modeName={modeName} stamps={front ? { save, pass } : null} />
    </motion.div>
  );
}

/* ---------- The layer ---------- */
const Xmark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function DiscoverLayer({ pull, open, onClose, mode, decided, onDecide, onShowPassed, onOpenVenue, blocked }) {
  const modeName = modeLabel(mode);
  const deck = useMemo(() => rankPlaces(mode.prefs).filter((p) => !decided[p.id]), [mode, decided]);
  const savedN = Object.values(decided).filter((v) => v === 'save').length;
  const passedN = Object.values(decided).filter((v) => v === 'pass').length;
  const [cmd, setCmd] = useState({ n: 0, dir: 1 });
  const [fb, setFb] = useState(null);
  const fbTimer = useRef(0);
  const say = (text, icon) => { setFb({ text, icon, n: Date.now() }); clearTimeout(fbTimer.current); fbTimer.current = setTimeout(() => setFb(null), 2000); };

  const visibility = useTransform(pull, (v) => (v > 0.5 ? 'visible' : 'hidden'));
  const lift = useTransform(pull, [0, SCREEN_H], [-110, 0]);
  const fade = useTransform(pull, [260, 720], [0, 1]);

  const decide = (id, d) => {
    onDecide(id, d);
    if (d === 'save') say(`Saved ${rankPlaces(mode.prefs).find((p) => p.id === id).name}`, 'heartFill');
  };
  const fling = (dir) => { if (deck.length) setCmd((c) => ({ n: c.n + 1, dir })); };
  const tapCard = (p) => (p.venue ? onOpenVenue() : say(p.event ? 'Event pages come later in the prototype' : 'Only Foxy Loxy Cafe has a full page so far', 'info'));

  useEffect(() => {
    if (!open || blocked) return undefined;
    const k = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); fling(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); fling(-1); }
      else if (e.key === 'Enter' && deck[0] && document.activeElement?.dataset?.card) { tapCard(deck[0]); }
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  return (
    <motion.div className="abs" style={{ inset: 0, visibility, pointerEvents: open ? 'auto' : 'none', overflow: 'hidden' }}>
      <Backdrop />
      <PullHint pull={pull} />
      <motion.div className="abs" style={{ inset: 0, y: lift, opacity: fade }}>
        <div className="abs" style={{ left: 24, top: 56, width: 300, pointerEvents: 'none' }}>
          <p className="nowrap" style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: '29px' }}>Discover</p>
          <p className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '16px', marginTop: 2 }}>
            {deck.length ? `Tuned to ${modeName} · ${deck.length} left` : `Tuned to ${modeName}`}
          </p>
        </div>
        <G as="button" r={24} aria-label="Close Discover" onClick={onClose} whileTap={{ scale: 0.9 }} transition={TAP}
          style={{ position: 'absolute', left: 368, top: 52, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
          <Xmark />
        </G>

        <div className="abs" style={{ left: 40, top: 140, width: 360, height: 590 }}>
          {deck.slice(0, 3).map((p, i) => ({ p, i })).reverse().map(({ p, i }) => (
            <StackCard key={p.id} p={p} depth={i} prefs={mode.prefs} modeName={modeName} cmd={cmd} onDecide={decide} onTap={tapCard} />
          ))}
          {!deck.length && (
            <motion.div className="abs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={GENTLE}
              style={{ inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 12px', gap: 10 }}>
              <VIcon name="sparkle" size={28} fill={NAVY} />
              <p style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: '29px' }}>You have seen everything nearby</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: INK2, lineHeight: '20px' }}>
                {savedN ? `You saved ${savedN} ${savedN === 1 ? 'place' : 'places'}.` : 'You passed on all of them.'}
                {passedN ? ' Passed places can come back.' : ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 14 }}>
                {passedN > 0 && <DarkCTA inline label="Show passed places" onClick={onShowPassed} />}
                <TextBtn onClick={onClose} style={{ padding: '0 20px' }}>Back to home</TextBtn>
              </div>
            </motion.div>
          )}
        </div>

        {deck.length > 0 && (
          <>
            <div className="abs" style={{ left: 132, top: 778, width: 176, display: 'flex', justifyContent: 'space-between' }}>
              <G as="button" r={32} aria-label="Pass" onClick={() => fling(-1)} whileTap={{ scale: 0.9 }} transition={TAP}
                style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke={NAVY} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </G>
              <motion.button aria-label="Save" onClick={() => fling(1)} whileTap={{ scale: 0.9 }} transition={TAP}
                style={{ width: 64, height: 64, borderRadius: 32, background: INK, border: '1.5px solid rgba(255,255,255,0.95)', boxShadow: '0 14px 18px rgba(42,38,80,0.12), inset 0 1px 0 rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VIcon name="heartFill" size={26} fill="#fff" />
              </motion.button>
            </div>
            <div className="abs" style={{ left: 0, top: 856, width: 440, height: 24, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <AnimatePresence mode="wait" initial={false}>
                {fb ? (
                  <motion.span key={fb.n} className="nowrap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: INK }}>
                    <VIcon name={fb.icon} size={16} fill={fb.icon === 'heartFill' ? '#2f62c9' : NAVY} />{fb.text}
                  </motion.span>
                ) : (
                  <motion.span key="hint" className="nowrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                    style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>
                    Swipe right to save, left to pass. Tap a card for details.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
