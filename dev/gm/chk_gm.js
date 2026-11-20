// GM screen check: catalog filters, loadouts, groups, table. Exits 1 on any failure or page error.
const {chromium}=require('playwright'); let bad=0; const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m);}};
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1300,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/SR2_GM_Screen.html'); await p.evaluate(()=>localStorage.clear()); await p.reload();
 ok(await p.evaluate(()=>{const IT=new Set(GMITEMS.map(x=>x.id)); let m=0; GMDATA.forEach(b=>(b.gear||[]).forEach(([id])=>{if(!IT.has(id)) m++;})); [LOADOUTS,STREET_LOADOUTS].forEach(L=>Object.values(L).forEach(l=>l.items.forEach(id=>{if(!IT.has(id)) m++;}))); return m===0;}),'every gear id is a Gear Locker item');
 await p.click('[data-act=filters]'); await p.click('[data-kind=crit]'); const n=await p.$$eval('.it',x=>x.length); ok(n>20,'critter filter'); await p.click('[data-act=clearf]');
 await p.click('[data-f=roles][data-v="security"]'); await p.click('[data-sel=fro]'); await p.click('[data-load=hard]');
 ok((await p.$eval('.detail .rows',e=>e.innerText)).includes('−2 TN'),'smartlink with a smartgun'); ok((await p.$eval('.stats',e=>e.innerText)).includes('7/6'),'armor from the loadout');
 await p.fill('#addN','2'); await p.click('[data-act=add]');
 await p.click('[data-tab=tbl]'); await p.click('[data-act=rollini]'); ok((await p.$$('.orow')).length===2,'two copies at the table');
 await p.click('[data-tsel]'); await p.click('[data-act=roll]'); ok((await p.$$('.act .die')).length>0,'attack roll');
 await p.click('[data-mode=res]'); await p.click('[data-act=rres]'); ok((await p.$eval('.act .resb > b',e=>e.textContent)).match(/success|miss/),'resist roll');
 await p.click('[data-act=copyres]'); ok((await p.$eval('#r20',e=>e.value)).startsWith('&{template:default}'),'roll20 copy');
 await p.setViewportSize({width:390,height:844}); await p.click('[data-tab=cat]'); ok(await p.evaluate(()=>document.documentElement.scrollWidth<=392),'no sideways scroll on a phone');
 ok(!errs.length,'page errors: '+errs.join(' | ')); console.log(bad?bad+' failed':'gm screen: all good'); await b.close(); process.exit(bad?1:0);})();
