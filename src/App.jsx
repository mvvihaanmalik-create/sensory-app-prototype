import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Home from './Home.jsx';
import MapScreen from './Map.jsx';
import Profile from './Profile.jsx';
import Venue, { VENUE_TABS } from './Venue.jsx';
import { ScaleCtx, StatusBar, TabBar } from './ui.jsx';

const DEVICE_W = 468, DEVICE_H = 984;
const TAB_TOP = { home: 852, map: 862, profile: 852 };
const SCREEN_IN = {
  map: { initial: { opacity: 0, scale: 1.04 }, animate: { opacity: 1, scale: 1 } },
  profile: { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } },
  venue: { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 } },
};
const EASE = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };
const VIEWS = [
  { id: 'home', label: 'Home' }, { id: 'map-half', label: 'Map' },
  { id: 'map-full', label: 'Map · sheet up' }, { id: 'map-hidden', label: 'Map · sheet away' },
  { id: 'profile', label: 'Profile' },
  ...VENUE_TABS.map(tab => ({ id: `venue-${tab}`, label: `Venue · ${tab[0].toUpperCase()}${tab.slice(1)}` })),
];
function readView() { const value = location.hash.slice(1); return VIEWS.some(v => v.id === value) ? value : 'home'; }

function useFitScale() {
  const calc = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const side = w > 900 ? 336 : 0;
    return Math.min(1, (h - 40) / DEVICE_H, (w - 32 - side) / DEVICE_W);
  };
  const [s, setS] = useState(calc);
  useEffect(() => { const f = () => setS(calc()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return s;
}

export default function App() {
  const scale = useFitScale();
  const [view, setView] = useState(readView);
  const screen = view.startsWith('map-') ? 'map' : view.startsWith('venue-') ? 'venue' : view;
  const [homeScroll, setHomeScroll] = useState(0);
  const [profileScroll, setProfileScroll] = useState(0);
  const [venueScroll, setVenueScroll] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sheetCmd, setSheetCmd] = useState(() => view.startsWith('map-') ? { state: view.slice(4), n: 0 } : null);

  useEffect(() => {
    const restore = () => { const next = readView(); setView(next); if (next.startsWith('map-')) setSheetCmd({ state: next.slice(4), n: Date.now() }); };
    window.addEventListener('popstate', restore); window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, []);

  const go = (id, replace = false) => {
    if (!VIEWS.some(v => v.id === id)) return;
    setView(id);
    if (id.startsWith('map-')) setSheetCmd({ state: id.slice(4), n: Date.now() });
    if (id.startsWith('venue-') && screen !== 'venue') setVenueScroll(0);
    try { if (location.hash !== `#${id}`) history[replace ? 'replaceState' : 'pushState'](null, '', `#${id}`); } catch { /* File previews may restrict history. */ }
  };
  const nav = to => { if (to !== 'search') go(to === 'map' ? 'map-half' : to); };
  const shade = screen === 'venue' ? venueScroll > 24 : screen === 'profile' ? profileScroll > 24 : screen === 'home' && homeScroll > 24;

  return <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}><ScaleCtx.Provider value={scale}>
    <div className="stage">
      <aside className="panel">
        <div><div className="label">UXDG 370 · Final flow</div><h1>Calm places,<br />Savannah</h1></div>
        <p className="lead">Coded prototype of Home, Map, Profile and the Foxy Loxy venue screens, built from the Figma file at 440 × 956 in an iPhone 18 Pro Max frame.</p>
        <div><div className="label">Jump to</div><div className="jump">{VIEWS.map(v => <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => go(v.id)}>{v.label}</button>)}</div></div>
        <div><div className="label">Motion</div><div className="jump"><button className={!reduceMotion ? 'on' : ''} onClick={() => setReduceMotion(false)}>Full motion</button><button className={reduceMotion ? 'on' : ''} onClick={() => setReduceMotion(true)}>Reduce motion</button></div></div>
        <div><div className="label">Try</div><div className="hints">
          <span><b>Tap Foxy Loxy</b> on the front card or in Popular Around you</span>
          <span><b>Switch venue tabs</b> between Overview, Menu, Reviews and Photos</span>
          <span><b>Scroll the venue</b> while Reserve stays fixed at the bottom</span>
          <span><b>Go back</b> to keep your place on Home</span>
          <span><b>Drag the map sheet</b> up, down, or away</span>
        </div></div>
      </aside>
      <div className="device-wrap" style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}><div className="device" style={{ transform: `scale(${scale})` }}>
        <div className="btn" style={{ left: -3, top: 196, height: 34 }} /><div className="btn" style={{ left: -3, top: 256, height: 64 }} /><div className="btn" style={{ left: -3, top: 334, height: 64 }} /><div className="btn" style={{ right: -3, top: 290, height: 104 }} />
        <div className="screen">
          {/* Keep Home mounted so returning preserves its scroll and card stack. */}
          <div className="abs" style={{ inset: 0, display: screen === 'home' ? 'block' : 'none' }} aria-hidden={screen !== 'home'}>
            <Home onOpenMap={() => nav('map')} onOpenVenue={() => go('venue-overview')} onScroll={setHomeScroll} reduceMotion={reduceMotion} />
          </div>
          <AnimatePresence>{screen !== 'home' && <motion.div key={screen} className="abs" style={{ inset: 0 }} initial={SCREEN_IN[screen].initial} animate={SCREEN_IN[screen].animate} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={EASE}>
            {screen === 'map' && <MapScreen command={sheetCmd} />}
            {screen === 'profile' && <Profile onScroll={setProfileScroll} />}
            {screen === 'venue' && <Venue tab={view.slice(6)} onTabChange={tab => go(`venue-${tab}`, true)} onBack={() => go('home', true)} onOpenMap={() => nav('map')} onScroll={setVenueScroll} />}
          </motion.div>}</AnimatePresence>
          <StatusBar shade={shade ? 1 : 0} />
          {screen !== 'venue' && <TabBar active={screen} onNav={nav} top={TAB_TOP[screen]} />}
          <div className="abs" style={{ left: 150, top: 943, width: 140, height: 5, borderRadius: 3, background: screen === 'map' ? 'rgba(20,24,31,0.85)' : '#14181f', zIndex: 55, pointerEvents: 'none' }} />
          <div className="island" />
        </div>
      </div></div>
    </div>
  </ScaleCtx.Provider></MotionConfig>;
}
