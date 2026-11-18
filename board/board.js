/* The Room's Flame: the touch board for the Diwali evening (Sat 21 Nov 2026).
   Rest: a night sky, ONE flame (the film's flame, copied from ../film/engine.js because the engine keeps it private),
   and nine lamps, root to Maya. A touch sends a spark from the lamp into the flame, the flame grows a little for the
   night (count kept in this board's localStorage, never shown), and the lamp's film scene plays full screen with its
   name, its question and, from about 5 s, the Do card. After the 32 s arc the board returns to rest on its own.
   Scenes are the film's own files, registered through the FILM shim in index.html and driven with the engine's E API.
   ?idle=N sets the attract delay in seconds (default 90); ?dpr=N sets the canvas pixel ratio (default 1). */
(() => {
'use strict';
const PANELS = FILM.PANELS, REG = window.BOARD_REG;
const Q = new URLSearchParams(location.search);
const IDLE = +Q.get('idle') || 90;
const BOARD = window.BOARD = { costs: [], resp: [] };

/* ---------- maths and sprites (as in ../film/engine.js) ---------- */
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967295};
const sm=t=>t*t*(3-2*t);
const noise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=sm(x-xi),yf=sm(y-yi);const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*xf+(c-a)*yf+(a-b-c+d)*xf*yf};
const fbm=(x,y)=>noise(x,y)*.56+noise(x*2.1,y*2.1)*.29+noise(x*4.3,y*4.3)*.15;
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), lerp=(a,b,t)=>a+(b-a)*t;
const rand=seed=>{let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}};
function sprite(stops,size=64){const s=document.createElement('canvas');s.width=s.height=size;const c=s.getContext('2d');const g=c.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(([o,col])=>g.addColorStop(o,col));c.fillStyle=g;c.fillRect(0,0,size,size);return s}
const SP={hot:sprite([[0,'rgba(255,246,222,1)'],[.25,'rgba(255,214,140,.75)'],[.6,'rgba(240,130,50,.22)'],[1,'rgba(240,130,50,0)']]),
 emb:sprite([[0,'rgba(255,190,110,1)'],[.3,'rgba(232,110,40,.6)'],[1,'rgba(160,40,16,0)']]),
 glow:sprite([[0,'rgba(255,214,150,.9)'],[.3,'rgba(240,150,70,.35)'],[1,'rgba(240,130,50,0)']],256),
 white:sprite([[0,'rgba(255,255,255,1)'],[.3,'rgba(255,255,255,.45)'],[1,'rgba(255,255,255,0)']])};
/* the board's own glows: large sprites computed per pixel, with a smooth falloff to exactly zero at the rim and a
   little dithering noise, so they stay round and band-free when drawn at full-screen sizes */
function soft(size,fn){ const s=document.createElement('canvas'); s.width=s.height=size; const c=s.getContext('2d'), im=c.createImageData(size,size), d=im.data, h=size/2, r0=rand(size*7+3);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){ const r=Math.hypot(x+.5-h,y+.5-h)/h, o=(y*size+x)*4; if(r>=1) continue;
    const v=fn(r), fade=1-ss(.82,1,r), n=r0()-r0(); d[o]=clamp(v[0]+n*1.5,0,255); d[o+1]=clamp(v[1]+n*1.5,0,255); d[o+2]=clamp(v[2]+n*1.5,0,255); d[o+3]=clamp(v[3]*fade*255+n*1.2,0,255); }
  c.putImageData(im,0,0); return s; }
const gauss=(r,k)=>Math.exp(-r*r*k);
const HS={ glow:soft(768,r=>{ const t=ss(0,.6,r); return [255-15*t,214-70*t,150-95*t,.9*(.62*gauss(r,9)+.38*gauss(r,3.2))]; }),
  hot:soft(512,r=>{ const t=ss(0,.7,r); return [255-15*t,246-110*t,222-170*t,.8*gauss(r,7)+.2*gauss(r,30)]; }),
  white:soft(384,r=>[255,255,255,.7*gauss(r,12)+.3*gauss(r,40)]) };
function haloOf(c){ const w=[255,236,200]; return soft(512,r=>{ const k=ss(0,.35,r), cc=[c[0]+(w[0]-c[0])*.35*(1-k),c[1]+(w[1]-c[1])*.35*(1-k),c[2]+(w[2]-c[2])*.35*(1-k)]; return [cc[0],cc[1],cc[2],.85*(.55*gauss(r,10)+.45*gauss(r,3.6))]; }); }
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const rgba=(c,a)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

