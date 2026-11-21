// ---------- Fixer: buying off the street (core p. 184–185) ----------
// Availability (TN/base time) and Street Index for each item, checked against the printed tables.
// Fixer price = Cost x Street Index, then the Negotiation result (5% per net success), then any house markup.
const AVAIL=/*AVAIL*/{};
const FXKEY='sr2gear-fixer';
const FXDEF={who:'',on:false,open:false,dice:4,etiq:false,rate:false,neg:0,mark:0,fee:0};
let FXS=Object.assign({},FXDEF);
try{const s=JSON.parse(localStorage.getItem(FXKEY)||'null'); if(s&&typeof s==='object') FXS=Object.assign({},FXDEF,s);}catch(e){}
function fxSave(){try{localStorage.setItem(FXKEY,JSON.stringify(FXS));}catch(e){}}
const FXU={hrs:['hour','hours'],days:['day','days'],wks:['week','weeks'],mths:['month','months']};
function fxEval(x,r){ if(x==null) return null; const s=String(x).replace(/Rating|Force|Level/gi,'('+(+r||0)+')').replace(/x/g,'*');
  if(!/^[\d.+*()\-\s]+$/.test(s)) return null; try{const v=Function('"use strict";return ('+s+')')(); return isFinite(v)?v:null;}catch(e){return null;}}
function fxRaw(i){return i?AVAIL[i.id]||null:null;}
// the availability that applies at this rating: {k, tn, n, u, si, p, lvNote}
function fxRec(i,r){const a=fxRaw(i); if(!a) return null; let b=a;
  if(a.lv){const rr=+r||(i.r?i.r[0]:1); const L=a.lv.find(x=>rr>=x.lo&&rr<=x.hi)||a.lv[a.lv.length-1]; b=Object.assign({},a,L);}
  const o={k:b.k,si:b.si!=null?+b.si:null,p:a.p,note:b.note||''};
  if(b.k==='ok'){o.tn=b.tn==='-'?null:fxEval(b.tn,r); o.n=fxEval(b.n,r); o.u=b.u; o.tnTxt=b.tn; o.nTxt=b.n;
    o.rated=/Rating|Force/i.test(b.tn+b.n);}
  return o;}
function fxSI(i,r){const a=fxRec(i,r); return a&&a.si!=null&&a.si>0?a.si:null;}
function fxMult(){return (1-0.05*(+FXS.neg||0))*(1+(+FXS.mark||0)/100);}
// street price for a list price of this item, or null when the fixer is off or the item isn't bought
function fxPrice(i,base,r){ if(!FXS.on||base==null||!isFinite(base)) return null; const si=fxSI(i,r)||1; return Math.round(base*si*fxMult());}
// chance one die beats TN with the rule of six
function fxP1(t){ if(t<=1) return 1; if(t<=6) return (7-Math.max(2,t))/6; return fxP1(t-6)/6;}
function fxBinom(n,k,p){let c=1; for(let j=1;j<=k;j++) c=c*(n-k+j)/j; return c*Math.pow(p,k)*Math.pow(1-p,n-k);}
function fxTN(i,a,r){ if(!a||a.tn==null) return null; let t=a.tn; if(FXS.etiq) t+=2; if(FXS.rate&&i&&i.r&&!a.rated) t+=Math.floor((+r||0)/2); return t;}
function fxOdds(t,d){d=Math.max(0,Math.min(30,Math.round(+d||0))); const p=fxP1(t); const find=1-Math.pow(1-p,d);
  let best=1,bp=-1; for(let k=1;k<=d;k++){const q=fxBinom(d,k,p); if(q>bp){bp=q;best=k;}} return {p,find,mode:best,d};}
function fxTime(n,u,k){ if(n==null) return ''; let v=n/(k||1), unit=u;
  if(unit==='mths'&&v<1){v*=30;unit='days';} if(unit==='wks'&&v<1){v*=7;unit='days';} if(unit==='days'&&v<1){v*=24;unit='hrs';}
  const r=v>=10?Math.round(v):Math.round(v*10)/10; return r+' '+FXU[unit][r===1?0:1];}
