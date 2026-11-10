// Search tab (Figma 985:6709): search bar, filter chips and the 19 illustrated category cards.
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { uri } from './svgs.js';
import { Glass, GENTLE, NAVY } from './ui.jsx';
import fits from './assets/search/fits.png';
import saved from './assets/search/saved.png';
import fresh from './assets/search/new.png';
import cozy from './assets/search/cozy.png';
import lowkey from './assets/search/lowkey.png';
import buzzing from './assets/search/buzzing.png';
import romantic from './assets/search/romantic.png';
import brunch from './assets/search/brunch.png';
import catchup from './assets/search/catchup.png';
import study from './assets/search/study.png';
import live from './assets/search/live.png';
import quiet from './assets/search/quiet.png';
import natural from './assets/search/natural.png';
import outdoor from './assets/search/outdoor.png';
import booths from './assets/search/booths.png';
import cafes from './assets/search/cafes.png';
import restaurants from './assets/search/restaurants.png';
import bakeries from './assets/search/bakeries.png';
import events from './assets/search/events.png';

// text = the label as Figma breaks it across lines; top = text offset (Like your saved places sits 7px higher)
const SECTIONS = [
  { id: 'made', title: 'Made for you', cards: [
    { k: 'fits', text: ['Fits you', 'tonight'], bg: '#c7cedf', img: fits, page: 'foryou' },
    { k: 'saved', text: ['Like your', 'saved', 'places'], bg: '#b6d6cf', img: saved, top: 9, page: 'foryou' },
    { k: 'new', text: ['New in', 'Savannah'], bg: '#efcbc6', img: fresh } ] },
  { id: 'moods', title: 'Moods', cards: [
    { k: 'cozy', text: ['Cozy'], bg: '#e7cfba', img: cozy }, { k: 'lowkey', text: ['Low-key'], bg: '#cfd7bb', img: lowkey },
    { k: 'buzzing', text: ['Buzzing'], bg: '#bedbe8', img: buzzing }, { k: 'romantic', text: ['Romantic'], bg: '#e9c2cd', img: romantic } ] },
  { id: 'activities', title: 'Activities', cards: [
    { k: 'brunch', text: ['Brunch'], bg: '#eddbad', img: brunch, page: 'cafes' }, { k: 'catchup', text: ['Catchup'], bg: '#c2ddd2', img: catchup, page: 'cafes' },
    { k: 'study', text: ['Study &', 'work'], bg: '#c8d6e4', img: study, page: 'cafes' }, { k: 'live', text: ['Live music'], bg: '#d8cae2', img: live, page: 'events' } ] },
  { id: 'sensory', title: 'Sensory picks', cards: [
    { k: 'quiet', text: ['Quiet now'], bg: '#c4dcd5', img: quiet, page: 'cafes' }, { k: 'natural', text: ['Natural', 'light'], bg: '#eee0ba', img: natural, page: 'cafes' },
    { k: 'outdoor', text: ['Outdoor', 'seating'], bg: '#ccddbe', img: outdoor, page: 'cafes' }, { k: 'booths', text: ['Booths &', 'corners'], bg: '#e3cdbf', img: booths, page: 'dining' } ] },
  { id: 'types', title: 'Place types', cards: [
    { k: 'cafes', text: ['Cafés'], bg: '#dccdbc', img: cafes, page: 'cafes' }, { k: 'restaurants', text: ['Restaurants'], bg: '#eccbbf', img: restaurants, page: 'dining' },
    { k: 'bakeries', text: ['Bakeries'], bg: '#ebd7b4', img: bakeries, page: 'cafes' }, { k: 'events', text: ['Events'], bg: '#d9cbe6', img: events, page: 'events' } ] },
];
const CHIPS = [['All', null], ['Made for you', 'made'], ['Moods', 'moods'], ['Activities', 'activities'], ['Events', 'events']];

