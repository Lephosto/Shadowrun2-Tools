// Builder: deck programs checklist (persona chips, utilities, ratings, loaded, removal keeps other panels right)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
await pg.evaluate(()=>{const X=window.__sr2,S=X.S; S.books=Object.assign({},S.books,{vr2:false}); S.gear=[{key:'deck:Fuchi Cyber-6',qty:1},{key:'head:Cybereyes',qty:1}]; X.HB_OPEN.add(1); X.render();});
const G=async()=>pg.evaluate(()=>window.__sr2.S.gear.map(g=>g.key.replace(/^.*?:/,'')+(g.r?':'+g.r:'')+(g.loaded?'*':'')).join(', '));
const out={};
out.groups=await pg.$$eval('#progList details.vgrp > summary b',x=>x.map(e=>e.textContent));
await pg.click('input[data-pgck="D"][data-pgid="prog:Persona: Bod"]'); await pg.selectOption('select[data-pgr="D"][data-pgid="prog:Persona: Bod"]','6');
await pg.click('#progList button[data-pgall="1"]');
await pg.click('input[data-pgck="D"][data-pgid="prog:Attack"]'); await pg.selectOption('select[data-pgr="D"][data-pgid="prog:Attack"]','4'); await pg.click('input[data-pgld="D"][data-pgid="prog:Attack"]');
await pg.click('input[data-pgck="D"][data-pgid="prog:Sleaze"]');
out.gear=await G();
out.mem=await pg.$eval('#memBudget',e=>e.innerText.replace(/\s+/g,' '));
// remove the cybereyes' neighbour: untick Bod (index 2) and check the eyes panel stays open
await pg.click('input[data-pgck="D"][data-pgid="prog:Persona: Bod"]');
out.after=await G(); out.hbOpen=await pg.evaluate(()=>[...window.__sr2.HB_OPEN].join(','));
out.focus=await pg.evaluate(()=>document.activeElement&&document.activeElement.dataset.pgid);
// VR2 custom deck
await pg.evaluate(()=>{const X=window.__sr2,S=X.S; S.books=Object.assign({},S.books,{vr2:true}); S.gear=[{key:'deck:Custom cyberdeck (VR2 à la carte)',qty:1}]; S.vr2deck=null; X.render();});
out.vgroups=await pg.$$eval('#progList details.vgrp > summary b',x=>x.map(e=>e.textContent));
await pg.click('#progList button[data-pgall="1"]'); await pg.click('input[data-pgck="D"][data-pgid="prog2:Browse"]');
out.browseMax=await pg.$$eval('select[data-pgr="D"][data-pgid="prog2:Browse"] option',o=>o.map(x=>x.value).pop());
out.nan=/NaN|undefined/.test(await pg.$eval('#deckCard',e=>e.innerHTML));
await pg.screenshot({path:'shots/b_deck.png',fullPage:false});
console.log(JSON.stringify(out));console.log(errs.slice(0,4));await b.close();})();
