// Sense reviews (Figma 887:342 Sound, 887:657 Light, 887:768 Crowd, 887:884 Seating, 934:2 Temperature)
// One screen with a category bar. Switching senses cross-fades the content; the star goes back to all reviews.
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GENTLE } from './ui.jsx';
import { VIcon } from './venueIcons.jsx';
import { G, TopBar, PrimaryCTA, RESERVE_TOP, DayChart, weekFrom, SENSES, NAVY, DIV, TAP, t } from './flow.jsx';
import { CROWD_SUN, crowdWord } from './Venue.jsx';
import { REVIEW_PICS } from './venuePhotos.js';
import { PHOTO } from './remainingPhotos.js';
import { PHOTO_GRID, GRID_CROPS, photoBackground } from './venueFinalPhotos.js';
import Lightbox, { useLightbox } from './Lightbox.jsx';
import { InfoShareHost } from './InfoShare.jsx';

const ICON = Object.fromEntries(SENSES.map((s) => [s.k, s.icon]));

export const SENSE_DATA = {
  sound: {
    title: 'Sound', top: 'Lively',
    dist: [['Quiet', 8], ['Easy to talk', 31], ['Lively', 52], ['Loud', 9]],
    summary: 'The counter gets lively when the grinder is running. It’s easier to talk at the window tables.',
    note: 'Summarized by AI from reviews that mention sound',
    chart: {
      title: 'Sound', sun: [11, 28, 52, 75, 85, 71, 47, 38, 42, 47, 56, 66, 80, 89, 85, 66, 47, 33], live: 'Live · Louder than usual',
      describe: (v) => (v < 30 ? 'Quiet' : v < 55 ? 'Easy to talk' : v < 80 ? 'Lively' : 'Loud'),
      info: 'Tap a bar for details',
    },
    photos: [[232, 'Lively', 'The espresso machine and chatter made the counter area lively.', 'Daniel Brooks', '1 wk ago', 42, 7, 0], [310, 'Loud', 'The grinder drowned us out for a moment while we waited at the counter.', 'Alex Kim', '2 wks ago', 19, 14, 1], [232, 'Easy to talk', 'We could talk at the window table without raising our voices.', 'Maya Chen', '3 wks ago', 24, 21, 0]],
  },
  light: {
    title: 'Light', top: 'Natural light',
    dist: [['Dim', 4], ['Warm & cozy', 28], ['Natural light', 61], ['Bright', 7]],
    summary: 'The windows bring in daylight, softened by the glass blocks. Wall lights near the booths feel warmer.',
    note: 'Summarized by AI from reviews that mention light',
    photos: [[232, 'Warm & cozy', 'The wall lights felt soft, and it was a little cool by the booth.', 'Leah Park', '3 days ago', 16, 3, 0], [310, 'Natural light', 'The glass-block wall softened the daylight by our table.', 'Nina Patel', '1 wk ago', 18, 7, 1], [232, 'Dim', 'The tiled entry was dimmer than the main seating area.', 'Jules Rivera', '2 wks ago', 7, 14, 0]],
  },
  crowd: {
    title: 'Crowd', top: 'Busy',
    dist: [['Almost empty', 3], ['Relaxed', 18], ['Buzzing', 27], ['Busy', 38], ['Packed', 14]],
    summary: 'The line builds at the counter, but there can still be open tables. The aisle feels tighter when it’s busy.',
    note: 'Summarized by AI from reviews that mention crowd',
    chart: { title: 'Crowd', sun: CROWD_SUN, live: 'Live · Busier than usual', describe: crowdWord, info: 'Tap a bar for details' },
    photos: [[232, 'Relaxed', 'Grabbed a croissant before the line built up.', 'Owen Lee', '2 days ago', 11, 2, 0], [310, 'Buzzing', 'A few people were waiting for coffee, but there were still open tables.', 'Sam Ortiz', '1 wk ago', 9, 7, 1], [232, 'Busy', 'We could still find a table, but the aisle felt tight when people passed.', 'Priya Shah', '3 wks ago', 13, 21, 0]],
  },
  temp: {
    title: 'Temperature', top: 'Mild',
    dist: [['Cool', 38], ['Mild', 47], ['Warm', 15]],
    summary: 'The booth can feel cool. Window tables tend to feel mild, and the entrance warms up in direct sun.',
    note: 'Summarized by AI from reviews that mention temperature or AC',
    chart: {
      title: 'Temperature', sun: [28, 30, 36, 42, 52, 61, 71, 80, 86, 89, 85, 75, 61, 52, 45, 39, 36, 33], live: 'Indoors · AC on',
      describe: (v) => (v < 45 ? 'Cool' : v < 75 ? 'Mild' : 'Warm'),
      info: 'Tap a bar for details',
      foot: 'Indoor and outdoor spots can feel different. The bars show how the patio feels throughout the day.',
    },
    photos: [[232, 'Cool', 'The wall lights felt soft, and it was a little cool by the booth.', 'Leah Park', '3 days ago', 16, 3, 0], [310, 'Mild', 'The window table had room for my laptop and coffee, and the spot felt mild.', 'Jordan Bell', '1 wk ago', 14, 7, 1], [232, 'Warm', 'The entrance felt warm in the afternoon sun.', 'Riley Morgan', '2 wks ago', 8, 14, 0]],
  },
  seating: {
    title: 'Seating', top: 'Window tables', multi: true,
    dist: [['Window tables', 64], ['Other tables', 48], ['Bench seating', 22], ['Bar seats', 15]],
    summary: 'Window tables have room for coffee and a laptop. The long bench works for small groups.',
    note: 'Summarized by AI from reviews that mention seating',
    photos: [[232, 'Bench seating', 'The long bench had enough room for the three of us.', 'Amelia Ross', '5 days ago', 10, 5, 0], [310, 'Window table', 'The window table had room for my laptop and coffee, and the spot felt mild.', 'Jordan Bell', '1 wk ago', 14, 7, 1], [232, 'Window table', 'We could talk at the window table without raising our voices.', 'Maya Chen', '3 wks ago', 24, 21, 0]],
  },
};