function fxAvText(a){ if(!a) return 'Not listed'; if(a.k==='always') return 'Always available'; if(a.k==='gm') return 'GM’s discretion'; if(a.k==='pay') return 'Subscription';
  if(a.k==='note') return a.note; if(a.k==='none') return 'Not listed';
  return `${a.tnTxt==='-'?'—':a.tnTxt.replace(/^\((.*)\)$/,'$1').replace(/x/g,'×')}/${String(a.nTxt).replace(/^\((.*)\)$/,'$1').replace(/x/g,'×')} ${a.u}`;}
function fxSiText(a){return a&&a.si!=null?String(a.si).replace(/^0\./,'.'):'—';}
// list row: fixer price on top, list price under it
function fxListPrice(i){const base=numPrice(i); const lab=priceLabel(i); if(!FXS.on||base==null) return lab;
  const fp=fxPrice(i,base,i.r?i.r[0]:0); return `<b class="fxp">${fmt(fp)}¥${i.r?'+':''}</b><small class="fxl">list ${esc(lab)}</small>`;}
function fxHeadPrice(i,r,price,priceTxt){ if(!FXS.on||price==null||!isFinite(price)) return priceTxt; return `${fmt(fxPrice(i,price,r))}¥ <span class="fxl">list ${priceTxt}</span>`;}
function fxBarPrice(i,r,price,priceTxt){ if(!FXS.on||price==null||!isFinite(price)) return priceTxt; return `${fmt(fxPrice(i,price,r))}¥`;}
function fxTerms(){const t=[`${FXS.dice} ${FXS.etiq?'Etiquette':'Equipment Acquisition'} dice`]; if(+FXS.neg) t.push(`Negotiation ${FXS.neg>0?'+':''}${FXS.neg} net (${FXS.neg>0?'−':'+'}${Math.abs(FXS.neg*5)}%)`); if(+FXS.mark) t.push(`markup ${FXS.mark>0?'+':''}${FXS.mark}%`); return t.join(', ');}
// overview block: availability, Street Index, and the fixer's odds
function fxAvailHTML(i,r){ if(i.sp||i.ef||i.mt||i.cat==='power') return ''; const a=fxRec(i,r);
  const cite=a&&a.p?`<span class="note">${esc(a.p)}</span>`:'';
  const rows=[fact('Availability',esc(fxAvText(a))),fact('Street Index',esc(a&&a.k!=='none'?fxSiText(a):'—'))];
  let body='';
  if(!a||a.k==='none') body=`<p class="note">No availability or Street Index is printed for this item. Your GM sets both${FXS.on?'; the fixer price uses a Street Index of 1 until then':''}.</p>`;
  else if(a.k==='gm') body=`<p class="note">The book leaves availability to the GM: it isn’t normally sold on the street.</p>`;
  else if(a.k==='always') body=`<p class="note">Legal and on store shelves: no Acquisition Test needed (core p. 184).</p>`;
  else if(a.k==='ok'&&FXS.on){const t=fxTN(i,a,r); if(t==null) body=`<p class="note">No target number printed; ask the GM.</p>`; else {const o=fxOdds(t,FXS.dice);
    body=`<div class="fxodds"><div><span class="lbl">Target number</span><b>${t}</b></div><div><span class="lbl">${o.d} dice find it</span><b>${Math.round(o.find*100)}%</b></div><div><span class="lbl">Most likely</span><b>${fxTime(a.n,a.u,o.mode)}</b><span class="note">${o.mode} success${o.mode>1?'es':''}; the fixer calls at ${fxTime(a.n/2,a.u,o.mode)}</span></div></div>
      ${o.find<0.5?`<p class="kwarn">Hard find for this fixer. With no successes it isn’t available right now (core p. 185).</p>`:''}`;}}
  else if(a.k==='ok') body=`<p class="note">Turn on <b>Fixer</b> at the top to see the odds, delivery time and street price.</p>`;
  const price=FXS.on&&numPrice(i)!=null?`<p class="note">Street price: ${fmt(costAt(i,r))}¥ × ${fxSiText(a&&a.si!=null?a:{si:1})}${+FXS.neg?` × ${(1-0.05*FXS.neg).toFixed(2)} (Negotiation)`:''}${+FXS.mark?` × ${(1+FXS.mark/100).toFixed(2)} (markup)`:''} = <b>${fmt(fxPrice(i,costAt(i,r),r))}¥</b></p>`:'';
  return `<section class="fxbox"><h4>Buying it on the street ${cite}</h4><dl class="facts">${rows.join('')}</dl>${body}${price}</section>`;}
