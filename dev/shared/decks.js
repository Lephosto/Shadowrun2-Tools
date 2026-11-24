// ---------- Cyberdeck rules shared by both tools (core p. 172–176; VR2 p. 16, 85–89) ----------
const VR2PF=r=>r<=3?100:r<=6?200:r<=9?500:1000; // Program Factors Table, VR2 p. 89
const DECK={MPCP_MAX:20,HARD_MAX:20,
  riMax:M=>Math.min(3,Math.floor(M/4)), amMax:M=>M*50, hitchMax:M=>M, personaTotal:M=>3*M, ioMax:(sens,M)=>sens*M*10};
function vr2Default(){return {mpcp:6,bod:4,eva:4,mask:4,sens:4,hard:0,am:100,sm:500,io:60,ri:1,asist:'hot',iccm:false,sat:false,casing:0,hitch:0,vid:false,off:0,pkg:true,filter:false,dni:false,printedCool:false};}
// Lower the highest persona rating one point at a time until the total fits (keeps the persona balanced).
function trimPersona(o,keys,max){keys.forEach(k=>o[k]=+o[k]||0); let tot=keys.reduce((a,k)=>a+o[k],0); while(tot>max){const k=keys.reduce((a,b)=>o[b]>o[a]?b:a); o[k]--; tot--;}}
// Make a VR2 deck design legal for its MPCP: whole numbers, chips ≤ MPCP and ≤ 3 × MPCP in total, Response Increase ≤ MPCP ÷ 4 (max 3),
// I/O in tens up to Sensor × MPCP × 10, hitcher jacks ≤ MPCP, pure DNI only on a hot ASIST.
function vr2Clamp(d){
 const I=(k,lo,hi)=>{d[k]=Math.min(hi,Math.max(lo,Math.floor(+d[k]||0)));};
 I('mpcp',1,DECK.MPCP_MAX); const M=d.mpcp, P=['bod','eva','mask','sens'];
 P.forEach(k=>I(k,0,M)); trimPersona(d,P,DECK.personaTotal(M));
 I('hard',0,DECK.HARD_MAX); I('ri',0,DECK.riMax(M)); I('am',0,1e7); I('sm',0,1e7); I('off',0,1e7);
 I('io',0,DECK.ioMax(d.sens,M)); d.io-=d.io%10; I('hitch',0,DECK.hitchMax(M)); I('casing',0,3);
 if(!['hot','cool','none'].includes(d.asist)) d.asist='hot';
 ['iccm','sat','vid','pkg','filter','dni','printedCool'].forEach(k=>d[k]=!!d[k]); if(d.asist!=='hot') d.dni=false;
 return d;}
