const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await p.waitForFunction(()=>typeof ITEMS!=='undefined');
const r=await p.evaluate(()=>{const bad=[];let n=0;
 const R=(a)=>a[Math.floor(Math.random()*a.length)];
 const junk=[-50,-1,0,0.5,1,2.7,3,4,6,8,12,13,14,20,99,1e6,'x',NaN,null,undefined,'',true];
 const legal=(i,C)=>{const B=C.B,M=C.M,v=B.v,e=[];
  const tot=Object.values(C.per).reduce((a,b)=>a+(+b||0),0); if(tot>3*M) e.push('persona total');
  Object.values(C.per).forEach(x=>{if(x<0||x!==Math.floor(x)||(i.vr2deck&&x>M)) e.push('persona chip '+x);});
  if(i.vr2deck){ if(v.ri>Math.min(3,Math.floor(M/4))) e.push('ri'); if(C.lv>5) e.push('lv>5'); if(v.dni&&v.asist!=='hot') e.push('dni');
    if(v.io%10||v.io>v.sens*M*10||v.io<0) e.push('io '+v.io); if(v.hitch>M) e.push('hitch'); if(v.am<0||v.sm<0||v.off<0) e.push('neg mem');
    if(![0,1,2,3].includes(v.casing)) e.push('casing'); if(v.hard<0||v.hard>DECK.HARD_MAX) e.push('hard'); if(M<1||M>DECK.MPCP_MAX) e.push('mpcp');}
  else { if(B.ri>Math.floor(M/4)) e.push('ri'); if(C.am>M*50&&B.am>0) e.push('am'); if(B.hitch>M) e.push('hitch'); if(B.sm<0||B.off<0||B.am<0) e.push('neg'); }
  if(C.U.some(x=>x.u.r>C.cap||x.u.r<1)) e.push('util rating'); if(new Set(C.U.map(x=>x.u.id)).size!==C.U.length) e.push('dupe util');
  if(C.stored>C.sm) e.push('storage '+C.stored+'>'+C.sm); if(C.used>C.am) e.push('active '+C.used+'>'+C.am);
  if(!isFinite(C.cost)||C.cost<0) e.push('cost '+C.cost); return e;};
 const decks=ITEMS.filter(isDeck);
 for(let t=0;t<4000;t++){const i=R(decks); st.dbuild={}; const B=dstate(i); const progs=progList(!!i.vr2deck);
  if(i.vr2deck){['mpcp','bod','eva','mask','sens','hard','am','sm','io','ri','casing','hitch','off'].forEach(k=>{B.v[k]=R(junk);}); B.v.asist=R(['hot','cool','none','warm']); B.v.dni=R([true,false]); B.v.filter=R([true,false]);}
  else {['ri','am','sm','hitch','off'].forEach(k=>B[k]=R(junk)); ['Bod','Evasion','Masking','Sensors'].forEach(k=>B.per[k]=R(junk));}
  for(let k=0;k<1+Math.floor(Math.random()*8);k++){const pp=R(progs); B.utils.push({id:pp.id,r:R(junk),loaded:R([true,false])});}
  try{ deckCalc(i); const C=deckCalc(i); n++; const e=legal(i,C); if(e.length) bad.push([i.n,e]);
   if(t%200===0){st.sel=i.id; renderTag(); const h=document.getElementById('tag').innerHTML; if(/NaN|undefined/.test(h)) bad.push(['nan in page',i.n]);}
  }catch(err){bad.push(['err',i.n,err.message]);}}
 // Through the UI: lower storage under the programs; raise a loaded program's rating past active memory
 st.dbuild={}; const vi=decks.find(x=>x.vr2deck); st.sel=vi.id; renderTag(); const B=dstate(vi);
 const pg=progList(true).find(x=>x.size&&x.size[6]>40); B.utils.push({id:pg.id,r:1,loaded:true}); B.v.am=pg.size[1]+5; renderTag();
 const opts=[...document.querySelector('[data-dku="0"][data-uf="r"]').options].map(o=>+o.value);
 const ok1=opts.every(r=>pg.size[r]<=B.v.am);
 const el=document.getElementById('dk_v.sm'); el.value=0; el.dispatchEvent(new Event('change',{bubbles:true}));
 const C=deckCalc(vi); const ok2=C.sm>=C.stored;
 return {n,bad:bad.slice(0,15),nbad:bad.length,ok1,opts,ok2,sm:C.sm,stored:C.stored};});
console.log(JSON.stringify(r));console.log(errs.slice(0,5));await b.close();})();
