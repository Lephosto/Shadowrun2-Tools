/* Runner Builder, redesign Phase 4 (2026-11-23): the Build tab in steps, and the Runner tab once a runner is established.
   4a: a steps window on laptops (it tucks away), one step at a time on phones and tablets, the Between runs tabs,
       one-line gear rows (the name opens the details) and the cyberdeck as one row.
   4b: an established runner's Build tab becomes Runner, in six sections: Overview, Karma, Gear and stash, Contacts,
       Save and share, and How this runner was built (locked; a GM correction opens it, logged with the GM's note).
   Nothing here changes how a runner is built: it shows, orders and locks the Builder's own sections (they carry
   data-step) and reads the Checklist lines (they carry the step they belong to). The GM correction log is the one
   thing it writes to the runner (S.gmFix). */
(function(){
'use strict';
const STEPS=[['rules','Rules'],['prio','Priorities'],['id','Identity and race'],['attr','Attributes'],['magic','Spells and powers'],
  ['skills','Skills'],['gear','Gear'],['weap','Weapons and armor'],['contacts','Contacts'],['between','Between runs']];
const RUN=[['over','Overview'],['karma','Karma'],['gear','Gear and stash'],['contacts','Contacts'],['save','Save and share'],['built','How this runner was built']];
const RUNSECS={over:['sec-over'],karma:['sec-play','magicCard'],gear:['sec-gear','deckCard','rigCard','softCard','sec-weap','sec-stash','sec-money'],
  contacts:['sec-contacts'],save:['sec-export'],built:['sec-built','sec-rules','sec-prio','sec-id','sec-attr','sec-skills']};
// a Checklist line's build step, and the Runner section it shows on
const RUNOF={rules:'built',prio:'built',id:'built',attr:'built',skills:'built',magic:'karma',gear:'gear',weap:'gear',contacts:'contacts',between:'karma'};
const BRT=['karma','money','stash','save'];
const KEY='sr2-b2steps';
const Q={tuck:null,cur:'rules',rcur:'over',brt:'karma',deck:false,bopen:false};
try{const o=JSON.parse(localStorage.getItem(KEY)||'{}'); if(o&&typeof o==='object') Object.assign(Q,o);}catch(e){}
if(!STEPS.some(s=>s[0]===Q.cur)) Q.cur='rules';
if(!RUN.some(s=>s[0]===Q.rcur)) Q.rcur='over';
if(!BRT.includes(Q.brt)) Q.brt='karma';
Q.bopen=false; // the build record starts folded on every visit (fix8)
function keepQ(){try{localStorage.setItem(KEY,JSON.stringify(Q));}catch(e){}}
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const H=s=>esc(String(s));
const mqWide=window.matchMedia('(min-width:56.3125em)');
const wide=()=>mqWide.matches;
const onBuild=()=>{const c=document.body.classList; return !c.contains('b2gn')&&!c.contains('b2af')&&!c.contains('b2mk');};
const reduced=()=>window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const cssPx=n=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n))||0;
const runner=()=>!!S.established;
const list=()=>runner()?RUN:STEPS;
const nm=k=>(list().find(s=>s[0]===k)||['',''])[1];
const cur=()=>runner()?Q.rcur:Q.cur;
function setQ(k){if(runner()) Q.rcur=k; else Q.cur=k;}
const idx=k=>list().findIndex(s=>s[0]===k);
const word=()=>runner()?'Section':'Step';
function secs(k){return runner()?(RUNSECS[k]||[]).map(id=>$(id)).filter(Boolean):$$(`.layout .col>section.card[data-step="${k}"]`);}
function skipped(k){const L=secs(k); return !L.length||L.every(x=>x.hidden);}
function lines(k){const L=$$('#issues li[data-step]').filter(x=>!x.classList.contains('ok')&&!x.classList.contains('info'));
  return runner()?L.filter(x=>RUNOF[x.dataset.step]===k):L.filter(x=>x.dataset.step===k);}
