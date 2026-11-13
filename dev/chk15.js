const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
const r=await pg.evaluate(()=>{const X=window.__sr2,S=X.S,bad=[];const R=a=>a[Math.floor(Math.random()*a.length)];
 const junk=[-5,0,0.5,1,2,3,4,6,8,12,13,20,99,9999,'x',null];
 const decks=Object.keys(X.DSTAT); const progs=Object.keys(X.GEARDB).filter(k=>/^prog2?:/.test(k)&&!/Persona/.test(k)&&X.GEARDB[k].sz);
 const opts=['deck:Response Increase 1','deck:Response Increase 2','deck:Response Increase 3','deck:Hitcher Jack','deck:Extra Active Memory (per Mp)','deck:Extra Storage Memory (per Mp)'];
 for(let t=0;t<1500;t++){
  const cust=Math.random()<.4; S.gear=[]; S.books=Object.assign({},S.books,{vr2:cust});
  if(cust){S.gear.push({key:'deck:Custom cyberdeck (VR2 à la carte)',qty:1}); S.vr2deck={}; ['mpcp','bod','eva','mask','sens','hard','am','sm','io','ri','casing','hitch','off'].forEach(k=>S.vr2deck[k]=R(junk)); S.vr2deck.asist=R(['hot','cool','none','x']); S.vr2deck.dni=R([true,false]); S.vr2deck.filter=R([true,false]);}
  else { S.gear.push({key:R(decks),qty:1}); for(let k=0;k<4;k++) S.gear.push({key:R(opts),qty:R(junk),r:R(junk)}); ['Bod','Evasion','Masking','Sensors'].forEach(n=>S.gear.push({key:'prog:Persona: '+n,qty:1,r:R(junk)})); }
  for(let k=0;k<1+Math.floor(Math.random()*7);k++) S.gear.push({key:R(progs),qty:1,r:R([1,2,3,4,6,8,10,12]),loaded:R([true,false])});
  try{ X.syncGear(); const dk=X.deckInfo(); const m=dk.mpcp; const e=[];
   if(cust){const d=S.vr2deck; const P=[d.bod,d.eva,d.mask,d.sens]; if(P.some(x=>x>m||x<0)||P.reduce((a,b)=>a+b,0)>3*m) e.push('persona'); if(d.ri>Math.min(3,Math.floor(m/4))) e.push('ri'); if(d.io%10||d.io>d.sens*m*10) e.push('io'); if(d.hitch>m) e.push('hitch'); if(d.dni&&d.asist!=='hot') e.push('dni'); if(dk.utils.some(u=>u.g.r>m)) e.push('util>M'); if(dk.stored>dk.sm) e.push('storage');}
   else { const ri=[1,2,3].filter(L=>S.gear.some(g=>g.key==='deck:Response Increase '+L)); if(ri.some(L=>L>Math.floor(m/4))&&Math.floor(m/4)>0) e.push('ri'); 
    const hj=S.gear.filter(g=>g.key==='deck:Hitcher Jack').reduce((a,g)=>a+g.qty,0); if(hj>m) e.push('hitch '+hj);
    if(dk.am>dk.amMax) e.push('am '+dk.am); const per=S.gear.filter(g=>/Persona/.test(g.key)).reduce((a,g)=>a+g.r,0); if(per>3*m) e.push('persona '+per);
    S.gear.filter(g=>/^deck:(Response|Hitcher)/.test(g.key)).forEach(g=>{if(g.r!==m) e.push('priced');});
    if(dk.stored>dk.sm&&dk.utils.some(u=>u.g.r>1)) e.push('storage');}
   if(dk.used>dk.am) e.push('active');
   const ld=dk.utils.filter(u=>u.g.loaded).map(u=>u.g.key); if(new Set(ld).size!==ld.length) e.push('dupe loaded');
   if(e.length) bad.push([cust?'vr2':S.gear[0].key,e]);
   if(t%100===0){X.render(); if(/NaN/.test(document.getElementById('deckCard').innerText)) bad.push(['NaN']);}
  }catch(err){bad.push(['err',err.message]);}}
 // picker: MPCP 3 deck hides Response Increase
 S.gear=[{key:'deck:Allegiance Alpha',qty:1}]; S.books=Object.assign({},S.books,{vr2:false}); X.render(); const p1=['deck:Response Increase 1','deck:Hitcher Jack'].map(k=>X.deckPickOk(k));
 return {nbad:bad.length,bad:bad.slice(0,10),p1};});
console.log(JSON.stringify(r)); console.log(errs.slice(0,5)); await b.close();})();