/* ---------- the one flame (from ../film/engine.js) ---------- */
const FW=96,FH=150, fc=document.createElement('canvas'); fc.width=FW; fc.height=FH; const fx=fc.getContext('2d'), fimg=fx.createImageData(FW,FH);
const ramp=[[0,124,26,10],[.2,214,86,26],[.4,248,158,64],[.6,255,214,146],[.78,255,238,206],[1.2,255,250,238]];
const col=t=>{for(let k=1;k<ramp.length;k++){if(t<=ramp[k][0]){const a=ramp[k-1],b=ramp[k],u=(t-a[0])/(b[0]-a[0]);return [a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u]}}return [255,250,236]};
function flameField(t){ const d=fimg.data,bs=FH*.94,y0=.34;
  for(let py=0;py<FH;py++){ const hN=(bs-py)/(bs*.96);
    for(let px=0;px<FW;px++){ const o=(py*FW+px)*4; d[o+3]=0; if(hN<0||hN>1) continue;
      const hh=y0*Math.log(1+hN/y0), sway=(noise(hN*2.2-t*.55,3.7)-.5)*.2*hN;
      const wdt=.235*Math.pow(Math.sin(Math.PI*Math.pow(hN,.5)),.85)*(1-hN*.32)+.012;
      const dx=Math.abs(px/FW-.5-sway)/wdt, n=fbm(px/FW*4.6+11,hh*7.5-t*1.55);
      const fld=1-dx-(n-.5)*1.15*(.16+hN*.95); if(fld<=0) continue;
      const temp=Math.pow(fld*(1.02-Math.pow(hN,1.9)*.82),.82), c=col(temp); let r=c[0],g=c[1],b=c[2];
      if(hN<.14){const k=(1-hN/.14)*ss(0,.5,dx)*.9; r=r*(1-k)+70*k; g=g*(1-k)+105*k; b=b*(1-k)+255*k;}
      d[o]=r; d[o+1]=g; d[o+2]=b; d[o+3]=255*ss(0,.2,temp); }}
  fx.putImageData(fimg,0,0); }
function drawFlame(c,x,base,s,a){ if(a<=0||s<=0) return; const w=120*s, h=w*FH/FW;
  c.globalCompositeOperation='lighter';
  c.globalAlpha=.55*a; c.drawImage(HS.glow,x-w*2.6,base-h*.55-w*2.6,w*5.2,w*5.2);
  c.globalAlpha=.9*a;  c.drawImage(HS.hot,x-w*.9,base-h*.35-w*.9,w*1.8,w*1.8);
  c.globalCompositeOperation='source-over';
  c.globalAlpha=.5*a; c.drawImage(fc,x-w*.62,base-h*.98,w*1.24,h*1.04);
  c.globalAlpha=a;    c.drawImage(fc,x-w/2,base-h*.94,w,h);
  c.globalCompositeOperation='lighter'; c.globalAlpha=.32*a; c.drawImage(HS.white,x-w*.42,base-h*.5-w*.42,w*.84,w*.84);
  c.globalCompositeOperation='source-over'; c.globalAlpha=1; }

/* ---------- stage ---------- */
const cv=document.getElementById('b-stage'), out=cv.getContext('2d');
const SL=document.createElement('canvas');            // the scene's layer
const S={W:0,H:0,DPR:1,U:1};
const qd=+Q.get('dpr');
function size(){ S.DPR=qd>0?Math.min(3,qd):1; S.W=innerWidth; S.H=innerHeight; S.U=Math.min(S.W/1920,S.H/1080);
  for(const c of [cv,SL]){ c.width=Math.round(S.W*S.DPR); c.height=Math.round(S.H*S.DPR); } }

/* ---------- the night's count (this board only; never shown) ---------- */
const KEY='sitare.board.2026.lamps';
let tally={n:0,per:[0,0,0,0,0,0,0,0,0]};
try{ const v=JSON.parse(localStorage.getItem(KEY)||'null'); if(v&&typeof v.n==='number'&&Array.isArray(v.per)&&v.per.length===9) tally=v; }catch(e){}
function bump(i){ tally.n++; tally.per[i]++; try{ localStorage.setItem(KEY,JSON.stringify(tally)); }catch(e){} }
const growth=()=>1-Math.exp(-tally.n/28);            // 0 → 1 over the evening
let shownGrowth=growth();                              // eased, so each touch visibly feeds the flame