// a step the player hasn't touched yet shows an empty dot, not a tick (only Checklist problems mark it)
function touched(k){try{const g=S.gear||[], W=x=>typeof WSTAT!=='undefined'&&WSTAT[x.key]||typeof MSTAT!=='undefined'&&MSTAT[x.key]||typeof ASTAT!=='undefined'&&ASTAT[x.key];
  return {prio:()=>Object.values(S.prio||{}).some(Boolean),id:()=>!!(S.name||S.handle||S.concept),attr:()=>Object.values(S.attrs||{}).some(v=>+v>1),magic:()=>(S.powers||[]).length>0,
    skills:()=>(S.skills||[]).length>0,gear:()=>g.length>0,weap:()=>g.some(W),contacts:()=>(S.contacts||[]).some(c=>c&&c.name),between:()=>!!S.established||+S.kEarned>0||(S.nyLog||[]).length>0}[k]?.()??true;}catch(e){return true;}}
function mark(k){if(skipped(k)) return 'skip'; if(k==='rules'||k==='over'||k==='save') return 'none'; const L=lines(k); return L.some(x=>x.classList.contains('bad'))?'bad':L.length?'warn':touched(k)?'ok':'none';}
const MK={ok:['✓','Done'],warn:['!','Check this'],bad:['×','Problem'],skip:['–','Not used'],none:['','']};
function mkHTML(k,m){const [g,t]=MK[m]; if(!g) return ''; const n=lines(k).length;
  return `<span class="b2st-mk mk-${m}" aria-hidden="true">${g}</span><span class="b2vh">${t}${m==='warn'||m==='bad'?`, ${n} on the Checklist`:''}</span>`;}
function nextFrom(k,d){const L=list(); let i=idx(k)+d; while(i>=0&&i<L.length){if(!skipped(L[i][0])) return L[i][0]; i+=d;} return null;}
function tucked(){return Q.tuck==null?window.innerWidth<1200:!!Q.tuck;}
function kaHTML(){const ka=typeof karmaAvail==='function'?karmaAvail():0; return ka>0?`<p class="b2st-karma">${ka} Good Karma to spend</p>`:'';}
function listHTML(){const c=cur(); return `<ol class="b2st-list">${list().map(([k,n],i)=>{const m=mark(k), sub=m==='skip'?(k==='magic'?'Mundane: not counted':'Not used'):'';
  return `<li><button type="button" class="b2st m-${m}" data-st-go="${k}" aria-current="${k===c?'step':'false'}"${m==='skip'?' aria-disabled="true"':''}><span class="b2st-n" aria-hidden="true">${i+1}</span><span class="b2st-nm">${n}${sub?`<small>${sub}</small>`:''}</span>${mkHTML(k,m)}</button></li>`;}).join('')}</ol>`;}
function winHTML(){const c=cur(), w=runner()?'sections':'steps';
  if(tucked()) return `<button type="button" class="b2st-open" data-st="open" aria-expanded="false" aria-label="Show the ${w}" title="Show the ${w}"><span aria-hidden="true">›</span></button><ol class="b2st-dots">${list().map(([k,n],i)=>{const m=mark(k);
    return `<li><button type="button" class="b2st-dot m-${m}" data-st-go="${k}" aria-current="${k===c?'step':'false'}" aria-label="${word()} ${i+1}, ${n}${MK[m][1]?': '+MK[m][1]:''}" title="${n}"${m==='skip'?' aria-disabled="true"':''}>${i+1}</button></li>`;}).join('')}</ol>`;
  return `<div class="b2st-head"><h2>${runner()?'Runner':'Steps'}</h2><button type="button" class="b2st-tuck ghost" data-st="tuck" aria-expanded="true">Tuck away</button></div>${kaHTML()}${listHTML()}`;}
// ---------- phone and tablet: one step at a time ----------
function drawBar(){const el=$('b2stepbar'); if(!el) return; const c=cur(), i=idx(c), sh=$('b2stsheet');
  el.innerHTML=`<button type="button" class="b2sb" data-st="sheet" aria-haspopup="dialog" aria-expanded="${!!(sh&&!sh.hidden)}"><span class="b2sb-t"><small>${word()} ${i+1} of ${list().length}</small><b>${H(nm(c))}</b></span>${mkHTML(c,mark(c))}<span class="b2sb-all">All ${runner()?'sections':'steps'}</span></button>`;}
