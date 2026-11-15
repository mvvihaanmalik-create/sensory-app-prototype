// Fullscreen photo viewer. Tap a photo to open; swipe sideways between photos, swipe down or tap X to close.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { VIcon } from './venueIcons.jsx';

const SLIDE = { type: 'spring', stiffness: 320, damping: 34 };

export function useLightbox() {
  const [box, setBox] = useState(null); // { photos, i }
  return { box, open: (photos, i) => setBox({ photos, i }), close: () => setBox(null), setI: (i) => setBox((b) => b && { ...b, i }) };
}

export default function Lightbox({ box, onClose, setI }) {
  const [dir, setDir] = useState(0);
  const n = box?.photos.length || 0;
  const go = (d) => { if (!box) return; const i = box.i + d; if (i < 0 || i >= n) return; setDir(d); setI(i); };
  useEffect(() => {
    if (!box) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  return (
    <AnimatePresence>
      {box && (
        <motion.div key="lightbox" className="abs" role="dialog" aria-modal="true" aria-label="Photo"
          style={{ inset: 0, zIndex: 80, background: 'rgba(8,8,10,0.96)', overflow: 'hidden', touchAction: 'none' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.img key={box.i} src={box.photos[box.i]} alt="" draggable={false} className="abs"
              style={{ left: 0, top: 0, width: 440, height: 956, objectFit: 'contain', cursor: 'grab' }}
              custom={dir}
              variants={{ enter: (d) => ({ x: d * 440, opacity: d ? 1 : 0, scale: d ? 1 : 0.94 }), center: { x: 0, opacity: 1, scale: 1 }, exit: (d) => ({ x: -d * 440, opacity: 1 }) }}
              initial="enter" animate="center" exit="exit" transition={SLIDE}
              drag dragDirectionLock dragSnapToOrigin dragElastic={{ left: box.i < n - 1 ? 0.9 : 0.15, right: box.i > 0 ? 0.9 : 0.15, top: 0.2, bottom: 0.9 }}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.y > 110 || velocity.y > 700) onClose();
                else if (offset.x < -70 || velocity.x < -500) go(1);
                else if (offset.x > 70 || velocity.x > 500) go(-1);
              }} />
          </AnimatePresence>
          <motion.button aria-label="Close" onClick={onClose} whileTap={{ scale: 0.9 }}
            className="abs" style={{ left: 24, top: 56, width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.28)', WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)', zIndex: 2 }}>
            <VIcon name="x22" fill="#fff" />
          </motion.button>
          {n > 1 && (
            <div className="abs" style={{ left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2, pointerEvents: 'none' }}>
              {box.photos.map((_, i) => <motion.span key={i} initial={false} animate={{ width: i === box.i ? 22 : 7, backgroundColor: i === box.i ? '#fff' : 'rgba(255,255,255,0.4)' }} style={{ height: 7, borderRadius: 4, display: 'block' }} />)}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
