// Locker: an item with a build-out (security armor with the helmet unticked, options) keeps it on the shopping list and in the send
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const pg=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={};
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await pg.evaluate(()=>localStorage.clear());
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html#armor-medium-security-armor');await pg.waitForTimeout(300);
const hel=await pg.$('input[data-hbfield="helmet"]'); out.hasHelmetBox=!!hel; if(hel&&await hel.isChecked()) await hel.click(); await pg.waitForTimeout(100);
await pg.click('#addHost'); await pg.waitForTimeout(150);
out.rows=await pg.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
await pg.click('[data-send="kit"]'); await pg.waitForTimeout(200);
const p=await pg.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
out.sent=p.items;
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
out.imp=await pg.evaluate(p=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(p); const g=X.S.gear[0]; return {name:g.name,cost:g.cost,key:g.key};},p);
const ok=out.hasHelmetBox&&out.rows.length===1&&/9,000/.test(out.rows[0])&&/no helmet/.test(out.rows[0])&&out.sent[0].hb&&out.sent[0].hb.helmet===false&&out.imp.cost===9000&&out.imp.key==='armor:Medium Security Armor'&&!errs.length;
console.log(JSON.stringify({ok,...out,errs}));await b.close(); if(!ok) process.exit(1);})();
