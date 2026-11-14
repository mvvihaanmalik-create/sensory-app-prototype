// Figma "App comfort" (Profile, 1217:8766) and "Adjust search" (Search, 1217:9346)
import { motion } from 'motion/react';
import { Glass, GENTLE, NAVY, MUTED } from './ui.jsx';
import { TAP } from './flow.jsx';
import { profileAssets as A } from './profileAssets.js';

function Seg({ options, value, onChange, tone, cols, offset = 0, label }) {
  const n = cols || options.length;
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 8, marginTop: 14 }}>
      {options.map((o, i) => {
        const on = value === o;
        return (
          <motion.button key={o} role="radio" aria-checked={on} type="button" onClick={() => onChange(o)} whileTap={{ scale: 0.97 }} transition={GENTLE}
            style={{ gridColumn: i + 1 + offset, height: 36, borderRadius: 18, fontSize: 13, fontWeight: on ? 700 : 500, fontFamily: 'inherit',
              color: on ? (tone === 'green' ? '#2b5d4c' : NAVY) : '#2a2650',
              background: on ? (tone === 'green' ? '#d9eae0' : '#fff') : (tone === 'green' ? '#efefee' : 'rgba(94,90,126,0.05)'),
              boxShadow: on && tone !== 'green' ? '0 4px 12px rgba(42,38,80,0.12)' : 'none', transition: 'background .25s, color .25s, box-shadow .25s' }}>{o}</motion.button>
        );
      })}
    </div>
  );
}

function Card({ title, sub, children, tone }) {
  const body = <div style={{ padding: 16, textAlign: 'left' }}>
    <p style={{ fontSize: 18, fontWeight: 600, color: '#14181f', lineHeight: '22px' }}>{title}</p>
    <p style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: '17px' }}>{sub}</p>
    {children}
  </div>;
  return tone === 'green'
    ? <div style={{ width: 392, borderRadius: 24, background: '#fff' }}>{body}</div>
    : <Glass radius={24} style={{ position: 'relative', width: 392 }} contentStyle={{ display: 'block' }}>{body}</Glass>;
}

function BackBtn({ onBack }) {
  return <motion.button className="abs" aria-label="Back" onClick={onBack} whileTap={{ scale: 0.9 }} transition={TAP} style={{ left: 24, top: 54, width: 48, height: 48 }}>
    <Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={A.back} alt="" /></Glass>
  </motion.button>;
}

export const COMFORT_DEFAULT = { appearance: 'Light', text: 'Default', palette: 'Calm', motion: 'Off' };

export function AppComfortPage({ value, onChange, onBack }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <BackBtn onBack={onBack} />
      <p className="abs nowrap" style={{ left: 24, top: 118, fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: -0.6, color: '#2a2650' }}>App comfort</p>
      <div className="abs" style={{ left: 24, top: 204, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card title="Appearance" sub="Choose how Ambio looks."><Seg label="Appearance" options={['Light', 'Dark']} cols={3} offset={1} value={value.appearance} onChange={set('appearance')} /></Card>
        <Card title="Text size" sub="Choose a comfortable reading size."><Seg label="Text size" options={['Default', 'Large', 'Extra large']} value={value.text} onChange={set('text')} /></Card>
        <Card title="Color palette" sub="Choose the intensity of interface colors."><Seg label="Color palette" options={['Calm', 'Vivid']} value={value.palette} onChange={set('palette')} /></Card>
        <Card title="Reduce motion" sub="Limit animated transitions."><Seg label="Reduce motion" options={['Off', 'On']} value={value.motion} onChange={set('motion')} /></Card>
      </div>
    </div>
  );
}

export const ADJUST_DEFAULT = { rank: 'Best match', sound: 'Any', light: 'Any', crowd: 'Any' };

export function AdjustSearchPage({ draft, setDraft, onBack, onApply }) {
  const set = (k) => (v) => setDraft({ ...draft, [k]: v });
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1', zIndex: 5 }}>
      <BackBtn onBack={onBack} />
      <p className="abs nowrap" style={{ left: 24, top: 118, fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: -0.6, color: '#2a2650' }}>Adjust search</p>
      <p className="abs nowrap" style={{ left: 24, top: 160, fontSize: 15, color: MUTED }}>Choose what to prioritize in your results.</p>
      <div className="abs" style={{ left: 24, top: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card tone="green" title="Rank results by" sub="Places that match your preference appear first."><Seg tone="green" label="Rank results by" options={['Best match', 'Distance']} value={draft.rank} onChange={set('rank')} /></Card>
        <Card tone="green" title="Sound preference" sub="Prioritize the sound level you prefer."><Seg tone="green" label="Sound preference" options={['Any', 'Quiet', 'Lively']} value={draft.sound} onChange={set('sound')} /></Card>
        <Card tone="green" title="Lighting preference" sub="Prioritize lighting that feels right."><Seg tone="green" label="Lighting preference" options={['Any', 'Soft', 'Bright']} value={draft.light} onChange={set('light')} /></Card>
        <Card tone="green" title="Crowd preference" sub="Prioritize how busy a place feels."><Seg tone="green" label="Crowd preference" options={['Any', 'Relaxed', 'Busy']} value={draft.crowd} onChange={set('crowd')} /></Card>
      </div>
      <motion.button className="abs" type="button" onClick={onApply} whileTap={{ scale: 0.97 }} transition={TAP} style={{ left: 111, top: 756, width: 218, height: 64 }}>
        <Glass radius={32} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><span style={{ fontSize: 17, fontWeight: 600, color: '#2a2650' }}>Apply preferences</span></Glass>
      </motion.button>
    </div>
  );
}
