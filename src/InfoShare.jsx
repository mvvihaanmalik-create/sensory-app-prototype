// Figma: 'Sheet · How we know' (1364:326) and 'Overlay · Share place' (1404:9042).
import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Ph } from './phosphor.jsx';
import { SheetFrame } from './sheets.jsx';
import { VIcon } from './venueIcons.jsx';
import { CAROUSEL } from './venueFinalPhotos.js';
import { InfoContext, NAVY, TAP, t } from './flow.jsx';
import airdrop from './assets/share/airdrop.png';
import messages from './assets/share/messages.png';
import mail from './assets/share/mail.png';
import notes from './assets/share/notes.png';
import reminders from './assets/share/reminders.png';
import sandy from './assets/share/sandy.png';
import kevin from './assets/share/kevin.png';
import sandyKevin from './assets/share/sandy-kevin.png';
import juliana from './assets/share/juliana.png';
import greg from './assets/share/greg.png';
import coverAll from './assets/share/cover-all.png';
import coverCoffee from './assets/share/cover-coffee.png';
import coverDinner from './assets/share/cover-dinner.png';

const INK = '#2a2650', MUTED = '#5e5a7e';
const GLASS = { background: 'linear-gradient(170deg,rgba(255,255,255,.9),rgba(255,255,255,.55))', border: '1.5px solid rgba(255,255,255,.95)', boxShadow: '0 12px 32px rgba(42,38,80,.08)' };
const SHEET = { borderRadius: '24px 24px 0 0', border: 0, borderTop: '1.5px solid rgba(255,255,255,.95)', background: '#f7f5f1', boxShadow: '0 -4px 12px rgba(42,38,80,.1)' };

const Pulse = () => <svg width="24" height="24" viewBox="0 0 256 256"><path d="M72,128H24 M232,128h-40l-32-80-48,160-32-80H24" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0)" /></svg>;
const ROWS = [
  [<Pulse key="a" />, 'Live', 'Google crowd data, right now'],
  [<Ph key="b" n="users" size={24} fill={INK} />, 'From visitors', '214 check-ins and reviews'],
  [<VIcon key="c" name="storefront" size={24} fill={INK} />, 'From the venue', 'Owner-reported, updated weekly'],
  [<Ph key="d" n="calendar-blank" size={24} fill={INK} />, 'Usually', 'Typical for Sundays at this hour'],
];
export function HowWeKnow({ title, venue, onClose }) {
  return <SheetFrame height={580} onClose={onClose} sheetStyle={SHEET}>
    <p className="abs nowrap" style={{ left: 24, top: 34, ...t(24, 600, INK), lineHeight: '28px' }}>How we know</p>
    <p className="abs nowrap" style={{ left: 24, top: 65, ...t(14, 500, MUTED) }}>{title} at {venue}</p>
    <motion.button className="abs" aria-label="Close" onClick={onClose} whileTap={{ scale: .9 }} transition={TAP} style={{ right: 24, top: 36, width: 44, height: 44, borderRadius: 22, display: 'grid', placeItems: 'center', ...GLASS }}><VIcon name="x14" size={16} /></motion.button>
    <div className="abs" style={{ left: 24, top: 100, width: 392, height: 37, borderRadius: 20, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, ...GLASS, boxShadow: '0 4px 14px rgba(27,42,68,.05)' }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: '#3f9b6b' }} /><span style={t(14, 500, INK)}>Live · Updated 12 min ago</span></div>
    <div className="abs" style={{ left: 24, top: 155, width: 392, height: 257, borderRadius: 28, padding: '10px 22px', boxSizing: 'border-box', ...GLASS }}>
      {ROWS.map(([icon, a, b], i) => <div key={a} style={{ height: 59.5, display: 'flex', alignItems: 'center', gap: 14, borderTop: i ? '1px solid rgba(94,90,126,.09)' : 0 }}>
        <span style={{ width: 24, display: 'grid', placeItems: 'center' }}>{icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}><span style={t(16, 600, INK)}>{a}</span><span style={t(13, 500, MUTED)}>{b}</span></div></div>)}
    </div>
    <p className="abs" style={{ left: 24, top: 431, ...t(15, 600, INK) }}>How sure we are</p>
    <p className="abs" style={{ right: 24, top: 431, ...t(14, 500, MUTED) }}>High</p>
    <div className="abs" style={{ left: 24, top: 459, width: 392, display: 'flex', gap: 6 }}>{[1, 1, 1, 1, 0].map((on, i) => <span key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: on ? MUTED : 'rgba(94,90,126,.14)' }} />)}</div>
    <motion.button className="abs" onClick={onClose} whileTap={{ scale: .96 }} transition={TAP} style={{ left: 96, top: 482, width: 248, height: 54, borderRadius: 27, ...GLASS, ...t(16, 600, INK) }}>Something off? Tell us</motion.button>
  </SheetFrame>;
}