// shopping list
function fxKitItem(k){return BYID[k.id]||null;}
function fxKitPrice(k,p){const i=fxKitItem(k); if(!FXS.on) return p; if(!i) return Math.round(p*fxMult()); return fxPrice(i,p,k.r);}
function fxKitC(k,p){ if(!FXS.on) return fmt(p)+'¥'; return `${fmt(fxKitPrice(k,p))}¥ <small class="fxl">list ${fmt(p)}¥</small>`;}
function fxKitAv(k){const i=fxKitItem(k); if(!i) return ''; const a=fxRec(i,k.r); if(!a||a.k==='none') return `<span class="kn fxav">Availability not listed</span>`;
  if(a.k!=='ok') return `<span class="kn fxav">${esc(fxAvText(a))}</span>`;
  const t=fxTN(i,a,k.r); let s=`Avail ${esc(fxAvText(a))} · SI ${fxSiText(a)}`;
  if(FXS.on&&t!=null){const o=fxOdds(t,FXS.dice); s+=` · ${Math.round(o.find*100)}% · ~${fxTime(a.n,a.u,o.mode)}`;}
  return `<span class="kn fxav${FXS.on&&t!=null&&fxOdds(t,FXS.dice).find<0.5?' fxhard':''}">${s}</span>`;}
function fxKitTotal(){let c=0; st.kit.forEach(k=>{c+=fxKitPrice(k,kitPrice(k));}); return c+(FXS.on?Math.max(0,+FXS.fee||0):0);}
function fxHours(n,u){return n*({hrs:1,days:24,wks:168,mths:720}[u]||1);}
function fxKitTot(c,cTxt){ if(!FXS.on) return `<div><span class="lbl">Total</span><b>${cTxt}</b></div>`;
  return `<div><span class="lbl">Fixer total</span><b>${fmt(fxKitTotal())}¥</b><span class="note">list ${cTxt}${+FXS.fee?` · fee ${fmt(FXS.fee)}¥`:''}</span></div>`;}
function fxKitFoot(){ if(!FXS.on||!st.kit.length) return ''; let slow=null, hard=[], none=[];
  st.kit.forEach(k=>{const i=fxKitItem(k); if(!i) return; const a=fxRec(i,k.r); if(!a||a.k==='none'||a.k==='gm'){none.push(i.n); return;} if(a.k!=='ok') return; const t=fxTN(i,a,k.r); if(t==null) return; const o=fxOdds(t,FXS.dice);
    const h=fxHours(a.n,a.u)/o.mode; if(!slow||h>slow.h) slow={h,n:i.n,txt:fxTime(a.n,a.u,o.mode)}; if(o.find<0.5) hard.push(i.n);});
  return `<div class="fxfoot">${slow?`<span>Slowest: <b>${esc(slow.n)}</b>, about ${slow.txt}</span>`:''}${hard.length?`<span class="kwarn">Under 50% to find: ${esc([...new Set(hard)].join(', '))}</span>`:''}${none.length?`<span class="note">GM sets availability: ${esc([...new Set(none)].join(', '))}</span>`:''}<span class="note">Fixer: ${esc(fxTerms())}</span></div>`;}
