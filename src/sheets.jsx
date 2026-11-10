// Shared bottom-sheet pieces for the Home-linked pages: sheet frame, dark primary pill, close button.
import { motion, AnimatePresence } from 'motion/react';
import { GENTLE, INK, INK2 } from './ui.jsx';
import { TAP } from './flow.jsx';

export const SHEET_SPRING = { type: 'spring', stiffness: 260, damping: 32 };

export function CloseX({ onClick, top = 30 }) {
  return (
    <motion.button aria-label="Close" onClick={onClick} whileTap={{ scale: 0.88 }} transition={TAP}
      style={{ position: 'absolute', right: 24, top, width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 6L18 18M18 6L6 18" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}

// Dimmed backdrop (44%) plus a white sheet with a handle. Slides up from the bottom edge.
export function SheetFrame({ top, height, onClose, z = 45, children, sheetStyle }) {
  const place = top != null ? { top, bottom: 0 } : { bottom: 0, height };
  return (
    <div className="abs" style={{ inset: 0, zIndex: z }}>
      <motion.div className="abs" style={{ inset: 0, background: INK }} initial={{ opacity: 0 }} animate={{ opacity: 0.44 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }} onClick={onClose} />
      <motion.div className="abs" style={{ left: 0, width: 440, ...place, background: '#fff', borderRadius: '32px 32px 0 0', border: '1px solid rgba(20,24,31,0.08)', borderBottom: 0,
        boxShadow: '0 12px 32px rgba(27,42,68,0.06)', overflow: 'hidden', ...sheetStyle }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SHEET_SPRING}>
        <div className="abs" style={{ left: 200, top: 14, width: 40, height: 5, borderRadius: 3, background: 'rgba(42,38,80,0.2)' }} />
        {children}
      </motion.div>
    </div>
  );
}

// Primary action in the Home flows: dark, hugging pill (h63). Faded when not ready; tapping it then calls onBlocked.
export function DarkCTA({ label, enabled = true, onClick, onBlocked, top, inline, width }) {
  const btn = (
    <motion.button layout onClick={() => (enabled ? onClick?.() : onBlocked?.())} whileTap={{ scale: 0.96 }} transition={{ layout: GENTLE, default: TAP }}
      style={{ height: 63, width, borderRadius: 32, padding: width ? 0 : '0 36px', background: INK, border: '1.5px solid rgba(255,255,255,0.95)', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        boxShadow: '0 14px 36px rgba(42,38,80,0.1), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={label} layout="position" className="nowrap" style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: enabled ? 1 : 0.42, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.22 }}>{label}</motion.span>
      </AnimatePresence>
    </motion.button>
  );
  if (inline) return btn;
  return <div className="abs" style={{ left: 0, top, width: 440, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>{btn}</div>;
}

export function TextBtn({ children, onClick, style }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.95 }} transition={TAP}
      style={{ height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: INK2, ...style }}>{children}</motion.button>
  );
}