/* ---------- the rest world (geometry and baked layers) ---------- */
const R={};
function buildRest(){
  const W=S.W,H=S.H,D=S.DPR,U=S.U, r=rand(20261121);
  R.FX=W/2; R.FB=H*.47;                                // flame base
  R.LY=H*.792;                                          // lamp cup rim
  R.GY=R.LY+30*U;                                       // the ledge the lamps sit on
  R.lamps=PANELS.map((p,i)=>({p,i,x:W*(.1+i*.1),y:R.LY,c:hex(p.colour)}));
  // background
  const bg=document.createElement('canvas'); bg.width=Math.round(W*D); bg.height=Math.round(H*D); const b=bg.getContext('2d'); b.scale(D,D);
  let g=b.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#04030a'); g.addColorStop(.38,'#0a0716'); g.addColorStop(.66,'#140b1e'); g.addColorStop(R.GY/H,'#1d0f1d'); g.addColorStop(R.GY/H+.002,'#0b0710'); g.addColorStop(1,'#050308');
  b.fillStyle=g; b.fillRect(0,0,W,H);
  // a warm breath of light behind the flame (the live glow sits on top of this)
  g=b.createRadialGradient(R.FX,R.FB-60*U,0,R.FX,R.FB-60*U,H*.75); g.addColorStop(0,'rgba(120,64,40,.42)'); g.addColorStop(.35,'rgba(70,32,40,.2)'); g.addColorStop(1,'rgba(20,10,30,0)');
  b.fillStyle=g; b.fillRect(0,0,W,H);
  // the horizon: each lamp's colour washes the ledge and the air just above it
  for(const L of R.lamps){ const gg=b.createRadialGradient(L.x,R.GY,0,L.x,R.GY,W*.085); gg.addColorStop(0,rgba(L.c,.28)); gg.addColorStop(.5,rgba(L.c,.08)); gg.addColorStop(1,rgba(L.c,0));
    b.save(); b.translate(L.x,R.GY); b.scale(1,.55); b.translate(-L.x,-R.GY); b.fillStyle=gg; b.fillRect(L.x-W*.09,R.GY-W*.09,W*.18,W*.18); b.restore(); }
  // the ledge line
  g=b.createLinearGradient(0,0,W,0); g.addColorStop(0,'rgba(242,210,154,0)'); g.addColorStop(.12,'rgba(242,210,154,.22)'); g.addColorStop(.5,'rgba(242,210,154,.34)'); g.addColorStop(.88,'rgba(242,210,154,.22)'); g.addColorStop(1,'rgba(242,210,154,0)');
  b.fillStyle=g; b.fillRect(0,R.GY,W,Math.max(1,1.2*U));
  // stars: many small, fewer as they near the horizon and the flame
  for(let k=0;k<520;k++){ const x=r()*W, y=Math.pow(r(),1.5)*H*.66, d=Math.hypot(x-R.FX,(y-R.FB)*1.4)/(H*.5);
    const a=(.18+r()*.55)*(1-ss(.4,.66,y/H))*ss(.25,.9,d); if(a<.03) continue; const s=(r()<.08?1.9:1)*(.6+r()*.9)*Math.max(1,U);
    b.fillStyle=`rgba(${230+r()*25|0},${220+r()*30|0},${235+r()*20|0},${a})`; b.beginPath(); b.arc(x,y,s*.6,0,7); b.fill(); }
  // threads: faint arcs of light from each lamp to the flame (the spark's road)
  b.lineCap='round';
  for(const L of R.lamps){ const p=pathOf(L); b.beginPath(); b.moveTo(p[0],p[1]); b.quadraticCurveTo(p[2],p[3],p[4],p[5]);
    const lg=b.createLinearGradient(p[0],p[1],p[4],p[5]); lg.addColorStop(0,rgba(L.c,.26)); lg.addColorStop(.6,rgba(mix(L.c,[255,230,190],.5),.1)); lg.addColorStop(1,'rgba(255,230,190,0)');
    b.strokeStyle=lg; b.lineWidth=1.6*U; b.stroke(); }
  { const im=b.getImageData(0,0,bg.width,bg.height), d=im.data; let z=0x9e3779b9; for(let k=0;k<d.length;k+=4){ z^=z<<13; z^=z>>>17; z^=z<<5; const n=((z>>>0)/4294967296-.5)*2.2; d[k]+=n; d[k+1]+=n; d[k+2]+=n; } b.putImageData(im,0,0); }
  R.bg=bg;
  // twinkles
  R.tw=[]; for(let k=0;k<70;k++){ const x=r()*W, y=Math.pow(r(),1.4)*H*.55; if(Math.hypot(x-R.FX,y-R.FB*.8)<H*.2) continue; R.tw.push({x,y,s:(5+r()*10)*U,f:.25+r()*.6,ph:r()*7}); }
  // motes rising from the flame
  R.motes=[]; for(let k=0;k<26;k++) R.motes.push({x:R.FX+(r()-.5)*60*U,y:R.FB-r()*H*.5,v:(14+r()*22)*U,ph:r()*7,s:(3+r()*5)*U,life:r()});
  // per-lamp sprites: the diya (cup in the panel's colour, lit from above) and its halo
  R.big=bigDiya(U,D);
  for(const L of R.lamps){ L.cup=diya(L.c,U,D); L.halo=haloOf(L.c); L.dot=sprite([[0,rgba(mix(L.c,[255,236,200],.35),.9)],[.3,rgba(L.c,.35)],[1,rgba(L.c,0)]],64); L.lit=.55; L.flare=0; }
}
function bigDiya(U,D){ // the room's lamp: a wide brass diya under the one flame
  const w=330*U, h=96*U, cv=document.createElement('canvas'); cv.width=Math.ceil(w*D); cv.height=Math.ceil(h*D); const x=cv.getContext('2d'); x.scale(D,D);
  const cx=w/2, top=h*.26, rx=w*.46;
  const body=new Path2D(); body.moveTo(cx-rx,top); body.bezierCurveTo(cx-rx*.9,top+h*.78,cx+rx*.9,top+h*.78,cx+rx,top); body.closePath();
  let g=x.createLinearGradient(0,top,0,top+h*.6); g.addColorStop(0,'#f3d9a0'); g.addColorStop(.18,'#c9a24c'); g.addColorStop(.6,'#6e4a1c'); g.addColorStop(1,'#24150a');
  x.fillStyle=g; x.fill(body);
  g=x.createLinearGradient(cx-rx,0,cx+rx,0); g.addColorStop(0,'rgba(8,4,6,.6)'); g.addColorStop(.3,'rgba(8,4,6,0)'); g.addColorStop(.5,'rgba(255,240,200,.12)'); g.addColorStop(.7,'rgba(8,4,6,0)'); g.addColorStop(1,'rgba(8,4,6,.6)');
  x.fillStyle=g; x.fill(body);
  // a ring of nine small notches in the panel colours along the bowl
  PANELS.forEach((p,i)=>{ const u=(i+.5)/9, bx=cx-rx*.78+rx*1.56*u, by=top+h*.2+Math.sin(Math.PI*u)*h*.16; x.beginPath(); x.arc(bx,by,3.4*U,0,7); x.fillStyle=p.colour; x.globalAlpha=.9; x.fill(); x.globalAlpha=1; });
  x.beginPath(); x.ellipse(cx,top,rx,h*.1,0,0,7); x.fillStyle='#3a240e'; x.fill();
  x.beginPath(); x.ellipse(cx,top+h*.01,rx*.9,h*.07,0,0,7); g=x.createRadialGradient(cx,top,0,cx,top,rx); g.addColorStop(0,'rgba(255,236,190,1)'); g.addColorStop(.4,'rgba(230,170,80,.9)'); g.addColorStop(1,'rgba(120,70,20,.8)'); x.fillStyle=g; x.fill();
  x.lineWidth=1.6*U; x.strokeStyle='rgba(255,236,196,.85)'; x.beginPath(); x.ellipse(cx,top,rx,h*.1,0,Math.PI*1.02,Math.PI*1.98); x.stroke();
  cv.w=w; cv.h=h; cv.top=top; return cv; }
