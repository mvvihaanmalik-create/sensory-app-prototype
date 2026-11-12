import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useTransform } from 'motion/react';
import { uri } from './svgs.js';
import { drops, ripples, toTransition, LOOP } from './fountain.js';
import { LAMP, lampCore, lampGlow, lampHalo } from './lamp.js';
import { GENTLE, INK, INK2, useScale } from './ui.jsx';
import { SCENES } from './scenes.js';
import { usePullDown } from './Discover.jsx';
import { H } from './homeUpdateAssets.js';
import { RippleIcon } from './venueIcons.jsx';
import { VP } from './venuePhotos.js';
import { ExploreFeed } from './Explore.jsx';

const lightGlass = {
  background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 14px rgba(27,42,68,0.1)',
};
const cardGlass = {
  background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 4px 14px rgba(27,42,68,0.05)',
};
const h2 = { fontSize: 24, fontWeight: 600, lineHeight: '28px', letterSpacing: -0.36, color: INK };

function Layer({ l }) {
  const initial = {}, animate = {}, transition = {};
  for (const k of ['opacity', 'x', 'y', 'scale']) {
    const t = l.t?.[k];
    if (t) { initial[k] = t.values[0]; animate[k] = t.values; transition[k] = toTransition(t); }
  }
  return (
    <motion.div className="abs" initial={initial} animate={animate} transition={transition}
      style={{ left: l.x, top: l.y, width: l.w, height: l.h, borderRadius: l.round ? '50%' : l.cr, background: l.bg, border: l.border, boxShadow: l.glow, rotate: l.rot, filter: l.blur ? `blur(${l.blur}px)` : undefined, transformOrigin: l.rot ? '0 0' : '50% 50%', pointerEvents: 'none' }}>
      {l.k?.map((c, i) => <Layer key={i} l={c} />)}
    </motion.div>
  );
}

function MorningMotion() {
  return (
    <>
      {drops.map((d) => (
        <motion.div key={d.id} className="abs" data-node-id={d.id}
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, borderRadius: '50%', background: '#fff' }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: d.t.x.values, y: d.t.y.values, opacity: d.t.opacity.values }}
          transition={{ x: toTransition(d.t.x), y: toTransition(d.t.y), opacity: toTransition(d.t.opacity) }} />
      ))}
      {ripples.map((r) => (
        <motion.div key={r.id} className="abs" data-node-id={r.id}
          style={{ left: 130, top: 305, width: 34, height: 6, borderRadius: '50%', border: '1.2px solid #fff', transformOrigin: '50% 50%' }}
          initial={{ scale: 0.35, opacity: 0 }}
          animate={{ scale: r.t.scale.values, opacity: r.t.opacity.values }}
          transition={{ scale: toTransition(r.t.scale), opacity: toTransition(r.t.opacity) }} />
      ))}
      {/* Motion · street lamp: warm halo, glow and lantern light swelling slowly on the same 6 s loop */}
      {[
        { id: '1067:5930', size: 96, color: '#ff9a1f', blur: 12, t: lampHalo, rest: 0.3 },
        { id: '1067:5931', size: 54, color: '#ffb82e', blur: 6, t: lampGlow, rest: 0.45 },
      ].map((l) => (
        <motion.div key={l.id} className="abs" data-node-id={l.id}
          style={{ left: LAMP.x - l.size / 2, top: LAMP.y - l.size / 2, width: l.size, height: l.size, borderRadius: '50%', background: l.color, filter: `blur(${l.blur}px)`, pointerEvents: 'none' }}
          initial={{ opacity: l.rest, scale: 1 }}
          animate={{ opacity: l.t.opacity.values, scale: l.t.scale.values }}
          transition={{ opacity: toTransition(l.t.opacity), scale: toTransition(l.t.scale) }} />
      ))}
      <motion.div className="abs" data-node-id="1067:5932"
        style={{ left: LAMP.x - 5, top: LAMP.y - 7, width: 10, height: 14, borderRadius: 5, background: '#ffd17a', filter: 'blur(2px)', pointerEvents: 'none' }}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: lampCore.opacity.values }}
        transition={{ opacity: toTransition(lampCore.opacity) }} />
    </>
  );
}

