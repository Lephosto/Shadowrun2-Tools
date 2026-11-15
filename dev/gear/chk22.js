// Gun slots in the shared row style: Locker and Builder
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={};
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html#guns-ak-97');await pg.waitForTimeout(300);
out.slots=await pg.$$eval('.gsl .vck-h b',x=>x.map(e=>e.textContent));
const pick=async(slot,re)=>{const v=await pg.$$eval(`select[data-gbs="L"][data-slot="${slot}"] option`,(o,r)=>{const m=o.find(x=>!x.disabled&&new RegExp(r).test(x.textContent)); return m?m.value:null;},re); if(v) await pg.selectOption(`select[data-gbs="L"][data-slot="${slot}"]`,v); return v;};
out.top=await pick('top','Laser'); out.barrel=await pick('barrel','Gas Vent');
out.disabled=await pg.$$eval('select[data-gbs="L"] option[disabled]',o=>o.slice(0,3).map(x=>x.textContent));
out.chosen=await pg.$$eval('.gsl .vck.on .vck-n',x=>x.map(e=>e.textContent));
out.facts=await pg.$eval('.build dl.facts',e=>e.innerText.replace(/\s+/g,' '));
out.focus=await pg.evaluate(()=>document.activeElement&&document.activeElement.dataset.slot);
const el=await pg.$('section.build'); await el.screenshot({path:'shots/gun_new.png'});
// Builder
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
await pg.evaluate(()=>{const X=window.__sr2,S=X.S; S.gear=[{key:'guns:FN HAR',qty:1,build:{top:'ammo:Laser Sight'}}]; X.render(); const d=document.querySelector('details[data-wbd="0"]'); if(d) d.open=true;});
await pg.waitForTimeout(150);
out.bslots=await pg.$$eval('details[data-wbd="0"] .gsl .vck-h b',x=>x.map(e=>e.textContent));
const bv=await pg.$$eval('select[data-gbs="0"][data-slot="under"] option',o=>{const m=o.find(x=>!x.disabled&&x.value); return m?m.value:null;});
if(bv) await pg.selectOption('select[data-gbs="0"][data-slot="under"]',bv);
out.bbuild=await pg.evaluate(()=>JSON.stringify(window.__sr2.S.gear[0].build));
out.bname=await pg.evaluate(()=>window.__sr2.S.gear[0].name+' '+window.__sr2.S.gear[0].cost);
out.nan=/NaN|undefined/.test(await pg.$eval('details[data-wbd="0"]',e=>e.innerHTML));
console.log(JSON.stringify(out));console.log(errs.slice(0,4));await b.close();})();
