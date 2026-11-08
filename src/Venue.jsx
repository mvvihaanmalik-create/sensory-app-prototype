import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Glass, GENTLE } from './ui.jsx';
import { venueAssets } from './venueAssets.js';
import './venue.css';

export const VENUE_TABS = ['overview', 'menu', 'reviews', 'photos'];
const TAB_LABELS = { overview: 'Overview', menu: 'Menu', reviews: 'Reviews', photos: 'Photos' };
const FRAME_IDS = { overview: '789:3121', menu: '789:3335', reviews: '789:3478', photos: '789:3725' };
const SENSES = [
  ['imgPhosphorSpeakerHigh', 'Sound', 'Lively'], ['imgPhosphorSun', 'Light', 'Natural'],
  ['imgPhosphorUsers1', 'Crowd', 'Busy'], ['imgPhosphorChair', 'Seating', 'Patio'],
];
const BAR_HEIGHTS = [8, 15, 23, 31, 37, 44, 42, 52, 50, 64, 73, 85, 94, 87, 75, 67, 52, 37];
const REVIEWS = [
  { id: 'local', name: 'Local guide', meta: '42 reviews · 1 week ago', text: 'Cozy, artsy space with a lovely back patio. Great chai and kolaches. Gets busy on weekends, so come early for a seat.', tags: ['Sound · Lively', 'Crowd · Busy'], categories: ['Sound', 'Crowd'] },
  { id: 'regular', name: 'Weekend regular', meta: '8 reviews · 2 weeks ago', text: 'Lively but easy to talk at the patio tables. Natural light inside makes it a nice spot to read in the morning.', tags: ['Sound · Easy to talk', 'Light · Natural'], categories: ['Sound', 'Seating'] },
  { id: 'first', name: 'First visit', meta: '3 reviews · 1 month ago', text: 'Loved the horchata latte and the art on the walls. Parking is limited and the line moves slowly at brunch.', tags: ['Crowd · Packed', 'Seating · Patio'], categories: ['Crowd', 'Seating', 'Service'] },
];

// These SVGs are the exact Figma exports, kept at their native root dimensions.
function Asset({ name }) {
  return <img className="v-asset" src={venueAssets[name]} alt="" aria-hidden="true" data-venue-asset={name} />;
}

function Card({ children, className = '', ...rest }) {
  return <Glass className={`v-card ${className}`} radius={28} contentStyle={{ flexDirection: 'column', alignItems: 'stretch', height: 'auto' }} {...rest}>{children}</Glass>;
}

function GlassButton({ children, className = '', radius = 24, ...rest }) {
  return <motion.button type="button" className={`v-button ${className}`} whileTap={{ scale: 0.97 }} transition={GENTLE} {...rest}>
    <Glass radius={radius} style={{ position: 'relative', width: '100%', height: '100%' }} contentStyle={{ justifyContent: 'center', gap: 10 }}>{children}</Glass>
  </motion.button>;
}

function Chips({ options, selected, onSelect, className = '' }) {
  return <div className={`v-chips ${className}`}>
    {options.map(label => <GlassButton key={label} className={`v-chip ${selected === label ? 'selected' : ''}`} radius={22}
      aria-pressed={onSelect ? selected === label : undefined} onClick={onSelect ? () => onSelect(label) : undefined}>{label}</GlassButton>)}
  </div>;
}

function Stars() {
  return <span className="v-stars" aria-label="5 stars">{Array.from({ length: 5 }, (_, i) => <Asset key={i} name="imgPhosphorStarFill" />)}</span>;
}

function ReviewSummary({ onOpen }) {
  const inner = <>
    <div className="v-distribution" aria-label="Rating distribution">
      {[39.04, 8.7, 3.25, 1.81, 1.8].map((percent, i) => <div className="v-rating-line" key={i}><span>{5 - i}</span><div className="v-rating-track"><div style={{ width: `${percent}%` }} /></div></div>)}
    </div>
    <div className="v-score"><strong>4.6</strong><Stars /><span>2,600 reviews</span></div>
  </>;
  return onOpen ? <button type="button" className="v-summary-link" onClick={onOpen} aria-label="Read all 2,600 reviews"><Card className="v-review-summary">{inner}</Card></button>
    : <Card className="v-review-summary">{inner}</Card>;
}

function AIReviewSummary() {
  return <Card className="v-ai-summary">
    <div className="v-ai-title"><Asset name="imgPhosphorSparkle" /><strong>Review summary</strong></div>
    <p>People love the cozy, artsy feel, the back patio and garden pond, and the pastries — kolaches and chai come up often. Many say it gets busy on weekends and seating and parking can be tight, so mornings are calmer.</p>
    <div className="v-tags">{['Patio · 310', 'Kolache · 180', 'Chai · 150', 'Busy weekends · 120'].map(t => <span key={t}>{t}</span>)}</div>
    <p className="v-ai-footnote">Summarized by AI from 2,600 reviews</p>
  </Card>;
}

