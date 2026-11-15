// Write a review (Figma 844:326)
// Nothing is pre-filled: stars, scales and toggles start unset. Post review unlocks once there is a star rating.
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { GENTLE, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon } from './venueIcons.jsx';
import { G, TopBar, Section, ChipGroup, PrimaryCTA, NAVY, MUTED, PURPLE, TAP, t } from './flow.jsx';

const RATING = ['  Tap to rate', 'Poor', 'Okay', 'Good', 'Great', 'Excellent'];

function Stars({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginLeft: -8 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value;
        return (
          <motion.button key={n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} whileTap={{ scale: 0.85 }} transition={TAP}
            style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span initial={false} animate={on ? { scale: [1, 1.22, 1] } : { scale: 1 }} transition={{ duration: 0.32, delay: on ? (n - 1) * 0.04 : 0 }}>
              <VIcon name={on ? 'star36Fill' : 'star36'} fill={NAVY} />
            </motion.span>
          </motion.button>
        );
      })}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} style={{ ...t(15, 500, MUTED), marginLeft: 8 }} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {RATING[value]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Stepped slider (Figma "Review / Sound slider"). Stop 0 is "Didn't notice".
// value = null means not set yet: no thumb, every stop shows a marker.
const INK = '#2a2650';
export function Scale({ title, steps, value, onChange }) {
  const ref = useRef(null);
  const drag = useRef(false);
  const n = steps.length;
  const L = 24, W = 344; // track inset and width inside the 392 card
  const pos = (i) => L + (W * i) / (n - 1);
  const pick = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 392;
    const k = Math.max(0, Math.min(n - 1, Math.round(((px - L) / W) * (n - 1))));
    if (k !== value) onChange(k);
  };
  return (
    <G r={22} style={{ position: 'relative', height: 108 }}>
      <span className="abs" style={{ left: 16, top: 13, ...t(16, 600, INK) }}>{title}</span>
      <div ref={ref} className="abs" style={{ left: 0, right: 0, top: 42, bottom: 0, touchAction: 'none', cursor: 'pointer' }}
        onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
        onPointerMove={(e) => drag.current && pick(e)}
        onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}>
        <div className="abs" style={{ left: L, width: W, top: 15, height: 4, borderRadius: 2, background: 'rgba(42,38,80,0.1)' }} />
        <motion.div className="abs" style={{ left: L, top: 15, height: 4, borderRadius: 2, background: PURPLE }}
          initial={false} animate={{ width: value == null ? 0 : pos(value) - L }} transition={GENTLE} />
        {steps.map((_, i) => (
          <motion.div key={i} className="abs" style={{ left: pos(i) - 3, top: 14, width: 6, height: 6, borderRadius: 3, background: '#c4c2cf' }}
            initial={false} animate={{ opacity: value == null || i > value ? 1 : 0 }} transition={{ duration: 0.15 }} />
        ))}
        <AnimatePresence>
          {value != null && (
            <motion.div className="abs" style={{ top: 10, width: 15, height: 15, marginLeft: -7.5, borderRadius: 8, background: PURPLE }}
              initial={{ scale: 0, left: pos(value) }} animate={{ scale: 1, left: pos(value) }} exit={{ scale: 0 }} transition={GENTLE} />
          )}
        </AnimatePresence>
        {steps.map((s, i) => {
          const first = i === 0, last = i === n - 1;
          return (
            <span key={s} className="abs nowrap" style={{ top: 40, fontSize: 12, fontWeight: 400, lineHeight: '14px', color: value === i ? PURPLE : INK, transition: 'color .15s',
              ...(first ? { left: 12 } : last ? { right: 12 } : { left: pos(i), transform: 'translateX(-50%)' }) }}>
              {s}
            </span>
          );
        })}
      </div>
    </G>
  );
}

function TwoWay({ value, onChange, options }) {
  return (
    <G r={26} style={{ padding: 4, display: 'flex' }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{ position: 'relative', flex: '1 0 0', height: 44, borderRadius: 22 }}>
          {value === o && <motion.div layoutId="weekpart" transition={GENTLE}
            style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />}
          <span style={{ position: 'relative', ...t(15, value === o ? 600 : 500) }}>{o}</span>
        </button>
      ))}
    </G>
  );
}

const SKIP = "Didn't notice";
const SCALES = {
  tod: [SKIP, 'Morning', 'Afternoon', 'Evening', 'Night'],
  sound: [SKIP, 'Quiet', 'Low', 'Moderate', 'Lively'],
  light: [SKIP, 'Dim', 'Soft', 'Moderate', 'Bright'],
  crowd: [SKIP, 'Empty', 'Light', 'Moderate', 'Busy'],
  temp: [SKIP, 'Cold', 'Cool', 'Mild', 'Warm'],
};