function Hero({ reduce, pull, scene }) {
  const fade = useTransform(pull, [0, 120], [1, 0]);
  const pulse = reduce ? {} : {
    animate: { scale: [1, 1.025, 1] },
    transition: { duration: LOOP, times: [0, 0.5, 1], ease: 'easeInOut', repeat: Infinity },
  };
  const { off } = scene;
  return (
    <motion.div className="abs" style={{ left: 0, top: 0, width: 440, height: 314, overflow: 'hidden', borderRadius: '0 0 32px 32px', boxShadow: '0 8px 12px rgba(13,15,26,0.12)', opacity: fade }}>
      <AnimatePresence initial={false}>
      <motion.div key={scene.id} className="abs" style={{ inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.35 } }} transition={{ duration: 0.3 }}>
      {/* Scene art + its Motion layer share one 440x550 frame at y -off, pulsing about its centre */}
      <motion.div className="abs" style={{ left: 0, top: -off, width: 440, height: 550, transformOrigin: '50% 50%' }} {...pulse}>
        <img src={scene.art} alt="" className="abs" style={{ left: 0, top: off, width: 440, height: 314, display: 'block' }} />
        {!reduce && (scene.layers
          ? <div className="abs" style={{ left: 0, top: 0, width: 440, height: 550 }}>{scene.layers.map((l, i) => <Layer key={i} l={l} />)}</div>
          : (
            <div className="abs" style={{ left: 0, top: off, width: 440, height: 314 }}>
              <MorningMotion />
            </div>
          ))}
      </motion.div>
      <div className="abs" style={{ left: 0, top: 0, width: 440, height: 240, background: `linear-gradient(180deg, rgba(${scene.scrim},0.85) 0%, rgba(${scene.scrim},0.62) 60%, rgba(${scene.scrim},0) 100%)` }} />
      </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Swipe on the hero: right to left goes to the next scene, left to right to the previous one
function useHeroSwipe(el, onStep) {
  const scale = useScale();
  const sc = useRef(scale); sc.current = scale;
  const cb = useRef(onStep); cb.current = onStep;
  useEffect(() => {
    const node = el.current;
    if (!node) return undefined;
    let g = null;
    const ts = (e) => {
      if (e.touches.length !== 1) { g = null; return; }
      const t = e.touches[0], r = node.getBoundingClientRect();
      g = (t.clientY - r.top) / sc.current + node.scrollTop < 314 ? { x: t.clientX, y: t.clientY } : null;
    };
    const tm = (e) => { if (g && e.touches.length) { g.lx = e.touches[0].clientX; g.ly = e.touches[0].clientY; } };
    const te = (e) => {
      if (!g) return;
      const t = e.changedTouches[0] || { clientX: g.lx ?? g.x, clientY: g.ly ?? g.y };
      const dx = (t.clientX - g.x) / sc.current, dy = (t.clientY - g.y) / sc.current;
      g = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) cb.current?.(dx < 0 ? 1 : -1);
    };
    const tc = () => { g = null; };
    node.addEventListener('touchstart', ts, { passive: true });
    node.addEventListener('touchmove', tm, { passive: true });
    node.addEventListener('touchend', te, { passive: true });
    node.addEventListener('touchcancel', tc, { passive: true });
    return () => { node.removeEventListener('touchstart', ts); node.removeEventListener('touchmove', tm); node.removeEventListener('touchend', te); node.removeEventListener('touchcancel', tc); };
  }, [el]);
}

