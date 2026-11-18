/* Welcome — Hum Sitare Diwali 2026. The film's first scene.
   The one lamp has just caught in the dark. It sits low centre in a clay diya on the floor, and the light goes out
   from it: a row of small diyas catches one by one outward to both edges (0–6 s), a marigold toran with mango-leaf points
   draws in along the top (3–8 s), a rangoli blooms on the floor around the lamp ring by ring (5–12 s), the words arrive
   (from 6 s), and gentle fireworks open high in the sky on either side of the title (from 10 s). At 19 s the title gives
   way to one line, and the scene hands the lamp to the root at about 23 s.
   Everything that moves is analytic in t (fireworks included), so seeking needs no simulation state.
   Performance: the night, the stars, the rangoli (top-down rings, squashed onto the floor), the cups, the marigolds, the
   leaves and every line of words are baked in init; each frame only places sprites. */
(() => {
const TAU = Math.PI * 2;
// make sure the canvas faces are loaded before the film starts (Cinzel is not used by the page's own CSS)
try { for (const f of ['500 40px "Noto Sans Devanagari"', '400 40px Cinzel', 'italic 400 40px Lora', '400 40px Lora', '500 40px "DM Sans"'])
  document.fonts.load(f, f.includes('Noto') ? 'हम सितारे शुभ दीपावली' : 'Hum Sitare'); } catch (e) {}

const LY = .66, LS = 1.05;                         // the lamp: base at y .66 H, centre x, scale
const PANEL = [[184,58,58],[212,116,56],[212,168,72],[107,142,78],[76,122,184],[91,78,142],[154,122,200],[212,169,72]];
const FWCOL = [[255,206,110],[255,150,50],[255,120,160],[255,246,236],[240,92,92],[255,150,80],[255,214,110],[140,210,110],[110,165,255],[165,140,250],[205,165,255],[255,220,130]];
const GOLD = 0, SAFF = 1, ROSE = 2, WHITE = 3;

let W, H, D, k, cx, by, R, Q, RCY;
let torC, torDone, bgC, starTw, ringC, ringSq, ringPre, rangFull, cupBig, cupSm, cupSmB, flameS, mari, leafS, lines, sparks, flashS, poolS, warmS;
let diyas, toran, leaves, bursts, colS, staticB, SB0, SB1;
const ST_T = 12.3;

const can = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
const rgba = (c, a) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const mix = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];

/* ---------- a clay diya cup, drawn at (0,0) = centre of the oil surface, width w ---------- */
function cup(x, w, lit, tone) {
  const h = w * .36;
  x.save();
  // bowl
  x.beginPath();
  x.moveTo(-w * .5, 0);
  x.bezierCurveTo(-w * .46, h * .9, -w * .2, h * 1.05, 0, h * 1.05);
  x.bezierCurveTo(w * .22, h * 1.05, w * .44, h * .85, w * .5, h * .05);
  x.lineTo(w * .62, -h * .22);                                    // the spout
  x.quadraticCurveTo(w * .5, -h * .08, w * .38, -h * .06);
  x.quadraticCurveTo(0, -h * .2, -w * .5, 0);
  x.closePath();
  const g = x.createLinearGradient(0, -h * .2, 0, h * 1.05);
  g.addColorStop(0, rgba(mix(tone, [255, 190, 120], .35 * lit), 1));
  g.addColorStop(.35, rgba(tone, 1));
  g.addColorStop(1, rgba(mix(tone, [20, 8, 6], .7), 1));
  x.fillStyle = g; x.fill();
  // light from the flame above: the upper face of the bowl
  const g2 = x.createRadialGradient(0, -h * .4, 0, 0, -h * .4, w * .62);
  g2.addColorStop(0, `rgba(255,170,90,${.55 * lit})`); g2.addColorStop(1, 'rgba(255,140,60,0)');
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = g2; x.fillRect(-w, -h, w * 2, h * 3);
  x.globalCompositeOperation = 'source-over';
  // a painted band on the cup: small gold dots
  x.fillStyle = `rgba(232,190,110,${.35 + .4 * lit})`;
  for (let i = -4; i <= 4; i++) { const u = i / 4.6; x.beginPath(); x.arc(u * w * .4, h * (.42 + .25 * u * u), w * .022, 0, TAU); x.fill(); }
  // oil and rim
  x.beginPath(); x.ellipse(-w * .03, -h * .06, w * .45, h * .16, 0, 0, TAU);
  const g3 = x.createRadialGradient(0, -h * .06, 0, 0, -h * .06, w * .45);
  g3.addColorStop(0, `rgba(255,214,140,${.9 * lit})`); g3.addColorStop(.5, `rgba(200,110,40,${.6 * lit + .15})`); g3.addColorStop(1, 'rgba(60,24,12,.9)');
  x.fillStyle = g3; x.fill();
  x.lineWidth = Math.max(1, w * .03); x.strokeStyle = `rgba(255,${190 + 40 * lit},${120 + 60 * lit},${.3 + .55 * lit})`;
  x.beginPath(); x.ellipse(-w * .03, -h * .06, w * .45, h * .16, 0, Math.PI * 1.02, Math.PI * 1.98); x.stroke();
  x.restore();
}
function cupSprite(w, lit, tone) {
  const s = 2, c = can(w * 1.4 * D * s, w * .62 * D * s), x = c.getContext('2d');
  x.setTransform(D * s, 0, 0, D * s, w * .7 * D * s, w * .16 * D * s); cup(x, w, lit, tone);
  c.ox = w * .7; c.oy = w * .16; c.cw = w * 1.4; c.ch = w * .62; return c;
}
/* a small flame: a teardrop, white core, gold, saffron edge */
function flameSprite() {
  const w = 40, h = 96, c = can(w, h), x = c.getContext('2d');
  const tear = (s, col) => { x.beginPath(); x.moveTo(w / 2, h * (1 - .98 * s));
    x.bezierCurveTo(w / 2 + w * .1 * s, h * (1 - .62 * s), w / 2 + w * .42 * s, h * (1 - .3 * s), w / 2, h * .97);
    x.bezierCurveTo(w / 2 - w * .42 * s, h * (1 - .3 * s), w / 2 - w * .1 * s, h * (1 - .62 * s), w / 2, h * (1 - .98 * s)); x.fillStyle = col; x.fill(); };
  x.filter = 'blur(1.6px)'; tear(1, 'rgba(240,120,40,.85)'); x.filter = 'blur(1px)'; tear(.82, 'rgba(255,190,90,.95)'); tear(.55, 'rgba(255,236,190,1)'); tear(.3, 'rgba(255,252,240,1)');
  x.filter = 'none'; return c;
}
/* a marigold head: ruffled rings of petals, shaded as a sphere */
function marigold(r, light, dark) {
  const s = 2, sz = r * 2.3, c = can(sz * D * s, sz * D * s), x = c.getContext('2d'), rr = rand(Math.round(r * 97 + light[1]));
  x.setTransform(D * s, 0, 0, D * s, sz / 2 * D * s, sz / 2 * D * s);
  for (let j = 0; j < 5; j++) { const rad = r * (1 - j * .19), n = 15 - j * 2;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + j * .37 + rr() * .2, pr = r * (.34 - j * .03);
      x.fillStyle = rgba(mix(dark, light, .35 + .65 * rr() * (1 - j * .08)), 1);
      x.beginPath(); x.arc(Math.cos(a) * (rad - pr * .8), Math.sin(a) * (rad - pr * .8), pr, 0, TAU); x.fill();
      x.strokeStyle = rgba(mix(dark, [60, 20, 0], .5), .45); x.lineWidth = .7; x.stroke(); } }
  const g = x.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.15);
  g.addColorStop(0, 'rgba(255,240,200,.28)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,6,0,.55)');
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
  c.sz = sz; return c;
}
function leafSprite(len) {
  const s = 2, wd = len * .34, c = can(wd * D * s, len * D * s), x = c.getContext('2d');
  x.setTransform(D * s, 0, 0, D * s, 0, 0);
  x.beginPath(); x.moveTo(wd / 2, 0); x.bezierCurveTo(wd * 1.05, len * .25, wd * .85, len * .7, wd / 2, len);
  x.bezierCurveTo(wd * .15, len * .7, -wd * .05, len * .25, wd / 2, 0);
  const g = x.createLinearGradient(0, 0, wd, len); g.addColorStop(0, '#2f6b2c'); g.addColorStop(.6, '#1d4d22'); g.addColorStop(1, '#123818');
  x.fillStyle = g; x.fill();
  x.strokeStyle = 'rgba(150,190,90,.55)'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(wd / 2, len * .04); x.quadraticCurveTo(wd * .52, len * .5, wd / 2, len * .96); x.stroke();
  x.strokeStyle = 'rgba(140,180,90,.22)'; x.lineWidth = .7;
  for (let i = 1; i < 7; i++) { const y = len * i / 8; x.beginPath(); x.moveTo(wd / 2, y); x.lineTo(wd * .14, y + len * .07); x.moveTo(wd / 2, y); x.lineTo(wd * .86, y + len * .07); x.stroke(); }
  c.w = wd; c.h = len; return c;
}
const rand = seed => { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

/* ---------- the rangoli, top-down, one canvas per ring (radius R in CSS px) ---------- */
function rangoli(E) {
  const S = Math.ceil(R * 2.04), rr = rand(2026), layers = [];
  const mkL = () => { const c = can(S * D, S * D), x = c.getContext('2d'); x.setTransform(D, 0, 0, D, S / 2 * D, S / 2 * D); return [c, x]; };
  const grain = (x, path, col, n, rad) => {           // powder: speckle inside the shape
    x.save(); x.clip(path);
    for (let i = 0; i < n; i++) { const a = rr() * TAU, d = Math.sqrt(rr()) * rad; const l = rr();
      x.fillStyle = l < .5 ? rgba(mix(col, [255, 255, 255], .35), .5) : rgba(mix(col, [0, 0, 0], .35), .45);
      x.fillRect(path.cx + Math.cos(a) * d, path.cy + Math.sin(a) * d, 1.3, 1.3); }
    x.restore(); };
  const petal = (r0, r1, th, half) => {               // a pointed petal from r0 to r1 at angle th, half-width (radians at r0)
    const p = new Path2D(), P = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const a0 = P(r0, th - half), a1 = P(r0, th + half), tip = P(r1, th), m1 = P(r0 + (r1 - r0) * .55, th - half * 1.15), m2 = P(r0 + (r1 - r0) * .55, th + half * 1.15);
    p.moveTo(...a0); p.quadraticCurveTo(...m1, ...tip); p.quadraticCurveTo(...m2, ...a1);
    p.arc(0, 0, r0, th + half, th - half, true); p.closePath();
    const c = P((r0 + r1) / 2, th); p.cx = c[0]; p.cy = c[1]; return p; };
  const dots = (x, r, n, rad, col, off = 0) => { x.fillStyle = col; x.beginPath();
    for (let i = 0; i < n; i++) { const a = off + i / n * TAU; x.moveTo(Math.cos(a) * r + rad, Math.sin(a) * r); x.arc(Math.cos(a) * r, Math.sin(a) * r, rad, 0, TAU); } x.fill(); };
  const U = R;
  // 0: the heart under the lamp: a red disc with a ring of gold dots
  { const [c, x] = mkL(); const p = new Path2D(); p.arc(0, 0, U * .15, 0, TAU); p.cx = 0; p.cy = 0;
    x.fillStyle = '#a3263a'; x.fill(p); grain(x, p, [163, 38, 58], 260, U * .15);
    dots(x, U * .12, 16, U * .008, '#f2c45a'); x.lineWidth = U * .006; x.strokeStyle = '#f7e6c4'; x.beginPath(); x.arc(0, 0, U * .152, 0, TAU); x.stroke(); layers.push(c); }
  // 1: eight lotus petals (rose), white outline dots, a yellow inner petal
  { const [c, x] = mkL();
    for (let i = 0; i < 8; i++) { const th = i / 8 * TAU - Math.PI / 2, p = petal(U * .15, U * .33, th, .34);
      x.fillStyle = '#d93d74'; x.fill(p); grain(x, p, [217, 61, 116], 120, U * .1);
      const p2 = petal(U * .17, U * .27, th, .17); x.fillStyle = '#f6c443'; x.fill(p2);
      x.fillStyle = '#fbf3e4'; x.beginPath(); for (let j = 1; j < 6; j++) { const r = U * (.16 + .03 * j), a = th + .3 * (1 - j / 6.5);
        for (const s of [-1, 1]) { const aa = th + s * (a - th); x.moveTo(Math.cos(aa) * r + U * .006, Math.sin(aa) * r); x.arc(Math.cos(aa) * r, Math.sin(aa) * r, U * .006, 0, TAU); } } x.fill();
      // between the petals, a white dot
      const b = th + TAU / 16; x.beginPath(); x.arc(Math.cos(b) * U * .2, Math.sin(b) * U * .2, U * .011, 0, TAU); x.fill(); }
    dots(x, U * .355, 32, U * .007, '#fbf3e4', Math.PI / 32); layers.push(c); }
  // 2: sixteen saffron petals with sixteen yellow teardrops between
  { const [c, x] = mkL();
    for (let i = 0; i < 16; i++) { const th = i / 16 * TAU - Math.PI / 2, p = petal(U * .37, U * .54, th, .16);
      x.fillStyle = '#f07c1c'; x.fill(p); grain(x, p, [240, 124, 28], 70, U * .08);
      const p2 = petal(U * .385, U * .49, th, .07); x.fillStyle = '#c4301f'; x.fill(p2);
      const tb = th + TAU / 32, p3 = petal(U * .38, U * .47, tb, .07); x.fillStyle = '#f9d14a'; x.fill(p3); }
    x.lineWidth = U * .006; x.strokeStyle = '#fbf3e4'; x.beginPath(); x.arc(0, 0, U * .37, 0, TAU); x.stroke(); layers.push(c); }
  // 3: a green band with forty-eight white dots
  { const [c, x] = mkL(); const p = new Path2D(); p.arc(0, 0, U * .62, 0, TAU); p.arc(0, 0, U * .555, 0, TAU, true); p.cx = 0; p.cy = U * .59;
    x.fillStyle = '#2f8a4a'; x.fill(p);
    x.save(); x.clip(p); for (let i = 0; i < 1400; i++) { const a = rr() * TAU, d = U * (.555 + rr() * .065); x.fillStyle = rr() < .5 ? 'rgba(140,220,150,.5)' : 'rgba(10,50,20,.4)'; x.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1.3, 1.3); } x.restore();
    dots(x, U * .5875, 48, U * .009, '#fbf3e4'); layers.push(c); }
  // 4: thirty-two petals in the eight panel colours, each with a pale inner petal and a dot at the tip
  { const [c, x] = mkL();
    for (let i = 0; i < 32; i++) { const th = i / 32 * TAU - Math.PI / 2, col = mix(PANEL[i % 8], [255, 255, 255], .12), p = petal(U * .63, U * .88, th, .085);
      x.fillStyle = rgba(col, 1); x.fill(p); grain(x, p, col, 60, U * .1);
      const p2 = petal(U * .65, U * .8, th, .04); x.fillStyle = rgba(mix(col, [255, 246, 228], .55), 1); x.fill(p2);
      x.fillStyle = '#fbf3e4'; x.beginPath(); x.arc(Math.cos(th) * U * .9, Math.sin(th) * U * .9, U * .009, 0, TAU); x.fill(); }
    layers.push(c); }
  // 5: a scalloped gold border with a dot in every scallop
  { const [c, x] = mkL(); const n = 64;
    for (let i = 0; i < n; i++) { const th = (i + .5) / n * TAU, p = new Path2D(); p.arc(Math.cos(th) * U * .935, Math.sin(th) * U * .935, U * .046, th - Math.PI / 2, th + Math.PI / 2); p.closePath();
      p.cx = Math.cos(th) * U * .95; p.cy = Math.sin(th) * U * .95; x.fillStyle = i % 2 ? '#e9b43c' : '#f6d27a'; x.fill(p); }
    dots(x, U * .955, 64, U * .007, '#c4301f', TAU / 128);
    x.lineWidth = U * .005; x.strokeStyle = '#fbf3e4'; x.beginPath(); x.arc(0, 0, U * .93, 0, TAU); x.stroke(); layers.push(c); }
  // light from the lamp: darken outward on every ring (the floor falls off into the night)
  for (const c of layers) { const x = c.getContext('2d'); x.setTransform(D, 0, 0, D, S / 2 * D, S / 2 * D);
    const g = x.createRadialGradient(0, 0, U * .1, 0, 0, U * 1.02); g.addColorStop(0, 'rgba(20,10,24,0)'); g.addColorStop(.45, 'rgba(20,10,24,.22)'); g.addColorStop(1, 'rgba(14,8,24,.62)');
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(-S, -S, S * 2, S * 2); x.globalCompositeOperation = 'source-over'; c.S = S; }
  return layers;
}
function drawRing(x, c, sc, rot, a) {     // place one top-down ring onto the floor (perspective squash Q)
  if (a <= 0) return; const S = c.S;
  x.save(); x.globalAlpha = a; x.translate(cx, RCY); x.scale(1, Q); x.rotate(rot); x.scale(sc, sc);
  x.drawImage(c, -S / 2, -S / 2, S, S); x.restore();
}

