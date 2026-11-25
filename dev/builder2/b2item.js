// ---------- Item panel, stage 1: decks (one home for each item; player-approved 2026-11-24, design board row 11) ----------
// A gear item opens one panel: docked on the right on laptops, a tall sheet on phones. Three sections in a fixed order: As
// built (read-only), In play (what changes during a run) and Build (what changes between runs). Stage 1 covers cyberdecks
// and their programs. The deck's existing card moves into Build while it shows, so its rules code and controls (data-pgck,
// data-pgr, data-pgld, the VR2 deck build, the deck picker) are unchanged; In play's Loaded ticks use the same controls.
// A click outside the panel, Escape or Close shuts it (popover rule 5 applies to panels too, by the player's call).
(function(){
const IP={open:false,gi:-1,sec:'built',child:null,from:null};
const SECN={built:'As built',play:'In play',build:'Build'};
const $i=id=>document.getElementById(id);
const lap=()=>window.matchMedia('(min-width:40.0625em)').matches;
const isDeckLine=g=>!!(g&&g.key&&(/^deck:Custom cyberdeck/.test(g.key)||(GEARDB[g.key]&&GEARDB[g.key].mpcp)));
const pgc=p=>p?(/^p\./.test(p)?'core '+p:p):'';
function deckGi(){const a=typeof activeDeck==='function'?activeDeck():null; const cu=S.gear.findIndex(g=>/^deck:Custom cyberdeck/.test(g.key||'')); if(cu>=0) return cu; return a?S.gear.indexOf(a):S.gear.findIndex(isDeckLine);}
function memBar(used,of,lab){const pct=of&&isFinite(of)?Math.min(100,Math.round(used/of*100)):0;
  return `<div class="ipmem"><div class="ipmemh"><span>${esc(lab)}</span><b>${fmt(used)} of ${fmt(of)} Mp</b></div><div class="ipbar" role="img" aria-label="${esc(lab)}: ${fmt(used)} of ${fmt(of)} Mp"><i style="width:${pct}%"></i></div></div>`;}
function row(k,s,v,cls){return `<div class="iprow${cls?' '+cls:''}"><span>${k}${s?` <small>${esc(s)}</small>`:''}</span><b>${v}</b></div>`;}
function progName(g){const it=GEARDB[g.key]; return esc((it?it.n:g.n||'Program')+(g.r?' '+g.r:''));}
function builtHTML(dk){const vr=!!dk.vr2, tiles=[['MPCP',dk.mpcp],['Hardening',dk.h],['Active memory',fmt(dk.am)+' Mp',fmt(dk.used)+' loaded'],['Storage',fmt(dk.sm)+' Mp',fmt(dk.stored)+' used'],['Load',dk.ls!=null?dk.ls+' Mp/turn':'—'],['I/O',dk.io+' Mp/turn']];
  if(dk.ri) tiles.push(['Response Increase',dk.ri]);
  const mx=typeof matrixInfo==='function'?matrixInfo():null, modes=mx&&typeof mxIniModes==='function'?mxIniModes(mx):[], per=dk.persona||{}, pv=['Bod','Evasion','Masking','Sensors'].map(n=>n+' '+(+per[n]||0)).join(' · ');
  return `<div class="iptiles">${tiles.map(([k,v,s])=>`<div><span class="b2k">${esc(k)}</span><b>${esc(String(v))}</b>${s?`<small>${esc(s)}</small>`:''}</div>`).join('')}</div>
   <div class="iprows">${mx?row('Hacking Pool',(mx.poolHow?mx.poolHow+' · ':'')+(vr?'VR2 p. 18':'core p. 85'),esc(String(mx.pool))):''}
   ${modes.filter(m=>m.id!=='tort').map(m=>row('Matrix Initiative',(m.sh||m.l)+' · core p. 178',esc(`${m.r} + ${m.d}D6`))).join('')}
   ${row('Persona',vr?'VR2 p. 16–18':'persona chips · core p. 174',Object.values(per).some(v=>+v)?esc(pv):'<span class="b2warn">none yet</span>')}</div>`;}
function playHTML(dk){const L=dk.utils.slice().sort((a,b)=>(GEARDB[a.g.key].n||'').localeCompare(GEARDB[b.g.key].n||''));
  const list=L.map(u=>{const fits=u.g.loaded||dk.used+u.size<=dk.am, why=u.g.loaded?'loaded':fits?'on the deck':`needs ${fmt(dk.used+u.size-dk.am)} Mp more free`;
    return `<div class="ipprog"><input type="checkbox" data-pgld="D" data-pgid="${esc(u.g.key)}" aria-label="Load ${progName(u.g)}"${u.g.loaded?' checked':''}${fits?'':' disabled'}><button type="button" class="iplink" data-ipchild="${u.i}">${progName(u.g)}</button><small class="${fits?'':'b2warn'}">${esc(why)}</small><b>${fmt(u.size)} Mp</b></div>`;}).join('');
  return `${memBar(dk.used,dk.am,'Active memory')}
   <div class="ipsec"><span class="b2k">Programs on the deck · tick what you load for the run</span>${list||'<p class="note">No programs on this deck yet. Add them under Build.</p>'}</div>
   ${(dk.loose||[]).length?`<p class="note">Typed in by hand: ${dk.loose.map(g=>esc(g.n||'program')).join(', ')} (not counted in memory).</p>`:''}
   <p class="note">Ticks take effect at once, and the Attack menu flags a program that isn't loaded. Storage on the deck: ${fmt(dk.stored)} of ${fmt(dk.sm)} Mp.</p>`;}
function childHTML(dk,i){const g=S.gear[i], it=g&&GEARDB[g.key]; if(!it) return '<p class="note">That program is no longer on the sheet.</p>';
  const u=dk.utils.find(x=>x.i===i), size=u?u.size:0, fits=g.loaded||dk.used+size<=dk.am, d=DESC[g.key]?DESC[g.key][0]:'';
  return `${d?`<p>${esc(d)}</p>`:''}<div class="iptiles"><div><span class="b2k">Rating</span><b>${esc(String(g.r||1))}</b></div><div><span class="b2k">Size</span><b>${fmt(size)} Mp</b></div><div><span class="b2k">Price</span><b>${fmt((+g.cost||0)*(+g.qty||1))}¥</b></div></div>
   <label class="ipload"><input type="checkbox" data-pgld="D" data-pgid="${esc(g.key)}"${g.loaded?' checked':''}${fits?'':' disabled'}> Loaded for this run <small class="${fits?'':'b2warn'}">${esc(g.loaded?'in active memory':fits?fmt(dk.am-dk.used)+' Mp free':`needs ${fmt(dk.used+size-dk.am)} Mp more free`)}</small></label>
   <p class="note">Change its rating under Build. ${esc(pgc(it.pg))}</p>`;}
// the deck card lives in the page (hidden) unless the panel's Build section shows it
function cardHome(){const c=$i('deckCard'), h=$i('ipDeckHome'); if(c&&h&&c.parentElement!==h.parentElement){h.parentElement.insertBefore(c,h.nextSibling);}}
function cardIn(){const c=$i('deckCard'), host=$i('ipHost'); if(c&&host&&c.parentElement!==host){host.appendChild(c); c.hidden=false;}}
function draw(){const P=$i('b2item'), dk=typeof deckInfo==='function'?deckInfo():null, g=S.gear[IP.gi];
  if(!IP.open||!P) return; if(!dk||!isDeckLine(g)){close(); return;}
  const it=GEARDB[g.key], ch=IP.child!=null&&S.gear[IP.child]?IP.child:null; if(ch==null) IP.child=null;
  const name=dk.name, price=S.gear.filter(x=>(x.key&&/^(deck|prog2?):/.test(x.key))||(!x.key&&(x.cat==='deck'||x.cat==='prog'))).reduce((a,x)=>a+(+x.cost||0)*(+x.qty||1),0);
  const crumb=ch!=null?`<button type="button" class="ghost ipback" data-ipback="1">‹ ${esc(name)}</button>`:'';
  const head=`<div class="iptop">${crumb}<span class="ipcrumb">${esc(ch!=null?name+' › '+progName(S.gear[ch]).replace(/&amp;/g,'&'):'Gear › '+name)}</span><button type="button" class="ghost ipx" data-ipx="1">Close</button></div>
   <div class="iph"><h2 id="ipTitle">${ch!=null?progName(S.gear[ch]):esc(name)}</h2><b>${ch!=null?fmt((+S.gear[ch].cost||0)*(+S.gear[ch].qty||1)):fmt(price)}¥</b></div>
   <p class="ipkind">${ch!=null?'Program on the '+esc(name)+' · '+esc(pgc(GEARDB[S.gear[ch].key].pg)):'Cyberdeck · '+esc(pgc(it&&it.pg))+(ch==null?' · deck, programs and options':'')}</p>
   ${ch==null?`<div class="iptabs" role="tablist" aria-label="Sections">${Object.keys(SECN).map(s=>`<button type="button" role="tab" data-ipsec="${s}" aria-selected="${IP.sec===s}">${SECN[s]}</button>`).join('')}</div>`:''}`;
  $i('ipHead').innerHTML=head;
  const body=$i('ipBody'), host=$i('ipHost');
  if(ch!=null){cardHome(); host.hidden=true; body.hidden=false; body.innerHTML=childHTML(dk,ch);}
  else if(IP.sec==='build'){body.hidden=true; body.innerHTML=''; host.hidden=false; cardIn();}
  else {cardHome(); host.hidden=true; body.hidden=false; body.innerHTML=IP.sec==='play'?playHTML(dk):builtHTML(dk);}
  P.setAttribute('aria-labelledby','ipTitle');}
function stub(){const s=$i('ipDeckHome'); if(!s) return; const gi=deckGi(), dk=gi>=0&&typeof deckInfo==='function'?deckInfo():null;
  document.body.classList.toggle('b2ipdk',!!dk); s.hidden=!dk; if(!dk){s.innerHTML=''; return;}
  const n=dk.utils.length, ld=dk.utils.filter(u=>u.g.loaded).length;
  s.innerHTML=`<div class="ipstub"><button type="button" class="iplink" data-ipopen="${gi}">${esc(dk.name)}</button><small>Cyberdeck · MPCP ${dk.mpcp}</small><span class="ipchip">${ld} of ${n} loaded · ${fmt(dk.used)}/${fmt(dk.am)} Mp</span></div>`;}
function open(gi,sec,from){if(gi<0||!isDeckLine(S.gear[gi])) return; IP.open=true; IP.gi=gi; IP.child=null; IP.sec=sec||(document.body.classList.contains('b2gn')?'play':'build'); IP.from=from||null;
  let P=$i('b2item'); document.body.classList.add('b2ip');
  if(!P){P=document.createElement('aside'); P.id='b2item'; P.className='b2item'; P.setAttribute('aria-label','Item'); P.innerHTML='<div id="ipHead"></div><div id="ipBody"></div><div id="ipHost" hidden></div>'; document.body.appendChild(P);
    const sc=document.createElement('button'); sc.type='button'; sc.id='b2ipscrim'; sc.className='b2ipscrim'; sc.tabIndex=-1; sc.setAttribute('aria-label','Close'); sc.dataset.ipx='1'; document.body.appendChild(sc);}
  P.hidden=false; $i('b2ipscrim').hidden=false; draw(); syncBtns(); const t=P.querySelector('[data-ipsec][aria-selected="true"]')||P.querySelector('.ipx'); if(t) t.focus({preventScroll:true});}
function close(){if(!IP.open) return; IP.open=false; cardHome(); const P=$i('b2item'); if(P) P.hidden=true; const sc=$i('b2ipscrim'); if(sc) sc.hidden=true; document.body.classList.remove('b2ip'); syncBtns();
  const f=IP.from&&document.querySelector(IP.from); IP.from=null; if(f&&f.offsetParent!==null) f.focus({preventScroll:true});}
// the openers say whether the panel is open: Open the deck reads Close the deck while it is, like the old fold
function syncBtns(){const on=IP.open&&IP.gi===deckGi();
  document.querySelectorAll('[data-st="deck"]').forEach(b=>{b.setAttribute('aria-expanded',String(on)); b.setAttribute('aria-controls','b2item'); if(b.classList.contains('gdeckbtn')) b.textContent=on?'Close the deck':'Open the deck';});
  document.querySelectorAll('[data-ipopen]').forEach(b=>{b.setAttribute('aria-expanded',String(IP.open&&IP.gi===+b.dataset.ipopen)); b.setAttribute('aria-controls','b2item');});}
// an opener pressed again while its item is showing closes the panel (a toggle, as Open the deck was)
const toggle=(gi,sec,from)=>{if(IP.open&&IP.gi===gi) close(); else open(gi,sec,from);};
// the page keeps a one-line deck row where the card was (Game night's Gear and ammo shows it; the Runner tab has the Gear row)
function mount(){const c=$i('deckCard'); if(!c||$i('ipDeckHome')) return; const s=document.createElement('section'); s.id='ipDeckHome'; s.className='card ses ipdeckhome'; s.hidden=true; c.parentElement.insertBefore(s,c);}
const _render=render; render=function(){_render.apply(this,arguments); try{mount(); stub(); if(IP.open&&!isDeckLine(S.gear[IP.gi])) close(); if(IP.open) draw(); syncBtns();}catch(err){console.error(err);}};
// openers: the deck's Gear row name, its Open the deck button, the one-line deck row; inside: sections, a program, back, close
document.addEventListener('click',e=>{const t=e.target; if(!t||!t.closest) return;
  const op=t.closest('[data-ipopen]'); if(op){e.preventDefault(); e.stopPropagation(); toggle(+op.dataset.ipopen,null,`[data-ipopen="${op.dataset.ipopen}"]`); return;}
  const gn=t.closest('.gname[data-gopen]'); if(gn&&isDeckLine(S.gear[+gn.dataset.gopen])&&+gn.dataset.gopen===deckGi()){e.preventDefault(); e.stopPropagation(); toggle(+gn.dataset.gopen,null,`.gname[data-gopen="${gn.dataset.gopen}"]`); return;}
  const db=t.closest('[data-st="deck"]'); if(db){e.preventDefault(); e.stopPropagation(); toggle(deckGi(),'build','[data-st="deck"]'); return;}
  if(!IP.open) return;
  const P=$i('b2item'); if(t.closest('[data-ipx]')){close(); return;}
  if(P&&P.contains(t)){const s=t.closest('[data-ipsec]'); if(s){IP.sec=s.dataset.ipsec; IP.child=null; draw(); const n=P.querySelector(`[data-ipsec="${IP.sec}"]`); if(n) n.focus({preventScroll:true}); return;}
    const c=t.closest('[data-ipchild]'); if(c){IP.child=+c.dataset.ipchild; draw(); const b=P.querySelector('.ipback'); if(b) b.focus({preventScroll:true}); return;}
    if(t.closest('[data-ipback]')){const k=IP.child; IP.child=null; draw(); const n=P.querySelector(`[data-ipchild="${k}"]`)||P.querySelector('[data-ipsec][aria-selected="true"]'); if(n) n.focus({preventScroll:true});}
    return;}
  close();},true);
// a Loaded tick inside the panel: keep focus on it after the redraw (PROGUI.refocus finds the page's copy first). Capture phase,
// because the page's own change handler redraws the panel and the ticked box is gone from it by the time a bubbling listener runs.
document.addEventListener('change',e=>{const t=e.target, P=$i('b2item'); if(!P||!P.contains(t)||!t.dataset||t.dataset.pgld===undefined) return; const sel=`[data-pgld="D"][data-pgid="${CSS.escape(t.dataset.pgid)}"]`;
  setTimeout(()=>{const n=$i('b2item')&&$i('b2item').querySelector(sel); if(n) n.focus({preventScroll:true});},0);},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&IP.open){e.preventDefault(); close();}});
window.SR2IP={open:(gi,sec)=>open(gi==null?deckGi():gi,sec||'built'),close,state:IP,deckGi};
// a saved runner is drawn once before this module wraps render (page load), so add the deck row now as well
try{mount(); stub(); syncBtns();}catch(err){console.error(err);}
})();
