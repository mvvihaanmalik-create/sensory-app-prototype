// Venue page · Fern & Fable (Figma 789:3120): Overview / Menu / Reviews / Photos
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { GENTLE, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon } from './venueIcons.jsx';
import { VP, ZONES, GRID } from './venuePhotos.js';
import { G, CircleBtn, Chip, SenseTiles, InfoList, ReviewSummary, AISummary, ReviewCard, H, PrimaryCTA, Toast, DayChart, weekFrom, NAVY, MUTED, PURPLE, DIV, TAP, t } from './flow.jsx';

export const VENUE = {
  name: 'Fern & Fable',
  address: '214 Jones St, Savannah, GA 31401',
  phone: '(912) 555-0142',
};

// Typical crowd by hour, 6a to 11p (18 bars). Sunday matches the Figma frame.
export const CROWD_SUN = [8, 15, 23, 31, 37, 44, 42, 52, 50, 64, 73, 85, 94, 87, 75, 67, 52, 37];
export const CROWD_WEEK = weekFrom(CROWD_SUN);
export const crowdWord = (v) => (v < 25 ? 'Usually calm and comfortable' : v < 50 ? 'Usually not too busy' : v < 75 ? 'Busy' : 'Packed');
export function CrowdCard() {
  return (
    <DayChart icon={<Icon d={paths.users} size={24} fill={NAVY} />} title="Crowd" week={CROWD_WEEK} liveText="Live · Busier than usual" describe={crowdWord}
      info="Tap a bar for details" />
  );
}

export const SENSE_VALUES = { sound: 'Lively', light: 'Natural', crowd: 'Busy', temp: 'Mild', seating: 'Window tables' };


function Overview({ onReviews, firstReview }) {
  const rows = [
    { icon: 'storefront', text: 'Dine-in · Takeout · Delivery' },
    { icon: 'mapPin', text: VENUE.address },
    {
      render: (
        <div style={{ width: '100%' }}>
          <button style={{ width: '100%', height: 52, padding: '0 18px 0 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <VIcon name="clock" />
            <span style={{ ...t(15, 500), flex: '1 0 0' }}>Open · Closes 9 PM</span>
            <VIcon name="caretDown" size={18} />
          </button>
        </div>
      ),
    },
    { icon: 'forkKnife', text: 'fernandfable.com/menu' },
    { icon: 'globe', text: 'fernandfable.com' },
    { icon: 'phone', text: VENUE.phone },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoList rows={rows} />
      <H>What's here</H>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Window seating', 'Glass-block wall', 'Live music', 'Beer & wine', 'Art gallery'].map((c) => <Chip key={c} label={c} />)}
      </div>
      <H>Reviews</H>
      <ReviewSummary onClick={onReviews} />
      <AISummary />
      <ReviewCard r={firstReview} />
    </div>
  );
}

