// Onboarding (Figma section 978:5405): Welcome, Sound, Light, Crowd, Temperature, Seating, Start exploring.
// A skippable first-run overlay. Picks become a "My comfort" mode (see toMode) that follows the person through the app.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import { GENTLE, NAVY, MUTED, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon } from './venueIcons.jsx';
import { CircleBtn, G, OtherChip, PrimaryCTA, TAP, t } from './flow.jsx';
import soundImg from './assets/onboarding/sound.png';
import lightImg from './assets/onboarding/light.png';
import catchupImg from './assets/onboarding/catchup.png';
import cozyImg from './assets/onboarding/cozy.png';
import boothsImg from './assets/onboarding/booths.png';
import fitsImg from './assets/onboarding/fits.png';
import cafesImg from './assets/onboarding/cafes.png';
import musicImg from './assets/onboarding/music.png';
import { CONTOURS } from './contourData.js';

const INDIGO = '#5b52c9';
// Figma onboarding chip: navy text (#2a2650), unlike the venue pages' #5e5a7e
const SeatChip = ({ label, on, onClick }) => (
  <G as="button" r={22} on={on} onClick={onClick} whileTap={{ scale: 0.95 }} transition={TAP} aria-pressed={on}
    style={{ height: 44, padding: '0 20px', display: 'flex', alignItems: 'center', flex: 'none' }}>
    <span className="nowrap" style={t(15, on ? 600 : 500, on ? NAVY : 'rgba(42,38,80,0.8)', { lineHeight: 'normal' })}>{label}</span>
  </G>
);
export const ONBOARDING_STEPS = ['welcome', 'sound', 'light', 'crowd', 'temp', 'seating', 'done'];

/* ---------- Data ---------- */
const SLIDERS = {
  sound: { title: 'How loud do you like it?', name: 'Sound', icon: 'sound', steps: ['Any', 'Quiet', 'Low', 'Moderate', 'Lively'], def: 0,
    titleTop: 150, card: { top: 303, h: 481, hy: 173.5, sy: 233.5, sl: 385.5, ey: 445.5 }, art: { src: soundImg, left: 173, top: 177 } },
  light: { title: 'What light do you like?', name: 'Light', icon: 'light', steps: ['Any', 'Dim', 'Soft', 'Moderate', 'Bright'], def: 0,
    titleTop: 150, card: { top: 250, h: 515, hy: 21.5, sy: 81.5, sl: 233.5, ey: 293.5 }, art: { src: lightImg, left: 176, top: 591 } },
  crowd: { title: 'How busy is comfortable?', name: 'Crowd', icon: 'crowd', steps: ['Any', 'Empty', 'Light', 'Moderate', 'Busy'], def: 0,
    titleTop: 161, card: { top: 327, h: 506, hy: 157.5, sy: 217.5, sl: 369.5, ey: 429.5 }, art: { src: catchupImg, left: 143, top: 181 } },
  temp: { title: 'How warm do you like it?', name: 'Temperature', icon: 'temp', steps: ['Any', 'Cold', 'Cool', 'Mild', 'Warm'], def: 0,
    titleTop: 165, card: { top: 263, h: 502, hy: 21.5, sy: 81.5, sl: 233.5, ey: 293.5 }, art: { src: cozyImg, left: 176, top: 591 } },
};
const SEATS = ['Booth', 'Corner seat', 'Table with space', 'Bar seat', 'Couch or lounge', 'Communal table', 'Outdoor'];
export const initialPicks = () => ({
  sound: { i: SLIDERS.sound.def, any: false }, light: { i: SLIDERS.light.def, any: false },
  crowd: { i: SLIDERS.crowd.def, any: false }, temp: { i: SLIDERS.temp.def, any: false },
  seat: [],
});
const labelOf = (k, p) => SLIDERS[k].steps[p[k].i];
const seatLine = (seat) => (seat.length === 0 ? 'Any' : seat.length <= 2 ? seat.join(' · ') : `${seat.slice(0, 2).join(' · ')} +${seat.length - 2}`);

