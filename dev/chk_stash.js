// Builder: stash board (drag and Move menu), places, vehicles as places; stashed gear leaves weapons, armor, ammo and the sheet's carried list
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html');
await p.evaluate(()=>{const X=window.__sr2,S=X.S; Object.assign(S,{name:'Test',handle:'Zeus',magic:'adept',powers:[{type:'pain',n:1}],skills:[{name:'Firearms',rating:6,narrow:'none'}]});
 S.gear=[{key:'guns:Ares Viper Slivergun',qty:1},{key:'ammo:Spare Clip',qty:5},{key:'ammo:Gel Rounds (10)',qty:6},
  {key:'guns:Mossberg CMDT',qty:1,build:{top:'ammo:Ultrasound Sight'}},{key:'armor:Large Riot Shield',qty:1},{key:'armor:Armor Jacket',qty:1},{key:'boom:Smoke Grenade',qty:10},
  {key:'r2veh:GMC Bulldog Step-Van (Standard)',qty:1},{key:'r2veh:GM-Nissan Doberman',qty:1},{key:'head:Datajack',qty:1}]; X.render();});
const out={};
out.cols0=await p.$$eval('#stBoard .stcol .sth b',x=>x.map(e=>e.textContent));
out.chips0=await p.$$eval('#stBoard .stcol.carry .stchip span',x=>x.map(e=>e.textContent));
// untagged clips count for the only clip-fed gun? two clip guns here (Viper, Mossberg) -> no
out.vClips0=await p.evaluate(()=>{const S=window.__sr2.S; const g=S.gear[0]; return S.ammoT[g.gid].clips.length;});
const idx=async k=>p.evaluate(k=>window.__sr2.S.gear.findIndex(g=>g.key===k),k);
const mv=async(k,val)=>{const i=await idx(k); await p.selectOption(`select[data-stmove="${i}"]`,val);};
await mv('guns:Mossberg CMDT','a|Stash');           // Mossberg to the stash: now Viper is the only clip gun -> 5 untagged clips are its
out.vClips1=await p.evaluate(()=>{const S=window.__sr2.S; const g=S.gear.find(x=>x.key==='guns:Ares Viper Slivergun'); return S.ammoT[g.gid].clips.length;});
out.weap=await p.$$eval('#weapBody tr td:first-child b',x=>x.map(e=>e.textContent));
await mv('boom:Smoke Grenade','1|Stash');            // split one grenade off
out.smoke=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.key==='boom:Smoke Grenade').map(g=>[g.qty,g.at||'']));
await mv('boom:Smoke Grenade','1|Stash');            // second one merges into the stashed line
out.smoke2=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.key==='boom:Smoke Grenade').map(g=>[g.qty,g.at||'']));
// drag the drone into the van
await mv('r2veh:GM-Nissan Doberman','a|GMC Bulldog Step-Van (Standard)');
out.drone=await p.evaluate(()=>window.__sr2.S.gear.find(g=>g.key==='r2veh:GM-Nissan Doberman').at);
// shield stashed: armor drops from +2
const a0=await p.evaluate(()=>window.__sr2.armorTotals().b); await mv('armor:Large Riot Shield','a|Stash'); const a1=await p.evaluate(()=>window.__sr2.armorTotals().b); out.armor=[a0,a1];
// drag and drop: the riot shield back onto the carried column, then the jacket to the stash and back
{const si=await idx('armor:Large Riot Shield'); await p.locator(`[data-stdrag="${si}"]`).scrollIntoViewIfNeeded(); await p.dragAndDrop(`[data-stdrag="${si}"]`,'.stcol.carry',{sourcePosition:{x:12,y:10},targetPosition:{x:40,y:20}}); out.dragBack=await p.evaluate(()=>!window.__sr2.S.gear.find(g=>g.key==='armor:Large Riot Shield').at); await mv('armor:Large Riot Shield','a|Stash');}
// datajack can't be stashed
out.noImplant=await p.evaluate(()=>!document.querySelector('#stBoard').innerText.includes('Datajack'));
// new place, move, remove empty place
await p.fill('#stNew','Safehouse'); await p.click('#stAdd');
await mv('armor:Armor Jacket','a|Safehouse'); out.jacket=await p.evaluate(()=>window.__sr2.S.gear.find(g=>g.key==='armor:Armor Jacket').at);
await mv('armor:Armor Jacket','a|');
await p.click('button[data-strm="Safehouse"]'); out.places=await p.evaluate(()=>window.__sr2.S.places);
// sheet
const sheet=await p.evaluate(()=>window.__sr2.sheetFile());
out.sheetStash=/Stashed/.test(sheet)&&/Mossberg CMDT/.test(sheet.split('Stashed')[1]||''); out.sheetNoMossCard=!/<article class="wcard"><header><b>Mossberg/.test(sheet);
// game night quick lists
await p.click('#sesBtn'); await p.waitForTimeout(150);
out.quick=await p.evaluate(()=>({sk:document.querySelector('#skillQuick').offsetParent!==null&&/Firearms/.test(document.querySelector('#skillQuick').innerText),tbl:[...document.querySelectorAll('#sec-skills table')].every(t=>t.offsetParent===null),pw:/Pain Resistance/.test(document.querySelector('#powerQuick').innerText)}));
await p.click('#sesBtn');
await p.reload(); out.persist=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.at).map(g=>g.key.split(':')[1]+'@'+g.at));
const ok=out.cols0.length===4&&out.vClips0===0&&out.vClips1===5&&!out.weap.includes('Mossberg CMDT')&&JSON.stringify(out.smoke)==='[[9,""],[1,"Stash"]]'&&JSON.stringify(out.smoke2)==='[[8,""],[2,"Stash"]]'&&out.drone==='GMC Bulldog Step-Van (Standard)'&&out.armor[0]===out.armor[1]+2&&out.noImplant&&out.dragBack&&out.jacket==='Safehouse'&&JSON.stringify(out.places)==='["Stash"]'&&out.sheetStash&&out.sheetNoMossCard&&out.quick.sk&&out.quick.tbl&&out.quick.pw&&out.persist.length===4&&!errs.length;
console.log(JSON.stringify({ok,...out,errs}));await b.close(); if(!ok) process.exit(1);})();
