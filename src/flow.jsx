// Shared building blocks for the Venue page, Write a review, Book a table and Booking confirmed.
// Every surface follows the Figma glass recipe (see .gl in styles.css).
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GENTLE, Icon, NAVY, MUTED } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon, vi } from './venueIcons.jsx';

export const PURPLE = '#5b52c9';
export const DIV = 'rgba(42,38,80,0.08)';
export const TAP = { type: 'spring', stiffness: 520, damping: 32 };

export const t = (size, weight = 400, color = NAVY, extra) => ({ fontSize: size, fontWeight: weight, color, lineHeight: 1.3, ...extra });

// Glass surface. `on` swaps to the selected, near-white fill used by chips / tiles / slots.
export function G({ as = 'div', r, on, style, children, className = '', ...rest }) {
  const Comp = as === 'button' ? motion.button : motion.div;
  return (
    <Comp className={`${on ? 'gl-solid' : 'gl'} ${className}`} style={{ borderRadius: r, ...style }} {...rest}>
      {children}
    </Comp>
  );
}

// 48 x 48 glass icon button (back, close, heart, export)
export function CircleBtn({ icon, label, onClick, style, children }) {
  return (
    <G as="button" r={24} aria-label={label} onClick={onClick} whileTap={{ scale: 0.9 }} transition={TAP}
      style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', ...style }}>
      {children || <VIcon name={icon} />}
    </G>
  );
}

// Flow top bar: close / title + venue / optional right action. Fades in a frosted backing once content scrolls under it.
export function TopBar({ title, sub = 'Foxy Loxy Cafe', onClose, right, scrolled }) {
  return (
    <div className="abs" style={{ left: 0, top: 0, width: 440, zIndex: 20, padding: '52px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <motion.div className="abs" style={{ inset: 0, background: 'rgba(247,245,241,0.82)', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${DIV}` }}
        initial={false} animate={{ opacity: scrolled ? 1 : 0 }} transition={{ duration: 0.2 }} />
      <CircleBtn icon="x22" label="Close" onClick={onClose} />
      <div style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="nowrap" style={t(17, 600)}>{title}</span>
        <span className="nowrap" style={t(13, 400, MUTED)}>{sub}</span>
      </div>
      {right || <div style={{ width: 48 }} />}
    </div>
  );
}

// Section header: icon + title, optional muted note on the right
export function Section({ icon, iconSize, title, note, children, gap = 14, id }) {
  return (
    <section id={id} style={{ display: 'flex', flexDirection: 'column', gap }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 24 }}>
        {icon && (vi[icon] ? <VIcon name={icon} size={iconSize} /> : <Icon d={paths[icon]} size={24} fill={NAVY} />)}
        <span style={{ ...t(17, 600), flex: '1 0 0' }}>{title}</span>
        {note && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={note} className="nowrap" style={t(13, 400, MUTED)}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>{note}</motion.span>
          </AnimatePresence>
        )}
      </div>
      {children}
    </section>
  );
}

// Chip (h40, r20). Selected = near-white fill + SemiBold.
export function Chip({ label, on, onClick, small }) {
  return (
    <G as="button" r={20} on={on} onClick={onClick} whileTap={{ scale: 0.95 }} transition={TAP}
      style={{ height: small ? 36 : 40, padding: '0 16px', display: 'flex', alignItems: 'center', flex: 'none' }}>
      <span className="nowrap" style={t(14, on ? 600 : 500, NAVY)}>{label}</span>
    </G>
  );
}

