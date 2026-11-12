// Profile frames 737:2790, 1025:6415, 1025:6438 and 1025:6461.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { Glass, GENTLE, INK, INK2, NAVY, MUTED, useScale } from './ui.jsx';
import { TAP } from './flow.jsx';
import { MODE_GREEN, MODE_TINT, modeSummary } from './Modes.jsx';
import { SavedPlaceList } from './Lists.jsx';
import { profileAssets as A } from './profileAssets.js';
import './profile.css';

const rise = () => ({ initial: false });
function SettingsRow({ icon, label, i, angle = '171.1096deg' }) {
  return <motion.button {...rise(i)} whileTap={{ scale: .98 }} transition={GENTLE} style={{ position: 'relative', width: 392, height: 56, textAlign: 'left' }}>
    <Glass radius={28} angle={angle} style={{ inset: 0 }} contentStyle={{ gap: 12, padding: '0 16.5px 0 18.5px' }}>
      <img src={A[icon]} alt="" /><span style={{ flex: '1 0 0', fontSize: 16, fontWeight: 500, color: NAVY }}>{label}</span><img src={A.caret} alt="" />
    </Glass>
  </motion.button>;
}

function MyModes({ modes, activeId, onPick, onEdit, onAdd }) {
  const [view, setView] = useState(activeId);
  const scale = useScale(), gesture = useRef(null), dragged = useRef(false);
  const pages = [...modes.map(m => m.id), 'add'];
  const index = Math.max(0, pages.indexOf(view));
  const mode = modes.find(m => m.id === view);
  useEffect(() => { setView(activeId); }, [activeId]);
  const choose = i => { const next = pages[Math.max(0, Math.min(pages.length - 1, i))]; setView(next); if (next !== 'add') onPick(next); };
  const begin = e => { if (e.button !== 0) return; dragged.current = false; gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }; };
  const move = e => {
    const g = gesture.current; if (!g) return;
    const dx = (e.clientX - g.x) / scale, dy = (e.clientY - g.y) / scale;
    if (!g.moved && Math.max(Math.abs(dx), Math.abs(dy)) > 6) {
      if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      g.moved = true; dragged.current = true; e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const end = e => { const g = gesture.current; gesture.current = null; if (g?.moved) { const dx = (e.clientX - g.x) / scale; if (Math.abs(dx) > 32) choose(index + (dx < 0 ? 1 : -1)); } };
  const edit = () => { if (dragged.current) return; mode ? onEdit(mode.id) : onAdd(); };
  return <div className="profile-modes" data-profile-modes>
    <p>My modes</p><p>Swipe to change mode</p>
    <div className="profile-mode-stage">
      <AnimatePresence initial={false} mode="wait"><motion.div key={view} className="profile-mode-card" data-profile-mode={view} role="button" tabIndex={0} aria-label={mode ? `${mode.name}. Edit mode` : 'Add mode'}
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={GENTLE}
        style={{ background: mode ? '#fff' : MODE_TINT, touchAction: 'pan-y' }}
        onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { gesture.current = null; }} onClick={edit}
        onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); choose(index + (e.key === 'ArrowRight' ? 1 : -1)); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dragged.current = false; edit(); } }}>
        <p className="profile-mode-title">{mode ? mode.name : 'Add mode'}</p>
        {(!mode || mode.desc) && <p className="profile-mode-description">{mode ? mode.desc : 'Make a mode for another setting'}</p>}
        {mode ? <><div className="profile-mode-summary">{modeSummary(mode)}</div><p className="profile-mode-edit">{'Edit mode  ›'}</p>{mode.id === activeId && <p className="profile-mode-active">ACTIVE</p>}</>
          : <p className="profile-mode-add">{'＋  Add new mode'}</p>}
      </motion.div></AnimatePresence>
    </div>
    <div className="profile-mode-dots" style={{ left: (392 - pages.length * 18) / 2 }}>
      {pages.map((id, i) => <button key={id} aria-label={id === 'add' ? 'Add mode' : modes[i].name} aria-pressed={id === view} onClick={() => choose(i)}><motion.span initial={false} animate={{ backgroundColor: id === view ? MODE_GREEN : MODE_TINT }} transition={GENTLE} /></button>)}
    </div>
  </div>;
}