const CONTACTS = [['Sandy Wilder Cheng', sandy, -1], ['Kevin Leong', kevin, -1], ['Sandy and Kevin', sandyKevin, -5], ['Juliana Mejia', juliana, -1], ['Greg Apodaca', greg, -1]];
const APPS = [['AirDrop', airdrop], ['Messages', messages], ['Mail', mail], ['Notes', notes], ['Reminders', reminders]];
const LABEL = { position: 'absolute', left: -8, right: -8, top: 67, textAlign: 'center', fontSize: 11, lineHeight: '13px', letterSpacing: .06, color: '#000', fontFamily: '-apple-system, "SF Pro", system-ui, sans-serif' };
const Row = ({ children, border }) => <div style={{ width: 393, boxSizing: 'border-box', display: 'flex', gap: 26, padding: '21px 16px 28px', borderBottom: border ? '.333px solid rgba(84,84,86,.34)' : 0, overflow: 'hidden', flex: 'none' }}>{children}</div>;
export function ShareSheet({ name = 'Fern & Fable', sub = 'Café · Savannah, GA', photo = CAROUSEL[0], onClose, onCopied }) {
  const copy = () => { try { navigator.clipboard?.writeText(location.href); } catch (e) { /* clipboard unavailable */ } onCopied?.(); };
  return <SheetFrame top={379} onClose={onClose} sheetStyle={SHEET}>
    <div className="abs" style={{ left: 24, right: 16, top: 33, bottom: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ ...t(22, 600, INK), lineHeight: '27px', margin: 0 }}>Share place</p>
      <div style={{ width: 392, height: 76, flex: 'none', borderRadius: 28, padding: '0 16px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.85)', border: '1px solid rgba(20,24,31,.08)', boxShadow: '0 12px 32px rgba(27,42,68,.06)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `url(${photo}) center / cover` }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={t(17, 700, INK)}>{name}</span><span style={t(13, 500, MUTED)}>{sub}</span></div></div>
      <Row border>{CONTACTS.map(([n, src, dx]) => <div key={n} style={{ position: 'relative', width: 60, height: 80, flex: 'none' }}>
        <img src={src} alt="" style={{ position: 'absolute', left: dx, top: -2, height: 65 }} /><p style={LABEL}>{n}</p></div>)}</Row>
      <Row>{APPS.map(([n, src]) => <div key={n} style={{ position: 'relative', width: 60, height: 80, flex: 'none' }}>
        <img src={src} alt="" style={{ position: 'absolute', left: 0, top: -1, width: 60, height: 60 }} /><p style={{ ...LABEL, left: -8, right: -8 }}>{n}</p></div>)}</Row>
      <div style={{ width: 392, flex: 'none', borderRadius: 28, padding: '4px 16px', boxSizing: 'border-box', background: 'rgba(255,255,255,.85)', border: '1px solid rgba(20,24,31,.08)', boxShadow: '0 12px 32px rgba(27,42,68,.06)' }}>
        <button onClick={copy} style={{ width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', gap: 12 }}><VIcon name="link" size={22} fill={MUTED} /><span style={t(16, 500, MUTED)}>Copy link</span></button>
        <div style={{ height: 1, background: 'rgba(94,90,126,.09)' }} />
        <a href={`mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(location.href)}`} style={{ minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}><VIcon name="mail" size={22} fill={MUTED} /><span style={t(16, 500, MUTED)}>Mail</span></a>
      </div>
    </div>
  </SheetFrame>;
}

const COLLECTIONS = [['All saved', '4 saved places', coverAll], ['Coffee spots', '3 saved places', coverCoffee], ['Dinner plans', '1 saved place', coverDinner]];
const ROW = { width: 392, height: 78, flex: 'none', borderRadius: 28, padding: '0 16px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: 'rgba(255,255,255,.85)', border: '1px solid rgba(20,24,31,.08)', boxShadow: '0 12px 32px rgba(27,42,68,.06)' };
export function SaveSheet({ onPick, onNew, onClose }) {
  return <SheetFrame top={582} onClose={onClose} sheetStyle={SHEET}>
    <div className="abs" style={{ left: 24, right: 24, top: 29, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <p style={{ ...t(22, 600, INK), margin: 0 }}>Save to collection</p>
        <button onClick={onNew} style={{ minHeight: 44, padding: '0 5px', ...t(15, 500, MUTED) }}>+ New collection</button></div>
      {COLLECTIONS.map(([n, c, img]) => <motion.button key={n} style={ROW} whileTap={{ scale: .98 }} transition={TAP} onClick={() => onPick(n)}>
        <img src={img} alt="" style={{ width: 56, height: 56, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={t(17, 700, INK)}>{n}</span><span style={t(13, 500, MUTED)}>{c}</span></div></motion.button>)}
    </div>
  </SheetFrame>;
}
export function NewCollectionSheet({ onBack, onCreate, onClose }) {
  const [name, setName] = useState('Weekend cafés');
  return <SheetFrame top={705} onClose={onClose} sheetStyle={SHEET}>
    <div className="abs" style={{ left: 24, right: 24, top: 29, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <p style={{ ...t(24, 600, INK), margin: 0 }}>New collection</p>
        <button onClick={onBack} style={{ minHeight: 44, padding: '0 12px', ...t(15, 500, MUTED) }}>Back</button></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="coll-name" style={t(14, 600, INK)}>Collection name</label>
        <input id="coll-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} style={{ all: 'unset', boxSizing: 'border-box', width: '100%', padding: '15px 16px', borderRadius: 16, background: 'rgba(255,255,255,.85)', border: '1px solid rgba(20,24,31,.08)', ...t(16, 500, MUTED) }} /></div>
      <motion.button onClick={() => onCreate(name.trim())} disabled={!name.trim()} whileTap={{ scale: .97 }} transition={TAP} style={{ width: 392, padding: '15px 16px', borderRadius: 999, ...GLASS, boxShadow: '0 14px 18px rgba(42,38,80,.1)', ...t(16, 600, MUTED), opacity: name.trim() ? 1 : .5 }}>Create &amp; save</motion.button>
    </div>
  </SheetFrame>;
}
function ConfirmToast({ text }) {
  return <AnimatePresence>{text && <motion.div key={text} className="abs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .22 }}
    style={{ left: 24, top: 852, width: 392, height: 52, borderRadius: 26, padding: '0 18px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10, zIndex: 60, pointerEvents: 'none', ...GLASS, boxShadow: '0 12px 32px rgba(42,38,80,.1)' }}>
    <span style={{ ...t(17, 500, MUTED) }}>✓</span><span style={t(15, 500, MUTED)}>{text}</span></motion.div>}</AnimatePresence>;
}

// Provider: renders the "How we know" sheet for any DayChart below it, plus the share and save-to-collection sheets.
export function InfoShareHost({ venue = 'Fern & Fable', shareOpen, onShareClose, saveOpen, onSaveClose, onSaved, children }) {
  const [info, setInfo] = useState(null);
  const [newColl, setNewColl] = useState(false);
  const [toast, setToast] = useState(null);
  const open = useCallback((title) => setInfo(title), []);
  const flash = (text) => { setToast(text); setTimeout(() => setToast(null), 2200); };
  const closeSave = () => { setNewColl(false); onSaveClose?.(); };
  const saved = () => { closeSave(); onSaved?.(); flash('Saved to collection'); };
  return <InfoContext.Provider value={open}>{children}
    <AnimatePresence>{info && <HowWeKnow key="info" title={info} venue={venue} onClose={() => setInfo(null)} />}</AnimatePresence>
    <AnimatePresence>{shareOpen && <ShareSheet key="share" name={venue} onClose={onShareClose} onCopied={() => { onShareClose(); flash('Link copied'); }} />}</AnimatePresence>
    <AnimatePresence>{saveOpen && !newColl && <SaveSheet key="save" onPick={saved} onNew={() => setNewColl(true)} onClose={closeSave} />}</AnimatePresence>
    <AnimatePresence>{saveOpen && newColl && <NewCollectionSheet key="new" onBack={() => setNewColl(false)} onCreate={saved} onClose={closeSave} />}</AnimatePresence>
    <ConfirmToast text={toast} />
  </InfoContext.Provider>;
}
