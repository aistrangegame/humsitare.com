/* Carry the Light — the film engine.
   One lamp, nine grounds. The engine owns: the clock, the lamp (its flame, its glow, its journey between scenes),
   the crossfades, the words, and the run loop. A scene owns only its picture, drawn into its own layer.

   SCENE CONTRACT (each file in scenes/ calls FILM.scene({...}) once):
     id        'muladhara' …                (must match an entry in FILM.PANELS)
     dur       seconds on screen (default 32)
     lamp(t)   -> {x, y, s}   where the flame's BASE sits, in CSS px of the stage, and s = flame scale (1 ≈ 120px wide)
     text      {x, y, w, align}  fractions of the stage for the word block (top-left of the block); align 'left'|'center'|'right'
     init(E)   called once per run when the scene is about to enter (build geometry, seed particles). Keep it under ~60 ms.
     draw(E, t, dt)  draw the whole picture for scene-time t (0..dur) into E.ctx (already cleared to transparent).
               Paint your own background. Do NOT draw the main flame: the engine does, at lamp(t), on top of every layer.
               Must be deterministic from init + the sequence of dt steps (use E.rand, never Math.random).
   E (passed to init and draw):
     seeking (true while the engine fast-forwards; you may skip drawing and only advance state), ctx, W, H (CSS px), DPR, now (seconds since film start), panel (the PANELS entry),
     rand(seed) -> seeded generator, noise(x,y), fbm(x,y), ss(a,b,x), clamp, lerp,
     sprite(stops,size) -> canvas, put(sprite,x,y,size,alpha), glow(x,y,r,rgbaInner,rgbaOuter),
     SP: ready sprites {hot, emb, glow, white}
*/
(() => {
const PANELS = [
 {id:'muladhara',   deva:'मूलाधार',      name:'Muladhara',    gloss:'The Root',        colour:'#B83A3A', question:'Am I safe here?',                          seed:'The earth that holds you was chosen by you.'},
 {id:'svadhisthana',deva:'स्वाधिष्ठान',  name:'Svadhisthana', gloss:'The Sacral',      colour:'#D47438', question:'What wants?',                              seed:'Every desire was drawing you toward yourself.'},
 {id:'manipura',    deva:'मणिपूर',       name:'Manipura',     gloss:'The Solar Plexus',colour:'#D4A848', question:'What am I for?',                           seed:'The fire that agitated you was building your form.'},
 {id:'anahata',     deva:'अनाहत',        name:'Anahata',      gloss:'The Heart',       colour:'#6B8E4E', question:'Can I receive?',                           seed:'The love that arrived for others was always your own heart opening.'},
 {id:'vishuddha',   deva:'विशुद्ध',       name:'Vishuddha',    gloss:'The Throat',      colour:'#4C7AB8', question:'Will I say what I know?',                  seed:'What you finally said out loud was what you always knew.'},
 {id:'ajna',        deva:'आज्ञा',         name:'Ajna',         gloss:'The Third Eye',   colour:'#5B4E8E', question:'What do I see when I stop looking?',       seed:'You stopped looking and the seeing arrived on its own.'},
 {id:'sahasrara',   deva:'सहस्रार',       name:'Sahasrara',    gloss:'The Crown',       colour:'#9A7AC8', question:'Am I alone?',                              seed:'The disease that was removed was the belief that you were less than what you are.'},
 {id:'aatma',       deva:'आत्मा',         name:'Aatma',        gloss:'',                colour:'#D4A948', question:'What remains when all protection is gone?',seed:'Will. Knowledge. Action. You already know. You have always known.'},
 {id:'maya',        deva:'माया',          name:'Maya',         gloss:'',                colour:'#E8E0F0', question:'What would you see if the protection dissolved?', seed:'There was never anything to fear. There was only You, playing.'}
];
const FESTIVE = [{id:'welcome',festive:true,colour:'#C9A84C'},{id:'finale',festive:true,colour:'#C9A84C'}];
const REG = {};
const FILM = window.FILM = { PANELS, FESTIVE, scene(def){ REG[def.id] = def; } };
const MODE = new URLSearchParams(location.search).get('screen') || 'projector';   // 'entrance' (the TV at the door) | 'projector'
document.documentElement.dataset.screen = MODE;

/* ---------- maths ---------- */
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

/* ---------- stage ---------- */
const cv=document.getElementById('stage'), out=cv.getContext('2d');
const L=[document.createElement('canvas'),document.createElement('canvas')];   // two scene layers for crossfades
const S={W:0,H:0,DPR:1};
function size(){ S.DPR=Math.min(2,window.devicePixelRatio||1); S.W=innerWidth; S.H=innerHeight;
  for(const c of [cv,...L]){ c.width=Math.round(S.W*S.DPR); c.height=Math.round(S.H*S.DPR); } }
size();

/* ---------- the one flame ---------- */
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
  c.globalAlpha=.55*a; c.drawImage(SP.glow,x-w*2.6,base-h*.55-w*2.6,w*5.2,w*5.2);
  c.globalAlpha=.9*a;  c.drawImage(SP.hot,x-w*.9,base-h*.35-w*.9,w*1.8,w*1.8);
  c.globalCompositeOperation='source-over';
  c.globalAlpha=.5*a; c.drawImage(fc,x-w*.62,base-h*.98,w*1.24,h*1.04);
  c.globalAlpha=a;    c.drawImage(fc,x-w/2,base-h*.94,w,h);
  c.globalCompositeOperation='lighter'; c.globalAlpha=.32*a; c.drawImage(SP.white,x-w*.42,base-h*.5-w*.42,w*.84,w*.84);
  c.globalCompositeOperation='source-over'; c.globalAlpha=1; }

/* ---------- words ---------- */
const $=id=>document.getElementById(id);
const words=$('words'), wDeva=$('w-deva'), wName=$('w-name'), wQ=$('w-q'), wSeed=$('w-seed'), card=$('card');
let wordsFor=null;
function setWords(p,def){
  if(wordsFor===p.id) return; wordsFor=p.id;
  wDeva.textContent=p.deva; wName.textContent=p.name+(p.gloss?' · '+p.gloss:''); wQ.textContent=p.question; wSeed.textContent=p.seed;
  const tx=def.text||{x:.07,y:.62,w:.42,align:'left'};
  words.style.left=(tx.x*100)+'%'; words.style.top=(tx.y*100)+'%'; words.style.width=(tx.w*100)+'%'; words.style.textAlign=tx.align||'left';
}
function showWords(nameA,qA,seedA){ $('w-head').style.opacity=nameA; wQ.style.opacity=qA; wSeed.style.opacity=seedA; }

/* ---------- the timeline ---------- */
const INTRO=3.2, OUTRO=11, XF=3.2;         // seconds
let plan=[], total=0;
function build(){
  plan=[]; let t=INTRO;
  for(const p of [FESTIVE[0],...PANELS,FESTIVE[1]]){ const d=REG[p.id]; if(!d) continue; const dur=d.dur||32; plan.push({p,d,start:t,dur}); t+=dur-XF; }
  total=t+XF+OUTRO;
}
const E={ mode:MODE, get ctx(){return E._ctx}, rand, noise, fbm, ss, clamp, lerp, sprite, SP,
  put(sp,x,y,s,a=1){ if(a<=0||s<=0) return; const c=E._ctx; c.globalAlpha=a; c.drawImage(sp,x-s/2,y-s/2,s,s); c.globalAlpha=1; },
  /* the photos code: cream tile with a 4-module quiet zone; (cx,cy) centre, size = tile edge in CSS px */
  qr(cx,cy,size,a=1){ const Q=window.PHOTOS_QR; if(!Q||a<=0) return; const c=E._ctx,n=Q.length,m=size/(n+8),x0=cx-size/2,y0=cy-size/2;
    c.globalAlpha=a; c.fillStyle='#FBF3E4'; const r=size*.06; c.beginPath(); c.roundRect?c.roundRect(x0,y0,size,size,r):c.rect(x0,y0,size,size); c.fill();
    c.fillStyle='#14102A'; c.beginPath(); for(let y=0;y<n;y++){ const row=Q[y]; for(let x=0;x<n;x++) if(row[x]==='1') c.rect(Math.floor(x0+(x+4)*m),Math.floor(y0+(y+4)*m),Math.ceil(m),Math.ceil(m)); } c.fill(); c.globalAlpha=1; },
  glow(x,y,r,a,b){ const c=E._ctx,g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,a); g.addColorStop(1,b); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); } };
