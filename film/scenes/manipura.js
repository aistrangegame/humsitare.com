/* Manipura · The Solar Plexus — "The City Built in a Car Park".
   The lamp lands above an empty, wet car park. Because it is here, a city of lamps builds itself course by course,
   nearest first, the tallest tower rising to meet the flame. At the peak (BUILD) the crown tower seats the lamp, the
   ten-petalled yantra with its downward triangle draws itself around the flame, and strings of lamps run roof to roof.
   Then the finished city breathes. Geometry follows the wall card (manipura-wall/card.html). */
(() => {
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const rgb=c=>'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';
const mix=(a,b,t)=>{t=cl(t);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]};
const TXT={x:.055,y:.405,w:.40,align:'left'};
function geom(W,H){ const k=H/1080, BY=H*.365; return {k,W,H,LX:W*.685,GY:H*.79,BY,CY:BY-64*k,YR:122*k}; }
const PEAK=20.4;                       // the crown reaches the flame

/* teardrop flame whose base rests at (x,y) */
function drop(c,x,y,h,tilt){ const w=h*.36,tx=x+tilt*h;
  c.moveTo(tx,y-h); c.bezierCurveTo(tx+w*.25,y-h*.62,x+w,y-h*.48,x+w,y-h*.26);
  c.bezierCurveTo(x+w,y-h*.1,x+w*.55,y,x,y); c.bezierCurveTo(x-w*.55,y,x-w,y-h*.1,x-w,y-h*.26);
  c.bezierCurveTo(x-w,y-h*.46,tx-w*.3,y-h*.6,tx,y-h); c.closePath(); }

let G=null;   // everything built in init

function mkCanvas(w,h,dpr){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.ceil(w*dpr)); c.height=Math.max(1,Math.ceil(h*dpr)); const x=c.getContext('2d'); return {c,x}; }

