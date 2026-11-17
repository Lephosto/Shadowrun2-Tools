// Established runner: Karma can't be overspent, re-learning a spell costs the new Force, typed-in Force raises are caught,
// duplicate adept powers are flagged, and a Gear Locker send pays only for what arrives (stacking onto owned lines)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const F='file://'+process.cwd()+'/sr2-builder.html'; const out={};
await p.goto(F); await p.evaluate(()=>localStorage.clear()); await p.goto(F); await p.waitForTimeout(200);
const chk=()=>p.$eval('#checklist,#issues,.checklist',e=>e.innerText).catch(()=>p.evaluate(()=>document.body.innerText));
// magician
await p.evaluate(()=>{const S=window.__sr2.S; S.magic='hermetic'; S.powers=[{name:'Mana Bolt',cost:5,note:''}]; S.kEarned=7;});
await p.click('#established'); await p.waitForTimeout(150);
out.opts=await p.$$eval('#advPick option',o=>o.filter(x=>/Mana Bolt/.test(x.text)).map(x=>[x.text,x.disabled]));
const pick=async t=>{const v=await p.$$eval('#advPick option',(o,t)=>{const m=o.find(x=>x.text.startsWith(t)); return m?m.value:null;},t); await p.evaluate(v=>{const s=document.getElementById('advPick'); s.value=v;},v); await p.click('#advBuy'); await p.waitForTimeout(150);};
await pick('Mana Bolt (spell) Force 5 → 8'); out.refused=await p.$eval('#advNote',e=>!e.hidden&&e.innerText); out.avail1=await p.$eval('#advAvail',e=>e.innerText);
await pick('Mana Bolt (spell) Force 5 → 6'); out.avail2=await p.$eval('#advAvail',e=>e.innerText); out.force=await p.evaluate(()=>window.__sr2.S.powers[0].cost);
await p.fill('#p_c_0','7'); await p.dispatchEvent('#p_c_0','input'); await p.waitForTimeout(450);
out.typed=/Karma was paid for Force 6/.test(await p.evaluate(()=>document.body.innerText));
out.fpBarGone=await p.$eval('#powerBudget',e=>e.innerText.trim()==='');
// adept with the same power twice
await p.evaluate(()=>{const S=window.__sr2.S; S.magic='adept'; S.powers=[{type:'killing',level:'S'},{type:'killing',level:'D'}];}); await p.click('#established'); await p.click('#established'); await p.waitForTimeout(200);
out.dup=/Killing Hands is on the powers list twice/.test(await p.evaluate(()=>document.body.innerText));
// gear send: 4 trauma patches onto 2 owned, paying 4 × 500
await p.evaluate(()=>{const S=window.__sr2.S; S.magic='none'; S.powers=[]; S.gear=[{key:'med:Trauma Patch',qty:2}]; S.nuyenNow=10000;
  localStorage.setItem('sr2-transfer',JSON.stringify({v:1,at:Date.now(),from:'Gear Locker',label:'test',total:2000,items:[1,2,3,4].map(()=>({key:'med:Trauma Patch',qty:1}))}));});
await p.click('#established'); await p.click('#established'); await p.evaluate(()=>window.dispatchEvent(new Event('focus'))); await p.waitForTimeout(200);
await p.click('#xferAdd'); await p.waitForTimeout(200);
out.gear=await p.evaluate(()=>window.__sr2.S.gear.map(g=>[g.key,g.qty])); out.ny=await p.evaluate(()=>+window.__sr2.S.nuyenNow);
const ok=!errs.length&&out.opts.some(([t,d])=>/5 → 8 · 8 Karma \(not enough/.test(t)&&d)&&out.opts.some(([t,d])=>/5 → 6 · 6 Karma$/.test(t)&&!d)
  &&/only 7/.test(out.refused||'')&&/^7 /.test(out.avail1)&&/^1 /.test(out.avail2)&&out.force===6&&out.typed&&out.fpBarGone&&out.dup
  &&out.gear.length===1&&out.gear[0][1]===6&&out.ny===8000;
console.log(JSON.stringify({ok,...out,errs}).slice(0,1500));await b.close(); if(!ok) process.exit(1);})();