function pathOf(L){ const W=S.W,H=S.H,U=S.U, x0=L.x, y0=L.y-46*U, x1=R.FX, y1=R.FB-40*U; return [x0,y0, lerp(x0,x1,.35), lerp(y0,y1,.5)-H*.2, x1,y1]; }
function diya(c,U,D){ // a clay diya: a shallow round bowl with a pinched spout, oil glinting
  const w=150*U, h=70*U, cv=document.createElement('canvas'); cv.width=Math.ceil(w*D); cv.height=Math.ceil(h*D); const x=cv.getContext('2d'); x.scale(D,D);
  const cx=w/2, top=h*.30, rx=w*.40, depth=h*.62;
  const body=new Path2D(); body.moveTo(cx-rx,top); body.bezierCurveTo(cx-rx*.95,top+depth*.95,cx+rx*.95,top+depth*.95,cx+rx,top);
  body.quadraticCurveTo(cx+rx*1.12,top-h*.2,cx+rx*1.22,top-h*.24);   // the spout lip on the right lifts
  body.quadraticCurveTo(cx+rx*.9,top-h*.04,cx+rx*.62,top-h*.06); body.lineTo(cx-rx*.9,top-h*.05); body.closePath();
  let g=x.createLinearGradient(0,top-h*.2,0,top+depth); g.addColorStop(0,rgba(mix(c,[255,226,180],.45),1)); g.addColorStop(.35,rgba(c,1)); g.addColorStop(1,rgba(mix(c,[16,8,10],.72),1));
  x.fillStyle=g; x.fill(body);
  // side shading for roundness
  g=x.createLinearGradient(cx-rx,0,cx+rx,0); g.addColorStop(0,'rgba(10,4,8,.55)'); g.addColorStop(.35,'rgba(10,4,8,0)'); g.addColorStop(.7,'rgba(10,4,8,0)'); g.addColorStop(1,'rgba(10,4,8,.45)');
  x.fillStyle=g; x.fill(body);
  // the rim and the oil
  x.beginPath(); x.ellipse(cx-rx*.05,top-h*.045,rx*.92,h*.085,0,0,7); x.fillStyle=rgba(mix(c,[30,14,8],.55),1); x.fill();
  x.beginPath(); x.ellipse(cx-rx*.05,top-h*.03,rx*.78,h*.055,0,0,7); g=x.createLinearGradient(cx-rx,0,cx+rx,0); g.addColorStop(0,'rgba(120,70,20,.6)'); g.addColorStop(.75,'rgba(255,214,140,.9)'); g.addColorStop(1,'rgba(255,240,200,.95)'); x.fillStyle=g; x.fill();
  x.lineWidth=1.2*U; x.strokeStyle=rgba(mix(c,[255,236,200],.6),.8); x.beginPath(); x.ellipse(cx-rx*.05,top-h*.045,rx*.92,h*.085,0,Math.PI*1.05,Math.PI*1.95); x.stroke();
  cv.wx=cx+rx*1.08; cv.wy=top-h*.16; cv.w=w; cv.h=h;    // the wick, at the spout
  return cv; }