/* ---------- the night ---------- */
function night(E) {
  const c = can(W * D, H * D), x = c.getContext('2d'); x.setTransform(D, 0, 0, D, 0, 0);
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0B0818'); g.addColorStop(.45, '#14102A'); g.addColorStop(.6, '#22152d'); g.addColorStop(LY - .02, '#2b1630');
  g.addColorStop(LY + .02, '#1c0f1f'); g.addColorStop(.86, '#120a17'); g.addColorStop(1, '#0B0818');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // the wine wash, warm along the horizon behind the lamp
  let r = x.createRadialGradient(cx, by, 0, cx, by, W * .55); r.addColorStop(0, 'rgba(61,27,46,.95)'); r.addColorStop(.5, 'rgba(61,27,46,.45)'); r.addColorStop(1, 'rgba(61,27,46,0)');
  x.save(); x.translate(cx, by); x.scale(1, .42); x.translate(-cx, -by); x.fillStyle = r; x.fillRect(0, -H * 3, W, H * 6); x.restore();
  // stars (hum sitare): small, few, away from the words and the garland
  const rr = rand(41); starTw = [];
  for (let i = 0; i < 150; i++) { const sx = rr() * W, sy = H * (.13 + rr() * .44), m = rr();
    const tx = Math.abs(sx - cx) / (W * .27), ty = Math.abs(sy - H * .3) / (H * .2); if (tx * tx + ty * ty < 1.25) continue;
    const a = .12 + m * m * .45, s = .6 + m * 1.2; x.fillStyle = `rgba(${m > .7 ? '255,236,200' : '220,214,255'},${a})`; x.beginPath(); x.arc(sx, sy, s * k, 0, TAU); x.fill();
    if (m > .82 && starTw.length < 14) starTw.push({ x: sx, y: sy, ph: rr() * TAU, sp: .5 + rr() * .8, s: 9 + rr() * 8 }); }
  // keep the corners calm (the entrance code sits bottom-right)
  r = x.createRadialGradient(W, H, 0, W, H, W * .4); r.addColorStop(0, 'rgba(6,4,12,.85)'); r.addColorStop(1, 'rgba(6,4,12,0)'); x.fillStyle = r; x.fillRect(0, 0, W, H);
  r = x.createRadialGradient(0, H, 0, 0, H, W * .3); r.addColorStop(0, 'rgba(6,4,12,.6)'); r.addColorStop(1, 'rgba(6,4,12,0)'); x.fillStyle = r; x.fillRect(0, 0, W, H);
  return c;
}