// Price a VR2 deck from the Deck Component Prices Table (VR2 p. 89).
function vr2Price(d){
 const M=Math.max(1,+d.mpcp||1),pf=VR2PF(M),L=[];
 const add=(k,v,how,kind)=>L.push({k,v:Math.round(v),how,kind:kind||'formula'});
 add('MPCP '+M,M*M*(8*pf+195),`${M}² × (8 × ${pf} + 195)`);
 [['Bod','bod',3,95],['Evasion','eva',3,95],['Masking','mask',2,75],['Sensor','sens',2,75]].forEach(([n,k,a,b])=>{const r=+d[k]||0; if(r>0) add(n+' '+r,r*r*(a*VR2PF(r)+b),`${r}² × (${a} × ${VR2PF(r)} + ${b})`);});
 if(+d.am) add(`Active memory ${d.am} Mp`,d.am*7.5,`${d.am} Mp × 7.5`);
 if(+d.sm) add(`Storage memory ${d.sm} Mp`,d.sm*6,`${d.sm} Mp × 6`);
 if(d.asist==='hot') add('ASIST interface (hot)',M*M*(pf*2+40)+M*50,`${M}² × (${pf} × 2 + 40) + ${M} × 50`);
 else if(d.asist==='cool') add('ASIST interface (cool)',d.printedCool?M*M*(pf*20)+M*25:M*M*(pf+20)+M*25,d.printedCool?`${M}² × (${pf} × 20) + ${M} × 25 (as printed)`:`${M}² × (${pf} + 20) + ${M} × 25`);
 if(+d.hard){const hp=VR2PF(+d.hard); add('Hardening '+d.hard,d.hard*d.hard*(hp*8+160)+d.hard*70,`${d.hard}² × (${hp} × 8 + 160) + ${d.hard} × 70 (PF from Hardening, VR2 p. 158)`);}
 if(d.iccm) add('ICCM biofeedback filter',M*M*(pf*4+115)+5000,`${M}² × (${pf} × 4 + 115) + 5,000`);
 if(+d.io) add(`I/O speed ${d.io} MePS`,d.io*30,`${d.io} MePS × 30`);
 if(+d.ri) add('Response Increase '+d.ri,(M*M*d.ri)*(pf+80)+d.ri*105,`(${M}² × ${d.ri}) × (${pf} + 80) + ${d.ri} × 105`);
 if(d.sat) add('Satlink interface',M*M*(pf*2+40)+M*35,`${M}² × (${pf} × 2 + 40) + ${M} × 35`);
 const sub=L.reduce((a,x)=>a+x.v,0);
 const complete=d.asist!=='none'&&+d.bod>0&&+d.eva>0&&+d.mask>0&&+d.sens>0;
 const disc=d.pkg&&complete?Math.round(sub*0.10):0;
 const extras=[];
 if(+d.casing) extras.push({k:`Casing, Level ${d.casing}`,v:[0,500,2000,5000][d.casing],how:['','Impact 2, Ballistic 1','Impact 3, Ballistic 2','Impact 4, Ballistic 3'][d.casing],kind:'part'});
 if(+d.hitch) extras.push({k:`Hitcher jacks × ${d.hitch}`,v:250*d.hitch,how:'250¥ each',kind:'part'});
 if(+d.off) extras.push({k:`Off-line storage (${d.off} Mp)`,v:Math.round(50+0.5*d.off),how:'50¥ + .5¥ per Mp',kind:'part'});
 if(d.vid) extras.push({k:'Vidscreen',v:100,how:'',kind:'part'});
 const ext=extras.reduce((a,x)=>a+x.v,0);
 return {lines:L,extras,sub,disc,complete,total:sub-disc+ext,d,M,pf};
}
// ---------- Program checklist shared by both tools (same look as the other build-outs) ----------
// Groups follow the books: core p. 174–176 headings; VR2 Utilities Table types, p. 161.
const PROG_GROUPS={
  core:[['Combat utilities',['Attack','Slow']],['Defense utilities',['Medic','Mirrors','Shield','Smoke']],['Sensor utilities',['Analyze','Browse','Decrypt','Evaluate']],['Masking utilities',['Deception','Relocate','Sleaze']],['In the price table only',['Armor','Restore','Sift']]],
  vr2:[['Operational',['Analyze','Browse','Commlink','Crash','Defuse','Deception','Decrypt','Disinfect','Evaluate','Mirrors','Read/Write','Relocate','Scanner','Spoof','Validate']],['Offensive',['Attack-L','Attack-M','Attack-S','Attack-D','Black Hammer','Hog','Killjoy','Poison','Restrict','Reveal','Slow','Steamroller']],['Defensive',['Armor','Camo','Cloak','Lock-on','Medic','Restore','Shield']],['Special',['Compressor','Sleaze','Track']]]};
