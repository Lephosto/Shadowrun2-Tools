// Vehicle build-out wording (Mitsubishi Nightsky): capacity reasons say what's needed, what's left and what makes room;
// factory rows don't say "not possible"; engine customization levels say what they add; masking shows beside Signature
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';await p.goto(L);await p.evaluate(()=>localStorage.clear());await p.goto(L+'#r2veh-mitsubishi-nightsky');await p.waitForSelector('.vcheck');await p.waitForTimeout(400);
const row=id=>p.$eval(`input[data-vbid="${id}"]`,e=>e.closest('li').innerText.replace(/\s+/g,' '));
const tick=async(id,lv)=>{await p.click('text=Open all'); await p.click(`input[data-vbid="${id}"]`); await p.waitForTimeout(200); if(lv){await p.selectOption(`li:has(input[data-vbid="${id}"]) select[data-vblv]`,String(lv)); await p.waitForTimeout(150);}};
await p.click('text=Open all');
const apps=await row('apps');
for(const id of ['datajack','rigger']) await tick(id); await tick('eccm',2);
const nitro=await row('nitro');
const eng=await row('eng_ld');
await tick('eng_ld',1); await tick('mask',1);
const sig=await p.$$eval('.vtiles .vt',t=>t.map(x=>x.innerText.replace(/\s+/g,' ')).find(x=>/^Signature/i.test(x))||'');
const ok=!errs.length&&!/Not possible/.test(apps)&&/Factory-fitted/.test(apps)&&/Not enough Load: needs 15 kg, 10 kg left of 60\. Engine customization: Load adds 200 kg a level/.test(nitro)&&/\+200 kg Load a level/.test(eng)&&/masked/.test(sig);
console.log(JSON.stringify({ok,apps:apps.slice(0,90),nitro:nitro.slice(0,160),eng:eng.slice(0,90),sig,errs}));await b.close(); if(!ok) process.exit(1);})();
