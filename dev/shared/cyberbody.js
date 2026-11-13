// ---------- Cyber body: cyberlimbs, torso and skull (Cybertechnology p. 30–37, 49–52) ----------
// Shared by both tools. Each page defines CBENV: item(key) → {n,pg,cost,e,desc}.
// Plan: {limbs:{la,ra,ll,rl:{full,gyro,fore,hand,str,hstr,fstr,qui,plate,hard,cover,mag,acc:[ids]}}, bodyArms, bodyLegs, torso:{on,plate,hard}, skull:{on,plate,hard}, cap4}
// Character: {troll, body, str, quick} (natural, unaugmented; str includes muscle replacement for natural limbs).
const CB=(()=>{
const SIDES=[['la','Left arm','arm'],['ra','Right arm','arm'],['ll','Left leg','leg'],['rl','Right leg','leg']];
const PAIR={arm:['la','ra'],leg:['ll','rl']};
const r2=x=>Math.round(x*1000)/1000;
// accessories that fit in a limb: where (hand/arm/leg/foot), Essence when built into the limb (CT p. 49 compatibility), page note
const ACC={
 'body:Hand Razors':{at:'hand',e:0,why:'Spurs and razors cost no Essence in a cyberlimb (CT p. 49)'},
 'body:Retractable Hand Razors':{at:'hand',e:0,why:'Spurs and razors cost no Essence in a cyberlimb (CT p. 49)'},
 'body:Improved Hand Razor Blades':{at:'hand',e:0,needs:['body:Hand Razors','body:Retractable Hand Razors'],why:'Upgrade for hand razors'},
 'body:Spur':{at:'fore',e:0,why:'Spurs and razors cost no Essence in a cyberlimb (CT p. 49)'},
 'body:Retractable Spur':{at:'fore',e:0,why:'Spurs and razors cost no Essence in a cyberlimb (CT p. 49)'},
 'body:Cyberarm Hand Blade':{at:'hand',e:0,why:'Essence applies only in a natural hand (CT p. 36)'},
 'body:Cyberarm Hand Blade, retractable':{at:'hand',e:0,why:'Essence applies only in a natural hand (CT p. 36)'},
 'body:Shock Hand':{at:'hand'},'body:Cyberarm Taser':{at:'fore'},'body:CyberSquirt':{at:'fore'},
 'body:Fingertip Compartment':{at:'hand',e:0,why:'No Essence in a cyberlimb (CT p. 49)'},'body:Fingertip ExpertPicks':{at:'hand'},'body:Fingertip Needle':{at:'hand'},
 'body:Replacement Hand':{at:'fore',why:'Detachable hand: swap tool or weapon hands (Complex Action); built-in weapons +1 TN'},
 'body:Smartlink':{at:'hand',e:.25,why:'Smartgun links cost .25 Essence in a cyberlimb (CT p. 49)'},
 'body:Smartlink II':{at:'hand',e:.25,why:'Smartgun links cost .25 Essence in a cyberlimb (CT p. 49)'},
 'body:Cybergun: Hold-Out Pistol':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Cybergun: Light Pistol':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Cybergun: Machine Pistol':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Cybergun: SMG':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Cybergun: Heavy Pistol':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Cybergun: Shotgun':{at:'fore',gun:1,e:0,why:'Cyberguns in a cyberlimb cost no Essence (CT p. 51)'},
 'body:Direct Neural Interface':{at:'arm',why:'Cybernetic control of a device in the limb not built for it; the device costs 50% more (CT p. 33)'},
 'head:Tactical Computer':{at:'full',lvl:1,emul:.75,why:'In a cyberarm: Essence −25%, round down (CT p. 49)'},
 'head:Orientation System':{at:'full',e:.25,why:'Orientation system costs .25 Essence in a cyberlimb (CT p. 49)'},
 'body:Foot Anchor':{at:'foot',why:'Foot spur: (Str−1)M, or anchors you (+50 kg hold per foot) (CT p. 34)'},
};
const ACC_ARM=Object.keys(ACC).filter(k=>ACC[k].at!=='foot'), ACC_LEG=['body:Foot Anchor'];
function defLimb(){return {full:false,gyro:false,fore:false,hand:false,str:0,hstr:0,fstr:0,qui:0,plate:0,hard:false,cover:false,mag:false,acc:[]};}
function defPlan(){return {limbs:{la:defLimb(),ra:defLimb(),ll:defLimb(),rl:defLimb()},bodyArms:0,bodyLegs:0,torso:{on:false,plate:0,hard:false},skull:{on:false,plate:0,hard:false},cap4:true};}
const kind=s=>SIDES.find(x=>x[0]===s)[2];
const hasHand=L=>L.full||L.hand, hasFore=L=>L.full||L.fore;
const any=L=>L.full||L.fore||L.hand;
function word(s,L){const k=kind(s); if(L.full) return L.gyro?'gyromount cyberarm':k==='arm'?'cyberarm':'cyberleg'; const p=[]; if(L.fore) p.push(k==='arm'?'cyber forearm':'cyber lower leg'); if(L.hand) p.push(k==='arm'?'cyberhand':'cyberfoot'); return p.join(' + ')||'natural';}
function calc(P,C,E){
 P=P||defPlan(); C=C||{troll:false,body:3,str:3,quick:3}; const bad=[],warn=[],rows=[]; let cost=0,ess=0;
 const add=(where,n,c,e,pg,note)=>{rows.push({where,n,cost:Math.round(c),ess:r2(e),pg:pg||'',note:note||''}); cost+=c; ess+=e;};
 const torso=!!(P.torso&&P.torso.on); const base=C.troll?8:3;
 const limbStr={},limbQui={};
 SIDES.forEach(([s,label,k])=>{const L=Object.assign(defLimb(),P.limbs[s]||{});
   if(L.full&&(L.fore||L.hand)) bad.push(`${label}: a full ${k==='arm'?'cyberarm':'cyberleg'} already includes the ${k==='arm'?'forearm and hand':'lower leg and foot'}`);
   if(L.gyro&&(!L.full||k!=='arm')) bad.push(`${label}: the gyromount is a full cyberarm`);
   if(L.full){ if(L.gyro) add(label,'Gyromount cyberarm (recoil comp 3, up to LMGs)',260000,1.5,'CT p. 33'); else add(label,k==='arm'?'Cyberarm':'Cyberleg',100000,1,'CT p. 30'); }
   else { if(L.fore) add(label,k==='arm'?'Cyber forearm':'Cyber lower leg',70000,.65,'CT p. 30'); if(L.hand) add(label,k==='arm'?'Cyberhand':'Cyberfoot',45000,.35,'CT p. 30'); }
   const limbPrice=(L.full?(L.gyro?260000:100000):0)+(L.fore?70000:0)+(L.hand?45000:0);
   if(L.cover){ if(!any(L)) bad.push(`${label}: covering needs a cyberlimb`); else add(label,'Semi-natural covering (+3 TN to spot it)',limbPrice*.1,0,'CT p. 30'); }
   if(L.mag){ if(!any(L)) bad.push(`${label}: the magnetic system needs a cyberlimb`); else add(label,'Magnetic system (holds 25 kg of ferrous metal)',2800,0,'CT p. 32'); }
   // enhancements
   const types=[]; if(L.full&&+L.str) types.push('str'); if(L.full&&+L.qui) types.push('qui'); const pairBody=k==='arm'?+P.bodyArms||0:+P.bodyLegs||0; if(L.full&&pairBody) types.push('bod');
   const surcharge=t=>types.indexOf(t)>0?1.1:1;
   if(+L.str){ if(!L.full) bad.push(`${label}: Strength enhancement for a whole limb needs a full cyberlimb (use hand or forearm strength for partial limbs)`); else {
     const n=+L.str; let c=0,e=0; for(let i=1;i<=n;i++){ c+=i<=3?150000:175000; if(C.troll||i>3) e+=.4; }
     if(torso) e=Math.ceil(e/2*100)/100;
     add(label,`Strength enhancement +${n}${surcharge('str')>1?' (+10%, second enhancement)':''}`,c*surcharge('str'),e,'CT p. 31, 50–51',(C.troll?'Troll: every point costs .4 Essence (CT p. 51)':(n>3?'.4 Essence each point past 3':''))+(torso&&e?' · halved by the cybertorso':''));}}
   if(+L.qui){ if(!L.full) bad.push(`${label}: Quickness enhancement needs a full cyberlimb`); else {
     const n=+L.qui; let c=0,e=0; for(let i=1;i<=n;i++){ c+=i<=3?90000:110000; if(i>3) e+=.3; } if(torso) e=Math.ceil(e/2*100)/100;
     add(label,`Quickness enhancement +${n}${surcharge('qui')>1?' (+10%, additional enhancement)':''}`,c*surcharge('qui'),e,'CT p. 31, 51');}}
   if(L.full&&pairBody){ add(label,`Body enhancement +${pairBody}${surcharge('bod')>1?' (+10%, additional enhancement)':''}`,75000*pairBody*surcharge('bod'),0,'CT p. 31, 51'); }
   if(+L.hstr){ if(L.full||!L.hand) bad.push(`${label}: hand/foot strength is for a partial cyberhand or cyberfoot`); else if(+L.hstr>3) bad.push(`${label}: hand/foot strength tops out at +3`); else add(label,`${k==='arm'?'Hand':'Foot'} strength +${L.hstr} (grip only)`,65000*L.hstr,0,'CT p. 51'); }
   if(+L.fstr){ if(L.full||!L.fore) bad.push(`${label}: forearm/lower leg strength is for a partial limb`); else if(+L.fstr>3) bad.push(`${label}: forearm/lower leg strength tops out at +3`); else add(label,`${k==='arm'?'Forearm':'Lower leg'} strength +${L.fstr} (grip only)`,(+L.hstr?60000:120000)*L.fstr,0,'CT p. 51',+L.hstr?'60,000¥ a point: the hand is already enhanced':''); }
   if(+L.plate){ if(!L.full) bad.push(`${label}: body plating goes on a full cyberlimb`); else add(label,`${L.hard?'Hard':'Soft'} body plating ${L.plate}`,(L.hard?25000:10000)*L.plate,0,'CT p. 37'); }
   // accessories
   const seen=new Set(); let guns=0;
   (L.acc||[]).forEach(id=>{const a=ACC[id], it=E.item(id); if(!a||!it){bad.push(`${label}: unknown accessory`);return;} if(seen.has(id)) bad.push(`${label}: ${it.n} is listed twice`); seen.add(id);
     const okAt=a.at==='hand'?hasHand(L)&&k==='arm':a.at==='fore'?hasFore(L)&&k==='arm':a.at==='arm'?any(L)&&k==='arm':a.at==='full'?L.full&&k==='arm':a.at==='foot'?hasHand(L)&&k==='leg':false;
     if(!okAt) bad.push(`${label}: ${it.n} needs ${({hand:'a cyberhand',fore:'a cyber forearm or full cyberarm',arm:'a cyberarm part',full:'a full cyberarm',foot:'a cyberfoot'})[a.at]}`);
     if(a.needs&&!a.needs.some(x=>(L.acc||[]).includes(x))) bad.push(`${label}: ${it.n} needs hand razors in the same hand`);
     if(a.gun) guns++;
     const base=it.cost||0, be=+it.e||0; const e=a.emul!=null?Math.floor(be*a.emul*10)/10:(a.e!=null?a.e:be);
     add(label,it.n,base,e,it.pg,a.why||'');});
   if(guns>1) bad.push(`${label}: one cybergun per limb`);
   // strength / quickness of this limb
   limbStr[s]=L.full?base+(+L.str||0):C.str; limbQui[s]=L.full?C.quick+(+L.qui||0):C.quick;
 });
 // pairs
 const full=s=>!!(P.limbs[s]&&P.limbs[s].full);
 ['arm','leg'].forEach(k=>{const v=k==='arm'?+P.bodyArms||0:+P.bodyLegs||0, [a,b]=PAIR[k];
   if(v&&!(full(a)&&full(b))) bad.push(`Body enhancement needs a pair of full cyber${k}s (CT p. 51)`); if(v>3) bad.push(`Body enhancement tops out at +3 per pair (CT p. 51)`);
   if(full(a)&&full(b)){const qa=+(P.limbs[a].qui||0),qb=+(P.limbs[b].qui||0); if(qa!==qb) warn.push(`Cyber${k}s have Quickness +${qa} and +${qb}: +${Math.abs(qa-qb)} TN on all movement and coordination tests until they match (CT p. 51)`);}});
 // torso and skull
 [['torso','Cybertorso',120000,1.5],['skull','Cyberskull',75000,.75]].forEach(([k,n,c,e])=>{const T=P[k]||{}; if(T.on){add(n,n+' (+1 Body)',c,e,'CT p. 37'); if(+T.plate) add(n,`${T.hard?'Hard':'Soft'} body plating ${T.plate}`,(T.hard?25000:10000)*T.plate,0,'CT p. 37');} else if(+T.plate) bad.push(`${n}: plating needs the ${n.toLowerCase()}`);});
 // averages and limits (CT p. 50–51)
 const avg=o=>Math.floor(SIDES.reduce((a,[s])=>a+o[s],0)/4);
 const avgStr=avg(limbStr), avgQui=avg(limbQui);
 const strCap=Math.min(2*C.body,C.body+4), quiCap=Math.min(2*C.quick,C.quick+4);
 const anyFull=SIDES.some(([s])=>full(s));
 // the caps limit what enhancements add; a plain cyberlimb (Strength 3, or 8 for trolls) is never illegal on its own
 const plainStr=avg(Object.fromEntries(SIDES.map(([s])=>[s,full(s)?base:C.str]))), plainQui=C.quick;
 const strLim=Math.max(strCap,plainStr), quiLim=Math.max(quiCap,plainQui);
 if(anyFull&&avgStr>strLim) bad.push(`Average Strength ${avgStr} is over the limit of ${strLim} (twice Body or Body + 4, the lower; CT p. 51)`);
 if(anyFull&&avgQui>quiLim) bad.push(`Average Quickness ${avgQui} is over the limit of ${quiLim} (twice Quickness or Quickness + 4, the lower; CT p. 51)`);
 const highStr=Math.max(...SIDES.map(([s])=>limbStr[s]));
 if(anyFull&&highStr!==avgStr) warn.push(`Leading with the strongest limb (Strength ${highStr}) is +${highStr-avgStr} TN on melee tests; or fight at the average Strength ${avgStr} (CT p. 50)`);
 // body, power, armor, detection
 const pairs=(full('la')&&full('ra')?1:0)+(full('ll')&&full('rl')?1:0);
 const bodyBonus=pairs+(full('la')&&full('ra')?+P.bodyArms||0:0)+(full('ll')&&full('rl')?+P.bodyLegs||0:0)+(P.torso&&P.torso.on?1:0)+(P.skull&&P.skull.on?1:0);
 const hands=SIDES.filter(([s])=>P.limbs[s]&&hasHand(P.limbs[s])).length; const power=Math.min(2,hands);
 const cap=v=>P.cap4?Math.min(4,v):v, pl=s=>full(s)?+(P.limbs[s].plate||0):0;
 const loc=[Math.min(pl('la'),pl('ra')),Math.min(pl('ll'),pl('rl')),P.skull&&P.skull.on?+P.skull.plate||0:0,P.torso&&P.torso.on?+P.torso.plate||0:0,P.torso&&P.torso.on?+P.torso.plate||0:0].map(cap);
 const plateArmor=Math.floor(loc.reduce((a,b)=>a+b,0)/5);
 const hardAll=['la','ra','ll','rl'].filter(full).every(s=>!+P.limbs[s].plate||P.limbs[s].hard)&&(!(P.torso&&+P.torso.plate)||P.torso.hard)&&(!(P.skull&&+P.skull.plate)||P.skull.hard);
 const bodyEnhPts=(+P.bodyArms||0)+(+P.bodyLegs||0), covered=SIDES.some(([s])=>P.limbs[s]&&P.limbs[s].cover);
 return {rows,cost:Math.round(cost),ess:r2(ess),bad,warn,ok:!bad.length,limbStr,limbQui,avgStr,avgQui,strCap:strLim,quiCap:quiLim,highStr,bodyBonus,power,plateArmor,plateHard:plateArmor>0&&hardAll,loc,hands,
   detectTN:4+(covered?3:0)-bodyEnhPts,recoil:full('la')&&P.limbs.la.gyro||full('ra')&&P.limbs.ra.gyro?3:0,anyCyber:SIDES.some(([s])=>P.limbs[s]&&any(P.limbs[s]))||!!(P.torso&&P.torso.on)||!!(P.skull&&P.skull.on)};}
const clone=P=>JSON.parse(JSON.stringify(P));
// make any plan legal: whole numbers, ranges, then drop or lower whatever still breaks a rule
function clamp(P,C,E){P=Object.assign(defPlan(),clone(P||{})); const dropped=[];
 SIDES.forEach(([s,,k])=>{const L=P.limbs[s]=Object.assign(defLimb(),P.limbs[s]||{});
  ['full','gyro','fore','hand','hard','cover','mag'].forEach(f=>L[f]=!!L[f]); if(L.full){L.fore=false;L.hand=false;} if(k!=='arm'||!L.full) L.gyro=false;
  const I=(f,hi)=>{L[f]=Math.max(0,Math.min(hi,Math.floor(+L[f]||0)));}; I('str',12); I('qui',12); I('hstr',3); I('fstr',3); I('plate',6);
  if(!L.full){L.str=0;L.qui=0;L.plate=0;} if(L.full||!L.hand) L.hstr=0; if(L.full||!L.fore) L.fstr=0; if(!(L.full||L.fore||L.hand)){L.cover=false;L.mag=false;}
  L.acc=[...new Set((Array.isArray(L.acc)?L.acc:[]).filter(id=>ACC[id]&&E.item(id)))]; let g1=false; L.acc=L.acc.filter(id=>{if(!ACC[id].gun) return true; if(g1) return false; g1=true; return true;});});
 P.bodyArms=Math.max(0,Math.min(3,Math.floor(+P.bodyArms||0))); P.bodyLegs=Math.max(0,Math.min(3,Math.floor(+P.bodyLegs||0)));
 if(!(P.limbs.la.full&&P.limbs.ra.full)) P.bodyArms=0; if(!(P.limbs.ll.full&&P.limbs.rl.full)) P.bodyLegs=0;
 ['torso','skull'].forEach(k=>{const T=P[k]=Object.assign({on:false,plate:0,hard:false},P[k]||{}); T.on=!!T.on; T.hard=!!T.hard; T.plate=T.on?Math.max(0,Math.min(6,Math.floor(+T.plate||0))):0;});
 P.cap4=P.cap4!==false;
 // accessories that don't fit come off
 for(let g=0;g<60;g++){const r=calc(P,C,E); if(r.ok) break; let fixed=false;
  for(const [s,label] of SIDES){const L=P.limbs[s]; for(let i=L.acc.length-1;i>=0;i--){const t={...clone(P)}; t.limbs[s].acc.splice(i,1); const b1=calc(P,C,E).bad.filter(x=>x.startsWith(label+':')).length, b2=calc(t,C,E).bad.filter(x=>x.startsWith(label+':')).length; if(b2<b1){dropped.push(E.item(L.acc[i]).n); L.acc.splice(i,1); fixed=true; break;}} if(fixed) break;}
  if(fixed) continue;
  // over the average caps: lower the highest enhancement one point at a time
  if(r.avgStr>r.strCap){const s=SIDES.map(x=>x[0]).filter(x=>P.limbs[x].str>0).sort((a,b)=>P.limbs[b].str-P.limbs[a].str)[0]; if(s){P.limbs[s].str--; continue;}}
  if(r.avgQui>r.quiCap){const s=SIDES.map(x=>x[0]).filter(x=>P.limbs[x].qui>0).sort((a,b)=>P.limbs[b].qui-P.limbs[a].qui)[0]; if(s){P.limbs[s].qui--; continue;}}
  break;}
 return {P,dropped};}
// legal values for a numeric field (keeps everything else as is)
function options(P,C,E,path,lo,hi){const out=[]; for(let v=lo;v<=hi;v++){const t=clone(P); let o=t; for(let i=0;i<path.length-1;i++) o=o[path[i]]; o[path[path.length-1]]=v; if(calc(t,C,E).ok) out.push(v);} return out;}
function accFor(P,C,E,s){const k=kind(s), L=P.limbs[s], pool=k==='arm'?ACC_ARM:ACC_LEG, yes=[], no=[];
 pool.forEach(id=>{const it=E.item(id); if(!it||L.acc.includes(id)) return; const t=clone(P); t.limbs[s].acc.push(id); const r=calc(t,C,E); if(r.ok) yes.push({id,it,row:r.rows.filter(x=>x.n===it.n).pop()}); else no.push({id,it,why:r.bad[r.bad.length-1].replace(/^[^:]+: /,'')});}); return {yes,no};}
return {SIDES,ACC,defPlan,defLimb,calc,clamp,options,accFor,word,hasHand,hasFore,any};
})();
