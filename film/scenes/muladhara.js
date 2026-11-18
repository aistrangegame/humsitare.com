/* Muladhara · The Root — PRESS.
   The lamp lands on the ground line. Pressed, it sends roots of light down into the red earth (the wall card's roots,
   grown by the same guided walker), the earth answers in slow rings, a pulse runs down every root and comes back up
   (you press down, the earth presses up), then the roots let go into embers and a calmer root system regrows. */
(() => {
const TAU = Math.PI * 2;
const nrm = a => { a %= TAU; if (a > Math.PI) a -= TAU; if (a < -Math.PI) a += TAU; return a; };
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = x => x * x * (3 - 2 * x);
const LXF = .655, GYF = .405;                 // lamp x and ground line, fractions of the stage
// timeline (scene seconds)
const G0 = 2.4, G1 = 18.4;                    // growth
const PD0 = 18.6, PD1 = 20.9, PU1 = 22.7;     // pulse down, pulse back up (the earth presses back)
const REL = 22.9;                             // release into embers
const C0 = 24.6, C1 = 30.6;                   // calm regrowth
const RINGS = [1.0, 5.6, 9.8, 13.8, 17.6, 22.7];

let W, H, GY, LX, DPR, R;
let bg, compC, compX, merged, SPR, poolS, haloS, rootC, rootX, calmC, calmX;
let roots, maxPL, maxD, relEnd;                 // roots; the longest path from the lamp; when the last root has let go
let emP = .1, embers, lastT;
const RELDUR = 3.9;                     // seconds for the release to travel the longest root path

/* ---------- the card's guided root walker, recomposed for 16:9 ---------- */
function grow(E) {
  const G = 4, GW = Math.ceil(W / G), GH = Math.ceil(H / G);
  const mask = new Uint8Array(GW * GH);
  const blk = (x0, y0, x1, y1) => { x0 = Math.max(0, Math.floor(x0 / G)); y0 = Math.max(0, Math.floor(y0 / G)); x1 = Math.min(GW - 1, Math.ceil(x1 / G)); y1 = Math.min(GH - 1, Math.ceil(y1 / G));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) mask[y * GW + x] = 1; };
  blk(0, 0, W, GY - 6);                                   // nothing grows above the ground
  // the clearing where the words sit: a soft-cornered oval, so roots wrap round it rather than stop at a wall
  { const cx = W * .2, cy = H * .695, rx = W * .265, ry = H * .175;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const u = (x * G + G / 2 - cx) / rx, v = (y * G + G / 2 - cy) / ry;
      if (Math.pow(Math.abs(u), 3.2) + Math.pow(Math.abs(v), 3.2) < 1 || (x * G < cx && Math.abs(v) < 1)) mask[y * GW + x] = 1; } }
  const dist = new Float32Array(GW * GH); for (let i = 0; i < dist.length; i++) dist[i] = mask[i] ? 0 : 1e4;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const i = y * GW + x; let d = dist[i]; if (x > 0) d = Math.min(d, dist[i - 1] + G); if (y > 0) { d = Math.min(d, dist[i - GW] + G); if (x > 0) d = Math.min(d, dist[i - GW - 1] + G * 1.414); if (x < GW - 1) d = Math.min(d, dist[i - GW + 1] + G * 1.414); } dist[i] = d; }
  for (let y = GH - 1; y >= 0; y--) for (let x = GW - 1; x >= 0; x--) { const i = y * GW + x; let d = dist[i]; if (x < GW - 1) d = Math.min(d, dist[i + 1] + G); if (y < GH - 1) { d = Math.min(d, dist[i + GW] + G); if (x < GW - 1) d = Math.min(d, dist[i + GW + 1] + G * 1.414); if (x > 0) d = Math.min(d, dist[i + GW - 1] + G * 1.414); } dist[i] = d; }
  const dAt = (x, y) => { if (y < 0) return 0; const gx = cl(x / G | 0, 0, GW - 1), gy = cl(y / G | 0, 0, GH - 1); return dist[gy * GW + gx]; };
  const occ = new Float32Array(GW * GH);
  const oAt = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return 0; return occ[(y / G | 0) * GW + (x / G | 0)]; };
  const oSum = (x, y) => { let s = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) s += oAt(x + i * G, y + j * G); return s; };
  const dep = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return; occ[(y / G | 0) * GW + (x / G | 0)] += 1; };
  const cost = (x, y, keep) => { const d = dAt(x, y); return (d < keep ? (keep - d) / keep * 4 : 0) + Math.min(3, oSum(x, y) * .22); };
  const ST = 4, out = [];
  const k = H / 1080;                                      // scale lengths with the stage
  const SPc = [0, 58, 38, 32, 27], LEN = [0, 380, 160, 78, 38], CAP = [0, 5, 2.4, 1.35, .9], MINL = [0, 50, 30, 18, 12],
        WOB = [.034, .05, .075, .1, .12], GRAV = [0, .014, .012, .008, .004], KEEP = [24, 30, 24, 18, 14];
  function walk(o) {
    let x = o.x, y = o.y, a = o.a; const lv = o.lv, P = [{ x, y, s: 0 }];
    const p0 = R() * TAU, p1 = R() * TAU, f1 = .012 + R() * .02, f2 = .045 + R() * .05; let wi = 0, s = 0;
    for (; s < o.len;) {
      a += WOB[lv] * (Math.sin(s * f1 + p0) + .6 * Math.sin(s * f2 + p1));
      if (o.way) { while (wi < o.way.length && Math.hypot(o.way[wi][0] - x, o.way[wi][1] - y) < 46) wi++; if (wi >= o.way.length) break;
        a += cl(nrm(Math.atan2(o.way[wi][1] - y, o.way[wi][0] - x) - a), -.5, .5) * .2; }
      else a += cl(nrm((o.home !== undefined ? o.home : Math.PI / 2) - a), -1, 1) * GRAV[lv];
      const kp = KEEP[lv], pl = cost(x + Math.cos(a - .65) * 22, y + Math.sin(a - .65) * 22, kp), pr = cost(x + Math.cos(a + .65) * 22, y + Math.sin(a + .65) * 22, kp);
      a += cl((pl - pr) * (o.way ? .10 : .16), -.22, .22);
      let nx = x + Math.cos(a) * ST, ny = y + Math.sin(a) * ST, ok = dAt(nx, ny) > 3 || (lv === 0 && s < 24 && ny > y);
      if (!ok && lv === 0) { for (const t of [.5, -.5, 1, -1, 1.5, -1.5]) { const xx = x + Math.cos(a + t) * ST, yy = y + Math.sin(a + t) * ST; if (dAt(xx, yy) > 3) { a += t; nx = xx; ny = yy; ok = true; break; } } }
      if (!ok) break;
      if (lv > 0 && dAt(nx, ny) < (lv > 2 ? 13 : 15)) break;
      if (lv > 0 && s > 14 && oAt(nx, ny) > 0) break;
      if (lv > 0 && s > 20 && Math.sin(a) < -.3) break;
      if (nx < -12 || nx > W + 12 || ny > H + 12) break;
      x = nx; y = ny; s += ST; P.push({ x, y, s });
    }
    return P;
  }
  function accept(o, P) {
    const L = P[P.length - 1].s; if (L < (MINL[o.lv] || 30)) return null;
    const wt = o.lv === 0 ? .9 : .34, pw = o.lv === 0 ? .72 : .9;
    P.forEach(p => { p.w = wt + (o.w0 - wt) * Math.pow(1 - p.s / L, pw); });
    for (const p of P) dep(p.x, p.y);
    const r = { P, lv: o.lv, L, t0: o.t0 || 0, v: o.v || 150, pl0: o.pl0 || 0 }; out.push(r); return r;
  }
  let queue = [];
  const X = f => f * W, Y = f => GY + (f) * (H - GY);       // waypoints: x as stage fraction, y as fraction of the earth depth
  const main = (dx, a, w0, way, t0, v) => { const o = { x: LX + dx, y: GY + 1, a, lv: 0, w0, len: 6000, way: way.map(([x, y]) => [X(x), Y(y)]), t0, v };
    const r = accept(o, walk(o)); if (r) queue.push(r); };
  // the long confident roots: one deep under the words, one down the right, the tap root, and two along the surface
  main(-8, 1.95, 13.5, [[.640, .16], [.615, .33], [.565, .48], [.525, .62], [.505, .78], [.455, .92], [.37, .955], [.28, .94], [.19, .965], [.10, .95], [.03, .975], [-.03, .99]], 0, 165);
  main(14, .95, 10.5, [[.70, .14], [.745, .30], [.80, .42], [.855, .55], [.885, .70], [.91, .84], [.935, 1.05]], .25, 150);
  main(3, 1.55, 8.5, [[.66, .2], [.652, .42], [.672, .62], [.66, .82], [.675, 1.05]], .1, 140);
  main(-18, 2.85, 6.6, [[.60, .07], [.52, .085], [.44, .07], [.36, .095], [.27, .08], [.18, .1], [.09, .085], [-.03, .11]], .6, 150);
  main(22, .22, 6, [[.72, .055], [.80, .075], [.88, .065], [.96, .09], [1.03, .1]], .5, 140);
  main(10, .7, 6.2, [[.71, .13], [.78, .2], [.86, .25], [.94, .31], [1.03, .36]], .9, 130);
  main(-12, 2.3, 5.4, [[.60, .14], [.565, .22], [.545, .30]], 1.1, 120);
  const VEL = [0, 105, 82, 66, 54];
  for (let lv = 1; lv <= 4; lv++) { const next = [];
    for (const par of queue) { const P = par.P; let at = SPc[lv] * (.25 + R() * .6);
      for (let i = 2; i < P.length - 2; i++) { if (P[i].s < at) continue; at = P[i].s + SPc[lv] * (.55 + R() * .95);
        const h = Math.atan2(P[i + 1].y - P[i - 1].y, P[i + 1].x - P[i - 1].x);
        const spread = .5 + R() * .65; let side = R() < .5 ? -1 : 1;
        const cA = cost(P[i].x + Math.cos(h + side * spread) * 26, P[i].y + Math.sin(h + side * spread) * 26, KEEP[lv]), cB = cost(P[i].x + Math.cos(h - side * spread) * 26, P[i].y + Math.sin(h - side * spread) * 26, KEEP[lv]);
        if (cB < cA && R() < .8) side = -side;
        const a = h + side * spread; if (Math.sin(a) < -.15) continue;
        const len = LEN[lv] * k * (.4 + R() * 1.0) * (lv === 1 ? (1.15 - .5 * P[i].s / par.L) : 1);
        const w0 = Math.min(P[i].w * .72, CAP[lv] * (.6 + R() * .55)); if (w0 < .5) continue;
        const home = nrm(Math.PI / 2 + cl(nrm(a - Math.PI / 2), -1.1, 1.1) * .55);
        // a side root starts when its parent's tip has passed the branch point, with a small pause
        const t0 = par.t0 + P[i].s / par.v + .15 + R() * .5;
        const o = { x: P[i].x, y: P[i].y, a, lv, w0, len, home, t0, v: VEL[lv] * (.85 + R() * .3), pl0: par.pl0 + P[i].s }; const r = accept(o, walk(o)); if (r) next.push(r); } }
    queue = queue.concat(next); }
  return out;
}

