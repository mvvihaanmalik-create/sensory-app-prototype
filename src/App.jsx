import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Home from './Home.jsx';
import MapScreen from './Map.jsx';
import Profile from './Profile.jsx';
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
    const side = w > 900 ? 336 : 0;
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
];

export default function App() {
  const scale = useFitScale();
  const initial = (() => { const h = (location.hash || '').slice(1); return VIEWS.some((v) => v.id === h) ? h : 'home'; })();
  const [screen, setScreen] = useState(initial.startsWith('map') ? 'map' : initial);
  const [sheetCmd, setSheetCmd] = useState(initial.startsWith('map-') && initial !== 'map-half' ? { state: initial.slice(4), n: 0 } : null);
  const [homeScroll, setHomeScroll] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const nav = (to) => {
    if (to === 'search') return; // no Search screen designed yet
    if (to !== screen) { setScreen(to); setHomeScroll(0); setSheetCmd(null); }
  };
  const jump = (id) => {
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
            <p className="lead">Coded prototype of the finalised Home, Map and Profile screens, built from the Figma file at 440 × 956 in an iPhone 18 Pro Max frame.</p>
            <div>
              <div className="label">Jump to</div>
              <div className="jump">
                {VIEWS.map((v) => {
                  const on = v.id === 'home' ? screen === 'home' : v.id === 'profile' ? screen === 'profile' : false;
                  return <button key={v.id} className={on ? 'on' : ''} onClick={() => jump(v.id)}>{v.label}</button>;
                })}
              </div>
            </div>
            <div>
              <div className="label">Motion</div>
              <div className="jump">
                <button className={!reduceMotion ? 'on' : ''} onClick={() => setReduceMotion(false)}>Full motion</button>
                <button className={reduceMotion ? 'on' : ''} onClick={() => setReduceMotion(true)}>Reduce motion</button>
              </div>
            </div>
            <div>
              <div className="label">Try</div>
              <div className="hints">
                <span><b>Tap or swipe</b> the For you cards to bring one forward</span>
                <span><b>Open map</b> at the bottom of Home, or the map tab</span>
                <span><b>Drag the sheet</b> up, down, or away; tap its header to expand</span>
                <span><b>Sheet away:</b> filters slide in; drag up from the bottom edge to bring it back</span>
              </div>
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
                    {screen === 'home' && <Home onOpenMap={() => nav('map')} onScroll={setHomeScroll} reduceMotion={reduceMotion} />}
                    {screen === 'map' && <MapScreen command={sheetCmd} />}
                    {screen === 'profile' && <Profile onScroll={setHomeScroll} />}
                  </motion.div>
                </AnimatePresence>
                <StatusBar shade={screen !== 'map' && homeScroll > 24 ? 1 : 0} />
                <TabBar active={screen} onNav={nav} top={TAB_TOP[screen]} />
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
