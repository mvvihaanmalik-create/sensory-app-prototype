// Book a table, three steps (Figma 884:326 When, 928:341 Where to sit, 929:326 Booking for) and Booking confirmed (884:694).
// Nothing is picked for you. Each step's button stays faded until that step is complete;
// tapping it early scrolls to what's missing and nudges it. Earlier choices carry forward and can be edited from later steps.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { GENTLE, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon } from './venueIcons.jsx';
import { G, CircleBtn, TopBar, Section, Chip, ChipGroup, PrimaryCTA, InfoList, Pill, NAVY, DIV, TAP, t } from './flow.jsx';
import { VENUE } from './Venue.jsx';

// ---------- Data ----------
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = new Date(2026, 10, 8); // Sun Nov 8
export const DATES = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(TODAY); d.setDate(TODAY.getDate() + i);
  const dow = DOW[d.getDay()];
  const mon = d.toLocaleString('en-US', { month: 'short' });
  return {
    i, dow, num: d.getDate(), month: d.toLocaleString('en-US', { month: 'long' }),
    label: i === 0 ? 'Today' : dow,
    short: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dow} ${mon} ${d.getDate()}`,
    long: `${i === 0 ? 'Today, ' : i === 1 ? 'Tomorrow, ' : ''}${dow} ${mon} ${d.getDate()}`,
  };
});
const MONTHS = [...new Set(DATES.map((d) => d.month))];

export const TIMES = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
// Typical crowd per slot. null = no table (closed or fully booked).
const CROWD = {
  Sun: ['Relaxed', 'Relaxed', 'Buzzing', 'Busy', 'Busy', 'Buzzing', 'Relaxed', 'Almost empty', null],
  Wk: ['Almost empty', 'Relaxed', 'Relaxed', 'Buzzing', 'Buzzing', 'Relaxed', 'Relaxed', 'Almost empty', null],
  Fri: ['Buzzing', 'Busy', 'Busy', 'Packed', null, 'Busy', 'Buzzing', 'Relaxed', 'Relaxed'],
  Sat: ['Busy', 'Busy', 'Packed', null, 'Packed', 'Busy', 'Buzzing', 'Relaxed', 'Relaxed'],
};
export function slotsFor(dateIdx, guests) {
  if (dateIdx == null) return TIMES.map((time) => ({ time, crowd: null, ok: false }));
  const row = CROWD[DATES[dateIdx].dow] || CROWD.Wk;
  return TIMES.map((time, i) => {
    let crowd = row[i];
    if (crowd && guests >= 6 && (crowd === 'Busy' || crowd === 'Packed')) crowd = null; // no big tables at peak
    return { time, crowd, ok: !!crowd };
  });
}

// Floor plans. Positions are inside the 392 x 460 plan card. Patio matches the Figma frame.
const T = (id, x, y, w, h, top, bottom, tags, f = {}) => ({ id, x, y, w, h, top, bottom, cap: top + bottom, tags, ...f });
export const ZONES = {
  Patio: {
    tables: [
      T(1, 16, 96, 70, 56, 1, 1, ['Sound · Easy to talk', 'Light · Shaded', 'Temp · Mild', 'By the garden path'], { stepFree: true }),
      T(2, 127, 96, 110, 56, 2, 2, ['Sound · Easy to talk', 'Light · Sunny', 'Temp · Warm after 2 PM'], { sunny: true, stepFree: true, space: true }),
      T(3, 278, 96, 70, 56, 1, 1, ['Sound · Easy to talk', 'Light · Sunny', 'Temp · Cool, by the AC vent'], { sunny: true, ac: true }),
      T(4, 16, 222, 110, 60, 2, 2, ['Sound · Easy to talk', 'Light · Shaded', 'Temp · Mild, away from AC', 'Far from speaker'], { stepFree: true, space: true }),
      T(5, 196, 222, 150, 60, 2, 2, ['Sound · Lively', 'Light · Sunny', 'Temp · Mild', 'Close to speaker'], { speaker: true, sunny: true, space: true, stepFree: true }),
      T(6, 16, 348, 70, 56, 1, 1, ['Sound · Easy to talk', 'Light · Shaded', 'Temp · Mild', 'By the side gate'], { exit: true, stepFree: true }),
      T(7, 150, 348, 70, 56, 1, 1, ['Sound · Lively', 'Light · Shaded', 'Temp · Mild', 'Next to speaker'], { speaker: true, exit: true }),
    ],
    marks: [
      { kind: 'tag', x: 20, y: 28, text: 'Garden pond this way →', go: 'Garden pond' },
      { kind: 'icon', x: 300, y: 16, icon: 'ac', label: 'AC vent' },
      { kind: 'icon', x: 296, y: 354, icon: 'speakerHigh', label: 'Speaker' },
    ],
  },
  'Garden pond': {
    tables: [
      T(8, 16, 70, 70, 56, 1, 1, ['Sound · Quiet, water sounds', 'Light · Dappled shade', 'Temp · Mild', 'By the pond'], { stepFree: false }),
      T(9, 294, 70, 70, 56, 1, 1, ['Sound · Quiet', 'Light · Dappled shade', 'Temp · Mild', 'By the pond'], {}),
      T(10, 16, 316, 110, 60, 2, 2, ['Sound · Quiet', 'Light · Shaded', 'Temp · Mild', 'Under the oak'], { space: true }),
      T(11, 236, 316, 110, 60, 2, 2, ['Sound · Easy to talk', 'Light · Sunny', 'Temp · Warm after 2 PM', 'Pond view'], { sunny: true, space: true }),
    ],
    marks: [
      { kind: 'pond', x: 106, y: 150, w: 180, h: 120 },
      { kind: 'tag', x: 20, y: 420, text: '← Patio this way', go: 'Patio' },
      { kind: 'note', x: 232, y: 424, text: 'Gravel path, one step' },
    ],
  },
  Indoor: {
    tables: [
      T(12, 16, 120, 70, 56, 1, 1, ['Sound · Lively', 'Light · Natural, by the window', 'Temp · Cool', 'Next to speaker'], { speaker: true, ac: true, stepFree: true }),
      T(13, 150, 120, 70, 56, 1, 1, ['Sound · Lively', 'Light · Natural', 'Temp · Cool, by the counter vent'], { ac: true, stepFree: true }),
      T(14, 16, 240, 110, 60, 2, 2, ['Sound · Easy to talk', 'Light · Warm & cozy', 'Temp · Mild', 'By the art wall'], { soft: true, stepFree: true, space: true }),
      T(15, 196, 240, 150, 60, 2, 2, ['Sound · Easy to talk', 'Light · Warm & cozy', 'Temp · Mild', 'Sofa seating'], { soft: true, stepFree: true, space: true }),
      T(16, 16, 360, 70, 56, 1, 1, ['Sound · Easy to talk', 'Light · Natural', 'Temp · Mild', 'Near the exit'], { exit: true, stepFree: true }),
      T(17, 150, 360, 70, 56, 1, 1, ['Sound · Easy to talk', 'Light · Warm & cozy', 'Temp · Mild', 'Near the exit'], { exit: true, soft: true, stepFree: true }),
    ],
    marks: [
      { kind: 'block', x: 20, y: 20, w: 260, h: 40, text: 'Counter' },
      { kind: 'icon', x: 300, y: 16, icon: 'ac', label: 'AC vent' },
      { kind: 'icon', x: 300, y: 112, icon: 'speakerHigh', label: 'Speaker' },
      { kind: 'icon', x: 300, y: 368, icon: 'arrowUpRight', label: 'Exit' },
    ],
  },
  Bar: {
    tables: [
      T(18, 16, 96, 98, 44, 2, 0, ['Sound · Lively', 'Light · Bright', 'Temp · Cool, by the counter vent', 'Bar stools'], { ac: true, sunny: true, bar: true }),
      T(19, 147, 96, 98, 44, 2, 0, ['Sound · Lively', 'Light · Bright', 'Temp · Cool', 'Bar stools'], { ac: true, sunny: true, bar: true }),
      T(20, 278, 96, 98, 44, 2, 0, ['Sound · Lively', 'Light · Bright', 'Temp · Cool', 'Bar stools', 'Close to speaker'], { speaker: true, sunny: true, bar: true }),
      T(21, 16, 300, 98, 44, 0, 2, ['Sound · Easy to talk', 'Light · Natural, window', 'Temp · Mild', 'Window bar'], { bar: true, exit: true }),
      T(22, 147, 300, 98, 44, 0, 2, ['Sound · Easy to talk', 'Light · Natural, window', 'Temp · Mild', 'Window bar'], { bar: true }),
      T(23, 278, 300, 98, 44, 0, 2, ['Sound · Easy to talk', 'Light · Natural, window', 'Temp · Mild', 'Window bar'], { bar: true }),
    ],
    marks: [
      { kind: 'block', x: 20, y: 196, w: 352, h: 48, text: 'Bar counter' },
      { kind: 'block', x: 20, y: 404, w: 352, h: 24, text: 'Window', thin: true },
    ],
  },
};
const ZONE_NAMES = Object.keys(ZONES);
export const findTable = (id) => { for (const z of ZONE_NAMES) { const tb = ZONES[z].tables.find((x) => x.id === id); if (tb) return { ...tb, zone: z }; } return null; };
const takenSet = (date, time) => {
  if (date == null || !time) return new Set();
  const k = (date * 3 + TIMES.indexOf(time) * 2 + 1) % 4;
  const s = new Set();
  ZONE_NAMES.forEach((z) => ZONES[z].tables.forEach((tb, i) => { if ((i + k) % 4 === 0) s.add(tb.id); }));
  return s;
};

export const COMFORT = ['Away from speakers', 'Near the exit', 'Step-free access', 'Softer lighting', 'Space for a stroller'];
const RULES = {
  'Away from speakers': [(tb) => !tb.speaker, 'close to the speaker'],
  'Near the exit': [(tb) => tb.exit, 'not near an exit'],
  'Step-free access': [(tb) => tb.stepFree, 'up a step'],
  'Softer lighting': [(tb) => !tb.sunny, 'in direct light'],
  'Space for a stroller': [(tb) => tb.space, 'tight for a stroller'],
};

export const emptyDraft = () => ({ guests: null, date: null, time: null, zone: 'Patio', table: null, comfort: [], note: '', name: 'Your name', phone: '(000) 000-0000', email: 'name@email.com', remind: true });

function useNudge() {
  const c = useAnimationControls();
  return [c, () => c.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.42 } })];
}

// ---------- Shared pieces ----------
const STEP_TITLES = ['When are you coming?', 'Where would you like to sit?', 'Is everything right?'];
function Progress({ step }) {
  return (
    <div style={{ padding: '4px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 26 }}>
        <div style={{ flex: '1 0 0', position: 'relative', height: 26 }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={step} className="abs nowrap" style={{ left: 0, top: 0, ...t(22, 600, NAVY, { lineHeight: '26px' }) }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>{STEP_TITLES[step - 1]}</motion.span>
          </AnimatePresence>
        </div>
        <span className="nowrap" style={t(13, 500)}>Step {step} of 3</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: '1 0 0', height: 6, borderRadius: 3, background: 'rgba(42,38,80,0.1)', overflow: 'hidden' }}>
            <motion.div initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={GENTLE} style={{ height: 6, borderRadius: 3, background: NAVY, transformOrigin: '0 50%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 1 · When ----------
function StepWhen({ draft, set, refs, ctl }) {
  const { guests, date, time } = draft;
  const slots = slotsFor(date, guests || 2);
  const strip = useRef(null);
  const [month, setMonth] = useState(MONTHS[0]);
  const [menu, setMenu] = useState(false);
  const changeGuests = (n) => {
    const s = slotsFor(date, n);
    const keep = time && s.find((x) => x.time === time)?.ok;
    set({ guests: n, time: keep ? time : null });
  };
  const pickDate = (i) => {
    const s = slotsFor(i, guests || 2);
    const keep = time && s.find((x) => x.time === time)?.ok;
    set({ date: i, time: keep ? time : null });
  };
  const onStrip = (e) => {
    const idx = Math.min(DATES.length - 1, Math.round(e.currentTarget.scrollLeft / 88));
    if (DATES[idx].month !== month) setMonth(DATES[idx].month);
  };
  const jumpMonth = (m) => {
    setMenu(false);
    const idx = DATES.findIndex((d) => d.month === m);
    strip.current?.scrollTo({ left: idx * 88, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '32px 24px 0', display: 'flex', flexDirection: 'column', gap: 44 }}>
      <motion.div ref={refs.guests} animate={ctl.guests}>
        <Section icon="user" title="Guests">
          <G r={30} style={{ padding: '8px 6px 8px 20px', display: 'flex', alignItems: 'center' }}>
            <span style={{ ...t(15, 500), flex: '1 0 0' }}>Party size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <CircleBtn label="Fewer guests" onClick={() => guests > 1 && changeGuests(guests - 1)}
                style={{ opacity: !guests || guests <= 1 ? 0.4 : 1, pointerEvents: !guests || guests <= 1 ? 'none' : 'auto' }}>
                <VIcon name="minus" size={20} />
              </CircleBtn>
              <div style={{ minWidth: 12, textAlign: 'center', overflow: 'hidden', height: 28, position: 'relative' }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={guests ?? 0} style={{ display: 'block', ...t(20, 600, guests ? NAVY : 'rgba(94,90,126,0.35)', { lineHeight: '28px' }) }}
                    initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={TAP}>{guests ?? 0}</motion.span>
                </AnimatePresence>
              </div>
              <motion.button aria-label="More guests" className="gl-solid" whileTap={{ scale: 0.9 }} transition={TAP}
                onClick={() => changeGuests(Math.min(12, (guests || 0) + 1))}
                style={{ width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0 }}>
                <VIcon name="plus20" size={20} />
              </motion.button>
            </div>
          </G>
          <AnimatePresence initial={false}>
            {guests >= 6 && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={GENTLE}
                style={{ ...t(13, 400), overflow: 'hidden', marginTop: -6, paddingLeft: 4 }}>
                Bigger tables are limited at busy times, so some times close up.
              </motion.p>
            )}
          </AnimatePresence>
        </Section>
      </motion.div>

      <motion.div ref={refs.date} animate={ctl.date}>
        <Section icon="cal" title="Date" note={
          <div style={{ position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.95 }} transition={TAP} onClick={() => setMenu((m) => !m)} className="gl-solid"
              style={{ height: 40, padding: '0 14px 0 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, border: 0 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={month} style={t(14, 500)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>{month}</motion.span>
              </AnimatePresence>
              <motion.span animate={{ rotate: menu ? 180 : 0 }} transition={GENTLE}><VIcon name="caretDown" size={14} /></motion.span>
            </motion.button>
            <AnimatePresence>
              {menu && (
                <motion.div className="gl-solid" initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.18 }}
                  style={{ position: 'absolute', right: 0, top: 46, width: 150, borderRadius: 20, padding: 6, zIndex: 10, transformOrigin: '100% 0' }}>
                  {MONTHS.map((m) => (
                    <button key={m} onClick={() => jumpMonth(m)} style={{ width: '100%', height: 36, borderRadius: 14, padding: '0 12px', textAlign: 'left', background: m === month ? 'rgba(94,90,126,0.1)' : 'transparent' }}>
                      <span style={t(14, m === month ? 600 : 500)}>{m}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }>
          <div ref={strip} className="hscroll" onScroll={onStrip} style={{ margin: '-6px -24px -40px', padding: '6px 24px 40px', display: 'flex', gap: 12 }}>
            {DATES.map((x) => {
              const on = date === x.i;
              return (
                <G key={x.i} as="button" r={24} on={on} onClick={() => pickDate(x.i)} whileTap={{ scale: 0.94 }} transition={TAP}
                  style={{ width: 76, height: 88, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, ...(on ? { border: 0, background: 'rgba(255,255,255,0.85)' } : null) }}>
                  <span style={t(13, on ? 600 : 400)}>{x.label}</span>
                  <span style={t(24, 600, NAVY, { lineHeight: '29px' })}>{x.num}</span>
                </G>
              );
            })}
          </div>
        </Section>
      </motion.div>

      <motion.div ref={refs.time} animate={ctl.time}>
        <Section icon="clock" title="Time" note={date == null ? 'Pick a date first' : undefined}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 122px)', columnGap: 12, rowGap: 14, justifyContent: 'space-between' }}>
            {slots.map((s, i) => {
              const on = time === s.time && s.ok;
              return (
                <G key={s.time} as="button" r={22} on={on} disabled={!s.ok} aria-disabled={!s.ok}
                  onClick={() => s.ok && set({ time: s.time })} whileTap={s.ok ? { scale: 0.95 } : undefined}
                  initial={false} animate={{ opacity: s.ok ? 1 : 0.45 }} transition={{ duration: 0.25, delay: date == null ? 0 : i * 0.03 }}
                  style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: s.ok ? 'pointer' : 'default', ...(on ? { border: 0 } : null) }}>
                  <span style={t(15, 600)}>{s.time}</span>
                </G>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {date != null && slots.some((s) => !s.ok) && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={GENTLE}
                style={{ ...t(13, 400), overflow: 'hidden', marginTop: -4 }}>
                Faded times are full or after closing.
              </motion.p>
            )}
          </AnimatePresence>
        </Section>
      </motion.div>
    </div>
  );
}

// ---------- Step 2 · Where to sit ----------
function Table({ tb, state, onClick }) {
  // state: free | taken | mine | small
  const taken = state === 'taken', mine = state === 'mine', small = state === 'small';
  const W = tb.w + 28, Hh = tb.h + 28;
  const chairs = (n, y) => Array.from({ length: n }, (_, j) => {
    const cx = 14 + (tb.w * (2 * j + 1)) / (2 * n);
    return (
      <motion.div key={`${y}-${j}`} className="abs" initial={false}
        animate={{ backgroundColor: mine ? NAVY : taken ? 'rgba(0,0,0,0)' : 'rgba(42,38,80,0.28)' }} transition={{ duration: 0.25 }}
        style={{ left: cx - 11, top: y, width: 22, height: 10, borderRadius: 5, border: taken ? '1.2px dashed rgba(42,38,80,0.22)' : '0px solid transparent' }} />
    );
  });
  return (
    <motion.button className="abs" onClick={onClick} aria-label={`Table ${tb.id}${taken ? ', taken' : ''}`}
      whileTap={!taken ? { scale: 0.94 } : undefined} transition={TAP}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: small ? 0.4 : 1, scale: 1 }}
      style={{ left: tb.x, top: tb.y, width: W, height: Hh, cursor: taken ? 'default' : 'pointer' }}>
      {chairs(tb.top, 0)}
      {chairs(tb.bottom, Hh - 10)}
      <motion.div className="abs" initial={false}
        animate={{ backgroundColor: mine ? 'rgba(255,255,255,0.95)' : taken ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.8)', scale: mine ? 1.04 : 1 }}
        transition={GENTLE}
        style={{ left: 14, top: 14, width: tb.w, height: tb.h, borderRadius: tb.bar ? 22 : 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: mine ? `2px solid ${NAVY}` : taken ? '1.5px dashed rgba(42,38,80,0.25)' : '1px solid #fff',
          boxShadow: mine ? '0 6px 16px rgba(42,38,80,0.14)' : 'none' }}>
        <span style={t(15, mine ? 600 : 500, taken ? 'rgba(94,90,126,0.55)' : NAVY, { lineHeight: '18px' })}>{tb.id}</span>
        {taken && <span style={t(11, 500, 'rgba(94,90,126,0.6)', { lineHeight: '13px' })}>Taken</span>}
      </motion.div>
    </motion.button>
  );
}

function Mark({ m, onGo }) {
  if (m.kind === 'tag') {
    return (
      <motion.button className="abs nowrap" onClick={() => onGo(m.go)} whileTap={{ scale: 0.95 }}
        style={{ left: m.x, top: m.y, height: 26, padding: '0 12px', borderRadius: 14, background: 'rgba(255,255,255,0.85)', ...t(12, 500) }}>{m.text}</motion.button>
    );
  }
  if (m.kind === 'icon') {
    return (
      <div className="abs" style={{ left: m.x, top: m.y, width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <VIcon name={m.icon} size={m.icon === 'arrowUpRight' ? 22 : 26} />
        </div>
        <span className="nowrap" style={t(12, 500)}>{m.label}</span>
      </div>
    );
  }
  if (m.kind === 'pond') {
    return (
      <div className="abs" style={{ left: m.x, top: m.y, width: m.w, height: m.h, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.7), rgba(94,90,126,0.1))', border: '1.5px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={t(13, 500)}>Garden pond</span>
      </div>
    );
  }
  if (m.kind === 'note') return <span className="abs nowrap" style={{ left: m.x, top: m.y, ...t(12, 400) }}>{m.text}</span>;
  return (
    <div className="abs" style={{ left: m.x, top: m.y, width: m.w, height: m.h, borderRadius: m.thin ? 8 : 14, background: 'rgba(94,90,126,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={t(m.thin ? 11 : 13, 500)}>{m.text}</span>
    </div>
  );
}

function StepWhere({ draft, set, refs, ctl, goStep }) {
  const { guests, date, time, zone, table, comfort } = draft;
  const taken = takenSet(date, time);
  const [hint, setHint] = useState(null);
  const sel = table ? findTable(table) : null;
  const stateOf = (tb) => (taken.has(tb.id) ? 'taken' : tb.id === table ? 'mine' : tb.cap < guests ? 'small' : 'free');
  const fits = (tb) => !taken.has(tb.id) && tb.cap >= guests && comfort.every((c) => !RULES[c] || RULES[c][0](tb));
  const tap = (tb) => {
    const st = stateOf(tb);
    if (st === 'taken') { setHint(`Table ${tb.id} is taken at ${time}.`); return; }
    if (st === 'small') { setHint(`Table ${tb.id} seats ${tb.cap}. Pick a table for ${guests}.`); return; }
    setHint(null); set({ table: tb.id === table ? null : tb.id });
  };
  const misses = sel ? comfort.filter((c) => RULES[c] && !RULES[c][0](sel)) : [];
  const better = sel && misses.length ? ZONE_NAMES.flatMap((z) => ZONES[z].tables.map((tb) => ({ ...tb, zone: z }))).find(fits) : null;
  const zoneFree = ZONES[zone].tables.filter((tb) => !taken.has(tb.id) && tb.cap >= guests).length;
  const d = DATES[date];

  return (
    <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <G as="button" r={20} onClick={() => goStep(1)} whileTap={{ scale: 0.96 }} transition={TAP}
        style={{ alignSelf: 'flex-start', height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="nowrap" style={t(14, 500)}>{guests} {guests === 1 ? 'guest' : 'guests'} · {d.short} · {time}</span>
      </G>

      <div className="hscroll" style={{ margin: '-6px -24px -40px', padding: '6px 24px 40px', display: 'flex', gap: 8 }}>
        {ZONE_NAMES.map((z) => <Chip key={z} label={z} on={zone === z} onClick={() => { set({ zone: z }); setHint(null); }} />)}
      </div>

      <motion.div ref={refs.table} animate={ctl.table}>
        <G r={32} style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={zone} className="abs" style={{ inset: 0 }} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              {ZONES[zone].marks.map((m, i) => <Mark key={i} m={m} onGo={(z) => { set({ zone: z }); setHint(null); }} />)}
              {ZONES[zone].tables.map((tb) => <Table key={tb.id} tb={tb} state={stateOf(tb)} onClick={() => tap(tb)} />)}
            </motion.div>
          </AnimatePresence>
        </G>
      </motion.div>

      <div style={{ display: 'flex', gap: 20, marginTop: -8 }}>
        {[['Available', { background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(42,38,80,0.12)' }], ['Your table', { background: '#fff', border: `1.5px solid ${NAVY}` }], ['Taken', { border: '1.5px dashed rgba(42,38,80,0.3)' }]].map(([l, st]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 5, ...st }} />
            <span style={t(13, 400)}>{l}</span>
          </div>
        ))}
      </div>

      <G r={28} layout transition={GENTLE} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, marginTop: -8 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {sel ? (
            <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <VIcon name="chair" size={24} />
                <span style={{ ...t(17, 600), flex: '1 0 0' }}>Table {sel.id} · {sel.zone}</span>
                <span style={t(13, 500)}>Up to {sel.cap}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{sel.tags.map((x) => <Pill key={x}>{x}</Pill>)}</div>
              {misses.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={t(13, 400)}>This table is {misses.map((c) => RULES[c][1]).join(' and ')}.</span>
                  {better && (
                    <motion.button className="gl-solid" whileTap={{ scale: 0.95 }} onClick={() => set({ zone: better.zone, table: better.id })}
                      style={{ height: 30, padding: '0 12px', borderRadius: 15, border: 0, ...t(13, 600) }}>Try table {better.id}</motion.button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <VIcon name="chair" size={24} />
              <span style={t(15, 500)}>{zoneFree ? `Tap a table to see what it's like` : `No free tables for ${guests} here. Try another area.`}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {hint && (
            <motion.p key={hint} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={GENTLE}
              style={{ ...t(13, 400), overflow: 'hidden' }}>{hint}</motion.p>
          )}
        </AnimatePresence>
      </G>

      <Section title="Make it comfortable" note="Optional · pick any" gap={14}>
        <ChipGroup options={COMFORT} value={comfort} onChange={(v) => set({ comfort: v })} />
      </Section>
    </div>
  );
}

