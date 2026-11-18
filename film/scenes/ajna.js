/* Ajna · The Third Eye — STILL.
   The wall card's world: a new-moon sky over still violet water; the great lamp on the far shore; a ring of
   eighteen small lamps on the water (nine and nine about the axis); inside it the third eye, Ajna's two petals
   as one almond outline, closed, then opening.
   Arc: the lamp lands and the water is stirred (rings run out from its base, every reflection breaks) ·
   a bead of its light runs both ways round the ring and lights the eighteen, pair by pair, while the water slowly calms ·
   STILL (18–24 s): the water goes perfectly flat, every flame stands upright, the sky appears whole in the water,
   and the eye opens on its own, full of stars · it rests, breathing, while the next scene comes. */
(() => {
const N = 18, EP = .62, TAU = Math.PI * 2;
let G = null;                       // geometry + cached layers, built in init

function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

FILM.scene({ id: 'ajna', dur: 32,
  text: { x: .05, y: .5, w: .37, align: 'left' },
  lamp(t) { const W = innerWidth, H = innerHeight, u = Math.min(W / 1920, H / 1080);
    return { x: W * .65, y: H * .385 + 2 * u - 3 * u * Math.sin(t * .2) * (1 - E_ss(16, 20, t)), s: 1.32 }; },

  init(E) {
    const W = E.W, H = E.H, D = E.DPR, u = Math.min(W / 1920, H / 1080), R = E.rand(20261121);
    const K = 1.17, HY = H * .385, CX = W * .65, CY = HY + 214 * u * K, RX = 478 * u * K, RY = 196 * u * K;
    const EY = CY - 17 * u * K, EA = 447 * u * K, EH = 160 * u * K;
    const g = G = { K, W, H, D, u, HY, CX, CY, RX, RY, EY, EA, EH };
    // the clearing where the words sit (lower left)
    const TX1 = W * .44, TY0 = H * .46;
    const inText = (x, y) => x < TX1 && y > TY0;
    const textDim = (x, y) => 1 - .72 * E.ss(TX1 + 90 * u, TX1 - 40 * u, x) * E.ss(TY0 - 60 * u, TY0 + 30 * u, y);

    // ---- the eighteen lamps: still ring, pairs mirrored about the axis
    const lamps = [];
    for (let i = 0; i < N; i++) { const a = (i + .5) / N * TAU, x = CX + RX * Math.sin(a), y = CY - RY * Math.cos(a), tt = (y - (CY - RY)) / (2 * RY);
      const pair = Math.min(i, N - 1 - i);         // 0 = nearest the great lamp, 8 = the bottom
      lamps.push({ i, a, x, y, t: tt, s: (.62 + .62 * tt) * u * K * 1.12, pair, ph: R() * 100 }); }
    lamps.sort((p, q) => p.y - q.y);
    g.lamps = lamps;
    // the bead of light runs from the top of the ring down both sides; lamp k lights as it passes
    g.beadT0 = 5.2; g.beadT1 = 15.6;
    for (const l of lamps) { const ang = l.a <= Math.PI ? l.a : TAU - l.a; l.ang = ang; l.on = g.beadT0 + (g.beadT1 - g.beadT0) * (ang / Math.PI); }

    // ---- background: sky, stars, water (static)
    const bg = g.bg = mk(W * D, H * D), b = bg.getContext('2d'); b.scale(D, D);
    let gr = b.createLinearGradient(0, 0, 0, HY); gr.addColorStop(0, '#0b0820'); gr.addColorStop(1, '#1d1647');
    b.fillStyle = gr; b.fillRect(0, 0, W, HY + 1);
    gr = b.createLinearGradient(0, HY, 0, H); gr.addColorStop(0, '#30246a'); gr.addColorStop(.1, '#241b54'); gr.addColorStop(.34, '#18123c'); gr.addColorStop(.66, '#110c2a'); gr.addColorStop(1, '#0c081d');
    b.fillStyle = gr; b.fillRect(0, HY, W, H - HY);
    // stars: a new-moon sky; most fixed here, the brightest kept aside to breathe
    const stars = [], tw = [];
    let n = 0, tries = 0;
    while (n < 260 && tries < 9000) { tries++;
      const x = R() * W, y = R() * (HY - 10 * u), m = R(), r = (.5 + Math.pow(m, 3.2) * 1.7) * u * 1.15, o = .3 + R() * .6, wm = R() < .12;
      if (Math.hypot(x - CX, (y - (HY - 90 * u)) * .9) < 170 * u) continue;
      const oo = o * (.5 + .5 * (1 - y / HY));
      stars.push({ x, y, r, o: oo, wm }); n++;
      if (r > 1.25 * u && tw.length < 26) tw.push({ x, y, r, o: oo, wm, ph: R() * TAU, sp: .25 + R() * .35 });
      else { b.fillStyle = wm ? '#FFE6B8' : '#D9D2FF'; b.globalAlpha = oo; b.beginPath(); b.arc(x, y, r, 0, TAU); b.fill(); } }
    b.globalAlpha = 1; g.tw = tw;

    // ---- the still water's light layer (everything the water reflects), in water-space: y from HY to H
    const WH = H - HY; g.WH = WH;
    const near = (x, y, d) => { for (const l of lamps) if (Math.abs(x - l.x) < d * l.s / u && y > l.y - 52 * l.s && y < l.y + 62 * l.s) return true; return false; };
    const inRing = (x, y, px, py) => Math.pow((x - CX) / (RX + px), 2) + Math.pow((y - CY) / (RY + py), 2) < 1;
    // level lines of the surface, closer together toward the far shore; lit near the lamp, dim at the words
    const lines = g.lines = mk(W * D, WH * D), lc = lines.getContext('2d'); lc.scale(D, D); lc.translate(0, -HY);
    lc.lineCap = 'round'; lc.lineWidth = 1.05 * u; const LB = {};
    for (let k = 0, y = HY + 7 * u; y < H; k++) { y += (5 + Math.min(k * 2.3, 34)) * u;
      const o0 = .08 + .3 * Math.max(0, 1 - (y - HY) / (560 * u));
      let x = 0;
      while (x < W) { const len = (40 + R() * 240) * u, gap = (14 + R() * 70) * u, x1 = Math.min(W, x + len);
        for (let xx = x; xx < x1; xx += 8 * u) { const xm = xx + 4 * u;
          if (near(xm, y, 24) || (inRing(xm, y, 14 * u, 20 * u) && y > HY + 30 * u)) continue;
          const lit = .45 + .75 * Math.exp(-Math.pow((xm - CX) / (620 * u), 2)), al = Math.round(o0 * lit * textDim(xm, y) * 100) / 100;
          lc.strokeStyle = 'rgba(167,155,234,' + al + ')';
          lc.beginPath(); lc.moveTo(xx, y); lc.lineTo(Math.min(x1, xx + 8 * u), y); lc.stroke();
          const bk = LB[al] || (LB[al] = []), last = bk[bk.length - 1], xe = Math.min(x1, xx + 8 * u);
          if (last && last[2] === y && Math.abs(last[1] - xx) < .01) last[1] = xe; else bk.push([xx, xe, y]); }
        x = x1 + gap; } }
    g.LB = Object.keys(LB).map(a => ({ a: +a, st: 'rgba(167,155,234,' + a + ')', d: LB[a] })).filter(b => b.a > 0);
    // the great lamp's own path on the water
    lc.lineWidth = 1; g.path = [];
    for (let k = 0, y = HY + 6 * u; k < 11; k++) { const t2 = k / 10, w = 120 * u * (1 - .6 * t2);
      lc.strokeStyle = 'rgba(255,226,166,' + (.85 * (1 - t2) * (1 - t2) + .05).toFixed(3) + ')'; lc.lineWidth = (2 - .9 * t2) * u;
      lc.beginPath(); lc.moveTo(CX - w / 2, y); lc.lineTo(CX + w / 2, y); lc.stroke(); g.path.push([CX - w / 2, CX + w / 2, y, lc.strokeStyle, lc.lineWidth]); y += (5 + k * .7) * u; }
    // the sky mirrored in the still water (appears whole only when the water is still)
    g.mirS = []; const mir = mk(W * D, WH * D), mc = mir.getContext('2d'); mc.scale(D, D); mc.translate(0, -HY);
    for (const s of stars.concat(tw)) { const my = 2 * HY - s.y + (HY - s.y) * 1.75, mo = s.o * .5 * Math.max(0, 1 - (my - HY) / (1000 * u));
      if (my > H - 4 || mo < .04 || near(s.x, my, 34) || inRing(s.x, my, 16 * u, 16 * u)) continue;
      mc.fillStyle = s.wm ? '#FFE6B8' : '#D9D2FF'; mc.globalAlpha = mo * textDim(s.x, my);
      mc.fillRect(s.x - s.r * 1.6, my - s.r * .45, s.r * 3.2, s.r * .9); g.mirS.push([s.x - s.r * 1.6, my - s.r * .45, s.r * 3.2, s.r * .9, mc.globalAlpha, mc.fillStyle]); }
    mc.globalAlpha = 1;
    // each small lamp's stack of level dashes, on its own small canvas (they light one by one)
    const xs = lamps.map(l => l.x), xMin = Math.min(...xs), xMax = Math.max(...xs);
    for (const l of lamps) { const s = l.s, outer = (l.x === xMin || l.x === xMax);
      const x0 = l.x - 26 * s, y0 = l.y + 4 * s, y1 = outer ? H : l.y + 120 * s, cw = 52 * s, ch = y1 - y0;
      const c = l.refl = mk(cw * D, ch * D), q = c.getContext('2d'); q.scale(D, D); q.translate(-x0, -y0); q.lineCap = 'round';
      l.rx = x0; l.ry = y0 - HY; l.rw = cw; l.rh = ch; l.d = [];
      const nd = Math.round(6 + 5 * l.t); let y = l.y + 7 * s;
      for (let k = 0; k < nd; k++) { const t2 = k / (nd - 1), w = (20 - 13 * t2) * s * (k % 2 ? .82 : 1);
        q.strokeStyle = t2 < .4 ? '#FFDC9A' : '#F0B07A'; q.globalAlpha = (.7 * (1 - t2) + .06) * (.75 + .25 * l.t);
        q.lineWidth = (1.35 - .45 * t2) * Math.max(.85 * u, s); q.beginPath(); q.moveTo(l.x - w / 2, y); q.lineTo(l.x + w / 2, y); q.stroke();
        l.d.push([l.x - w / 2, l.x + w / 2, y, q.strokeStyle, q.globalAlpha, q.lineWidth]);
        y += (3.1 + k * .62) * s; }
      if (outer) { let yy = l.y + 64 * s, k = 0;          // the outermost lamps throw their light the length of the water
        while (yy < H) { const t2 = (yy - l.y) / (H - l.y), w = (15 - 8 * t2) * u * (k % 2 ? .8 : 1);
          q.strokeStyle = '#F0B88A'; q.globalAlpha = (.45 * (1 - t2) * (1 - t2) + .06) * textDim(l.x, yy); q.lineWidth = (1.1 - .4 * t2) * u;
          q.beginPath(); q.moveTo(l.x - w / 2, yy); q.lineTo(l.x + w / 2, yy); q.stroke(); l.d.push([l.x - w / 2, l.x + w / 2, yy, q.strokeStyle, q.globalAlpha, q.lineWidth]); yy += (7 + k * .42) * u; k++; } }
      q.globalAlpha = 1; }
    // the frame the water is composed in each frame (then laid down in rippling strips)


    // ---- sprites
    const S = g.S = {};
    S.pool = E.sprite([[0, 'rgba(232,140,116,.62)'], [.07, 'rgba(176,98,158,.36)'], [.17, 'rgba(124,88,176,.19)'], [.5, 'rgba(106,84,180,.10)'], [1, 'rgba(91,78,142,0)']], 512);
    S.halo = E.sprite([[0, 'rgba(255,178,74,.55)'], [.36, 'rgba(238,124,72,.2)'], [.7, 'rgba(154,88,168,.08)'], [1, 'rgba(106,84,180,0)']], 256);
    S.sh = E.sprite([[0, 'rgba(255,197,106,.62)'], [.35, 'rgba(242,138,74,.24)'], [1, 'rgba(192,90,138,0)']], 128);
    S.sw = E.sprite([[0, 'rgba(255,200,120,.55)'], [1, 'rgba(232,138,106,0)']], 64);
    S.lav = E.sprite([[0, 'rgba(206,196,255,.9)'], [.3, 'rgba(150,130,240,.32)'], [1, 'rgba(110,92,210,0)']], 256);
    S.bead = E.sprite([[0, 'rgba(255,250,230,1)'], [.22, 'rgba(255,210,140,.6)'], [.6, 'rgba(240,140,70,.15)'], [1, 'rgba(240,130,50,0)']], 64);
    // the lit ground: the same night with the great lamp's halo, its pool on the water and the bright shore line
    const bgL = (lit) => { const cv = mk(W * D, H * D), q = cv.getContext('2d'); q.drawImage(bg, 0, 0); q.scale(D, D);
      q.globalCompositeOperation = 'lighter';
      if (lit > 0) { q.globalAlpha = .9 * lit; q.drawImage(S.halo, CX - 260 * u, HY - 80 * u - 260 * u, 520 * u, 520 * u);
        q.save(); q.beginPath(); q.rect(0, HY, W, H - HY); q.clip(); q.translate(CX, HY); q.scale(1, .62); q.globalAlpha = lit; q.drawImage(S.pool, -700 * u, -700 * u, 1400 * u, 1400 * u); q.restore();
        q.save(); q.translate(CX, HY + 3 * u); q.scale(1, .22); q.globalAlpha = .55 * lit; q.drawImage(E.SP.glow, -150 * u, -150 * u, 300 * u, 300 * u); q.restore(); }
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 1;
      const gl = q.createLinearGradient(0, 0, W, 0), k0 = CX / W;
      gl.addColorStop(0, 'rgba(185,166,240,.18)'); gl.addColorStop(Math.max(0, k0 - .25), 'rgba(249,190,112,' + (.25 + .3 * lit).toFixed(3) + ')');
      gl.addColorStop(k0, 'rgba(255,233,184,' + (.5 + .5 * lit).toFixed(3) + ')'); gl.addColorStop(Math.min(1, k0 + .2), 'rgba(249,190,112,' + (.25 + .3 * lit).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(185,166,240,.2)');
      q.fillStyle = gl; q.fillRect(0, HY - .6 * u, W, 1.3 * u); return cv; };
    g.bg0 = bgL(0); g.bg1 = bgL(1); g.bg = null;
    { const cv = g.bgS = mk(W * D, H * D), q = cv.getContext('2d'); q.drawImage(g.bg1, 0, 0); q.globalCompositeOperation = 'lighter'; q.drawImage(lines, 0, HY * D);
      q.scale(D, D); for (const l of lamps) q.drawImage(l.refl, l.rx, HY + l.ry, l.rw, l.rh); }
    g.lines = null; for (const l of lamps) l.refl = null;
    // one small diya: the bowl and the flame, drawn once at high resolution (card geometry, units of the card)
    const Z = 4;
    const bowl = S.bowl = mk(40 * Z, 16 * Z), bq = bowl.getContext('2d'); bq.scale(Z, Z); bq.translate(20, 10);
    gr = bq.createLinearGradient(0, -7.5, 0, 4.5); gr.addColorStop(0, '#B8683E'); gr.addColorStop(.5, '#6E3440'); gr.addColorStop(1, '#2a1740');
    bq.fillStyle = gr; bq.beginPath(); bq.moveTo(-14, -7.5); bq.bezierCurveTo(-12.5, 1.5, -6, 4.5, 0, 4.5); bq.bezierCurveTo(6, 4.5, 12.5, 1.5, 14, -7.5); bq.quadraticCurveTo(0, -4.6, -14, -7.5); bq.fill();
    bq.strokeStyle = '#FFD890'; bq.lineWidth = 1; bq.beginPath(); bq.moveTo(-14, -7.5); bq.quadraticCurveTo(0, -4.6, 14, -7.5); bq.stroke();
    const fl = S.fl = mk(18 * Z, 30 * Z), fq = fl.getContext('2d'); fq.scale(Z, Z); fq.translate(9, 28.5);
    gr = fq.createRadialGradient(0, -7.4 - 27.6 * .28 + 6, 0, 0, -12, 15); gr.addColorStop(0, '#FFFDF2'); gr.addColorStop(.35, '#FFEFB4'); gr.addColorStop(.7, '#FFC95E'); gr.addColorStop(1, '#F28A22');
    fq.fillStyle = gr; fq.beginPath(); fq.moveTo(0, -27.6); fq.bezierCurveTo(2.6, -20.1, 7.6, -15.1, 7.6, -8.1); fq.bezierCurveTo(7.6, -3.2, 4.3, 0, 0, 0);
    fq.bezierCurveTo(-4.3, 0, -7.6, -3.2, -7.6, -8.1); fq.bezierCurveTo(-7.6, -15.1, -2.6, -20.1, 0, -27.6); fq.fill();

    // ---- the eye: gradients (CSS px), and a field of stars that lives inside it
    gr = g.lensf = E.ctx.createLinearGradient(CX - EA, 0, CX + EA, 0);
    gr.addColorStop(0, 'rgba(124,110,224,.03)'); gr.addColorStop(.5, 'rgba(124,110,224,.2)'); gr.addColorStop(1, 'rgba(124,110,224,.03)');
    gr = g.lenss = E.ctx.createLinearGradient(CX - EA, 0, CX + EA, 0);
    gr.addColorStop(0, '#FFF3DA'); gr.addColorStop(.16, '#D9D0FF'); gr.addColorStop(.5, '#B9ADF6'); gr.addColorStop(.84, '#D9D0FF'); gr.addColorStop(1, '#FFF3DA');
    g.es = [];
    for (let k = 0; k < 230; k++) { const x = R() * 2 * EA, y = R() * 2 * EH, dx = (x - EA) / EA, dy = (y - EH) / EH, rr = Math.hypot(dx, dy * .9);
      const m = R(), r = (.45 + Math.pow(m, 3) * 1.6) * u * 1.15, o = (.35 + R() * .6) * (1 - .55 * rr);
      const col = R() < .18 ? '#FFE6B8' : '#E2DCFF'; if (o > .03) g.es.push({ x: CX - EA + x, y: EY - EH + y, r, o, col, uu: (x - EA) / EA }); }

    // the strips the water is laid in, and their phases
    g.strip = Math.max(3, Math.round(4 * u));
    g.ph = []; for (let y = 0; y < WH + 16; y += g.strip) g.ph.push(R() * TAU);
    // ripple rings from the landing
    g.rings = [0.15, 1.5, 2.9, 4.5, 6.4, 8.6].map(t0 => ({ t0, v: (150 + R() * 30) * u }));
    g.lensPts = new Float32Array(242);  // u-values of the lens samples
    for (let i = 0; i <= 120; i++) g.lensPts[i] = -Math.cos(Math.PI * i / 120);
    // the eye, baked: its fill (scaled vertically as it opens) and its open outline
    { const pad = 4 * u, cv = g.lensC = mk((2 * EA + 2 * pad) * D, (2 * EH + 2 * pad) * D), q = cv.getContext('2d'); q.scale(D, D); q.translate(-(CX - EA - pad), -(EY - EH - pad));
      const pa = new Path2D(); for (let i = 0; i <= 120; i++) { const uu = g.lensPts[i]; pa.lineTo(CX + EA * uu, EY - EH * Math.pow(Math.max(0, 1 - uu * uu), EP)); }
      for (let i = 120; i >= 0; i--) { const uu = g.lensPts[i]; pa.lineTo(CX + EA * uu, EY + EH * Math.pow(Math.max(0, 1 - uu * uu), EP)); } pa.closePath();
      q.fillStyle = g.lensf; q.fill(pa); }
    { const p = 10 * u; g.ob = [CX - EA - p, EY - EH - p, 2 * (EA + p), 2 * (EH + p)].map(Math.round);
      const cv = g.outG = mk(g.ob[2] * D, g.ob[3] * D), q = cv.getContext('2d'); q.scale(D, D); q.translate(-g.ob[0], -g.ob[1]); q.globalCompositeOperation = 'lighter'; eyeGlow(q, EH, 60, 1.5);
      const cm = g.outM = mk(g.ob[2] * D, g.ob[3] * D), r = cm.getContext('2d'); r.scale(D, D); r.translate(-g.ob[0], -g.ob[1]); eyeMain(r, EH, 60, .92, .3);
      const ec = g.esC = mk(g.ob[2] * D, g.ob[3] * D), e = ec.getContext('2d'); e.scale(D, D); e.translate(-g.ob[0], -g.ob[1]);
      for (const st of g.es) { const lim = EH * Math.pow(Math.max(0, 1 - st.uu * st.uu), EP), m2 = (lim - Math.abs(st.y - EY)) / (14 * u); if (m2 <= 0) continue;
        e.fillStyle = st.col; e.globalAlpha = st.o * Math.min(1, m2); e.beginPath(); e.arc(st.x, st.y, st.r, 0, TAU); e.fill(); } }
    const ell = (w, h, a) => { w = Math.round(w); h = Math.round(h); const cv = mk(w * D, h * D), q = cv.getContext('2d'); q.scale(D, D); q.translate(w / 2, h / 2); q.scale(1, h / w); q.globalAlpha = a; q.drawImage(S.lav, -w / 2, -w / 2, w, w); cv.w = Math.round(w); cv.h = Math.round(h); return cv; };
    S.bloom = E.sprite([[0, 'rgba(252,248,255,.9)'], [.16, 'rgba(222,210,255,.55)'], [.42, 'rgba(158,136,242,.2)'], [.75, 'rgba(110,90,210,.05)'], [1, 'rgba(91,78,142,0)']], 512);
    { const w = Math.round(1240 * u * K), h = Math.round(640 * u * K), cv = g.bloom = mk(w * D, h * D), q = cv.getContext('2d'); q.scale(D, D); q.translate(w / 2, h / 2); q.scale(1, h / w); q.drawImage(S.bloom, -w / 2, -w / 2, w, w); cv.w = w; cv.h = h; }
    g.gA = ell(660 * u, 660 * u * .62, .25); g.gB = ell(840 * u * K, 840 * u * K * .42, 1);
    { const xs = lamps.map(l => l.x), ys = lamps.map(l => l.y), p = 90 * u * K; g.lb = [Math.min(...xs) - p, Math.min(...ys) - p, Math.max(...xs) - Math.min(...xs) + 2 * p, Math.max(...ys) - Math.min(...ys) + 2 * p].map(Math.round);
      const gc = g.lampG = mk(g.lb[2] * D, g.lb[3] * D), q = gc.getContext('2d'), bc = g.lampB = mk(g.lb[2] * D, g.lb[3] * D), r = bc.getContext('2d');
      for (const z of [q, r]) { z.scale(D, D); z.translate(-g.lb[0], -g.lb[1]); } q.globalCompositeOperation = 'lighter';
      for (const l of lamps) { const s = l.s;
        q.save(); q.translate(l.x, l.y + 3.5 * s); q.scale(1, 6 / 36); q.drawImage(S.sw, -36 * s, -36 * s, 72 * s, 72 * s); q.restore();
        q.globalAlpha = 1; q.drawImage(S.sh, l.x - 40 * s, l.y - 19 * s - 40 * s, 80 * s, 80 * s);
        r.drawImage(S.bowl, l.x - 20 * s, l.y - 10 * s, 40 * s, 16 * s); r.drawImage(S.fl, l.x - 9 * s, l.y - 7.4 * s - 30 * s * (28.5 / 30), 18 * s, 30 * s); } }
    { const p = 150 * u * K, hb = [g.lb[0] - p, g.lb[1] - p, g.lb[2] + 2 * p, g.lb[3] + 2 * p].map(Math.round), cv = g.lampH = mk(hb[2] * D, hb[3] * D), q = cv.getContext('2d');
      cv.x = hb[0]; cv.y = hb[1]; cv.w = hb[2]; cv.h = hb[3]; q.scale(D, D); q.translate(-hb[0], -hb[1]); q.globalCompositeOperation = 'lighter';
      for (const l of lamps) { const s = l.s; q.globalAlpha = .8; q.drawImage(S.sh, l.x - 120 * s, l.y - 22 * s - 120 * s, 240 * s, 240 * s);
        q.globalAlpha = 1; q.drawImage(S.sh, l.x - 45 * s, l.y - 19 * s - 45 * s, 90 * s, 90 * s);
        q.save(); q.translate(l.x, l.y + 4 * s); q.scale(1, .2); q.globalAlpha = .9; q.drawImage(S.sw, -70 * s, -70 * s, 140 * s, 140 * s); q.restore(); } }
    { const cv = g.bgF = mk(W * D, H * D), q = cv.getContext('2d'); q.drawImage(g.bgS, 0, 0); q.scale(D, D); const pad = 4 * u;
      q.drawImage(g.lensC, CX - EA - pad, EY - EH - pad, 2 * (EA + pad), 2 * (EH + pad)); q.globalCompositeOperation = 'lighter';
      q.drawImage(g.lampG, g.lb[0], g.lb[1], g.lb[2], g.lb[3]); q.drawImage(g.esC, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); }
  },

  draw(E, t, dt) {
    if (E.seeking) return;                                     // a pure function of t: nothing to advance
    const g = G, c = E.ctx, { W, H, D, u, HY, CX, CY, RX, RY, EY, EA, EH, S } = g, ss = E.ss;
    // ---- the arc's clocks
    const lit = ss(0, 7, t);                                   // the great lamp's light on its ground
    const calm = 1 - ss(2.5, 17.6, t);                         // the water's stir (1 = stirred, 0 = still)
    const still = ss(16.5, 19.5, t);                           // STILL
    const open = ss(17.6, 20.2, t);                            // the eye opening on its own
    const seen = ss(18, 20.2, t) - .4 * ss(20.6, 26, t);      // the light of seeing, then it settles
    const peak = ss(17.8, 20, t) * (1 - ss(20.4, 25.5, t));   // the moment itself: brightest at ~20 s
    const breath = .5 + .5 * Math.sin((t - 22) * TAU / 9);     // slow breathing in the rest
    const draw = ss(4.2, 13.5, t);                             // the eye's outline drawn from the tips

    const fin = t >= 20.25;                                    // everything that no longer changes, baked into one ground
    c.drawImage(fin ? g.bgF : calm > 0 ? g.bg1 : g.bgS, 0, 0, W, H);
    if (lit < 1) { c.globalAlpha = 1 - lit; c.drawImage(g.bg0, 0, 0, W, H); c.globalAlpha = 1; }
    // the stars that breathe
    c.globalCompositeOperation = 'lighter';
    for (const s of g.tw) { const a = s.o * (.72 + .28 * Math.sin(t * s.sp + s.ph)) * (.65 + .35 * lit); E.put(E.SP.white, s.x, s.y, s.r * 7, a * .55);
      c.fillStyle = s.wm ? '#FFE6B8' : '#E2DCFF'; c.globalAlpha = a; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'lighter';
    // the eye's own inner light (it grows as the eye opens)
    const ehNow = EH * (.13 + .87 * open);
    const inner = .35 * draw + .65 * open + .55 * seen + .08 * breath * still;
    { const gc = g.gA, hh = gc.h * (.4 + .6 * open); c.globalAlpha = Math.min(1, .64 * inner); c.drawImage(gc, CX - gc.w / 2, EY - hh / 2, gc.w, hh); }

    // ---- the water: compose its lights, then lay them down in strips that ripple until the water is still
    const amp = 9 * u * calm * calm, sh = g.strip;
    const wob = (y) => amp * (.35 + .65 * (y / g.WH)) * (.62 * Math.sin(y * .075 / u - t * 1.25 + g.ph[(y / sh) | 0] * .35) + .38 * Math.sin(y * .021 / u + t * .7));
    if (calm > 0) {                       // stirred: every dash of light drawn where the moving water puts it
      c.lineCap = 'round'; c.lineWidth = 1.05 * u; const la = .55 + .45 * lit;
      for (const bk of g.LB) { c.strokeStyle = bk.st; c.globalAlpha = la; c.beginPath(); let yl = -1, o = 0;
        for (const d of bk.d) { if (d[2] !== yl) { yl = d[2]; o = wob(yl - HY); } c.moveTo(d[0] + o, d[2]); c.lineTo(d[1] + o, d[2]); } c.stroke(); }
      for (const d of g.path) { const o = wob(d[2] - HY); c.strokeStyle = d[3]; c.lineWidth = d[4]; c.globalAlpha = la; c.beginPath(); c.moveTo(d[0] + o, d[2]); c.lineTo(d[1] + o, d[2]); c.stroke(); }
      for (const l of g.lamps) { const on = ss(l.on, l.on + 1.4, t); if (on <= 0) continue; let k = 0;
        for (const d of l.d) { const o = wob(d[2] - HY) * (1 + .6 * (k++ % 2)); c.strokeStyle = d[3]; c.globalAlpha = d[4] * on; c.lineWidth = d[5];
          c.beginPath(); c.moveTo(d[0] + o, d[2]); c.lineTo(d[1] + o, d[2]); c.stroke(); } } }
    const mirA = ss(13, 21.5, t);
    if (mirA > 0) { const o = wob(g.WH * .5) * .5; for (const m of g.mirS) { c.fillStyle = m[5]; c.globalAlpha = Math.min(1, m[4] * (mirA + 2.6 * peak)); c.fillRect(m[0] + o, m[1], m[2], m[3]); } }
    c.globalAlpha = 1;

    // ripple rings running out from where the lamp landed (lower halves, on the water)
    c.lineWidth = 1.3 * u; c.lineJoin = 'round';
    for (const r of g.rings) { const a = t - r.t0; if (a <= 0) continue; const rad = 30 * u + r.v * a, al = .34 * Math.exp(-a / 3.6) * calm * ss(0, .5, a);
      if (al < .025 || rad > W * .9) continue;
      c.strokeStyle = 'rgba(222,206,255,' + al.toFixed(3) + ')'; c.beginPath();
      for (let k = 0; k <= 36; k++) { const an = Math.PI * k / 36, x = CX + rad * Math.cos(an), y = HY + 2 * u + rad * .2 * Math.sin(an); k ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); }

    // ---- the eye: fill, its inner stars, its outline
    const P = g.lensPts;
    c.globalCompositeOperation = 'source-over';
    if (!fin) { const pad = 4 * u, sc = ehNow / EH; c.globalAlpha = .25 + .75 * draw; c.drawImage(g.lensC, CX - EA - pad, EY - (EH + pad) * sc, 2 * (EA + pad), 2 * (EH + pad) * sc); }
    c.globalCompositeOperation = 'lighter';
    if (open > .01) { c.save(); const sa = Math.min(1, .32 + .9 * seen + .15 * open) * open;
      if (fin) {} else if (open >= 1) { c.globalAlpha = sa; c.drawImage(g.esC, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); } else
      for (const st of g.es) { const lim = ehNow * Math.pow(Math.max(0, 1 - st.uu * st.uu), EP), dy = Math.abs(st.y - EY), m2 = (lim - dy) / (14 * u); if (m2 <= 0) continue;
        c.fillStyle = st.col; c.globalAlpha = sa * st.o * Math.min(1, m2); c.beginPath(); c.arc(st.x, st.y, st.r, 0, TAU); c.fill(); }
      // the seeing: light gathering at the centre of the eye, then resting
      c.restore(); const gc = g.gB; c.globalAlpha = Math.min(1, .4 * seen + .08 * open); c.drawImage(gc, Math.round(CX - gc.w / 2), Math.round(EY - gc.h / 2), gc.w, gc.h); }
    // the great lamp's path on the water reaches all the way into the eye once the water is still
    if (seen > 0) { c.lineCap = 'round'; c.strokeStyle = '#FFE2B0'; let y = HY + 70 * u;
      for (let k = 0; y < EY + 40 * u; k++) { const f = (y - HY) / (EY + 40 * u - HY), w = (64 - 40 * f) * u * (k % 2 ? .78 : 1);
        c.globalAlpha = seen * .42 * (1 - f * .55) * ss(0, .25, 1 - f + .1); c.lineWidth = (1.5 - .5 * f) * u;
        c.beginPath(); c.moveTo(CX - w / 2, y); c.lineTo(CX + w / 2, y); c.stroke(); y += (7 + k * .5) * u; } c.globalAlpha = 1; }
    // outline drawn in from the two tips, both petals at once
    const m = Math.round(60 * draw);
    const glowA = .55 + .45 * open + .5 * seen + 1.1 * peak;
    if (m > 0) {
      if (open >= 1 && m >= 60) { c.globalAlpha = Math.min(1, glowA / 1.5); if (glowA > 1.5) { c.drawImage(g.outG, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); c.globalAlpha = (glowA - 1.5) / 1.5; } c.drawImage(g.outG, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(g.outM, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); }
      else { eyeGlow(c, ehNow, m, glowA); c.globalCompositeOperation = 'source-over'; eyeMain(c, ehNow, m, .62 + .3 * open, .3 * open); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'lighter';
      // the drawing points: two small lights travelling in from the tips
      if (draw > 0 && draw < 1) for (const [sg, i] of [[-1, m], [1, m], [-1, 120 - m], [1, 120 - m]]) { const uu = P[i];
        E.put(S.bead, CX + EA * uu, EY + sg * ehNow * Math.pow(Math.max(0, 1 - uu * uu), EP), 26 * u, .7 * Math.sin(Math.PI * draw)); }
      // the tips: where the two petals meet, a warm point
      for (const sx of [-1, 1]) E.put(S.bead, CX + sx * EA, EY, 30 * u, .45 * draw + .25 * seen); }

    // ---- the bead of light running round the ring, and the trail it leaves
    const bt = (t - g.beadT0) / (g.beadT1 - g.beadT0);
    if (bt > -.05 && bt < 1.15) { const bp = Math.min(1, Math.max(0, bt)), fade = 1 - ss(1, 1.15, bt), ang = bp * Math.PI;
      for (const sg of [1, -1]) {
        // trail
        c.strokeStyle = 'rgba(255,214,160,1)'; c.lineWidth = 1.4 * u;
        const steps = 22; for (let k = 0; k < steps; k++) { const a0 = ang - k * .045, a1 = a0 - .045; if (a1 < 0) break;
          c.globalAlpha = .28 * (1 - k / steps) * fade * ss(-.05, .02, bt); c.beginPath();
          c.moveTo(CX + sg * RX * Math.sin(a0), CY - RY * Math.cos(a0)); c.lineTo(CX + sg * RX * Math.sin(a1), CY - RY * Math.cos(a1)); c.stroke(); }
        c.globalAlpha = 1;
        const bx = CX + sg * RX * Math.sin(ang), by = CY - RY * Math.cos(ang), ba = fade * ss(-.05, .03, bt);
        E.put(S.bead, bx, by, 34 * u, .95 * ba); E.put(E.SP.glow, bx, by, 110 * u, .35 * ba); } }

    // ---- the eighteen lamps (back to front by depth)
    if (still >= 1 && t > 17.1) { const b = g.lb; if (!fin) { c.globalAlpha = Math.min(1, .95 + .2 * seen); c.drawImage(g.lampG, b[0], b[1], b[2], b[3]); }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(g.lampB, b[0], b[1], b[2], b[3]); }
    else for (const l of g.lamps) { const on = ss(l.on, l.on + 1.4, t), s = l.s;
      // light pooled on the water around each lamp, and its glow
      if (on > 0) { c.save(); c.translate(l.x, l.y + 3.5 * s); c.scale(1, 6 / 36); c.globalAlpha = on; c.drawImage(S.sw, -36 * s, -36 * s, 72 * s, 72 * s); c.restore();
        E.put(S.sh, l.x, l.y - 19 * s, 80 * s * (1 + .25 * (1 - on)), on * (.95 + .2 * seen)); }
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = .55 + .45 * Math.max(on, lit * .6); c.drawImage(S.bowl, l.x - 20 * s, l.y - 10 * s, 40 * s, 16 * s);
      if (on > 0) { const fk = (1 - still) * (.07 * (E.noise(t * 1.3 + l.ph, l.ph) - .5) * 2), sy = (.35 + .65 * on) * (1 + fk), sxx = (.6 + .4 * on) * (1 - fk * .4);
        const fw = 18 * s * sxx, fh = 30 * s * sy, sway = (1 - still) * 1.2 * s * (E.noise(t * .9, l.ph + 7) - .5);
        c.globalAlpha = on; c.drawImage(S.fl, l.x - fw / 2 + sway, l.y - 7.4 * s - fh * (28.5 / 30), fw, fh); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'lighter'; }

    // STILL: the ring brightens together and a wide violet-white light rises out of the open eye
    if (peak > 0) { c.globalCompositeOperation = 'lighter'; const b = g.lb, h = g.lampH;
      c.globalAlpha = peak; c.drawImage(h, h.x, h.y, h.w, h.h);
      const bl = g.bloom, rise = 150 * u * g.K * ss(17.8, 23, t);
      c.globalAlpha = .9 * peak; c.drawImage(bl, Math.round(CX - bl.w / 2), Math.round(EY - rise - bl.h / 2), bl.w, bl.h);
      const gc = g.gB; c.globalAlpha = Math.min(1, .5 * peak); c.drawImage(gc, Math.round(CX - gc.w / 2), Math.round(EY - gc.h / 2), gc.w, gc.h);
      c.globalAlpha = .45 * peak; c.drawImage(g.esC, g.ob[0], g.ob[1], g.ob[2], g.ob[3]); }
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  } });

function lensP(sg, from, to, k, eh) { const { CX, EY, EA, u } = G, P = G.lensPts, p = new Path2D(), step = from < to ? 1 : -1;
  for (let i = from, j = 0; step > 0 ? i <= to : i >= to; i += step, j++) { const uu = P[i], x = CX + (EA - k * 2.4 * u) * uu, y = EY + sg * (eh - k * u) * Math.pow(Math.max(0, 1 - uu * uu), EP); j ? p.lineTo(x, y) : p.moveTo(x, y); } return p; }
function outline(eh, m) { const pa = new Path2D(); for (const q of [lensP(-1, 0, m, 0, eh), lensP(1, 0, m, 0, eh), lensP(-1, 120, 120 - m, 0, eh), lensP(1, 120, 120 - m, 0, eh)]) pa.addPath(q); return pa; }
function eyeGlow(c, eh, m, ga) { const u = G.u, pa = outline(eh, m); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = 'rgba(142,127,240,' + (.11 * ga).toFixed(3) + ')'; c.lineWidth = 12 * u; c.stroke(pa);
  c.strokeStyle = 'rgba(156,142,246,' + (.18 * ga).toFixed(3) + ')'; c.lineWidth = 5 * u; c.stroke(pa); }
function eyeMain(c, eh, m, ma, ia) { const u = G.u, pa = outline(eh, m); c.lineJoin = 'round'; c.lineCap = 'round';
  c.strokeStyle = G.lenss; c.globalAlpha = ma; c.lineWidth = 1.7 * u; c.stroke(pa);
  if (ia > .015) { c.globalAlpha = ia; c.lineWidth = .8 * u; c.stroke(lensP(-1, 0, 120, 9, eh)); c.stroke(lensP(1, 0, 120, 9, eh)); } c.globalAlpha = 1; }
function E_ss(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
})();
