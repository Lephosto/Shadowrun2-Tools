// Gear Locker 2: the new layout, driven the way a player would (picker, groups, search, filters, tabs, list, sources, transfer)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const errs=[], fail=[]; const ok=(c,m)=>{if(!c) fail.push(m);};
const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';
const p=await b.newPage({viewport:{width:1400,height:950}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(L); await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('sr2gear',JSON.stringify({kit:[{id:'guns:Ares Predator',r:0}],books:{}}));}); await p.goto(L); await p.waitForTimeout(300);
// 1. seeded once from the old Locker's list, then saved under its own key
ok(await p.$$eval('#kit .kl',x=>x.length)===1,'old list not imported');
// 2. picker: departments, switch to Firearms
await p.click('#catBtn'); ok(await p.isVisible('#picker'),'picker did not open');
ok((await p.$$eval('#picker .pk-h',x=>x.map(e=>e.firstChild.textContent))).join('|').includes('Weapons|Armor|Cyberware and bioware|Matrix|Rigging|Magic|Gear|Character'),'departments wrong');
await p.keyboard.press('Escape'); ok(!(await p.isVisible('#picker')),'Escape did not close the picker');
await p.click('#catBtn'); await p.click('#picker [data-cat="guns"]');
ok(!(await p.isVisible('#picker')),'picker stayed open');
ok((await p.textContent('#catDept'))==='Weapons','dept label');
const groups=await p.$$eval('#list .grph .gl',x=>x.map(e=>e.textContent));
ok(groups[0]==='Hold-out pistol'&&groups.includes('Submachine gun')&&groups.length>=15,'gun groups: '+groups.slice(0,4).join(','));
// 3. a group opens and closes; Open all / Close all
await p.click('[data-grp="s:guns:Submachine gun"]'); ok(await p.$('[data-id="guns:Ingram Smartgun"]')!=null,'SMG group did not open');
await p.click('[data-grp="s:guns:Submachine gun"]'); ok(await p.$('[data-id="guns:Ingram Smartgun"]')==null,'SMG group did not close');
await p.click('#grpAll'); const n1=await p.$$eval('#list .item',x=>x.length); ok(n1===99||n1>90,'open all shows '+n1);
await p.click('#grpAll'); ok((await p.$$eval('#list .item',x=>x.length))<=1,'close all');
// 4. search covers every category and groups by category
await p.fill('#q','smartlink'); await p.waitForTimeout(100);
const cats=await p.$$eval('#list .grph .gl',x=>x.map(e=>e.textContent));
ok(cats.length>=2&&cats.some(c=>/Cyberware/.test(c))&&cats.some(c=>/Ammo/.test(c)),'search groups: '+cats.join(','));
ok((await p.textContent('#catDept'))==='Searching everywhere','search label');
await p.fill('#q',''); await p.waitForTimeout(100);
// 5. filters drawer, legality chip, chip removal
await p.click('#ftog'); ok(await p.isVisible('#fbar'),'filters did not open');
await p.selectOption('#legalSel','permit'); await p.waitForTimeout(100);
ok((await p.$$eval('#achips .achip',x=>x.length))===1,'no legality chip'); ok(/1/.test(await p.textContent('#ftog')),'filter count');
await p.click('#grpAll'); const restricted=await p.$$eval('#list .lgl-restricted',x=>x.length); ok(restricted===0,'restricted items still shown: '+restricted);
await p.click('#achips .achip'); ok((await p.$$eval('#achips .achip',x=>x.length))===0,'chip did not clear');
ok((await p.$$eval('#fbar [data-f],#fbar [data-lv]',x=>x.length))>0,'category filter missing in drawer');
// 6. item tabs and the sticky bar
await p.goto(L+'#guns-ingram-smartgun'); await p.waitForTimeout(300);
const tabs=await p.$$eval('.tabs [role=tab]',x=>x.map(e=>e.textContent.replace(/\d+$/,'')));
ok(tabs.join('|')==='Overview|Build-out|For your runner|Goes with','tabs: '+tabs.join('|'));
await p.click('.tbar [data-tab="build"]'); ok(await p.$('#addBuild')!=null,'build tab has no add button');
ok(await p.$('.tabs [data-tab="build"][aria-selected="true"]')!=null,'build tab not selected');
await p.click('.tabs [data-tab="goes"]'); ok((await p.$$eval('.tpanel .pill',x=>x.length))>3,'goes-with pills');
// 7. simple add, quantity stepper, legality summary
await p.goto(L+'#med-trauma-patch'); await p.waitForTimeout(200);
await p.click('#addKit'); await p.click('#addKit');
let tp=await p.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
const tline=tp.findIndex(t=>/Trauma Patch/.test(t)); ok(tline>=0&&/1,000¥/.test(tp[tline]),'two patches = 1,000¥: '+tp[tline]);
await p.click('#kit .kl:has-text("Trauma Patch") [data-d="1"]'); tp=await p.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
ok(tp.some(t=>/Trauma Patch.*1,500¥/.test(t)),'stepper +1');
await p.click('#kit .kl:has-text("Trauma Patch") [data-d="-1"]');
// 8. builds: gun with an add-on, vehicle with a mod, deck with a program
await p.goto(L+'#guns-ingram-smartgun'); await p.waitForTimeout(200); await p.click('.tbar [data-tab="build"]');
// gun mount map: pick a top sight, then an under-barrel bipod; the sight can't also go underneath
await p.click('[data-gslot="top"]'); await p.click('[data-gpick="ammo:Ultrasound Sight"][data-slot="top"]');
ok(await p.$('[data-gslot="top"].gm-st-fit')!=null,'top mount not marked fitted');
await p.click('[data-gslot="under"]');
const dupe=await p.$('[data-gpick="ammo:Laser Sight"][data-slot="under"]'); ok(!!dupe,'laser sight not offered underneath');
await p.click('[data-gslot="top"]'); await p.click('[data-gpick="ammo:Laser Sight"][data-slot="top"]'); await p.click('[data-gslot="under"]');
ok(await p.getAttribute('[data-gpick="ammo:Laser Sight"][data-slot="under"]','aria-disabled')==='true','same sight allowed on two mounts');
await p.click('[data-gslot="top"]'); await p.click('[data-gpick="ammo:Ultrasound Sight"][data-slot="top"]');
await p.click('[data-gslot="under"]'); await p.click('[data-gpick="ammo:Bipod"][data-slot="under"]');
const gres=await p.$eval('.gm-res',e=>e.innerText.replace(/\s+/g,' ')); ok(/2,650¥/.test(gres),'gun price with sight and bipod: '+gres);
ok(/Doesn’t fit this gun \(2\)/.test(await p.$eval('.gm-no summary',e=>e.innerText)),'under-barrel misfits not listed');
await p.click('[data-gslot="barrel"]'); ok(/Built in: Gas Vent II/.test(await p.$eval('.gm-panel',e=>e.innerText)),'built-in vent not shown');
await p.click('#addBuild'); await p.waitForTimeout(100);
await p.goto(L+'#r2veh-mitsubishi-nightsky'); await p.waitForTimeout(200);
ok(await p.$('#addVeh')!=null,'build tab not remembered for the next buildable item');
const bars0=await p.$eval('.vw-bars',e=>e.innerText.replace(/\s+/g,' '));
ok(/0 of 10 CF/.test(bars0)&&/0 of 60 kg/.test(bars0)&&/0 of 4/.test(bars0),'vehicle bars: '+bars0);
ok(/Rigger adaptation/.test(await (async()=>{await p.click('[data-vtab="no"]'); return p.$eval('.vw-list',e=>e.innerText);})()),'rigger adaptation not under Doesn’t fit');
await p.click('[data-vtab="fits"]');
{const x=await p.$('input[data-vbck][data-vbid="datajack"]'); if(x) await x.evaluate(e=>e.click()); else errs.push('no datajack port toggle');}
await p.waitForTimeout(100);
await p.click('[data-vtab="no"]'); const noTxt=await p.$eval('.vw-list',e=>e.innerText); ok(!/Rigger adaptation/.test(noTxt),'rigger adaptation still blocked after a datajack port');
await p.click('[data-vtab="fits"]');
const vck=await p.$('input[data-vbck][data-vbid="winch"]'); if(vck) await vck.evaluate(e=>e.click()); else errs.push('no winch toggle');
await p.waitForTimeout(100);
const bars1=await p.$eval('.vw-bars',e=>e.innerText.replace(/\s+/g,' ')); ok(/2 of 10 CF/.test(bars1)&&/25 of 60 kg/.test(bars1),'bars after datajack + winch: '+bars1);
await p.click('[data-vtab="on"]'); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===2,'On this build count'); await p.click('[data-vtab="fits"]'); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===2,'added mods not kept in Fits'); await p.click('[data-vtab="on"]');
const djOff=await p.$('input[data-vbck][data-vbid="datajack"]'); if(djOff) await djOff.evaluate(e=>e.click()); await p.waitForTimeout(100);
ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===1,'removing from On this build');
await p.waitForTimeout(100); await p.click('#addVeh');
const kl=await p.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
ok(kl.some(t=>/Ingram Smartgun/.test(t)&&/With /.test(t)),'gun line carries add-ons');
ok(kl.some(t=>/Nightsky.*250,375¥/.test(t)&&/Winch/.test(t)&&!/Datajack/.test(t)),'vehicle line with winch: '+kl.find(t=>/Nightsky/.test(t)));
// 9. Open from the list goes back to the build-out
await p.click('#kit .kl:has-text("Nightsky") [data-kedit]'); await p.waitForTimeout(100);
ok((await p.textContent('#tag h2'))==='Mitsubishi Nightsky'&&await p.$('#addVeh')!=null,'Open did not return to the build-out');
// 10. collapse to the rail and back, persisted
await p.click('#kitClose'); ok(await p.$('#kitOpen')!=null,'no rail'); ok(await p.$eval('#grid',g=>g.classList.contains('kitc')),'grid did not widen');
await p.reload(); await p.waitForTimeout(300); ok(await p.$('#kitOpen')!=null,'rail not remembered');
await p.click('#kitOpen'); ok(await p.$('#kitClose')!=null,'did not reopen');
// 11. sources: open, Core only hides SSC gear, All books back
await p.click('#srcBtn'); ok(await p.isVisible('#srcPanel'),'sources did not open'); ok(!(await p.isVisible('#srcBtn')),'header button still visible');
await p.click('#srcCore'); ok(/1 of 11/.test(await p.textContent('#srcCount')),'core only count');
await p.fill('#q','Ingram Smartgun'); await p.waitForTimeout(100); ok(await p.$('#list [data-id="guns:Ingram Smartgun"]')==null,'SSC item visible with core only');
await p.click('#srcAll'); await p.waitForTimeout(100); ok(await p.$('#list [data-id="guns:Ingram Smartgun"]')!=null,'all books did not bring it back');
await p.click('#srcClose'); ok(!(await p.isVisible('#srcPanel')),'sources did not close');
// 12. send the list and import it into the Runner Builder
await p.click('#kit .kfoot [data-send="kit"].full'); await p.waitForTimeout(200);
const pay=await p.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')||'null'));
ok(pay&&pay.items&&pay.items.length===4,'transfer items: '+(pay&&pay.items.length));
ok(pay&&pay.items.some(x=>/Nightsky/.test(x.key)&&x.vb),'vehicle build-out not sent');
await p.goto('file://'+process.cwd()+'/sr2-builder.html'); await p.waitForTimeout(300);
const imp=await p.evaluate(pl=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(pl); return X.S.gear.map(g=>g.name+'|'+(g.qty||1));},pay);
ok(imp.some(x=>/Trauma Patch\|2/.test(x))&&imp.some(x=>/Nightsky/.test(x))&&imp.some(x=>/Ingram/.test(x)),'builder import: '+imp.join(', '));
// 13. old Locker storage untouched
await p.goto(L); const old=await p.evaluate(()=>JSON.parse(localStorage.getItem('sr2gear')));
ok(old&&old.kit.length===1,'old Locker list was changed');
// 14. phone: no sideways scroll, list and item stack
const m=await b.newPage({viewport:{width:390,height:844}}); m.on('pageerror',e=>errs.push('phone: '+e.message));
await m.goto(L); await m.waitForTimeout(300); ok(await m.evaluate(()=>document.documentElement.scrollWidth)<=390,'phone scrolls sideways');
console.log(JSON.stringify({ok:!fail.length&&!errs.length,fail,errs}));
await b.close(); if(fail.length||errs.length) process.exit(1);})();