/* ---------- scene host: the engine's E, for one scene at a time ---------- */
const E={ mode:'projector', seeking:false, get ctx(){return E._ctx}, rand, noise, fbm, ss, clamp, lerp, sprite, SP,
  put(sp,x,y,s,a=1){ if(a<=0||s<=0) return; const c=E._ctx; c.globalAlpha=a; c.drawImage(sp,x-s/2,y-s/2,s,s); c.globalAlpha=1; },
  qr(){ /* the photos code belongs to the film's festive scenes, not to the board */ },
  glow(x,y,r,a,b){ const c=E._ctx,g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,a); g.addColorStop(1,b); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); } };
const sctx=SL.getContext('2d');
function sceneBind(p){ E._ctx=sctx; E.W=S.W; E.H=S.H; E.DPR=S.DPR; E.panel=p; }
function sceneInit(cur){ const c=sctx; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,SL.width,SL.height); c.setTransform(S.DPR,0,0,S.DPR,0,0);
  sceneBind(cur.p); cur.d.init&&cur.d.init(E); c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; }
function sceneDraw(cur,t,dt){ const c=sctx; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,SL.width,SL.height);
  c.setTransform(S.DPR,0,0,S.DPR,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; sceneBind(cur.p);
  cur.d.draw(E,t,dt); c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; }
const lampOf=(cur,t)=>cur.d.lamp?cur.d.lamp.call(cur.d,clamp(t,0,cur.d.dur||32)):{x:S.W*.7,y:S.H*.5,s:1.2};

/* ---------- state ---------- */
// mode: 'rest' | 'attract' | 'enter' | 'scene' | 'exit'
let mode='rest', now=0, lastTouch=0, cur=null, sceneT=0, enterT=0, exitT=0, exitDur=1.4, attractT=0, flare=0, backUntil=-1, pendingInit=null;
const sparks=[];
const $=id=>document.getElementById(id), body=document.body;
const words=$('words'), wDeva=$('w-deva'), wName=$('w-name'), wQ=$('w-q'), wHead=$('w-head'), card=$('card'), prog=$('prog'), back=$('back'), invite=$('invite');
let DOS={};
const ENTER_SPARK=.72, ENTER_XF=1.35;     // spark flight; crossfade length

function restFlame(){ const g=shownGrowth, br=mode==='attract'?Math.sin((now-attractT)*Math.PI*2/4.6):0;
  return {x:R.FX, y:R.FB, s:(1.25+.8*g)*(1+.07*br+.3*flare), a:1}; }

function setWords(p){
  wDeva.textContent=p.deva; wName.textContent=p.name+(p.gloss?' · '+p.gloss:''); wQ.textContent=p.question;
  const d=DOS[p.id]; $('c-t').textContent=d?d.do_title:''; $('c-b').textContent=d?d.do_body:''; $('c-ht').textContent=d?d.hi_title:''; $('c-hb').textContent=d?d.hi_body:'';
  card.style.display=d?'':'none';
  card.style.setProperty('--c',p.colour); prog.style.setProperty('--c',p.colour);
  // the words keep the scene's own text block; the card goes where the picture is not: sample where the lamp sits
  // while the card is up, and take the left column only if it ends well short of the lamp, else the right side
  const tx=(cur.d.text)||{x:.06,y:.55,w:.42}, W=S.W, H=S.H;
  let lx=0,n=0; for(let t=5;t<=30;t+=1){ lx+=lampOf(cur,t).x; n++; } lx/=n;
  const left=Math.max(.045,tx.x)*W, gap=.27*W, minW=.36*W, maxW=.49*W;
  const roomL=Math.min(maxW,lx-gap-left,(tx.x+tx.w+.02)*W-left),   // never past the lamp's picture, nor past the scene's own clearing
         roomR=Math.min(maxW,W*.955-(lx+gap));
  let cx, cw, side;
  if(roomL>=minW||roomL>=roomR){ side='left'; cw=Math.max(minW,roomL); cx=left; } else { side='right'; cw=Math.max(minW,roomR); cx=W*.955-cw; }
  card.style.left=cx+'px'; card.style.width=cw+'px'; card.dataset.side=side;
  words.style.left=left+'px'; words.style.width=(Math.max(.38,tx.w)*W)+'px';
  words.style.top='0px'; card.style.transform='none';
  const wh=words.getBoundingClientRect().height, cTop=card.getBoundingClientRect().top;
  let top=tx.y*H;
  if(side==='left') top=Math.max(H*.06,Math.min(top, cTop-wh-H*.035));   // same column: end above the card
  else top=Math.min(top,H*.94-wh);
  words.style.top=top+'px';
  BOARD.layout={id:cur.p.id,side,lampX:+(lx/W).toFixed(2),card:[+(cx/W).toFixed(2),+(cw/W).toFixed(2)]};
}

