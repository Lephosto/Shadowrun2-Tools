const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const errs=[];
const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1400,height:1000}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
for(const id of ['spell:Stunball','spell:Net','power:Distance Strike','power:Killing Hands','magic:Fetish Focus']){
 await p.evaluate(id=>{location.hash='#'+id.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')},id);await p.waitForTimeout(80);
 console.log('--',id,'::',await p.$eval('#tag',e=>e.innerText.replace(/\s+/g,' ').slice(0,500)),' ## ',await p.$$eval('#tag .lgrp h4',e=>e.map(x=>x.textContent).join(' | ')));}
await p.click('[data-cat="spell"]');console.log('sorts',await p.$$eval('#sort option',o=>o.map(x=>x.textContent).join(', ')),'filters',await p.$$eval('#fbar .fl > span',o=>o.map(x=>x.textContent).join(', ')));
await p.selectOption('#f-scat','Combat');await p.selectOption('#f-stype','Mana');await p.click('[data-fk="slv"][data-lv="D"]');console.log('combat mana D',await p.$eval('#count',e=>e.textContent),await p.$$eval('#list .nm',e=>e.map(x=>x.textContent).join(', ')));
await p.click('[data-cat="power"]');await p.selectOption('#sort','pp');console.log(await p.$$eval('#list .item',e=>e.slice(0,6).map(x=>x.querySelector('.nm').textContent+' '+x.querySelector('.pr').textContent).join(' | ')));
await p.click('[data-cat="all"]');await p.selectOption('#sort','price');console.log('all ok',await p.$eval('#count',e=>e.textContent));
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);console.log('w',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errs',errs);await b.close();})();
