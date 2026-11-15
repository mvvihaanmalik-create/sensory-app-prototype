// Figma: Home mode selector and inline preference controls.
import { Ph } from './phosphor.jsx';
import { useState } from 'react';
import { motion } from 'motion/react';
import { GENTLE, INK, Glass } from './ui.jsx';
import { TAP } from './flow.jsx';
import { SheetFrame } from './sheets.jsx';
import { profileAssets as A } from './profileAssets.js';
import './modes.css';

export const MODE_GREEN = '#386b5e', MODE_TINT = '#e5f0e8';
export const emptyPrefs = () => ({ sound: null, light: { b: null, tone: null, src: null }, crowd: null, temp: null, seat: { pos: null, layout: null } });
export const INITIAL_MODES = [
  { id: 'study', name: 'Study', desc: 'Quiet & focused', prefs: { ...emptyPrefs(), sound: 'Quiet', light: { b: 'Bright', tone: null, src: null }, crowd: 'Light' } },
  { id: 'party', name: 'Party', desc: 'Vibrant & social', prefs: { ...emptyPrefs(), sound: 'Lively', light: { b: 'Dim', tone: null, src: null }, crowd: 'Busy' } },
];
export const modeLabel = m => m.custom ? m.name : `${m.name} mode`;
export const modeSummary = m => [m.prefs.sound || 'Any', m.prefs.light.b || 'Any', m.prefs.crowd || 'Any'].join(' · ');

