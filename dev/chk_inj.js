// Lasting injuries and dying: Magic lost to wounds lowers Magic and adept power points; a lost attribute point lowers the attribute and its
// racial maximum; Physical overflow boxes go up to Body, then the runner is dead; guns without ammo are flagged
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const F='file://'+process.cwd()+'/sr2-builder.html'; const out={};
await p.goto(F); await p.evaluate(()=>localStorage.clear()); await p.goto(F); await p.waitForTimeout(200);
await p.evaluate(()=>{const S=window.__sr2.S; S.magic='adept'; S.attrs.body=5; S.powers=[{type:'combatSense',level:1}]; S.gear=[{key:'guns:Ares Predator II',qty:1}];});
await p.click('#established'); await p.waitForTimeout(150);
const txt=()=>p.evaluate(()=>document.body.innerText);
out.m0=/Magic\s+6/.test(await p.$eval('#sec-sum',e=>e.innerText));
await p.click('#injBox summary'); await p.fill('#inj_magic','1'); await p.press('#inj_magic','Tab'); await p.waitForTimeout(450);
await p.fill('#inj_body','1'); await p.press('#inj_body','Tab'); await p.waitForTimeout(450);
const sum=await p.$eval('#sec-sum',e=>e.innerText); out.m1=/Magic\s+5/.test(sum); out.pp=await p.$eval('#powerBudget',e=>e.innerText.replace(/\s+/g,' '));
out.bodyMax=await p.$eval('#sec-attr',e=>e.innerText).then(t=>t); out.raise=await p.$$eval('#advPick option',o=>o.map(x=>x.text).filter(t=>/^Body/.test(t))[0]);
out.ovf=await p.$$eval('#trkPhys .ovf button',b=>b.length);   // Body 4 now: 4 overflow boxes + the death box
await p.click('#trkPhys button[data-v="13"]'); await p.waitForTimeout(150); out.dying=await p.$eval('#woundNote',e=>e.innerText);
await p.click('#trkPhys button[data-v="15"]'); await p.waitForTimeout(150); out.dead=await p.$eval('#woundNote',e=>e.innerText); out.status=/Status\s+Dead/.test(await p.$eval('#sec-sum',e=>e.innerText));
out.ammo=/No ammunition for Ares Predator II/.test(await txt());
const ok=!errs.length&&out.m0&&out.m1&&/ 5$| 5 /.test(' '+out.pp.split('/').pop())&&/Body 4 → 5/.test(out.raise||'')&&out.ovf===5&&/^Dying: 3 of 4/.test(out.dying)&&/^Dead/.test(out.dead)&&out.status&&out.ammo;
console.log(JSON.stringify({ok,...out,bodyMax:undefined,errs}).slice(0,900)); await b.close(); if(!ok) process.exit(1);})();
