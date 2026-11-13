const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await p.waitForFunction(()=>typeof ITEMS!=='undefined');
const r=await p.evaluate(()=>{const bad=[];let n=0,added=0;const R=a=>a[Math.floor(Math.random()*a.length)];
 const V=ITEMS.filter(isVeh); const junk=[-3,0,1,2,3,4,5,6,9,12,40,99,'x',null];
 for(let t=0;t<2500;t++){const i=R(V); st.vbuild={}; const B=vstate(i);
  B.type=R([...VB.TYPES.map(x=>x[0]),'bogus']); B.mil=Math.random()<.4; B.facRC=Math.random()<.3; B.facRig=Math.random()<.3;
  for(let k=0;k<1+Math.floor(Math.random()*12);k++){const d=R(VB.M); const os=VB.optsOf(d,vehOf(i,B))||[]; B.mods.push({id:Math.random()<.03?'nope':d.id,lv:R(junk),opt:Math.random()<.2?'zz':(os.length?R(os)[0]:undefined)});}
  try{ if(!VB.TYPES.some(x=>x[0]===B.type)) B.type='car';
   const {v}=vbFix(i); const C=VB.calc(v,B); n++; if(!C.ok) bad.push([i.n,C.bad]);
   // everything the UI would offer must stay legal
   const A=VB.addable(v,B); A.yes.slice(0,6).forEach(x=>{const t2={...B,mods:B.mods.concat([{id:x.d.id,lv:x.lv,opt:x.opt}])}; if(!VB.calc(v,t2).ok) bad.push(['addable broke',i.n,x.d.id]); added++;});
   B.mods.forEach((m,ix)=>{VB.levels(v,B,ix).forEach(l=>{const t2={...B,mods:B.mods.map((q,j)=>j===ix?{...q,lv:l}:q)}; if(!VB.calc(v,t2).ok) bad.push(['level broke',i.n,m.id,l]);});});
   if(C.cf>C.Cmax||C.load>C.Lmax||C.pts>v.B) bad.push(['cap',i.n]);
   if(t%250===0){st.sel=i.id; renderTag(); const h=document.getElementById('tag').innerHTML; if(/NaN|undefined/.test(h)) bad.push(['nan',i.n]);}
  }catch(e){bad.push(['err',i.n,e.message]);}}
 // UI walk: on one drone, keep clicking Add on everything that fits until nothing fits
 st.vbuild={}; st.sel='r2veh:Steel Lynx Ground Combat Drone'; renderTag(); let clicks=0;
 for(let k=0;k<60;k++){const btn=document.querySelector('[data-vbadd]'); if(!btn) break; btn.click(); clicks++;}
 const i=BYID[st.sel]; const {B,v}=vbFix(i); const C=VB.calc(v,B);
 return {n,added,nbad:bad.length,bad:bad.slice(0,10),clicks,uiOk:C.ok,cf:C.cf+'/'+C.Cmax,load:C.load+'/'+C.Lmax,pts:C.pts+'/'+v.B};});
console.log(JSON.stringify(r));console.log(errs.slice(0,5));await b.close();})();
