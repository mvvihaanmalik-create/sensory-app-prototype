// Illustrated card art for Hidden Discovery Mode (flat pastel, same hand as the Savannah header scene).
// The app has no venue photography yet, so these stand in for it. 360 x 330.
import { useId } from 'react';
import sceneMorning from './assets/scene-morning.jpg';

const W = 360, H = 330;
const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function Quiet({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={id + 'w'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e8d6" /><stop offset="1" stopColor="#ecd5b6" /></linearGradient>
        <linearGradient id={id + 's'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfe3f3" /><stop offset="1" stopColor="#fde4c6" /></linearGradient>
        <linearGradient id={id + 'r'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}w)`} />
      <rect y="262" width={W} height="68" fill="#d8bb98" />
      <rect y="262" width={W} height="5" fill="#c9a97f" />
      <path d="M70 262V118a60 60 0 0 1 120 0V262Z" fill="#8a5a3c" />
      <path d="M78 262V118a52 52 0 0 1 104 0V262Z" fill={`url(#${id}s)`} />
      <g fill="#7fb08a" opacity="0.9"><circle cx="105" cy="130" r="26" /><circle cx="142" cy="116" r="30" /><circle cx="160" cy="150" r="24" /><circle cx="118" cy="162" r="22" /></g>
      <g fill="#5f9a6a" opacity="0.85"><circle cx="128" cy="140" r="20" /><circle cx="96" cy="152" r="16" /></g>
      <path d="M130 66V262M78 168H182" stroke="#8a5a3c" strokeWidth="5" />
      <polygon points="78,262 182,262 262,330 8,330" fill={`url(#${id}r)`} />
      <rect x="226" y="132" width="104" height="7" rx="2" fill="#8a5a3c" />
      <rect x="226" y="198" width="104" height="7" rx="2" fill="#8a5a3c" />
      <g>
        <rect x="238" y="106" width="22" height="26" rx="5" fill="#d98c6a" /><path d="M249 106c-14-22-4-34 0-38 4 4 14 16 0 38Z" fill="#5f9a6a" /><path d="M249 106c16-16 26-12 30-8-6 14-18 14-30 8Z" fill="#7fb08a" />
        <rect x="292" y="112" width="20" height="20" rx="4" fill="#e9c9a0" /><path d="M302 112c-10-18-2-26 0-28 2 2 10 12 0 28Z" fill="#7fb08a" />
        <rect x="236" y="172" width="8" height="26" fill="#7d8fc4" /><rect x="245" y="168" width="9" height="30" fill="#e9a8a0" /><rect x="255" y="176" width="8" height="22" fill="#f2d08a" /><rect x="265" y="170" width="10" height="28" fill="#9ec6a8" />
        <rect x="290" y="178" width="26" height="20" rx="3" fill="#f7f5f1" />
      </g>
      <ellipse cx="150" cy="292" rx="66" ry="9" fill="#a8825c" opacity="0.28" />
      <ellipse cx="150" cy="282" rx="58" ry="9" fill="#8a5a3c" />
      <rect x="146" y="282" width="8" height="36" fill="#6f4730" />
      <rect x="126" y="262" width="22" height="20" rx="4" fill="#f7f5f1" /><path d="M148 268h6a5 5 0 0 1 0 10h-6" fill="none" stroke="#f7f5f1" strokeWidth="3" />
      <rect x="164" y="276" width="26" height="6" rx="3" fill="#f2d08a" />
      <path d="M290 0V40" stroke="#6f4730" strokeWidth="2" /><path d="M270 62a20 20 0 0 1 40 0Z" fill="#e9c27a" /><ellipse cx="290" cy="64" rx="20" ry="4" fill="#ffe9a8" />
    </>
  );
}

function Gallery({ id, tone }) {
  const cool = tone === 'cool';
  const wall = cool ? ['#eef2f6', '#dfe7ee'] : ['#f6f1e8', '#ece3d4'];
  const ink = cool ? '#5e7a9c' : '#b0805a';
  return (
    <>
      <defs>
        <linearGradient id={id + 'w'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={wall[0]} /><stop offset="1" stopColor={wall[1]} /></linearGradient>
        <radialGradient id={id + 'l'} cx="0.5" cy="0" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}w)`} />
      <rect y="268" width={W} height="62" fill={cool ? '#cbd6e0' : '#d9c6aa'} />
      <rect y="268" width={W} height="4" fill={cool ? '#b9c7d4' : '#c9b08c'} />
      <ellipse cx="90" cy="70" rx="90" ry="120" fill={`url(#${id}l)`} /><ellipse cx="270" cy="70" rx="90" ry="120" fill={`url(#${id}l)`} />
      <g>
        <rect x="36" y="64" width="84" height="116" rx="3" fill="#fff" stroke={ink} strokeWidth="3" />
        <path d="M50 170V120a28 28 0 0 1 56 0V170Z" fill="#f2c9b8" /><circle cx="78" cy="94" r="14" fill="#f2d08a" />
        <rect x="150" y="58" width="76" height="76" rx="3" fill="#fff" stroke={ink} strokeWidth="3" />
        <circle cx="188" cy="96" r="26" fill="#9ec6a8" /><circle cx="198" cy="88" r="14" fill="#cfe3f3" />
        <rect x="256" y="76" width="70" height="104" rx="3" fill="#fff" stroke={ink} strokeWidth="3" />
        <rect x="268" y="90" width="46" height="14" fill="#7d8fc4" /><rect x="268" y="112" width="46" height="14" fill="#e9a8a0" /><rect x="268" y="134" width="46" height="14" fill="#f2d08a" /><rect x="268" y="156" width="46" height="12" fill="#9ec6a8" />
        <rect x="170" y="148" width="36" height="5" rx="2" fill={ink} opacity="0.35" /><rect x="176" y="158" width="24" height="4" rx="2" fill={ink} opacity="0.25" />
      </g>
      <ellipse cx="180" cy="300" rx="104" ry="8" fill="#000" opacity="0.07" />
      <rect x="96" y="262" width="168" height="22" rx="6" fill={cool ? '#7a8fa8' : '#a8825c'} />
      <rect x="108" y="284" width="8" height="26" fill={cool ? '#5e7a9c' : '#8a5a3c'} /><rect x="244" y="284" width="8" height="26" fill={cool ? '#5e7a9c' : '#8a5a3c'} />
    </>
  );
}

const SPINE = ['#7d8fc4', '#e9a8a0', '#f2d08a', '#9ec6a8', '#d98c6a', '#b9a3d6', '#f6e8d6', '#6f9a8a', '#e9c9a0'];
function Books({ id, tone }) {
  const cool = tone === 'cool';
  const r = rnd(cool ? 7 : 21);
  const rows = [58, 146, 234];
  return (
    <>
      <defs>
        <linearGradient id={id + 'w'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cool ? '#e2eaf1' : '#f1e1cc'} /><stop offset="1" stopColor={cool ? '#cfdbe6' : '#e5cfae'} /></linearGradient>
        <radialGradient id={id + 'g'} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}w)`} />
      {rows.map((y) => {
        let x = 18; const out = [];
        while (x < 322) {
          const w = 12 + Math.floor(r() * 14), h = 52 + Math.floor(r() * 26), c = SPINE[Math.floor(r() * SPINE.length)];
          out.push(<rect key={x} x={x} y={y + 78 - h} width={w} height={h} rx="2" fill={c} opacity="0.92" />); x += w + 2;
          if (r() > 0.82) x += 14;
        }
        return <g key={y}>{out}<rect x="10" y={y + 78} width="340" height="9" rx="2" fill={cool ? '#6b829c' : '#8a5a3c'} /></g>;
      })}
      <rect x="0" y="318" width={W} height="12" fill={cool ? '#b9c7d4' : '#c9a97f'} />
      <circle cx="318" cy="40" r="46" fill={`url(#${id}g)`} />
      <path d="M318 40V4" stroke={cool ? '#5e7a9c' : '#6f4730'} strokeWidth="2" /><path d="M302 40a16 16 0 0 1 32 0Z" fill="#e9c27a" />
    </>
  );
}

function Dining({ id }) {
  const lights = Array.from({ length: 11 }, (_, i) => { const t = i / 10; return [14 + t * 332, 38 + Math.sin(t * Math.PI) * 30]; });
  return (
    <>
      <defs>
        <linearGradient id={id + 'w'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4cfae" /><stop offset="1" stopColor="#e3a98a" /></linearGradient>
        <radialGradient id={id + 'g'} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}w)`} />
      <path d="M40 270V130a52 52 0 0 1 104 0V270Z" fill="#3a3560" /><path d="M50 270V130a42 42 0 0 1 84 0V270Z" fill="#f0c9a6" />
      <path d="M216 270V130a52 52 0 0 1 104 0V270Z" fill="#3a3560" /><path d="M226 270V130a42 42 0 0 1 84 0V270Z" fill="#f0c9a6" />
      <path d="M92 90V270M50 160H134M268 90V270M226 160H310" stroke="#3a3560" strokeWidth="4" />
      <rect y="268" width={W} height="62" fill="#b98262" />
      <path d={`M${lights.map((p) => p.join(' ')).join(' L')}`} fill="none" stroke="#3a3560" strokeWidth="1.5" />
      {lights.map(([x, y], i) => <g key={i}><circle cx={x} cy={y + 8} r="14" fill={`url(#${id}g)`} /><circle cx={x} cy={y + 8} r="4.5" fill="#fff3c4" /></g>)}
      <ellipse cx="180" cy="312" rx="86" ry="9" fill="#000" opacity="0.12" />
      <path d="M96 252h168l12 52H84Z" fill="#f7f5f1" /><ellipse cx="180" cy="252" rx="84" ry="10" fill="#fff" />
      <rect x="176" y="232" width="8" height="20" rx="2" fill="#f2d08a" /><circle cx="180" cy="222" r="26" fill={`url(#${id}g)`} /><path d="M180 214c-4 6-4 10 0 12 4-2 4-6 0-12Z" fill="#ffb55a" />
      <rect x="122" y="248" width="22" height="6" rx="3" fill="#9ec6a8" /><circle cx="228" cy="246" r="7" fill="#e9a8a0" />
    </>
  );
}

function Night({ id, tone }) {
  const plum = tone === 'plum';
  const r = rnd(plum ? 3 : 11);
  const stars = Array.from({ length: 22 }, () => [r() * W, r() * 150, 0.8 + r() * 1.4, 0.4 + r() * 0.5]);
  const blocks = []; let x = -6;
  while (x < W) { const w = 30 + Math.floor(r() * 36), h = 70 + Math.floor(r() * 70); blocks.push([x, w, h]); x += w + 4; }
  return (
    <>
      <defs>
        <linearGradient id={id + 'w'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2650" /><stop offset="0.6" stopColor={plum ? '#6f4a78' : '#5e5a7e'} /><stop offset="1" stopColor={plum ? '#d9a0a8' : '#c79bb0'} />
        </linearGradient>
        <radialGradient id={id + 'g'} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" /><stop offset="1" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}w)`} />
      {stars.map(([sx, sy, sr, so], i) => <circle key={i} cx={sx} cy={sy} r={sr} fill="#fff" opacity={so} />)}
      <circle cx="298" cy="62" r="20" fill="#fdf1d6" opacity="0.95" />
      <g fill="#2a2650" opacity="0.9">
        {blocks.map(([bx, bw, bh], i) => <rect key={i} x={bx} y={250 - bh} width={bw} height={bh + 90} />)}
        <path d="M170 150a28 28 0 0 1 56 0Z" /><rect x="176" y="150" width="44" height="100" /><rect x="196" y="112" width="4" height="14" />
      </g>
      {blocks.flatMap(([bx, bw, bh], i) => Array.from({ length: 4 }, (_, j) => [bx + 6 + (j % 2) * Math.max(10, bw / 2 - 4), 250 - bh + 14 + Math.floor(j / 2) * 22, i, j]))
        .filter(([, , i, j]) => (i * 3 + j * 5) % 4 !== 0).map(([wx, wy, i, j]) => <rect key={`${i}-${j}`} x={wx} y={wy} width="6" height="9" rx="1" fill="#ffd98a" opacity="0.85" />)}
      <rect y="258" width={W} height="72" fill="#1d1a3b" />
      <path d="M0 262H360" stroke="#5e5a7e" strokeWidth="3" />
      {Array.from({ length: 19 }, (_, i) => <rect key={i} x={6 + i * 19} y="262" width="3" height="32" fill="#5e5a7e" />)}
      <path d="M0 232C90 262 270 262 360 232" fill="none" stroke="#14122e" strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => { const t = i / 8; return <g key={i}><circle cx={t * 360} cy={232 + Math.sin(t * Math.PI) * 24 + 6} r="16" fill={`url(#${id}g)`} /><circle cx={t * 360} cy={232 + Math.sin(t * Math.PI) * 24 + 6} r="4" fill="#fff3c4" /></g>; })}
      <ellipse cx="270" cy="312" rx="50" ry="7" fill="#000" opacity="0.25" />
      <ellipse cx="270" cy="296" rx="38" ry="6" fill="#5e5a7e" /><rect x="268" y="296" width="4" height="16" fill="#5e5a7e" />
      <circle cx="262" cy="288" r="5" fill="#ffd98a" /><circle cx="278" cy="290" r="4" fill="#e9a8a0" />
    </>
  );
}

// Crops of the Savannah header scene (880 x 628) so the café and the park read as the same city.
function Crop({ x, y, tint }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f5d9bd' }}>
      <img src={sceneMorning} alt="" draggable={false} style={{ position: 'absolute', left: -x, top: -y, width: 880, height: 628, maxWidth: 'none', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: tint }} />
    </div>
  );
}

export default function Scene({ kind, tone }) {
  const id = useId().replace(/:/g, '');
  if (kind === 'awning') return <Crop x={500} y={298} tint="linear-gradient(180deg, rgba(255,246,232,0.1), rgba(255,246,232,0))" />;
  if (kind === 'park') return <Crop x={225} y={298} tint="linear-gradient(180deg, rgba(255,246,232,0.1), rgba(255,246,232,0))" />;
  const Inner = { quiet: Quiet, gallery: Gallery, books: Books, dining: Dining, night: Night }[kind] || Quiet;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }} aria-hidden="true">
      <Inner id={id} tone={tone} />
    </svg>
  );
}
