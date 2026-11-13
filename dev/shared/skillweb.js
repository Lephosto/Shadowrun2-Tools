// ---------- The Skill Web (core p. 68–69) ----------
// Read from the printed chart. Every "d:" node is one circle (+2 TN when passed). "j:" nodes are plain line joins (no circle).
// Lines are two-way except arrows ('>' = one-way, in the arrow's direction). Attributes and skills are end points.
const SKILLWEB=(()=>{
const DOT=new Map(); // dot id -> plain-English place, for showing paths
const E=[]; // [a,b,oneway]
const L=(a,b)=>E.push([a,b,false]), A=(a,b)=>E.push([a,b,true]);
const d=(id,where)=>{DOT.set('d:'+id,where); return 'd:'+id;};
// QUICKNESS and the combat block
const dA=d('ath','circle on the Athletics line'), dS1=d('st1','first circle on the Stealth line'), dS2=d('st2','second circle on the Stealth line');
L('QUICKNESS','j:q1'); L('j:q1','j:as'); L('j:as',dA); L(dA,'Athletics'); L('j:as',dS1); L(dS1,dS2); L(dS2,'Stealth');
const dF0=d('f0','circle where Quickness branches to the ranged-weapon skills'), dF1=d('f1','circle on the Firearms line (Gunnery branches here)'), dP1=d('p1','circle on the Projectile line (Throwing branches here)');
L('j:q1','j:q2'); L('j:q2',dF0); L(dF0,dF1); L(dF1,'Firearms'); L(dF1,'Gunnery'); L(dF0,dP1); L(dP1,'Projectile Weapons'); L(dP1,'Throwing Weapons');
const dAC=d('ac','circle on the Armed Combat line'), dUC=d('uc','circle on the Unarmed Combat line');
L(dAC,'j:au'); L('j:au',dUC); L(dAC,'Armed Combat'); L(dUC,'Unarmed Combat');
L('j:q2','j:q3'); A('j:q3','j:au'); // Quickness arrow into the Armed/Unarmed line
const dStr=d('str','circle on the Strength line'); L('STRENGTH',dStr); A(dStr,'j:au');
const dB1=d('b1','first circle on the Body line'), dB2=d('b2','second circle on the Body line'); L('BODY',dB1); L(dB1,dB2); A(dB2,'j:au');
[['Firearms'],['Gunnery'],['Projectile Weapons'],['Throwing Weapons'],['Armed Combat']].forEach(([s])=>{const x=d('br-'+s,`circle between ${s} and its B/R`); L(s,x); L(x,s+' (B/R)');});
// INTELLIGENCE
const dIt=d('it','circle where the Intelligence line turns down'); L('INTELLIGENCE',dIt); L(dIt,'j:i1');
const dD1=d('dm1','first circle on the Demolitions line'), dD2=d('dm2','second circle on the Demolitions line'); L('j:i1',dD1); L(dD1,dD2); A(dD2,'Demolitions');
L('j:i1','j:i2'); A('j:i2','j:br'); // arrow into the science bracket
const dX1=d('x1','upper bracket circle (between Physical Sciences and Computer Theory)'), dX2=d('x2','lower bracket circle (between Cybertechnology and Biology)');
L('j:br',dX1); L('j:br',dX2);
const dPSr=d('psr','circle at the right end of Physical Sciences'), dCTr=d('ctr','circle at the right end of Computer Theory'), dCYr=d('cyr','circle at the right end of Cybertechnology'), dBIr=d('bir','circle at the right end of Biology');
L(dPSr,dX1); L(dX1,dCTr); L(dCTr,dCYr); L(dCYr,dX2); L(dX2,dBIr);
L(dPSr,'Physical Sciences'); L(dCTr,'Computer Theory'); L(dCYr,'Cybertechnology'); L(dBIr,'Biology');
const dPSb=d('psb','circle at the left end of Physical Sciences'), dPSa=d('psa','circle above it, where the long line to the Computer group starts');
L('Physical Sciences',dPSb); L(dPSb,dPSa); L(dPSa,'j:top'); L('j:top','j:vl');
const dCP=d('cp','circle on the Computer line (Electronics branches here)'), dBTl=d('btl','circle at the left end of the Biotech line'), dBT2=d('bt2','second circle on the Biotech line');
L('j:vl',dCP); L(dCP,'Computer'); L(dCP,'Electronics'); L('j:vl',dBTl); L(dBTl,dBT2); L(dBT2,'Biotech');
const dCTl=d('ctl','circle at the left end of Computer Theory'); L('Computer','j:cp'); L('j:cp',dCTl); L(dCTl,'Computer Theory');
const dCPbr=d('br-Computer','circle between Computer and its B/R'); L('j:cp',dCPbr); L(dCPbr,'Computer (B/R)');
const dELbr=d('br-Electronics','circle between Electronics and its B/R'); L('Electronics',dELbr); L(dELbr,'Electronics (B/R)');
const dBTbr=d('br-Biotech','circle between Biotech and its B/R'), dCB=d('cb','circle left of Cybertechnology/Biology'), dBIl=d('bil','circle at the left end of Biology');
L('Biotech','j:bt'); L('j:bt',dBTbr); L(dBTbr,'Biotech (B/R)'); L('j:bt',dCB); L(dCB,'j:cb'); L('j:cb','Cybertechnology'); L('j:cb',dBIl); L(dBIl,'Biology');
// Intelligence and Willpower into the magic/behavior line
const dI2=d('i2','circle at the bottom of the Intelligence line'), dIx=d('ix','circle before the Intelligence arrow'); L('j:i2',dI2); L(dI2,dIx); A(dIx,'j:m');
const dW1=d('w1','circle on the Willpower line'); L('WILLPOWER',dW1); A(dW1,'j:m');
const dPr=d('pr','circle at the top of that line, right of Psychology'), dMb=d('mb','circle at the bottom of that line, right of Magical Theory');
L(dPr,'j:m'); L('j:m',dMb);
const dMT2=d('mt2','circle on the right of Magical Theory'), dMT1=d('mt1','circle at the left end of Magical Theory'), dCJ=d('cj','circle on the Conjuring line'), dSO=d('so','circle at the Sorcery corner');
L(dMb,dMT2); L(dMT2,'Magical Theory'); L('Magical Theory',dMT1); L(dMT1,'j:mag'); L('j:mag',dCJ); L(dCJ,'Conjuring'); L('j:mag',dSO); L(dSO,'Sorcery');
const dMil=d('mil','circle on the right end of Military Theory'), dMilL=d('mill','circle next to Military Theory'), dPsy=d('psy','circle at the right end of Psychology'), dSoc=d('soc','circle at the right end of Sociology');
L(dPr,dPsy); L(dMil,dPsy); L(dPsy,dSoc); L(dMil,dMilL); L(dMilL,'Military Theory'); L(dPsy,'Psychology'); L(dSoc,'Sociology');
const dPl=d('pl','circle left of Psychology (its arrow points up to the Charisma line)'), dSl=d('sl','circle at the left end of Sociology');
L('Psychology','j:pl'); L('j:pl',dPl); L(dPl,'j:sl'); L('j:sl',dSl); L(dSl,'Sociology'); A(dPl,'j:hc');
// CHARISMA
const dC0=d('c0','circle at the top of the Charisma line'), dL=d('ld','circle on the Leadership line'), dIN=d('in','circle where Interrogation and Negotiation split');
A('CHARISMA','j:hc'); L('j:hc',dC0); L(dC0,dL); L(dL,'Leadership'); L(dL,'j:cb2'); L('j:cb2',dIN); L(dIN,'Interrogation'); L(dIN,'Negotiation'); L('j:cb2','Etiquette');
// REACTION and vehicles
const dGB=d('gb','circle where the ground-vehicle group joins'), dGV=d('gv','circle on Ground Vehicles (B/R)'), dBK=d('bk','circle on the Bike line (Hovercraft and Car branch here)');
L('REACTION','j:r1'); L('j:r1',dGB); L(dGB,dGV); L(dGV,'Ground Vehicles (B/R)'); L(dGB,dBK); L(dBK,'Bike'); L(dBK,'Hovercraft'); L(dBK,'Car');
const dBS=d('bs','circle where the boat group joins'), dBO=d('bo','circle on Boats (B/R)'), dSB=d('sb','circle on the Sailboat line (Motorboat branches here)');
L('j:r1','j:r2'); L('j:r2',dBS); L(dBS,dBO); L(dBO,'Boats (B/R)'); L(dBS,dSB); L(dSB,'Sailboat'); L(dSB,'Motorboat');
const dRT=d('rt','circle low on the Reaction line'), dAR=d('ar','circle where the aircraft group joins'), dAV=d('av','circle on Aircraft (B/R)'), dRO=d('ro','circle on the Rotor line (Winged and Vector Thrust branch here)');
L('j:r2',dRT); L(dRT,'j:r3'); L('j:r3',dAR); L(dAR,dAV); L(dAV,'Aircraft (B/R)'); L(dAR,dRO); L(dRO,'Rotor'); L(dRO,'Winged'); L(dRO,'Vector Thrust');

const ATTRS=['QUICKNESS','STRENGTH','BODY','INTELLIGENCE','CHARISMA','WILLPOWER','REACTION'];
const isEnd=n=>!/^[dj]:/.test(n);
const adj=new Map(); const add=(a,b)=>{if(!adj.has(a)) adj.set(a,[]); adj.get(a).push(b);};
E.forEach(([a,b,one])=>{add(a,b); if(!one) add(b,a);});
const SKILLS=[...new Set(E.flat().filter(n=>typeof n==='string'&&isEnd(n)&&!ATTRS.includes(n)))];
// fewest circles from one end point to another; paths may run through plain joins and circles, through skill lines too, never through an attribute
function route(from,to){ const best=new Map([[from,0]]), prev=new Map(); const q=[[0,from]];
  while(q.length){ q.sort((x,y)=>x[0]-y[0]); const [c,n]=q.shift(); if(n===to) break; if(c>best.get(n)) continue; if(n!==from&&ATTRS.includes(n)) continue;
    for(const m of adj.get(n)||[]){ const nc=c+(DOT.has(m)?1:0); if(!best.has(m)||nc<best.get(m)){best.set(m,nc); prev.set(m,n); q.push([nc,m]);}}}
  if(!best.has(to)) return null; const path=[to]; while(path[0]!==from) path.unshift(prev.get(path[0]));
  return {circles:best.get(to),tn:2*best.get(to),path,dots:path.filter(p=>DOT.has(p)).map(p=>DOT.get(p))};}
return {SKILLS,ATTRS,DOT,EDGES:E,route};
})();