/* ---------- words: each line baked once onto its own canvas, with a soft dark ground ---------- */
function line(txt, font, fill, ls, glow) {
  const m = can(10, 10).getContext('2d'); m.font = font; if (ls) m.letterSpacing = ls;
  const tw = m.measureText(txt).width, fs = parseFloat(font.match(/(\d+(\.\d+)?)px/)[1]), pad = fs * .9;
  const c = can((tw + pad * 2) * D, fs * 2.4 * D), x = c.getContext('2d'); x.setTransform(D, 0, 0, D, 0, 0);
  x.font = font; if (ls) x.letterSpacing = ls; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
  const bl = fs * 1.55;
  x.shadowColor = 'rgba(6,4,14,.95)'; x.shadowBlur = fs * .5; x.fillStyle = 'rgba(6,4,14,.9)'; x.fillText(txt, pad, bl); x.fillText(txt, pad, bl);
  x.shadowBlur = 0; x.shadowColor = 'transparent';
  if (Array.isArray(fill)) { const g = x.createLinearGradient(0, bl - fs * .9, 0, bl + fs * .1); fill.forEach((f, i) => g.addColorStop(i / (fill.length - 1), f)); x.fillStyle = g; } else x.fillStyle = fill;
  x.fillText(txt, pad, bl);
  c.w = tw + pad * 2 + (ls ? -parseFloat(ls) : 0); c.h = fs * 2.4; c.bl = bl; c.tw = tw; return c;
}
function putLine(x, c, yBase, a, rise) {
  if (a <= 0) return; x.globalAlpha = a; x.drawImage(c, cx - (c.tw / 2) - (c.w - c.tw) / 2, yBase - c.bl + rise, c.width / D, c.height / D); x.globalAlpha = 1;
}

