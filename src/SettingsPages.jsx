// Figma "App comfort" (Profile, 1217:8766) and "Adjust search" (Search, 1217:9346)
import { motion } from 'motion/react';
import { Glass, GENTLE, NAVY, MUTED } from './ui.jsx';
import { TAP } from './flow.jsx';
import { profileAssets as A } from './profileAssets.js';
import { Scale } from './WriteReview.jsx';

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

// Adjust search (Figma 1217:9346): rank, four sense sliders (stop 0 is Any) and seating.
const ADJ = {
  sound: ['Any', 'Quiet', 'Low', 'Moderate', 'Lively'],
  light: ['Any', 'Dim', 'Soft', 'Moderate', 'Bright'],
  crowd: ['Any', 'Empty', 'Light', 'Moderate', 'Busy'],
  temp: ['Any', 'Cold', 'Cool', 'Mild', 'Warm'],
};
export const ADJUST_DEFAULT = { rank: 'Best match', sound: 'Any', light: 'Any', crowd: 'Any', temp: 'Any', seat: 'Any' };

export function AdjustSearchPage({ draft, setDraft, onBack, onApply }) {
  const set = (k) => (v) => setDraft({ ...draft, [k]: v });
  const scale = (k, title) => <Scale title={title} steps={ADJ[k]} value={Math.max(0, ADJ[k].indexOf(draft[k]))} onChange={(i) => set(k)(ADJ[k][i])} />;
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1', zIndex: 5 }}>
      <div className="scroll" style={{ position: 'absolute', inset: 0 }}>
        <div style={{ padding: '140px 24px 150px', display: 'flex', flexDirection: 'column' }}>
          <Glass radius={22} style={{ position: 'relative', height: 91 }} contentStyle={{ display: 'block' }}>
            <span className="abs nowrap" style={{ left: 16, top: 13, fontSize: 17, fontWeight: 600, color: '#1a1f29' }}>Rank results by</span>
            <div className="abs" style={{ left: 16, top: 40, display: 'flex', gap: 8 }}>
              {['Best match', 'Distance'].map((o) => {
                const on = draft.rank === o;
                return (
                  <motion.button key={o} onClick={() => set('rank')(o)} whileTap={{ scale: 0.97 }} transition={GENTLE}
                    style={{ width: 176, height: 36, borderRadius: 18, fontSize: 13, fontWeight: on ? 600 : 500, color: on ? '#2a2650' : '#1a1f29',
                      background: on ? 'rgba(255,255,255,0.95)' : 'rgba(42,38,80,0.05)', boxShadow: on ? '0 4px 12px rgba(42,38,80,0.1)' : 'none', transition: 'background .25s, box-shadow .25s' }}>{o}</motion.button>
                );
              })}
            </div>
          </Glass>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#2a2650', margin: '16px 0 8px' }}>Sensory preferences</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scale('sound', 'Sound')}
            {scale('light', 'Lighting')}
            {scale('crowd', 'Crowd')}
            {scale('temp', 'Temperature')}
            <Glass radius={22} style={{ position: 'relative', height: 84 }} contentStyle={{ display: 'block' }}>
              <span className="abs nowrap" style={{ left: 16, top: 12, fontSize: 16, fontWeight: 600, color: '#2a2650' }}>Seating</span>
              <div className="abs" style={{ left: 16, top: 41, display: 'flex', gap: 8 }}>
                {['Any', 'Corner seat', 'Booth', 'Table with space'].map((o) => {
                  const on = draft.seat === o;
                  return (
                    <motion.button key={o} onClick={() => set('seat')(o)} whileTap={{ scale: 0.95 }} transition={GENTLE}
                      style={{ height: 28, padding: '0 12px', borderRadius: 14, fontSize: 12, fontWeight: on ? 600 : 400, color: '#2a2650',
                        background: on ? '#fff' : 'rgba(255,255,255,0.6)', boxShadow: on ? '0 0 0 1.5px #5e5a7e inset' : 'none', transition: 'box-shadow .2s, background .2s' }}>{o}</motion.button>
                  );
                })}
              </div>
            </Glass>
          </div>
        </div>
      </div>
      <div className="abs" style={{ left: 0, top: 0, width: 440, height: 130, background: 'linear-gradient(#f7f5f1 75%, rgba(247,245,241,0))', pointerEvents: 'none' }} />
      <motion.button className="abs" aria-label="Back" onClick={onBack} whileTap={{ scale: 0.9 }} transition={TAP} style={{ left: 24, top: 70, width: 48, height: 48 }}>
        <Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={A.back} alt="" /></Glass>
      </motion.button>
      <p className="abs nowrap" style={{ left: 84, top: 80, fontSize: 24, fontWeight: 600, lineHeight: '29px', color: '#2a2650' }}>Adjust search</p>
      <motion.button className="abs" type="button" onClick={onApply} whileTap={{ scale: 0.97 }} transition={TAP} style={{ left: 111, top: 842, width: 218, height: 63 }}>
        <Glass radius={32} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><span style={{ fontSize: 17, fontWeight: 600, color: '#2a2650' }}>Apply preferences</span></Glass>
      </motion.button>
    </div>
  );
}
