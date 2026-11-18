// Player-style build-outs of different vehicle types in the Gear Locker, then one send to a test rigger in the Builder
const {chromium}=require('playwright');const UI=require('../arch/lib.js');const fs=require('fs');
const PLANS=[
 ['Harley-Davidson Scorpion',[['datajack'],['rigger'],['nitro',2],['carmor',1],['sidecar'],['tires',2,'Run-flat'],['rt_micro',1],['eccm',1]]],
 ['Steel Lynx Ground Combat Drone',[['smartkit'],['recoil',2],['gyro',2],['armor',2],['sensor',3],['eccm',2],['fddm'],['ivis']]],
 ['GM-Nissan Doberman',[['fx_ef',1],['smartkit'],['convkit'],['eccm',1],['carmor',1],['nitro',1]]],
 ['Ares Citymaster',[['MIL'],['tur_med',1],['sas',1],['ram',1],['datajack'],['rigger'],['ecm',2],['armor',2]]],
 ['GMC Bulldog Step-Van (Standard)',[['rciface'],['pilot',2],['dronerack',2],['eccm',2],['amp',2],['seat_rm',1],['datajack'],['rigger'],['winch'],['crane']]],
 ['Hughes WK-2 Stallion',[['ring',1,'Door'],['floats'],['armor',1],['datajack'],['rigger'],['droptank',1],['seal_gas'],['eng_sp',1],['turbo',1]]],
 ['Samuvani Criscraft Otter',[['ctlsurf',1],['datajack'],['rigger'],['seal_water'],['pintle',1],['amphib',1],['tires',1],['sidecar']]],
 ['Mostrans KVP-14T (Standard)',[['hoverseal'],['datajack'],['rigger'],['armor',1],['fx_ef',1],['offroad',1]]],
 ['Cessna C750 (Standard)',[['droptank',1],['datajack'],['rigger'],['mis_ext',2],['floats'],['ejection'],['seat_eject',1]]],
 ['Toyota MK-Guyver Search and Rescue Robot',[['armstr',1],['armor',1],['sensor',2],['susp',1],['tires',1]]],
 ['Airship Industries Skyswimmer',[['datajack'],['rigger'],['lifesup',2],['spot',2],['armor',1],['mis_int',1]]],
 ['Dodge Scoot',[['datajack'],['rigger'],['gridlink'],['suncell'],['nitro',1],['eng_sp',1]]],
];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true});const errs=[];const out={};
const lp=await ctx.newPage(); lp.on('pageerror',e=>errs.push('L:'+e.message));
const L='file://'+process.cwd()+'/SR2_Gear_Locker.html'; await lp.goto(L); await lp.evaluate(()=>localStorage.clear()); await lp.goto(L); await lp.waitForTimeout(300);
for(const [name,plan] of PLANS){const log=[]; out[name]=log;
  await lp.fill('#q',name); await lp.waitForTimeout(250);
  const it=lp.locator('#list .item',{has:lp.locator('.nm',{hasText:name})}).first(); if(!(await it.count())){log.push('NOT FOUND'); continue;} await it.click(); await lp.waitForTimeout(350);
  const row=id=>lp.$eval(`input[data-vbid="${id}"]`,e=>e.closest('li').innerText.replace(/\s+/g,' ').replace(/ What it does.*/,'').slice(0,240)).catch(()=>`(no ${id} row)`);
  for(const [id,lv,opt] of plan){
    if(id==='MIL'){await lp.check('input[data-vb="mil"]').catch(()=>log.push('no military switch')); await lp.waitForTimeout(200); log.push('+ military switch'); continue;}
    await lp.click('text=Open all').catch(()=>{});
    const el=await lp.$(`input[data-vbid="${id}"]`); if(!el){log.push(`? ${id}: no such row`); continue;}
    if(await el.isDisabled()){log.push(`✗ ${await row(id)}`); continue;}
    if(!(await el.isChecked())){await el.click(); await lp.waitForTimeout(220);}
    if(lv!=null){const s=await lp.$(`li:has(input[data-vbid="${id}"]) select[data-vblv]`); if(s){const ok=await s.$$eval('option',(o,l)=>o.some(x=>x.value===String(l)),lv); if(ok){await s.selectOption(String(lv)); await lp.waitForTimeout(160);} else log.push(`  ${id}: level ${lv} not offered (${await s.$$eval('option',o=>o.map(x=>x.value).join(','))})`);}}
    if(opt){const s=await lp.$(`li:has(input[data-vbid="${id}"]) select:not([data-vblv])`); if(s){const v=await s.$$eval('option',(o,t)=>{const m=o.find(x=>x.text.startsWith(t));return m?m.value:null;},opt); if(v){await s.selectOption(v); await lp.waitForTimeout(160);} else log.push(`  ${id}: no option "${opt}" (${await s.$$eval('option',o=>o.map(x=>x.text).join(' | '))})`);}}
    log.push(`✓ ${await row(id)}`);}
  const vc=await lp.$eval('.vcheck',e=>e.innerText);
  const cap=vc.slice(vc.indexOf('Capacity'),vc.indexOf('Stats')).replace(/\s+/g,' ');
  const tiles=await lp.$$eval('.vtiles .vt',t=>t.map(x=>x.innerText.replace(/\s+/g,' ')).join(' | '));
  const added=(vc.match(/Added:[^\n]*/)||[''])[0]; const gm=(vc.match(/Not in the total:[^\n]*/)||[''])[0];
  const tot=await lp.$eval('#tag',e=>{const t=e.innerText;const i=t.lastIndexOf('TOTAL\n');return t.slice(i,i+30).replace(/\s+/g,' ');});
  log.push('CAP '+cap,'STATS '+tiles,added,gm,tot);
  const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); const bx=await lp.$('.build'); if(bx) await bx.screenshot({path:`vsweep/${slug}.png`}).catch(()=>{});
  await lp.click('text=Add vehicle and mods to shopping list'); await lp.waitForTimeout(200);}
out.KIT=[await lp.$eval('#kit',e=>e.innerText.replace(/\s+/g,' ').slice(0,1500))];
await lp.click('#kit [data-send="kit"]'); await lp.waitForTimeout(250);
const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('B:'+e.message)); const log=[]; const u=UI(p,log); await u.open(); await u.openJson('battle/out/rig1.char.json');
const nyBefore=await p.$eval('#nuyenNow',e=>e.value); await p.fill('#nuyenNow','5000000'); await p.press('#nuyenNow','Tab'); await p.waitForTimeout(450);
const pk=await UI.pickup(p,log); out.PICKUP=[JSON.stringify(pk)];
const rows=await p.$$eval('#vehBody tr',r=>r.map(x=>x.innerText.replace(/\s+/g,' ')).filter(t=>t.includes('mod')));
out.RIGTABLE=rows; out.CHECK=[(await u.check()).slice(0,1500)];
await p.$eval('#rigCard',e=>e.scrollIntoView()).catch(()=>{}); const rc=await p.$('#rigCard'); if(rc) await rc.screenshot({path:'vsweep/rigcard.png'});
await u.exportSheet('vsweep/gearjammer_sheet.html');
fs.writeFileSync('vsweep/play.json',JSON.stringify({out,errs},null,1));
for(const [k,v] of Object.entries(out)){console.log('## '+k); v.forEach(x=>console.log('   '+x));} console.log('errs',errs); await b.close();})();