const state={}; // per-scene: {inited, t}
function layerDraw(i,item,t,dt){
  const c=L[i].getContext('2d'); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,L[i].width,L[i].height);
  c.setTransform(S.DPR,0,0,S.DPR,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over';
  E._ctx=c; E.W=S.W; E.H=S.H; E.DPR=S.DPR; E.panel=item.p;
  const st=state[item.p.id]||(state[item.p.id]={inited:false});
  if(!st.inited){ item.d.init&&item.d.init(E); st.inited=true; }
  item.d.draw(E,t,dt);
  c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over';
}
const lampOf=(item,t)=>item.d.lamp?item.d.lamp(t):{x:S.W/2,y:S.H*.5,s:1};

let filmT=0, last=null, paused=false;
const params=new URLSearchParams(location.search);
function frame(dt){
  const t=filmT, W=S.W, H=S.H;
  out.setTransform(1,0,0,1,0,0); out.fillStyle='#05030a'; out.fillRect(0,0,cv.width,cv.height);
  const live=plan.filter(it=>t>=it.start && t<it.start+it.dur);
  let lamp={x:W/2,y:H*.56,s:1.15}, la=1;
  // scenes
  // a cut through light, not through grey: while two scenes overlap the outgoing one stays at full strength
  // and the incoming one rises over it; a scene only fades to black at the very start and end of the film
  live.forEach((it,k)=>{ const st=t-it.start; layerDraw(k,it,st,dt);
    const isLastScene=it===plan[plan.length-1];
    const fin=ss(0,XF,st), fout=isLastScene?1-ss(it.dur-1.4,it.dur,st):1-ss(it.dur-XF,it.dur,st);
    const isFirst=it===plan[0], isLast=it===plan[plan.length-1];
    let a=1; if(live.length===2){ a = k===0 ? 1 : fin; } else { a=Math.min(isFirst?fin:1, isLast?fout:1); if(!isFirst&&st<XF) a=fin; }
    out.globalAlpha=a; out.drawImage(L[k],0,0); out.globalAlpha=1; });
  // the lamp's journey: during an overlap, travel from the outgoing scene's lamp to the incoming one along a rising arc
  if(live.length===2){ const a=live[0],b=live[1], u=sm(clamp((t-b.start)/XF)); const A=lampOf(a,t-a.start),B=lampOf(b,t-b.start);
    lamp={x:lerp(A.x,B.x,u), y:lerp(A.y,B.y,u)-Math.sin(Math.PI*u)*H*.08, s:lerp(A.s,B.s,u)*(1-.18*Math.sin(Math.PI*u))}; }
  else if(live.length===1){ lamp=lampOf(live[0],t-live[0].start); }
  // intro: dark, then the flame catches at centre and the words arrive
  const first=plan[0], lastI=plan[plan.length-1];
  if(t<first.start+XF){ const ig=ss(1.2,4.2,t); if(t<first.start){ lamp={x:W/2,y:H*.56,s:1.15*ig}; }
    else { const u=sm(clamp((t-first.start)/XF)), B=lampOf(first,t-first.start); lamp={x:lerp(W/2,B.x,u),y:lerp(H*.56,B.y,u)-Math.sin(Math.PI*u)*H*.06,s:lerp(1.15,B.s,u)}; }
    la=ig; }
  // outro: back to the centre, then "Now go play."
  const end=lastI.start+lastI.dur;
  const XL=1.6; // the finale holds its photos code to the end; the lamp leaves only as the scene goes
  if(t>=end-XL){ const u=sm(clamp((t-(end-XL))/(XL+1.4))), A=lampOf(lastI,Math.min(lastI.dur,t-lastI.start));
    lamp={x:lerp(A.x,W/2,u),y:lerp(A.y,H*.5,u),s:lerp(A.s,1.3,u)}; la=1-ss(total-2.4,total-.2,t); }
  if(!(params.get('noflame'))){ const fs=performance.now(); flameField(E.now=t); drawFlame(out,lamp.x*S.DPR,lamp.y*S.DPR,lamp.s*S.DPR,la); }
  // words
  const intro=$('intro'), outro=$('outro');
  intro.style.opacity=0;
  outro.style.opacity=Math.min(ss(end+.4,end+2.6,t),1-ss(total-2.4,total-.4,t));
  const cur=live.length?live[live.length-1]:null;
  if(cur&&!cur.p.festive){ const st=t-cur.start; setWords(cur.p,cur.d);
    showWords(Math.min(ss(1.6,3.6,st),1-ss(cur.dur-XF-.4,cur.dur-XF+1,st)), Math.min(ss(3.4,5.8,st),1-ss(cur.dur-XF-.6,cur.dur-XF+.8,st)), Math.min(ss(cur.dur*.5,cur.dur*.5+2.4,st),1-ss(cur.dur-XF-.8,cur.dur-XF+.6,st))); }
  else showWords(0,0,0);
  // the panel's colour as a thin line at the foot (and the position of the night)
  const corner=$('corner'); if(corner){ const fin=plan[plan.length-1]; corner.style.opacity = (MODE==='entrance' && !(t>fin.start+1 && t<fin.start+fin.dur-1)) ? 1 : 0; }
  card.style.opacity = cur&&!cur.p.festive ? .9 : 0; if(cur&&!cur.p.festive){ card.style.setProperty('--c',cur.p.colour); card.style.setProperty('--p', ((PANELS.indexOf(cur.p)+1)/PANELS.length*100)+'%'); }
}
function loop(ms){
  const dt=last==null?1/60:Math.min(.1,(ms-last)/1000); last=ms;
  if(!paused){ filmT+=dt; if(filmT>=total){ filmT=0; for(const k in state) delete state[k]; wordsFor=null; } }
  const c0=performance.now(); frame(paused?0:dt); (FILM.costs||(FILM.costs=[])).push(performance.now()-c0); if(FILM.costs.length>600) FILM.costs.shift(); requestAnimationFrame(loop);
}
/* seek (for tests and for the arrow keys): replay deterministically from the start of the containing scene(s) */
FILM.seek=(t,step=1/30)=>{ for(const k in state) delete state[k]; wordsFor=null; filmT=0; E.seeking=true;
  // fast-forward: only scenes live at time t are simulated, from their start
  const targets=plan.filter(it=>t>=it.start && t<it.start+it.dur);
  for(const it of targets){ let st=0; const c=L[0].getContext('2d');
    while(st<t-it.start-1e-6){ const dt=Math.min(step,t-it.start-st); E._ctx=c; E.W=S.W; E.H=S.H; E.DPR=S.DPR; E.panel=it.p;
      const s2=state[it.p.id]||(state[it.p.id]={inited:false}); if(!s2.inited){ it.d.init&&it.d.init(E); s2.inited=true; }
      c.setTransform(S.DPR,0,0,S.DPR,0,0); it.d.draw(E,st,dt); st+=dt; } }
  E.seeking=false; filmT=t; frame(0); };
