/* Runner Builder: the Marketplace tab (2026-11-23), for established runners. Approved mockup: Phase 4 design board, row 3
   (EstMarket and EstMarketPhone).
   - Buy through a contact: availability and Negotiation are rolled once and kept on the sheet, so a line can't be rolled
     again for a better result (core p. 184-185). The GM can allow a new try; that is logged too.
   - Add without paying: loot and gifts, logged with where they came from.
   - Sell to a fence: finding one and the meet (core p. 188).
   Every purchase, gift and sale can be undone while the gear hasn't changed since. State: S.mk. */
(function(){
const MKAV=/*AVAIL*/{}; // Availability and Street Index by gear key (the Gear Locker's checked table, gear/avail_data.json)
// trade numbers for the book's contacts (core p. 203-213; page images checked 2026-11-23): Willpower, Negotiation, Equipment Acquisition
const CTTRADE={bountyhunter:[4,0,0],bartender:[2,0,0],companyman:[5,0,0],cityofficial:[2,4,0],corporatesecretary:[2,0,0],corporatesecurityguard:[2,0,0],dwarftechnician:[4,0,0],elvenhitman:[4,0,0],gangboss:[4,0,0],fixer:[5,7,4],humanispoliclubmember:[4,0,0],mechanic:[4,0,0],mediaproducer:[4,4,0],metahumanrightsactivist:[2,3,0],mrjohnson:[5,6,0],squatter:[2,0,0],streetdoc:[2,4,0],streetcop:[3,0,0],talismonger:[4,6,0],tribalchief:[4,4,0],trollbouncer:[2,0,0],yakuzaboss:[5,6,0]};
const FENCE_MODS=[['std','Standard gear',-1],['hi','Hi-tech or other important loot',1],['hot','Hot loot',3],['mag','Magical loot (foci, formulae)',2]]; // core p. 188
const HEAT=[['','Nobody is after us',0],['cops','The police are looking for us',1],['corp','A corp or organized crime is looking for us',2]];
const U={hrs:['hour','hours'],days:['day','days'],wks:['week','weeks'],mths:['month','months']};
const CT=()=>window.SR2CT||{};
const day=()=>{const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const uid=()=>'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone=o=>JSON.parse(JSON.stringify(o));
const pct=x=>Math.round(x*100)+'%';
function mk(){if(!S.mk||typeof S.mk!=='object') S.mk={}; const M=S.mk; M.cart=Array.isArray(M.cart)?M.cart:[]; M.log=Array.isArray(M.log)?M.log:[]; M.hist=Array.isArray(M.hist)?M.hist:[];
  if(M.hag==null) M.hag=true; if(!M.o) M.o={dice:4,wil:4,neg:4}; if(!M.f) M.f={pick:{},kind:'std',heat:'',reg:false,others:0,oth:0}; return M;}
function logAdd(e){const M=mk(); e.id=e.id||uid(); e.d=e.d||day(); M.log.push(e); if(M.log.length>400) M.log.splice(0,M.log.length-400); return e;}
const rollD=(n,tn)=>{const r=[]; for(let i=0;i<Math.max(0,n);i++) r.push(r6(tn)); return r;};
const succ=(r,tn)=>r.filter(x=>x>=tn).length;

// ---------- availability (the same reading as the Gear Locker's fixer panel) ----------
function avEval(x,r){if(x==null) return null; const s=String(x).replace(/Rating|Force|Level/gi,'('+(+r||0)+')').replace(/x/g,'*'); if(!/^[\d.+*()\-\s]+$/.test(s)) return null; try{const v=Function('"use strict";return ('+s+')')(); return isFinite(v)?v:null;}catch(e){return null;}}
function avRec(key,r){const a=MKAV[key]; if(!a) return null; let b=a; const it=GEARDB[key]||{};
  if(a.lv){const rr=+r||(it.r?it.r[0]:1); const L=a.lv.find(x=>rr>=x.lo&&rr<=x.hi)||a.lv[a.lv.length-1]; b=Object.assign({},a,L);}
  const o={k:b.k,si:b.si!=null&&+b.si>0?+b.si:null,p:a.p,note:b.note||''};
  if(b.k==='ok'){o.tn=b.tn==='-'?null:avEval(b.tn,r); o.n=avEval(b.n,r); o.u=b.u; o.tnTxt=b.tn; o.nTxt=b.n; o.rated=/Rating|Force/i.test(b.tn+b.n);}
  return o;}
const p1=t=>t<=1?1:t<=6?(7-Math.max(2,t))/6:p1(t-6)/6; // one die reaching t, Rule of Six
const odds=(t,d)=>1-Math.pow(1-p1(t),Math.max(0,d));
function avTime(n,u,k){if(n==null) return ''; let v=n/(k||1), unit=u; if(unit==='mths'&&v<1){v*=30;unit='days';} if(unit==='wks'&&v<1){v*=7;unit='days';} if(unit==='days'&&v<1){v*=24;unit='hrs';}
  const r=v>=10?Math.round(v):Math.round(v*10)/10; return r+' '+(U[unit]||[unit,unit])[r===1?0:1];}
function avText(a){if(!a) return 'Not listed'; if(a.k==='always') return 'Always available'; if(a.k==='gm') return 'GM’s call'; if(a.k==='pay') return 'Subscription'; if(a.k==='note') return a.note||'See the book'; if(a.k==='none') return 'Not listed';
  return `${a.tnTxt==='-'?'—':String(a.tnTxt).replace(/^\((.*)\)$/,'$1').replace(/x/g,'×')}/${String(a.nTxt).replace(/^\((.*)\)$/,'$1').replace(/x/g,'×')} ${a.u}`;}

// ---------- who is buying ----------
// a contact's numbers: the book contact they're like (Game night › Contacts) or numbers typed in; cw, cn, cq are typed Willpower, Negotiation, Equipment Acquisition
function trade(c){const C=CT(); const st=C.ctStats?C.ctStats(c):null; if(!st) return null;
  if(st.own) return {st,wil:Math.max(0,+c.cw||0),neg:Math.max(0,+c.cn||0),acq:Math.max(0,+c.cq||0)};
  const t=CTTRADE[st.id]||[0,0,0]; return {st,wil:t[0],neg:t[1],acq:t[2]};}
function sources(){const L=[]; (S.contacts||[]).forEach((c,i)=>{if(!c||!c.name) return; const T=trade(c); const sk=[];
    if(T){if(T.acq) sk.push({l:'Equipment Acquisition',r:T.acq,tn:0}); T.st.et.filter(x=>x[1]>0).forEach(x=>sk.push({l:x[0],r:x[1],tn:2}));}
    L.push({id:'c'+i,c,ci:i,label:c.name+(c.role?' ('+c.role+')':''),T,sk,wil:T?T.wil:null,neg:T?T.neg:null,cha:T?T.st.cha:null,ok:!!T&&sk.length>0,how:T?T.st.n:''});});
  const M=mk(); L.push({id:'other',label:'Someone else (type their numbers)',sk:[{l:'their dice',r:Math.max(0,+M.o.dice||0),tn:0}],wil:Math.max(1,+M.o.wil||1),neg:Math.max(0,+M.o.neg||0),cha:null,ok:+M.o.dice>0,how:'numbers typed here'});
  const et=bestEtq(); L.push({id:'self',label:(S.handle||S.name||'The runner')+', with no source (GM’s call)',sk:et?[{l:et.l,r:et.r,tn:2}]:[],wil:null,neg:null,ok:!!et,self:true,how:'the book has a source make this roll; the GM may allow it'});
  return L;}
function bestEtq(){let b=null; (S.skills||[]).filter(s=>/^Etiquette/.test(s.name)).forEach(s=>{const sd=skillDiceFor(s.name,s.conc||'',''); if(sd.dice!=null&&(!b||sd.dice>b.r)) b={l:s.name+(s.conc?' ('+s.conc+')':''),r:sd.dice};}); return b;}
function curSrc(){const M=mk(), L=sources(); let s=L.find(x=>x.id===M.who); if(!s) s=L.find(x=>x.ok&&x.T&&x.T.acq)||L.find(x=>x.ok&&x.ci!=null)||L.find(x=>x.id==='other'); return s;}
function srcSkill(s){const M=mk(); if(!s||!s.sk.length) return null; const i=Math.max(0,Math.min(s.sk.length-1,+M.wsk||0)); return M.wsk==null?s.sk.reduce((m,x)=>(x.r-x.tn/2)>(m.r-m.tn/2)?x:m,s.sk[0]):s.sk[i];}
// the runner's Negotiation: the skill, else the Skill Web's best default, else Charisma (core p. 185)
function buyerNeg(){const sd=skillDiceFor('Negotiation','',''); if(sd&&sd.dice!=null) return {dice:sd.dice,tn:0,how:'Negotiation '+sd.dice};
  if(typeof swOptions==='function'){try{const o=swOptions('Negotiation',0)[0]; if(o&&o.dice) return {dice:o.dice,tn:o.tn||0,how:'defaulting: '+(o.how||o.path||'Skill Web')+' '+o.dice+(o.tn?' at +'+o.tn:'')};}catch(e){}}
  return {dice:attrNow('cha'),tn:4,how:'Charisma '+attrNow('cha')+' at +4 (defaulting, core p. 66-68)'};}
function srcNeg(s){if(s.neg) return {dice:s.neg,tn:0,how:'Negotiation '+s.neg}; if(s.cha) return {dice:s.cha,tn:4,how:'Charisma '+s.cha+' at +4 (no Negotiation listed; defaulting)'}; return {dice:0,tn:0,how:'no numbers'};}

// ---------- the list ----------
function rowFrom(x){const it=GEARDB[x.key]; const row={key:x.key,qty:Math.max(1,Math.min(9999,Math.floor(+x.qty||1)))}; if(x.r!=null&&isFinite(+x.r)) row.r=+x.r;
  ['build','vb','hb'].forEach(k=>{if(x[k]&&typeof x[k]==='object') row[k]=clone(x[k]);}); if(x.gel) row.gel=true; if(it&&it.r&&row.r==null) row.r=it.r[0]; return row;}
function upIndex(x){let i=+(x.up&&x.up.gi); if(!(S.gear[i]&&S.gear[i].key===x.key)) i=S.gear.findIndex(g=>g.key===x.key); return i;}
// list prices: the Builder's own pricing on a copy of the sheet, so build-outs and deck options priced by the runner's own deck come out the same as in Gear
function priceAll(lines){const res=new Map(), keep=S; try{S=clone(keep); syncGear(); const base=new Map();
    lines.forEach(L=>{const x=L.it; if(x.up&&x.vb){const i=upIndex(x); if(i<0){res.set(L.id,{err:'the vehicle isn’t on this runner'}); return;} const g=S.gear[i]; if(!base.has(i)) base.set(i,(+g.cost||0)*(+g.qty||1)); g.vb=clone(x.vb); delete g.vb.own; res.set(L.id,{upi:i});}
      else if(x.key&&GEARDB[x.key]){const row=rowFrom(x); S.gear.push(row); res.set(L.id,{row});}
      else if(x.name) res.set(L.id,{list:Math.max(0,Math.round(+x.cost||0)),ess:0,name:String(x.name)});
      else res.set(L.id,{err:'this Builder doesn’t know it'});});
    syncGear(); const seenUp=new Set();
    res.forEach(v=>{if(v.row){v.list=Math.round((+v.row.cost||0)*(+v.row.qty||1)); v.ess=(+v.row.ess||0)*(+v.row.qty||1); v.name=v.row.name; v.r=v.row.r; delete v.row;}
      else if(v.upi!=null){const g=S.gear[v.upi]; v.name=(g.vname||GEARDB[g.key].n)+': new work'; v.ess=0; v.list=seenUp.has(v.upi)?0:Math.max(0,Math.round((+g.cost||0)*(+g.qty||1)-base.get(v.upi))); seenUp.add(v.upi); v.up=true; delete v.upi;}});
  }catch(e){console.error(e);} finally{S=keep;} return res;}
function addItems(items,from){const M=mk(); let n=0; (items||[]).forEach(x=>{if(!x||(!x.key&&!x.name)) return; const it=x.key?GEARDB[x.key]:null; if(x.key&&!it) return;
    const y=clone(x); if(y.key&&typeof KEYFIX!=='undefined'&&KEYFIX[y.key]) y.key=KEYFIX[y.key]; delete y.forItem; M.cart.push({id:uid(),it:y,from}); n++;}); return n;}
// a send from the Gear Locker: ammo for a gun in the same send keeps the link by the gun's key
function fromSend(p){const items=(p.items||[]).map(x=>{const y=Object.assign({},x); if(y.forItem!=null&&p.items[+y.forItem]&&p.items[+y.forItem].key) y.forKey=p.items[+y.forItem].key; return y;}); const n=addItems(items,'Gear Locker'+(p.label?': '+p.label:'')); return n;}
function srcKey(s){return s?(s.ci!=null?'c:'+(s.c.name||s.ci):s.id):'';}
// the open availability roll for this item from this source (rolled, not yet bought, not re-opened by the GM)
function openRoll(key,sk){const M=mk(); for(let i=M.log.length-1;i>=0;i--){const e=M.log[i]; if(e.key!==key||e.src!==sk) continue; if(e.kind==='gmretry') return null; if(e.kind==='avail'||e.kind==='gmok') return e.used?null:e;} return null;}
function lineInfo(L,P,s){const x=L.it, p=P.get(L.id)||{err:'not priced'}, it=x.key?GEARDB[x.key]:null; const o={L,x,it,p,name:p.name||(it?it.n:x.name)||'?',list:p.list||0,ess:p.ess||0};
  o.rec=x.key&&!p.up?avRec(x.key,p.r):null; o.si=o.rec&&o.rec.si?o.rec.si:1; o.street=p.up||!it?o.list:Math.round(o.list*o.si);
  const sk=L.src||srcKey(s); o.sk=sk; o.roll=x.key?openRoll(x.key,sk):null; const kind=p.err?'err':p.up?'up':!it?'own':o.rec?o.rec.k:'none'; o.kind=kind;
  if(kind==='always'||kind==='pay'||kind==='up'||kind==='own'){o.ready=true; o.status=kind==='up'?'Workshop job on a vehicle you own: no availability roll':kind==='own'?'Your own line: no availability roll':avText(o.rec);}
  else if(o.roll){o.ready=o.roll.k>0||o.roll.kind==='gmok'; o.status=o.roll.kind==='gmok'?'The GM says it’s available ('+o.roll.d+')':o.roll.k>0?`Found by ${o.roll.who}: about ${o.roll.time}, rolled ${o.roll.d}`:`Not available from ${o.roll.who} right now (rolled ${o.roll.d})`;
    if(o.roll.neg){o.street=Math.max(0,Math.round(o.street*(1-0.05*o.roll.neg.net)));}}
  else if(kind==='ok'&&o.rec.tn!=null){const S2=srcSkill(s); o.tn=o.rec.tn+(S2?S2.tn:0)+(mk().rate&&it&&it.r&&!o.rec.rated?Math.floor((+p.r||0)/2):0); o.dice=S2?S2.r:0; o.odds=S2?odds(o.tn,o.dice):0; o.status=`Needs a roll: ${avText(o.rec)}`;}
  else {o.status=kind==='err'?'Can’t price it: '+p.err:avText(o.rec)+': the GM decides'; o.gmonly=kind!=='err';}
  const mark=+mk().mark||0; if(mark) o.street=Math.round(o.street*(1+mark/100));
  return o;}

// ---------- drawing ----------
const step=(k,lab,v,suf)=>`<div class="mkf"><span class="b2k">${esc(lab)}</span><div class="b2step"><button type="button" class="ghost" data-mks="${k}" data-d="-1" aria-label="Lower ${esc(lab)}">−</button><b>${esc(v)}${suf||''}</b><button type="button" class="ghost" data-mks="${k}" data-d="1" aria-label="Raise ${esc(lab)}">+</button></div></div>`;
function lockerLink(){const a=[...document.querySelectorAll('.srh a[href]')].find(x=>/gear.?locker/i.test(x.getAttribute('href')||'')&&x.offsetParent!==null); return a?`<a href="${esc(a.getAttribute('href'))}">Browse the Gear Locker</a>`:'<span class="note">Send items from the Gear Locker, or add them here.</span>';}
function nameList(){const seen=new Set(); return Object.keys(GEARDB).filter(k=>{const it=GEARDB[k]; if(!it||it.legacy||!itemVisible(it)||seen.has(it.n)) return false; seen.add(it.n); return true;}).map(k=>`<option value="${esc(GEARDB[k].n)}"></option>`).join('');}
let NAMES=null, NAMES_FOR='';
function html(){const M=mk(), s=curSrc(), L=sources(), P=priceAll(M.cart); const rows=M.cart.map(c=>lineInfo(c,P,s));
  const ready=rows.filter(o=>o.ready), cost=ready.reduce((a,o)=>a+o.street,0), essUse=ready.reduce((a,o)=>a+o.ess,0), have=S.nuyenNow===''||S.nuyenNow==null?null:+S.nuyenNow;
  const ess0=S._calc&&S._calc.ess!=null?S._calc.ess:null; const sk=srcSkill(s); const need=rows.filter(o=>o.kind==='ok'&&!o.roll&&o.rec&&o.rec.tn!=null).length;
  const booksKey=JSON.stringify(S.books||{}); if(NAMES==null||NAMES_FOR!==booksKey){NAMES=nameList(); NAMES_FOR=booksKey;}
  const line=o=>{const c=o.L; const r=o.it&&o.it.r&&!o.p.up?`<label class="mkq"><span class="b2k">${esc(o.it.r[2])}</span><input type="number" min="${o.it.r[0]}" max="${o.it.r[1]}" value="${esc(c.it.r!=null?c.it.r:o.it.r[0])}" data-mkr="${c.id}" ${o.roll?'disabled':''}></label>`:'';
    const q=o.it&&!o.p.up?`<label class="mkq"><span class="b2k">Qty</span><input type="number" min="1" max="9999" value="${esc(c.it.qty||1)}" data-mkn="${c.id}" ${o.roll?'disabled':''}></label>`:'';
    const act=o.roll&&!o.ready?`<button type="button" class="ghost" data-mka="retry" data-id="${c.id}">The GM allows a new try</button>`:o.gmonly&&!o.roll?`<button type="button" class="ghost" data-mka="gmok" data-id="${c.id}">The GM says it’s available</button>`:'';
    return `<div class="mkline${o.ready?' ok':o.roll?' no':''}" data-mkline="${c.id}"><div class="mkname"><b>${esc(o.name)}</b><small>${esc([o.it?o.it.pg||'':'',c.from||''].filter(Boolean).join(' · '))}</small></div>
      <div class="mkctl">${r}${q}</div>
      <div class="mknums"><span><small>List</small><b>${fmt(o.list)}¥</b></span><span><small>Street ×</small><b>${o.p.up||!o.it?'—':String(o.si).replace(/^0\./,'.')}</b></span><span><small>Price</small><b class="mkprice">${fmt(o.street)}¥</b></span>${o.tn!=null&&!o.roll?`<span><small>TN · odds</small><b>${o.tn} · ${pct(o.odds)}</b></span>`:''}</div>
      <div class="mkstat"><span>${esc(o.status)}</span>${o.roll&&o.roll.neg?`<small>Haggled: ${o.roll.neg.net>0?'you won by '+o.roll.neg.net+', −'+5*o.roll.neg.net+'%':o.roll.neg.net<0?'they won by '+(-o.roll.neg.net)+', +'+(-5*o.roll.neg.net)+'%':'even, no change'}</small>`:''}${act}</div>
      <button type="button" class="ghost mkx" data-mka="rm" data-id="${c.id}" aria-label="Remove ${esc(o.name)}">×</button></div>`;};
  const who=`<label class="b2f"><span class="b2k">Who is buying</span><select data-mkw="who">${L.map(x=>`<option value="${x.id}" ${s&&x.id===s.id?'selected':''} ${x.ok||x.id==='other'?'':''}>${esc(x.label)}${x.ok&&x.sk.length?' · '+esc(x.sk[0].l)+' '+x.sk[0].r:x.ci!=null&&!x.T?' · numbers not set':''}</option>`).join('')}</select></label>`;
  const ctEdit=s&&s.ci!=null?ctEditHTML(s):'';
  const oth=s&&s.id==='other'?`<div class="mkrow">${step('o.dice','Their dice',M.o.dice)}${step('o.wil','Their Willpower',M.o.wil)}${step('o.neg','Their Negotiation',M.o.neg)}</div>`:'';
  const skSel=s&&s.sk.length>1?`<label class="b2f"><span class="b2k">Their roll</span><select data-mkw="wsk">${s.sk.map((x,i)=>`<option value="${i}" ${sk===x?'selected':''}>${esc(x.l)} ${x.r}${x.tn?' (target number +'+x.tn+')':''}</option>`).join('')}</select></label>`:'';
  const chips=s?`<div class="mkchips">${sk?`<span>${esc(sk.l)} <b>${sk.r}</b>${sk.tn?' (+'+sk.tn+' TN)':''}</span>`:'<span>No dice to roll</span>'}${s.wil!=null?`<span>Willpower <b>${s.wil}</b></span>`:''}${s.neg!=null?`<span>Negotiation <b>${s.neg||'—'}</b></span>`:''}</div>${s.how?`<small class="note">${esc(s.how)}</small>`:''}`:'';
  const pay=`<section class="b2pan mkpay" aria-label="Paying"><span class="b2k">Paying</span>
      <div class="mksum"><span>Nuyen on hand</span><b>${have==null?'not set':fmt(have)+'¥'}</b></div>
      <div class="mksum"><span>Ready to buy (${ready.length} of ${rows.length})</span><b class="mkprice">−${fmt(cost)}¥</b></div>
      <div class="mksum mktot"><span>Left after</span><b>${have==null?'—':fmt(have-cost)+'¥'}</b></div>
      ${essUse>0&&ess0!=null?`<div class="mksum mkess"><span>Essence</span><b>${+ess0.toFixed(2)} → ${+(ess0-essUse).toFixed(2)}</b></div>`:''}
      ${have!=null&&cost>have?`<p class="bad-text">${esc(S.handle||S.name||'The runner')} is ${fmt(cost-have)}¥ short.</p>`:''}
      <button type="button" class="primary mkbuy" data-mka="buy" ${!ready.length||have==null||cost>have?'disabled':''}>Buy ${ready.length} line${ready.length===1?'':'s'} · ${fmt(cost)}¥</button>
      <small class="note">Buy each line once it turns up. Logged in the nuyen log; Undo is under History.</small>
      <details class="mkfree"><summary>Add without paying (loot, a gift)</summary><label class="b2f"><span class="b2k">Where it came from</span><input data-mkt="freeNote" value="${esc(M.freeNote||'')}" placeholder="Off the guards on last night’s run"></label>
        <button type="button" class="ghost" data-mka="free" ${rows.length?'':'disabled'}>Add all ${rows.length} line${rows.length===1?'':'s'} free</button><small class="note">No rolls and no money; the History shows where it came from.</small></details></section>`;
  const main=`<section class="b2pan mkcart" aria-labelledby="mkT"><div class="b2h"><h3 id="mkT">Shopping list</h3><span class="note">${rows.length} line${rows.length===1?'':'s'}</span>${lockerLink()}</div>
      <div class="mkadd"><label class="b2f mkgrow"><span class="b2k">Add by name</span><input list="mkNames" data-mkt="addName" value="${esc(M.addName||'')}" placeholder="Trauma patch, smartlink, ammo…"></label><button type="button" class="ghost" data-mka="addname">Add</button>
        <label class="b2f mkgrow"><span class="b2k">Or paste a gear code</span><input data-mkt="code" value="" placeholder="SR2GEAR:…" class="mono"></label><button type="button" class="ghost" data-mka="code">Add the code</button></div>
      <datalist id="mkNames">${NAMES}</datalist>
      ${M.msg?`<p class="note" role="status">${esc(M.msg)}</p>`:''}
      <div class="mklist">${rows.length?rows.map(line).join(''):'<p class="note">Nothing on the list yet. Send items from the Gear Locker, add one by name, or paste a gear code.</p>'}</div>
      <p class="note">Price is the list price times the Street Index, then the Negotiation result and any markup. The source rolls its dice against the first Availability number; its successes divide the base time, and with none the item isn’t available right now (core p. 184-185). Once rolled, a line keeps its result.</p></section>`;
  const side=`<aside class="mkside"><section class="b2pan mkwho"><span class="b2k">Buying through</span>${who}${skSel}${chips}${ctEdit}${oth}
      <label class="b2chk"><input type="checkbox" data-mkc="hag" ${M.hag?'checked':''}> Haggle: roll Negotiation when it turns up (core p. 185)</label>
      <label class="b2chk"><input type="checkbox" data-mkc="rate" ${M.rate?'checked':''}> Optional: +1 to the target number per 2 rating points (core p. 184)</label>
      ${step('mark','Markup (GM)',M.mark||0,'%')}
      <button type="button" class="ghost mkroll" data-mka="roll" ${need&&sk&&sk.r>0?'':'disabled'}>Roll for availability${need?' ('+need+')':''}</button>
      ${s&&s.self?'<small class="note">The book has a source (usually a fixer) make this roll, with their skill or Etiquette +2. Rolling it yourself is the GM’s call.</small>':''}</section>${pay}</aside>`;
  const bar=`<div class="mkbar" aria-label="Paying"><div><span>${have==null?'Nuyen on hand not set':fmt(have)+'¥ on hand'}</span><span>left after <b>${have==null?'—':fmt(have-cost)+'¥'}</b></span></div><button type="button" class="primary" data-mka="buy" ${!ready.length||have==null||cost>have?'disabled':''}>Buy ${ready.length} line${ready.length===1?'':'s'} · ${fmt(cost)}¥</button></div>`;
  return `<div class="mkgrid"><div class="mkmain">${main}${fenceHTML()}${histHTML()}</div>${side}</div>${rows.length?bar:''}`;}
function ctEditHTML(s){const c=s.c, C=CT(), cur=c.cb==null?'':c.cb; const own=c.cb==='own';
  const num=(k,lab)=>`<label class="mkq"><span class="b2k">${esc(lab)}</span><input type="number" min="0" max="12" value="${esc(c[k]||0)}" data-mkct="${k}"></label>`;
  return `<details class="mkct" ${s.T?'':'open'}><summary>${s.T?'Their numbers: '+esc(s.how):'Set their numbers'}</summary>
    <label class="b2f"><span class="b2k">Like the book’s</span><select data-mkct="cb"><option value="" ${cur===''?'selected':''}>Not set</option><option value="own" ${own?'selected':''}>Type their numbers</option>${(C.CTBOOK||[]).map(b=>`<option value="${b[0]}" ${cur===b[0]?'selected':''}>${esc(b[1])} (core ${b[2]})</option>`).join('')}</select></label>
    ${own?`<div class="mkrow">${num('cq','Equipment Acquisition')}${num('ce','Etiquette')}${num('cw','Willpower')}${num('cn','Negotiation')}${num('cc','Charisma')}</div>`:''}
    <small class="note">Book contacts’ numbers are from core p. 203-213. Only the Fixer has Equipment Acquisition; others roll Etiquette at +2.</small></details>`;}

// ---------- selling to a fence (core p. 188) ----------
function fenceItems(){return S.gear.map((g,i)=>({g,i,it:g.key?GEARDB[g.key]:null})).filter(o=>o.g&&(o.g.key?o.it:o.g.name)&&!(+o.g.ess>0)&&!(+o.g.bi>0)&&!(o.it&&/^(head|body)$/.test(String(o.g.key).split(':')[0]))&&!(typeof CBKEY!=='undefined'&&o.g.key===CBKEY));}
function fenceHTML(){const M=mk(), F=M.f, I=fenceItems(); const picked=I.filter(o=>F.pick[o.i]); const val=picked.reduce((a,o)=>a+Math.round((+o.g.cost||0)*Math.min(+o.g.qty||1,Math.max(1,+F.pick[o.i]||1))),0);
  const km=FENCE_MODS.find(x=>x[0]===F.kind)||FENCE_MODS[0], hm=HEAT.find(x=>x[0]===F.heat)||HEAT[0]; const tn=Math.max(2,4+km[2]+hm[2]+(F.reg?-1:0));
  const et=etqStreet(), others=Math.max(0,+F.others||0), avg=others?Math.floor((et+(+F.oth||0))/(others+1)):et, dice=others?avg+others+1:et;
  const find=F.find, meet=F.meet;
  const pickRows=I.length?I.map(o=>`<label class="mkpick"><input type="checkbox" data-mkfp="${o.i}" ${F.pick[o.i]?'checked':''} ${find?'disabled':''}> <span>${esc(o.g.name||o.it.n)}${(+o.g.qty||1)>1?' ×'+o.g.qty:''}</span><small>${fmt(Math.round(+o.g.cost||0))}¥${(+o.g.qty||1)>1?' each':''}</small>${F.pick[o.i]&&(+o.g.qty||1)>1?`<input type="number" min="1" max="${o.g.qty}" value="${Math.min(+o.g.qty,Math.max(1,+F.pick[o.i]||1))}" data-mkfq="${o.i}" aria-label="How many" ${find?'disabled':''}>`:''}</label>`).join(''):'<p class="note">Nothing to sell: implants can’t go to a fence while they’re in you.</p>';
  let res='';
  if(find){res+=`<p><b>${find.k?`Found a fence: ${find.k} success${find.k>1?'es':''}`:'No fence this time'}</b> (rolled ${find.d}: ${find.r.join(' ')} against ${find.tn}). ${find.k?`The base time is 10 days. Each success either takes a day off (never under 1 day) or grows the fence’s bankroll: the GM rolls 2D6 × 100,000¥ in secret and multiplies by the successes put there. Each day of searching, the GM rolls that many dice against 6 to see whether the owners hear of it.`:'Try again only when the GM says so.'}</p>`;
    if(find.k&&!meet) res+=`<div class="mkrow">${step('f.fneg','Fence’s Negotiation (GM)',F.fneg||4)}${step('f.fwil','Fence’s Willpower (GM)',F.fwil||4)}</div><button type="button" class="primary" data-mka="meet">Hold the meet: roll Negotiation</button>`;
    if(meet){const p=meet.pct; res+=`<p><b>The meet:</b> you rolled ${meet.br.join(' ')} → ${meet.bk} against ${meet.btn}; the fence rolled ${meet.fr.join(' ')} → ${meet.fk} against ${meet.ftn}. ${meet.net>0?'You win by '+meet.net:meet.net<0?'The fence wins by '+(-meet.net):'Even'}: ${p}% of list (30% base, 5% a success, never under 10% or over 50%).</p>
      <button type="button" class="primary" data-mka="sell" ${picked.length?'':'disabled'}>Sell ${picked.length} line${picked.length===1?'':'s'} for ${fmt(Math.round(val*p/100))}¥</button> <button type="button" class="ghost" data-mka="nodeal">No deal</button>`;}
    if(!find.k||meet) res+=` <button type="button" class="ghost" data-mka="fclear">Start over (logged)</button>`;}
  return `<section class="b2pan mkfence" aria-labelledby="mkF"><div class="b2h"><h3 id="mkF">Sell to a fence</h3><span class="note">core p. 188</span></div>
    <div class="mkpicks">${pickRows}</div><p class="note">Picked: ${picked.length} line${picked.length===1?'':'s'}, ${fmt(val)}¥ at list.</p>
    ${find?'':`<div class="mkrow"><label class="b2f"><span class="b2k">What it is</span><select data-mkfs="kind">${FENCE_MODS.map(([k,l,m])=>`<option value="${k}" ${F.kind===k?'selected':''}>${esc(l)} (${m>0?'+':''}${m})</option>`).join('')}</select></label>
      <label class="b2f"><span class="b2k">Heat</span><select data-mkfs="heat">${HEAT.map(([k,l,m])=>`<option value="${k}" ${F.heat===k?'selected':''}>${esc(l)}${m?' (+'+m+')':''}</option>`).join('')}</select></label></div>
      <label class="b2chk"><input type="checkbox" data-mkfc="reg" ${F.reg?'checked':''}> Through a regular contact (−1)</label>
      <div class="mkrow">${step('f.others','Other runners searching',others)}${others?step('f.oth','Their Etiquette (Street), added up',+F.oth||0):''}</div>
      <p class="note">Etiquette (Street) ${et}${others?`; the group’s average ${avg} (rounded down) + 1 die each = ${dice} dice. Everyone who helps must come to the meet`:''}. Target number ${tn}.</p>
      <button type="button" class="primary" data-mka="find" ${picked.length&&dice>0?'':'disabled'}>Look for a fence: roll ${dice} dice</button>`}
    ${res}</section>`;}
function etqStreet(){const sd=skillDiceFor('Etiquette','Street',''); return sd&&sd.dice!=null?sd.dice:0;}

// ---------- history ----------
function histHTML(){const M=mk(); const last=M.hist[M.hist.length-1]; const canUndo=last&&!last.undone&&JSON.stringify(S.gear)===last.after;
  const H=M.hist.slice(-8).reverse().map(h=>`<li><b>${esc(h.d)}</b> ${esc(h.note)}${h.undone?' <i>(undone)</i>':''}</li>`).join('');
  const Lg=M.log.slice(-12).reverse().map(e=>`<li><b>${esc(e.d)}</b> ${esc(logText(e))}</li>`).join('');
  return `<section class="b2pan mkhist" aria-labelledby="mkH"><div class="b2h"><h3 id="mkH">History</h3>${last&&!last.undone?`<button type="button" class="ghost" data-mka="undo" ${canUndo?'':'disabled'}>Undo: ${esc(last.note.slice(0,60))}</button>`:''}</div>
    ${last&&!last.undone&&!canUndo?'<p class="note">The gear has changed since, so Undo would undo more than this; change it back by hand.</p>':''}
    ${H?`<ul class="mkul">${H}</ul>`:'<p class="note">No purchases, gifts or sales yet.</p>'}
    ${Lg?`<details class="mkrolls"><summary>Rolls (${M.log.length})</summary><ul class="mkul">${Lg}</ul></details>`:''}</section>`;}
function logText(e){const n=e.n||'';
  if(e.kind==='avail') return `${n}: ${e.who} rolled ${e.dice} dice against ${e.tn} → ${e.r.join(' ')}, ${e.k?e.k+' success'+(e.k>1?'es':'')+', about '+e.time:'not available'}${e.neg?`; Negotiation ${e.neg.bk} to ${e.neg.sk}`:''}${e.used?' · bought':''}`;
  if(e.kind==='gmok') return `${n}: the GM said it’s available from ${e.who}${e.used?' · bought':''}`;
  if(e.kind==='gmretry') return `${n}: the GM allowed a new try with ${e.who}`;
  if(e.kind==='find') return `Looking for a fence: ${e.dice} dice against ${e.tn} → ${e.r.join(' ')}, ${e.k} success${e.k===1?'':'es'}`;
  if(e.kind==='meet') return `Meet with the fence: ${e.bk} to ${e.fk}, ${e.pct}% of list`;
  if(e.kind==='fclear') return 'Fence search started over';
  return e.note||e.kind;}

// ---------- actions ----------
function snapshot(){return {gear:JSON.stringify(S.gear),books:JSON.stringify(S.books||{}),ny:(S.nyLog||[]).length};}
function histPush(note,amt,before){const M=mk(); const h={id:uid(),d:day(),note,amt,before:before.gear,books:before.books,after:JSON.stringify(S.gear)}; M.hist.push(h); if(M.hist.length>40) M.hist.splice(0,M.hist.length-40); return h;}
function nyPush(amt,note,hid){S.nyLog=S.nyLog||[]; S.nyLog.push({d:day(),amt,note,mk:hid});}
function act(a,id){const M=mk(); M.msg=''; const s=curSrc();
  if(a==='rm'){M.cart=M.cart.filter(c=>c.id!==id);}
  else if(a==='addname'){const t=String(M.addName||'').trim().toLowerCase(); const k=Object.keys(GEARDB).find(k=>GEARDB[k]&&GEARDB[k].n.toLowerCase()===t&&itemVisible(GEARDB[k])&&!GEARDB[k].legacy)||Object.keys(GEARDB).find(k=>GEARDB[k]&&GEARDB[k].n.toLowerCase().startsWith(t)&&t.length>2&&itemVisible(GEARDB[k])&&!GEARDB[k].legacy);
    if(!k) M.msg='No item by that name in the books in play.'; else {addItems([{key:k,qty:1}],'added by name'); M.addName='';}}
  else if(a==='code'){const inp=document.querySelector('#b2market [data-mkt="code"]'); const raw=inp?inp.value.trim():''; try{if(!/^SR2GEAR:/.test(raw)) throw 0; const p=JSON.parse(decodeURIComponent(escape(atob(raw.slice(8))))); const n=fromSend(p); M.msg=n?`Added ${n} line${n>1?'s':''} from the code.`:'The code had nothing this Builder knows.';}catch(e){M.msg='That isn’t a gear code (they start with SR2GEAR:).';}}
  else if(a==='roll'){const sk=srcSkill(s); if(!s||!sk||!(sk.r>0)) return; const P=priceAll(M.cart); let n=0, reused=0;
    M.cart.forEach(c=>{const o=lineInfo(c,P,s); if(o.kind!=='ok'||o.roll||o.rec.tn==null) return; const sKey=srcKey(s); const prev=openRoll(c.it.key,sKey); if(prev){reused++; return;}
      const r=rollD(sk.r,o.tn), k=succ(r,o.tn); const e={kind:'avail',key:c.it.key,n:o.name,src:sKey,who:s.label,dice:sk.r,skill:sk.l,tn:o.tn,r,k,time:k?avTime(o.rec.n,o.rec.u,k):''};
      if(k&&M.hag&&!s.self){const b=buyerNeg(), sn=srcNeg(s); const btn=Math.max(2,(s.wil||1)+b.tn), stn=Math.max(2,attrNow('wil')+sn.tn); const br=rollD(b.dice,btn), sr=rollD(sn.dice,stn); const bk=succ(br,btn), skk=succ(sr,stn); e.neg={br,sr,bk,sk:skk,btn,stn,net:bk-skk,how:b.how+' vs '+sn.how};}
      logAdd(e); c.src=sKey; n++;});
    M.msg=n?`Rolled ${n} line${n>1?'s':''}.`:reused?'Those lines already have a roll from this source.':'Nothing to roll.';}
  else if(a==='gmok'||a==='retry'){const c=M.cart.find(x=>x.id===id); if(!c||!c.it.key) return; const sKey=c.src||srcKey(s); logAdd({kind:a==='gmok'?'gmok':'gmretry',key:c.it.key,n:(GEARDB[c.it.key]||{}).n,src:sKey,who:s?s.label:'the source'}); if(a==='retry') delete c.src;}
  else if(a==='buy'||a==='free'){const P=priceAll(M.cart); const rows=M.cart.map(c=>lineInfo(c,P,s)); const take=a==='free'?rows:rows.filter(o=>o.ready); if(!take.length) return;
    const cost=a==='free'?0:take.reduce((x,o)=>x+o.street,0); if(a==='buy'&&(S.nuyenNow===''||S.nuyenNow==null||cost>+S.nuyenNow)) return;
    const before=snapshot(); const r=gearImport({items:take.map(o=>o.x)}); syncGear();
    take.forEach(o=>{if(o.roll) o.roll.used=true;}); M.cart=M.cart.filter(c=>!take.some(o=>o.L===c));
    const note=a==='free'?`Added free: ${take.map(o=>o.name).join(', ')}${M.freeNote?' (from '+M.freeNote+')':''}`:`Bought ${take.map(o=>o.name).join(', ')}${s?' through '+s.label:''}`;
    const h=histPush(note,-cost,before); h.lines=take.map(o=>clone(o.L)); h.rolls=take.filter(o=>o.roll).map(o=>o.roll.id); if(cost){S.nuyenNow=(+S.nuyenNow||0)-cost; nyPush(-cost,'Marketplace: '+note.replace(/^Bought /,''),h.id);} if(a==='free') M.freeNote='';
    M.msg=`${a==='free'?'Added':'Bought'} ${r.added.length} item${r.added.length===1?'':'s'}${cost?' for '+fmt(cost)+'¥':''}${r.skipped.length?'; skipped '+r.skipped.join(', '):''}.`;}
  else if(a==='undo'){const h=M.hist[M.hist.length-1]; if(!h||h.undone||JSON.stringify(S.gear)!==h.after) return; S.gear=JSON.parse(h.before); if(h.books) S.books=JSON.parse(h.books);
    if(h.amt){S.nuyenNow=(+S.nuyenNow||0)-h.amt; const j=(S.nyLog||[]).findIndex(x=>x.mk===h.id); if(j>=0) S.nyLog.splice(j,1);} h.undone=true;
    if(h.lines){M.cart=h.lines.concat(M.cart); (h.rolls||[]).forEach(id=>{const e=M.log.find(x=>x.id===id); if(e) delete e.used;});} // the lines go back on the list with their rolls, so an undo can't buy a fresh roll
    M.msg='Undone: '+h.note+'.'; if(typeof fillGearCats==='function') fillGearCats();}
  else if(a==='find'){const F=M.f, I=fenceItems().filter(o=>F.pick[o.i]); if(!I.length) return; const km=FENCE_MODS.find(x=>x[0]===F.kind)||FENCE_MODS[0], hm=HEAT.find(x=>x[0]===F.heat)||HEAT[0]; const tn=Math.max(2,4+km[2]+hm[2]+(F.reg?-1:0));
    const et=etqStreet(), others=Math.max(0,+F.others||0), dice=others?Math.floor((et+(+F.oth||0))/(others+1))+others+1:et; const r=rollD(dice,tn); F.find=logAdd({kind:'find',dice,tn,r,k:succ(r,tn)});}
  else if(a==='meet'){const F=M.f; if(!F.find||!F.find.k||F.meet) return; const b=buyerNeg(), fw=Math.max(1,+F.fwil||4), fn=Math.max(0,+F.fneg||4); const btn=fw+2+b.tn, ftn=attrNow('wil')+2; const br=rollD(b.dice,btn), fr=rollD(fn,ftn); const bk=succ(br,btn), fk=succ(fr,ftn), net=bk-fk;
    const p=Math.max(10,Math.min(50,30+5*net)); F.meet=logAdd({kind:'meet',br,fr,bk,fk,btn,ftn,net,pct:p});}
  else if(a==='sell'){const F=M.f; if(!F.meet) return; const I=fenceItems().filter(o=>F.pick[o.i]); if(!I.length) return; const before=snapshot(); let val=0; const names=[];
    I.sort((x,y)=>y.i-x.i).forEach(o=>{const q=+o.g.qty||1, n=Math.min(q,Math.max(1,+F.pick[o.i]||1)); val+=Math.round((+o.g.cost||0)*n); names.push((o.g.name||o.it.n)+(n>1?' ×'+n:'')); if(n>=q) gearRemoveAt(o.i); else o.g.qty=q-n;});
    const got=Math.round(val*F.meet.pct/100); const note=`Sold to a fence: ${names.reverse().join(', ')} at ${F.meet.pct}% of list`; const h=histPush(note,got,before); h.sold=true; S.nuyenNow=(+S.nuyenNow||0)+got; nyPush(got,'Marketplace: '+note,h.id);
    M.f={pick:{},kind:F.kind,heat:F.heat,reg:F.reg,others:F.others,oth:F.oth,fneg:F.fneg,fwil:F.fwil}; M.msg=`Sold for ${fmt(got)}¥.`;}
  else if(a==='nodeal'||a==='fclear'){const F=M.f; logAdd({kind:'fclear'}); M.f={pick:a==='nodeal'?F.pick:{},kind:F.kind,heat:F.heat,reg:F.reg,others:F.others,oth:F.oth,fneg:F.fneg,fwil:F.fwil};}
  render();}
function stepK(k,d){const M=mk(); if(k==='mark') M.mark=Math.max(-50,Math.min(200,(+M.mark||0)+5*d)); else if(k.startsWith('o.')){const f=k.slice(2); M.o[f]=Math.max(f==='wil'?1:0,Math.min(12,(+M.o[f]||0)+d));}
  else if(k.startsWith('f.')){const f=k.slice(2); M.f[f]=Math.max(f==='fwil'?1:0,Math.min(f==='oth'?60:12,(+M.f[f]||(f==='fneg'||f==='fwil'?4:0))+d));} render();}

// ---------- the tab ----------
let BOUND=false;
function bind(){if(BOUND) return; BOUND=true; const root=()=>document.getElementById('b2market');
  document.addEventListener('click',e=>{const R=root(); if(!R||!R.contains(e.target)) return; const b=e.target.closest('[data-mka],[data-mks]'); if(!b) return; if(b.dataset.mka) act(b.dataset.mka,b.dataset.id); else stepK(b.dataset.mks,+b.dataset.d);});
  document.addEventListener('input',e=>{const R=root(); if(!R||!R.contains(e.target)) return; const t=e.target, M=mk(); if(t.dataset.mkt==='addName') M.addName=t.value; else if(t.dataset.mkt==='freeNote') M.freeNote=t.value;});
  document.addEventListener('keydown',e=>{if(e.key!=='Enter') return; const t=e.target; if(t&&t.dataset&&t.dataset.mkt==='addName'){e.preventDefault(); mk().addName=t.value; act('addname');} else if(t&&t.dataset&&t.dataset.mkt==='code'){e.preventDefault(); act('code');}});
  document.addEventListener('change',e=>{const R=root(); if(!R||!R.contains(e.target)) return; const t=e.target, M=mk(), d=t.dataset;
    if(d.mkw==='who'){M.who=t.value; M.wsk=null;} else if(d.mkw==='wsk') M.wsk=+t.value;
    else if(d.mkc) M[d.mkc]=t.checked;
    else if(d.mkr||d.mkn){const c=M.cart.find(x=>x.id===(d.mkr||d.mkn)); if(c){const it=GEARDB[c.it.key]; if(d.mkr&&it&&it.r) c.it.r=Math.max(it.r[0],Math.min(it.r[1],Math.round(+t.value||it.r[0]))); if(d.mkn) c.it.qty=Math.max(1,Math.min(9999,Math.round(+t.value||1)));}}
    else if(d.mkct){const s=curSrc(); if(s&&s.c){const c=s.c; if(d.mkct==='cb'){if(t.value) c.cb=t.value; else delete c.cb; delete c.cei;} else c[d.mkct]=Math.max(0,Math.min(12,Math.round(+t.value||0)));}}
    else if(d.mkfp!=null){if(t.checked) M.f.pick[d.mkfp]=1; else delete M.f.pick[d.mkfp];} else if(d.mkfq!=null) M.f.pick[d.mkfq]=Math.max(1,Math.round(+t.value||1));
    else if(d.mkfs) M.f[d.mkfs]=t.value; else if(d.mkfc) M.f[d.mkfc]=t.checked; else return;
    render();});}
function draw(){const R=document.getElementById('b2market'); const tb=document.querySelector('#b2tabs [data-tab="market"]'); if(tb) tb.hidden=!S.established;
  if(!R) return; const on=document.body.classList.contains('b2mk'); if(!on) return; if(!S.established){R.innerHTML='<p class="note">The Marketplace is for established runners: tick Established on the Build tab first. While building, gear is bought at list price from Resources.</p>'; return;}
  bind(); const a=document.activeElement, keep=a&&R.contains(a)?(a.dataset&&Object.keys(a.dataset).map(k=>k+'='+a.dataset[k]).join('&')):null, pos=a&&typeof a.selectionStart==='number'?a.selectionStart:null;
  const openD=new Set([...R.querySelectorAll('details')].filter(d=>d.open).map(d=>d.className)), shutD=new Set([...R.querySelectorAll('details')].filter(d=>!d.open).map(d=>d.className));
  R.innerHTML=html(); R.querySelectorAll('details').forEach(d=>{if(openD.has(d.className)) d.open=true; else if(shutD.has(d.className)) d.open=false;});
  if(keep){const sel='['+keep.split('&').map(p=>{const [k,v]=p.split('='); return 'data-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+'="'+v+'"';}).join('][')+']'; const el=R.querySelector(sel); if(el){el.focus(); try{if(pos!=null&&el.setSelectionRange) el.setSelectionRange(pos,pos);}catch(e){}}}}
window.SR2MK={draw,fromSend,addItems,priceAll,avRec,CTTRADE,mk};
})();