function drawFoot(){const el=$('b2stepnav'); if(!el) return; const c=cur(), p=nextFrom(c,-1), n=nextFrom(c,1);
  el.innerHTML=`<button type="button" class="b2sn-back" data-st="back"${p?'':' disabled'}><b>Back</b>${p?`<small>${H(nm(p))}</small>`:''}</button><button type="button" class="b2sn-next" data-st="next"${n?'':' disabled'}><b>Next</b>${n?`<small>${H(nm(n))}</small>`:`<small>Last ${runner()?'section':'step'}</small>`}</button>`;}
function openSheet(on){const sh=$('b2stsheet'); if(!sh) return;
  if(on){sh.innerHTML=`<div class="b2sh-scrim" data-st="close"></div><div class="b2sh-panel" role="dialog" aria-modal="true" aria-labelledby="b2shT"><div class="b2st-head"><h2 id="b2shT">All ${runner()?'sections':'steps'}</h2><button type="button" class="ghost" data-st="close">Close</button></div>${kaHTML()}${listHTML()}</div>`;
    sh.hidden=false; drawBar(); const c=sh.querySelector('[aria-current="step"]')||sh.querySelector('button'); if(c) c.focus();}
  else if(!sh.hidden){sh.hidden=true; sh.innerHTML=''; drawBar(); const b=document.querySelector('#b2stepbar .b2sb'); if(b) b.focus();}}
// ---------- For this step (laptop rail) ----------
const statRow=(k,v)=>`<div class="stat"><span class="k">${H(k)}</span><span class="v">${H(v)}</span></div>`;
function copyOf(id){const e=$(id); return e&&!e.closest('[hidden]')&&e.innerHTML.trim()?e.innerHTML:'';}
function drawFor(){const f=$('b2forstep'); if(!f) return; const k=cur(), c=S._calc||{}, ka=typeof karmaAvail==='function'?karmaAvail():0; let h='';
  const ny=c.nuyen==null?'—':fmt(c.nuyen)+'¥';
  if(runner()){
    if(k==='karma') h=statRow('Good Karma to spend',String(ka))+copyOf('powerBudget');
    else if(k==='gear') h=statRow('Nuyen on hand',ny)+statRow('Essence',c.ess==null?'—':String(c.ess))+(c.bi?statRow('Body Index',`${c.bi} of ${c.biMax}`):'');
    else if(k==='contacts'){const t=(($('contactCost')||{}).textContent||'').trim(); if(t) h=`<p class="note">${H(t)}</p>`;}}
  else if(k==='prio'){const P=S.prio||{}, used=Object.values(P).filter(Boolean), left=['A','B','C','D','E'].filter(L=>!used.includes(L)), open=[['race','Race'],['magic','Magic'],['attr','Attributes'],['skills','Skills'],['res','Resources']].filter(([c])=>!P[c]).map(x=>x[1]);
    h=statRow('Letters left',left.join(' ')||'none')+statRow('Still to pick',open.join(', ')||'none');}
  else if(k==='attr') h=copyOf('attrBudget'); else if(k==='skills') h=copyOf('skillBudget'); else if(k==='magic') h=copyOf('powerBudget'); else if(k==='id') h=copyOf('efBudget');
  else if(k==='gear') h=copyOf('resBudget')+statRow('Essence',c.ess==null?'—':String(c.ess))+(c.bi?statRow('Body Index',`${c.bi} of ${c.biMax}`):'');
  else if(k==='contacts'){const t=(($('contactCost')||{}).textContent||'').trim(); h=`<p class="note">${t?H(t):'Two Contact-level contacts come free.'}</p>`;}
  else if(k==='between') h=statRow('Good Karma to spend',String(ka))+statRow('Nuyen on hand',ny);
  f.hidden=!h; f.innerHTML=h?`<h3>For this ${runner()?'section':'step'}: ${H(nm(k))}</h3>${h}`:'';}
