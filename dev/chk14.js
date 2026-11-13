const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
// load a state with old acc ticks
await pg.evaluate(()=>{const X=window.__sr2; const S=X.S; S.gear=[{key:'guns:Ares Predator',qty:1,acc:{smart:true,laser:true,vent:2,mag:0}},{key:'guns:FN HAR',qty:1,acc:{mag:2,smart:true}},{key:'body:Smartlink',qty:1},{key:'ammo:Laser Sight',qty:1}]; X.render();});
await pg.waitForTimeout(200);
const g=await pg.evaluate(()=>window.__sr2.S.gear.map(x=>({k:x.key,b:x.build,cost:x.cost,add:x.addons,name:x.name})));
console.log(JSON.stringify(g));
console.log(await pg.$$eval('#weapBody tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,300)).join('\n')));
console.log(await pg.evaluate(()=>(document.body.innerText.match(/[^\n]*(add-ons|accessory ticks)[^\n]*/g)||[]).slice(0,4).join('\n')));
// change a slot via UI
await pg.click('#weapBody details >> nth=0 >> summary');await pg.selectOption('#wb_0_barrel','ammo:Silencer');await pg.waitForTimeout(200);
console.log(await pg.evaluate(()=>JSON.stringify(window.__sr2.S.gear[0].build)+' open='+document.querySelector('#weapBody details').open+' cost '+window.__sr2.S.gear[0].cost));
await pg.locator('#weapTbl').screenshot({path:'rev/w1.png'});
const sheet=await pg.evaluate(()=>window.__sr2.sheetFile?'':'' );
const m=await b.newPage({viewport:{width:390,height:900}});m.on('pageerror',e=>errs.push(e.message));await m.goto('file://'+process.cwd()+'/sr2-builder.html');await m.waitForTimeout(300);
console.log('mobile sw',await m.evaluate(()=>document.documentElement.scrollWidth));
console.log('errs',errs);await b.close();})();
