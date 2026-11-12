// Home hero scenes from Figma "Final flow": Time of day and Event bands (Hero scene frames).
// Each scene carries its art, scrim, greeting lines and the Motion layer rebuilt from the Figma keyframe tracks.
// Layer coordinates are the Motion frame's own (440x550 frame at y = -off inside the 440x314 hero).
import { LOOP } from './fountain.js';
import sceneMorning from './assets/scene-morning.jpg';
import afternoon from './assets/scenes/afternoon.jpg';
import evening from './assets/scenes/evening.jpg';
import night from './assets/scenes/night.jpg';
import stpatricks from './assets/scenes/stpatricks.jpg';
import music from './assets/scenes/music.jpg';
import holiday from './assets/scenes/holiday.jpg';
import halloween from './assets/scenes/halloween.jpg';
import christmas from './assets/scenes/christmas.jpg';

const C = [0.5, 0, 0.5, 1];
const EASE = { i: 'easeInOut', l: 'linear', o: 'easeOut', n: 'easeIn' };

// [[seconds, value, ease]] -> motion keyframes on the shared 6 s loop. Before the first key and after the last the value holds.
function track(kfs) {
  const times = [0], values = [kfs[0][1]], ease = [];
  kfs.forEach(([t, v, e], i) => {
    if (i === 0) { if (t > 0) { times.push(t); values.push(v); ease.push('linear'); } return; }
    times.push(t); values.push(v); ease.push(EASE[e] || e);
  });
  const last = kfs[kfs.length - 1];
  if (last[0] < LOOP) { times.push(LOOP); values.push(last[1]); ease.push('linear'); }
  return { values, times: times.map((t) => +(t / LOOP).toFixed(5)), ease };
}

// A cycle that repeats every P seconds from `delay`, while a whole period still fits in the loop.
function cyc(delay, P, first, keys, reset) {
  const k = [[delay, first]];
  for (let s = delay, n = 0; s + P <= LOOP + 1e-6; s += P, n++) {
    if (n > 0) k.push([+s.toFixed(4), reset, C]);
    for (const [off, v, e] of keys) k.push([+(s + off).toFixed(4), v, e]);
  }
  return k;
}

// Fountain drop: 1 cycle = rise (ease out), fall (ease in), fade 0.95 -> 0.9 -> 0
const drop = (x, y, size, bg, delay, P, yUp, yDown, dx) => ({
  x, y, w: size, h: size, bg, round: true,
  t: {
    opacity: track(cyc(delay, P, 0, [[0.08 * P, 0.95, 'l'], [0.7 * P, 0.9, 'l'], [0.85 * P, 0, 'l']], 0)),
    x: track(cyc(delay, P, 0, [[0.85 * P, dx, 'l']], 0)),
    y: track(cyc(delay, P, 0, [[0.3 * P, yUp, 'o'], [0.85 * P, yDown, 'n']], 0)),
  },
});
// Basin ripple: 2.4 s cycle, grows 0.35 -> 1.25 while fading
const ripple = (x, y, w, h, color, delay) => ({
  x, y, w, h, round: true, border: `1.2px solid ${color}`,
  t: {
    opacity: track(cyc(delay, 2.4, 0, [[0.24, 0.7, 'l'], [2.16, 0, 'o']], 0)),
    scale: track(cyc(delay, 2.4, 0.35, [[2.16, 1.25, 'o']], 0.35)),
  },
});
const seq = (n, step) => Array.from({ length: n }, (_, i) => +(i * step).toFixed(4));

function fountain({ color, A, B, C: Cc, rip }) {
  const out = [];
  A.dx.forEach((dx, i) => out.push(drop(A.x + i * 1.5, A.y, 2.6, color, +(i * 0.27).toFixed(3), 1.1, A.up, A.down, dx)));
  for (const [grp, P] of [[B, B.P], [Cc, Cc.P]]) {
    grp.delays.forEach((d) => {
      out.push(drop(grp.xl, grp.y, 3.2, color, d, P, grp.up, grp.down, -grp.dx));
      out.push(drop(grp.xr, grp.y, 3.2, color, d, P, grp.up, grp.down, grp.dx));
    });
  }
  [0, 0.8, 1.6].forEach((d) => out.push(ripple(rip.x, rip.y, rip.w, rip.h, color, d)));
  return out;
}