function ReviewCard({ review }) {
  const [helpful, setHelpful] = useState(false);
  return <Card className="v-review" data-review-id={review.id}>
    <div className="v-reviewer"><Asset name="imgAvatarPlaceholder" /><div><strong>{review.name}</strong><p>{review.meta}</p></div></div>
    <Stars /><p>{review.text}</p>
    <div className="v-tags">{review.tags.map(t => <span key={t}>{t}</span>)}</div>
    <button className="v-helpful" type="button" aria-pressed={helpful} onClick={() => setHelpful(v => !v)}><Asset name="imgPhosphorThumbsUp" />{helpful ? 'Helpful · 1' : 'Helpful'}</button>
  </Card>;
}

function CrowdChart() {
  const [day, setDay] = useState('Sun');
  const [bar, setBar] = useState(null);
  const [info, setInfo] = useState(false);
  const hourLabel = index => { const h = index + 6; return `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`; };
  return <Card className="v-crowd" data-node-id="708:417">
    <div className="v-crowd-header"><Asset name="imgPhosphorUsers" /><strong>Crowd</strong>
      <label className="v-day"><span className="v-sr-only">Crowd day</span><select value={day} onChange={e => { setDay(e.target.value); setBar(null); }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <option key={d}>{d}</option>)}</select><Asset name="imgPhosphorCaret" /></label>
      <button type="button" className="v-crowd-info" aria-label="About crowd estimates" aria-expanded={info} onClick={() => setInfo(v => !v)}><Asset name="imgPhosphorInfo" /></button>
    </div>
    <p className="v-crowd-status">{day === 'Sun' ? 'Live · Busier than usual' : `${day} · Typical crowd pattern`}</p>
    <div className="v-chart"><div className="v-bars">{BAR_HEIGHTS.map((height, i) => <button type="button" key={i} aria-label={`${hourLabel(i)} crowd level`} aria-pressed={bar === i} style={{ height, background: (bar ?? 11) === i ? '#5b52c9' : undefined }} onClick={() => setBar(i)} />)}</div>
      <div className="v-chart-axis">{['9a', '12p', '3p', '6p', '9p'].map((h, i) => <span key={h} style={{ left: `${[16.98, 33.02, 50.63, 67.61, 84.28][i]}%` }}>{h}</span>)}</div>
    </div>
    <p className="v-chart-hint" aria-live="polite">{info ? 'Preview of the venue’s crowd pattern.' : bar === null ? 'Tap a bar for details' : `${hourLabel(bar)} · ${BAR_HEIGHTS[bar] > 65 ? 'Busy' : BAR_HEIGHTS[bar] > 35 ? 'Moderate' : 'Quieter'}`}</p>
  </Card>;
}

const INFO_ROWS = [
  ['imgPhosphorStorefront', 'Dine-in · Takeout · Delivery'],
  ['imgPhosphorMapPin', '1919 Bull St, Savannah, GA 31401', 'map'],
  ['imgPhosphorClock', 'Open · Closes 9 PM', 'hours'],
  ['imgPhosphorForkKnife', 'foxyloxycafe.com/menu', 'menu'],
  ['imgPhosphorGlobe', 'foxyloxycafe.com', 'https://foxyloxycafe.com'],
  ['imgPhosphorPhone', '(912) 401-0543', 'tel:+19124010543'],
];

function Overview({ changeTab, onOpenMap }) {
  const [hoursOpen, setHoursOpen] = useState(false);
  return <div className="v-tab-content v-overview" role="tabpanel" id="venue-panel-overview" aria-labelledby="venue-tab-overview">
    <Card className="v-info-list">{INFO_ROWS.map(([icon, label, action], i) => <div key={label}>
      {i > 0 && <div className="v-divider" />}
      {action?.startsWith('https:') || action?.startsWith('tel:') ? <a className="v-info-row" href={action} target={action.startsWith('https:') ? '_blank' : undefined} rel="noreferrer"><Asset name={icon} /><span>{label}</span></a>
        : <button type="button" className="v-info-row" onClick={() => { if (action === 'map') onOpenMap(); if (action === 'menu') changeTab('menu'); if (action === 'hours') setHoursOpen(v => !v); }} aria-expanded={action === 'hours' ? hoursOpen : undefined}><Asset name={icon} /><span>{label}</span>{action === 'hours' && <Asset name="imgPhosphorCaretDown" />}</button>}
      {action === 'hours' && hoursOpen && <p className="v-hours-note">Today · Open until 9 PM</p>}
    </div>)}</Card>
    <h2>What's here</h2>
    <Chips className="v-wrap-chips" options={['Back patio', 'Garden pond', 'Live music', 'Beer & wine', 'Art gallery']} />
    <h2>Reviews</h2><ReviewSummary onOpen={() => changeTab('reviews')} /><AIReviewSummary /><ReviewCard review={REVIEWS[0]} />
  </div>;
}

