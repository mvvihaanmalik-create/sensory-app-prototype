// Rebuilds the exact keyframe tracks from get_motion_context for the Morning hero
// (nodes 469:2159-469:2173). Every track lives on one shared 6 s loop (timeline cohort 469:2153).
// Each drop/ripple repeats a fixed cycle; the generator emits the same times/values/eases
// the Figma snippets list, including the initial hold for delayed nodes and the held tail.
const C = [0.5, 0, 0.5, 1];
const L = 'linear', O = 'easeOut', I = 'easeIn';

function build(delay, period, lastKeyOffset, first, keys, reset) {
  const times = [0], values = [first], ease = [];
  if (delay > 0) { times.push(delay); values.push(first); ease.push(L); }
  let k = 0;
  for (let s = delay; s + lastKeyOffset <= 1 + 1e-6; s += period, k++) {
    if (k > 0) { times.push(+(s).toFixed(4)); values.push(reset); ease.push(C); }
    for (const [off, v, e] of keys) { times.push(+(s + off).toFixed(4)); values.push(v); ease.push(e); }
  }
  times.push(1); values.push(values[values.length - 1]); ease.push(L);
  return { values, times, ease };
}

// Group A: 4 drops, size 2.6, 1.1 s cycle, fall ends at 0.1558
function dropA(delay, dx) {
  const P = 1.1 / 6, fe = 0.1558;
  return {
    x: build(delay, P, fe, 0, [[fe, dx, L]], 0),
    y: build(delay, P, fe, 0, [[0.055, -8, O], [fe, 2, I]], 0),
    opacity: build(delay, P, fe, 0, [[0.0147, 0.95, L], [0.1283, 0.9, L], [fe, 0, L]], 0),
  };
}
// Groups B/C: 4 drops each, size 2.2, 1.2 s cycle, fall ends at 0.17
function dropB(delay, dx) {
  const P = 0.2, fe = 0.17;
  return {
    x: build(delay, P, fe, 0, [[fe, dx, L]], 0),
    y: build(delay, P, fe, 0, [[0.06, -4, O], [fe, 14, I]], 0),
    opacity: build(delay, P, fe, 0, [[0.016, 0.95, L], [0.14, 0.9, L], [fe, 0, L]], 0),
  };
}
// Basin ripples: 34x6 rings, 2.4 s cycle
function ripple(delay) {
  const P = 0.4, fe = 0.36;
  return {
    scale: build(delay, P, fe, 0.35, [[fe, 1.25, O]], 0.35),
    opacity: build(delay, P, fe, 0, [[0.04, 0.7, L], [fe, 0, O]], 0),
  };
}

// Positions are in hero coordinates (Figma frame y minus 130, the scene's offset).
export const drops = [
  { id: '469:2159', left: 143.45, top: 277.7, size: 2.6, t: dropA(0, -4.5) },
  { id: '469:2160', left: 144.95, top: 277.7, size: 2.6, t: dropA(0.045, -1.5) },
  { id: '469:2161', left: 146.45, top: 277.7, size: 2.6, t: dropA(0.09, 1.5) },
  { id: '469:2162', left: 147.95, top: 277.7, size: 2.6, t: dropA(0.135, 4.5) },
  { id: '469:2163', left: 141.9, top: 286.9, size: 2.2, t: dropB(0, -14) },
  { id: '469:2164', left: 141.9, top: 286.9, size: 2.2, t: dropB(0.05, -14) },
  { id: '469:2165', left: 141.9, top: 286.9, size: 2.2, t: dropB(0.1, -14) },
  { id: '469:2166', left: 141.9, top: 286.9, size: 2.2, t: dropB(0.15, -14) },
  { id: '469:2167', left: 149.9, top: 286.9, size: 2.2, t: dropB(0, 14) },
  { id: '469:2168', left: 149.9, top: 286.9, size: 2.2, t: dropB(0.05, 14) },
  { id: '469:2169', left: 149.9, top: 286.9, size: 2.2, t: dropB(0.1, 14) },
  { id: '469:2170', left: 149.9, top: 286.9, size: 2.2, t: dropB(0.15, 14) },
];
export const ripples = [
  { id: '469:2171', t: ripple(0) },
  { id: '469:2172', t: ripple(0.1333) },
  { id: '469:2173', t: ripple(0.2667) },
];

export const LOOP = 6;
export const toTransition = (track) => ({ duration: LOOP, times: track.times, ease: track.ease, repeat: Infinity });
