// Locker: choose the gun for ammo and spare clips in the purchase panel; the Builder keeps the link on import
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={};
const open=async slug=>{await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html#'+slug);await pg.waitForTimeout(250);};
const add=async()=>pg.evaluate(()=>{const b=document.querySelector('#addBuild')||document.querySelector('#addKit'); b.click();});
const pick=async re=>{const v=await pg.$$eval('#tfg option',(o,r)=>{const m=o.find(x=>new RegExp(r).test(x.textContent)); return m?m.value:'';},re); await pg.selectOption('#tfg',v); await pg.waitForTimeout(80);};
await open(''); await pg.evaluate(()=>localStorage.clear());
await open('guns-mossberg-cmdt-sm'); await add(); await open('guns-defiance-t-250'); await add();
await open('ammo-spare-clip'); out.panelOpts=await pg.$$eval('#tfg option',o=>o.map(x=>x.textContent));
await pick('Mossberg'); await add();
await pick('Defiance'); out.panelWarn=await pg.$eval('.tfg .bad',e=>e.textContent).catch(()=>null); await add();
await open('ammo-regular-ammo-10-rounds'); await pick('Mossberg'); await add();
await pg.waitForTimeout(150);
out.listLabels=await pg.$$eval('#kit .kfg',x=>x.map(e=>e.textContent));
out.listSelects=await pg.$$eval('#kit select',x=>x.length);
await pg.click('[data-send="kit"]'); await pg.waitForTimeout(200);
const p=await pg.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
out.items=p.items.map(x=>[x.key,x.forItem,x.forKey]);
// the choice is remembered for the next time this item is opened
await open('ammo-regular-ammo-10-rounds'); out.remembered=await pg.$eval('#tfg',s=>s.options[s.selectedIndex].textContent);
const el=await pg.$('.tfg'); if(el){await el.scrollIntoViewIfNeeded(); await (await pg.$('section.tag, #tag')).screenshot({path:'tfg_shot.png'}).catch(()=>{});}
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
out.imp=await pg.evaluate(p=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(p); const G=X.S.gear; const gid=k=>(G.find(g=>g.key===k)||{}).gid;
  return {names:G.map(g=>g.name), clip1:G[2].forGun===gid('guns:Mossberg CMDT/SM'), clip2:G[3].forGun===gid('guns:Defiance T-250'), ammo:G[4].forGun===gid('guns:Mossberg CMDT/SM')};},p);
const ok=out.panelOpts.length===3&&/doesn’t take clips/.test(out.panelWarn||'')&&out.listLabels.length===3&&out.listSelects===0&&/doesn’t take clips/.test(out.listLabels[1])&&out.items[2][1]===0&&out.items[3][1]===1&&out.items[4][1]===0&&/Mossberg/.test(out.remembered)&&out.imp.clip1&&out.imp.clip2&&out.imp.ammo&&!errs.length;
console.log(JSON.stringify({ok,...out,errs}));
await b.close(); if(!ok) process.exit(1);})();
