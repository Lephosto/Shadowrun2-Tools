// ---------- Gear Locker 2 build-outs: gun mount map and vehicle workshop (same rules code, new layout) ----------
// Gun: a list of the gun's mounts on the left, the choices for the picked mount on the right, results along the bottom.
function gunSlotState(g,B){const ints=integral(g), intBy={}; ints.forEach(x=>{if(x.slot)(intBy[x.slot]=intBy[x.slot]||[]).push(x.n);});
  return gunSlots(g).map(s=>{const {out,no}=accFor(g,s); const cur=B[s]&&out.some(x=>x.k===B[s])?B[s]:'';
    return {s,lab:SLOT_LABEL[s]||s,built:intBy[s]||null,out,no,cur};}).filter(x=>x.built||x.out.length||x.no.length);}
function buildHTML2(g){
  if(!canBuild(g)) return '';
  const B=bstate(g), C=buildCalc(g), F=GUNFIT[g.id]||{}, S=gunSlotState(g,B);
  if(!S.some(x=>x.s===st.gslot)){const f=S.find(x=>!x.built&&x.out.length)||S[0]; st.gslot=f?f.s:null;}
  const cur=S.find(x=>x.s===st.gslot);
  const where=k=>{const x=S.find(y=>y.cur===k); return x?x.s:null;};
  const map=S.map(x=>{const state=x.cur?'fit':x.built?'built':x.out.length?'open':'none';
    const now=x.cur?accName(x.cur):x.built?x.built.join(', ')+' (built in)':x.out.length?'Empty':'Nothing fits this gun';
    return `<button type="button" class="gm-s gm-st-${state}" data-gslot="${esc(x.s)}" aria-current="${x.s===st.gslot}"><span class="gm-dot" aria-hidden="true"></span><span class="gm-t"><span class="gm-l">${esc(x.lab)}</span><span class="gm-n">${esc(now)}</span></span><span class="gm-c">${x.out.length?x.out.length+' fit':''}</span></button>`;}).join('');
  let panel='';
  if(cur){
    const opts=cur.out.map(o=>{const on=cur.cur===o.k, other=!on&&where(o.k)&&where(o.k)!==cur.s; const a=ACC[o.k]||{};
      const chips=[a.rc?`<span class="gm-chip ok">Recoil comp ${a.rc}</span>`:'',a.gyro?`<span class="gm-chip ok">Gyro ${a.gyro}</span>`:'',a.conc?`<span class="gm-chip warn">Conceal ${a.conc>0?'+':'−'}${Math.abs(a.conc)}</span>`:a.nocon?'<span class="gm-chip warn">Not concealable</span>':'<span class="gm-chip">No conceal penalty</span>'].join('');
      return `<button type="button" class="gm-o${on?' on':''}" role="radio" aria-checked="${on}" ${other?'aria-disabled="true"':''} data-gpick="${esc(o.k)}" data-slot="${esc(cur.s)}"><span class="gm-r" aria-hidden="true"></span><span class="gm-ot"><b>${esc(accName(o.k))}</b><span>${esc(other?'Already on the '+(SLOT_LABEL[where(o.k)]||'').toLowerCase()+'.':(a.fx||'').replace(/^(.{0,150}[.;]).*$/,'$1'))}</span><span class="gm-cs">${chips}<span class="note">${esc(a.pg||'')}</span></span></span><span class="gm-p">+${fmt(accPrice(g,o.k))}¥</span></button>`;}).join('');
    panel=`<div class="gm-ph"><h4>${esc(cur.lab)}</h4><span class="note">${cur.out.length?cur.out.length+' fit':'Nothing fits'}${cur.no.length?`, ${cur.no.length} don’t`:''}</span></div>
      ${cur.built?`<p class="gm-built">Built in: ${esc(cur.built.join(', '))}.${cur.out.length?' Picking something here replaces it.':''}</p>`:''}
      ${cur.cur?`<button type="button" class="xb" data-gpick="" data-slot="${esc(cur.s)}">Leave this mount empty</button>`:''}
      <div class="gm-os" role="radiogroup" aria-label="${esc(cur.lab)}">${opts}</div>
      ${cur.no.length?`<details class="gm-no"><summary>Doesn’t fit this gun (${cur.no.length})</summary><ul>${cur.no.map(x=>`<li><b>${esc(accName(x.k))}</b><span>${esc(x.why)}</span></li>`).join('')}</ul></details>`:''}`;}
  const links=[['none','No smartlink'],['smartlink','Smartlink (cyber)'],['smartlink2','Smartlink II (cyber)'],['goggles','Smart goggles'],['goggles2','Smartgoggles II']];
  const ammos=['ammo:Regular Ammo (10 rounds)','ammo:Explosive Rounds (10)','ammo:EX Explosive Rounds (10)','ammo:APDS Ammo (10 rounds)','ammo:Flechette Rounds (10)','ammo:Gel Rounds (10)','ammo:Stun Rounds (10)','ammo:Tracer Rounds (10)'].filter(k=>BYID[k]&&visible(BYID[k]));
  const loose=C.ints.filter(x=>!x.slot);
  const stat=(k,v,n)=>`<div><span class="lbl">${k}</span><b>${v}</b>${n?`<span class="note">${n}</span>`:''}</div>`;
  const mods=[C.rc?`recoil comp ${C.rc}`:'',C.heavy?'heavy weapon: uncompensated recoil doubled':'',C.gyro?`gyro ${C.gyro}`:'',C.extraR?`includes this gun’s own +${C.extraR}`:''].filter(Boolean);
  const rec=C.rows.length?`<details class="gm-more"><summary>Recoil per action</summary><div class="tblw"><table><thead><tr><th>Firing</th><th>Recoil</th><th>Final</th></tr></thead><tbody>${C.rows.map(r=>`<tr><td>${r[0]}</td><td>+${r[1]}</td><td><b>+${r[5]}</b></td></tr>`).join('')}</tbody></table></div><p class="note">${mods.length?'Applied: '+mods.join(', ')+'. ':''}Recoil comp cancels recoil only; gyros also cancel movement modifiers (core p. 89–90).</p></details>`:'';
  const slotNote=wtype(g)==='holdout'?'Hold-out pistols can’t mount accessories (core p. 238), but a holster still works.':PISTOL.has(wtype(g))?'Pistols take top and barrel mounts only (core p. 238).':'';
  return `<section class="gm" aria-label="Gun build-out">
    ${F.note||slotNote?`<p class="note">${esc([F.note,slotNote].filter(Boolean).join(' '))}</p>`:''}
    <div class="gm-grid"><div class="gm-map"><span class="lbl">Mounts on this gun</span>${map}<div class="gm-key"><span><i class="k-fit"></i>Fitted</span><span><i class="k-built"></i>Built in</span><span><i class="k-open"></i>Open</span><span><i class="k-none"></i>Nothing fits</span></div>${loose.length?`<p class="note">Also built in: ${loose.map(x=>esc(x.n)+(x.rc?` (recoil comp ${x.rc})`:'')).join(', ')}.</p>`:''}</div>
    <div class="gm-panel">${panel}</div></div>
    <div class="gm-setup"><label class="fl"><span class="lbl">Shooter’s link</span><select id="b_link" data-bopt="link">${links.map(([v,l])=>`<option value="${v}" ${B.link===v?'selected':''}>${l}</option>`).join('')}</select></label>
      <label class="fl"><span class="lbl">Loaded ammo</span><select id="b_ammo" data-bopt="ammo">${ammos.map(k=>`<option value="${esc(k)}" ${B.ammo===k?'selected':''}>${esc(BYID[k].n.replace(/ \(10( rounds)?\)/,''))} · ${fmt(BYID[k].cost||0)}¥ per 10</option>`).join('')}</select></label></div>
    <div class="gm-res">${stat('Price',fmt(C.cost)+'¥',`gun ${fmt(g.cost)}¥ + ${fmt(C.cost-g.cost)}¥ add-ons`)}${stat('Concealability',esc(C.conc),C.conc!==String(g.w[1])&&g.w[1]!=null&&C.conc!=='Not concealable'?'was '+g.w[1]:'')}${stat('Recoil comp',C.rc||0,C.gyro?'gyro '+C.gyro:'')}${stat('Aim',C.aim?String(C.aim).replace('-','−'):'0',C.mag?`range ${C.mag} step${C.mag>1?'s':''} closer`:'')}${stat('Damage',esc(C.dmg),C.notice?'+'+C.notice+' TN to notice':'')}</div>
    ${C.aimTxt.length||C.ext.length?`<p class="bok">${C.aimTxt.concat(C.ext).map(esc).join(' · ')}</p>`:''}
    ${C.dmgNote?`<p class="note">${esc(C.dmgNote)}</p>`:''}
    ${C.warn.map(w=>`<p class="rule">${esc(w)}</p>`).join('')}
    ${rec}
    <div class="gm-act"><button type="button" class="btn ghost" id="clrBuild">Clear add-ons</button><button type="button" class="btn ghost big" data-send="item">Send to a character</button><button type="button" class="btn big" id="addBuild">Add gun and add-ons · ${fmt(C.cost)}¥</button></div>
  </section>`;
}
// Vehicle: capacity pinned on top, mods sorted into Fits / Doesn't fit / On this build, grouped like the browse list.
function vehHTML2(i){
  if(!isVeh(i)) return vehHTML(i);
  const {B,v}=vbFix(i); const R=VB.calc(v,B), s=R.s, A=VB.addable(v,B);
  const OWN=vOwned(i), OC=B.own?vOwnCost(i,B):null, ON=B.own?vOwnNew(i,B):null;
  const have=new Map(R.rows.map((r,ix)=>[r.m.id,{...r,ix}])), yes=new Map(A.yes.map(x=>[x.d.id,x])), no=new Map(A.no.map(x=>[x.d.id,x]));
  const fac=VB.facList(v);
  const tab=['fits','no','on'].includes(st.vtab)?st.vtab:'fits';
  const money=n=>fmt(n)+'¥';
  const rowFor=d=>{const h=have.get(d.id), y=yes.get(d.id), nx=no.get(d.id), facFlag=v.fac&&v.fac[d.id]&&!v.fac[d.id].std&&d.kind==='flag';
    if(h) return {kind:'on',d,h}; if(y) return {kind:'fits',d,y}; return {kind:facFlag?'fac':'no',d,why:facFlag?'Fitted at the factory':(nx&&nx.why)||'Doesn’t fit'};};
  const all=VB.M.map(rowFor);
  const lists={fits:all.filter(r=>r.kind==='fits'||r.kind==='on'),no:all.filter(r=>r.kind==='no'),on:all.filter(r=>r.kind==='on')};
  const L=lists[tab];
  const k='L';
  const row=r=>{const d=r.d, id=esc(d.id);
    let price='',cf='',ld='',ctl='',sub=esc(d.pg);
    if(r.kind==='on'){const h=r.h, os=VB.optChoices(v,B,h.ix);
      price=d.gm?'GM sets':h.cost?money(h.cost):'—'; if(VB.ENG_GAIN[d.id]) sub+=' · '+esc(VB.ENG_GAIN[d.id](v,h.l)); cf=h.cf?fmt(h.cf):'—'; ld=h.load?fmt(h.load)+' kg':'—';
      if(d.kind!=='flag'){const lv=VB.levels(v,B,h.ix); ctl+=`<label class="vw-s"><span>${d.kind==='qty'?'How many':'Level'}</span><select data-vblv="${k}" data-vbid="${id}" aria-label="${esc(d.n)} ${d.kind==='qty'?'count':'level'}">${lv.map(l=>{const t={...B,mods:B.mods.map((m,j)=>j===h.ix?{...m,lv:l}:m)}; const c=VB.calc(v,t).rows[h.ix]; return `<option value="${l}"${l===h.l?' selected':''}>${l}${VB.ENG_GAIN[d.id]?' · '+VB.ENG_GAIN[d.id](v,l):''}${d.gm||!c||!c.cost?'':' · '+money(c.cost)}</option>`;}).join('')}</select></label>`;}
      if(os.length>1) ctl+=`<label class="vw-s"><span>Option</span><select data-vbop="${k}" data-vbid="${id}" aria-label="${esc(d.n)} option">${os.map(o=>`<option value="${esc(o[0])}"${o[0]===h.m.opt?' selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
      ctl+=`<label class="vw-t on"><input type="checkbox" data-vbck="${k}" data-vbid="${id}" checked><span>Added</span></label>`;}
    else if(r.kind==='fits'){const y=r.y, t={...B,mods:B.mods.concat([{id:d.id,lv:y.lv,opt:y.opt}])}, c=VB.calc(v,t).rows.slice(-1)[0];
      if(VB.ENG_GAIN[d.id]) sub+=' · '+esc(VB.ENG_GAIN[d.id](v,1))+' a level'; price=d.gm?'GM sets':!c.cost?'—':(d.kind==='flag'?'':d.kind==='qty'?'':'from ')+money(c.cost)+(d.kind==='qty'?' each':''); cf=c.cf?fmt(c.cf):'—'; ld=c.load?fmt(c.load)+' kg':'—';
      ctl=`<label class="vw-t"><input type="checkbox" data-vbck="${k}" data-vbid="${id}"><span>Add</span></label>`;}
    else {sub=`<span class="vw-why">${esc(r.why)}</span> · ${esc(d.pg)}`; ctl=`<span class="vw-tag">${r.kind==='fac'?'Factory':'Won’t fit'}</span>`;}
    if(r.kind==='no'||r.kind==='fac') return `<div class="vw-r vw-r2 vw-${r.kind}"><div class="vw-n"><b>${esc(d.n)}</b><span>${sub}</span><details class="vw-d"><summary>What it does</summary><p>${esc(d.d)}</p></details></div><div class="vw-c">${ctl}</div></div>`;
    return `<div class="vw-r vw-${r.kind}"><div class="vw-n"><b>${esc(d.n)}</b><span>${sub}</span><details class="vw-d"><summary>What it does</summary><p>${esc(d.d)}</p></details></div><span class="vw-num">${price}</span><span class="vw-num">${cf}</span><span class="vw-num">${ld}</span><div class="vw-c">${ctl}</div></div>`;};
  const groups=VB.GROUPS.map(g=>{const rs=L.filter(r=>r.d.g===g); if(!rs.length) return '';
    const nOn=lists.on.filter(r=>r.d.g===g).length; const open=tab==='on'||(g in VB.UI.open?VB.UI.open[g]:nOn>0||g==='Control');
    return `<details class="vw-g" data-vbgrp="${esc(g)}"${open?' open':''}><summary><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg><b>${esc(g)}</b>${nOn&&tab!=='on'?`<span class="vw-gon">${nOn} on this build</span>`:''}<span class="gn">${rs.length}</span></summary>
      ${tab==='no'?'':'<div class="vw-hd" aria-hidden="true">'}${tab==='no'?'':'<span>Modification</span><span>Price</span><span>CF</span><span>Load</span><span></span></div>'}${rs.map(row).join('')}</details>`;}).join('');
  const bar=(lab,used,max,unit,note)=>{const pct=max?Math.min(100,used/max*100):used?100:0; return `<div class="vw-bar"><div class="vw-bl"><span class="lbl">${lab}</span><b>${VB.fmtN(used)} of ${VB.fmtN(max)}${unit}</b></div><div class="vw-bt"><i style="width:${pct}%" class="${pct>85?'hi':''}"></i></div><span class="note">${note}</span></div>`;};
  const stats=VB.statLine(v,s).map(([kk,a,b])=>`<span class="vw-st${String(a)!==String(b)?' chg':''}"><span>${kk}</span><b>${b}</b>${String(a)!==String(b)?`<em>was ${a}</em>`:''}</span>`).join('');
  const drop=VB_DROPPED.length?`<p class="rule">No longer fit, so removed: ${esc(VB_DROPPED.join(', '))}.</p>`:''; VB_DROPPED=[];
  const sel=(f,lab,opts,cur)=>`<label class="fl"><span class="lbl">${lab}</span><select id="vb_${f}" data-vb="${f}">${opts.map(([kk,l])=>`<option value="${esc(kk)}" ${String(cur)===String(kk)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
  const chk=(f,lab,cur)=>`<label class="bchk"><input type="checkbox" data-vb="${f}" ${cur?'checked':''}> ${lab}</label>`;
  const tabs=[['fits','Fits',lists.fits.length],['no','Doesn’t fit',lists.no.length],['on','On this build',lists.on.length]];
  const ownSel=OWN.length||B.own?`<div class="vw-own"><label class="fl"><span class="lbl">Working on</span><select data-vown="${esc(i.id)}"><option value="">A new ${esc(i.n)}</option>${OWN.map((o,k)=>`<option value="${esc(o.C.id+'|'+o.gi)}" ${B.own&&B.own.cid===o.C.id&&B.own.gi===o.gi?'selected':''}>${esc(o.who)}’s ${esc(i.n)}${OWN.length>1?' #'+(k+1):''} (owned${o.n?', '+o.n+' mod'+(o.n>1?'s':''):''})</option>`).join('')}${B.own&&!OWN.some(o=>o.C.id===B.own.cid&&o.gi===B.own.gi)?`<option value="keep" selected>${esc(B.own.who)}’s ${esc(i.n)} (not on the linked runner now)</option>`:''}</select></label>
      ${B.own?`<p class="note">The mods already on ${esc(B.own.who)}’s ${esc(i.n)} start ticked. Only the new work goes on the list, at the mods’ prices; the vehicle itself isn’t bought again.${OC.refund?' <b>You took off a mod it already had: that refunds nothing here; sort it out with your GM.</b>':''}</p>`:''}</div>`:'';
  return `<section class="vw" aria-label="Vehicle build-out">
    ${ownSel}
    <div class="vw-pin"><div class="vw-bars">${bar('Cargo space',R.cf,R.Cmax,' CF',`${VB.fmtN(Math.max(0,R.Cmax-R.cf))} CF left${s.Cext?` · +${s.Cext} CF on racks`:''}`)}${bar('Load',R.load,R.Lmax,' kg',`${VB.fmtN(Math.max(0,R.Lmax-R.load))} kg left`)}${bar('Weapon mount points',R.pts,R.ptsMax,'',`Body ${v.B}: hardpoint 2, firmpoint 1`)}</div>
      ${B.own?`<div class="vw-tot"><span class="lbl">New work</span><b>${money(OC.diff)}</b><span class="note">${ON.add.length?esc(ON.add.join(', ')):'Nothing new yet'}${R.gm.length?' + GM-priced work':''}</span></div>`:`<div class="vw-tot"><span class="lbl">Vehicle + mods</span><b>${money(i.cost+R.cost)}</b><span class="note">${money(i.cost)} + ${money(R.cost)}${R.gm.length?' + GM-priced work':''}</span></div>`}</div>
    <div class="vw-stats">${stats}</div>
    ${fac.length?`<p class="vw-fac"><b>Factory-fitted</b>${fac.map(x=>`<span>${esc(x)}</span>`).join('')}<span class="note">Already in the listed stats: no space used, but counts toward mount points and level limits (R2 p. 120).</span></p>`:''}
    <details class="vw-setup"><summary>Vehicle setup: ${esc(VSHORT[B.type]||'vehicle')}${B.mil?' · security or military':''}${B.facRC?' · RC interface already in':''}${B.facRig?' · rigger adaptation already in':''}</summary><div class="gm-setup">${sel('type','Vehicle type',VB.TYPES,B.type)}<div class="bchks">${chk('mil','Security or military vehicle (GM permission)',B.mil)}${v.drone?'':chk('facRC','Remote control interface already added (earlier work)',B.facRC)+chk('facRig','Rigger adaptation already added (earlier work)',B.facRig)}</div></div></details>
    ${drop}
    ${R.gm.length?`<p class="vck-gm">Not in the total: ${esc(R.gm.join(', '))}. Rigger 2 prices these from the original power plant’s cost, which the Vehicle List doesn’t give, so your GM sets the price (R2 p. 120, 130).</p>`:''}
    <div class="vw-tabs" role="tablist" aria-label="Which modifications">${tabs.map(([kk,l,n])=>`<button type="button" role="tab" data-vtab="${kk}" aria-selected="${tab===kk}">${l} <span>${n}</span></button>`).join('')}</div>
    <div class="vw-list">${groups||`<p class="note" style="padding:12px 0">${tab==='on'?'Nothing on this build yet. Switch to Fits and add something.':'Nothing here.'}</p>`}</div>
    <p class="note">Install times, skills and target numbers are on each mod’s page; installed by a mechanic with the parts in hand (R2 p. 118).</p>
    <div class="gm-act"><button type="button" class="btn ghost" id="clrVeh">Start over</button><button type="button" class="btn ghost big" data-send="item">Send to a character</button>${B.own?`<button type="button" class="btn big" id="addVeh" ${ON.add.length?'':'disabled'}>Add the new work · ${money(OC.diff)}</button>`:`<button type="button" class="btn big" id="addVeh">Add vehicle and mods · ${money(i.cost+R.cost)}</button>`}</div>
  </section>`;
}
document.addEventListener('click',e=>{
  const gs=e.target.closest('[data-gslot]'); if(gs){st.gslot=gs.dataset.gslot; renderTag(); const b=document.querySelector(`[data-gslot="${CSS.escape(st.gslot)}"]`); if(b) b.focus({preventScroll:true}); return;}
  const gp=e.target.closest('[data-gpick]'); if(gp){if(gp.getAttribute('aria-disabled')==='true') return; const g=BYID[st.sel]; if(!g) return; const B=bstate(g), slot=gp.dataset.slot, k=gp.dataset.gpick;
    B[slot]=k&&B[slot]!==k?k:undefined; save(); renderTag(); const f=document.querySelector(k?`[data-gpick="${CSS.escape(k)}"][data-slot="${CSS.escape(slot)}"]`:`[data-gslot="${CSS.escape(slot)}"]`); if(f) f.focus({preventScroll:true}); return;}
  const vt=e.target.closest('[data-vtab]'); if(vt){st.vtab=vt.dataset.vtab; renderTag(); const b=document.querySelector(`[data-vtab="${st.vtab}"]`); if(b) b.focus({preventScroll:true}); return;}
});
// ---------- shared pieces for the list-style workshops (decks, cyberware options) ----------
const wsTabs=(attr,tab,tabs)=>`<div class="vw-tabs" role="tablist">${tabs.map(([k,l,n])=>`<button type="button" role="tab" ${attr}="${k}" aria-selected="${tab===k}">${l} <span>${n}</span></button>`).join('')}</div>`;
const wsBar=(lab,used,max,unit,note)=>{const pct=max?Math.min(100,used/max*100):used?100:0; return `<div class="vw-bar"><div class="vw-bl"><span class="lbl">${lab}</span><b>${fmt(used)} of ${fmt(max)}${unit}</b></div><div class="vw-bt"><i style="width:${pct}%" class="${pct>85?'hi':''}"></i></div><span class="note">${note||''}</span></div>`;};
const wsTog=(attr,k,id,on,dis,lab,labOn)=>`<label class="vw-t${on?' on':''}${dis?' dis':''}"><input type="checkbox" ${attr}="${k}" ${attr==='data-pgck'||attr==='data-pgld'?'data-pgid':'data-hbid'}="${esc(id)}"${on?' checked':''}${dis?' disabled':''}><span>${on?labOn||'Added':lab}</span></label>`;
const wsGroup=(attrOpen,title,rows,open,nOn,head)=>`<details class="vw-g" ${attrOpen}="${esc(title)}"${open?' open':''}><summary><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg><b>${esc(title)}</b>${nOn?`<span class="vw-gon">${nOn} added</span>`:''}<span class="gn">${rows.length}</span></summary>${head||''}${rows.join('')}</details>`;
// ---------- Cyberdeck: memory pinned on top, hardware in one card, programs in Fits / Doesn't fit / On the deck ----------
function deckHTML2(i){
  if(!isDeck(i)) return '';
  const C=deckCalc(i), B=C.B, M=C.M, D=deckParts(i,C);
  const tab=['fits','no','on'].includes(st.dtab)?st.dtab:'fits';
  const kind=r=>r.on?'on':r.why?'no':'fits';
  const all=D.sets.map(s=>({...s,rows:s.rows.map(r=>({...r,k:kind(r)}))}));
  const count=f=>all.reduce((a,s)=>a+s.rows.filter(f).length,0);
  const pick={fits:r=>r.k!=='no',no:r=>r.k==='no',on:r=>r.k==='on'}[tab];
  const row=r=>{const id=r.id;
    if(r.k==='no') return `<div class="vw-r vw-r2 vw-no"><div class="vw-n"><b>${esc(r.n)}</b><span><span class="vw-why">${esc(r.why)}</span> · ${esc(r.pg||'')}</span>${r.desc?`<details class="vw-d"><summary>What it does</summary><p>${esc(r.desc)}</p></details>`:''}</div><div class="vw-c"><span class="vw-tag">Won’t fit</span></div></div>`;
    let c='';
    if(r.on){ if(r.ropts&&r.ropts.length) c+=`<label class="vw-s"><span>Rating</span><select data-pgr="L" data-pgid="${esc(id)}" aria-label="${esc(r.n)} rating">${r.ropts.map(([v,l])=>`<option value="${v}"${v===r.r?' selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
      if(r.canLoad!=null) c+=wsTog('data-pgld','L',id,r.loaded,!r.canLoad&&!r.loaded,'Load','Loaded');}
    c+=wsTog('data-pgck','L',id,r.on,false,'Add');
    const info=r.on?r.price+(r.loaded&&r.loadTxt?` · loads ${r.loadTxt}`:'')+(r.more?` · ${r.more}`:''):r.from;
    return `<div class="vw-r vw-${r.k}"><div class="vw-n"><b>${esc(r.n)}${r.tag||''}</b><span>${esc(r.pg||'')}${!r.on||r.canLoad!=null?'':''}</span>${r.desc?`<details class="vw-d"><summary>What it does</summary><p>${esc(r.desc)}</p></details>`:''}</div><span class="vw-num">${esc(info||'')}</span><div class="vw-c">${c}</div></div>`;};
  const groups=all.map((s,ix)=>{const rs=s.rows.filter(pick); if(!rs.length) return ''; const nOn=s.rows.filter(r=>r.on).length;
    const open=tab==='on'||(s.title in PROGUI.OPEN?PROGUI.OPEN[s.title]:nOn>0||ix===0);
    return wsGroup('data-pggrp',s.title,rs.map(row),open,tab==='on'?0:nOn,s.intro&&tab!=='no'?`<p class="vw-intro">${esc(s.intro)}</p>`:'');}).join('');
  const persona=PERS.reduce((a,[n])=>a+(+C.per[n]||0),0);
  const stat=(k,v)=>`<span class="vw-st"><span>${k}</span><b>${v}</b></span>`;
  return `<section class="vw dk" aria-label="Cyberdeck build-out">
    <div class="vw-pin"><div class="vw-bars">${wsBar('Active memory',C.used,C.am,' Mp',`${fmt(Math.max(0,C.am-C.used))} Mp free for loaded programs`)}${wsBar('Storage',C.stored,C.sm,' Mp',`${fmt(Math.max(0,C.sm-C.stored))} Mp free`)}${wsBar('Persona ratings',persona,3*M,'',`up to 3 × MPCP ${M}`)}</div>
      <div class="vw-tot"><span class="lbl">Deck + programs</span><b>${fmt(C.cost)}¥</b><span class="note">MPCP ${M}</span></div></div>
    <div class="vw-stats">${stat('MPCP',M)}${stat('Hardening',C.hard)}${stat(C.vr2?'I/O speed':'Load speed',C.vr2?C.io+' MePS':C.ls+' Mp/turn')}${stat('Hacking Pool',(C.vr2?B.int:B.comp)?C.pool:'—')}${stat('Matrix Init',B.react?`${C.react} + ${C.dice}D6`:'—')}${C.lv?stat('Response level',C.lv):''}</div>
    <details class="vw-setup" ${st.dhw===false?'':'open'} data-dhw="1"><summary>Deck hardware${C.vr2?': built from components (VR2 p. 86–89)':`: MPCP ${M}, options this deck can carry`}</summary>${D.hw}</details>
    <details class="vw-setup" data-dwho="1"><summary>You at the deck: ${C.vr2?'Intelligence':'Computer skill'} and Reaction</summary><div class="bgrid">${D.who}</div><p class="note">Hacking Pool: ${esc(C.how)}.${C.lv?` Response level ${C.lv}: +${2*C.lv} Reaction and +${C.lv}D6 in the Matrix.`:''}</p></details>
    ${C.warn.map(w=>`<p class="rule">${esc(w)}</p>`).join('')}
    ${wsTabs('data-dtab',tab,[['fits','Fits',count(r=>r.k!=='no')],['no','Doesn’t fit',count(r=>r.k==='no')],['on','On the deck',count(r=>r.k==='on')]])}
    <div class="vw-list" style="--wcols:minmax(0,1fr) 170px 230px">${groups||`<p class="note" style="padding:12px 0">${tab==='on'?'No programs yet. Switch to Fits and add some.':'Nothing here.'}</p>`}</div>
    <p class="note">${C.vr2?`Ratings up to the MPCP (${M}), VR2 p. 16.`:'Programs: core p. 174–176.'} Loaded programs sit in active memory for the run; the rest wait in storage.</p>
    <details class="gm-more"><summary>Price breakdown (${C.parts.length})</summary><ul class="bfx">${C.parts.map(p=>`<li>${esc(p.n)}: ${p.c<0?'−':''}${fmt(Math.abs(p.c))}¥</li>`).join('')}</ul></details>
    ${C.no.length?`<details class="gm-more"><summary>Won’t fit this deck (${C.no.length})</summary><ul class="bfx">${C.no.map(([a,b])=>`<li>${esc(a)}: ${esc(b)}</li>`).join('')}</ul></details>`:''}
    <div class="gm-act"><button type="button" class="btn ghost" id="clrDeck">Start over</button><button type="button" class="btn ghost big" data-send="item">Send to a character</button><button type="button" class="btn big" id="addDeck">Add deck and programs · ${fmt(C.cost)}¥</button></div>
  </section>`;
}
// ---------- Cyberware and armor options (cybereyes, cyberears, RC deck, CRD, security armor) ----------
function hostHTML2(i){ if(!HB.isHost(i.id)) return '';
  const S=hbFix(i), C=HB.calc(i.id,S,HBENV), A=HB.addable(i.id,S,HBENV), k=C.k;
  const have=new Map(C.rows.filter(x=>!x.fixed).map(x=>[x.id,x])), yes=new Map(A.yes.map(x=>[x.id,x])), no=new Map(A.no.map(x=>[x.id,x]));
  const tab=['fits','no','on'].includes(st.htab)?st.htab:'fits';
  const nm=it=>it.n.replace(/^Helmet option: /,'');
  const rows=HB.pool(i.id,HBENV).map(id=>{const it=HBENV.item(id); if(!it) return null; const h=have.get(id), y=yes.get(id), nx=no.get(id); return {id,it,h,y,why:(nx&&nx.why||'Doesn’t fit').replace(it.n+' ',''),k:h?'on':y?'fits':'no'};}).filter(Boolean);
  const pick={fits:r=>r.k!=='no',no:r=>r.k==='no',on:r=>r.k==='on'}[tab];
  const es=e=>e?`${e}`:'—';
  const row=r=>{const it=r.it, d=it.desc||it.s||'';
    if(r.k==='no') return `<div class="vw-r vw-r2 vw-no"><div class="vw-n"><b>${esc(nm(it))}</b><span><span class="vw-why">${esc(r.why)}</span> · ${esc(it.pg||'')}</span>${d?`<details class="vw-d"><summary>What it does</summary><p>${esc(d)}</p></details>`:''}</div><div class="vw-c"><span class="vw-tag">Won’t fit</span></div></div>`;
    let c='', price='', ess='';
    if(r.h){const ix=(S.opts||[]).findIndex(o=>o.id===r.id); if(it.r){const lv=HB.levels(i.id,S,HBENV,ix); c+=`<label class="vw-s"><span>${esc(it.r[2])}</span><select data-hbrt="L" data-hbid="${esc(r.id)}" aria-label="${esc(it.n)} ${esc(it.r[2])}">${lv.map(x=>`<option value="${x}"${x===r.h.r?' selected':''}>${x}</option>`).join('')}</select></label>`;}
      price=fmt(r.h.cost)+'¥'; ess=es(r.h.ess);}
    else {price=(it.r?'from ':'')+fmt(r.y.row.cost)+'¥'; ess=es(r.y.row.ess);}
    c+=wsTog('data-hbck','L',r.id,!!r.h,false,'Add');
    return `<div class="vw-r vw-${r.k}"><div class="vw-n"><b>${esc(nm(it))}${r.h&&it.r?' '+r.h.r:''}</b><span>${esc(it.pg||'')}</span>${d?`<details class="vw-d"><summary>What it does</summary><p>${esc(d)}</p></details>`:''}</div><span class="vw-num">${price}</span><span class="vw-num">${ess}</span><div class="vw-c">${c}</div></div>`;};
  const rs=rows.filter(pick);
  const head=tab==='no'?'':`<div class="vw-hd" aria-hidden="true"><span>Option</span><span>Price</span><span>Essence</span><span></span></div>`;
  const ttl=k==='secarmor'?'Armor options':k==='rcdeck'||k==='crd'?'Deck options':k==='eyes'?'Eye options':'Ear options';
  const list=rs.length?wsGroup('data-hbgrp',ttl,rs.map(row),true,0,head):`<p class="note" style="padding:12px 0">${tab==='on'?'Nothing added yet. Switch to Fits and add something.':'Nothing here.'}</p>`;
  const drop=HB_DROPPED.length?`<p class="rule">No longer fit, so removed: ${esc(HB_DROPPED.join(', '))}.</p>`:''; HB_DROPPED=[];
  const bars=k==='eyes'?(S.ct&&C.cap?wsBar('Accessory capacity',C.accEss,C.cap,' Ess','Cybertechnology limit (CT p. 45)'):'')+wsBar('Free accessory Essence',Math.min(C.accEss,C.free),C.free,'','Over this, accessories cost Essence'):'';
  const hostLab=k==='eyes'||k==='ears'?'Host':k==='rcdeck'||k==='crd'?`Deck (rating ${C.hr})`:'Armor';
  const stat=(kk,v)=>`<span class="vw-st"><span>${kk}</span><b>${v}</b></span>`;
  const setup=HB.headHTML(i.id,S,HBENV,'L');
  return `<section class="vw hb" aria-label="Options build-out">
    <div class="vw-pin">${bars?`<div class="vw-bars">${bars}</div>`:`<div class="vw-stats" style="margin:0">${stat(hostLab,fmt(C.hostCost)+'¥')}${stat('Options',fmt(C.sub-C.hostCost)+'¥')}${C.flux!=null?stat('Flux',C.flux):''}${C.wt!=null?stat('Weight',C.wt+' kg'):''}</div>`}
      <div class="vw-tot"><span class="lbl">Total</span><b>${fmt(C.total)}¥</b><span class="note">${k==='eyes'||k==='ears'||k==='crd'?`${C.ess} Essence`:''}${C.disc?` · package −${fmt(C.disc)}¥`:''}</span></div></div>
    <p class="note">${esc(HB.INTRO[k])} <span class="pref">${esc(HB.PAGES[k])}</span></p>
    ${setup?`<div class="vw-setup hb-setup">${setup}</div>`:''}
    ${drop}${C.notes.map(n=>`<p class="note">${esc(n)}</p>`).join('')}
    ${wsTabs('data-htab',tab,[['fits','Fits',rows.filter(r=>r.k!=='no').length],['no','Doesn’t fit',rows.filter(r=>r.k==='no').length],['on','Added',rows.filter(r=>r.k==='on').length]])}
    <div class="vw-list" style="--wcols:minmax(0,1fr) 110px 70px 190px">${list}</div>
    <div class="gm-act"><button type="button" class="btn ghost" id="clrHost">Start over</button><button type="button" class="btn ghost big" data-send="item">Send to a character</button><button type="button" class="btn big" id="addHost">Add to shopping list · ${fmt(C.total)}¥</button></div>
  </section>`;}
// ---------- Cyber body: a body map, one location at a time, totals pinned ----------
const CB_LOCS=[['la','Left arm'],['ra','Right arm'],['ll','Left leg'],['rl','Right leg'],['torso','Torso'],['skull','Skull']];
function cbHTML2(i){ if(!CB_PAGES.has(i.id)) return '';
  const S=cbFix(); const fc=cbFromChar(), P=S.P, R=CB.calc(P,S.C,CBENV);
  const loc=CB_LOCS.some(x=>x[0]===st.cbloc)?st.cbloc:'ra';
  const inp=(f,lab)=>`<label class="fl"><span class="lbl">${lab}</span><select data-cbc="${f}">${Array.from({length:15},(_,k)=>k+1).map(v=>`<option ${v===+S.C[f]?'selected':''}>${v}</option>`).join('')}</select></label>`;
  const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
  const now=s=>cap1(s==='torso'||s==='skull'?(P[s].on?(s==='torso'?'Cybertorso':'Cyberskull')+(+P[s].plate?` · plating ${P[s].plate}`:''):'Natural'):CB.word(s,P.limbs[s])+(P.limbs[s].acc.length?` · ${P.limbs[s].acc.length} add-on${P.limbs[s].acc.length>1?'s':''}`:''));
  const isOn=s=>s==='torso'||s==='skull'?P[s].on:CB.any(P.limbs[s]);
  const map=CB_LOCS.map(([s,l])=>`<button type="button" class="gm-s gm-st-${isOn(s)?'fit':'open'}" data-cbloc="${s}" aria-current="${s===loc}"><span class="gm-dot" aria-hidden="true"></span><span class="gm-t"><span class="gm-l">${l}</span><span class="gm-n">${esc(now(s))}</span></span></button>`).join('');
  // the shared view draws every location; show only the one picked here
  let html=CBUI.view(P,S.C,CBENV,{intro:'',dropped:CB_DROP}); CB_DROP=[];
  let n=0; const order=['la','ra','ll','rl','torso','skull'];
  html=html.replace(/<article class="cb-card/g,()=>{const s=order[n++]; return s===loc?'<article class="cb-card cb-pick':'<article hidden class="cb-card';});
  const tile=(k,v,sub,on)=>`<span class="vw-st${on?' chg':''}"><span>${k}</span><b>${v}</b>${sub?`<em>${sub}</em>`:''}</span>`;
  return `<section class="vw cbv2 cb-at-${loc}" aria-label="Cyber body build-out">
    <div class="vw-pin"><div class="vw-stats" style="margin:0">${tile('Strength',R.avgStr,`natural ${S.C.str}`,R.avgStr!==S.C.str)}${tile('Quickness',R.avgQui,`natural ${S.C.quick}`,R.avgQui!==S.C.quick)}${tile('Body',`+${R.bodyBonus}`,'',R.bodyBonus>0)}${tile('Plating armor',R.plateArmor?`${R.plateArmor}/${R.plateArmor}`:'—','',R.plateArmor>0)}${tile('Unarmed Power',R.power?`+${R.power}`:'—','',R.power>0)}</div>
      <div class="vw-tot"><span class="lbl">Cyber body</span><b>${fmt(R.cost)}¥</b><span class="note">${R.ess} Essence</span></div></div>
    <details class="vw-setup"><summary>Your runner: Body ${S.C.body}, Strength ${S.C.str}, Quickness ${S.C.quick}${S.C.troll?', troll':''}</summary><div class="gm-setup">${inp('body','Natural Body')}${inp('str','Natural Strength (incl. muscle replacement)')}${inp('quick','Natural Quickness')}</div><div class="bchks"><label class="bchk"><input type="checkbox" data-cbc="troll" ${S.C.troll?'checked':''}> Troll (cyberlimbs start at Strength 8)</label>${fc?`<button class="btn ghost" id="cbUseChar" type="button">Use ${esc(fc.label)}’s attributes</button>`:''}</div></details>
    <p class="note">Limbs work in pairs and share averages, so plan the whole body here (Cybertechnology p. 30–37, 49–52). Only legal choices are offered.</p>
    <div class="gm-grid"><div class="gm-map"><span class="lbl">Body</span>${map}</div><div class="gm-panel">${html}</div></div>
    <div class="gm-act"><button type="button" class="btn ghost" id="clrCB">Start over</button><button type="button" class="btn ghost big" data-send="cbody" ${R.rows.length?'':'disabled'}>Send to a character</button><button type="button" class="btn big" id="addCB" ${R.rows.length?'':'disabled'}>Add to shopping list · ${fmt(R.cost)}¥</button></div>
  </section>`;}
document.addEventListener('click',e=>{
  const dt=e.target.closest('[data-dtab]'); if(dt){st.dtab=dt.dataset.dtab; renderTag(); const b=document.querySelector(`[data-dtab="${st.dtab}"]`); if(b) b.focus({preventScroll:true}); return;}
  const ht=e.target.closest('[data-htab]'); if(ht){st.htab=ht.dataset.htab; renderTag(); const b=document.querySelector(`[data-htab="${st.htab}"]`); if(b) b.focus({preventScroll:true}); return;}
  const cl=e.target.closest('[data-cbloc]'); if(cl){st.cbloc=cl.dataset.cbloc; renderTag(); const b=document.querySelector(`[data-cbloc="${st.cbloc}"]`); if(b) b.focus({preventScroll:true}); return;}
});
document.addEventListener('toggle',e=>{const d=e.target; if(d&&d.dataset&&d.dataset.dhw) st.dhw=d.open;},true);

// ---------- Owned vehicles: build out one the linked runner already has ----------
// Picking "Rook's GMC Bulldog (owned)" loads that vehicle's mods; the list then carries only the new work, and the
// Runner Builder puts it on the same gear line (up.gi) instead of adding a second vehicle.
function vOwned(i){const C=linkedChar(); if(!C) return []; const out=[]; (C.S.gear||[]).forEach((g,gi)=>{if(g&&(KEYFIX[g.key]||g.key)===i.id) out.push({gi,g,C,who:C.S.handle||C.S.name||'Runner',n:g.vb&&Array.isArray(g.vb.mods)?g.vb.mods.length:0});}); return out;}
function vOwnPick(i,val){st.vbuild=st.vbuild||{};
  if(val==='keep') return;
  if(!val){delete st.vbuild[i.id]; save(); return;}
  const cut=val.lastIndexOf('|'), cid=val.slice(0,cut), gi=+val.slice(cut+1); const o=vOwned(i).find(x=>x.C.id===cid&&x.gi===gi); if(!o) return;
  const t=vtype(i); const b=o.g.vb&&typeof o.g.vb==='object'?JSON.parse(JSON.stringify(o.g.vb)):{type:t[0],mil:false,facRC:false,facRig:false,mods:[]}; if(!Array.isArray(b.mods)) b.mods=[];
  b.own={cid,gi,who:o.who,base:JSON.parse(JSON.stringify(b.mods))}; st.vbuild[i.id]=b; save();}
function vOwnBase(B){const b=JSON.parse(JSON.stringify(B)); b.mods=JSON.parse(JSON.stringify(B.own.base||[])); delete b.own; return b;}
function vOwnCost(i,B){const now=VB.calc(vehOf(i,B),B).cost; let was=0; try{const b=vOwnBase(B); was=VB.calc(vehOf(i,b),b).cost;}catch(e){} return {now,was,diff:Math.max(0,now-was),refund:now<was};}
function vOwnNew(i,B){const v=vehOf(i,B), R=VB.calc(v,B), base=B.own.base||[], same=(a,b)=>a.id===b.id&&(+a.lv||0)===(+b.lv||0)&&(a.opt||'')===(b.opt||'');
  const add=R.rows.filter(r=>!base.some(m=>same(m,r.m))).map(r=>r.d.n+(r.d.kind==='flag'?'':' '+r.l)+(base.some(m=>m.id===r.m.id)?' (changed)':''));
  const gone=base.filter(m=>!(B.mods||[]).some(x=>x.id===m.id)).map(m=>(VB.M.find(d=>d.id===m.id)||{n:m.id}).n); return {add,gone};}
function vOwnSend(i,B){const vb=JSON.parse(JSON.stringify(B)); delete vb.own; return {key:i.id,qty:1,vb,up:{cid:B.own.cid,gi:B.own.gi,who:B.own.who}};}
document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-vown]'); if(!t) return; const i=BYID[t.dataset.vown]; if(!i) return; vOwnPick(i,t.value); st.vtab=t.value?'on':st.vtab; renderTag();});
// runs before the template's own #addVeh handler (capture), and only for owned vehicles
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#addVeh'); if(!b) return; const i=BYID[st.sel]; if(!i||!isVeh(i)) return; const {B}=vbFix(i); if(!B.own) return;
  e.stopImmediatePropagation(); const C=vOwnCost(i,B), N=vOwnNew(i,B); if(!N.add.length) return; const x=vOwnSend(i,B);
  st.kit.push({id:i.id,r:0,vb:x.vb,up:x.up,pc:C.diff,bp:N.add}); save(); renderKit(); b.textContent='Added'; setTimeout(()=>{const bb=$('addVeh'); if(bb) renderTag();},1200);},true);

// ---------- Skillsofts: the skill on the chip (core p. 248) ----------
function softLockerHTML(i){if(!i||i.cat!=='soft') return ''; const {t}=softSpec(i.n); if(!t||t==='DataSoft') return ''; st.sfp=st.sfp||{}; const v=st.sfp[i.id]||{sk:'',cc:'',cs:''};
  return `<div class="lk-sfp"><div class="sfps">${softPickHTML(i.n,v,i.id)}</div><p class="note">${t==='ActiveSoft'?'ActiveSofts copy Active Skills and need skillwires.':t==='KnowSoft'?'KnowSofts copy Knowledge Skills; a chipjack runs them.':'LinguaSofts copy a language; a chipjack runs them.'} The skill goes with the chip to the Runner Builder (core p. 248).</p><p class="note sfp-nag" hidden>Pick the skill on the chip first.</p></div>`;}
function softPicked(i){const {t,k}=softSpec(i.n), v=(st.sfp||{})[i.id]||{}; if(!v.sk) return false; if(t==='ActiveSoft'||t==='KnowSoft'){if(k!=='gen'&&!v.cc) return false; if(k==='spec'&&!v.cs) return false;} return true;}
function softNeedsPick(i){if(!i||i.cat!=='soft') return false; const {t}=softSpec(i.n); return !!t&&t!=='DataSoft'&&!softPicked(i);}
function softNag(){const n=document.querySelector('.sfp-nag'); if(n) n.hidden=false;}
function softKitPart(i){if(!i||i.cat!=='soft') return {}; const v=(st.sfp||{})[i.id]; return v&&v.sk?{sf:{sk:v.sk,cc:v.cc||'',cs:v.cs||''}}:{};}
document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-sfp]'); if(!t) return; const i=BYID[t.dataset.sfp]; if(!i) return; st.sfp=st.sfp||{}; st.sfp[i.id]=softSet(st.sfp[i.id],t.dataset.sff,t.value); renderTag();});

// ---------- Camouflage pattern (FoF p. 52, 54) ----------
function camoLockerHTML(i){if(!i||typeof camoKind!=='function'||!camoKind(i.id)) return ''; st.camoP=st.camoP||{}; const k=camoKind(i.id);
  return `<div class="lk-sfp"><div class="sfps">${camoPickHTML(i.id,st.camoP[i.id]||'',`data-lkcamo="${esc(i.id)}"`)}</div><p class="note">${k==='mil'?'Military armor comes in a standard finish or a camouflage pattern (FoF p. 54).':'Patterns: Desert, Snow, Woodland, Urban and Winter Woodland, reversible day/night (FoF p. 52).'} In matching terrain it’s +4 to spot the wearer, −2 in the wrong one (FoF p. 77). The pattern goes with it to the Runner Builder.</p></div>`;}
function camoKitPart(i){const v=i&&(st.camoP||{})[i.id]; return v?{camo:v}:{};}
document.addEventListener('change',e=>{const t=e.target.closest&&e.target.closest('[data-lkcamo]'); if(!t) return; st.camoP=st.camoP||{}; if(t.value) st.camoP[t.dataset.lkcamo]=t.value; else delete st.camoP[t.dataset.lkcamo]; renderTag();});