function ModeCard({ mode, active, onPick, onEdit }) {
  return <motion.div className="mode-choice" data-mode-choice={mode.id} initial={false}
    animate={{ backgroundColor: active ? 'rgba(255,255,255,.85)' : 'rgba(20,24,31,.06)', boxShadow: active ? '0 12px 32px rgba(27,42,68,.08)' : '0 0 0 rgba(27,42,68,0)', borderColor: active ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,0)' }} transition={GENTLE}>
    <button className="mode-choice-pick" aria-label={mode.name} aria-pressed={active} onClick={() => onPick(mode.id)} />
    <div className="mode-choice-title"><span>{mode.name}</span>{active && <span className="mode-active">Active</span>}</div>
    {!mode.custom && <p className="mode-choice-description">{mode.desc}</p>}
    <motion.button className="mode-choice-edit" aria-label={`Edit mode ${mode.name}`} onClick={() => onEdit(mode.id)} whileTap={{ scale: .94 }} transition={TAP}><img src={A.edit} alt="" /><span>Edit</span></motion.button>
  </motion.div>;
}
export function ModesSheet({ modes, activeId, onPick, onEdit, onAdd, onClose }) {
  const builtins = modes.filter(m => !m.custom), custom = modes.filter(m => m.custom);
  return <SheetFrame top={custom.length ? 330 : 440} onClose={onClose} sheetStyle={{ borderRadius: '24px 24px 0 0', border: 0, borderTop: '1.5px solid rgba(255,255,255,0.95)', background: 'rgba(250,249,252,0.9)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
    <p className="abs nowrap" style={{ left: 22.5, top: 40.5, fontSize: 24, fontWeight: 600, lineHeight: '28px', letterSpacing: -.36, color: '#2a2650' }}>Your modes</p>
    <motion.button className="abs" aria-label="Add custom mode" onClick={onAdd} whileTap={{ scale: .88 }} transition={TAP} style={{ left: 372.5, top: 32.5, width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 22 }}><Ph n="plus" size={32} fill="#2a2650" /></motion.button>
    <div className="abs hide-sb" data-modes-sheet style={{ left: 0, right: 0, top: 84, bottom: 100, overflowY: 'auto', padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="mode-choice-section"><p className="mode-section-title">Choose your mode</p>{builtins.map(m => <ModeCard key={m.id} mode={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />)}</div>
      {custom.length > 0 && <div className="mode-choice-section"><p className="mode-section-title">Custom modes</p>{custom.map(m => <ModeCard key={m.id} mode={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />)}</div>}
    </div>
    <motion.button className="mode-add abs" onClick={onClose} whileTap={{ scale: .97 }} transition={TAP} style={{ left: 24, width: 392, bottom: 32 }}><span>Done</span></motion.button>
  </SheetFrame>;
}

export const SLIDERS = [
  { key: 'sound', label: 'Sound', values: ['Any', 'Quiet', 'Low', 'Moderate', 'Lively'] },
  { key: 'light', label: 'Lighting', values: ['Any', 'Dim', 'Soft', 'Moderate', 'Bright'] },
  { key: 'crowd', label: 'Crowd', values: ['Any', 'Empty', 'Light', 'Moderate', 'Busy'] },
  { key: 'temp', label: 'Temperature', values: ['Any', 'Cold', 'Cool', 'Mild', 'Warm'] },
];
const prefValue = (prefs, key) => (key === 'light' ? prefs.light.b : prefs[key]) || 'Any';
const setPreference = (prefs, key, value) => key === 'light' ? { ...prefs, light: { ...prefs.light, b: value === 'Any' ? null : value } } : { ...prefs, [key]: value === 'Any' ? null : value };
function PreferenceSlider({ config, prefs, onChange }) {
  const selected = Math.max(0, config.values.indexOf(prefValue(prefs, config.key)));
  const pick = index => onChange(setPreference(prefs, config.key, config.values[index]));
  return <div className="mode-slider" data-preference={config.key}>
    <p className="mode-slider-title" id={`mode-${config.key}`}>{config.label}</p>
    <div className="mode-slider-track" /><motion.div className="mode-slider-fill" initial={false} animate={{ width: selected * 86 }} transition={GENTLE} />
    {config.values.map((v, i) => <span key={v} className="mode-slider-stop" style={{ left: 19.5 + i * 86 }} />)}
    <motion.div className="mode-slider-thumb" initial={false} animate={{ x: selected * 86 }} transition={GENTLE} />
    <input className="mode-slider-input" type="range" min="0" max="4" step="1" value={selected} aria-labelledby={`mode-${config.key}`} aria-valuetext={config.values[selected]} onChange={e => pick(Number(e.target.value))} />
    {config.values.map((value, i) => <button key={value} type="button" className="mode-slider-label" data-on={i === selected} aria-label={`${config.label}: ${value}`} onClick={() => pick(i)} style={{ left: 22.5 + i * 86 }}>{value}</button>)}
  </div>;
}
const SEATING = [
  { label: 'Any', left: 14.5, width: 46 }, { label: 'Corner seat', left: 68.5, width: 87, pos: 'Corner seat' },
  { label: 'Booth', left: 163.5, width: 57, pos: 'Booth' }, { label: 'Table with space', left: 228.5, width: 114, layout: 'Table with space' },
];
function SeatingPreferences({ prefs, onChange }) {
  return <div className="mode-seating" data-preference="seat"><p>Seating</p>{SEATING.map(option => {
    const selected = option.label === 'Any' ? !prefs.seat.pos && !prefs.seat.layout : option.pos ? prefs.seat.pos === option.pos : prefs.seat.layout === option.layout;
    return <motion.button key={option.label} aria-pressed={selected} whileTap={{ scale: .95 }} transition={TAP}
      onClick={() => onChange({ ...prefs, seat: option.label === 'Any' ? { pos: null, layout: null } : option.pos ? { ...prefs.seat, pos: selected ? null : option.pos } : { ...prefs.seat, layout: selected ? null : option.layout } })}
      style={{ left: option.left, width: option.width, outline: selected ? '1.5px solid #5e5a7e' : 'none', color: selected ? '#2a2650' : '#5e5a7e' }}>{option.label}</motion.button>;
  })}</div>;
}
export function EditMode({ mode, isNew, onBack, onSave }) {
  const nameable = isNew || mode.custom;
  const [name, setName] = useState(isNew ? 'Slow weekend' : mode.name);
  const [prefs, setPrefs] = useState(() => isNew ? emptyPrefs() : structuredClone(mode.prefs));
  return <div className="abs mode-editor" style={{ inset: 0, background: '#f7f5f1' }} data-mode-editor={isNew ? 'new' : mode.id}>
    <div className="scroll hide-sb" style={{ top: 130, bottom: 0 }}><div className="mode-editor-content">
      {nameable ? <div className="mode-name-field"><label htmlFor="mode-name">Mode name</label><div><input id="mode-name" value={name} maxLength={40} onChange={e => setName(e.target.value)} /></div></div> : <div className="mode-identity"><p>{mode.name}</p><p>{mode.desc}</p></div>}
      <div className="mode-preferences"><p className="mode-section-title">{nameable ? 'Sensory preferences' : `${mode.name} preferences`}</p>{SLIDERS.map(config => <PreferenceSlider key={config.key} config={config} prefs={prefs} onChange={setPrefs} />)}<SeatingPreferences prefs={prefs} onChange={setPrefs} /></div>
      <motion.button className="mode-save" disabled={!name.trim()} whileTap={{ scale: .96 }} transition={TAP} onClick={() => onSave({ id: isNew ? `custom-${Date.now()}` : mode.id, name: name.trim(), ...(nameable ? { custom: true } : { desc: mode.desc }), prefs })}>Save changes</motion.button>
    </div></div>
    <motion.button className="abs" aria-label="Back" onClick={onBack} whileTap={{ scale: .9 }} transition={TAP} style={{ left: 24, top: 70, width: 48, height: 48 }}><Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={A.back} alt="" /></Glass></motion.button>
    <p className="abs nowrap" style={{ left: 84, top: 80, fontSize: 24, fontWeight: 600, lineHeight: '29px', pointerEvents: 'none' }}>{isNew ? 'Add custom mode' : 'Edit mode'}</p>
  </div>;
}
