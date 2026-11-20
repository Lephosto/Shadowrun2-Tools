// Runner Builder 2 check: the three modes on the example runner. Exits 1 on any failure or page error.
const {chromium}=require('playwright'); let bad=0; const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m);}};
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1300,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/SR2_Runner_Builder_2.html'); await p.evaluate(()=>{localStorage.clear();}); await p.reload();
 await p.click('#btnExample'); await p.waitForTimeout(300);
 ok(await p.$('#b2tabs [data-tab=night]'),'mode tabs'); ok((await p.$eval('#b2strip',e=>e.innerText)).toLowerCase().includes('essence'),'budget strip');
 await p.click('#b2tabs [data-tab=night]'); const big=await p.$$eval('.b2t .b2k',x=>x.map(y=>y.textContent)); ok(big.includes('Initiative')&&big.includes('Armor'),'big stats');
 const opts=await p.$$eval('[data-b2=wid] option',x=>x.length); ok(opts>=1,'attack list');
 await p.click('[data-b2a=roll]'); ok((await p.$$('.b2dice .b2die')).length>0,'attack roll');
 await p.click('[data-b2a=copy]'); ok((await p.$eval('#b2r20',e=>e.value).catch(()=>'')).startsWith('&{template:default}'),'roll20 copy');
 await p.click('[data-b2a=ghroll]'); ok((await p.$$eval('.b2pan',x=>x[3].innerText)).match(/success/),'got hit roll');
 await p.click('[data-b2trk=phys][data-v="3"]'); ok((await p.evaluate(()=>document.querySelector('.b2pan .b2h').nextElementSibling&&1)),'monitor');
 await p.click('#b2tabs [data-tab=after]'); await p.click('[data-b2s="af:gk"][data-d="1"]'); const k0=+await p.$eval('#kEarned',e=>e.value); await p.click('[data-b2a=afsave]'); await p.waitForTimeout(200);
 ok(+await p.$eval('#kEarned',e=>e.value)===k0+1,'after-session save adds Karma'); ok((await p.$$('[data-b2snap]')).length===1,'snapshot kept');
 await p.setViewportSize({width:390,height:844}); await p.click('#b2tabs [data-tab=night]'); ok(await p.evaluate(()=>document.documentElement.scrollWidth<=392),'no sideways scroll on a phone');
 ok(!errs.length,'page errors: '+errs.join(' | ')); console.log(bad?bad+' failed':'builder 2: all good'); await b.close(); process.exit(bad?1:0);})();
