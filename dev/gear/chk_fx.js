const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:1000}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error') errs.push(m.text());});
await p.goto('file://'+process.cwd()+'/SR2_Gear_Locker_2.html#'+'guns-mossberg-cmdt'); await p.waitForTimeout(600);
const out={};
out.btn=await p.textContent('#fxBtn');
out.headOff=await p.textContent('#tag .price');
out.boxOff=await p.textContent('#tag .fxbox');
await p.click('#fxBtn'); await p.waitForTimeout(100);
await p.check('#fxOn'); await p.waitForTimeout(200);
out.headOn=await p.textContent('#tag .price');
out.boxOn=(await p.textContent('#tag .fxbox')).replace(/\s+/g,' ');
out.list=(await p.$$eval('#list .item .pr',e=>e.slice(0,3).map(x=>x.textContent)));
// negotiation +2 -> -10%
await p.click('[data-fxs="neg"][data-d="1"]'); await p.click('[data-fxs="neg"][data-d="1"]'); await p.waitForTimeout(100);
out.headNeg=await p.textContent('#tag .price');
// add to list
const add=await p.$('#addKit'); out.hasAdd=!!add;
await p.goto('file://'+process.cwd()+'/SR2_Gear_Locker_2.html#'+'armor-medium-security-armor'); await p.waitForTimeout(500);
out.armor=(await p.textContent('#tag .fxbox')).replace(/\s+/g,' ');
await p.goto('file://'+process.cwd()+'/SR2_Gear_Locker_2.html#boom-smoke-grenade'); await p.waitForTimeout(400); out.smoke=(await p.textContent('#tag .fxbox')).replace(/\s+/g,' '); out.hasAdd2=!!(await p.$('#addKit')); if(out.hasAdd2){await p.click('#addKit'); await p.waitForTimeout(200);} await p.goto('file://'+process.cwd()+'/SR2_Gear_Locker_2.html#ammo-ultrasound-sight'); await p.waitForTimeout(400); if(await p.$('#addKit')){await p.click('#addKit'); await p.waitForTimeout(200);}
out.kit=(await p.textContent('#kit')).replace(/\s+/g,' ').slice(0,700);
// send code
const btn=await p.$('[data-send="kit"]'); if(btn){await btn.click(); await p.waitForTimeout(200); const code=await p.inputValue('#sendCode'); const j=JSON.parse(Buffer.from(code.slice(8),'base64').toString('utf8')); out.street=j.street; out.total=j.total; out.dlg=(await p.textContent('#sendDlg')).replace(/\s+/g,' ').slice(0,300);}
console.log(JSON.stringify(out,null,1)); console.log('ERRS',errs);
await p.screenshot({path:'gear/fx_shot.png'});
await b.close();})();