// "+ Other" chip that turns into an inline text field, then into a selected chip.
function OtherChip({ onAdd }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { const v = val.trim(); if (v) onAdd(v); setVal(''); setEditing(false); };
  if (editing) {
    return (
      <G r={20} on style={{ height: 40, padding: '0 6px 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}
        initial={{ width: 96 }} animate={{ width: 200 }} transition={GENTLE}>
        <input ref={ref} value={val} onChange={(e) => setVal(e.target.value.slice(0, 24))} placeholder="Type it"
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(''); setEditing(false); } }} onBlur={commit}
          style={{ all: 'unset', flex: '1 0 0', minWidth: 0, ...t(14, 500) }} />
        <motion.button whileTap={{ scale: 0.9 }} onMouseDown={(e) => e.preventDefault()} onClick={commit}
          style={{ height: 28, padding: '0 10px', borderRadius: 14, background: PURPLE, color: '#fff', fontSize: 13, fontWeight: 600 }}>Add</motion.button>
      </G>
    );
  }
  return (
    <G as="button" r={20} onClick={() => setEditing(true)} whileTap={{ scale: 0.95 }} transition={TAP}
      style={{ height: 40, padding: '0 16px 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <VIcon name="plus" size={16} />
      <span style={t(14, 500)}>Other</span>
    </G>
  );
}

// Wrapping chip group. single = radio behaviour, otherwise multi-select. Custom "Other" entries are added selected.
export function ChipGroup({ options, value, onChange, single, other = true }) {
  const [extra, setExtra] = useState([]);
  const all = [...options, ...extra];
  const isOn = (o) => (single ? value === o : value.includes(o));
  const toggle = (o) => {
    if (single) onChange(o);
    else onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  };
  return (
    <motion.div layout style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {all.map((o) => (
        <motion.div key={o} layout initial={extra.includes(o) ? { opacity: 0, scale: 0.8 } : false} animate={{ opacity: 1, scale: 1 }} transition={GENTLE}>
          <Chip label={o} on={isOn(o)} onClick={() => toggle(o)} />
        </motion.div>
      ))}
      {other && (
        <motion.div layout transition={GENTLE}>
          <OtherChip onAdd={(v) => { if (!all.includes(v)) setExtra((e) => [...e, v]); if (!isOn(v)) toggle(v); }} />
        </motion.div>
      )}
    </motion.div>
  );
}

// Fixed bottom CTA (top 866, 392 x 56). Disabled = faded glass; tapping it while disabled calls onBlocked.
export function PrimaryCTA({ label, icon, enabled = true, onClick, onBlocked, busy, top = 866, sub }) {
  return (
    <motion.button className={enabled ? 'gl-solid' : 'gl'} onClick={() => (enabled ? onClick?.() : onBlocked?.())}
      whileTap={{ scale: 0.97 }} transition={TAP}
      style={{ position: 'absolute', left: 24, top, width: 392, height: 56, borderRadius: 28, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={busy ? 'busy' : label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.22 }}>
          {busy ? <Spinner /> : icon && <VIcon name={icon} fill={enabled ? NAVY : 'rgba(42,38,80,0.4)'} />}
          <span className="nowrap" style={t(17, 600, enabled ? NAVY : 'rgba(42,38,80,0.42)')}>{busy || label}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 20 20" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
      <circle cx="10" cy="10" r="8" stroke="rgba(42,38,80,0.15)" strokeWidth="2.5" fill="none" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke={NAVY} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

// 4 sense tiles (h105, r24). Sound / Light / Crowd / Seating
export function SenseTiles({ sound, light, crowd, seating }) {
  const items = [
    { k: 'Sound', v: sound, i: <Icon d={paths.speaker} size={24} fill={NAVY} /> },
    { k: 'Light', v: light, i: <Icon d={paths.sun} size={24} fill={NAVY} /> },
    { k: 'Crowd', v: crowd, i: <Icon d={paths.users} size={24} fill={NAVY} /> },
    { k: 'Seating', v: seating, i: <VIcon name="chair" size={24} /> },
  ];
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {items.map((s) => (
        <G key={s.k} r={24} style={{ flex: '1 0 0', height: 105, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {s.i}
          <span style={t(13, 400, MUTED)}>{s.k}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={s.v} className="nowrap" style={t(15, 500)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>{s.v}</motion.span>
          </AnimatePresence>
        </G>
      ))}
    </div>
  );
}

// Glass list of icon rows with hairline dividers
export function InfoList({ rows }) {
  return (
    <G r={28} style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {i > 0 && <div style={{ width: 352, height: 1, background: DIV }} />}
          {r.render || (
            <div style={{ width: '100%', minHeight: 52, padding: '0 18px 0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <VIcon name={r.icon} />
              <span style={{ ...t(15, 500), flex: '1 0 0' }}>{r.text}</span>
              {r.trail}
            </div>
          )}
        </div>
      ))}
    </G>
  );
}

export function Stars({ n = 5, size = 14, gap = 2 }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {Array.from({ length: 5 }, (_, i) => <VIcon key={i} name="starFill" size={size} fill={i < n ? NAVY : 'rgba(42,38,80,0.2)'} />)}
    </div>
  );
}

export const DIST = [[5, 39.04], [4, 8.7], [3, 3.25], [2, 1.81], [1, 1.8]];
export function ReviewSummary({ onClick }) {
  return (
    <G as={onClick ? 'button' : 'div'} r={28} onClick={onClick} whileTap={onClick ? { scale: 0.985 } : undefined} transition={TAP}
      style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20, width: '100%', textAlign: 'left' }}>
      <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DIST.map(([s, w], i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...t(12, 500, MUTED), width: 8 }}>{s}</span>
            <div style={{ flex: '1 0 0', height: 6, borderRadius: 3, background: DIV, overflow: 'hidden' }}>
              <motion.div style={{ height: 6, borderRadius: 3, background: PURPLE }} initial={{ width: 0 }} whileInView={{ width: `${w}%` }} viewport={{ once: true }}
                transition={{ ...GENTLE, delay: 0.08 * i }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={t(40, 600, NAVY, { lineHeight: 1 })}>4.6</span>
        <Stars />
        <span className="nowrap" style={t(13, 400, MUTED)}>2,600 reviews</span>
      </div>
    </G>
  );
}

export function AISummary() {
  return (
    <G r={28} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VIcon name="sparkle" />
        <span style={t(15, 600)}>Review summary</span>
      </div>
      <p style={t(15, 400, NAVY, { lineHeight: 1.4 })}>
        People love the cozy, artsy feel, the back patio and garden pond, and the pastries. Kolaches and chai come up often. Many say it gets busy on weekends and seating and parking can be tight, so mornings are calmer.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Patio · 310', 'Kolache · 180', 'Chai · 150', 'Busy weekends · 120'].map((m) => (
          <span key={m} className="nowrap" style={{ ...t(12, 500), background: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 14 }}>{m}</span>
        ))}
      </div>
      <span style={t(12, 400, MUTED)}>Summarized by AI from 2,600 reviews</span>
    </G>
  );
}

