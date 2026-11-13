// ---------- Cyber body planner view (shared by both tools) ----------
// cbView(P,C,E,opts) returns HTML. Controls carry data-cb="path.to.field" (select/checkbox), data-cbadd="side" (select), data-cbdel="side|index" (button).
const CBUI=(()=>{
const h=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yen=n=>Math.round(n).toLocaleString('en-US')+'¥';
const PARTS={arm:[['none','Natural arm'],['full','Cyberarm'],['gyro','Gyromount cyberarm'],['fore','Cyber forearm'],['hand','Cyberhand'],['forehand','Cyber forearm + hand']],
             leg:[['none','Natural leg'],['full','Cyberleg'],['fore','Cyber lower leg'],['hand','Cyberfoot'],['forehand','Cyber lower leg + foot']]};
function partOf(L){return L.full?(L.gyro?'gyro':'full'):L.fore&&L.hand?'forehand':L.fore?'fore':L.hand?'hand':'none';}
function sel(path,lab,opts,cur,fmt){return `<label class="cb-f"><span>${h(lab)}</span><select data-cb="${path}">${opts.map(v=>{const [val,t]=Array.isArray(v)?v:[v,fmt?fmt(v):v];return `<option value="${h(val)}" ${String(val)===String(cur)?'selected':''}>${h(t)}</option>`;}).join('')}</select></label>`;}
function chk(path,lab,cur){return `<label class="cb-c"><input type="checkbox" data-cb="${path}" ${cur?'checked':''}> ${h(lab)}</label>`;}
function view(P,C,E,o){o=o||{}; const R=CB.calc(P,C,E);
 const card=([s,label,k])=>{const L=P.limbs[s], part=partOf(L);
  const opt=(f,hi,fmt)=>CB.options(P,C,E,['limbs',s,f],0,hi);
  let body=sel(`limbs.${s}.part`,'Part',PARTS[k],part);
  if(L.full){ const so=opt('str',12), qo=opt('qui',12);
    body+=sel(`limbs.${s}.str`,`Strength enhancement (limb ${R.limbStr[s]})`,so,L.str,v=>v?`+${v}`:'None')+sel(`limbs.${s}.qui`,`Quickness enhancement (limb ${R.limbQui[s]})`,qo,L.qui,v=>v?`+${v}`:'None')
      +sel(`limbs.${s}.plate`,'Body plating',[0,1,2,3,4,5,6],L.plate,v=>v?`Level ${v}`:'None')+(+L.plate?sel(`limbs.${s}.hard`,'Plating type',[['false','Soft (10,000¥/level)'],['true','Hard, hardened (25,000¥/level)']],String(!!L.hard)):'');}
  if(!L.full&&L.hand) body+=sel(`limbs.${s}.hstr`,k==='arm'?'Hand strength (grip only)':'Foot strength (grip only)',[0,1,2,3],L.hstr,v=>v?`+${v}`:'None');
  if(!L.full&&L.fore) body+=sel(`limbs.${s}.fstr`,k==='arm'?'Forearm strength (grip only)':'Lower leg strength (grip only)',[0,1,2,3],L.fstr,v=>v?`+${v}`:'None');
  let extra='';
  if(CB.any(L)){ extra+=`<div class="cb-chks">${chk(`limbs.${s}.cover`,'Semi-natural covering (+10%)',L.cover)}${chk(`limbs.${s}.mag`,'Magnetic system (2,800¥)',L.mag)}</div>`;
   const A=CB.accFor(P,C,E,s);
   extra+=(L.acc.length?`<ul class="cb-acc">${L.acc.map((id,i)=>{const it=E.item(id), a=CB.ACC[id]; const row=R.rows.filter(x=>x.where===label&&x.n===it.n).pop()||{};
      return `<li><div><b>${h(it.n)}</b> <span class="cb-n">${yen(row.cost||0)}${row.ess?` · ${row.ess} Ess`:' · no Essence'} · ${h(it.pg||'')}</span>${a.why?`<span class="cb-w">${h(a.why)}</span>`:''}</div><button type="button" class="cb-x" data-cbdel="${s}|${i}" aria-label="Remove ${h(it.n)}">×</button></li>`;}).join('')}</ul>`:'')
     +(A.yes.length?`<label class="cb-f"><span>Add to this ${k}</span><select data-cbadd="${s}"><option value="">Choose…</option>${A.yes.map(y=>`<option value="${h(y.id)}">${h(y.it.n)} · ${yen(y.row?y.row.cost:0)}${y.row&&y.row.ess?` · ${y.row.ess} Ess`:''}</option>`).join('')}</select></label>`:'');}
  return `<article class="cb-card${CB.any(L)?' on':''}"><header><b>${h(label)}</b><span class="cb-n">${h(CB.word(s,L))}</span></header><div class="cb-grid">${body}</div>${extra}</article>`;};
 const arms=CB.SIDES.filter(x=>x[2]==='arm').map(card).join(''), legs=CB.SIDES.filter(x=>x[2]==='leg').map(card).join('');
 const pairSel=(k,f,lab)=>{const [a,b]=k==='arm'?['la','ra']:['ll','rl']; if(!(P.limbs[a].full&&P.limbs[b].full)) return `<p class="cb-note">${h(lab)}: needs a full cyber${k} on both sides (CT p. 51).</p>`; return `<div class="cb-grid">${sel(f,lab+' (per pair, both limbs)',CB.options(P,C,E,[f],0,3),P[f],v=>v?`+${v} Body`:'None')}</div>`;};
 const ts=(k,n,p)=>{const T=P[k]; return `<article class="cb-card${T.on?' on':''}"><header><b>${n}</b><span class="cb-n">${p}</span></header><div class="cb-chks">${chk(`${k}.on`,`${n} (+1 Body)`,T.on)}</div>${T.on?`<div class="cb-grid">${sel(`${k}.plate`,'Body plating',[0,1,2,3,4,5,6],T.plate,v=>v?`Level ${v}`:'None')}${+T.plate?sel(`${k}.hard`,'Plating type',[['false','Soft'],['true','Hard (hardened)']],String(!!T.hard)):''}</div>`:''}</article>`;};
 const stat=(k,v,sub,on)=>`<div class="cb-t${on?' chg':''}"><span>${h(k)}</span><b>${v}</b>${sub?`<em>${sub}</em>`:''}</div>`;
 const tiles=[stat('Strength (average)',R.avgStr,`natural ${C.str}${R.highStr!==R.avgStr?` · best limb ${R.highStr}`:''} · cap ${R.strCap}`,R.avgStr!==C.str),
   stat('Quickness (average)',R.avgQui,`natural ${C.quick} · cap ${R.quiCap}`,R.avgQui!==C.quick),stat('Body',`+${R.bodyBonus}`,'pairs, enhancements, torso, skull',R.bodyBonus>0),
   stat('Armor from plating',R.plateArmor?`${R.plateArmor} / ${R.plateArmor}`:'—',R.plateArmor?(R.plateHard?'hardened · stacks with worn armor':'stacks with worn armor'):'',R.plateArmor>0),
   stat('Unarmed Power',R.power?`+${R.power}`:'—','+1 per cyberhand or foot, max +2',R.power>0),stat('Spotting the limbs',R.anyCyber?`TN ${R.detectTN}`:'—','base 4 for a short meeting (CT p. 49)',false),
   stat('Cost',yen(R.cost),'',false),stat('Essence',R.ess,'',R.ess>0)].join('');
 return `<div class="cb">${o.intro||''}
  <div class="cb-tiles">${tiles}</div>
  ${R.warn.map(w=>`<p class="cb-warn">${h(w)}</p>`).join('')}${R.bad.map(w=>`<p class="cb-bad">${h(w)}</p>`).join('')}${(o.dropped||[]).length?`<p class="cb-warn">No longer fit, so removed: ${h(o.dropped.join(', '))}.</p>`:''}
  <h4 class="cb-h">Arms</h4><div class="cb-cards">${arms}</div>${pairSel('arm','bodyArms','Body enhancement for the arms')}
  <h4 class="cb-h">Legs</h4><div class="cb-cards">${legs}</div>${pairSel('leg','bodyLegs','Body enhancement for the legs')}
  <h4 class="cb-h">Torso and skull</h4><div class="cb-cards">${ts('torso','Cybertorso','CT p. 37 · halves extra Essence for enhancements')}${ts('skull','Cyberskull','CT p. 37')}</div>
  <div class="cb-chks">${chk('cap4','Count at most 4 plating points per hit location (GM option, CT p. 49)',P.cap4)}</div>
  ${R.rows.length?`<details class="cb-det"><summary>Price and Essence breakdown (${R.rows.length})</summary><table><thead><tr><th>Where</th><th>Item</th><th>¥</th><th>Essence</th></tr></thead><tbody>${R.rows.map(x=>`<tr><td>${h(x.where)}</td><td>${h(x.n)}${x.note?`<div class="cb-w">${h(x.note)}</div>`:''}</td><td>${yen(x.cost)}</td><td>${x.ess||'—'}</td></tr>`).join('')}</tbody></table></details>`:''}
  <p class="cb-note">Rules: CT p. 30–37 (prices), p. 49–52 (Cyberware Rules). Cyberlimbs start at Strength 3 (8 for trolls). Strength and Quickness for melee and Reaction use the average of all four limbs. Enhancement past +3 on a limb costs Essence; a second enhancement type on the same limb costs 10% more. Pairs of full cyberarms or cyberlegs each add +1 Body.</p>
 </div>`;}
// apply a control change to the plan
function apply(P,path,val){const parts=path.split('.'); if(parts[2]==='part'){const L=P.limbs[parts[1]]; L.full=val==='full'||val==='gyro'; L.gyro=val==='gyro'; L.fore=val==='fore'||val==='forehand'; L.hand=val==='hand'||val==='forehand'; return;}
 let o=P; for(let i=0;i<parts.length-1;i++) o=o[parts[i]]; const f=parts[parts.length-1]; o[f]=typeof val==='boolean'?val:(val==='true'?true:val==='false'?false:+val);}
const CSS=`.cb-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:6px;margin:8px 0}.cb-t{border:1px solid var(--line);border-radius:6px;padding:6px 8px;min-width:0}.cb-t span{display:block;font-size:.6875rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}.cb-t b{font-size:1.05rem;font-variant-numeric:tabular-nums}.cb-t em{display:block;font-style:normal;font-size:.72rem;color:var(--muted);line-height:1.3}.cb-t.chg{border-color:var(--accent)}.cb-t.chg b{color:var(--accent)}
.cb-h{margin:14px 0 6px;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.cb-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:8px}
.cb-card{border:1px solid var(--line);border-radius:8px;padding:9px 11px;min-width:0}.cb-card.on{border-left:3px solid var(--accent)}.cb-card header{display:flex;justify-content:space-between;gap:8px;align-items:baseline;margin-bottom:6px}.cb-n{font-size:.78rem;color:var(--muted)}
.cb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:6px 8px}.cb-f{display:flex;flex-direction:column;gap:2px;font-size:.72rem;color:var(--muted);min-width:0;text-transform:none;letter-spacing:0}.cb-f select{font:inherit;font-size:.85rem;padding:4px 6px;border:1px solid var(--line);border-radius:5px;background:transparent;color:inherit;max-width:100%}
.cb-chks{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0;font-size:.82rem}.cb-c{display:inline-flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;font-size:.82rem;flex-direction:row}
.cb-acc{list-style:none;margin:6px 0;padding:0;display:grid;gap:4px}.cb-acc li{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;border-top:1px solid var(--line);padding-top:4px;font-size:.85rem}.cb-w{display:block;font-size:.72rem;color:var(--muted)}.cb-x{border:0;background:none;color:var(--muted);font-size:1.1rem;cursor:pointer;padding:0 4px}
.cb-warn,.cb-bad{margin:6px 0;padding:6px 10px;border-left:3px solid var(--accent);font-size:.85rem;border-radius:3px}.cb-bad{border-color:#c0392b}.cb-note{font-size:.78rem;color:var(--muted);margin:8px 0}
.cb-det{margin-top:10px;font-size:.85rem}.cb-det summary{cursor:pointer;font-weight:600}.cb-det table{width:100%;border-collapse:collapse;margin-top:6px;font-size:.8rem}.cb-det td,.cb-det th{text-align:left;padding:3px 6px;border-top:1px solid var(--line);vertical-align:top}`;
return {view,apply,CSS,partOf};
})();
