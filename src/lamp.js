// Street lamp glow for the Morning hero ("Motion · street lamp", Figma 1067:5929).
// The lamp stays lit and its intensity swells slowly (no sharp flicker). Three layers share the same 6 s loop as the fountain (LOOP). Times are [seconds, value]
// pairs from the Figma keyframes; toTrack() turns them into the 0..1 times motion expects.
import { LOOP } from './fountain.js';

const toTrack = (pts, ease = 'linear') => ({
  values: pts.map((p) => p[1]),
  times: pts.map((p) => +(p[0] / LOOP).toFixed(5)),
  ease: pts.slice(1).map(() => ease),
});

// Lantern centre in hero coordinates (Figma scene-art 242, 344 minus the 130 offset).
export const LAMP = { x: 242, y: 214 };

export const lampCore = {
  opacity: toTrack([[0,1],[1.5,0.82],[3,1],[4.5,0.88],[6,1]], 'easeInOut'),
};
export const lampGlow = {
  opacity: toTrack([[0,0.9],[1.5,0.68],[3,0.92],[4.5,0.76],[6,0.9]], 'easeInOut'),
  scale: toTrack([[0,1],[1.5,0.96],[3,1.03],[4.5,0.98],[6,1]], 'easeInOut'),
};
export const lampHalo = {
  opacity: toTrack([[0,0.55],[1.5,0.38],[3,0.58],[4.5,0.45],[6,0.55]], 'easeInOut'),
  scale: toTrack([[0,1],[1.5,0.94],[3,1.05],[4.5,0.97],[6,1]], 'easeInOut'),
};
