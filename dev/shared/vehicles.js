// ---------- Vehicle build-out: Rigger 2 vehicle customization (R2 p. 118–146) ----------
// Shared by the Gear Locker and the Runner Builder. Every limit is checked by calc(); the UI only offers changes that keep calc() clean.
const VB=(()=>{
const num=x=>{const n=parseFloat(String(x==null?'':x).replace(/[^0-9.\-]/g,''));return isFinite(n)?n:0;};
const dash=x=>x==null||/^\s*[—–\-_]?\s*$/.test(String(x));
const TYPES=[['car','Car, truck or wheeled drone'],['bike','Motorcycle'],['tracked','Tracked or other ground drone'],['walker','Walker drone'],['hover','Hovercraft'],['boat','Boat'],['plane','Fixed-wing aircraft'],['rotor','Helicopter, VTOL or LAV'],['lta','Blimp or airship']];
const GROUND=new Set(['car','bike','tracked','walker']), AIR=new Set(['plane','rotor','lta']), WHEELED=new Set(['car','bike']);
const fmtN=n=>Math.round(n).toLocaleString('en-US');
function veh(n,cost,pg,r,type,drone){
  const h=String(r.H==null?'':r.H).split('/'); const sp=String(r.Sp==null?'':r.Sp).split('/').map(num);
  return {n,cost:+cost||0,pg:pg||'',type:type||'car',drone:!!drone,H:num(h[0]),Hoff:h.length>1?num(h[1]):null,Sp:sp,Ac:num(r.Ac),B:num(r.B),A:num(r.A),Si:num(r.Si),Au:dash(r.Au)?0:num(r.Au),P:dash(r.P)?0:num(r.P),Se:dash(r.Se)?0:num(r.Se),C:num(r.C),L:num(r.L)};
}
// Electronics tables (customization cost, CF as a customization, weight kg), R2 p. 137–140. Index = level.
const T_ECM=[null,[25000,1,12],[75000,2,25],[125000,3,35],[250000,6,50],[375000,3,35],[750000,8,75],[1500000,9,110],[7500000,12,150],[15000000,16,200],[30000000,20,250]];
// ECCM levels 1 and 3 are printed 110,000¥ and 350,000¥ (R2 p. 138); every other ECM/ECCM level 1–4 costs 100¥ per Design Point, so these read as misprints of 10,000¥ and 50,000¥.
const T_ECCM=[null,[10000,1,12],[30000,2,25],[50000,3,35],[100000,6,50],[150000,3,35],[250000,8,75],[750000,9,110],[2500000,12,150],[6000000,16,200],[12000000,20,250]];
const T_ED=[null,[50000,3,35],[150000,5,45],[400000,7,60],[1000000,5,45],[4000000,7,60],[8000000,9,110]];
const T_ECD=[null,[25000,3,35],[80000,5,45],[200000,7,60],[750000,4,45],[2000000,6,60],[5000000,8,110]];
const T_SEN=[null,[5000,1,12],[15000,2,25],[25000,3,35],[50000,6,50],[75000,3,35],[125000,8,75],[375000,9,110],[1250000,12,150],[3000000,16,200],[6000000,20,250]];
const CRANE=[0,25,200,750,2000,5000,20000,30000,45000,60000], WINCH=[5,25,200,750,2000,5000,20000,30000,45000,60000];
const capMax=(tab,B)=>B>=10?B*B*750:tab[Math.max(0,Math.min(9,B))];
const CAPS=[5,25,50,100,200,500,750,1000,2000,5000,10000,20000,30000,45000,60000,75000,100000];
const BAFFLE={car:5000,tracked:5000,walker:5000,bike:6000,plane:7500,rotor:10000,hover:3750,boat:2500,lta:2500};
const bracket=(lv,a,b,c,d)=>lv<=3?a:lv<=6?b:lv<=9?c:d;
// mount points: hardpoint = 2 Body points, firmpoint = 1 (R2 p. 131)
const MOUNTPTS={fx_eh:2,fx_ef:1,fx_ih:2,fx_if:1,pintle:1,ring:2,tur_mini:2,tur_small:4,tur_med:6,rt_micro:1,rt_mini:2,rt_small:4,rt_med:6};
const FIXED=['fx_eh','fx_ef','fx_ih','fx_if'], TURRETS=['tur_mini','tur_small','tur_med','rt_micro','rt_mini','rt_small','rt_med'];
const MIL='Security or military gear: needs the “security or military vehicle” switch (GM permission).';
// kind: flag (one), level (lv in min..max), qty (count). opt: extra choice list.
const M=[
 // ENGINE
 {id:'gridlink',g:'Engine',n:'GridLink power',pg:'R2 p. 121',kind:'flag',cost:()=>600,cf:()=>1,ok:(v,c)=>!WHEELED.has(c.type)||v.drone?'Ground vehicles only, not drones':null,
  d:'Induction runners pick up power from coils under city streets, so an electric vehicle runs free in good neighborhoods (Security B or better) below the speed limit. Monthly charge: Body × 100¥ (bikes × 25, trucks × 250).'},
 {id:'nitro',g:'Engine',n:'Nitrous oxide injectors',pg:'R2 p. 121',kind:'level',min:1,max:()=>5,cost:(v,l)=>l*(l<=3?3500:7000),cf:()=>2,load:()=>15,
  d:'Adds dice equal to its level to Accelerating/Braking tests, or a burst to 2.5 × Speed. Holds up to 20 charges. Gasoline and diesel engines only. Cost read as level × the per-level price for that bracket.'},
 {id:'suncell',g:'Engine',n:'SunCell power',pg:'R2 p. 121',kind:'flag',cost:()=>500,cf:()=>1,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,
  d:'Solar panels charge an electric vehicle at Body × 25 PF per sunny hour (half in cloud, none at night).'},
 {id:'turbo',g:'Engine',n:'Turbocharging / superconductive drive',pg:'R2 p. 122',kind:'level',min:1,max:v=>Math.max(1,Math.floor((Math.max(...v.Sp)*0.5)/15)),cost:(v,l)=>v.cost*1.1*l,
  ok:(v,c)=>AIR.has(c.type)?'Aircraft engines are already turbocharged':null,fx:(s,l)=>{s.Sp=s.Sp.map(x=>x+15*l);s.Ac+=10*l;s.Si-=l;},
  d:'Each level: +15 Speed, +10 Acceleration (as printed), −1 Signature, Economy × .95. Speed can go up to 1.5 × the original. Parts cost read as vehicle cost × 1.1 per level.'},
 // CONTROL
 {id:'adjctl',g:'Control',n:'Adjusted controls',pg:'R2 p. 122',kind:'flag',opt:[['dwarf','Dwarf',2500],['troll','Troll',3500],['other','Other (disability)',3000]],cost:(v,l,o)=>({dwarf:2500,troll:3500,other:3000})[o||'dwarf'],
  ok:v=>v.drone?'Drones have no manual controls':null,d:'Controls sized for dwarfs or trolls. Without them a dwarf or troll driver takes +3 on driving tests; humans, elves and orks take +3 in an adjusted vehicle. Doesn’t matter when rigged in by datajack.'},
 {id:'autonav',g:'Control',n:'Autonav',pg:'R2 p. 122–123',kind:'level',min:v=>v.Au+1,max:()=>4,cost:(v,l)=>[0,500,1000,5000,15000][l],fx:(s,l)=>{s.Au=l;},
  ok:(v,c,l)=>v.drone?'Drones use their Pilot rating instead':(c.type==='bike'&&l>1&&!c.rigged?'Motorcycles take autonav above 1 only with rigger gear':null),
  d:'Extra dice on Driving Tests (but added to target numbers in combat). Rating 2+ can drive itself with Vehicle skill equal to its rating: 2 handles city roads, 3 rough terrain on a set route with GPS, 4 plans its own routes.'},
 {id:'cmc',g:'Control',n:'Contingency maneuver controls',pg:'R2 p. 124',kind:'level',min:1,max:()=>9,cost:(v,l)=>l*bracket(l,2500,5000,10000),cf:()=>2,load:()=>30,
  d:'Redundant wiring and backups: the vehicle ignores damage modifiers for that many boxes of damage. Doesn’t stop the vehicle being destroyed, and doesn’t help a rigger’s own wounds.'},
 {id:'datajack',g:'Control',n:'Datajack port',pg:'R2 p. 124',kind:'flag',cost:v=>v.type==='bike'?5000:2500,cf:()=>1,load:()=>15,ok:v=>v.drone?'Drones are run remotely':null,
  d:'Lets anyone with a datajack drive by rudimentary cybernetic command (+1 Reaction). A vehicle control rig needs full rigger adaptation for its bonuses.'},
 {id:'dbw',g:'Control',n:'Drive-by-wire',pg:'R2 p. 124',kind:'level',min:1,max:()=>3,cost:(v,l)=>v.cost*1.25*l,opt:[['Sp','+10% Speed'],['Ac','+10% Acceleration'],['L','+10% Load']],
  ok:(v,c)=>c.has('ctlsurf')?'Can’t combine with improved control surfaces':c.has('susp')?'Can’t combine with improved suspension':null,
  fx:(s,l,o)=>{s.H-=l; if(s.Hoff!=null) s.Hoff-=l; const k=o||'Sp'; if(k==='Sp') s.Sp=s.Sp.map(x=>Math.round(x*1.1)); else if(k==='Ac') s.Ac=Math.round(s.Ac*1.1); else s.Lbonus=Math.round(s.L0*0.1);},
  d:'Computer steering: −1 Handling per level (up to −3) and a one-time +10% to Speed, Acceleration or Load (pick one here). Needs performance or dual-purpose tires. Parts cost read as vehicle cost × 1.25 per level.'},
 {id:'ctlsurf',g:'Control',n:'Improved control surfaces',pg:'R2 p. 124–125',kind:'level',min:1,max:()=>2,cost:(v,l)=>v.cost*1.15*l,ok:(v,c)=>c.type!=='boat'?'Watercraft only':c.has('dbw')?'Can’t combine with drive-by-wire':null,
  fx:(s,l)=>{s.H-=l;},d:'Better rudders and control surfaces: −1 Handling per increment, up to −2.'},
 {id:'susp',g:'Control',n:'Improved suspension',pg:'R2 p. 125',kind:'level',min:1,max:()=>2,cost:(v,l)=>v.cost*1.10*l,ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled ground vehicles only':c.has('dbw')?'Can’t combine with drive-by-wire':null,
  fx:(s,l,o,c)=>{s.H-=l; if(s.Hoff!=null&&c.type==='bike') s.Hoff-=l;},d:'−1 on-road Handling per level, up to −2 (bikes improve off-road too). Needs performance or dual-purpose tires.'},
 {id:'offroad',g:'Control',n:'Off-road suspension',pg:'R2 p. 125',kind:'level',min:1,max:()=>2,cost:(v,l,o,c)=>v.cost*(c.type==='bike'?1.2:1.35)*l,ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled ground vehicles only':null,
  fx:(s,l)=>{ if(s.Hoff!=null) s.Hoff-=l; s.H+=l; s.Sp=s.Sp.map(x=>Math.max(0,x-15));},d:'Each level: −1 off-road Handling, +1 on-road Handling; −15 Speed whatever the level; worse Economy. Needs off-road or dual-purpose tires. Transports pay × 1.5 per level (not modeled).'},
 {id:'rciface',g:'Control',n:'Remote control interface',pg:'R2 p. 125–126',kind:'flag',cost:v=>2500*v.B,ok:(v,c)=>v.drone?'Drones already have one':c.facRC?'Already fitted (factory)':null,fx:s=>{s.P=Math.max(s.P,1);},
  d:'Lets a rigger run the vehicle over a remote control network and gives it Pilot 1.'},
 {id:'pilot',g:'Control',n:'Remote pilot programming',pg:'R2 p. 126',kind:'level',min:v=>Math.max(2,v.P+1),max:()=>5,cost:(v,l)=>[0,0,5000,25000,500000,2500000][l],ok:(v,c,l)=>!c.hasRC?'Needs a remote control interface':(l>=4&&!c.mil?MIL:null),fx:(s,l)=>{s.P=l;},
  d:'Raises the Pilot rating: 2 is the best the public can buy, 3 is gray market, 4 security grade, 5 military grade (battle-savvy autonomy).'},
 {id:'rigger',g:'Control',n:'Rigger adaptation',pg:'R2 p. 126',kind:'flag',cost:()=>2800,cf:()=>1,load:()=>10,ok:(v,c)=>v.drone?'Drones already have it':c.facRig?'Already fitted (factory)':(!c.has('datajack')&&!c.hasRC?'Needs a datajack port or remote control interface':(c.sens<1?'Needs Sensor 1 or better':null)),
  d:'The “black box” that lets a vehicle control rig drive it: full Control Pool and the rig’s Reaction and Initiative bonuses. Book lists 2,800¥ (and 2,500¥ again lower down); 2,800¥ used.'},
 {id:'secctl',g:'Control',n:'Secondary controls',pg:'R2 p. 126–127',kind:'flag',cost:()=>400,cf:()=>2,ok:(v,c)=>v.drone?'Drones have no cockpit':c.type==='bike'?'Not for motorcycles':null,d:'Co-pilot controls slaved to the main ones.'},
 // PROTECTION
 {id:'armor',g:'Protection',n:'Standard armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>40,cost:(v,l)=>1250*l,load:(v,l)=>v.B*v.B*5*l,ok:(v,c)=>c.has('carmor')?'Can’t combine with concealed armor':null,fx:(s,l)=>{s.A+=l; s.addArm+=l;},
  d:'+1 Armor per point. Each point weighs Body × Body × 5 kg against Load; every 6 points added worsens Handling by 1.'},
 {id:'carmor',g:'Protection',n:'Concealed armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>40,cost:(v,l)=>2000*l,cf:(v,l)=>3*l,load:(v,l)=>v.B*v.B*5*l,ok:(v,c)=>c.has('armor')?'Can’t combine with standard armor':null,fx:(s,l)=>{s.A+=l; s.addArm+=l;},
  d:'Armor hidden in the interior: spotting it takes a Perception Test against 9 − Armor ÷ 3. Costs 3 CF per point plus the same weight as standard armor.'},
 {id:'ablative',g:'Protection',n:'Ablative armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>Math.min(3,Math.floor(v.B/2)),cost:(v,l)=>[0,700,1600,2500][l],load:v=>v.B*100,ok:(v,c)=>AIR.has(c.type)?'Not for aircraft':null,fx:(s,l)=>{s.A+=2*l;},
  d:'Plates that blow off to deflect hits: +2 Armor per level, up to the vehicle’s Body. Loses a level whenever a hit’s Power is over 3 × the Armor. Weighs Body × 100 kg whatever the level; marks the vehicle as security grade.'},
 {id:'apps',g:'Protection',n:'APPS (per seat)',pg:'R2 p. 128',kind:'qty',min:1,max:()=>12,cost:(v,l)=>2500*l,cf:()=>1,ok:(v,c)=>v.drone?'No passengers in a drone':c.type==='bike'?'Not for motorcycles':null,
  d:'Secured belts, air bags and reinforced panels: halves the Power of crash damage. Getting out after a crash takes a Strength (5) Test.'},
 {id:'cage',g:'Protection',n:'Crash cage',pg:'R2 p. 128',kind:'flag',cost:()=>3500,cf:()=>2,load:()=>25,ok:(v,c)=>v.drone?'No passengers in a drone':c.type==='bike'?'Not for motorcycles':null,d:'Cushioned cabin: +6 dice for occupants’ Damage Resistance Tests in a crash.'},
 {id:'seal_gas',g:'Protection',n:'EnviroSeal: gas seal',pg:'R2 p. 128',kind:'flag',cost:v=>250*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Gas-tight cabin. Opening a door breaks the seal; Light damage breaches it (5¥ patches fix that). No life support on its own.'},
 {id:'seal_water',g:'Protection',n:'EnviroSeal: water seal',pg:'R2 p. 128',kind:'flag',cost:v=>750*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Watertight cabin for submerged running. The engine needs its own seal for underwater operation.'},
 {id:'seal_eng',g:'Protection',n:'EnviroSeal: engine seal',pg:'R2 p. 128',kind:'flag',cost:v=>1000*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Seals the engine compartment for submarine work.'},
 {id:'seal_op',g:'Protection',n:'Cabin overpressurization',pg:'R2 p. 128',kind:'flag',cost:v=>5000*v.B,cf:()=>1,load:()=>15,ok:(v,c)=>!(c.has('seal_gas')||c.has('seal_water'))?'Needs a gas or water seal':null,d:'Pumps keep outside contaminants out even with a door open or a light breach. Fails underwater or at Moderate damage.'},
 {id:'lifesup',g:'Protection',n:'Life support (10 man-hours each)',pg:'R2 p. 128–129',kind:'qty',min:1,max:()=>50,cost:(v,l)=>500+1000*l,cf:(v,l)=>l,load:(v,l)=>25*l,ok:(v,c)=>v.drone?'No passengers in a drone':!(c.has('seal_gas')||c.has('seal_water'))?'Needs a sealed cabin (EnviroSeal)':null,
  d:'Oxygen and climate control for a sealed cabin: each block is 10 man-hours (10 hours for one, 5 for two…). 500¥ plus 100¥ per man-hour.'},
 {id:'rollbar',g:'Protection',n:'Roll bars',pg:'R2 p. 129',kind:'flag',cost:()=>2000,d:'Rigidity for crashes: removes the rag-top double damage penalty, or +3 dice for hard-top occupants. Required for some roof mounts on civilian vehicles.'},
 {id:'sas',g:'Protection',n:'Smart armor system (SAS)',pg:'R2 p. 129–130',kind:'flag',cost:()=>20000,cf:(v,l,o,c)=>3*c.armor,load:(v,l,o,c)=>v.B*50*c.armor,ok:(v,c)=>v.B<4?'Body 4 or more':(!c.mil?MIL:(c.armor<1?'Needs some Armor to back':null)),
  d:'Explosive cells that stage incoming damage down a level when 2D6 beats the activation number (3, +1 per hit). Takes 3 CF and Body × 50 kg per point of Armor. Not on the street.'},
 // SIGNATURE
 {id:'baffle',g:'Signature',n:'Thermal baffles',pg:'R2 p. 130',kind:'level',min:1,max:()=>2,cost:(v,l,o,c)=>v.B*(BAFFLE[c.type]||5000)*l,cf:(v,l)=>3*l,load:(v,l)=>v.B*50*l,fx:(s,l)=>{s.Si+=l;},
  d:'Heat-absorbing materials: +1 Signature per level (up to +2) against thermographic sensors. Gasoline, methane, diesel or jet engines only.'},
 {id:'ram',g:'Signature',n:'Radar-absorbent materials',pg:'R2 p. 130–131',kind:'level',min:1,max:()=>3,cost:(v,l)=>l*l*l*25000,ok:(v,c)=>!c.mil?MIL:null,fx:(s,l)=>{s.Si+=l;},d:'Radar-eating coatings: +1 Signature per level, up to +3. Military only.'},
 // WEAPON MOUNTS
 {id:'fx_eh',g:'Weapon mounts',n:'Fixed mount, external hardpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>2000*l,cf:(v,l)=>2*l,load:(v,l)=>10*l,d:'A heavy weapon fixed facing one way (aim by steering). Halves recoil; heavy weapons (MMG and up) need a hardpoint. External mounts cut Signature by 1. Add the weapon’s weight to Load yourself.'},
 {id:'fx_ef',g:'Weapon mounts',n:'Fixed mount, external firmpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>750*l,cf:(v,l)=>l,load:(v,l)=>10*l,d:'Fixed mount for LMGs and small arms. External mounts cut Signature by 1. Add the weapon’s weight to Load.'},
 {id:'fx_ih',g:'Weapon mounts',n:'Fixed mount, internal hardpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>3000*l,cf:(v,l)=>7*l,load:(v,l)=>10*l,d:'Hidden heavy mount behind the vehicle’s armor; extending or stowing it is a Complex Action and lowers Signature by 1 while out.'},
 {id:'fx_if',g:'Weapon mounts',n:'Fixed mount, internal firmpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>1500*l,cf:(v,l)=>5*l,load:(v,l)=>10*l,d:'Hidden small-arms mount behind the armor; Complex Action to extend or stow.'},
 {id:'pintle',g:'Weapon mounts',n:'Pintle mount',pg:'R2 p. 133',kind:'qty',min:1,max:()=>8,cost:(v,l)=>50*l,ok:v=>v.drone?'Can’t be run remotely, so not on drones':null,d:'A reinforced swivel for any firmpoint weapon: 60° side to side, 30° up and down, 2 points of recoil compensation. Counts as a firmpoint.'},
 {id:'ring',g:'Weapon mounts',n:'Ring mount',pg:'R2 p. 133–134',kind:'qty',min:1,max:()=>4,cost:(v,l)=>3000*l,cf:(v,l)=>l,load:(v,l)=>25*l,ok:v=>v.drone?'Can’t be run remotely, so not on drones':null,d:'A full-circle ring for a gunner standing in the vehicle: man-portable heavy weapons and LMGs, 6 points of recoil compensation. Counts as a hardpoint; hardtops or roll bars only.'},
 {id:'tur_mini',g:'Weapon mounts',n:'Turret, mini (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>5000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?8:o==='pop'?14:7),load:(v,l)=>25*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil&&!c.has('rollbar')?'Civilian vehicles need roll bars first':null),
  d:'Armored, motorized ring mount: 360°, Weapon Value 2 (an SMG or rifle is 1, an LMG 1.5). Takes 1 hardpoint, cuts Signature by 1. Anti-aircraft costs × 1.5 and +1 CF; pop-up doubles CF.'},
 {id:'tur_small',g:'Weapon mounts',n:'Turret, small (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>7500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?9:o==='pop'?16:8),load:(v,l)=>100*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil&&!c.has('rollbar')?'Civilian vehicles need roll bars first':null),
  d:'Weapon Value 3 (a medium or heavy machine gun is 2), 2 CF of extra space inside. Takes 2 hardpoints, cuts Signature by 1.'},
 {id:'tur_med',g:'Weapon mounts',n:'Turret, medium (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>15000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?25:o==='pop'?48:24),load:(v,l)=>1000*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil?MIL:null),
  d:'Weapon Value 6 (an assault cannon is 3), 4 CF and seating for two inside. Takes 3 hardpoints, cuts Signature by 1. Military only.'},
 {id:'rt_micro',g:'Weapon mounts',n:'Remote turret, micro',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>2500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?2:o==='pop'?2:1),load:(v,l)=>10*l,
  d:'Weapons-only turret run from inside or by a rigger: Weapon Value 1, takes 1 firmpoint, cuts Signature by 1. Standard on smaller drones.'},
 {id:'rt_mini',g:'Weapon mounts',n:'Remote turret, mini',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>6000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?5:o==='pop'?8:4),load:(v,l)=>25*l,
  d:'Remote turret, Weapon Value 2, takes 1 hardpoint, cuts Signature by 1.'},
 {id:'rt_small',g:'Weapon mounts',n:'Remote turret, small',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>9000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?6:o==='pop'?10:5),load:(v,l)=>100*l,
  d:'Remote turret, Weapon Value 3, takes 2 hardpoints, cuts Signature by 1.'},
 {id:'rt_med',g:'Weapon mounts',n:'Remote turret, medium',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up']],cost:(v,l,o)=>17500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?9:o==='pop'?16:8),load:(v,l)=>1000*l,ok:(v,c)=>!c.mil?MIL:null,
  d:'Remote turret, Weapon Value 6, takes 3 hardpoints, cuts Signature by 1. Military only.'},
 {id:'convkit',g:'Weapon mounts',n:'Firearm conversion kit',pg:'R2 p. 131',kind:'qty',min:1,max:(v,c)=>Math.max(1,c.mountsN),opt:[['pistol','Pistol',150,0],['smg','SMG',350,.25],['rifle','Rifle, shotgun or LMG',750,.5],['heavy','Heavy weapon',1000,1]],
  cost:(v,l,o)=>l*({pistol:150,smg:350,rifle:750,heavy:1000})[o||'rifle'],load:(v,l,o)=>l*({pistol:0,smg:.25,rifle:.5,heavy:1})[o||'rifle'],ok:(v,c)=>!c.mountsN?'Needs a fixed mount or turret':null,
  d:'Adapts a personal firearm to a fixed mount or turret (Weapon B/R (4), 12 hours). Not needed for pintle or ring mounts or purpose-built vehicle weapons.'},
 {id:'smartkit',g:'Weapon mounts',n:'Smartlink integration kit',pg:'R2 p. 134',kind:'flag',opt:[['1','Level I',650],['2','Level II',900]],cost:(v,l,o)=>o==='2'?900:650,cf:()=>1,ok:(v,c)=>!c.mountsN?'Needs a fixed mount or turret':null,
  d:'Lets a smartlinked gunner use the smartgun system of weapons in fixed mounts or turrets, with palm-induction controls.'},
 {id:'recoil',g:'Weapon mounts',n:'Gunnery recoil adjusters',pg:'R2 p. 132',kind:'level',min:1,max:(v,c)=>c.recoilMax,cost:(v,l)=>500*l,cf:()=>1,load:(v,l)=>l+24,ok:(v,c)=>!c.recoilMax?'Needs a fixed mount or turret':c.has('gyro')?'Can’t combine with gyro-stabilization':null,
  d:'Micro-actuators that cancel 1 point of recoil per level. Maximum: 4 for a fixed firmpoint or micro turret, 6 mini turret, 9 small turret or fixed hardpoint, 12 medium turret.'},
 {id:'gyro',g:'Weapon mounts',n:'Vehicle gyro-stabilizer',pg:'R2 p. 136',kind:'level',min:1,max:v=>2*v.B,cost:(v,l)=>1000*l,cf:()=>1,load:(v,l)=>l+24,ok:(v,c)=>!c.mountsN?'Needs a fixed mount or turret':c.has('recoil')?'Can’t combine with recoil adjusters':null,fx:(s,l,o,c)=>{s.H+=Math.max(0,l-c.B);},
  d:'Each point offsets 1 point of recoil and movement modifiers. Up to 2 × Body; every point above Body adds +1 Handling.'},
 // ELECTRONICS
 {id:'fddm',g:'Electronics',n:'BattleTac FDDM receiver',pg:'R2 p. 136',kind:'flag',cost:(v,l,o,c)=>35000*Math.max(1,c.pilot),ok:(v,c)=>!c.hasRC?'Needs a Pilot rating (drone or remote control interface)':null,d:'Fire Direction Data Manager: shares targeting so drones can fire on targets out of their own line of sight. Pilot × 35,000¥.'},
 {id:'ivis',g:'Electronics',n:'BattleTac IVIS receiver',pg:'R2 p. 136–137',kind:'flag',cost:(v,l,o,c)=>25000*Math.max(1,c.pilot),ok:(v,c)=>!c.hasRC?'Needs a Pilot rating (drone or remote control interface)':null,d:'Joins the IVIS network: shared data helps Comprehension Tests or builds an IVIS pool for the drones. Pilot × 25,000¥.'},
 {id:'ecm',g:'Electronics',n:'ECM',pg:'R2 p. 137',kind:'level',min:1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_ECM[l][0],cf:(v,l)=>T_ECM[l][1],load:(v,l)=>T_ECM[l][2],d:'Jammers, chaff and flares that confound sensors and remote control signals (see R2 p. 31). Levels 1–4 can be bought on the street; 5+ is security or military.'},
 {id:'eccm',g:'Electronics',n:'ECCM',pg:'R2 p. 137–138',kind:'level',min:1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_ECCM[l][0],cf:(v,l)=>T_ECCM[l][1],load:(v,l)=>T_ECCM[l][2],d:'Amplifiers and filters that cut through ECM. Levels 1 and 3 corrected to 10,000¥ and 50,000¥: the book prints 110,000¥ and 350,000¥, which break the table’s 100¥-per-Design-Point pattern (R2 p. 138). Level 8 is printed “2.5¥” (2.5M¥).'},
 {id:'ed',g:'Electronics',n:'Electronic deception',pg:'R2 p. 138',kind:'level',min:1,max:()=>6,cost:(v,l)=>T_ED[l][0],cf:(v,l)=>T_ED[l][1],load:(v,l)=>T_ED[l][2],ok:(v,c)=>!c.mil?MIL:null,d:'Feeds enemy sensors false range, position and heading. Security and military only.'},
 {id:'ecd',g:'Electronics',n:'Electronic counter-deception',pg:'R2 p. 138–139',kind:'level',min:1,max:()=>6,cost:(v,l)=>T_ECD[l][0],cf:(v,l)=>T_ECD[l][1],load:(v,l)=>T_ECD[l][2],ok:(v,c)=>!c.mil?MIL:null,d:'Reality-checking gear that negates electronic deception. Security and military only.'},
 {id:'eport',g:'Electronics',n:'Electronics port',pg:'R2 p. 138–139',kind:'qty',min:1,max:()=>8,cost:(v,l)=>1000*l,cf:(v,l)=>l,d:'Powers a radio, camera, RC deck and the like from the vehicle; attached devices get +½ Body to their Flux Rating. Add the device’s own cost and weight.'},
 {id:'amp',g:'Electronics',n:'Power amplifier',pg:'R2 p. 139',kind:'level',min:1,max:()=>10,cost:(v,l)=>250*l,cf:(v,l)=>Math.ceil(l/2),load:(v,l)=>l,d:'+1 Flux Rating per level for sensors, ECM, ECCM or a hardwired RC deck: more range, harder to jam.'},
 {id:'sensor',g:'Electronics',n:'Sensor upgrade',pg:'R2 p. 139–140',kind:'level',min:v=>v.Se+1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_SEN[l][0],cf:(v,l)=>T_SEN[l][1],load:(v,l)=>T_SEN[l][2],fx:(s,l)=>{s.Se=l;},d:'Better audio/video, thermal, radar and tracking: sets the Sensor rating. Levels 5+ are security or military grade.'},
 // MISC
 {id:'droptank',g:'Accessories',n:'Aircraft drop tanks (pairs)',pg:'R2 p. 140',kind:'qty',min:1,max:v=>Math.max(1,Math.floor(v.B/2)),cost:(v,l)=>8000*l,ok:(v,c)=>!(c.type==='plane'||c.type==='rotor')?'Aircraft only':null,fx:(s,l)=>{s.Sp=s.Sp.map(x=>Math.max(0,x-15*l)); s.Si-=1; s.H+=Math.floor(l/2);},
  d:'1,000 liters each, in pairs, in place of two external missile mounts per pair. −1 Signature, −15 Speed per pair, +1 Handling per two pairs. Can be jettisoned.'},
 {id:'amphib',g:'Accessories',n:'Amphibious package',pg:'R2 p. 140–141',kind:'level',min:1,max:()=>3,cost:(v,l)=>[0,2500,7500,15000][l],cf:(v,l)=>[0,0,2,4][l],ok:(v,c,l)=>!GROUND.has(c.type)||c.type==='bike'?'Ground vehicles only':(l===1&&c.type!=='car'?'Level 1 uses the wheels: wheeled vehicles only':null),
  d:'Level 1: wheels paddle at 15 m/turn, +2 Handling. Level 2: propeller, water Speed 30. Level 3: water-jets, water Speed 45. With seals and life support it can go under.'},
 {id:'antitheft',g:'Accessories',n:'Anti-theft system',pg:'R2 p. 141',kind:'level',min:1,max:()=>10,opt:[['none','No shock'],['shock','Standard shock system (+2,000¥)']],cost:(v,l,o)=>l*bracket(l,100,400,1000,5000)+(o==='shock'?2000:0),
  d:'Dice equal to its rating against intruders. Responses include a call to Lone Star (needs a phone in an electronics port), an electric shock (like a Super Shock taser) or, illegally, explosives.'},
 {id:'convtop',g:'Accessories',n:'Convertible top',pg:'R2 p. 143',kind:'flag',cost:v=>v.cost*0.1+2500,ok:(v,c)=>c.type!=='car'||v.drone?'Hard-top cars only':null,d:'Rag-top conversion. Without roll bars, passengers’ crash damage target numbers double; no protection from the sides, rear or top.'},
 {id:'crane',g:'Accessories',n:'Crane',pg:'R2 p. 143–144',kind:'flag',opt:v=>CAPS.filter(x=>x<=capMax(CRANE,v.B)).map(x=>[String(x),fmtN(x)+' kg']),cost:(v,l,o)=>100*(+o||25),cf:()=>35,load:v=>v.B*80,ok:v=>v.B<1?'Body 1 or more':null,
  d:'Hydraulic boom for lifting while parked. Capacity up to the Crane Capacity Table for the vehicle’s Body; costs 100¥ per kg of capacity.'},
 {id:'dronerack',g:'Accessories',n:'Drone rack',pg:'R2 p. 144',kind:'qty',min:1,max:()=>6,opt:()=>[1,2,3,4,5,6,8,10,12,16,20].map(x=>[String(x),'Drone takes '+x+' CF']),cost:(v,l)=>(v.cost*0.1+2500)*l,cf:(v,l,o)=>l*((+o||1)+2),load:(v,l)=>45*l,
  d:'A cradle that launches and recovers an airborne drone on the move and doubles as a mini-hangar (rack Armor equals the vehicle’s, Body half). Takes the drone’s CF + 2.'},
 {id:'extcargo',g:'Accessories',n:'External cargo mount (per CF)',pg:'R2 p. 144',kind:'qty',min:1,max:v=>Math.max(1,v.C),cost:(v,l)=>250*l,ok:v=>v.C<1?'Can’t exceed the original cargo space':null,fx:(s,l)=>{s.Cext=l;},d:'Roof racks and side boxes: extra cargo up to the original internal CF. +1 Handling while loaded.'},
 {id:'floats',g:'Accessories',n:'Floatation package',pg:'R2 p. 144–145',kind:'flag',cost:v=>v.cost*0.1+2500,load:()=>100,ok:(v,c)=>!(c.type==='plane'||c.type==='rotor')?'Aircraft and helicopters only':null,fx:(s,l,o,c)=>{s.Sp=s.Sp.map(x=>Math.floor(x*(c.type==='rotor'?0.9:0.5)));},
  d:'Floats for water landings: aircraft Speed halved (helicopters × .9) and Economy × 1.2. Float planes can’t land on ground.'},
 {id:'hoverseal',g:'Accessories',n:'Hovercraft water seal',pg:'R2 p. 145',kind:'flag',cost:v=>500*v.B,ok:(v,c)=>c.type!=='hover'?'Hovercraft only':null,d:'Keeps a hovercraft afloat if it loses power over water.'},
 {id:'arm',g:'Accessories',n:'Mechanical arm',pg:'R2 p. 145',kind:'qty',min:1,max:()=>4,cost:(v,l)=>25000*v.B*l,cf:(v,l)=>4*l,load:(v,l,o,c)=>25*(v.B*v.B+c.lv('armstr'))*l,ok:v=>v.B<1?'Body 1 or more':null,
  d:'A dexterous arm with Strength = Body², lifting Strength × 50 kg. Can carry cyberarm accessories at half price. Each arm weighs Strength × 25 kg.'},
 {id:'armstr',g:'Accessories',n:'Arm Strength enhancement (per arm)',pg:'R2 p. 145',kind:'level',min:1,max:v=>Math.max(0,10*v.B-v.B*v.B),cost:(v,l,o,c)=>c.lv('arm')*(Math.min(3,l)*75000+Math.max(0,l-3)*90000),ok:(v,c)=>!c.has('arm')?'Needs a mechanical arm':null,
  d:'+1 Strength per point on every arm (75,000¥ a point for the first 3, 90,000¥ after). An arm can never pass 10 × Body.'},
 {id:'sidecar',g:'Accessories',n:'Sidecar',pg:'R2 p. 145',kind:'flag',opt:[['s','Small (4 CF)'],['m','Medium (8 CF)'],['l','Large (12 CF)']],cost:(v,l,o)=>({s:1000,m:2000,l:3500})[o||'s'],ok:(v,c)=>c.type!=='bike'?'Motorcycles only':null,
  fx:(s,l,o)=>{s.Cplus+=({s:4,m:8,l:12})[o||'s']; s.H+=o==='l'?2:1; s.Sp=s.Sp.map(x=>Math.max(0,x-15));},d:'Adds cargo space (seats come out of it), +1 Handling (+2 large), −15 Speed and −10% Economy. Load doesn’t change.'},
 {id:'spot',g:'Accessories',n:'Spotlight',pg:'R2 p. 145–146',kind:'qty',min:1,max:()=>4,cost:(v,l)=>600*l,d:'600 m beam, white light or infrared for low-light and thermographic systems; manual or remote.'},
 {id:'winch',g:'Accessories',n:'Winch',pg:'R2 p. 146',kind:'flag',opt:v=>CAPS.filter(x=>x<=capMax(WINCH,v.B)).map(x=>[String(x),fmtN(x)+' kg']),cost:(v,l,o)=>75*(+o||5),cf:()=>1,load:v=>v.B*2.5,ok:(v,c)=>!GROUND.has(c.type)?'Ground vehicles only':null,
  d:'Bumper winch to pull, tow or haul the vehicle up a cliff at 1 m/turn. Capacity up to the Winch Capacity Table for the Body; 75¥ per kg.'},
];
const BY=Object.fromEntries(M.map(m=>[m.id,m]));
// EnviroSeal: the seal system takes 1 CF however many seals
const optsOf=(d,v)=>typeof d.opt==='function'?d.opt(v):d.opt;
function ctxOf(v,b){
  const has=id=>b.mods.some(m=>m.id===id), lv=id=>{const m=b.mods.find(m=>m.id===id);return m?m.lv:0;}, opt=id=>{const m=b.mods.find(m=>m.id===id);return m?m.opt:null;};
  const type=b.type||v.type, mil=!!b.mil, facRC=!!b.facRC, facRig=!!b.facRig;
  const hasRC=v.drone||facRC||has('rciface');
  const pilot=Math.max(v.P,hasRC?1:0,lv('pilot'));
  const sens=Math.max(v.Se,lv('sensor'));
  const mountsN=[...FIXED,...TURRETS].reduce((a,k)=>a+lv(k),0);
  const rmax=Math.max(lv('fx_ef')||lv('fx_if')||lv('rt_micro')?4:0,lv('tur_mini')||lv('rt_mini')?6:0,lv('tur_small')||lv('rt_small')||lv('fx_eh')||lv('fx_ih')?9:0,lv('tur_med')||lv('rt_med')?12:0);
  const armor=v.A+lv('armor')+lv('carmor')+2*lv('ablative');
  return {has,lv,opt,type,mil,facRC,facRig,hasRC,pilot,sens,mountsN,recoilMax:rmax,armor,B:v.B,rigged:v.drone||facRig||has('rigger')};
}
function calc(v,b){
  const c=ctxOf(v,b), bad=[], rows=[];
  const s={H:v.H,Hoff:v.Hoff,Sp:v.Sp.slice(),Ac:v.Ac,B:v.B,A:v.A,Si:v.Si,Au:v.Au,P:v.P,Se:v.Se,L0:v.L,Lbonus:0,Cplus:0,Cext:0,addArm:0};
  let cost=0,cf=0,load=0,pts=0,sealCF=false; const seen=new Set();
  b.mods.forEach(m=>{const d=BY[m.id]; if(!d){bad.push('Unknown modification');return;}
    if(seen.has(m.id)) bad.push(d.n+' is listed twice'); seen.add(m.id);
    const l=d.kind==='flag'?1:m.lv, mn=typeof d.min==='function'?d.min(v,c):(d.min||1), mx=d.kind==='flag'?1:d.max(v,c);
    if(d.kind!=='flag'&&(!(l>=mn)||!(l<=mx)||l!==Math.floor(l))) bad.push(`${d.n} ${l} is outside ${mn}–${mx}`);
    const os=optsOf(d,v); if(os&&os.length&&!os.some(o=>o[0]===m.opt)) bad.push(d.n+': pick an option');
    const why=d.ok?d.ok(v,c,l):null; if(why) bad.push(d.n+': '+why);
    const co=Math.round(d.cost?d.cost(v,l,m.opt,c):0); let f=d.cf?d.cf(v,l,m.opt,c):0; const ld=d.load?d.load(v,l,m.opt,c):0;
    if(/^seal_(gas|water|eng)$/.test(m.id)){f=sealCF?0:1; sealCF=true;}
    cost+=co; cf+=f; load+=ld; pts+=(MOUNTPTS[m.id]||0)*l;
    if(d.fx) d.fx(s,l,m.opt,c);
    rows.push({m,d,l,cost:co,cf:f,load:ld});
  });
  // armor handling penalty: +1 per 6 points added (R2 p. 127)
  s.H+=Math.floor(s.addArm/6); if(s.Hoff!=null) s.Hoff+=Math.floor(s.addArm/6);
  // signature: external fixed mounts and turrets each cut it by 1 (once per kind)
  if(c.lv('fx_eh')||c.lv('fx_ef')) s.Si-=1;
  if(TURRETS.some(k=>c.lv(k)&&c.opt(k)!=='pop')) s.Si-=1;
  const Cmax=v.C+s.Cplus, Lmax=v.L+s.Lbonus;
  if(cf>Cmax+1e-9) bad.push(`Cargo space: needs ${fmtN(cf)} CF, the vehicle has ${Cmax} (R2 p. 120)`);
  if(load>Lmax+1e-9) bad.push(`Load: needs ${fmtN(load)} kg, the vehicle has ${fmtN(Lmax)} (R2 p. 120)`);
  if(pts>v.B) bad.push(`Weapon mounts use ${pts} Body points; Body is ${v.B} (hardpoint 2, firmpoint 1; R2 p. 131)`);
  return {v,b,c,s,rows,cost,cf,load,pts,Cmax,Lmax,bad,ok:!bad.length};
}
const clone=b=>({...b,mods:b.mods.map(m=>({...m}))});
function defOpt(d,v){const os=optsOf(d,v); return os&&os.length?os[0][0]:undefined;}
function minLv(d,v,c){return d.kind==='flag'?1:(typeof d.min==='function'?d.min(v,c):(d.min||1));}
// legal levels for mod index i
function levels(v,b,i){const m=b.mods[i],d=BY[m.id]; if(d.kind==='flag') return [1]; const c=ctxOf(v,b); const out=[];
  for(let l=minLv(d,v,c),mx=d.max(v,c);l<=mx;l++){const t=clone(b); t.mods[i].lv=l; if(calc(v,t).ok) out.push(l);} return out;}
function optChoices(v,b,i){const m=b.mods[i],d=BY[m.id],os=optsOf(d,v)||[]; return os.filter(o=>{const t=clone(b); t.mods[i].opt=o[0]; return calc(v,t).ok;});}
// what can be added right now (at its lowest level / first option that fits)
function addable(v,b){const c=ctxOf(v,b), yes=[], no=[];
  M.forEach(d=>{ if(b.mods.some(m=>m.id===d.id)) return; let why=null,got=null;
    const os=optsOf(d,v); const tryOpts=os&&os.length?os.map(o=>o[0]):[undefined];
    const pre=d.ok?d.ok(v,c,minLv(d,v,c)):null;
    if(pre&&!/^Level 1 uses/.test(pre)) why=pre;
    else if(d.kind!=='flag'&&d.max(v,c)<minLv(d,v,c)){why=d.id==='sensor'||d.id==='autonav'||d.id==='pilot'?'Already at the best rating available':'Not possible on this vehicle';}
    else for(const o of tryOpts){const t=clone(b); t.mods.push({id:d.id,lv:minLv(d,v,c),opt:o}); const r=calc(v,t); if(r.ok){got={lv:minLv(d,v,c),opt:o};break;} why=why||r.bad[r.bad.length-1];}
    if(got) yes.push({d,...got}); else no.push({d,why:(why||'').replace(d.n+': ','')});
  }); return {yes,no};}
// rebuild keeping every mod that is still legal, lowering levels where needed (handles stale saves and changed vehicle type)
function clamp(v,b){let r=clamp1(v,b,b.mods||[]); // second pass picks up mods whose prerequisite came later in the list
  for(let k=0;k<3&&r.droppedM.length;k++){const again=clamp1(v,r.b,r.droppedM,true); if(again.droppedM.length===r.droppedM.length){break;} r={b:again.b,droppedM:again.droppedM};}
  return {b:r.b,dropped:r.droppedM.map(m=>BY[m.id]?BY[m.id].n:m.id).filter(Boolean)};}
function clamp1(v,b,list,keep){const nb={...b,mods:keep?b.mods.map(m=>({...m})):[]}, dropped=[];
  list.forEach(m=>{const d=BY[m.id]; if(!d) return; if(nb.mods.some(x=>x.id===m.id)) return;
    const c=ctxOf(v,nb); const os=optsOf(d,v); let opt=m.opt; if(os&&os.length&&!os.some(o=>o[0]===opt)) opt=os[0][0];
    const mn=minLv(d,v,c), mx=d.kind==='flag'?1:d.max(v,c); let l=d.kind==='flag'?1:Math.min(mx,Math.max(mn,Math.floor(+m.lv||mn)));
    let placed=false; for(;l>=mn;l--){nb.mods.push({id:m.id,lv:l,opt}); if(calc(v,nb).ok){placed=true;break;} nb.mods.pop();}
    if(!placed&&os&&os.length){for(const o of os){nb.mods.push({id:m.id,lv:mn,opt:o[0]}); if(calc(v,nb).ok){placed=true;break;} nb.mods.pop();}}
    if(!placed) dropped.push(m);
  }); return {b:nb,droppedM:dropped};}
const GROUPS=['Control','Protection','Weapon mounts','Electronics','Signature','Engine','Accessories'];
const typeName=t=>(TYPES.find(x=>x[0]===t)||[0,t])[1];
function statLine(v,s){const sp=a=>a.join('/'); const H=s.Hoff!=null?`${s.H}/${s.Hoff}`:s.H, H0=v.Hoff!=null?`${v.H}/${v.Hoff}`:v.H;
  return [['Handling',H0,H],['Speed',sp(v.Sp),sp(s.Sp)],['Accel',v.Ac,s.Ac],['Armor',v.A,s.A],['Signature',v.Si,s.Si],['Autonav',v.Au||'—',s.Au||'—'],['Pilot',v.P||'—',s.P||'—'],['Sensor',v.Se,s.Se]];}
return {TYPES,typeName,veh,M,BY,GROUPS,calc,clamp,levels,optChoices,addable,optsOf,ctxOf,statLine,minLv,fmtN,AIR,GROUND};
})();
