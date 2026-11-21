// ---------- Fixer: buying off the street (core p. 184–185) ----------
// Availability (TN/base time) and Street Index for each item, checked against the printed tables.
// Fixer price = Cost x Street Index, then the Negotiation result (5% per net success), then any house markup.
const AVAIL=/*AVAIL*/{};
const FXKEY='sr2gear-fixer';
const FXDEF={on:false,open:false,dice:4,etiq:false,rate:false,neg:0,mark:0,fee:0};
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
function fxPanel(){const p=$('fxPanel'); if(!p) return; fxBtn(); p.hidden=!FXS.open; if(!FXS.open) return;
  p.innerHTML=`<div class="srcp-h"><button type="button" class="srcbtn" id="fxClose" aria-expanded="true" aria-controls="fxPanel" style="border-color:transparent;background:none"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg>Fixer</button>
    <span class="note">Buy through a fixer by the book: Cost × Street Index, an Acquisition Test against the availability, then Negotiation (core p. 184–185).</span>
    <label class="fxon"><input type="checkbox" id="fxOn" ${FXS.on?'checked':''}> Use fixer prices</label></div>
    <div class="fxgrid">
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
  if(t.closest('#fxBtn')||t.closest('#fxClose')){FXS.open=!FXS.open; fxSave(); fxPanel(); if(FXS.open){const p=$('fxPanel'); if(p&&p.scrollIntoView) p.scrollIntoView({block:'nearest'});} return;}
  const s=t.closest('[data-fxs]'); if(s){const id=s.dataset.fxs, d=+s.dataset.d; const lim={dice:[1,20,1],neg:[-10,10,1],mark:[-50,200,5]}[id]; FXS[id]=Math.max(lim[0],Math.min(lim[1],(+FXS[id]||0)+d*lim[2])); fxAll(); const b=document.querySelector(`[data-fxs="${id}"][data-d="${d}"]`); if(b&&!b.disabled) b.focus(); return;}});
document.addEventListener('change',e=>{const t=e.target; if(!t) return;
  if(t.id==='fxOn'){FXS.on=t.checked; fxAll(); const x=$('fxOn'); if(x) x.focus(); return;}
  if(t.id==='fxEtiq'){FXS.etiq=t.checked; fxAll(); const x=$('fxEtiq'); if(x) x.focus(); return;}
  if(t.id==='fxRate'){FXS.rate=t.checked; fxAll(); const x=$('fxRate'); if(x) x.focus(); return;}
  if(t.id==='fxFee'){FXS.fee=Math.max(0,Math.round(+t.value||0)); fxAll(); const x=$('fxFee'); if(x) x.focus(); return;}});