/* ---------- fireworks: analytic shells, every particle precomputed in typed arrays (nothing allocated per frame) ---------- */
const TYPES = { peony: { n: 56, drag: 1.5, g: 52, life: 2.9, head: 21 }, chrys: { n: 52, drag: 1.45, g: 48, life: 3.3, head: 17, trail: 8, td: .055 },
                ring: { n: 52, drag: 1.6, g: 40, life: 2.7, head: 18 }, willow: { n: 48, drag: 1.15, g: 95, life: 4.4, head: 14, trail: 13, td: .085 } };
function shell(t0, x0, y0, rad, type, c1, c2, rr) {
  const T = TYPES[type], n = T.n, vx = new Float32Array(n), vy = new Float32Array(n), lf = new Float32Array(n), ph = new Float32Array(n), col = new Uint8Array(n);
  const sp = rad * T.drag;                       // drag 'drag' brings a star to rest at distance sp/drag = rad
  const tilt = .3 + rr() * .45, roll = (rr() - .5) * 1.2;
  for (let j = 0; j < n; j++) {
    if (type === 'ring') { const a = j / n * TAU, ux = Math.cos(a), uy = Math.sin(a) * tilt; vx[j] = (ux * Math.cos(roll) - uy * Math.sin(roll)) * sp; vy[j] = (ux * Math.sin(roll) + uy * Math.cos(roll)) * sp; }
    else { const z = 1 - 2 * (j + .5) / n, r = Math.sqrt(1 - z * z), a = j * 2.39996 + rr() * .12, v = sp * (.94 + rr() * .1); vx[j] = Math.cos(a) * r * v; vy[j] = Math.sin(a) * r * v; }
    lf[j] = T.life * (.82 + rr() * .3); ph[j] = rr() * 100;
    col[j] = type === 'peony' ? (j % 3 === 0 ? c2 : c1) : type === 'ring' ? (j % 2 ? c1 : c2) : c1;
  }
  const end = Math.max(...lf);
  return { t0, x0, y0, rad, type, T, n, vx, vy, lf, ph, col, c1, drag: T.drag, g: T.g * k, rise: 1.15, end, sx: x0 + (rr() - .5) * 60 * k, sy: H * .6 };
}
let PX = 0, PY = 0;                              // scratch: posAt writes here
function posAt(b, j, u) { const e = (1 - Math.exp(-b.drag * u)) / b.drag; PX = b.x0 + b.vx[j] * e; PY = b.y0 + b.vy[j] * e + b.g / b.drag * (u - e); }
/* the words' block: fireworks never cross it (soft 40 px edge); rects set per frame */
const TR = new Float32Array(8); let trA = 1, trB = 0;
function clearOf(x, y) { let f = 1;
  if (trA > 0) { const d = Math.max(TR[0] - x, x - TR[1], TR[2] - y, y - TR[3]); f = Math.min(f, d <= 0 ? 0 : d >= 40 * k ? 1 : d / (40 * k)); }
  if (trB > 0) { const d = Math.max(TR[4] - x, x - TR[5], TR[6] - y, y - TR[7]); f = Math.min(f, d <= 0 ? 0 : d >= 40 * k ? 1 : d / (40 * k)); }
  return f; }
