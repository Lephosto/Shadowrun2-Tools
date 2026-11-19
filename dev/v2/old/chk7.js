const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit();}catch(e){}});`;

(async()=>{const b=await chromium.launch();const errs=[];
for(const [w,cs,f] of [[1400,'light','s_b1.png'],[390,'dark','s_b2.png']]){
const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:w,height:1000},colorScheme:cs});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');await p.waitForTimeout(300);
await p.selectOption('#b_top','ammo:Laser Sight');await p.selectOption('#b_barrel','ammo:Gas Vent II');
await p.locator('.build').scrollIntoViewIfNeeded();await p.locator('.build').screenshot({path:'gear/'+f});
console.log(w,await p.evaluate(()=>document.documentElement.scrollWidth));}
const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1400,height:1000}});await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker2.html');
for(const q of ['Smartlink II','Gel Rounds','Silencer']){await p.fill('#q',q);await p.waitForTimeout(150);const n=await p.$$eval('#list .item',e=>e.map(x=>x.dataset.id));const id=n.find(x=>/body:Smartlink II|ammo:Gel|ammo:Silencer$/.test(x));await p.click(`#list [data-id="${id}"]`);await p.waitForTimeout(150);console.log(id,(await p.textContent('.fx')).replace(/\s+/g,' '));}
console.log(errs);await b.close();})();
