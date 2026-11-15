import { useEffect, useRef } from 'react';

const vertex = `attribute vec2 position;
varying vec2 uv;
void main(){ uv=(position+1.0)*0.5; gl_Position=vec4(position,0.0,1.0); }`;
const fragment = `precision highp float;
varying vec2 uv;
uniform sampler2D artwork;
uniform float time;
uniform float softness;
uniform float grain;
// A changing spatial flow field bends separate regions in different directions.
// The boundary stays anchored: no translation, rotation or scaling of the panel.
vec2 flow(vec2 p,float t){
  return vec2(
    sin(p.y*8.0+t)*0.58 + cos(p.x*5.0-p.y*4.0-t*0.73)*0.42,
    cos(p.x*7.0-t*0.81)*0.58 + sin(p.y*6.0+p.x*3.0+t*0.61)*0.42
  );
}
void main(){
  float t=time*0.32;
  vec2 edge=sin(uv*3.14159265);
  vec2 field=flow(uv,t);
  vec2 bent=uv+0.13*edge.x*edge.y*flow(uv+field*0.12,t+0.7);
  bent=clamp(bent,vec2(0.002),vec2(0.998));
  vec2 r=vec2(softness/312.0,softness/290.0);
  vec3 c=texture2D(artwork,bent).rgb*0.25;
  c+=(texture2D(artwork,bent+vec2(r.x,0.0)).rgb+texture2D(artwork,bent-vec2(r.x,0.0)).rgb
     +texture2D(artwork,bent+vec2(0.0,r.y)).rgb+texture2D(artwork,bent-vec2(0.0,r.y)).rgb)*0.125;
  c+=(texture2D(artwork,bent+r).rgb+texture2D(artwork,bent-r).rgb
     +texture2D(artwork,bent+vec2(r.x,-r.y)).rgb+texture2D(artwork,bent+vec2(-r.x,r.y)).rgb)*0.0625;
  // Stationary fine film grain, rather than shimmering noise on every frame.
  float noise=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*437.5453)-0.5;
  gl_FragColor=vec4(clamp(c+noise*grain,0.0,1.0),1.0);
}`;

export default function TicketFluid({ src, reduced, tone }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    canvas.dataset.fluidReady = 'false';
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return;
    let frame = 0, disposed = false, loaded = false, visible = true, last = -Infinity;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shaders = [];
    const compile = (type, code) => {
      const s = gl.createShader(type); shaders.push(s);
      gl.shaderSource(s, code); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) { shaders.forEach(s => gl.deleteShader(s)); return; }
    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const density = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(312*density); canvas.height = Math.round(290*density);
    gl.viewport(0,0,canvas.width,canvas.height);
    const clock = gl.getUniformLocation(program, 'time');
    gl.uniform1f(gl.getUniformLocation(program, 'softness'), tone === 'fern' ? 0.6 : 2.8);
    gl.uniform1f(gl.getUniformLocation(program, 'grain'), tone === 'fern' ? 0.025 : 0.075);
    gl.uniform1i(gl.getUniformLocation(program, 'artwork'), 0);
    const draw = now => {
      frame = 0;
      if (disposed || !loaded || !visible || document.hidden) return;
      const freeze = reduced || media.matches;
      if (now-last >= 1000/30 || freeze) {
        gl.uniform1f(clock, freeze ? 0 : now/1000);
        gl.drawArrays(gl.TRIANGLES,0,6);
        canvas.dataset.fluidReady = 'true'; last = now;
      }
      if (!freeze) frame = requestAnimationFrame(draw);
    };
    const resume = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; resume(); });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', resume);
    media.addEventListener('change', resume);
    const lost = e => { e.preventDefault(); cancelAnimationFrame(frame); canvas.dataset.fluidReady = 'false'; };
    canvas.addEventListener('webglcontextlost', lost);
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      loaded=true; resume();
    };
    img.src = src;
    return () => {
      disposed=true; img.onload=null; cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener('visibilitychange',resume); canvas.removeEventListener('webglcontextlost',lost);
      media.removeEventListener('change',resume);
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program);
    };
  }, [src, reduced, tone]);
  return <canvas ref={ref} className="ticket-fluid" data-fluid-tone={tone} />;
}
