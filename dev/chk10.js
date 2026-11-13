const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/sr2-builder.html');await p.click('#btnNew');
console.log('books',await p.$eval('#bookRow',e=>e.innerText.replace(/\n/g,' | ')));
const add=async(c,k,r)=>{await p.selectOption('#gCat',c);await p.selectOption('#gItem',c+':'+k);if(r)await p.fill('#gRate',String(r));await p.click('#gAdd');};
await add('bio','Muscle Augmentation',2);await add('bio','Cerebral Booster',2);await add('bio','Orthoskin',3);
await add('body','Wired Reflexes',2);await add('head','Encephalon',2);await add('guns','Ares ELD-AR');await add('veh','Ares Guardian Drone (CSH)');
// grade wired to beta, cultured orthoskin
const rows=await p.$$eval('#gearBody select[data-f="grade"]',e=>e.map(x=>x.id));console.log('grade selects',rows);
const wid=await p.evaluate(()=>window.__sr2.S.gear.findIndex(g=>g.key==='body:Wired Reflexes'));
await p.selectOption('#g_gr_'+wid,'beta');
const oid=await p.evaluate(()=>window.__sr2.S.gear.findIndex(g=>g.key==='bio:Orthoskin'));await p.check('#g_cu_'+oid);
console.log(JSON.stringify(await p.evaluate(()=>window.__sr2.S.gear.map(g=>[g.name,g.cost,g.ess,g.bi]))));
console.log('ISS',await p.$eval('#issues',e=>e.innerText));
console.log('SUM',await p.$eval('#sumStats',e=>e.innerText.replace(/\n/g,' | ')).catch(()=>'-'));
await p.evaluate(()=>{const X=window.__sr2;X.S.attrs.body=2;X.render();});console.log('ISS2',await p.$eval('#issues',e=>e.innerText));
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);console.log('w',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errs',errs);await b.close();})();
