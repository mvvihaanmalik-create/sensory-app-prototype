// Hidden Discovery Mode: the layer under Home. Pull the Home sheet down from the top to reveal it,
// then swipe cards (right saves, left passes, tap opens the place).
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { Glass, GENTLE, INK, INK2, NAVY, MUTED, useScale } from './ui.jsx';
import { TAP } from './flow.jsx';
import { VIcon } from './venueIcons.jsx';
import { DarkCTA, TextBtn } from './sheets.jsx';
import { PAGES } from './listData.js';
import { SENSE_VALUES } from './Venue.jsx';
import { discoverAssets as A } from './discoverAssets.js';
import './discover.css';
import { SOUND_W, LIGHT_W, CROWD_W, metaOf, rankPlaces } from './discoverData.js';

export const SCREEN_H = 956;
export const THRESH = 120; // how far the sheet must be pulled (design px) before letting go opens Discover
const CAP = 600, K = 1;
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
      gg.lock = dy > 0 && dy > Math.abs(dx) * 1.15 && node.scrollTop <= 1 ? 'pull' : 'other';
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
      if (fresh) { w.active = node.scrollTop <= 1 && dy < 0 && Math.abs(dy) > Math.abs(e.deltaX); w.raw = unrubber(pull.get()); stop(); }
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
  const opacity = useTransform(pull, [118, 146, 330, 480], [0, 1, 1, 0]);
  const top = 108;
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

/* ---------- Figma 1002:8169: background, card, and five sense tiles ---------- */
function Backdrop() {
  return <div className="abs" style={{ inset: 0, background: '#f7f5f1', overflow: 'hidden', pointerEvents: 'none' }}>
    <div className="abs" style={{ inset: 0, opacity: .2, overflow: 'hidden' }}>
      <img src={A.imgSourceArtMorning} alt="" draggable={false} className="abs" style={{ height: '100.06%', left: '-41.78%', top: '-.03%', width: '174.22%', maxWidth: 'none' }} />
    </div>
  </div>;
}

