const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');
await pg.check('#optEF');
for(const n of ['Lightning Reflexes','Day Job','Elf Poser','Human-Looking']){await pg.selectOption('#efPick',n);await pg.click('#efAdd');}
console.log(await pg.textContent('#efBudget'));
await pg.selectOption('#ef_v_0','6');await pg.waitForTimeout(400);
console.log(await pg.textContent('#efBudget'));
console.log(await pg.evaluate(()=>[...document.querySelectorAll('#efBody tr')].map(r=>r.innerText.replace(/\s+/g,' ')).join(' | ')));
await pg.selectOption('#fRace','Troll');await pg.waitForTimeout(200);
console.log(await pg.evaluate(()=>(document.body.innerText.match(/(Only (humans|elves)[^\n]*)/g)||[]).join(' || ')));
await pg.check('#optMeta');await pg.selectOption('#fRace','Dryad (Elf variant)');
console.log(await pg.$$eval('#attrBody tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
console.log('errs',errs);await b.close();})();
