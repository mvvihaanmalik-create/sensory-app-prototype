// Sense reviews (Figma 887:342 Sound, 887:657 Light, 887:768 Crowd, 887:884 Seating, 934:2 Temperature)
// One screen with a category bar. Switching senses cross-fades the content; the star goes back to all reviews.
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GENTLE } from './ui.jsx';
import { VIcon } from './venueIcons.jsx';
import { G, TopBar, PrimaryCTA, DayChart, weekFrom, SENSES, NAVY, DIV, TAP, t } from './flow.jsx';
import { CROWD_SUN, crowdWord } from './Venue.jsx';
import { REVIEW_PICS } from './venuePhotos.js';

const ICON = Object.fromEntries(SENSES.map((s) => [s.k, s.icon]));

export const SENSE_DATA = {
  sound: {
    title: 'Sound', top: 'Lively',
    dist: [['Quiet', 8], ['Easy to talk', 31], ['Lively', 52], ['Loud', 9]],
    summary: 'Lively at brunch and on weekends. Easier to talk on weekday afternoons and out on the patio.',
    note: 'Summarized by AI from reviews that mention sound',
    chart: {
      title: 'Noise', sun: [11, 28, 52, 75, 85, 71, 47, 38, 42, 47, 56, 66, 80, 89, 85, 66, 47, 33], live: 'Live · Louder than usual',
      describe: (v) => (v < 30 ? 'Quiet' : v < 55 ? 'Easy to talk' : v < 80 ? 'Lively' : 'Loud'),
      info: 'Tap a bar for details',
    },
    photos: [
      [[240, 'Lively', 'Buzzy inside, calm out back by the pond.', 'Local guide · 1 wk ago', 7], [180, 'Loud', 'Weekend brunch was loud — patio was perfect.', 'First visit · 3 wks ago', 21], [210, 'Easy to talk', 'Easy to chat over coffee in the afternoon.', 'Visitor · 1 mo ago', 30]],
      [[180, 'Easy to talk', 'Music on, but we could still talk easily.', 'Weekend regular · 2 wks ago', 14], [250, 'Lively', 'Acoustic night, cozy and not too loud.', 'Student · 1 mo ago', 31], [170, 'Lively', 'Lots of chatter at the counter at 10am.', 'Neighbor · 2 mo ago', 60]],
    ],
  },
  light: {
    title: 'Light', top: 'Natural light',
    dist: [['Dim', 4], ['Warm & cozy', 28], ['Natural light', 61], ['Bright', 7]],
    summary: 'Big windows bring in lots of daylight. Evenings feel warm and cozy with string lights out back.',
    note: 'Summarized by AI from reviews that mention light',
    photos: [
      [[240, 'Natural light', 'So much daylight by the front windows.', 'Local guide · 1 wk ago', 7], [180, 'Natural light', 'Perfect light for reading in the morning.', 'First visit · 3 wks ago', 21], [210, 'Bright', 'Sunny garden tables around noon.', 'Visitor · 1 mo ago', 30]],
      [[180, 'Warm & cozy', 'String lights on the patio at dusk.', 'Weekend regular · 2 wks ago', 14], [250, 'Warm & cozy', 'Warm lamps inside once the sun sets.', 'Student · 1 mo ago', 31], [170, 'Warm & cozy', 'Soft light in the back room.', 'Neighbor · 2 mo ago', 60]],
    ],
  },
  crowd: {
    title: 'Crowd', top: 'Busy',
    dist: [['Almost empty', 3], ['Relaxed', 18], ['Buzzing', 27], ['Busy', 38], ['Packed', 14]],
    summary: 'Busy on weekend mornings, with a line at the counter. Calmer after 2 PM on weekdays.',
    note: 'Summarized by AI from reviews that mention crowd',
    chart: { title: 'Crowd', sun: CROWD_SUN, live: 'Live · Busier than usual', describe: crowdWord, info: 'Tap a bar for details' },
    photos: [
      [[240, 'Packed', 'Line out the door Saturday at 10.', 'Local guide · 1 wk ago', 7], [180, 'Busy', 'Packed for brunch, worth the wait.', 'First visit · 3 wks ago', 21], [210, 'Buzzing', 'Buzzing but we grabbed a patio spot.', 'Visitor · 1 mo ago', 30]],
      [[180, 'Relaxed', 'Found a table easily on a Tuesday.', 'Weekend regular · 2 wks ago', 14], [250, 'Relaxed', 'Relaxed afternoon, plenty of seats.', 'Student · 1 mo ago', 31], [170, 'Almost empty', 'Quiet first thing at 8am.', 'Neighbor · 2 mo ago', 60]],
    ],
  },
  temp: {
    title: 'Temperature', top: 'Mild',
    dist: [['Cool', 38], ['Mild', 47], ['Warm', 15]],
    summary: 'AC keeps it cool inside, especially near the counter. The patio gets warm on sunny afternoons; shaded garden tables stay mild.',
    note: 'Summarized by AI from reviews that mention temperature or AC',
    chart: {
      title: 'Temperature', sun: [28, 30, 36, 42, 52, 61, 71, 80, 86, 89, 85, 75, 61, 52, 45, 39, 36, 33], live: 'Indoors · AC on · Patio warming up',
      describe: (v) => (v < 45 ? 'Cool' : v < 75 ? 'Mild' : 'Warm'),
      info: 'Inside stays cool all day with AC. Bars show how warm the patio feels.',
      foot: 'Inside stays cool all day with AC. Bars show how warm the patio feels.',
    },
    photos: [
      [[240, 'Cool', 'AC is strong inside, bring a layer.', 'Local guide · 1 wk ago', 7], [180, 'Warm', 'Warm out back around 3pm.', 'First visit · 3 wks ago', 21], [210, 'Mild', 'Mild evening under the string lights.', 'Visitor · 1 mo ago', 30]],
      [[180, 'Mild', 'Patio was perfect in the shade.', 'Weekend regular · 2 wks ago', 14], [250, 'Cool', 'Cool and comfy by the window.', 'Student · 1 mo ago', 31], [170, 'Cool', 'Chilly near the counter vent.', 'Neighbor · 2 mo ago', 60]],
    ],
  },
  seating: {
    title: 'Seating', top: 'Patio', multi: true,
    dist: [['Patio', 64], ['Tables', 48], ['Sofas', 22], ['Bar seats', 15]],
    summary: 'The back patio and garden are the favorite spots. Indoor tables fill up fast at brunch.',
    note: 'Summarized by AI from reviews that mention seating',
    photos: [
      [[240, 'Patio', 'Garden pond seats are the best in town.', 'Local guide · 1 wk ago', 7], [180, 'Patio', 'Shaded patio table for four.', 'First visit · 3 wks ago', 21], [210, 'Bar seats', 'Bar seats by the window, nice for one.', 'Visitor · 1 mo ago', 30]],
      [[180, 'Sofas', 'Comfy sofa by the art wall.', 'Weekend regular · 2 wks ago', 14], [250, 'Tables', 'Small indoor tables, a bit tight.', 'Student · 1 mo ago', 31], [170, 'Patio', 'Big communal table out back.', 'Neighbor · 2 mo ago', 60]],
    ],
  },
};

