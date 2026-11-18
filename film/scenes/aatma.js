/* Aatma · The Soul Revealed — verb HOLD.
   The wall card's world: the innermost triangle of the Sri Yantra, point down, with the bindu at its heart. No line draws it.
   Fifty-two straight threads are strung across a hoop, each held at both ends, each only touching the triangle and passing on.
   Around the hoop: eight petals, sixteen petals, the square with four gates. Along the foot, fifty-two small lamps walk out together.
   Arc: the yantra is faintly there from the start (what you discover you always were); the lamp's light runs down the axis,
   draws the hoop, strings the fifty-two threads one by one (the triangle appears as the space they all touch), traces the
   petals and the square; at the peak every thread is held: light runs in from both knots to the triangle, the triangle fills,
   the bindu wakes; a drop of light falls through the lower gate and fifty-two lamps walk out along the foot; then it rests.
   Objects and light only. Everything is a pure function of t (no accumulated state), so seeking is exact. */
(() => {
const TAU = Math.PI * 2;
const C = {};                     // layout + caches, rebuilt in init
const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const ramp = (a, b, t) => sm((t - a) / (b - a));
// card geometry (card units, centred on the bindu)
const R = 150, RT = 78, RHO = 2.5, P8 = 176, P16 = 194, SQ = 205, GATE = SQ + 9 + 11;

function lerp(a, b, t) { return a + (b - a) * t; }

function mkCanvas(w, h, dpr) { const c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); return c; }

// ---- the yantra's still structure, drawn once into small offscreen layers (local card units, scaled)
function structLayer(E, which) {
  const B = C.B, dpr = E.DPR, cv = mkCanvas(B, B, dpr), x = cv.getContext('2d');
  x.setTransform(dpr * C.k, 0, 0, dpr * C.k, B * dpr / 2, B * dpr / 2);
  const lit = x.createLinearGradient(0, -GATE - 6, 0, GATE + 6);
  lit.addColorStop(0, '#FFF1C8'); lit.addColorStop(.33, '#F0C766'); lit.addColorStop(.72, '#C2952F'); lit.addColorStop(1, '#8E6A1C');
  x.strokeStyle = lit; x.lineJoin = 'miter'; x.lineCap = 'round';
  const petals = (n, r1, r2, rot) => { x.beginPath(); for (let i = 0; i < n; i++) { const a0 = rot + i * TAU / n, a1 = a0 + TAU / n, am = (a0 + a1) / 2, w = TAU / n;
      const P = (r, a) => [r * Math.cos(a), r * Math.sin(a)], rc = lerp(r1, r2, .62);
      const s = P(r1, a0), c1 = P(rc, a0 + w * .04), c2 = P(lerp(r1, r2, .86), am - w * .2), m = P(r2, am), c3 = P(lerp(r1, r2, .86), am + w * .2), c4 = P(rc, a1 - w * .04), e = P(r1, a1);
      x.moveTo(s[0], s[1]); x.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], m[0], m[1]); x.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], e[0], e[1]); } };
  const circ = (r, w, a = 1) => { x.globalAlpha = a; x.lineWidth = w; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke(); x.globalAlpha = 1; };
  const glowStroke = (fn, w) => { x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = 'rgba(247,185,76,.10)'; x.lineWidth = w; fn(); x.stroke(); x.restore(); };
  const gate = (s, a, e, d1, d2) => { x.beginPath(); for (let k = 0; k < 4; k++) { const c = Math.cos(k * TAU / 4), sn = Math.sin(k * TAU / 4);
      const P = [[-s, -s], [-a, -s], [-a, -s - d1], [-a - e, -s - d1], [-a - e, -s - d1 - d2], [a + e, -s - d1 - d2], [a + e, -s - d1], [a, -s - d1], [a, -s], [s, -s]];
      P.forEach((p, i) => { const X = p[0] * c - p[1] * sn, Y = p[0] * sn + p[1] * c; (k === 0 && i === 0) ? x.moveTo(X, Y) : x.lineTo(X, Y); }); } x.closePath(); };
  if (which === 'hoop' || which === 'all') {
    glowStroke(() => { x.beginPath(); x.arc(0, 0, R, 0, TAU); }, 7);
    circ(R, 1.9);
  }
  if (which === 'p8' || which === 'all') {
    petals(8, R, P8, -TAU / 4 - TAU / 16); x.fillStyle = 'rgba(226,168,58,.11)'; x.fill(); x.lineWidth = 1.25; x.stroke();
    circ(P8, 1.05);
  }
  if (which === 'p16' || which === 'all') {
    petals(16, P8, P16, -TAU / 4 - TAU / 32); x.fillStyle = 'rgba(226,168,58,.075)'; x.fill(); x.lineWidth = 1.1; x.stroke();
    circ(P16, 1.25); circ(P16 + 3.5, .85, .8);
  }
  if (which === 'sq' || which === 'all') {
    gate(SQ, 30, 16, 9, 11); x.lineWidth = 1.55; x.stroke();
    gate(SQ - 6, 24, 16, 9, 11); x.globalAlpha = .8; x.lineWidth = .85; x.stroke(); x.globalAlpha = 1;
  }
  return cv;
}