// ---------- gear rows: the deck as one row ----------
function deckIndex(){const dk=typeof deckInfo==='function'?deckInfo():null; if(!dk) return -1;
  const cu=S.gear.findIndex(g=>/^deck:Custom cyberdeck/.test(g.key||'')); if(cu>=0) return cu; // the deck in use carries the summary (two decks: the one picked on the Cyberdeck card)
  const a=typeof activeDeck==='function'?activeDeck():null; if(a) return S.gear.indexOf(a);
  return S.gear.findIndex(g=>g.key&&GEARDB[g.key]&&GEARDB[g.key].mpcp);}
function gearPass(){const body=$('gearBody'); if(!body) return; const di=deckIndex(), dk=di>=0?deckInfo():null; let cat='';
  [...body.rows].forEach(tr=>{if(tr.classList.contains('gcat')){const b=tr.querySelector('[data-fold]'); cat=b?b.dataset.fold:''; tr.classList.toggle('gdk',!!dk&&cat==='prog'); return;}
    const nb=tr.querySelector('.gname'), i=nb?+nb.dataset.gopen:-1; tr.classList.toggle('gdk',!!dk&&(cat==='deck'||cat==='prog')&&i!==di);});
  if(dk){const nb=body.querySelector(`.gname[data-gopen="${di}"]`); if(nb){const old=nb.parentElement.querySelector('.gdeck'); if(old) old.remove();
    const hj=S.gear.filter(g=>g.key==='deck:Hitcher Jack').reduce((a,g)=>a+(+g.qty||1),0);
    const tot=S.gear.filter(g=>(g.key&&/^(deck|prog2?):/.test(g.key))||(!g.key&&(g.cat==='deck'||g.cat==='prog'))).reduce((a,g)=>a+(+g.cost||0)*(+g.qty||1),0);
    const parts=[`MPCP ${dk.mpcp}`,dk.ri?`Response ${dk.ri}`:'',hj?`${hj} hitcher${hj>1?'s':''}`:'',`${fmt(dk.am)} Mp active`,`${fmt(dk.sm)} Mp storage`].filter(Boolean);
    const d=document.createElement('div'); d.className='gdeck';
    const IPX=window.SR2IP, dkOn=IPX?!!(IPX.state.open&&IPX.state.gi===IPX.deckGi()):!!Q.deck;  // fix10: the deck opens in the item panel
    d.innerHTML=`<span class="gdsum">${H(parts.join(' · '))}</span><span class="gdtot">Deck, programs and options: ${fmt(tot)}¥</span><button type="button" class="ghost gdeckbtn" data-st="deck" aria-expanded="${dkOn}" aria-controls="${IPX?'b2item':'deckCard'}">${dkOn?'Close the deck':'Open the deck'}</button>`;
    nb.parentElement.insertBefore(d,nb.parentElement.querySelector('.gmore'));}}
  document.body.classList.toggle('b2dk-shut',!!dk&&!Q.deck);}
// ---------- Between runs: tag the In play section's parts ----------
function tagPlay(){const sp=$('sec-play'); if(!sp||sp.dataset.brtag) return; sp.dataset.brtag='1'; let mode='brn';
  [...sp.children].forEach(el=>{if(el.tagName==='H2') return; if(el.tagName==='H3'&&/Spend Good Karma/.test(el.textContent)) mode='brk';
    if(el.matches('label[for="fNotes"]')||el.querySelector('#kEarned')) return; el.classList.add(mode);});
  ['kEarned','kSpent','kPoolBonus'].forEach(id=>{const l=document.querySelector(`label[for="${id}"]`); if(l) l.classList.add('brk');});
  const n=document.querySelector('label[for="nuyenNow"]'); if(n) n.classList.add('brn');}
// ---------- Runner tab (4b) ----------
// nuyen, ammo and damage move to their own card on the Runner tab, and back for Build and Game night
let moved=null;
function moveMoney(on){const sp=$('sec-play'), mo=$('sec-money'); if(!sp||!mo) return;
  if(on&&!moved){moved=[]; $$('.brn',sp).forEach(el=>{const ph=document.createComment('brn'); el.parentNode.insertBefore(ph,el); moved.push([el,ph]); mo.appendChild(el);});}
  else if(!on&&moved){moved.forEach(([el,ph])=>{if(ph.parentNode){ph.parentNode.insertBefore(el,ph); ph.remove();}}); moved=null;}}
