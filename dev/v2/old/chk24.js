// Locker: "Add gun and add-ons" puts one line on the list carrying the build; the Builder gets the gun with its add-ons fitted
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const pg=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={};
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await pg.evaluate(()=>localStorage.clear());
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html#guns-mossberg-cmdt');await pg.waitForTimeout(300);
const pick=async(slot,re)=>{const v=await pg.$$eval(`select[data-gbs="L"][data-slot="${slot}"] option`,(o,r)=>{const m=o.find(x=>!x.disabled&&new RegExp(r).test(x.textContent)); return m?m.value:null;},re); if(v) await pg.selectOption(`select[data-gbs="L"][data-slot="${slot}"]`,v); await pg.waitForTimeout(80); return v;};
out.picked=[await pick('top','Ultrasound'),await pick('barrel','Improved Gas Vent IV'),await pick('stock','Shock'),await pick('internal','Smartlink II'),await pick('other','IBS|Biometric')];
await pg.click('#addBuild'); await pg.waitForTimeout(150);
out.rows=await pg.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
out.total=await pg.$eval('#kit .ktot b',e=>e.textContent);
// a clip for it, then send the list
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html#ammo-spare-clip');await pg.waitForTimeout(250);
const v=await pg.$$eval('#tfg option',o=>(o.find(x=>/Mossberg/.test(x.textContent))||{}).value); await pg.selectOption('#tfg',v); await pg.click('#addKit');
await pg.click('[data-send="kit"]'); await pg.waitForTimeout(200);
const p=await pg.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
out.sent=p.items.map(x=>[x.key,!!x.build,x.forItem]);
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
out.imp=await pg.evaluate(p=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(p); const G=X.S.gear; return {n:G.length,name:G[0].name,cost:G[0].cost,build:G[0].build,clip:G[1].forGun===G[0].gid};},p);
out.weap=await pg.$eval('#weapBody',e=>e.innerText.replace(/\s+/g,' ').slice(0,400));
const ok=out.picked.every(Boolean)&&out.rows.length===1&&/9,650/.test(out.rows[0])&&/Ultrasound/.test(out.rows[0])&&out.sent.length===2&&out.sent[0][1]&&out.imp.n===2&&out.imp.cost===9650&&out.imp.clip&&/recoil comp 5/.test(out.weap)&&!errs.length;
console.log(JSON.stringify({ok,...out,errs}));await b.close(); if(!ok) process.exit(1);})();
