import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Home from './Home.jsx';
import MapScreen from './Map.jsx';
import Profile from './Profile.jsx';
import Venue from './Venue.jsx';
import BookTable, { BookingConfirmed, emptyDraft, slotsFor, DATES } from './BookTable.jsx';
import WriteReview from './WriteReview.jsx';
import SenseReviews from './SenseReviews.jsx';
import { ScaleCtx, StatusBar, TabBar } from './ui.jsx';

const DEVICE_W = 468, DEVICE_H = 984;
const TAB_TOP = { home: 852, map: 862, profile: 852 };
const SCREEN_IN = {
  home: { initial: { opacity: 0, scale: 0.985 }, animate: { opacity: 1, scale: 1 } },
  map: { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 } },
  profile: { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } },
};
const EASE = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

function useFitScale() {
  const calc = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const side = w > 900 ? 276 : 0;
    return Math.min(1, (h - 40) / DEVICE_H, (w - 32 - side) / DEVICE_W);
  };
  const [s, setS] = useState(calc);
  useEffect(() => { const f = () => setS(calc()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return s;
}

const VIEWS = [
  { id: 'home', label: 'Home' },
  { id: 'map-half', label: 'Map' },
  { id: 'map-full', label: 'Map · sheet up' },
  { id: 'map-hidden', label: 'Map · sheet away' },
  { id: 'profile', label: 'Profile' },
  { id: 'venue', label: 'Venue' },
  { id: 'venue-reviews', label: 'Venue · reviews' },
  { id: 'sense', label: 'Sense reviews' },
  { id: 'review', label: 'Write a review' },
  { id: 'book', label: 'Book · 1 When' },
  { id: 'book-2', label: 'Book · 2 Where to sit' },
  { id: 'book-3', label: 'Book · 3 Booking for' },
  { id: 'confirmed', label: 'Booking confirmed' },
];
const VENUE_VIEWS = ['venue', 'venue-reviews', 'sense', 'review', 'book', 'book-2', 'book-3', 'confirmed'];
const SAMPLE_DRAFT = { ...emptyDraft(), guests: 2, date: 0, time: '5:30 PM', zone: 'Patio', table: 4, comfort: ['Away from speakers'] };
const toBooking = (d) => ({ ...d, crowd: slotsFor(d.date, d.guests).find((s) => s.time === d.time).crowd, dayShort: DATES[d.date].short, dayLong: DATES[d.date].long });
const flowOf = (id) => (id.startsWith('book') ? 'book' : ['review', 'confirmed'].includes(id) ? id : null);
const SHEET_UP = { initial: { y: 956 }, animate: { y: 0 }, exit: { y: 956 } };

export default function App() {
  const scale = useFitScale();
  const initial = (() => { const h = (location.hash || '').slice(1); return VIEWS.some((v) => v.id === h) ? h : 'home'; })();
  const [screen, setScreen] = useState(initial.startsWith('map') ? 'map' : VENUE_VIEWS.includes(initial) ? 'home' : initial);
  const [venueOpen, setVenueOpen] = useState(VENUE_VIEWS.includes(initial));
  const [flow, setFlow] = useState(flowOf(initial));
  const [bookStep, setBookStep] = useState(initial === 'book-2' ? 2 : initial === 'book-3' ? 3 : 1);
  const [sense, setSense] = useState(initial === 'sense' ? 'sound' : null);
  const [reviewsCmd, setReviewsCmd] = useState(0);
  const [venueTab, setVenueTab] = useState(initial === 'venue-reviews' || initial === 'review' ? 'reviews' : 'overview');
  const [draft, setDraft] = useState(['confirmed', 'book-3'].includes(initial) ? SAMPLE_DRAFT : initial === 'book-2' ? { ...SAMPLE_DRAFT, table: null, comfort: [] } : emptyDraft());
  const [booking, setBooking] = useState(initial === 'confirmed' ? toBooking(SAMPLE_DRAFT) : null);
  const [mine, setMine] = useState(null);
  const [toast, setToast] = useState(null);
  const [venueScroll, setVenueScroll] = useState(0);
  const toastTimer = useRef(0);
  const say = (m) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2400); };
  const openVenue = () => { setVenueOpen(true); setVenueTab('overview'); setVenueScroll(0); setFlow(null); setSense(null); };
  const closeVenue = () => { setVenueOpen(false); setFlow(null); setSense(null); setVenueScroll(0); };
  const reserve = () => { if (booking) setFlow('confirmed'); else { setBookStep(1); setFlow('book'); } };
  const [sheetCmd, setSheetCmd] = useState(initial.startsWith('map-') && initial !== 'map-half' ? { state: initial.slice(4), n: 0 } : null);
  const [homeScroll, setHomeScroll] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const nav = (to) => {
    if (to === 'search') return; // no Search screen designed yet
    if (to !== screen) { setScreen(to); setHomeScroll(0); setSheetCmd(null); }
  };
  const jump = (id) => {
    if (VENUE_VIEWS.includes(id)) {
      setVenueOpen(true); setVenueScroll(0);
      setVenueTab(id === 'venue-reviews' || id === 'review' ? 'reviews' : 'overview');
      setSense(id === 'sense' ? 'sound' : null);
      if (id === 'confirmed' && !booking) { setDraft(SAMPLE_DRAFT); setBooking(toBooking(SAMPLE_DRAFT)); }
      if (id === 'book-2') setDraft((d) => (d.guests && d.date != null && d.time ? d : { ...SAMPLE_DRAFT, table: null, comfort: [] }));
      if (id === 'book-3') setDraft((d) => (d.table ? d : SAMPLE_DRAFT));
      if (id.startsWith('book')) setBookStep(id === 'book-2' ? 2 : id === 'book-3' ? 3 : 1);
      setFlow(flowOf(id));
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
      return;
    }
    closeVenue();
    if (id.startsWith('map')) {
      const st = id.slice(4) || 'half';
      if (screen !== 'map') { setScreen('map'); setSheetCmd(st === 'half' ? null : { state: st, n: Date.now() }); }
      else setSheetCmd({ state: st, n: Date.now() });
    } else nav(id);
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <ScaleCtx.Provider value={scale}>
        <div className="stage">
          <aside className="panel">
            <div>
              <div className="label">UXDG 370 · Final flow</div>
              <h1>Calm places,<br />Savannah</h1>
            </div>
            <p className="lead">Tap through it like the real app. Start from a For you card on Home.</p>
            <div className="tools">
              <button onClick={() => { try { history.replaceState(null, '', location.pathname); } catch (_) {} location.reload(); }}>Restart</button>
            </div>
          </aside>

          <div className="device-wrap" style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
            <div className="device" style={{ transform: `scale(${scale})` }}>
              <div className="btn" style={{ left: -3, top: 196, height: 34 }} />
              <div className="btn" style={{ left: -3, top: 256, height: 64 }} />
              <div className="btn" style={{ left: -3, top: 334, height: 64 }} />
              <div className="btn" style={{ right: -3, top: 290, height: 104 }} />
              <div className="screen">
                <AnimatePresence>
                  <motion.div key={screen} className="abs" style={{ inset: 0 }}
                    initial={SCREEN_IN[screen].initial} animate={SCREEN_IN[screen].animate} exit={{ opacity: 0, transition: { duration: 0.28 } }} transition={EASE}>
                    {screen === 'home' && <Home onOpenMap={() => nav('map')} onOpenVenue={openVenue} onScroll={setHomeScroll} reduceMotion={reduceMotion} />}
                    {screen === 'map' && <MapScreen command={sheetCmd} onOpenVenue={openVenue} />}
                    {screen === 'profile' && <Profile onScroll={setHomeScroll} />}
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  {venueOpen && (
                    <motion.div key="venue" className="abs" style={{ inset: 0, zIndex: 42, boxShadow: '-12px 0 40px rgba(42,38,80,0.12)' }}
                      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                      <Venue tab={venueTab} setTab={setVenueTab} onBack={closeVenue} booking={booking} mine={mine} toast={toast}
                        onScroll={setVenueScroll}
                        onReserve={reserve} onSense={setSense} reviewsCmd={reviewsCmd}
                        onWriteReview={() => setFlow('review')} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {venueOpen && sense && (
                    <motion.div key="sense" className="abs" style={{ inset: 0, zIndex: 43, boxShadow: '-12px 0 40px rgba(42,38,80,0.12)' }}
                      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                      <SenseReviews sense={sense} setSense={setSense} booking={booking} onReserve={reserve}
                        onBack={() => setSense(null)}
                        onAll={() => { setSense(null); setReviewsCmd((n) => n + 1); }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {flow && (
                    <motion.div key="flow" className="abs" style={{ inset: 0, zIndex: 44, overflow: 'hidden', borderRadius: 0 }}
                      {...SHEET_UP} transition={{ type: 'spring', stiffness: 240, damping: 30 }}>
                      <AnimatePresence initial={false}>
                        <motion.div key={flow} className="abs" style={{ inset: 0 }}
                          initial={{ opacity: 0, x: flow === 'confirmed' ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: flow === 'confirmed' ? -40 : 40 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          {flow === 'book' && <BookTable draft={draft} setDraft={setDraft} existing={!!booking} step={bookStep} setStep={setBookStep}
                            onClose={() => setFlow(booking ? 'confirmed' : null)}
                            onCancelBooking={() => { setBooking(null); setDraft(emptyDraft()); setFlow(null); say('Booking cancelled'); }}
                            onBooked={(b) => { setBooking(b); setFlow('confirmed'); }} />}
                          {flow === 'confirmed' && booking && <BookingConfirmed booking={booking}
                            onClose={() => { setFlow(null); setSense(null); setVenueTab('overview'); }}
                            onChange={() => { setDraft({ ...booking }); setBookStep(3); setFlow('book'); }} />}
                          {flow === 'review' && <WriteReview mine={mine} onClose={() => setFlow(null)}
                            onPosted={(r) => { setMine(r); setVenueTab('reviews'); setFlow(null); setTimeout(() => say(mine ? 'Review updated' : 'Thanks, your review is up'), 350); }} />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
                <StatusBar shade={flow || sense ? 0 : venueOpen ? (venueScroll > 270 ? 1 : 0) : screen !== 'map' && homeScroll > 24 ? 1 : 0} />
                <TabBar active={screen} onNav={nav} top={venueOpen ? 1000 : TAB_TOP[screen]} />
                <div className="abs" style={{ left: 150, top: 943, width: 140, height: 5, borderRadius: 3, background: screen === 'map' ? 'rgba(20,24,31,0.85)' : '#14181f', zIndex: 55 }} />
                <div className="island" />
              </div>
            </div>
          </div>
        </div>
      </ScaleCtx.Provider>
    </MotionConfig>
  );
}