// River shimmer: thin glints fade in and slide right
const shimmer = (x, y, w, t0) => ({
  x, y, w, h: 2, cr: 1, bg: '#ffe4b5',
  t: {
    opacity: track([[t0, 0], [+(t0 + 1.2).toFixed(3), 0.85, 'i'], [+(t0 + 2.85).toFixed(3), 0, 'i']]),
    x: track([[t0, -4], [+(t0 + 2.85).toFixed(3), 5, 'i']]),
  },
});
const SHIMMER = [[327.04, 351.56, 10, 0.88], [280.33, 355.97, 24.6, 1.183], [323.78, 362.84, 18.72, 1.791], [291.4, 367.03, 13.41, 1.946],
  [279.78, 373.83, 17.83, 1.003], [310.41, 379.39, 11.92, 1.957], [322.89, 383.92, 15.08, 0.809], [315.54, 389.6, 11.76, 2.433], [294.18, 395.36, 16.87, 1.924]];

// Fireflies drift side to side and pulse twice per loop
const firefly = (x, y, t0, a, b) => ({
  x, y, w: 3.5, h: 3.5, round: true, bg: '#ffe68a', glow: '0 0 6px rgba(255,230,138,0.9)',
  t: {
    opacity: track([[t0, 0.15], [+(t0 + 0.9).toFixed(3), 1, 'i'], [+(t0 + 1.9).toFixed(3), 0.15, 'i'], [+(t0 + 2).toFixed(3), 0.15, C], [+(t0 + 2.9).toFixed(3), 1, 'i'], [+(t0 + 3.9).toFixed(3), 0.15, 'i']]),
    x: track([[0, 0], [1.5, a, 'i'], [3, 0, 'i'], [4.5, -a, 'i'], [6, 0, 'i']]),
    y: track([[0, 0], [2, -b, 'i'], [4, +(0.6 * b).toFixed(4), 'i'], [6, 0, 'i']]),
  },
});
const FIREFLIES = [[310.28, 407.74, 0.47, 15.5519, 11.6135], [411.47, 384.11, 0.727, 13.6678, 7.0607], [309.6, 357.54, 1.665, 9.6355, 6.4565],
  [340.72, 324.69, 1.665, 9.7453, 11.3706], [346.65, 366.61, 1.047, 11.4604, 7.4226], [358.8, 379.65, 0.94, 11.9516, 12.4657],
  [332.9, 361.76, 1.007, 13.3882, 7.95], [412.55, 352.21, 0.644, 11.6909, 10.1899], [383.41, 333.31, 0.278, 14.0757, 11.8082]];

// Music notes: a head, stem and flag that float up and sway, staggered every 0.75 s
const NOTE = '#fff1d6';
function note(x, flag, s, dir, twice) {
  const cycle = (c) => ({
    o: [[s + c, 0, c ? C : undefined], [s + c + 0.6, 0.9, 'o'], [s + c + 2.85, 0, 'n']],
    x: [[s + c, 0, c ? C : undefined], [s + c + 1.5, dir * 8, 'i'], [s + c + 2.85, -dir * 4, 'i']],
    y: [[s + c, 0, c ? C : undefined], [s + c + 2.85, -78, 'o']],
  });
  const cs = twice ? [cycle(0), cycle(3)] : [cycle(0)];
  const join = (k) => cs.flatMap((c) => c[k]).map((a) => (a[2] === undefined ? [a[0], a[1]] : a));
  return {
    x, y: 388, w: 14, h: 18,
    t: { opacity: track(join('o')), x: track(join('x')), y: track(join('y')) },
    k: [
      { x: 0, y: 12, w: 7, h: 5.5, round: true, bg: NOTE, rot: -20 },
      { x: 5.6, y: 1, w: 1.6, h: 13, bg: NOTE },
      { x: 5.6, y: 1, w: flag, h: 2, bg: NOTE, rot: 20 },
    ],
  };
}

