// ---------- Item panel (one home for each item; player-approved 2026-11-24, design board row 11) ----------
// A gear item opens one panel: docked on the right on laptops, a tall sheet on phones. Three sections in a fixed order: As
// built (read-only), In play (what changes during a run) and Build (what changes between runs). Things inside an item (a
// deck's programs, a vehicle's mounted weapons) open in the same panel with a way back.
// Stage 1: cyberdecks. The deck's existing card moves into Build while it shows, so its rules code and controls (data-pgck,
// data-pgr, data-pgld, the VR2 deck build, the deck picker) are unchanged; In play's Loaded ticks use the same controls.
// Stage 2: vehicles and drones. Build holds the Rigging build-out (vbEditor, drawn here instead of under Rigging), the stat
// boxes for vehicles without Rigger 2 data, and where the vehicle is kept; the Rigging card keeps the rig's numbers and a
// summary table whose names open the panel. All controls are the page's own (data-vbck/vblv/vbop/vbf, data-vs, data-mnt),
// handled by its document-level listeners, so only one copy of each may exist: the page no longer draws the build-outs.
// Both: the Gear row's note and Gear Locker link come along, since the item's name opens the panel instead of the row fold.
// A click outside the panel, Escape or Close shuts it (popover rule 5 applies to panels too, by the player's call).
(function(){
const IP={open:false,g:null,gi:-1,sec:'built',child:null,cg:null,from:null};
const SECN={built:'As built',play:'In play',build:'Build'};
const $i=id=>document.getElementById(id);
const isDeckLine=g=>!!(g&&g.key&&(/^deck:Custom cyberdeck/.test(g.key)||(GEARDB[g.key]&&GEARDB[g.key].mpcp)));
const isVehLine=g=>!!(g&&g.key&&GEARDB[g.key]&&typeof VSTAT!=='undefined'&&VSTAT[g.key]&&isVehG(g));
const isWeap=g=>!!(g&&g.key&&GEARDB[g.key]&&(WSTAT[g.key]&&WSTAT[g.key][0]!=='grenade'||g.key.startsWith('vweap:')));
const kindOf=g=>isDeckLine(g)?'deck':isVehLine(g)?'veh':null;
const pgc=p=>p?(/^p\./.test(p)?'core '+p:p):'';
const cost=g=>(+g.cost||0)*(+g.qty||1);
const tilesHTML=T=>`<div class="iptiles">${T.map(([k,v,s,cls])=>`<div${cls?` class="${cls}"`:''}><span class="b2k">${esc(k)}</span><b>${esc(String(v))}</b>${s?`<small>${esc(s)}</small>`:''}</div>`).join('')}</div>`;
function deckGi(){const a=typeof activeDeck==='function'?activeDeck():null; const cu=S.gear.findIndex(g=>/^deck:Custom cyberdeck/.test(g.key||'')); if(cu>=0) return cu; return a?S.gear.indexOf(a):S.gear.findIndex(isDeckLine);}
function memBar(used,of,lab){const pct=of&&isFinite(of)?Math.min(100,Math.round(used/of*100)):0;
  return `<div class="ipmem"><div class="ipmemh"><span>${esc(lab)}</span><b>${fmt(used)} of ${fmt(of)} Mp</b></div><div class="ipbar" role="img" aria-label="${esc(lab)}: ${fmt(used)} of ${fmt(of)} Mp"><i style="width:${pct}%"></i></div></div>`;}
function row(k,s,v,cls){return `<div class="iprow${cls?' '+cls:''}"><span>${k}${s?` <small>${esc(s)}</small>`:''}</span><b>${v}</b></div>`;}
const head2=t=>`<span class="b2k">${esc(t)}</span>`;
// the Gear row's own extras: its Gear Locker link (As built) and its note (Build). The note box uses the row's data-gr, so it saves
// the same g.note; its id differs from the row's (g_note_N) so the page keeps one element per id.
function lockerHTML(g){const l=typeof lockerLink==='function'?lockerLink(g.key):''; return l?`<p class="note iplock">${l.trim()}</p>`:'';}
function noteHTML(gi){const g=S.gear[gi]; return `<label class="ipnote">Note <input id="ip_note_${gi}" data-gr="${gi}" data-f="note" value="${esc(g.note||'')}" placeholder="Anything to remember about it" aria-label="Note for this item"></label>`;}

// ---------- decks ----------
function progName(g){const it=GEARDB[g.key]; return esc((it?it.n:g.n||'Program')+(g.r?' '+g.r:''));}
function deckBuilt(dk,g){const vr=!!dk.vr2, tiles=[['MPCP',dk.mpcp],['Hardening',dk.h],['Active memory',fmt(dk.am)+' Mp',fmt(dk.used)+' loaded'],['Storage',fmt(dk.sm)+' Mp',fmt(dk.stored)+' used'],['Load',dk.ls!=null?dk.ls+' Mp/turn':'—'],['I/O',dk.io+' Mp/turn']];
  if(dk.ri) tiles.push(['Response Increase',dk.ri]);
  const mx=typeof matrixInfo==='function'?matrixInfo():null, modes=mx&&typeof mxIniModes==='function'?mxIniModes(mx):[], per=dk.persona||{}, pv=['Bod','Evasion','Masking','Sensors'].map(n=>n+' '+(+per[n]||0)).join(' · ');
  return `${tilesHTML(tiles)}
   <div class="iprows">${mx?row('Hacking Pool',(mx.poolHow?mx.poolHow+' · ':'')+(vr?'VR2 p. 18':'core p. 85'),esc(String(mx.pool))):''}
   ${modes.filter(m=>m.id!=='tort').map(m=>row('Matrix Initiative',(m.sh||m.l)+' · core p. 178',esc(`${m.r} + ${m.d}D6`))).join('')}
   ${row('Persona',vr?'VR2 p. 16–18':'persona chips · core p. 174',Object.values(per).some(v=>+v)?esc(pv):'<span class="b2warn">none yet</span>')}</div>${lockerHTML(g)}`;}
function deckPlay(dk){const L=dk.utils.slice().sort((a,b)=>(GEARDB[a.g.key].n||'').localeCompare(GEARDB[b.g.key].n||''));
  const list=L.map(u=>{const fits=u.g.loaded||dk.used+u.size<=dk.am, why=u.g.loaded?'loaded':fits?'on the deck':`needs ${fmt(dk.used+u.size-dk.am)} Mp more free`;
    return `<div class="ipprog"><input type="checkbox" data-pgld="D" data-pgid="${esc(u.g.key)}" aria-label="Load ${progName(u.g)}"${u.g.loaded?' checked':''}${fits?'':' disabled'}><button type="button" class="iplink" data-ipchild="${u.i}">${progName(u.g)}</button><small class="${fits?'':'b2warn'}">${esc(why)}</small><b>${fmt(u.size)} Mp</b></div>`;}).join('');
  return `${memBar(dk.used,dk.am,'Active memory')}
   <div class="ipsec">${head2('Programs on the deck · tick what you load for the run')}${list||'<p class="note">No programs on this deck yet. Add them under Build.</p>'}</div>
   ${(dk.loose||[]).length?`<p class="note">Typed in by hand: ${dk.loose.map(g=>esc(g.n||'program')).join(', ')} (not counted in memory).</p>`:''}
   <p class="note">Ticks take effect at once, and the Attack menu flags a program that isn't loaded. Storage on the deck: ${fmt(dk.stored)} of ${fmt(dk.sm)} Mp.</p>`;}
function deckChild(dk,i){const g=S.gear[i], it=g&&GEARDB[g.key]; if(!it) return '<p class="note">That program is no longer on the sheet.</p>';
  const u=dk.utils.find(x=>x.i===i), size=u?u.size:0, fits=g.loaded||dk.used+size<=dk.am, d=DESC[g.key]?DESC[g.key][0]:'';
  return `${d?`<p>${esc(d)}</p>`:''}${tilesHTML([['Rating',g.r||1],['Size',fmt(size)+' Mp'],['Price',fmt(cost(g))+'¥']])}
   <label class="ipload"><input type="checkbox" data-pgld="D" data-pgid="${esc(g.key)}"${g.loaded?' checked':''}${fits?'':' disabled'}> Loaded for this run <small class="${fits?'':'b2warn'}">${esc(g.loaded?'in active memory':fits?fmt(dk.am-dk.used)+' Mp free':`needs ${fmt(dk.used+size-dk.am)} Mp more free`)}</small></label>
   <p class="note">Change its rating under Build. ${esc(pgc(it.pg))}</p>`;}
// the deck card lives in the page (hidden) unless the panel's Build section shows it
function cardHome(){const c=$i('deckCard'), h=$i('ipDeckHome'); if(c&&h&&c.parentElement!==h.parentElement){h.parentElement.insertBefore(c,h.nextSibling);}}
function cardIn(){const c=$i('deckCard'), host=$i('ipHost'); if(c&&host&&c.parentElement!==host){host.appendChild(c); c.hidden=false;}}

// ---------- vehicles and drones ----------
const STATN=['Handling','Speed','Body','Armor','Signature','Pilot'];
function vehInfo(gi){const g=S.gear[gi], it=GEARDB[g.key], name=vehName(g), r2=typeof R2OBJ!=='undefined'&&!!R2OBJ[g.key];
  let v=null, R=null, tiles;
  if(r2){v=vbFixG(g); R=v?VB.calc(v,g.vb):null;}
  if(v&&R){tiles=VB.statLine(v,R.s).map(([k,a,b])=>[k,b,String(a)!==String(b)?'was '+a:'',String(a)!==String(b)?'chg':'']);
    // the stat line leaves out Body (Rigging shows it in its own column) and the cargo and load the build-out works against
    const at=Math.max(0,tiles.findIndex(t=>t[0]==='Accel')+1)||2; tiles.splice(at,0,['Body',v.B]);
    tiles.push(['Cargo space',VB.fmtN(R.Cmax)+' CF',R.cf?VB.fmtN(R.cf)+' used':''],['Load',VB.fmtN(R.Lmax)+' kg',R.load?VB.fmtN(R.load)+' kg used':'']);}
  else {const d=VSTAT[g.key]||[], o=g.vs||{}; tiles=STATN.map((l,j)=>{const typed=o[j]!==undefined&&o[j]!=='', x=typed?o[j]:d[j]; return [l,x==null||x===''?'?':x,x==null||x===''?'not listed: fill it in under Build':typed&&d[j]!=null&&String(d[j])!==String(o[j])?'book '+d[j]:'',x==null||x===''?'bad':''];});}
  const here=S.gear.map((w,i)=>[w,i]).filter(([w])=>w!==g&&w.at===name), weap=here.filter(([w])=>isWeap(w)), other=here.filter(([w])=>!isWeap(w));
  const drone=v?!!v.drone:/drone/i.test((GCATNAME[g.cat]||'')+' '+(it.s||''));
  return {g,gi,it,name,r2,v,R,tiles,weap,other,drone,mounts:typeof vehMounts==='function'?vehMounts(name):null,kind:(drone?'Drone':'Vehicle')+' · '+pgc(r2?R2OBJ[g.key].pg:it.pg)};}
const weapRow=([w,i])=>`<div class="iprow"><span><button type="button" class="iplink" data-ipchild="${i}">${esc(GEARDB[w.key].n)}</button>${GEARDB[w.key].s?` <small>${esc(GEARDB[w.key].s)}</small>`:''}</span><b>${fmt(cost(w))}¥</b></div>`;
function vehBuilt(V){const M=V.mounts, R=V.R;
  const mods=R&&R.rows.length?R.rows.map(r=>row(esc(r.d.n)+(r.d.kind==='level'||r.l>1?' '+r.l:''),'',(r.cost?fmt(r.cost)+'¥':'—'))).join(''):row('None yet','',V.r2?'—':'');
  return `${tilesHTML(V.tiles)}
   <div class="iprows">${head2(V.r2?'Modifications · R2 p. 118–146':'Modifications')}
   ${V.r2?mods:'<p class="note">Build-outs use the Rigger 2 list (it has cargo space and load). Add the Rigger 2 version of this vehicle from Gear to customize it.</p>'}
   ${head2('Weapons')}
   ${M&&M.n!=null?row('Weapon mounts',M.tur?'plus a turret, which holds weapons by Weapon Value (R2 p. 135)':'R2 p. 131–135',`${M.used} of ${M.n} used`):''}
   ${V.weap.length?V.weap.map(weapRow).join(''):row('None mounted','set a gun’s Mounted on, or move it here in Stash','')}
   ${V.other.length?row('Also stowed in it',V.other.map(([w])=>esc(w.name||(GEARDB[w.key]||{}).n||'item')).join(', '),''):''}</div>${lockerHTML(V.g)}`;}
function rigNow(){const vcr=gearLevel('body:Vehicle Control Rig'), base=Math.floor((attrNow('quick')+attrNow('int'))/2), r2=booksOn().r2; return {vcr,base,r2};}
function vehPlay(V){const g=V.g, rg=rigNow(), dmg=Math.max(0,Math.min(10,+g.vdmg||0)), X=window.SR2B2||{}, lvl=X.VDM?X.VDM(dmg):'', mod=X.VDMT?X.VDMT(dmg):0;
  return `<div class="iprows">${head2(rg.vcr?`Rigged · Vehicle Control Rig ${rg.vcr}`:'Rigging')}
   ${rg.vcr?row('Control Pool',rg.r2?'R2 p. 16':'core p. 85',esc(String(rg.base+2*rg.vcr)))+row('Rigged Initiative','Reaction + rig',esc(`${rg.base+2*rg.vcr} + ${1+rg.vcr}D6`)):row('Control Pool','needs a Vehicle Control Rig · core p. 85','—')}
   ${head2('Damage')}
   ${row(dmg?esc(lvl):'Undamaged',dmg?`${dmg} of 10 boxes · +${mod} to its Position and Crash Tests · core p. 109`:'core p. 109',dmg?esc(String(dmg)):'0')}
   ${head2('Weapons on it')}
   ${V.weap.length?V.weap.map(weapRow).join(''):row('None mounted','','')}
   ${head2('Kept at')}
   ${row(esc(g.at||`With ${S.handle||S.name||'you'}`),'change it under Build','')}
   ${rg.r2?row('Monthly overhead','1% of its cost, rounded up, plus 10¥ per Stress Point that month · R2 p. 18',fmt(Math.ceil((+g.cost||0)/100))+'¥'):''}</div>
   <p class="note">Mark damage or repair it, and roll its tests, under Game night › Vehicle tests. Its weapons fire from the Attack panel with Gunnery (R2 p. 58).</p>`;}
function vehBuild(V){const g=V.g, gi=V.gi;
  let ed='';
  if(V.r2){VB_OPEN.add(gi); ed=vbEditor(g,gi).replace(/^\s*<details[^>]*>\s*<summary>[\s\S]*?<\/summary>/,'<div class="wb vbuild ipvb">').replace(/<\/details>\s*$/,'</div>');}
  else {const d=VSTAT[g.key]||[], o=g.vs||{};
    ed=`<div class="ipvs">${STATN.map((l,j)=>{const x=o[j]!==undefined&&o[j]!==''?o[j]:(d[j]??''); return `<label>${l}<input data-vs="${gi}" data-j="${j}" value="${esc(String(x))}" placeholder="?" class="${d[j]==null&&(o[j]===undefined||o[j]==='')?'bad-text':''}"></label>`;}).join('')}</div>
     <p class="note">Stats from the book: core p. 264–265 (cruise/max speed) or FoF p. 62–69. A red box means that stat isn’t listed here; fill it in from the book. Build-outs use the Rigger 2 list: add its Rigger 2 version from Gear to customize it.</p>`;}
  const P=typeof stashPlaces==='function'?stashPlaces().filter(p=>p!==V.name):[];
  const kept=`<label class="ipkept">Kept at <select data-mnt="${gi}"><option value="">With ${esc(S.handle||S.name||'you')}</option>${P.map(p=>`<option value="${esc(p)}"${g.at===p?' selected':''}>${esc(p)}</option>`).join('')}</select></label>`;
  return `${ed}<div class="ipsec">${head2('Where it lives')}${kept}<p class="note">Places come from Stash and storage; a drone can ride in a van.</p></div>`;}
function vehChild(V,i){const w=S.gear[i], it=w&&GEARDB[w.key]; if(!it) return '<p class="note">That weapon is no longer on the sheet.</p>';
  const d=DESC[w.key]?DESC[w.key][0]:'';
  return `${d?`<p>${esc(d)}</p>`:''}${it.s?`<p class="note">${esc(it.s)}</p>`:''}${tilesHTML([['Price',fmt(cost(w))+'¥'],['Mounted on',w.at===V.name?V.name:w.at||'carried']])}
   ${typeof mountHTML==='function'?mountHTML(w,i).replace(/id="g_mnt_/,'id="ip_mnt_').replace(/for="g_mnt_/,'for="ip_mnt_'):''}
   <p class="note">Its add-ons are under Weapons and armor › Add-ons. ${esc(pgc(it.pg))}</p>`;}

// ---------- the panel ----------
function draw(){const P=$i('b2item'); if(!IP.open||!P) return; const g=S.gear[IP.gi], k=kindOf(g); if(!k){close(); return;}
  const ch=IP.child!=null&&S.gear[IP.child]?IP.child:null; if(ch==null) IP.child=null;
  const body=$i('ipBody'), host=$i('ipHost'), foot=$i('ipFoot'); let name, price, kind, childName='', childKind='', html='';
  if(k==='deck'){const dk=typeof deckInfo==='function'?deckInfo():null; if(!dk){close(); return;}
    name=dk.name; price=S.gear.filter(x=>(x.key&&/^(deck|prog2?):/.test(x.key))||(!x.key&&(x.cat==='deck'||x.cat==='prog'))).reduce((a,x)=>a+cost(x),0); kind='Cyberdeck · '+pgc(GEARDB[g.key]&&GEARDB[g.key].pg)+' · deck, programs and options';
    if(ch!=null){childName=progName(S.gear[ch]); childKind='Program on the '+esc(name)+' · '+esc(pgc(GEARDB[S.gear[ch].key].pg)); html=deckChild(dk,ch);}
    else if(IP.sec!=='build') html=IP.sec==='play'?deckPlay(dk):deckBuilt(dk,g);}
  else {const V=vehInfo(IP.gi); name=V.name; price=cost(g); kind=V.kind;
    if(ch!=null){const w=S.gear[ch]; childName=esc(GEARDB[w.key].n); childKind=(w.at===V.name?'Mounted on the ':'Was on the ')+esc(name)+' · '+esc(pgc(GEARDB[w.key].pg)); html=vehChild(V,ch);}
    else html=IP.sec==='play'?vehPlay(V):IP.sec==='build'?vehBuild(V):vehBuilt(V);}
  const crumb=ch!=null?`<button type="button" class="ghost ipback" data-ipback="1">‹ ${esc(name)}</button>`:'';
  $i('ipHead').innerHTML=`<div class="iptop">${crumb}<span class="ipcrumb">${ch!=null?esc(name)+' › '+childName:'Gear › '+esc(name)}</span><button type="button" class="ghost ipx" data-ipx="1">Close</button></div>
   <div class="iph"><h2 id="ipTitle">${ch!=null?childName:esc(name)}</h2><b>${fmt(ch!=null?cost(S.gear[ch]):price)}¥</b></div>
   <p class="ipkind">${ch!=null?childKind:esc(kind)}</p>
   ${ch==null?`<div class="iptabs" role="tablist" aria-label="Sections">${Object.keys(SECN).map(s=>`<button type="button" role="tab" data-ipsec="${s}" aria-selected="${IP.sec===s}">${SECN[s]}</button>`).join('')}</div>`:''}`;
  const deckBuild=k==='deck'&&ch==null&&IP.sec==='build';
  if(deckBuild){body.hidden=true; body.innerHTML=''; host.hidden=false; cardIn();}
  else {cardHome(); host.hidden=true; body.hidden=false; body.innerHTML=html;}
  foot.hidden=!(ch==null&&IP.sec==='build'); foot.innerHTML=foot.hidden?'':noteHTML(IP.gi);
  P.setAttribute('aria-labelledby','ipTitle');}
function stub(){const s=$i('ipDeckHome'); if(!s) return; const gi=deckGi(), dk=gi>=0&&typeof deckInfo==='function'?deckInfo():null;
  document.body.classList.toggle('b2ipdk',!!dk); s.hidden=!dk; if(!dk){s.innerHTML=''; return;}
  const n=dk.utils.length, ld=dk.utils.filter(u=>u.g.loaded).length;
  s.innerHTML=`<div class="ipstub"><button type="button" class="iplink" data-ipopen="${gi}">${esc(dk.name)}</button><small>Cyberdeck · MPCP ${dk.mpcp}</small><span class="ipchip">${ld} of ${n} loaded · ${fmt(dk.used)}/${fmt(dk.am)} Mp</span></div>`;}
function open(gi,sec,from){if(gi<0||!kindOf(S.gear[gi])) return; IP.open=true; IP.gi=gi; IP.g=S.gear[gi]; IP.child=null; IP.cg=null; IP.sec=sec||(document.body.classList.contains('b2gn')?'play':'build'); IP.from=from||null;
  let P=$i('b2item'); document.body.classList.add('b2ip');
  if(!P){P=document.createElement('aside'); P.id='b2item'; P.className='b2item'; P.setAttribute('aria-label','Item'); P.innerHTML='<div id="ipHead"></div><div id="ipBody"></div><div id="ipHost" hidden></div><div id="ipFoot" hidden></div>'; document.body.appendChild(P);
    const sc=document.createElement('button'); sc.type='button'; sc.id='b2ipscrim'; sc.className='b2ipscrim'; sc.tabIndex=-1; sc.setAttribute('aria-label','Close'); sc.dataset.ipx='1'; document.body.appendChild(sc);}
  P.hidden=false; $i('b2ipscrim').hidden=false; draw(); syncBtns(); const t=P.querySelector('[data-ipsec][aria-selected="true"]')||P.querySelector('.ipx'); if(t) t.focus({preventScroll:true});}
function close(){if(!IP.open) return; IP.open=false; IP.g=null; IP.cg=null; cardHome(); const P=$i('b2item'); if(P) P.hidden=true; const sc=$i('b2ipscrim'); if(sc) sc.hidden=true; document.body.classList.remove('b2ip'); syncBtns();
  const f=IP.from&&document.querySelector(IP.from); IP.from=null; if(f&&f.offsetParent!==null) f.focus({preventScroll:true});}
// the openers say whether the panel is open: Open the deck reads Close the deck while it is, like the old fold
function syncBtns(){const on=IP.open&&IP.gi===deckGi();
  document.querySelectorAll('[data-st="deck"]').forEach(b=>{b.setAttribute('aria-expanded',String(on)); b.setAttribute('aria-controls','b2item'); if(b.classList.contains('gdeckbtn')) b.textContent=on?'Close the deck':'Open the deck';});
  document.querySelectorAll('[data-ipopen]').forEach(b=>{b.setAttribute('aria-expanded',String(IP.open&&IP.gi===+b.dataset.ipopen)); b.setAttribute('aria-controls','b2item');});
  document.querySelectorAll('#gearBody .gname[data-gopen]').forEach(b=>{const i=+b.dataset.gopen, k=kindOf(S.gear[i]); if(k==='veh'||(k==='deck'&&i===deckGi())){b.setAttribute('aria-expanded',String(IP.open&&IP.gi===i)); b.setAttribute('aria-controls','b2item');}});}
// an opener pressed again while its item is showing closes the panel (a toggle, as Open the deck was)
const toggle=(gi,sec,from)=>{if(IP.open&&IP.gi===gi) close(); else open(gi,sec,from);};
// the page keeps a one-line deck row where the card was (Game night's Gear and ammo shows it; the Runner tab has the Gear row)
function mount(){const c=$i('deckCard'); if(!c||$i('ipDeckHome')) return; const s=document.createElement('section'); s.id='ipDeckHome'; s.className='card ses ipdeckhome'; s.hidden=true; c.parentElement.insertBefore(s,c);}
// the open item is followed by identity, so removing a line above it (or a Stash merge) doesn't switch the panel to another item
function follow(){if(!IP.open) return; const i=S.gear.indexOf(IP.g); if(i<0){close(); return;} IP.gi=i;
  if(IP.child!=null){const c=S.gear.indexOf(IP.cg); IP.child=c<0?null:c; if(c<0) IP.cg=null;}}
const _render=render; render=function(){_render.apply(this,arguments); try{mount(); stub(); follow(); if(IP.open&&!kindOf(S.gear[IP.gi])) close(); if(IP.open) draw(); syncBtns();}catch(err){console.error(err);}};
// openers: an item's Gear row name (the deck in use, any vehicle), Open the deck, the one-line deck row and Rigging's vehicle names
// (data-ipopen); inside: sections, a thing inside the item, back, close
document.addEventListener('click',e=>{const t=e.target; if(!t||!t.closest) return;
  const op=t.closest('[data-ipopen]'); if(op){e.preventDefault(); e.stopPropagation(); toggle(+op.dataset.ipopen,null,`[data-ipopen="${op.dataset.ipopen}"]`); return;}
  const gn=t.closest('.gname[data-gopen]'); if(gn){const i=+gn.dataset.gopen, k=kindOf(S.gear[i]); if(k==='veh'||(k==='deck'&&i===deckGi())){e.preventDefault(); e.stopPropagation(); toggle(i,null,`.gname[data-gopen="${i}"]`); return;}}
  const db=t.closest('[data-st="deck"]'); if(db){e.preventDefault(); e.stopPropagation(); toggle(deckGi(),'build','[data-st="deck"]'); return;}
  if(!IP.open) return;
  const P=$i('b2item'); if(t.closest('[data-ipx]')){close(); return;}
  if(P&&P.contains(t)){const s=t.closest('[data-ipsec]'); if(s){IP.sec=s.dataset.ipsec; IP.child=null; IP.cg=null; draw(); const n=P.querySelector(`[data-ipsec="${IP.sec}"]`); if(n) n.focus({preventScroll:true}); return;}
    const c=t.closest('[data-ipchild]'); if(c){IP.child=+c.dataset.ipchild; IP.cg=S.gear[IP.child]; draw(); const b=P.querySelector('.ipback'); if(b) b.focus({preventScroll:true}); return;}
    if(t.closest('[data-ipback]')){const k=IP.child; IP.child=null; IP.cg=null; draw(); const n=P.querySelector(`[data-ipchild="${k}"]`)||P.querySelector('[data-ipsec][aria-selected="true"]'); if(n) n.focus({preventScroll:true});}
    return;}
  close();},true);
// a control inside the panel keeps focus after the redraw its change causes. Found again by its data attributes (the page's own
// refocus helpers look in the whole page). Capture phase, because the page's change handler redraws the panel before a
// bubbling listener would run, and the changed control is gone by then.
const sig=el=>{const a=[...el.attributes].filter(x=>/^data-/.test(x.name)&&!/^data-(st|ipsec)$/.test(x.name)).map(x=>`[${x.name}="${CSS.escape(x.value)}"]`).join(''); return a?el.tagName.toLowerCase()+a:(el.id?'#'+CSS.escape(el.id):null);};
// Ticks and menus: focus goes back to the changed control (the page's handlers redraw at once, so it is found by its attributes).
// Typed boxes: their change fires as they are left, before Tab moves focus on, so the panel waits for the move, notes where focus
// went, then redraws if needed and puts it there; focus never jumps back to the box just left.
// A stat box (data-vs) saves as it's typed without redrawing; leaving it redraws, so Rigging's table shows the new number.
const typed=el=>el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&!/^(checkbox|radio|button|submit|range|color|file)$/.test(el.type));
const refocus=sel=>{const p=$i('b2item'), n=sel&&p&&p.querySelector(sel); if(n&&document.activeElement!==n) n.focus({preventScroll:true});};
document.addEventListener('change',e=>{const t=e.target, P=$i('b2item'); if(!P||!t||!P.contains(t)) return;
  if(typed(t)){const redraw=!!(t.dataset&&t.dataset.vs!==undefined);
    setTimeout(()=>{const a=document.activeElement, p=$i('b2item'), sel=a&&a!==document.body&&p&&p.contains(a)?sig(a):null; if(redraw) render(); refocus(sel);},0); return;}
  const sel=sig(t); if(sel) setTimeout(()=>refocus(sel),0);},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&IP.open){e.preventDefault(); close();}});
// redraw: the wrapped render (window.__sr2.render is the page's own, from before the modules wrapped it); checks use it
window.SR2IP={open:(gi,sec)=>open(gi==null?deckGi():gi,sec||'built'),close,state:IP,deckGi,kindOf,redraw:()=>render()};
// a saved runner is drawn once before this module wraps render (page load): draw again now, so the deck row is added and Rigging
// switches to its summary table (it checks for window.SR2IP)
try{render();}catch(err){console.error(err);}
})();
