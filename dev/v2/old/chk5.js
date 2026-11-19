const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const errs=[];
const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1400,height:1000}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
console.log('books',await p.$$eval('#books .chip',e=>e.map(x=>x.textContent).join(' ')));
await p.click('[data-cat="ef"]');await p.waitForTimeout(200);
console.log(await p.$$eval('#list .item',e=>e.length+' '+e.slice(0,4).map(x=>x.innerText.replace(/\s+/g,' ')).join(' | ')));
await p.click('#list .item >> nth=0');await p.waitForTimeout(200);
console.log((await p.textContent('#tag')).replace(/\s+/g,' ').slice(0,500));
await p.click('[data-cat="meta"]');await p.waitForTimeout(200);
console.log(await p.$$eval('#list .item',e=>e.length));
await p.click('#list .item >> nth=0');await p.waitForTimeout(200);
console.log((await p.textContent('#tag')).replace(/\s+/g,' ').slice(0,600));
await p.screenshot({path:'gear/s_meta.png'});
console.log('errs',errs);await b.close();})();
