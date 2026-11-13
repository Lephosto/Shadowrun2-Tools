const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/sr2-builder.html');
await p.click('#btnNew');
const txt=async id=>p.$eval(id,e=>e.innerText.replace(/\t/g,' | '));
const cats=async()=>p.$$eval('#gCat option',o=>o.map(x=>x.value).join(','));
console.log('BOOKS',await txt('#bookRow')); console.log('CATS0',await cats());
for(const k of ['r2','vr2','fof']) await p.check(`[data-book="${k}"]`);
console.log('CATS1',await cats());
const count=await p.evaluate(()=>{const {GCATS,CAT,itemVisible}=window.__sr2;return Object.fromEntries(GCATS.map(([k])=>[k,CAT[k].filter(itemVisible).length]))});console.log('COUNTS',JSON.stringify(count));
// deck
await p.selectOption('#gCat','deck'); console.log('DECKITEMS',await p.$$eval('#gItem option',o=>o.map(x=>x.value)));
await p.selectOption('#gItem','deck:Custom cyberdeck (VR2 à la carte)'); await p.click('#gAdd');
// SuzyQ config
await p.evaluate(()=>{const X=window.__sr2;X.S.vr2deck=Object.assign(X.vr2Default(),{mpcp:8,bod:6,eva:6,mask:6,sens:6,ri:2,io:480,hard:4,iccm:true,am:1000,sm:1500,asist:'hot',pkg:false});X.render();});
const v=await p.evaluate(()=>{const c=window.__sr2.vr2DeckCost();return {sub:c.sub,lines:c.lines.map(l=>l.k+'='+l.v)}});console.log('SUZYQ',JSON.stringify(v));
await p.evaluate(()=>{const X=window.__sr2;X.S.vr2deck.pkg=true;X.render();}); console.log('SUZYQ pkg',await p.evaluate(()=>window.__sr2.vr2DeckCost().total));
console.log('DECKSTATS',await txt('#deckStats'));
// programs archetype 2
const arch=[['Analyze',4],['Armor',4],['Attack-S',6],['Browse',4],['Commlink',4],['Deception',6],['Decrypt',5],['Read/Write',4],['Relocate',4],['Scanner',4],['Sleaze',6],['Spoof',4]];
console.log('ARCH2',await p.evaluate(a=>a.reduce((t,[n,r])=>t+window.__sr2.GEARDB['prog2:'+n].c(r),0),arch), await p.evaluate(a=>a.reduce((t,[n,r])=>t+window.__sr2.GEARDB['prog2:'+n].sz(r),0),arch));
const arch1=[['Analyze',4],['Armor',6],['Attack-M',6],['Attack-D',6],['Browse',6],['Camo',4],['Commlink',5],['Defuse',4],['Deception',6],['Decrypt',6],['Medic',6],['Read/Write',5],['Relocate',5],['Scanner',4],['Shield',4],['Sleaze',6],['Spoof',4]];
console.log('ARCH1',await p.evaluate(a=>a.reduce((t,[n,r])=>t+window.__sr2.GEARDB['prog2:'+n].c(r),0),arch1));
// add sleaze and check DF, issues
await p.selectOption('#gCat','prog2'); await p.selectOption('#gItem','prog2:Sleaze'); await p.fill('#gRate','8'); await p.click('#gAdd');
console.log('DECKSTATS2',await txt('#deckStats')); console.log('ISS',await txt('#issues')); console.log('SUM',await txt('#sumStats'));
// rigger penalty
await p.selectOption('#gCat','body'); await p.selectOption('#gItem','body:Vehicle Control Rig'); await p.fill('#gRate','2'); await p.click('#gAdd');
await p.selectOption('#gCat','r2veh'); await p.selectOption('#gItem',{index:3}); await p.click('#gAdd');
console.log('RIG',await txt('#rigStats')); console.log('VEH',await txt('#vehBody').catch(e=>'x'));
console.log('DECKSTATS3',await txt('#deckStats'));
// FoF weapons + armor
await p.selectOption('#gCat','guns'); await p.selectOption('#gItem','guns:Barret Model 121'); await p.click('#gAdd');
await p.selectOption('#gCat','armor'); await p.selectOption('#gItem','armor:Heavy Military Armor'); await p.click('#gAdd');
await p.check('#optRecoil');
console.log('WEAP',await txt('#weapBody')); console.log('ARM',await txt('#armorTotal'));
// cool deck
await p.selectOption('[data-v2="asist"]','cool'); console.log('COOL',await p.evaluate(()=>window.__sr2.vr2DeckCost().lines.find(l=>/ASIST/.test(l.k))));
await p.screenshot({path:'v2.png',fullPage:true});
// switch off books
await p.uncheck('[data-book="vr2"]'); console.log('ISS2',await txt('#issues')); console.log('CATS2',await cats());
// sheet
const sheet=await p.evaluate(()=>window.__sr2.sheetFile()); console.log('SHEETLEN',sheet.length, /Hacking Pool/.test(sheet));
await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(200);
console.log('mobile scrollWidth',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errs',errs);await b.close();})();