// Onboarding picks -> the app's mode shape (Modes.jsx scales: sound Quiet / Easy to talk / Lively, light Dim / Soft / Bright,
// crowd Relaxed / Moderate / Busy, temperature Cool / Mild / Warm). Picks past the end of a mode scale fold into its last value.
export function toMode(p) {
  const sound = [null, 'Quiet', 'Low', 'Moderate', 'Lively'][p.sound.i];
  const light = [{ b: null, tone: null, src: null }, { b: 'Dim', tone: null, src: null }, { b: 'Soft', tone: null, src: null }, { b: 'Moderate', tone: null, src: null }, { b: 'Bright', tone: null, src: null }][p.light.i];
  const crowd = [null, 'Empty', 'Light', 'Moderate', 'Busy'][p.crowd.i];
  const temp = [null, 'Cold', 'Cool', 'Mild', 'Warm'][p.temp.i];
  const pos = ['Booth', 'Corner seat', 'Bar seat', 'Outdoor'].find((s) => p.seat.includes(s));
  const layout = ['Table with space', 'Communal table'].find((s) => p.seat.includes(s));
  const prefs = { sound, light, crowd, temp, seat: { pos: pos === 'Outdoor' ? 'Patio' : pos || null, layout: layout || null } };
  const any = sound || light.b || crowd || temp || prefs.seat.pos || prefs.seat.layout;
  return any ? { id: 'mine', name: 'My comfort', desc: '', custom: true, prefs } : null;
}

/* ---------- Small pieces ---------- */
const Thermo = ({ size = 24, color = NAVY }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flex: 'none' }}>
    <path d="M10 14.8V5a2 2 0 1 1 4 0v9.8a4 4 0 1 1-4 0Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 9.5v7" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="17.2" r="1.6" fill={color} />
  </svg>
);
// `one` swaps the crowd glyph for the single-person icon the Figma slider tooltip uses (header and summary keep the group icon).
const SenseGlyph = ({ k, size = 24, color = NAVY, one }) => (k === 'temp' ? <Thermo size={size} color={color} />
  : k === 'seat' ? <VIcon name="chair" size={size} fill={color} />
  : <Icon d={paths[k === 'sound' ? 'speaker' : k === 'light' ? 'sun' : one ? 'user' : 'users']} size={size} fill={color} />);

function Progress({ n }) {
  return (
    <div className="abs" style={{ left: 113, top: 77, display: 'flex', gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div key={i} initial={false} animate={{ backgroundColor: i < n ? INDIGO : 'rgba(42,38,80,0.1)' }} transition={{ duration: 0.3 }}
          style={{ width: 38, height: 6, borderRadius: 3 }} />
      ))}
    </div>
  );
}

const SkipBtn = ({ onClick }) => (
  <motion.button className="abs" onClick={onClick} whileTap={{ scale: 0.94 }} transition={TAP}
    style={{ left: 370, top: 58, height: 44, padding: '0 4px 0 12px', display: 'flex', alignItems: 'center' }}>
    <span className="nowrap" style={t(15, 500, MUTED, { lineHeight: 'normal' })}>Skip</span>
  </motion.button>
);

const Title = ({ top, children }) => (
  <p className="abs" style={{ left: 40, top, width: 360, textAlign: 'center', ...t(28, 600, NAVY, { lineHeight: 1.2 }) }}>{children}</p>
);

/* ---------- Background motion (Figma 1472:8838 and 1487:9200) ---------- */
// Four Figma phases looped 1 > 2 > 3 > 4 > 1, Ease In and Out per transition.
const loop = (vals, dur) => ({ duration: dur * 4, times: [0, 0.25, 0.5, 0.75, 1], ease: Array(4).fill('easeInOut'), repeat: Infinity });
const keys = (a) => [...a, a[0]];
// Steps render inside AnimatePresence initial={false}, which blocks mount animations; start the loops one tick after mount.
const useStarted = () => { const [on, setOn] = useState(false); useEffect(() => { setOn(true); }, []); return on; };

