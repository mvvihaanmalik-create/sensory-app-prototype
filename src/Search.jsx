import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { Glass, GENTLE } from './ui.jsx';
import { searchAssets } from './searchAssets.js';
import { FILTERS, SEARCH_GROUPS, PLACES, searchPlaces } from './searchData.js';
import './search.css';

const CHIPS = [['All', 61], ['Made for you', 133], ['Moods', 89], ['Activities', 107], ['Events', 89]];
const asset = name => searchAssets[`imgIllustration${name}`];
function Pill({ children, selected, className = '', ...props }) {
  return <motion.button type="button" className={`s-pill ${selected ? 'selected' : ''} ${className}`} whileTap={{ scale: .96 }} transition={GENTLE} {...props}>
    <Glass radius={22} angle="157.65deg" style={{ position: 'relative', height: '100%', width: '100%' }} contentStyle={{ justifyContent: 'center', padding: '0 18.5px' }}>{children}</Glass>
  </motion.button>;
}

function SheetLayer({ children }) {
  const present = useIsPresent();
  return <motion.div className="s-overlay" aria-hidden={!present || undefined} style={{ pointerEvents: present ? 'auto' : 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={GENTLE}>{children}</motion.div>;
}

export default function Search({ route, active, onNavigate, onBack, onOpenVenue, hasSaved = false, activeMode, booking }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState([]);
  const [draft, setDraft] = useState([]);
  const [place, setPlace] = useState(() => PLACES.find(p => p.id === 'gallery'));
  const browseRef = useRef(null), resultsRef = useRef(null), inputRef = useRef(null), dialogRef = useRef(null);
  const returnRoute = useRef('search');
  const reduce = useReducedMotion();
  const modal = route === 'search-filters' || route === 'search-place';
  const underlying = modal ? returnRoute.current : route;
  const results = searchPlaces(query, category, filters, hasSaved, activeMode);
  const draftResults = searchPlaces(query, category, draft, hasSaved, activeMode);
  const conflict = (filters.includes('Quiet') || activeMode?.prefs?.sound === 'Quiet') && ['Buzzing', 'Live music'].includes(category);
  const close = () => onBack(returnRoute.current);

  useEffect(() => {
    if (route === 'search') { setQuery(''); setCategory(''); }
    if (route === 'search-filters') setDraft(filters);
    if (modal) { const previous = document.activeElement; dialogRef.current?.focus(); return () => previous?.focus?.(); }
  }, [route]); // Drafts are initialized once on entry, then committed only by Apply.

  const navigateResults = () => { if (route !== 'search-results') onNavigate('search-results'); };
  const chooseCategory = label => { setCategory(label); setQuery(''); resultsRef.current?.scrollTo(0, 0); navigateResults(); };
  const chooseGroup = label => {
    setGroup(label);
    if (label === 'Events') chooseCategory('Events');
    else { setQuery(''); setCategory(''); onNavigate('search', route === 'search-results'); browseRef.current?.scrollTo(0, 0); }
  };
  const openFilters = () => { returnRoute.current = route; setDraft(filters); onNavigate('search-filters'); };
  const openPlace = p => {
    if (p.id === 'foxy') onOpenVenue();
    else { setPlace(p); returnRoute.current = route; onNavigate('search-place'); }
  };
  const reset = () => { setQuery(''); setCategory(''); setFilters([]); setGroup('All'); onNavigate('search', true); };
  const goBack = () => { setQuery(''); setCategory(''); onNavigate('search', true); };
  const apply = () => {
    setFilters(draft); resultsRef.current?.scrollTo(0, 0);
    onNavigate(draft.length || query.trim() || category ? 'search-results' : returnRoute.current, true);
  };
  const handleDialogKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const items = [...dialogRef.current.querySelectorAll('button, input, [tabindex="0"]')].filter(el => !el.disabled);
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  };

  return <div className="s-page" data-node-id="985:6872">
    <div inert={modal ? '' : undefined} aria-hidden={modal || undefined}>
      <form className="s-search" role="search" onSubmit={e => { e.preventDefault(); if (query.trim()) { navigateResults(); inputRef.current.blur(); } else inputRef.current.focus(); }}>
        <Glass radius={26} angle="169.97deg" style={{ inset: 0 }} contentStyle={{ gap: 12, padding: '0 16.5px' }}>
          <img src={searchAssets.imgSearch} width="22" height="22" alt="" />
          <input ref={inputRef} aria-label="Search places" placeholder="Search places" value={query} autoComplete="off" enterKeyHint="search" onChange={e => { setQuery(e.target.value); setCategory(''); resultsRef.current?.scrollTo(0, 0); if (e.target.value.trim()) navigateResults(); }} />
          {query && <button type="button" className="s-clear" aria-label="Clear search" onClick={() => { setQuery(''); if (!category && !filters.length) onNavigate('search', true); inputRef.current.focus(); }}>×</button>}
        </Glass>
      </form>
      <motion.button className="s-filter" type="button" aria-label={filters.length ? `Filters, ${filters.length} active` : 'Filters'} onClick={openFilters} whileTap={{ scale: .94 }} transition={GENTLE}>
        <Glass radius={26} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={searchAssets.imgFilters} width="22" height="22" alt="" />{filters.length > 0 && <span className="s-badge">{filters.length}</span>}</Glass>
      </motion.button>
      <nav className="s-chips hscroll" aria-label="Search categories"><div>{CHIPS.map(([label, width]) => <Pill key={label} selected={group === label} aria-pressed={group === label} style={{ width }} onClick={e => { chooseGroup(label); e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'instant' : 'smooth' }); }}>{label}</Pill>)}</div></nav>

      <div ref={browseRef} className="s-viewport scroll" style={{ display: underlying === 'search' ? 'block' : 'none' }} aria-label="Browse search categories">
        <motion.div className="s-groups" layout transition={GENTLE}>
          {SEARCH_GROUPS.filter(g => group === 'All' || group === 'Events' || g.name === group).map(g => <motion.section key={g.name} layout transition={GENTLE} aria-label={g.name}>
            <h2>{g.name}</h2><div className="s-grid">{g.cards.map(([label, illustration, color, display]) => <motion.button type="button" key={label} className="s-category" onClick={() => chooseCategory(label)} whileTap={{ scale: .96 }} transition={GENTLE} aria-label={label}>
              <span className="s-card-bg" style={{ background: color }}/><span className="s-card-label" style={{ top: label === 'Like your saved places' ? 9 : 16 }}>{display || label}</span><img src={asset(illustration)} alt="" draggable="false" />
            </motion.button>)}</div>
          </motion.section>)}
        </motion.div>
      </div>

      <div ref={resultsRef} className="s-viewport scroll" style={{ display: underlying === 'search-results' ? 'block' : 'none' }} aria-label="Search results">
        <motion.div className="s-results" layout transition={GENTLE}>
          <div className="s-results-heading"><button type="button" className="s-back" aria-label="Back to browse" onClick={goBack}>‹</button><div><h2>{category || (query.trim() ? `“${query.trim()}”` : 'Places for you')}</h2><p role="status">{results.length} {results.length === 1 ? 'match' : 'matches'} in Savannah</p></div></div>
          {(category || filters.length > 0) && <div className="s-active-filters">{category && <Pill selected onClick={() => setCategory('')} aria-label={`Remove ${category}`}>{category} ×</Pill>}{filters.map(f => <Pill key={f} selected onClick={() => setFilters(v => v.filter(x => x !== f))} aria-label={`Remove ${f}`}>{f} ×</Pill>)}</div>}
          {conflict && <Glass radius={24} className="s-message"><h3>Looking for quiet?</h3><p>{!filters.includes('Quiet') && activeMode?.prefs?.sound === 'Quiet' ? `${activeMode.name} mode prefers quiet. ` : ''}{category} spots tend to be lively. Try quieter places instead.</p><Pill onClick={() => { setCategory('Quiet now'); setQuery(''); setFilters(v => v.includes('Quiet') ? v : [...v, 'Quiet']); }}>Find quiet places</Pill></Glass>}
          {results.length === 0 && !conflict && <Glass radius={28} className="s-message"><h3>{category === 'Like your saved places' && !hasSaved ? 'Start with a saved place' : 'No matches this time'}</h3><p>{category === 'Like your saved places' && !hasSaved ? 'Save Foxy Loxy using the heart on its venue page or in Discovery, then come back for similar places.' : 'Try a different search or remove a filter to see more places.'}</p><Pill onClick={reset}>Browse all categories</Pill></Glass>}
          <AnimatePresence initial={false} mode="popLayout">{(underlying === 'search-results' ? results : []).map(p => <motion.button layout key={p.id} className="s-result-button" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={GENTLE} whileTap={{ scale: .98 }} onClick={() => openPlace(p)} aria-label={`View ${p.name}`}>
            <Glass radius={28} className="s-result"><div className="s-result-art" style={{ background: p.color }}><img src={asset(p.art)} alt="" /></div><div className="s-result-info"><h3>{p.name}</h3><p>{p.type} · {p.area}</p><span>{p.sound} · {p.light} light · {p.distance}</span>{p.id === 'foxy' && booking && <span>Booked · {booking.guests} guests · {booking.time}</span>}</div><span className="s-chevron">›</span></Glass>
          </motion.button>)}</AnimatePresence>
          <p className="s-fixture-note">Prototype examples · sensory conditions are sample data.</p>
        </motion.div>
      </div>
    </div>
    <AnimatePresence>{modal && active && <SheetLayer>
      <button className="s-scrim" aria-label="Dismiss sheet" type="button" onClick={close}/>
      <motion.div ref={dialogRef} className="s-sheet" role="dialog" aria-modal="true" aria-label={route === 'search-filters' ? 'Search filters' : place.name} tabIndex={-1} onKeyDown={handleDialogKey} initial={{ y: 550 }} animate={{ y: 0 }} exit={{ y: 550 }} transition={GENTLE} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .35 }} onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 500) close(); }}>
        <div className="s-handle"/><div className="s-sheet-heading"><h2>{route === 'search-filters' ? 'Make it your kind of place' : place.name}</h2><button type="button" className="s-close" aria-label="Close sheet" onClick={close}>×</button></div>
        {route === 'search-filters' ? <><p className="s-sheet-intro">Choose what feels comfortable. All preferences are optional.</p><div className="s-filter-options">{FILTERS.map(f => <Pill key={f} selected={draft.includes(f)} aria-pressed={draft.includes(f)} onClick={() => setDraft(v => v.includes(f) ? v.filter(x => x !== f) : [...v, f])}>{f}{draft.includes(f) ? ' ✓' : ''}</Pill>)}</div><div className="s-sheet-actions"><button type="button" onClick={() => setDraft([])}>Reset filters</button><Pill selected onClick={apply}>Show {draftResults.length} {draftResults.length === 1 ? 'match' : 'matches'}</Pill></div></> : <><div className="s-place-art" style={{ background: place.color }}><img src={asset(place.art)} alt=""/></div><p className="s-sheet-intro">{place.type} · {place.area} · {place.distance}</p><div className="s-place-senses">{[['Sound', place.sound], ['Light', place.light], ['Crowd', place.crowd], ['Seating', place.seating]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="s-fixture-note">Sample venue preview. Full venue screens are currently available for Foxy Loxy.</p><Pill selected onClick={close}>Done</Pill></>}
      </motion.div>
    </SheetLayer>}</AnimatePresence>
  </div>;
}
