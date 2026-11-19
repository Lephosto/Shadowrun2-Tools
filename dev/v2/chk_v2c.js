// Gear Locker 2: deck workshop, cyberware options and the cyber body map, ported from old checks 19, 21, 26 with the same expected numbers
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const errs=[], fail=[]; const ok=(c,m)=>{if(!c) fail.push(m);}; const out={};
const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';
const p=await b.newPage({viewport:{width:1400,height:950}}); p.on('pageerror',e=>errs.push(e.message));
await p.goto(L); await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('sr2gear2',JSON.stringify({tab:'build',kit:[]}));}); await p.reload(); await p.waitForTimeout(200);
const go=async h=>{await p.goto(L+'#'+h); await p.waitForTimeout(250);};
const tog=async(sel,want)=>{const x=await p.$(sel); if(!x){errs.push('missing '+sel); return;} if(want!=null&&(await x.evaluate(e=>e.checked))===want) return; if(await x.isDisabled()){errs.push('disabled '+sel); return;} await x.evaluate(e=>e.click()); await p.waitForTimeout(60);};
const pin=()=>p.$eval('.vw-pin',e=>e.innerText.replace(/\s+/g,' '));
const tot=()=>p.$eval('.vw-tot b',e=>e.textContent);
// 1. RC deck (old chk19): rating 4, options, levels, hitchers and memory; CSH internal module blocked; total 39,550¥ then 23,850¥ at rating 1
await go('deck-remote-control-deck');
await p.selectOption('select[data-hbfield="rating"]','4'); await p.waitForTimeout(60);
for(const id of ['rc:Remote Control ECCM','rc:Signal Amplifier','rc:Rigger Decryption Module']) await tog(`input[data-hbck][data-hbid="${id}"]`,true);
ok(await p.$('input[data-hbck][data-hbid="rc:Rigger Decryption Module, internal (CSH)"]')==null,'CSH internal module should be under Doesn’t fit');
await p.click('[data-htab="no"]'); ok(/Rigger Decryption Module, internal/.test(await p.$eval('.vw-list',e=>e.innerText)),'CSH module missing from Doesn’t fit'); await p.click('[data-htab="fits"]');
await p.selectOption('select[data-hbrt][data-hbid="rc:Signal Amplifier"]','5');
await p.selectOption('select[data-hbfield="hitch"]','2'); await p.selectOption('select[data-hbfield="mem"]','500'); await p.waitForTimeout(80);
ok(await tot()==='39,550¥','RC deck total '+await tot());
out.decMax=await p.$$eval('select[data-hbrt][data-hbid="rc:Rigger Decryption Module"] option',o=>o.map(x=>x.value).pop()); ok(out.decMax==='8','decryption max');
await p.selectOption('select[data-hbfield="rating"]','1'); await p.waitForTimeout(80); ok(await tot()==='23,850¥','RC deck at rating 1 '+await tot());
// 2. CRD: 105,000¥, .5 Essence; the plain Signal Amplifier is blocked
await go('head-remote-control-deck-cranial-crd'); await p.selectOption('select[data-hbfield="rating"]','3');
await tog('input[data-hbck][data-hbid="head:Remote Control ECCM (CRD)"]',true); await tog('input[data-hbck][data-hbid="body:Cyberlimb Signal Booster"]',true);
ok(await tot()==='105,000¥'&&/0\.5 Essence/.test(await pin()),'CRD: '+await pin());
ok(await p.$('input[data-hbck][data-hbid="rc:Signal Amplifier"]')==null,'signal amplifier should not fit a CRD');
// 3. cybereyes single + low-light: 3,000¥, .1 Essence; capacity bars shown
await go('head-cybereyes'); await tog('input[data-hbf][data-hbfield="single"]',true);
ok(await tot()==='3,000¥'&&/0\.1 Essence/.test(await pin())&&/Accessory capacity/i.test(await pin()),'eyes: '+await pin());
const ll=await p.$$eval('input[data-hbck]',x=>(x.find(e=>/Low-Light/.test(e.closest('.vw-r').innerText))||{}).dataset); if(ll) await tog(`input[data-hbck][data-hbid="${ll.hbid}"]`,true); else errs.push('no low-light option');
const want=await p.evaluate(()=>{const i=BYID[st.sel]; return Math.round(HB.calc(i.id,st.hbuild[i.id],HBENV).total).toLocaleString('en-US')+'¥';}); ok(await tot()===want&&want!=='3,000¥','eyes with low-light: '+await tot()+' vs '+want);
await p.click('[data-htab="on"]'); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===1,'eyes Added tab');
// 4. light security armor with two helmet options: package discount, 7,437¥
await go('armor-light-security-armor'); await p.click('[data-htab="fits"]');
await tog('input[data-hbck][data-hbid="armor:Helmet option: Low-Light"]',true); await tog('input[data-hbck][data-hbid="armor:Helmet option: Respirator"]',true);
ok(await tot()==='7,437¥'&&/package −1,313¥/.test(await pin()),'security armor: '+await pin());
await p.click('#addHost'); await p.waitForTimeout(60);
// 5. Fuchi Cyber-6 (old chk21): Bod 6 + Evasion 1, Attack 4 loaded, Sleaze; 395,500¥ then 395,200¥ without Sleaze
await go('deck-fuchi-cyber-6');
out.groups=await p.$$eval('details.vw-g[data-pggrp] > summary b',x=>x.map(e=>e.textContent));
ok(out.groups.join('|')==='Persona chips|Combat utilities|Defense utilities|Sensor utilities|Masking utilities|In the price table only','deck groups '+out.groups);
for(const n of ['Bod','Evasion']) await tog(`input[data-pgck][data-pgid="prog:Persona: ${n}"]`,true);
await p.selectOption('select[data-pgr][data-pgid="prog:Persona: Bod"]','6'); await p.waitForTimeout(60);
await tog('input[data-pgck][data-pgid="prog:Attack"]',true); await p.selectOption('select[data-pgr][data-pgid="prog:Attack"]','4'); await p.waitForTimeout(60);
await tog('input[data-pgld][data-pgid="prog:Attack"]',true); await tog('input[data-pgck][data-pgid="prog:Sleaze"]',true);
const pinD=await pin(); ok(/32 of 100 Mp/.test(pinD)&&/35 of 500 Mp/.test(pinD)&&/7 of 24/.test(pinD)&&/395,500¥/.test(pinD),'Cyber-6: '+pinD);
ok(await p.$eval('input[data-pgld][data-pgid="prog:Attack"]',e=>e.checked),'Attack not loaded');
await tog('input[data-pgck][data-pgid="prog:Sleaze"]',false); ok(/395,200¥/.test(await pin())&&/32 of 500 Mp/.test(await pin()),'after removing Sleaze: '+await pin());
await p.click('[data-dtab="on"]'); ok((await p.$$eval('.vw-r.vw-on',x=>x.length))===3,'On the deck count');
await p.click('[data-dtab="no"]'); await p.click('[data-dtab="fits"]');
// 6. VR2 à la carte: Black Hammer and Browse, Browse max rating 6, 122,641¥ after Browse
await go('deck-custom-cyberdeck-vr2-la-carte');
await tog('input[data-pgck][data-pgid="prog2:Black Hammer"]',true);
await tog('input[data-pgck][data-pgid="prog2:Browse"]',true); out.browseMax=await p.$$eval('select[data-pgr][data-pgid="prog2:Browse"] option',o=>o.map(x=>x.value).pop());
ok(out.browseMax==='6'&&/122,641¥/.test(await pin()),'VR2: '+out.browseMax+' '+await pin());
ok(!/NaN|undefined/.test(await p.$eval('.vw',e=>e.innerHTML)),'NaN on the deck');
// 7. Fuchi Cyber-4 with RI 1, 20 Mp extra memory, a hitcher (old chk26): keyed lines and transfer
await go('deck-fuchi-cyber-4');
await p.selectOption('#dk_ri','1'); await p.waitForTimeout(60); await p.selectOption('#dk_am','20'); await p.waitForTimeout(60); await p.selectOption('#dk_hitch','1'); await p.waitForTimeout(60);
await p.click('#addDeck'); await p.waitForTimeout(80);
// 8. cyber body: right cyberarm +2 Strength with a smartlink, left arm too, body pair; map, totals, add, send, Builder import
await go('body-cyberarm-or-cyberleg');
await p.click('[data-cbloc="ra"]'); await p.selectOption('select[data-cb="limbs.ra.part"]','full'); await p.waitForTimeout(80);
await p.selectOption('select[data-cb="limbs.ra.str"]','2'); await p.waitForTimeout(80);
const acc=await p.$$eval('select[data-cbadd="ra"] option',o=>(o.find(x=>/Smartlink/.test(x.textContent))||{}).value); if(acc){await p.selectOption('select[data-cbadd="ra"]',acc); await p.waitForTimeout(80);} else errs.push('no smartlink for the arm');
ok(await p.$eval('[data-cbloc="ra"]',e=>/Cyberarm · 1 add-on/.test(e.innerText)),'map does not show the right arm');
ok((await p.$$eval('.cbv2 article.cb-card:not([hidden])',x=>x.length))===1,'more than one location shown');
await p.click('[data-cbloc="la"]'); await p.selectOption('select[data-cb="limbs.la.part"]','full'); await p.waitForTimeout(80);
const pair=await p.$('select[data-cb="bodyArms"]'); if(pair){await pair.selectOption('1'); await p.waitForTimeout(80);} else errs.push('no Body pair option with both arms');
const cbPin=await pin(); out.cb=cbPin; ok(/Body \+2/i.test(cbPin)&&/Unarmed Power \+2/i.test(cbPin)&&!/ 0 Essence/.test(cbPin),'cyber body pin: '+cbPin);
await p.click('[data-cbloc="torso"]'); ok(await p.$eval('.cbv2 article.cb-card:not([hidden])',e=>/Cybertorso/.test(e.innerText)),'torso card');
await p.click('#addCB'); await p.waitForTimeout(80);
const kl=await p.$$eval('#kit .kl',x=>x.map(e=>e.innerText.replace(/\s+/g,' ')));
ok(kl.some(t=>/Medium|Light Security Armor/.test(t))&&kl.some(t=>/Fuchi Cyber-4/.test(t))&&kl.some(t=>/Response Increase/.test(t))&&kl.some(t=>/Cyber body \(/.test(t)),'list lines: '+kl.join(' | '));
await p.click('.kfoot [data-send="kit"].full'); await p.waitForTimeout(150);
const pay=await p.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer')));
ok(pay.items.some(x=>/Extra Active Memory/.test(x.key)&&x.qty===20)&&pay.items.some(x=>/Hitcher/.test(x.key))&&pay.items.some(x=>x.hb),'deck/armor transfer');
await p.evaluate(()=>{const d=document.getElementById('sendDlg'); if(d) d.hidden=true;}); await p.goto(L+'#body-cyberarm-or-cyberleg'); await p.waitForTimeout(250);
const cbs=await p.$('.gm-act [data-send="cbody"]'); out.cbVis=cbs?await cbs.evaluate(e=>({dis:e.disabled,w:e.getBoundingClientRect().width,tab:st.tab})):null; if(cbs) await cbs.evaluate(e=>e.click()); await p.waitForTimeout(150);
const pc=await p.evaluate(()=>JSON.parse(localStorage.getItem('sr2-transfer'))); ok(pc&&pc.cbody&&pc.cbody.limbs.ra.full&&pc.cbody.limbs.ra.str===2,'cyber body transfer');
await p.goto('file://'+process.cwd()+'/sr2-builder.html'); await p.waitForTimeout(300);
const imp=await p.evaluate(pl=>{const X=window.__sr2; X.S.gear=[]; try{X.gearImport(pl);}catch(e){return 'err '+e.message;} return JSON.stringify((X.S.cbody||{}).limbs?{ra:X.S.cbody.limbs.ra.full}:X.S.gear.map(g=>g.name));},pc);
out.cbImp=imp; ok(/true|Cyber/.test(imp),'Builder took the cyber body: '+imp);
// 9. phone widths
const m=await b.newPage({viewport:{width:390,height:844}}); m.on('pageerror',e=>errs.push('phone: '+e.message));
await m.goto(L); await m.evaluate(()=>localStorage.setItem('sr2gear2',JSON.stringify({tab:'build',kit:[]})));
for(const h of ['deck-fuchi-cyber-6','head-cybereyes','deck-remote-control-deck','body-cyberarm-or-cyberleg']){await m.goto(L+'#'+h); await m.reload(); await m.waitForTimeout(300); const w=await m.evaluate(()=>document.documentElement.scrollWidth); ok(w<=390,h+' phone width '+w);}
console.log(JSON.stringify({ok:!fail.length&&!errs.length,fail,errs:errs.slice(0,6),...out}));
await b.close(); if(fail.length||errs.length) process.exit(1);})();