FILM.total=()=>total; FILM.plan=()=>plan.map(it=>({id:it.p.id,start:it.start,dur:it.dur}));
FILM.pause=v=>{paused=v};

/* ---------- controls: space pauses, arrows jump scenes, F or click for full screen; cursor hides ---------- */
addEventListener('keydown',e=>{
  if(e.key===' '){ e.preventDefault(); paused=!paused; }
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ const i=plan.findIndex(it=>filmT<it.start+it.dur-XF); const j=clamp((i<0?plan.length:i)+(e.key==='ArrowRight'?1:-1),0,plan.length-1); FILM.seek(plan[j].start+XF+.01,1/20); }
  if(e.key==='f'||e.key==='F') document.documentElement.requestFullscreen?.();
});
addEventListener('dblclick',()=>document.documentElement.requestFullscreen?.());
let hideT; addEventListener('pointermove',()=>{ document.body.classList.remove('hide'); clearTimeout(hideT); hideT=setTimeout(()=>document.body.classList.add('hide'),1800); });
addEventListener('resize',()=>{ size(); for(const k in state) delete state[k]; wordsFor=null; });
(async()=>{ try{ if(navigator.wakeLock) await navigator.wakeLock.request('screen'); }catch(e){} })();

FILM.start=()=>{ build();
  const only=params.get('scene'); if(only){ const it=plan.find(x=>x.p.id===only); if(it){ FILM.seek(it.start+(+params.get('t')||XF+1)); } }
  else if(params.has('at')) FILM.seek(+params.get('at'));
  if(!params.has('still')) requestAnimationFrame(loop); };
})();
