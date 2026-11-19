// Gear Locker 2 build-outs: the gun mount map and the vehicle workshop, ported from the old Locker's checks 17, 18, 22, 24, 26, 29
const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{const b=await chromium.launch(); const errs=[], fail=[]; const ok=(c,m)=>{if(!c) fail.push(m);}; const out={};
const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';
const p=await b.newPage({viewport:{width:1400,height:950}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(L); await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('sr2gear2',JSON.stringify({tab:'build',kit:[]}));}); await p.reload(); await p.waitForTimeout(200);
const go=async h=>{await p.goto(L+'#'+h); await p.waitForTimeout(250);};
const click=async sel=>{const x=await p.$(sel); if(!x){errs.push('missing '+sel); return false;} await x.evaluate(e=>e.click()); await p.waitForTimeout(60); return true;};
const bars=()=>p.$eval('.vw-bars',e=>e.innerText.replace(/\s+/g,' '));
// 1. drone (old chk17): add, change level and option, remove, keep after reload
await go('r2veh-gm-nissan-doberman');
for(const id of ['sensor','armor','rt_mini','eccm']){const x=await p.$(`input[data-vbck][data-vbid="${id}"]`); if(x){await x.evaluate(e=>e.click()); await p.waitForTimeout(60);}}  // like the old check: only what still fits gets added
const lv=await p.$('select[data-vblv][data-vbid="armor"]'); if(lv){const vs=await lv.$$eval('option',o=>o.map(x=>x.value)); await lv.selectOption(vs[vs.length-1]); out.armorLv=vs;} else errs.push('no armor level');
const op=await p.$('select[data-vbop][data-vbid="rt_mini"]'); if(op){const vs=await op.$$eval('option',o=>o.map(x=>x.value)); await op.selectOption(vs[vs.length-1]); out.turOpts=vs;}
await p.waitForTimeout(100);
const onN=await p.$$eval('.vw-r.vw-on',x=>x.length); ok(onN>=2,'drone mods on: '+onN);
await click('input[data-vbck][data-vbid="armor"]'); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===onN-1,'armor did not come off');
await p.reload(); await p.waitForTimeout(300); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===onN-1,'build not kept after reload');
ok(!/NaN|undefined/.test(await p.$eval('.vw',e=>e.innerHTML)),'NaN in drone build');
// 2. random builds on 20 random vehicles (old chk18): no errors, no NaN, bars never over
const ids=JSON.parse(fs.readFileSync('gear_data.json','utf8')).items.filter(i=>i.cat==='r2veh').map(i=>i.n);
const slug=n=>('r2veh:'+n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let seed=181; const rnd=()=>{seed=(seed*1103515245+12345)%2147483648; return seed/2147483648;};
const probs=[];
for(let k=0;k<20;k++){const n=ids[Math.floor(rnd()*ids.length)]; await go(slug(n));
  if(!(await p.$('.vw'))){probs.push([n,'no workshop']); continue;}
  for(let i=0;i<25;i++){const els=await p.$$('.vw input[data-vbck], .vw select[data-vblv], .vw select[data-vbop]'); if(!els.length) break; const el=els[Math.floor(rnd()*els.length)];
    const tag=await el.evaluate(e=>e.tagName); if(tag==='SELECT'){const vs=await el.$$eval('option',o=>o.map(x=>x.value)); await el.selectOption(vs[Math.floor(rnd()*vs.length)]);} else await el.evaluate(e=>e.click()); await p.waitForTimeout(15);
    if(i===12) await click('[data-vtab="on"]'); if(i===18) await click('[data-vtab="fits"]');}
  const html=await p.$eval('.vw',e=>e.innerHTML); if(/NaN|undefined/.test(html)) probs.push([n,'NaN']);
  const over=await p.$$eval('.vw-bl b',bs=>bs.map(b=>b.textContent).filter(t=>{const m=t.replace(/,/g,'').match(/([\d.]+) of ([\d.]+)/); return m&&+m[1]>+m[2]+1e-9;})); if(over.length) probs.push([n,'over',over]);
  const tabs=await p.$$eval('[data-vtab] span',x=>x.map(e=>+e.textContent)); const all=await p.evaluate(()=>VB.M.length);
  if(tabs[0]+tabs[1]-tabs[2]>all||tabs[0]<tabs[2]) probs.push([n,'tab counts',tabs]);}
ok(!probs.length,'random vehicles: '+JSON.stringify(probs.slice(0,3)));
// 3. Nightsky wording (old chk29): factory rows, capacity reasons, engine customization gain, masking on Signature
await go('r2veh-mitsubishi-nightsky');
await click('[data-vtab="no"]'); const noTxt=await p.$eval('.vw-list',e=>e.innerText.replace(/\s+/g,' '));
ok(/APPS \(per seat\) Factory-fitted, and it already has the most/.test(noTxt)&&!/Not possible/.test(noTxt),'APPS factory wording');
await click('[data-vtab="fits"]');
for(const id of ['datajack','rigger']) await click(`input[data-vbck][data-vbid="${id}"]`);
await click('input[data-vbck][data-vbid="eccm"]'); const ec=await p.$('select[data-vblv][data-vbid="eccm"]'); if(ec) await ec.selectOption('2');
await p.waitForTimeout(100);
await click('[data-vtab="no"]'); const nitro=await p.$eval('.vw-list',e=>{const r=[...e.querySelectorAll('.vw-r')].find(x=>/Nitrous/.test(x.innerText)); return r?r.innerText.replace(/\s+/g,' '):'';});
ok(/Not enough Load: needs 15 kg, \d+ kg left of 60\. Engine customization: Load adds 200 kg a level/.test(nitro),'nitrous reason: '+nitro.slice(0,120));
await click('[data-vtab="fits"]'); const eng=await p.$eval('.vw-list',e=>{const r=[...e.querySelectorAll('.vw-r')].find(x=>/Engine customization: Load/.test(x.innerText)); return r?r.innerText.replace(/\s+/g,' '):'';});
ok(/\+200 kg Load a level/.test(eng),'engine gain: '+eng.slice(0,100));
await click('input[data-vbck][data-vbid="eng_ld"]'); ok(/of 260 kg/.test(await bars()),'Load bar after engine customization: '+await bars());
await click('input[data-vbck][data-vbid="mask"]'); const sig=await p.$$eval('.vw-st',t=>t.map(x=>x.innerText.replace(/\s+/g,' ')).find(x=>/^Signature/i.test(x))||'');
ok(/masked/.test(sig),'masking on Signature: '+sig);
// 4. setup: RC interface already in (old chk26) changes what fits
await go('r2veh-eurocar-westwind-2000-turbo'); await click('.vw-setup summary'); await click('input[data-vb="facRC"]');
ok(/RC interface already in/.test(await p.$eval('.vw-setup summary',e=>e.innerText)),'setup summary');
await click('#addVeh');
// 5. every gun with mounts renders the map; picking in each open slot works (old chk22)
const guns=await p.evaluate(()=>ITEMS.filter(g=>canBuild(g)&&visible(g)).map(g=>g.id));
const gp=[];
for(const id of guns.slice(0,200)){await p.evaluate(x=>{select(x); st.tab='build'; renderTag();},id);
  const slots=await p.$$eval('[data-gslot]',x=>x.map(e=>e.dataset.gslot)); if(!slots.length){gp.push([id,'no map']); continue;}
  for(const s of slots){await p.evaluate(x=>{st.gslot=x; renderTag();},s); const o=await p.$('.gm-o:not([aria-disabled="true"])'); if(o){await o.evaluate(e=>e.click()); await p.waitForTimeout(5);}}
  const h=await p.$eval('.gm',e=>e.innerHTML); if(/NaN|undefined/.test(h)) gp.push([id,'NaN']);}
ok(!gp.length,'guns: '+JSON.stringify(gp.slice(0,3))); out.guns=guns.length;
// 6. the max-built Mossberg (old chk24): one line with the build, a clip for it, into the Builder with recoil comp 5
await p.evaluate(()=>{st.kit=[]; st.build={}; save(); renderKit();});
await go('guns-mossberg-cmdt');
const pick=async(slot,re)=>{await click(`[data-gslot="${slot}"]`); const k=await p.$$eval('.gm-o:not([aria-disabled="true"])',(o,r)=>{const m=o.find(x=>new RegExp(r).test(x.innerText)); return m?m.dataset.gpick:null;},re); if(k) await click(`[data-gpick="${k}"][data-slot="${slot}"]`); return k;};
out.picked=[await pick('top','Ultrasound'),await pick('barrel','Improved Gas Vent IV'),await pick('stock','Shock'),await pick('internal','Smartlink II'),await pick('other','Biometric')];
ok(out.picked.every(Boolean),'Mossberg picks: '+out.picked);
ok(/9,650¥/.test(await p.$eval('.gm-res',e=>e.innerText)),'Mossberg price');
await click('#addBuild');
await go('ammo-spare-clip'); const v=await p.$$eval('#tfg option',o=>(o.find(x=>/Mossberg/.test(x.textContent))||{}).value); if(v) await p.selectOption('#tfg',v); else errs.push('no clip target'); await click('#addKit');
await click('.kfoot [data-send="kit"].full'); await p.waitForTimeout(150);
const pay=await p.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
await p.goto('file://'+process.cwd()+'/sr2-builder.html'); await p.waitForTimeout(300);
const imp=await p.evaluate(pl=>{const X=window.__sr2; X.S.gear=[]; X.gearImport(pl); const G=X.S.gear; return {n:G.length,cost:G[0].cost,clip:G[1]&&G[1].forGun===G[0].gid};},pay);
const weap=await p.$eval('#weapBody',e=>e.innerText.replace(/\s+/g,' '));
ok(imp.n===2&&imp.cost===9650&&imp.clip&&/recoil comp 5/.test(weap),'Builder import: '+JSON.stringify(imp));
// 7. phone: the workshop and the mount map fit without sideways scrolling
const m=await b.newPage({viewport:{width:390,height:844}}); m.on('pageerror',e=>errs.push('phone: '+e.message));
await m.goto(L); await m.evaluate(()=>localStorage.setItem('sr2gear2',JSON.stringify({tab:'build',kit:[]})));
for(const h of ['r2veh-mitsubishi-nightsky','guns-ingram-smartgun']){await m.goto(L+'#'+h); await m.waitForTimeout(300); const w=await m.evaluate(()=>document.documentElement.scrollWidth); ok(w<=390,h+' phone width '+w);}
console.log(JSON.stringify({ok:!fail.length&&!errs.length,fail,errs:errs.slice(0,5),...out}));
await b.close(); if(fail.length||errs.length) process.exit(1);})();