function drawOver(){const o=$('sec-over'); if(!o) return; if(!runner()){o.innerHTML=''; return;}
  const c=S._calc||{}, T=typeof sheetStats==='function'?sheetStats():{}, ka=typeof karmaAvail==='function'?karmaAvail():0;
  const tile=(k,v,s)=>`<div class="b2t"><span class="b2k">${H(k)}</span><span class="b2v">${H(v)}</span>${s?`<span class="b2s">${H(s)}</span>`:''}</div>`;
  const at=ATTRS.map(([k,l])=>{const n=attrNow(k), a=augAttr(k); return tile(l,String(a!==n&&a>n?a:n),a!==n&&a>n?`natural ${n}`:'');}).join('');
  const nb=typeof natBody==='function'?natBody():0;
  o.innerHTML=`<h2>Overview</h2><div class="b2big">${at}${tile('Essence',c.ess==null?'—':String(c.ess))}${c.awake?tile('Magic',String(c.magic)):''}${T.reaction!=null?tile('Initiative',`${T.reaction} + ${T.dice}D6`):''}</div>
    <div class="b2ovr">${statRow('Good Karma to spend',String(ka))}${statRow('Nuyen on hand',c.nuyen==null?'—':fmt(c.nuyen)+'¥')}${statRow('Physical damage',`${+S.phys||0} of 10`)}${statRow('Stun damage',`${+S.stun||0} of 10`)}${T.cpool!=null?statRow('Combat Pool',String(T.cpool)):''}</div>`;}
// How this runner was built: locked, with a logged GM correction
let FIX=null;   // {snap,note} while a correction is open
const FIXKEYS=['mode','established','books','optMeta','optEF','prio','race','magic','attrs','skills','langs','ef'];
const FIXNAME={mode:'Rules',established:'Established runner',books:'Books in play',optMeta:'Companion options',optEF:'Companion options',prio:'Priorities',race:'Race',magic:'Magic',attrs:'Attributes',skills:'Skills',langs:'Languages',ef:'Edges and Flaws'};
function lockEls(){const L=[$('sec-prio'),$('sec-attr'),$('sec-skills'),$('modeSeg'),document.querySelector('#sec-rules label.estab'),$('bookRow'),document.querySelector('#sec-rules .books:not(#bookRow)'),$('efBox')];
  ['fRace','fMagic'].forEach(id=>{const x=$(id); if(x&&x.closest('label')) L.push(x.closest('label'));}); return L.filter(Boolean);}
function lockBuild(on){lockEls().forEach(el=>{el.inert=!!on; el.classList.toggle('b2locked',!!on);});}
// sections that are only partly locked say which parts
const LOCKNOTE={'sec-rules':'Locked on an established runner: the priority rules, books, Companion options and the Established runner box. GM correction opens them.',
  'sec-id':'Locked on an established runner: race, magic, and Edges and Flaws. Name, street name, tradition and concept stay open.'};
function lockNotes(on){Object.entries(LOCKNOTE).forEach(([id,t])=>{const s=$(id); if(!s) return; let n=s.querySelector('.b2locknote');
  if(on){if(!n){n=document.createElement('p'); n.className='note b2locknote'; n.textContent=t; const h=s.querySelector('h2'); s.insertBefore(n,h?h.nextSibling:s.firstChild);}} else if(n) n.remove();});}
