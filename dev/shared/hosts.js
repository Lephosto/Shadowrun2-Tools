// ---------- Gear with options: cybereyes, cyberears, Kelmar security armor and helmet ----------
// Shared by both tools. Each page defines HBENV: item(key), all() (every gear item), bookOn(src).
// State: {single:bool (eyes only), ct:bool (Cybertechnology eye limits), helmet:bool (armor only), opts:[{id, r}]}.
const HB=(()=>{
const r2=x=>Math.round(x*1000)/1000;
const ess=(it,r)=>it?(it.ess?(+it.ess[r]||0):(+it.e||0)):0;
const cost=(it,r)=>it?(it.costs?(+it.costs[r]||0):(+it.cost||0)):0;
const EYE_WEAPON=new Set(['head:Eye Dart','head:Eye Gun']), TOOL_LASER='head:Eye Tool Laser', CAM='head:Eye Camera';
const MAGS=[['head:Optical Magnification 1','head:Optical Magnification 2','head:Optical Magnification 3'],['head:Electronic Magnification 1','head:Electronic Magnification 2','head:Electronic Magnification 3']];
const SEC_ARMOR=['armor:Light Security Armor','armor:Medium Security Armor','armor:Heavy Security Armor'];
const HELMET_ONLY=new Set(['armor:Helmet option: Magnification ×10','armor:Helmet option: Low-Light','armor:Helmet option: Thermographic','armor:Helmet option: Ultrasound','armor:Helmet option: Smartgun Display','armor:Helmet option: Transceiver','armor:Helmet option: Heads-Up Data Display (100 Mp)','armor:Helmet option: Respirator','armor:Helmet option: Chemical Seal']);
const SEC_OPTS=[...HELMET_ONLY,'armor:Wrist Transceiver','armor:Security Tracking Signal','armor:Security Signal Locator'];
const NEEDS={'armor:Helmet option: Ultrasound':'Works with an Ultrasound Sight on the weapon (SSC p. 71).','armor:Helmet option: Smartgun Display':'Needs a smartgun connection: a smart weapon and a link (SSC p. 71).','head:BrightLight Addition':''};
function kind(key){ if(key==='head:Cybereyes') return 'eyes'; if(key==='head:Cyberears') return 'ears'; if(SEC_ARMOR.includes(key)) return 'secarmor'; if(key==='armor:Security Helmet') return 'helmet'; return null;}
function isHost(key){return !!kind(key);}
function defaults(key){const k=kind(key); return k==='secarmor'?{helmet:true,opts:[]}:k==='eyes'?{single:false,ct:true,opts:[]}:{opts:[]};}
// candidate options for a host
function pool(key,E){const k=kind(key);
  if(k==='eyes') return E.all().filter(i=>i.eye&&E.bookOn(i.src)).map(i=>i.id);
  if(k==='ears') return E.all().filter(i=>i.ear&&E.bookOn(i.src)).map(i=>i.id);
  if(k==='secarmor') return SEC_OPTS.filter(id=>E.item(id)&&E.bookOn(E.item(id).src));
  if(k==='helmet') return [...HELMET_ONLY].filter(id=>E.item(id)&&E.bookOn(E.item(id).src));
  return [];}
function rFor(it,r){if(!it||!it.r) return undefined; const lo=it.r[0],hi=it.r[1]; let v=Math.floor(+r||lo); return Math.min(hi,Math.max(lo,v));}
// Full evaluation. Returns rows, totals and every rule broken (bad).
function calc(key,st,E){const k=kind(key), host=E.item(key), bad=[], notes=[]; const S=Object.assign(defaults(key),st||{}); const ids=new Set();
  const rows=(S.opts||[]).map(o=>{const it=E.item(o.id); const r=rFor(it,o.r); if(!it){bad.push('Unknown option'); return null;} if(ids.has(o.id)) bad.push(it.n+' is listed twice'); ids.add(o.id);
    if(!pool(key,E).includes(o.id)) bad.push(it.n+' doesn’t fit a '+host.n);
    return {id:o.id,it,r,n:it.n.replace(/^Helmet option: /,'')+(it.r?' '+r:''),cost:cost(it,r),ess:ess(it,r),pg:it.pg||'',d:it.desc||it.s||''};}).filter(Boolean);
  let hostCost=cost(host), hostEss=ess(host), free=0, cap=null, accEss=0, disc=0, sub=0, total=0, essTotal=0;
  if(k==='eyes'){ if(S.single){hostCost=Math.round(hostCost*.6); hostEss=.1;} free=S.single?.25:.5; cap=S.ct?(S.single?.6:1.2):null;
    accEss=r2(rows.reduce((a,x)=>a+x.ess,0)); if(cap!=null&&accEss>cap+1e-9) bad.push(`Accessories total ${accEss} Essence; ${S.single?'a single eye':'a pair'} holds ${cap} (CT p. 45)`);
    const eyes=S.single?1:2, wpn=rows.filter(x=>EYE_WEAPON.has(x.id)).length, tool=rows.some(x=>x.id===TOOL_LASER)?1:0, cam=rows.some(x=>x.id===CAM)?1:0;
    if(S.ct&&wpn+tool+cam>eyes) bad.push(`Only one weapon, tool laser or camera per eye: ${eyes===1?'this eye':'two eyes'} can’t hold ${wpn+tool+cam} (CT p. 45)`);
    MAGS.forEach(g=>{if(rows.filter(x=>g.includes(x.id)).length>1) bad.push('Only one level of '+(g[0].includes('Optical')?'optical':'electronic')+' magnification');});
    if(rows.some(x=>x.id==='head:BrightLight Addition')&&!rows.some(x=>x.id==='head:Eye Light System')) bad.push('BrightLight needs the Eye Light System (CT p. 21)');
    essTotal=r2(hostEss+Math.max(0,accEss-free));
  } else if(k==='ears'){ accEss=r2(rows.reduce((a,x)=>a+x.ess,0)); free=rows.filter(x=>x.ess<=.2).reduce((m,x)=>Math.max(m,x.ess),0); essTotal=r2(hostEss+accEss-free);
  } else if(k==='secarmor'||k==='helmet'){ const helmet=k==='helmet'||!!S.helmet; const hel=E.item('armor:Security Helmet');
    rows.forEach(x=>{if(HELMET_ONLY.has(x.id)&&!helmet) bad.push(x.it.n+' needs the security helmet');});
    if(k==='secarmor'&&helmet) rows.unshift({id:'armor:Security Helmet',it:hel,n:'Security Helmet',cost:cost(hel),ess:0,pg:hel.pg,d:hel.desc||'',fixed:true});
    const nopt=rows.filter(x=>!x.fixed).length; sub=hostCost+rows.reduce((a,x)=>a+x.cost,0);
    if(k==='secarmor'){const pct=nopt>=4?30:nopt>=2?15:0; disc=Math.round(sub*pct/100); if(pct) notes.push(`${pct}% package discount for ${nopt} options (SSC p. 70)`);}
  }
  rows.forEach(x=>{if(NEEDS[x.id]) notes.push(NEEDS[x.id]);});
  if(!sub) sub=hostCost+rows.filter(x=>!x.fixed).reduce((a,x)=>a+x.cost,0);
  total=sub-disc; if(k!=='eyes'&&k!=='ears') essTotal=0;
  return {k,host,S,rows,hostCost,hostEss,free,cap,accEss,ess:essTotal,sub,disc,total,bad,notes:notes.filter(Boolean),ok:!bad.length};}
// options that can be added now (lowest rating), and those that can't with the reason
function addable(key,st,E){const S=Object.assign(defaults(key),st||{}); const yes=[],no=[]; const have=new Set((S.opts||[]).map(o=>o.id));
  pool(key,E).forEach(id=>{if(have.has(id)) return; const it=E.item(id); const r=it.r?it.r[0]:undefined; const t={...S,opts:(S.opts||[]).concat([{id,r}])}; const c=calc(key,t,E);
    if(c.ok) yes.push({id,it,r,row:c.rows.find(x=>x.id===id)}); else no.push({id,it,why:c.bad[c.bad.length-1]});}); return {yes,no};}
function levels(key,st,E,ix){const S=Object.assign(defaults(key),st||{}); const o=S.opts[ix], it=o&&E.item(o.id); if(!it||!it.r) return []; const out=[];
  for(let r=it.r[0];r<=it.r[1];r++){const t={...S,opts:S.opts.map((q,j)=>j===ix?{...q,r}:q)}; if(calc(key,t,E).ok) out.push(r);} return out;}
// keep only what is legal, in the order chosen
function clamp(key,st,E){const S=Object.assign(defaults(key),st||{}); const out={...S,opts:[]}, dropped=[];
  (S.opts||[]).forEach(o=>{const it=E.item(o.id); if(!it||out.opts.some(q=>q.id===o.id)) return; const r=rFor(it,o.r); out.opts.push({id:o.id,r}); if(!calc(key,out,E).ok){out.opts.pop(); dropped.push(it.n);}});
  return {st:out,dropped};}
const PAGES={eyes:'core p. 247, 260; CT p. 45',ears:'core p. 247, 260',secarmor:'SSC p. 70–71',helmet:'SSC p. 70–71'};
const INTRO={eyes:'Cybereye accessories: the first .5 Essence of them is free (.25 for a single eye). With Cybertechnology limits on, a pair holds 1.2 Essence of accessories (a single eye .6) and each eye one weapon, tool laser or camera.',
  ears:'Cyberear accessories: one feature of .2 Essence or less is free.',
  secarmor:'Kelmar security armor and its options. Two or more options take 15% off the package, four or more 30%. Vision, comms and environmental options for the head need the helmet.',
  helmet:'The security helmet and its options.'};
return {kind,isHost,defaults,pool,calc,addable,levels,clamp,PAGES,INTRO,SEC_ARMOR};
})();