const CATS = [
  {k:'Cafe',label:'Café',page:'cafes',x:8.5,y:3.98,size:58.438},
  {k:'Dining',label:'Dining',page:'dining',x:0,y:-1.7,size:68},
  {k:'Nightlife',label:'Nightlife',page:'nightlife',x:7.28,y:6.43,size:54.188},
  {k:'Events',label:'Events',page:'events',x:2.13,y:-1.06,size:63.75},
  {k:'More',label:'More',page:'more',x:2.76,y:3.98,size:60.031},
];
function Categories({onOpen}) {
 return <div className="abs" style={{left:24,top:322,width:392,display:'flex',justifyContent:'space-between'}}>{CATS.map(c=><motion.button key={c.k} onClick={()=>onOpen?.(c.page)} whileTap={{scale:.92}} transition={GENTLE} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:7.685}}><div style={{width:68,height:68,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',left:c.x,top:c.y,width:c.size,height:c.size,overflow:'hidden'}}><img src={H['himg'+c.k+'TransparentPng']} alt="" style={{position:'absolute',width:c.k==='Cafe'?'110%':'100%',height:c.k==='Cafe'?'110%':'100%',left:c.k==='Cafe'?'-5%':c.k==='Events'?'0.15%':0,top:c.k==='Cafe'?'-5%':c.k==='Events'?'10.26%':0,objectFit:'contain'}}/></div></div><span style={{fontSize:12,color:INK2,lineHeight:'normal'}}>{c.label}</span></motion.button>)}</div>;
}

function SectionHeader({ top, title, onSeeAll }) {
  return (
    <div className="abs" style={{ left: 24, top, width: 392, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p className="nowrap" style={h2}>{title}</p>
      <button className="nowrap" onClick={onSeeAll} style={{ fontSize: 13, fontWeight: 700, color: INK }}>See all</button>
    </div>
  );
}

/* ---------- For you stack (component 685:328, variants Front=A/B/C) ---------- */
const VENUES = {
  A: { name: 'Foxy Loxy Café', meta: 'Café · 0.5 mi', level: 'Level 2', photo: VP.garden },
  B: { name: 'Gallery Espresso', meta: 'Café · 1.1 mi', level: 'Level 1', photo: VP.indoor },
  C: { name: 'The Sentient', meta: 'Café · 0.8 mi', level: 'Level 2' , photo: VP.bar },
};
const KEYS = ['A', 'B', 'C'];
const ROLE = {
  front: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  right: { x: 99.53, y: 11.25, rotate: 3, scale: 0.8, opacity: 0.55 },
  left: { x: -99.82, y: 0.36, rotate: -3, scale: 0.8, opacity: 0.55 },
};
const Z = { front: 3, right: 2, left: 1 };
const DOT_FOR = { A: 1, B: 2, C: 0 };

function VenueCard({ v }) {
  return (
    <>
      <img src={v.photo} alt="" className="abs" style={{inset:0,width:260,height:350,objectFit:'cover'}} />
      <div className="abs" style={{ left: 0, right: 0, top: 171, bottom: 0, borderRadius: '0 0 32px 32px', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 62%)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 62%)' }} />
      <div className="abs" style={{ inset: 0, background: 'linear-gradient(180deg, rgba(6,6,6,0) 49%, rgba(6,6,6,0.18) 64%, rgba(6,6,6,0.37) 78%, rgba(6,6,6,0.61) 100%)' }} />
      <div className="abs" style={{ left: 12, top: 12, height: 36, display: 'flex', alignItems: 'center', gap: 4, padding: '0 14px 0 8px', borderRadius: 999,
        border: '1.5px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 20px rgba(42,38,80,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
        WebkitBackdropFilter: 'blur(24px)', backdropFilter: 'blur(24px)',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.55) 14%, rgba(255,255,255,0.08) 86%), linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55))' }}>
        <RippleIcon k="rippleCard" size={28} />
        <span className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: '#2a2650' }}>{v.level}</span>
      </div>
      <div className="abs" style={{ left: 12, top: 226, width: 236, height: 112, padding: 17, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
        <p className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{v.name}</p>
        <p className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.86)' }}>{v.meta}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff', display: 'block' }} />
          <span className="nowrap" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Good fit</span>
        </div>
      </div>
    </>
  );
}