// Diffuse gradient: five blurred colour clouds anchored to the bottom, 1.5 s per phase. [x, y, w, h, opacity] per phase.
const CLOUDS = [
  { c: 'rgb(243,205,173)', blur: 105, p: [[0, 825, 300, 283, 0.6], [111, 747, 310, 319, 0.63], [181, 856, 276, 276, 0.48], [-50, 864, 338, 275, 0.55]] },
  { c: 'rgb(207,225,167)', blur: 82, p: [[-118, 915, 278, 325, 0.76], [-155, 810, 277, 388, 0.63], [-37, 849, 245, 320, 0.72], [-106, 958, 293, 305, 0.66]] },
  { c: 'rgb(211,168,218)', blur: 98, p: [[237, 895, 331, 325, 0.79], [153, 910, 378, 342, 0.77], [269, 761, 312, 393, 0.75], [192, 819, 399, 361, 0.82]] },
  { c: 'rgb(235,167,175)', blur: 92, p: [[64, 810, 321, 362, 0.76], [180, 821, 281, 366, 0.75], [120, 921, 312, 287, 0.72], [-4, 784, 316, 378, 0.73]] },
  { c: 'rgb(238,218,170)', blur: 104, p: [[-166, 851, 268, 305, 0.65], [-69, 855, 288, 327, 0.59], [-141, 746, 306, 390, 0.55], [-102, 804, 258, 337, 0.61]] },
];
function DiffuseGradient() {
  return (
    <div className="abs" style={{ inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      {CLOUDS.map(({ c, blur, p }, i) => {
        const [x0, y0, w0, h0] = p[0];
        return (
          <motion.div key={i} className="abs" style={{ left: x0, top: y0, width: w0, height: h0, borderRadius: '50%', background: c, filter: `blur(${blur / 2}px)`, transformOrigin: '0 0', willChange: 'transform, opacity' }}
            animate={{ x: keys(p.map((q) => q[0] - x0)), y: keys(p.map((q) => q[1] - y0)), scaleX: keys(p.map((q) => q[2] / w0)), scaleY: keys(p.map((q) => q[3] / h0)), opacity: keys(p.map((q) => q[4])) }}
            transition={loop(p, 1.5)} />
        );
      })}
    </div>
  );
}

// Contour ripple: each line shifts and scales a little out of step with its neighbours, 1.65 s per phase,
// under the Figma alpha fade (solid to 46.9%, clear by 68.3%).
function ContourRipple() {
  const on = useStarted();
  return (
    <svg className="abs" width="440" height="956" viewBox="0 0 440 956" fill="none" aria-hidden
      style={{ left: 0, top: 0, pointerEvents: 'none', overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(180deg, #000 46.86%, transparent 68.33%)', maskImage: 'linear-gradient(180deg, #000 46.86%, transparent 68.33%)' }}>
      {CONTOURS.map(({ d, o, f }, i) => (
        <motion.path key={i} d={d} stroke="rgba(94,90,126,0.16)" strokeWidth="1.2" vectorEffect="non-scaling-stroke"
          style={{ transformOrigin: `${o[0]}px ${o[1]}px`, transformBox: 'view-box' }}
          animate={on ? { x: keys(f.map((q) => q[0])), y: keys(f.map((q) => q[1])), scaleX: keys(f.map((q) => q[2])), scaleY: keys(f.map((q) => q[3])) } : { x: f[0][0], y: f[0][1], scaleX: f[0][2], scaleY: f[0][3] }}
          transition={loop(f, 1.65)} />
      ))}
    </svg>
  );
}

/* ---------- Welcome ---------- */
// Floating icons: Figma rest positions (y shifted 18 like the rest of this screen), [dx, dy] per phase.
const ORBIT = [
  { src: soundImg, left: 49, top: 150, s: 84, dx: [0, -3, -5, -2], dy: [0, -13, 0, 13] },
  { src: lightImg, left: 294, top: 145, s: 84, dx: [0, -4, 0, 4], dy: [0, 12, 0, -12] },
  { src: boothsImg, left: 312, top: 352, s: 84, dx: [0, 3, 6, 3], dy: [0, -8, -14, -6] },
  { src: musicImg, left: 59, top: 361, s: 84, dx: [0, 3, 1, -2], dy: [0, 6, 11, 4] },
];

function Welcome({ onNext, onSkip }) {
  const on = useStarted();
  return (
    <>
      <ContourRipple />
      <SkipBtn onClick={onSkip} />
      <motion.div className="abs" style={{ left: 132, top: 218, width: 176, height: 176, borderRadius: 88, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={GENTLE}>
        <img src={cafesImg} alt="" draggable={false} style={{ position: 'absolute', left: 13, top: 13, width: 150, height: 150, objectFit: 'contain' }} />
      </motion.div>
      {ORBIT.map((o, i) => (
        <motion.div key={i} className="abs" style={{ left: o.left, top: o.top, width: o.s, height: o.s }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...GENTLE, delay: 0.08 * (i + 1) }}>
          <motion.div className="gl" animate={on ? { x: keys(o.dx), y: keys(o.dy) } : { x: 0, y: 0 }} transition={loop(o.dy, 1.65)}
            style={{ width: o.s, height: o.s, borderRadius: o.s / 2, boxShadow: '0 14px 36px rgba(42,38,80,0.1), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
            <img src={o.src} alt="" draggable={false} style={{ position: 'absolute', left: 6, top: 6, width: 66, height: 66, objectFit: 'contain' }} />
          </motion.div>
        </motion.div>
      ))}
      <Title top={540}>Find places that feel right</Title>
      <p className="abs" style={{ left: 50, top: 592, width: 340, textAlign: 'center', ...t(16, 400, MUTED, { lineHeight: 1.2 }) }}>See how a place sounds, looks and feels before you go.</p>
      <PrimaryCTA label="Next" top={853} color={NAVY} onClick={onNext} />
    </>
  );
}

/* ---------- Preference slider ---------- */
const TRACK = 318, EDGE = 14;
const stepX = (i, n) => EDGE + (i * (TRACK - 2 * EDGE)) / (n - 1);
const nearest = (x, n) => Math.max(0, Math.min(n - 1, Math.round(((x - EDGE) / (TRACK - 2 * EDGE)) * (n - 1))));

function Slider({ cfg, value, onChange }) {
  const n = cfg.steps.length, { i } = value, any = false;
  const pos = useMotionValue(stepX(i, n));
  const fill = useTransform(pos, (v) => Math.max(0, v));
  const tipX = useTransform(pos, (v) => v - 9);
  const thumbX = useTransform(pos, (v) => v - 18);
  const bubbleX = useTransform(pos, (v) => v - 52);
  const ref = useRef(null);
  const drag = useRef(false);
  useEffect(() => { if (!drag.current) animate(pos, stepX(i, n), { type: 'spring', stiffness: 420, damping: 34 }); }, [i]); // eslint-disable-line

  const at = (e) => {
    const r = ref.current.getBoundingClientRect();
    return Math.max(EDGE, Math.min(TRACK - EDGE, ((e.clientX - r.left) / r.width) * TRACK));
  };
  const move = (e) => { const x = at(e); pos.set(x); const k = nearest(x, n); if (k !== i || any) onChange({ i: k, any: false }); };
  const down = (e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e); };
  const up = () => { if (!drag.current) return; drag.current = false; animate(pos, stepX(i, n), { type: 'spring', stiffness: 420, damping: 34 }); };
  const key = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange({ i: Math.min(n - 1, i + 1), any: false }); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange({ i: Math.max(0, i - 1), any: false }); }
  };
  const x0 = (k) => stepX(k, n) - 3;
  return (
    <div ref={ref} role="slider" tabIndex={0} aria-label={cfg.name} aria-valuemin={0} aria-valuemax={n - 1} aria-valuenow={i} aria-valuetext={any ? 'Any' : cfg.steps[i]}
      onPointerDown={down} onPointerMove={(e) => drag.current && move(e)} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
      style={{ position: 'absolute', left: 0, top: 0, width: TRACK, height: 44, touchAction: 'none', cursor: 'pointer', outline: 'none' }}>
      <div className="abs" style={{ left: 0, top: 18, width: TRACK, height: 8, borderRadius: 4, background: 'rgba(42,38,80,0.1)' }} />
      <motion.div className="abs" initial={false} animate={{ opacity: any ? 0 : 1 }} style={{ left: 0, top: 18, height: 8, borderRadius: 4, background: INDIGO, width: fill }} />
      {cfg.steps.map((_, k) => (
        <div key={k} className="abs" style={{ left: x0(k), top: 19, width: 6, height: 6, borderRadius: 3, background: !any && k <= i ? '#fff' : 'rgba(42,38,80,0.22)' }} />
      ))}
      <motion.div className="abs" initial={false} animate={{ opacity: any ? 0 : 1, scale: any ? 0.7 : 1 }} transition={{ duration: 0.2 }}
        style={{ left: 0, top: 4, width: 36, height: 36, x: thumbX, borderRadius: 18, background: '#fff', border: `3px solid ${INDIGO}`, boxShadow: '0 4px 12px rgba(42,38,80,0.22)', boxSizing: 'border-box' }} />
      <motion.div className="abs" initial={false} animate={{ opacity: any ? 0 : 1, y: any ? 8 : 0 }} transition={{ duration: 0.2 }}
        style={{ left: 0, top: -98, pointerEvents: 'none', x: bubbleX, width: 104 }}>
        <div style={{ position: 'relative', minHeight: 92, width: 104, borderRadius: 20, background: 'rgba(255,255,255,0.96)', border: '1.5px solid #fff', boxSizing: 'border-box',
          WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 28px rgba(42,38,80,0.16)', padding: '14px 8px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <SenseGlyph k={cfg.icon} size={32} one />
          <span className="nowrap" style={t(14, 600, NAVY, { lineHeight: 1.2 })}>{cfg.steps[i]}</span>
        </div>
      </motion.div>
      <motion.svg className="abs" width="18" height="9" viewBox="0 0 18 9" initial={false} animate={{ opacity: any ? 0 : 1 }} style={{ left: 0, top: -7, x: tipX, pointerEvents: 'none' }}>
        <path d="M0 0H18L10.6 7.6a2.2 2.2 0 0 1-3.2 0L0 0Z" fill="rgba(255,255,255,0.96)" />
      </motion.svg>
    </div>
  );
}

function SliderScreen({ k, picks, setPick, onNext, onBack, onSkip }) {
  const cfg = SLIDERS[k], v = picks[k], c = cfg.card;
  return (
    <>
      <CircleBtn label="Back" onClick={onBack} style={{ position: 'absolute', left: 24, top: 56 }}><VIcon name="caretLeft" fill={NAVY} /></CircleBtn>
      <Progress n={ONBOARDING_STEPS.indexOf(k)} />
      <SkipBtn onClick={onSkip} />
      <Title top={cfg.titleTop}>{cfg.title}</Title>
      <div className="gl abs" style={{ left: 41, top: c.top, width: 358, height: c.h, borderRadius: 28 }}>
        <div className="abs" style={{ left: 20, top: c.hy - 1.5, width: 315, height: 44, display: 'flex', alignItems: 'center', gap: 10 }}>
          <SenseGlyph k={cfg.icon} />
          <span className="nowrap" style={{ flex: '1 0 0', ...t(17, 600, NAVY, { lineHeight: 'normal' }) }}>{cfg.name}</span>
        </div>
        <div className="abs" style={{ left: 20, top: c.sl - 1.5, width: TRACK, height: 44 }}>
          <Slider cfg={cfg} value={v} onChange={(nv) => setPick(k, nv)} />
        </div>
        <div className="abs" style={{ left: 20, top: c.ey - 1.5, width: TRACK, height: 14 }}>
          {cfg.steps.map((lab, j) => (
            <span key={lab} className="nowrap" style={{ position: 'absolute', left: stepX(j, cfg.steps.length), top: 0, transform: 'translateX(-50%)', ...t(12, 400, MUTED, { lineHeight: '14px' }) }}>{lab}</span>
          ))}
        </div>
      </div>
      <img src={cfg.art.src} alt="" draggable={false} className="abs" style={{ left: cfg.art.left, top: cfg.art.top, width: 292, height: 292, objectFit: 'contain', pointerEvents: 'none' }} />
      <PrimaryCTA label="Next" top={853} color={NAVY} onClick={onNext} />
    </>
  );
}

/* ---------- Seating ---------- */
function Seating({ picks, setSeat, onNext, onBack, onSkip }) {
  const [extra, setExtra] = useState([]);
  const all = [...SEATS, ...extra];
  const toggle = (s) => setSeat(picks.seat.includes(s) ? picks.seat.filter((x) => x !== s) : [...picks.seat, s]);
  return (
    <>
      <CircleBtn label="Back" onClick={onBack} style={{ position: 'absolute', left: 24, top: 56 }}><VIcon name="caretLeft" fill={NAVY} /></CircleBtn>
      <Progress n={5} />
      <SkipBtn onClick={onSkip} />
      <Title top={171}>Where do you like to sit?</Title>
      <img src={boothsImg} alt="" draggable={false} className="abs" style={{ left: 73, top: 204, width: 292, height: 292, objectFit: 'contain', pointerEvents: 'none' }} />
      <motion.div layout className="abs" style={{ left: 21, top: 478, width: 400, height: 293, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
        {all.map((s) => (
          <motion.div key={s} layout transition={GENTLE} initial={extra.includes(s) ? { opacity: 0, scale: 0.8 } : false} animate={{ opacity: 1, scale: 1 }}>
            <SeatChip label={s} on={picks.seat.includes(s)} onClick={() => toggle(s)} />
          </motion.div>
        ))}
        <motion.div layout transition={GENTLE}>
          <OtherChip color={NAVY} onAdd={(v) => { if (!all.includes(v)) setExtra((e) => [...e, v]); if (!picks.seat.includes(v)) setSeat([...picks.seat, v]); }} />
        </motion.div>
      </motion.div>
      <PrimaryCTA label="Next" top={853} color={NAVY} onClick={onNext} />
    </>
  );
}

/* ---------- Start exploring ---------- */
function Done({ picks, onAdd, onFinish }) {
  const rows = [['sound', 'Sound', labelOf('sound', picks)], ['light', 'Light', labelOf('light', picks)], ['crowd', 'Crowd', labelOf('crowd', picks)],
    ['temp', 'Temperature', labelOf('temp', picks)], ['seat', 'Seating', seatLine(picks.seat)]];
  return (
    <>
      <motion.div className="abs" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={GENTLE}
        style={{ left: 130, top: 114, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.55)', border: '1.5px solid #fff', boxSizing: 'border-box' }}>
        <img src={fitsImg} alt="" draggable={false} style={{ position: 'absolute', left: 13.5, top: 13.5, width: 150, height: 150, objectFit: 'contain' }} />
      </motion.div>
      <Title top={318}>You’re all set</Title>
      <motion.div className="gl abs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...GENTLE, delay: 0.08 }}
        style={{ left: 24, top: 378, width: 392, borderRadius: 28, padding: '6px 0', boxSizing: 'border-box' }}>
        {rows.map(([k, label, val], idx) => (
          <div key={k}>
            {idx > 0 && <div style={{ height: 1, margin: '0 20px', background: 'rgba(42,38,80,0.08)' }} />}
            <div style={{ height: 54, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <SenseGlyph k={k} size={22} color={MUTED} />
              <span style={{ flex: '1 0 0', ...t(15, 400, MUTED, { lineHeight: 'normal' }) }}>{label}</span>
              <span className="nowrap" style={t(15, 600, NAVY, { lineHeight: 'normal' })}>{val}</span>
            </div>
          </div>
        ))}
      </motion.div>
      <PrimaryCTA label="Start exploring" top={801} color={NAVY} onClick={onFinish} />
      <motion.button className="abs" onClick={onAdd} whileTap={{ scale: 0.96 }} transition={TAP}
        style={{ left: 120, top: 872, width: 200, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="nowrap" style={t(15, 500, MUTED, { lineHeight: 'normal' })}>Add another mode</span>
      </motion.button>
    </>
  );
}

/* ---------- Flow ---------- */
export default function Onboarding({ start = 0, onSkip, onFinish, onAddAnother }) {
  const [step, setStep] = useState(start);
  const [dir, setDir] = useState(1);
  const [picks, setPicks] = useState(initialPicks);
  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const setPick = (k, v) => setPicks((p) => ({ ...p, [k]: v }));
  const id = ONBOARDING_STEPS[step];
  const next = () => go(Math.min(6, step + 1)), back = () => go(Math.max(0, step - 1));
  const shell = { skip: onSkip, back, next };
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1', overflow: 'hidden' }}>
      {id !== 'done' && <DiffuseGradient />}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div key={id} className="abs" style={{ inset: 0 }} custom={dir}
          initial={{ opacity: 0, x: 36 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -36 * dir }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          {id === 'welcome' && <Welcome onNext={next} onSkip={onSkip} />}
          {SLIDERS[id] && <SliderScreen k={id} picks={picks} setPick={setPick} onNext={shell.next} onBack={shell.back} onSkip={onSkip} />}
          {id === 'seating' && <Seating picks={picks} setSeat={(s) => setPick('seat', s)} onNext={next} onBack={back} onSkip={onSkip} />}
          {id === 'done' && <Done picks={picks} onAdd={() => onAddAnother(toMode(picks))} onFinish={() => onFinish(toMode(picks))} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
