// Home-linked list pages: Cafés, Dining, Nightlife, Events, More, For You, Popular Around You (Figma section 905:17958),
// plus the Sound-style sort sheet that every filter chip opens.
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { GENTLE, INK, INK2, NAVY } from './ui.jsx';
import { G, TAP } from './flow.jsx';
import { VIcon } from './venueIcons.jsx';
import { SheetFrame, CloseX, DarkCTA, TextBtn } from './sheets.jsx';
import { PAGES, SORTS, SORT_ORDER, chipText, sortRows } from './listData.js';

const cardRow = { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(20,24,31,0.08)', boxShadow: '0 12px 32px rgba(27,42,68,0.06)' };
const TONES = {
  blue: { bg: 'rgba(47,98,201,0.08)', fg: INK },
  grey: { bg: 'rgba(20,24,31,0.06)', fg: INK2 },
  red: { bg: 'rgba(194,74,44,0.08)', fg: '#c24a2c' },
};
const Tag = ({ tone, children }) => (
  <span className="nowrap" style={{ height: 24, padding: '0 10px', borderRadius: 999, background: TONES[tone].bg, color: TONES[tone].fg, fontSize: 13, fontWeight: tone === 'grey' ? 500 : 700, lineHeight: '24px', display: 'inline-block' }}>{children}</span>
);
const Thumb = ({ size = 80, r = 16, src }) => (
  src ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: r, display: 'block', flex: 'none', objectFit: 'cover' }} />
    : <div style={{ width: size, height: size, borderRadius: r, background: 'rgba(20,24,31,0.06)', flex: 'none' }} />
);
const nm = { fontSize: 17, fontWeight: 700, color: INK, lineHeight: '20px' };
const mt = { fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '16px' };

function Row({ h, r = 28, pad = 16, gap = 16, shadow, onClick, children }) {
  return (
    <motion.button layout="position" onClick={onClick} whileTap={{ scale: 0.985 }} transition={{ layout: GENTLE, default: TAP }}
      style={{ width: 392, height: h, borderRadius: r, ...cardRow, ...(shadow ? { boxShadow: shadow } : null), display: 'flex', alignItems: 'center', gap, padding: `0 ${pad}px`, textAlign: 'left', flex: 'none' }}>
      {children}
    </motion.button>
  );
}

export function VenueRow({ v, onOpen }) {
  return (
    <Row h={112} onClick={() => onOpen(v)}>
      <Thumb />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={nm}>{v.name}</span>
        <span className="nowrap" style={mt}>{v.meta}</span>
        <span style={{ display: 'flex', gap: 6 }}>{v.tags.map(([tone, text]) => <Tag key={text} tone={tone}>{text}</Tag>)}</span>
      </span>
    </Row>
  );
}
function EventRow({ v, onOpen }) {
  return (
    <Row h={120} onClick={() => onOpen(v)}>
      <Thumb src={v.img} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={{ ...mt, fontWeight: 700 }}>{v.when}</span>
        <span className="nowrap" style={nm}>{v.name}</span>
        <span className="nowrap" style={mt}>{v.meta}</span>
      </span>
    </Row>
  );
}
function MoreRow({ v, onOpen }) {
  return (
    <Row h={96} r={20} pad={12} shadow="0 4px 14px rgba(27,42,68,0.05)" onClick={() => onOpen(v)}>
      <Thumb r={12} src={v.img} />
      <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="nowrap" style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: '18px' }}>{v.name}</span>
          <span className="nowrap" style={{ fontSize: 12, fontWeight: 500, color: INK2 }}>{v.dist}</span>
        </span>
        <span className="nowrap" style={{ fontSize: 12, fontWeight: 500, color: INK2, lineHeight: '14px' }}>{v.type}</span>
        <span style={{ display: 'flex', gap: 8 }}>
          {v.checks.map((c) => (
            <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L9.5 17L19 7.5" stroke={INK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: INK }}>{c}</span>
            </span>
          ))}
        </span>
      </span>
    </Row>
  );
}
function PickRow({ v, onOpen }) {
  return (
    <Row h={120} onClick={() => onOpen(v)}>
      <Thumb />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={nm}>{v.name}</span>
        <span className="nowrap" style={mt}>{v.meta}</span>
        <span className="nowrap" style={{ ...mt, fontWeight: 700, color: INK }}>{v.line}</span>
      </span>
    </Row>
  );
}
function RankRow({ v, n, onOpen }) {
  return (
    <Row h={120} onClick={() => onOpen(v)}>
      <span style={{ width: 36, height: 36, borderRadius: 18, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700,
        background: n === 1 ? INK : 'rgba(20,24,31,0.06)', color: n === 1 ? '#fff' : INK }}>{n}</span>
      <Thumb size={64} r={12} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span className="nowrap" style={nm}>{v.name}</span>
        <span className="nowrap" style={mt}>{v.meta}</span>
        <span className="nowrap" style={{ ...mt, fontWeight: 700 }}>{v.line}</span>
      </span>
    </Row>
  );
}
const ROWS = { venue: VenueRow, event: EventRow, more: MoreRow, pick: PickRow, rank: RankRow };