// ---------- Step 3 · Booking for ----------
function EditRow({ icon, label, value, onSave, type = 'text' }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(value);
  const ref = useRef(null);
  useEffect(() => { if (edit) { ref.current?.focus(); ref.current?.select(); } }, [edit]);
  const save = () => { setEdit(false); onSave(v.trim() || value); };
  return (
    <div style={{ width: '100%', height: 60, padding: '0 12px 0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <VIcon name={icon} />
      <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={t(12, 400)}>{label}</span>
        {edit ? (
          <input ref={ref} type={type} value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()}
            style={{ all: 'unset', ...t(15, 500), borderBottom: `1.5px solid ${NAVY}`, paddingBottom: 1 }} />
        ) : <span style={t(15, 500)}>{value}</span>}
      </div>
      <motion.button aria-label={`Edit ${label.toLowerCase()}`} whileTap={{ scale: 0.88 }} onMouseDown={(e) => edit && e.preventDefault()} onClick={() => (edit ? save() : setEdit(true))}
        style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: edit ? 'rgba(255,255,255,0.9)' : 'transparent' }}>
        {edit ? <VIcon name="check" size={18} /> : <VIcon name="pencil" size={18} />}
      </motion.button>
    </div>
  );
}

function Switch({ on, onChange }) {
  return (
    <motion.button role="switch" aria-checked={on} onClick={() => onChange(!on)} initial={false}
      animate={{ backgroundColor: on ? NAVY : 'rgba(94,90,126,0.22)' }} transition={{ duration: 0.2 }}
      style={{ width: 52, height: 32, borderRadius: 16, padding: 3, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', flex: 'none' }}>
      <motion.div layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} style={{ width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: '0 2px 6px rgba(42,38,80,0.2)' }} />
    </motion.button>
  );
}

function StepFor({ draft, set, goStep, existing, onCancelBooking }) {
  const d = DATES[draft.date];
  const tb = findTable(draft.table);
  const tableText = [`Table ${tb.id}`, tb.zone, ...draft.comfort].join(' · ');
  return (
    <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Section title="Your booking" gap={12} note={
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => goStep(1)} style={{ height: 44, padding: '0 4px 0 8px', ...t(14, 500) }}>Edit</motion.button>
      }>
        <InfoList rows={[
          { icon: 'cal', label: 'When', text: `${d.long} · ${draft.time}`, onClick: () => goStep(1) },
          { iconNode: <Icon d={paths.users} size={24} fill={NAVY} />, label: 'Guests', text: `${draft.guests} ${draft.guests === 1 ? 'guest' : 'guests'}`, onClick: () => goStep(1) },
          { icon: 'chair', iconSize: 24, label: 'Table', text: tableText, onClick: () => goStep(2) },
        ]} />
      </Section>

      <Section title="Booking for" note="From your profile" gap={12}>
        <G r={28} style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EditRow icon="user" label="Name" value={draft.name} onSave={(v) => set({ name: v })} />
          <div style={{ width: 352, height: 1, background: DIV }} />
          <EditRow icon="phone" label="Phone" type="tel" value={draft.phone} onSave={(v) => set({ phone: v })} />
          <div style={{ width: 352, height: 1, background: DIV }} />
          <EditRow icon="mail" label="Email" type="email" value={draft.email} onSave={(v) => set({ email: v })} />
        </G>
        <p style={t(13, 400)}>Not you, or booking for someone else? Tap a detail to change it.</p>
      </Section>

      <G r={32} style={{ padding: '12px 12px 12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <VIcon name="bell" />
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={t(16, 500)}>Text me a reminder</span>
          <span style={t(13, 400)}>One hour before, with the live crowd level</span>
        </div>
        <Switch on={draft.remind} onChange={(v) => set({ remind: v })} />
      </G>

      <Section title="Anything else?" note="Optional" gap={12}>
        <G r={28} style={{ height: 96, padding: '18px 20px' }}>
          <textarea className="field" rows={3} maxLength={200} value={draft.note} onChange={(e) => set({ note: e.target.value })}
            placeholder="Birthday, allergies, a quiet place to sit with a little one…" style={{ height: '100%', resize: 'none', color: NAVY }} />
        </G>
      </Section>

      <p style={t(13, 400)}>Free to cancel up to 2 hours before. Foxy Loxy holds tables for 15 minutes.</p>
      {existing && (
        <motion.button whileTap={{ scale: 0.96 }} onClick={onCancelBooking} style={{ ...t(15, 500, '#b4413c'), alignSelf: 'center', height: 32, marginTop: -12 }}>
          Cancel booking
        </motion.button>
      )}
    </div>
  );
}

// ---------- The flow ----------
export default function BookTable({ draft, setDraft, step, setStep, onClose, onBooked, existing, onCancelBooking }) {
  const [scrolled, setScrolled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dir, setDir] = useState(1);
  const scroller = useRef(null);
  const refs = { guests: useRef(null), date: useRef(null), time: useRef(null), table: useRef(null) };
  const [gC, nG] = useNudge(); const [dC, nD] = useNudge(); const [tC, nT] = useNudge(); const [tbC, nTb] = useNudge();
  const ctl = { guests: gC, date: dC, time: tC, table: tbC };
  const set = (patch) => setDraft((d) => {
    const next = { ...d, ...patch };
    // a table that is now taken or too small no longer counts
    if (next.table) {
      const tb = findTable(next.table);
      if (!tb || takenSet(next.date, next.time).has(tb.id) || tb.cap < (next.guests || 0)) next.table = null;
    }
    return next;
  });

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); setScrolled(false); };
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [step]);

  const ok1 = draft.guests && draft.date != null && draft.time;
  const ok2 = ok1 && draft.table;
  const blocked = () => {
    const miss = step === 1 ? (!draft.guests ? ['guests', nG] : draft.date == null ? ['date', nD] : ['time', nT]) : ['table', nTb];
    const el = refs[miss[0]].current, sc = scroller.current;
    if (el && sc) sc.scrollTo({ top: Math.max(0, el.offsetTop - 180), behavior: 'smooth' });
    setTimeout(miss[1], 260);
  };
  const confirm = () => {
    setBusy(true);
    const d = DATES[draft.date];
    const tb = findTable(draft.table);
    setTimeout(() => {
      setBusy(false);
      onBooked({ ...draft, zone: tb.zone, crowd: slotsFor(draft.date, draft.guests).find((s) => s.time === draft.time)?.crowd, dayShort: d.short, dayLong: d.long });
    }, 900);
  };

  const cta = step === 1 ? { label: 'Next · Where to sit', ok: ok1, go: () => go(2) }
    : step === 2 ? { label: 'Next · Booking for', ok: ok2, go: () => go(3) }
    : { label: existing ? 'Update booking' : 'Confirm booking', ok: ok2, go: confirm };

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Book a table" back={step > 1} onClose={() => (step > 1 ? go(step - 1) : onClose())} scrolled={false} />
      <div className="abs" style={{ left: 0, top: 108, width: 440, zIndex: 19, pointerEvents: 'none' }}>
        <motion.div className="abs" style={{ inset: '-108px 0 -10px', background: 'rgba(247,245,241,0.82)', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${DIV}` }}
          initial={false} animate={{ opacity: scrolled ? 1 : 0 }} transition={{ duration: 0.2 }} />
        <div style={{ position: 'relative' }}><Progress step={step} /></div>
      </div>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div key={step} ref={scroller} className="scroll" custom={dir}
          variants={{ enter: (d) => ({ x: d * 120, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d * -120, opacity: 0 }) }}
          initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
          <div style={{ paddingTop: 158, paddingBottom: 140 }}>
            {step === 1 && <StepWhen draft={draft} set={set} refs={refs} ctl={ctl} />}
            {step === 2 && ok1 && <StepWhere draft={draft} set={set} refs={refs} ctl={ctl} goStep={go} />}
            {step === 3 && ok2 && <StepFor draft={draft} set={set} goStep={go} existing={existing} onCancelBooking={onCancelBooking} />}
          </div>
        </motion.div>
      </AnimatePresence>
      <PrimaryCTA label={cta.label} enabled={!!cta.ok} onClick={cta.go} onBlocked={blocked} busy={busy ? 'Booking…' : null} />
    </div>
  );
}

// ---------- Booking confirmed ----------
const mins = (s) => { const [hm, ap] = s.split(' '); let [h, m] = hm.split(':').map(Number); if (ap === 'PM' && h !== 12) h += 12; return h * 60 + m; };
const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

export function BookingConfirmed({ booking, onClose, onChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [added, setAdded] = useState(false);
  const b = booking;
  const tableText = [`Table ${b.table}`, b.zone, ...b.comfort].join(' · ');
  const rise = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { ...GENTLE, delay: 0.25 + i * 0.07 } });

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Booking confirmed" onClose={onClose} scrolled={scrolled} right={<CircleBtn icon="export" label="Share booking" />} />
      <div className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '128px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 0 8px' }}>
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <motion.div className="abs" style={{ inset: 0, borderRadius: 44, border: `2px solid ${NAVY}` }}
                initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }} />
              <motion.div className="abs" style={{ inset: 0, borderRadius: 44, background: 'rgba(255,255,255,0.92)', boxShadow: '0 14px 36px rgba(42,38,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.3 }}>
                  <VIcon name="check" size={40} />
                </motion.span>
              </motion.div>
            </div>
            <motion.h2 {...rise(0)} style={t(28, 600, NAVY, { letterSpacing: -0.4 })}>You're booked</motion.h2>
            <motion.p {...rise(1)} style={t(15, 400)}>We sent the details to {b.phone}</motion.p>
          </div>

          <motion.div {...rise(2)}>
            <InfoList rows={[
              { icon: 'storefront', text: tableText },
              { icon: 'mapPin', text: VENUE.address },
              { icon: 'clock', text: `${b.dayLong} · ${b.time} · ${b.guests} ${b.guests === 1 ? 'guest' : 'guests'}` },
              { icon: 'phone', text: VENUE.phone },
            ]} />
          </motion.div>

          <motion.p {...rise(3)} style={t(13, 400)}>
            Held Until · {fmt(mins(b.time) + 15)}
          </motion.p>

          <motion.div {...rise(4)} style={{ display: 'flex', gap: 12 }}>
            <G as="button" r={26} on={added} onClick={() => setAdded(true)} whileTap={{ scale: 0.96 }} transition={TAP}
              style={{ flex: '1 0 0', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={added ? 'y' : 'n'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={TAP} style={{ display: 'flex' }}>
                  <VIcon name={added ? 'check' : 'cal'} size={20} />
                </motion.span>
              </AnimatePresence>
              <span style={t(15, 600)}>{added ? 'Added' : 'Add to calendar'}</span>
            </G>
            <G as="button" r={26} whileTap={{ scale: 0.96 }} transition={TAP}
              style={{ flex: '1 0 0', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <VIcon name="nav" size={20} />
              <span style={t(15, 600)}>Directions</span>
            </G>
          </motion.div>

          <motion.button {...rise(5)} whileTap={{ scale: 0.96 }} onClick={onChange} style={{ ...t(15, 500), alignSelf: 'center', height: 44 }}>
            Change or cancel booking
          </motion.button>

          <motion.div {...rise(6)}>
            <PrimaryCTA inline label="Done" onClick={onClose} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

