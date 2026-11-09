import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, MotionConfig, useMotionValue, useIsPresent } from 'motion/react';
import Home from './Home.jsx';
import MapScreen from './Map.jsx';
import Profile from './Profile.jsx';
import Search from './Search.jsx';
import DiscoverLayer, { SCREEN_H, OPEN_SPRING, CLOSE_SPRING } from './Discover.jsx';
import Venue from './Venue.jsx';
import BookTable, { BookingConfirmed, emptyDraft, slotsFor, DATES } from './BookTable.jsx';
import WriteReview from './WriteReview.jsx';
import SenseReviews from './SenseReviews.jsx';
import ListPage, { SortSheet } from './Lists.jsx';
import { ModesSheet, EditMode, INITIAL_MODES, modeLabel } from './Modes.jsx';
import { PAGE_IDS, PAGES } from './listData.js';
import { Toast } from './flow.jsx';
import { GENTLE, ScaleCtx, StatusBar, TabBar } from './ui.jsx';

const DEVICE_W = 468, DEVICE_H = 984;
const TAB_TOP = { home: 852, search: 862, map: 862, profile: 852 };
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
  ...['search', 'search-results', 'search-filters', 'search-place'].map(id => ({ id, label: id })),
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
  ...PAGE_IDS.map((id) => ({ id, label: id })),
  { id: 'modes', label: 'Modes' },
  { id: 'edit-study', label: 'Edit Study' },
  { id: 'edit-party', label: 'Edit Party' },
  { id: 'add-mode', label: 'Add custom mode' },
  { id: 'sort-sound', label: 'Sound sort sheet' },
  { id: 'discover', label: 'Hidden discovery' },
];
const SEARCH_ROUTES = ['search', 'search-results', 'search-filters', 'search-place'];
function ScreenLayer({ screen, children }) {
  const present = useIsPresent();
  return <motion.div className="abs" aria-hidden={!present || undefined} style={{ inset: 0, pointerEvents: present ? 'auto' : 'none' }} initial={SCREEN_IN[screen].initial} animate={SCREEN_IN[screen].animate} exit={{ opacity: 0, transition: { duration: .28 } }} transition={EASE}>{children}</motion.div>;
}
const MODE_VIEWS = ['modes', 'edit-study', 'edit-party', 'add-mode'];
const HOME_VIEWS = [...PAGE_IDS, ...MODE_VIEWS, 'sort-sound', 'discover'];
const VENUE_VIEWS = ['venue', 'venue-reviews', 'sense', 'review', 'book', 'book-2', 'book-3', 'confirmed'];
const SAMPLE_DRAFT = { ...emptyDraft(), guests: 2, date: 0, time: '5:30 PM', zone: 'Patio', table: 4, comfort: ['Away from speakers'] };
const toBooking = (d) => ({ ...d, crowd: slotsFor(d.date, d.guests).find((s) => s.time === d.time).crowd, dayShort: DATES[d.date].short, dayLong: DATES[d.date].long });
const flowOf = (id) => (id.startsWith('book') ? 'book' : ['review', 'confirmed'].includes(id) ? id : null);
const SHEET_UP = { initial: { y: 956 }, animate: { y: 0 }, exit: { y: 956 } };

