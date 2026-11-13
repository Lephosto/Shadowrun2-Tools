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
