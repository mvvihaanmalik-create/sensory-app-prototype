// Settings-style building blocks shared by Map · Filters, App comfort and Profile (Figma glass cards with rows).
import { motion } from 'motion/react';
import { Glass, GENTLE } from './ui.jsx';
import { TAP, t } from './flow.jsx';
import { Ph } from './phosphor.jsx';

const INK = '#2a2650', SUB = '#5e5a7e';

// Glass round icon button (48), used for back, plus and export in page headers.
export function IconBtn({ icon, label, onClick, left, right, top = 72 }) {
  return (
    <motion.button className="abs" aria-label={label} onClick={onClick} whileTap={{ scale: 0.9 }} transition={TAP} style={{ left, right, top, width: 48, height: 48 }}>
      <Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><Ph n={icon} size={icon === 'caret-left' ? 22 : 24} fill={INK} /></Glass>
    </motion.button>
  );
}

export function FSeg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', padding: 3, borderRadius: 22, background: 'rgba(42,38,80,0.05)', flex: 'none' }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{ position: 'relative', height: 38, padding: '0 12px', borderRadius: 19 }}>
            {on && <motion.div layoutId={`fseg-${options[0]}`} transition={GENTLE} className="abs" style={{ inset: 0, borderRadius: 19, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 6px rgba(42,38,80,0.08)' }} />}
            <span className="nowrap" style={{ position: 'relative', ...t(13, on ? 600 : 500, on ? INK : SUB) }}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}
export function FSwitch({ on, onChange, big }) {
  return (
    <motion.button role="switch" aria-checked={on} onClick={() => onChange(!on)} initial={false}
      animate={{ backgroundColor: on ? INK : 'rgba(42,38,80,0.12)' }} transition={{ duration: 0.2 }}
      style={{ width: big ? 52 : 44, height: big ? 32 : 26, borderRadius: 16, padding: 3, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', flex: 'none' }}>
      <motion.div layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} style={{ width: big ? 26 : 20, height: big ? 26 : 20, borderRadius: 13, background: '#fff' }} />
    </motion.button>
  );
}
export function FRow({ icon, label, children, last, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <>
      <Tag onClick={onClick} style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 18px', textAlign: 'left' }}>
        <Ph n={icon} size={20} fill={INK} />
        <span className="nowrap" style={{ ...t(15, 500, INK), flex: '1 0 0' }}>{label}</span>
        {children}
      </Tag>
      {!last && <div style={{ height: 1, margin: '0 20px', background: 'rgba(42,38,80,0.07)' }} />}
    </>
  );
}
export const Any = ({ v = 'Any' }) => <><span style={t(14, 400, SUB)}>{v}</span><Ph n="caret-right" size={16} fill={SUB} /></>;
export const FHead = ({ children }) => <p style={{ ...t(13, 600, SUB), letterSpacing: '0.04em', padding: '0 4px' }}>{children}</p>;
export const FCard = ({ children }) => <Glass radius={28} style={{ position: 'relative' }} contentStyle={{ display: 'block', padding: '6px 0' }}>{children}</Glass>;