const today=()=>{const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
function drawBuilt(){const b=$('sec-built'); if(!b) return; if(!runner()){b.innerHTML=''; return;}
  const log=(S.gmFix||[]).slice().reverse();
  const open=!!(Q.bopen||FIX), P=S.prio||{}, pr=[['race','Race'],['magic','Magic'],['attr','Attributes'],['skills','Skills'],['res','Resources']].map(([k,l])=>P[k]?l+' '+P[k]:'').filter(Boolean).join(' · ');
  b.innerHTML=`<h2>How this runner was built</h2>${pr?`<p class="b2bsum">${H(pr)}</p>`:''}<p class="note">The choices made when this runner was created: rules and books, priorities, race, attributes and skills. They're locked so the build can't change by accident. Raises and new skills go through Karma.</p>`+
    (FIX?'':`<div class="row"><button type="button" class="primary" data-st="bopen" aria-expanded="${open}" aria-controls="sec-rules sec-prio sec-id sec-attr sec-skills">${open?'Fold the build':'Open the build'}</button><span class="note">${open?'The five cards below are the record: rules, priorities, identity and race, attributes, skills.':'Rules, priorities, identity and race, attributes and skills, as five locked cards.'}</span></div>`)+
    (FIX?`<div class="b2fix" role="group" aria-label="GM correction"><p class="b2fixon"><b>Open for a GM correction.</b> Change what the GM approved below, then press Done. Cancel puts everything back.</p>
      <label for="b2fixNote">What the GM approved<input id="b2fixNote" value="${H(FIX.note||'')}" placeholder="e.g. GM: swap Firearms 4 for Pistols 5"></label>
      <div class="row"><button type="button" class="primary" data-st="fixdone">Done</button><button type="button" data-st="fixcancel">Cancel</button><span class="note" id="b2fixMsg" role="status">${H(FIX.msg||'')}</span></div></div>`
    :`<div class="row"><button type="button" data-st="fix">GM correction…</button><span class="note">Opens the build for a change the GM approved, logged with their note.</span></div>`)+
    (log.length?`<h3>Corrections</h3><ul class="b2fixlog">${log.map(f=>`<li><span class="mono">${H(f.d)}</span> · ${H(f.note)}${f.parts&&f.parts.length?` <span class="note">(${H(f.parts.join(', '))})</span>`:''}</li>`).join('')}</ul>`:'');
  if(FIX){const n=$('b2fixNote'); if(n&&FIX.focus){FIX.focus=false; n.focus();}}}
function snapBuild(){const o={}; FIXKEYS.forEach(k=>{o[k]=JSON.stringify(S[k]===undefined?null:S[k]);}); return o;}
function fixStart(){FIX={snap:snapBuild(),note:'',focus:true}; Q.bopen=true; keepQ(); lockBuild(false); update();}
function fixEnd(keep){if(!FIX) return; const now=snapBuild(), parts=[...new Set(FIXKEYS.filter(k=>now[k]!==FIX.snap[k]).map(k=>FIXNAME[k]))];
  if(keep){const note=(($('b2fixNote')||{}).value||'').trim();
    if(parts.length&&!note){FIX.msg='Add the GM\'s note first.'; FIX.focus=true; drawBuilt(); return;}
    if(parts.length) S.gmFix=(S.gmFix||[]).concat([{d:today(),note,parts}]);}
  else FIXKEYS.forEach(k=>{const v=JSON.parse(FIX.snap[k]); if(v===null) delete S[k]; else S[k]=v;});
  FIX=null; if(typeof save==='function') save(); render();
  const btn=document.querySelector('#sec-built [data-st="fix"]'); if(btn) btn.focus();}
function runnerPass(build){const on=build&&runner();
  document.body.classList.toggle('b2run',on);
  const bt=document.querySelector('#b2tabs [data-tab="build"]'); if(bt) bt.textContent=runner()?'Runner':'Build';
  const h=document.querySelector('#sec-play>h2'); if(h) h.textContent=on?'Karma':'In play';
  moveMoney(on);
  // the Runner tab's order on a laptop's long page, without moving the cards
  const order=on?Object.values(RUNSECS).flat():[];
  $$('.layout .col>section.card').forEach(x=>{const i=order.indexOf(x.id); x.style.order=on?String(i<0?90:i+1):'';});
  const bar=$('b2stepbar'), nav=$('b2stepnav'); if(bar) bar.style.order=on?'0':''; if(nav) nav.style.order=on?'99':'';
  if(!runner()&&FIX) FIX=null;
  lockBuild(on&&!FIX); lockNotes(on&&!FIX);
  document.body.classList.toggle('b2bfold',on&&!Q.bopen&&!FIX); // fix8: the build record is folded until asked for
  drawOver(); drawBuilt();}
// ---------- drawing ----------
let busy=false;
function update(){if(busy) return; busy=true; try{
  const b=document.body, build=onBuild(), one=build&&!wide(), run=runner();
  b.classList.toggle('b2bd',build); b.classList.toggle('b2one',one);
  BRT.forEach(t=>b.classList.toggle('brt-'+t,build&&!run&&Q.brt===t));
  $$('#sec-between [data-brt]').forEach(x=>{const on=x.dataset.brt===Q.brt; x.setAttribute('aria-selected',String(on)); x.tabIndex=on?0:-1;});
  runnerPass(build);
  if(skipped(cur())) setQ(nextFrom(cur(),1)||nextFrom(cur(),-1)||list()[0][0]);
  const inCur=new Set(secs(cur()).map(x=>x.id));
  $$('.layout .col>section.card').forEach(x=>x.classList.toggle('stp-off',one&&!inCur.has(x.id)));
  const nav=$('b2steps'); if(nav&&build){nav.setAttribute('aria-label',run?'Runner sections':'Steps'); nav.classList.toggle('tucked',tucked()); nav.innerHTML=winHTML();}
  if(!one) openSheet(false);
  drawBar(); drawFoot(); drawFor(); gearPass();
  }finally{busy=false;}}
function setCur(k){if(cur()===k) return; setQ(k); keepQ(); $$('#b2steps [data-st-go]').forEach(x=>x.setAttribute('aria-current',x.dataset.stGo===k?'step':'false')); drawFor();}
let lock=0;
function go(k){if(idx(k)<0||skipped(k)) return;
  if(document.body.classList.contains('b2one')){setQ(k); keepQ(); openSheet(false); update();
    const col=document.querySelector('.layout .col'); if(col){const y=col.getBoundingClientRect().top+window.scrollY-cssPx('--jumpH')-8; window.scrollTo(0,Math.max(0,y));}
    const s=secs(k).find(x=>!x.hidden), h=s&&s.querySelector('h2'); if(h){h.tabIndex=-1; h.focus({preventScroll:true});}
    return;}
  lock=Date.now()+1000; setCur(k); const s=secs(k).find(x=>!x.hidden&&x.offsetParent!==null); if(s) s.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});}
