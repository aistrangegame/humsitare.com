/* Vishuddha · The Throat · The Passage — verb: SPEAK.
   The card's world: a dark wall across the night with one narrow passage; the lamp sits in it.
   Above, the held breath: strata drawn down toward the passage. At the passage, the sixteen-petalled lotus
   (eight spoken below the wall, eight held faint above it). Below, the voice: sixteen phrases of half-rings with rests
   between them, thinning toward dawn.
   Arc: the wall and the passage arrive under the lamp (0–3) · the breath is drawn in: the strata bow toward the
   passage, motes of breath travel into it, the sixteen petals light one by one (3–15) · the voice: a front leaves the
   passage and phrase after phrase of rings lands behind it, out across the ground (15–25, the peak) · the song rests
   where the card holds it, echoes still travel out through it, and dawn begins at the foot (25–32).
   Performance: strokes are solid-colour and source-over (gradient or additive strokes are very slow in software
   rendering); every ring is drawn once, into the cached world, when it lands. */
FILM.scene({ id:'vishuddha', dur:32, text:{x:.06,y:.075,w:.42,align:'left'},
lamp(t){ const H=innerHeight, W=innerWidth; return {x:W*.7, y:H*.535+2, s:1.2*Math.min(1.25,Math.max(.8,H/1080))}; },

init(E){
  const W=E.W,H=E.H,S=this.S={}; const R=E.rand(20261121+5);
  const U=S.U=1.3*Math.min(1.25,Math.max(.8,H/1080));        // card px -> stage px
  const CX=S.CX=W*.7, WY=S.WY=H*.535, CY=S.CY=WY+5*U;        // passage, wall line, centre of the voice
  S.TR={x0:W*.06-40,y0:H*.04,x1:W*.4,y1:H*.47};                // the words' clearing
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*E.DPR));c.height=Math.max(1,Math.round(h*E.DPR));const x=c.getContext('2d');x.setTransform(E.DPR,0,0,E.DPR,0,0);return [c,x]};
  const textMask=(x,y)=>{const T=S.TR,dx=Math.max(T.x0-x,0,x-T.x1),dy=Math.max(T.y0-y,0,y-T.y1);return E.ss(0,240,Math.hypot(dx,dy))};
  S.textMask=textMask;
  const VC=S.VC=[[255,248,222],[255,226,160],[236,214,190],[176,204,240],[120,166,226],[92,140,206],[110,140,196],[176,160,186],[226,190,170]];
  S.ramp=tt=>{ tt=E.clamp(tt,0,.9999)*(VC.length-1); const i=tt|0,q=tt-i; return [VC[i][0]+(VC[i+1][0]-VC[i][0])*q,VC[i][1]+(VC[i+1][1]-VC[i][1])*q,VC[i][2]+(VC[i+1][2]-VC[i][2])*q]; };

  /* ---------- the world: night above, deep blue below, the pool and halo of the passage (static, cached) ---------- */
  { const [c,x]=mk(W,H); S.world=c; S.wx=x;
    let g=x.createLinearGradient(0,0,0,WY); g.addColorStop(0,'#060d1c'); g.addColorStop(1,'#0e1f3c'); x.fillStyle=g; x.fillRect(0,0,W,WY+2);
    g=x.createLinearGradient(0,WY,0,H); g.addColorStop(0,'#143260'); g.addColorStop(.3,'#112a51'); g.addColorStop(.7,'#0c1d3a'); g.addColorStop(1,'#081226'); x.fillStyle=g; x.fillRect(0,WY,W,H-WY);
    const T=S.TR, tx=(T.x0+T.x1)/2, ty=(T.y0+T.y1)/2, rg=x.createRadialGradient(tx,ty,0,tx,ty,(T.x1-T.x0)*.8);
    rg.addColorStop(0,'rgba(3,6,14,.6)'); rg.addColorStop(1,'rgba(3,6,14,0)'); x.fillStyle=rg; x.fillRect(0,0,W,WY);
    // the base pool (blue, elliptical) below the wall
    x.save(); x.beginPath(); x.rect(0,WY,W,H-WY); x.clip(); x.translate(CX,WY); x.scale(1,.82);
    const rp=640*U*1.25; g=x.createRadialGradient(0,0,0,0,0,rp);
    g.addColorStop(0,'rgba(127,176,234,.30)'); g.addColorStop(.22,'rgba(76,122,184,.24)'); g.addColorStop(.6,'rgba(46,107,158,.10)'); g.addColorStop(1,'rgba(46,107,158,0)');
    x.globalCompositeOperation='lighter'; x.fillStyle=g; x.fillRect(-rp,-rp,rp*2,rp*2); x.restore();
    // halo above the wall
    x.save(); x.beginPath(); x.rect(0,0,W,WY); x.clip(); x.globalCompositeOperation='lighter'; const hy=WY-83*U, hr=230*U; g=x.createRadialGradient(CX,hy,0,CX,hy,hr);
    g.addColorStop(0,'rgba(255,178,74,.42)'); g.addColorStop(.36,'rgba(240,144,58,.18)'); g.addColorStop(.7,'rgba(92,142,208,.10)'); g.addColorStop(1,'rgba(76,122,184,0)'); x.fillStyle=g; x.fillRect(CX-hr,hy-hr,hr*2,hr*2); x.restore(); }
  // the swell of light near the passage (drawn additively, unscaled)
  { const sw=Math.round(260*U), sh=Math.round(Math.min(H-WY,200*U)); const [c,x]=mk(sw*2,sh); S.swell=c; S.swW=sw*2; S.swH=sh;
    x.translate(sw,0); x.scale(1,.75); const g=x.createRadialGradient(0,0,0,0,0,sw);
    g.addColorStop(0,'rgba(150,196,250,.42)'); g.addColorStop(.12,'rgba(255,214,150,.22)'); g.addColorStop(.3,'rgba(96,146,214,.2)'); g.addColorStop(1,'rgba(60,110,180,0)'); x.fillStyle=g; x.fillRect(-sw,0,sw*2,sh/.75); }
  S.mote=E.sprite([[0,'rgba(255,244,220,1)'],[.35,'rgba(220,214,206,.45)'],[1,'rgba(150,184,230,0)']],32);
  S.spill=E.sprite([[0,'rgba(255,226,160,.75)'],[.35,'rgba(246,180,90,.28)'],[1,'rgba(246,180,90,0)']],128);
  // dawn at the foot (a strip, drawn additively)
  { const h=Math.round(H*.24); const [c,x]=mk(W,h); const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(185,138,142,0)'); g.addColorStop(.6,'rgba(196,148,142,.07)'); g.addColorStop(1,'rgba(214,160,140,.17)'); x.fillStyle=g; x.fillRect(0,0,W,h); S.dawn=c; S.dawnH=h; }

  /* ---------- the wall with its one narrow passage, and its hairline lit (two band sprites) ---------- */
  { const g=23*U,u=U,top=WY-14*U,bh=28*U; S.bandY=top; S.bandH=bh;
    const L=new Path2D(); L.moveTo(-4,WY-1.4*u); L.lineTo(CX-g-157*u,WY-2.6*u); L.lineTo(CX-g,WY-5*u); L.quadraticCurveTo(CX-g+4*u,WY,CX-g,WY+7*u); L.lineTo(CX-g-157*u,WY+2.4*u); L.lineTo(-4,WY+2.4*u); L.closePath();
    const Rr=new Path2D(); Rr.moveTo(W+4,WY-1.4*u); Rr.lineTo(CX+g+137*u,WY-2.4*u); Rr.lineTo(CX+g,WY-5*u); Rr.quadraticCurveTo(CX+g-4*u,WY,CX+g,WY+7*u); Rr.lineTo(CX+g+137*u,WY+2*u); Rr.lineTo(W+4,WY+2.4*u); Rr.closePath();
    const hl=new Path2D(); hl.moveTo(-4,WY-1.4*u); hl.lineTo(CX-g-157*u,WY-2.6*u); hl.lineTo(CX-g,WY-5*u); hl.quadraticCurveTo(CX-g+4*u,WY,CX-g,WY+7*u);
    hl.moveTo(W+4,WY-1.4*u); hl.lineTo(CX+g+137*u,WY-2.4*u); hl.lineTo(CX+g,WY-5*u); hl.quadraticCurveTo(CX+g-4*u,WY,CX+g,WY+7*u);
    const grad=x=>{ const gl=x.createLinearGradient(0,0,W,0),f=CX/W; gl.addColorStop(0,'rgba(143,180,230,.22)'); gl.addColorStop(f*.6,'rgba(249,190,112,.45)'); gl.addColorStop(f,'rgba(255,233,184,1)'); gl.addColorStop(Math.min(1,f+(1-f)*.6),'rgba(249,190,112,.5)'); gl.addColorStop(1,'rgba(143,180,230,.28)'); return gl; };
    let [c,x]=mk(W,bh); x.translate(0,-top); x.fillStyle='#040914'; x.fill(L); x.fill(Rr); x.strokeStyle=grad(x); x.lineWidth=1.2*u; x.lineCap='round'; x.stroke(hl); S.wall=c;
    [c,x]=mk(W,bh); x.translate(0,-top); x.strokeStyle=grad(x); x.lineCap='round'; x.globalAlpha=.25; x.lineWidth=7*u; x.stroke(hl); x.globalAlpha=1; x.lineWidth=2.4*u; x.stroke(hl); S.wallLit=c; }

  /* ---------- the held breath: strata above the wall ---------- */
  { const GY=WY/U, lines=[];
    for(let k=0;k<60;k++){ const y0=GY-9-4.6*Math.pow(k,1.36); if(y0<-6) break;
      const sig=(46+.42*(GY-y0))*U, depth=(GY-4-y0)*.9*U, xs=[]; for(let x=-10;x<=W+26;x+=16) xs.push(x);
      lines.push({y0:y0*U,sig,depth,xs,k,jit:[R(),R(),R(),R()]}); }
    lines.forEach(L=>{ L.cut=L.sig*Math.sqrt(Math.max(0,Math.log(.8*L.depth/.25)))+16; });
    S.strata=lines; S.strataBaked=false;
    // each stratum is stroked as three nested tiers of light (dim and wide-reaching, brighter, brightest near the
    // passage): three solid strokes per line. part: 0 = all, 1 = the outer reaches that never move (baked at init),
    // 2 = only the moving middle (live while the breath is drawn in, then baked)
    const TIERS=[{th:.006,a:.08,w:.55,col:'120,160,220'},{th:.03,a:.16,w:.6,col:'150,184,230'},{th:.28,a:.24,w:1.0,col:'214,212,212'},{th:.58,a:.34,w:1.5,col:'255,236,192'}];
    S.drawStrata=(x,dk,part)=>{
      for(const L of S.strata){ const xs=L.xs,n=xs.length, ys=S._ys||(S._ys=new Float32Array(400)), ls=S._ls||(S._ls=new Float32Array(400)), ok=S._ok||(S._ok=new Uint8Array(400));
        for(let i=0;i<n;i++){ const X=xs[i], dx=X-CX, y=L.y0+L.depth*dk*Math.exp(-dx*dx/(L.sig*L.sig)); ys[i]=y;
          const dl=Math.hypot(dx,(y-(WY-73*U))*1.15)/U; ls[i]=Math.pow(E.clamp(1-dl/600),1.25)*Math.min(1,S.textMask(X,y)*1.6);
          ok[i]=part===0?1:((Math.abs(dx)<=L.cut)===(part===2))?1:0; }
        for(let ti=0;ti<TIERS.length;ti++){ const T=TIERS[ti], th=T.th*(.6+.8*L.jit[ti]); let open=false, any=false;
          x.beginPath();
          for(let i=1;i<n;i++){ const seg=(ok[i]||ok[i-1])&&(part!==1||(ok[i]&&ok[i-1]))&&ls[i]>th&&ls[i-1]>th;
            if(seg){ if(!open){ x.moveTo(xs[i-1],ys[i-1]); open=true; } x.lineTo(xs[i],ys[i]); any=true; } else open=false; }
          if(any){ x.strokeStyle=`rgba(${T.col},${T.a})`; x.lineWidth=T.w*U*.85; x.stroke(); } } } };
    S.wx.lineCap='round'; S.drawStrata(S.wx,1,1);
  }
  { const M=[]; for(let i=0;i<110;i++) M.push({k:Math.floor(Math.pow(R(),1.25)*Math.min(24,S.strata.length)),side:R()<.5?-1:1,ph:R(),rate:.045+.05*R(),d0:(240+560*R())*U,sz:(5+9*R())*U}); S.motes=M; }

  /* ---------- the lotus: sixteen petals, each pi/8 wide, tips at L2, seated on the circle L1 ---------- */
  { const L1=64*U,L2=101*U,dA=Math.PI/8; S.L1=L1; const pt=(r,a)=>[CX+r*Math.cos(a),CY+r*Math.sin(a)];
    S.petals=[]; for(let k=0;k<16;k++){ const a0=k*dA,am=a0+dA/2,a1=a0+dA,p=new Path2D(); let q=pt(L1,a0); p.moveTo(q[0],q[1]);
      const c1=pt(L1+13*U,a0+dA*.02),c2=pt(L2-9*U,am-dA*.46),tp=pt(L2,am); p.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],tp[0],tp[1]);
      const c3=pt(L2-9*U,am+dA*.46),c4=pt(L1+13*U,a1-dA*.02),e=pt(L1,a1); p.bezierCurveTo(c3[0],c3[1],c4[0],c4[1],e[0],e[1]); S.petals.push(p); } }

  /* ---------- the voice: sixteen phrases of rings with rests between them (the card's plan) ---------- */
  { const RMAX=Math.hypot(Math.max(CX,W-CX),H-CY)+20*U, RMc=RMAX/U, NP=16, L1c=64, L2c=101;
    const counts=[]; for(let i=0;i<NP;i++) counts.push(i===0?5:4+Math.floor(R()*5));
    const jit=[]; for(let i=0;i<260;i++) jit.push(R());
    const plan=k=>{ const out=[]; let r=20,j=0;
      for(let p=0;p<NP;p++){ for(let i=0;i<counts[p];i++){ out.push({r,p,i}); r+=(5.5+r*.017)*k*(.8+.5*jit[j++]); }
        r+=(5.5+r*.017)*k*(1.5+.8*jit[j++]); if(p===0) r=L2c+9; }
      return out; };
    let lo=.3,hi=3; for(let it=0;it<40;it++){ const k=(lo+hi)/2,P=plan(k); if(P[P.length-1].r>RMc) hi=k; else lo=k; }
    const rings=plan(lo); const p0=rings.filter(q=>q.p===0),s0=(L1c-9-20)/(p0[p0.length-1].r-20); p0.forEach(q=>{q.r=20+(q.r-20)*s0;});
    // the voice front F(t): leaves the passage at ~13.5 s, fastest 17–22 s, slows to rest by ~28.5 s
    const DT=.005,N=Math.round(32/DT)+1,Sf=new Float32Array(N); let acc=0;
    const vel=t=>E.ss(13.4,16.4,t)*(1-E.ss(21.5,28.4,t));
    for(let i=0;i<N;i++){ Sf[i]=acc; acc+=vel(i*DT)*DT; }
    const RL=rings[rings.length-1].r*U+40*U, scale=RL/acc; for(let i=0;i<N;i++) Sf[i]*=scale;
    S.Sf=Sf; S.DT=DT; S.RMAX=RMAX;
    const inv=s=>{ let a=0,b=N-1; while(b-a>1){ const m=(a+b)>>1; if(Sf[m]<s) a=m; else b=m; } return a*DT; };
    S.rings=rings.map((q,n)=>{ const r=q.r*U, t=q.r/RMc, phrase=q.p;
      const beat=.55+.45*Math.sin(n*1.7+phrase)+(jit[(n*7)%260]-.5)*.3;
      const wBase=E.lerp(4.2,1.25,Math.pow(t,.8))*E.clamp(.5+.7*beat,.4,1.35)*U*.9;
      return {r,t,phrase,n,tr:inv(r),wBase,a1:2+((phrase*7)%5),p1:phrase*1.3+n*.22,a2:7+((phrase*3)%4),p2:n*.5,baked:false}; });
    S.phraseT=[]; for(let p=0;p<NP;p++){ const rs=S.rings.filter(q=>q.phrase===p); S.phraseT.push({a:Math.min(...rs.map(q=>q.tr)),b:Math.max(...rs.map(q=>q.tr))}); }
  }
},