// Holiday twinkle: lights pulse 0.1 -> 1 -> 0.1 once or twice per loop
const twinkle = (x, y, ts) => ({
  x, y, w: 4, h: 4, round: true, bg: '#ffe08a', glow: '0 0 7px rgba(255,224,138,0.9)',
  t: { opacity: track([[ts[0], 0.1], [ts[1], 1, 'i'], [ts[2], 0.1, 'i'], ...(ts[3] ? [[ts[3], 0.1, C], [ts[4], 1, 'i'], [ts[5], 0.1, 'i']] : [])]) },
});
const TWINKLE = [[125.83, 284.9, [1.147, 1.869, 3.004, 3.211, 3.933, 5.068]], [92.61, 324.19, [0.91, 1.838, 3.297]],
  [39.59, 375.17, [0.03, 0.861, 2.166, 2.403, 3.233, 4.539]], [125.87, 422.59, [0.269, 0.994, 2.133, 2.34, 3.065, 4.205]],
  [92.71, 297.9, [1.379, 2.271, 3.673]], [108.69, 386.26, [1.809, 2.579, 3.789]], [114.95, 416.34, [0.87, 1.776, 3.199]],
  [54.38, 282.06, [1.503, 2.294, 3.538]], [50.36, 324.99, [1.858, 2.701, 4.024]], [26.86, 375.98, [0.997, 2.026, 3.642]],
  [345.45, 338.41, [1.872, 2.83, 4.336]], [414.45, 388.29, [1.901, 2.681, 3.906]], [410.28, 274.8, [1.561, 2.533, 4.061]],
  [323.66, 373.84, [1.833, 2.792, 4.3]], [364.55, 389.52, [1.418, 2.134, 3.258, 3.462, 4.177, 5.301]], [395.68, 388.94, [0.521, 1.51, 3.063]],
  [359.71, 291.64, [0.64, 1.495, 2.839, 3.083, 3.938, 5.281]], [329.27, 392.83, [1.26, 2.242, 3.785]]];

// Candle flicker: warm glows breathing at slightly different phases
const GLOW = 'radial-gradient(circle closest-side, rgba(255,181,71,0.75), rgba(255,138,42,0))';
const candle = (x, y, size, d) => {
  const o = [0.8, 1.3, 2, 2.7, 3.6, 4.5, 5.4];
  const v = [0.9, 0.6, 1, 0.5, 0.85, 0.6, 0.95];
  return {
    x, y, w: size, h: size, round: true, bg: GLOW,
    t: {
      opacity: track([[0, 0.55], ...o.map((t, i) => [+(t + d).toFixed(3), v[i], 'i']), [6, 0.55, 'i']]),
      scale: track([[0, 1], [1.5, 1.06, 'i'], [3, 0.97, 'i'], [4.5, 1.05, 'i'], [6, 1, 'i']]),
    },
  };
};

// Snowfall: flakes drift sideways while falling 404 px
const flake = (x, y, size, s, dur, a) => ({
  x, y, w: size, h: size, round: true, bg: 'rgba(255,255,255,0.9)',
  t: {
    opacity: track([[s, 0], [+(s + 0.1031 * dur).toFixed(3), 0.75, 'l'], [+(s + dur - 0.1237 * dur).toFixed(3), 0.75, 'l'], [+(s + dur).toFixed(3), 0, 'l']]),
    x: track([[s, 0], [+(s + 0.34 * dur).toFixed(3), a, 'i'], [+(s + 0.68 * dur).toFixed(3), -a, 'i'], [+(s + dur).toFixed(3), 0, 'i']]),
    y: track([[s, 0], [+(s + dur).toFixed(3), 404, 'l']]),
  },
});
const FLAKES = [[116.47, 112, 2.32, 0.046, 2.91, 5.9137], [406.54, 75, 2.05, 0, 5.82, 5.135], [63.58, 108, 4.13, 2.212, 2.91, 4.4125],
  [188.17, 71, 3.38, 0, 5.82, 10.4879], [355.81, 104, 2.8, 2.027, 2.91, 11.3261], [322.61, 67, 2.78, 0, 5.82, 4.3578],
  [117.34, 100, 2.23, 1.194, 2.91, 8.3569], [136.27, 63, 3.07, 0, 5.82, 8.2382], [44.71, 96, 4.34, 0.934, 2.91, 10.0547],
  [91.41, 59, 2.37, 0, 5.82, 7.5592], [400.85, 92, 4.32, 0.769, 2.91, 7.5726], [248.54, 55, 3.55, 0, 5.82, 4.5611],
  [169.49, 88, 2.6, 1.946, 2.91, 6.7705], [9.71, 51, 3.6, 0, 5.82, 9.6686], [188.73, 84, 3.87, 0.95, 2.91, 6.6078],
  [195.27, 47, 3.02, 0, 5.82, 7.282], [253.44, 80, 2.99, 1.35, 2.91, 9.7579], [113.31, 43, 4.84, 0, 5.82, 4.6213],
  [251.18, 76, 3.72, 1.223, 2.91, 5.589], [21.73, 109, 4.48, 0, 5.82, 4.4608], [331.34, 72, 2.46, 0.245, 2.91, 4.0238],
  [372.08, 105, 3.91, 0, 5.82, 8.7671]];

