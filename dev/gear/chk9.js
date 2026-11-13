const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const bad=[];let renders=0;
 const cats=['all',...DATA.cats.map(c=>c[0])];
 for(const c of cats){ st.cat=c; st.f={};
  for(const s of sortsFor(c)){ st.sort=s.k; for(const dir of [1,-1]){st.dir=dir; try{renderSortFilter();renderList();renders++;}catch(e){bad.push(['sort',c,s.k,e.message]);}}
   const items=[...document.querySelectorAll('#list .item')]; if(!items.length && c!=='all') bad.push(['empty',c,s.k]);}
  st.sort='book';
  for(const f of filtersFor(c)){ let vals=[];
    if(f.type==='sel') vals=f.opts(ITEMS.filter(i=>visible(i)&&(c==='all'||i.cat===c))); else if(f.type==='num') vals=[1,5]; else if(f.type==='lv') vals=[['L'],['S','D']]; else vals=[];
    for(const v of vals){ st.f={[f.k]:v}; try{renderList();renders++; const n=document.querySelectorAll('#list .item').length; if(n===0) bad.push(['zero',c,f.k,String(v)]);}catch(e){bad.push(['filt',c,f.k,e.message]);} }
  }
  st.f={};
 }
 // render every item detail
 let det=0; for(const i of ITEMS){ st.sel=i.id; try{renderTag(); det++; const h=document.getElementById('tag').innerHTML; if(/NaN|undefined|\[object/.test(h)) bad.push(['detail',i.id,(h.match(/.{40}(NaN|undefined|\[object).{20}/)||[''])[0]]);}catch(e){bad.push(['detailErr',i.id,e.message]);} }
 return {renders,det,bad:bad.filter(b=>b[2]!=="maxprice"),nbad:bad.length};});
console.log(JSON.stringify(r,null,1));console.log('errs',errs);await b.close();})();
