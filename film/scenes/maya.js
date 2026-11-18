/* Maya — the sum of all the colours. Many lamps that are one flame.
   The card's rangoli (rings of petals in the eight panel colours, every eighth ring a ring of small lamps, exact rotational
   symmetry about the one lamp) blooms outward from the flame ring by ring; the first ring of small lamps catches one from the
   next, hand to hand, and the outer rings of lamps catch as the light reaches them. At the peak a second wave of light runs
   out through every colour and the whole frame stands in its fullest light; then the construction becomes see-through (the
   solid petals thin to lines of light) and it settles, still breathing.
   Performance: the picture is baked into three full-frame versions (night, lit, see-through); each frame draws at most two
   of them, a clip reveals the bloom, and only the small things (front, lamps, motes, the centre glow) are live. */
FILM.scene({ id:'maya', dur:32, text:{x:.045,y:.47,w:.41,align:'left'},
  lamp(t){ const W=innerWidth,H=innerHeight, s=1.12+.1*Math.sin(Math.PI*Math.min(1,Math.max(0,(t-14)/16)));
    const h=120*s*150/96; return {x:W*.72, y:H*.38+h*.42, s}; },
  init(E){
    const W=E.W,H=E.H,D=E.DPR,TAU=Math.PI*2, S=H/1080*1.12, me=this;
    const CX=W*.72, CY=H*.38;
    const COL=[[184,58,58],[212,116,56],[212,168,72],[107,142,78],[76,122,184],[91,78,142],[154,122,200],[212,169,72]];
    const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t), rgb=c=>'rgb('+c.map(Math.round).join(',')+')';
    const sm=(a,b,v)=>E.ss(a,b,v);
    // the words' clearing (CSS px): the block sits at x .05..(.05+.385), from y .545 to the foot
    const TX1=W*(.045+.41)+40, TY0=H*.47-40;
    const tdist=(x,y)=>{ const dx=Math.max(0,x-TX1), dy=Math.max(0,TY0-y); return (dx>0||dy>0)?Math.hypot(dx,dy):-Math.min(TX1-x,y-TY0); };
    // the clearing is a wedge of the mandala itself, opening toward the words (whole rings stay whole inside it)
    const DEG=180/Math.PI;
    const clr=(x,y)=>{ const dx=x-CX, dy=y-CY, r=Math.hypot(dx,dy); let th=Math.atan2(dx,-dy)*DEG; if(th<0) th+=360;
      return sm(201,212,th)*(1-sm(270,281,th))*sm(470*H/1080,540*H/1080,r); };
    const tfade=(x,y)=>1-clr(x,y);
    const Dmax=Math.max(Math.hypot(CX,CY),Math.hypot(W-CX,CY),Math.hypot(CX,H-CY),Math.hypot(W-CX,H-CY));
    const rings=[]; { let r=106,k=0; while(r*S<Dmax+40){ const w=40+Math.min(14,k*.9); rings.push({r,w,k}); r+=w; k++; } }
    const mk=()=>{ const c=document.createElement('canvas'); c.width=Math.ceil(W*D); c.height=Math.ceil(H*D); const x=c.getContext('2d'); x.setTransform(D,0,0,D,0,0); x.lineJoin='round'; x.lineCap='round'; return [c,x]; };
    const P=(r,th)=>[CX+r*S*Math.sin(th), CY-r*S*Math.cos(th)];
    // ---- geometry (Path2D per ring and alpha bucket), built once ----
    const RG=[], lamps=[], outerLamps=[];
    for(const R of rings){
      const ci=R.k%8, lamp=ci===7, N=8*Math.max(2,Math.round(TAU*R.r/(8*(lamp?26:.92*R.w)))), da=TAU/N, off=(R.k%2)*da/2, L=R.w*1.62;
      const lit=1-sm(100,300,R.r), dim=1-.62*sm(300,1200,R.r);
      const base=mix(mix(COL[ci],[255,236,196],lit*.42),[24,18,26],1-dim), hi=mix(base,[255,246,224],.55), dk=mix(base,[20,16,22],.4);
      const groups={};
      for(let j=0;j<N;j++){ const th=off+j*da;
        const c=P(R.r+L*.5,th); if(c[0]<-60||c[0]>W+60||c[1]<-60||c[1]>H+60) continue;
        let mc=0; for(const [rr,dt] of [[R.r,-.5],[R.r,.5],[R.r+L*.5,-.55],[R.r+L*.5,.55],[R.r+L,0],[R.r+L*.5,0],[R.r,0]]){ const q=P(rr,th+dt*da); mc=Math.max(mc,clr(q[0],q[1])); }
        const a=1-mc; if(a<.03) continue;
        const ak=Math.round(a*6)/6; const g=groups[ak]||(groups[ak]={A:new Path2D(),B:new Path2D(),L:new Path2D(),V:new Path2D(),D:new Path2D()});
        const mv=(p,r,t)=>{const q=P(r,t);p.moveTo(q[0],q[1]);}, bz=(p,r1,t1,r2,t2,r3,t3)=>{const a1=P(r1,t1),a2=P(r2,t2),a3=P(r3,t3);p.bezierCurveTo(a1[0],a1[1],a2[0],a2[1],a3[0],a3[1]);}, ln=(p,r,t)=>{const q=P(r,t);p.lineTo(q[0],q[1]);};
        if(lamp){ const b=R.r+R.w*.18,l=R.w*.7,h=da*.30;
          mv(g.B,b+l,th); bz(g.B,b+l*.55,th-h*.25,b+l*.42,th-h,b+l*.2,th-h); bz(g.B,b-l*.06,th-h,b-l*.06,th+h,b+l*.2,th+h); bz(g.B,b+l*.42,th+h,b+l*.55,th+h*.25,b+l,th); g.B.closePath();
          mv(g.L,R.r,th-da*.5); g.L.arc(CX,CY,R.r*S,th-da*.5-Math.PI/2,th+da*.5-Math.PI/2);
          const q=P(b+l*.36,th), ang=Math.abs(((th+Math.PI)%TAU+TAU)%TAU-Math.PI);
          (R.k===7?lamps:outerLamps).push({x:q[0],y:q[1],r:(b+l*.36)*S,ang,a,i:lamps.length+outerLamps.length});
        } else {
          const pet=(p,r0,l,hw)=>{ mv(p,r0,th-hw); bz(p,r0+l*.52,th-hw*1.22,r0+l*.80,th-hw*.34,r0+l,th); bz(p,r0+l*.80,th+hw*.34,r0+l*.52,th+hw*1.22,r0,th+hw); p.closePath(); };
          pet(g.A,R.r,L,da*.5); pet(g.B,R.r+L*.16,L*.62,da*.27);
          mv(g.V,R.r+L*.2,th); ln(g.V,R.r+L*.93,th);
          mv(g.V,R.r+L*.24,th-da*.13); { const a1=P(R.r+L*.6,th-da*.2),a2=P(R.r+L*.86,th-da*.03); g.V.quadraticCurveTo(a1[0],a1[1],a2[0],a2[1]); }
          mv(g.V,R.r+L*.24,th+da*.13); { const a1=P(R.r+L*.6,th+da*.2),a2=P(R.r+L*.86,th+da*.03); g.V.quadraticCurveTo(a1[0],a1[1],a2[0],a2[1]); }
          { const q=P(R.r+L*.3,th); g.D.moveTo(q[0]+1.9*S,q[1]); g.D.arc(q[0],q[1],1.9*S,0,TAU); }
        }
      }
      RG.push({R,lamp,lit,base,hi,dk,groups});
    }
    const rays=new Path2D(); for(let j=0;j<96;j++){ const th=j*TAU/96, a=P(64,th), b=P(j%2?100:106,th); rays.moveTo(a[0],a[1]); rays.lineTo(b[0],b[1]); }
    const lampSp=E.sprite([[0,'rgba(255,250,228,1)'],[.22,'rgba(255,214,130,.8)'],[.55,'rgba(240,140,60,.22)'],[1,'rgba(240,130,50,0)']],48);
    // ---- painters ----
    function sky(x,warm){ // night, a breath of violet, light pooling from the lamp; the words' corner kept dark
      const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#141118'); g.addColorStop(1,'#0c0b0f'); x.fillStyle=g; x.fillRect(0,0,W,H);
      const v=x.createRadialGradient(W*.18,H*.12,0,W*.18,H*.12,W*.55); v.addColorStop(0,'rgba(64,46,86,.2)'); v.addColorStop(1,'rgba(64,46,86,0)'); x.fillStyle=v; x.fillRect(0,0,W,H);
      const R0=Dmax*(.75+.35*warm), p=x.createRadialGradient(CX,CY,0,CX,CY,R0);
      p.addColorStop(0,'rgba(242,192,120,'+(.34+.3*warm)+')'); p.addColorStop(.3,'rgba(201,138,80,'+(.15+.16*warm)+')'); p.addColorStop(.65,'rgba(138,106,96,'+(.05+.07*warm)+')'); p.addColorStop(1,'rgba(138,106,96,0)');
      x.fillStyle=p; x.fillRect(0,0,W,H); }
    function shade(x){ // the words' ground: a soft dark pool, no edges
      const cx=W*.25, cy=H*.72, g=x.createRadialGradient(cx,cy,0,cx,cy,W*.42);
      g.addColorStop(0,'rgba(10,8,12,.6)'); g.addColorStop(.55,'rgba(10,8,12,.42)'); g.addColorStop(1,'rgba(10,8,12,0)'); x.fillStyle=g; x.fillRect(0,0,W,H); }
    function rangoli(x,mode){ // mode 0 = night, 2 = see-through (lines of light)
      for(let i=RG.length-1;i>=0;i--){ const {R,lamp,lit,base,hi,dk,groups}=RG[i];
        for(const ak in groups){ const g=groups[ak], a=+ak;
          if(lamp){
            if(mode===0){ x.globalAlpha=a*.95; x.fillStyle=rgb(mix([255,214,130],[255,246,214],.4+.4*lit)); x.fill(g.B); }
            else { x.globalAlpha=a*.85; x.strokeStyle='rgb(255,226,160)'; x.lineWidth=1.1*S; x.stroke(g.B); x.globalAlpha=a*.35; x.fillStyle='rgb(255,226,160)'; x.fill(g.B); }
            x.globalAlpha=a*.6; x.strokeStyle=rgb(hi); x.lineWidth=.9*S; x.stroke(g.L);
          } else if(mode===2){
            x.globalAlpha=a*.16; x.fillStyle=rgb(base); x.fill(g.A);
            x.globalAlpha=a*.9; x.strokeStyle=rgb(mix(hi,[255,240,214],.2)); x.lineWidth=1.3*S; x.stroke(g.A);
            x.globalAlpha=a*.12; x.fillStyle=rgb(hi); x.fill(g.B);
            x.globalAlpha=a*.42; x.strokeStyle=rgb(hi); x.lineWidth=.8*S; x.stroke(g.V);
            x.globalAlpha=a*.95; x.fillStyle='#FFF3D6'; x.fill(g.D);
          } else {
            x.globalAlpha=a*(.86-.3*lit); x.fillStyle=rgb(base); x.fill(g.A);
            x.globalAlpha=a*.9; x.strokeStyle=rgb(hi); x.lineWidth=1.05*S; x.stroke(g.A);
            x.globalAlpha=a*.34; x.fillStyle=rgb(hi); x.fill(g.B);
            x.globalAlpha=a*.9; x.fillStyle='#FFF3D6'; x.fill(g.D);
            x.globalAlpha=a*.55; x.strokeStyle=rgb(dk); x.lineWidth=.75*S; x.stroke(g.V);
          } } }
      x.globalAlpha=.55; x.strokeStyle='#FFF1CC'; x.lineWidth=.8*S; x.stroke(rays); x.globalAlpha=1;
      // the outer rings of small lamps, burning
      x.globalCompositeOperation='lighter';
      for(const l of outerLamps){ x.globalAlpha=l.a*(mode===2?.75:.85); const s=(mode===2?30:26)*S; x.drawImage(lampSp,l.x-s/2,l.y-s/2,s,s); }
      x.globalCompositeOperation='source-over'; x.globalAlpha=1; }
    const [night,xn]=mk(); sky(xn,0); rangoli(xn,0); shade(xn);
    const [dark,xd]=mk(); sky(xd,-.35); shade(xd);                    // the ground before the bloom reaches it
    const V={night,dark,lit:null,sheer:null};
    // the lit and see-through versions are baked lazily (a few seconds in), from the night version
    V.bake=k=>{ if(V[k]) return; const [c,x]=mk();
      if(k==='lit'){ x.setTransform(1,0,0,1,0,0); x.drawImage(night,0,0); x.globalCompositeOperation='lighter'; x.globalAlpha=.3; x.drawImage(night,0,0);
        x.globalCompositeOperation='source-over'; x.globalAlpha=1; x.setTransform(D,0,0,D,0,0);
        const p=x.createRadialGradient(CX,CY,0,CX,CY,Dmax*.8); p.addColorStop(0,'rgba(255,214,150,.16)'); p.addColorStop(.45,'rgba(240,170,110,.07)'); p.addColorStop(1,'rgba(255,200,140,0)');
        x.globalCompositeOperation='lighter'; x.fillStyle=p; x.fillRect(0,0,W,H); x.globalCompositeOperation='source-over'; shade(x); }
      else { sky(x,.55); rangoli(x,2); shade(x); }
      V[k]=c; };
    // the front is organic: on a small grid, each point's arrival radius is its true radius pushed early or late by
    // low-frequency noise in angle and ring, so the colour flows outward like light catching, with a wide feathered edge
    const AMP=130*S, FE=120*S, GD=8, GW=Math.ceil(W/GD)+1, GH=Math.ceil(H/GD)+1;
    const nz=(x,y,o)=>{ const dx=x-CX, dy=y-CY, r=Math.hypot(dx,dy)||1, ca=dx/r, sa=dy/r;
      return (E.fbm(ca*1.7+r*.0021+o, sa*1.7-r*.0016+o*.7)-.5)*2*AMP*E.ss(40*S,220*S,r); };
    const reA=new Float32Array(GW*GH), reB=new Float32Array(GW*GH), gcol=new Uint8ClampedArray(GW*GH*3), gclr=new Float32Array(GW*GH), gdark=new Uint8ClampedArray(GW*GH*3);
    for(let gy=0;gy<GH;gy++) for(let gx=0;gx<GW;gx++){ const i=gy*GW+gx, x=gx*GD, y=gy*GD, r=Math.hypot(x-CX,y-CY);
      reA[i]=r-nz(x,y,3.1); reB[i]=r-nz(x,y,17.7)*.8;
      let k=0; for(let q=0;q<rings.length;q++) if(rings[q].r*S<=r) k=q; const cc=mix(COL[k%8],[255,240,212],.5);
      gcol[i*3]=cc[0]; gcol[i*3+1]=cc[1]; gcol[i*3+2]=cc[2]; gclr[i]=tfade(x,y); }
    const mkG=()=>{ const cv=document.createElement('canvas'); cv.width=GW; cv.height=GH; const x=cv.getContext('2d'); return {cv,x,img:x.createImageData(GW,GH)}; };
    const OV=mkG();
    { // the unlit ground, sampled onto the front's grid
      const sc=document.createElement('canvas'); sc.width=GW; sc.height=GH; const sx=sc.getContext('2d'); sx.drawImage(dark,0,0,GW*GD*D,GH*GD*D,0,0,GW,GH);
      const px=sx.getImageData(0,0,GW,GH).data; for(let i=0;i<GW*GH;i++){ gdark[i*3]=px[i*4]; gdark[i*3+1]=px[i*4+1]; gdark[i*3+2]=px[i*4+2]; } }
    const fEnd=Dmax+AMP+FE+40;
    // tiles: only the tiles the front is crossing pay for the mask
    const T=GD*15, TX=Math.ceil(W/T), TY=Math.ceil(H/T), tiles=[];
    for(let ty=0;ty<TY;ty++) for(let tx=0;tx<TX;tx++){ const x0=tx*T,y0=ty*T,w=Math.min(T,W-x0),h=Math.min(T,H-y0);
      const t={x0,y0,w,h,aMin:1e9,aMax:-1e9,bMin:1e9,bMax:-1e9};
      for(let gy=Math.floor(y0/GD);gy<=Math.min(GH-1,Math.ceil((y0+h)/GD));gy++) for(let gx=Math.floor(x0/GD);gx<=Math.min(GW-1,Math.ceil((x0+w)/GD));gx++){ const i=gy*GW+gx;
        t.aMin=Math.min(t.aMin,reA[i]); t.aMax=Math.max(t.aMax,reA[i]); t.bMin=Math.min(t.bMin,reB[i]); t.bMax=Math.max(t.bMax,reB[i]); }
      tiles.push(t); }
    // the front of the bloom, and when each inner small lamp catches
    const F=t=>{ const u=E.clamp((t-1.4)/14.6); const e=u*u*(3-2*u)*.65+u*.35; return 60*S+(fEnd-60*S)*e; };
    const Finv=r=>{ let lo=0,hi=40; for(let i=0;i<30;i++){ const m=(lo+hi)/2; if(F(m)<r) lo=m; else hi=m; } return lo; };
    for(const l of lamps) l.ign=Finv(l.r-nz(l.x,l.y,3.1)+FE*.3)+.25+l.ang/Math.PI*2.2;
    for(const l of outerLamps) l.ign=Finv(l.r-nz(l.x,l.y,3.1)+FE*.3)+l.ang/Math.PI*.6;
    const ringR=rings.map(R=>R.r*S);
    // motes of every colour, rising (analytic: position is a function of age)
    const rnd=E.rand(9001), motes=[];
    for(let i=0;i<110;i++) motes.push({b:12+rnd()*15, th:rnd()*TAU, v:(30+rnd()*60)*S, r0:(130+rnd()*260)*S, life:5+rnd()*5, sz:(10+rnd()*16)*S, ph:rnd()*TAU});
    const motesSp=COL.map(c=>E.sprite([[0,'rgba('+mix(c,[255,248,230],.55).map(Math.round)+',1)'],[.3,'rgba('+mix(c,[255,240,210],.2).map(Math.round)+',.45)'],[1,'rgba('+c+',0)']],48));
    me.$={gdark,tiles,GW,GH,GD,reA,reB,gcol,gclr,OV,nz,FE,fEnd,TX1,TY0,W,H,S,CX,CY,Dmax,F,V,lamps,outerLamps,motes,motesSp,lampSp,tfade,COL,ringR};
  },
  draw(E,t,dt){
    const c=E.ctx, $=this.$, {W,H,S,CX,CY,Dmax,F,V}=$, TAU=Math.PI*2, ss=E.ss;
    if(t>3) V.bake('lit'); if(t>6) V.bake('sheer');
    if(E.seeking) return;                                        // the picture is a function of t alone
    const f=F(t);                                                // the bloom's front
    const see=ss(24,29.5,t);                                     // the construction becomes see-through
    // the organic front, on a small grid: the unlit ground still covering what the light has not reached (feathered,
    // early or late by ring and angle), with a band of light in the colour of the ring it is passing through on top
    const front=(r,re,bandA,bw,cover)=>{ const d4=$.OV.img.data, n=$.GW*$.GH, FE=$.FE, gc=$.gcol, gl=$.gclr, gd=$.gdark;
      for(let i=0;i<n;i++){ const d=r-re[i], o=i*4, k=i*3;
        let a1=0; if(cover){ if(d<=-FE) a1=1; else if(d<FE){ const q=(d+FE)/(2*FE); a1=1-q*q*(3-2*q); } }
        const e=d/bw, b=(e>-2.2&&e<2.2)?Math.exp(-e*e)*bandA*gl[i]:0, A=b+a1*(1-b);
        if(A<.002){ d4[o+3]=0; continue; }
        const wd=a1*(1-b)/A, wb=b/A;
        d4[o]=gc[k]*wb+gd[k]*wd; d4[o+1]=gc[k+1]*wb+gd[k+1]*wd; d4[o+2]=gc[k+2]*wb+gd[k+2]*wd; d4[o+3]=A*255; }
      $.OV.x.putImageData($.OV.img,0,0); };
    const ovTile=q=>c.drawImage($.OV.cv,q.x0/$.GD,q.y0/$.GD,q.w/$.GD,q.h/$.GD,q.x0,q.y0,q.w,q.h);
    const tile=(img,q)=>{ const D=E.DPR; c.drawImage(img,q.x0*D,q.y0*D,q.w*D,q.h*D,q.x0,q.y0,q.w,q.h); };
    // ground and rangoli
    const wEnd=$.fEnd+60*S, wv=wEnd*ss(16.2,23,t), bA1=ss(1.4,3.2,t)*(1-ss(14.4,16.2,t)), bA2=ss(16.2,16.6,t)*(1-ss(21.6,23,t));
    if(f<$.fEnd){ const FE=$.FE, bw=78*S, reach=Math.max(FE,2.2*bw); front(f,$.reA,.3*bA1,bw,true);
      for(const q of $.tiles){
        if(f-reach>=q.aMax) tile(V.night,q);                       // lit through
        else if(f+reach<=q.aMin) tile(V.dark,q);                   // not yet reached
        else { tile(V.night,q); ovTile(q); } } }
    else if(wv<=1) c.drawImage(V.night,0,0,W,H);
    else if(wv<wEnd-1){ const bw=110*S; c.drawImage(V.night,0,0,W,H);
      // the second wave: the lit picture inside an irregular edge, feathered in two steps under its band of light
      for(const [off,al] of [[55*S,.5],[-35*S,1]]){ const rr=Math.max(4,wv+off); c.save(); c.beginPath();
        for(let j=0;j<=120;j++){ const th=j/120*TAU, sx=Math.sin(th), cy=Math.cos(th), rho=rr+.8*$.nz(CX+rr*sx,CY-rr*cy,17.7);
          j?c.lineTo(CX+rho*sx,CY-rho*cy):c.moveTo(CX+rho*sx,CY-rho*cy); }
        c.clip(); c.globalAlpha=al; c.drawImage(V.lit,0,0,W,H); c.globalAlpha=1; c.restore(); }
      front(wv,$.reB,.42*bA2,bw,false);
      for(const q of $.tiles) if(wv+2.2*bw>q.bMin && wv-2.2*bw<q.bMax) ovTile(q); }
    else { c.drawImage(V.lit,0,0,W,H); if(see>0){ c.globalAlpha=see; c.drawImage(V.sheer,0,0,W,H); c.globalAlpha=1; } }
    // the first ring of small lamps: each catches from the one beside it, and keeps burning
    c.globalCompositeOperation='lighter';
    const lift=1+.3*ss(17,21,t)-.15*see;
    for(const l of $.lamps){ const age=t-l.ign; if(age<=0) continue;
      const fl=Math.exp(-age*1.5)*1.3, br=.66+.16*Math.sin(t*1.7+l.i*2.39)+.1*Math.sin(t*2.9+l.i*7.1);
      E.put($.lampSp,l.x,l.y,(28+16*fl)*S*lift,Math.min(1,l.a*(ss(0,.45,age)*br*lift+fl))); }
    for(const l of $.outerLamps){ const age=t-l.ign; if(age<=0||age>1.6) continue;   // the catch, as the light reaches the outer lamps
      E.put($.lampSp,l.x,l.y,(30+30*(1-age/1.6))*S,l.a*Math.sin(Math.PI*age/1.6)*.9); }
    // the one flame's own light at the centre, fullest at the peak
    const peak=ss(16.5,21.5,t)*(1-.45*see);
    E.put(E.SP.glow,CX,CY,(360+220*peak)*S,.3+.18*ss(1.5,9,t)+.22*peak);
    // motes of every colour, rising and spreading in the celebration
    for(let i=0;i<$.motes.length;i++){ const m=$.motes[i], age=t-m.b; if(age<0||age>m.life) continue;
      const r=m.r0+m.v*age, th=m.th+.05*Math.sin(age*.6+m.ph);
      const x=CX+r*Math.sin(th)+Math.sin(age*.7+m.ph)*10*S, y=CY-r*Math.cos(th)-age*14*S;
      const a=Math.sin(Math.PI*age/m.life)*$.tfade(x,y)*(.5+.5*peak)*(1-.35*see);
      if(a>.02) E.put($.motesSp[i%8],x,y,m.sz*(1+.4*Math.sin(age*1.3+m.ph)),a); }
    c.globalCompositeOperation='source-over'; c.globalAlpha=1;
  } });