function fxStreet(){ if(!FXS.on||!st.kit.length) return {}; return {street:{total:fxKitTotal(),list:st.kit.reduce((a,k)=>a+kitPrice(k),0),fee:Math.max(0,+FXS.fee||0),terms:fxTerms()}};}
// the panel under the header
function fxBtn(){const b=$('fxBtn'); if(!b) return; b.setAttribute('aria-expanded',FXS.open?'true':'false'); b.classList.toggle('on',!!FXS.on);
  b.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 5h12M2 11h12M5 2l-1 12M12 2l-1 12"/></svg>Fixer <span class="n">${FXS.on?'on':'off'}</span>`;}
function fxStep(id,lab,val,lo,hi,suf,hint){return `<div class="fxf"><span class="fxk">${lab}</span><span class="fxs"><button type="button" class="sq" data-fxs="${id}" data-d="-1" aria-label="Lower ${lab}" ${val<=lo?'disabled':''}>−</button><b>${val>0&&id!=='dice'?'+':''}${val}${suf||''}</b><button type="button" class="sq" data-fxs="${id}" data-d="1" aria-label="Raise ${lab}" ${val>=hi?'disabled':''}>+</button></span>${hint?`<span class="note">${hint}</span>`:''}</div>`;}
// the fixer as a contact: the core Fixer contact (core p. 207), or a fixer on the linked runner's contact list
function fxContacts(){const C=(typeof OWNC!=='undefined'&&OWNC&&OWNC.S&&Array.isArray(OWNC.S.contacts))?OWNC.S.contacts:[]; return C.map((c,ix)=>({c,ix})).filter(o=>o.c&&/fixer/i.test((o.c.role||'')+' '+(o.c.name||'')));}
function fxWhoHTML(){const L=fxContacts(); let w=FXS.who||''; if(w.startsWith('c:')&&!L.some(o=>'c:'+o.ix===w)) w='';
  const opt=(v,t)=>`<option value="${v}" ${v===w?'selected':''}>${esc(t)}</option>`;
  const nm=o=>(o.c.name||'Unnamed fixer')+(o.c.level&&o.c.level!=='Contact'?' ('+o.c.level+')':'');
  const note=w?`Uses the core Fixer contact: Equipment Acquisition 4, Willpower 5, Negotiation 7 (core p. 207). For the price, you roll your Negotiation against his Willpower 5 and he rolls Negotiation 7 against your Willpower; put the net successes in <b>Negotiation</b> (core p. 185).`:(L.length?'':(OWNC?`${esc(shortName(OWNC))} has no contact with “fixer” in the name or role.`:'Pick a runner at the top to choose from their contacts.'));
  return `<div class="fxf"><label class="fxk" for="fxWho">Who is buying</label><select id="fxWho" class="fxsel">${opt('','Numbers typed in by hand')}${opt('core','Core Fixer contact')}${L.map(o=>opt('c:'+o.ix,nm(o)+(OWNC?' · '+shortName(OWNC)+'’s contact':''))).join('')}</select><span class="note">${note}</span></div>`;}
function fxPanel(){const p=$('fxPanel'); if(!p) return; fxBtn(); p.hidden=!FXS.open; if(!FXS.open) return;
  p.innerHTML=`<div class="srcp-h"><button type="button" class="srcbtn" id="fxClose" aria-expanded="true" aria-controls="fxPanel" style="border-color:transparent;background:none"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg>Fixer</button>
    <span class="note">Buy through a fixer by the book: Cost × Street Index, an Acquisition Test against the availability, then Negotiation (core p. 184–185).</span>
    <label class="fxon"><input type="checkbox" id="fxOn" ${FXS.on?'checked':''}> Use fixer prices</label></div>
    <div class="fxgrid">
      ${fxWhoHTML()}
      ${fxStep('dice','Fixer’s dice',FXS.dice,1,20,'',FXS.etiq?'Etiquette skill':'Equipment Acquisition skill')}
      ${fxStep('neg','Negotiation',FXS.neg,-10,10,'','Net successes; each one moves the price 5% ('+(FXS.neg>0?'you win':FXS.neg<0?'fixer wins':'even')+')')}
      ${fxStep('mark','Markup',FXS.mark,-50,200,'%','House rule: the fixer’s cut or a rush, on every price')}
      <div class="fxf"><span class="fxk">Extra fee on the order</span><span class="fxs"><input type="number" id="fxFee" min="0" step="500" value="${+FXS.fee||0}" inputmode="numeric"> ¥</span><span class="note">House rule: a flat rush or finder’s fee, added to the shopping list total</span></div>
      <div class="fxf"><label class="fxc"><input type="checkbox" id="fxEtiq" ${FXS.etiq?'checked':''}> Fixer uses Etiquette, not Equipment Acquisition</label><span class="note">Read as +2 to the target number (core p. 184 says “adding +2”; your GM may read it as dice)</span></div>
      <div class="fxf"><label class="fxc"><input type="checkbox" id="fxRate" ${FXS.rate?'checked':''}> +1 target number per 2 rating points</label><span class="note">Optional rule for rated gear (core p. 184)</span></div>
    </div>
    <p class="note fxsum">${FXS.on?`Prices show the fixer price with the list price under it. ${esc(fxTerms())}.`:'Prices show list prices. Tick <b>Use fixer prices</b> to switch every price to the street price.'} Availability and Street Index are guidelines: the GM can change them for the campaign (core p. 184).</p>`;}
function fxAll(){fxSave(); fxPanel(); all();}
document.addEventListener('click',e=>{const t=e.target; if(!t||!t.closest) return;
  if(t.id==='sendClear'){st.kit=[]; save(); renderKit(); const d=$('sendDlg'); if(d) d.hidden=true; return;}
  if(t.closest('#fxBtn')||t.closest('#fxClose')){FXS.open=!FXS.open; fxSave(); fxPanel(); if(FXS.open){const p=$('fxPanel'); if(p&&p.scrollIntoView) p.scrollIntoView({block:'nearest'});} return;}
  const s=t.closest('[data-fxs]'); if(s){const id=s.dataset.fxs, d=+s.dataset.d; if(id==='dice') FXS.who=''; const lim={dice:[1,20,1],neg:[-10,10,1],mark:[-50,200,5]}[id]; FXS[id]=Math.max(lim[0],Math.min(lim[1],(+FXS[id]||0)+d*lim[2])); fxAll(); const b=document.querySelector(`[data-fxs="${id}"][data-d="${d}"]`); if(b&&!b.disabled) b.focus(); return;}});
document.addEventListener('change',e=>{const t=e.target; if(!t) return;
  if(t.id==='fxOn'){FXS.on=t.checked; fxAll(); const x=$('fxOn'); if(x) x.focus(); return;}
  if(t.id==='fxWho'){FXS.who=t.value; if(FXS.who){FXS.dice=4; FXS.etiq=false;} fxAll(); const x=$('fxWho'); if(x) x.focus(); return;}
  if(t.id==='fxEtiq'){FXS.etiq=t.checked; if(t.checked) FXS.who=''; fxAll(); const x=$('fxEtiq'); if(x) x.focus(); return;}
  if(t.id==='fxRate'){FXS.rate=t.checked; fxAll(); const x=$('fxRate'); if(x) x.focus(); return;}
  if(t.id==='fxFee'){FXS.fee=Math.max(0,Math.round(+t.value||0)); fxAll(); const x=$('fxFee'); if(x) x.focus(); return;}});
// ---------- Drone weapon finder: what fits each mount on this vehicle (R2 p. 131–135) ----------
// Weapon Values Table (R2 p. 135); names first, then weapon type
const DWV_NAME=[[/Vindicator/,2],[/Vengeance|Vanquisher/,2.5],[/Autocannon/,3],[/Assault Cannon/i,3],[/Ballista/,4],[/Mortar/,4]];
const DWV_TYPE={smg:1,assault:1,sniper:1,sport:1,lmg:1.5,mmg:2,hmg:2,cannon:3,mortar:4,ballista:4};
const DSMALL=new Set(['holdout','light','heavy','smg','shotgun','assault','sniper','sport','lmg']);
function dwv(x){for(const [re,v] of DWV_NAME) if(re.test(x.n)) return v; const t=wtype(x); return t&&DWV_TYPE[t]!=null?DWV_TYPE[t]:null;}
// [mount id, label, rule]: rule 'firm' (small arms and LMGs), 'hard' (anything on the table or small arms), 'ring' (man-portable), 'mis' (missiles), or a number (max weapon value)
const DMOUNTS=[['fx_ef','External firmpoint','firm','R2 p. 131'],['fx_if','Internal firmpoint','firm','R2 p. 131'],['pintle','Pintle mount','firm','R2 p. 133'],
 ['fx_eh','External hardpoint','hard','R2 p. 131'],['fx_ih','Internal hardpoint','hard','R2 p. 131'],['ring','Ring mount','ring','R2 p. 133–134'],
 ['rt_micro','Micro remote turret',1,'R2 p. 134–135'],['rt_mini','Mini remote turret',2,'R2 p. 134–135'],['rt_small','Small remote turret',3,'R2 p. 134–135'],['rt_med','Medium remote turret',6,'R2 p. 134–135'],
 ['tur_mini','Mini turret',2,'R2 p. 134–135'],['tur_small','Small turret',3,'R2 p. 134–135'],['tur_med','Medium turret',6,'R2 p. 134–135'],
 ['mis_ext','External missile mount','mis','R2 p. 133'],['mis_int','Internal missile mount','mis','R2 p. 133']];
function dFits(rule,x){const v=dwv(x), t=wtype(x);
  if(rule==='mis') return x.cat==='vweap'&&/Missile|Rocket|AARM/.test(x.n)&&!/Launcher/.test(x.n);
  if(x.cat==='vweap'&&/Missile|Rocket|AARM|Mine/.test(x.n)) return false;
  if(rule==='firm') return x.cat==='guns'&&DSMALL.has(t); // by weapon type: the Vindicator is an LMG (SSC p. 58) though R2 gives it weapon value 2
  if(rule==='ring') return x.cat==='guns'&&v!=null&&v>=1.5;
  if(rule==='hard') return (x.cat==='guns'&&DSMALL.has(t))||v!=null;
  return v!=null&&v<=rule;}
function dPill(x){const a=fxRec(x,x.r?x.r[0]:0); let av='';
  if(a&&a.k==='ok'&&FXS.on){const t=fxTN(x,a,x.r?x.r[0]:0); if(t!=null){const o=fxOdds(t,FXS.dice); av=`TN ${t} · ${Math.round(o.find*100)}%`;}}
  else av=fxAvText(a);
  const v=dwv(x);
  return `<button type="button" class="pill ${visible(x)?'':'off'}" data-id="${esc(x.id)}" title="${esc(BOOK[x.src][0]+' '+pageRef(x))}">${srcTag(x.src)}${esc(x.n)}${v!=null?`<span class="note">WV ${v}</span>`:''}<span class="pp">${fxListPrice(x)}</span><span class="fxav">${esc(av)}</span></button>`;}
function droneFinder(i){const {B,v}=vbFix(i); const c=VB.calc(v,B).c; const G=[];
  const pool=ITEMS.filter(x=>(x.cat==='guns'||x.cat==='vweap')&&visible(x));
  DMOUNTS.forEach(([id,lab,rule,pg])=>{const n=c.lv(id); if(!n) return; const f=v&&v.fac&&v.fac[id]?+v.fac[id].lv||0:0;
    const L=pool.filter(x=>dFits(rule,x)).sort((a,b)=>(dwv(b)||0)-(dwv(a)||0)||(numPrice(a)||0)-(numPrice(b)||0));
    const how=f&&n>f?`${f} factory, ${n-f} added`:f?'factory':'added in the build';
    const rl=rule==='firm'?'Small arms (assault rifle and smaller) and LMGs':rule==='hard'?'Heavy weapons, and anything a firmpoint takes':rule==='ring'?'LMGs and man-portable heavy weapons; vehicle weapons like the Vanquisher are not man-portable (R2 p. 92)':rule==='mis'?'Missiles and rockets':`Weapon value up to ${rule}: one weapon, or several whose values add up to ${rule} or less`;
    G.push({title:`${lab} × ${n} (${how})`,html:`<p class="note">${esc(rl)} (${pg}; weapon values R2 p. 135).${FXS.on?' Each weapon shows the fixer price and the chance this fixer finds it.':' Turn on the Fixer to see street prices and odds.'}</p>${L.length?`<div class="pills">${L.map(dPill).join('')}</div>`:'<p class="note">Nothing in the books you have turned on fits here.</p>'}`});});
  if(G.length) G.unshift({title:'Weapons that fit this vehicle',text:'Grouped by mount, from the factory mounts plus any you added in the build. Weapons not on the Weapon Values Table (R2 p. 135) don’t go in turrets; ask the GM.'});
  return G;}