/* ---------- colours: cream at the lamp, falling to the earth's brown far away ---------- */
const RAMP = [[255, 244, 212], [253, 212, 134], [226, 150, 84], [168, 98, 60], [112, 62, 44], [78, 40, 32]];
const CALM = [[255, 214, 160], [236, 150, 92], [196, 98, 62], [140, 62, 44], [96, 40, 32], [66, 28, 24]];
function rgb(ramp, t) { t = cl(t, 0, .999) * (ramp.length - 1); const i = t | 0, q = t - i, a = ramp[i], b = ramp[i + 1];
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * q) + ',' + Math.round(a[1] + (b[1] - a[1]) * q) + ',' + Math.round(a[2] + (b[2] - a[2]) * q) + ')'; }
const heatOf = (x, y, lv) => cl(Math.hypot((x - LX) * .62, (y - GY) * 1.05) / ((H - GY) * 1.12) + lv * .04, 0, 1);

function paintBG(E) {
  bg = document.createElement('canvas'); bg.width = Math.round(W * DPR); bg.height = Math.round(H * DPR);
  const c = bg.getContext('2d'); c.scale(DPR, DPR); const r = E.rand(7);
  let g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#0d0506'); g.addColorStop(.55, '#1a0a09'); g.addColorStop(1, '#2c110d');
  c.fillStyle = g; c.fillRect(0, 0, W, GY);
  g = c.createLinearGradient(0, GY, 0, H); g.addColorStop(0, '#4a160e'); g.addColorStop(.1, '#3a130d'); g.addColorStop(.45, '#250e0b'); g.addColorStop(1, '#130707');
  c.fillStyle = g; c.fillRect(0, GY, W, H - GY);
  // strata: long soft bands that wander
  for (let k = 0; k < 30; k++) { const y0 = GY + 14 + r() * (H - GY), amp = 5 + r() * 16, f = .002 + r() * .005, ph = r() * 9; c.beginPath();
    for (let x = -10; x <= W + 10; x += 12) { const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph) * amp * .3; x < 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.strokeStyle = `rgba(${130 + r() * 60 | 0},${46 + r() * 26 | 0},${34 + r() * 16 | 0},${.03 + r() * .045})`; c.lineWidth = 1 + r() * 6; c.stroke(); }
  // stones and grit
  const n = W * (H - GY) / 700;
  for (let i = 0; i < n; i++) { const x = r() * W, y = GY + 5 + r() * (H - GY), z = .6 + r() * r() * 5.5; c.beginPath(); c.ellipse(x, y, z, z * (.5 + r() * .4), r() * 3, 0, TAU);
    c.fillStyle = `rgba(${70 + r() * 80 | 0},${30 + r() * 26 | 0},${26 + r() * 20 | 0},${.07 + r() * .15})`; c.fill(); }
  // the lip of soil
  g = c.createLinearGradient(0, GY - 3, 0, GY + 22); g.addColorStop(0, 'rgba(120,50,36,0)'); g.addColorStop(.2, 'rgba(140,58,40,.5)'); g.addColorStop(1, 'rgba(70,24,18,0)');
  c.fillStyle = g; c.fillRect(0, GY - 3, W, 25);
  // the lamp's standing pool of light in the earth (the card's #pool) and its halo in the night above
  c.save(); c.beginPath(); c.rect(0, GY, W, H - GY); c.clip(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .9;
  c.drawImage(poolS, LX - W * .4, GY - H * .52, W * .8, H * 1.04); c.restore();
  c.save(); c.beginPath(); c.rect(0, 0, W, GY); c.clip(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .75;
  c.drawImage(haloS, LX - H * .45, GY - H * .55, H * .9, H * .9); c.restore();
  // vignette into the panel's night
  g = c.createRadialGradient(LX, GY, H * .2, LX, GY, W * .95); g.addColorStop(0, 'rgba(8,3,4,0)'); g.addColorStop(1, 'rgba(8,3,4,.55)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

function drawRun(c, r, i0, i1, ramp, wk, glow) {
  // draw points i0..i1 of root r as one polyline: glow passes (lighter), then the core
  const P = r.P; if (i1 <= i0) return;
  const m = P[(i0 + i1) >> 1], w = m.w * wk, t = heatOf(m.x, m.y, r.lv);
  const path = () => { c.beginPath(); c.moveTo(P[i0].x, P[i0].y); for (let i = i0 + 1; i <= i1; i++) c.lineTo(P[i].x, P[i].y); };
  path();
  if (glow > 0 && r.lv <= 2) { c.globalCompositeOperation = 'lighter'; c.lineCap = 'butt';
    const fade = Math.max(.25, 1 - t * .85) * glow;
    if (r.lv <= 1) { c.strokeStyle = 'rgb(232,104,44)'; c.globalAlpha = .05 * fade; c.lineWidth = w * 3 + 20; c.stroke(); }
    c.strokeStyle = 'rgb(255,150,72)'; c.globalAlpha = .09 * fade; c.lineWidth = w * 1.8 + 6; c.stroke(); }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.lineCap = 'round';
  c.strokeStyle = rgb(ramp, t); c.lineWidth = Math.max(.6, w); c.stroke();
  if (w > 2.6) { const j0 = Math.max(0, i0 - 2); c.beginPath(); c.moveTo(P[j0].x, P[j0].y); for (let i = j0 + 1; i <= i1; i++) c.lineTo(P[i].x, P[i].y);
    c.strokeStyle = rgb(ramp, t * .55); c.lineWidth = w * .34; c.stroke(); }
}

FILM.scene({ id: 'muladhara', dur: 32, text: { x: .058, y: .565, w: .42, align: 'left' },
  lamp(t) {
    const w = innerWidth, h = innerHeight;
    const press = sm(cl((t - 2) / 6, 0, 1)) * (1 - sm(cl((t - REL) / 3, 0, 1)) * .6);
    const swell = Math.exp(-Math.pow((t - PU1) / .7, 2));
    return { x: w * LXF, y: h * GYF + 3 + press * 4, s: 1.16 + press * .1 + swell * .14 };
  },
  init(E) {
    W = E.W; H = E.H; DPR = E.DPR; GY = Math.round(H * GYF); LX = W * LXF; R = E.rand(20261121);
    poolS = E.sprite([[0, 'rgba(226,104,48,.62)'], [.3, 'rgba(176,60,32,.34)'], [.65, 'rgba(122,36,24,.12)'], [1, 'rgba(122,36,24,0)']], 256);
    haloS = E.sprite([[0, 'rgba(255,190,100,.5)'], [.4, 'rgba(240,120,42,.2)'], [.75, 'rgba(194,62,34,.06)'], [1, 'rgba(194,62,34,0)']], 256);
    paintBG(E);
    // glow points pre-sized (unscaled blits are far cheaper than scaling a sprite every draw)
    // one atlas: row 0 hot, row 1 ember; sizes 2..42 px side by side
    { const cell = Math.ceil(43 * DPR); SPR = document.createElement('canvas'); SPR.width = cell * 41; SPR.height = cell * 2; const ax = SPR.getContext('2d'); SPR.cell = cell;
      for (let z = 0; z <= 40; z++) { const n = Math.max(2, Math.round((z + 2) * DPR)); ax.drawImage(E.SP.hot, z * cell, 0, n, n); ax.drawImage(E.SP.emb, z * cell, cell, n, n); } }
    const mk = () => { const cv = document.createElement('canvas'); cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); const x = cv.getContext('2d'); x.scale(DPR, DPR); x.lineJoin = 'round'; return [cv, x]; };
    [rootC, rootX] = mk(); [calmC, calmX] = mk(); [compC, compX] = mk();
    // the picture as one layer (ground + grown roots), so a normal frame is a single blit
    compX.setTransform(1, 0, 0, 1, 0, 0); compX.drawImage(bg, 0, 0); compX.setTransform(DPR, 0, 0, DPR, 0, 0); merged = false;
    roots = grow(E);
    // arrival times along every root, normalised so the farthest tip lands at 1
    let maxA = 0; for (const r of roots) { r.t1 = r.t0 + r.L / r.v; if (r.t1 > maxA) maxA = r.t1; }
    for (const r of roots) { r.a0 = r.t0 / maxA; r.a1 = r.t1 / maxA; r.drawn = 0; r.cdrawn = 0; r.tip = 0; r.ctip = 0; r.calm = r.lv <= 2; }
    // the release follows the roots: each point lets go at a time set by its path length from the lamp, plus a little per branch
    maxPL = 1; maxD = 1; let nPts = 0; for (const r of roots) { maxPL = Math.max(maxPL, r.pl0 + r.L); nPts += r.P.length; for (const p of r.P) maxD = Math.max(maxD, Math.hypot(p.x - LX, p.y - GY)); }
    for (const r of roots) { r.jit = (r.lv ? .08 : 0) + R() * (.12 + r.lv * .07); r.rel = 0; }
    relEnd = REL + .1 + .45 + RELDUR + .1; emP = Math.min(.5, 560 / Math.max(1, nPts));
    embers = []; lastT = -1;
  },
  draw(E, t, dt) {
    const c = E.ctx, r01 = cl((t - G0) / (G1 - G0), 0, 1), RV = sm(r01) * .55 + r01 * .45;  // reveal (arrival units)
    const c01 = cl((t - C0) / (C1 - C0), 0, 1), CV = 1 - Math.pow(1 - c01, 1.7);
    const breath = .5 + .5 * Math.sin((t - C0) * TAU / 7);

    // --- grow: draw what the reveal has reached into the root layer (incremental) ---
    if (t < REL + 3.8) for (const r of roots) {
      if (RV < r.a0 || r.drawn >= r.P.length - 1) continue;
      const u = cl((RV - r.a0) / (r.a1 - r.a0), 0, 1), L = u * r.L, P = r.P;
      let i = r.drawn; while (i < P.length - 1 && P[i + 1].s <= L) i++;
      r.tip = i; if (i - r.drawn >= 6 || (i > r.drawn && i === P.length - 1)) { drawRun(rootX, r, r.drawn, i, RAMP, 1, 1); drawRun(compX, r, r.drawn, i, RAMP, 1, 1); r.drawn = i; }
    }
    // once the release has passed every root, the ground layer becomes ground + the calm roots
    // --- the release: each root lets go along its own length, from the lamp outward; its light peels off as embers ---
    const relU = cl((t - REL) / (relEnd - REL), 0, 1);
    if (t >= REL && t !== lastT && !merged) { const x = rootX; x.globalCompositeOperation = 'destination-out'; x.globalAlpha = 1; x.lineCap = 'round'; x.strokeStyle = '#000';
      for (const r of roots) { const P = r.P, n = P.length; if (r.rel >= n - 1) continue;
        const ur = (t - REL - .1 - r.jit) / RELDUR; if (ur <= 0) continue;
        const sRel = Math.pow(Math.min(1.2, ur), 1.3) * maxPL - r.pl0; if (sRel <= 0) continue;   // slower near the lamp, quickening outward
        const i = Math.min(n - 1, Math.floor(sRel / 4)); if (i <= r.rel) continue;
        const w = P[Math.max(0, r.rel)].w; x.lineWidth = r.lv <= 1 ? w * 3 + 24 : r.lv === 2 ? w * 1.8 + 9 : w + 4;
        x.beginPath(); x.moveTo(P[Math.max(0, r.rel - 1)].x, P[Math.max(0, r.rel - 1)].y); for (let j = r.rel; j <= i; j++) x.lineTo(P[j].x, P[j].y); x.stroke();
        for (let j = r.rel + 1; j <= i; j++) { const p = P[j];
          if (R() < emP * (.6 + Math.min(1.2, p.w * .25)) && embers.length < 480) embers.push({ x: p.x, y: p.y, vx: (R() - .5) * .5, vy: (R() - .35) * .5, l: 0, m: 2.6 + R() * 4.5 + (R() < .15 ? 5 : 0), z: (1.4 + Math.min(4, Math.pow(p.w, .5)) * (.6 + R() * .7)) * 3.4 }); }
        r.rel = i; }
      x.globalCompositeOperation = 'source-over'; }
    if (!merged && t >= relEnd) { compX.setTransform(1, 0, 0, 1, 0, 0); compX.globalAlpha = 1; compX.globalCompositeOperation = 'source-over';
      compX.drawImage(bg, 0, 0); compX.drawImage(calmC, 0, 0); compX.setTransform(DPR, 0, 0, DPR, 0, 0); merged = true; }
    // --- calm regrowth into its own layer ---
    if (t >= C0) for (const r of roots) { if (!r.calm) continue;
      const a0 = r.a0 * .82, a1 = a0 + (r.a1 - r.a0) * .82; if (CV < a0 || r.cdrawn >= r.P.length - 1) continue;
      const u = cl((CV - a0) / (a1 - a0), 0, 1), L = u * r.L, P = r.P;
      let i = r.cdrawn; while (i < P.length - 1 && P[i + 1].s <= L) i++;
      r.ctip = i; if (i - r.cdrawn >= 6 || (i > r.cdrawn && i === P.length - 1)) { drawRun(calmX, r, r.cdrawn, i, CALM, .78, .7); if (merged) drawRun(compX, r, r.cdrawn, i, CALM, .78, .7); r.cdrawn = i; } }

    // --- composition (skipped while the harness fast-forwards: state above is all that matters then) ---
    const wall = performance.now(), ff = !!E.seeking; lastWall = wall;
    if (ff) { stepEmbers(E, t, dt, null); lastT = t; return; }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const grown = RV, pulseUp = Math.exp(-Math.pow((t - PU1) / .55, 2)), sy = Math.max(0, GY - 30), sh = H - sy;
    if (t < REL || merged) c.drawImage(compC, 0, 0, W, H);
    else { // the release: ground, the old roots not yet let go, the calm roots regrowing
      c.drawImage(bg, 0, 0, W, H);
      c.drawImage(rootC, 0, sy * DPR, W * DPR, sh * DPR, 0, sy, W, sh);
      if (t >= C0) c.drawImage(calmC, 0, sy * DPR, W * DPR, sh * DPR, 0, sy, W, sh); }
    c.globalCompositeOperation = 'lighter';

    // --- growing tips: hot points where the roots are pushing through ---
    if (t < REL) { const fadeTips = 1 - ss01(G1 - .6, G1 + .6, t);
      for (const r of roots) { if (r.lv > 2 || RV < r.a0 || RV > r.a1 || r.tip < 1) continue; const p = r.P[r.drawn], z = 7 + Math.min(14, r.P[0].w * 2.4);
        c.globalAlpha = .85 * fadeTips; dot(c, 'hot', p.x, p.y, z); } }
    if (t >= C0) for (const r of roots) { if (!r.calm) continue; const a0 = r.a0 * .82, a1 = a0 + (r.a1 - r.a0) * .82; if (CV < a0 || CV > a1 || r.ctip < 1) continue;
      const p = r.P[r.cdrawn], z = 6 + Math.min(10, r.P[0].w * 1.6); c.globalAlpha = .5; dot(c, 'emb', p.x, p.y, z); }

    // --- sap: slow light running down the grown roots ---
    const sapA = (ss01(4, 8, t) * (1 - ss01(REL - 1, REL, t))) + ss01(C1 - 3, C1, t) * .6;
    if (sapA > .01) for (const r of roots) { if (r.lv > 0) continue; const lay = t < REL ? r.drawn : r.cdrawn; if (lay < 4) continue;
      const P = r.P, reach = P[lay].s, gap = 230, sp = 46;
      for (let s = ((t * sp) % gap); s < reach; s += gap) { const i = Math.min(lay, (s / 4) | 0), p = P[i];
        const z = 10 + p.w * 2.2, al = sapA * (1 - heatOf(p.x, p.y, r.lv) * .7) * .7; c.globalAlpha = al; dot(c, 'hot', p.x, p.y, z); } }

    // --- the pulse: down every root (press), then back up (the earth presses back): the grown roots re-lit inside a moving ring ---
    let pp = -1; if (t >= PD0 && t < PD1) pp = sm((t - PD0) / (PD1 - PD0)); else if (t >= PD1 && t < PU1) pp = 1 - sm((t - PD1) / (PU1 - PD1));
    if (pp >= 0) { const env = Math.min(ss01(PD0, PD0 + .5, t), 1 - ss01(PU1 - .3, PU1 + .05, t)), rr = pp * (maxD + 40), bw = 150;
      ringLight(c, rr, bw, env * 1.5); ringLight(c, rr, bw * .3, env * .9);
      if (rr > 10) { c.globalCompositeOperation = 'lighter'; c.lineCap = 'butt'; c.strokeStyle = 'rgb(240,130,60)';
        c.save(); c.beginPath(); c.rect(W * .5, GY, W * .5, H - GY); c.rect(0, GY, W * .5, H * .5 - GY); c.clip();   // never behind the words
        for (const [lw, al] of [[90, .05], [36, .07], [10, .08]]) { c.beginPath(); c.ellipse(LX, GY + 1, rr, rr * .72, 0, 0, Math.PI); c.globalAlpha = env * al; c.lineWidth = lw; c.stroke(); }
        c.restore(); } }

    // --- release: the burning edge where the roots let go ---
    if (t >= REL && !merged) burnEdges(c);
    stepEmbers(E, t, dt, c); lastT = t;

    // --- the ground pressing back: slow rings in the earth under the lamp ---
    c.lineCap = 'butt';
    for (let i = 0; i < RINGS.length; i++) { const u = (t - RINGS[i]) / (i === RINGS.length - 1 ? 2.6 : 2.2); if (u < 0 || u > 1) continue;
      const big = i === RINGS.length - 1 ? 1.7 : 1, rad = (24 + u * 300 * big) * (H / 1080);
      c.beginPath(); c.ellipse(LX, GY + 2, rad, rad * .5, 0, 0, Math.PI); c.strokeStyle = 'rgb(255,198,124)'; c.globalAlpha = (1 - u) * (1 - u) * .42 * (big > 1 ? 1.3 : 1); c.lineWidth = 2.6 * (1 - u) + .5; c.stroke(); }

    // --- the ground line, brightest under the lamp ---
    const lineA = .55 + grown * .45 + pulseUp * .4;
    const hg = c.createLinearGradient(0, 0, W, 0); hg.addColorStop(0, 'rgba(246,176,98,.06)'); hg.addColorStop(LXF * .62, 'rgba(249,190,112,.32)'); hg.addColorStop(LXF, 'rgba(255,233,184,1)'); hg.addColorStop(Math.min(.99, LXF + .2), 'rgba(249,190,112,.35)'); hg.addColorStop(1, 'rgba(246,176,98,.1)');
    c.globalAlpha = Math.min(1, lineA); c.fillStyle = hg; c.fillRect(0, GY - .7, W, 1.4);
    c.globalAlpha = .35 * lineA; c.fillRect(0, GY - 2.5, W, 5);
    // a pool of light right at the lamp's foot, where it presses
    c.globalAlpha = Math.min(1, .5 + grown * .35 + pulseUp * .5 + c01 * breath * .25); const zf = 120 + grown * 40 + pulseUp * 120 + c01 * breath * 30; c.drawImage(E.SP.hot, LX - zf / 2, GY - zf * .32, zf, zf * .64);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  } });

// where each root is letting go: a short bright stretch at the edge and a hot point (fire travelling down the root)
function burnEdges(c) {
  c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.strokeStyle = 'rgb(255,214,150)';
  for (let k = 0; k < 3; k++) { c.beginPath(); let n = 0;
    for (const r of roots) { const P = r.P; if (r.rel <= 0 || r.rel >= P.length - 1) continue; const w = P[r.rel].w, wk = w < 1.4 ? 0 : w < 4 ? 1 : 2; if (wk !== k) continue;
      const j0 = r.rel, j1 = Math.min(P.length - 1, r.rel + 7); c.moveTo(P[j0].x, P[j0].y); for (let j = j0 + 1; j <= j1; j++) c.lineTo(P[j].x, P[j].y); n++; }
    if (n) { c.globalAlpha = [.18, .3, .3][k]; c.lineWidth = [3, 7, 14][k]; c.stroke(); c.globalAlpha = [.45, .75, .8][k]; c.lineWidth = [1.2, 2.6, 5][k]; c.stroke(); } }
  for (const r of roots) { const P = r.P; if (r.lv > 2 || r.rel <= 0 || r.rel >= P.length - 1) continue; const p = P[r.rel]; c.globalAlpha = .9; dot(c, 'hot', p.x, p.y, 10 + Math.min(20, p.w * 3)); }
}
// embers: born where a root lets go; they sink, wander and cool (physics on the dt clock)
function stepEmbers(E, t, dt, c) {
  if (!embers.length) return;
  const k = dt * 60, tt = t * .25;
  if (c) { c.globalCompositeOperation = 'lighter'; }
  for (let i = embers.length - 1; i >= 0; i--) { const e = embers[i]; e.l += dt; if (e.l > e.m) { embers[i] = embers[embers.length - 1]; embers.pop(); continue; }
    if (k > 0) { const a = E.noise(e.x * .011, e.y * .011 + tt) * 12.56; e.vx += Math.cos(a) * .03 * k; e.vy += (Math.sin(a) * .03 + .006) * k; const dmp = Math.pow(.972, k); e.vx *= dmp; e.vy *= dmp; e.x += e.vx * k; e.y += e.vy * k; if (e.y < GY + 3) { e.y = GY + 3; e.vy = Math.abs(e.vy) * .4; } }
    if (c) { const u = e.l / e.m, al = (1 - u) * (1 - u), z = e.z * (1 + u * .5); c.globalAlpha = al; dot(c, u < .3 ? 'hot' : 'emb', e.x, e.y, z); } }
}
// the root layer drawn again, additively, inside a soft ring around the lamp's foot (centre radius r, half-width bw)
function ringLight(c, r, bw, a) {
  if (a <= 0) return; c.globalCompositeOperation = 'lighter';
  const sy = Math.max(0, GY - 30), sh = H - sy;
  for (const [f, al] of [[1, .45], [.5, .7]]) { const r0 = Math.max(0, r - bw * f), r1 = r + bw * f * .45; if (r1 <= 0) continue;
    c.save(); c.beginPath(); c.arc(LX, GY, r1, 0, TAU); if (r0 > 0) c.arc(LX, GY, r0, 0, TAU, true); c.clip();
    c.globalAlpha = Math.min(1, a * al); c.drawImage(rootC, 0, sy * DPR, W * DPR, sh * DPR, 0, sy, W, sh); c.restore(); }
}
function dot(c, k, x, y, z) { const i = cl(Math.round(z) - 2, 0, 40), n = Math.max(2, Math.round((i + 2) * DPR)), d = n / DPR;
  c.drawImage(SPR, i * SPR.cell, k === 'hot' ? 0 : SPR.cell, n, n, Math.round((x - d / 2) * DPR) / DPR, Math.round((y - d / 2) * DPR) / DPR, d, d); }
function ss01(a, b, x) { const t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
})();
