// Locker: Rigger 2 vehicles sort by Cargo Factor and filter by CF at least / at most
const {chromium}=require('playwright');
const __SHIM=`window.__allOpen=true; window.addEventListener('load',()=>{try{st.tab='build'; ITEMS.forEach(i=>{st.open[gkey(i)]=true;}); st.kitOpen=true; renderList(); renderTag(); renderKit(); $('fbar').hidden=false;}catch(e){}});`;

(async()=>{const b=await chromium.launch();const p=await (async(o)=>{const __p=await b.newPage(o); await __p.addInitScript(__SHIM); return __p;})({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const L='file://'+process.cwd()+'/gear/sr2-gear-locker2.html';await p.goto(L);await p.evaluate(()=>localStorage.clear());await p.goto(L);await p.waitForTimeout(300);
await p.evaluate(()=>setCat('r2veh'));await p.waitForTimeout(200);
await p.selectOption('#sort','cargo');await p.waitForTimeout(150);
const cf=async()=>p.$$eval('#list .item',o=>o.map(x=>{const m=x.innerText.match(/\bCF (\d[\d,]*)/); return m?+m[1].replace(/,/g,''):null;}));
const all=await cf();
await p.fill('#f-mincf','4'); await p.press('#f-mincf','Tab'); await p.waitForTimeout(200);
await p.fill('#f-maxcf','10'); await p.press('#f-maxcf','Tab'); await p.waitForTimeout(200);
const mid=await cf();
const sorted=all.every((v,i)=>i===0||v==null||all[i-1]==null||all[i-1]>=v);
const ok=!errs.length&&sorted&&mid.length>0&&mid.length<all.length&&mid.every(v=>v>=4&&v<=10);
console.log(JSON.stringify({ok,all:all.length,mid:mid.length,first:mid.slice(0,5),errs}));await b.close(); if(!ok) process.exit(1);})();