const PROGUI=(()=>{
const X=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const OPEN={};
// rows: [{id,n,pg,desc,tag,on,r,ropts:[[r,label]],loaded,canLoad,loadTxt,price,from,why,more}], groups: [[title,[names]]], extra rows group first
function group(title,rows,K,intro,first,plain){const nOn=rows.filter(r=>r.on).length, nYes=rows.filter(r=>!r.on&&!r.why).length;
  const open=title in OPEN?OPEN[title]:(nOn>0||!!first);
  const items=rows.map(r=>{let c='';
    if(r.on){ if(r.ropts&&r.ropts.length) c+=`<label class="vck-s">${X(r.rlab||'Rating')} <select data-pgr="${K}" data-pgid="${X(r.id)}" aria-label="${X(r.n)} ${X(r.rlab||'rating')}">${r.ropts.map(([v,l])=>`<option value="${v}"${v===r.r?' selected':''}>${X(l)}</option>`).join('')}</select></label>`;
      c+=`<span class="vck-n">${X(r.price)}</span>`;
      if(r.canLoad!=null) c+=`<label class="vck-t"><input type="checkbox" data-pgld="${K}" data-pgid="${X(r.id)}"${r.loaded?' checked':''}${r.canLoad||r.loaded?'':' disabled'}> ${r.canLoad||r.loaded?'Loaded':'Won’t fit in active memory'}</label>${r.loaded&&r.loadTxt?`<span class="vck-w">loads: ${X(r.loadTxt)}</span>`:''}`;
      if(r.more) c+=`<span class="vck-w">${X(r.more)}</span>`;
    } else if(!r.why) c=`<span class="vck-n">${X(r.from)}</span>`;
    else c=`<span class="vck-w">${X(r.why)}</span>`;
    return `<li class="vck ${r.on?'on':r.why?'no':'off'}"><div class="vck-h"><label><input type="checkbox" data-pgck="${K}" data-pgid="${X(r.id)}"${r.on?' checked':''}${!r.on&&r.why?' disabled':''}> <b>${X(r.n)}</b>${r.tag||''}</label><span class="vck-p">${X(r.pg||'')}</span></div><div class="vck-c">${c}</div>${r.desc?`<details class="vck-d"><summary>What it does</summary><p>${X(r.desc)}</p></details>`:''}</li>`;}).join('');
  return `<details class="vgrp" data-pggrp="${X(title)}"${open?' open':''}><summary><b>${X(title)}</b><span class="vgrp-n">${plain?`${nOn} on the deck`:`${nOn?nOn+' on the deck · ':''}${nYes} more fit${rows.length-nOn-nYes?` · ${rows.length-nOn-nYes} don’t`:''}`}</span></summary>${intro?`<p class="vck-fac">${X(intro)}</p>`:''}<ul class="vcl">${items}</ul></details>`;}
function render(sets,K,o){ // sets: [{title,rows,intro,plain}]; o.nobar leaves out Open all / Close all
  return `<div class="vcheck">${o&&o.nobar?'':`<div class="vck-bar"><button type="button" class="vck-b" data-pgall="1">Open all</button><button type="button" class="vck-b" data-pgall="0">Close all</button></div>`}${(L=>L.map((s,i)=>group(s.title,s.rows,K,s.intro,i===0&&!L.some(x=>x.rows.some(r=>r.on)),s.plain)).join(''))(sets.filter(s=>s.rows.length))}</div>`;}
// split programs into the book's groups; anything unlisted goes last
function split(list,vr2,nameOf){const G=PROG_GROUPS[vr2?'vr2':'core'], seen=new Set(), out=G.map(([t,names])=>({title:t,rows:names.map(n=>{const x=list.find(p=>nameOf(p)===n); if(x) seen.add(x); return x;}).filter(Boolean)}));
  const rest=list.filter(p=>!seen.has(p)); if(rest.length) out.push({title:'Other programs',rows:rest}); return out;}
const keyOf=el=>{const ds=el&&el.dataset||{}; for(const a of ['pgck','pgr','pgld']) if(ds[a]!==undefined) return {a,k:ds[a],id:ds.pgid}; return null;};
function refocus(info){ if(!info||typeof document==='undefined') return; const el=document.querySelector(`[data-${info.a}="${CSS.escape(info.k)}"][data-pgid="${CSS.escape(info.id)}"]`); if(el) el.focus({preventScroll:true});}
if(typeof document!=='undefined'){
  document.addEventListener('toggle',e=>{const d=e.target; if(d&&d.dataset&&d.dataset.pggrp) OPEN[d.dataset.pggrp]=d.open;},true);
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pgall]'); if(!b) return; const on=b.dataset.pgall==='1', root=b.closest('.vcheck'); if(root) root.querySelectorAll('details.vgrp').forEach(x=>{x.open=on; if(x.dataset.pggrp) OPEN[x.dataset.pggrp]=on;});});
}
return {render,split,keyOf,refocus,OPEN};})();
