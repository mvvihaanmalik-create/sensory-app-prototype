import { createContext, useContext } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { paths } from './svgs.js';

export const ScaleCtx = createContext(1);
export const useScale = () => useContext(ScaleCtx);

// Figma "Smart animate · Gentle" spring
export const GENTLE = { type: 'spring', stiffness: 100, damping: 15, mass: 1 };
export const SOFT = { type: 'spring', stiffness: 220, damping: 30, mass: 1 };

export const INK = '#14181f';
export const INK2 = '#4b5462';
export const NAVY = '#2a2650';
export const MUTED = '#5e5a7e';

export function Glass({ style, radius, angle = '135deg', children, className = '', contentStyle, ...rest }) {
  return (
    <div className={`glass ${className}`} style={{ borderRadius: radius, '--ga': angle, ...style }} {...rest}>
      <div className="g-bg" />
      <div className="g-c" style={contentStyle}>{children}</div>
      <div className="g-in" />
    </div>
  );
}

export function Icon({ d, size = 24, fill = MUTED, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flex: 'none', ...style }}>
      <path d={d} fill={fill} />
    </svg>
  );
}

// Glass / Tab bar / Light (273 x 64). The selected pill slides between tabs.
const TABS = [
  { key: 'home', d: paths.house, label: 'Home' },
  { key: 'search', d: paths.search, label: 'Search' },
  { key: 'map', d: paths.map, label: 'Map' },
  { key: 'profile', d: paths.user, label: 'Profile' },
];
export function TabBar({ active, onNav, top, yMV }) {
  return (
    <motion.div className="abs tabbar-wrap" style={{ left: 84, width: 273, height: 64, zIndex: 40, y: yMV }} initial={false} animate={{ top }} transition={GENTLE}>
      <Glass radius={32} angle="166.8deg" style={{ inset: 0 }} contentStyle={{ padding: 7 - 1.5 }}>
        {TABS.map((t, i) => {
          const on = active === t.key;
          return (
            <button key={t.key} aria-label={t.label} onClick={() => onNav(t.key)}
              style={{ position: 'relative', flex: '1 0 0', height: 50, marginRight: i < 3 ? -4 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 25 }}>
              {on && (
                <motion.div layoutId="tab-pill" transition={GENTLE}
                  style={{ position: 'absolute', inset: 0, borderRadius: 25, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 8px rgba(42,38,80,0.06)' }} />
              )}
              <motion.div style={{ position: 'relative' }} whileTap={{ scale: 0.88 }}>
                <Icon d={t.d} fill={on ? NAVY : MUTED} />
              </motion.div>
            </button>
          );
        })}
      </Glass>
    </motion.div>
  );
}

export function StatusBar({ shade = 0, light = false, pull }) {
  // On dark hero scenes the clock and battery are white; they return to ink as Home is pulled down
  const zero = useMotionValue(0);
  const c = useTransform(pull || zero, [0, 40], [light ? '#ffffff' : INK, INK]);
  const fade = { transition: 'color 0.25s, border-color 0.25s' };
  return (
    <div className="abs" style={{ inset: '0 0 auto 0', height: 54, zIndex: 50, pointerEvents: 'none' }}>
      <motion.div className="abs" style={{ inset: 0, background: 'rgba(247,245,241,0.82)', WebkitBackdropFilter: 'blur(14px)', backdropFilter: 'blur(14px)' }}
        animate={{ opacity: shade }} transition={{ duration: 0.25 }} />
      <motion.p className="abs nowrap" style={{ left: 40, top: 18, fontSize: 17, fontWeight: 700, color: c, lineHeight: '20px', ...fade }}>9:41</motion.p>
      <motion.div className="abs" style={{ left: 374, top: 24, width: 26, height: 12, border: '1.5px solid', borderColor: c, borderRadius: 4, ...fade }} />
    </div>
  );
}
