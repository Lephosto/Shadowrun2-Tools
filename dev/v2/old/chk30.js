// chk30: every Rigger 2 vehicle x every build-out modification and level, plus random full builds, must stay consistent
// Every Rigger 2 vehicle × every modification, then random full builds: the build-out engine must stay consistent
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(400);
const out=await p.evaluate(()=>{const R=[]; let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
  const bad=(v,r,tag)=>{const s=r.s; const nums=[r.cost,r.cf,r.load,r.pts,s.H,s.Ac,s.A,s.Si,...s.Sp]; if(nums.some(x=>typeof x!=='number'||!isFinite(x))) return tag+': non-number '+JSON.stringify(nums);
    if(r.ok&&(r.cf>r.Cmax+1e-9||r.load>r.Lmax+1e-9||r.pts>r.ptsMax)) return tag+`: over capacity but ok (cf ${r.cf}/${r.Cmax} load ${r.load}/${r.Lmax} pts ${r.pts}/${r.ptsMax})`;
    if(VB.statLine(v,s).some(([k,a,b2])=>String(b2).includes('NaN')||String(b2)==='undefined')) return tag+': stat NaN';
    const rowSum=r.rows.reduce((a,x)=>a+(+x.cost||0),0); if(Math.abs(rowSum-r.cost)>0.5) return tag+`: cost ${r.cost} ≠ rows ${rowSum}`; return null;};
  const vs=ITEMS.filter(i=>i.cat==='r2veh'); let checks=0;
  for(const i of vs){ const types=vtype(i); for(const mil of [false,true]){
    const B0={type:types[0],mil,facRC:false,facRig:false,mods:[]}; const v=vehOf(i,B0);
    let r0; try{r0=VB.calc(v,B0);}catch(e){R.push(i.n+': calc threw '+e.message); continue;}
    const e0=bad(v,r0,i.n+' base'); if(e0) R.push(e0); if(!r0.ok) R.push(i.n+(mil?' (mil)':'')+': empty build not ok: '+r0.bad.join('; '));
    const A=VB.addable(v,B0);
    for(const y of A.yes){const B={...B0,mods:[{id:y.d.id,lv:y.lv,opt:y.opt}]}; let r; try{r=VB.calc(v,B);}catch(e){R.push(`${i.n} + ${y.d.id}: threw ${e.message}`);continue;} checks++;
      if(!r.ok) R.push(`${i.n} + ${y.d.id}: listed as fitting but not ok: ${r.bad.join('; ')}`); const e=bad(v,r,`${i.n} + ${y.d.id}`); if(e) R.push(e);
      const lv=VB.levels(v,B,0); for(const l of lv){const t={...B,mods:[{...B.mods[0],lv:l}]}; const rr=VB.calc(v,t); checks++; if(!rr.ok) R.push(`${i.n} + ${y.d.id} L${l}: offered level not ok`); const e2=bad(v,rr,`${i.n} + ${y.d.id} L${l}`); if(e2) R.push(e2);} }
    for(const n of A.no){ if(!n.why||/undefined|NaN/.test(n.why)) R.push(`${i.n}: ${n.d.id} blocked with no clear reason: "${n.why}"`); }
    // random full builds
    for(let k=0;k<3;k++){const B={...B0,mods:[]}; for(let step=0;step<40;step++){const AA=VB.addable(v,B); if(!AA.yes.length) break; const y=AA.yes[Math.floor(rnd()*AA.yes.length)]; B.mods.push({id:y.d.id,lv:y.lv,opt:y.opt}); const lv=VB.levels(v,B,B.mods.length-1); if(lv.length) B.mods[B.mods.length-1].lv=lv[Math.floor(rnd()*lv.length)];}
      const r=VB.calc(v,B); checks++; if(!r.ok) R.push(`${i.n}${mil?' (mil)':''} random build ${k} not ok: ${r.bad.join('; ')} [${B.mods.map(m=>m.id+':'+m.lv).join(',')}]`); const e=bad(v,r,`${i.n} random ${k}`); if(e) R.push(e);
      const cl=VB.clamp(v,B); if(cl.dropped.length) R.push(`${i.n} random ${k}: clamp dropped ${cl.dropped.join(', ')} from a legal build`);}
  }}
  return {vehicles:vs.length,checks,problems:R};});
const ok=!out.problems.length&&!errs.length; console.log(JSON.stringify({ok,...out,problems:out.problems.length,sample:[...new Set(out.problems)].slice(0,60),errs}));await b.close(); if(!ok) process.exit(1);})();