FILM.scene({ id:'manipura', dur:32, text:TXT,
  lamp(t){ const g=geom(innerWidth,innerHeight), u=ss(16.4,PEAK+.2,t);
    return {x:g.LX, y:g.BY-34*g.k*(1-u), s:1.2+.16*ss(17,PEAK+1.2,t)}; },

  init(E){
    const W=E.W,H=E.H,D=E.DPR, g=geom(W,H), {k,LX,GY,BY,CY,YR}=g, R=E.rand(20261124);
    // where the words sit (generous): nothing tall or bright may stand here
    const TX0=W*TXT.x-30*k, TX1=W*(TXT.x+TXT.w)+50*k, TY0=H*TXT.y-30*k, TY1=H*TXT.y+285*k;
    const topLimit=(x0,x1)=> (x1>TX0&&x0<TX1)? TY1+26*k : 0;
    const prox=(x,y)=>cl(1-Math.hypot(x-LX,(y-CY)*.9)/(900*k));

    /* ---------- the towers ---------- */
    const LEFT=LX-(W*.44), RIGHT=W+60*k-LX, crownH=GY-BY;
    const B=[];
    const HF=[[.86,.60],[.64,.47],[.43,.31],[.21,.11]];       // height fraction at centre, drop to edge
    const WD=[[44,70],[40,64],[38,60],[32,54]];
    function row(layer,x0,x1){ let x=x0;
      while(x<x1){ const w=(WD[layer][0]+R()*(WD[layer][1]-WD[layer][0]))*k, cx=x+w/2, dx=cx-LX, u=cl(Math.abs(dx)/(dx<0?LEFT:RIGHT));
        const hf=HF[layer][0]-HF[layer][1]*Math.pow(u,.9);
        let top=GY-crownH*hf+(R()-.5)*48*k; top=Math.max(top,topLimit(x,x+w));
        const nearCrown=Math.abs(cx-LX)<(layer===0?62:layer===1?46:0)*k+w/2 && (layer===0||top<BY+120*k);
        if(!nearCrown&&top<GY-22*k&&x+w>LX-LEFT) B.push({layer,x,w,top,cx,u});
        x+=w+(R()<.26?(2+R()*7)*k:0); } }
    row(0,LX-LEFT-40*k,W+40*k); row(1,LX-LEFT-60*k,W+40*k); row(2,LX-LEFT-80*k,W+40*k); row(3,LX-LEFT-100*k,W+40*k);
    const crown={layer:0,x:LX-50*k,w:100*k,top:BY+3*k,cx:LX,u:0,crown:true}; B.push(crown);

    // schedule: front rows first, nearest the lamp first; the crown rises all the way to the flame
    const ST=[[6.4,5.2,7,2.6],[5,4.8,6,2.2],[3.6,4.2,5,2],[2.2,3.4,3.6,1.6]];
    for(const b of B){ if(b.crown){ b.t0=6.6; b.t1=PEAK; continue; }
      const s=ST[b.layer]; b.t0=s[0]+b.u*s[1]+(R()-.5)*1.2; b.t1=Math.min(19.4,b.t0+s[2]+R()*s[3]); }
    // lights catch a moment after each course is laid
    for(const b of B) b.lag=b.crown?.5:.8+R()*.5;

    /* ---------- per-tower detail (positions and choices fixed here; baked later) ---------- */
    const DARK=[[52,34,5],[46,30,4],[40,26,4],[34,22,3]], LITB=[[204,142,22],[176,122,18],[150,103,14],[124,85,12]];
    const LITC=[[255,251,230],[255,230,150],[247,190,76]];
    for(const b of B){
      const p=prox(b.cx,b.top+30*k), x0=b.x, x1=b.x+b.w; b.p=p; b.side=b.cx<LX?1:-1;
      let SL,SR;
      if(b.crown){SL=SR=[[30*k,0],[20*k,15*k],[10*k,34*k],[0,58*k]]}
      else{const q=R(),a=[[0,0]],s1=[[b.w*(.2+R()*.18),0],[0,(9+R()*18)*k]],s2=[[b.w*(.3+R()*.1),0],[b.w*.14,(8+R()*8)*k],[0,(20+R()*14)*k]];
        if(q<.3){SL=a;SR=a}else if(q<.5){SL=s1;SR=a}else if(q<.7){SL=a;SR=s1}else if(q<.86){SL=s2;SR=s2}else{SL=s1;SR=s1}}
      const base=b.top+Math.max(SL[SL.length-1][1],SR[SR.length-1][1]);
      const pts=[[x0,GY]];
      for(let i=SL.length-1;i>=0;i--){pts.push([x0+(i<SL.length-1?SL[i+1][0]:0),b.top+SL[i][1]]);pts.push([x0+SL[i][0],b.top+SL[i][1]])}
      for(let i=0;i<SR.length;i++){pts.push([x1-SR[i][0],b.top+SR[i][1]]);pts.push([x1-SR[i][0],i<SR.length-1?b.top+SR[i+1][1]:GY])}
      b.pts=pts; b.base=base; const S=b.side>0?SR:SL; b.ftop=b.top+S[S.length-1][1];
      b.fill=DARK[b.layer]; b.lfill=mix(DARK[b.layer],LITB[b.layer],b.crown?.42:p*p*.72+.05);
      const hh=[8.4,9.4,10.6,11.6][b.layer]*k*1.08, cs=[14.5,16,18,20][b.layer]*k*1.08, rs=[22,24.5,27,30][b.layer]*k*1.08;
      const n=Math.max(1,Math.floor((b.w-10*k)/cs)), cs2=(b.w-10*k)/n, sy=base+rs*.86;
      b.courses=[]; b.lamps=[];
      for(let y=sy;y<GY-5*k;y+=rs){ b.courses.push(y+2.4*k);
        for(let i=0;i<n;i++){ const x=x0+5*k+cs2*(i+.5), pl=prox(x,y), on=(b.crown&&y<sy+rs*4)||R()<cl(.30+pl*1.25);
          b.lamps.push({x,y,h:hh*(.88+R()*.24),tilt:(R()-.5)*.24,on,p:pl}); } }
      if(b.crown){ const T=b.top; [[x0+5*k,T+58*k],[x1-5*k,T+58*k],[x0+15*k,T+34*k],[x1-15*k,T+34*k],[x0+38*k,T+34*k],[x0+50*k,T+34*k],[x0+62*k,T+34*k]]
        .forEach(q=>b.lamps.push({x:q[0],y:q[1],h:8.5*k*1.08,tilt:(R()-.5)*.2,on:true,p:1})); }
      for(const L of b.lamps){ const P=L.p; L.col=P>.5?mix(LITC[1],LITC[0],(P-.5)*2.2):mix(LITC[2],LITC[1],P*2); L.gr=L.h*(1.7+P*2.3); L.ga=(.22+P*.55)*(b.crown?.6:1); }
      b.nScaf=Math.max(2,Math.round(b.w/(20*k)));
      b.work=(1+(R()*b.nScaf|0)-.5)/b.nScaf;
    }
    B.sort((a,b)=>a.layer-b.layer||(Math.abs(b.cx-LX)-Math.abs(a.cx-LX)));

    /* ---------- strings of small lamps, roof to roof ---------- */
    const roofs=B.filter(b=>!b.crown&&b.layer<3&&b.top>BY+70*k&&b.top-topLimit(b.x,b.x+b.w)>60*k&&!(Math.abs(b.cx-LX)<150*k&&b.top<BY+180*k)).sort((a,b)=>a.cx-b.cx);
    const strings=[];
    for(let i=0;i<roofs.length-1;i++){ const a=roofs[i]; let b=null;
      for(let j=i+1;j<roofs.length&&j<i+4;j++){const dx=roofs[j].cx-a.cx;if(dx>46*k&&dx<160*k&&Math.abs(roofs[j].top-a.top)<90*k&&R()<.6){b=roofs[j];break}}
      if(!b) continue;
      const pa=15*k, sag=(14+R()*16)*k, mid=(a.cx+b.cx)/2, n=Math.max(4,Math.round((Math.hypot(b.cx-a.cx,b.top-a.top)+sag*.6)/(10.5*k)));
      const fromLeft=mid>LX; // light runs outward from the centre
      strings.push({ax:a.cx,ay:a.top,bx:b.cx,by:b.top,pa,sag,n,fromLeft,ph:R()*6.28,
        t0:Math.max(17.4+cl(Math.abs(mid-LX)/(W*.32))*3.4, Math.max(a.t1,b.t1)+.4)}); }

    /* ---------- the car park floor: rows of lamps in bowls ---------- */
    // lamps catch outward from under the city; each row is baked to a strip once its lamps are in, and copied
    const VY=GY-70*k, floor=[], rows=[];
    for(let r=0,y=GY+13*k;y<H-6*k;r++,y+=11*k*Math.pow(1.3,r)){ const sc=(y-VY)/(H-VY), h=(4.5+sc*17)*k, step=210*k*sc/3, row={y,h,lamps:[]};
      for(let i=-80;i<=80;i++){ const x=LX+(i+.5)*step; if(x<-10||x>W+10) continue;
        if(x<TX1&&y<TY1+20*k) continue;
        const pr=cl(1-Math.abs(x-LX)/(1000*k)), lit=R()<.16+pr*.7&&pr>.24;
        const dist=Math.hypot((x-LX)/sc,(y-GY)*6)/k;            // ground-plane distance from under the city
        const f={x,y,h,lit,pr,a:(.18+.82*pr*pr)*(1-.35*cl((y-GY)/(H-GY))),tl:1.6+Math.pow(dist/1700,.8)*13,adx:Math.abs(x-LX),half:step/2};
        floor.push(f); if(lit) row.lamps.push(f); }
      row.lamps.sort((a,b)=>a.adx-b.adx); const sz=h*4; row.by=Math.floor(y-sz*.63-2); row.bh=Math.ceil(sz+4); rows.push(row); }

    /* ---------- embers: analytic, rising slowly over the city ---------- */
    const embers=[]; for(let i=0;i<54;i++){ const side=R()<.5?-1:1, dx=side*Math.pow(R(),1.6)*620*k;
      embers.push({x:LX+dx, y:GY-(60+R()*360)*k*(1-Math.abs(dx)/(900*k)), v:(9+R()*14)*k, life:7+R()*6, ph:R()*20, sw:(4+R()*9)*k, s:(5+R()*9)*k}); }

    /* ---------- sprites ---------- */
    const SPR={};
    SPR.g1=E.sprite([[0,'rgba(255,212,92,.85)'],[.35,'rgba(247,169,30,.34)'],[1,'rgba(232,143,8,0)']],64);
    SPR.halo=E.sprite([[0,'rgba(255,194,60,.64)'],[.38,'rgba(238,158,20,.28)'],[.75,'rgba(194,124,8,.10)'],[1,'rgba(194,124,8,0)']],256);
    SPR.ember=E.sprite([[0,'rgba(255,226,150,1)'],[.25,'rgba(255,170,60,.5)'],[1,'rgba(220,110,20,0)']],32);
    SPR.refl=(()=>{const s=document.createElement('canvas');s.width=8;s.height=64;const c=s.getContext('2d'),gr=c.createLinearGradient(0,0,0,64);
      gr.addColorStop(0,'rgba(255,216,96,1)');gr.addColorStop(.35,'rgba(255,200,80,.35)');gr.addColorStop(1,'rgba(255,200,80,0)');c.fillStyle=gr;c.fillRect(0,0,8,64);return s})();
    // a lit lamp in its bowl: two warmths
    function bowlSprite(col){ const s=document.createElement('canvas'); s.width=96; s.height=96; const c=s.getContext('2d');
      // base of flame at (48,60), flame height 24
      c.globalCompositeOperation='lighter'; const gr=c.createRadialGradient(48,50,0,48,50,46);
      gr.addColorStop(0,'rgba(255,212,92,.8)');gr.addColorStop(.35,'rgba(247,169,30,.3)');gr.addColorStop(1,'rgba(232,143,8,0)'); c.fillStyle=gr; c.fillRect(0,0,96,96);
      c.globalCompositeOperation='source-over';
      c.beginPath(); c.moveTo(48-13,60); c.quadraticCurveTo(48,60+10,48+13,60); c.closePath(); c.fillStyle='#8a6412'; c.fill(); c.strokeStyle='rgba(232,189,76,.8)'; c.lineWidth=1; c.stroke();
      c.beginPath(); drop(c,48,60.5,24,0); c.fillStyle=col; c.fill(); return s; }
    SPR.bowlHot=bowlSprite('rgb(255,240,190)'); SPR.bowlAmb=bowlSprite('rgb(250,200,92)');
    function smallSprite(col){ const s=document.createElement('canvas'); s.width=48; s.height=48; const c=s.getContext('2d');
      c.globalCompositeOperation='lighter'; const gr=c.createRadialGradient(24,26,0,24,26,22);
      gr.addColorStop(0,'rgba(255,212,92,.75)');gr.addColorStop(.4,'rgba(247,169,30,.25)');gr.addColorStop(1,'rgba(232,143,8,0)'); c.fillStyle=gr; c.fillRect(0,0,48,48);
      c.globalCompositeOperation='source-over'; c.beginPath(); drop(c,24,31,12,0); c.fillStyle=col; c.fill(); return s; }
    SPR.str=smallSprite('rgb(255,236,170)');

    /* ---------- the two grounds: night, and lit ---------- */
    function ground(lit){ const o=mkCanvas(W,H,D), c=o.x; c.setTransform(D,0,0,D,0,0);
      const m=lit?1:.52, sh=v=>v.map(q=>q*m);
      let gr=c.createLinearGradient(0,0,0,GY); gr.addColorStop(0,rgb(sh([22,13,2]))); gr.addColorStop(.55,rgb(sh([40,25,3]))); gr.addColorStop(1,rgb(sh([74,48,6])));
      c.fillStyle=gr; c.fillRect(0,0,W,GY);
      gr=c.createLinearGradient(0,GY,0,H); gr.addColorStop(0,rgb(sh([92,61,7]))); gr.addColorStop(.25,rgb(sh([62,40,5]))); gr.addColorStop(.7,rgb(sh([36,24,3]))); gr.addColorStop(1,rgb(sh([24,16,2])));
      c.fillStyle=gr; c.fillRect(0,GY,W,H-GY);
      if(lit){ // the warm wash over the city, and the pool on the wet ground
        c.globalCompositeOperation='lighter';
        c.save(); c.translate(LX,GY-250*k); c.scale(1.25,1); gr=c.createRadialGradient(0,0,0,0,0,700*k);
        gr.addColorStop(0,'rgba(235,164,20,.36)'); gr.addColorStop(.5,'rgba(190,126,8,.13)'); gr.addColorStop(1,'rgba(190,126,8,0)'); c.fillStyle=gr; c.fillRect(-800*k,-800*k,1600*k,1600*k); c.restore();
        c.save(); c.beginPath(); c.rect(0,GY,W,H-GY); c.clip(); c.translate(LX,GY); c.scale(1.6,.5); gr=c.createRadialGradient(0,0,0,0,0,560*k);
        gr.addColorStop(0,'rgba(248,184,36,.5)'); gr.addColorStop(.4,'rgba(212,144,10,.2)'); gr.addColorStop(1,'rgba(212,144,10,0)'); c.fillStyle=gr; c.fillRect(-600*k,-600*k,1200*k,1200*k); c.restore();
        c.globalCompositeOperation='source-over'; }
      // painted bays running out from under the city
      c.beginPath(); for(let i=-26;i<=26;i++){ const xb=LX+(i*210+105)*k*1.1, x0=LX+(xb-LX)*(GY+2-VY)/(H-VY); c.moveTo(x0,GY+2); c.lineTo(xb,H); }
      gr=c.createLinearGradient(0,GY,0,H); gr.addColorStop(0,lit?'rgba(246,208,74,.62)':'rgba(246,208,74,.16)'); gr.addColorStop(.35,lit?'rgba(237,194,58,.3)':'rgba(237,194,58,.07)'); gr.addColorStop(1,'rgba(224,176,42,0)');
      c.strokeStyle=gr; c.lineWidth=1.4*k; c.stroke();
      // the bowls waiting on the ground
      c.beginPath(); for(const f of floor){ const bw=f.h*.52; c.moveTo(f.x-bw,f.y); c.quadraticCurveTo(f.x,f.y+f.h*.4,f.x+bw,f.y); c.closePath(); }
      c.fillStyle=lit?'#3e2c07':'#22180396'; c.fill(); c.strokeStyle=lit?'rgba(232,189,76,.34)':'rgba(232,189,76,.12)'; c.lineWidth=.6*k; c.stroke();
      // the ground line, brightest under the lamp
      gr=c.createLinearGradient(0,0,W,0); const ga=lit?1:.3;
      gr.addColorStop(0,`rgba(243,203,90,${.10*ga})`); gr.addColorStop(LX/W*.62,`rgba(247,213,113,${.4*ga})`); gr.addColorStop(LX/W,`rgba(255,240,184,${ga})`); gr.addColorStop(1,`rgba(243,203,90,${.35*ga})`);
      c.fillStyle=gr; c.fillRect(0,GY-.6*k,W,1.4*k);
      // the lit ground meets the night ground seamlessly left of x0 (only the right side is ever re-lit)
      // the words' clearing: keep the left side quiet
      gr=c.createLinearGradient(0,0,W*.56,0); gr.addColorStop(0,'rgba(6,4,0,.62)'); gr.addColorStop(.6,'rgba(6,4,0,.38)'); gr.addColorStop(1,'rgba(6,4,0,0)');
      c.fillStyle=gr; c.fillRect(0,0,W*.56,H);
      if(lit){ // left of x0 the lit ground IS the night ground, fading to the lit one over a quarter of the width
        const x0=Math.floor(W*.36), m2=mkCanvas(W,H,D), q=m2.x; q.drawImage(night,0,0); q.setTransform(D,0,0,D,0,0);
        q.globalCompositeOperation='destination-in'; gr=q.createLinearGradient(x0,0,x0+W*.26,0); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)');
        q.fillStyle=gr; q.fillRect(x0,0,W,H); c.setTransform(1,0,0,1,0,0); c.drawImage(m2.c,0,0); }
      return o.c; }

    /* ---------- city layers (baked a few towers per frame) ---------- */
    // each tower gets its own small pair of canvases (night, lit), with room for its glows
    for(const b of B){ b.bx=Math.floor(b.x-16*k); b.by=Math.floor(b.top-20*k); b.bw=Math.ceil(b.x+b.w+16*k)-b.bx; b.bh=Math.ceil(GY+2)-b.by; }

    const night=ground(false);
    G={W,H,D,g,k,LX,GY,BY,CY,YR,B,crown,strings,floor,embers,SPR,rows,baked:0,
       bgDark:night, bgLit:ground(true)};
  },

  draw(E,t,dt){
    const c=E.ctx, {W,H,D,k,LX,GY,BY,CY,YR,B,crown,strings,floor,embers,SPR}=G;
    // bake the city progressively (it is first needed at ~2 s)
    { let n=t>1.2?1e9:12; while(G.baked<B.length+G.rows.length&&n-->0){ const i=G.baked++; i<B.length?bake(B[i]):bakeRow(G.rows[i-B.length]); } }

    const warm=.14+.86*ss(1.5,PEAK+.6,t), bloom=Math.exp(-Math.pow((t-(PEAK+.5))/1.7,2));
    const breathe=t>PEAK?1-.05*(1-Math.cos((t-PEAK)*.9))*.5:1;

    /* ground */
    { const x0=Math.floor(W*.36);    // the warmth lives right of the words; left of x0 both grounds are the same
      c.imageSmoothingEnabled=false;
      c.drawImage(G.bgDark,0,0,warm>=.999?x0*D:W*D,H*D,0,0,warm>=.999?x0:W,H);
      c.globalAlpha=warm; c.imageSmoothingEnabled=false; c.drawImage(G.bgLit,x0*D,0,(W-x0)*D,H*D,x0,0,W-x0,H); c.imageSmoothingEnabled=true; c.globalAlpha=1; }

    /* light gathering under the lamp (the lamp's own pool on the empty ground at first) */
    const L=this.lamp(t);
    c.globalCompositeOperation='lighter';
    E.put(SPR.halo,LX,CY,(560+120*bloom)*k*(.6+.4*ss(8,PEAK,t)),.22+.38*ss(10,PEAK,t)+.25*bloom);
    c.save(); c.translate(LX,GY); c.scale(1,.28); E.put(SPR.halo,0,0,900*k,.25+.25*(1-ss(6,14,t))); c.restore();
    c.globalCompositeOperation='source-over';

    /* the yantra: circle, inner circle, the downward triangle, then ten petals unfurling */
    drawYantra(c,t,bloom,breathe);

    /* the city, back row to front: dark body as each course is laid, then its lamps catch */
    let li=0;
    for(let layer=0;layer<4;layer++){
      const scaf=new Path2D(), works=[], seams=[];
      for(;li<B.length&&B[li].layer===layer;li++){ const b=B[li];
        const gr=growth(b,t); if(gr<=0) continue;
        const h=GY-b.top, rt=GY-gr*h, pad=16*k*ss(.96,1,gr);
        const gl=growth(b,t-b.lag);
        if(gl<1) blit(c,b,b.dk,rt-pad);        // once fully lit, the lit copy covers the night copy
        if(gl>0){ const lt2=GY-gl*h, padl=16*k*ss(.96,1,gl);
          c.globalAlpha=Math.min(1,.55+gl); blit(c,b,b.lt,lt2-padl); c.globalAlpha=1; }
        if(gr<1){ // scaffold and the working lamp on the course being laid
          const sh=(20+10*(1-gr))*k*ss(0,.06,gr)*(1-ss(.93,1,gr)), np=b.nScaf;
          for(let i=0;i<=np;i++){ const x=lerp(b.x+2*k,b.x+b.w-2*k,i/np); scaf.moveTo(x,rt); scaf.lineTo(x,rt-sh*(.75+.25*((i*7)%3)/2)); }
          for(let y=rt-10*k;y>rt-sh;y-=10*k){ scaf.moveTo(b.x,y); scaf.lineTo(b.x+b.w,y); }
          works.push([lerp(b.x,b.x+b.w,b.work),rt-sh,b.p,sh/(30*k)]); seams.push([b.x,rt,b.w,b.p]); }
      }
      c.imageSmoothingEnabled=true; c.strokeStyle='rgba(244,211,108,.72)'; c.lineWidth=.9*k; c.stroke(scaf);
      c.globalCompositeOperation='lighter';
      for(const s of seams){ c.globalAlpha=.25+.5*s[3]; c.drawImage(SPR.refl,s[0],s[1]-1.5*k,s[2],6*k); }
      for(const w of works){ E.put(SPR.g1,w[0],w[1],(26+40*w[2])*k,cl(w[3])*(.6+.4*w[2])); E.put(SPR.ember,w[0],w[1],9*k,cl(w[3])); }
      c.globalCompositeOperation='source-over'; c.globalAlpha=1;
    }

    /* the wet car park gives each tower back */
    c.globalCompositeOperation='lighter';
    for(const b of B){ const gl=growth(b,t-b.lag); if(gl<=0) continue;
      const rh=(22+b.p*34)*k; c.globalAlpha=(.07+b.p*.24)*cl(gl*1.3)*breathe; c.drawImage(SPR.refl,b.x+b.w*.16,GY+1,b.w*.68,rh); }
    c.globalAlpha=1;

    /* light pooling on the crown's roof under the flame */
    E.put(SPR.halo,L.x,L.y+4*k,220*k,.28*ss(PEAK-1.2,PEAK+.6,t));

    /* strings of lamps from roof to roof */
    const sp=new Path2D(); let anyS=false;
    for(const s of strings){ const a=ss(s.t0-.8,s.t0+.3,t); if(a<=0) continue; anyS=true;
      const sw=Math.sin(t*.55+s.ph)*1.6*k, ay=s.ay-s.pa, by=s.by-s.pa, mx=(s.ax+s.bx)/2, my=Math.max(ay,by)+s.sag+sw;
      sp.moveTo(s.ax,s.ay); sp.lineTo(s.ax,ay); sp.quadraticCurveTo(mx,my,s.bx,by); sp.lineTo(s.bx,s.by);
      s._a=a; s._ay=ay; s._by=by; s._mx=mx; s._my=my; }
    if(anyS){ c.globalCompositeOperation='source-over'; c.strokeStyle='rgba(244,211,108,.5)'; c.lineWidth=.7*k; c.stroke(sp);
      c.globalCompositeOperation='lighter';
      for(const s of strings){ if(!(s._a>0)||t<s.t0-.8) continue;
        for(let j=1;j<s.n;j++){ const q=j/s.n, ord=s.fromLeft?q:1-q, a=ss(s.t0+ord*1.3-.25,s.t0+ord*1.3+.35,t); if(a<=0) continue;
          const u=1-q, x=u*u*s.ax+2*u*q*s._mx+q*q*s.bx, y=u*u*s._ay+2*u*q*s._my+q*q*s._by;
          E.put(SPR.str,x,y+3*k,15*k*(1+.25*bloom),a*breathe); } } }
    c.globalCompositeOperation='source-over';

    /* the floor lamps, catching outward across the car park: lit spans copied from each row's strip, catching lamps as sprites */
    for(const r of G.rows){ let n=0; while(n<r.lamps.length&&r.lamps[n].tl+1.1<=t) n++;
      if(n>0){ const a=r.lamps[n-1].adx+r.lamps[n-1].half, x0=Math.max(0,Math.floor(LX-a)), x1=Math.min(W,Math.ceil(LX+a));
        if(x1>x0){ c.globalAlpha=breathe; c.imageSmoothingEnabled=false; c.drawImage(r.cv,x0*D,0,(x1-x0)*D,r.bh*D,x0,r.by,x1-x0,r.bh); c.imageSmoothingEnabled=true; } }
      for(let j=n;j<r.lamps.length;j++){ const f=r.lamps[j], a=ss(f.tl,f.tl+1.1,t); if(a<=0) break; floorLamp(c,f,a*breathe); } }
    c.globalAlpha=1;

    /* embers, slow, in the warm air of the finished city */
    const eg=ss(12,PEAK+1,t); if(eg>0){ c.globalCompositeOperation='lighter';
      for(const e of embers){ const age=(t+e.ph)%e.life, f=age/e.life, a=Math.sin(Math.PI*f)*eg*.55; if(a<=.01) continue;
        E.put(SPR.ember,e.x+Math.sin(age*.6+e.ph)*e.sw,e.y-age*e.v,e.s*(1-.4*f),a); }
      c.globalCompositeOperation='source-over'; }
  } });