let ticking=false;
function onScroll(){if(ticking) return; ticking=true; requestAnimationFrame(()=>{ticking=false;
  if(!onBuild()||!wide()||Date.now()<lock) return; const top=Math.max(cssPx('--jumpH')+cssPx('--stripH')+40,window.innerHeight*0.35); let c=list()[0][0];
  for(const [k] of list()){const s=secs(k).find(x=>!x.hidden&&x.offsetParent!==null); if(!s) continue; if(s.getBoundingClientRect().top<=top) c=k; else break;}
  setCur(c);});}
function card(id,step,label){const s=document.createElement('section'); s.className='card'; s.id=id; s.dataset.step=step; s.dataset.jump=label; return s;}
function mount(){const lay=document.querySelector('.layout'), col=lay&&lay.querySelector('.col'), rail=lay&&lay.querySelector('.rail');
  if(!lay||!col||$('b2steps')) return;
  const nav=document.createElement('nav'); nav.id='b2steps'; nav.className='b2steps'; nav.setAttribute('aria-label','Steps'); lay.insertBefore(nav,lay.firstChild);
  const bar=document.createElement('div'); bar.id='b2stepbar'; col.insertBefore(bar,col.firstChild);
  // the Runner tab's own cards (hidden on the Build tab)
  col.insertBefore(card('sec-over','run','Overview'),bar.nextSibling);
  // Between runs: a header with four tabs over In play, Stash, Export and Save as text (Build tab only)
  const br=card('sec-between','between','Between runs');
  br.innerHTML='<h2>Between runs</h2><div class="b2brt" role="tablist" aria-label="Between runs">'+[['karma','Karma'],['money','Nuyen, ammo and damage'],['stash','Stash'],['save','Save and share']].map(([k,l])=>`<button type="button" role="tab" data-brt="${k}" aria-selected="${k===Q.brt}">${l}</button>`).join('')+'</div>';
  const sp=$('sec-play'); if(sp) col.insertBefore(br,sp);
  const mo=card('sec-money','run','Nuyen, ammo and damage'); mo.innerHTML='<h2>Nuyen, ammo and damage</h2>'; col.appendChild(mo);
  col.appendChild(card('sec-built','run','How this runner was built'));
  const foot=document.createElement('nav'); foot.id='b2stepnav'; foot.setAttribute('aria-label','Step by step'); col.appendChild(foot);
  const sheet=document.createElement('div'); sheet.id='b2stsheet'; sheet.hidden=true; document.body.appendChild(sheet);
  if(rail){const f=document.createElement('section'); f.id='b2forstep'; f.className='card'; f.hidden=true; f.setAttribute('aria-live','polite'); rail.insertBefore(f,rail.firstChild);}
  tagPlay();
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-st],[data-st-go],[data-brt]'); if(!t) return;
    if(t.dataset.brt){Q.brt=t.dataset.brt; keepQ(); update(); return;}
    if(t.dataset.stGo){e.preventDefault(); if(t.getAttribute('aria-disabled')!=='true') go(t.dataset.stGo); return;}
    const a=t.dataset.st;
    if(a==='tuck'||a==='open'){Q.tuck=a==='tuck'; keepQ(); update(); const f=document.querySelector(a==='tuck'?'#b2steps .b2st-open':'#b2steps .b2st-tuck'); if(f) f.focus(); return;}
    if(a==='sheet') return openSheet(true);
    if(a==='close') return openSheet(false);
    if(a==='back'||a==='next'){const k=nextFrom(cur(),a==='next'?1:-1); if(k) go(k); return;}
    if(a==='deck'){Q.deck=!Q.deck; keepQ(); update(); const btn=document.querySelector('#gearBody .gdeckbtn'); if(btn) btn.focus(); return;}
    if(a==='bopen'){Q.bopen=!Q.bopen; keepQ(); update(); const btn=document.querySelector('#sec-built [data-st="bopen"]'); if(btn) btn.focus(); if(Q.bopen&&wide()){const r=$('sec-rules'); if(r&&r.offsetParent!==null) r.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'nearest'});} return;}
    if(a==='fix') return fixStart();
    if(a==='fixdone') return fixEnd(true);
    if(a==='fixcancel') return fixEnd(false);});
  document.addEventListener('input',e=>{if(FIX&&e.target&&e.target.id==='b2fixNote'){FIX.note=e.target.value; FIX.msg='';}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('b2stsheet').hidden){e.preventDefault(); return openSheet(false);}
    const t=e.target; if(t&&t.dataset&&t.dataset.brt&&(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Home'||e.key==='End')){e.preventDefault();
      const i=BRT.indexOf(t.dataset.brt), j=e.key==='Home'?0:e.key==='End'?BRT.length-1:(i+(e.key==='ArrowRight'?1:-1)+BRT.length)%BRT.length;
      Q.brt=BRT[j]; keepQ(); update(); const n=document.querySelector(`#sec-between [data-brt="${BRT[j]}"]`); if(n) n.focus();}});
  const _render=render; render=function(){_render.apply(this,arguments); try{update();}catch(err){console.error(err);}};
  new MutationObserver(()=>{if(!busy) update();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  if(mqWide.addEventListener) mqWide.addEventListener('change',update); else if(mqWide.addListener) mqWide.addListener(update);
  window.addEventListener('resize',()=>{if(Q.tuck==null) update();});
  window.addEventListener('scroll',onScroll,{passive:true});
  update();}
// for checks and for links: show a Between runs tab (on a phone this also opens that step). On the Runner tab, the
// Karma and Save and share sections stand in for the tabs.
function show(t){if(BRT.includes(t)) Q.brt=t;
  if(document.body.classList.contains('b2one')){if(runner()) Q.rcur=t==='karma'?'karma':t==='save'?'save':'gear'; else Q.cur='between';}
  keepQ(); update();}
window.SR2STEPS={Q,update,go,show,STEPS,RUN};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
