// Locker: gel-pack upgrade on armor; shopping list ×5; sent item carries gel
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const pg=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html#armor-armor-jacket');await pg.waitForTimeout(250);
const out={};
out.has=!!(await pg.$('input[data-gel]'));
await pg.click('input[data-gel]'); out.facts=await pg.$$eval('section[aria-label="Gel-pack upgrade"] dl',d=>d.map(x=>x.innerText.replace(/\s+/g,' ')).join('|'));
await pg.click('#addKit'); out.kit=await pg.$eval('#kit',e=>e.innerText.replace(/\s+/g,' ').slice(0,160));
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html#armor-light-military-armor');await pg.waitForTimeout(200); out.milNo=!(await pg.$('input[data-gel]'));
await pg.reload(); await pg.waitForTimeout(200); out.kitAfterReload=await pg.$eval('#kit',e=>e.innerText.replace(/\s+/g,' ').slice(0,120));
console.log(JSON.stringify(out));console.log(errs.slice(0,3));await b.close();})();