/* growth of a tower (0..1) at time t: an even, slow rise */
function growth(b,t){ const u=cl((t-b.t0)/(b.t1-b.t0)); if(b.crown) return 1-Math.pow(1-u,1.6)*(1-u*.0); return u*u*(3-2*u)*.25+u*.75; }

function floorLamp(c,f,a){ const sz=f.h*4; c.globalAlpha=a*f.a; c.drawImage(f.pr>.55?G.SPR.bowlHot:G.SPR.bowlAmb, f.x-sz/2, f.y-sz*.625, sz, sz); }
function bakeRow(r){ const {W,D}=G, o=mkCanvas(W,r.bh,D); o.x.setTransform(D,0,0,D,0,-r.by*D); for(const f of r.lamps) floorLamp(o.x,f,1); r.cv=o.c; }

/* copy a tower's canvas from height y down to the ground, whole pixels (a straight copy) */
function blit(c,b,src,y){ const D=G.D, y0=Math.max(b.by,Math.floor(y)), hh=b.by+b.bh-y0; if(hh<=0) return;
  c.imageSmoothingEnabled=false; c.drawImage(src,0,(y0-b.by)*D,b.bw*D,hh*D,b.bx,y0,b.bw,hh); }

function bake(b){ const {k,GY,D,SPR}=G, od=mkCanvas(b.bw,b.bh,D), ol=mkCanvas(b.bw,b.bh,D), d=od.x, l=ol.x; b.dk=od.c; b.lt=ol.c;
  d.setTransform(D,0,0,D,-b.bx*D,-b.by*D); l.setTransform(D,0,0,D,-b.bx*D,-b.by*D);
  const body=new Path2D(); b.pts.forEach((q,i)=>i?body.lineTo(q[0],q[1]):body.moveTo(q[0],q[1])); body.closePath();
  const courses=new Path2D(); for(const y of b.courses){ courses.moveTo(b.x+2.5*k,y); courses.lineTo(b.x+b.w-2.5*k,y); }
  const unlit=new Path2D(); for(const L of b.lamps) if(!L.on) drop(unlit,L.x,L.y,L.h,L.tilt);
  const shade=(c,a)=>{ const gr=c.createLinearGradient(0,b.base,0,GY); gr.addColorStop(0,'rgba(18,11,1,0)'); gr.addColorStop(1,'rgba(18,11,1,1)');
    c.globalAlpha=a; c.fillStyle=gr; c.fillRect(b.x,b.base,b.w,GY-b.base); c.globalAlpha=1; };
  // night: the built form, lamps waiting
  d.fillStyle=rgb(b.fill); d.fill(body); shade(d,.2+b.layer*.07);
  d.globalAlpha=.08+b.p*.22; d.strokeStyle='#EFCB62'; d.lineWidth=.55*k; d.stroke(courses);
  d.globalAlpha=.07+b.p*.25; d.strokeStyle='#F8D873'; d.lineWidth=.7*k; d.stroke(body);
  d.globalAlpha=.18+b.p*.25; d.strokeStyle='#D3AC48'; d.lineWidth=.6*k; d.stroke(unlit); d.globalAlpha=1;
  // lit: warmed body, lit face toward the lamp, every lit opening with its flame
  l.fillStyle=rgb(b.lfill); l.fill(body); shade(l,.18+b.layer*.07);
  const fx=b.side>0?b.x+b.w-3.4*k:b.x; l.globalAlpha=.05+b.p*b.p*.75; l.fillStyle='#FFD95E'; l.fillRect(fx,b.ftop,3.4*k,GY-b.ftop);
  l.globalAlpha=.10+b.p*.55; l.strokeStyle='#F8D873'; l.lineWidth=.7*k; l.stroke(body);
  l.globalAlpha=.10+b.p*.34; l.strokeStyle='#EFCB62'; l.lineWidth=.55*k; l.stroke(courses);
  l.globalAlpha=.25+b.p*.3; l.strokeStyle='#D3AC48'; l.lineWidth=.6*k; l.stroke(unlit);
  l.globalCompositeOperation='lighter';
  for(const L of b.lamps) if(L.on){ l.globalAlpha=L.ga; l.drawImage(SPR.g1,L.x-L.gr,L.y-L.h*.45-L.gr,L.gr*2,L.gr*2); }
  l.globalCompositeOperation='source-over';
  for(const L of b.lamps) if(L.on){ l.globalAlpha=1; l.fillStyle=rgb(L.col); l.beginPath(); drop(l,L.x,L.y,L.h,L.tilt); l.fill(); }
  l.globalAlpha=1; }