export default function App() {
  const scale = useFitScale();
  const initial = (() => { const h = (location.hash || '').slice(1); return VIEWS.some((v) => v.id === h) ? h : 'home'; })();
  const [screen, setScreen] = useState(SEARCH_ROUTES.includes(initial) ? 'search' : initial.startsWith('map') ? 'map' : VENUE_VIEWS.includes(initial) || HOME_VIEWS.includes(initial) ? 'home' : initial);
  const [searchRoute, setSearchRoute] = useState(SEARCH_ROUTES.includes(initial) ? initial : 'search');
  const [page, setPage] = useState(PAGE_IDS.includes(initial) || initial === 'sort-sound' ? (initial === 'sort-sound' ? 'cafes' : initial) : null);
  const [modes, setModes] = useState(INITIAL_MODES);
  const [activeMode, setActiveMode] = useState('study');
  const [modesOpen, setModesOpen] = useState(MODE_VIEWS.includes(initial));
  const [editing, setEditing] = useState(initial === 'edit-study' ? 'study' : initial === 'edit-party' ? 'party' : initial === 'add-mode' ? 'new' : null);
  const [modeOrigin, setModeOrigin] = useState('home');
  const [sortSheet, setSortSheet] = useState(initial === 'sort-sound' ? { sense: 'sound', value: null, onApply: () => {} } : null);
  const [sortsBy, setSortsBy] = useState({});
  const [note, setNote] = useState(null);
  const noteTimer = useRef(0);
  const sayNote = (m) => { setNote(m); clearTimeout(noteTimer.current); noteTimer.current = setTimeout(() => setNote(null), 2400); };
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
  const closeVenue = () => { if (screen === 'search') { try { history.replaceState(null, '', '#' + searchRoute); } catch (_) {} } setVenueOpen(false); setFlow(null); setSense(null); setVenueScroll(0); };
  const reserve = () => { if (booking) setFlow('confirmed'); else { setBookStep(1); setFlow('book'); } };
  const [sheetCmd, setSheetCmd] = useState(initial.startsWith('map-') && initial !== 'map-half' ? { state: initial.slice(4), n: 0 } : null);
  const [homeScroll, setHomeScroll] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Hidden Discovery Mode: Home slides down by `pull`, Discover sits underneath it
  const [discoverOpen, setDiscoverOpen] = useState(initial === 'discover');
  const pull = useMotionValue(initial === 'discover' ? SCREEN_H : 0);
  // Figma's initial Saved places include Foxy Loxy and The Grey within the total of 12.
  const [decided, setDecided] = useState({ foxy: 'save', grey: 'save' });
  const savedCount = 10 + Object.values(decided).filter(v => v === 'save').length;
  const savedPlaces = Object.keys(decided).filter(id => decided[id] === 'save').map(id => Object.values(PAGES).flatMap(page => page.rows).find(row => row.id === id)).filter(Boolean);
  const toggleSaved = id => setDecided(m => { const next = { ...m }; if (next[id] === 'save') delete next[id]; else next[id] = 'save'; return next; });
  const closeDiscover = () => { setDiscoverOpen(false); animate(pull, 0, CLOSE_SPRING); };
  const showPassed = () => setDecided((m) => Object.fromEntries(Object.entries(m).filter(([, v]) => v === 'save')));

  const nav = (to) => {
    if (screen === 'search' && to !== 'search') { try { history.pushState(null, '', '#' + (to === 'map' ? 'map-half' : to)); } catch (_) {} }
    if (discoverOpen) closeDiscover();
    if (page) setPage(null);
    if (to !== screen) { setScreen(to); setSheetCmd(null); }
  };
  const navigateSearch = (route, replace = false) => {
    setSearchRoute(route); setScreen('search');
    try { if (location.hash !== '#' + route) history[replace ? 'replaceState' : 'pushState']({ search: true }, '', '#' + route); } catch (_) {}
  };
  const backSearch = fallback => { if (history.state?.search) history.back(); else navigateSearch(fallback, true); };
  const openSearchVenue = () => { openVenue(); try { history.pushState({ search: true }, '', '#venue'); } catch (_) {} };
  useEffect(() => {
    const restore = () => { const id = location.hash.slice(1); if (SEARCH_ROUTES.includes(id)) { setSearchRoute(id); setScreen('search'); setVenueOpen(false); setFlow(null); setSense(null); } else if (['home','map-half','profile'].includes(id)) { setScreen(id === 'map-half' ? 'map' : id); } };
    window.addEventListener('popstate', restore); window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, []);
  const activeM = modes.find((m) => m.id === activeMode) || modes[0];
  const sortsFor = (k) => sortsBy[k] || [];
  const setSortsFor = (k) => (fn) => setSortsBy((b) => ({ ...b, [k]: fn(b[k] || []) }));
  const saveMode = (m) => {
    setModes((ms) => (ms.some((x) => x.id === m.id) ? ms.map((x) => (x.id === m.id ? m : x)) : [...ms, m]));
    if (editing === 'new') setActiveMode(m.id);
    setEditing(null); setModesOpen(modeOrigin === 'home');
  };
  const editMode = (id, origin) => { setModeOrigin(origin); setEditing(id); };
  const bannerText = activeM.id === 'study' && activeM.prefs.sound === 'Quiet' ? 'Because you like quiet cafés and outdoor seating' : null;
  const jump = (id) => {
    if (SEARCH_ROUTES.includes(id)) { closeVenue(); nav('search'); navigateSearch(id); return; }
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
    if (id === 'discover') { nav('home'); setDiscoverOpen(true); animate(pull, SCREEN_H, OPEN_SPRING); try { history.replaceState(null, '', '#discover'); } catch (_) {} return; }
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
            <div className="tools"><button onClick={() => { nav('search'); navigateSearch('search'); }}>Search</button>
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
                <div className="abs" style={{ inset: 0, display: screen === 'home' ? 'block' : 'none' }} aria-hidden={screen !== 'home'}>
                    {<DiscoverLayer pull={pull} open={discoverOpen} onClose={closeDiscover} mode={activeM} decided={decided}
                      onDecide={(id, d) => setDecided((m) => ({ ...m, [id]: d }))} onShowPassed={showPassed} onOpenVenue={openVenue} blocked={venueOpen || !!sense || !!flow} />}
                    {<Home pull={pull} pullOn={screen === 'home' && !discoverOpen} onDiscover={() => setDiscoverOpen(true)} onOpenMap={() => nav('map')} onOpenSearch={() => { nav('search'); navigateSearch(searchRoute); }} onOpenVenue={openVenue} onOpenPage={setPage} onOpenModes={() => setModesOpen(true)} modeLabel={modeLabel(activeM)} onScroll={setHomeScroll} reduceMotion={reduceMotion} />}
                </div>
                <AnimatePresence>{!['home', 'search'].includes(screen) && <ScreenLayer key={screen} screen={screen}>
                  {screen === 'map' && <MapScreen command={sheetCmd} onOpenVenue={openVenue} onOpenSearch={() => { nav('search'); navigateSearch(searchRoute); }} savedIds={Object.keys(decided).filter(id => decided[id] === 'save')} onToggleSaved={toggleSaved} />}
                  {screen === 'profile' && <Profile onScroll={setHomeScroll} savedCount={savedCount} savedPlaces={savedPlaces} modes={modes} activeId={activeMode} onPickMode={setActiveMode} onEditMode={id => editMode(id, 'profile')} onAddMode={() => editMode('new', 'profile')} onOpenVenue={openVenue} />}
                </ScreenLayer>}</AnimatePresence>
                <motion.div className="abs" style={{ inset: 0, display: screen === 'search' ? 'block' : 'none' }} aria-hidden={screen !== 'search'} initial={false} animate={{ opacity: screen === 'search' ? 1 : 0 }} transition={GENTLE}>
                  <Search route={searchRoute} active={screen === 'search' && !venueOpen} onNavigate={navigateSearch} onBack={backSearch} onOpenVenue={openSearchVenue} hasSaved={decided.foxy === 'save'} activeMode={activeM} booking={booking} />
                </motion.div>
                <AnimatePresence>
                  {venueOpen && (
                    <motion.div key="venue" className="abs" style={{ inset: 0, zIndex: 42, boxShadow: '-12px 0 40px rgba(42,38,80,0.12)' }}
                      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                      <Venue saved={decided.foxy === 'save'} onToggleSaved={() => toggleSaved('foxy')} tab={venueTab} setTab={setVenueTab} onBack={closeVenue} backLabel={screen === 'search' ? 'Back to Search' : 'Back'} booking={booking} mine={mine} toast={toast}
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
                <AnimatePresence>
                  {page && (
                    <motion.div key={page} className="abs" style={{ inset: 0, zIndex: 30 }}
                      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                      <ListPage kind={page} onBack={() => setPage(null)} onOpenVenue={openVenue} onNote={(m) => sayNote(m)} bannerText={bannerText}
                        sorts={sortsFor(page)} setSorts={setSortsFor(page)} sortOpen={sortSheet ? sortSheet.sense : null}
                        openSort={(sense, value, onApply) => setSortSheet({ sense, value, onApply })} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {sortSheet && <SortSheet key={sortSheet.sense} sense={sortSheet.sense} value={sortSheet.value} onApply={sortSheet.onApply} onClose={() => setSortSheet(null)} />}
                </AnimatePresence>
                <AnimatePresence>
                  {modesOpen && <ModesSheet key="modes" modes={modes} activeId={activeMode} onPick={setActiveMode} onEdit={id => editMode(id, 'home')}
                    onAdd={() => editMode('new', 'home')} onClose={() => setModesOpen(false)} />}
                </AnimatePresence>
                <AnimatePresence>
                  {editing && (
                    <motion.div key="edit" className="abs" style={{ inset: 0, zIndex: 46 }}
                      initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
                      <EditMode key={editing} mode={modes.find((m) => m.id === editing)} isNew={editing === 'new'} onBack={() => setEditing(null)} onSave={saveMode} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="abs" style={{ inset: 0, zIndex: 60, pointerEvents: 'none' }}><Toast text={note} icon={note && /Only|later/.test(note) ? 'info' : 'check'} /></div>
                <StatusBar shade={screen === 'search' && !venueOpen ? 0 : flow || sense ? 0 : venueOpen ? (venueScroll > 270 ? 1 : 0) : screen !== 'map' && homeScroll > 24 ? 1 : 0} />
                <TabBar active={screen} onNav={to => { nav(to); if (to === 'search') navigateSearch(searchRoute); }} top={venueOpen || modesOpen || editing || (screen === 'search' && ['search-filters','search-place'].includes(searchRoute)) ? 1000 : page ? 876 : TAB_TOP[screen]} yMV={screen === 'home' ? pull : undefined} />
                <div className="abs" style={{ left: 150, top: editing || (screen === 'home' && discoverOpen) ? 935 : 943, width: 140, height: 5, borderRadius: 3, background: screen === 'home' && discoverOpen ? '#2a2650' : screen === 'map' ? 'rgba(20,24,31,0.85)' : '#14181f', zIndex: 55 }} />
                <div className="island" />
              </div>
            </div>
          </div>
        </div>
      </ScaleCtx.Provider>
    </MotionConfig>
  );
}

