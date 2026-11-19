const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,h,name] of [[1400,1000,'d'],[900,1000,'t'],[390,844,'m']]){
 const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:w,height:h}});p.on('pageerror',e=>errs.push(name+':'+e.message));
 await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
 console.log(name,'scrollW',await p.evaluate(()=>document.documentElement.scrollWidth));
 if(name==='d'){
  for(const id of ['body:Wired Reflexes','head:Cybereyes','r2veh:Ares Guardian Drone','deck:Fuchi Cyber-4','prog2:Sleaze','armor:Heavy Military Armor','ammo:Gel-Pack Upgrade','guns:Ares Alpha Combat Gun','magic:Weapon Focus, Reach 1','head:Snake-Eyes Remote Interface Link','veh:Steel Lynx Combat Drone']){
    await p.evaluate(id=>{location.hash='#'+id.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')},id);await p.waitForTimeout(80);
    const t=await p.$eval('#tag',e=>e.innerText.replace(/\s+/g,' ').slice(0,260)); const g=await p.$$eval('#tag .lgrp h4',e=>e.map(x=>x.textContent).join(' | '));console.log('--',id,'::',t,' ## ',g);}
  await p.fill('#q','smartlink');await p.waitForTimeout(100);console.log('search',await p.$eval('#count',e=>e.textContent));
  await p.fill('#q','');await p.evaluate(()=>{location.hash='#guns-ares-predator'});await p.waitForTimeout(100);
  await p.click('#addKit');await p.click('.pill');await p.click('#addKit');console.log('kit',await p.$eval('#kit',e=>e.innerText.replace(/\s+/g,' ')));
 }
 await p.screenshot({path:`gear/s_${name}.png`});
 await p.emulateMedia({colorScheme:'dark'});await p.screenshot({path:`gear/s_${name}_dark.png`});
}
console.log('errs',errs);await b.close();})();
