import { useContext, useEffect, useRef } from 'react';
import { MotionConfigContext, useReducedMotion } from 'motion/react';
import { useScale } from './ui.jsx';
import './ticketInteraction.css';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const rest = () => ({ x: 0, y: 0, rx: 0, ry: 0, rz: 0, z: 0, vx: 0, vy: 0, vrx: 0, vry: 0, vrz: 0, vz: 0 });

// A light card: angular momentum coasts under air drag, then a damped spring
// catches the nearest complete turn. Translation always returns to its slot.
export default function TicketInteraction({ children, color, mask, back }) {
  const scale = useScale();
  const osReduced = useReducedMotion();
  const config = useContext(MotionConfigContext);
  const reduced = config.reducedMotion === 'always' || (config.reducedMotion !== 'never' && osReduced);
  const face = useRef(null), shadow = useRef(null), body = useRef(rest()), gesture = useRef(null);
  const frame = useRef(0), previous = useRef(0), target = useRef(null);
  const spinAxis = useRef(null);
  const prefs = useRef({ scale, reduced }); prefs.current = { scale, reduced };

  const paint = () => {
    const p = body.current;
    if (face.current) face.current.style.transform = `translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`;
    // Project the card's footprint onto the page under a light above-left.
    // The shadow stays on the page, rather than rotating with the printed face.
    if (shadow.current) {
      const sx = Math.max(.05, Math.abs(Math.cos(p.ry * Math.PI / 180)));
      const sy = Math.max(.08, Math.abs(Math.cos(p.rx * Math.PI / 180)));
      shadow.current.style.transform = `translate3d(${p.x + 5 + p.z * .28}px,${p.y + 12 + p.z * .4}px,0) rotate(${p.rz}deg) scale(${sx},${sy})`;
      shadow.current.style.filter = `blur(${10 + p.z * .28}px)`;
      shadow.current.style.opacity = String(.12 - p.z * .0015);
    }
  };
  const stop = () => { cancelAnimationFrame(frame.current); frame.current = 0; previous.current = 0; };
  const reset = () => { stop(); gesture.current = null; target.current = null; spinAxis.current = null; body.current = rest(); paint(); };
  const tick = (time) => {
    const dt = previous.current ? Math.min((time - previous.current) / 1000, .04) : 1 / 60;
    previous.current = time;
    const p = body.current, held = !!gesture.current;
    // Substeps keep the spring stable at low frame rates and across displays.
    const steps = Math.ceil(dt / (1 / 120)), h = dt / steps;
    for (let i = 0; i < steps; i++) {
      if (!held) {
        for (const k of ['x', 'y', 'z']) {
          const v = 'v' + k;
          p[v] += (-110 * p[k] - 20 * p[v]) * h; p[k] += p[v] * h;
        }
        if (!target.current && Math.hypot(p.vrx, p.vry) < 70) {
          target.current = { rx: Math.round(p.rx / 360) * 360, ry: Math.round(p.ry / 360) * 360, rz: 0 };
        }
        for (const k of ['rx', 'ry', 'rz']) {
          const v = 'v' + k;
          if (target.current) p[v] += (65 * (target.current[k] - p[k]) - 16 * p[v]) * h;
          else p[v] *= Math.exp(-1.65 * h);
          p[k] += p[v] * h;
        }
      }
    }
    paint();
    const asleep = !held && target.current && Math.hypot(p.x, p.y, p.z, p.rx - target.current.rx, p.ry - target.current.ry, p.rz) < .08 && Math.hypot(p.vx, p.vy, p.vz, p.vrx, p.vry, p.vrz) < .3;
    if (asleep) { reset(); return; }
    if (!held) frame.current = requestAnimationFrame(tick);
    else { frame.current = 0; previous.current = 0; }
  };
  const start = () => { if (!frame.current) frame.current = requestAnimationFrame(tick); };
  const down = (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || gesture.current) return;
    stop(); target.current = null;
    const p = body.current;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, rx: p.rx, ry: p.ry, px: p.x, py: p.y, time: performance.now(), axis: spinAxis.current };
    p.vx = p.vy = p.vrx = p.vry = p.vrz = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.pointer = 'true';
    e.currentTarget.focus({ preventScroll: true });
    e.currentTarget.style.cursor = 'grabbing';
  };
  const move = (e) => {
    const g = gesture.current; if (!g || e.pointerId !== g.id) return;
    const p = body.current, now = performance.now(), dt = Math.max((now - g.time) / 1000, .008);
    const dx = (e.clientX - g.x) / prefs.current.scale, dy = (e.clientY - g.y) / prefs.current.scale;
    // Choose one hinge for the whole gesture. While a spin is still coasting,
    // grabbing it keeps that hinge until it settles, avoiding mixed-axis tumbles.
    if (!g.axis && Math.hypot(dx, dy) >= 6) {
      g.axis = Math.abs(dx) >= Math.abs(dy) ? 'ry' : 'rx';
      spinAxis.current = g.axis;
    }
    const rx = g.axis === 'rx' ? g.rx - dy * .42 : 0;
    const ry = g.axis === 'ry' ? g.ry + dx * .7 : 0;
    p.vrx = .55 * p.vrx + .45 * clamp((rx - p.rx) / dt, -1800, 1800);
    p.vry = .55 * p.vry + .45 * clamp((ry - p.ry) / dt, -2200, 2200);
    p.x = g.px + 65 * Math.tanh(dx / 130); p.y = g.py + 70 * Math.tanh(dy / 140);
    p.rx = prefs.current.reduced ? 0 : rx; p.ry = prefs.current.reduced ? 0 : ry;
    p.rz = p.vrz = 0; p.z = prefs.current.reduced ? 0 : 12;
    g.time = now; paint();
  };
  const release = (e, canceled = false) => {
    const g = gesture.current; if (!g || e.pointerId !== g.id) return;
    gesture.current = null;
    e.currentTarget.style.cursor = 'grab';
    if (prefs.current.reduced) { reset(); return; }
    if (canceled || performance.now() - g.time > 90) body.current.vrx = body.current.vry = 0;
    start();
  };
  const key = (e) => {
    delete e.currentTarget.dataset.pointer;
    if (e.key === 'Escape' || e.key === 'Home') { e.preventDefault(); reset(); return; }
    const k = { ArrowLeft: ['vry', -650], ArrowRight: ['vry', 650], ArrowUp: ['vrx', -550], ArrowDown: ['vrx', 550] }[e.key];
    if (!k) return; e.preventDefault();
    if (prefs.current.reduced) return;
    const axis = k[0].slice(1);
    if (spinAxis.current && spinAxis.current !== axis) return;
    spinAxis.current = axis;
    target.current = null; body.current[k[0]] += k[1]; start();
  };
  useEffect(() => { if (reduced) reset(); }, [reduced]);
  useEffect(() => {
    const hide = () => { if (document.hidden) reset(); };
    document.addEventListener('visibilitychange', hide);
    return () => { stop(); document.removeEventListener('visibilitychange', hide); };
  }, []);

  return <div className="ticket-interaction" role="group" aria-label="Interactive booking ticket" tabIndex={0}
    onPointerDown={down} onPointerMove={move} onPointerUp={e => release(e)} onPointerCancel={e => release(e, true)} onLostPointerCapture={e => release(e, true)} onKeyDown={key}
    style={{ position: 'relative', width: 340, height: 468, alignSelf: 'center', perspective: 1400, touchAction: 'none', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
    <div aria-hidden="true" ref={shadow} style={{ position: 'absolute', inset: 0, borderRadius: 26, background: '#1b2a44', opacity: .12, filter: 'blur(10px)', transform: 'translate3d(5px,12px,0)', pointerEvents: 'none' }} />
    <div ref={face} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', willChange: 'transform' }}>
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(.6px)' }}>{children}</div>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 26, background: color, mask, WebkitMask: mask, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(.6px)', overflow: 'hidden' }}>
        {back}
      </div>
    </div>
  </div>;
}

export function TicketArtwork({ src }) {
  const osReduced = useReducedMotion();
  const config = useContext(MotionConfigContext);
  const reduced = config.reducedMotion === 'always' || osReduced;
  return <div aria-hidden="true" className="abs ticket-artwork" style={{ inset: '-12%', background: `url(${src}) center / cover`, pointerEvents: 'none', ...(reduced ? { animation: 'none' } : {}) }} />;
}