const hsh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };

function drawToran(x, t, ss) {
  for (const l of leaves) { const a = ss(l.t, l.t + .5, t); if (a <= 0) continue;
    const sc = l.sc * (.6 + .4 * a);
    x.save(); x.globalAlpha = a; x.translate(l.x, 2 * k - (1 - a) * 10 * k); x.rotate(l.rot); x.scale(sc, sc);
    x.drawImage(leafS, -leafS.w / 2, 0, leafS.w, leafS.h); x.restore(); }
  x.globalAlpha = 1;
  for (const m of toran) { const a = ss(m.t, m.t + .4, t); if (a <= 0) continue;
    const img = mari[m.m], s = img.sz * (.5 + .5 * a);
    x.globalAlpha = a; x.drawImage(img, m.x - s / 2, m.y - s / 2 - (1 - a) * 8 * k, s, s); }
  x.globalAlpha = 1;
  // the lamp is far below: the garland sits in the night
  const g = x.createLinearGradient(0, 0, 0, 150 * k); g.addColorStop(0, 'rgba(11,8,24,.38)'); g.addColorStop(1, 'rgba(11,8,24,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 150 * k);
}

FILM.scene({ id: 'welcome', dur: 26,
  lamp(t) { return { x: innerWidth * .5, y: innerHeight * LY, s: LS }; },
  init(E) {
    W = E.W; H = E.H; D = E.DPR; k = H / 1080; cx = W / 2; by = H * LY; R = Math.min(W * .245, H * .44); Q = .36; RCY = by + 8 * k;
    const sp = E.sprite;
    bgC = night(E);
    ringC = rangoli(E);
    // the whole rangoli, already on the floor, for after the bloom
    // each ring already on the floor (squashed), cropped to its own extent; and the prefixes (rings 0..i merged)
    const FR = [.16, .37, .55, .63, .91, 1.0];
    const sq = (list, f) => { const w = R * 2.04 * f, h = w * Q, c = can(w * D, h * D), x = c.getContext('2d');
      x.setTransform(D, 0, 0, D, w / 2 * D, h / 2 * D); x.scale(1, Q); for (const r of list) x.drawImage(r, -r.S / 2, -r.S / 2, r.S, r.S); c.w = w; c.h = h; return c; };
    ringSq = ringC.map((r, i) => sq([r], FR[i])); ringPre = ringC.map((r, i) => sq(ringC.slice(0, i + 1), FR[i])); rangFull = ringPre[ringPre.length - 1];
    cupBig = cupSprite(150 * k * LS / 1.05, 1, [120, 52, 30]);
    cupSm = cupSprite(46 * k, 1, [112, 46, 26]); cupSmB = cupSprite(46 * k, 0, [96, 40, 24]);
    flameS = flameSprite();
    warmS = sp([[0, 'rgba(255,200,120,.9)'], [.25, 'rgba(255,150,60,.42)'], [.6, 'rgba(220,90,30,.12)'], [1, 'rgba(200,70,20,0)']], 128);
    poolS = sp([[0, 'rgba(255,190,110,.55)'], [.4, 'rgba(240,130,60,.2)'], [1, 'rgba(200,80,40,0)']], 128);
    flashS = sp([[0, 'rgba(255,230,190,.5)'], [.4, 'rgba(255,190,140,.14)'], [1, 'rgba(255,170,120,0)']], 128);
    sparks = FWCOL.map(c => sp([[0, 'rgba(255,255,250,1)'], [.16, rgba(mix(c, [255, 255, 255], .35), 1)], [.42, rgba(c, .38)], [1, rgba(c, 0)]], 32));
    // marigolds and leaves
    mari = [marigold(12 * k, [255, 160, 40], [214, 82, 6]), marigold(12 * k, [255, 214, 60], [222, 150, 10]), marigold(12 * k, [250, 120, 20], [190, 50, 4]),
            marigold(9 * k, [255, 160, 40], [214, 82, 6]), marigold(9 * k, [255, 214, 60], [222, 150, 10])];
    leafS = leafSprite(78 * k);
    const rr = rand(7);
    // the toran: a cord of mango leaves along the top, five swags of marigolds in front, strands at the hooks
    leaves = []; toran = [];
    const nl = Math.round(W / (21 * k));
    for (let i = 0; i <= nl; i++) { const x = i / nl * W; leaves.push({ x, rot: (rr() - .5) * .3 + (i % 2 ? .07 : -.07), sc: .75 + rr() * .35 - (i % 2) * .2, t: 3 + 5 * Math.pow(Math.abs(x - cx) / (W / 2), .9) - .25, ph: rr() * TAU }); }
    const ns = 5, sag = 92 * k;
    for (let s = 0; s < ns; s++) { const x0 = s / ns * W, x1 = (s + 1) / ns * W, len = x1 - x0, n = Math.round(len / (13.5 * k));
      for (let j = 0; j <= n; j++) { const u = j / n, x = x0 + u * len, y = 10 * k + sag * 4 * u * (1 - u);
        const band = Math.floor(j / 6) % 2, side = j % 2 ? 1 : -1;
        toran.push({ x, y: y + side * 4.5 * k, sag: 4 * u * (1 - u), m: band ? (j % 5 === 0 ? 2 : 1) : 0, s: 1, t: 3 + 5 * Math.pow(Math.abs(x - cx) / (W / 2), .9), sw: s }); } }
    for (let s = 0; s <= ns; s++) { const x = s / ns * W; if (x < 2 || x > W - 2) continue;
      for (let j = 0; j < 7; j++) toran.push({ x, y: 18 * k + j * 17 * k, sag: .25 + j * .12, m: j % 2 ? 4 : 3, s: 1, t: 3 + 5 * Math.pow(Math.abs(x - cx) / (W / 2), .9) + j * .07, sw: s, str: 1 }); }
    torDone = Math.max(...leaves.map(l => l.t + .5), ...toran.map(m => m.t + .4)) + .05;
    torC = can(W * D, 190 * k * D); { const x = torC.getContext('2d'); x.setTransform(D, 0, 0, D, 0, 0); drawToran(x, 1e3, E.ss); }
    // the diyas: a ring on the rangoli's rim and a row out to both edges, lit outward from the lamp
    diyas = [];
    const rimR = R * 1.08, nRing = 22;
    for (let i = 0; i < nRing; i++) { const a = i / nRing * TAU; const x = cx + Math.cos(a) * rimR, y = RCY + Math.sin(a) * rimR * Q; diyas.push({ x, y, sc: .78 + .3 * (Math.sin(a) + 1) / 2 }); }
    const step = 74 * k; for (let s of [-1, 1]) for (let x = cx + s * (rimR + step * .9); s < 0 ? x > 24 * k : x < W - 24 * k; x += s * step) diyas.push({ x, y: by + 2 * k, sc: 1 });
    const mx = Math.max(...diyas.map(d => Math.abs(d.x - cx)));
    diyas.forEach((d, i) => { d.t = .5 + 5.3 * Math.pow(Math.abs(d.x - cx) / mx, .85) + (d.y < by ? .12 : 0); d.ph = i * 1.7; });
    diyas.sort((a, b) => a.y - b.y);
    { const q = bgC.getContext('2d'); q.setTransform(D, 0, 0, D, 0, 0); q.globalCompositeOperation = 'lighter'; q.globalAlpha = .42 * .94;
      q.drawImage(warmS, cx - W * .3, by - H * .3, W * .6, H * .5); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; }
    // once everything has drawn in (12.3 s), the garland, the rangoli and every cup are one still layer
    SB0 = Math.floor(Math.min(RCY - rangFull.h / 2, by - cupSm.ch * 1.5) - 8 * k); SB1 = Math.ceil(RCY + rangFull.h / 2 + 30 * k);
    staticB = can(W * D, (SB1 - SB0) * D); { const q = staticB.getContext('2d'); q.setTransform(D, 0, 0, D, 0, -SB0 * D);
      q.drawImage(rangFull, cx - rangFull.w / 2, RCY - rangFull.h / 2, rangFull.w, rangFull.h);
      for (const d of diyas) q.drawImage(cupSm, d.x - cupSm.ox * d.sc, d.y - cupSm.oy * d.sc, cupSm.cw * d.sc, cupSm.ch * d.sc);
      q.drawImage(cupBig, cx - cupBig.ox, by - cupBig.oy, cupBig.cw, cupBig.ch); }
    // the words
    lines = {
      hum: line('हम सितारे', `500 ${Math.round(150 * k)}px "Noto Sans Devanagari"`, ['#FBF3E4', '#FBF3E4', '#EED9A6']),
      sub: line('Hum Sitare · Diwali 2026', `400 ${Math.round(46 * k)}px Lora`, '#FBF3E4'),
      mehfil: line('SITARON KI MEHFIL', `400 ${Math.round(26 * k)}px Cinzel`, '#E8CF92', `${(.42 * 26 * k).toFixed(1)}px`),
      shubh: line('शुभ दीपावली · Shubh Deepavali', `italic 400 ${Math.round(38 * k)}px Lora, "Noto Sans Devanagari"`, '#E8CF92'),
      nine: line('Nine trees. One person, from the ground up.', `italic 400 ${Math.round(60 * k)}px Lora`, '#FBF3E4')
    };
    // the fireworks: from 9 s to 19 s two or three alive at a time on both sides of the title, then softer to the hand-off
    bursts = []; const fr = rand(1121);
    const plan = [[8.9,-1,'peony',GOLD,ROSE],[9.6,1,'chrys',SAFF,ROSE],[10.4,-1,'willow',GOLD,GOLD],[11.0,1,'ring',8,WHITE],[11.7,-1,'chrys',ROSE,8],
      [12.3,1,'peony',7,GOLD],[13.0,-1,'ring',9,GOLD],[13.6,1,'willow',GOLD,GOLD],[14.3,-1,'peony',SAFF,10],[14.9,1,'chrys',2,GOLD],
      [15.6,-1,'willow',GOLD,GOLD],[16.2,1,'peony',ROSE,11],[16.9,-1,'chrys',4,GOLD],[17.5,1,'ring',5,WHITE],[18.2,-1,'peony',6,ROSE],[18.8,1,'willow',GOLD,GOLD],
      [20.0,-1,'peony',GOLD,8],[21.1,1,'chrys',SAFF,GOLD],[22.2,-1,'willow',GOLD,GOLD]];
    for (const [t0, side, type, c1, c2] of plan) { const late = t0 > 19.5;
      const rad = H * (late ? .12 + fr() * .03 : .14 + fr() * .06);
      const x0 = cx + side * W * (late ? .36 + fr() * .05 : .31 + fr() * .07), y0 = H * (late ? .15 + fr() * .04 : .2 + fr() * .1);
      bursts.push(shell(t0, x0, y0, rad, type, c1, c2, fr)); }
    TR[0] = cx - 350 * k; TR[1] = cx + 350 * k; TR[2] = H * .13; TR[3] = H * .47;
    TR[4] = cx - lines.nine.tw / 2 - 20 * k; TR[5] = cx + lines.nine.tw / 2 + 20 * k; TR[6] = H * .265; TR[7] = H * .37;
    colS = FWCOL.map(c => rgba(mix(c, [255, 255, 255], .2), 1));
  },
  draw(E, t, dt) {
    if (E.seeking) return;                        // nothing to simulate: every motion is a function of t
    trA = t < 20.6 ? 1 : 0; trB = t > 19.4 ? 1 : 0;
    const x = E.ctx, ss = E.ss, n = E.noise;
    x.drawImage(bgC, 0, 0, W, H);
    // twinkling stars
    x.globalCompositeOperation = 'lighter';
    for (const s of starTw) { const a = .25 + .35 * (.5 + .5 * Math.sin(t * s.sp + s.ph)); E.put(E.SP.white, s.x, s.y, s.s * k, a * .5); }
    const fl = .88 + .12 * n(t * 1.7, 3.3);           // the lamp's breath
    // the lamp's light on the night behind it
    // (the lamp's warm light on the night is baked into the night itself)
    x.globalAlpha = 1;

    // ---------- fireworks (one additive pass; sprites and two strokes per shell) ----------
    const put = (sp, px, py, sz, a) => { x.globalAlpha = a; x.drawImage(sp, px - sz / 2, py - sz / 2, sz, sz); };
    x.lineCap = 'round';
    for (let bi = 0; bi < bursts.length; bi++) { const b = bursts[bi];
      const u = t - b.t0; if (u < 0 || u > b.rise + b.end) continue;
      const T = b.T;
      // the rocket: a gold spark climbing and slowing, shedding glitter that drifts down
      if (u < b.rise + .5) { const R1 = b.rise;
        for (let j = 0; j < 12; j++) { const v = (u - j * .045) / R1; if (v < 0 || v > 1) continue; const e = 1 - Math.pow(1 - v, 2.4), age = j * .045;
          const px = b.sx + (b.x0 - b.sx) * e, py = b.sy + (b.y0 - b.sy) * e + 30 * k * age * age;
          const a = (u < R1 ? 1 : 1 - (u - R1) / .5) * (j === 0 ? .95 : .7 * (1 - j / 12)) * (hsh(bi * 13 + j, Math.floor(t * 18)) > .25 || j < 2 ? 1 : .2);
          if (a > .02) put(j === 0 ? sparks[WHITE] : sparks[GOLD], px, py, (j === 0 ? 20 : 11 - j * .5) * k, a); } }
      if (u < b.rise) continue;
      const w = u - b.rise, bloom = ss(0, .12, w);
      // the heart: a bright flash that lights the sky round it
      if (w < .9) { const f = 1 - ss(0, .9, w), cf = clearOf(b.x0, b.y0); const fs = b.rad * 2.2;
        put(flashS, b.x0, b.y0, fs, f * .8 * cf); put(sparks[WHITE], b.x0, b.y0, b.rad * .32, (1 - ss(0, .22, w)) * .8 * cf); }
      // trails (chrysanthemum, willow): two bands, each a single stroke
      if (T.trail) { for (let band = 0; band < 2; band++) {
          const j0 = band ? (T.trail >> 1) : 0, j1 = band ? T.trail : (T.trail >> 1);
          x.beginPath(); let any = false;
          for (let j = 0; j < b.n; j++) { if (w > b.lf[j]) continue; posAt(b, j, w); if (clearOf(PX, PY) < .6) continue;
            posAt(b, j, Math.max(0, w - j0 * T.td)); x.moveTo(PX, PY);
            for (let q = j0 + 1; q <= j1; q++) { posAt(b, j, Math.max(0, w - q * T.td)); x.lineTo(PX, PY); } any = true; }
          if (!any) continue;
          const fade = 1 - ss(T.life * .6, T.life * 1.05, w);
          x.globalAlpha = fade * (band ? .32 : .62) * (b.type === 'willow' ? .9 : .8); x.strokeStyle = b.type === 'willow' ? colS[GOLD] : colS[b.c1];
          x.lineWidth = (band ? 1.6 : 2.8) * k; x.stroke(); } }
      // the stars
      const hs = T.head * k;
      for (let j = 0; j < b.n; j++) { const L = b.lf[j]; if (w > L) continue;
        posAt(b, j, w); const cf = clearOf(PX, PY); if (cf <= .02) continue;
        const life = w / L;
        let a = bloom * (1 - ss(.55, 1, life)) * cf;
        if (life > .4) a *= .6 + .4 * Math.sin(w * 11 + b.ph[j]);                      // the shimmer as it cools
        const sz = hs * (1.15 - .5 * life);
        if (a > .03) put(sparks[b.col[j]], PX, PY, sz, a);
        if (w < .22 && (j & 1)) put(sparks[WHITE], PX, PY, sz * .6, (1 - w / .22) * .6 * cf);       // hot white cores at the break
        // willow: glitter falling off every strand
        if (b.type === 'willow' && w > .5) for (let q = 1 + (j & 1); q <= 3; q += 2) { const ag = q * .22; if (w - ag < 0) break; posAt(b, j, w - ag);
          const tw = hsh(j * 7 + q, Math.floor(t * 14 + b.ph[j])); if (tw < .45) continue;
          put(sparks[WHITE], PX + (hsh(j, q) - .5) * 6 * k, PY + ag * ag * 60 * k, 7 * k, (tw - .45) * 1.6 * (1 - life) * cf); }
        // chrysanthemum and peony: crackle, each star pops into a few white points near its end
        if ((b.type === 'chrys' || b.type === 'peony') && life > .62 && life < .86) { const c = (life - .62) / .24;
          for (let q = 0; q < 2; q++) { const ang = hsh(j, q + 3) * TAU, d = (6 + 14 * c) * k;
            put(sparks[WHITE], PX + Math.cos(ang) * d, PY + Math.sin(ang) * d, 9 * k * (1 - c), (1 - c) * .9 * cf * (hsh(j + q, Math.floor(t * 20)) > .3 ? 1 : .25)); } }
      }
    }
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';

    // ---------- the toran: leaves, then marigolds, drawing in from the centre ----------
    const STILL = t >= ST_T; if (STILL) x.drawImage(torC, 0, 0, W, torC.height / D);
    if (!STILL && t > 2.6) { if (t >= torDone) x.drawImage(torC, 0, 0, W, torC.height / D); else drawToran(x, t, E.ss); }

    // ---------- the floor: the rangoli blooms ring by ring around the lamp ----------
    const RT = [5.0, 5.9, 6.9, 7.9, 8.9, 10.0];
    if (STILL) x.drawImage(staticB, 0, SB0, W, SB1 - SB0);
    if (!STILL) { let done = -1; while (done + 1 < ringC.length && t >= RT[done + 1] + 2.2) done++;
      if (done >= 0) { const c = ringPre[done]; x.drawImage(c, cx - c.w / 2, RCY - c.h / 2, c.w, c.h); }
      for (let i = done + 1; i < ringC.length; i++) { const v = ss(RT[i], RT[i] + 2.2, t); if (v <= 0) continue;
        const c = ringSq[i], sc = .82 + .18 * Math.pow(v, .7); x.globalAlpha = v; x.drawImage(c, cx - c.w * sc / 2, RCY - c.h * sc / 2, c.w * sc, c.h * sc); x.globalAlpha = 1; } }
    // light on the floor: the lamp's pool, breathing
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = .5 * fl; x.drawImage(poolS, cx - R * 1.3, RCY - R * Q * 1.3, R * 2.6, R * Q * 2.6);
    x.globalAlpha = .45 * fl; x.drawImage(poolS, cx - R * .55, RCY - R * Q * .55, R * 1.1, R * Q * 1.1);
    // the rangoli catches the light as it blooms: a slow glint running round the rings
    if (t > 5 && t < 14) { const ga = ss(5, 7, t) * (1 - ss(11.5, 14, t)) * .35, ang = (t - 5) * .9;
      for (let i = 0; i < 2; i++) { const a = ang + i * Math.PI, rr2 = R * (.4 + .5 * ss(5, 12, t));
        x.globalAlpha = ga; x.drawImage(poolS, cx + Math.cos(a) * rr2 - 90 * k, RCY + Math.sin(a) * rr2 * Q - 32 * k, 180 * k, 64 * k); } }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';

    // ---------- the diyas ----------
    const cw = cupSm.cw, ch = cupSm.ch;
    for (let i = 0; i < diyas.length; i++) { const d = diyas[i], a = ss(d.t, d.t + .55, t), s = d.sc * k / k;
      const f = .82 + .18 * n(d.ph, t * 2.4), h = .9 + .22 * n(d.ph + 9, t * 3.1);
      if (a > 0) { x.globalCompositeOperation = 'lighter';
        x.globalAlpha = a * .5 * f; x.drawImage(poolS, d.x - 60 * k * s, d.y - 8 * k * s, 120 * k * s, 30 * k * s);
        x.globalAlpha = a * .42 * f; x.drawImage(warmS, d.x - 46 * k * s, d.y - 62 * k * s, 92 * k * s, 92 * k * s);
        x.globalCompositeOperation = 'source-over'; }
      // the cup: unlit clay until its flame catches (then lit from above)
      if (!STILL) { x.globalAlpha = .7 + .3 * a; x.drawImage(a > .5 ? cupSm : cupSmB, d.x - cupSm.ox * s, d.y - cupSm.oy * s, cw * s, ch * s); x.globalAlpha = 1; }
      if (a > 0) { const fw = 13 * k * s * (.5 + .5 * a), fh = 30 * k * s * h * (.4 + .6 * a), sway = (n(d.ph + 3, t * 1.3) - .5) * 2 * k;
        x.globalCompositeOperation = 'lighter';
        x.globalAlpha = Math.min(1, a * 1.4); x.drawImage(flameS, d.x - fw / 2 + sway, d.y - fh - 2 * k * s, fw, fh);
        x.globalAlpha = a * .7 * f; E.put(E.SP.hot, d.x, d.y - fh * .4, 26 * k * s, a * .6 * f);
        // the spark that lights it
        if (t < d.t + .5) { const v = (t - d.t) / .5; E.put(E.SP.white, d.x, d.y - 10 * k * s, 30 * k * s * (1 - v), (1 - v) * .8); }
        x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; }
    }
    // ---------- the lamp's own diya ----------
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = .45 * fl; x.drawImage(poolS, cx - 150 * k, by - 20 * k, 300 * k, 60 * k);
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
    if (!STILL) x.drawImage(cupBig, cx - cupBig.ox, by - cupBig.oy, cupBig.cw, cupBig.ch);

    // ---------- the words ----------
    const out = 1 - ss(19, 20.4, t);
    const ta = (t0) => ss(t0, t0 + 1.6, t) * out, rise = (t0) => (1 - ss(t0, t0 + 2.2, t)) * 14 * k;
    putLine(x, lines.hum, H * .245, ta(6.0), rise(6.0));
    putLine(x, lines.sub, H * .327, ta(7.0), rise(7.0));
    // a small gold ornament on either side of the Cinzel line
    const ma = ta(8.0); if (ma > 0) { const y = H * .378 - 9 * k, hw = lines.mehfil.tw / 2 + 26 * k;
      x.globalAlpha = ma * .9; x.strokeStyle = '#C9A84C'; x.lineWidth = 1.2 * k; x.beginPath();
      x.moveTo(cx - hw, y); x.lineTo(cx - hw - 70 * k * ss(8, 9.6, t), y); x.moveTo(cx + hw, y); x.lineTo(cx + hw + 70 * k * ss(8, 9.6, t), y); x.stroke();
      x.fillStyle = '#E8CF92'; for (const sx of [-1, 1]) { x.beginPath(); const px = cx + sx * (hw - 8 * k); x.moveTo(px, y - 4 * k); x.lineTo(px + 4 * k, y); x.lineTo(px, y + 4 * k); x.lineTo(px - 4 * k, y); x.fill(); }
      x.globalAlpha = 1; }
    putLine(x, lines.mehfil, H * .378, ma, rise(8.0) * .6);
    putLine(x, lines.shubh, H * .432, ta(9.3), rise(9.3));
    putLine(x, lines.nine, H * .33, ss(20.2, 22, t), (1 - ss(20.2, 22.6, t)) * 12 * k);
  }
});
})();