// Glass / Category bar: star (all reviews) + the five senses. The selected item grows to show its label.
function CategoryBar({ value, onPick, onAll }) {
  const items = [{ k: 'all', label: 'All', icon: <VIcon name="star24" size={24} /> }, ...SENSES];
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <G r={32} style={{ padding: 7, display: 'flex', alignItems: 'center', gap: 2, height: 77 }}>
        {items.map((s) => {
          const on = value === s.k;
          return (
            <motion.button key={s.k} layout aria-label={s.label} onClick={() => (s.k === 'all' ? onAll() : onPick(s.k))}
              whileTap={{ scale: 0.92 }} transition={{ layout: GENTLE, default: TAP }}
              style={{ position: 'relative', height: on ? 60 : 48, minWidth: 48, padding: on ? '10px 14px 8px' : 12, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {on && <motion.div layoutId="sense-pill" transition={GENTLE} style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />}
              <motion.span layout="position" style={{ position: 'relative', display: 'flex' }}>{s.icon}</motion.span>
              {on && (
                <motion.span layout="position" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.08 }}
                  className="nowrap" style={{ position: 'relative', ...t(12, 600) }}>{s.short || s.label}</motion.span>
              )}
            </motion.button>
          );
        })}
      </G>
    </div>
  );
}