function FilterChips({ sorts, openSense, onOpen }) {
  return (
    <div className="abs hide-sb" style={{ left: 0, top: 119, width: 440, height: 80, overflowX: 'auto', overflowY: 'hidden', padding: '6px 24px 30px', display: 'flex', gap: 8, zIndex: 6, pointerEvents: 'none', alignItems: 'flex-start' }}>
      {SORT_ORDER.map((sense) => {
        const cur = (sorts.find((s) => s[0] === sense) || [])[1];
        return (
          <G key={sense} as="button" r={22} on={!!cur} onClick={() => onOpen(sense, cur)} whileTap={{ scale: 0.95 }} transition={TAP}
            style={{ height: 44, minWidth: SORTS[sense].minW, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', pointerEvents: 'auto', boxShadow: '0 6px 14px rgba(42,38,80,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
            <span className="nowrap" style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{chipText(sense, cur)}</span>
            <motion.span animate={{ rotate: openSense === sense ? 180 : 0 }} transition={GENTLE} style={{ display: 'flex', marginLeft: 0 }}>
              <VIcon name="caretDown" size={15} fill={NAVY} />
            </motion.span>
          </G>
        );
      })}
    </div>
  );
}

export function BackBtn({ onClick, top = 52 }) {
  return (
    <G as="button" r={24} aria-label="Back" onClick={onClick} whileTap={{ scale: 0.9 }} transition={TAP}
      style={{ position: 'absolute', left: 24, top, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
      <VIcon name="caretLeft" size={22} fill={NAVY} />
    </G>
  );
}

export default function ListPage({ kind, onBack, onOpenVenue, onNote, openSort, sortOpen, bannerText, sorts, setSorts }) {
  const cfg = PAGES[kind];
  const Item = ROWS[cfg.kind];
  const rows = sortRows(cfg.rows, sorts);
  const listTop = cfg.listTop || (cfg.chips ? 190 : 192);
  const open = (v) => (v.venue ? onOpenVenue() : onNote(cfg.kind === 'event' ? 'Event pages come later in the prototype' : `Only Foxy Loxy Cafe has a full page so far`));
  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <div className="scroll hide-sb" style={{ inset: `${listTop - 12}px 0 0 0` }}>
        <div style={{ padding: '12px 24px 140px', display: 'flex', flexDirection: 'column', gap: cfg.kind === 'more' ? 10 : 12 }}>
          {rows.map((v, i) => <Item key={v.id} v={v} n={i + 1} onOpen={open} />)}
        </div>
      </div>
      <BackBtn onClick={onBack} top={cfg.back || 52} />
      <div className="abs" style={{ left: 84, top: cfg.head || 56, width: 300, zIndex: 8, pointerEvents: 'none' }}>
        <p className="nowrap" style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: '29px' }}>{cfg.title}</p>
        {cfg.sub && <p className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK2, lineHeight: '16px', marginTop: 2 }}>{cfg.sub}</p>}
      </div>
      {cfg.chips && <FilterChips sorts={sorts} openSense={sortOpen} onOpen={(sense, cur) => openSort(sense, cur, (key) => setSorts((s) => [...s.filter((x) => x[0] !== sense), ...(key ? [[sense, key]] : [])]))} />}
      {cfg.banner && (
        <div className="abs" style={{ left: 24, top: 118, width: 392, height: 44, borderRadius: 20, background: 'rgba(47,98,201,0.08)', border: '1px solid rgba(47,98,201,0.3)',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', zIndex: 6 }}>
          <VIcon name="sparkle" size={20} fill={INK} />
          <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: INK }}>{bannerText}</span>
        </div>
      )}
    </div>
  );
}

// "Sort by" sheet (Figma 951:15145). Same layout for every sense; height follows the option count.
export function SortSheet({ sense, value, onApply, onClose }) {
  const cfg = SORTS[sense];
  const opts = [['any', cfg.any], ...cfg.opts];
  const [pick, setPick] = useState(value || 'any');
  const actionsTop = 136 + 36 * opts.length;
  const apply = (k) => { onApply(k === 'any' ? null : k); onClose(); };
  return (
    <SheetFrame height={actionsTop + 63 + 40} onClose={onClose}>
      <p className="abs nowrap" style={{ left: 24, top: 40, fontSize: 24, fontWeight: 600, color: INK, lineHeight: '28px' }}>{cfg.label}</p>
      <CloseX onClick={onClose} />
      <p className="abs nowrap" style={{ left: 24, top: 84, fontSize: 17, fontWeight: 600, color: INK2, lineHeight: '20px' }}>Sort by</p>
      <div className="abs" style={{ left: 24, top: 120, width: 392 }}>
        {opts.map(([k, label]) => {
          const on = pick === k;
          return (
            <button key={k} onClick={() => setPick(k)} style={{ width: 392, height: 36, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', textAlign: 'left' }}>
              <motion.span initial={false} animate={{ backgroundColor: on ? INK : 'rgba(20,24,31,0)', borderColor: on ? INK : INK2 }} transition={{ duration: 0.18 }}
                style={{ width: 24, height: 24, borderRadius: 12, border: '1.5px solid', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.svg width="14" height="14" viewBox="0 0 14 14" fill="none" initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }} transition={{ duration: 0.18 }}>
                  <path d="M2.5 7.4L5.6 10.4L11.5 4.2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.span>
              <span style={{ fontSize: 15, fontWeight: on ? 700 : 500, color: INK }}>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="abs" style={{ left: 24, top: actionsTop, width: 392, height: 63, display: 'flex', gap: 12, alignItems: 'center' }}>
        <TextBtn onClick={() => apply('any')} style={{ flex: '1 0 0' }}>Clear</TextBtn>
        <DarkCTA inline width={197} label="Apply" onClick={() => apply(pick)} />
      </div>
    </SheetFrame>
  );
}