// Secondary glows: soft blurred ellipses (Figma blur radius R = CSS blur R/2) that breathe on the 6 s loop
const pulse = (vals) => track(vals.map((v, i) => [i * 1.5, v, 'i']));
const glow = (x, y, w, h, bg, R, op, sc) => ({
  x, y, w, h, round: true, bg, blur: R / 2,
  t: { opacity: pulse(op), ...(sc ? { scale: pulse(sc) } : {}) },
});
const OP1 = [1, 0.7, 1.06, 0.82, 1], OP2 = [0.82, 1.06, 0.7, 1, 0.82];
const SC1 = [1, 0.95, 1.04, 0.98, 1], SC2 = [0.98, 1.04, 0.95, 1, 0.98];
const by = (b, k) => k.map((v) => +(b * v).toFixed(3));
// Street lamp glow trio (same values as the Morning lamp); k scales the sizes
const lamp = (cx, cy, k = 1) => [
  glow(cx - 48 * k, cy - 48 * k, 96 * k, 96 * k, '#ff9a1f', 24, [0.3, 0.2, 0.32, 0.24, 0.3], [1, 0.94, 1.05, 0.97, 1]),
  glow(cx - 27 * k, cy - 27 * k, 54 * k, 54 * k, '#ffb82e', 12, [0.45, 0.33, 0.47, 0.38, 0.45], [1, 0.96, 1.03, 0.98, 1]),
  glow(cx - 5 * k, cy - 7 * k, 10 * k, 14 * k, '#ffd17a', 4, [0.6, 0.46, 0.62, 0.5, 0.6]),
];
// St. Patrick's sparkles: a white dot blinks once per loop
const sparkle = (x, y, t0) => ({
  x, y, w: 4, h: 4, round: true, bg: '#fff', blur: 1,
  t: { opacity: track([[t0, 0], [+(t0 + 0.5).toFixed(3), 0.9, 'i'], [Math.min(+(t0 + 1.2).toFixed(3), LOOP), 0, 'i']]) },
});
const SPARKLES = [[178, 400, 0.2], [260, 394, 1.3], [216, 374, 2.4], [148, 446, 3.2], [298, 438, 4.1], [234, 428, 5]];
// Halloween mist drifts sideways 24 px while breathing
const mist = (x, y, w, h, b, k, from) => ({
  x, y, w, h, round: true, bg: '#e6e1f4', blur: 15,
  t: { opacity: pulse(by(b, k)), x: pulse([from, -from, from, -from, from]) },
});

const LIGHT = '255,252,247', DARK = '8,8,20';

// Morning keeps its own fountain and street lamp (fountain.js, lamp.js)
const MORNING = { id: 'morning', label: 'Morning', art: sceneMorning, off: 130, scrim: LIGHT, dark: false, ph: '#000', greeting: 'Good morning', sub: null };