// "Most say" card. Tapping a row filters the photo reviews below to that answer.
function MostSay({ sense, d, filter, setFilter }) {
  const max = Math.max(...d.dist.map(([, v]) => v));
  return (
    <G r={28} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
        {ICON[sense]}
        <span style={{ ...t(17, 600), flex: '1 0 0' }}>Most say</span>
        <span className="nowrap" style={{ height: 36, padding: '0 16px', borderRadius: 18, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', ...t(14, 600) }}>{d.top}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {d.dist.map(([label, pct], i) => {
          const top = pct === max;
          const on = filter === label;
          return (
            <motion.button key={label} onClick={() => setFilter(on ? null : label)} whileTap={{ scale: 0.98 }}
              style={{ height: 24, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, margin: '0 -6px', padding: '0 6px', background: on ? 'rgba(255,255,255,0.85)' : 'transparent', transition: 'background .2s' }}>
              <span className="nowrap" style={{ width: 96, textAlign: 'left', ...t(13, top || on ? 600 : 400) }}>{label}</span>
              <div style={{ flex: '1 0 0', height: 8, borderRadius: 4, background: 'rgba(94,90,126,0.08)', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%`, backgroundColor: top || on ? NAVY : 'rgba(42,38,80,0.3)' }}
                  transition={{ ...GENTLE, delay: 0.05 * i }} style={{ height: 8, borderRadius: 4 }} />
              </div>
              <span style={{ width: 36, textAlign: 'right', ...t(13, 500) }}>{pct}%</span>
            </motion.button>
          );
        })}
      </div>
      <p style={t(15, 400, NAVY, { lineHeight: 1.4 })}>{d.summary}</p>
      <span style={t(12, 400)}>{d.note}</span>
    </G>
  );
}

function PhotoReview({ p }) {
  const [h, tag, text, meta] = p;
  const pic = REVIEW_PICS[[...text].reduce((a, c) => a + c.charCodeAt(0), 0) % REVIEW_PICS.length];
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={GENTLE}>
      <G r={24} whileTap={{ scale: 0.98 }} style={{ padding: '6px 6px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative', height: h, borderRadius: 18, background: `#dbdbde url(${pic}) center / cover` }}>
          <span className="abs nowrap" style={{ left: 8, bottom: 10, height: 24, padding: '0 10px', borderRadius: 13, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', ...t(12, 600) }}>{tag}</span>
        </div>
        <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={t(13, 500, NAVY, { lineHeight: 1.25 })}>{text}</span>
          <span style={t(11, 400)}>{meta}</span>
        </div>
      </G>
    </motion.div>
  );
}

const EXTRA_META = ['Neighbor · 2 mo ago', 'Visitor · 1 mo ago', 'Weekend regular · 2 wks ago', 'Student · 1 mo ago'];

function SenseBody({ sense }) {
  const d = SENSE_DATA[sense];
  const [filter, setFilter] = useState(null);
  const [newest, setNewest] = useState(true);
  const [more, setMore] = useState(false);
  let all = [...d.photos[0].map((p, i) => [...p, 0, i]), ...d.photos[1].map((p, i) => [...p, 1, i])];
  if (more) all = all.concat(d.photos[0].concat(d.photos[1]).slice(0, 4).map((p, i) => [p[0] - 20, p[1], p[2], EXTRA_META[i], 70 + i * 20, i % 2, 3 + i]));
  let list = filter ? all.filter((p) => p[1] === filter) : all;
  list = [...list].sort((a, b) => (newest ? a[4] - b[4] : b[4] - a[4]));
  // Masonry: drop each card into the shorter column
  let cols = [[], []]; const hgt = [0, 0];
  if (!filter && newest && !more) cols = [all.filter((p) => p[5] === 0), all.filter((p) => p[5] === 1)]; // Figma arrangement
  else list.forEach((p) => { const c = hgt[0] <= hgt[1] ? 0 : 1; cols[c].push(p); hgt[c] += p[0] + 90; });
  const c = d.chart;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <MostSay sense={sense} d={d} filter={filter} setFilter={setFilter} />
      {c && (
        <DayChart icon={ICON[sense]} title={c.title} week={weekFrom(c.sun)} liveText={c.live} describe={c.describe} info={c.info} />
      )}
      {c?.foot && <p style={{ ...t(13, 400, NAVY, { lineHeight: 1.3 }), marginTop: -8 }}>{c.foot}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 24 }}>
        <span style={{ ...t(20, 600), flex: '1 0 0' }}>Photos & reviews</span>
        <AnimatePresence initial={false}>
          {filter && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={TAP}
              onClick={() => setFilter(null)} className="gl-solid"
              style={{ height: 28, padding: '0 8px 0 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="nowrap" style={t(12, 600)}>{filter}</span><VIcon name="x14" />
            </motion.button>
          )}
        </AnimatePresence>
        <button onClick={() => setNewest((n) => !n)} style={{ height: 32 }}>
          <span className="nowrap" style={t(14, 500)}>{newest ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: -4 }}>
        {cols.map((col, ci) => (
          <motion.div key={ci} layout style={{ width: 188, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {col.map((p) => <PhotoReview key={`${p[5]}-${p[6]}-${p[3]}`} p={p} />)}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <G as="button" r={26} onClick={() => setMore(true)} whileTap={!more ? { scale: 0.98 } : undefined} transition={TAP}
        style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: more ? 0.5 : 1, cursor: more ? 'default' : 'pointer' }}>
        <span style={t(15, 600)}>{`See more ${d.title.toLowerCase()} photos`}</span>
      </G>
    </div>
  );
}

export default function SenseReviews({ sense, setSense, onBack, onAll, onReserve, booking }) {
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef(null);
  const pick = (k) => { setSense(k); scroller.current?.scrollTo({ top: 0 }); };
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Reviews" back onClose={onBack} scrolled={scrolled} />
      <div ref={scroller} className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '124px 24px 140px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <CategoryBar value={sense} onPick={pick} onAll={onAll} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={sense} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SenseBody sense={sense} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <PrimaryCTA icon="calendarCheck" onClick={onReserve} label={booking ? `Booked · ${booking.dayShort}, ${booking.time}` : 'Reserve'} />
    </div>
  );
}
