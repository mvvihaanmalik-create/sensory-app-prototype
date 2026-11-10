// Shared building blocks for the Venue page and its flows (Figma section 789:3120).
// v2 palette: all venue text, icons and accents use #5e5a7e.
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GENTLE, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon, vi } from './venueIcons.jsx';

export const NAVY = '#5e5a7e';
export const MUTED = '#5e5a7e';
export const PURPLE = '#5e5a7e';
export const DIV = 'rgba(94,90,126,0.08)';
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

// Top bar: close or back / title + venue / optional right action. Frosts once content scrolls under it.
export function TopBar({ title, sub = 'Foxy Loxy Cafe', onClose, back, right, scrolled }) {
  return (
    <div className="abs" style={{ left: 0, top: 0, width: 440, zIndex: 20, padding: '52px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <motion.div className="abs" style={{ inset: 0, background: 'rgba(247,245,241,0.82)', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${DIV}` }}
        initial={false} animate={{ opacity: scrolled ? 1 : 0 }} transition={{ duration: 0.2 }} />
      <CircleBtn icon={back ? 'caretLeft' : 'x22'} label={back ? 'Back' : 'Close'} onClick={onClose} />
      <div style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={title} className="nowrap" style={t(17, 600)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>{title}</motion.span>
        </AnimatePresence>
        <span className="nowrap" style={t(13, 400)}>{sub}</span>
      </div>
      {right || <div style={{ width: 48 }} />}
    </div>
  );
}

// Section header: icon + title, optional note (string or node) on the right
export function Section({ icon, iconSize, title, note, children, gap = 18, id }) {
  return (
    <section id={id} style={{ display: 'flex', flexDirection: 'column', gap }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 22 }}>
        {icon && (vi[icon] ? <VIcon name={icon} size={iconSize} /> : <Icon d={paths[icon]} size={24} fill={NAVY} />)}
        <span style={{ ...t(17, 600), flex: '1 0 0' }}>{title}</span>
        {typeof note === 'string' ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={note} className="nowrap" style={t(13, 400)}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>{note}</motion.span>
          </AnimatePresence>
        ) : note}
      </div>
      {children}
    </section>
  );
}

// Glass / Category chip (h44, r22). Selected = near-white fill, SemiBold; otherwise Medium at 80%.
export function Chip({ label, on, onClick, disabled }) {
  return (
    <G as="button" r={22} on={on} onClick={onClick} whileTap={disabled ? undefined : { scale: 0.95 }} transition={TAP}
      style={{ height: 44, padding: '0 20px', display: 'flex', alignItems: 'center', flex: 'none', opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer' }}>
      <span className="nowrap" style={t(15, on ? 600 : 500, on ? NAVY : 'rgba(94,90,126,0.8)')}>{label}</span>
    </G>
  );
}

// "+ Other" chip that turns into an inline text field, then into a selected chip.
export function OtherChip({ onAdd, color }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = () => { const v = val.trim(); if (v) onAdd(v); setVal(''); setEditing(false); };
  if (editing) {
    return (
      <G r={22} on style={{ height: 44, padding: '0 6px 0 18px', display: 'flex', alignItems: 'center', gap: 6 }}
        initial={{ width: 92 }} animate={{ width: 210 }} transition={GENTLE}>
        <input ref={ref} value={val} onChange={(e) => setVal(e.target.value.slice(0, 24))} placeholder="Type it"
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(''); setEditing(false); } }} onBlur={commit}
          style={{ all: 'unset', flex: '1 0 0', minWidth: 0, ...t(15, 500) }} />
        <motion.button whileTap={{ scale: 0.9 }} onMouseDown={(e) => e.preventDefault()} onClick={commit}
          style={{ height: 32, padding: '0 12px', borderRadius: 16, background: NAVY, color: '#fff', fontSize: 13, fontWeight: 600 }}>Add</motion.button>
      </G>
    );
  }
  return (
    <G as="button" r={22} onClick={() => setEditing(true)} whileTap={{ scale: 0.95 }} transition={TAP}
      style={{ height: 44, padding: '0 16px 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <VIcon name="plus" size={16} {...(color ? { fill: color } : {})} />
      <span style={t(14, 500, color)}>Other</span>
    </G>
  );
}

// Wrapping chip group. single = radio behaviour, otherwise multi-select.
export function ChipGroup({ options, value, onChange, single, other = true }) {
  const [extra, setExtra] = useState(() => (single ? [] : value.filter((v) => !options.includes(v))));
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

// Glass / Primary button: a hugging pill (h63, r30, 36px side padding) centred at the bottom.
// Its width springs between labels. Disabled = faded; tapping it then calls onBlocked.
export function PrimaryCTA({ label, icon, enabled = true, onClick, onBlocked, busy, top = 865, inline, color }) {
  const btn = (
    <motion.button layout className="gl" onClick={() => (busy ? null : enabled ? onClick?.() : onBlocked?.())}
      whileTap={{ scale: 0.96 }} transition={{ layout: GENTLE, default: TAP }}
      style={{ height: 63, borderRadius: 32, padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pointerEvents: 'auto',
        boxShadow: '0 14px 36px rgba(42,38,80,0.1), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span layout="position" key={busy ? 'busy' : label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: enabled || busy ? 1 : 0.42, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.22 }}>
          {busy ? <Spinner /> : icon && <VIcon name={icon} />}
          <span className="nowrap" style={t(17, 600, color)}>{busy || label}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
  if (inline) return <div style={{ display: 'flex', justifyContent: 'center' }}>{btn}</div>;
  return (
    <div className="abs" style={{ left: 0, top, width: 440, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>{btn}</div>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 20 20" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
      <circle cx="10" cy="10" r="8" stroke="rgba(94,90,126,0.18)" strokeWidth="2.5" fill="none" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke={NAVY} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

// Sense icons shared by tiles, the category bar and the review screens
export const SENSES = [
  { k: 'sound', label: 'Sound', icon: <VIcon name="speakerHigh" size={24} /> },
  { k: 'light', label: 'Light', icon: <Icon d={paths.sun} size={24} fill={NAVY} /> },
  { k: 'crowd', label: 'Crowd', icon: <Icon d={paths.users} size={24} fill={NAVY} /> },
  { k: 'temp', label: 'Temperature', short: 'Temp', icon: <VIcon name="therm" size={24} /> },
  { k: 'seating', label: 'Seating', icon: <VIcon name="chair" size={24} /> },
];

// Sense tiles row (5 x 70.4 x 85, gap 10). Each tile opens that sense's reviews.
export function SenseTiles({ values, onOpen }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {SENSES.map((s) => (
        <G key={s.k} as="button" r={24} onClick={() => onOpen?.(s.k)} whileTap={{ scale: 0.94 }} transition={TAP} aria-label={`${s.label} reviews`}
          style={{ flex: '1 0 0', height: 85, padding: '16px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {s.icon}
          <span className="nowrap" style={t(15, 500)}>{values[s.k]}</span>
        </G>
      ))}
    </div>
  );
}

// Glass list of icon rows with hairline dividers. Rows can carry a small label above the value.
export function InfoList({ rows }) {
  return (
    <G r={28} style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {i > 0 && <div style={{ width: 352, height: 1, background: DIV }} />}
          {r.render || (
            <motion.div onClick={r.onClick} whileTap={r.onClick ? { scale: 0.985 } : undefined}
              style={{ width: '100%', minHeight: r.label ? 60 : 52, padding: '0 12px 0 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: r.onClick ? 'pointer' : 'default' }}>
              {r.iconNode || <VIcon name={r.icon} size={r.iconSize} />}
              <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                {r.label && <span style={t(12, 400)}>{r.label}</span>}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={String(r.text)} style={t(15, 500)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>{r.text}</motion.span>
                </AnimatePresence>
              </div>
              {r.trail}
            </motion.div>
          )}
        </div>
      ))}
    </G>
  );
}

export function Stars({ n = 5, size = 14, gap = 2 }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {Array.from({ length: 5 }, (_, i) => <VIcon key={i} name="starFill" size={size} fill={i < n ? NAVY : 'rgba(94,90,126,0.22)'} />)}
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
            <span style={{ ...t(12, 500), width: 8 }}>{s}</span>
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
        <span className="nowrap" style={t(13, 400)}>2,600 reviews</span>
      </div>
    </G>
  );
}

export function AISummary() {
  return (
    <G r={28} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VIcon name="sparkle" fill={NAVY} />
        <span style={t(15, 600)}>Review summary</span>
      </div>
      <p style={t(15, 400, NAVY, { lineHeight: 1.4 })}>
        People love the cozy, artsy feel, the back patio and garden pond, and the pastries — kolaches and chai come up often. Many say it gets busy on weekends and seating and parking can be tight, so mornings are calmer.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Patio · 310', 'Kolache · 180', 'Chai · 150', 'Busy weekends · 120'].map((m) => <Pill key={m}>{m}</Pill>)}
      </div>
      <span style={t(12, 400)}>Summarized by AI from 2,600 reviews</span>
    </G>
  );
}

export function Pill({ children, strong }) {
  return <span className="nowrap" style={{ ...t(12, strong ? 600 : 500), background: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 14, display: 'inline-block' }}>{children}</span>;
}

export function ReviewCard({ r }) {
  const [helpful, setHelpful] = useState(false);
  return (
    <G r={28} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: r.mine ? NAVY : '#E6E6E8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15 }}>{r.mine ? 'R' : ''}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={t(15, 600)}>{r.name}</span>
          <span style={t(13, 400)}>{r.meta}</span>
        </div>
      </div>
      <Stars n={r.stars ?? 5} />
      {r.text && <p style={t(15, 400, NAVY, { lineHeight: 1.4 })}>{r.text}</p>}
      {r.tags?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{r.tags.map((x) => <Pill key={x}>{x}</Pill>)}</div>}
      {!r.mine && (
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setHelpful((h) => !h)} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, height: 28 }}>
          <motion.span animate={helpful ? { rotate: [0, -18, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.4 }}>
            <VIcon name="thumbsUp" fill={NAVY} />
          </motion.span>
          <span style={t(13, helpful ? 600 : 500)}>{helpful ? 'Helpful · 1' : 'Helpful'}</span>
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
export function Toast({ text, icon = 'check' }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div key={text} className="gl-solid" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={GENTLE}
          style={{ position: 'absolute', left: '50%', x: '-50%', top: 790, zIndex: 30, borderRadius: 22, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <VIcon name={icon} size={18} />
          <span className="nowrap" style={t(14, 600)}>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Glass / Day chart: header (icon, title, day picker, info), status line, 18 hourly bars 6a–11p, axis.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AXIS = [['9a', 54], ['12p', 105], ['3p', 161], ['6p', 215], ['9p', 268]];
export const hourLabel = (i) => { const h = 6 + i; return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`; };
export function DayChart({ icon, title, week, nowIdx = 11, liveText, info, describe, footnote }) {
  const [day, setDay] = useState('Sun');
  const [menu, setMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [sel, setSel] = useState(null);
  const bars = week[day];
  const live = day === 'Sun';
  const status = sel != null ? `${hourLabel(sel)} · ${describe(bars[sel], sel)}` : live ? liveText : `Usually on ${day}s · tap a bar`;
  return (
    <G r={28} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, zIndex: menu ? 5 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <span style={{ ...t(17, 600), flex: '1 0 0' }}>{title}</span>
        <div style={{ position: 'relative' }}>
          <motion.button whileTap={{ scale: 0.95 }} transition={TAP} onClick={() => setMenu((m) => !m)}
            style={{ height: 44, padding: '0 12px 0 16px', borderRadius: 22, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={t(14, 500)}>{day}</span>
            <motion.span animate={{ rotate: menu ? 180 : 0 }} transition={GENTLE}><VIcon name="caretDown" size={16} /></motion.span>
          </motion.button>
          <AnimatePresence>
            {menu && (
              <motion.div className="gl-solid" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.18 }}
                style={{ position: 'absolute', right: 0, top: 50, width: 140, borderRadius: 20, padding: 6, zIndex: 10, transformOrigin: '100% 0' }}>
                {DAYS.map((d) => (
                  <button key={d} onClick={() => { setDay(d); setSel(null); setMenu(false); }}
                    style={{ width: '100%', height: 36, borderRadius: 14, padding: '0 12px', display: 'flex', alignItems: 'center', background: d === day ? 'rgba(94,90,126,0.1)' : 'transparent' }}>
                    <span style={t(14, d === day ? 600 : 500)}>{d === 'Sun' ? 'Sun · Today' : d}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button aria-label={`About ${title.toLowerCase()}`} whileTap={{ scale: 0.9 }} onClick={() => setShowInfo((i) => !i)}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 22, background: showInfo ? 'rgba(255,255,255,0.85)' : 'transparent' }}>
          <VIcon name="info" />
        </motion.button>
      </div>
      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={GENTLE}
            style={{ ...t(13, 400, NAVY, { lineHeight: 1.4 }), overflow: 'hidden', marginTop: -4 }}>{info}</motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={status} style={t(14, 400)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {live && sel == null && <motion.span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 4, background: NAVY, marginRight: 6, verticalAlign: 1 }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />}
          {status}
        </motion.span>
      </AnimatePresence>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: 318, height: 104, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {bars.map((h, i) => {
            const hot = sel != null ? sel === i : live && i === nowIdx;
            return (
              <button key={i} aria-label={hourLabel(i)} onClick={() => setSel(sel === i ? null : i)} style={{ width: 14, height: 104, display: 'flex', alignItems: 'flex-end', padding: 0 }}>
                <motion.div initial={{ height: 0 }} animate={{ height: h, backgroundColor: hot ? NAVY : 'rgba(94,90,126,0.16)' }}
                  transition={{ ...GENTLE, delay: i * 0.015 }} style={{ width: 14, borderRadius: 7 }} />
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', width: 318, height: 16 }}>
          {AXIS.map(([l, x]) => <span key={l} className="abs" style={{ left: x, top: 0, ...t(12, 400) }}>{l}</span>)}
        </div>
      </div>
      <span style={{ ...t(13, 400), textAlign: 'center' }}>Tap a bar for details</span>
      {footnote}
    </G>
  );
}

// Weekly shapes: Sunday values come from Figma, other days are scaled from it.
export const weekFrom = (sun, k = [0.62, 0.6, 0.66, 0.72, 0.92, 1.02]) => {
  const shape = (m) => sun.map((h, i) => Math.max(6, Math.min(100, Math.round(h * m + (i % 3 === 0 ? 3 : -2)))));
  return { Sun: sun, Mon: shape(k[0]), Tue: shape(k[1]), Wed: shape(k[2]), Thu: shape(k[3]), Fri: shape(k[4]), Sat: shape(k[5]) };
};