function enter(i){
  const t0=performance.now();
  const p=PANELS[i], d=REG[p.id]; if(!d) return;
  bump(i); const L=R.lamps[i]; L.flare=1;
  sparks.push({L,t:0,trail:[],dur:ENTER_SPARK,counted:true});
  cur={p,d,i}; mode='enter'; enterT=now; sceneT=0; pendingInit=cur; cur.ready=false;
  body.classList.remove('rest'); backUntil=-1; back.classList.remove('on');
  BOARD.lastDown=t0;
  // the response is drawn on the very next frame; the scene is built just after it is shown
  requestAnimationFrame(()=>{ BOARD.resp.push(performance.now()-t0); setTimeout(()=>{ if(pendingInit!==cur) return; const a=performance.now(); sceneInit(cur); BOARD.lastInit=performance.now()-a;
    cur.ready=true; cur.readyAt=now; setWords(cur.p); pendingInit=null; },0); });
}
function exit(fast){ if(mode!=='scene'&&mode!=='enter') return; mode='exit'; exitT=now; exitDur=fast?.9:1.6; backUntil=-1; back.classList.remove('on'); }

/* ---------- input ---------- */
const lampsEl=$('lamps'), lampBtns=[];
PANELS.forEach((p,i)=>{ const b=document.createElement('button'); b.className='lamp'; b.setAttribute('aria-label',p.name);
  b.innerHTML=`<span class="d" lang="hi"></span><span class="r"></span>`; b.querySelector('.d').textContent=p.deva; b.querySelector('.r').textContent=p.name;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); lastTouch=now; if(mode==='rest'||mode==='attract'||mode==='exit') enter(i); });
  lampsEl.appendChild(b); lampBtns.push(b); });
back.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); lastTouch=now; exit(true); });
addEventListener('pointerdown',e=>{ lastTouch=now;
  if(mode==='attract'){ mode='rest'; }
  else if(mode==='scene'||mode==='enter'){ backUntil=now+7; back.classList.add('on'); }
},{passive:false});
for(const ev of ['contextmenu','selectstart','dragstart','gesturestart','gesturechange']) addEventListener(ev,e=>e.preventDefault(),{passive:false});
addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
addEventListener('wheel',e=>{ if(e.ctrlKey) e.preventDefault(); },{passive:false});
addEventListener('keydown',e=>{ if(e.key==='Escape') exit(true); if((e.ctrlKey||e.metaKey)&&['+','-','=','0'].includes(e.key)) e.preventDefault(); });
// keep the screen awake
let wake=null; async function keepAwake(){ try{ if(navigator.wakeLock&&!wake){ wake=await navigator.wakeLock.request('screen'); wake.addEventListener('release',()=>{wake=null;}); } }catch(e){ wake=null; } }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') keepAwake(); });
addEventListener('pointerdown',keepAwake,{once:true});
let hideT; addEventListener('pointermove',()=>{ body.classList.remove('hide'); clearTimeout(hideT); hideT=setTimeout(()=>body.classList.add('hide'),2000); });

