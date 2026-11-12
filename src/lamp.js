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
  opacity: toTrack([[0,0.6],[1.5,0.46],[3,0.62],[4.5,0.5],[6,0.6]], 'easeInOut'),
};
export const lampGlow = {
  opacity: toTrack([[0,0.45],[1.5,0.33],[3,0.47],[4.5,0.38],[6,0.45]], 'easeInOut'),
  scale: toTrack([[0,1],[1.5,0.96],[3,1.03],[4.5,0.98],[6,1]], 'easeInOut'),
};
export const lampHalo = {
  opacity: toTrack([[0,0.3],[1.5,0.2],[3,0.32],[4.5,0.24],[6,0.3]], 'easeInOut'),
  scale: toTrack([[0,1],[1.5,0.94],[3,1.05],[4.5,0.97],[6,1]], 'easeInOut'),
};