/* ten petals on a circle, an inscribed downward triangle (card geometry, scaled) */
function drawYantra(c,t,bloom,breathe){ const {LX:X,CY:Y,YR:R,k}=G;
  const a0=ss(14.5,18.5,t); if(a0<=0) return;
  const glowA=.75+.25*bloom;
  c.save(); c.lineJoin='round'; c.lineCap='round';
  const stroke=(p,w,a)=>{ c.globalCompositeOperation='lighter';
    c.strokeStyle=`rgba(255,190,80,${.16*a*glowA})`; c.lineWidth=w*5; c.stroke(p);
    c.strokeStyle=`rgba(255,215,114,${.85*a*glowA})`; c.lineWidth=w; c.stroke(p); c.globalCompositeOperation='source-over'; };
  // outer and inner circle, traced from the top
  const pc=ss(14.5,18.6,t), pi=ss(15.4,19.2,t);
  if(pc>0){ const p=new Path2D(); p.arc(X,Y,R,-Math.PI/2,-Math.PI/2+Math.PI*2*pc); stroke(p,1.4*k,a0); }
  if(pi>0){ const p=new Path2D(); p.arc(X,Y,R*.958,-Math.PI/2,-Math.PI/2-Math.PI*2*pi,true); stroke(p,.7*k,.55*a0); }
  // the triangle, apex down
  const pt=ss(16.6,19.6,t);
  if(pt>0){ const r=R*.941, V=[[X,Y+r],[X+r*Math.cos(-Math.PI/6),Y-r*.5],[X-r*Math.cos(-Math.PI/6),Y-r*.5]];
    const p=new Path2D(); let left=pt*3; p.moveTo(V[0][0],V[0][1]);
    for(let i=0;i<3&&left>0;i++){ const A=V[i],Bv=V[(i+1)%3],u=Math.min(1,left); p.lineTo(lerp(A[0],Bv[0],u),lerp(A[1],Bv[1],u)); left-=1; }
    if(pt>=1){ p.closePath(); c.globalCompositeOperation='lighter'; c.fillStyle=`rgba(255,181,46,${(.10+.12*bloom)*ss(19,20.5,t)})`; c.fill(p); c.globalCompositeOperation='source-over'; }
    stroke(p,1.4*k,a0); }
  // ten petals, unfurling one by one from the top, clockwise
  const P=new Path2D(); let any=false, fillA=0;
  for(let i=0;i<10;i++){ const u=ss(18.2+i*.42,19.6+i*.42,t); if(u<=0) continue; any=true; fillA+=u/10;
    const am=-Math.PI/2+(i+.5)*Math.PI/5, aA=am-Math.PI/10, aB=am+Math.PI/10, sp=Math.PI*15.5/180*u;
    const rt=R*(1+.395*u), rc=R*(1+.297*u);
    P.moveTo(X+R*Math.cos(aA),Y+R*Math.sin(aA));
    P.quadraticCurveTo(X+rc*Math.cos(am-sp),Y+rc*Math.sin(am-sp),X+rt*Math.cos(am),Y+rt*Math.sin(am));
    P.quadraticCurveTo(X+rc*Math.cos(am+sp),Y+rc*Math.sin(am+sp),X+R*Math.cos(aB),Y+R*Math.sin(aB)); }
  if(any){ c.globalCompositeOperation='lighter'; c.fillStyle=`rgba(255,194,60,${(.07+.08*bloom)*fillA*breathe})`; c.fill(P); c.globalCompositeOperation='source-over';
    stroke(P,1.3*k,a0*breathe); }
  c.restore(); }
})();
