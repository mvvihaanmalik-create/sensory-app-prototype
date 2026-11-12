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

// Stepped slider. value = null means not set yet: no fill, no thumb.
function Scale({ icon, title, steps, value, onChange, endsOnly }) {
  const ref = useRef(null);
  const n = steps.length;
  const skip = value === 'skip';
  if (skip) value = null;
  const f = value == null ? 0 : value / (n - 1);
  const W = 345; // card inner width (392 - 2 x 1.5 border - 2 x 22 padding)
  const pos = (x) => 14 + (W - 28) * x;
  const pick = (e) => {
    const el = ref.current; const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const k = Math.max(0, Math.min(n - 1, Math.round(((px - 14) / (W - 28)) * (n - 1))));
    if (k !== value) onChange(k);
  };
  const drag = useRef(false);
  return (
    <G r={28} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
        {icon}
        <span style={{ ...t(17, 600), flex: '1 0 0' }}>{title}</span>
        <motion.button whileTap={{ scale: 0.94 }} transition={TAP} onClick={() => onChange(skip ? null : 'skip')} aria-pressed={skip}
          initial={false} animate={{ backgroundColor: skip ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)' }}
          style={{ height: 36, padding: '0 16px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          <AnimatePresence initial={false}>
            {skip && <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: 14, opacity: 1 }} exit={{ width: 0, opacity: 0 }} style={{ display: 'flex', overflow: 'hidden' }}><VIcon name="check" size={14} /></motion.span>}
          </AnimatePresence>
          <span className="nowrap" style={t(13, skip ? 600 : 500)}>Didn't notice</span>
        </motion.button>
      </div>
      <motion.div ref={ref} initial={false} animate={{ opacity: skip ? 0.35 : 1 }} style={{ position: 'relative', height: 44, touchAction: 'none', cursor: 'pointer' }}
        onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
        onPointerMove={(e) => drag.current && pick(e)}
        onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}>
        <div className="abs" style={{ left: 0, right: 0, top: 18, height: 8, borderRadius: 4, background: 'rgba(42,38,80,0.1)' }} />
        <motion.div className="abs" style={{ left: 0, top: 18, height: 8, borderRadius: 4, background: PURPLE }}
          initial={false} animate={{ width: value == null ? 0 : pos(f) }} transition={GENTLE} />
        {steps.map((_, i) => (
          <motion.div key={i} className="abs" style={{ left: pos(i / (n - 1)), top: 19, width: 6, height: 6, marginLeft: -3, borderRadius: 3 }}
            initial={false} animate={{ backgroundColor: value != null && i <= value ? 'rgba(255,255,255,0.9)' : 'rgba(42,38,80,0.25)' }} />
        ))}
        <AnimatePresence>
          {value != null && (
            <motion.div className="abs" style={{ top: 8, width: 28, height: 28, marginLeft: -14, borderRadius: 14, background: '#fff', border: '1.5px solid #fff', boxShadow: '0 2px 8px rgba(42,38,80,0.18), 0 0 0 0.5px rgba(42,38,80,0.06)' }}
              initial={{ scale: 0, left: pos(f) }} animate={{ scale: 1, left: pos(f) }} exit={{ scale: 0 }} transition={GENTLE} />
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div initial={false} animate={{ opacity: skip ? 0.35 : 1 }} style={{ position: 'relative', height: 16, marginTop: -6 }}>
        {steps.map((s, i) => {
          if (endsOnly && i > 0 && i < n - 1) return null;
          const first = i === 0, last = i === n - 1;
          const on = value === i;
          return (
            <motion.span key={s} className="abs nowrap" initial={false}
              
              style={{ top: 0, fontSize: 12, fontWeight: on ? 600 : 400, lineHeight: '16px', color: NAVY,
                ...(first ? { left: 0 } : last ? { right: 0 } : { left: pos(i / (n - 1)), transform: 'translateX(-50%)' }) }}>
              {s}
            </motion.span>
          );
        })}
      </motion.div>
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

const SCALES = {
  sound: ['Quiet', 'Easy to talk', 'Lively', 'Loud'],
  light: ['Dim', 'Warm & cozy', 'Natural light', 'Bright'],
  crowd: ['Almost empty', 'Relaxed', 'Buzzing', 'Busy', 'Packed'],
  temp: ['Cool', 'Mild', 'Warm'],
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
    if (typeof v.sound === 'number') tags.push(`Sound · ${SCALES.sound[v.sound]}`);
    if (typeof v.crowd === 'number') tags.push(`Crowd · ${SCALES.crowd[v.crowd]}`);
    if (typeof v.light === 'number') tags.push(`Light · ${SCALES.light[v.light]}`);
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
            <Scale icon={<VIcon name="clock" />} title="Time of day" steps={['Morning', 'Afternoon', 'Evening', 'Night']} value={tod} onChange={setTod} />
            <TwoWay options={['Weekday', 'Weekend']} value={part} onChange={setPart} />
          </Section>

          <Scale icon={<Icon d={paths.speaker} size={24} fill={NAVY} />} title="Sound" steps={SCALES.sound} value={v.sound} onChange={(k) => setV({ ...v, sound: k })} />
          <Scale icon={<Icon d={paths.sun} size={24} fill={NAVY} />} title="Light" steps={SCALES.light} value={v.light} onChange={(k) => setV({ ...v, light: k })} />
          <Scale icon={<Icon d={paths.users} size={24} fill={NAVY} />} title="Crowd" steps={SCALES.crowd} value={v.crowd} onChange={(k) => setV({ ...v, crowd: k })} endsOnly />
          <Scale icon={<VIcon name="therm" />} title="Temperature" steps={SCALES.temp} value={v.temp} onChange={(k) => setV({ ...v, temp: k })} />

          <Section icon="chair" iconSize={24} title="Seating" note="Pick any">
            <ChipGroup options={['Patio', 'Tables', 'Bar seats', 'Sofas', 'Booths', 'Standing room', 'Window seat']} value={seats} onChange={setSeats} />
          </Section>

          <Section icon="wind" title="Smells you noticed" note="Pick any">
            <ChipGroup options={['None', 'Coffee', 'Food cooking', 'Smoke', 'Perfume']} value={smells}
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