function Menu({ changeTab }) {
  return <div className="v-tab-content" role="tabpanel" id="venue-panel-menu" aria-labelledby="venue-tab-menu">
    <h2>Popular dishes</h2>
    <div className="v-dishes hscroll">{[['Breakfast taco', 'Tex-Mex'], ['Kolache', 'Bakery'], ['Horchata latte', 'Coffee']].map(([dish, meta]) => <Card key={dish} className="v-dish"><div className="v-placeholder v-dish-photo" /><p className="v-dish-name">{dish}</p><p className="v-dish-meta">{meta}</p></Card>)}</div>
    <h2>Menu photos</h2><div className="v-menu-grid">{[0, 1, 2, 3].map(i => <button type="button" key={i} className="v-placeholder" aria-label={`View menu photo ${i + 1}`} onClick={() => changeTab('photos', 'Menu')} />)}</div>
    <a className="v-full-menu" href="https://foxyloxycafe.com/menu" target="_blank" rel="noreferrer"><Glass style={{ inset: 0 }} radius={28} contentStyle={{ gap: 14, padding: '0 18px 0 20px' }}><Asset name="imgPhosphorForkKnife" /><span>View full menu · foxyloxycafe.com</span><Asset name="imgPhosphorArrowUpRight" /></Glass></a>
  </div>;
}

function Reviews({ notify }) {
  const [filter, setFilter] = useState('All');
  const [newest, setNewest] = useState(false);
  const list = REVIEWS.filter(r => filter === 'All' || r.categories.includes(filter));
  return <div className="v-tab-content" role="tabpanel" id="venue-panel-reviews" aria-labelledby="venue-tab-reviews">
    <ReviewSummary /><AIReviewSummary />
    <GlassButton className="v-write-review" radius={26} onClick={() => notify('Review writing is coming soon.')}><Asset name="imgPhosphorPencilSimple" />Write a review</GlassButton>
    <Chips options={['All', 'Sound', 'Crowd', 'Seating', 'Service']} selected={filter} onSelect={setFilter} />
    <Chips options={[newest ? 'Newest first' : 'Most relevant']} selected="" onSelect={() => setNewest(v => !v)} />
    {(newest ? [...list].sort((a, b) => REVIEWS.indexOf(a) - REVIEWS.indexOf(b)) : list).map(r => <ReviewCard key={r.id} review={r} />)}
  </div>;
}

const PHOTO_SLOTS = [
  { height: 240, category: 'Vibe' }, { height: 180, category: 'Food & drink' }, { height: 260, category: 'Menu' }, { height: 200, category: 'Vibe' },
  { height: 180, category: 'Food & drink' }, { height: 260, category: 'Vibe' }, { height: 200, category: 'Menu' }, { height: 240, category: 'By owner' },
];

function Photos({ filter, setFilter }) {
  const all = filter === 'All' || filter === 'Latest';
  const photos = all ? PHOTO_SLOTS : PHOTO_SLOTS.filter(p => p.category === filter);
  const columns = all ? [photos.slice(0, 4), photos.slice(4)] : [photos.filter((_, i) => i % 2 === 0), photos.filter((_, i) => i % 2 === 1)];
  return <div className="v-tab-content" role="tabpanel" id="venue-panel-photos" aria-labelledby="venue-tab-photos">
    <Chips options={['All', 'Latest', 'Food & drink', 'Vibe', 'Menu', 'By owner']} selected={filter} onSelect={setFilter} />
    <div className="v-photo-columns">{columns.map((column, c) => <div key={c}>{column.map((p, i) => <div key={i} className="v-placeholder" style={{ height: p.height }} />)}</div>)}</div>
  </div>;
}

