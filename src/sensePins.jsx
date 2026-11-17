import { svgSrc } from './svgs.js';

// One rule for every sense: the icon shows the level (1, 2, 3), the ring turns green, amber, red,
// and the motion gets livelier with the level.
export const TIER = ['#3FA06B', '#F29A3A', '#D84B43'];
const INK = '#14181F';

// Phosphor fill paths (256 viewBox)
const D = {
  user: 'M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z',
  users: 'M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,95.83,95.83,0,0,1,47.22-37.71,60,60,0,1,1,66.5,0A95.83,95.83,0,0,1,164.47,195.63Zm87.91-.15a95.87,95.87,0,0,0-47.13-37.56A60,60,0,0,0,144.7,54.59a4,4,0,0,0-1.33,6A75.83,75.83,0,0,1,147,150.53a4,4,0,0,0,1.07,5.53,112.32,112.32,0,0,1,29.85,30.83,23.92,23.92,0,0,1,3.65,16.47,4,4,0,0,0,3.95,4.64h60.3a8,8,0,0,0,7.73-5.93A8.22,8.22,0,0,0,252.38,195.48Z',
  three: 'M64.12,147.8a4,4,0,0,1-4,4.2H16a8,8,0,0,1-7.8-6.17,8.35,8.35,0,0,1,1.62-6.93A67.79,67.79,0,0,1,37,117.51a40,40,0,1,1,66.46-35.8,3.94,3.94,0,0,1-2.27,4.18A64.08,64.08,0,0,0,64,144C64,145.28,64,146.54,64.12,147.8Zm182-8.91A67.76,67.76,0,0,0,219,117.51a40,40,0,1,0-66.46-35.8,3.94,3.94,0,0,0,2.27,4.18A64.08,64.08,0,0,1,192,144c0,1.28,0,2.54-.12,3.8a4,4,0,0,0,4,4.2H240a8,8,0,0,0,7.8-6.17A8.33,8.33,0,0,0,246.17,138.89Zm-89,43.18a48,48,0,1,0-58.37,0A72.13,72.13,0,0,0,65.07,212,8,8,0,0,0,72,224H184a8,8,0,0,0,6.93-12A72.15,72.15,0,0,0,157.19,182.07Z',
  dim: 'M120,40V32a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm8,24a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-8-8A8,8,0,0,0,50.34,61.66Zm0,116.68-8,8a8,8,0,0,0,11.32,11.32l8-8a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l8,8a8,8,0,0,0,11.32-11.32ZM40,120H32a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Zm88,88a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,128,208Zm96-88h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z',
  sun: 'M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm8,24a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z',
};

// Per sense and level: icon path and size (in a 24 box), plus the Figma label.
const GLYPH = {
  Crowd: [[D.user, 18], [D.users, 21], [D.three, 23]],
  Light: [[D.dim, 21], [D.sun, 21], [D.sun, 16]],
};
export const SENSE_PLACES = {
  Sound: ['Gallery Café · Quiet', 'Foxy Loxy · Soft chatter', 'The Sentient · Busy café'],
  Light: ['Gallery Café · Dim', 'Foxy Loxy · Natural light', 'The Sentient · Bright'],
  Crowd: ['Gallery Café · Less crowded', 'Foxy Loxy · Moderate crowd', 'The Sentient · Busy'],
};

const SHELL = ['pinGallery', 'pinFoxy', 'pinSentient'];
const CENTER = [[32, 28, 26], [36, 32, 30], [32, 28, 26]];

function build(sense, i) {
  const ring = TIER[i];
  let html = svgSrc(SHELL[i]).replace(/stroke="#(3FA06B|F29A3A)"/, `stroke="${ring}"`);
  if (sense === 'Sound') {
    let n = 0;
    return html
      .replace(/width="\d+" height="\d+"/, (m) => `${m} style="display:block"`)
      .replace(/<path (d="[^"]*") stroke=/g, (m, d) => `<path class="spk-wave spk-w${++n}" ${d} stroke=`)
      .replace('"#F29A3A"', `"${ring}"`);
  }
  const [cx, cy, box] = CENTER[i];
  const [d, size] = GLYPH[sense][i];
  const s = (size * box) / 24;
  const halo = sense === 'Light' && i === 2
    ? `<circle class="sp-halo" cx="${cx}" cy="${cy}" r="${(11 * box) / 24}" stroke="${INK}" stroke-width="${(1.5 * box) / 24}" opacity=".55"/>` : '';
  const icon = `<g class="sp-i sp-${sense.toLowerCase()}"><path d="${d}" fill="${INK}" transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 256})"/>${halo}</g>`;
  html = html.replace(/(<\/g>)[\s\S]*?(<defs)/, `$1${icon}$2`);
  return html.replace(/width="\d+" height="\d+"/, (m) => `${m} style="display:block"`);
}

export function SensePin({ sense, place }) {
  const size = place === 1 ? 72 : 64;
  return (
    <span className="sp" data-lvl={place + 1} style={{ display: 'block', width: size, height: size, flex: 'none', '--sp-delay': `${-place * 0.45}s` }}
      dangerouslySetInnerHTML={{ __html: build(sense, place) }} />
  );
}