/* ---------- drawing the rest world ---------- */
function drawRest(A,dt){
  const W=S.W,H=S.H,U=S.U,c=out, D=S.DPR;
  c.setTransform(1,0,0,1,0,0); c.globalAlpha=A; c.drawImage(R.bg,0,0); c.setTransform(D,0,0,D,0,0);
  // the flame's light in the sky grows with the night
  const g=shownGrowth, fl=restFlame();
  c.globalCompositeOperation='lighter';
  const gw=H*(.7+.55*g)*(1+.25*flare); c.globalAlpha=A*(.16+.2*g+.15*flare); c.drawImage(HS.glow,fl.x-gw,fl.y-90*U-gw,gw*2,gw*2);
  // twinkles
  for(const s of R.tw){ const a=.5+.5*Math.sin(now*s.f*2+s.ph); if(a<.15) continue; c.globalAlpha=A*a*.5; c.drawImage(HS.white,s.x-s.s/2,s.y-s.s/2,s.s,s.s); }
  // motes rising from the flame
  for(const m of R.motes){ m.y-=m.v*dt; m.life+=dt*.12; if(m.y<R.FB-H*.55){ m.y=R.FB-30*U; m.x=R.FX+(Math.sin(m.ph+now)*.5)*50*U; m.life=0; }
    const k=(R.FB-m.y)/(H*.55), a=Math.sin(Math.PI*clamp(k))*(.35+.4*g); const x=m.x+Math.sin(now*.6+m.ph)*22*U*k;
    c.globalAlpha=A*a; c.drawImage(SP.emb,x-m.s/2,m.y-m.s/2,m.s,m.s); }
  // the room's lamp under the flame
  { const B=R.big, fl2=restFlame(); c.globalCompositeOperation='lighter'; const hs=B.w*1.5; c.globalAlpha=A*(.3+.3*g+.3*flare); c.drawImage(HS.glow,R.FX-hs/2,R.FB-hs*.32,hs,hs*.5);
    c.globalAlpha=A*(.22+.2*g); c.drawImage(HS.glow,R.FX-B.w*.55,R.FB+B.h*.75,B.w*1.1,B.h*.7);
    c.globalCompositeOperation='source-over'; c.globalAlpha=A; c.drawImage(B,R.FX-B.w/2,R.FB+4*S.U-B.top,B.w,B.h); }
  // lamps
  const at=mode==='attract'?now-attractT:-1, cyc=at>=0?at%12:0;
  for(const L of R.lamps){
    const base=.5+.12*(1-Math.exp(-tally.per[L.i]/4))+.06*Math.sin(now*1.3+L.i*.9);
    let lit=base; if(at>=0){ const on=ss(.4+L.i*.55,1.1+L.i*.55,cyc)*(1-ss(9,11.6,cyc)); lit=lerp(base,1.15,on); }
    L.flare=Math.max(0,L.flare-dt*.9); lit+=L.flare*.9; L.lit=lit;
    const lv=Math.round(clamp(.72+.3*(lit-.5),.72,1)*20)/20; if(L.lv!==lv){ L.lv=lv; lampBtns[L.i].style.opacity=lv; }
    const cup=L.cup, cw=cup.w, ch=cup.h, x0=L.x-cw/2, y0=L.y-ch*.3;
    // halo
    c.globalCompositeOperation='lighter'; const hs=(170+150*lit)*U*(1+L.flare*.6); c.globalAlpha=A*clamp(.25+.45*lit); c.drawImage(L.halo,L.x-hs/2,y0+8*U-hs/2,hs,hs);
    // reflection on the ledge
    c.globalAlpha=A*.18*lit; c.drawImage(L.halo,L.x-hs*.4,R.GY+4*U,hs*.8,hs*.22);
    c.globalCompositeOperation='source-over'; c.globalAlpha=A; c.drawImage(cup,x0,y0,cw,ch);
    // the small flame at the wick: the same flame, small (alternate lamps mirrored so they do not move in step)
    const wx=x0+cup.wx, wy=y0+cup.wy, fs=(.3+.08*lit)*U, fw=120*fs, fh=fw*FH/FW;
    c.globalCompositeOperation='lighter'; c.globalAlpha=A*clamp(.35+.5*lit); c.drawImage(HS.hot,wx-fw*1.1,wy-fh*.4-fw*1.1,fw*2.2,fw*2.2);
    c.globalCompositeOperation='source-over'; c.globalAlpha=A*clamp(.55+.45*lit);
    if(L.i%2){ c.save(); c.translate(wx,0); c.scale(-1,1); c.drawImage(fc,-fw/2,wy-fh*.94,fw,fh); c.restore(); } else c.drawImage(fc,wx-fw/2,wy-fh*.94,fw,fh);
  }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
}
function qpt(p,u){ const a=(1-u)*(1-u),b=2*(1-u)*u,d=u*u; return [a*p[0]+b*p[2]+d*p[4], a*p[1]+b*p[3]+d*p[5]]; }
function drawSparks(dt,target){
  const c=out,U=S.U;
  for(let k=sparks.length-1;k>=0;k--){ const s=sparks[k]; s.t+=dt; const u=clamp(s.t/s.dur), e=u<1?1-Math.pow(1-u,2.2):1;
    const p=pathOf(s.L); p[4]=target.x; p[5]=target.y-38*U*target.s; const [x,y]=qpt(p,e);
    if(u<1){ s.trail.push([x,y]); if(s.trail.length>22) s.trail.shift(); } else { s.trail.shift(); }
    const cc=mix(s.L.c,[255,236,200],.35);
    c.globalCompositeOperation='lighter';
    s.trail.forEach(([tx,ty],j)=>{ const f=(j+1)/s.trail.length, sz=(8+26*f)*U; c.globalAlpha=.55*f; c.drawImage(s.L.dot,tx-sz/2,ty-sz/2,sz,sz); });
    if(u<1){ const sz=60*U; c.globalAlpha=1; c.drawImage(HS.hot,x-sz/2,y-sz/2,sz,sz); c.globalAlpha=.7; c.drawImage(s.L.halo,x-sz,y-sz,sz*2,sz*2); }
    if(u>=1&&!s.arrived){ s.arrived=true; if(s.counted){ flare=1; } else flare=Math.max(flare,.45); }
    if(u>=1&&!s.trail.length) sparks.splice(k,1);
  }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
}

