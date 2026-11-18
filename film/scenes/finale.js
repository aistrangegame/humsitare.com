/* Finale — Shubh Deepavali. The lamp comes home from Maya and settles low over a row of diyas that runs the whole width
   of the wall; the diyas catch outward from it, a marigold toran hangs along the top, a rangoli border glows on the floor.
   Then the sky celebrates: rockets rise from behind the lamps and bloom (peony, chrysanthemum with trails, ring, willow) in
   gold, saffron, rose, white and the eight panel colours, building to the fullest moment of the film, trails falling as glitter.
   "शुभ दीपावली" and "Happy Diwali" arrive at the top. At 14 s the sky softens, the lamp drifts left and the photos panel
   rises: the code, large and still, on the right third, its words to its left; small fireworks keep playing far to the left.
   Fireworks are analytic (every spark's position is a closed-form function of its age), so seeking needs no state.
   Static layers (sky + floor, unlit and lit; the toran, dim and lit) are baked in init; only sparks, flames and words are live. */
(() => {
  // the scene's fonts (loaded before the film starts: document.fonts.ready waits for these)
  try{ [['500 100px "Noto Sans Devanagari"','शुभ दीपावली'],['italic 400 60px Lora','Happy Diwali'],['400 30px "DM Sans"','Scan'],['400 22px Cinzel','Hum']]
    .forEach(([f,s])=>document.fonts.load(f,s)); }catch(e){}
  const NOTEXT = /[?&]notext=1/.test(location.search);   // for contrast checks only
  const sm=u=>u*u*(3-2*u), cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), ssf=(a,b,x)=>sm(cl((x-a)/(b-a)));
  const PANEL_T0=13.4, PANEL_T1=16.4, XF=3.2, DUR=26;

  function lampAt(t,W,H){
    const p=ssf(PANEL_T0,PANEL_T1,t);
    let x=W*(.5-.19*p), y=H*(.858+.004*p-.03*(1-ssf(0,4,t))), s=1.2-.15*p;
    // the engine carries the lamp to the centre over the last XF seconds (lerp from this value to the centre); shape that
    // path so the flame goes out to the left of the photos words and rises there, reaching the centre as the words fade
    if(t>DUR-XF){ const u=sm(cl((t-(DUR-XF))/XF)), Cx=W*.5, Cy=H*.5;
      const Dx = u<.75 ? x+(W*.2-x)*ssf(0,.35,u) : W*.2+(Cx-W*.2)*ssf(.75,1,u);
      const Dy = y+(Cy-y)*ssf(.2,.72,u);
      if(u<.93){ x=(Dx-u*Cx)/(1-u); y=(Dy-u*Cy)/(1-u); } else { x=Dx; y=Dy; } }
    return {x,y,s};
  }

  FILM.scene({ id:'finale', dur:DUR,
    lamp(t){ return lampAt(t,innerWidth,innerHeight); },
    init(E){
      const W=E.W,H=E.H,D=E.DPR,S=H/1080,TAU=Math.PI*2,me=this, rnd=E.rand(26112026);
      const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.ceil(w*D); c.height=Math.ceil(h*D); const x=c.getContext('2d'); x.setTransform(D,0,0,D,0,0); x.lineJoin='round'; x.lineCap='round'; return [c,x]; };
      const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t), rgb=(c,a=1)=>'rgba('+c.map(Math.round).join(',')+','+a+')';
      const PCOL=[[184,58,58],[212,116,56],[212,168,72],[107,142,78],[76,122,184],[91,78,142],[154,122,200],[212,169,72]];
      const ROWY=H*.885;                       // the diyas' rim line
      // ---------- diyas ----------
      const NDI=Math.max(9,Math.round(W/(96*S))|1), dsp=W/NDI, diyas=[];
      for(let i=0;i<NDI;i++){ const x=dsp*(i+.5), d=Math.abs(x-W/2)/(W/2); diyas.push({x, y:ROWY, ign:.7+3.3*Math.pow(d,.85), ph:rnd()*TAU, f:.8+rnd()*.5, i}); }
      const dw=Math.min(68*S,dsp*.72);
      function cup(x,cx,cy,lit){ // a clay diya seen from the front: a shallow bowl with a pinched spout to the right
        const w=dw, h=w*.36;
        x.beginPath(); x.moveTo(cx-w*.5,cy); x.bezierCurveTo(cx-w*.48,cy+h*1.05,cx+w*.3,cy+h*1.1,cx+w*.42,cy+h*.2);
        x.quadraticCurveTo(cx+w*.5,cy-h*.12,cx+w*.62,cy-h*.28); x.quadraticCurveTo(cx+w*.36,cy-h*.06,cx+w*.1,cy-h*.08);
        x.quadraticCurveTo(cx-w*.3,cy-h*.1,cx-w*.5,cy); x.closePath();
        const g=x.createLinearGradient(cx,cy-h*.3,cx,cy+h);
        g.addColorStop(0,rgb(mix([150,66,34],[226,128,70],lit))); g.addColorStop(.45,rgb(mix([92,36,20],[150,62,30],lit))); g.addColorStop(1,'rgb(38,14,12)');
        x.fillStyle=g; x.fill();
        x.beginPath(); x.ellipse(cx-w*.06,cy-h*.07,w*.4,h*.16,0,0,TAU); x.fillStyle=rgb(mix([60,30,14],[150,96,34],lit)); x.fill();   // the oil
        x.beginPath(); x.moveTo(cx-w*.5,cy); x.quadraticCurveTo(cx-w*.1,cy-h*.2,cx+w*.62,cy-h*.28); x.strokeStyle=rgb(mix([120,56,30],[255,170,100],lit),.8); x.lineWidth=1.3*S; x.stroke();
        // painted dots on the bowl
        x.fillStyle=rgb(mix([120,90,50],[250,214,140],lit),.75); for(let k=-2;k<=2;k++){ x.beginPath(); x.arc(cx+k*w*.14-w*.04,cy+h*.45-Math.abs(k)*h*.06,1.5*S,0,TAU); x.fill(); } }
      // ---------- rangoli rosettes on the floor (8-fold, exact), flattened into the floor plane ----------
      function rosette(x,cx,cy,R,ci,lit){
        const col=mix(PCOL[ci],[255,236,200],.15), col2=mix(PCOL[(ci+3)%8],[255,240,214],.25), k=.34, dim=.45+.55*lit;
        x.save(); x.translate(cx,cy); x.scale(1,k);
        x.globalAlpha=dim; x.fillStyle=rgb(mix(col,[20,12,24],.25));
        for(let j=0;j<8;j++){ const a=j*TAU/8; x.save(); x.rotate(a); x.beginPath(); x.moveTo(0,-R*.22); x.bezierCurveTo(R*.26,-R*.42,R*.2,-R*.82,0,-R*.98); x.bezierCurveTo(-R*.2,-R*.82,-R*.26,-R*.42,0,-R*.22); x.fill(); x.restore(); }
        x.fillStyle=rgb(col2);
        for(let j=0;j<8;j++){ const a=(j+.5)*TAU/8; x.save(); x.rotate(a); x.beginPath(); x.moveTo(0,-R*.18); x.bezierCurveTo(R*.14,-R*.3,R*.1,-R*.56,0,-R*.62); x.bezierCurveTo(-R*.1,-R*.56,-R*.14,-R*.3,0,-R*.18); x.fill(); x.restore(); }
        x.fillStyle='rgb(255,243,214)'; for(let j=0;j<16;j++){ const a=j*TAU/16; x.beginPath(); x.arc(Math.sin(a)*R*1.12,-Math.cos(a)*R*1.12,R*.05,0,TAU); x.fill(); }
        x.fillStyle=rgb(mix(col,[255,240,210],.5)); x.beginPath(); x.arc(0,0,R*.16,0,TAU); x.fill();
        x.fillStyle='rgb(255,246,226)'; x.beginPath(); x.arc(0,0,R*.06,0,TAU); x.fill();
        x.restore(); x.globalAlpha=1; }
      // ---------- the ground: sky, horizon haze, floor ----------
      function ground(x,lit){
        const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0B0818'); g.addColorStop(.55,'#14102A'); g.addColorStop(.8,'#1E1430'); g.addColorStop(.86,'#2B1730'); g.addColorStop(.861,'#1A0D18'); g.addColorStop(1,'#0B0610');
        x.fillStyle=g; x.fillRect(0,0,W,H);
        // the wine wash along the horizon, warmer near the lamp
        const w=x.createRadialGradient(W/2,H*.86,0,W/2,H*.86,W*.62); w.addColorStop(0,'rgba(61,27,46,'+(.55+.35*lit)+')'); w.addColorStop(1,'rgba(61,27,46,0)');
        x.save(); x.translate(0,H*.86); x.scale(1,.45); x.translate(0,-H*.86); x.fillStyle=w; x.fillRect(0,0,W,H*2); x.restore();
        // the floor ledge line
        x.fillStyle=rgb([90,46,40],.5+.3*lit); x.fillRect(0,H*.86,W,1.5*S);
        if(lit){ x.globalCompositeOperation='lighter';
          for(const d of diyas){ const r=dsp*.9; const p=x.createRadialGradient(d.x,ROWY+4*S,0,d.x,ROWY+4*S,r);
            p.addColorStop(0,'rgba(255,170,90,.32)'); p.addColorStop(.4,'rgba(200,90,50,.12)'); p.addColorStop(1,'rgba(200,90,50,0)');
            x.save(); x.translate(d.x,ROWY); x.scale(1,.42); x.translate(-d.x,-ROWY); x.fillStyle=p; x.fillRect(d.x-r,ROWY-r,r*2,r*2); x.restore();
            const q=x.createRadialGradient(d.x,ROWY-20*S,0,d.x,ROWY-20*S,dsp*.75); q.addColorStop(0,'rgba(255,190,120,.10)'); q.addColorStop(1,'rgba(255,160,90,0)'); x.fillStyle=q; x.fillRect(d.x-dsp,ROWY-20*S-dsp,dsp*2,dsp*2); }
          x.globalCompositeOperation='source-over'; }
        for(let i=0;i<diyas.length;i++){ const d=diyas[i]; rosette(x,d.x+dsp*.5,H*.955,Math.min(dsp*.42,46*S),i%8,lit); }
        for(const d of diyas) cup(x,d.x,d.y,lit);
        // the floor falls into the night at the foot
        const f=x.createLinearGradient(0,H*.9,0,H); f.addColorStop(0,'rgba(11,6,16,0)'); f.addColorStop(1,'rgba(11,6,16,.55)'); x.fillStyle=f; x.fillRect(0,H*.9,W,H*.1);
      }
      const [g0,x0]=mk(W,H); ground(x0,0); const [g1,x1]=mk(W,H); ground(x1,1);
      // ---------- the toran: mango leaves on a cord, marigold swags and strands ----------
      const TH=H*.2;
      const mgSp=[[240,128,24],[248,184,40],[226,96,18]].map(c=>{ const s=48,[cv,x]=mk(s/D,s/D); x.setTransform(D*1,0,0,D*1,0,0); const r=s/D/2;
        const g=x.createRadialGradient(r*.85,r*.8,0,r,r,r); g.addColorStop(0,rgb(mix(c,[255,240,180],.45))); g.addColorStop(.6,rgb(c)); g.addColorStop(1,rgb(mix(c,[90,30,8],.6)));
        x.fillStyle=g; x.beginPath(); x.arc(r,r,r*.96,0,TAU); x.fill();
        x.strokeStyle=rgb(mix(c,[120,40,6],.55),.7); x.lineWidth=.8; for(let j=0;j<14;j++){ const a=j*TAU/14; x.beginPath(); x.arc(r+Math.cos(a)*r*.62,r+Math.sin(a)*r*.62,r*.34,a-1.1,a+1.1); x.stroke(); }
        for(let j=0;j<7;j++){ const a=j*TAU/7+.3; x.beginPath(); x.arc(r+Math.cos(a)*r*.3,r+Math.sin(a)*r*.3,r*.2,a-1.2,a+1.2); x.stroke(); }
        x.fillStyle=rgb(mix(c,[110,50,6],.5)); x.beginPath(); x.arc(r,r,r*.13,0,TAU); x.fill(); return cv; });
      function leaf(x,cx,cy,len,ang,shade){ const w=len*.28; x.save(); x.translate(cx,cy); x.rotate(ang);
        x.beginPath(); x.moveTo(0,0); x.bezierCurveTo(w,len*.18,w*.9,len*.62,0,len); x.bezierCurveTo(-w*.9,len*.62,-w,len*.18,0,0);
        const g=x.createLinearGradient(-w,0,w,0); g.addColorStop(0,rgb(mix([38,92,40],[20,50,24],shade))); g.addColorStop(1,rgb(mix([74,132,52],[34,70,30],shade))); x.fillStyle=g; x.fill();
        x.strokeStyle='rgba(170,200,120,.55)'; x.lineWidth=.9*S; x.beginPath(); x.moveTo(0,len*.04); x.quadraticCurveTo(w*.08,len*.5,0,len*.94); x.stroke(); x.restore(); }
      function toran(x){
        const cordY=7*S; x.strokeStyle='rgb(150,96,40)'; x.lineWidth=2.2*S; x.beginPath(); x.moveTo(0,cordY); x.lineTo(W,cordY); x.stroke();
        const nL=Math.round(W/(40*S)); for(let i=0;i<nL;i++){ const cx=(i+.5)*W/nL, l=(52+10*Math.sin(i*1.7))*S; leaf(x,cx,cordY,l,(i%2?.08:-.08),.15*(i%3)); }
        const NS=6, hang=[]; for(let i=0;i<=NS;i++) hang.push(i*W/NS);
        const md=22*S, k=0;
        for(let i=0;i<NS;i++){ const a=hang[i], b=hang[i+1], sag=H*.085, n=Math.round((b-a)/(md*.82));
          for(let j=0;j<=n;j++){ const u=j/n, X=a+(b-a)*u, Y=cordY+6*S+sag*4*u*(1-u); const sp=mgSp[(j+i)%3]; x.drawImage(sp,X-md/2,Y-md/2,md,md); }
          // a second, shorter swag inside
          const n2=Math.round((b-a)*.6/(md*.7)); for(let j=0;j<=n2;j++){ const u=j/n2, X=a+(b-a)*(.2+.6*u), Y=cordY+6*S+sag*.55*4*u*(1-u)+sag*.32; x.drawImage(mgSp[(j+i+1)%3],X-md*.4,Y-md*.4,md*.8,md*.8); } }
        for(let i=0;i<=NS;i++){ const X=hang[i]; const len=Math.round(TH*.7/(md*.8));
          for(let j=0;j<len;j++){ x.drawImage(mgSp[(j+i)%3],X-md*.45,cordY+8*S+j*md*.78-md*.45,md*.9,md*.9); }
          const ty=cordY+8*S+len*md*.78; leaf(x,X,ty-md*.2,30*S,-.25,0); leaf(x,X,ty-md*.2,30*S,.25,.2); }
      }
      const [tor,xt]=mk(W,TH+20*S); toran(xt);
      // the toran in the night: dimmed version (lit faintly from below) and the full-colour version for the flashes
      const [torD,xd]=mk(W,TH+20*S); xd.setTransform(1,0,0,1,0,0); xd.drawImage(tor,0,0); xd.globalCompositeOperation='source-atop'; xd.fillStyle='rgba(16,10,30,.42)'; xd.fillRect(0,0,tor.width,tor.height);
      // ---------- small sprites ----------
      const flameSp=(()=>{ const w=20,h=40,[c,x]=mk(w,h); const g=x.createRadialGradient(w/2,h*.72,0,w/2,h*.62,h*.5); g.addColorStop(0,'rgba(255,252,236,1)'); g.addColorStop(.35,'rgba(255,214,120,1)'); g.addColorStop(.75,'rgba(244,128,40,.85)'); g.addColorStop(1,'rgba(200,70,20,0)');
        x.fillStyle=g; x.beginPath(); x.moveTo(w/2,1); x.bezierCurveTo(w*.62,h*.32,w*.98,h*.55,w*.9,h*.78); x.bezierCurveTo(w*.82,h*.98,w*.18,h*.98,w*.1,h*.78); x.bezierCurveTo(w*.02,h*.55,w*.38,h*.32,w/2,1); x.fill(); return c; })();
      const SPK=[[255,206,104],[255,146,40],[255,118,160],[255,246,232]].concat(PCOL.map(c=>mix(c,[255,240,220],.28)));
      // brighten the dark panel colours so they burn
      SPK[8]=mix(SPK[8],[140,190,255],.4); SPK[9]=mix(SPK[9],[180,160,255],.45); SPK[10]=mix(SPK[10],[220,190,255],.3); SPK[7]=mix(SPK[7],[170,230,120],.35); SPK[4]=mix(SPK[4],[255,120,110],.3);
      const head=SPK.map(c=>E.sprite([[0,rgb(mix(c,[255,252,240],.6),1)],[.2,rgb(mix(c,[255,250,235],.15),.9)],[.5,rgb(c,.32)],[1,rgb(c,0)]],32));
      const trailCol=SPK.map(c=>rgb(mix(c,[255,240,220],.15),1));
      const glowSp=SPK.map(c=>E.sprite([[0,rgb(c,.5)],[.4,rgb(c,.16)],[1,rgb(c,0)]],64));
      // ---------- the shells (deterministic schedule) ----------
      const titleZ={x0:W*.32,x1:W*.68,y0:H*.15,y1:H*.36};
      const QS=H*.40, QX=W*.80, QY=H*.50;
      const panelZ={x0:W*.33,x1:Math.min(W,QX+QS/2+40*S),y0:H*.26,y1:H*.74};
      const hitBox=(b,z)=>!(b.x1<z.x0||b.x0>z.x1||b.y1<z.y0||b.y0>z.y1);
      const TYPES={peony:{k:2.3,g:95,L:2.5,n:66},chrys:{k:2.0,g:115,L:2.9,n:72,trail:.38},ring:{k:2.5,g:80,L:2.2,n:52},willow:{k:1.35,g:150,L:4.3,n:56,trail:.95}};
      const shells=[];
      let N_REJ=0, sh2=0; function addShell(tl,type,R,region,col,col2){ let R0; sh2=0;
        const T=TYPES[type]; let x,y,b,tries=0; R0=R;
        const tb=tl+1.15+rnd()*.3, life=T.L*(R>150*S?1:.85);
        do{ x=region.x0+(region.x1-region.x0)*rnd(); y=region.y0+(region.y1-region.y0)*rnd();
          const e=1/T.k, sag=T.g*S/T.k*(life-e*.9); b={x0:x-R*1.05,x1:x+R*1.05,y0:y-R*1.05,y1:y+R*1.05+sag};
          tries++; if(tries%12===0) R*=.88; } while(tries<72 && ((tb+life>6.3 && hitBox(b,titleZ)) || (tb+life>PANEL_T0 && hitBox(b,panelZ)) || b.y1>H*.86 || b.x0<-20 || b.x1>W+20));
        if(tries>=72){ if(region!==SKY_ALL&&!sh2){ sh2=1; return addShell(tl,type,R0*.8,SKY_ALL,col,col2); } N_REJ++; return; }
        const n=Math.round(T.n*(R>150*S?1:.62)), ps=[];
        if(type==='ring'){ const tilt=.35+rnd()*.5, rot=rnd()*TAU; for(let i=0;i<n;i++){ const a=i*TAU/n, cx=Math.cos(a), cy=Math.sin(a)*tilt; ps.push([cx*Math.cos(rot)-cy*Math.sin(rot), cx*Math.sin(rot)+cy*Math.cos(rot), i]); } }
        else { const ga=Math.PI*(3-Math.sqrt(5)); for(let i=0;i<n;i++){ const z=1-2*(i+.5)/n, r=Math.sqrt(1-z*z), a=i*ga; const j=.93+rnd()*.12; ps.push([Math.cos(a)*r*j, Math.sin(a)*r*j, i, (i%5===0)?1:0]); } }
        const lx=x+(rnd()-.5)*60*S;
        shells.push({tl,tb,x,y,lx,R,type,T,life,col,col2:col2==null?col:col2,ps,ph:rnd()*TAU});
      }
      const pick=a=>a[Math.floor(rnd()*a.length)];
      const SKY_L={x0:W*.04,x1:W*.33,y0:H*.12,y1:H*.6}, SKY_R={x0:W*.67,x1:W*.96,y0:H*.12,y1:H*.6}, SKY_C={x0:W*.3,x1:W*.7,y0:H*.48,y1:H*.62}, SKY_ALL={x0:W*.04,x1:W*.96,y0:H*.1,y1:H*.6};
      const GOLD=0,SAFF=1,ROSE=2,WHITE=3, PANEL=()=>4+Math.floor(rnd()*8);
      // 4–6 s: the first, gold
      addShell(2.3,'peony',240*S,{x0:W*.46,x1:W*.54,y0:H*.3,y1:H*.36},GOLD,WHITE);
      addShell(4.1,'chrys',220*S,SKY_L,SAFF);
      addShell(4.8,'chrys',220*S,SKY_R,ROSE,GOLD);
      // 6–10 s: building, every colour
      let tl=5.5; const kinds=['peony','chrys','ring','willow','peony','chrys'];
      while(tl<8.6){ const side=pick([SKY_L,SKY_R,SKY_L,SKY_R,SKY_C]); const ty=pick(kinds);
        addShell(tl,ty,(side===SKY_C?150:200+rnd()*70)*S,side,ty==='willow'?GOLD:(rnd()<.6?PANEL():pick([GOLD,SAFF,ROSE,WHITE])),rnd()<.4?WHITE:null); tl+=.32+rnd()*.25; }
      let alt=0;
      // 9–13 s: the fullest — pairs, willows raining glitter, the panel colours together
      while(tl<12.4){ const ty=pick(['chrys','willow','peony','ring','chrys']);
        addShell(tl,ty,(220+rnd()*80)*S,(alt++%2)?SKY_L:SKY_R,ty==='willow'?GOLD:PANEL(),rnd()<.5?GOLD:null);
        addShell(tl+.12,pick(['peony','ring','chrys','peony']),(150+rnd()*60)*S,rnd()<.4?SKY_C:SKY_ALL,PANEL(),rnd()<.3?WHITE:null);
        if(rnd()<.5) addShell(tl+.2,pick(['peony','chrys']),(170+rnd()*60)*S,SKY_ALL,pick([GOLD,SAFF,ROSE,WHITE]),PANEL());
        tl+=.2+rnd()*.14; }
      addShell(12.3,'willow',280*S,SKY_L,GOLD); addShell(12.6,'chrys',260*S,{x0:W*.12,x1:W*.22,y0:H*.22,y1:H*.4},WHITE,GOLD);
      // 14–24 s: gentle, small, far to the left of the code
      const LEFT={x0:W*.06,x1:W*.25,y0:H*.18,y1:H*.5};
      tl=14.2; let k2=0; while(tl<22.4){ addShell(tl,pick(['peony','ring','peony','chrys']),(140+rnd()*40)*S,LEFT,[GOLD,4+k2%8,ROSE,4+(k2+3)%8,SAFF,WHITE][k2%6],rnd()<.4?GOLD:null); k2++; tl+=1.25+rnd()*.5; }
      shells.sort((a,b)=>a.tb-b.tb);
      me.$={W,H,S,D,ROWY,diyas,dsp,dw,g0,g1,tor,torD,TH,flameSp,head,trailCol,glowSp,shells,titleZ,panelZ,QS,QX,QY,SPK};
    },
    draw(E,t,dt){
      if(E.seeking) return;                   // everything is analytic in t: nothing to advance
      const c=E.ctx, $=this.$, {W,H,S}=$, TAU=Math.PI*2, ss=E.ss;
      const lamp=lampAt(t,W,H);
      // ---------- ground: the floor lights outward from the lamp as the diyas catch ----------
      const front=W/2*Math.pow(cl((t-.7)/3.3),1/.85)+$.dsp*.6;
      if(front>=W/2+$.dsp){ c.drawImage($.g1,0,0,W,H); }
      else { c.drawImage($.g0,0,0,W,H); c.save(); c.beginPath(); c.rect(W/2-front,0,front*2,H); c.clip();
        c.drawImage($.g1,0,0,W,H); c.restore(); }
      // ---------- the fireworks ----------
      const panelOn=ss(PANEL_T0-.2,PANEL_T0+1.2,t), titleOn=ss(5.2,6,t);
      const zone=(x,y,z,w)=>{ if(w<=0) return 1; const dx=Math.max(z.x0-x,0,x-z.x1), dy=Math.max(z.y0-y,0,y-z.y1); const d=Math.hypot(dx,dy); return 1-w*(1-ss(0,70*S,d)); };
      const mask=(x,y)=>zone(x,y,$.titleZ,titleOn)*zone(x,y,$.panelZ,panelOn);
      c.globalCompositeOperation='lighter';
      let flash=0, flashCol=0;
      // sky glow of each burst (drawn first, soft and large)
      for(const sh of $.shells){ const tau=t-sh.tb; if(tau<0||tau>1.4) continue; const a=Math.exp(-tau*2.6)*ss(0,.05,tau)*(sh.R/(250*S));
        flash+=a; if(a>.2) flashCol=sh.col; E.put($.glowSp[sh.col],sh.x,sh.y,sh.R*2.3,Math.min(.55,a*.6)); }
      const soft=1-.35*ss(PANEL_T0-.5,PANEL_T0+1.5,t);   // the sky softens when the photos panel rises
      for(const sh of $.shells){
        const T=sh.T, R=sh.R, k=T.k, g=T.g*S, v=R*k;
        // the rocket rising from behind the diyas
        const rt=t-sh.tl, rise=sh.tb-sh.tl;
        if(rt>0&&rt<rise+.05){ const y0=H*.9;
          const P=u=>{ const e=1-(1-u)*(1-u); return [sh.lx+(sh.x-sh.lx)*e, y0+(sh.y-y0)*e]; };
          for(let j=6;j>=0;j--){ const u=cl((rt-j*.045)/rise); if(u<=0) continue; const p=P(u), fl=.6+.4*Math.sin(t*40+j*1.7+sh.ph);
            E.put(j?$.head[0]:$.head[3],p[0]+(j?Math.sin(j*2.3+t*9)*2*S:0),p[1]+j*2*S,(j?7:12)*S,(j?.5*(1-j/7)*fl:.95)*mask(p[0],p[1])*soft); } }
        const tau=t-sh.tb; if(tau<0||tau>sh.life) continue;
        const L=sh.life, fade=ss(0,.14,tau)*(1-ss(L*.5,L,tau))*soft;
        const pos=(dx,dy,tt)=>{ const e=(1-Math.exp(-k*tt))/k; return [sh.x+dx*v*e, sh.y+dy*v*e+g/k*(tt-e)]; };
        const wl=sh.type==='willow';
        // trails
        if(T.trail){ const tl=Math.min(T.trail,tau); if(tl>.02){ c.strokeStyle=$.trailCol[sh.col]; c.lineWidth=(wl?1.8:2)*S; c.globalAlpha=fade*(wl?.55:.6);
          c.beginPath(); for(const p of sh.ps){ const a=pos(p[0],p[1],tau-tl), b=pos(p[0],p[1],tau-tl*.5), q=pos(p[0],p[1],tau); c.moveTo(a[0],a[1]); c.quadraticCurveTo(b[0],b[1],q[0],q[1]); } c.stroke(); c.globalAlpha=1; }
          // glitter left along the trails, twinkling as it falls
          if(tau>.3){ c.fillStyle=wl?'rgb(255,214,140)':$.trailCol[sh.col]; c.globalAlpha=fade*.85; c.beginPath(); const n=wl?3:2, fr=Math.floor(t*14);
            for(const p of sh.ps){ for(let j=1;j<=n;j++){ const h=Math.sin((p[2]*12.9898+j*78.233+fr*.37)*43758.5)%1; if(Math.abs(h)<.55) continue;
              const q=pos(p[0],p[1],Math.max(0,tau-j*T.trail/n*1.3)); const s=(1.2+Math.abs(h)*1.6)*S; q[1]+=j*j*1.2*S; c.rect(q[0]-s/2,q[1]-s/2,s,s); } }
            c.fill(); c.globalAlpha=1; } }
        else if(tau<1.2){ // a short streak for peonies and rings while the stars are fast
          const tl=Math.min(.12,tau); c.strokeStyle=$.trailCol[sh.col]; c.lineWidth=1.6*S; c.globalAlpha=fade*.45*(1-ss(.3,1.2,tau)); c.beginPath();
          for(const p of sh.ps){ const a=pos(p[0],p[1],tau-tl), q=pos(p[0],p[1],tau); c.moveTo(a[0],a[1]); c.lineTo(q[0],q[1]); } c.stroke(); c.globalAlpha=1; }
        // the stars
        const hs=(wl?13:sh.type==='ring'?17:16)*S*(R>150*S?1:.85), late=ss(L*.45,L*.8,tau);
        for(const p of sh.ps){ const q=pos(p[0],p[1],tau);
          const tw=1-late*(.5+.5*Math.sin(t*19+p[2]*2.7+sh.ph));
          const ci=(p[2]%3===0)?sh.col2:sh.col;
          const a=fade*tw*mask(q[0],q[1]); if(a<.02) continue;
          E.put($.head[ci],q[0],q[1],hs*(.62+.6*ss(0,.3,tau))*(1-.35*ss(.3,L,tau)),a);
          if(tau<.25) E.put($.head[3],q[0],q[1],hs*.7,.6*a*(1-tau/.25)); }
      }
      c.globalCompositeOperation='source-over'; c.globalAlpha=1;
      flash=Math.min(1,flash);
      // ---------- the toran along the top (dim in the night; the bursts light it) ----------
      {
      const torA=ss(0,2.4,t), tw=W, th=$.tor.height/$.D;
      c.globalAlpha=torA; c.drawImage($.torD,0,0,tw,th); c.globalAlpha=1;
      const tl=(.12+.45*flash)*torA*(1-.4*panelOn); if(tl>.01){ c.globalCompositeOperation='lighter'; c.globalAlpha=tl*.6; c.drawImage($.tor,0,0,tw,th); c.globalCompositeOperation='source-over'; c.globalAlpha=1; }
      }
      // flash on the floor
      if(flash>.02){ c.globalCompositeOperation='lighter'; c.fillStyle=rgbS($.SPK[flashCol],.05*flash); c.fillRect(0,H*.86,W,H*.14); c.globalCompositeOperation='source-over'; }
      // ---------- the diyas' flames ----------
      c.globalCompositeOperation='lighter';
      for(const d of $.diyas){ const age=t-d.ign; if(age<=0) continue; const cat=ss(0,.5,age), pop=Math.exp(-age*2.2)*.8;
        const fl=1+.08*Math.sin(t*7.3*d.f+d.ph)+.05*Math.sin(t*12.1+d.ph*3), x=d.x+$.dw*.58, y=d.y-$.dw*.11;
        E.put(E.SP.glow,x,y-12*S,(120+60*pop)*S,.26*cat+.3*pop);
        E.put(E.SP.hot,x,y-13*S,(46+24*pop)*S*fl,.6*cat+.4*pop); }
      c.globalCompositeOperation='source-over';
      for(const d of $.diyas){ const age=t-d.ign; if(age<=0) continue; const cat=ss(0,.5,age);
        const fl=1+.1*Math.sin(t*7.3*d.f+d.ph)+.06*Math.sin(t*12.1+d.ph*3), x=d.x+$.dw*.58, y=d.y-$.dw*.11, w=12*S*cat, h=31*S*cat*fl;
        c.save(); c.translate(x,y); c.rotate(.06*Math.sin(t*1.3+d.ph)); c.globalAlpha=cat; c.drawImage($.flameSp,-w/2,-h,w,h); c.restore(); }
      c.globalAlpha=1;
      // ---------- the one lamp's light on the floor ----------
      c.globalCompositeOperation='lighter';
      { c.save(); c.translate(lamp.x,$.ROWY+6*S); c.scale(1,.28); const lr=360*S*lamp.s; c.globalAlpha=.4; c.drawImage(E.SP.glow,-lr,-lr,lr*2,lr*2); c.restore(); }
      c.globalCompositeOperation='source-over'; c.globalAlpha=1;
      if(NOTEXT) { drawQR(); return; }
      // ---------- the words ----------
      const ta=ss(5.8,7.4,t), tb=ss(6.6,8.4,t);
      if(ta>0){ pool(W/2,H*.255,W*.24,H*.13,.62*ta);
        c.textAlign='center'; c.textBaseline='alphabetic';
        c.font='500 '+Math.round(124*S)+'px "Noto Sans Devanagari"'; c.fillStyle='#FBF3E4'; c.globalAlpha=ta; c.fillText('शुभ दीपावली',W/2,H*.255+(1-ta)*14*S);
        c.font='italic 400 '+Math.round(58*S)+'px Lora'; c.fillStyle='#E8CF92'; c.globalAlpha=tb; c.fillText('Happy Diwali',W/2,H*.333+(1-tb)*10*S);
        c.globalAlpha=1; }
      drawQR();
      function drawQR(){
        const pa=ss(PANEL_T0+.6,15,t), dy=(1-pa)*50*S;
        if(pa<=0) return;
        if(!NOTEXT){
          pool(W*.5,H*.55,W*.21,H*.17,.8*pa);
          const rx=$.QX-$.QS/2-64*S;
          c.textAlign='right'; c.textBaseline='alphabetic'; c.globalAlpha=pa;
          c.font='italic 400 '+Math.round(76*S)+'px Lora'; c.fillStyle='#FBF3E4';
          c.fillText('Share your photos',rx,H*.445+dy); c.fillText('tonight',rx,H*.52+dy);
          c.font='400 '+Math.round(32*S)+'px "DM Sans"'; c.fillStyle='#E8CF92';
          try{ c.fontVariantCaps='all-small-caps'; c.letterSpacing=Math.round(5*S)+'px'; }catch(e){}
          c.fillText('Scan to open the family album',rx,H*.59+dy);
          c.fillStyle='rgba(201,168,76,.9)'; c.fillRect(rx-120*S,H*.61+dy,120*S,1.5*S);
          try{ c.fontVariantCaps='normal'; c.letterSpacing=Math.round(3*S)+'px'; }catch(e){}
          c.font='400 '+Math.round(22*S)+'px Cinzel'; c.fillStyle='#E8CF92';
          c.fillText('Hum Sitare · Diwali 2026 · Sitaron Ki Mehfil',rx,H*.65+dy);
          try{ c.letterSpacing='0px'; }catch(e){}
          c.globalAlpha=1; }
        // the tile: a warm halo behind it, a gold line around it, then the code itself, drawn last and never covered
        const q=$.QS, x=$.QX, y=$.QY+dy;
        c.globalCompositeOperation='lighter'; E.put(E.SP.glow,x,y,q*2.1,.16*pa); c.globalCompositeOperation='source-over';
        c.globalAlpha=pa; c.strokeStyle='#C9A84C'; c.lineWidth=2*S; c.beginPath(); const m=12*S; c.roundRect?c.roundRect(x-q/2-m,y-q/2-m,q+2*m,q+2*m,q*.07):c.rect(x-q/2-m,y-q/2-m,q+2*m,q+2*m); c.stroke(); c.globalAlpha=1;
        E.qr(x,y,q,pa);
      }
      function pool(x,y,rx,ry,a){ c.save(); c.translate(x,y); c.scale(1,ry/rx); const g=c.createRadialGradient(0,0,0,0,0,rx*1.5);
        g.addColorStop(0,'rgba(11,8,24,'+a+')'); g.addColorStop(.6,'rgba(11,8,24,'+a*.75+')'); g.addColorStop(1,'rgba(11,8,24,0)'); c.fillStyle=g; c.fillRect(-rx*1.5,-rx*1.5,rx*3,rx*3); c.restore(); }
    } });
  function rgbS(c,a){ return 'rgba('+c.map(Math.round).join(',')+','+a+')'; }
})();
