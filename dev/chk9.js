const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html'); await p.click('#btnNew');
for(const k of ['r2','vr2','fof']) await p.check(`[data-book="${k}"]`);
// add one of every visible item in new books
const keys=await p.evaluate(()=>{const X=window.__sr2;const r=[];X.GCATS.forEach(([c])=>X.CAT[c].forEach(it=>{if(['r2','vr2','fof'].includes(it.src)&&X.itemVisible(it)) r.push(c+':'+it.n);}));return r;});
let n=0;for(const k of keys){const c=k.split(':')[0];await p.selectOption('#gCat',c);await p.selectOption('#gItem',k);await p.click('#gAdd');n++;}
console.log('added',n);
await p.evaluate(()=>{window.__sr2.S.gear.filter(g=>/^prog2:/.test(g.key)).forEach(g=>g.loaded=true);window.__sr2.render();});
const t=await p.$eval('#issues',e=>e.innerText); console.log('ISS',t);
for(const w of [390,768,1280,1920]){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(150);console.log(w,await p.evaluate(()=>document.documentElement.scrollWidth));}
const sheet=await p.evaluate(()=>window.__sr2.sheetFile());require('fs').writeFileSync('sheet_test.html',sheet);
const p2=await b.newPage();p2.on('pageerror',e=>errs.push('sheet:'+e.message));await p2.goto('file://'+process.cwd()+'/sheet_test.html');await p2.screenshot({path:'sheet_test.png',fullPage:true});
console.log('errs',errs);await b.close();})();