// Glass / Category bar: star (all reviews) + the five senses. The selected item grows to show its label.
function CategoryBar({ value, onPick, onAll }) {
  const items = [{ k: 'all', label: 'All', icon: <VIcon name="sparkle" size={24} /> }, ...SENSES];
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

// Stable image assignments from the matching Final flow review layers.
const REVIEW_PHOTOS = {
  'The espresso machine and chatter made the counter area lively.': [PHOTO.p0401],
  'The grinder drowned us out for a moment while we waited at the counter.': [PHOTO_GRID[0][2], GRID_CROPS[0][2]],
  'We could talk at the window table without raising our voices.': [PHOTO_GRID[1][1]],
  'The wall lights felt soft, and it was a little cool by the booth.': [PHOTO.p0406],
  'The glass-block wall softened the daylight by our table.': [PHOTO_GRID[0][0], GRID_CROPS[0][0]],
  'The tiled entry was dimmer than the main seating area.': [PHOTO_GRID[0][3], GRID_CROPS[0][3]],
  'Grabbed a croissant before the line built up.': [PHOTO.p0402],
  'A few people were waiting for coffee, but there were still open tables.': [PHOTO_GRID[0][1], GRID_CROPS[0][1]],
  'We could still find a table, but the aisle felt tight when people passed.': [PHOTO.p0403],
  'The window table had room for my laptop and coffee, and the spot felt mild.': [PHOTO_GRID[1][3], GRID_CROPS[1][3]],
  'The entrance felt warm in the afternoon sun.': [PHOTO_GRID[1][2]],
  'The long bench had enough room for the three of us.': [PHOTO_GRID[1][0], GRID_CROPS[1][0]],
};
const picFor = (text) => REVIEW_PHOTOS[text]?.[0] ?? REVIEW_PICS[[...text].reduce((a, c) => a + c.charCodeAt(0), 0) % REVIEW_PICS.length];
function PhotoReview({ p, onPhoto }) {
  const [h, tag, text, who, when, likes] = p;
  const [liked, setLiked] = useState(false);
  const pic = picFor(text);
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={GENTLE}>
      <G r={24} whileTap={{ scale: 0.98 }} style={{ padding: '6px 6px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div role="button" aria-label="Open photo" onClick={onPhoto} style={{ position: 'relative', height: h, borderRadius: 18, ...photoBackground(pic, REVIEW_PHOTOS[text]?.[1]), cursor: 'pointer' }}>
          <span className="abs nowrap" style={{ left: 8, top: 8, height: 24, padding: '0 10px', borderRadius: 13, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', ...t(12, 600) }}>{tag}</span>
        </div>
        <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={t(13, 500, '#2a2650', { lineHeight: 1.35 })}>{text}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, flex: 'none', background: 'rgba(94,90,126,0.12)' }} />
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '1 0 0' }}>
              <span className="nowrap" style={t(12, 600, '#2a2650')}>{who}</span>
              <span className="nowrap" style={t(11, 400)}>{when}</span>
            </span>
            <motion.button whileTap={{ scale: 0.9 }} aria-pressed={liked} aria-label="Like review" onClick={() => setLiked((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <VIcon name={liked ? 'heartFill' : 'heart'} size={15} fill={NAVY} />
              <span style={t(12, 500)}>{likes + (liked ? 1 : 0)}</span>
            </motion.button>
          </div>
        </div>
      </G>
    </motion.div>
  );
}

const EXTRA = [['Grace Lin', '1 mo ago'], ['Marcus Hall', '1 mo ago'], ['Ivy Chen', '2 mo ago']];

function SenseBody({ sense, onPhoto }) {
  const d = SENSE_DATA[sense];
  const [filter, setFilter] = useState(null);
  const [newest, setNewest] = useState(true);
  const [more, setMore] = useState(false);
  let all = d.photos.map((p, i) => [...p, i]);
  if (more) all = all.concat(d.photos.map((p, i) => [p[0] - 30, p[1], p[2], EXTRA[i][0], EXTRA[i][1], Math.max(2, p[5] - 6), 40 + i * 15, (p[7] + 1) % 2, 3 + i]));
  let list = filter ? all.filter((p) => p[1] === filter || (sense === 'seating' && filter.startsWith(p[1].split(' ')[0]))) : all;
  list = [...list].sort((a, b) => (newest ? a[6] - b[6] : b[6] - a[6]));
  let cols = [[], []]; const hgt = [0, 0];
  if (!filter && newest && !more) cols = [all.filter((p) => p[7] === 0), all.filter((p) => p[7] === 1)]; // Figma arrangement
  else list.forEach((p) => { const c = hgt[0] <= hgt[1] ? 0 : 1; cols[c].push(p); hgt[c] += p[0] + 110; });
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
              {col.map((p) => <PhotoReview key={`${p[8]}-${p[3]}`} p={p} onPhoto={() => { const flat = [...cols[0], ...cols[1]]; onPhoto(flat.map((q) => picFor(q[2])), flat.indexOf(p)); }} />)}
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
  const lb = useLightbox();
  const pick = (k) => { setSense(k); scroller.current?.scrollTo({ top: 0 }); };
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <InfoShareHost>
      <TopBar title="Reviews" back onClose={onBack} scrolled={scrolled} />
      <div ref={scroller} className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '124px 24px 140px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <CategoryBar value={sense} onPick={pick} onAll={onAll} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={sense} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SenseBody sense={sense} onPhoto={lb.open} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <PrimaryCTA icon="calendarCheck" onClick={onReserve} top={RESERVE_TOP} label={booking ? `Booked · ${booking.dayShort}, ${booking.time}` : 'Reserve'} />
      <Lightbox box={lb.box} onClose={lb.close} setI={lb.setI} />
      </InfoShareHost>
    </div>
  );
}
