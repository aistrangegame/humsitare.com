/* Five Lamps · the phone engine, shared by every story.
   Carried from the Dome's drawn story (the-dome/site/play/story-drawn.html): one canvas, never erased; a point of light
   that draws every line (here: the guest's own flame); chapters built up front, played once, settled when the reader
   pushes on; the camera is a transform. Added for the wall: the lamp the guest lights, scenes that replay when you go
   back, Back/Next, a closing sound for every scene, the private question, the share choice, the room, the five lamps
   of the wall, and Bindu, who comes to dance if you stay on the last page.
   A story page calls FL.story({...}) with its words and chapters. Chapter: { k, text, cam:{cx,w,top}, bg, mood,
   build(ctx) -> b, play(ctx, b, from), settle(ctx, b) }. Kit for chapters: FL.HEAD, FL.path, FL.rnd, FL.flat, FL.op,
   FL.drawn, FL.on, FL.setBg, FL.lamp, FL.wall, FL.wallPlay, FL.wallSettle, FL.B (every chapter's built elements). */
(function () {
  const FL = (window.FL = {});
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  FL.reduce = reduce;
  FL.HEAD = (x, y, r) => `M${x} ${y - r} a${r} ${r} 0 1 0 0.1 0`;
  FL.path = (d, stroke, b, cls = "", extra = "") => `<path class="ln ${cls}" pathLength="1" d="${d}" stroke="${stroke}" style="--b:${b}" ${extra}/>`;
  FL.rnd = (seed) => { let r = seed; return () => (r = (r * 9301 + 49297) % 233280) / 233280; };
  FL.flat = (a) => (Array.isArray(a) ? a.flat(Infinity) : [a]).filter(Boolean);
  FL.op = (els, v, ms = 1600) => FL.flat(els).forEach((e) => { e.style.transition = reduce || !ms ? "none" : `opacity ${ms}ms ease`; e.style.opacity = v; });
  FL.drawn = (els) => FL.flat(els).forEach((p) => { p.getAnimations().forEach((a) => a.cancel()); p.style.strokeDashoffset = 0; });
  FL.on = (els) => FL.flat(els).forEach((e) => e.classList.add("on"));
  FL.setBg = (c) => { document.body.style.backgroundColor = c; document.documentElement.style.setProperty("--bg", c); };
  FL.B = {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  FL.esc = esc;
  /* a small clay lamp, lit, in world units */
  FL.lamp = (x, y, s, cls = "") => `<g class="fill ${cls}"><circle cx="${x}" cy="${y - 9 * s}" r="${24 * s}" fill="url(#warm)"/><path class="flame${Math.round(x) % 2 ? " b" : ""}" d="M${x} ${y - 18 * s} C${x + 4.5 * s} ${y - 11 * s} ${x + 4.5 * s} ${y - 5 * s} ${x} ${y - 2.5 * s} C${x - 4.5 * s} ${y - 5 * s} ${x - 4.5 * s} ${y - 11 * s} ${x} ${y - 18 * s} Z" fill="url(#flameG)"/><path d="M${x - 10 * s} ${y - 2.5 * s} Q${x} ${y + 7 * s} ${x + 10 * s} ${y - 2.5 * s} Z" fill="#7a4a24"/></g>`;

  /* the wall's own thread, with five hanging lamps; the story lights its own (n = 1..5) */
  FL.wall = (ctx, o) => {
    const { x0, x1, y, n } = o, sag = o.sag || 60, color = o.color || "rgba(226,168,90,.5)";
    const T = [.08, .29, .5, .71, .92].map((t) => ({ x: x0 + (x1 - x0) * t, y: y + 2 * sag * t * (1 - t) }));
    const thread = ctx.el("scene", FL.path(`M${x1} ${y} Q${(x0 + x1) / 2} ${y + 2 * sag} ${x0} ${y}`, color, 1.8));
    const hang = T.map((p) => ctx.el("scene", FL.path(`M${p.x} ${p.y} L${p.x} ${p.y + 22} M${p.x - 16} ${p.y + 30} Q${p.x} ${p.y + 46} ${p.x + 16} ${p.y + 30} L${p.x - 16} ${p.y + 30}`, color, 1.8)));
    const lit = ctx.el("fills", FL.lamp(T[n - 1].x, T[n - 1].y + 34, 1.9));
    FL.wallLamp = { x: T[n - 1].x, y: T[n - 1].y + 22 };
    return { thread, hang, lit, T, n };
  };
  FL.wallPlay = async (ctx, w) => {
    await ctx.draw(w.thread, 2.4, { glide: 900 });
    ctx.cascade(w.hang, 900, 140);
    await ctx.glide(FL.wallLamp.x, FL.wallLamp.y, 900);
    FL.on(w.lit);
    ctx.chord([261.63, 329.63, 392, 523.25], 5); ctx.sparks(FL.wallLamp.x, FL.wallLamp.y, 14, "#FFD27A", true);
    ctx.show(false);
    await ctx.wait(800);
  };
  FL.wallSettle = (ctx, w) => { FL.drawn([w.thread, w.hang]); FL.on(w.lit); ctx.show(false); ctx.at(FL.wallLamp.x, FL.wallLamp.y); };

  const NAMES = ["Narakasura", "Lakshmi", "Mahavira", "Bandi Chhor", "Rama"];
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI"];
  const WORDS = ["", "One", "Two", "Three", "Four"];
  const LAMPICO = (cls = "") => `<svg viewBox="0 0 48 62" aria-hidden="true"><path d="M24 0 L24 14" stroke="rgba(226,168,90,.45)" stroke-width="1.2"/><g class="lg ${cls}"><circle cx="24" cy="30" r="17" fill="url(#dGlow)"/><path d="M24 18 C28 25 27.5 31 24 34 C20.5 31 20 25 24 18 Z" fill="url(#dFlame)"/></g><path d="M10 36 Q24 50 38 36 Q31 39 29 34 L19 34 Q17 39 10 36 Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="1.4"/></svg>`;
  const ICO = {
    mine: `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="#E2A85A" stroke-width="1.5"/><path d="M24 11 C28.5 17.5 28 23 24 26 C20 23 19.5 17.5 24 11 Z" fill="url(#dFlame)"/><path d="M13 28 Q24 39 35 28 Q29 30.5 28 26 L20 26 Q19 30.5 13 28 Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="1.3"/></svg>`,
    anon: `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M2 9 Q24 15 46 9" fill="none" stroke="rgba(226,168,90,.6)" stroke-width="1.3"/>${[9, 24, 39].map((x, i) => `<path d="M${x} ${i === 1 ? 12 : 11} v6" stroke="rgba(226,168,90,.6)" stroke-width="1"/><path d="M${x} ${20} C${x + 3.5} ${25} ${x + 3} ${29} ${x} ${31} C${x - 3} ${29} ${x - 3.5} ${25} ${x} ${20} Z" fill="url(#dFlame)" opacity="${i === 1 ? 1 : .35}"/><path d="M${x - 7} ${32} Q${x} ${39} ${x + 7} ${32} Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="1.1"/>`).join("")}</svg>`,
    named: `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><path d="M2 9 Q24 15 46 9" fill="none" stroke="rgba(226,168,90,.6)" stroke-width="1.3"/>${[9, 24, 39].map((x, i) => `<path d="M${x} ${i === 1 ? 12 : 11} v5" stroke="rgba(226,168,90,.6)" stroke-width="1"/><path d="M${x} ${18} C${x + 3.5} ${23} ${x + 3} ${27} ${x} ${29} C${x - 3} ${27} ${x - 3.5} ${23} ${x} ${18} Z" fill="url(#dFlame)" opacity="${i === 1 ? 1 : .35}"/><path d="M${x - 7} ${30} Q${x} ${36} ${x + 7} ${30} Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="1.1"/>`).join("")}<rect x="14" y="39" width="20" height="8" rx="2" fill="#2a1a10" stroke="#E2A85A" stroke-width="1.2"/><path d="M18 43 h12" stroke="#FFD27A" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  };

  FL.story = function (S) {
    /* ---------- the page ---------- */
    const CHS = S.chapters, NCH = CHS.length;
    document.title = S.title;
    document.body.insertAdjacentHTML("afterbegin", `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <radialGradient id="dGlow"><stop offset="0" stop-color="#FFB63A" stop-opacity=".55"/><stop offset="1" stop-color="#FFB63A" stop-opacity="0"/></radialGradient>
  <linearGradient id="dFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF8A1E"/><stop offset=".6" stop-color="#FFC24A"/><stop offset="1" stop-color="#FFF1C2"/></linearGradient></defs></svg>
<svg class="canvas" id="canvas" aria-hidden="true"><defs>
  <radialGradient id="ptGlow"><stop offset="0" stop-color="#FFE6B0" stop-opacity=".9"/><stop offset=".35" stop-color="#FFB63A" stop-opacity=".35"/><stop offset="1" stop-color="#FFB63A" stop-opacity="0"/></radialGradient>
  <radialGradient id="warm"><stop offset="0" stop-color="#FFB63A" stop-opacity=".7"/><stop offset="1" stop-color="#FFB63A" stop-opacity="0"/></radialGradient>
  <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF8A1E"/><stop offset=".6" stop-color="#FFC24A"/><stop offset="1" stop-color="#FFF1C2"/></linearGradient>
  ${S.defs || ""}</defs>
  <g id="cam"><g id="L-sky"></g><g id="L-far"></g><g id="L-fills"></g><g id="L-scene"></g><g id="L-hero"></g><g id="L-top"></g><g id="L-trail"></g>
  <g id="point" opacity="0"><g id="ptS"><circle r="30" fill="url(#ptGlow)"/><path class="pt-flame" d="M0 -16 C6 -8 5 -1 0 3 C-5 -1 -6 -8 0 -16 Z" fill="url(#flameG)"/><circle r="3" fill="#FFF6DC"/></g></g></g></svg>
<div class="scrim" aria-hidden="true"></div>
<canvas class="bindu" id="bindu" aria-hidden="true"></canvas>
<svg class="thread" viewBox="0 0 150 24" aria-hidden="true"><path class="tl" d="M2 8 Q75 14 148 8"/><g id="tdots"></g></svg>
<button class="snd" id="snd" type="button" aria-pressed="false"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path id="sndWaves" d="M11 5.5q2 2.5 0 5M12.8 4q3.2 4 0 8" stroke="currentColor" fill="none" stroke-width="1.3" opacity=".35"/></svg><span id="sndLabel">Sound off</span></button>
<main id="deck">
  <section class="page arrive" id="p0" aria-label="Light the lamp"><div class="in center" tabindex="-1">
    <p class="k">${esc(S.kicker)}</p><h1 id="greet">${esc(S.title)}</h1>
    <p class="lede">${esc(S.lede)}</p>
    <button class="diya" id="diya" type="button" aria-label="Hold to light the lamp"><svg viewBox="0 0 120 120" aria-hidden="true">
      <circle class="rbg" cx="60" cy="60" r="56"/><circle class="rfg" id="ring" cx="60" cy="60" r="56" pathLength="1"/>
      <circle class="dglow" cx="60" cy="50" r="46" fill="url(#dGlow)"/><path class="dflame" d="M60 22 C70 37 68 51 60 56 C52 51 50 37 60 22 Z" fill="url(#dFlame)"/>
      <path d="M16 64 Q60 106 104 64 Q84 70 78 58 L42 58 Q36 70 16 64 Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="2"/></svg></button>
    <p class="hint" id="hint">Hold the lamp to light it</p>
    <p class="note">${esc(S.note || "The pictures are imagined. The story is told as tradition tells it.")}</p></div></section>
  <section class="page form" id="pQ" aria-label="A question just for you"><div class="in" tabindex="-1">
    <p class="k">Just for you</p><h2>${esc(S.question)}</h2>
    <label class="sr" for="answer">Your answer</label><textarea id="answer" rows="5" placeholder="A few words are enough."></textarea>
    <button class="hold" id="keep" type="button"><span class="fill" id="keepFill"></span><span id="keepLabel">Hold to keep it</span></button>
    <p class="receipt" id="receipt" hidden></p>
    <div class="row"><button class="primary" id="toShare" type="button" hidden>Continue</button><button class="ghost" id="skip" type="button">Skip, and see the room</button></div></div></section>
  <section class="page form" id="pS" aria-label="Light it for the room?"><div class="in" tabindex="-1">
    <p class="k">Your lamp</p><h2>Would you like to light it for the room?</h2>
    <div class="choices" role="radiogroup" aria-label="Who sees your words">
      <button class="choice" type="button" role="radio" aria-checked="false" data-share="mine">${ICO.mine}<b>Keep it mine</b><small>Nobody else sees your words. You still see the room's words, without names.</small></button>
      <button class="choice" type="button" role="radio" aria-checked="false" data-share="anon">${ICO.anon}<b>Light it, without my name</b><small>Others see your words, never your name.</small></button>
      <button class="choice" type="button" role="radio" aria-checked="false" data-share="named">${ICO.named}<b>Light it, with my name</b><small>Others see your words with your name. You see the names of others who chose theirs.</small></button></div>
    <div id="nameRow" class="in" hidden style="gap:6px"><label for="shareName">Your name, as the room will see it</label><input id="shareName" autocomplete="name"></div>
    <button class="primary" id="lightIt" type="button" disabled>Choose one above</button>
    <p class="note">This is a preview. Nothing leaves your phone.</p></div></section>
  <section class="page form" id="pR" aria-label="The room's lamps"><div class="in" tabindex="-1">
    <p class="k">The room</p><h2 id="roomH">The room's lamps</h2><div class="lamps" id="lamps"></div>
    <div class="roomWords" id="roomWords" aria-live="polite"></div><p class="note" id="roomNote"></p></div></section>
  <section class="page form" id="pO" aria-label="The other lamps"><div class="in center" tabindex="-1">
    ${S.closing ? `<p class="closing">${esc(S.closing)}</p>` : ""}
    <h2 id="oH"></h2><div class="five" id="five"></div>
    <p class="lede">Some lamps are hidden in the art.</p></div></section>
</main>
<nav class="nav" id="nav" aria-label="Story" hidden>
  <button class="navb bk" id="back" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back</span></button>
  <span class="where" id="where" aria-live="polite"></span>
  <button class="navb fwd" id="next" type="button"><span>Next</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
</nav>`);

    /* ---------- the canvas and the camera ---------- */
    const svg = $("#canvas"), cam = $("#cam"), point = $("#point"), ptS = $("#ptS");
    const layers = {}; ["sky", "far", "fills", "scene", "hero", "top", "trail"].forEach((k) => (layers[k] = $("#L-" + k)));
    const view = { cx: CHS[0].cam.cx, w: CHS[0].cam.w, top: CHS[0].cam.top, base: innerHeight * .55 };
    const pt = { x: 0, y: 0 };
    let ptK = 1, ptR = 5;
    const wideScreen = () => innerWidth >= 820 && innerWidth > innerHeight * 1.05;
    const place = (x, y) => { pt.x = x; pt.y = y; point.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${ptK.toFixed(3)})`); };
    FL.place = place;
    function frame() {
      // the ground (world y = 0) sits on view.base, just above the words; the scene's top (view.top) stays below the top bar
      const VW = innerWidth, VH = innerHeight; svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
      const w = wideScreen(), fx = w ? .64 : .5, availW = w ? VW * .6 : VW;
      const s = Math.min(availW / view.w, Math.max(40, view.base - 72) / -view.top);
      cam.setAttribute("transform", `translate(${(fx * VW).toFixed(1)} ${view.base.toFixed(1)}) scale(${s.toFixed(5)}) translate(${(-view.cx).toFixed(1)} 0)`);
      cam.style.setProperty("--sw", Math.pow(view.w / 700, .72).toFixed(3));
      ptK = Math.pow(view.w / 700, .8); place(pt.x, pt.y);
    }
    frame();
    const ease = (f) => (f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
    function tween(run, ms, fn, e = ease) {
      return new Promise((res) => { const t0 = performance.now();
        (function step(t) { if (run && run.stop) return res(false); const f = Math.max(0, Math.min(1, (t - t0) / ms)); fn(e(f), f); if (f < 1) requestAnimationFrame(step); else res(true); })(t0); });
    }
    const camRun = {};
    function moveCamera(to, ms) {
      camRun.cur && (camRun.cur.stop = true); const run = (camRun.cur = { stop: false });
      const from = { ...view };
      if (reduce || !ms) { Object.assign(view, to); frame(); return Promise.resolve(true); }
      return tween(run, ms, (e) => { view.cx = from.cx + (to.cx - from.cx) * e; view.top = from.top + (to.top - from.top) * e; view.base = from.base + (to.base - from.base) * e; view.w = Math.exp(Math.log(from.w) + (Math.log(to.w) - Math.log(from.w)) * e); frame(); }, (f) => (f < .5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2));
    }
    const toWorld = (x, y) => new DOMPoint(x, y).matrixTransform(cam.getScreenCTM().inverse());
    FL.toWorld = toWorld;

    /* ---------- sound: the bell answers the guest's strike; everything else waits for "Sound on" ---------- */
    let ac = null, soundOn = false, lastChord = 0;
    const audio = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === "suspended") ac.resume(); return ac; };
    function bell(g = 1) {
      const a = audio(); if (!a) return; const t = a.currentTime + .02;
      [[660, .14, 3.4], [1822, .05, 1.6], [3564, .025, .8], [990, .045, 2.6]].forEach(([f, gg, d]) => { const o = a.createOscillator(), v = a.createGain(); o.frequency.value = f; v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(gg * g, t + .008); v.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + d + .1); });
    }
    function chord(fs, len = 4.2, g = .045) {
      lastChord = performance.now();
      if (!soundOn) return; const a = audio(); if (!a) return;
      fs.forEach((fq, j) => { const t = a.currentTime + j * .14, o = a.createOscillator(), v = a.createGain(); o.frequency.value = fq; v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + .05); v.gain.exponentialRampToValueAtTime(.0001, t + len); o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + len + .1); });
    }
    // every scene ends with a finishing touch: a chord in the scene's mood, unless the scene has just sounded one
    const MOODS = { warm: [[261.63, 329.63, 392], 3.8, .04], dark: [[110, 130.81, 164.81, 220], 5.5, .05], bright: [[293.66, 369.99, 440, 587.33], 4.2, .04], held: [[146.83, 220, 293.66], 5, .045] };
    const endTone = (mood) => { if (performance.now() - lastChord < 1800) return; const m = MOODS[mood] || MOODS.warm; chord(m[0], m[1], m[2]); };
    const snd = $("#snd");
    snd.addEventListener("click", () => { soundOn = !soundOn; if (soundOn) { audio(); bell(.5); } snd.setAttribute("aria-pressed", String(soundOn)); $("#sndLabel").textContent = soundOn ? "Sound on" : "Sound off"; $("#sndWaves").setAttribute("opacity", soundOn ? 1 : .35); });

    /* ---------- the flame, and what it can do (the Dome's ctx, carried over) ---------- */
    const STOP = Symbol("stop");
    const PACE = 0.52;
    function makeCtx(run, page) {
      const check = () => { if (run.stop) throw STOP; };
      const ctx = {
        layers,
        el(layer, html) { const t = document.createElementNS(NS, "g"); t.innerHTML = html; const out = [...t.childNodes].filter((n) => n.nodeType === 1); out.forEach((n) => layers[layer].append(n)); return out.length === 1 ? out[0] : out; },
        async wait(ms) { check(); await new Promise((r) => setTimeout(r, ms)); check(); },
        async tween(ms, fn, e) { check(); const ok = await tween(run, ms, fn, e); if (!ok) throw STOP; },
        later(ms, fn) { setTimeout(() => { if (!run.stop) fn(); }, ms); },
        show(v) { point.setAttribute("opacity", v ? 1 : 0); },
        dim(v) { point.setAttribute("opacity", v); },
        tint(c) { ptS.querySelector(".pt-flame").setAttribute("fill", c || "url(#flameG)"); },
        size(r, ms) { const r0 = ptR; const set = (v) => { ptR = v; ptS.setAttribute("transform", `scale(${(v / 5).toFixed(3)})`); }; if (!ms || reduce) { set(r); return Promise.resolve(); } return ctx.tween(ms, (e) => set(r0 + (r - r0) * e)); },
        at(x, y) { place(x, y); },
        // move the camera inside a scene: start close, then pull back (the ground stays on the words line)
        async camera(to, ms) { check(); const ok = await moveCamera({ ...to, base: view.base }, ms); if (!ok) throw STOP; },
        get pt() { return { ...pt }; },
        async glide(x, y, ms, trail) {
          check();
          const from = { x: pt.x, y: pt.y }, mx = (from.x + x) / 2 + (y - from.y) * .18, my = (from.y + y) / 2 - Math.abs(x - from.x) * .12;
          let tr = null;
          if (trail) tr = ctx.el("trail", `<path class="tr" d="M${from.x} ${from.y} Q${mx} ${my} ${x} ${y}" pathLength="1" fill="none" stroke="rgba(255,214,140,.6)" style="--b:1.3" stroke-dasharray="1" stroke-dashoffset="1"/>`);
          await ctx.tween(ms, (e) => { place((1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * mx + e * e * x, (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * my + e * e * y); if (tr) tr.setAttribute("stroke-dashoffset", String(1 - e)); });
          if (tr) tr.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1600, fill: "forwards" }).onfinish = () => tr.remove();
        },
        // the flame travels the path and the line appears behind it
        async draw(p, secs, opts = {}) {
          check();
          const L = p.getTotalLength(), s0 = p.getPointAtLength(0);
          const m = p.getCTM(), cm = cam.getCTM(), w = (q) => new DOMPoint(q.x, q.y).matrixTransform(m).matrixTransform(cm.inverse());
          const w0 = w(s0);
          if (!opts.noGlide) await ctx.glide(w0.x, w0.y, opts.glide || 170);
          await ctx.tween(secs * 1000 * PACE * (opts.slow || 1), (e) => { p.style.strokeDashoffset = String(1 - e); const q = w(p.getPointAtLength(L * e)); place(q.x, q.y); }, opts.ease);
        },
        // follow a path without drawing it
        async follow(p, ms, from = 0, to = 1) { check(); const L = p.getTotalLength(); await ctx.tween(ms, (e) => { const q = p.getPointAtLength(L * (from + (to - from) * e)); place(q.x, q.y); }); },
        // many lines drawing themselves while the flame is elsewhere
        cascade(paths, ms, per = 90) { FL.flat(paths).forEach((p, i) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: ms, delay: i * per, easing: "ease-out", fill: "forwards" })); },
        sparks(x, y, n, color, up) {
          if (reduce) return;
          for (let j = 0; j < n; j++) {
            const s = ctx.el("top", `<circle cx="${x}" cy="${y}" r="${(2.4 * ptK).toFixed(1)}" fill="${color || "#FFF4D6"}" style="filter:drop-shadow(0 0 4px ${color || "#FFF4D6"})"/>`);
            const ang = (j / n) * Math.PI * 2 + Math.random() * .4, d = (30 + Math.random() * 70) * ptK;
            s.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d - (up ? 40 * ptK : 0)}px) scale(.3)`, opacity: 0 }], { duration: 1600 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
          }
        },
        ripple(x, y, r, color, ms = 1800) {
          if (reduce) return;
          const c = ctx.el("top", `<circle class="st" cx="${x}" cy="${y}" r="1" fill="none" stroke="${color || "rgba(255,214,140,.6)"}" style="--b:1.3"/>`);
          const t0 = performance.now();
          (function s(t) { const f = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - f, 3); c.setAttribute("r", (1 + (r - 1) * e).toFixed(1)); c.setAttribute("opacity", (1 - f).toFixed(2)); if (f < 1) requestAnimationFrame(s); else c.remove(); })(t0);
        },
        chord,
        phrases(delay = 1200, span = 7000) { const ph = page ? [...page.querySelectorAll(".ph")] : []; ph.forEach((x, i) => setTimeout(() => { if (!run.stop) x.classList.add("on"); }, delay + i * (span / Math.max(1, ph.length)))); },
        allWords() { if (page) page.querySelectorAll(".ph").forEach((x) => x.classList.add("on")); },
      };
      ["wait", "tween", "glide", "draw", "size", "follow", "camera"].forEach((k) => { const f = ctx[k]; ctx[k] = (...a) => { const p = f.apply(ctx, a); if (p && p.catch) p.catch(() => {}); return p; }; });
      return ctx;
    }

    /* the turn: from the story's lamp on the wall, the flame comes back down into the guest's own lamp */
    const CH = CHS.map((c, i) => ({ ...c, n: i + 1 }));
    const last = CH[CH.length - 1];
    CH.push({
      n: NCH + 1, turn: true, cam: S.turnCam || last.cam, bg: S.turnBg || last.bg, mood: "warm", text: S.turn,
      build() { return {}; },
      async play(ctx) {
        ctx.phrases(500, 3800);
        ctx.at(FL.wallLamp.x, FL.wallLamp.y); ctx.size(4.5, 0); ctx.show(true);
        await ctx.wait(1400);
        const r = $("#diya2 svg").getBoundingClientRect(), w = toWorld(r.left + r.width * .5, r.top + r.height * .36);
        await ctx.glide(w.x, w.y, 2800, true);
        ctx.show(false); $("#diya2").classList.add("lit");
        ctx.chord([261.63, 329.63, 392]);
      },
      settle(ctx) { ctx.show(false); $("#diya2").classList.add("lit"); },
    });

    /* ---------- the pages ---------- */
    const deck = $("#deck"), pQ = $("#pQ");
    const phrases = (t) => { const o = []; let cur = []; t.split(/\s+/).forEach((w) => { cur.push(w); if (/[,.;:!?]$/.test(w) || cur.length >= 5) { o.push(cur.join(" ")); cur = []; } }); if (cur.length) o.push(cur.join(" ")); return o; };
    const DIYA2 = `<button class="diya still" id="diya2" type="button" tabindex="-1" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="dglow" cx="60" cy="50" r="46" fill="url(#dGlow)"/><path class="dflame" d="M60 22 C70 37 68 51 60 56 C52 51 50 37 60 22 Z" fill="url(#dFlame)"/><path d="M16 64 Q60 106 104 64 Q84 70 78 58 L42 58 Q36 70 16 64 Z" fill="#2a1a14" stroke="#8a5a30" stroke-width="2"/></svg></button>`;
    CH.forEach((c) => {
      const sec = document.createElement("section");
      sec.className = "page story" + (c.turn ? " turnp" : ""); sec.id = "c" + c.n;
      sec.setAttribute("aria-label", c.turn ? "The turn" : c.k);
      const words = (Array.isArray(c.text) ? c.text : [c.text]).map((para) => phrases(para).map((p) => `<span class="ph">${esc(p)} </span>`).join("")).join(`<span class="br"></span>`);
      sec.innerHTML = c.turn
        ? `<div class="in center" tabindex="-1" style="gap:26px"><p class="turn">${words}</p>${DIYA2}</div>`
        : `<div class="in" tabindex="-1"><p class="k">${esc(c.k)}</p><p class="tell">${words}</p></div>`;
      deck.insertBefore(sec, pQ); c.page = sec; c.state = "new";
    });
    CH.forEach((c) => { c.ctx = makeCtx({ stop: false }, c.page); FL.B[c.n] = c.built = c.build(c.ctx) || {}; });
    const pages = [...deck.querySelectorAll(".page")];
    // the blank canvas, remembered, so a scene can be played again from where it began
    const SNAP = [...cam.querySelectorAll("#L-sky *, #L-far *, #L-fills *, #L-scene *, #L-hero *")].map((el) => [el, ["style", "class", "transform", "opacity"].map((a) => [a, el.getAttribute(a)])]);
    let current = null;
    function rewindTo(n) {
      if (current) current.stop = true;
      SNAP.forEach(([el, attrs]) => { el.getAnimations().forEach((a) => a.cancel()); attrs.forEach(([a, v]) => (v === null ? el.removeAttribute(a) : el.setAttribute(a, v))); });
      layers.top.innerHTML = ""; layers.trail.innerHTML = "";
      $("#diya2").classList.remove("lit"); point.setAttribute("opacity", 0); ptS.querySelector(".pt-flame").setAttribute("fill", "url(#flameG)");
      CH.forEach((c) => {
        if (c.n < n) { c.state = "done"; try { c.settle(c.ctx, c.built); } catch (e) { console.error(e); } c.ctx.allWords(); }
        else { c.state = "new"; c.page.querySelectorAll(".ph").forEach((x) => x.classList.remove("on")); }
      });
    }

    /* the thread of progress: one lamp per scene */
    $("#tdots").innerHTML = CHS.map((_, i) => { const f = NCH === 1 ? .5 : i / (NCH - 1), x = 12 + f * 126; return `<circle class="td" cx="${x.toFixed(1)}" cy="${(8 + 6 * 4 * f * (1 - f) * .9).toFixed(1)}" r="4"/>`; }).join("");
    const tdots = [...document.querySelectorAll(".td")];

    const baseFor = (page) => {
      if (wideScreen()) return innerHeight * .8;
      if (page && page.classList.contains("turnp")) return innerHeight * .4;
      if (page && page.classList.contains("story")) return page.querySelector(".in").getBoundingClientRect().top - 18;
      return innerHeight * .55;
    };
    const camFor = (c) => ({ ...c.cam, base: baseFor(c.page) });

    /* playing a chapter: once; nothing is ever erased; pushing on early finishes it */
    async function play(c, from) {
      if (current) current.stop = true;
      const run = { stop: false }; current = run;
      const ctx = makeCtx(run, c.page); c.ctx = ctx;
      if (c.bg) FL.setBg(c.bg);
      if (reduce) { c.state = "done"; await moveCamera(camFor(c), 0); c.settle(ctx, c.built); ctx.allWords(); return; }
      c.state = "playing";
      try {
        if (!(await moveCamera(camFor(c), c.n === 1 ? 0 : 1500))) throw STOP;
        await c.play(ctx, c.built, from);
        c.state = "done"; ctx.allWords();
        if (!c.turn) endTone(c.mood);
      } catch (e) { if (e !== STOP) { console.error(e); c.state = "done"; } }
    }
    function settle(c) { if (c.state === "playing") { c.state = "done"; if (current) current.stop = true; try { c.settle(c.ctx, c.built); } catch (e) { console.error(e); } c.ctx.allWords(); } }

    let idx = -1, busy = false, lit = false;
    const next = $("#next"), back = $("#back"), nav = $("#nav"), where = $("#where");
    function go(k, opts = {}) {
      if (k < 0 || k >= pages.length || k === idx || busy) return;
      busy = true;
      const prev = pages[idx];
      if (prev) { prev.classList.remove("here"); const pc = CH.find((c) => c.page === prev); if (pc) settle(pc); if (prev.id === "pO") Bindu.stop(); }
      idx = k; const p = pages[k]; p.classList.add("here");
      const c = CH.find((x) => x.page === p);
      // coming back to a scene plays it again, from the drawing as it stood when that scene began
      if (c && c.state !== "new") rewindTo(c.n);
      document.body.classList.toggle("storyp", !!c && !c.turn);
      document.body.classList.toggle("form", p.classList.contains("form")); document.body.classList.toggle("onward", p.id === "pO");
      nav.hidden = p.id === "p0";
      back.classList.toggle("gone", !(idx > 1));
      next.classList.toggle("gone", !(c || p.id === "pR"));
      where.textContent = c ? (c.turn ? "" : `${ROMAN[c.n]} of ${ROMAN[NCH]}`) : p.id === "pO" ? "" : "Your lamp";
      const chn = c ? Math.min(NCH, c.n) : p.id === "p0" ? 0 : NCH;
      tdots.forEach((d, i) => d.classList.toggle("lit", i < chn));
      if (c) play(c, opts.from);
      if (p.id === "pR") renderRoom();
      if (p.id === "pO") { renderFive(); Bindu.arm(); }
      const inn = p.querySelector(".in"); if (inn && !opts.noFocus) inn.focus({ preventScroll: true });
      setTimeout(() => { busy = false; }, 500);
    }
    const forwardOK = () => { const id = pages[idx].id; return !(id === "p0" && !lit) && !["pQ", "pS", "pO"].includes(id); };
    const backTarget = () => { const id = pages[idx].id; if (id === "pR" && rec.share === "skip") return pages.indexOf(pQ); return idx - 1; };
    const step = (dir) => { if (dir > 0) { if (forwardOK()) go(idx + 1); } else if (idx > 1) go(backTarget()); };
    next.addEventListener("click", () => step(1));
    back.addEventListener("click", () => step(-1));
    addEventListener("resize", () => { const c = CH.find((x) => x.page === pages[idx]); view.base = baseFor(c ? c.page : null); if (c) Object.assign(view, c.cam); frame(); Bindu.size(); });

    // swipe, wheel and keys: one deliberate push moves one page
    let ty = null, tt = 0;
    addEventListener("touchstart", (e) => { if (e.touches.length > 1 || (e.target.closest && e.target.closest("textarea, input, .choices, .lamps, .hold, .diya"))) { ty = null; return; } ty = e.touches[0].clientY; tt = performance.now(); }, { passive: true });
    addEventListener("touchend", (e) => { if (ty === null) return; const dy = ty - (e.changedTouches[0] || {}).clientY, v = Math.abs(dy) / Math.max(1, performance.now() - tt); ty = null; if (Math.abs(dy) > 120 || (Math.abs(dy) > 70 && v > .6)) step(Math.sign(dy)); });
    let acc = 0, lastW = 0, spent = false;
    addEventListener("wheel", (e) => { if (e.target.closest && e.target.closest("textarea")) return; e.preventDefault(); const now = performance.now(); if (now - lastW > 260) { acc = 0; spent = false; } lastW = now; if (spent || busy) return; acc += e.deltaY; if (Math.abs(acc) > 140) { spent = true; step(Math.sign(acc)); } }, { passive: false });
    addEventListener("keydown", (e) => {
      if (/input|textarea/i.test(e.target.tagName)) return;
      if (e.target.closest && e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
      const dir = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1 }[e.key];
      if (dir) { e.preventDefault(); step(dir); }
    });

    /* ---------- storage ---------- */
    const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
    const guestName = (() => { try { return localStorage.getItem("rk:sitarey-guest:v7") || ""; } catch (e) { return ""; } })();

    /* ---------- lighting the lamp: hold for a moment; light first, then the bell ---------- */
    const diya = $("#diya"), ringEl = $("#ring"), hint = $("#hint");
    if (guestName) $("#greet").insertAdjacentHTML("beforebegin", `<p class="lede" style="font-style:normal">Welcome, ${esc(guestName.split(" ")[0])}.</p>`);
    let hs = 0, hraf = 0, hp = 0;
    function holdTick() { hp = Math.min(1, (performance.now() - hs) / 700); ringEl.style.strokeDashoffset = String(1 - hp); if (hp >= 1) return strike(); hraf = requestAnimationFrame(holdTick); }
    function holdStart(e) { if (lit) return; if (e && e.pointerId !== undefined) { e.preventDefault(); try { diya.setPointerCapture(e.pointerId); } catch (_) {} } audio(); hs = performance.now(); cancelAnimationFrame(hraf); hraf = requestAnimationFrame(holdTick); }
    function holdEnd() { if (lit) return; cancelAnimationFrame(hraf); const from = hp; const t0 = performance.now(); (function drain(t) { const f = Math.min(1, (t - t0) / 300); hp = from * (1 - f); ringEl.style.strokeDashoffset = String(1 - hp); if (f < 1 && !lit) requestAnimationFrame(drain); })(t0); if (hp < 1) hint.textContent = "Keep holding until the ring closes"; }
    function strike() {
      lit = true; diya.classList.add("lit"); diya.setAttribute("aria-label", "The lamp is lit"); hint.textContent = "Your lamp is lit.";
      const L = store.get("fl:lit") || []; if (!L.includes(S.slug)) { L.push(S.slug); store.set("fl:lit", L); }
      try { navigator.vibrate && navigator.vibrate(18); } catch (_) {}
      setTimeout(bell, 140);
      setTimeout(() => { const r = diya.querySelector("svg").getBoundingClientRect(); moveCamera(camFor(CH[0]), 0); const w = toWorld(r.left + r.width * .5, r.top + r.height * .36); go(1, { from: w }); }, reduce ? 300 : 1300);
    }
    diya.addEventListener("pointerdown", holdStart);
    ["pointerup", "pointercancel"].forEach((t) => diya.addEventListener(t, holdEnd));
    diya.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); holdStart(); } });
    diya.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") holdEnd(); });
    diya.addEventListener("contextmenu", (e) => e.preventDefault());

    /* ---------- the private question: hold to keep ---------- */
    const KEY = "fl:lamp:" + S.code;
    const rec = Object.assign({ code: S.code, story: S.slug, question: S.question }, store.get(KEY) || {});
    if (!rec.cwid) rec.cwid = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    const answer = $("#answer"), keep = $("#keep"), keepFill = $("#keepFill"), keepLabel = $("#keepLabel"), receipt = $("#receipt");
    let kept = false, ks = 0, kraf = 0;
    function keptState(saved) {
      kept = true; keep.classList.add("kept"); keepFill.style.transform = "scaleX(1)"; keepLabel.textContent = "Kept";
      receipt.textContent = saved ? "Kept on this phone. Only you can see it. Nothing else was sent." : "Kept on this page for now. Only you can see it. Nothing else was sent.";
      receipt.hidden = false; $("#toShare").hidden = false; $("#skip").hidden = true;
    }
    if (rec.words) { answer.value = rec.words; keptState(true); }
    function kTick() { const p = Math.min(1, (performance.now() - ks) / 1250); keepFill.style.transform = `scaleX(${p})`; if (p >= 1) return kDone(); kraf = requestAnimationFrame(kTick); }
    function kStart(e) {
      if (kept) return;
      if (!answer.value.trim()) { keepLabel.textContent = "Write a few words first, or skip below"; return; }
      if (e && e.pointerId !== undefined) { e.preventDefault(); try { keep.setPointerCapture(e.pointerId); } catch (_) {} }
      if (document.activeElement === answer) answer.blur();
      keepLabel.textContent = "Keep holding"; ks = performance.now(); kraf = requestAnimationFrame(kTick);
    }
    function kEnd() { if (kept) return; cancelAnimationFrame(kraf); keepFill.style.transform = "scaleX(0)"; if (answer.value.trim()) keepLabel.textContent = "Hold to keep it"; }
    function kDone() { cancelAnimationFrame(kraf); rec.words = answer.value.trim(); rec.at = new Date().toISOString(); keptState(store.set(KEY, rec)); }
    answer.addEventListener("input", () => { if (kept && answer.value.trim() !== rec.words) { kept = false; keep.classList.remove("kept"); keepFill.style.transform = "scaleX(0)"; receipt.hidden = true; $("#toShare").hidden = true; $("#skip").hidden = false; } if (!kept) keepLabel.textContent = "Hold to keep it"; });
    keep.addEventListener("pointerdown", kStart);
    ["pointerup", "pointercancel"].forEach((t) => keep.addEventListener(t, kEnd));
    keep.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); kStart(); } });
    keep.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") kEnd(); });
    keep.addEventListener("contextmenu", (e) => e.preventDefault());
    $("#toShare").addEventListener("click", () => go(pages.indexOf($("#pS"))));
    $("#skip").addEventListener("click", () => { rec.share = "skip"; go(pages.indexOf($("#pR"))); });

    /* ---------- the share choice: reciprocal; an anonymous answer never shows a name ---------- */
    const choices = [...document.querySelectorAll(".choice")], lightIt = $("#lightIt"), nameRow = $("#nameRow"), shareName = $("#shareName");
    shareName.value = guestName;
    let pick = rec.share && rec.share !== "skip" ? rec.share : null;
    function choose(s) {
      pick = s; choices.forEach((x) => x.setAttribute("aria-checked", String(x.dataset.share === s)));
      nameRow.hidden = s !== "named";
      lightIt.disabled = false; lightIt.textContent = s === "mine" ? "Keep it mine" : "Light it";
    }
    if (pick) choose(pick);
    choices.forEach((c) => c.addEventListener("click", () => choose(c.dataset.share)));
    shareName.addEventListener("input", () => { $("label[for=shareName]").textContent = "Your name, as the room will see it"; });
    lightIt.addEventListener("click", () => {
      if (!pick) return;
      if (pick === "named" && !shareName.value.trim()) { shareName.focus(); $("label[for=shareName]").textContent = "Please add the name the room should see"; return; }
      rec.share = pick; rec.name = pick === "named" ? shareName.value.trim() : ""; store.set(KEY, rec);
      go(pages.indexOf($("#pR")));
    });

    /* ---------- the room: the lamps others lit; shown once three are lit ---------- */
    const MIN_COUNT = 3;
    function renderRoom() {
      const share = rec.share || "skip", wrap = $("#lamps"), words = $("#roomWords");
      const items = (S.samples || []).map((w) => ({ w, by: "No name" }));
      if (share === "anon") items.unshift({ w: rec.words, by: "You · shared without your name", mine: true });
      if (share === "named") items.unshift({ w: rec.words, by: `${rec.name} (you)`, mine: true });
      if (share === "mine" && rec.words) items.unshift({ w: rec.words, by: "You · kept just for you", mine: true, dim: true });
      const sharedCount = items.filter((x) => !x.dim).length;
      $("#roomNote").textContent = (share === "named" ? "Names appear only for people who chose to share theirs. " : "") + "Preview: the other lamps are examples written for this page. In the hall, they will be guests' own words.";
      if (sharedCount < MIN_COUNT) { $("#roomH").textContent = "The room opens when three lamps are lit."; wrap.innerHTML = ""; words.innerHTML = ""; return; }
      $("#roomH").textContent = `${sharedCount} lamps are lit`;
      wrap.innerHTML = items.slice(0, 6).map((x, i) => `<button class="lampBtn${x.dim ? " dim" : ""}" type="button" aria-pressed="false" data-i="${i}" aria-label="${x.mine ? "Your lamp" : "A lamp from the room"}">${LAMPICO()}</button>`).join("");
      const show = (i) => { [...wrap.children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === i))); const x = items[i]; words.innerHTML = `<blockquote>${esc(x.w)}</blockquote><p class="by">${esc(x.by)}</p>`; };
      wrap.querySelectorAll(".lampBtn").forEach((b) => b.addEventListener("click", () => show(+b.dataset.i)));
      show(0);
    }

    /* ---------- the five lamps of the wall ---------- */
    function renderFive() {
      const L = store.get("fl:lit") || [S.slug], left = NAMES.length - NAMES.filter((n) => L.includes(n.toLowerCase().replace(/\s+/g, "-"))).length;
      $("#oH").textContent = left ? `${WORDS[left]} more lamp${left > 1 ? "s are" : " is"} waiting on the wall.` : "You have lit all five lamps.";
      $("#five").innerHTML = NAMES.map((n) => { const slug = n.toLowerCase().replace(/\s+/g, "-"), on = L.includes(slug); return `<figure class="${on ? "on" : ""}${slug === S.slug ? " here" : ""}">${LAMPICO()}<figcaption>${esc(n)}</figcaption></figure>`; }).join("");
    }

    /* ---------- Bindu: if you stay on the last page, the point comes to dance ----------
       From the Bindu Dances grammar, without a song: a breath drives it; it blooms in stages (ghost trail, orbital
       rings, rays and particles, a crown), traces infinity, a heart and a flower with the breath still shaking the pen,
       then spirals home to a single dot, rests, and begins again. */
    const Bindu = (() => {
      const cv = $("#bindu"), g = cv.getContext("2d");
      let W = 0, H = 0, raf = 0, armT = 0, t0 = 0, lastF = 0, wake = null;
      const trail = [], rings = [], parts = []; let blend = 0, shapeT = 0, lastRing = 0;
      const HUE = S.binduHue || 42; const LT = S.light ? -28 : 0;   // on a light page the Bindu is drawn deeper so it can be seen
      const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
      const SH = {
        inf: (t, r) => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [r * c / d, r * s * c / d]; },
        heart: (t, r) => { const s = r / 17, st = Math.sin(t); return [16 * s * st * st * st, -s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2)]; },
        rose: (t, r) => { const rr = r * Math.cos(3 * t); return [rr * Math.cos(t), rr * Math.sin(t)]; },
      };
      // [from, to, shape, maxBlend, stage]
      const PLAN = [[0, 5, null, 0, 0], [5, 13, null, 0, 1], [13, 22, "inf", .7, 2], [22, 31, "heart", .85, 3], [31, 40, "rose", .85, 4], [40, 47, "home", 1, 4], [47, 53, null, 0, 0]];
      const CYCLE = 53;
      const breath = (t) => .55 + .22 * Math.sin(t * 1.3) + .15 * Math.sin(t * .47 + 1) + .06 * Math.sin(t * 3.1);
      const sm = (x) => x * x * (3 - 2 * x);
      function frameB(now) {
        const dt = Math.min(.05, (now - (lastF || now)) / 1000); lastF = now;
        const T = Math.max(0, (now - t0) / 1000), t = T % CYCLE, E = breath(T);
        const seg = PLAN.find((p) => t >= p[0] && t < p[1]) || PLAN[0];
        const cx = W / 2, cy = H * .64, R = Math.min(W, H) * .3;
        let target = 0;
        if (seg[2]) { const a = Math.min(1, (t - seg[0]) / 1.6), b = Math.min(1, (seg[1] - t) / 2); target = seg[3] * sm(Math.min(a, seg[2] === "home" ? 1 : b)); }
        blend += (target - blend) * .05;
        const bx = cx + Math.sin(T * .4) * R * .5 * (.5 + E * .6), by = cy + Math.sin(T * .23 + 1) * R * .25 - (E - .5) * R * .3;
        let sx = 0, sy = 0;
        if (seg[2] === "home") { const p = 1 - (t - seg[0]) / (seg[1] - seg[0]), a = (t - seg[0]) * 3.2; sx = Math.cos(a) * R * .8 * p; sy = Math.sin(a) * R * .8 * p; }
        else if (seg[2]) { shapeT += dt * (1.1 + E * .9); [sx, sy] = SH[seg[2]](shapeT, R * .8); }
        const x = bx * (1 - blend) + (cx + sx) * blend, y = by * (1 - blend) + (cy + sy) * blend;
        const stage = seg[4], fadeIn = Math.min(1, T / 2.5), restFade = seg === PLAN[6] ? Math.max(.35, 1 - (t - 47) / 3) : 1;
        g.clearRect(0, 0, W, H);
        g.globalCompositeOperation = S.light ? "source-over" : "lighter";
        // crown mandala
        if (stage >= 4) { const a = .1 * Math.min(1, (t - 31) / 3); g.strokeStyle = `hsla(${HUE},90%,${62 + LT}%,${a})`; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 720; i++) { const th = i / 720 * Math.PI * 2, rr = R * 1.05 * Math.cos(6 * th + T * .05); const px = cx + rr * Math.cos(th + T * .05), py = cy + rr * Math.sin(th + T * .05); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
        // rays
        if (stage >= 3) { g.strokeStyle = `hsla(${HUE},95%,${70 + LT}%,${.12 + E * .12})`; g.lineWidth = 1; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + T * .2, L = R * (.12 + E * .14); g.beginPath(); g.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } }
        // rings
        if (stage >= 2 && T - lastRing > 1.5 - E * .5) { rings.push({ x, y, r: 6, a: .55 }); lastRing = T; }
        for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.r += dt * 55; r.a -= dt * .32; if (r.a <= 0) { rings.splice(i, 1); continue; } g.strokeStyle = `hsla(${HUE},90%,${65 + LT}%,${r.a})`; g.lineWidth = 1.2; g.beginPath(); g.arc(r.x, r.y, r.r, 0, Math.PI * 2); g.stroke(); }
        // particles
        if (stage >= 3 && Math.random() < .5) { const a = Math.random() * Math.PI * 2, v = 12 + Math.random() * 30; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8, life: 2.2 }); }
        for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } g.fillStyle = `hsla(${HUE},100%,${75 + LT}%,${p.life / 2.2 * .7})`; g.beginPath(); g.arc(p.x, p.y, 1.4, 0, Math.PI * 2); g.fill(); }
        // ghost trail
        trail.push([x, y]); const N = stage >= 1 ? Math.round(36 + blend * 46) : 5; while (trail.length > N) trail.shift();
        trail.forEach(([px, py], i) => { const f = i / trail.length; g.fillStyle = `hsla(${HUE},95%,${60 + f * 20 + LT}%,${f * .5 * fadeIn * restFade})`; g.beginPath(); g.arc(px, py, .8 + f * 2.4, 0, Math.PI * 2); g.fill(); });
        // the dot
        g.globalCompositeOperation = "source-over";
        const r0 = (3.4 + E * 2.6) * fadeIn;
        const grd = g.createRadialGradient(x, y, 0, x, y, r0 * 7); grd.addColorStop(0, `hsla(${HUE},100%,${80 + LT}%,${.55 * restFade})`); grd.addColorStop(1, `hsla(${HUE},100%,${60 + LT}%,0)`);
        g.fillStyle = grd; g.beginPath(); g.arc(x, y, r0 * 7, 0, Math.PI * 2); g.fill();
        g.fillStyle = `hsla(${HUE},100%,${92 + LT}%,${fadeIn})`; g.beginPath(); g.arc(x, y, r0, 0, Math.PI * 2); g.fill();
        raf = requestAnimationFrame(frameB);
      }
      function start() {
        size(); cv.classList.add("on"); t0 = performance.now(); lastF = 0; trail.length = rings.length = parts.length = 0; blend = 0; shapeT = 0; lastRing = 0;
        if ("wakeLock" in navigator) navigator.wakeLock.request("screen").then((w) => (wake = w)).catch(() => {});
        if (reduce) { const cx = W / 2, cy = H * .64; const grd = g.createRadialGradient(cx, cy, 0, cx, cy, 40); grd.addColorStop(0, `hsla(${HUE},100%,80%,.6)`); grd.addColorStop(1, `hsla(${HUE},100%,60%,0)`); g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, 40, 0, Math.PI * 2); g.fill(); return; }
        raf = requestAnimationFrame(frameB);
      }
      return {
        size,
        arm() { clearTimeout(armT); armT = setTimeout(start, 3000); },
        stop() { clearTimeout(armT); cancelAnimationFrame(raf); cv.classList.remove("on"); if (wake) { wake.release().catch(() => {}); wake = null; } },
      };
    })();

    // hooks for checking the drawing at rest
    window.__fl = { go, pages, CH, settleAll() { CH.forEach((c) => { c.state = "done"; c.settle(c.ctx, c.built); c.ctx.allWords(); }); }, show(c) { moveCamera(camFor(c), 0); } };
    go(0, { noFocus: true });
  };
})();