function senseValues(p) {
  if (p.id === 'foxy') return SENSE_VALUES;
  const canonical = Object.values(PAGES).flatMap(page => page.rows).find(row => row.id === p.id);
  const seat = p.seat || canonical?.seat;
  return {
    sound: SOUND_W[p.s] || 'Unknown', light: LIGHT_W[p.l] || 'Unknown', crowd: CROWD_W[p.c] || 'Unknown',
    temp: canonical?.t == null ? 'Unknown' : canonical.t <= 2 ? 'Cool' : canonical.t >= 4 ? 'Warm' : 'Mild',
    seating: seat?.includes('outdoor') ? 'Patio' : seat?.includes('booth') ? 'Booths' : seat?.includes('indoor') ? 'Indoor' : 'Unknown',
  };
}
const SENSE_TILES = [['sound', 'Sound', 'imgPhosphorSpeakerHigh'], ['light', 'Light', 'imgPhosphorSun'], ['crowd', 'Crowd', 'imgPhosphorUsers'], ['temp', 'Temperature', 'imgPhosphorThermometer'], ['seating', 'Seating', 'imgPhosphorChair']];
function CardFace({ p, stamps }) {
  const senses = senseValues(p);
  return <div className="abs" data-discover-face={p.id} style={{ inset: 0, borderRadius: 48.32, overflow: 'hidden', background: 'rgba(255,255,255,.85)', border: '1.51px solid rgba(20,24,31,.08)', boxShadow: '0 18.12px 48.32px rgba(27,42,68,.06)', userSelect: 'none' }}>
    <div className="abs" style={{ left: -1.51, top: 434.49, width: 393, height: 192, borderRadius: 25, background: 'rgba(20,24,31,.06)' }} />
    <div className="abs" style={{ left: -1.51, top: -1.51, width: 393, height: 628, overflow: 'hidden', background: 'rgba(20,24,31,.06)' }}>
      <div className="abs" style={{ left: 18, top: 451, width: 355, display: 'flex', flexDirection: 'column', gap: 8, color: MUTED, textAlign: 'left' }}>
        <p className="nowrap" style={{ fontSize: 28, fontWeight: 600, lineHeight: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
        <p className="nowrap" style={{ fontSize: 14, fontWeight: 400, lineHeight: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.id === 'foxy' ? '4.6 ★ · 2,600 reviews · $ · Café · Tex-Mex' : p.event ? `${metaOf(p)} · ${p.event}` : metaOf(p)}</p>
      </div>
    </div>
    <div className="abs" style={{ left: 16.61, top: 16.61, display: 'flex', alignItems: 'center', gap: 6.04, padding: '6.04px 12.08px', borderRadius: 1508.49, background: '#f7f5f1', WebkitBackdropFilter: 'blur(12.08px)', backdropFilter: 'blur(12.08px)', boxShadow: '0 6.04px 21.14px rgba(27,42,68,.05)' }}>
      <img src={A.imgLevelRipple} alt="" width="42.28" height="42.28" draggable={false} />
      <p className="nowrap" style={{ fontSize: 19.63, fontWeight: 700, lineHeight: 'normal', color: INK }}>Level {p.level}</p>
    </div>
    <div className="abs" style={{ left: 16.49, top: 523.49, width: 355, height: 85, display: 'flex', gap: 10 }}>
      {SENSE_TILES.map(([key, label, icon]) => <Glass key={key} radius={24} angle="126.545deg" style={{ position: 'relative', flex: '1 0 0', minWidth: 0, height: 85 }} contentStyle={{ flexDirection: 'column', gap: 8, padding: '14.5px 2.5px' }}>
        <img src={A[icon]} alt="" width="24" height="24" draggable={false} />
        <span className="nowrap" aria-label={`${label}: ${senses[key]}`} style={{ fontSize: 15, fontWeight: 500, lineHeight: 'normal', color: MUTED }}>{senses[key]}</span>
      </Glass>)}
    </div>
    {stamps && <>
      <motion.div className="abs" style={{ left: 18, top: 70, opacity: stamps.save, rotate: -12, padding: '4px 14px', border: '3px solid #2f62c9', borderRadius: 12, background: 'rgba(255,255,255,.88)', color: '#2f62c9', fontSize: 24, fontWeight: 800, letterSpacing: 2, pointerEvents: 'none' }}>SAVE</motion.div>
      <motion.div className="abs" style={{ right: 18, top: 70, opacity: stamps.pass, rotate: 12, padding: '4px 14px', border: `3px solid ${INK2}`, borderRadius: 12, background: 'rgba(255,255,255,.88)', color: INK2, fontSize: 24, fontWeight: 800, letterSpacing: 2, pointerEvents: 'none' }}>PASS</motion.div>
    </>}
  </div>;
}
function DiscoverAction({ label, icon, left, top, dark = false, onClick }) {
  return <motion.button type="button" aria-label={label} onClick={onClick} whileTap={{ scale: .9 }} transition={TAP} className="abs" style={{ left, top, width: 48, height: 48, borderRadius: 24 }}>
    <Glass className={dark ? 'discover-dark-action' : ''} radius={24} style={{ inset: 0, ...(dark ? { border: 'none' } : {}) }} contentStyle={{ justifyContent: 'center' }}><img src={A[icon]} alt="" draggable={false} /></Glass>
  </motion.button>;
}

const SLOT = [{ s: 1, y: 0, o: 1 }, { s: .97, y: 0, o: 0 }, { s: .94, y: 0, o: 0 }];
const STACK_SPRING = { type: 'spring', stiffness: 260, damping: 28 };

function StackCard({ p, depth, cmd, onDecide, onTap }) {
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
      style={{ left: 0, top: 0, width: 393, height: 628, x, rotate, zIndex: 10 - depth, cursor: front ? 'grab' : 'default', pointerEvents: front ? 'auto' : 'none', transformOrigin: '50% 60%' }}
      initial={false} animate={{ scale: SLOT[depth].s, y: SLOT[depth].y, opacity: SLOT[depth].o }} transition={STACK_SPRING}
      drag={front ? 'x' : false} dragMomentum={false} dragElastic={1}
      onPointerDown={() => { dragged.current = false; }} onDragStart={() => { dragged.current = true; }} onDragEnd={end}
      onTap={() => { if (front && !dragged.current) onTap(p); }}>
      <CardFace p={p} stamps={front ? { save, pass } : null} />
    </motion.div>
  );
}

/* ---------- The layer ---------- */
export default function DiscoverLayer({ pull, open, onClose, mode, decided, onDecide, onShowPassed, onOpenVenue, blocked }) {
  const deck = useMemo(() => rankPlaces(mode.prefs).filter((p) => !decided[p.id]), [mode, decided]);
  const savedN = Object.values(decided).filter((v) => v === 'save').length;
  const passedN = Object.values(decided).filter((v) => v === 'pass').length;
  const [cmd, setCmd] = useState({ n: 0, dir: 1 });
  const [fb, setFb] = useState(null);
  const fbTimer = useRef(0);
  const say = (text, icon) => { setFb({ text, icon, n: Date.now() }); clearTimeout(fbTimer.current); fbTimer.current = setTimeout(() => setFb(null), 2000); };

  const visibility = useTransform(pull, (v) => (v > 0.5 ? 'visible' : 'hidden'));
  // Content rides just above the sheet edge while pulling, then settles at its resting place
  const lift = useTransform(pull, (v) => Math.min(0, v - 132));
  const fade = useTransform(pull, [40, 130], [0, 1]);

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
        <DiscoverAction label="Back to Home" icon="imgPhosphorCaretLeft" left={24} top={52} onClick={onClose} />
        <p className="abs nowrap" style={{ left: 84, top: 62, fontSize: 24, fontWeight: 700, color: INK, lineHeight: '29px', pointerEvents: 'none' }}>Discover</p>

        <div className="abs" style={{ left: 23, top: 135, width: 393, height: 628 }}>
          {deck.slice(0, 3).map((p, i) => ({ p, i })).reverse().map(({ p, i }) => (
            <StackCard key={p.id} p={p} depth={i} cmd={cmd} onDecide={decide} onTap={tapCard} />
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
            <DiscoverAction label="Pass" icon="imgX" left={152} top={817} onClick={() => fling(-1)} />
            <DiscoverAction label="Save" icon="imgHeart" left={240} top={817} dark onClick={() => fling(1)} />
            <div className="abs" style={{ left: 0, top: 884, width: 440, height: 24, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <AnimatePresence mode="wait" initial={false}>
                {fb ? (
                  <motion.span key={fb.n} className="nowrap" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: INK }}>
                    <VIcon name={fb.icon} size={16} fill={fb.icon === 'heartFill' ? '#2f62c9' : NAVY} />{fb.text}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