export default function WriteReview({ onClose, onPosted, mine }) {
  const [scrolled, setScrolled] = useState(false);
  const [rating, setRating] = useState(mine?.stars || 0);
  const [tod, setTod] = useState(null);
  const [part, setPart] = useState(null);
  const [v, setV] = useState({ sound: null, light: null, crowd: null, temp: null });
  const [seats, setSeats] = useState([]);
  const [smells, setSmells] = useState([]);
  const [text, setText] = useState(mine?.text || '');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);
  const starC = useAnimationControls();
  const nextId = useRef(0);

  const blocked = () => {
    scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => starC.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.42 } }), 250);
  };
  const post = () => {
    setBusy(true);
    const tags = [];
    if (v.sound > 0) tags.push(`Sound · ${SCALES.sound[v.sound]}`);
    if (v.crowd > 0) tags.push(`Crowd · ${SCALES.crowd[v.crowd]}`);
    if (v.light > 0) tags.push(`Light · ${SCALES.light[v.light]}`);
    if (seats[0]) tags.push(`Seating · ${seats[0]}`);
    setTimeout(() => onPosted({ name: 'You', meta: 'Just now', stars: rating, text: text.trim(), tags, mine: true, age: 0 }), 800);
  };

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Write a review" onClose={onClose} scrolled={scrolled} />
      <div ref={scroller} className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '128px 24px 140px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <motion.div animate={starC} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={t(17, 600)}>How was your visit?</span>
            <Stars value={rating} onChange={setRating} />
          </motion.div>

          <Section icon="clock" title="When did you go?">
            <Scale title="Time of day" steps={SCALES.tod} value={tod} onChange={setTod} />
            <TwoWay options={['Weekday', 'Weekend']} value={part} onChange={setPart} />
          </Section>

          <Scale title="Sound" steps={SCALES.sound} value={v.sound} onChange={(k) => setV({ ...v, sound: k })} />
          <Scale title="Light" steps={SCALES.light} value={v.light} onChange={(k) => setV({ ...v, light: k })} />
          <Scale title="Crowd" steps={SCALES.crowd} value={v.crowd} onChange={(k) => setV({ ...v, crowd: k })} />
          <Scale title="Temperature" steps={SCALES.temp} value={v.temp} onChange={(k) => setV({ ...v, temp: k })} />

          <Section icon="chair" iconSize={24} title="Seating" note="Select all that apply">
            <ChipGroup options={['Booth', 'Corner seat', 'Table with space', 'Bar seat', 'Couch or lounge', 'Communal table', 'Outdoor', 'Window seat']} value={seats} onChange={setSeats} />
          </Section>

          <Section icon="wind" title="Smells you noticed" note="Select all that apply">
            <ChipGroup options={['None', 'Smoke', 'Perfume or incense', 'Fried food', 'Seafood', 'Cleaning products']} value={smells}
              onChange={(next) => {
                const added = next.find((x) => !smells.includes(x));
                if (added === 'None') setSmells(['None']);
                else setSmells(next.filter((x) => x !== 'None' || !added));
              }} />
          </Section>

          <Section title="Tell people more" note="Optional">
            <G r={28} style={{ height: 168, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
              <textarea className="field" maxLength={500} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="What was it like? Was it easy to talk, find a seat, or take a break?" style={{ flex: '1 0 0', resize: 'none' }} />
              <span style={t(12, 400, text.length > 450 ? PURPLE : MUTED)}>{text.length} / 500</span>
            </G>
          </Section>

          <Section icon="img" title="Add photos" note={photos.length ? `${photos.length} of 10` : 'Up to 10'}>
            <div className="hscroll" style={{ margin: '-6px -24px -40px', padding: '6px 24px 40px', display: 'flex', gap: 12 }}>
              <AnimatePresence initial={false}>
                {photos.length < 10 && (
                  <G key="add" as="button" r={24} onClick={() => setPhotos((p) => [...p, nextId.current++])} whileTap={{ scale: 0.95 }} transition={TAP}
                    style={{ width: 120, height: 120, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <VIcon name="camera" />
                    <span style={t(13, 500)}>Add</span>
                  </G>
                )}
                {photos.map((id, i) => (
                  <motion.div key={id} layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={GENTLE}
                    style={{ position: 'relative', width: 120, height: 120, flex: 'none', borderRadius: 24, background: i % 2 ? '#e0e0e3' : '#dbdbde' }}>
                    <G as="button" r={14} aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((x) => x !== id))} whileTap={{ scale: 0.85 }}
                      style={{ position: 'absolute', left: 84, top: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <VIcon name="x14" />
                    </G>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Section>

        </div>
      </div>
      <PrimaryCTA label={'Post review'} enabled={rating > 0} onClick={post} onBlocked={blocked} busy={busy ? 'Post review' : null} />
    </div>
  );
}

