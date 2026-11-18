(()=>{ const ids=['welcome','muladhara','svadhisthana','manipura','anahata','vishuddha','ajna','sahasrara','aatma','maya','finale']; let n=0;
  ids.forEach(id=>{ const s=document.createElement('script'); s.src='scenes/'+id+'.js'; s.onload=s.onerror=()=>{ if(++n===ids.length){ document.fonts.ready.then(()=>FILM.start()); } }; document.body.appendChild(s); }); })();
