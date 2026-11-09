// Figma: Home mode selector and inline preference controls.
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
  { id: 'study', name: 'Study', desc: 'Quiet & focused', prefs: { ...emptyPrefs(), sound: 'Quiet', light: { b: 'Bright', tone: null, src: null }, crowd: 'Relaxed' } },
  { id: 'party', name: 'Party', desc: 'Vibrant & social', prefs: { ...emptyPrefs(), sound: 'Lively', light: { b: 'Dim', tone: null, src: null }, crowd: 'Busy' } },
];
export const modeLabel = m => m.custom ? m.name : `${m.name} mode`;
export const modeSummary = m => [m.prefs.sound || 'Any', m.prefs.light.b || 'Any', m.prefs.crowd || 'Any'].join(' · ');

function ModeCard({ mode, active, onPick, onEdit }) {
  return <motion.div className="mode-choice" data-mode-choice={mode.id} initial={false}
    animate={{ backgroundColor: active ? 'rgba(255,255,255,.85)' : 'rgba(20,24,31,.06)', boxShadow: active ? '0 12px 32px rgba(27,42,68,.06)' : '0 0 0 rgba(27,42,68,0)' }} transition={GENTLE}>
    <button className="mode-choice-pick" aria-label={mode.name} aria-pressed={active} onClick={() => onPick(mode.id)} />
    <div className="mode-choice-title"><span>{mode.name}</span>{active && <span className="mode-active">Active</span>}</div>
    {!mode.custom && <p className="mode-choice-description">{mode.desc}</p>}
    <motion.button className="mode-choice-edit" aria-label={`Edit mode ${mode.name}`} onClick={() => onEdit(mode.id)} whileTap={{ scale: .94 }} transition={TAP}><img src={A.edit} alt="" /><span>Edit mode</span></motion.button>
  </motion.div>;
}
export function ModesSheet({ modes, activeId, onPick, onEdit, onAdd, onClose }) {
  const builtins = modes.filter(m => !m.custom), custom = modes.filter(m => m.custom);
  return <SheetFrame top={470} onClose={onClose} sheetStyle={{ borderRadius: '24px 24px 0 0', border: 0 }}>
    <p className="abs nowrap" style={{ left: 24, top: 42, fontSize: 24, fontWeight: 600, lineHeight: '28px', letterSpacing: -.36, color: INK }}>Your modes</p>
    <motion.button className="abs" aria-label="Close" onClick={onClose} whileTap={{ scale: .88 }} transition={TAP} style={{ right: 24, top: 30, width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 22 }}><img src={A.close} alt="" /></motion.button>
    <div className="abs hide-sb" data-modes-sheet style={{ left: 0, right: 0, top: 74, bottom: 32, overflowY: 'auto', padding: '16px 24px 12px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="mode-choice-section"><p className="mode-section-title">Choose your mode</p>{builtins.map(m => <ModeCard key={m.id} mode={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}><p className="mode-section-title">Custom modes</p>{custom.map(m => <ModeCard key={m.id} mode={m} active={m.id === activeId} onPick={onPick} onEdit={onEdit} />)}
        <motion.button className="mode-add" onClick={onAdd} whileTap={{ scale: .97 }} transition={TAP}><img src={A.plus} alt="" /><span>Add custom mode</span></motion.button>
      </div>
    </div>
  </SheetFrame>;
}

export const SLIDERS = [
  { key: 'sound', label: 'Sound', values: ['Any', 'Quiet', 'Easy to talk', 'Lively'] },
  { key: 'light', label: 'Lighting', values: ['Any', 'Dim', 'Soft', 'Bright'] },
  { key: 'crowd', label: 'Crowd', values: ['Any', 'Relaxed', 'Moderate', 'Busy'] },
  { key: 'temp', label: 'Temperature', values: ['Any', 'Cool', 'Mild', 'Warm'] },
];
const prefValue = (prefs, key) => (key === 'light' ? prefs.light.b : prefs[key]) || 'Any';
const setPreference = (prefs, key, value) => key === 'light' ? { ...prefs, light: { ...prefs.light, b: value === 'Any' ? null : value } } : { ...prefs, [key]: value === 'Any' ? null : value };
function PreferenceSlider({ config, prefs, onChange }) {
  const selected = Math.max(0, config.values.indexOf(prefValue(prefs, config.key)));
  const pick = index => onChange(setPreference(prefs, config.key, config.values[index]));
  return <div className="mode-slider" data-preference={config.key}>
    <p className="mode-slider-title" id={`mode-${config.key}`}>{config.label}</p><p className="mode-slider-value">{config.values[selected]}</p>
    <div className="mode-slider-track" /><motion.div className="mode-slider-fill" initial={false} animate={{ width: selected * 344 / 3 }} transition={GENTLE} /><motion.div className="mode-slider-thumb" initial={false} animate={{ x: selected * 344 / 3 }} transition={GENTLE} />
    <input className="mode-slider-input" type="range" min="0" max="3" step="1" value={selected} aria-labelledby={`mode-${config.key}`} aria-valuetext={config.values[selected]} onChange={e => pick(Number(e.target.value))} />
    <div className="mode-slider-labels">{config.values.map((value, i) => <button key={value} type="button" aria-label={`${config.label}: ${value}`} onClick={() => pick(i)} style={{ ...(i === 0 ? { left: 16 } : i === 3 ? { right: 16 } : { left: 24 + i * 344 / 3, transform: 'translateX(-50%)' }) }}>{value}</button>)}</div>
  </div>;
}
const SEATING = [
  { label: 'Any', left: 16, width: 52, pos: null, layout: null }, { label: 'Corner', left: 76, width: 70, pos: 'Corner seat' },
  { label: 'Booth', left: 155, width: 65, pos: 'Booth' }, { label: 'More space', left: 228, width: 110, layout: 'Table with space' },
];
function SeatingPreferences({ prefs, onChange }) {
  return <div className="mode-seating" data-preference="seat"><p>Seating</p>{SEATING.map(option => {
    const selected = option.label === 'Any' ? !prefs.seat.pos && !prefs.seat.layout : option.pos ? prefs.seat.pos === option.pos : prefs.seat.layout === option.layout;
    return <motion.button key={option.label} aria-pressed={selected} whileTap={{ scale: .95 }} transition={TAP}
      onClick={() => onChange({ ...prefs, seat: option.label === 'Any' ? { pos: null, layout: null } : option.pos ? { ...prefs.seat, pos: selected ? null : option.pos } : { ...prefs.seat, layout: selected ? null : option.layout } })}
      style={{ left: option.left, width: option.width, outline: selected && option.label !== 'Any' ? `1.5px solid ${MODE_GREEN}` : 'none' }}>{option.label}</motion.button>;
  })}</div>;
}
export function EditMode({ mode, isNew, onBack, onSave }) {
  const nameable = isNew || mode.custom;
  const [name, setName] = useState(isNew ? 'Slow weekend' : mode.name);
  const [prefs, setPrefs] = useState(() => isNew ? emptyPrefs() : structuredClone(mode.prefs));
  return <div className="abs mode-editor" style={{ inset: 0, background: '#f7f5f1' }} data-mode-editor={isNew ? 'new' : mode.id}>
    <div className="scroll hide-sb" style={{ top: 112, bottom: 0 }}><div className="mode-editor-content">
      {nameable ? <div className="mode-name-field"><label htmlFor="mode-name">Mode name</label><div><input id="mode-name" value={name} maxLength={40} onChange={e => setName(e.target.value)} /></div></div> : <div className="mode-identity"><p>{mode.name}</p><p>{mode.desc}</p></div>}
      <div className="mode-preferences"><p className="mode-section-title">{nameable ? 'Sensory preferences' : `${mode.name} preferences`}</p>{SLIDERS.map(config => <PreferenceSlider key={config.key} config={config} prefs={prefs} onChange={setPrefs} />)}<SeatingPreferences prefs={prefs} onChange={setPrefs} /></div>
    </div></div>
    <motion.button className="abs" aria-label="Back" onClick={onBack} whileTap={{ scale: .9 }} transition={TAP} style={{ left: 24, top: 52, width: 48, height: 48 }}><Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={A.back} alt="" /></Glass></motion.button>
    <p className="abs nowrap" style={{ left: 84, top: 62, fontSize: 24, fontWeight: 700, lineHeight: '29px', pointerEvents: 'none' }}>{isNew ? 'Add custom mode' : 'Edit mode'}</p>
    <div className="abs mode-save-wrap" style={{ top: nameable ? 814 : 836 }}><motion.button className="mode-save" disabled={!name.trim()} whileTap={{ scale: .96 }} transition={TAP} onClick={() => onSave({ id: isNew ? `custom-${Date.now()}` : mode.id, name: name.trim(), ...(nameable ? { custom: true } : { desc: mode.desc }), prefs })}>Save changes</motion.button></div>
  </div>;
}
