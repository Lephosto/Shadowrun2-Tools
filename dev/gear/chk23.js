// Locker shopping list: ammo and spare clips pick their gun, and the Builder keeps the link on import
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={};
const add=async slug=>{await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html#'+slug);await pg.waitForTimeout(250);await pg.evaluate(()=>{const b=document.querySelector('#addBuild')||document.querySelector('#addKit'); b.click();});};
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await pg.evaluate(()=>localStorage.clear());
await add('guns-mossberg-cmdt-sm'); await add('guns-defiance-t-250'); await add('ammo-spare-clip'); await add('ammo-spare-clip'); await add('ammo-regular-ammo-10-rounds');
await pg.waitForTimeout(200);
out.selects=await pg.$$eval('select[data-kfg]',s=>s.map(x=>[...x.options].map(o=>o.textContent)));
const vals=await pg.$$eval('select[data-kfg]',s=>s.map(x=>[...x.options].map(o=>o.value)));
await pg.selectOption('select[data-kfg="2"]',vals[0][1]);   // clip -> Mossberg
await pg.selectOption('select[data-kfg="3"]',vals[0][2]);   // clip -> T-250 (no clips: warning)
await pg.selectOption('select[data-kfg="4"]',vals[0][1]);   // ammo -> Mossberg
out.warn=await pg.$$eval('.kfg .bad',x=>x.map(e=>e.textContent));
await pg.click('[data-send="kit"]'); await pg.waitForTimeout(200);
const p=await pg.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
out.items=p.items.map(x=>[x.key,x.forItem,x.forKey]);
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
out.imp=await pg.evaluate(p=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(p); const G=X.S.gear; const gid=k=>(G.find(g=>g.key===k)||{}).gid;
  return {names:G.map(g=>g.name), clip1:G[2].forGun===gid('guns:Mossberg CMDT/SM'), clip2:G[3].forGun===gid('guns:Defiance T-250'), ammo:G[4].forGun===gid('guns:Mossberg CMDT/SM')};},p);
const ok=out.selects.length===3&&out.selects[0].length===3&&out.warn.length===1&&out.items[2][1]===0&&out.items[3][1]===1&&out.items[4][1]===0&&out.imp.clip1&&out.imp.clip2&&out.imp.ammo&&!errs.length;
console.log(JSON.stringify({ok,...out,errs}));
const k=await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html'); const el=await pg.$('#kit'); await el.scrollIntoViewIfNeeded(); await el.screenshot({path:'kit_fg.png'});
await b.close(); if(!ok) process.exit(1);})();