draw(E,t,dt){
  const S=this.S, c=E.ctx, W=E.W, H=E.H, U=S.U, CX=S.CX, CY=S.CY, WY=S.WY, ss=E.ss, PI=Math.PI;
  const gather=ss(2,15,t), voiceOn=ss(13.5,17,t)*(1-ss(24,29,t)), settle=ss(26,30,t), dawn=ss(21,31,t);
  const F=(()=>{ const f=Math.min(t/S.DT,S.Sf.length-1.001),i=f|0; return S.Sf[i]+(S.Sf[i+1]-S.Sf[i])*(f-i); })();
  let sounding=0; for(const p of S.phraseT){ if(t>p.a-.15&&t<p.b+.7) sounding=Math.max(sounding,ss(p.a-.15,p.a+.2,t)*(1-ss(p.b,p.b+.7,t))); }

  // a semicircle (below the wall) stroked only where it is on screen
  const arcVis=(x,R,lw,a0=0,a1=PI)=>{ const pad=lw+2; let lo=a0,hi=a1;
    if(R>W-CX-pad) lo=Math.max(lo,Math.acos(Math.min(1,(W-CX+pad)/R)));
    if(R>CX+pad) hi=Math.min(hi,Math.acos(Math.max(-1,-(CX+pad)/R)));
    if(hi<=lo) return; const yl=H-CY+pad;
    if(R<=yl){ x.beginPath(); x.arc(CX,CY,R,lo,hi); x.stroke(); return; }
    const a=Math.asin(yl/R); if(a>lo){ x.beginPath(); x.arc(CX,CY,R,lo,Math.min(a,hi)); x.stroke(); } if(PI-a<hi){ x.beginPath(); x.arc(CX,CY,R,Math.max(PI-a,lo),hi); x.stroke(); } };

  // the ring as the card draws it: a phrase-ring that swells and thins along its length, tapering into the wall
  const ringPath=(x,q,R,boost,alphaK,live)=>{ const tt=R/S.RMAX, col=S.ramp(Math.pow(tt,.7)), op=E.lerp(1,.6,tt)*E.lerp(1,.45,Math.pow(Math.min(1,tt*1.1),1.3))*alphaK;
    const cr=Math.min(255,col[0]+boost*50)|0,cg=Math.min(255,col[1]+boost*40)|0,cb=Math.min(255,col[2]+boost*25)|0;
    if(!live&&R<450*U){ x.strokeStyle=`rgba(${cr},${cg},${cb},${((.11*(1-R/(450*U))+.015)*alphaK).toFixed(3)})`; x.lineWidth=q.wBase*2.4+7*U; arcVis(x,R,x.lineWidth,.05,PI-.05); }
    x.strokeStyle=`rgba(${cr},${cg},${cb},${Math.min(1,op).toFixed(3)})`;
    const nSeg=Math.max(10,Math.min(live?24:48,Math.round(R*PI/((live?44:30)*U)))), dA=PI/nSeg, taperN=16*U+R*.02;
    for(let j=0;j<nSeg;j++){ const th=(j+.5)*dA, px=CX+R*Math.cos(th), py=CY+R*Math.sin(th);
      if(px<-20||px>W+20||py>H+20) continue;
      const m=.62+.38*Math.pow(.5+.5*Math.sin(th*q.a1+q.p1),1.4)*(.75+.25*Math.sin(th*q.a2+q.p2));
      const w=q.wBase*m*ss(1*U,taperN,py-WY-5*U)*(1+boost*.5); if(w<.15) continue;
      x.lineWidth=w; x.beginPath(); x.arc(CX,CY,R,j*dA,(j+1)*dA); x.stroke(); } };

  /* the held breath */
  const drawStrata=S.drawStrata;

  /* bake: rings that have landed are drawn once into the world; the strata too, once drawn in */
  const LAND=1.0;
  S.wx.globalCompositeOperation='source-over'; S.wx.lineCap='butt';
  for(const q of S.rings){ if(!q.baked && t>=q.tr+LAND){ ringPath(S.wx,q,q.r,0,1); q.baked=true; } }
  if(!S.strataBaked && t>=15.6){ S.wx.lineCap='round'; drawStrata(S.wx,1,2); S.strataBaked=true; }

  // a seek replays the scene in exact 1/30 s steps and shows only the last frame (drawn again with dt 0):
  // the state above (the bakes) is kept on every step, the picture is skipped on those replay steps.
  if(E.seeking) return;
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
  c.drawImage(S.world,0,0,W,H);

  /* the swell of light at the passage: the lamp gathers, the voice pours out */
  c.globalCompositeOperation='lighter';
  { const a=.35*gather+.45*voiceOn+.25*sounding+.15*settle; if(a>.01){ c.globalAlpha=Math.min(1,a); c.drawImage(S.swell,CX-S.swW/2,WY,S.swW,S.swH); } c.globalAlpha=1; }

  const depthK=.2+.8*Math.pow(ss(1,15.5,t),1.15);
  c.globalCompositeOperation='source-over'; c.lineCap='round';
  if(!S.strataBaked) drawStrata(c,depthK,2);

  /* breath drawn in: motes travel along the strata into the passage */
  { const env=ss(3,7,t)*(1-ss(13.5,17,t)); if(env>0){ c.globalCompositeOperation='lighter';
      for(const m of S.motes){ const L=S.strata[m.k]; if(!L) continue; const u=((m.ph-t*m.rate)%1+1)%1, d=m.d0*u;
        const X=CX+m.side*d, dx=X-CX, y=L.y0+L.depth*depthK*Math.exp(-dx*dx/(L.sig*L.sig));
        const a=env*ss(0,.25,1-u)*ss(.03,.2,u)*S.textMask(X,y)*.6; if(a<.01) continue; E.put(S.mote,X,y,m.sz,a); } } }

  /* the voice: the front, and the rings landing behind it */
  c.globalCompositeOperation='source-over'; c.lineCap='butt';
  if(voiceOn>0&&F>4*U&&F<S.RMAX+60*U){ const col=S.ramp(Math.pow(F/S.RMAX,.7)), cs=`${col[0]|0},${col[1]|0},${col[2]|0}`, fa=voiceOn*(1-ss(S.RMAX*.85,S.RMAX+40*U,F));
    c.strokeStyle=`rgba(${cs},${(.11*fa).toFixed(3)})`; c.lineWidth=14*U; arcVis(c,F+3*U,c.lineWidth,.03,PI-.03);
    c.strokeStyle=`rgba(255,240,214,${(.22*fa).toFixed(3)})`; c.lineWidth=1.6*U; arcVis(c,F,c.lineWidth,.03,PI-.03); }
  for(const q of S.rings){ if(t<q.tr) continue; const age=t-q.tr; if(age>2.0) continue;
    if(age<LAND){ const u=age/LAND, e=1-Math.pow(1-u,3), Rr=Math.max(2,q.r-Math.min(26*U,q.r*.4)*(1-e)); ringPath(c,q,Rr,1-u*.5,ss(0,.3,age),true); }
    else { const k=Math.exp(-(age-LAND)/.6)*(1-ss(1.6,2.0,age)); const col=S.ramp(Math.pow(q.r/S.RMAX,.7));
      c.strokeStyle=`rgba(${Math.min(255,col[0]+40)|0},${Math.min(255,col[1]+30)|0},${Math.min(255,col[2]+20)|0},${(.35*k).toFixed(3)})`; c.lineWidth=q.wBase*1.1; arcVis(c,q.r,c.lineWidth,.06,PI-.06); } }

  /* still-living: once the song has come to rest, soft echoes still travel out through it */
  if(settle>0){ for(let k=0;k<3;k++){ const ph=((t-26)*.11+k/3)%1, R=ph*S.RMAX; if(R<S.L1) continue; const a=settle*.05*Math.sin(PI*ph);
      const col=S.ramp(Math.pow(ph,.7)); c.strokeStyle=`rgba(${col[0]|0},${col[1]|0},${col[2]|0},${a.toFixed(3)})`; c.lineWidth=26*U; arcVis(c,R,c.lineWidth,.05,PI-.05); } }

  /* the lotus at the passage: lower eight spoken, upper eight held faint; they light one by one */
  c.lineJoin='round';
  { const pulse=.5*sounding+.25*voiceOn, ca=ss(2.5,4.5,t);
    c.globalAlpha=ca*Math.min(1,.85+pulse*.3); c.strokeStyle='rgb(255,243,208)'; c.lineWidth=1.4*U; c.beginPath(); c.arc(CX,CY,S.L1,0,PI); c.stroke();
    c.globalAlpha=ca*.45; c.strokeStyle='rgb(255,230,180)'; c.lineWidth=.9*U; c.beginPath(); c.arc(CX,CY,S.L1,PI,2*PI); c.stroke();
    for(let k=0;k<16;k++){ const on=k<8?4.2+k*.75:10.4+(k-8)*.6, a=ss(on,on+1.4,t); if(a<=0) continue;
      const flare=Math.exp(-Math.max(0,t-on-.6)/1.2)*ss(on,on+.6,t);
      if(k<8){ c.globalAlpha=a*(.12+.12*flare+.1*pulse); c.strokeStyle='rgb(255,217,138)'; c.lineWidth=9*U; c.stroke(S.petals[k]);
        c.globalAlpha=a*Math.min(1,.85+.4*flare+.2*pulse); c.strokeStyle='rgb(255,243,208)'; c.lineWidth=1.9*U; c.stroke(S.petals[k]); }
      else { c.globalAlpha=a*Math.min(1,.45+.3*flare+.15*pulse); c.strokeStyle='rgb(255,230,180)'; c.lineWidth=.9*U; c.stroke(S.petals[k]); } }
    c.globalAlpha=1; }

  /* dawn at the foot: the bride sang until dawn */
  if(dawn>0){ c.globalCompositeOperation='source-over'; c.globalAlpha=dawn; c.drawImage(S.dawn,0,H-S.dawnH,W,S.dawnH); c.globalAlpha=1; }

  /* the wall over everything; its hairline brightens when the passage sounds */
  c.globalCompositeOperation='source-over'; c.drawImage(S.wall,0,S.bandY,W,S.bandH);
  { const a=.3*gather+.55*sounding+.2*voiceOn; if(a>.01){ c.globalCompositeOperation='lighter'; c.globalAlpha=Math.min(1,a); c.drawImage(S.wallLit,0,S.bandY,W,S.bandH);
      c.globalAlpha=Math.min(1,.45*sounding+.2*gather); c.drawImage(S.spill,CX-90*U,WY-50*U,180*U,100*U); } }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
}
});
