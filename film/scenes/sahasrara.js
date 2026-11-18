/* Sahasrara · The Crown · RECEIVE
   The wall card brought to life: a plain at night seen from a height; on the horizon a city strung with clay lamps,
   the thousand-petalled crown opening behind the one flame, and a road winding home from it, lamp by lamp.
   Exactly one thousand lamps (sahasra) and one thousand petals (20 rings x 50).
   Arc: arrive in the dark (0-3 s) -> the light passes lamp to lamp down the road and across the plain while the crown
   unfolds ring by ring (3-16 s) -> RECEIVE (18-24 s): light flows back from every lamp, up the road and in through the
   petals, into the one flame -> settle: a thousand lamps breathing, nobody alone (25-32 s). */
FILM.scene({ id:'sahasrara', dur:32, text:{x:.06,y:.575,w:.40,align:'left'},
lamp(t){ const W=innerWidth,H=innerHeight, ss=(a,b,x)=>{const u=Math.min(1,Math.max(0,(x-a)/(b-a)));return u*u*(3-2*u)};
  const swell=ss(17.5,22,t)*(1-ss(23.5,28,t));
  return {x:W*.68, y:H*.36+2-H*.006*swell, s:1.26+.1*swell}; },
init(E){
  const S=this._s={}; const W=E.W,H=E.H,DPR=E.DPR, R=E.rand(20261121), cl=E.clamp;
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));const x=c.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);return [c,x]};
  const U=W/1440;                                   // card px -> stage px for sizes
  const CX=W*.68, GY=H*.36, FOC=1100*U;
  const Sy=y=>(y-GY)/(H-GY), toG=(x,y)=>{const s=Sy(y);return {X:(x-CX)/s,Z:FOC/s}}, toS=(X,Z)=>{const s=FOC/Z;return {x:CX+X*s,y:GY+(H-GY)*s,s}};
  Object.assign(S,{W,H,CX,GY,U,toS});
  // ---------- text clearing (the word block sits bottom-left on the dark plain)
  const TX0=W*.06-50*U, TX1=W*.06+W*.40+30*U, TY0=H*.575-36*U, TY1=H*.575+H*.33;
  const tdist=(x,y)=>{const dx=Math.max(TX0-x,0,x-TX1),dy=Math.max(TY0-y,0,y-TY1);return Math.hypot(dx,dy)};
  // ---------- the road home (screen points as fractions), laid on the ground
  const RP=[[.68,.36],[.683,.3625],[.693,.369],[.712,.383],[.738,.405],[.752,.44],[.742,.478],[.70,.512],[.645,.545],[.598,.59],[.578,.65],[.585,.72],[.612,.80],[.635,.89],[.645,.99],[.648,1.12],[.65,1.3]];
  const cen=[];
  for(let i=0;i<RP.length-1;i++){const p0=RP[Math.max(0,i-1)],p1=RP[i],p2=RP[i+1],p3=RP[Math.min(RP.length-1,i+2)];
    for(let k=0;k<40;k++){const t=k/40,t2=t*t,t3=t2*t,cr=j=>.5*(2*p1[j]+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3);
      cen.push([cr(0)*W,cr(1)*H])}}
  const gc=cen.map(p=>toG(p[0],Math.max(p[1],GY+1.2)));
  // arc length along the ground from the lamp
  const acc=[0];for(let i=1;i<gc.length;i++)acc.push(acc[i-1]+Math.hypot(gc[i].X-gc[i-1].X,gc[i].Z-gc[i-1].Z));
  const RW=118*U*1.33, EL=[],ER=[];
  for(let i=0;i<gc.length;i++){const a=gc[Math.max(0,i-1)],b=gc[Math.min(gc.length-1,i+1)];let tx=b.X-a.X,tz=b.Z-a.Z;const m=Math.hypot(tx,tz)||1;tx/=m;tz/=m;
    const c=gc[i];EL.push({X:c.X-tz*RW,Z:Math.max(200*U,c.Z+tx*RW),i});ER.push({X:c.X+tz*RW,Z:Math.max(200*U,c.Z-tx*RW),i})}
  // visible part of the road: up to where it leaves the frame
  let iEnd=gc.length-1;for(let i=0;i<cen.length;i++){if(cen[i][1]>H+40){iEnd=i;break}}
  const LEN=acc[iEnd];
  S.road={gc,acc,LEN,iEnd};
  // ---------- sprites
  const spr=(stops,n=64)=>E.sprite(stops,n);
  const SPpool=spr([[0,'rgba(255,194,122,.62)'],[.45,'rgba(231,126,88,.22)'],[1,'rgba(192,90,144,0)']]);
  const SPglow=spr([[0,'rgba(255,217,138,.6)'],[.4,'rgba(242,148,70,.2)'],[1,'rgba(242,148,70,0)']]);
  const SPdot=spr([[0,'rgba(255,240,196,1)'],[.5,'rgba(255,231,168,1)'],[.7,'rgba(255,231,168,.5)'],[1,'rgba(255,231,168,0)']],16);
  const SPflare=spr([[0,'rgba(255,240,200,.9)'],[.25,'rgba(255,190,110,.4)'],[.6,'rgba(220,120,140,.12)'],[1,'rgba(160,100,220,0)']],128);
  const SPmote=spr([[0,'rgba(255,246,222,1)'],[.3,'rgba(255,214,150,.5)'],[1,'rgba(240,150,90,0)']],32);
  // a clay lamp's flame and bowl (the card's f1 and b1 paths), rendered once large
  const FS=96, fl=document.createElement('canvas'); fl.width=FS*.7|0; fl.height=FS+4; {const x=fl.getContext('2d');x.translate(fl.width/2,FS+1);x.scale(FS,FS);
    x.beginPath();x.moveTo(.087,-1);x.bezierCurveTo(.04,-.76,.287,-.6,.287,-.307);x.bezierCurveTo(.287,-.127,.16,0,0,0);x.bezierCurveTo(-.16,0,-.287,-.127,-.287,-.3);
    x.bezierCurveTo(-.287,-.46,-.16,-.547,-.073,-.68);x.bezierCurveTo(-.007,-.78,.053,-.88,.087,-1);x.closePath();
    const g=x.createRadialGradient(0,-.28,0,0,-.28,.62);g.addColorStop(0,'#FFFDF2');g.addColorStop(.45,'#FFE092');g.addColorStop(1,'#F6A23A');x.fillStyle=g;x.fill();}
  const bw=document.createElement('canvas'); bw.width=FS*1.2|0; bw.height=FS*.42|0; {const x=bw.getContext('2d');x.translate(bw.width/2,FS*.04+1);x.scale(FS,FS);
    x.beginPath();x.moveTo(-.56,-.04);x.lineTo(.56,-.04);x.bezierCurveTo(.5,.2,.3,.34,0,.34);x.bezierCurveTo(-.3,.34,-.5,.2,-.56,-.04);x.closePath();
    const g=x.createLinearGradient(0,-.04,0,.34);g.addColorStop(0,'#C46A3C');g.addColorStop(1,'#5A2A30');x.fillStyle=g;x.fill();}
  const flW=fl.width/FS, flH=fl.height/FS, bwW=bw.width/FS, bwH=bw.height/FS, bwOy=(FS*.04+1)/FS;
  // one atlas for every sprite, so thousands of small draws share one texture
  const AT=document.createElement('canvas'); AT.width=512; AT.height=256; const ax=AT.getContext('2d'); const A={};
  const place=(k,src,x,y)=>{ax.drawImage(src,x,y);A[k]=[x,y,src.width,src.height]};
  place('flare',SPflare,0,0); place('pool',SPpool,130,0); place('glow',SPglow,196,0); place('mote',SPmote,262,0); place('dot',SPdot,296,0);
  place('fl',fl,320,0); place('bw',bw,320+fl.width+2,0);
  const put=(c,k,x,y,w,h)=>{const r=A[k];c.drawImage(AT,r[0],r[1],r[2],r[3],x,y,w,h)};
  // draw one lamp: a = 0..1 lit, fs = flame scale (flicker)
  const drawLamp=(c,l,a,fs=1,part=0)=>{ const z=l.sz; // part: 0 whole, 1 body only, 2 flame only
    if(l.k===3||z<2.4){const r=l.k===3?z*.42:Math.max(.62,z*.42), g=l.k===3?4:3.4; c.globalAlpha=a*(l.k===3?.9:1); put(c,'glow',l.x-r*g,l.y-r-r*g,r*g*2,r*g*2); c.globalAlpha=a; put(c,'dot',l.x-r*1.5,l.y-r-r*1.5,r*3,r*3); return;}
    const f=z*(z<7?1:.86), by=z<7?l.y:l.y-z*.2;
    if(part!==2){ const ry=Math.max(1.2,z*2.5*cl(Sy(l.y)*1.1+.16,.2,.62));
    c.globalAlpha=a; put(c,'pool',l.x-z*2.5,l.y+z*.12-ry,z*5,ry*2);
    put(c,'glow',l.x-z*1.55,l.y-z*.5-z*1.55,z*3.1,z*3.1);
    if(z>=7){const s=z*.62; c.globalAlpha=Math.min(1,a*1.4); put(c,'bw',l.x-s*bwW/2,l.y-z*.16-s*bwOy,s*bwW,s*bwH);} }
    if(part===1) return;
    c.globalAlpha=a; const fh=f*fs*a; put(c,'fl',l.x-f*flW/2,by-fh*(FS+1)/FS,f*flW,fh*flH); };
  S.put=put;
  S.IGN=1.25; S.step=t=>{
    // bake what has stopped changing into the one world canvas: the full light at 14 s, the open crown at 16.6 s
    if(!S.bakedL&&t>=14){ S.wx.globalCompositeOperation='lighter'; S.wx.drawImage(S.ov,0,0,S.W,S.H); S.wx.globalCompositeOperation='source-over'; S.bakedL=true; }
    if(!S.bakedC&&t>=16.6){ S.wx.drawImage(S.cr,S.CX-S.CW,S.GY-S.CW,S.CW*2,S.CW+4); S.bakedC=true; }
    for(const l of S.near){ if(!l.st&&t>=l.t0+S.IGN){ S.drawLamp(S.wx,l,1,1,1); l.st=1; } } S.wx.globalAlpha=1;
    while(S.wi<S.wait.length&&S.wait[S.wi].t0<=t){S.active.push(S.wait[S.wi]);S.wi++}
    if(S.active.length){ const keep=[]; for(const l of S.active){ if(t>=l.t0+S.IGN){ S.drawLamp(S.wx,l,1); } else keep.push(l); } S.active=keep; S.wx.globalAlpha=1; } };
  S.drawLamp=drawLamp; 
  // ---------- the city on the horizon: flat roofs and terraces, every ledge strung with lamps
  const lamps=[], roofs=[];
  const SK=10.5*U*1.33, gyAt=x=>GY+Math.sin(x*.009)*.9*U;
  [0,1].forEach(layer=>{let x=-10-R()*20;
    while(x<W+10){const w=((layer?16:22)+R()*(layer?30:44))*U*1.33,gap=(layer?R()*R()*26:R()*10)*U*1.33;
      const env=((layer?6:10)+(layer?42:70)*Math.exp(-Math.pow((x+w/2-CX)/((layer?330:290)*U*1.5),2)))*U*1.33;
      let h=env*(.5+R()*.6);const x0=x,x1=x+w;x+=w+gap;
      if(x1>CX-118*U&&x0<CX+118*U)continue;
      if(h<=4)continue;const g=gyAt((x0+x1)/2)+1,top=g-h;
      const tiers=[[x0,x1,top,layer]];
      if(h>15*U&&w>24*U&&R()<.55){const iw=w*(.35+R()*.3),ix=x0+(w-iw)*R(),ih=(6+R()*h/U*.4)*U;tiers.push([ix,ix+iw,top-ih,layer]);
        if(ih>9*U&&iw>16*U&&R()<.5){const jw=iw*.5,jx=ix+(iw-jw)/2,jh=(5+R()*5)*U;tiers.push([jx,jx+jw,top-ih-jh,layer])}}
      tiers.forEach(t=>{roofs.push([t[0],t[1],t[2],g,layer]);
        const n=Math.max(2,Math.round((t[1]-t[0]-2)/SK));for(let i=0;i<=n;i++)lamps.push({x:t[0]+1+(t[1]-t[0]-2)*i/n,y:t[2]+.2,sz:(layer?2.6:2.2)*U*1.2,k:3})});
      if(h>26*U&&R()<.7){const n=Math.max(2,Math.round((w-2)/(SK*1.25))),ly=top+h*(.42+R()*.2);for(let i=0;i<=n;i++)lamps.push({x:x0+1+(w-2)*i/n,y:ly,sz:2.0*U*1.2,k:3})}
    }});
  const nSky=lamps.length; let top=GY;for(const l of lamps)top=Math.min(top,l.y-l.sz*4); S.litTop=Math.floor(top-10*U);
  // lamps along both edges of the road
  const LSP=RW*1.04;
  [EL,ER].forEach((Ed,side)=>{let a=side?LSP*.5:0,last=null;
    for(let i=1;i<=iEnd&&i<Ed.length;i++){const p0=Ed[i-1],p1=Ed[i];a+=Math.hypot(p1.X-p0.X,p1.Z-p0.Z);if(a<LSP)continue;
      const p=toS(p1.X,p1.Z);if(p.y>H+30||p.x<-30||p.x>W+30)continue;if(p.s<.016)continue;
      if(last&&Math.hypot(p.x-last.x,p.y-last.y)<Math.max(4.5*U,30*U*1.18*p.s*.75))continue;a=0;last=p;if(tdist(p.x,p.y)<20*U)continue;
      lamps.push({x:p.x,y:p.y,sz:30*U*1.18*p.s,k:0,ri:i})}});
  const nRoad=lamps.length-nSky;
  // everyone else: lamps set down beside the road, crowding its banks and thinning into the dark
  const sub=[];for(let i=0;i<=iEnd;i+=3)sub.push(i);
  // a coarse lookup of ground distance to the road (and the nearest road index), per screen cell
  const LC=8*U, LW=Math.ceil((W+60)/LC)+1, LH=Math.ceil((H-GY)/LC)+2, LD=new Float32Array(LW*LH), LI=new Int16Array(LW*LH);
  for(let j=0;j<LH;j++)for(let i=0;i<LW;i++){const g=toG(-30+i*LC,GY+Math.max(.6,j*LC));let m=1e18,bi=0;
    for(const k of sub){const dx=gc[k].X-g.X,dz=gc[k].Z-g.Z,d=dx*dx+dz*dz;if(d<m){m=d;bi=k}}LD[j*LW+i]=Math.sqrt(m);LI[j*LW+i]=bi}
  const nearRoad=(g,x,y)=>{const i=Math.max(0,Math.min(LW-1,Math.round((x+30)/LC))),j=Math.max(0,Math.min(LH-1,Math.round((y-GY)/LC)));return [LD[j*LW+i],LI[j*LW+i]]};
  const CELL=40*U, grid=new Map(), fl2=[]; const key=(i,j)=>i*10007+j;
  const DL=640*U; let tries=0;
  while(lamps.length<1000&&tries++<300000){const late=tries>150000, DLx=tries<80000?DL:late?DL*2.6:DL*1.6;
    const s=.016+1.0*Math.pow(R(),1.2),y=GY+(H-GY)*s,x=-20+R()*(W+40);
    if(y>H-6)continue;const td=tdist(x,y);if(td<10*U+30*U*s)continue;
    const [dr,ri]=nearRoad(null,x,y);const d=dr-RW;if(d<34*U)continue;
    if(R()>Math.max(Math.exp(-d/DLx),y<TY0-20*U?.06:0))continue;
    const sz=22*U*1.18*s*(.82+.36*R());
    if(Math.abs(x-CX)<120*U&&y<GY+8*U)continue;
    const sep=(1+d/(820*U))*(late?.8:1);const gi=Math.floor(x/CELL),gj=Math.floor(y/CELL);let ok=true;
    for(let a=-2;a<=2&&ok;a++)for(let b=-2;b<=2&&ok;b++){const L=grid.get(key(gi+a,gj+b));if(!L)continue;
      for(const l of L){const dx=l.x-x,dy=(l.y-y)*1.9;const r=((l.sz+sz)*1.15+2.4*U)*sep;if(dx*dx+dy*dy<r*r){ok=false;break}}}
    if(!ok)continue;const o={x,y,sz,k:1,ri,d};const kk=key(gi,gj);(grid.get(kk)||grid.set(kk,[]).get(kk)).push(o);fl2.push(o);lamps.push(o)}
  S.count={lamps:lamps.length,sky:nSky,road:nRoad,field:fl2.length,tries};
  // ---------- when each lamp catches: down the road from the flame, then outward across the plain; the city from the centre out
  const rt=i=>Math.pow(cl(acc[Math.min(i,iEnd)]/LEN),.75);
  let maxD=1;for(const l of fl2)maxD=Math.max(maxD,l.d);
  for(const l of lamps){
    if(l.k===3) l.t0=3.6+6.4*Math.pow(Math.abs(l.x-CX)/(W*.7),.85)+R()*.9;
    else if(l.k===0) l.t0=3.0+7.2*rt(l.ri)+R()*.25;
    else l.t0=3.4+7.2*rt(l.ri)+4.6*Math.pow(l.d/maxD,.6)+R()*1.6;
    l.t0=Math.min(l.t0,16.4);
    l.near=l.k!==3&&l.sz>=11*U;        // near lamps stay live (they flicker); the rest are stamped once lit
    l.ph=R()*6.283; l.fr=.7+R()*.8;
  }
  lamps.sort((a,b)=>a.y-b.y);
  let EMAX=0;for(const l of lamps){l.ed=Math.hypot(l.x-CX,(l.y-GY)/.54);EMAX=Math.max(EMAX,l.ed)} S.EMAX=EMAX+40*U;
  S.lamps=lamps; S.near=lamps.filter(l=>l.near); S.wait=lamps.filter(l=>!l.near).sort((a,b)=>a.t0-b.t0); S.wi=0; S.active=[];
  S.tw=lamps.filter(l=>!l.near&&l.k!==3&&l.sz>3*U).filter((l,i)=>i%7===0);  // a few lamps that breathe on their own
  // ---------- static layers
  const [bgD,bx]=mk(W,H), [bgL,lx]=mk(W,H);
  const roadPath=c=>{c.beginPath();let p=toS(EL[0].X,EL[0].Z);c.moveTo(p.x,p.y);for(let i=1;i<=Math.min(iEnd+2,EL.length-1);i++){p=toS(EL[i].X,EL[i].Z);c.lineTo(p.x,p.y)}
    for(let i=Math.min(iEnd+2,ER.length-1);i>=0;i--){p=toS(ER[i].X,ER[i].Z);c.lineTo(p.x,p.y)}c.closePath()};
  const horizon=c=>{c.beginPath();c.moveTo(0,GY+1);for(let x=0;x<=W;x+=24)c.lineTo(x,gyAt(x)+1);c.lineTo(W,GY+1)};
  const paint=(c,lit)=>{
    let g=c.createLinearGradient(0,0,0,GY);g.addColorStop(0,'#0c0718');g.addColorStop(1,lit?'#1d0f35':'#160b29');c.fillStyle=g;c.fillRect(0,0,W,GY+2);
    g=c.createLinearGradient(0,GY,0,H);g.addColorStop(0,lit?'#4b2378':'#2c1548');g.addColorStop(.22,lit?'#361a5c':'#221137');g.addColorStop(.6,'#1e1038');g.addColorStop(1,'#130a24');
    c.fillStyle=g;c.fillRect(0,GY,W,H-GY);
    if(lit){ // the light pool on the ground, the halo and dome in the sky (the card's pool, halo, dome)
      c.save();c.beginPath();c.rect(0,GY,W,H-GY);c.clip();c.translate(CX,GY);c.scale(1,.62);
      g=c.createRadialGradient(0,0,0,0,0,860*U);g.addColorStop(0,'rgba(240,146,90,.62)');g.addColorStop(.22,'rgba(201,92,134,.36)');g.addColorStop(.6,'rgba(138,70,180,.13)');g.addColorStop(1,'rgba(138,70,180,0)');
      c.fillStyle=g;c.fillRect(-1600*U,0,3200*U,1200*U/.62);c.restore();
      c.save();c.beginPath();c.rect(0,0,W,GY+1);c.clip();
      g=c.createRadialGradient(CX,GY-110*U,0,CX,GY-110*U,300*U);g.addColorStop(0,'rgba(255,184,90,.5)');g.addColorStop(.4,'rgba(233,122,94,.22)');g.addColorStop(.75,'rgba(154,80,192,.08)');g.addColorStop(1,'rgba(154,80,192,0)');
      c.fillStyle=g;c.fillRect(0,0,W,GY+1);
      c.translate(CX,GY+2);c.scale(1,.27);g=c.createRadialGradient(0,0,0,0,0,880*U);g.addColorStop(0,'rgba(232,138,122,.42)');g.addColorStop(.35,'rgba(178,90,168,.22)');g.addColorStop(.7,'rgba(122,63,176,.08)');g.addColorStop(1,'rgba(122,63,176,0)');
      c.fillStyle=g;c.fillRect(-1000*U,-900*U,2000*U,1800*U);c.restore(); }
    // the road
    c.save();roadPath(c);g=c.createLinearGradient(0,GY,0,H);
    if(lit){g.addColorStop(0,'rgba(255,217,160,.85)');g.addColorStop(.12,'rgba(233,164,140,.52)');g.addColorStop(.35,'rgba(168,115,200,.36)');g.addColorStop(.7,'rgba(123,85,180,.28)');g.addColorStop(1,'rgba(106,74,166,.24)');}
    else {g.addColorStop(0,'rgba(140,100,160,.25)');g.addColorStop(1,'rgba(70,46,110,.18)');}
    c.fillStyle=g;c.fill();c.restore();
    // city silhouettes
    g=c.createLinearGradient(0,GY-90*U,0,GY+2);g.addColorStop(0,'#1b0e33');g.addColorStop(.7,lit?'#2f1752':'#22113d');g.addColorStop(1,lit?'#4a2470':'#2e1650');c.fillStyle=g;
    for(const r of roofs){c.globalAlpha=r[4]?.96:.8;c.fillRect(r[0],r[2],r[1]-r[0],r[3]-r[2]+1)}c.globalAlpha=1;
    // the horizon hairline
    g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(199,154,240,.12)');g.addColorStop(CX/W*.66,'rgba(240,180,140,.5)');g.addColorStop(CX/W,'rgba(255,233,184,1)');g.addColorStop(Math.min(.99,CX/W+.17),'rgba(240,180,140,.5)');g.addColorStop(1,'rgba(199,154,240,.25)');
    c.strokeStyle=g;c.lineWidth=1.3*U;c.globalAlpha=lit?1:.35;horizon(c);c.stroke();c.globalAlpha=1; };
  paint(bx,false); paint(lx,true);
  // the world: the unlit ground, onto which every lamp is stamped as it finishes catching; the light (lit minus unlit) rides on top at half size
  const [wd,wx]=mk(W,H); wx.setTransform(1,0,0,1,0,0); wx.drawImage(bgD,0,0); wx.setTransform(DPR,0,0,DPR,0,0); S.world=wd; S.wx=wx;
  const ov=document.createElement('canvas'); ov.width=Math.round(W/2); ov.height=Math.round(H/2); { const o=ov.getContext('2d'); o.drawImage(bgL,0,0,ov.width,ov.height); o.globalCompositeOperation='difference'; o.drawImage(bgD,0,0,ov.width,ov.height); }
  S.ov=ov; S.bakedL=false; S.bakedC=false;
  // the lit lamps (stamped as they finish catching)
  // ---------- the crown: twenty rings of fifty petals, each ring larger than the last by one ratio (exactly 1000 petals)
  const NR=20,NP=50,PLEN=3.4,PWID=1.9, CR0=58*U*1.33*.98, RMAX=420*U*1.0, q=Math.pow(RMAX/CR0,1/(NR-1+PLEN)), da=Math.PI/NP;
  const CW=RMAX+12, [cr,crx]=mk(CW*2,CW+4); S.cr=cr; S.CW=CW; S.CR0=CR0; S.RMAX=RMAX;
  crx.save(); crx.beginPath(); crx.rect(0,0,CW*2,CW+1); crx.clip(); crx.translate(CW,CW+1);
  const gS=crx.createRadialGradient(0,0,0,0,0,RMAX);gS.addColorStop(.15,'rgba(255,240,196,1)');gS.addColorStop(.45,'rgba(247,196,142,.8)');gS.addColorStop(.75,'rgba(227,166,207,.55)');gS.addColorStop(1,'rgba(190,152,238,.34)');
  const gF=crx.createRadialGradient(0,0,0,0,0,RMAX);gF.addColorStop(.08,'rgba(255,226,160,.22)');gF.addColorStop(.3,'rgba(255,194,122,.12)');gF.addColorStop(.6,'rgba(229,138,168,.055)');gF.addColorStop(1,'rgba(168,120,232,.03)');
  crx.strokeStyle=gS; crx.fillStyle=gF; crx.lineJoin='round'; let nP=0;
  for(let k=NR-1;k>=0;k--){const ra=CR0*Math.pow(q,k),rtp=ra*Math.pow(q,PLEN),rm=ra*Math.pow(q,PLEN*.5);
    crx.beginPath();
    for(let i=0;i<NP;i++){const th=-Math.PI+(i+(k%2?1:.5))*da, w=da*.5*PWID, P=(r,t)=>[Math.cos(t)*r,Math.sin(t)*r];
      let p=P(ra,th-w);crx.moveTo(p[0],p[1]);let m=P(rm,th-w*1.5),e=P(rtp,th);crx.quadraticCurveTo(m[0],m[1],e[0],e[1]);
      m=P(rm,th+w*1.5);e=P(ra,th+w);crx.quadraticCurveTo(m[0],m[1],e[0],e[1]);crx.closePath();nP++}
    crx.fill(); crx.lineWidth=(.42+.4*k/(NR-1))*U*1.6; crx.stroke(); }
  crx.restore(); S.count.petals=nP;
  // motes: light walking home up the road toward the flame (positions are pure functions of t)
  const motes=[];for(let i=0;i<110;i++){motes.push({tb:10.5+R()*15.5,dur:6.5+R()*4,u0:.25+R()*.75,off:(R()*2-1)*RW*(1.1+R()*1.6),h:R(),sz:.7+R()*.8,ph:R()*6.28})}
  S.motes=motes; S.RW=RW;
  S.count.near=S.near.length; S.count.tw=S.tw.length; window.__sahasrara=S.count;
},
draw(E,t,dt){
  const S=this._s, c=E.ctx, W=S.W, H=S.H, ss=E.ss, CX=S.CX, GY=S.GY, U=S.U;
  // a seek replays dt steps back to back; those frames are never shown, so only the state advances (the lamps' stamping)
  const now=performance.now(), replay=!!E.seeking; S.last=now;
  if(replay){ S.step(t); return; }
  // ---- light level: arrives dim, gathers as the lamps catch
  const Lv=.18+.82*ss(1.5,14,t);
  c.drawImage(S.world,0,0,W,H);
  if(!S.bakedL){ c.globalCompositeOperation='lighter'; c.globalAlpha=Lv; c.drawImage(S.ov,0,0,W,H); c.globalCompositeOperation='source-over'; c.globalAlpha=1; }
  // ---- the crown opens ring by ring from the flame's foot (a growing aperture), then breathes
  const open=ss(3.2,16.5,t), Rr=S.CR0*.9+(S.RMAX+14-S.CR0*.9)*open, CW=S.CW;
  const breathe=1;
  const cx0=CX-CW*breathe, cy0=GY+1-(CW+1)*breathe, cw=CW*2*breathe, ch=(CW+4)*breathe;
  const ca=.25+.75*ss(3,11,t), FE=70*U*(open<1?1:0);
  const band=(r0,r1,al)=>{ if(r1<=0||al<=0) return; c.save(); c.beginPath(); c.arc(CX,GY+1,Math.max(.5,r1),Math.PI,2*Math.PI);
    if(r0>0.5) c.arc(CX,GY+1,r0,2*Math.PI,Math.PI,true); c.closePath(); c.clip(); c.globalAlpha=al; c.drawImage(S.cr,cx0,cy0,cw,ch); c.restore(); };
  if(S.bakedC) {} else if(open>=1) { c.globalAlpha=ca; c.drawImage(S.cr,cx0,cy0,cw,ch); }
  else { band(0,Rr-FE,ca); band(Rr-FE,Rr-FE*.5,ca*.66); band(Rr-FE*.5,Rr,ca*.3); }
  c.globalAlpha=1;
  // a soft warm heart at the flame's foot, so the aperture glows rather than ends
  c.globalCompositeOperation='lighter'; { const r=S.CR0*2.1; c.globalAlpha=.42*ca; S.put(c,'flare',CX-r,GY+1-r,r*2,r*2); }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
  // ---- RECEIVE: two waves of light flow inward through the petals to the flame (18-24 s), in three soft bands
  for(const [w0,wd] of [[17.6,4.2],[20.8,4.0]]){ const u=(t-w0)/wd; if(u<=0||u>=1) continue; const env=Math.sin(Math.PI*u)*ss(3,11,t);
    const e=ss(0,1,u), r=(S.RMAX+50*U)*(1-e)+S.CR0*.55*e, bw=26*U*(1-.5*e);
    c.globalCompositeOperation='lighter';
    for(const [o,al] of [[-2.5,.18],[-1.5,.45],[-.5,.85],[.5,.85],[1.5,.45],[2.5,.18]]){ const r1=r+o*bw+bw/2, r0=Math.max(.5,r+o*bw-bw/2); if(r1<1) continue;
      c.save(); c.beginPath(); c.arc(CX,GY+1,r1,Math.PI,2*Math.PI); c.arc(CX,GY+1,r0,2*Math.PI,Math.PI,true); c.closePath(); c.clip();
      c.globalAlpha=al*env; c.drawImage(S.cr,cx0,cy0,cw,ch); c.restore(); }
    c.globalCompositeOperation='source-over'; c.globalAlpha=1; }
  // ---- lamps: stamp those that have finished catching, draw the ones catching now
  const IGN=S.IGN;
  S.step(t);
  // catching lamps: a small flare of light, the flame rising out of the wick
  c.globalCompositeOperation='lighter';
  for(const l of S.active){ if(l.sz<3.2*U&&l.k!==0) continue; const u=(t-l.t0)/IGN, fl=Math.sin(Math.PI*Math.min(1,u*1.3)), r=Math.max(l.sz,2.2*U)*(l.k===3?3:4.2);
    c.globalAlpha=(l.k===0?.28:.36)*fl; S.put(c,'flare',l.x-r,l.y-l.sz*.4-r,r*2,r*2); }
  c.globalCompositeOperation='source-over';
  for(const l of S.active){ const u=(t-l.t0)/IGN; S.drawLamp(c,l,ss(0,.75,u),.6+.4*ss(0,1,u)); }
  // near lamps stay live: a slow, soft flicker
  for(const l of S.near){ if(t<l.t0) continue; const u=ss(0,IGN,t-l.t0);
    const fs=.94+.08*E.noise(t*.9*l.fr+l.ph,l.ph*3.1);
    if(u<1){ const r=Math.min(l.sz*3.4,70*U), fl=Math.sin(Math.PI*Math.min(1,(t-l.t0)/IGN*1.3)); c.globalCompositeOperation='lighter'; c.globalAlpha=.3*fl; S.put(c,'flare',l.x-r,l.y-l.sz*.4-r,r*2,r*2); c.globalCompositeOperation='source-over'; }
    if(l.st) S.drawLamp(c,l,1,fs,2); else S.drawLamp(c,l,u,(.6+.4*u)*fs); }
  c.globalAlpha=1;
  // a few lamps breathe on their own (after all are lit)
  const lt=ss(16,19,t);
  if(lt>0){ c.globalCompositeOperation='lighter';
    for(const l of S.tw){ const b=.5+.5*Math.sin(t*(.6+.5*l.fr)+l.ph); const r=l.sz*2.2; c.globalAlpha=.32*lt*b*b; S.put(c,'glow',l.x-r,l.y-l.sz*.5-r,r*2,r*2); }
    c.globalCompositeOperation='source-over'; c.globalAlpha=1; }
  // ---- RECEIVE on the ground: a swell of light runs back from the near field, up the plain, to the flame
  for(const [w0,wd] of [[17.2,4.4],[20.4,4.2]]){ const u=(t-w0)/wd; if(u<=0||u>=1) continue; const env=Math.sin(Math.PI*u);
    const rr=(1-ss(0,1,u))*S.EMAX, band=150*U*(.45+.55*(1-u)); c.globalCompositeOperation='lighter';
    for(const l of S.lamps){ const k=(l.ed-rr)/band; if(k<-1||k>1) continue; const b=1-k*k; const r=Math.max(l.sz,2.4*U)*(l.k===3?2.6:3.2);
      c.globalAlpha=.6*env*b*b; S.put(c,'flare',l.x-r,l.y-l.sz*.45-r,r*2,r*2); }
    c.globalCompositeOperation='source-over'; c.globalAlpha=1; }
  // ---- motes: light walking home up the road to the flame
  const R0=S.road, gc=R0.gc; c.globalCompositeOperation='lighter';
  for(const m of S.motes){ const u=(t-m.tb)/m.dur; if(u<=0||u>=1) continue;
    const pos=m.u0*(1-u*u*(3-2*u))*.98+.02*(1-u); let target=pos*R0.LEN, i=0; while(i<R0.iEnd&&R0.acc[i+1]<target)i++;
    const a=gc[i], b=gc[Math.min(i+1,gc.length-1)], f=(target-R0.acc[i])/Math.max(1e-6,R0.acc[i+1]-R0.acc[i]);
    let X=a.X+(b.X-a.X)*f, Z=a.Z+(b.Z-a.Z)*f; const tx=b.X-a.X,tz=b.Z-a.Z,mm=Math.hypot(tx,tz)||1; const off=m.off*Math.min(1,pos*2.2)+Math.sin(t*.5+m.ph)*S.RW*.25*pos;
    X+=-tz/mm*off; Z+=tx/mm*off; if(Z<1) continue; const p=S.toS(X,Z); const lift=(26+60*m.h)*U*p.s+(1-pos)*6*U;
    const al=Math.sin(Math.PI*u)*ss(0,.15,pos)*1; const r=(7+40*p.s)*m.sz*U;
    c.globalAlpha=al; S.put(c,'mote',p.x-r,p.y-lift-r,r*2,r*2); }
  c.globalCompositeOperation='source-over';
  // ---- the flame's light received: a soft swell at its foot when each wave arrives, then a steady warm pool
  const arrive=Math.exp(-Math.pow((t-21.7)/1.4,2))+Math.exp(-Math.pow((t-24.6)/1.5,2));
  c.globalCompositeOperation='lighter';
  const pr=260*U*(1+.25*arrive); c.globalAlpha=(.22+.3*arrive)*Lv; c.save(); c.translate(CX,GY+4*U); c.scale(1,.34); S.put(c,'flare',-pr,-pr,pr*2,pr*2); c.restore();
  if(arrive>.01){ c.globalAlpha=.35*arrive; const hr=420*U; S.put(c,'glow',CX-hr,GY-90*U-hr,hr*2,hr*2); }
  c.globalCompositeOperation='source-over'; c.globalAlpha=1;
} });
