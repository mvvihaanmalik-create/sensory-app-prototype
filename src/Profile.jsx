import { motion, useAnimationControls } from 'motion/react';
import { paths, profileIcons as pi } from './svgs.js';
import { Icon, GENTLE, INK, INK2, NAVY, MUTED } from './ui.jsx';

// Glass surface used by Stat tile / Sense tile / Settings row / Toggle row
// (fill glass/light/fill + 135° sheen, 1.5 stroke glass/light/stroke, bg blur, 0 14 36 shadow)
const glass = (r) => ({
  position: 'relative', borderRadius: r, border: '1.5px solid rgba(255,255,255,0.95)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 100%), rgba(255,255,255,0.55)',
  WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)', boxShadow: '0 14px 36px rgba(42,38,80,0.1)',
});

function Svg({ d, size, vb, fill }) {
  return <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none" style={{ display: 'block', flex: 'none' }}><path d={d} fill={fill} /></svg>;
}

const rise = (i) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { ...GENTLE, delay: 0.05 + i * 0.05 } });

function SettingsRow({ icon, label, i }) {
  return (
    <motion.button {...rise(i)} whileTap={{ scale: 0.98 }}
      style={{ ...glass(28), width: 392, height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16.5px 0 18.5px', textAlign: 'left' }}>
      <Svg d={icon} size={22} vb={22} fill={NAVY} />
      <span style={{ flex: '1 0 0', fontSize: 16, fontWeight: 500, color: NAVY }}>{label}</span>
      <Svg d={pi.caret} size={18} vb={18} fill={MUTED} />
    </motion.button>
  );
}

export default function Profile({ onScroll }) {
  const knob = useAnimationControls();
  // "Coming soon": the switch only nudges, it does not turn on.
  const nudge = () => knob.start({ x: [0, 6, 0], transition: { duration: 0.45, ease: 'easeInOut' } });
  return (
    <div className="scroll" style={{ background: '#f7f5f1' }} onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}>
      <div style={{ position: 'relative', width: 440, minHeight: 956, paddingBottom: 140 }}>
        <p className="abs nowrap" style={{ left: 24, top: 59, fontSize: 15, fontWeight: 500, color: INK2 }}>Savannah, GA</p>
        <p className="abs nowrap" style={{ left: 24, top: 90, fontSize: 40, fontWeight: 600, lineHeight: '44px', letterSpacing: -1, color: INK }}>Profile</p>

        <div style={{ position: 'relative', top: 160, left: 24, width: 392, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Profile header */}
          <motion.div {...rise(0)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ ...glass(32), width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon d={paths.user} size={28} fill={NAVY} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>Raph</span>
              <span style={{ fontSize: 14, color: MUTED }}>Find places that feel right.</span>
            </div>
          </motion.div>

          {/* Stat tiles */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[['12', 'Saved'], ['4', 'Lists'], ['3', 'Posts']].map(([v, l], i) => (
              <motion.button key={l} {...rise(1 + i * 0.5)} whileTap={{ scale: 0.96 }}
                style={{ ...glass(24), flex: '1 0 0', height: 82, padding: '14.5px 16.5px', display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                <span style={{ fontSize: 24, fontWeight: 600, color: NAVY, lineHeight: '29px' }}>{v}</span>
                <span style={{ fontSize: 13, color: MUTED }}>{l}</span>
              </motion.button>
            ))}
          </div>

          {/* Sensory profile */}
          <motion.div {...rise(3)} style={{ ...glass(28), padding: '18.5px 18.5px 18.5px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>Your sensory profile</span>
              <button style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Edit</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['Sound', paths.speaker, 'Quiet'], ['Light', paths.sun, 'Soft'], ['Crowd', paths.users, 'A few people']].map(([k, d, v]) => (
                <motion.div key={k} whileTap={{ scale: 0.96 }}
                  style={{ ...glass(24), flex: '1 0 0', height: 105, padding: '14.5px 6.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Icon d={d} fill={NAVY} />
                  <span style={{ fontSize: 13, color: MUTED }}>{k}</span>
                  <span className="nowrap" style={{ fontSize: 15, fontWeight: 500, color: NAVY }}>{v}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SettingsRow icon={pi.export} label="Share comfort profile" i={4} />
            <SettingsRow icon={pi.sliders} label="App comfort" i={4.5} />
            <motion.button {...rise(5)} onClick={nudge}
              style={{ ...glass(32), width: 392, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '10.5px 10.5px 10.5px 18.5px', textAlign: 'left' }}>
              <Svg d={pi.bell} size={22} vb={22} fill={NAVY} />
              <span style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: NAVY }}>Sensory change alerts</span>
                <span style={{ fontSize: 13, color: MUTED }}>Coming soon</span>
              </span>
              <span style={{ width: 52, height: 32, borderRadius: 16, background: 'rgba(42,38,80,0.12)', padding: 3, display: 'flex', alignItems: 'center' }}>
                <motion.span animate={knob} style={{ width: 26, height: 26, borderRadius: 13, background: '#fff', boxShadow: '0 2px 6px rgba(42,38,80,0.15)' }} />
              </span>
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
}