function ForYouStack({ onOpenVenue }) {
  const [front, setFront] = useState('A');
  const scale = useScale();
  const drag = useRef(null);
  const [dx, setDx] = useState(0);
  const fi = KEYS.indexOf(front);
  const roleOf = (k) => (k === front ? 'front' : k === KEYS[(fi + 1) % 3] ? 'right' : 'left');

  const dragged = useRef(false);
  const onDown = (e) => { dragged.current = false; drag.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }; };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const delta = (e.clientX - d.x) / scale, vert = (e.clientY - d.y) / scale;
    // axis lock: a mostly vertical gesture belongs to the page (pull down to Discover), so the card lets go of it
    if (!d.moved && Math.max(Math.abs(delta), Math.abs(vert)) > 6) {
      if (Math.abs(delta) > Math.abs(vert)) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); } else { drag.current = null; return; }
    }
    if (d.moved) setDx(delta);
  };
  const onUp = () => {
    const d = drag.current; drag.current = null; if (!d) return;
    dragged.current = d.moved;
    if (d.moved && Math.abs(dx) > 50) setFront(dx < 0 ? KEYS[(fi + 1) % 3] : KEYS[(fi + 2) % 3]);
    setDx(0);
  };

  return (
    <div className="abs" style={{ left: 0, top: 473, width: 440, height: 380 }}>
      {KEYS.map((k) => {
        const role = roleOf(k);
        const isFront = role === 'front';
        return (
          <motion.div key={k} className="abs"
            style={{ left: 90, top: 0, width: 260, height: 350, zIndex: Z[role], transformOrigin: '50% 50%', cursor: isFront ? 'grab' : 'pointer', touchAction: 'pan-y' }}
            initial={false}
            animate={{ ...ROLE[role], x: ROLE[role].x + (isFront ? dx : 0), rotate: ROLE[role].rotate + (isFront ? dx / 40 : 0) }}
            transition={isFront && dx !== 0 ? { type: 'spring', stiffness: 600, damping: 40 } : GENTLE}
            onClick={() => { if (dragged.current) return; if (!isFront) setFront(k); else if (k === 'A') onOpenVenue?.(); }}
            onPointerDown={isFront ? onDown : undefined} onPointerMove={isFront ? onMove : undefined}
            onPointerUp={isFront ? onUp : undefined} onPointerCancel={isFront ? onUp : undefined}
            whileTap={!isFront ? { scale: 0.78 } : undefined}>
            <div className="abs" style={{ inset: 0, borderRadius: 32, overflow: 'hidden', background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 12px 32px rgba(27,42,68,0.06)',
              isolation: 'isolate', transform: 'translateZ(0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
              <VenueCard v={VENUES[k]} />
            </div>
          </motion.div>
        );
      })}
      <div className="abs" style={{ left: 196, top: 364, display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => {
          const on = DOT_FOR[front] === i;
          return <motion.div key={i} initial={false} animate={{ width: on ? 22 : 7, backgroundColor: on ? '#14181f' : '#c9d2de' }} transition={GENTLE}
            style={{ height: 7, borderRadius: 4 }} />;
        })}
      </div>
    </div>
  );
}

function RankingRow({ top, n, name, meta, level, onClick, photo, wordmark }) {
  return (
    <motion.button className="abs" onClick={onClick} whileTap={{ scale: 0.985 }} transition={GENTLE}
      style={{ left: 24, top, width: 392, height: 92, borderRadius: 24, ...cardGlass, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', textAlign: 'left' }}>
      <span style={{ ...h2, width: 22 }}>{n}</span>
      {wordmark ? <div style={{width:56,height:56,borderRadius:28,background:'#fff8ef',color:'#c62f29',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontWeight:700,flex:'none'}}><span style={{fontSize:11,lineHeight:'11px',textAlign:'center'}}>FOXY<br/>LOXY</span><span style={{fontSize:6}}>CAFÉ</span></div> : <img src={photo} alt="" style={{width:56,height:56,objectFit:'cover',borderRadius:12,display:'block'}}/>}
      <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK }}>{name}</span>
        <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>{meta}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <RippleIcon k={level === 1 ? 'ripple1' : 'ripple2'} size={36} />
        <span style={{ fontSize: 17, fontWeight: 700, color: INK }}>{level}</span>
      </span>
    </motion.button>
  );
}

export default function Home({ onOpenMap, onOpenSearch, onOpenVenue, onOpenPage, onOpenModes, modeLabel = 'Study mode', onScroll, reduceMotion, pull, onDiscover, pullOn = true, onOpenExplore, exploreLiked, scene = 'morning', onStepScene }) {
  const sc = SCENES.find((x) => x.id === scene) || SCENES[0];
  const sub = sc.sub, left = sub ? 24 : 23;
  const scrollRef = useRef(null);
  usePullDown({ el: scrollRef, pull, enabled: pullOn, onCommit: onDiscover });
  useHeroSwipe(scrollRef, onStepScene);
  const r = useTransform(pull, [0, 24], [0, 32]);
  const sh = useTransform(pull, [0, 24], ['0 -10px 28px rgba(42,38,80,0)', '0 -10px 28px rgba(42,38,80,0.12)']);
  return (
    <motion.div className="abs" style={{ inset: 0, y: pull, overflow: 'hidden', background: '#f7f5f1', borderTopLeftRadius: r, borderTopRightRadius: r, boxShadow: sh, zIndex: 1, userSelect: 'none', WebkitUserSelect: 'none' }} onDragStart={(e) => e.preventDefault()}>
    <div ref={scrollRef} className="scroll" style={{ background: '#f7f5f1' }} onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}>
      <div style={{ position: 'relative', width: 440, height: 2663 }}>
        <Hero reduce={reduceMotion} pull={pull} scene={sc} />
        <p className="abs nowrap" style={{ left: 24, top: 59, fontSize: 15, fontWeight: 500, color: sc.dark ? 'rgba(255,255,255,0.8)' : INK2 }}>Savannah, GA</p>
        <motion.button className="abs nowrap" onClick={onOpenModes} whileTap={{ scale: 0.95 }} transition={GENTLE}
          style={{ right: 22, top: 46, height: 44, padding: '0 16px', borderRadius: 999, ...lightGlass, fontSize: 15, fontWeight: 500, color: INK }}>
          {modeLabel}
        </motion.button>
        <p className="abs nowrap" style={{ left: 24, top: 90, fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: sc.dark ? '#fff' : INK }}>{sc.greeting}</p>
        {sub && <p className="abs nowrap" style={{ left: 24, top: 140, fontSize: 16, color: sc.dark ? 'rgba(255,255,255,0.8)' : INK2 }}>{sub}</p>}
        <button type="button" onClick={onOpenSearch} className="abs" style={{ left, top: sub ? 175 : 145, width: 334, height: 52, borderRadius: 999, ...lightGlass, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          <img src={uri('searchHome')} alt="" style={{ width: 20, height: 20, display: 'block' }} />
          <span style={{ fontSize: 16, color: sc.ph }}>Search places</span>
        </button>
        <motion.button className="abs" whileTap={{ scale: 0.92 }} transition={GENTLE}
          style={{ left: sub ? 368 : 367, top: sub ? 177 : 147, width: 48, height: 48, borderRadius: 24, ...lightGlass }}>
          <img src={uri('filterHome')} alt="" className="abs" style={{ left: 11, top: 11, width: 24, height: 24 }} />
        </motion.button>

        <Categories onOpen={onOpenPage} />
        <SectionHeader top={421.17} title="For you" onSeeAll={() => onOpenPage?.('foryou')} />
        <ForYouStack onOpenVenue={onOpenVenue} />

        <SectionHeader top={946} title="Popular Around you" onSeeAll={() => onOpenPage?.('popular')} />
        <RankingRow top={998} n={1} photo={H.himgPhotoSlot} name="Gallery Espresso" meta="Café · 1.1 mi" level={1} />
        <RankingRow top={1106} n={2} wordmark name="Foxy Loxy Café" meta="Café · 0.5 mi" level={2} onClick={onOpenVenue} />
        <RankingRow top={1214} n={3} photo={H.himgPhotoSlot2} name="The Sentient" meta="Café · 0.8 mi" level={2} />

        <div className="abs" style={{ left: 24, top: 1346, width: 392, height: 164, borderRadius: 24, overflow: 'hidden', background: '#c2ddd2', boxShadow: '0 12px 32px rgba(27,42,68,0.06)' }}>
          <span className="abs nowrap" style={{ left: 24, top: 24, padding: '4px 12px', borderRadius: 999, background: INK, color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(27,42,68,0.12)' }}>Quiet hour</span>
          <p className="abs nowrap" style={{ ...h2, left: 24, top: 60 }}>The Sentient</p>
          <p className="abs nowrap" style={{ left: 24, top: 96, fontSize: 15, fontWeight: 500, color: INK2 }}>2 – 4 pm · 10% off pastries</p>
          <button className="abs nowrap" style={{ left: 24, top: 122, fontSize: 13, fontWeight: 700, color: INK }}>Plan a calm visit</button>
        </div>

        <img src={H.himgIllustrationCatchup} alt="" className="abs" style={{left:267,top:1346,width:164,height:164,objectFit:'contain',pointerEvents:'none'}}/>
        <ExploreFeed onOpen={onOpenExplore} liked={exploreLiked}/>
        <motion.button className="abs" onClick={onOpenMap} whileTap={{ scale: 0.98 }} transition={GENTLE}
          style={{ left: 24, top: 1550, width: 392, height: 80, borderRadius: 24, ...cardGlass, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px 18px 20px', textAlign: 'left' }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK }}>Rather see a map?</span>
            <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2 }}>Calm spots around you, by noise level</span>
          </span>
          <span className="nowrap" style={{ border: '1.5px solid rgba(20,24,31,0.08)', borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: INK, whiteSpace: 'pre' }}>{'Open map  →'}</span>
        </motion.button>
      </div>
    </div>
    </motion.div>
  );
}

