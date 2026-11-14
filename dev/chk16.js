const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/sr2-builder.html');await pg.waitForTimeout(300);
const r=await pg.evaluate(()=>{const X=window.__sr2,S=X.S,VB=X.VB,bad=[];const R=a=>a[Math.floor(Math.random()*a.length)];
 S.books=Object.assign({},S.books,{r2:true}); const keys=Object.keys(X.R2OBJ); const junk=[-3,0,1,2,3,5,9,40,'x',null];
 for(let t=0;t<1200;t++){const g={key:R(keys),qty:1,vb:{type:R(['car','bike','rotor','boat','x']),mil:Math.random()<.4,facRC:Math.random()<.3,facRig:Math.random()<.3,mods:[]}};
  for(let k=0;k<1+Math.floor(Math.random()*10);k++){const d=R(VB.M); g.vb.mods.push({id:d.id,lv:R(junk),opt:Math.random()<.3?'zz':undefined});}
  S.gear=[g]; try{X.syncGear(); const v=X.vbFixG(g); const c=VB.calc(v,g.vb); if(!c.ok) bad.push([g.key,c.bad]); const base=X.GEARDB[g.key]; if(g.addons!==(c.rows.length?c.cost:g.addons)) bad.push(['addons',g.key]);
   if(t%150===0){X.render(); if(/NaN|undefined/.test(document.getElementById('vehBuild').innerHTML)) bad.push(['nan',g.key]);}}catch(e){bad.push(['err',g.key,e.message]);}}
 // UI: click Add repeatedly
 S.gear=[{key:'r2veh:Ford Americar',qty:1}]; X.render(); document.querySelector('details.vbuild').open=true; let clicks=0;
 for(let k=0;k<80;k++){const bt=[...document.querySelectorAll('input[data-vbck]')].find(x=>!x.checked&&!x.disabled); if(!bt) break; bt.click(); clicks++;}
 // raise every level dropdown to its top legal value, then untick the first installed mod
 let lvMoves=0; for(let k=0;k<30;k++){const sel=[...document.querySelectorAll('select[data-vblv]')].find(x=>x.selectedIndex<x.options.length-1); if(!sel) break; sel.selectedIndex=sel.options.length-1; sel.dispatchEvent(new Event('change',{bubbles:true})); lvMoves++;}
 const before=S.gear[0].vb.mods.length; const on=document.querySelector('input[data-vbck]:checked'); if(on) on.click(); const after=S.gear[0].vb.mods.length; if(!(after<before)) bad.push(['untick',before,after]);
 const focusOk=document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.vbck!==undefined; if(!focusOk) bad.push(['focus lost']);
 const g=S.gear[0], v=X.vbFixG(g), c=VB.calc(v,g.vb);
 const sheet=X.sheetFile?X.sheetFile():''; 
 return {nbad:bad.length,bad:bad.slice(0,6),clicks,lvMoves,ok:c.ok,cost:g.cost,addons:g.addons,cf:c.cf+'/'+c.Cmax,load:c.load+'/'+c.Lmax,sheetMods:/Mods:/.test(typeof sheet==='string'?sheet:JSON.stringify(sheet))};});
console.log(JSON.stringify(r));console.log(errs.slice(0,4));await b.close();})();