const others = () => [
  { id: 'afternoon', label: 'Afternoon', art: afternoon, off: 100, scrim: LIGHT, dark: false, ph: '#4b5462', greeting: 'Good afternoon', sub: 'Calm spots for a slow lunch',
    layers: [...fountain({ color: '#f4fbff', A: { x: 215.45, y: 282.7, dx: [-4.5, -1.5, 1.5, 4.5], up: -14, down: 2 },
      B: { P: 1.5, xl: 208.4, xr: 226.4, y: 340.4, dx: 74, up: -12, down: 44, delays: seq(6, 0.25) },
      C: { P: 1.3, xl: 210.4, xr: 224.4, y: 340.4, dx: 40, up: -8, down: 36, delays: seq(4, 0.325) },
      rip: { x: 174, y: 386, w: 90, h: 12 } }),
      glow(147, 300, 170, 90, '#fffbe6', 28, by(0.22, OP1), SC1)] },
  { id: 'evening', label: 'Evening', art: evening, off: 83, scrim: DARK, dark: true, ph: '#4b5462', greeting: 'Good evening', sub: 'Low-key dinners nearby',
    layers: [...SHIMMER.map((a) => shimmer(...a)),
      glow(232, 294, 150, 84, '#ff9d5c', 36, by(0.38, OP1), SC1), glow(275, 320, 64, 32, '#ffd08a', 16, by(0.45, OP2), SC2)] },
  { id: 'night', label: 'Night', art: night, off: 105, scrim: DARK, dark: true, ph: '#4b5462', greeting: 'Good night', sub: 'Late and quiet, near you',
    layers: [...FIREFLIES.map((a) => firefly(...a)), ...lamp(203, 375)] },
  { id: 'stpatricks', label: 'St. Patrick’s', art: stpatricks, off: 170, scrim: LIGHT, dark: false, ph: '#4b5462', greeting: 'Happy St. Patrick’s', sub: 'Parade day, the calm way',
    layers: [...fountain({ color: '#8fe3b3', A: { x: 213.45, y: 338.7, dx: [-4.5, -1.5, 1.5, 4.5], up: -10, down: 2 },
      B: { P: 1.2, xl: 209.4, xr: 221.4, y: 354.4, dx: 30, up: -6, down: 32, delays: seq(4, 0.3) },
      C: { P: 1.4, xl: 206.4, xr: 224.4, y: 392.4, dx: 48, up: -6, down: 46, delays: seq(5, 0.28) },
      rip: { x: 162, y: 440, w: 110, h: 12 } }),
      ...SPARKLES.map((a) => sparkle(...a))] },
  { id: 'music', label: 'Music Festival', art: music, off: 125, scrim: DARK, dark: true, ph: '#4b5462', greeting: 'Jazz Fest, gently', sub: 'Seated, lower-volume sets this week',
    layers: [note(182, 6, 0, -1, true), note(198, 8, 0.75, 1), note(182, 6, 1.5, -1), note(198, 8, 2.25, 1),
      glow(89, 315, 96, 96, '#ffb347', 24, by(0.28, OP1), SC1), glow(109, 335, 56, 56, '#ffd27a', 12, by(0.4, OP1), SC1),
      glow(252, 315, 96, 96, '#ffb347', 24, by(0.23, OP2), SC2), glow(272, 335, 56, 56, '#ffd27a', 12, by(0.33, OP2), SC2)] },
  { id: 'holiday', label: 'Holiday Lights', art: holiday, off: 105, scrim: DARK, dark: true, ph: '#4b5462', greeting: 'Lights, minus the rush', sub: 'Best quiet hours to see the squares',
    layers: [...TWINKLE.map((a) => twinkle(...a)), ...lamp(358, 341, 0.85)] },
  { id: 'halloween', label: 'Halloween', art: halloween, off: 160, scrim: DARK, dark: true, ph: '#4b5462', greeting: 'Halloween, your pace', sub: 'Low-scare, low-noise spots tonight',
    layers: [candle(153, 374, 46, 0), candle(109, 405, 40, -0.162), candle(185, 430, 42, -0.341), candle(165, 264, 30, -0.147),
      mist(-30, 440, 220, 44, 0.16, OP1, -12), mist(120, 450, 260, 48, 0.16, OP2, 12), mist(60, 422, 180, 36, 0.16, OP2, 12)] },
  { id: 'christmas', label: 'Christmas', art: christmas, off: 178, scrim: LIGHT, dark: false, ph: '#4b5462', greeting: 'Merry & calm', sub: 'Quiet spots for holiday plans',
    layers: [...FLAKES.map((a) => flake(...a)),
      glow(95, 340, 200, 140, '#ffc46b', 44, by(0.22, OP1), SC1), glow(137, 343, 28, 28, '#ffd98a', 12, by(0.5, OP1), SC1),
      glow(181, 343, 28, 28, '#ffd98a', 12, by(0.5, OP2), SC2), glow(226, 343, 28, 28, '#ffd98a', 12, by(0.5, OP1), SC1)] },
];

// The phone build only ever shows Morning, so the other scenes (and their art) are left out of it
export const SCENES = import.meta.env.MODE === 'phone' ? [MORNING] : [MORNING, ...others()];
