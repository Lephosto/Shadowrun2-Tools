// Locker: the legality filter (Shadowtech p. 103–104) hides restricted and permit items when asked, and tags show the category
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const L='file://'+process.cwd()+'/gear/sr2-gear-locker.html';await p.goto(L);await p.evaluate(()=>localStorage.clear());await p.goto(L);await p.waitForTimeout(300);
await p.click('#cats [data-cat="guns"]');await p.waitForTimeout(150);
const names=async()=>p.$$eval('#list .item .nm',e=>e.map(x=>x.innerText));
const all=await names();
await p.selectOption('#legalSel','permit');await p.waitForTimeout(150); const per=await names();
await p.selectOption('#legalSel','legal');await p.waitForTimeout(150); const leg=await names();
await p.reload(); await p.waitForTimeout(300); const kept=await p.$eval('#legalSel',e=>e.value);
await p.selectOption('#legalSel','all'); await p.goto(L+'#guns-ingram-smartgun');await p.waitForTimeout(300);
const note=await p.$eval('.lglnote',e=>e.innerText).catch(()=>'');
const has=(l,t)=>l.some(x=>x.startsWith(t));
const ok=!errs.length&&has(all,'Ingram Smartgun')&&has(all,'Ares Predator')&&!has(per,'Ingram Smartgun')&&has(per,'Ares Predator')&&has(per,'Remington 950')&&leg.length===0&&kept==='legal'&&/^Restricted G/.test(note)&&/automatic weapon/.test(note);
console.log(JSON.stringify({ok,all:all.length,per:per.length,leg:leg.length,kept,note:note.slice(0,80),errs}));await b.close(); if(!ok) process.exit(1);})();
