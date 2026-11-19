const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const out=[];let n=0;
 ITEMS.filter(canBuild).forEach(g=>{const slots=gunSlots(g);
  for(const link of ['none','smartlink','smartlink2','goggles2']) for(const s of slots){const {out:o}=accFor(g,s);for(const {k} of o){st.build={};const B=bstate(g);B.link=link;B[s]=k;
   try{const C=buildCalc(g);n++;const h=buildHTML(g);if(/NaN|undefined/.test(h)) out.push(['NaN',g.n,s,k]); if(typeof C.cost!=='number'||C.cost!==C.cost) out.push(['cost',g.n,k]);}catch(e){out.push(['ERR',g.n,s,k,e.message]);}}}
 });
 // sample summaries
 const sum=id=>{st.build={};const g=BYID[id];const C=buildCalc(g);return [g.n,C.conc,C.rc,C.rows.map(r=>r[0]+':+'+r[5]).join(' '),C.dmg,C.cost].join(' | ');};
 return {n,bad:out.slice(0,20),badN:out.length,s:['guns:Barret Model 121','guns:Medium Machine Gun','guns:Ingram Valiant','guns:Franchi SPAS-22','guns:Uzi III','guns:Colt Cobra TZ-110'].map(sum),
  fit:['guns:FN HAR','guns:Uzi III','guns:Ares Predator','guns:Streetline Special','guns:Ruger Super Warhawk','guns:Remington 750'].map(id=>{const g=BYID[id];return g.n+': '+gunSlots(g).join(',')+' | no: '+[...new Set(gunSlots(g).flatMap(s=>accFor(g,s).no.map(x=>accName(x.k))))].join(', ');})};});
console.log(JSON.stringify(r,null,1));console.log('errs',errs);await b.close();})();
