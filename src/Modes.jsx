// Modes (Figma section 905:17958): "Your modes" sheet, Edit mode (Study, Party, custom) and Add custom mode.
// The preference picker sheet is not in Figma; it reuses the Sound sheet pattern.
import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GENTLE, INK, INK2, NAVY, MUTED, Icon } from './ui.jsx';
import { paths } from './svgs.js';
import { TAP } from './flow.jsx';
import { VIcon } from './venueIcons.jsx';
import { SheetFrame, CloseX, DarkCTA, TextBtn } from './sheets.jsx';
import { BackBtn } from './Lists.jsx';

const card = { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 12px 32px rgba(27,42,68,0.06)' };

export const emptyPrefs = () => ({ sound: null, light: { b: null, tone: null, src: null }, crowd: null, seat: { pos: null, layout: null } });
export const INITIAL_MODES = [
  { id: 'study', name: 'Study', desc: 'Quiet & focused',
    prefs: { sound: 'Quiet', light: { b: 'Bright', tone: 'Warm', src: 'Natural daylight' }, crowd: 'Relaxed', seat: { pos: 'Corner seat', layout: 'Table with space' } } },
  { id: 'party', name: 'Party', desc: 'Vibrant & social',
    prefs: { sound: 'Lively', light: { b: 'Dim', tone: 'Warm', src: 'Indirect light' }, crowd: 'Busy', seat: { pos: 'Bar seat', layout: 'Communal table' } } },
];
export const modeLabel = (m) => (m.custom ? m.name : `${m.name} mode`);

const lines = (a) => { const l = a.filter(Boolean); return l.length ? l : null; };
const SENSES = [
  { key: 'sound', label: 'Sound', icon: 'sound', summary: (p) => lines([p.sound]),
    groups: [{ id: 'sound', label: 'How loud', options: ['Quiet', 'Moderate', 'Lively', 'Loud'] }] },
  { key: 'light', label: 'Lighting', icon: 'light', summary: (p) => lines([[p.light.b, p.light.tone].filter(Boolean).join(' · '), p.light.src]),
    groups: [{ id: 'b', label: 'Brightness', options: ['Dim', 'Bright'] }, { id: 'tone', label: 'Tone', options: ['Warm', 'Cool'] }, { id: 'src', label: 'Source', options: ['Natural daylight', 'Indirect light'] }] },
  { key: 'crowd', label: 'Crowd', icon: 'crowd', summary: (p) => lines([p.crowd]),
    groups: [{ id: 'crowd', label: 'How busy', options: ['Relaxed', 'Moderate', 'Busy'] }] },
  { key: 'seat', label: 'Seating', icon: 'seat', summary: (p) => lines([[p.seat.pos, p.seat.layout].filter(Boolean).join(' · ')]),
    groups: [{ id: 'pos', label: 'Where', options: ['Corner seat', 'Booth', 'Bar seat', 'Patio'] }, { id: 'layout', label: 'Layout', options: ['Table with space', 'Communal table'] }] },
];
const getVal = (p, s, g) => (s.key === 'light' || s.key === 'seat' ? p[s.key][g.id] : p[s.key]);
const setVal = (p, s, g, v) => (s.key === 'light' || s.key === 'seat' ? { ...p, [s.key]: { ...p[s.key], [g.id]: v } } : { ...p, [s.key]: v });
export const anySet = (p) => SENSES.some((s) => s.summary(p));
const SenseIcon = ({ k }) => (k === 'sound' ? <Icon d={paths.speaker} fill={NAVY} /> : k === 'light' ? <Icon d={paths.sun} fill={NAVY} /> : k === 'crowd' ? <Icon d={paths.users} fill={NAVY} /> : <VIcon name="chair" size={24} fill={NAVY} />);

/* ---------- Your modes sheet ---------- */
function ModeCard({ m, active, onPick, onEdit }) {
  return (
    <motion.div role="button" tabIndex={0} onClick={() => onPick(m.id)} whileTap={{ scale: 0.97 }} transition={TAP} initial={false}
      animate={{ backgroundColor: active ? 'rgba(255,255,255,0.85)' : 'rgba(20,24,31,0.06)', boxShadow: active ? '0 12px 32px rgba(27,42,68,0.06)' : '0 0 0 rgba(27,42,68,0)' }}
      style={{ width: 190, height: 112, borderRadius: 24, border: '1px solid rgba(20,24,31,0.08)', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 20 }}>
        <span className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
        <AnimatePresence>
          {active && (
            <motion.span key="a" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }}
              style={{ height: 18, padding: '0 8px', borderRadius: 999, background: 'rgba(47,98,201,0.08)', fontSize: 12, fontWeight: 700, color: INK, lineHeight: '18px' }}>Active</motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.desc}</span>
      <motion.button onClick={(e) => { e.stopPropagation(); onEdit(m.id); }} whileTap={{ scale: 0.94 }} transition={TAP}
        style={{ display: 'flex', alignItems: 'center', gap: 4, height: 16, alignSelf: 'flex-start' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.6665 13.3333H5.33317L12.6665 6.00001L9.99984 3.33334L2.6665 10.6667V13.3333Z" stroke={INK2} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="nowrap" style={{ fontSize: 12, fontWeight: 500, color: INK2 }}>Edit mode</span>
      </motion.button>
    </motion.div>
  );
}

export function ModesSheet({ modes, activeId, onPick, onEdit, onAdd, onClose }) {
  const builtin = modes.filter((m) => !m.custom), custom = modes.filter((m) => m.custom);
  return (
    <SheetFrame top={112} onClose={onClose}>
      <p className="abs nowrap" style={{ left: 24, top: 42, fontSize: 24, fontWeight: 600, color: '#000', lineHeight: '28px' }}>Your modes</p>
      <CloseX onClick={onClose} />
      <div className="abs hide-sb" style={{ left: 0, right: 0, top: 94, bottom: 0, overflowY: 'auto', padding: '16px 24px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK, lineHeight: '20px' }}>Choose your mode</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {builtin.map((m) => <ModeCard key={m.id} m={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 0 }}>
          <p className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK, lineHeight: '20px' }}>Custom modes</p>
          {custom.length > 0 && (
            <motion.div layout style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
              <AnimatePresence initial={false}>
                {custom.map((m) => (
                  <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={GENTLE}>
                    <ModeCard m={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          <motion.button layout onClick={onAdd} whileTap={{ scale: 0.97 }} transition={{ layout: GENTLE, default: TAP }}
            style={{ height: 44, borderRadius: 24, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 18px rgba(27,42,68,0.12)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8H12.5M8 3.5V12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="nowrap" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Add custom mode</span>
          </motion.button>
        </div>
      </div>
    </SheetFrame>
  );
}

/* ---------- Preference picker (not in Figma; same pattern as the Sound sheet) ---------- */
function Opt({ label, on, onClick }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.95 }} transition={TAP} initial={false}
      animate={{ backgroundColor: on ? INK : 'rgba(20,24,31,0.06)', color: on ? '#fff' : INK }}
      style={{ height: 44, padding: '0 20px', borderRadius: 22, fontSize: 15, fontWeight: on ? 600 : 500, flex: 'none' }}>
      <span className="nowrap">{label}</span>
    </motion.button>
  );
}
function PrefSheet({ sense, prefs, onApply, onClose }) {
  const [draft, setDraft] = useState(prefs);
  const clear = () => setDraft((d) => sense.groups.reduce((p, g) => setVal(p, sense, g, null), d));
  return (
    <SheetFrame onClose={onClose} z={48} height={150 + sense.groups.reduce((h, g) => h + 34 + (g.options.length > 3 ? 100 : 56), 0) + 63 + 40}>
      <p className="abs nowrap" style={{ left: 24, top: 40, fontSize: 24, fontWeight: 600, color: INK, lineHeight: '28px' }}>{sense.label}</p>
      <CloseX onClick={onClose} />
      <div className="abs" style={{ left: 24, top: 96, width: 392, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sense.groups.map((g) => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="nowrap" style={{ fontSize: 15, fontWeight: 600, color: INK2 }}>{g.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.options.map((o) => <Opt key={o} label={o} on={getVal(draft, sense, g) === o} onClick={() => setDraft((d) => setVal(d, sense, g, getVal(d, sense, g) === o ? null : o))} />)}
            </div>
          </div>
        ))}
      </div>
      <div className="abs" style={{ left: 24, right: 24, bottom: 40, height: 63, display: 'flex', gap: 12, alignItems: 'center' }}>
        <TextBtn onClick={clear} style={{ flex: '1 0 0' }}>Clear</TextBtn>
        <DarkCTA inline width={197} label="Done" onClick={() => { onApply(draft); onClose(); }} />
      </div>
    </SheetFrame>
  );
}

/* ---------- Edit mode / Add custom mode ---------- */
function PrefRow({ sense, prefs, onOpen, nudge }) {
  const ls = sense.summary(prefs);
  return (
    <motion.button onClick={onOpen} whileTap={{ scale: 0.985 }} transition={TAP} animate={nudge ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      style={{ width: 392, minHeight: 88, borderRadius: 26, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)', display: 'flex', alignItems: 'center', gap: 14, padding: '22px 18px', textAlign: 'left', flex: 'none' }}>
      <SenseIcon k={sense.icon} />
      <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY, lineHeight: '18px' }}>{sense.label}</span>
        {ls ? ls.map((l) => <span key={l} style={{ fontSize: 14, color: '#5b52c9', lineHeight: '17px' }}>{l}</span>)
          : <span style={{ fontSize: 14, color: MUTED, lineHeight: '17px' }}>Not set</span>}
      </span>
      <span style={{ fontSize: 26, color: MUTED, lineHeight: '32px' }}>›</span>
    </motion.button>
  );
}

export function EditMode({ mode, isNew, onBack, onSave, onDelete }) {
  const nameable = isNew || mode.custom;
  const [name, setName] = useState(isNew ? '' : mode.name);
  const [prefs, setPrefs] = useState(isNew ? emptyPrefs() : mode.prefs);
  const [open, setOpen] = useState(null);
  const [nudge, setNudge] = useState(null);
  const base = useRef(JSON.stringify([isNew ? '' : mode.name, isNew ? emptyPrefs() : mode.prefs])).current;
  const dirty = JSON.stringify([name, prefs]) !== base;
  const ready = nameable ? name.trim().length > 0 && anySet(prefs) && (isNew || dirty) : dirty && anySet(prefs);
  const shake = (k) => { setNudge(k); setTimeout(() => setNudge(null), 450); };
  const blocked = () => {
    if (nameable && !name.trim()) shake('name');
    else if (!anySet(prefs)) shake('rows');
  };
  const title = isNew ? 'Add custom mode' : 'Edit mode';
  const sense = SENSES.find((s) => s.key === open);
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <BackBtn onClick={onBack} />
      <div className="abs" style={{ left: 84, top: 53, pointerEvents: 'none' }}>
        <p className="nowrap" style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: '29px' }}>{title}</p>
        <p className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '16px', marginTop: 2 }}>Your modes</p>
      </div>
      <div className="abs hide-sb" style={{ left: 0, right: 0, top: 112, bottom: 0, overflowY: 'auto', padding: '14px 24px 160px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {nameable ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK }}>Mode name</p>
            <motion.div animate={nudge === 'name' ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              style={{ height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.85)', boxShadow: '0 4px 14px rgba(27,42,68,0.05)', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 22))} placeholder="e.g. Slow weekend"
                style={{ all: 'unset', flex: '1 0 0', minWidth: 0, fontSize: 16, color: INK }} />
            </motion.div>
          </div>
        ) : (
          <div style={{ ...card, borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="nowrap" style={{ fontSize: 32, fontWeight: 600, color: INK, lineHeight: '36px' }}>{mode.name}</p>
            <p className="nowrap" style={{ fontSize: 15, fontWeight: 500, color: INK2, lineHeight: '18px' }}>{mode.desc}</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="nowrap" style={{ fontSize: 17, fontWeight: 700, color: INK, lineHeight: '20px' }}>{nameable ? 'Sensory preferences' : `${mode.name} preferences`}</p>
          {SENSES.map((s) => <PrefRow key={s.key} sense={s} prefs={prefs} nudge={nudge === 'rows'} onOpen={() => setOpen(s.key)} />)}
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={anySet(prefs) ? 'a' : 'b'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              style={{ fontSize: 13, color: MUTED, lineHeight: '16px' }}>{anySet(prefs) ? 'Tap a summary to edit your preferences.' : 'Choose a preference to get started.'}</motion.p>
          </AnimatePresence>
          {!isNew && mode.custom && (
            <TextBtn onClick={onDelete} style={{ alignSelf: 'flex-start', fontSize: 15, color: '#c24a2c', padding: 0, height: 32 }}>Delete mode</TextBtn>
          )}
        </div>
      </div>
      <DarkCTA top={808} label={isNew ? 'Add mode' : 'Save changes'} enabled={ready} onBlocked={blocked}
        onClick={() => onSave({ id: isNew ? `c${Date.now()}` : mode.id, name: nameable ? name.trim() : mode.name, desc: nameable ? 'Custom mode' : mode.desc, custom: nameable || undefined, prefs })} />
      <AnimatePresence>
        {sense && <PrefSheet key={sense.key} sense={sense} prefs={prefs} onApply={setPrefs} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}
