// Builder checks found by building archetypes through the UI: foci count against Force Points, the Magic priority message names the letter,
// implants on the Awakened warn about Magic, remote control decks and vehicle counts show under Rigging and on the sheet
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html');
const r=await p.evaluate(()=>{const X=window.__sr2,S=X.S; const chk=()=>document.querySelector('#sec-check').innerText;
 Object.assign(S,{mode:'standard',prio:{race:'E',magic:'A',attr:'C',skills:'D',res:'D'},race:'Human',magic:'hermetic',powers:[{name:'Mana Bolt',cost:6,note:''},{name:'Heal',cost:6,note:''}],gear:[{key:'magic:Power Focus',qty:1,r:1}]}); X.render();
 const fp=chk();
 S.magic='adept'; S.prio.magic='C'; S.powers=[]; X.render(); const mp=chk();
 S.prio.magic='B'; S.gear=[{key:'head:Datajack',qty:1}]; X.render(); const ess=chk();
 S.magic='none'; S.gear=[{key:'deck:Remote Control Deck',qty:1},{key:'r2veh:GM-Nissan Doberman',qty:2}]; X.render();
 const rig=document.querySelector('#rigCard').innerText; const sheet=X.sheetFile();
 return {fp,mp,ess,rig:rig.slice(0,1200),sheetRc:/Remote Control Deck/.test(sheet.split('Rigging')[1]||''),sheetQty:/GM-Nissan Doberman ×2/.test(sheet)};});
const ok=/Force points overspent: 17 of 15 \(spells plus 5 for bonding foci/.test(r.fp)&&/needs Magic priority B \(you have C\)/.test(r.mp)&&/Essence 5\.8 lowers Magic to 5, so 5 power points/.test(r.ess)&&/Remote control deck/.test(r.rig)&&/×2/.test(r.rig)&&r.sheetRc&&r.sheetQty&&!errs.length;
console.log(JSON.stringify({ok,...r,errs}));await b.close(); if(!ok) process.exit(1);})();
