// Venue page · Foxy Loxy Cafe (Figma 789:3120): Overview / Menu / Reviews / Photos
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { GENTLE, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { VIcon } from './venueIcons.jsx';
import { VP, ZONES, GRID } from './venuePhotos.js';
import { G, CircleBtn, Chip, SenseTiles, InfoList, ReviewSummary, AISummary, ReviewCard, H, PrimaryCTA, Toast, DayChart, weekFrom, NAVY, MUTED, PURPLE, DIV, TAP, t } from './flow.jsx';

export const VENUE = {
  name: 'Foxy Loxy Cafe',
  address: '1919 Bull St, Savannah, GA 31401',
  phone: '(912) 401-0543',
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

export const SENSE_VALUES = { sound: 'Lively', light: 'Natural', crowd: 'Busy', temp: 'Mild', seating: 'Patio' };


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
          </button>
        </div>
      ),
    },
    { icon: 'forkKnife', text: 'foxyloxycafe.com/menu' },
    { icon: 'globe', text: 'foxyloxycafe.com' },
    { icon: 'phone', text: VENUE.phone },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoList rows={rows} />
      <H>What's here</H>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Back patio', 'Garden pond', 'Live music', 'Beer & wine', 'Art gallery'].map((c) => <Chip key={c} label={c} />)}
      </div>
      <H>Reviews</H>
      <ReviewSummary onClick={onReviews} />
      <AISummary />
      <ReviewCard r={firstReview} />
    </div>
  );
}

const DISHES = [['Breakfast taco', 'Tex-Mex'], ['Kolache', 'Bakery'], ['Horchata latte', 'Coffee'], ['Chai', 'Coffee']];
function Menu() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <H>Popular dishes</H>
      <div className="hscroll" style={{ margin: '0 -24px -20px', padding: '4px 24px 40px', display: 'flex', gap: 12 }}>
        {DISHES.map(([n, k]) => (
          <G key={n} r={24} style={{ width: 168, flex: 'none', padding: '8px 8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 112, borderRadius: 18, background: '#e0e0e3' }} />
            <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="nowrap" style={t(15, 600)}>{n}</span>
              <span style={t(13, 400, MUTED)}>{k}</span>
            </div>
          </G>
        ))}
      </div>
      <H>Menu photos</H>
      <div style={{ display: 'grid', gridTemplateColumns: '188px 188px', gap: 16 }}>
        {[VP.tacos, VP.pie, VP.counter, VP.patio].map((src, i) => <motion.div key={i} whileTap={{ scale: 0.97 }} style={{ height: 188, borderRadius: 24, background: `#dbdbde url(${src}) center / cover` }} />)}
      </div>
      <G as="button" r={28} whileTap={{ scale: 0.98 }} transition={TAP} style={{ height: 56, padding: '0 18px 0 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
        <VIcon name="forkKnife" />
        <span style={{ ...t(15, 500), flex: '1 0 0' }}>View full menu · foxyloxycafe.com</span>
        <VIcon name="arrowUpRight" />
      </G>
    </div>
  );
}

export const REVIEWS = [
  { name: 'Local guide', meta: '42 reviews · 1 week ago', text: 'Cozy, artsy space with a lovely back patio. Great chai and kolaches. Gets busy on weekends, so come early for a seat.', tags: ['Sound · Lively', 'Crowd · Busy'], age: 7 },
  { name: 'Weekend regular', meta: '8 reviews · 2 weeks ago', text: 'Lively but easy to talk at the patio tables. Natural light inside makes it a nice spot to read in the morning.', tags: ['Sound · Easy to talk', 'Light · Natural'], age: 14 },
  { name: 'First visit', meta: '3 reviews · 1 month ago', text: 'Loved the horchata latte and the art on the walls. Parking is limited and the line moves slowly at brunch.', tags: ['Crowd · Packed', 'Seating · Patio'], age: 30 },
];
const FILTERS = ['All', 'Sound', 'Crowd', 'Seating', 'Service'];

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
        <div style={{ width: 1, background: DIV, margin: '8px 4px', flex: 'none' }} />
        <G as="button" r={20} onClick={() => setSort((s) => (s === 'Newest' ? 'Most relevant' : 'Newest'))} whileTap={{ scale: 0.95 }} transition={TAP}
          style={{ height: 40, padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
          <span className="nowrap" style={t(14, 500)}>{sort}</span>
          <VIcon name="caretDown" size={16} />
        </G>
      </div>
      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: -16 }}>
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
            <p style={t(14, 400, MUTED)}>4.6 ★ · 2,600 reviews · $ · Café · Tex-Mex</p>
          </div>
          <SenseTiles values={SENSE_VALUES} onOpen={onSense} />
          <div className="hscroll" style={{ margin: '0 -24px', padding: '0 24px', display: 'flex', gap: 12 }}>
            {[300, 220, 220, 220].map((w, i) => (
              <motion.button key={i} aria-label={`See photos · ${ZONES[i][0]}`} onClick={() => goTab('photos', true)} whileTap={{ scale: 0.97 }} transition={TAP}
                style={{ position: 'relative', width: w, height: 280, borderRadius: 24, background: `#dbdbde url(${ZONES[i][1]}) center / cover`, flex: 'none', overflow: 'hidden' }}>
                <span className="abs nowrap" style={{ left: 12, bottom: 12, height: 30, padding: '0 14px', borderRadius: 16, background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 12px rgba(42,38,80,0.12)', display: 'flex', alignItems: 'center', ...t(13, 600, NAVY) }}>{ZONES[i][0]}</span>
              </motion.button>
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
          <VIcon name={saved ? 'heartFill' : 'heart'} fill={saved ? PURPLE : NAVY} />
        </motion.span>
      </CircleBtn>
      <CircleBtn icon="export" label="Share" style={{ position: 'absolute', left: 368, top: 56, zIndex: 10 }} />

      <PrimaryCTA icon="calendarCheck" onClick={onReserve}
        label={booking ? `Booked · ${booking.dayShort}, ${booking.time}` : 'Reserve'} />
      <Toast text={toast} />
    </div>
  );
}

