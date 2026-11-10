// Street lamp flicker for the Morning hero ("Motion · street lamp", Figma 1067:5929).
// Three layers share the same 6 s loop as the fountain (LOOP). Times are [seconds, value]
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
  opacity: toTrack([[0,1],[0.9,1],[1.0,0.4],[1.08,0.95],[1.16,0.55],[1.3,1],[2.6,1],[2.68,0.3],[2.78,0.9],[2.9,0.6],[3.0,1],[3.6,1],[3.68,0.45],[3.74,1],[3.84,0.65],[3.95,1],[5.0,1],[5.08,0.35],[5.2,0.95],[5.3,0.6],[5.45,1],[6,1]]),
};
export const lampGlow = {
  opacity: toTrack([[0,0.9],[0.9,0.9],[1.0,0.35],[1.1,0.85],[1.2,0.5],[1.35,0.9],[2.6,0.9],[2.7,0.25],[2.85,0.85],[3.0,0.9],[3.6,0.9],[3.7,0.4],[3.8,0.9],[3.95,0.6],[4.05,0.9],[5.0,0.9],[5.1,0.3],[5.3,0.85],[5.45,0.55],[5.6,0.9],[6,0.9]]),
  scale: toTrack([[0,1],[1.0,0.92],[1.35,1.05],[2.6,1],[2.7,0.9],[3.0,1.04],[3.6,1],[3.7,0.92],[3.95,1.04],[5.0,1],[5.1,0.9],[5.45,1.05],[6,1]], 'easeOut'),
};
export const lampHalo = {
  opacity: toTrack([[0,0.55],[0.9,0.55],[1.0,0.2],[1.2,0.6],[1.35,0.35],[1.6,0.58],[2.6,0.55],[2.7,0.15],[2.95,0.6],[3.6,0.55],[3.7,0.25],[3.95,0.62],[5.0,0.55],[5.1,0.18],[5.4,0.6],[5.6,0.4],[5.8,0.55],[6,0.55]], 'easeOut'),
  scale: toTrack([[0,1],[0.9,1],[1.0,0.9],[1.4,1.08],[2.6,1],[2.7,0.88],[3.1,1.08],[3.6,1],[3.7,0.9],[4.0,1.06],[5.0,1],[5.1,0.88],[5.5,1.08],[6,1]], 'easeOut'),
};
