// Locker: a vehicle with mods and a core deck with options go on the shopping list as single keyed lines and send their build-outs
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const pg=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1280,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const out={}; const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';
await pg.goto(L);await pg.evaluate(()=>localStorage.clear()); await pg.goto(L+'#r2veh-eurocar-westwind-2000-turbo'); await pg.waitForTimeout(300);
out.vehTitle=await pg.$eval('#tag h2',e=>e.innerText).catch(()=>'?');
await pg.check('input[data-vb="facRC"]'); await pg.waitForTimeout(150);
out.vehPrice=await pg.$eval('#tag',e=>(e.innerText.match(/Total[^\n]*?([\d,]+)¥/)||[])[1]||'');
await pg.click('#addVeh'); await pg.waitForTimeout(150);
await pg.goto(L+'#deck-fuchi-cyber-4'); await pg.waitForTimeout(300);
for(const [f,v] of [['ri','1'],['am','20'],['hitch','1']]){const el=await pg.$(`[data-dk="${f}"]`); if(!el){errs.push('no dk '+f); continue;} if(await el.evaluate(e=>e.tagName)==='SELECT') await el.selectOption(v); else {await el.fill(v); await el.dispatchEvent('change');} await pg.waitForTimeout(150);}
out.deckTotal=await pg.evaluate(()=>{const t=document.querySelector('#tag').innerText; const m=t.match(/Deck total[^\d]*([\d,]+)¥/)||t.match(/Total[^\d]*([\d,]+)¥/); return m?m[1]:'';});
await pg.click('#addDeck'); await pg.waitForTimeout(150);
out.rows=await pg.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
out.kitTot=await pg.$eval('#kit .ktot b',e=>e.innerText);
await pg.click('#kit [data-send="kit"]'); await pg.waitForTimeout(200);
const p=await pg.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer'))); out.sent=p.items.map(x=>({key:x.key,qty:x.qty,r:x.r,vb:!!x.vb}));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
out.imp=await pg.evaluate(p=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(p); return X.S.gear.map(g=>({name:g.name,key:g.key,q:g.qty,r:g.r,cost:g.cost,vb:!!g.vb}));},p);
const num=s=>+String(s).replace(/[^\d]/g,'');
const veh=out.sent.find(x=>/Westwind/.test(x.key));
const ok=!errs.length&&veh&&veh.vb&&!out.rows.some(r=>/Mods for|\(Fuchi/.test(r))&&out.sent.some(x=>/Response Increase/.test(x.key))&&out.sent.some(x=>/Extra Active Memory/.test(x.key)&&x.qty===20)&&out.sent.some(x=>/Hitcher/.test(x.key))&&!!out.imp.find(g=>/Westwind/.test(g.key)&&g.vb)&&out.kitTot==='263,700¥'&&out.imp.find(g=>/Cyber-4/.test(g.key)).cost===121400;
console.log(JSON.stringify({ok,...out,errs},null,0));await b.close(); if(!ok) process.exit(1);})();