/* ---------- the frame ---------- */
let last=null;
function frame(ms){
  requestAnimationFrame(frame);
  const dt=last==null?1/60:Math.min(.1,(ms-last)/1000); last=ms; now+=dt;
  const c0=performance.now();
  const W=S.W,H=S.H,D=S.DPR,U=S.U;
  flare=Math.max(0,flare-dt*.8);
  shownGrowth+= (growth()-shownGrowth)*Math.min(1,dt*.9);
  // idle → attract
  if(mode==='rest'&&now-lastTouch>IDLE){ mode='attract'; attractT=now; }
  // attract: as each lamp lights, a soft spark rises (not counted)
  if(mode==='attract'){ const cyc=(now-attractT)%12, prev=(now-dt-attractT)%12; for(const L of R.lamps){ const tt=1.0+L.i*.55; if(prev<tt&&cyc>=tt) sparks.push({L,t:0,trail:[],dur:1.1,counted:false}); } }

  flameField(now);
  out.setTransform(1,0,0,1,0,0);
  // rest alpha and the scene
  let RA=1, fl=restFlame(), sl=null, fu=0;
  if(cur&&cur.ready&&(mode==='enter'||mode==='scene'||mode==='exit')){
    const dur=cur.d.dur||32; sceneT+=dt;
    if(mode==='enter'){ const u=sm(clamp((now-cur.readyAt)/ENTER_XF)); RA=1-u; if(u>=1) mode='scene'; }
    if(mode==='scene'){ RA=0; if(sceneT>=dur-1.7) exit(false); }
    if(mode==='exit'){ RA=sm(clamp((now-exitT)/exitDur)); }
    const a=performance.now(); sceneDraw(cur,Math.min(sceneT,dur),dt); BOARD.sceneCost=performance.now()-a;
    out.globalAlpha=1; out.drawImage(SL,0,0);
    // the flame waits for the spark, then travels to the scene's lamp (and back on exit)
    sl=lampOf(cur,Math.min(sceneT,dur));
    fu = mode==='exit' ? 1-sm(clamp((now-exitT)/exitDur)) : sm(clamp((now-Math.max(cur.readyAt,enterT+ENTER_SPARK*.85))/ENTER_XF));
    if(mode==='exit'&&RA>=1){ mode='rest'; body.classList.add('rest'); lastTouch=now; }
  }
  if(RA>0) drawRest(RA,dt);
  if(sl&&fu>0){ const arc=Math.sin(Math.PI*fu)*H*.06; fl={x:lerp(fl.x,sl.x,fu), y:lerp(fl.y,sl.y,fu)-arc, s:lerp(fl.s,sl.s,fu)*(1-.12*Math.sin(Math.PI*fu)), a:1}; }
  const wordsOn=!!(cur&&cur.ready&&mode!=='rest'&&mode!=='attract'), curW=cur;
  if(mode==='rest'&&cur&&cur.ready) cur=null;
  out.setTransform(D,0,0,D,0,0);
  drawSparks(dt,fl);
  drawFlame(out,fl.x,fl.y,fl.s,fl.a);
  out.setTransform(1,0,0,1,0,0);

  // words
  invite.style.opacity=RA*(mode==='attract'?.75+.25*Math.sin((now-attractT)*1.4):1);
  lampsEl.style.opacity=RA;
  if(wordsOn){
    const cur=curW, st=now-cur.readyAt, out1=mode==='exit'?1-ss(0,.55,now-exitT):1;
    words.style.opacity=ss(.5,1.8,st)*out1; wHead.style.opacity=ss(.7,2.0,st); wQ.style.opacity=ss(1.5,3.0,st);
    const ce=ss(5.0,6.3,st), ch=ss(5.6,7.2,st);
    card.style.opacity=ce*out1; card.style.transform=`translateY(${(1-ce)*7}vh)`;
    card.querySelector('.hi').style.opacity=ch; card.querySelector('.en').style.opacity=ss(5.2,6.4,st);
    prog.style.opacity=.85*ss(1,2.5,st)*out1; prog.style.setProperty('--p',(clamp(sceneT/(cur.d.dur||32))*100)+'%');
  } else { words.style.opacity=0; wHead.style.opacity=0; wQ.style.opacity=0; card.style.opacity=0; prog.style.opacity=0; }
  if(backUntil>=0&&now>backUntil){ backUntil=-1; back.classList.remove('on'); }
  const cost=performance.now()-c0; BOARD.costs.push(cost); if(BOARD.costs.length>600) BOARD.costs.shift();
}
BOARD.R=R; BOARD.state=()=>({mode,id:cur&&cur.p.id,sceneT,n:tally.n,growth:shownGrowth});
BOARD.enter=i=>enter(i);

/* ---------- start: words, fonts (all loaded now, so nothing is fetched later), then the loop ---------- */
size(); buildRest();
addEventListener('resize',()=>{ size(); buildRest(); if(cur&&cur.ready){ sceneInit(cur); setWords(cur.p); } });
const fontLoads=['400 20px "Lora"','italic 400 20px "Lora"','italic 600 20px "Lora"','500 20px "DM Sans"','400 20px "Rozha One"','400 20px "Tiro Devanagari Hindi"']
  .map(f=>document.fonts.load(f,'Aa अभी आप किस बात को लेकर उत्साहित हैं?').catch(()=>{}));
Promise.all([fetch('../film/dos.json').then(r=>r.json()).then(j=>{DOS=j;}).catch(()=>{}),...fontLoads]).then(()=>document.fonts.ready).then(()=>{
  body.classList.add('ready'); requestAnimationFrame(frame); });
})();
