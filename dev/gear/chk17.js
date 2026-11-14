// Locker: drone build-out checklist (tick, level, option, untick, hide toggle, persistence)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html#'+(process.argv[2]||'r2veh-gm-nissan-doberman'));await pg.waitForTimeout(400);
const n=async()=>pg.$$eval('input[data-vbck]',x=>({all:x.length,on:x.filter(y=>y.checked).length,dis:x.filter(y=>y.disabled).length}));
const out={start:await n()};
await pg.click('button[data-vball="1"]');
// tick sensor upgrade, armor, a remote turret, ECCM
for(const id of ['sensor','armor','rt_mini','eccm','smartkit']){const el=await pg.$(`input[data-vbck][data-vbid="${id}"]`); if(el&&!(await el.isDisabled())) await el.click();}
out.ticked=await n();
// set armor to 3 and turret option to pop-up
const arm=await pg.$('select[data-vblv][data-vbid="armor"]'); if(arm){const vs=await arm.$$eval('option',o=>o.map(x=>x.value)); out.armorLv=vs; await arm.selectOption(vs[vs.length-1]);}
const op=await pg.$('select[data-vbop][data-vbid="rt_mini"]'); if(op){const vs=await op.$$eval('option',o=>o.map(x=>x.value)); out.turOpts=vs; await op.selectOption(vs[vs.length-1]);}
out.armorOpts=await pg.$$eval('select[data-vblv][data-vbid="armor"] option',o=>o.slice(0,3).map(x=>x.textContent));
out.title=await pg.$eval('.build h4.bh:nth-of-type(3)',e=>e.textContent).catch(()=>'');
out.facts=await pg.$$eval('.build dl',d=>d.map(e=>e.innerText.replace(/\s+/g,' ')).join(' | '));
out.tiles=await pg.$eval('.build .vtiles',e=>e.innerText.replace(/\s+/g,' '));
await pg.click(`input[data-vbck][data-vbid="armor"]`);
out.afterUntick=await n();
await pg.click("input[data-vbhide]"); out.hidden=await n();
await pg.reload(); await pg.waitForTimeout(300); out.reload=await n();
out.nan=/NaN|undefined/.test(await pg.$eval('.build',e=>e.innerHTML));
await pg.screenshot({path:'shots/vb_locker.png',fullPage:false,clip:{x:0,y:0,width:390,height:900}}).catch(()=>{});
const sec=await pg.$('.vcheck'); if(sec){await sec.scrollIntoViewIfNeeded(); await sec.screenshot({path:'shots/vb_locker_list.png'});}
console.log(JSON.stringify(out));console.log(errs.slice(0,4));await b.close();})();