function lamp(t) {
  const W = innerWidth, H = innerHeight, k = H / 1080 * 1.45;
  const cx = W * .705, cy = H * .585, hy = cy - (596 - 336 + 6) * k;
  return { x: cx, y: hy - 2 * Math.sin(t * .35) + 3 * ramp(18, 22, t), s: 1.22 * H / 1080 + .04 * ramp(18.5, 21.5, t) };
}

FILM.scene({
  id: 'aatma', dur: 32,
  text: { x: .055, y: .40, w: .42, align: 'left' },
  lamp,
  init(E) {
    const W = E.W, H = E.H, k = H / 1080 * 1.45;
    Object.assign(C, { W, H, k, CX: W * .705, CY: H * .585, B: Math.ceil((GATE + 12) * 2 * k) });
    C.HY = C.CY - (596 - 336 + 6) * k;                 // horizon = the flame's base
    C.FY = H * .958;                                   // the foot row
    C.GY = C.CY + GATE * k;                            // foot of the lower gate
    const { CX, CY, HY, FY } = C;  // eslint-disable-line

    // ---- the ground: night of gold, the horizon, a quiet vignette
    const bg = mkCanvas(W, H, E.DPR), g = bg.getContext('2d'); g.setTransform(E.DPR, 0, 0, E.DPR, 0, 0);
    let gr = g.createLinearGradient(0, 0, 0, HY); gr.addColorStop(0, '#120d03'); gr.addColorStop(1, '#251a05'); g.fillStyle = gr; g.fillRect(0, 0, W, HY);
    gr = g.createLinearGradient(0, HY, 0, H); gr.addColorStop(0, '#2c2006'); gr.addColorStop(.3, '#211805'); gr.addColorStop(.7, '#181104'); gr.addColorStop(1, '#100b02'); g.fillStyle = gr; g.fillRect(0, HY, W, H - HY);
    gr = g.createRadialGradient(CX, CY, H * .2, CX, CY, W * .95); gr.addColorStop(0, 'rgba(6,4,1,0)'); gr.addColorStop(1, 'rgba(6,4,1,.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    C.bg = bg;

    // sprites
    C.pool = E.sprite([[0, 'rgba(217,165,52,.55)'], [.3, 'rgba(176,126,28,.28)'], [.65, 'rgba(122,86,16,.10)'], [1, 'rgba(122,86,16,0)']], 256);
    C.halo = E.sprite([[0, 'rgba(255,192,78,.5)'], [.4, 'rgba(233,161,44,.18)'], [.75, 'rgba(201,138,30,.05)'], [1, 'rgba(201,138,30,0)']], 256);
    C.bind = E.sprite([[0, 'rgba(255,248,226,1)'], [.12, 'rgba(255,233,168,.8)'], [.4, 'rgba(242,182,70,.28)'], [1, 'rgba(242,182,70,0)']], 256);
    C.spark = E.sprite([[0, 'rgba(255,252,236,1)'], [.2, 'rgba(255,226,150,.7)'], [.55, 'rgba(247,170,60,.18)'], [1, 'rgba(247,170,60,0)']], 64);
    C.mg = E.sprite([[0, 'rgba(255,184,74,.55)'], [.45, 'rgba(240,140,40,.16)'], [1, 'rgba(240,130,40,0)']], 64);

    // the small lamp flame (the card's #mini teardrop), with its gradient
    { const fw = 40, fh = 70, cv = mkCanvas(fw, fh, 2), x = cv.getContext('2d'), s = fh / 200;
      x.setTransform(2 * s, 0, 0, 2 * s, fw, 0); x.translate(-780, -154);
      const fl = x.createRadialGradient(780, 300, 0, 780, 300, 150);
      fl.addColorStop(0, '#FFFDF2'); fl.addColorStop(.28, '#FFEFB4'); fl.addColorStop(.6, '#FFC95E'); fl.addColorStop(1, '#F28A22');
      x.fillStyle = fl; x.beginPath(); x.moveTo(796.8, 158); x.bezierCurveTo(787.8, 204.6, 835.6, 235.6, 835.6, 292.5); x.bezierCurveTo(835.6, 327.4, 811, 352, 780, 352);
      x.bezierCurveTo(749, 352, 724.4, 327.4, 724.4, 293.8); x.bezierCurveTo(724.4, 262.8, 749, 245.9, 765.8, 220.1); x.bezierCurveTo(778.7, 200.7, 790.3, 181.3, 796.8, 158); x.fill();
      C.mini = cv; C.miniAR = fw / fh; }

    // ---- structure layers
    C.L = { all: structLayer(E, 'all'), hoop: structLayer(E, 'hoop'), p8: structLayer(E, 'p8'), p16: structLayer(E, 'p16'), sq: structLayer(E, 'sq') };

    { const g = C.bg.getContext('2d'), LP = lamp(0), LX = LP.x, LY = LP.y; g.setTransform(E.DPR, 0, 0, E.DPR, 0, 0);
      g.globalCompositeOperation = 'lighter';
      g.save(); g.beginPath(); g.rect(0, HY, W, H - HY); g.clip(); const pw = 1180 * k, ph = pw * .82; g.globalAlpha = .9; g.drawImage(C.pool, LX - pw * .5, LY - ph * .5, pw, ph); g.restore();
      const hw = 560 * k; g.globalAlpha = .85; g.drawImage(C.halo, LX - hw / 2, LY - hw * .62, hw, hw);
      g.globalCompositeOperation = 'source-over';
      const hg = g.createLinearGradient(0, 0, W, 0); hg.addColorStop(0, 'rgba(243,203,106,0)'); hg.addColorStop(.35, 'rgba(243,203,106,.22)'); hg.addColorStop(LX / W, 'rgba(255,226,150,.85)'); hg.addColorStop(1, 'rgba(243,203,106,.25)');
      g.strokeStyle = hg; g.lineWidth = 1.2; g.globalAlpha = .8; g.beginPath(); g.moveTo(0, HY + .5); g.lineTo(W, HY + .5); g.stroke();
      g.globalAlpha = .12; g.drawImage(C.L.all, CX - C.B / 2, CY - C.B / 2, C.B, C.B); g.globalAlpha = 1; }

    // ---- the fifty-two threads (exactly the card's construction)
    const V = [90, 210, 330].map(a => [(RT - 2 * RHO) * Math.cos(a * Math.PI / 180), (RT - 2 * RHO) * Math.sin(a * Math.PI / 180)]);
    const th = [], side = [270, 390, 510], per = [16, 17, 16];
    for (let q = 0; q < 3; q++) { th.push(side[q]); for (let j = 1; j <= per[q]; j++) th.push(side[q] + 120 * j / (per[q] + 1)); }
    const T0 = 6.6, DT = .2, TD = .72;
    C.T = th.map((deg, i) => { const a = deg * Math.PI / 180, n = [Math.cos(a), Math.sin(a)]; let v = V[0], best = -1e9;
      for (const p of V) { const s = p[0] * n[0] + p[1] * n[1]; if (s > best) { best = s; v = p; } }
      const c = best + RHO, d = [-n[1], n[0]], half = Math.sqrt(R * R - c * c), m = [n[0] * c, n[1] * c];
      const A = [m[0] - d[0] * half, m[1] - d[1] * half], Bp = [m[0] + d[0] * half, m[1] + d[1] * half];
      const tp = [v[0] + n[0] * RHO, v[1] + n[1] * RHO];
      const fwd = i % 2 === 0;                          // the shuttle goes back and forth, like a hand stringing a loom
      return { n, c, a: fwd ? A : Bp, b: fwd ? Bp : A, tp, t0: T0 + i * DT, t1: T0 + i * DT + TD }; });
    if (C.T.length !== 52) throw new Error('aatma: thread count ' + C.T.length);
    // beads where threads cross, inside the hoop; each appears when its later thread is held
    const bd = [];
    for (let i = 0; i < 52; i++) for (let j = i + 1; j < 52; j++) { const a = C.T[i], b = C.T[j], det = a.n[0] * b.n[1] - a.n[1] * b.n[0]; if (Math.abs(det) < .05) continue;
      const x = (a.c * b.n[1] - b.c * a.n[1]) / det, y = (a.n[0] * b.c - b.n[0] * a.c) / det; if (Math.hypot(x, y) > R - 3) continue;
      const v = Math.min(1, Math.max(0, 1.06 - (y + R) / (2 * R) * .5)); bd.push([x, y, .55 + .9 * v, Math.max(a.t1, b.t1)]); }
    bd.sort((p, q) => p[3] - q[3]); C.beads = bd;
    C.TRI = V;

    // ---- fifty-two lamps: their places on the foot, and who walks out first (farthest first, both ways)
    const x0 = W * .045, x1 = W * .955, rc = Math.min(40, (FY - C.GY) * .6);
    const slots = []; for (let i = 0; i < 52; i++) slots.push(lerp(x0, x1, i / 51));
    const mL = CX - x0, mR = x1 - CX;   // both ways at once: each side in order of how far it has to go
    const order = slots.map(x => ({ x, d: Math.abs(x - CX), f: Math.abs(x - CX) / (x < CX ? mL : mR) })).sort((p, q) => q.f - p.f);
    const v = 560 * W / 1920, ta = .45;
    C.lamps = order.map((o, k) => { const dv = Math.max(0, FY - C.GY - rc), arc = Math.PI * rc / 2, dh = Math.max(0, o.d - rc);
      const r2 = Math.min(rc, o.d), dv2 = Math.max(0, FY - C.GY - r2), arc2 = Math.PI * r2 / 2, dh2 = Math.max(0, o.d - r2);
      return { x: o.x, side: Math.sign(o.x - CX) || 1, dv: dv2, arc: arc2, dh: dh2, len: dv2 + arc2 + dh2, t0: 21.95 + k * .088, v, ta, rc: Math.max(1e-3, r2), ph: (k * 2.399) % TAU }; });

    // ---- motes in the lamp's light
    const r = E.rand(5252); C.motes = [];
    for (let i = 0; i < 70; i++) C.motes.push({ x: CX + (r() - .5) * 2 * 520 * k, y: r(), sp: 10 + r() * 16, w: 14 + r() * 26, f: .05 + r() * .12, s: 3 + r() * 5, p: r() * TAU });
    C.grad = new Map(); C.thr = mkCanvas(C.B, C.B, E.DPR); C.thrN = 0; C.nbC = 0; C.thrLit = null; C.full = null; C.glow = null;
  },

  draw(E, t, dt) {
    const c = E.ctx, { W, H, k, CX, CY, HY, FY, GY, B } = C;
    const lp = lamp(t), LX = lp.x, LY = lp.y;
    // per-context gradients (local card units)
    let G = C.grad.get(c);
    if (!G) { const lit = c.createLinearGradient(0, -R, 0, R); lit.addColorStop(0, '#FFFBEA'); lit.addColorStop(.3, '#FBE3A6'); lit.addColorStop(.62, '#E8B95C'); lit.addColorStop(1, '#A87C26');
      const tri = c.createRadialGradient(0, 0, 0, 0, 0, RT); tri.addColorStop(0, 'rgba(255,240,196,.95)'); tri.addColorStop(.45, 'rgba(250,196,96,.45)'); tri.addColorStop(1, 'rgba(230,150,50,.08)');
      G = { lit, tri }; C.grad.set(c, G); }

    const arrive = ramp(0, 3.2, t);
    const hold = ramp(18.2, 21.2, t);                       // the peak
    const breathe = .5 + .5 * Math.sin((t - 24) * .9);
    const settle = ramp(26, 30, t);

    // ---- ground
    c.drawImage(C.bg, 0, 0, W, H);                          // ground, the lamp's pool and halo, the horizon, the ghost yantra: baked once

    // ---- the yantra: faintly there from the first moment, then lit by the lamp
    const bx = CX - B / 2, by = CY - B / 2;

    // the axis: light runs down from the flame to the top of the hoop
    const ax = ramp(2.4, 4.6, t), topY = CY - R * k;
    if (ax > 0) { const yb = lerp(HY, topY, ax);
      c.strokeStyle = 'rgba(255,239,192,.85)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(CX, HY); c.lineTo(CX, yb); c.stroke();
      c.globalCompositeOperation = 'lighter';
      if (ax < 1) E.put(C.spark, CX, yb, 46 * k, .9);
      c.globalCompositeOperation = 'source-over'; }

    // sweeps: each ring is lit from the top, down both sides, meeting at the bottom
    const sweep = (layer, a0, a1, rr, front) => { const p = ramp(a0, a1, t); if (p <= 0) return;
      c.save(); if (p < 1) { c.beginPath(); c.moveTo(CX, CY); c.arc(CX, CY, B, -Math.PI / 2 - p * Math.PI - .001, -Math.PI / 2 + p * Math.PI + .001); c.closePath(); c.clip(); }
      c.drawImage(layer, bx, by, B, B); c.restore();
      if (front && p < 1) { const fa = Math.sin(Math.PI * p); c.globalCompositeOperation = 'lighter';
        for (const s of [-1, 1]) { const a = -Math.PI / 2 + s * p * Math.PI; E.put(C.spark, CX + Math.cos(a) * rr * k, CY + Math.sin(a) * rr * k, 40 * k, .85 * fa); }
        c.globalCompositeOperation = 'source-over'; } };
    const T = C.T; let nDone = 0;
    // finished threads live in a cache, added to as each is tied (redrawn from zero if time ever runs backwards)
    for (const th of T) if (t >= th.t1) nDone++;
    if (nDone < C.thrN) { const x = C.thr.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, C.thr.width, C.thr.height); C.thrN = 0; C.nbC = 0; C.full = null; C.glow = null; }
    if (nDone > C.thrN) { const x = C.thr.getContext('2d'), dpr = C.thr.width / B;
      x.setTransform(dpr * k, 0, 0, dpr * k, B * dpr / 2, B * dpr / 2);
      if (!C.thrLit) { C.thrLit = x.createLinearGradient(0, -R, 0, R); C.thrLit.addColorStop(0, '#FFFBEA'); C.thrLit.addColorStop(.3, '#FBE3A6'); C.thrLit.addColorStop(.62, '#E8B95C'); C.thrLit.addColorStop(1, '#A87C26'); }
      x.beginPath(); for (let i = C.thrN; i < nDone; i++) { x.moveTo(T[i].a[0], T[i].a[1]); x.lineTo(T[i].b[0], T[i].b[1]); }
      x.globalCompositeOperation = 'lighter'; x.strokeStyle = 'rgba(247,185,76,1)'; x.globalAlpha = .1; x.lineWidth = 4.6; x.stroke();
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = .85; x.strokeStyle = C.thrLit; x.lineWidth = 1.35; x.stroke();
      x.setLineDash([2.1, 3.3]); x.strokeStyle = '#FFFBEC'; x.globalAlpha = .3; x.lineWidth = .8; x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
      // the beads where these threads cross earlier ones, and the knots that hold them
      const tl = T[nDone - 1].t1; let nb = C.nbC; while (nb < C.beads.length && C.beads[nb][3] <= tl) nb++;
      x.beginPath(); for (let i = C.nbC; i < nb; i++) { const b = C.beads[i], r = b[2] * .62; x.rect(b[0] - r, b[1] - r, r * 2, r * 2); }
      x.fillStyle = C.thrLit; x.globalAlpha = .9; x.fill(); x.globalAlpha = 1; C.nbC = nb;
      x.beginPath(); for (let i = C.thrN; i < nDone; i++) for (const q of [T[i].a, T[i].b]) { x.moveTo(q[0] + 2.2, q[1]); x.arc(q[0], q[1], 2.2, 0, TAU); }
      x.fillStyle = '#FFE9B0'; x.fill(); x.strokeStyle = 'rgba(122,86,16,.9)'; x.lineWidth = .5; x.stroke();
      C.thrN = nDone; }
    const knotsPaint = x => { x.fillStyle = '#FFE9B0'; x.fill(); x.strokeStyle = 'rgba(122,86,16,.9)'; x.lineWidth = .5; x.stroke(); };
    // once everything is strung, the whole figure (structure, threads, beads, knots) is one cached picture
    const FULL = nDone === 52 && t >= 17.6, GLOW = FULL && t >= 21.6;   // after the bindu wakes, all the glow is one cached picture
    if (FULL && !C.full) { const f = document.createElement('canvas'); f.width = C.thr.width; f.height = C.thr.height; const x = f.getContext('2d');
      x.drawImage(C.L.all, 0, 0, f.width, f.height); x.drawImage(C.thr, 0, 0); C.full = f; }
    const tens = 1 + .55 * hold * (1 - .35 * settle) + .1 * breathe * settle;   // held: the threads are taut and bright
    const bloom = hold * (1 - .55 * settle) + .08 * breathe * settle;            // the whole figure blooms at the hold, then rests warm
    if (FULL) {
      c.drawImage(C.full, bx, by, B, B);
      if (GLOW) { if (!C.glow) { const f = C.full, g = document.createElement('canvas'); g.width = f.width; g.height = f.height; const x = g.getContext('2d'), d = f.width / B, m = f.width / 2;
          x.globalCompositeOperation = 'lighter'; x.globalAlpha = .62; x.drawImage(f, 0, 0);
          x.globalAlpha = .7; x.drawImage(C.pool, m - 235 * k * d, m - 235 * k * d, 470 * k * d, 470 * k * d);
          x.globalAlpha = .55; x.drawImage(C.bind, m - 175 * k * d, m - 175 * k * d, 350 * k * d, 350 * k * d); C.glow = g; }
        c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, bloom * (1 + .04 * Math.sin(t * 1.3))); c.drawImage(C.glow, bx, by, B, B); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
      const ba = GLOW ? 0 : Math.min(1, .32 * bloom + (tens - 1) * .7);
      if (ba > .005) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = ba; c.drawImage(C.full, bx, by, B, B); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
    } else {
      if (t >= 16.6) c.drawImage(C.L.all, bx, by, B, B); else {
        sweep(C.L.hoop, 4.4, 6.7, R, true);
        sweep(C.L.p8, 8.6, 11.8, P8, true);
        sweep(C.L.p16, 10.6, 14.2, P16, true);
        sweep(C.L.sq, 12.8, 16.6, 0, false); }
      if (nDone) c.drawImage(C.thr, bx, by, B, B);
    }

    // ---- the threads
    c.save(); c.translate(CX, CY); c.scale(k, k);
    // the one being strung: a shuttle of light carries it across
    c.globalCompositeOperation = 'lighter';
    for (const th of T) { if (t <= th.t0 || t >= th.t1 + .5) continue;
      const u = sm(Math.min(1, (t - th.t0) / (th.t1 - th.t0))), x = lerp(th.a[0], th.b[0], u), y = lerp(th.a[1], th.b[1], u);
      if (u < 1) { c.strokeStyle = G.lit; c.globalAlpha = 1; c.lineWidth = 1.5; c.beginPath(); c.moveTo(th.a[0], th.a[1]); c.lineTo(x, y); c.stroke();
        c.globalAlpha = .95; c.drawImage(C.spark, x - 16, y - 16, 32, 32); }
      const fl = 1 - Math.min(1, (t - th.t1) / .5);            // the knot flares as it is tied
      if (t >= th.t1) { c.globalAlpha = .9 * fl; c.drawImage(C.spark, th.b[0] - 14, th.b[1] - 14, 28, 28); }
      c.globalAlpha = .7 * Math.min(1, (t - th.t0) * 4) * (t < th.t1 ? 1 : fl); c.drawImage(C.spark, th.a[0] - 10, th.a[1] - 10, 20, 20); }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    // the knot of the thread now being strung (finished ones are in the cache)
    c.beginPath(); let nk = 0; for (const th of T) { if (t < th.t0 || t >= th.t1) continue; c.moveTo(th.a[0] + 2.2, th.a[1]); c.arc(th.a[0], th.a[1], 2.2, 0, TAU); nk++; }
    if (nk) knotsPaint(c);

    // ---- HOLD: from both knots, light runs in along every thread to the place it touches the triangle
    c.globalCompositeOperation = 'lighter';
    if (t > 18 && t < 21.4) for (let i = 0; i < 52; i++) { const th = T[i], s0 = 18.1 + (i % 13) * .035;
      const u = (t - s0) / 1.9; if (u <= 0 || u >= 1.15) continue; const e = sm(Math.min(1, u)), fa = u < 1 ? Math.min(1, u * 5) : 1 - (u - 1) / .15;
      const fb = fa * (1 - .8 * sm((e - .55) / .45));          // each pulse thins as it reaches the triangle, so the corners never clot
      for (const p of [th.a, th.b]) { const x = lerp(p[0], th.tp[0], e), y = lerp(p[1], th.tp[1], e);
        const x2 = lerp(p[0], th.tp[0], Math.max(0, e - .16)), y2 = lerp(p[1], th.tp[1], Math.max(0, e - .16));
        c.globalAlpha = .55 * fb; c.strokeStyle = 'rgba(255,236,180,1)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x, y); c.stroke();
        c.globalAlpha = .5 * fb; c.drawImage(C.spark, x - 6, y - 6, 12, 12); } }
    // the triangle fills with light (no line draws it: only its inside glows)
    const tf = ramp(19.6, 21.4, t) * (1 - .25 * settle + .12 * breathe * settle);
    if (tf > 0) { const V = C.TRI; c.beginPath(); c.moveTo(V[0][0], V[0][1]); c.lineTo(V[1][0], V[1][1]); c.lineTo(V[2][0], V[2][1]); c.closePath();
      c.fillStyle = G.tri; c.globalAlpha = .55 * tf; c.fill(); c.globalAlpha = 1; }
    c.restore();
    // the bindu
    const bi = ramp(19.9, 21.6, t), bp = 1 + .08 * Math.sin(t * 1.3);
    c.globalCompositeOperation = 'lighter';
    if (bi > 0) { if (!GLOW) E.put(C.bind, CX, CY, (90 + 260 * bi) * k * bp, .55 * bi); E.put(C.bind, CX, CY, 46 * k, .9 * bi); }
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#FFFBEA'; c.globalAlpha = .35 + .65 * Math.max(ramp(5, 9, t) * .5, bi); c.beginPath(); c.arc(CX, CY, 4.6 * k, 0, TAU); c.fill(); c.globalAlpha = 1;
    if (bloom > 0 && !GLOW) { c.globalCompositeOperation = 'lighter'; E.put(C.pool, CX, CY, 470 * k, .7 * bloom); c.globalCompositeOperation = 'source-over'; }

    // ---- a drop of light falls from the bindu through the lower gate, and the lamps walk out
    const dr = ramp(21.0, 22.2, t);
    if (dr > 0) { const yb = lerp(CY + 6 * k, FY, dr);
      const lg = c.createLinearGradient(0, CY, 0, FY); lg.addColorStop(0, 'rgba(255,239,192,.75)'); lg.addColorStop(1, 'rgba(240,190,90,.35)');
      c.strokeStyle = lg; c.lineWidth = 1.3; c.globalAlpha = 1 - .75 * settle; c.beginPath(); c.moveTo(CX, CY + 6 * k); c.lineTo(CX, yb); c.stroke(); c.globalAlpha = 1;
      if (dr < 1) { c.globalCompositeOperation = 'lighter'; E.put(C.spark, CX, yb, 50 * k, 1); c.globalCompositeOperation = 'source-over'; } }
    // the foot line, lit as the lamps pass along it
    const fo = ramp(21.8, 24, t);
    if (fo > 0) { const fg = c.createLinearGradient(0, 0, W, 0); fg.addColorStop(0, 'rgba(194,149,47,.0)'); fg.addColorStop(.06, 'rgba(194,149,47,.55)'); fg.addColorStop(CX / W, 'rgba(240,200,110,.85)'); fg.addColorStop(.94, 'rgba(194,149,47,.55)'); fg.addColorStop(1, 'rgba(194,149,47,0)');
      const span = W * .5 * ramp(21.9, 25.2, t);
      c.save(); c.beginPath(); c.rect(CX - span, FY, span * 2, 8); c.clip();
      c.strokeStyle = fg; c.lineWidth = 1; c.globalAlpha = .8 * fo; c.beginPath(); c.moveTo(0, FY + 4.5); c.lineTo(W, FY + 4.5); c.stroke(); c.restore(); c.globalAlpha = 1; }
    if (t > 21.9) {
      const lh = 30 * H / 1080, lw = lh * C.miniAR;
      for (const L of C.lamps) { const tau = t - L.t0; if (tau <= 0) continue;
        // same speed for all (no overtaking), easing out of the gate and into each one's place
        const free = L.v * (tau < L.ta ? tau * tau / (2 * L.ta) : tau - L.ta / 2), d0 = 140 * W / 1920, rem = (L.len - free) / d0;
        const s = L.len - d0 * (rem >= 1 ? rem - .5 : rem > 0 ? rem * rem / 2 : 0);
        let x, y; if (s < L.dv) { x = CX; y = GY + s; } else if (s < L.dv + L.arc) { const a = (s - L.dv) / L.rc; x = CX + L.side * (L.rc - L.rc * Math.cos(a)); y = GY + L.dv + L.rc * Math.sin(a); }
        else { x = CX + L.side * (L.rc + (s - L.dv - L.arc)); y = FY; }
        const moving = Math.min(1, Math.max(0, rem)), born = sm(Math.min(1, tau / .5));
        y -= Math.abs(Math.sin(tau * 7 + L.ph)) * 2.4 * moving * H / 1080;          // a small walking lift
        const fl = 1 + .07 * Math.sin(t * 3.1 + L.ph) + .05 * Math.sin(t * 5.3 + L.ph * 1.7);
        c.globalCompositeOperation = 'lighter';
        E.put(C.mg, x, y - lh * .3, lh * 3.6, born * (.75 + .25 * fl));
        c.globalAlpha = .45 * born; c.drawImage(C.mg, x - lh * 1.6, FY + 2 - lh * .22, lh * 3.2, lh * .55);   // its pool on the foot line
        c.globalCompositeOperation = 'source-over';
        const hh = lh * fl * born, ww = lw * (2 - fl) * born; c.globalAlpha = born; c.drawImage(C.mini, x - ww / 2, y - hh, ww, hh); c.globalAlpha = 1; } }

    // ---- motes drifting up through the light
    const ma = arrive * (.6 + .4 * hold);
    if (ma > 0) { c.globalCompositeOperation = 'lighter';
      for (const m of C.motes) { let y = 1 - (((m.y + t * m.sp / H)) % 1); y = HY - 90 * k + y * (FY - HY + 60 * k);
        const x = m.x + Math.sin(t * m.f * TAU * .4 + m.p) * m.w;
        const d = Math.hypot(x - LX, (y - LY) * 1.2) / (520 * k), l = Math.max(0, 1 - d), db = Math.max(0, 1 - Math.hypot(x - CX, y - CY) / (300 * k)) * hold;
        const a = ma * (l * l * .7 + db * .6) * (.6 + .4 * Math.sin(t * 1.7 + m.p)); if (a < .02) continue;
        E.put(C.spark, x, y, m.s * 2.2, a); }
      c.globalCompositeOperation = 'source-over'; }
  }
});
})();
