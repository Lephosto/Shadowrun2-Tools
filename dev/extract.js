const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/'+(process.env.SRC||'sr2-builder.html'));
const X_DESC=await p.evaluate(()=>window.__sr2.DESC);
const data=await p.evaluate(()=>{const X=window.__sr2;const items=[];
 const val=(f,x)=>typeof f==='function'?f(x):f;
 X.GCATS.forEach(([c,label])=>X.CAT[c].forEach(it=>{
  const o={id:c+':'+it.n,cat:c,n:it.n,src:it.src||'core',pg:it.pg||'',s:it.s||''};
  if(it.r){o.r=it.r.slice(0,3);const lo=it.r[0],hi=it.r[1];
    if(hi-lo<=20){o.costs={};o.ess={};for(let x=lo;x<=hi;x++){o.costs[x]=val(it.c,x);if(it.e!=null)o.ess[x]=val(it.e,x);} if(it.e==null) delete o.ess;}
    else {o.mult=val(it.c,1000)/1000; if(it.e!=null) o.e=val(it.e,lo);}
    if(it.sz){o.size={};for(let x=lo;x<=Math.min(hi,12);x++)o.size[x]=it.sz(x);}
  } else {o.cost=val(it.c,0); if(it.e!=null)o.e=val(it.e,0);}
  if(it.vr2deck) o.vr2deck=true;
  if(it.bi!=null){ if(it.r&&o.costs){o.bis={};for(const x in o.costs)o.bis[x]=val(it.bi,+x);} else o.bi=val(it.bi,0);} if(it.neural) o.neural=1; if((it.cat==='head'||it.cat==='body')&&it.e!=null) o.grade=1;
  ['mpcp','eye','ear','m1'].forEach(k=>{if(it[k]!=null)o[k]=it[k];});
  if(it.r2) o.r2=it.r2;
  const k=o.id;
  if(X.WSTAT[k]){const w=X.WSTAT[k];o.w=w;o.range=X.RANGES[w[0]]||null;o.skill=X.RT_SKILL[w[0]]||null;}
  if(X.MSTAT[k]) o.m=X.MSTAT[k];
  if(X.ASTAT[k]) o.a=X.ASTAT[k];
  if(X.VSTAT[k]&&!it.r2) o.v=X.VSTAT[k];
  if(X.DSTAT[k]) o.d=X.DSTAT[k];
  items.push(o);}));
 Object.entries(X.SPELLS).forEach(([c,l])=>l.forEach(([n,m,lv,ty,src,pg,dur])=>items.push({id:'spell:'+n,cat:'spell',n,src:src||'core',pg:pg||'p. 150–160',s:c+' spell',sp:{c,m,lv,ty,dur:dur||''}})));
 const corePow={astral:[2,'See into astral space'],combatSense:[null,'Level 1–3: 2/3/4 points'],improvedAbility:[null,'Extra skill dice; .25 to 1 per die by skill'],improvedAttr:[null,'.5/1/1.5 per point by how far past the racial maximum'],senses:[.25,'Per improvement'],incReaction:[null,'.5/1/2 per point'],incReflexes:[null,'+1D6: 1, +2D6: 4 (3 with errata), +3D6: 6'],killing:[null,'(Str)L .5, M 1, S 2, D 4'],pain:[.5,'Per level']};
 Object.entries(X.POWERS).forEach(([k,v])=>{if(k==='custom')return; items.push({id:'power:'+v.label,cat:'power',n:v.label,src:'core',pg:v.pg,s:corePow[k][1],pw:{fixed:k==='astral'?2:null,per:['senses','pain'].includes(k)?corePow[k][0]:null}});});
 Object.entries(X.XPOWERS).forEach(([k,v])=>items.push({id:'power:'+v.label,cat:'power',n:v.label,src:v.src,pg:v.pg,s:v.desc,pw:{fixed:v.fixed??null,per:v.per??null,unit:v.unit||'level',max:v.max||null}}));
 X.EDGES.forEach(e=>items.push({id:'ef:'+e[0],cat:'ef',n:e[0],src:'co',pg:X.EF_DESC&&X.EF_DESC[e[0]]?'SRC p. '+X.EF_DESC[e[0]][1]:(e[6]||'SRC p. 35'),efd:X.EF_DESC&&X.EF_DESC[e[0]]?X.EF_DESC[e[0]][0]:'',s:(e[4]?e[4]+'. ':'')+'Edge · '+e[1],ef:{min:e[2],max:e[3],g:e[1],edge:1,steps:e[5]||null}}));
 X.FLAWS.forEach(e=>items.push({id:'ef:'+e[0],cat:'ef',n:e[0],src:'co',pg:X.EF_DESC&&X.EF_DESC[e[0]]?'SRC p. '+X.EF_DESC[e[0]][1]:(e[6]||'SRC p. 35'),efd:X.EF_DESC&&X.EF_DESC[e[0]]?X.EF_DESC[e[0]][0]:'',s:(e[4]?e[4]+'. ':'')+'Flaw · '+e[1],ef:{min:e[2],max:e[3],g:e[1],edge:0,steps:e[5]||null}}));
 Object.entries(X.RACES).filter(([k,v])=>v.base).forEach(([k,v])=>items.push({id:'meta:'+k,cat:'meta',n:k.replace(/ \(.*\)/,''),src:'co',pg:'SRC '+(v.traits.match(/p\. \d+/)||['p. 37'])[0],s:v.traits.replace(/ SRC p\. \d+\.$/,''),mt:{base:v.base,mod:v.mod,max:v.max||null,noDerm:!!v.noDerm,extra:v.extra||[],baseMod:X.RACES[v.base].mod}}));
 const cats=X.GCATS.filter(([c])=>X.CAT[c].length); cats.push(['spell','Spells'],['power','Adept powers']); cats.push(['ef','Edges and Flaws'],['meta','Metavariants']);
 return {cats,items};});
data.items.forEach(o=>{const d=(X_DESC||{})[o.id]; if(d&&!o.efd){o.desc=d[0];o.dpg=/^p\./.test(d[1])?d[1]:d[1];}});
fs.writeFileSync('gear_data.json',JSON.stringify(data));
console.log(data.items.length, JSON.stringify(data.items.find(i=>i.id==='guns:Ares Predator')), JSON.stringify(data.items.find(i=>i.id==='deck:Fuchi Cyber-4')),JSON.stringify(data.items.find(i=>i.id==='melee:Katana')),JSON.stringify(data.items.find(i=>i.id==='head:Cybereyes')),JSON.stringify(data.items.find(i=>i.id==='body:Wired Reflexes')),JSON.stringify(data.items.find(i=>i.id==='veh:Ford Americar')),JSON.stringify(data.items.find(i=>i.id==='prog:Attack')));
await b.close();})();
