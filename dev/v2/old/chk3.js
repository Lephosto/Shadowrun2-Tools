const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const errs=[];
const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1400,height:1000}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
console.log(await p.$eval('#books',e=>e.innerText.replace(/\n/g,' ')));
for(const id of ['bio:Orthoskin','body:Wired Reflexes','bio:Synaptic Accelerator','guns:Ares Cascade Rifle','veh:Ares Sentinel Drone','body:Cyberarm or Cyberleg']){
 await p.evaluate(id=>{location.hash='#'+id.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')},id);await p.waitForTimeout(80);
 console.log('--',id,'::',await p.$eval('#tag',e=>e.innerText.replace(/\s+/g,' ').slice(0,420)),' ## ',await p.$$eval('#tag .lgrp h4',e=>e.map(x=>x.textContent).join(' | ')));}
await p.click('[data-cat="bio"]');await p.selectOption('#sort','sub');console.log('groups',await p.$$eval('#list .grp',e=>e.map(x=>x.textContent).join(', ')));
await p.selectOption('#sort','bi');console.log(await p.$$eval('#list .item .stat',e=>e.slice(0,5).map(x=>x.textContent).join(', ')));
await p.screenshot({path:'gear/s4.png'});
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);console.log('w',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errs',errs);await b.close();})();