export default function Venue({ tab, onTabChange, onBack, onOpenMap, onScroll }) {
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);
  const toastTimer = useRef(null);
  const reduced = useReducedMotion();
  const [saved, setSaved] = useState(() => { try { return localStorage.getItem('sensory-foxy-saved') === 'true'; } catch { return false; } });
  const [photoFilter, setPhotoFilter] = useState('All');
  const [toast, setToast] = useState('');
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const notify = message => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 3200); };
  const toggleSaved = () => { setSaved(value => { const next = !value; try { localStorage.setItem('sensory-foxy-saved', String(next)); } catch { /* Private browsing may disable storage. */ } return next; }); };
  const changeTab = (next, filter) => { if (filter) setPhotoFilter(filter); onTabChange(next); };
  const openPhotos = () => {
    onTabChange('photos');
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: tabsRef.current?.offsetTop ?? 0, behavior: reduced ? 'instant' : 'smooth' }));
  };
  const share = async () => {
    const url = new URL(window.location.href); url.hash = 'venue-overview';
    try { if (navigator.share && location.protocol !== 'file:') await navigator.share({ title: 'Foxy Loxy Cafe', url: url.href });
      else { await navigator.clipboard.writeText(url.href); notify('Venue link copied.'); }
    } catch (error) { if (error.name !== 'AbortError') notify('Copy the address bar link to share this venue.'); }
  };
  const keyTabs = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();const index = VENUE_TABS.indexOf(tab);
    const next = e.key === 'Home' ? VENUE_TABS[0] : e.key === 'End' ? VENUE_TABS[3] : VENUE_TABS[(index + (e.key === 'ArrowRight' ? 1 : 3)) % 4];
    onTabChange(next);requestAnimationFrame(() => document.getElementById(`venue-tab-${next}`)?.focus({ preventScroll: true }));
  };

  return <div className="venue abs" style={{ inset: 0 }} data-node-id={FRAME_IDS[tab]}>
    <div className="scroll v-scroll" ref={scrollRef} onScroll={e => onScroll?.(e.currentTarget.scrollTop)}>
      <div className="v-hero v-placeholder" data-node-id="819:11" />
      <div className="v-content">
        <header className="v-title"><h1>Foxy Loxy Cafe</h1><p>4.6 ★ · 2,600 reviews · $ · Café · Tex-Mex</p></header>
        <div className="v-senses">{SENSES.map(([icon, label, value]) => <Glass className="v-sense" radius={24} key={label} angle="130.285deg" contentStyle={{ flexDirection: 'column', gap: 6, padding: '14.5px 6.5px' }}><Asset name={icon} /><span>{label}</span><strong>{value}</strong></Glass>)}</div>
        <div className="v-photo-strip hscroll" aria-label="Venue photos">{[300, 220, 220].map((w, i) => <button key={i} type="button" className="v-placeholder" style={{ width: w }} aria-label={`Open venue photos ${i + 1}`} onClick={openPhotos} />)}</div>
        <div className="v-fold-spacer" aria-hidden="true" />
        <CrowdChart />
        <div ref={tabsRef} className="v-tabs-wrap">
          <Glass className="v-tabs" radius={27} angle="171.727deg" contentStyle={{ padding: 5 }}>
            <div className="v-tablist" role="tablist" aria-label="Venue details" onKeyDown={keyTabs}>{VENUE_TABS.map(t => <button key={t} type="button" id={`venue-tab-${t}`} role="tab" aria-selected={t === tab} aria-controls={`venue-panel-${t}`} tabIndex={t === tab ? 0 : -1} onClick={() => changeTab(t)}>
              {tab === t && <motion.span className="v-tab-pill" layoutId="venue-tab-pill" transition={GENTLE} />}
              <span>{TAB_LABELS[t]}</span>
            </button>)}</div>
          </Glass>
        </div>
        {tab === 'overview' && <Overview changeTab={changeTab} onOpenMap={onOpenMap} />}
        {tab === 'menu' && <Menu changeTab={changeTab} />}
        {tab === 'reviews' && <Reviews notify={notify} />}
        {tab === 'photos' && <Photos filter={photoFilter} setFilter={setPhotoFilter} />}
      </div>
    </div>
    <nav className="v-toolbar" aria-label="Venue actions">
      <GlassButton className="v-icon-button v-back" aria-label="Back to Home" onClick={onBack}><Asset name="imgPhosphorCaretLeft" /></GlassButton>
      <GlassButton className={`v-icon-button v-save ${saved ? 'v-saved' : ''}`} aria-label={saved ? 'Unsave Foxy Loxy Cafe' : 'Save Foxy Loxy Cafe'} aria-pressed={saved} onClick={toggleSaved}><Asset name="imgPhosphorHeart" /></GlassButton>
      <GlassButton className="v-icon-button v-share" aria-label="Share Foxy Loxy Cafe" onClick={share}><Asset name="imgPhosphorExport" /></GlassButton>
    </nav>
    <div className="v-reserve-dock"><GlassButton className="v-reserve" radius={28} onClick={() => notify('Reservation flow coming soon.')}><Asset name="imgPhosphorCalendarCheck" /><strong>Reserve</strong></GlassButton></div>
    {toast && <div className="v-toast" role="status">{toast}</div>}
  </div>;
}
