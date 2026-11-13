const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await p.waitForFunction(()=>typeof ITEMS!=='undefined');
const r=await p.evaluate(()=>{const bad=[];let n=0;
 ITEMS.filter(isDeck).forEach(i=>{st.dbuild={};
  const B=dstate(i);
  // max out everything the controls allow, plus every program at max allowed rating
  for(let pass=0;pass<2;pass++){ if(!i.vr2deck){B.ri=3;B.am=9999;B.hitch=99;['Bod','Evasion','Masking','Sensors'].forEach(k=>B.per[k]=12);} else {Object.assign(B.v,{mpcp:12,bod:12,eva:12,mask:12,sens:12,ri:3,io:9999,hitch:99,asist:'cool',dni:true});}
   progList(!!i.vr2deck).slice(0,6).forEach(pp=>B.utils.push({id:pp.id,r:12,loaded:true}));
   try{const C=deckCalc(i);n++; st.sel=i.id; renderTag(); const h=document.getElementById('tag').innerHTML; if(/NaN|undefined/.test(h)) bad.push(['nan',i.n]);
    const tot=Object.values(C.per).reduce((a,b)=>a+(+b||0),0); if(tot>3*C.M) bad.push(['persona',i.n,tot]); if(C.lv>(i.vr2deck?5:Math.floor(C.M/4))) bad.push(['ri',i.n,C.lv]);
    if(i.vr2deck&&(C.B.v.dni)) bad.push(['dni with cool',i.n]); if(i.vr2deck&&C.U.some(x=>x.u.r>C.M)) bad.push(['util>M',i.n]);
    if(!i.vr2deck&&C.am>C.M*50) bad.push(['am',i.n,C.am]); if((i.vr2deck?C.B.v.hitch:C.B.hitch)>C.M) bad.push(['hitch',i.n]);
   }catch(e){bad.push(['err',i.n,e.message]);}}
 });
 // spot: Allegiance Alpha (MPCP 3) offers no Response Increase
 st.dbuild={}; st.sel='deck:Allegiance Alpha'; renderTag(); const noRI=!document.getElementById('dk_ri');
 st.sel='deck:Fuchi Cyber-6'; renderTag(); const riOpts=[...document.querySelectorAll('#dk_ri option')].map(o=>o.value).join(',');
 return {n,bad,noRI,riOpts};});
console.log(JSON.stringify(r));console.log(errs);await b.close();})();
