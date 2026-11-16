// Builder: ammo and spare clips can be assigned to a specific gun
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html');
const r=await p.evaluate(()=>{const X=window.__sr2,S=X.S; S.gear=[];
  const add=(key,extra)=>{S.gear.push(Object.assign({key,qty:1},extra||{}));};
  add('guns:Mossberg CMDT/SM'); add('guns:Defiance T-250'); add('guns:Ares Viper Slivergun');
  add('ammo:Spare Clip',{qty:3}); add('ammo:Regular Ammo (10 rounds)',{qty:4}); add('ammo:Spare Clip');
  X.render(); return {guns:S.gear.filter(g=>g.gid).length};});
const sels=await p.$$eval('select[data-f="forGun"]',a=>a.map(s=>[...s.options].map(o=>o.textContent)));
// assign clips + ammo to Mossberg, second clip to the T-250 (internal magazine)
const ids=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.gid).map(g=>g.gid));
const rowIdx=await p.evaluate(()=>window.__sr2.S.gear.map((g,i)=>[g.key,i]).filter(([k])=>/Spare Clip|Regular/.test(k)).map(x=>x[1]));
await p.selectOption(`#g_fg_${rowIdx[0]}`,ids[0]); await p.selectOption(`#g_fg_${rowIdx[1]}`,ids[0]);
await p.selectOption(`#g_fg_${rowIdx[2]}`,ids[1]);
const st=await p.evaluate(()=>({names:window.__sr2.S.gear.map(g=>g.name),carried:[...document.querySelectorAll('#weapBody .gstat')].map(x=>x.textContent).filter(t=>/In gun|Carried/.test(t)),
  warnRow:!!document.querySelector('.forgun .bad-text'),issue:document.body.innerText.includes("loads from an internal magazine")}));
// remove the Mossberg: its tags should clear
{const i=await p.evaluate(()=>window.__sr2.S.gear.findIndex(g=>g.key==='guns:Mossberg CMDT/SM')); await p.click(`#gearBody button[data-del="gear"][data-i="${i}"]`);}
const after=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.forGun).length);
await p.reload(); const persisted=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.forGun).map(g=>g.name));
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
const ok=sels.length===3&&sels[0].length===4&&st.names.some(n=>/Spare Clip \(for Mossberg CMDT\/SM\)/.test(n))&&st.carried.some(t=>/spare clips 0, 0, 0 · pool 40 regular/.test(t))&&st.warnRow&&st.issue&&after===1&&persisted.length===1&&sw<=390&&!errs.length;
console.log(JSON.stringify({ok,sels,st,after,persisted,sw,errs}));await b.close(); if(!ok) process.exit(1);})();
