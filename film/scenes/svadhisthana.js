/* Svadhisthana · The Tide Below — the lamp lands on a dark sea; the tide swells toward it, light gathers along the
   lines and flows in toward the flame; a lotus rises below and opens toward the lamp (FOLLOW); the crescent glows
   under the water; then the sea breathes, calm. Drawn from the wall card's tide/lotus generator. */
FILM.scene((()=>{
  let LC, LCx, LCo, FC, YMN, YMX, W, H, DPR, GY, LX, D, US, K, NL, NX, DX, X0, XS, base, pull, wA, wPh, glW, BG, POOL, HALO, MOON, CLR, CL, P, stems, MXY;
  const TX={x:.055,y:.585,w:.4};
  const sst=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
  const lerp=(a,b,t)=>a+(b-a)*t;
  const colA=[[255,247,220],[255,220,150],[246,166,84],[206,112,48],[140,72,30],[104,54,26]];
  const col=(t,a)=>{t=Math.min(.999,Math.max(0,t))*5;const i=t|0,q=t-i,s=colA[i],e=colA[i+1];
    return 'rgba('+Math.round(lerp(s[0],e[0],q))+','+Math.round(lerp(s[1],e[1],q))+','+Math.round(lerp(s[2],e[2],q))+','+(a==null?1:a)+')'};
  const off=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));const x=c.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);return [c,x]};
  const uOf=k=>6.2*k+.29*k*k;
  // arc of the scene
  const grow=t=>sst(1.5,16,t), peak=t=>sst(15.5,21.5,t), relax=t=>sst(24,30,t);

  function init(E){
    W=E.W; H=E.H; DPR=E.DPR; GY=H*.355; LX=W*.685; D=H-GY; US=D/990; K=H/1080;
    const R=E.rand(20261121);
    // ---- tide lines: precomputed rest shape, swell toward the lamp, wave params
    NL=50; DX=11; X0=-12; NX=Math.ceil((W+24)/DX)+1; XS=new Float32Array(NX); for(let i=0;i<NX;i++) XS[i]=X0+i*DX;
    base=[]; pull=[]; wA=[]; wPh=[]; glW=[];
    for(let k=0;k<NL;k++){ const u=uOf(k)*US, uc=uOf(k), b=new Float32Array(NX), p=new Float32Array(NX), g=new Float32Array(NX);
      const sc=1/(1+uc/330), A=(2.2+uc*.03)*US*1.1;
      for(let i=0;i<NX;i++){ const dx=(XS[i]-LX)/K;
        p[i]=-(11+30*sst(0,260,uc))*Math.exp(-uc/640)*Math.exp(-Math.pow(dx/(170+uc*.55),2))*US*1.15;
        let w=A*((E.noise(dx*.0105*sc+40,uc*.011+k*.05)-.5)*2+.45*(E.noise(dx*.027*sc+9,uc*.02+7)-.5)*2);
        if(k===0) w*=1-Math.exp(-Math.pow(dx/90,2));
        b[i]=GY+u+w;
        g[i]=Math.exp(-Math.pow(dx/(40+uc*.36),2))*Math.exp(-uc/560);
      }
      base.push(b); pull.push(p); glW.push(g);
      wA.push(k===0?A*.25:A*.55); wPh.push([R()*6.28,R()*6.28,.0042+R()*.003,.011+R()*.006,.25+R()*.25,.4+R()*.3]);
    }
    CL=[]; for(let k=0;k<NL;k++) CL.push(new Float32Array(NX)); YMN=new Float32Array(NL); YMX=new Float32Array(NL);
    LCo=Math.round((GY-40)*DPR)/DPR; { LC=document.createElement('canvas'); LC.width=Math.round(W*DPR); LC.height=Math.round((H-LCo)*DPR); LCx=LC.getContext('2d',{alpha:false}); LCx.setTransform(DPR,0,0,DPR,0,-LCo*DPR); } FC=0;
    // ---- background: sky, sea, the night falling away from the lamp
    let [c,x]=off(W,H); BG=c;
    let g=x.createLinearGradient(0,0,0,GY); g.addColorStop(0,'#120905'); g.addColorStop(1,'#2b1509'); x.fillStyle=g; x.fillRect(0,0,W,GY+1);
    g=x.createLinearGradient(0,GY,0,H); g.addColorStop(0,'#6e2e05'); g.addColorStop(.2,'#4f2005'); g.addColorStop(.55,'#301406'); g.addColorStop(1,'#1d0d07'); x.fillStyle=g; x.fillRect(0,GY,W,D);
    x.save(); x.translate(LX,GY); x.scale(1.35,1); g=x.createRadialGradient(0,0,0,0,0,W*.62);
    g.addColorStop(0,'rgba(18,8,4,0)'); g.addColorStop(.45,'rgba(18,8,4,.18)'); g.addColorStop(1,'rgba(14,7,4,.72)'); x.fillStyle=g; x.fillRect(-W,-H,W*2.2,H*2.2); x.restore();
    g=x.createLinearGradient(0,H*.7,0,H); g.addColorStop(0,'rgba(12,6,3,0)'); g.addColorStop(1,'rgba(12,6,3,.55)'); x.fillStyle=g; x.fillRect(0,H*.7,W,H*.3);
    // clearing for the words: the same ground, feathered, laid back over the lines
    const cx0=W*(TX.x-.07), cy0=H*(TX.y-.13), cw=W*(TX.w+.17), ch=H*.56;
    [c,x]=off(cw,ch); CLR={c,x0:cx0,y0:cy0,w:cw,h:ch};
    x.drawImage(BG,cx0*DPR,cy0*DPR,cw*DPR,ch*DPR,0,0,cw,ch);
    x.globalCompositeOperation='destination-in';
    const m=document.createElement('canvas'); m.width=64; m.height=64; const mx=m.getContext('2d');
    g=mx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.42,'rgba(0,0,0,.94)'); g.addColorStop(.75,'rgba(0,0,0,.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); mx.fillStyle=g; mx.fillRect(0,0,64,64);
    x.drawImage(m,0,0,cw,ch); CLR.m=m;
    // pool of light on the sea (lower half-ellipse), halo above
    [c,x]=off(512,256); POOL=c; x.save(); x.scale(1,.62); g=x.createRadialGradient(256,0,0,256,0,256);
    g.addColorStop(0,'rgba(242,140,42,.62)'); g.addColorStop(.2,'rgba(210,104,26,.34)'); g.addColorStop(.62,'rgba(142,67,18,.13)'); g.addColorStop(1,'rgba(142,67,18,0)'); x.fillStyle=g; x.fillRect(0,0,512,420); x.restore();
    POOL.w=512; POOL.h=256;
    [c,x]=off(512,256); HALO=c; g=x.createRadialGradient(256,256,0,256,256,256);
    g.addColorStop(0,'rgba(255,184,90,.5)'); g.addColorStop(.35,'rgba(242,138,48,.2)'); g.addColorStop(.62,'rgba(200,94,30,.07)'); g.addColorStop(.85,'rgba(200,94,30,.015)'); g.addColorStop(1,'rgba(200,94,30,0)'); x.fillStyle=g; x.fillRect(0,0,512,256);
    { const bx=BG.getContext('2d'); bx.setTransform(DPR,0,0,DPR,0,0); bx.globalCompositeOperation='lighter'; bx.globalAlpha=.85; const hr=W*.2; bx.drawImage(HALO,LX-hr,GY-hr*.62,hr*2,hr*.62); bx.globalAlpha=1; bx.globalCompositeOperation='source-over'; }
    // ---- the crescent under the water (Svadhisthana's moon), cached
    const MR=92*K, Mr=MR*.965, Md=MR*.28, MX=LX, MY=GY+D*.52; MXY={x:MX,y:MY,r:MR};
    const S=MR*2+40; [c,x]=off(S,S); MOON={c,S};
    const ox=S/2, oy=S/2, a=(MR*MR-Mr*Mr+Md*Md)/(2*Md), h=Math.sqrt(MR*MR-a*a), lx=ox-h, rx=ox+h, ty=oy-a;
    const crescent=()=>{x.beginPath(); x.moveTo(lx,ty); x.arc(ox,oy,MR,Math.atan2(ty-oy,lx-ox),Math.atan2(ty-oy,rx-ox),true);
      x.arc(ox,oy-Md,Mr,Math.atan2(ty-(oy-Md),rx-ox),Math.atan2(ty-(oy-Md),lx-ox),false); x.closePath();};
    crescent(); x.fillStyle='rgba(240,138,52,.12)'; x.fill(); x.strokeStyle='rgba(240,138,52,.14)'; x.lineWidth=8; x.stroke();
    x.save(); crescent(); x.clip(); g=x.createLinearGradient(0,oy-50*K,0,oy+MR); g.addColorStop(0,'rgba(255,212,147,.10)'); g.addColorStop(1,'rgba(255,231,184,.34)'); x.fillStyle=g; x.fillRect(0,0,S,S);
    x.beginPath(); for(let yy=oy-MR;yy<oy+MR+4;yy+=4.6*K){ let first=true; for(let xx=ox-MR-6;xx<=ox+MR+6;xx+=6){ const y=yy+2.6*K*Math.sin(xx*.045/K+yy*.21/K)+1.6*K*(E.noise(xx*.03,yy*.07)-.5)*2; if(first){x.moveTo(xx,y);first=false}else x.lineTo(xx,y);} }
    x.strokeStyle='rgba(255,235,192,.9)'; x.lineWidth=1.6*K; x.lineCap='round'; x.stroke(); x.restore();
    crescent(); x.strokeStyle='rgba(255,231,184,.5)'; x.lineWidth=.8; x.stroke();
    // ---- glints that follow the pull in toward the lamp
    P=[]; for(let i=0;i<96;i++){ const k=2+Math.floor(R()*40); P.push({k,side:R()<.5?-1:1,d:R(),v:.6+R()*.8,ph:R()*6.28,sz:.7+R()*.8}); }
    // ---- stems (card geometry, mapped about the lamp)
    const mp=(pts,kx,ky)=>pts.map(([px,py])=>[LX+(px-806)*kx*K, GY+(py-372)*ky*K]);
    const cr=(pts,n)=>{const out=[];const gq=i=>pts[Math.max(0,Math.min(pts.length-1,i))];
      for(let i=0;i<pts.length-1;i++){const p0=gq(i-1),p1=gq(i),p2=gq(i+1),p3=gq(i+2);
        for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;
          out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
                    .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)])}}
        out.push(pts[pts.length-1]);return out};
    stems=[
      {P:cr(mp([[1090,1520],[1072,1360],[1040,1220],[1046,1090],[1030,980],[996,880],[962,792],[936,716],[920,662]],1.05,.86),9), w0:9*K,w1:4.2*K, L:150*K, a0:-1.6, a1:-1.95, g0:3, g1:15, o0:16.5, o1:23, sw:.9, open:1},
      {P:cr(mp([[1150,1440],[1128,1250],[1112,1110],[1100,990],[1084,900],[1076,840]],1.05,.86),8), w0:5*K,w1:2.6*K, L:64*K, a0:-1.6, a1:-1.78, g0:6, g1:19, o0:20, o1:27, sw:1.3, open:.16},
      {P:cr([[W*.505,H*1.06],[W*.51,H*.98],[W*.503,H*.9],[W*.512,H*.83],[W*.508,H*.79]],8), w0:4*K,w1:2.3*K, L:48*K, a0:-1.5, a1:-1.32, g0:8, g1:21, o0:22, o1:28, sw:1.6, open:.1}
    ];
    for(const s of stems){ // cumulative length for growth
      const n=s.P.length; s.len=new Float32Array(n); for(let i=1;i<n;i++) s.len[i]=s.len[i-1]+Math.hypot(s.P[i][0]-s.P[i-1][0],s.P[i][1]-s.P[i-1][1]); }
  }

  function ribbon(c,P,n,w0,w1){ const L=[],Rr=[];
    for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const m=Math.hypot(tx,ty)||1;tx/=m;ty/=m;
      const h=lerp(w0,w1,i/Math.max(1,n-1))/2;L.push(P[i][0]-ty*h,P[i][1]+tx*h);Rr.push(P[i][0]+ty*h,P[i][1]-tx*h)}
    c.beginPath(); c.moveTo(L[0],L[1]); for(let i=2;i<L.length;i+=2) c.lineTo(L[i],L[i+1]);
    for(let i=Rr.length-2;i>=0;i-=2) c.lineTo(Rr[i],Rr[i+1]); c.closePath(); }

  function petalPath(c,bx,by,a,len,wid,bend){ const cs=Math.cos(a),sn=Math.sin(a),pt=(u,v)=>[bx+u*cs-v*sn,by+u*sn+v*cs];
    const tip=pt(len,bend*len),l1=pt(len*.18,-wid*.95),l2=pt(len*.72,-wid*.92+bend*len*.6),r1=pt(len*.18,wid*.95),r2=pt(len*.72,wid*.92+bend*len*.6);
    c.moveTo(bx,by); c.bezierCurveTo(l1[0],l1[1],l2[0],l2[1],tip[0],tip[1]); c.bezierCurveTo(r2[0],r2[1],r1[0],r1[1],bx,by); return tip; }

  function bloom(c,E,bx,by,a,L,open,lt,glow){
    // six petals: three pairs, spread by `open` (0 = closed bud, 1 = open). Back to front.
    const lay=[[1.3,.72,.2,-.24,-.25],[.8,.9,.22,-.15,.15],[.27,1,.23,-.05,.6]];
    const ps=[];
    lay.forEach(q=>{ const sp=q[0]*open+.06*(1-open)*(q[0]>1?1.6:q[0]>.5?1:.4), ln=lerp(1-(1-q[1])*.25,q[1],open), wd=lerp(.15,q[2],open), bd=q[3]*lerp(.3,1,open);
      [-1,1].forEach(sd=>ps.push({a:a+sd*sp,len:L*ln,wid:L*wd,bend:sd*bd,tone:q[4]+(sd<0?.25:-.1)})); });
    c.globalCompositeOperation='source-over';
    c.fillStyle='rgba(42,18,8,.85)'; c.strokeStyle='rgba(42,18,8,.14)'; c.lineWidth=5*K; c.lineJoin='round';
    c.beginPath(); ps.forEach(p=>petalPath(c,bx,by,p.a,p.len,p.wid,p.bend)); c.fill(); c.stroke();
    c.globalCompositeOperation='source-over';
    for(const p of ps){ c.beginPath(); const tip=petalPath(c,bx,by,p.a,p.len,p.wid,p.bend);
      const t0=Math.min(1,Math.max(0,.74-p.tone*.34-lt*.1-glow*.06)), t1=Math.min(1,Math.max(0,.3-p.tone*.2-lt*.08-glow*.05));
      const g=c.createLinearGradient(bx,by,tip[0],tip[1]); g.addColorStop(0,col(t0+.3)); g.addColorStop(.5,col(t0)); g.addColorStop(1,col(t1)); c.fillStyle=g; c.fill();
      c.strokeStyle='rgba(255,243,212,'+(.5+.4*lt).toFixed(2)+')'; c.lineWidth=.9*K; c.stroke();
      const cs=Math.cos(p.a),sn=Math.sin(p.a),q=(u,v)=>[bx+u*cs-v*sn,by+u*sn+v*cs],m=q(p.len*.5,p.bend*p.len*.3),v2=q(p.len*.9,p.bend*p.len*.82);
      c.beginPath(); c.moveTo(bx,by); c.quadraticCurveTo(m[0],m[1],v2[0],v2[1]); c.strokeStyle='rgba(255,243,212,.22)'; c.lineWidth=.7*K; c.stroke(); }
  }

  function draw(E,t,dt){
    const c=E.ctx, gr=grow(t), pk=peak(t), rl=relax(t);
    const breathe=Math.sin(t*.55), swell=.35+.55*gr+.35*pk-.3*rl+.07*breathe;
    c.globalCompositeOperation='source-over'; c.globalAlpha=1;
    c.drawImage(BG,0,0,W*DPR,(GY-40)*DPR+1,0,0,W,GY-40+1/DPR);
    // light on the sea and the haze above it
    c.globalCompositeOperation='lighter';
    const pa=.25+.4*gr+.25*pk-.12*rl+.03*breathe, pr=W*(.34+.1*gr+.05*pk);
    c.globalAlpha=1;
    // ---- the tide lines
    const ts=t;
    for(let k=0;k<NL;k++){ const b=base[k],p=pull[k],y=CL[k],A=wA[k],ph=wPh[k],prev=k?CL[k-1]:null,gap=(uOf(k+1)-uOf(k))*US;
      const sc=1/(1+uOf(k)/330), f1=ph[2]*sc, f2=ph[3]*sc, s1=ts*ph[4], s2=ts*ph[5];
      let mn0=1e9,mx0=-1e9;
      for(let i=0;i<NX;i++){ const x=XS[i];
        let v=b[i]+p[i]*swell+A*(Math.sin(x*f1+s1+ph[0])*.65+Math.sin(x*f2-s2+ph[1])*.35);
        if(prev){ const mn=prev[i]+1.2*K+gap*.2; if(v<mn) v=mn; }
        y[i]=v; if(v<mn0)mn0=v; if(v>mx0)mx0=v; } YMN[k]=mn0; YMX[k]=mx0; }
    const rev=W*(.22+.5*sst(0,12,t)+.08*pk-.04*rl);
    const lg=c.createRadialGradient(LX,GY,0,LX,GY,rev);
    lg.addColorStop(0,'rgba(255,240,206,.95)'); lg.addColorStop(.1,'rgba(255,210,140,.74)'); lg.addColorStop(.3,'rgba(238,146,66,.42)'); lg.addColorStop(.62,'rgba(170,80,30,.2)'); lg.addColorStop(1,'rgba(120,56,24,.1)');
    // the line field is redrawn one horizontal band per frame (five bands, ~12 fps each; the tide moves < 1 px per update)
    const bands=[[1,12,.9],[12,24,1.05],[24,37,1.25],[37,NL,1.45]], NB=5, bh=(H-LCo)/NB;
    const todo=FC===0?[0,1,2,3,4]:[FC%NB]; FC++;
    for(const bi of todo){ const y0=Math.round((LCo+bi*bh)*DPR)/DPR, y1=bi===NB-1?H:Math.round((LCo+(bi+1)*bh)*DPR)/DPR, x=LCx;
      x.save(); x.beginPath(); x.rect(-2,y0,W+4,y1-y0); x.clip();
      x.globalCompositeOperation='source-over'; x.drawImage(BG,0,y0*DPR,W*DPR,(y1-y0)*DPR,0,y0,W,y1-y0);
      x.globalCompositeOperation='lighter'; x.globalAlpha=Math.min(1,pa); x.drawImage(POOL,LX-pr,GY,pr*2,pr*.95); x.globalAlpha=1;
      x.globalCompositeOperation='source-over'; x.strokeStyle=lg; x.lineCap='butt'; x.lineJoin='miter';
      for(const [k0,k1,w] of bands){ x.beginPath(); let any=false; for(let k=k0;k<k1;k++){ if(YMX[k]<y0-3||YMN[k]>y1+3) continue; any=true; const y=CL[k]; x.moveTo(XS[0],y[0]); for(let i=1;i<NX;i++) x.lineTo(XS[i],y[i]); } if(any){ x.lineWidth=w*K; x.stroke(); } }
      if(CLR.y0<y1&&CLR.y0+CLR.h>y0) x.drawImage(CLR.c,CLR.x0,CLR.y0,CLR.w,CLR.h);
      x.restore(); }
    c.globalCompositeOperation='source-over'; c.lineCap='round'; c.lineJoin='round';
    c.drawImage(LC,0,LCo,W,H-LCo);
    // the surface line, brighter
    const sg=c.createRadialGradient(LX,GY,0,LX,GY,W*.7); sg.addColorStop(0,'rgba(255,247,222,1)'); sg.addColorStop(.25,'rgba(255,214,150,.8)'); sg.addColorStop(1,'rgba(206,112,48,.35)');
    c.strokeStyle=sg; c.beginPath(); { const y=CL[0]; c.moveTo(XS[0],y[0]); for(let i=1;i<NX;i++) c.lineTo(XS[i],y[i]); } c.lineWidth=1.6*K; c.stroke();
    // ---- glitter: the lamp's path on the water, shimmering
    c.globalCompositeOperation='lighter';
    const gate=.74*Math.min(1,.25+.75*gr+.25*pk-.12*rl);
    const HB=[[],[],[],[]];
    for(let k=1;k<NL;k++){ const y=CL[k],g=glW[k],uc=uOf(k),sc=1/(1+uc/300); let run=null,rq=0;
      const i0=Math.max(0,Math.floor((LX-K*(3*(40+uc*.36))-X0)/DX)), i1=Math.min(NX-1,Math.ceil((LX+K*(3*(40+uc*.36))-X0)/DX));
      for(let i=i0;i<=i1;i++){ const x=XS[i],yy=y[i], gi=g[i];
        const dmx=x-MXY.x, dmy=yy-MXY.y, inMoon=dmx*dmx+dmy*dmy<(MXY.r+16*K)*(MXY.r+16*K);
        const s=E.noise(x*.055/K*sc+k*3.7+t*.22, k*9.13+t*.5);
        const on=!inMoon && s>1-gate*Math.min(1,gi*1.25);
        if(on){ if(!run){run=[];rq=Math.min(3,Math.round(gi*3.4));} run.push(x,yy); }
        else if(run){ if(run.length>2) HB[rq].push(run); run=null; } }
      if(run&&run.length>2) HB[rq].push(run); }
    const hw=[1.8,2.5,3.3,4.2],ho=[.55,.75,.9,.97],hc=['246,178,102','255,212,147','255,231,184','255,246,220'];
    for(let q=0;q<4;q++){ if(!HB[q].length) continue; c.beginPath(); for(const r of HB[q]){ c.moveTo(r[0],r[1]); for(let j=2;j<r.length;j+=2) c.lineTo(r[j],r[j+1]); }
      if(q>=1){ c.strokeStyle='rgba(240,138,52,'+(.1+q*.05)+')'; c.lineWidth=(hw[q]+6)*K; c.stroke(); }
      c.strokeStyle='rgba('+hc[q]+','+ho[q]+')'; c.lineWidth=hw[q]*K; c.stroke(); }
    // reflection column under the flame
    { c.globalAlpha=.32+.18*gr+.15*pk; const rw=70*K, rh=D*.62; c.drawImage(E.SP.glow,LX-rw/2,GY-rh*.08,rw,rh); c.globalAlpha=1; }
    // ---- glints following the pull, in toward the lamp
    const flow=.12+.88*sst(10,18.5,t)*(1-.55*rl);
    for(const q of P){ const uc=uOf(q.k), near=K*(40+uc*.36)*1.3, far=W*.55;
      q.d-=dt*q.v*(.04+.16*flow)*(.4+.6*(1-q.d));
      if(q.d<=0){ q.d=1; q.side=-q.side; q.ph+=1.7; }
      const x=LX+q.side*(near+(far-near)*q.d*q.d); const fi=(x-X0)/DX, i=Math.max(0,Math.min(NX-2,fi|0)), fr=Math.min(1,Math.max(0,fi-i));
      const y=CL[q.k][i]*(1-fr)+CL[q.k][i+1]*fr;
      const life=sst(1,.8,q.d)*sst(0,.18,q.d), tw=.65+.35*Math.sin(t*2.1+q.ph);
      const a=flow*life*tw*(.35+.65*Math.exp(-Math.abs(x-LX)/(W*.22)));
      const clr=sst(W*.5,W*.4,x)*sst(H*.46,H*.54,y); if(clr>.98) continue;
      if(a<.02) continue; const s=(10+uc*.02)*K*q.sz*(.7+.5*(1-q.d));
      c.globalAlpha=a*(1-clr); c.drawImage(E.SP.emb,x-s,y-s*.55,s*2,s*1.1); }
    c.globalAlpha=1;
    // ---- the words' clearing: lay the quiet ground back over the lines
    // ---- the crescent under the water
    const ma=.25+.55*sst(3,13,t)+.2*pk;
    { c.globalAlpha=ma; c.drawImage(MOON.c,MXY.x-MOON.S/2,MXY.y-MOON.S/2,MOON.S,MOON.S);
    c.globalCompositeOperation='lighter'; c.globalAlpha=(.12+.22*pk-.08*rl)*(1+.15*breathe); const mg=MXY.r*3.4; c.drawImage(E.SP.glow,MXY.x-mg/2,MXY.y-mg/2+MXY.r*.25,mg,mg); c.globalAlpha=1; }
    // landing ripple
    for(let j=0;j<2;j++){ const tt=t-.3-j*1.4; if(tt<0||tt>6) continue; const r=(30+tt*120)*K, a=.45*(1-tt/6)*sst(0,.4,tt);
      c.beginPath(); c.ellipse(LX,GY+2*K,r,r*.075,0,0,Math.PI); c.strokeStyle='rgba(255,214,150,'+a+')'; c.lineWidth=1.6*K; c.stroke(); }
    // ---- lotus: rising on long stems, the head turning to follow the lamp, opening at the peak
    for(const s of stems){
      const gT=sst(s.g0,s.g1,t); if(gT<=0) continue; const total=s.len[s.len.length-1], want=total*(.18+.82*gT);
      let n=1; while(n<s.P.length&&s.len[n]<=want) n++; n=Math.min(s.P.length,n+1);
      const P2=[], top=s.P[n-1][1];
      for(let i=0;i<n;i++){ const hgt=(s.P[0][1]-s.P[i][1])/(s.P[0][1]-top||1);
        const sway=(Math.sin(t*.42*s.sw+i*.07)*6+Math.sin(t*.23+i*.03)*4)*K*hgt*hgt;
        // the rise: the whole stem slides up from below as it grows
        P2.push([s.P[i][0]+sway, s.P[i][1]+(total-want)]); }
      const tip=P2[n-1], lt=Math.exp(-Math.hypot((tip[0]-LX)*.82,(tip[1]-GY)*.72)/(400*K));
      ribbon(c,P2,n,s.w0+6*K,s.w1+5*K); c.fillStyle='rgba(42,18,8,.5)'; c.fill();
      const sgd=c.createLinearGradient(0,tip[1],0,H); sgd.addColorStop(0,col(.12+(1-lt)*.5)); sgd.addColorStop(.5,col(.5+(1-lt)*.3)); sgd.addColorStop(1,col(.9));
      ribbon(c,P2,n,s.w0,s.w1); c.fillStyle=sgd; c.fill();
      const oT=sst(s.o0,s.o1,t), open=lerp(s.open===1?.04:.02,s.open,oT)*(1+.03*Math.sin(t*.6)*oT);
      const head=lerp(s.a0,s.a1,sst(s.g0+2,s.o1,t))+Math.sin(t*.42*s.sw)*.025;
      const glow=s.open===1?pk*(1-.4*rl):0;
      if(glow>0){ c.globalCompositeOperation='lighter'; const gs=s.L*2.6*(.6+.4*glow); c.globalAlpha=.35*glow;
        c.drawImage(E.SP.glow,tip[0]+Math.cos(head)*s.L*.4-gs/2,tip[1]+Math.sin(head)*s.L*.4-gs/2,gs,gs); c.globalAlpha=1; c.globalCompositeOperation='source-over'; }
      bloom(c,E,tip[0],tip[1]+2*K,head,s.L*(.55+.45*sst(s.g0,s.o0,t)),open,lt,glow);
      if(glow>0){ c.globalCompositeOperation='lighter'; const cs=s.L*.5; c.globalAlpha=.5*glow; c.drawImage(E.SP.hot,tip[0]+Math.cos(head)*s.L*.22-cs/2,tip[1]+Math.sin(head)*s.L*.22-cs/2,cs,cs); c.globalAlpha=1; }
      c.globalCompositeOperation='source-over';
    }
    c.globalAlpha=1; c.globalCompositeOperation='source-over';
  }

  return { id:'svadhisthana', dur:32, text:TX,
    lamp(t){ const W0=innerWidth,H0=innerHeight; return {x:W0*.685, y:H0*.355-6*(H0/1080)+Math.sin(t*.55)*2.2*(H0/1080), s:1.22}; },
    init, draw };
})());
