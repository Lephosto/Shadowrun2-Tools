const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html');await p.click('#btnNew');
const X=()=>p.evaluate(()=>window.__sr2);
// adept
await p.evaluate(()=>{const s=window.__sr2.S;s.prio={race:'E',magic:'A',attr:'B',skills:'C',res:'D'};s.magic='adept';s.powers=[{type:'killing',level:'M'},{type:'distanceStrike'},{type:'mysticArmor',n:2},{type:'attrBoost',attr:'str',n:2},{type:'counterstrike',n:3}];window.__sr2.render();});
console.log('POWERS',await p.$eval('#powerBody',e=>e.innerText.replace(/\s+/g,' ')));
console.log('opts',await p.$$eval('#p_ty_0 option',o=>o.length));
// magician spells
await p.evaluate(()=>{const s=window.__sr2.S;s.magic='hermetic';s.powers=[];window.__sr2.render();});
const cats=await p.$$eval('#spCat option',o=>o.map(x=>x.value));console.log('cats',cats);
for(const c of cats){await p.selectOption('#spCat',c);console.log(c,await p.$$eval('#spName option',o=>o.length));}
await p.selectOption('#spCat','Combat');await p.selectOption('#spName','Stunball');await p.fill('#spForce','6');await p.dispatchEvent('#spForce','input');console.log(await p.$eval('#spPrev',e=>e.textContent));
await p.selectOption('#spName','Redirect');await p.dispatchEvent('#spName','change');console.log(await p.$eval('#spPrev',e=>e.textContent));
await p.selectOption('#spCat','Manipulation');await p.selectOption('#spName','Net');await p.dispatchEvent('#spName','change');console.log(await p.$eval('#spPrev',e=>e.textContent));
await p.uncheck('[data-book="aw"]');await p.selectOption('#spCat','Manipulation');console.log('no AW manip',await p.$$eval('#spName option',o=>o.length));
console.log('errs',errs);await b.close();})();
