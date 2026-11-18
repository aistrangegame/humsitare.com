/* Anahata · The Heart · OPEN.
   The wall card's yantra in plan, brought to life: the lamp stands on the base of the upward triangle in the innermost
   court; two interlocking triangles, woven over and under; a first wall of twelve doors; a lotus wall of twelve petals,
   each open at its tip; one outer ring with eleven doors. At first every door is shut and the light is held in the court.
   The heartbeat (paired rings, lub-dub) was always playing and passes through everything. Then the doors open, wall by
   wall, and the light goes out only where the doors line up: five long shafts into the night. */
(() => {
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const RC = 130, W1 = { r: 138, t: 16, door: 38 }, LOT = { rb: 151, rt: 199, t: 10, door: 24 }, W3 = { r: 222, t: 12, door: 40 };
const LONG = [30, 60, 90, 120, 330], SHADE = [15, 75, 135, 195, 225, 285], A = 15 * DEG, A1 = W1.door / W1.r / 2;
const RCACHE = 238;                       // card units covered by the cached wall layers (radius)
const petal = u => LOT.rb + (LOT.rt - LOT.rb) * (.7 * (1 - Math.pow(1 - u, 2.3)) + .3 * u * u * u);
const P = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (c1, c2, t) => c1.map((v, i) => v + (c2[i] - v) * t);
const rgb = (c, a) => 'rgba(' + c.map(v => Math.round(cl(v, 0, 255))).join(',') + ',' + (a == null ? 1 : a) + ')';
const ease = x => { x = cl(x, 0, 1); return x * x * (3 - 2 * x); };
const easeIO = x => { x = cl(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
// beat: lub-dub, period P, as a soft envelope 0..1 (pure function of t)
const BEAT = 1.7, DUB = .27;
const bump = (x, w) => Math.exp(-(x * x) / (2 * w * w));
const beat = t => { const ph = ((t % BEAT) + BEAT) % BEAT; return Math.max(bump(ph - .05, .07), .7 * bump(ph - .05 - DUB, .07), bump(ph - BEAT - .05, .07)); };

let G = null;      // geometry (card units, centre 0,0)
let L = null;      // layout + caches for the current stage size

function sectorPath(p, r0, r1, a0, a1) { const s = P(r0, a0); p.moveTo(s[0], s[1]); p.arc(0, 0, r1, a0, a1); p.arc(0, 0, r0, a1, a0, true); p.closePath(); }

function buildGeometry(E) {
  const R2 = E.rand(20261121 + 7);
  const g = { panels: [], stones: [], faces: { w1: [], lot: [], w3: [] }, doors: [], star: [], petalBeams: new Path2D(), tipBeams: new Path2D(), A2: 0 };
  const shade = t => mix([52, 104, 58], [27, 62, 38], t), light = t => mix([236, 204, 128], [150, 170, 96], t);
  const stone = (path, lit, t, tag) => { const v = (R2() - .5) * .16;
    g.stones.push({ path, tag, lit, dark: shade(t).map(x => x * (1 + v)), litc: mix(shade(t), light(t), lit * .74).map(x => x * (1 + v)) }); };
  const face = (path, tag) => g.faces[tag].push(path);
  function door(h, tx, ty, nx, ny, len, lit, t, tag, ang) {
    const phi = (54 + R2() * 24) * DEG;
    g.doors.push({ h, tx, ty, nx, ny, len, lit, t, tag, ang, phi, o: (lit ? 1 : .66) * (1 - t * .3) });
  }
  function ring(w, doors, litHalf, t, tag) {
    const hw = w.door / w.r / 2, ds = doors.slice().sort((a, b) => a.c - b.c);
    ds.forEach((d, i) => {
      const nx = ds[(i + 1) % ds.length], a0 = d.c * DEG + hw; let a1 = nx.c * DEG - hw; if (a1 < a0) a1 += TAU;
      const n = Math.max(1, Math.round((a1 - a0) * w.r / (30 + t * 8)));
      const isLit = a => { if (!litHalf) return 1; const m = ((a / DEG) % 30 + 30) % 30, dd = Math.min(m, 30 - m) * DEG; return dd < litHalf ? 1 : 0; };
      for (let j = 0; j < n; j++) {
        const b0 = a0 + (a1 - a0) * j / n, b1 = a0 + (a1 - a0) * (j + 1) / n; let lit = 0;
        for (let q = 0; q <= 8; q++) lit += isLit(b0 + (b1 - b0) * q / 8);
        const p = new Path2D(); sectorPath(p, w.r - w.t / 2, w.r + w.t / 2, b0, b1); stone(p, lit / 9, t, tag);
      }
      const rf = w.r - w.t / 2 + .7;
      if (!litHalf) { const p = new Path2D(); const s = P(rf, a0); p.moveTo(s[0], s[1]); p.arc(0, 0, rf, a0, a1); face(p, tag); }
      else for (let k = 0; k < 12; k++) for (const off of [0, TAU]) {
        const c = k * 30 * DEG + off, s0 = Math.max(a0, c - litHalf), s1 = Math.min(a1, c + litHalf);
        if (s1 > s0) { const p = new Path2D(); const s = P(rf, s0); p.moveTo(s[0], s[1]); p.arc(0, 0, rf, s0, s1); face(p, tag); }
      }
      g.panels.push({ tag, ang: d.c, a0: d.c * DEG - hw, a1: d.c * DEG + hw, r0: w.r - w.t / 2 + .6, r1: w.r + w.t / 2 - .6, lit: d.lit, col: shade(t), lc: mix(shade(t), light(t), .7) });
      [[d.c * DEG - hw, 1], [d.c * DEG + hw, -1]].forEach(([a, s]) =>
        door(P(w.r, a), -Math.sin(a) * s, Math.cos(a) * s, Math.cos(a), Math.sin(a), w.door / 2 - 1.2, d.lit, t, tag, d.c));
    });
  }
  // 1. the court: two interlocking triangles, woven over and under
  const TA = [270, 30, 150].map(d => P(RC, d * DEG)), TB = [90, 210, 330].map(d => P(RC, d * DEG));
  const edges = T => [0, 1, 2].map(i => [T[i], T[(i + 1) % 3]]);
  const X = (e, f) => { const [p, q] = e, [r, s] = f, d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
    const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d, u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
    return (t > 0 && t < 1 && u > 0 && u < 1) ? { t, u } : null; };
  const EA = edges(TA), EB = edges(TB), under = { a: [[], [], []], b: [[], [], []] };
  EA.forEach((e, i) => { const cs = []; EB.forEach((f, j) => { const x = X(e, f); if (x) cs.push({ j, t: x.t, u: x.u }); }); cs.sort((m, n) => m.t - n.t);
    cs.forEach((c, k) => { if (k % 2) under.a[i].push(c.t); else under.b[c.j].push(c.u); }); });
  const segs = (e, gaps) => { const Ln = Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]), gg = 6.5 / Ln, cuts = gaps.slice().sort((m, n) => m - n); let t0 = 0; const out = [];
    for (const c of cuts) { out.push([t0, c - gg]); t0 = c + gg; } out.push([t0, 1]); return out; };
  // the star traces itself from the apex of each triangle; store edges with their pieces
  EA.forEach((e, i) => g.star.push({ e, pieces: segs(e, under.a[i]), k: i }));
  EB.forEach((e, i) => g.star.push({ e, pieces: segs(e, under.b[i]), k: i }));
  // 2. the first wall: twelve doors
  ring(W1, Array.from({ length: 12 }, (_, i) => ({ c: i * 30, lit: 1 })), 0, 0, 'w1');
  // 3. the lotus wall: twelve petals, each open at its tip
  let A2 = 0;
  for (let k = 0; k < 12; k++) {
    const th = k * 30 * DEG, tip = P(LOT.rt, th), M = 44;
    const C = (s, u) => P(petal(u), th + s * A * (1 - u));
    let uc = 1; for (let u = 1; u > 0; u -= .002) { const c = C(1, u); if (Math.hypot(c[0] - tip[0], c[1] - tip[1]) >= LOT.door / 2) { uc = u; break; } }
    A2 = A * (1 - uc); const uLit = 1 - A1 / A;
    // the light that fills the petal, and the shaft that leaves by its tip
    { const p = g.petalBeams, s = P(W1.r + W1.t / 2 - 1, th - A1); p.moveTo(s[0], s[1]);
      for (let q = 0; q <= 24; q++) { const dl = -A1 + 2 * A1 * q / 24, pp = P(petal(1 - Math.abs(dl) / A), th + dl); p.lineTo(pp[0], pp[1]); }
      const e = P(W1.r + W1.t / 2 - 1, th + A1); p.lineTo(e[0], e[1]); p.closePath(); }
    sectorPath(g.tipBeams, LOT.rt - 6, W3.r - W3.t / 2 + 1, th - A2, th + A2);
    for (const s of [-1, 1]) {
      const pts = [];
      for (let j = 0; j <= M; j++) { const u = uc * j / M, c = C(s, u), c0 = C(s, Math.max(0, u - .004)), c1 = C(s, Math.min(1, u + .004));
        let tx = c1[0] - c0[0], ty = c1[1] - c0[1]; const m = Math.hypot(tx, ty); tx /= m; ty /= m; pts.push({ c, n: [-ty * s, tx * s], u }); }
      let len = 0; const cum = [0]; for (let j = 1; j <= M; j++) { len += Math.hypot(pts[j].c[0] - pts[j - 1].c[0], pts[j].c[1] - pts[j - 1].c[1]); cum.push(len); }
      const nb = Math.max(2, Math.round(len / 19)), h = LOT.t / 2; let j0 = 0;
      for (let b = 1; b <= nb; b++) { let j1 = j0; while (j1 < M && cum[j1] < len * b / nb - 1e-6) j1++;
        const p = new Path2D();
        for (let j = j0; j <= j1; j++) { const x = pts[j].c[0] + pts[j].n[0] * h, y = pts[j].c[1] + pts[j].n[1] * h; j === j0 ? p.moveTo(x, y) : p.lineTo(x, y); }
        for (let j = j1; j >= j0; j--) p.lineTo(pts[j].c[0] - pts[j].n[0] * h, pts[j].c[1] - pts[j].n[1] * h);
        p.closePath(); const um = (pts[j0].u + pts[j1].u) / 2; stone(p, cl((um - uLit) / .12 + .5, 0, 1), .22, 'lot'); j0 = j1; }
      const fp = new Path2D(); let any = false;
      pts.forEach(q => { if (q.u >= uLit) { const x = q.c[0] + q.n[0] * (h - .7), y = q.c[1] + q.n[1] * (h - .7); any ? fp.lineTo(x, y) : fp.moveTo(x, y); any = true; } });
      if (any) face(fp, 'lot');
      const e = pts[M].c, Ln = Math.hypot(tip[0] - e[0], tip[1] - e[1]);
      door(e, (tip[0] - e[0]) / Ln, (tip[1] - e[1]) / Ln, Math.cos(th), Math.sin(th), LOT.door / 2 - .8, 1, .22, 'lot', k * 30);
    }
  }
  g.A2 = A2;
  // 4. the outer ring: the light stops on it, or leaves by a door
  ring(W3, LONG.map(c => ({ c, lit: 1 })).concat(SHADE.map(c => ({ c, lit: 0 }))), A2, .3, 'w3');
  // door timing: each wall opens as a wave from the bottom door (90 deg) round both sides
  const T0 = { w1: 10.4, lot: 14.4, w3: 18.3 }, SPREAD = { w1: 2.0, lot: 1.8, w3: 1.8 }, DUR = { w1: 3.0, lot: 2.6, w3: 3.2 };
  for (const d of g.panels) { let da = Math.abs(((d.ang - 90) % 360 + 540) % 360 - 180); d.t0 = T0[d.tag] + SPREAD[d.tag] * da / 180; d.dur = DUR[d.tag]; }
  for (const d of g.doors) { let da = Math.abs(((d.ang - 90) % 360 + 540) % 360 - 180); d.t0 = T0[d.tag] + SPREAD[d.tag] * da / 180; d.dur = DUR[d.tag]; }
  // motes: they drift outward in the five long shafts
  const RM = E.rand(911);
  g.motes = Array.from({ length: 84 }, () => {
    const b = Math.floor(RM() * LONG.length);
    return { th: LONG[b] * DEG + (RM() * 2 - 1) * A2 * .9, r0: RM(), sp: 5 + RM() * 9, sz: 2.2 + RM() * 4.5, ph: RM() * TAU, tw: .25 + RM() * .5 };
  });
  return g;
}

function layout(E) {
  const W = E.W, H = E.H, DPR = E.DPR, U = Math.min(W / 1920, H / 1080);
  const k = 1.42 * U, cx = W * .685, cy = H * .465;
  const l = { W, H, DPR, U, k, cx, cy };
  // the clearing for the words (CSS px): the block sits at x .065..~.5, y .585..~.9
  l.tx0 = 0; l.tx1 = W * .50; l.ty0 = H * .55; l.ty1 = H; l.tsoft = 260 * U;
  const sp = (stops, n) => E.sprite(stops, n);
  // the night, its pool of green light round the yantra, and the calm clearing for the words: one baked layer
  const bg = document.createElement('canvas'); bg.width = Math.round(W * DPR); bg.height = Math.round(H * DPR);
  { const c = bg.getContext('2d'); c.scale(DPR, DPR);
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d2216'); gr.addColorStop(.45, '#0c2015'); gr.addColorStop(1, '#08160e');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    const pool = sp([[0, 'rgba(94,154,69,.62)'], [.2, 'rgba(60,128,64,.46)'], [.48, 'rgba(37,106,56,.27)'], [.78, 'rgba(27,85,48,.11)'], [1, 'rgba(27,85,48,0)']], 512);
    const R = 640 * k; c.globalAlpha = .8; c.drawImage(pool, cx - R, cy - R, 2 * R, 2 * R);
    const dark = sp([[0, 'rgba(5,14,9,.8)'], [.55, 'rgba(5,14,9,.5)'], [1, 'rgba(5,14,9,0)']], 256);
    c.globalAlpha = 1; const ex = W * .26, ey = H * .76, rx = W * .38, ry = H * .38; c.drawImage(dark, ex - rx, ey - ry, 2 * rx, 2 * ry); }
  l.bg = bg;
  l.haloS = sp([[0, 'rgba(255,190,96,.80)'], [.22, 'rgba(255,178,74,.48)'], [.45, 'rgba(243,162,58,.22)'], [.75, 'rgba(201,178,74,.07)'], [1, 'rgba(157,178,74,0)']], 256);
  { const R = Math.round(215 * k), hc = document.createElement('canvas'); hc.width = hc.height = Math.round(2 * R * DPR);
    hc.getContext('2d').drawImage(l.haloS, 0, 0, hc.width, hc.height); l.halo = hc; l.haloR = R; }
  l.mote = sp([[0, 'rgba(255,240,200,1)'], [.35, 'rgba(255,214,140,.45)'], [1, 'rgba(255,200,120,0)']], 32);
  // the walls, cached as four states: shut and dark; the first wall lit from inside; the petals filled; the outer ring lit
  const S = Math.ceil(2 * RCACHE * k * DPR);
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    x.setTransform(S / (2 * RCACHE), 0, 0, S / (2 * RCACHE), S / 2, S / 2); return [c, x]; };
  const beamFill = x => { const gr = x.createRadialGradient(0, 0, 0, 0, 0, 230); gr.addColorStop(.6, 'rgba(255,220,146,.36)'); gr.addColorStop(1, 'rgba(255,217,138,.26)'); return gr; };
  const stones = (x, lit) => { x.strokeStyle = '#07140c'; x.lineWidth = .8; x.lineJoin = 'round';
    for (const s of G.stones) { const on = s.lit > 0 && lit[s.tag]; x.fillStyle = rgb(on ? s.litc : s.dark); x.fill(s.path); x.stroke(s.path); }
    x.lineCap = 'round';
    for (const tag of ['w1', 'lot', 'w3']) if (lit[tag]) {
      x.strokeStyle = 'rgba(255,184,90,.26)'; x.lineWidth = 5; for (const f of G.faces[tag]) x.stroke(f);
      x.strokeStyle = '#FFEDBE'; x.lineWidth = 1.5; for (const f of G.faces[tag]) x.stroke(f); } };
  const falloff = (x, a) => { x.save(); x.globalCompositeOperation = 'source-atop'; const gr = x.createRadialGradient(0, 0, RC, 0, 0, RCACHE);
    gr.addColorStop(0, 'rgba(8,22,14,0)'); gr.addColorStop(1, 'rgba(8,22,14,' + a + ')'); x.fillStyle = gr; x.fillRect(-RCACHE, -RCACHE, 2 * RCACHE, 2 * RCACHE); x.restore(); };
  l.st = [
    { lit: {}, pet: 0, tip: 0, f: .55 }, { lit: { w1: 1 }, pet: 0, tip: 0, f: .45 },
    { lit: { w1: 1, lot: 1 }, pet: 1, tip: 0, f: .3 }, { lit: { w1: 1, lot: 1, w3: 1 }, pet: 1, tip: 1, f: .18 }
  ].map(o => { const [c, x] = mk();
    if (o.pet) { x.fillStyle = beamFill(x); x.fill(G.petalBeams); }
    if (o.tip) { x.fillStyle = beamFill(x); x.fill(G.tipBeams); }
    stones(x, o.lit); falloff(x, o.f); return c; });
  l.cacheDev = S; l.cacheSize = S / DPR;
  return l;
}

// how far a point is from the word clearing: 0 inside .. 1 well outside
function clearFade(x, y) {
  const l = L, dx = Math.max(l.tx0 - x, 0, x - l.tx1), dy = Math.max(l.ty0 - y, 0, y - l.ty1);
  return ease(Math.hypot(dx, dy) / l.tsoft);
}

let lastEnd = -1;
FILM.scene({
  id: 'anahata', dur: 32, text: { x: .065, y: .585, w: .42, align: 'left' },
  lamp(t) {
    const W = innerWidth, H = innerHeight, U = Math.min(W / 1920, H / 1080), k = 1.42 * U;
    // the flame stands on the base of the upward triangle; it grows a little as the doors open
    return { x: W * .685, y: H * .465 + RC / 2 * k, s: 1.6 * U * (1 + .04 * ease((t - 17) / 7)) };
  },
  init(E) { if (!G) G = buildGeometry(E); L = layout(E); lastEnd = -1; },
  draw(E, t, dt) {
    // The picture is a pure function of t. When the engine fast-forwards (seek replays dt steps back to back in one
    // task), the in-between pictures are never shown, so they are skipped; the shown frame (dt = 0, or a live frame) is drawn.
    const now = performance.now();
    if (E.seeking) { lastEnd = now; return; }
    if (!L || L.W !== E.W || L.H !== E.H || L.DPR !== E.DPR) L = layout(E);
    const c = E.ctx, l = L, k = l.k, cx = l.cx, cy = l.cy, DPR = E.DPR;
    const loc = () => c.setTransform(DPR * k, 0, 0, DPR * k, DPR * cx, DPR * cy);
    const scr = () => c.setTransform(DPR, 0, 0, DPR, 0, 0);
    const arrive = ease(t / 3.2), bt = beat(t);
    // the arc
    const lit1 = ease((t - 1.5) / 6.5);            // the lamp lights the first wall from inside
    const lit2 = ease((t - 12) / 4.5);             // the first doors are open: the petals fill
    const lit3 = ease((t - 16.6) / 4);             // the petals open at their tips: the outer ring is lit where they line up
    const grow = easeIO((t - 19.6) / 4.8);         // the outer doors open: five long shafts go out into the night
    const swell = 1 + .22 * bump(t - 22.8, 1.7);   // the peak
    const settle = 1 - .14 * ease((t - 25) / 5);   // and it settles, still breathing

    // ---- night, the pool, the clearing (baked)
    scr(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.drawImage(l.bg, 0, 0, l.W, l.H);
    // ---- the five long shafts, going out where the doors line up
    if (grow > 0) {
      loc(); c.globalCompositeOperation = 'lighter';
      const reach = 250 + 360 * grow, A2 = G.A2, inten = grow * swell * settle * (1 + .05 * bt), r0 = W3.r - W3.t / 2;
      for (const d of LONG) {
        const th = d * DEG;
        let re = reach;   // a shaft fades before it reaches the words
        for (let r = W3.r + 10; r < reach; r += 8) { const p = P(r, th); if (clearFade(cx + p[0] * k, cy + p[1] * k) < .5) { re = r; break; } }
        const o = r0 / re;
        for (const [wk, aa] of [[1.1, .38], [.66, .55], [.3, .7]]) {
          const gr = c.createRadialGradient(0, 0, 0, 0, 0, re);
          gr.addColorStop(o, 'rgba(255,217,138,' + (.42 * aa * inten).toFixed(3) + ')'); gr.addColorStop(o + (1 - o) * .45, 'rgba(242,214,138,' + (.2 * aa * inten).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(230,216,138,0)');
          c.globalAlpha = 1; c.fillStyle = gr; c.beginPath(); sectorPath(c, r0, re, th - A2 * wk, th + A2 * wk); c.fill();
        }
      }
      scr();
    }
    c.globalCompositeOperation = 'source-over';

    // ---- the sound: paired rings, lub-dub, always playing, passing through everything
    {
      const amp = 1.6 * arrive * (.45 + .25 * ease((t - 4) / 8) + .3 * grow) * settle;
      const v = 80 * l.U, life = 7.6, R0 = 100 * k, LV = 6;
      const nNew = Math.floor(t / BEAT), N = Math.ceil(life / BEAT) + 1;
      c.strokeStyle = '#DCEFC0';
      for (let i = nNew - N; i <= nNew; i++) for (const first of [1, 0]) {
        const te = i * BEAT + .05 + (first ? 0 : DUB), age = t - te; if (age <= 0 || age > life) continue;
        const r = R0 + v * age * (1 + .12 * age / life);
        const a = amp * (first ? .8 : .5) * Math.pow(1 - age / life, 1.3) * ease(age / .45) * (1 - .5 * ease((r - 220 * k) / (560 * k)));
        if (a < .012) continue;
        c.lineWidth = (first ? 1.3 : .95) * k;
        // solid-ink arcs (cheap), split into runs of equal fade where the ring passes near the words
        const n = 90; let a0 = 0, q0 = Math.round(clearFade(cx + r, cy) * 5) / 5;
        for (let j = 1; j <= n; j++) {
          const aa = j / n * TAU, q = j === n ? -1 : Math.round(clearFade(cx + r * Math.cos(aa), cy + r * Math.sin(aa)) * 5) / 5;
          if (q !== q0) { if (q0 > 0) { c.globalAlpha = Math.min(1, a * q0); c.beginPath(); c.arc(cx, cy, r, a0, aa + (j === n ? 0 : .004)); c.stroke(); } a0 = aa; q0 = q; }
        }
      }
      c.globalAlpha = 1;
    }

    // ---- the walls (cached states, crossfaded)
    {
      const cs = l.cacheSize, x0 = Math.round(cx * DPR - l.cacheDev / 2) / DPR, y0 = Math.round(cy * DPR - l.cacheDev / 2) / DPR;
      const stage = lit3 > 0 ? [2, lit3] : lit2 > 0 ? [1, lit2] : [0, lit1];
      c.globalAlpha = arrive; c.drawImage(l.st[stage[0]], x0, y0, cs, cs);
      if (stage[1] > 0) { c.globalAlpha = arrive * stage[1]; c.drawImage(l.st[stage[0] + 1], x0, y0, cs, cs); }
      c.globalAlpha = 1;
    }

    // ---- the court: two triangles traced from their apexes, woven over and under; the ledge the lamp stands on
    loc(); c.lineCap = 'round';
    {
      const prog = d => ease((t - 2 - d) / 5.5);
      c.beginPath();
      for (const s of G.star) {
        const p = prog(s.k * .45); if (p <= 0) continue;
        const [a, b] = s.e;
        for (const [u0, u1] of s.pieces) { const e1 = Math.min(u1, p); if (e1 <= u0) continue;
          c.moveTo(a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0); c.lineTo(a[0] + (b[0] - a[0]) * e1, a[1] + (b[1] - a[1]) * e1); }
      }
      c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,184,90,' + (.28 * arrive * (.9 + .2 * bt)).toFixed(3) + ')'; c.lineWidth = 5; c.stroke();
      c.globalCompositeOperation = 'source-over'; c.strokeStyle = 'rgba(255,241,204,' + (.88 * arrive).toFixed(3) + ')'; c.lineWidth = 1.4; c.stroke();
      const yb = RC / 2, xb = RC * Math.cos(30 * DEG), gl = c.createLinearGradient(-xb, 0, xb, 0);
      gl.addColorStop(0, 'rgba(249,190,112,.5)'); gl.addColorStop(.5, 'rgba(255,233,184,1)'); gl.addColorStop(1, 'rgba(249,190,112,.5)');
      c.globalAlpha = arrive; c.strokeStyle = gl; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-xb, yb); c.lineTo(xb, yb); c.stroke(); c.globalAlpha = 1;
    }

    // ---- the shut doors: a panel fills each doorway until its leaves begin to swing
    {
      const part = [];
      for (const tag of ['w1', 'w3']) {
        let full = 0; const lv = tag === 'w1' ? lit1 : 0;
        for (const pn of G.panels) { if (pn.tag !== tag) continue;
          const op = (t - pn.t0) / pn.dur, a = 1 - ease(op * 3); if (a <= 0) continue;
          if (!full) { full = 1; c.fillStyle = rgb(mix(pn.col.map(v => v * (tag === 'w3' ? .62 : .8)), pn.lc, lv * .85)); }
          if (a < 1) { part.push(pn, a); continue; }
          if (full === 1) { c.beginPath(); full = 2; } sectorPath(c, pn.r0, pn.r1, pn.a0, pn.a1); }
        if (full === 2) { c.globalAlpha = arrive; c.fill(); }
        for (let i = 0; i < part.length; i += 2) { const pn = part[i]; c.globalAlpha = part[i + 1] * arrive; c.beginPath(); sectorPath(c, pn.r0, pn.r1, pn.a0, pn.a1); c.fill(); }
        part.length = 0;
      }
      c.globalAlpha = 1;
    }
    // ---- the doors: two leaves each, swinging outward on their hinges
    {
      const lit = { w1: lit1, lot: lit2, w3: lit3 }, groups = {};
      for (const d of G.doors) {
        const op = easeIO((t - d.t0) / d.dur), q = d.phi * op;
        const key = d.tag + (d.lit ? 'L' : 'D'), gp = groups[key] || (groups[key] = { leaves: [], swings: [], d });
        gp.leaves.push(d.h[0], d.h[1], d.h[0] + (Math.cos(q) * d.tx + Math.sin(q) * d.nx) * d.len, d.h[1] + (Math.cos(q) * d.ty + Math.sin(q) * d.ny) * d.len);
        if (op > .02) gp.swings.push(d, q);
      }
      c.lineCap = 'round';
      for (const key in groups) {
        const gp = groups[key], d = gp.d, isLit = d.lit, lv = lit[d.tag], o = d.o * arrive * (isLit ? .5 + .5 * lv : .75);
        if (gp.swings.length) {
          c.strokeStyle = '#E6DDAA'; c.lineWidth = .7; c.globalAlpha = o * (isLit ? .5 : .42); c.beginPath();
          for (let i = 0; i < gp.swings.length; i += 2) { const dd = gp.swings[i], qq = gp.swings[i + 1];
            for (let s = 0; s <= 8; s++) { const a = qq * s / 8, x = dd.h[0] + (Math.cos(a) * dd.tx + Math.sin(a) * dd.nx) * dd.len, y = dd.h[1] + (Math.cos(a) * dd.ty + Math.sin(a) * dd.ny) * dd.len; s ? c.lineTo(x, y) : c.moveTo(x, y); } }
          c.stroke();
        }
        const L4 = gp.leaves;
        c.beginPath(); for (let i = 0; i < L4.length; i += 4) { c.moveTo(L4[i], L4[i + 1]); c.lineTo(L4[i + 2], L4[i + 3]); }
        if (isLit) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = o * .24 * lv; c.strokeStyle = '#FFB85A'; c.lineWidth = 6.5; c.stroke(); c.globalCompositeOperation = 'source-over'; }
        c.globalAlpha = o; c.lineWidth = 2.7;
        const dim = mix([150, 190, 120], [112, 160, 106], d.t);
        c.strokeStyle = rgb(isLit ? mix(dim, mix([255, 232, 170], [236, 214, 150], d.t), .3 + .7 * lv) : dim); c.stroke();
      }
      c.globalAlpha = 1;
    }

    // ---- the lamp's halo over the court, breathing with the heart
    scr(); c.globalCompositeOperation = 'lighter';
    { const R = l.haloR; c.globalAlpha = arrive * (.36 + .1 * bt) * (.92 + .08 * swell * lit1); c.drawImage(l.halo, Math.round((cx - R) * DPR) / DPR, Math.round((cy + 10 * k - R) * DPR) / DPR, l.halo.width / DPR, l.halo.height / DPR); }
    // ---- motes drifting outward in the long shafts
    if (grow > 0) {
      const reach = 250 + 360 * grow, span = 560;
      for (const m of G.motes) {
        const r = W3.r + 8 + ((m.r0 * span + m.sp * t) % span);
        if (r > reach) continue;
        const x = cx + r * Math.cos(m.th) * k, y = cy + r * Math.sin(m.th) * k, f = clearFade(x, y); if (f <= 0) continue;
        const a = grow * settle * f * Math.pow(Math.max(0, 1 - (r - W3.r) / (reach - W3.r + 1)), 1.1) * (.55 + m.tw * Math.sin(t * .9 + m.ph)) * ease((r - W3.r - 8) / 30);
        if (a <= .01) continue;
        const sz = m.sz * k * 1.15; c.globalAlpha = Math.min(1, a); c.drawImage(l.mote, x - sz, y - sz, 2 * sz, 2 * sz);
      }
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    lastEnd = performance.now();
  }
});
})();