export default function Profile({ onScroll, savedCount = 12, savedPlaces = [], modes, activeId, onPickMode, onEditMode, onAddMode, onOpenVenue }) {
  const [savedOpen, setSavedOpen] = useState(false);
  const knob = useAnimationControls();
  const nudge = () => knob.start({ x: [0, 6, 0], transition: { duration: .45, ease: 'easeInOut' } });
  return <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
    <div className="scroll" onScroll={e => onScroll?.(e.currentTarget.scrollTop)} aria-hidden={savedOpen || undefined}>
      <div style={{ position: 'relative', width: 440, minHeight: 956 }}>
        <p className="abs nowrap" style={{ left: 24, top: 59, fontSize: 15, fontWeight: 500, color: INK2 }}>Savannah, GA</p>
        <p className="abs nowrap" style={{ left: 24, top: 90, fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: INK }}>Profile</p>
        <div className="abs" style={{ top: 160, left: 24, width: 392, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <motion.div {...rise(0)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Glass radius={32} style={{ position: 'relative', width: 64, height: 64 }} contentStyle={{ justifyContent: 'center' }}><img src={A.user} alt="" /></Glass>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>Raph</span><span style={{ fontSize: 14, color: MUTED }}>Find places that feel right.</span></div>
          </motion.div>
          <div style={{ display: 'flex', gap: 12 }}>{[[String(savedCount), 'Saved'], ['4', 'Lists'], ['3', 'Posts']].map(([value, label], i) => <motion.button key={label} {...rise(1 + i * .5)} whileTap={{ scale: .96 }} onClick={label === 'Saved' ? () => setSavedOpen(true) : undefined} style={{ position: 'relative', height: 82, flex: '1 0 0', minWidth: 0, textAlign: 'left' }}>
            <Glass radius={24} angle="143.7905deg" style={{ inset: 0 }} contentStyle={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '14.5px 16.5px' }}><span style={{ fontSize: 24, fontWeight: 600, lineHeight: '29px', color: NAVY }}>{value}</span><span style={{ fontSize: 13, lineHeight: '16px', color: MUTED }}>{label}</span></Glass>
          </motion.button>)}</div>
          <MyModes modes={modes} activeId={activeId} onPick={onPickMode} onEdit={onEditMode} onAdd={onAddMode} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SettingsRow icon="share" label="Share comfort profile" i={4} />
            <SettingsRow icon="sliders" label="App comfort" i={4.5} angle="171.8699deg" />
            <motion.button {...rise(5)} onClick={nudge} style={{ position: 'relative', width: 392, height: 64, textAlign: 'left' }}>
              <Glass radius={32} angle="170.7274deg" style={{ inset: 0 }} contentStyle={{ gap: 12, padding: '10.5px 10.5px 10.5px 18.5px' }}>
                <img src={A.bell} alt="" /><span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 16, fontWeight: 500, color: NAVY }}>Sensory change alerts</span><span style={{ fontSize: 13, color: MUTED }}>Coming soon</span></span><span style={{ position: 'relative', width: 52, height: 32, flex: 'none' }}><motion.img animate={knob} src={A.toggle} alt="" style={{ position: 'absolute', left: 0, top: 0 }} /></span>
              </Glass>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>{savedOpen && <motion.div className="abs" data-saved-places style={{ inset: 0, background: '#f7f5f1' }} initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
      <div className="scroll" style={{ top: 118 }}><div style={{ padding: '0 24px 140px' }}><p style={{ fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, marginBottom: 12 }}>Saved places</p><SavedPlaceList rows={savedPlaces} onOpen={v => { if (v.venue) onOpenVenue(); }} /></div></div>
      <motion.button className="abs" aria-label="Back" onClick={() => setSavedOpen(false)} whileTap={{ scale: .9 }} transition={TAP} style={{ left: 24, top: 54, width: 48, height: 48 }}><Glass radius={24} style={{ inset: 0 }} contentStyle={{ justifyContent: 'center' }}><img src={A.back} alt="" /></Glass></motion.button>
    </motion.div>}</AnimatePresence>
  </div>;
}