export function ReviewCard({ r }) {
  const [helpful, setHelpful] = useState(false);
  return (
    <G r={28} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: r.mine ? PURPLE : '#E6E6E8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15 }}>{r.mine ? 'R' : ''}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={t(15, 600)}>{r.name}</span>
          <span style={t(13, 400, MUTED)}>{r.meta}</span>
        </div>
      </div>
      <Stars n={r.stars ?? 5} />
      {r.text && <p style={t(15, 400, NAVY, { lineHeight: 1.4 })}>{r.text}</p>}
      {r.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {r.tags.map((x) => <span key={x} className="nowrap" style={{ ...t(12, 500), background: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 14 }}>{x}</span>)}
        </div>
      )}
      {!r.mine && (
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setHelpful((h) => !h)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, height: 28 }}>
          <motion.span animate={helpful ? { rotate: [0, -18, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.4 }}>
            <VIcon name="thumbsUp" fill={helpful ? PURPLE : MUTED} />
          </motion.span>
          <span style={t(13, 500, helpful ? PURPLE : MUTED)}>{helpful ? 'Helpful · 1' : 'Helpful'}</span>
        </motion.button>
      )}
    </G>
  );
}

// Section heading used inside the venue page ("What's here", "Reviews", "Popular dishes")
export function H({ children, right }) {
  return (
    <div style={{ height: 40, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="nowrap" style={t(28, 600, NAVY, { letterSpacing: -0.4 })}>{children}</span>
      {right}
    </div>
  );
}

// Small toast that rises above the CTA
export function Toast({ text }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div key={text} className="gl-solid" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={GENTLE}
          style={{ position: 'absolute', left: '50%', x: '-50%', top: 800, zIndex: 30, borderRadius: 22, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <VIcon name="check" size={18} />
          <span className="nowrap" style={t(14, 600)}>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
