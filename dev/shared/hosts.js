// ---------- Gear with options: cybereyes, cyberears, Kelmar security armor and helmet, remote control decks ----------
// Shared by both tools. Each page defines HBENV: item(key), all() (every gear item), bookOn(src).
// State: {single:bool (eyes only), ct:bool (Cybertechnology eye limits), helmet:bool (armor only), rating, hitch, screens, mem (RC decks), opts:[{id, r}]}.
const HB=(()=>{
const r2=x=>Math.round(x*1000)/1000;
const ess=(it,r)=>it?(it.ess?(+it.ess[r]||0):(+it.e||0)):0;
const cost=(it,r)=>it?(it.costs?(+it.costs[r]||0):(+it.cost||0)):0;
const EYE_WEAPON=new Set(['head:Eye Dart','head:Eye Gun']), TOOL_LASER='head:Eye Tool Laser', CAM='head:Eye Camera';
const MAGS=[['head:Optical Magnification 1','head:Optical Magnification 2','head:Optical Magnification 3'],['head:Electronic Magnification 1','head:Electronic Magnification 2','head:Electronic Magnification 3']];
const SEC_ARMOR=['armor:Light Security Armor','armor:Medium Security Armor','armor:Heavy Security Armor'];
const HELMET_ONLY=new Set(['armor:Helmet option: Magnification ×10','armor:Helmet option: Low-Light','armor:Helmet option: Thermographic','armor:Helmet option: Ultrasound','armor:Helmet option: Smartgun Display','armor:Helmet option: Transceiver','armor:Helmet option: Heads-Up Data Display (100 Mp)','armor:Helmet option: Respirator','armor:Helmet option: Chemical Seal']);
const SEC_OPTS=[...HELMET_ONLY,'armor:Wrist Transceiver','armor:Security Tracking Signal','armor:Security Signal Locator'];
// Remote control decks (R2 p. 95–99). External deck: Flux 2; cranial deck (CRD): Flux 0 and Essence.
const RC_EXT='deck:Remote Control Deck', RC_CRD='head:Remote Control Deck, cranial (CRD)';
const RC_OPTS=['rc:Remote Control Encryption Module','rc:Rigger Decryption Module','rc:Rigger Decryption Module, internal (CSH)','rc:Remote Control ECCM','rc:Rigger Protocol Emulation Module','rc:Rigger Protocol Emulation Module, internal (CSH)','rc:Signal Amplifier','rc:BattleTac IVIS Master Unit (RC deck)','rc:BattleTac FDDM Master Unit (RC deck)','rc:Intercom Speaker'];
const CRD_OPTS=['head:Remote Control Encryption Module (CRD)','head:Rigger Decryption Module (CRD)','head:Remote Control ECCM (CRD)','head:Rigger Protocol Emulation Module (CRD)','head:BattleTac IVIS Master Unit (CRD)','head:BattleTac FDDM Master Unit (CRD)','rc:Signal Amplifier','body:Cyberlimb Signal Booster'];
// one module per job (R2 and CSH versions of the same module don't stack)
const RC_ONE=[['rc:Rigger Decryption Module','rc:Rigger Decryption Module, internal (CSH)'],['rc:Rigger Protocol Emulation Module','rc:Rigger Protocol Emulation Module, internal (CSH)'],['rc:Signal Amplifier','body:Cyberlimb Signal Booster']];
// weights from R2 p. 97–99 (kg); ECCM by rating band
const RC_WT={'rc:Remote Control Encryption Module':.5,'rc:Rigger Decryption Module':.5,'rc:Rigger Protocol Emulation Module':.5,'rc:BattleTac IVIS Master Unit (RC deck)':1,'rc:BattleTac FDDM Master Unit (RC deck)':1};
const eccmWt=r=>r<=3?1.5:r<=6?2:2.5;
const NEEDS={'armor:Helmet option: Ultrasound':'Works with an Ultrasound Sight on the weapon (SSC p. 71).','armor:Helmet option: Smartgun Display':'Needs a smartgun connection: a smart weapon and a link (SSC p. 71).','head:BrightLight Addition':''};
function kind(key){ if(key===RC_EXT) return 'rcdeck'; if(key===RC_CRD) return 'crd'; if(key==='head:Cybereyes') return 'eyes'; if(key==='head:Cyberears') return 'ears'; if(SEC_ARMOR.includes(key)) return 'secarmor'; if(key==='armor:Security Helmet') return 'helmet'; return null;}
function isHost(key){return !!kind(key);}
function defaults(key){const k=kind(key); return k==='secarmor'?{helmet:true,opts:[]}:k==='eyes'?{single:false,ct:true,opts:[]}:k==='rcdeck'?{rating:1,hitch:0,screens:0,mem:0,opts:[]}:k==='crd'?{rating:1,opts:[]}:{opts:[]};}
// candidate options for a host
function pool(key,E){const k=kind(key);
  if(k==='eyes') return E.all().filter(i=>i.eye&&E.bookOn(i.src)).map(i=>i.id);
  if(k==='ears') return E.all().filter(i=>i.ear&&E.bookOn(i.src)).map(i=>i.id);
  if(k==='secarmor') return SEC_OPTS.filter(id=>E.item(id)&&E.bookOn(E.item(id).src));
  if(k==='helmet') return [...HELMET_ONLY].filter(id=>E.item(id)&&E.bookOn(E.item(id).src));
  if(k==='rcdeck'||k==='crd') return (k==='rcdeck'?RC_OPTS:CRD_OPTS).filter(id=>E.item(id)&&E.bookOn(E.item(id).src));
  return [];}
function rFor(it,r){if(!it||!it.r) return undefined; const lo=it.r[0],hi=it.r[1]; let v=Math.floor(+r||lo); return Math.min(hi,Math.max(lo,v));}
// Full evaluation. Returns rows, totals and every rule broken (bad).
function calc(key,st,E){const k=kind(key), host=E.item(key), bad=[], notes=[]; const S=Object.assign(defaults(key),st||{}); const ids=new Set();
  const rows=(S.opts||[]).map(o=>{const it=E.item(o.id); const r=rFor(it,o.r); if(!it){bad.push('Unknown option'); return null;} if(ids.has(o.id)) bad.push(it.n+' is listed twice'); ids.add(o.id);
    if(!pool(key,E).includes(o.id)) bad.push(it.n+' doesn’t fit a '+host.n);
    return {id:o.id,it,r,n:it.n.replace(/^Helmet option: /,'')+(it.r?' '+r:''),cost:cost(it,r),ess:ess(it,r),pg:it.pg||'',d:it.desc||it.s||''};}).filter(Boolean);
  const rc=k==='rcdeck'||k==='crd', hr=rc?(rFor(host,S.rating)||1):undefined;
  let hostCost=cost(host,hr), hostEss=ess(host,hr), free=0, cap=null, accEss=0, disc=0, sub=0, total=0, essTotal=0, flux=null, wt=null, extras=[];
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
  if(rc){ // R2 p. 95–99
    RC_ONE.forEach(g=>{const h=rows.filter(x=>g.includes(x.id)); if(h.length>1) bad.push(`Does the same job as the ${h[0].it.n}; pick one`);});
    const R=hr, amp=rows.find(x=>x.id==='rc:Signal Amplifier'||x.id==='body:Cyberlimb Signal Booster');
    flux=(k==='rcdeck'?2:0)+(amp?amp.r:0);
    if(k==='rcdeck'){
      const hitch=Math.max(0,Math.floor(+S.hitch||0)), scr=Math.max(0,Math.floor(+S.screens||0)), mem=Math.max(0,Math.floor(+S.mem||0));
      if(hitch>R) bad.push(`Hitcher jacks: ${hitch}, but a rating ${R} deck takes ${R} (R2 p. 99)`);
      if(scr>R) bad.push(`Screens: ${scr}, but a rating ${R} deck takes ${R} (R2 p. 99)`);
      if(hitch) extras.push({n:`Hitcher jacks ×${hitch}`,cost:hitch*100*R,pg:'R2 p. 99',wt:0});
      if(scr) extras.push({n:`Audio/visual screens ×${scr}`,cost:scr*100,pg:'R2 p. 99',wt:.5*scr});
      if(mem) extras.push({n:`Storage memory ${mem} Mp`,cost:mem*5,pg:'R2 p. 98',wt:1});
      wt=3+rows.reduce((a,x)=>a+(x.id==='rc:Remote Control ECCM'?eccmWt(x.r):x.id==='rc:Signal Amplifier'?x.r:(RC_WT[x.id]||0)),0)+extras.reduce((a,x)=>a+x.wt,0);
      wt=Math.round(wt*10)/10;
    } else { accEss=r2(rows.reduce((a,x)=>a+x.ess,0)); essTotal=r2(hostEss+accEss);
      notes.push('Storage: a cranial deck uses headware memory (core p. 247); buy it separately.');
      if(amp) notes.push(amp.id==='rc:Signal Amplifier'?'The signal amplifier is external: carried in a backpack and cabled to the deck (R2 p. 96).':'The signal booster fills a cyberlimb’s accessory space; nothing else, not even Strength or Quickness enhancements, fits in that limb (R2 p. 96).');}
    sub=hostCost+rows.reduce((a,x)=>a+x.cost,0)+extras.reduce((a,x)=>a+x.cost,0);
    notes.unshift(`Rating ${R}: actively manages up to ${R} drone${R>1?'s':''}. Flux ${flux}${k==='crd'&&!amp?' (a cranial deck has no transmitter power of its own; add an amplifier or signal booster)':''}.`);
  }
  rows.forEach(x=>{if(NEEDS[x.id]) notes.push(NEEDS[x.id]);});
  if(!sub) sub=hostCost+rows.filter(x=>!x.fixed).reduce((a,x)=>a+x.cost,0);
  total=sub-disc; if(k!=='eyes'&&k!=='ears'&&k!=='crd') essTotal=0;
  return {k,host,S,rows,extras,hostCost,hostEss,hr,free,cap,accEss,ess:essTotal,sub,disc,total,flux,wt,bad,notes:notes.filter(Boolean),ok:!bad.length};}
// options that can be added now (lowest rating), and those that can't with the reason
function addable(key,st,E){const S=Object.assign(defaults(key),st||{}); const yes=[],no=[]; const have=new Set((S.opts||[]).map(o=>o.id));
  pool(key,E).forEach(id=>{if(have.has(id)) return; const it=E.item(id); const r=it.r?it.r[0]:undefined; const t={...S,opts:(S.opts||[]).concat([{id,r}])}; const c=calc(key,t,E);
    if(c.ok) yes.push({id,it,r,row:c.rows.find(x=>x.id===id)}); else no.push({id,it,why:c.bad[c.bad.length-1]});}); return {yes,no};}
function levels(key,st,E,ix){const S=Object.assign(defaults(key),st||{}); const o=S.opts[ix], it=o&&E.item(o.id); if(!it||!it.r) return []; const out=[];
  for(let r=it.r[0];r<=it.r[1];r++){const t={...S,opts:S.opts.map((q,j)=>j===ix?{...q,r}:q)}; if(calc(key,t,E).ok) out.push(r);} return out;}
// keep only what is legal, in the order chosen
function clamp(key,st,E){const S=Object.assign(defaults(key),st||{}); const out={...S,opts:[]}, dropped=[];
  const k=kind(key); if(k==='rcdeck'||k==='crd'){const host=E.item(key); out.rating=rFor(host,S.rating)||1;
    if(k==='rcdeck'){out.hitch=Math.min(out.rating,Math.max(0,Math.floor(+S.hitch||0))); out.screens=Math.min(out.rating,Math.max(0,Math.floor(+S.screens||0))); out.mem=Math.min(100000,Math.max(0,Math.floor(+S.mem||0)));}}
  (S.opts||[]).forEach(o=>{const it=E.item(o.id); if(!it||out.opts.some(q=>q.id===o.id)) return; const r=rFor(it,o.r); out.opts.push({id:o.id,r}); if(!calc(key,out,E).ok){out.opts.pop(); dropped.push(it.n);}});
  return {st:out,dropped};}
const PAGES={eyes:'core p. 247, 260; CT p. 45',ears:'core p. 247, 260',secarmor:'SSC p. 70–71',helmet:'SSC p. 70–71',rcdeck:'core p. 253, 265; R2 p. 97–99',crd:'R2 p. 95–96'};
const INTRO={eyes:'Cybereye accessories: the first .5 Essence of them is free (.25 for a single eye). With Cybertechnology limits on, a pair holds 1.2 Essence of accessories (a single eye .6) and each eye one weapon, tool laser or camera.',
  ears:'Cyberear accessories: one feature of .2 Essence or less is free.',
  secarmor:'Kelmar security armor and its options. Two or more options take 15% off the package, four or more 30%. Vision, comms and environmental options for the head need the helmet.',
  helmet:'The security helmet and its options.',
  rcdeck:'A remote control deck (datajack controlled, Flux 2) and its plug-in accessories. Its rating is how many drones it actively manages; hitcher jacks and screens can’t outnumber it. The books set no top rating for the deck itself; this tool allows 10, like the modules.',
  crd:'A cranial remote deck: the same as a remote control deck but carried in the head, with Flux 0 and Essence for the deck and each module. Its rating is how many drones it actively manages.'};
// ---- Checklist UI shared by both tools (same look as the vehicle checklist): every option listed; tick to add, then pick a rating ----
const X=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const nm=it=>it.n.replace(/^Helmet option: /,'');
function headHTML(key,S,E,K){const k=kind(key), host=E.item(key), sel=(f,lab,vals,cur,fmt)=>`<label class="vck-s">${lab} <select data-hbf="${K}" data-hbfield="${f}" aria-label="${X(lab)}">${vals.map(v=>`<option value="${v}"${v===cur?' selected':''}>${fmt?fmt(v):v}</option>`).join('')}</select></label>`;
  const chk=(f,lab)=>`<label class="vck-t"><input type="checkbox" data-hbf="${K}" data-hbfield="${f}"${S[f]?' checked':''}> ${X(lab)}</label>`;
  if(k==='eyes') return `<div class="vck-bar">${chk('single','Single eye (60% price, .1 Essence, .25 free)')}${chk('ct','Cybertechnology limits (CT p. 45)')}</div>`;
  if(k==='secarmor') return `<div class="vck-bar">${chk('helmet','Security helmet (+1/+2, 250¥)')}</div>`;
  if(k==='rcdeck'||k==='crd'){const lo=host.r[0],hi=host.r[1], R=rFor(host,S.rating)||lo, rs=[]; for(let r=lo;r<=hi;r++) rs.push(r);
    let h=sel('rating','Deck rating',rs,R,r=>`${r} · ${fmtN(cost(host,r))}¥${k==='crd'?' · '+ess(host,r)+' Essence':''}`);
    if(k==='rcdeck'){const n=[...Array(R+1).keys()];
      h+=sel('hitch','Hitcher jacks',n,S.hitch||0,x=>x?`${x} · ${fmtN(x*100*R)}¥`:'none')+sel('screens','A/V screens',n,S.screens||0,x=>x?`${x} · ${fmtN(x*100)}¥`:'none')+
        sel('mem','Storage memory',[0,50,100,200,300,500,750,1000,1500,2000,3000,5000].concat(S.mem&&![0,50,100,200,300,500,750,1000,1500,2000,3000,5000].includes(S.mem)?[S.mem]:[]).sort((a,b)=>a-b),S.mem||0,x=>x?`${fmtN(x)} Mp · ${fmtN(x*5)}¥`:'none');}
    return `<div class="vck-bar">${h}</div>`;}
  return '';}
function checklist(key,S,E,K){const C=calc(key,S,E), A=addable(key,S,E), have=new Map(C.rows.filter(x=>!x.fixed).map(x=>[x.id,x])), yes=new Map(A.yes.map(x=>[x.id,x])), no=new Map(A.no.map(x=>[x.id,x]));
  const k=kind(key), money=n=>fmtN(n)+'¥', es=e=>e?` · ${e} Essence`:'';
  const items=pool(key,E).map(id=>{const it=E.item(id), h=have.get(id), y=yes.get(id), nx=no.get(id), ix=(S.opts||[]).findIndex(o=>o.id===id); let ctl='';
    if(h){ if(it.r){const lv=levels(key,S,E,ix); ctl+=`<label class="vck-s">${X(it.r[2])} <select data-hbrt="${K}" data-hbid="${X(id)}" aria-label="${X(it.n)} ${X(it.r[2])}">${lv.map(r=>`<option value="${r}"${r===h.r?' selected':''}>${r} · ${money(cost(it,r))}${it.ess?' · '+ess(it,r)+' E':''}</option>`).join('')}</select></label>`;}
      ctl+=`<span class="vck-n">${money(h.cost)}${es(h.ess)}</span>`;}
    else if(y) ctl=`<span class="vck-n">${it.r?'from ':''}${money(y.row.cost)}${es(y.row.ess)}${it.r?` at ${X(it.r[2].toLowerCase())} ${y.r}`:''}</span>`;
    else ctl=`<span class="vck-w">${X((nx&&nx.why||'Doesn’t fit').replace(it.n+' ',''))}</span>`;
    const d=it.desc||it.s||'';
    return `<li class="vck ${h?'on':y?'off':'no'}"><div class="vck-h"><label><input type="checkbox" data-hbck="${K}" data-hbid="${X(id)}"${h?' checked':''}${!h&&!y?' disabled':''}> <b>${X(nm(it))}</b></label><span class="vck-p">${X(it.pg||'')}</span></div><div class="vck-c">${ctl}</div>${d?`<details class="vck-d"><summary>What it does</summary><p>${X(d)}</p></details>`:''}</li>`;}).join('');
  return `${headHTML(key,S,E,K)}${items?`<ul class="vcl hcl">${items}</ul>`:'<p class="vck-w">No options from the books you have switched on.</p>'}`;}
// apply a control to state S (mutates); true when it was one of ours
function act(key,S,el,E){const ds=el.dataset||{};
  if(ds.hbck!==undefined){const id=ds.hbid, ix=(S.opts||[]).findIndex(o=>o.id===id); if(el.checked){ if(ix<0){const y=addable(key,S,E).yes.find(x=>x.id===id); if(y) S.opts.push({id,r:y.r});} } else if(ix>=0) S.opts.splice(ix,1); return true;}
  if(ds.hbrt!==undefined){const o=(S.opts||[]).find(o=>o.id===ds.hbid); if(o) o.r=+el.value; return true;}
  if(ds.hbf!==undefined){const f=ds.hbfield; S[f]=el.type==='checkbox'?el.checked:+el.value; return true;}
  return false;}
const keyOf=el=>{const ds=el&&el.dataset||{}; for(const a of ['hbck','hbrt','hbf']) if(ds[a]!==undefined) return {a,k:ds[a],id:ds.hbid,f:ds.hbfield}; return null;};
function refocus(info){ if(!info||typeof document==='undefined') return; const at=a=>a.replace(/[A-Z]/g,x=>'-'+x.toLowerCase());
  const sel=`[data-${at(info.a)}="${CSS.escape(info.k)}"]`+(info.id?`[data-hbid="${CSS.escape(info.id)}"]`:'')+(info.f?`[data-hbfield="${CSS.escape(info.f)}"]`:''); const el=document.querySelector(sel); if(el) el.focus({preventScroll:true});}
return {kind,isHost,defaults,pool,calc,addable,levels,clamp,PAGES,INTRO,SEC_ARMOR,checklist,act,keyOf,refocus};
})();