function Card({ c, i, onTap }) {
  return (
    <motion.button onClick={() => onTap(c)} whileTap={{ scale: 0.97 }} layout="position" transition={{ layout: GENTLE, default: { type: 'spring', stiffness: 520, damping: 32 } }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      aria-label={c.text.join(' ')} style={{ position: 'relative', width: 192, height: 108, flex: 'none', textAlign: 'left', display: 'block' }}>
      <span className="abs" style={{ left: 0, top: 0, width: 192, height: 77, borderRadius: 8, background: c.bg }} />
      <img src={c.img} alt="" draggable={false} className="abs" style={{ left: 96, top: 4, width: 103, height: 103, objectFit: 'contain', pointerEvents: 'none' }} />
      <span className="abs" style={{ left: 16, top: c.top ?? 16, width: 160, fontSize: 17, fontWeight: 600, lineHeight: '20px', color: '#fff8ef', pointerEvents: 'none' }}>
        {c.text.map((l) => <span key={l} style={{ display: 'block', whiteSpace: 'nowrap' }}>{l}</span>)}
      </span>
    </motion.button>
  );
}

export default function Search({ onOpenPage, onNote, onScroll }) {
  const [chip, setChip] = useState('All');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const only = CHIPS.find((c) => c[0] === chip)[1];
    return SECTIONS.filter((s) => !only || s.id === only)
      .map((s) => ({ ...s, cards: s.cards.filter((c) => !term || c.text.join(' ').toLowerCase().includes(term) || s.title.toLowerCase().includes(term)) }))
      .filter((s) => s.cards.length);
  }, [chip, q]);
  const tapCard = (c) => (c.page ? onOpenPage(c.page) : onNote('This category page comes later in the prototype'));
  const tapChip = (name) => (name === 'Events' ? onOpenPage('events') : setChip(name));
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      {/* Header: search + filter + chips, fixed above the scrolling categories */}
      <Glass radius={26} angle="170deg" style={{ left: 24, top: 62, width: 328, height: 52, zIndex: 6, position: 'absolute' }} contentStyle={{ gap: 12, padding: '0 16.5px' }}>
        <img src={uri('mapSearch')} alt="" style={{ width: 22, height: 22, display: 'block' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search places" aria-label="Search places"
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 0, fontSize: 16, fontWeight: 500, color: NAVY, fontFamily: 'inherit' }} />
      </Glass>
      <Glass radius={26} style={{ left: 364, top: 62, width: 52, height: 52, zIndex: 6, position: 'absolute' }} contentStyle={{ justifyContent: 'center' }} className="press"
        onClick={() => onNote('Filters come later in the prototype')} role="button" aria-label="Filters">
        <img src={uri('sliders')} alt="" style={{ width: 22, height: 22, display: 'block' }} />
      </Glass>
      <div className="abs hscroll" style={{ left: 0, top: 120, width: 440, height: 90, pointerEvents: 'none', zIndex: 6 }}>
        <div style={{ display: 'flex', gap: 8, padding: '8px 24px 36px', width: 'max-content' }}>
          {CHIPS.map(([c]) => {
            const on = chip === c;
            return (
              <motion.button key={c} onClick={() => tapChip(c)} whileTap={{ scale: 0.95 }} transition={GENTLE} aria-pressed={on}
                className="glass" style={{ position: 'relative', height: 44, borderRadius: 22, pointerEvents: 'auto', borderColor: on ? '#fff' : 'rgba(255,255,255,.95)', '--ga': '157.6deg' }}>
                <div className="g-bg" style={on ? { background: 'rgba(255,255,255,0.92)' } : undefined} />
                <span className="g-c nowrap" style={{ padding: '0 20px', fontSize: 15, fontWeight: on ? 600 : 500, color: on ? NAVY : 'rgba(42,38,80,0.8)' }}>{c}</span>
                <div className="g-in" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="scroll hide-sb" style={{ inset: '193px 0 0 0' }} onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}>
        <div style={{ padding: '0 20px 150px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 763 }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((s) => (
              <motion.section key={s.id} layout="position" transition={GENTLE} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: '24px', color: NAVY }}>{s.title}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', width: 400 }}>
                  {s.cards.map((c, i) => <Card key={c.k} c={c} i={i} onTap={tapCard} />)}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
          {!shown.length && <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(42,38,80,0.6)', padding: '24px 4px' }}>No categories match "{q.trim()}"</p>}
        </div>
      </div>
    </div>
  );
}