const MENU_PHOTOS = [[128, VP.counter], [188, VP.pie], [199, VP.tacos], [199, VP.store]];
const HIGHLIGHTS = [[VP.patio, 'Iced Strawberry and Matcha Latte'], [VP.indoor, 'Iced Americano'], [VP.garden], [VP.bar], [VP.hero]];
function Menu() {
  const tile = (src, label, i) => (
    <motion.div key={i} whileTap={{ scale: 0.97 }} transition={TAP} style={{ position: 'relative', height: 251, borderRadius: 16, overflow: 'hidden', background: `#dbdbde url(${src}) center / cover` }}>
      {label && <span className="abs" style={{ left: 10, right: 10, bottom: 10, alignSelf: 'flex-start', width: 'fit-content', maxWidth: 168, padding: '6px 12px', borderRadius: 14,
        background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 12px rgba(42,38,80,0.12)', ...t(13, 600, NAVY, { lineHeight: 1.25 }) }}>{label}</span>}
    </motion.div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <H>Menu photos</H>
      <div className="hscroll" style={{ margin: '0 -24px', padding: '0 24px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {MENU_PHOTOS.map(([w, src], i) => <motion.div key={i} whileTap={{ scale: 0.97 }} transition={TAP} style={{ width: w, height: i ? 266 : 262, flex: 'none', borderRadius: 16, background: `#dbdbde url(${src}) center / cover` }} />)}
        <motion.button whileTap={{ scale: 0.97 }} transition={TAP} style={{ width: 156, height: 266, flex: 'none', borderRadius: 16, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <VIcon name="plusBold" size={24} />
          <span className="nowrap" style={t(14, 600)}>Add menu photos</span>
        </motion.button>
      </div>
      <H>Highlights</H>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {[[0, 2, 4], [1, 3]].map((col, ci) => <div key={ci} style={{ width: 188, display: 'flex', flexDirection: 'column', gap: 12 }}>{col.map((i) => tile(HIGHLIGHTS[i][0], HIGHLIGHTS[i][1], i))}</div>)}
      </div>
      <G as="button" r={28} whileTap={{ scale: 0.98 }} transition={TAP} style={{ height: 56, padding: '0 18px 0 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
        <VIcon name="forkKnife" />
        <span style={{ ...t(15, 500), flex: '1 0 0' }}>View full menu · fernandfable.com</span>
        <VIcon name="arrowUpRight" />
      </G>
    </div>
  );
}

export const REVIEWS = [
  { name: 'Daniel Brooks', meta: 'Local guide · 1 wk ago', text: 'The espresso machine and chatter made the counter area lively.', tags: ['Sound · Lively'], likes: 42, replies: 12, age: 7 },
  { name: 'Leah Park', meta: '3 days ago', text: 'The wall lights felt soft, and it was a little cool by the booth.', tags: ['Light · Warm & cozy', 'Temperature · Cool'], likes: 16, replies: 3, age: 3 },
  { name: 'Priya Shah', meta: '3 wks ago', text: 'We could still find a table, but the aisle felt tight when people passed.', tags: ['Crowd · Busy'], likes: 13, replies: 1, age: 21 },
];
const FILTERS = ['All', 'Sound', 'Light', 'Crowd', 'Temperature', 'Seating', 'Service'];

function Reviews({ onWrite, mine }) {
  const [f, setF] = useState('All');
  const [sort, setSort] = useState('Most relevant');
  let list = [...(mine ? [mine] : []), ...REVIEWS];
  if (f !== 'All') list = list.filter((r) => r.tags?.some((x) => x.startsWith(f)));
  if (sort === 'Newest') list = [...list].sort((a, b) => a.age - b.age);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ReviewSummary />
      <AISummary />
      <G as="button" r={26} onClick={onWrite} whileTap={{ scale: 0.98 }} transition={TAP}
        style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <VIcon name="pencil" />
        <span style={t(15, 600)}>Write a review</span>
      </G>
      <div className="hscroll" style={{ margin: '0 -24px -24px', padding: '4px 24px 40px', display: 'flex', gap: 8 }}>
        {FILTERS.map((c) => <Chip key={c} label={c} on={f === c} onClick={() => setF(c)} />)}
      </div>
      <div style={{ display: 'flex', marginTop: -24 }}>
        <G as="button" r={20} onClick={() => setSort((s) => (s === 'Newest' ? 'Most relevant' : 'Newest'))} whileTap={{ scale: 0.95 }} transition={TAP}
          style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          <span className="nowrap" style={t(14, 500)}>{sort}</span>
        </G>
      </div>
      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((r) => (
            <motion.div key={r.name} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={GENTLE}>
              <ReviewCard r={r} />
            </motion.div>
          ))}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

const PHOTO_CHIPS = ['All', 'Latest', 'Food & drink', 'Vibe', 'Menu', 'By owner'];
const COLS = [[240, 180, 260, 200], [180, 260, 200, 240]];
function Photos() {
  const [c, setC] = useState('All');
  const k = PHOTO_CHIPS.indexOf(c);
  const cols = k % 2 ? [COLS[1], COLS[0]] : COLS;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="hscroll" style={{ margin: '0 -24px -20px', padding: '4px 24px 40px', display: 'flex', gap: 8 }}>
        {PHOTO_CHIPS.map((p) => <Chip key={p} label={p} on={c === p} onClick={() => setC(p)} />)}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: -4 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ width: 188, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {col.map((h, i) => (
              <motion.div key={`${ci}-${i}`} layout initial={false} animate={{ height: h }} transition={GENTLE} whileTap={{ scale: 0.97 }}
                style={{ borderRadius: 24, background: `#dbdbde url(${GRID[(ci + (k % 2)) % 2][i]}) center / cover` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [['overview', 'Overview'], ['menu', 'Menu'], ['reviews', 'Reviews'], ['photos', 'Photos']];

export default function Venue({ tab, setTab, onBack, backLabel = 'Back', saved = false, onToggleSaved, onReserve, onWriteReview, onSense, booking, mine, onScroll, toast, reviewsCmd }) {
  const scroller = useRef(null);
  const tabsRef = useRef(null);
  const sy = useMotionValue(0);
  const heroY = useTransform(sy, (v) => (v > 0 ? v * 0.45 : 0));
  const heroScale = useTransform(sy, (v) => (v < 0 ? 1 - v / 320 : 1));

  const goTab = (k, scroll) => {
    setTab(k);
    const s = scroller.current, el = tabsRef.current;
    if (!s || !el) return;
    const target = el.offsetTop - 112;
    if (scroll || s.scrollTop > target) s.scrollTo({ top: target, behavior: 'smooth' });
  };

  useEffect(() => { if (reviewsCmd) goTab('reviews', true); }, [reviewsCmd]);

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <div ref={scroller} className="scroll" onScroll={(e) => { sy.set(e.currentTarget.scrollTop); onScroll?.(e.currentTarget.scrollTop); }}>
        <motion.div style={{ height: 320, background: `#dbdbde url(${VP.hero}) center / cover`, y: heroY, scale: heroScale, transformOrigin: '50% 0' }} />
        <div style={{ position: 'relative', background: '#f7f5f1', padding: '24px 24px 140px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 style={t(28, 600, NAVY, { letterSpacing: -0.4 })}>{VENUE.name}</h1>
            <p style={t(14, 400, MUTED)}>4.6 ★ · 2,600 reviews · $ · Café</p>
          </div>
          <SenseTiles values={SENSE_VALUES} onOpen={onSense} />
          <div className="hscroll" style={{ margin: '0 -24px', padding: '0 24px', display: 'flex', gap: 12 }}>
            {[[220, VP.hero], [210, VP.patio], [210, VP.indoor], [210, VP.bar], [210, VP.garden]].map(([w, src], i) => (
              <motion.button key={i} aria-label="See photos" onClick={() => goTab('photos', true)} whileTap={{ scale: 0.97 }} transition={TAP}
                style={{ width: w, height: 280, borderRadius: 24, background: `#dbdbde url(${src}) center / cover`, flex: 'none' }} />
            ))}
          </div>
          <div style={{ height: 104 }} />
          <CrowdCard />
          <div ref={tabsRef}><G r={27} style={{ padding: 5, display: 'flex' }}>
            {TABS.map(([k, l]) => {
              const on = tab === k;
              return (
                <button key={k} onClick={() => goTab(k)} style={{ position: 'relative', flex: '1 0 0', height: 44, borderRadius: 22 }}>
                  {on && <motion.div layoutId="venue-tab" transition={GENTLE}
                    style={{ position: 'absolute', inset: 0, borderRadius: 22, background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />}
                  <span style={{ position: 'relative', ...t(14, on ? 600 : 500, on ? NAVY : 'rgba(94,90,126,0.65)') }}>{l}</span>
                </button>
              );
            })}
          </G></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} style={{ paddingTop: 8 }}>
              {tab === 'overview' && <Overview onReviews={() => goTab('reviews', true)} firstReview={mine || REVIEWS[0]} />}
              {tab === 'menu' && <Menu />}
              {tab === 'reviews' && <Reviews onWrite={onWriteReview} mine={mine} />}
              {tab === 'photos' && <Photos />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CircleBtn icon="caretLeft" label={backLabel} onClick={onBack} style={{ position: 'absolute', left: 24, top: 56, zIndex: 10 }} />
      <CircleBtn label={saved ? 'Saved' : 'Save'} onClick={onToggleSaved} style={{ position: 'absolute', left: 316, top: 56, zIndex: 10 }}>
        <motion.span key={saved ? 'on' : 'off'} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
          <VIcon name={saved ? 'bookmarkFill' : 'bookmark'} size={22} fill={NAVY} />
        </motion.span>
      </CircleBtn>
      <CircleBtn icon="export" label="Share" style={{ position: 'absolute', left: 368, top: 56, zIndex: 10 }} />

      <PrimaryCTA icon="calendarCheck" onClick={onReserve}
        label={booking ? `Booked · ${booking.dayShort}, ${booking.time}` : 'Reserve'} />
      <Toast text={toast} />
    </div>
  );
}

