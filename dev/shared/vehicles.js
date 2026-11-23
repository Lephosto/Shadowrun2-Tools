// ---------- Vehicle build-out: Rigger 2 vehicle customization (R2 p. 118–146) ----------
// Shared by the Gear Locker and the Runner Builder. Every limit is checked by calc(); the UI only offers changes that keep calc() clean.
const VB=(()=>{
const num=x=>{const n=parseFloat(String(x==null?'':x).replace(/[^0-9.\-]/g,''));return isFinite(n)?n:0;};
// first figure only: R2 prints extras as "350(75)" (alternate mode) or "5/90" (second space); commas are thousands
const first=x=>{const m=String(x==null?'':x).replace(/,/g,'').match(/-?\d+(\.\d+)?/);return m?parseFloat(m[0]):0;};
const dash=x=>x==null||/^\s*([—–\-_]|NA)?\s*$/i.test(String(x));
const TYPES=[['car','Car, truck or wheeled drone'],['bike','Motorcycle'],['tracked','Tracked or other ground drone'],['walker','Walker drone'],['hover','Hovercraft'],['boat','Boat'],['plane','Fixed-wing aircraft'],['rotor','Helicopter, VTOL or LAV'],['lta','Blimp or airship']];
const GROUND=new Set(['car','bike','tracked','walker']), AIR=new Set(['plane','rotor','lta']), WHEELED=new Set(['car','bike']);
const fmtN=n=>Math.round(n).toLocaleString('en-US');
// Factory equipment and seating from each Rigger 2 Vehicle List entry (R2 p. 148–166): [seats, factory mods, other features].
// Factory gear is already counted in the listed Cargo, Load and stats, so it costs no CF or Load here; it does count toward
// mount points, level maximums ("existing levels count against the maximum", R2 p. 120) and prerequisites.
const FACT={
'Aerodesign Systems Condor Series (LDSD-41)':[0,''],'Aerodesign Systems Condor Series (LDSD-23)':[0,'suncell'],
'Aeroquip "Redball Express" Long-Range Resupply Drone':[0,''],
'Agusta-Cierva Plutocrat (Standard)':[6,'eport:1','luxury fittings, satellite uplink'],'Agusta-Cierva Plutocrat (Armed)':[6,'eport:1,tur_small:1','luxury fittings, satellite uplink'],
'Airship Industries Skyswimmer':[6,''],'Ares Arms Sentry II':[0,'rt_micro:1:aa'],
'Ares Citymaster':[12,'seal_gas,lifesup:2,tur_small:1'],'Ares Dragon':[3,''],'Ares Guardian Drone':[0,'rt_mini:1'],
'Ares Mobmaster':[12,'seal_gas,lifesup:3,tur_small:1'],'Ares Roadmaster':[3,''],'Ares Sentinel "P" Series Drone':[0,'gridlink,rt_micro:1','modified GridLink'],
'Ares TR-55C Cargoliner':[14,'','VTOL'],'Ares TR-55E "President\'s Edition" Executive':[11,'','VTOL, luxury fittings'],'Ares TR-55T Traveller':[14,'','VTOL'],
'Artemis Industries Nightglider':[1,''],'Aztech GCR-23C Crawler':[0,''],'Aztech Nightrunner (Standard)':[2,''],'Aztech Nightrunner (Electric)':[2,''],
'Aztechnology Aguilar-EX':[2,'ecm:6,eccm:7,fx_eh:1,mis_ext:5,ram:2','1,500 kg ordnance on the missile mounts'],
'Aztechnology Halcón Ground-Attack Aircraft':[1,'ecm:9,eccm:9,seal_gas,fx_eh:2,mis_ext:7','ejection seat; 2,100 kg ordnance on the missile mounts'],
'Aztechnology Hedgehog Signal Interceptor':[0,'','rigger decryption unit (4), protocol emulation module (4)'],
'Aztechnology Liebre Surveillance/Pursuit RPV':[0,'fx_eh:1','Vanquisher minigun with 1,000 rounds on the hardpoint'],
'Aztechnology Lobo Medium Scout LAV':[3,'ecm:6,eccm:5,tur_med:1','ejection seats'],
'Aztechnology Tiburón Patrol Boat':[3,'ecm:5,eccm:5,tur_mini:2'],'Aztechnology Tiburón Patrol Boat (Interdiction Variant)':[3,'ecm:5,eccm:5,tur_mini:1,rt_micro:3'],
'BAC-Dassault-MBB EFA Variants':[1,'ecm:4,eccm:5,seal_gas,fx_eh:1,mis_ext:4','ejection seat; 1,200 kg ordnance on the missile mounts'],
'Blohm & Voss River Commander':[3,'rt_micro:3,tur_mini:1','living space'],'BMW Blitzen 2050':[2,'','turbocharging (in its stats)'],
'CAS Wandjina RPV':[0,'fx_eh:1,mis_ext:1','300 kg ordnance on the missile mount'],'CASA J-239 Raven':[2,'fx_eh:2','turbocharging (in its stats)'],
'Cessna C750 (Standard)':[2,''],'Cessna C750 (Pass.)':[14,''],'Chrysler-Nissan G12A (Pass.)':[20,''],'Chrysler-Nissan G12A (Cargo)':[2,''],
'Chrysler-Nissan Jackrabbit (Elec.)':[3,''],'Chrysler-Nissan Jackrabbit (Meth.)':[2,''],
'Chrysler-Nissan Patrol-1':[5,'eport:1,seal_gas,pintle:2,baffle:1','radio; turbocharging 2 (in its stats)'],
'Citroën Brouillard Smoke Generator':[0,'','smoke generator'],'Colorado Craft Cigarette Hydrofoil':[2,'','hydrofoil (bracketed stats when engaged)'],
'Conestoga Trailblazer':[3,''],'Cyberspace Designs Dalmatian':[0,''],'Cyberspace Systems Wolfhound Advanced Reconnaissance Aircraft':[0,'','learning pool 2 (Avoid Detection)'],
'Doc Wagon Citymaster Variant':[6,'antitheft:6,seal_gas,lifesup:2,tur_small:1','medical gear (2 patients)'],'Doc Wagon CRT Ambulance':[2,'antitheft:6','medical gear (4 patients)'],
'Doc Wagon CRT Air Unit':[2,'antitheft:6','medical gear (4 patients), VTOL'],'Doc Wagon Osprey II':[2,''],'Doc Wagon SRT Ambulance':[2,'antitheft:6','medical gear (1 patient)'],
'Doc Wagon SRT Helicopter':[2,'antitheft:6','medical gear (1 patient)'],'Doc Wagon WK-2 Stallion Variant':[2,'antitheft:6,fx_eh:2','medical gear (1 patient)'],
'Dodge Scoot':[1,'gridlink'],'Embraer-Dassault Mistral':[17,''],'Entertainment Systems Papoose':[1,''],
'Eurocar Westwind 2000 (Standard)':[3,'apps:3'],'Eurocar Westwind 2000 (Turbo)':[3,'apps:3','turbocharging (in its stats)'],'Federated Boeing Commuter':[17,''],
'Federated Boeing Eagle':[1,'ecm:7,eccm:8,fx_eh:2,mis_ext:6','ejection seat; 1,800 kg ordnance; the book says "hardpoints" without a count, read as 2'],
'Ferrari Appaloosa Light Scout':[4,'ecm:5,eccm:5,tur_med:1,rt_micro:1,ram:1,baffle:1'],'Ferret RPD-VI Perimeter Drone':[0,'spot:1'],'Fiat-Fokker Cloud Nine':[6,'floats'],
'FMC-Stonebrooke TADS Firebird':[0,'fddm'],'FMC-Stonebrooke TADS Salamander':[0,'fddm'],'Ford Americar':[4,''],'Ford-Canada Bison':[4,'carmor','basic living space'],
'Gaz-Niki GNRD-71 BIS Snooper':[0,''],'Gaz-Niki White Eagle':[2,''],'Gaz-Willys Nomad':[4,'rollbar'],'General Products COP':[2,'gridlink','turbocharging 1 (in its stats)'],
'Generic Surveillance Drone':[0,''],'GM-Nissan Doberman':[0,'fx_ef:1,rt_micro:1'],'GM-Nissan Spotter':[0,''],'GMC 4201':[3,''],
'GMC Banshee':[3,'ecm:5,eccm:5,fx_eh:1,ram:2,tur_small:1','ejection seats'],'GMC Beachcraft Patroller':[2,'fx_eh:1','turbocharging 1 (in its stats)'],
'GMC Beachcraft Vacationer':[6,'hoverseal','basic living space'],'GMC Bulldog Step-Van (Standard)':[2,'carmor'],'GMC Bulldog Step-Van (BC Var.)':[2,'carmor'],
'GMC "Harpy Scout" LAV':[3,'','ejection seats'],'GMC MPUV':[3,'eport:1,pintle:1,spot:1','radio'],'GMC Riverine':[12,'ring:1'],
'GMC Riverine (Police Model)':[4,'fx_eh:1,ring:2','basic living space'],'GMC Riverine (Security Model)':[4,'rt_micro:2,tur_mini:1','basic living space'],
'GMC-Nissan Hovertruck':[3,''],'Goodyear Commuter-47':[9,''],'GTE-Ford Retrans Unit':[0,'','retransmission unit (Flux 3)'],'Harland & Wolff Classique':[12,'','high-end living space'],
'Harley Electroglide-1000':[1,'eport:1,fx_ef:2','radio'],'Harley-Davidson Scorpion':[2,''],'Hawker-Ridley HS-895 Skytruck':[42,''],
'Honda-GM 3220 ZX (Standard)':[4,''],'Honda-GM 3220 ZX (Turbo)':[4,'','turbocharging (in its stats)'],'Honda Viking':[2,'','reinforced seats; turbocharging (in its stats)'],
'Hughes Aerospace Airstar 2050':[11,'carmor','luxury fittings'],'Hughes WK-2 Stallion':[2,''],'Hyundai Offroader':[2,''],
'Integrated Weapon System DLK Mk 6 Utility Machine':[0,'arm:2'],'Integrated Weapon System DLK Mk 6 Utility Machine (Armed Variant)':[0,'fx_ef:1,arm:1'],
'Landrover Model 2046 (SW)':[6,''],'Landrover Model 2046 (LW)':[8,''],
'LAV-93 Devil Rat':[6,'amphib:1,eport:1,seal_gas,rt_small:1,baffle:1','telecom system'],'LAV-103 Striker Light Tank':[3,'amphib:1,eport:1,seal_gas,rt_med:1,baffle:1','telecom system'],
'Lear-Cessna Platinum I':[8,''],'Lear-Cessna Platinum II':[6,''],
'Leyland-Rover Transport/Electric (Open Tray)':[3,''],'Leyland-Rover Transport/Electric (Encl. Box)':[4,''],'Leyland-Rover Transport/Electric (Minibus)':[10,''],
'Leyland-Rover Transport/Gasoline (Open Tray)':[3,''],'Leyland-Rover Transport/Gasoline (Encl. Box)':[4,''],'Leyland-Rover Transport/Gasoline (Minibus)':[10,''],
'Leyland-Zil Tsarina (Elec.)':[2,''],'Leyland-Zil Tsarina (Meth.)':[2,''],'Lockheed C-260 Transport':[5,''],
'Lone Star "Black Mariah" USPTV':[4,'seal_gas,lifesup:1,tur_mini:2,baffle:1','life support is 12 man-hours'],'Lone Star Modified Ford Americar':[4,''],'Lone Star Modified Honda 3220ZX Turbo':[4,''],
'Lone Star Strato-9 Surveillance Drone':[0,'ecm:2,fx_eh:1','MMG with gas-vent 3 and 500 rounds on the hardpoint'],'Lone Star SWAT Hovertruck':[12,''],
'Luftschiffbau Zeppelin LZ-2049':[4,''],'Luftschiffbau Zeppelin LZ-2051-C':[4,''],'Marine Technologies Dolphin II':[6,'','living space'],'MCT-Nissan Roto-Drone':[0,''],
'Mesametric Kodiak Roadway Clearance System':[0,'','dozer blade, excavating shovel'],'Mitsubishi Nightsky':[8,'apps:8,carmor,rollbar,seal_gas,eport:1','satellite uplink, wet bar, climate control'],
'Mitsubishi Runabout':[1,''],'Moonlight Aerospace Avenger':[1,'fx_ef:2'],'Mostrans KVP-14T (Standard)':[2,''],'Mostrans KVP-14T (Pass.)':[11,''],'Nissan-Holden Brumby':[4,''],
'Nordkapp-Conestoga Bergen (Tractor)':[8,''],'Nordkapp-Conestoga Bergen (Trailer)':[2,''],
'Northrup Wasp (PRC-42B Variant)':[1,'eccm:1,rt_micro:1'],'Northrup Wasp (PRC-42F Variant)':[1,'eccm:1,rt_micro:1,ram:2'],
'Northrup Yellowjacket (PRC-44B Variant)':[1,'eccm:1,rt_mini:1'],'Northrup Yellowjacket (PRC-44F Variant)':[1,'eccm:1,rt_mini:1,ram:2'],
'Pratt & Whitney Sundowner Aerial Sprayer':[0,'','sprayer (50-liter tank)'],'Renault-Fiat Eurovan (Open Tray)':[2,''],'Renault-Fiat Eurovan (Encl. Cargo)':[2,''],'Renault-Fiat Eurovan (Camper)':[4,'','basic living space'],
'Renraku Arachnoid Mini-Drone':[0,''],'Rolls-Royce Phaeton':[11,'apps:11,carmor,rollbar,seal_gas,eport:1','satellite uplink'],
'Rolls-Royce Prairie Cat':[4,'apps:4,amphib:3,carmor,rollbar,eport:1','high-end living space for 4, satellite uplink'],'Saab Dynamit 778 TI':[3,'apps:3,rollbar','turbocharging (in its stats)'],
'Saab-Thyssen Bloodhound':[0,'amphib:2','chem/bio/radiation sensors, liquid sprayer'],'Samuvani Criscraft Otter':[6,''],'Sendanko Marlin':[4,''],'Shiawase Kanmushi Mechanical Crawler':[0,'','smart materials'],
'Sikorsky-Bell Microskimmer':[0,''],'Sikorsky-Bell Microskimmer II':[0,''],'Sikorsky-Bell Red Ranger':[2,'amphib:3'],'Steel Lynx Ground Combat Drone':[0,'rt_mini:1'],
'Surfstar Marine Seacop':[3,'eport:1,fx_ef:2,spot:1','radio'],'Suzuki Aurora':[1,''],'Suzuki Watersport (Elec.)':[1,''],'Suzuki Watersport (Gas)':[1,''],'Toyota Elite':[4,'apps:4,seal_gas'],
'Toyota MK-Guyver Search and Rescue Robot':[0,'arm:2','learning pool 2 (Search & Rescue)'],'Toyotacorp Gopher':[2,'rollbar'],'Thundercloud Pinto':[3,''],'Volkswagen Elektro':[1,''],
'Volkswagen Superkombi III (Flatbed)':[2,''],'Volkswagen Superkombi III (Pickup)':[2,''],'Volkswagen Superkombi III (Encl. Van)':[2,''],'Volkswagen Superkombi III (Commuter)':[8,''],'Volkswagen Superkombi III (RV)':[2,'','RV living space'],
'Yamaha Rapier':[1,''],'Zemlya-Poltava Swordsman (Standard)':[8,''],'Zemlya-Poltava Swordsman (Outboard)':[8,''],'Zemlya-Poltava Swordsman (Elec.)':[8,'']};
// Medium/heavy transports and tractors pay more for off-road suspension and thermal baffles (R2 p. 125, 130)
const TRANSPORT=new Set(['Ares Citymaster','Ares Mobmaster','Ares Roadmaster','Doc Wagon Citymaster Variant','Doc Wagon CRT Ambulance','GMC 4201','Lone Star "Black Mariah" USPTV']);
const TRACTOR=new Set(['Conestoga Trailblazer','Nordkapp-Conestoga Bergen (Tractor)']);
function facOf(str){const o={}; String(str||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(t=>{const [id,lv,opt]=t.split(':'); o[id]={lv:lv==null?0:+lv,opt};}); return o;}
function veh(n,cost,pg,r,type,drone){
  const h=String(r.H==null?'':r.H).split('/'); const sp=String(r.Sp==null?'':r.Sp).replace(/\(.*?\)/g,'').split('/').map(first);
  const cs=String(r.C==null?'':r.C).replace(/,/g,'').split('/'); const F=FACT[n]||null;
  return {n,cost:+cost||0,pg:pg||'',type:type||'car',drone:!!drone,H:first(h[0]),Hoff:h.length>1?first(h[1]):null,Sp:sp,Ac:dash(r.Ac)?0:first(r.Ac),B:first(r.B),A:first(r.A),Si:first(r.Si),
    Au:dash(r.Au)?0:first(r.Au),P:dash(r.P)?0:first(r.P),Se:dash(r.Se)?0:first(r.Se),C:first(cs[0]),C2:cs.length>1?first(cs[1]):null,L:first(r.L),
    raw:{Sp:String(r.Sp??''),Si:String(r.Si??''),H:String(r.H??''),C:String(r.C??'')},
    seats:F?F[0]:null,fac:Object.assign(dash(r.Se)||!first(r.Se)?{}:{sensor:{lv:first(r.Se),std:1}},F?facOf(F[1]):{}),other:F&&F[2]?F[2]:'',known:!!F,transport:TRANSPORT.has(n),tractor:TRACTOR.has(n)};
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
// drive-by-wire one-time bonus split: [Speed, Acceleration, Load] (R2 p. 124)
const DBW={Sp:[.1,0,0],Ac:[0,.1,0],L:[0,0,.1],SpAc:[.05,.05,0],SpL:[.05,0,.05],AcL:[0,.05,.05],all:[.03,.03,.04]};
// tires: id, label, Body × price each (R2 p. 146)
const TIRES=[['std','Standard',50],['perf','Performance',75],['off','Off-road',125],['dual','Dual-purpose',250],['std_rf','Standard runflat',50,1],['perf_rf','Performance runflat',75,1],['off_rf','Off-road runflat',125,1],['dual_rf','Dual-purpose runflat',250,1]];
const tireCost=(v,o)=>{const t=TIRES.find(x=>x[0]===o)||TIRES[0]; return v.B*t[2]+(t[3]?200:0);};
const BAFFLE={car:5000,tracked:5000,walker:5000,bike:6000,plane:7500,rotor:10000,hover:3750,boat:2500,lta:2500};
const bracket=(lv,a,b,c,d)=>lv<=3?a:lv<=6?b:lv<=9?c:d;
// mount points: hardpoint = 2 Body points, firmpoint = 1 (R2 p. 131)
const MOUNTPTS={mis_ext:1,mis_int:1,fx_eh:2,fx_ef:1,fx_ih:2,fx_if:1,pintle:1,ring:2,tur_mini:2,tur_small:4,tur_med:6,rt_micro:1,rt_mini:2,rt_small:4,rt_med:6};
const FIXED=['fx_eh','fx_ef','fx_ih','fx_if'], TURRETS=['tur_mini','tur_small','tur_med','rt_micro','rt_mini','rt_small','rt_med'];
const MIL='Security or military gear: needs the “security or military vehicle” switch (GM permission).';
// kind: flag (one), level (lv in min..max), qty (count). opt: extra choice list.
const M=[
 // ENGINE
 {id:'gridlink',g:'Engine',n:'GridLink power',pg:'R2 p. 121',kind:'flag',cost:()=>600,cf:()=>1,ok:(v,c)=>!GROUND.has(c.type)||v.drone?'Ground vehicles only, not drones':null,
  d:'Induction runners pick up power from coils under city streets, so an electric vehicle runs free in good neighborhoods (Security B or better) below the speed limit. Monthly charge: Body × 100¥ (bikes × 25, trucks × 250).'},
 {id:'nitro',g:'Engine',n:'Nitrous oxide injectors',pg:'R2 p. 121',kind:'level',min:1,max:()=>5,cost:(v,l)=>l*(l<=3?3500:7000),cf:()=>2,load:()=>15,
  d:'Adds dice equal to its level to Accelerating/Braking tests, or a burst to 2.5 × Speed. Holds up to 20 charges. Gasoline and diesel engines only. Cost read as level × the per-level price for that bracket.'},
 {id:'suncell',g:'Engine',n:'SunCell power',pg:'R2 p. 121',kind:'flag',cost:()=>500,cf:()=>1,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,
  d:'Solar panels charge an electric vehicle at Body × 25 PF per sunny hour (half in cloud, none at night). Electric engines only.'},
 {id:'turbo',g:'Engine',n:'Turbocharging / superconductive drive',pg:'R2 p. 122',kind:'level',min:1,max:v=>Math.max(1,Math.floor((Math.max(...v.Sp)*0.5)/15)),cost:(v,l)=>v.cost*1.1*l,
  ok:(v,c)=>AIR.has(c.type)?'Aircraft engines are already turbocharged':null,fx:(s,l)=>{s.Sp=s.Sp.map(x=>x+15*l);s.Ac+=10*l;s.Si-=l;},
  d:'Each level: +15 Speed, +10 Acceleration (as printed), −1 Signature, Economy × .95. Speed can go up to 1.5 × the original. Parts cost read as vehicle cost × 1.1 per level.'},
 // ENGINE CUSTOMIZATION
 {id:'eng_sp',g:'Engine',n:'Engine customization: Speed',pg:'R2 p. 120',kind:'level',gm:1,min:1,max:v=>Math.max(1,Math.floor(Math.max(...v.Sp)*0.5/30)),cost:()=>0,fx:(s,l)=>{s.Sp=s.Sp.map(x=>x+30*l);},
  d:'Re-engineers the engine past its limits: +30 Speed per level, up to 1.5 × the original Speed (with any turbocharging). Price: the original power plant’s cost × 1.25 for the first level, the multiplier rising .15 per extra level; the Vehicle List doesn’t give power plant costs, so your GM sets it. The GM secretly rolls for engine failure (Stress Points). 40 hours per level.'},
 {id:'eng_ac',g:'Engine',n:'Engine customization: Acceleration',pg:'R2 p. 120',kind:'level',gm:1,min:1,max:v=>Math.max(1,Math.floor((Math.ceil(v.Ac*1.75)-v.Ac)/2)),cost:()=>0,ok:v=>v.Ac<=0?'No Acceleration rating to raise':null,fx:(s,l)=>{s.Ac+=2*l;},
  d:'+2 Acceleration per level. The customization rules give no cap for Acceleration; this uses the design-rule cap of 1.75 × the original. Price set by your GM (see Speed).'},
 {id:'eng_ld',g:'Engine',n:'Engine customization: Load',pg:'R2 p. 120',kind:'level',gm:1,min:1,max:v=>v.B<1?0:Math.max(1,Math.floor((Math.ceil(v.L*1.75)-v.L)/(v.B*50))),cost:()=>0,ok:v=>v.B<1?'Body 1 or more':null,fx:(s,l,o,c)=>{s.Lbonus+=c.B*50*l;},
  d:'+Body × 50 kg Load per level. Uses the design-rule cap of 1.75 × the original Load. Price set by your GM (see Speed).'},
 {id:'mask',g:'Signature',n:'Active thermal masking',pg:'R2 p. 130',kind:'level',gm:1,min:1,max:(v,c)=>Math.min(2,c.lv('eng_sp')+c.lv('eng_ac')+c.lv('eng_ld')),cost:()=>0,cf:()=>3,load:()=>100,
  ok:(v,c)=>c.type==='bike'?'Not for motorcycle engines':(!(c.lv('eng_sp')+c.lv('eng_ac')+c.lv('eng_ld'))?'Needs engine customization (one masking level per customization level)':null),
  d:'A coolant system that soaks up engine heat: +1 Signature per level while running (up to +2), but −15 Speed per level and a run time of 60 − (level × 5) minutes, then 10 minutes venting at Signature 2. Gasoline, methane, diesel or jet engines only. Priced at 2 × the engine customization cost (+.25 per extra level), so your GM sets it. The stat tiles don’t include it because it only works while switched on.'},
 // CONTROL
 {id:'adjctl',g:'Control',n:'Adjusted controls',pg:'R2 p. 122',kind:'flag',opt:[['dwarf','Dwarf',2500],['troll','Troll',3500],['other','Other (disability)',3000]],cost:(v,l,o)=>({dwarf:2500,troll:3500,other:3000})[o||'dwarf'],
  ok:(v,c)=>v.drone?'Drones have no manual controls':(c.has('metavar')?'The metahuman-adjusted model includes them':null),d:'Controls sized for dwarfs or trolls. Without them a dwarf or troll driver takes +3 on driving tests; humans, elves and orks take +3 in an adjusted vehicle. Doesn’t matter when rigged in by datajack.'},
 {id:'autonav',g:'Control',n:'Autonav',pg:'R2 p. 122–123',kind:'level',min:v=>v.Au+1,max:()=>4,cost:(v,l)=>[0,500,1000,5000,15000][l],fx:(s,l)=>{s.Au=l;},
  ok:(v,c,l)=>v.drone?'Drones use their Pilot rating instead':(c.type==='bike'&&l>1&&!c.rigged?'Motorcycles take autonav above 1 only with rigger gear':null),
  d:'Extra dice on Driving Tests (but added to target numbers in combat). Rating 2+ can drive itself with Vehicle skill equal to its rating: 2 handles city roads, 3 rough terrain on a set route with GPS, 4 plans its own routes.'},
 {id:'cmc',g:'Control',n:'Contingency maneuver controls',pg:'R2 p. 124',kind:'level',min:1,max:()=>9,cost:(v,l)=>l*bracket(l,2500,5000,10000),cf:()=>2,load:()=>30,
  d:'Redundant wiring and backups: the vehicle ignores damage modifiers for that many boxes of damage. Doesn’t stop the vehicle being destroyed, and doesn’t help a rigger’s own wounds.'},
 {id:'datajack',g:'Control',n:'Datajack port',pg:'R2 p. 124',kind:'flag',cost:v=>v.type==='bike'?5000:2500,cf:()=>1,load:()=>15,ok:v=>v.drone?'Drones are run remotely':null,
  d:'Lets anyone with a datajack drive by rudimentary cybernetic command (+1 Reaction). A vehicle control rig needs full rigger adaptation for its bonuses.'},
 {id:'dbw',g:'Control',n:'Drive-by-wire',pg:'R2 p. 124',kind:'level',min:1,max:()=>3,cost:(v,l)=>v.cost*1.25*l,opt:[['Sp','+10% Speed'],['Ac','+10% Acceleration'],['L','+10% Load'],['SpAc','+5% Speed, +5% Acceleration'],['SpL','+5% Speed, +5% Load'],['AcL','+5% Acceleration, +5% Load'],['all','+3% Acceleration, +3% Speed, +4% Load']],
  ok:(v,c)=>c.has('ctlsurf')?'Can’t combine with improved control surfaces':c.has('susp')?'Can’t combine with improved suspension':null,
  fx:(s,l,o)=>{s.H-=l; if(s.Hoff!=null) s.Hoff-=l; const sp=DBW[o||'Sp']||DBW.Sp; if(sp[0]) s.Sp=s.Sp.map(x=>Math.round(x*(1+sp[0]))); if(sp[1]) s.Ac=Math.round(s.Ac*(1+sp[1])); if(sp[2]) s.Lbonus+=Math.round(s.L0*sp[2]);},
  d:'Computer steering: −1 Handling per level (up to −3) and a one-time +10% split across Speed, Acceleration and Load as you choose (it doesn’t grow with level). Needs performance or dual-purpose tires. Parts cost read as vehicle cost × 1.25 per level.'},
 {id:'ctlsurf',g:'Control',n:'Improved control surfaces',pg:'R2 p. 124–125',kind:'level',min:1,max:()=>2,cost:(v,l)=>v.cost*1.15*l,ok:(v,c)=>c.type!=='boat'?'Watercraft only':c.has('dbw')?'Can’t combine with drive-by-wire':null,
  fx:(s,l)=>{s.H-=l;},d:'Better rudders and control surfaces: −1 Handling per increment, up to −2.'},
 {id:'susp',g:'Control',n:'Improved suspension',pg:'R2 p. 125',kind:'level',min:1,max:()=>2,cost:(v,l)=>v.cost*1.10*l,ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled ground vehicles only':c.has('dbw')?'Can’t combine with drive-by-wire':null,
  fx:(s,l,o,c)=>{s.H-=l; if(s.Hoff!=null&&c.type==='bike') s.Hoff-=l;},d:'−1 on-road Handling per level, up to −2 (bikes improve off-road too). Needs performance or dual-purpose tires.'},
 {id:'offroad',g:'Control',n:'Off-road suspension',pg:'R2 p. 125',kind:'level',min:1,max:()=>2,cost:(v,l,o,c)=>v.cost*(c.type==='bike'?1.2:(v.transport||v.tractor)?1.5:1.35)*l,ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled ground vehicles only':null,
  fx:(s,l)=>{ if(s.Hoff!=null) s.Hoff-=l; s.H+=l; s.Sp=s.Sp.map(x=>Math.max(0,x-15));},d:'Each level: −1 off-road Handling, +1 on-road Handling; −15 Speed whatever the level; worse Economy. Needs off-road or dual-purpose tires. Medium/heavy transports and tractors pay × 1.5 per level.'},
 {id:'rciface',g:'Control',n:'Remote control interface',pg:'R2 p. 125–126',kind:'flag',cost:v=>2500*v.B,ok:(v,c)=>v.drone?'Drones already have one':c.facRC?'Already fitted (factory)':null,fx:s=>{s.P=Math.max(s.P,1);},
  d:'Lets a rigger run the vehicle over a remote control network and gives it Pilot 1.'},
 {id:'pilot',g:'Control',n:'Remote pilot programming',pg:'R2 p. 126',kind:'level',min:v=>Math.max(2,v.P+1),max:()=>5,cost:(v,l)=>[0,0,5000,25000,500000,2500000][l],ok:(v,c,l)=>!c.hasRC?'Needs a remote control interface':(l>=4&&!c.mil?MIL:null),fx:(s,l)=>{s.P=l;},
  d:'Raises the Pilot rating: 2 is the best the public can buy, 3 is gray market, 4 security grade, 5 military grade (battle-savvy autonomy).'},
 {id:'rigger',g:'Control',n:'Rigger adaptation',pg:'R2 p. 126',kind:'flag',cost:()=>2800,cf:()=>1,load:()=>10,ok:(v,c)=>v.drone?'Drones already have it':c.facRig?'Already fitted (factory)':(!c.has('datajack')&&!c.hasRC?'Needs a datajack port or remote control interface':(c.sens<1?'Needs Sensor 1 or better: add a Sensor upgrade first (Electronics; R2 p. 126)':null)),
  d:'The “black box” that lets a vehicle control rig drive it: full Control Pool and the rig’s Reaction and Initiative bonuses. Book lists 2,800¥ (and 2,500¥ again lower down); 2,800¥ used.'},
 {id:'secctl',g:'Control',n:'Secondary controls',pg:'R2 p. 126–127',kind:'flag',cost:()=>400,cf:()=>2,ok:(v,c)=>v.drone?'Drones have no cockpit':c.type==='bike'?'Not for motorcycles':null,d:'Co-pilot controls slaved to the main ones.'},
 // PROTECTION
 {id:'armor',g:'Protection',n:'Standard armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>40,cost:(v,l)=>1250*l,load:(v,l)=>v.B*v.B*5*l,ok:(v,c)=>c.has('carmor')?'Can’t combine with concealed armor':null,fx:(s,l)=>{s.A+=l; s.addArm+=l;},
  d:'+1 Armor per point. Each point weighs Body × Body × 5 kg against Load; every 6 points added worsens Handling by 1.'},
 {id:'carmor',g:'Protection',n:'Concealed armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>40,cost:(v,l)=>2000*l,cf:(v,l)=>3*l,load:(v,l)=>v.B*v.B*5*l,ok:(v,c)=>c.has('armor')?'Can’t combine with standard armor':null,fx:(s,l)=>{s.A+=l; s.addArm+=l;},
  d:'Armor hidden in the interior: spotting it takes a Perception Test against 9 − Armor ÷ 3. Costs 3 CF per point plus the same weight as standard armor.'},
 {id:'ablative',g:'Protection',n:'Ablative armor',pg:'R2 p. 127',kind:'level',min:1,max:v=>Math.min(3,Math.floor(v.B/2)),cost:(v,l)=>[0,700,1600,2500][l],load:v=>v.B*100,ok:(v,c)=>AIR.has(c.type)?'Not for aircraft':null,fx:(s,l)=>{s.A+=2*l;},
  d:'Plates that blow off to deflect hits: +2 Armor per level, up to the vehicle’s Body. Loses a level whenever a hit’s Power is over 3 × the Armor. Weighs Body × 100 kg whatever the level; marks the vehicle as security grade.'},
 {id:'apps',g:'Protection',n:'APPS (per seat)',pg:'R2 p. 128',kind:'qty',min:1,max:v=>v.seats==null?12:v.seats,cost:(v,l)=>2500*l,cf:()=>1,ok:(v,c)=>v.drone?'No passengers in a drone':c.type==='bike'?'Not for motorcycles':null,
  d:'Secured belts, air bags and reinforced panels: halves the Power of crash damage. Getting out after a crash takes a Strength (5) Test.'},
 {id:'cage',g:'Protection',n:'Crash cage',pg:'R2 p. 128',kind:'flag',cost:()=>3500,cf:()=>2,load:()=>25,ok:(v,c)=>v.drone?'No passengers in a drone':c.type==='bike'?'Not for motorcycles':null,d:'Cushioned cabin: +6 dice for occupants’ Damage Resistance Tests in a crash.'},
 {id:'seal_gas',g:'Protection',n:'EnviroSeal: gas seal',pg:'R2 p. 128',kind:'flag',cost:v=>250*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Gas-tight cabin. Opening a door breaks the seal; Light damage breaches it (5¥ patches fix that). No life support on its own.'},
 {id:'seal_water',g:'Protection',n:'EnviroSeal: water seal',pg:'R2 p. 128',kind:'flag',cost:v=>750*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Watertight cabin for submerged running. The engine needs its own seal for underwater operation.'},
 {id:'seal_eng',g:'Protection',n:'EnviroSeal: engine seal',pg:'R2 p. 128',kind:'flag',cost:v=>1000*v.B,ok:(v,c)=>c.type==='bike'?'Not for motorcycles':null,d:'Seals the engine compartment for submarine work.'},
 {id:'seal_op',g:'Protection',n:'Cabin overpressurization',pg:'R2 p. 128',kind:'flag',cost:v=>5000*v.B,cf:()=>1,load:()=>15,ok:(v,c)=>!(c.has('seal_gas')||c.has('seal_water'))?'Needs a gas or water seal':null,d:'Pumps keep outside contaminants out even with a door open or a light breach. Fails underwater or at Moderate damage.'},
 {id:'lifesup',g:'Protection',n:'Life support (10 man-hours each)',pg:'R2 p. 128–129',kind:'qty',min:1,max:()=>50,cost:(v,l)=>500+1000*l,cf:(v,l)=>l,load:(v,l)=>25*l,ok:(v,c)=>v.drone?'No passengers in a drone':!(c.has('seal_gas')||c.has('seal_water'))?'Needs a sealed cabin: add an EnviroSeal (gas or water seal) first':null,
  d:'Oxygen and climate control for a sealed cabin: each block is 10 man-hours (10 hours for one, 5 for two…). 500¥ plus 100¥ per man-hour.'},
 {id:'rollbar',g:'Protection',n:'Roll bars',pg:'R2 p. 129',kind:'flag',cost:()=>2000,d:'Rigidity for crashes: removes the rag-top double damage penalty, or +3 dice for hard-top occupants. Required for some roof mounts on civilian vehicles.'},
 {id:'sas',g:'Protection',n:'Smart armor system (SAS)',pg:'R2 p. 129–130',kind:'flag',cost:()=>20000,cf:(v,l,o,c)=>3*c.armor,load:(v,l,o,c)=>v.B*50*c.armor,ok:(v,c)=>v.B<4?'Body 4 or more':(!c.mil?MIL:(c.armor<1?'Needs some Armor to back':null)),
  d:'Explosive cells that stage incoming damage down a level when 2D6 beats the activation number (3, +1 per hit). Takes 3 CF and Body × 50 kg per point of Armor. Not on the street.'},
 // SIGNATURE
 {id:'baffle',g:'Signature',n:'Thermal baffles',pg:'R2 p. 130',kind:'level',min:1,max:()=>2,cost:(v,l,o,c)=>v.B*(v.tractor?10000:v.transport?7500:(BAFFLE[c.type]||5000))*l,cf:(v,l)=>3*l,load:(v,l)=>v.B*50*l,fx:(s,l)=>{s.Si+=l;},
  d:'Heat-absorbing materials: +1 Signature per level (up to +2) against thermographic sensors. Gasoline, methane, diesel or jet engines only.'},
 {id:'ram',g:'Signature',n:'Radar-absorbent materials',pg:'R2 p. 130–131',kind:'level',min:1,max:()=>3,cost:(v,l)=>l*l*l*25000,ok:(v,c)=>!c.mil?MIL:null,fx:(s,l)=>{s.Si+=l;},d:'Radar-eating coatings: +1 Signature per level, up to +3. Military only.'},
 // WEAPON MOUNTS
 {id:'fx_eh',g:'Weapon mounts',n:'Fixed mount, external hardpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>2000*l,cf:(v,l)=>2*l,load:(v,l)=>10*l,d:'A heavy weapon fixed facing one way (aim by steering). Halves recoil; heavy weapons (MMG and up) need a hardpoint. External mounts cut Signature by 1. Add the weapon’s weight to Load yourself.'},
 {id:'fx_ef',g:'Weapon mounts',n:'Fixed mount, external firmpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>750*l,cf:(v,l)=>l,load:(v,l)=>10*l,d:'Fixed mount for LMGs and small arms. External mounts cut Signature by 1. Add the weapon’s weight to Load.'},
 {id:'fx_ih',g:'Weapon mounts',n:'Fixed mount, internal hardpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>3000*l,cf:(v,l)=>7*l,load:(v,l)=>10*l,d:'Hidden heavy mount behind the vehicle’s armor; extending or stowing it is a Complex Action and lowers Signature by 1 while out.'},
 {id:'fx_if',g:'Weapon mounts',n:'Fixed mount, internal firmpoint',pg:'R2 p. 131–132',kind:'qty',min:1,max:()=>8,cost:(v,l)=>1500*l,cf:(v,l)=>5*l,load:(v,l)=>10*l,d:'Hidden small-arms mount behind the armor; Complex Action to extend or stow.'},
 {id:'pintle',g:'Weapon mounts',n:'Pintle mount',pg:'R2 p. 133',kind:'qty',min:1,max:()=>8,cost:(v,l)=>50*l,ok:v=>v.drone?'Can’t be run remotely, so not on drones':null,d:'A reinforced swivel for any firmpoint weapon: 60° side to side, 30° up and down, 2 points of recoil compensation. Counts as a firmpoint.'},
 {id:'ring',g:'Weapon mounts',n:'Ring mount',pg:'R2 p. 133–134',kind:'qty',min:1,max:()=>4,opt:v=>v.type==='rotor'?[['std','Roof ring'],['door','Door gun (16 CF)']]:null,cost:(v,l)=>3000*l,cf:(v,l,o)=>(o==='door'?16:1)*l,load:(v,l)=>25*l,ok:(v,c)=>v.drone?'Can’t be run remotely, so not on drones':(c.has('convtop')&&!c.has('rollbar')?'A rag-top needs roll bars first':null),d:'A full-circle ring for a gunner standing in the vehicle: man-portable heavy weapons and LMGs, 6 points of recoil compensation. Counts as a hardpoint; hardtops, or open tops with roll bars. On a helicopter it’s a door gun (16 CF, the door has to be open to fire).'},
 {id:'tur_mini',g:'Weapon mounts',n:'Turret, mini (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>5000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?8:o==='pop'?14:7),load:(v,l)=>25*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil&&!c.has('rollbar')?'Civilian vehicles need roll bars first':null),
  d:'Armored, motorized ring mount: 360°, Weapon Value 2 (an SMG or rifle is 1, an LMG 1.5). Takes 1 hardpoint, cuts Signature by 1. Anti-aircraft costs × 1.5 and +1 CF; pop-up doubles CF.'},
 {id:'tur_small',g:'Weapon mounts',n:'Turret, small (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>7500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?9:o==='pop'?16:8),load:(v,l)=>100*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil&&!c.has('rollbar')?'Civilian vehicles need roll bars first':null),
  d:'Weapon Value 3 (a medium or heavy machine gun is 2), 2 CF of extra space inside. Takes 2 hardpoints, cuts Signature by 1.'},
 {id:'tur_med',g:'Weapon mounts',n:'Turret, medium (manned)',pg:'R2 p. 134–135',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>15000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?25:o==='pop'?48:24),load:(v,l)=>1000*l,ok:(v,c)=>v.drone?'Manned turrets need a gunner aboard':(!c.mil?MIL:null),
  d:'Weapon Value 6 (an assault cannon is 3), 4 CF and seating for two inside. Takes 3 hardpoints, cuts Signature by 1. Military only.'},
 {id:'rt_micro',g:'Weapon mounts',n:'Remote turret, micro',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden until used)']],cost:(v,l,o)=>2500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?2:o==='pop'?2:1),load:(v,l)=>10*l,
  d:'Weapons-only turret run from inside or by a rigger: Weapon Value 1 (one SMG or rifle; Weapon Values Table, R2 p. 135), takes 1 firmpoint, cuts Signature by 1. Standard on smaller drones.'},
 {id:'rt_mini',g:'Weapon mounts',n:'Remote turret, mini',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>6000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?5:o==='pop'?8:4),load:(v,l)=>25*l,
  d:'Remote turret, Weapon Value 2 (two SMGs or rifles, or one light, medium or heavy machine gun), takes 1 hardpoint, cuts Signature by 1.'},
 {id:'rt_small',g:'Weapon mounts',n:'Remote turret, small',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>9000*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?6:o==='pop'?10:5),load:(v,l)=>100*l,
  d:'Remote turret, Weapon Value 3 (e.g. an assault cannon or autocannon, or an LMG plus an SMG), takes 2 hardpoints, cuts Signature by 1.'},
 {id:'rt_med',g:'Weapon mounts',n:'Remote turret, medium',pg:'R2 p. 135–136',kind:'qty',min:1,max:()=>4,opt:[['std','Standard'],['aa','Anti-aircraft'],['pop','Pop-up (hidden; Weapon Value −1)']],cost:(v,l,o)=>17500*l*(o==='aa'?1.5:1),cf:(v,l,o)=>l*(o==='aa'?9:o==='pop'?16:8),load:(v,l)=>1000*l,ok:(v,c)=>!c.mil?MIL:null,
  d:'Remote turret, Weapon Value 6 (e.g. two assault cannons), takes 3 hardpoints, cuts Signature by 1. Military only.'},
 {id:'mis_ext',g:'Weapon mounts',n:'Missile/rocket mount, external',pg:'R2 p. 133',kind:'qty',min:1,max:v=>Math.max(1,v.B),cost:(v,l)=>750*l,cf:(v,l)=>l,load:(v,l)=>10*l,
  ok:(v,c)=>v.B<1?'Body 1 or more':(GROUND.has(c.type)&&!c.mil&&!c.has('rollbar')?'Civilian ground vehicles need roll bars first':null),
  d:'On ground vehicles, a roof-rack launcher on one firmpoint carrying up to Body missiles, −1 Signature however many. Aircraft take up to Body pylons under the wings and fuselage (they don’t use firmpoints), each holding up to 300 kg, −1 Signature per two pylons. Add the missiles’ weight to Load yourself. Rigger 2 gives no separate price, so it’s priced as an external firmpoint (750¥, 1 CF, 10 kg); check with your GM.'},
 {id:'mis_int',g:'Weapon mounts',n:'Missile/rocket mount, internal',pg:'R2 p. 133',kind:'qty',min:1,max:(v,c)=>AIR.has(c.type)?Math.max(1,Math.floor(v.B/2)):Math.max(1,v.B),opt:()=>[2,4,6,8].map(x=>[String(x),x+' missiles stored']),
  cost:(v,l)=>1500*l,cf:(v,l,o)=>l*(2+1.5*(+o||2)),load:(v,l)=>10*l,ok:v=>v.B<1?'Body 1 or more':null,
  d:'A hidden launcher bay on one firmpoint, behind the armor; no Signature change until armed (−1 while armed, Complex Action to arm or stow). Storage takes 3 CF per 2 missiles plus 2 CF for the actuators. Aircraft take up to half their Body. Priced as an internal firmpoint (1,500¥); Rigger 2 gives no separate price, so check with your GM.'},
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
 {id:'ecm',up:'replace',g:'Electronics',n:'ECM',pg:'R2 p. 137',kind:'level',min:1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_ECM[l][0],cf:(v,l)=>T_ECM[l][1],load:(v,l)=>T_ECM[l][2],d:'Jammers, chaff and flares that confound sensors and remote control signals (see R2 p. 31). Levels 1–4 can be bought on the street; 5+ is security or military.'},
 {id:'eccm',up:'replace',g:'Electronics',n:'ECCM',pg:'R2 p. 137–138',kind:'level',min:1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_ECCM[l][0],cf:(v,l)=>T_ECCM[l][1],load:(v,l)=>T_ECCM[l][2],d:'Amplifiers and filters that cut through ECM. Levels 1 and 3 corrected to 10,000¥ and 50,000¥: the book prints 110,000¥ and 350,000¥, which break the table’s 100¥-per-Design-Point pattern (R2 p. 138). Level 8 is printed “2.5¥” (2.5M¥).'},
 {id:'ed',up:'replace',g:'Electronics',n:'Electronic deception',pg:'R2 p. 138',kind:'level',min:1,max:()=>6,cost:(v,l)=>T_ED[l][0],cf:(v,l)=>T_ED[l][1],load:(v,l)=>T_ED[l][2],ok:(v,c)=>!c.mil?MIL:null,d:'Feeds enemy sensors false range, position and heading. Security and military only.'},
 {id:'ecd',up:'replace',g:'Electronics',n:'Electronic counter-deception',pg:'R2 p. 138–139',kind:'level',min:1,max:()=>6,cost:(v,l)=>T_ECD[l][0],cf:(v,l)=>T_ECD[l][1],load:(v,l)=>T_ECD[l][2],ok:(v,c)=>!c.mil?MIL:null,d:'Reality-checking gear that negates electronic deception. Security and military only.'},
 {id:'eport',g:'Electronics',n:'Electronics port',pg:'R2 p. 138–139',kind:'qty',min:1,max:()=>8,cost:(v,l)=>1000*l,cf:(v,l)=>l,d:'Powers a radio, camera, RC deck and the like from the vehicle; attached devices get +½ Body to their Flux Rating. Add the device’s own cost and weight.'},
 {id:'amp',g:'Electronics',n:'Power amplifier',pg:'R2 p. 139',kind:'level',min:1,max:()=>10,cost:(v,l)=>250*l,cf:(v,l)=>Math.ceil(l/2),load:(v,l)=>l,d:'+1 Flux Rating per level for sensors, ECM, ECCM or a hardwired RC deck: more range, harder to jam.'},
 {id:'sensor',up:'replace',g:'Electronics',n:'Sensor upgrade',pg:'R2 p. 139–140',kind:'level',min:v=>v.Se+1,max:(v,c)=>c.mil?10:4,cost:(v,l)=>T_SEN[l][0],cf:(v,l)=>T_SEN[l][1],load:(v,l)=>T_SEN[l][2],fx:(s,l)=>{s.Se=l;},d:'Better audio/video, thermal, radar and tracking: sets the Sensor rating. Levels 5+ are security or military grade.'},
 // SEATS
 {id:'seat_rm',g:'Seats',n:'Remove seats',pg:'R2 p. 142',kind:'qty',min:1,max:v=>Math.max(0,(v.seats??0)-1),opt:[['bucket','Bucket seats (+6 CF, +100 kg Load each)'],['bench','Bench seats (+6 CF, +150 kg Load each)']],cost:()=>0,
  ok:v=>v.drone||!v.seats||v.seats<2?'No passenger seats to remove':null,fx:(s,l,o)=>{s.Cplus+=6*l; s.Lbonus+=(o==='bench'?150:100)*l;},
  d:'Taking out a seat frees 6 CF and raises Load (100 kg for a bucket seat, 150 kg for a bench), because the vehicle carries fewer passengers. Pick the kind your vehicle has (see its seating). The driver’s seat stays.'},
 {id:'seat_squeeze',g:'Seats',n:'Squeeze gear into leg room',pg:'R2 p. 118',kind:'qty',min:1,max:(v,c)=>Math.max(0,(v.seats??0)-1-c.lv('seat_rm')),cost:()=>0,ok:v=>v.drone||!v.seats||v.seats<2?'No passenger seats':null,fx:(s,l)=>{s.Cplus+=Math.floor(1.5*l);},
  d:'Scrapes 1.5 CF (rounded down overall) per passenger seat from leg and head room. Cramped: +3 to crash and collision Damage Resistance target numbers, passengers resist 4L Stun every round of vehicle combat, and traffic cops notice the non-standard fit-out.'},
 {id:'seat_reinf',g:'Seats',n:'Reinforced seats (troll and ork sized)',pg:'R2 p. 142–143',kind:'qty',min:1,max:(v,c)=>Math.max(0,(v.seats??0)-c.lv('seat_rm')),opt:[['bucket','Bucket, holds 250 kg'],['bench','Bench, holds 300 kg']],cost:(v,l)=>1500*l,cf:(v,l)=>2*l,load:(v,l)=>150*l,
  ok:(v,c)=>v.drone||!v.seats?'No seats':(c.has('metavar')?'The metahuman-adjusted model already has them':null),
  d:'Replaces standard seats so a troll doesn’t crush them (otherwise 4L damage each combat turn and +2 on collision resistance tests). Each replacement takes 2 more CF and 150 kg more Load. Bucket seats can be built stronger: +100¥ per extra 25 kg (add it yourself).'},
 {id:'seat_armor',g:'Seats',n:'Seat armor (per point)',pg:'R2 p. 142',kind:'qty',min:1,max:(v,c)=>Math.max(0,2*((v.seats??0)-c.lv('seat_rm'))),cost:(v,l)=>1250*l,ok:v=>v.drone||!v.seats?'No seats':null,
  d:'Up to 2 points per seat. On a bucket seat it works as ballistic or impact armor against side and rear attacks on the occupant; on a bench, rear attacks only.'},
 {id:'seat_eject',g:'Seats',n:'Ejection bucket seats',pg:'R2 p. 142',kind:'qty',min:1,max:(v,c)=>Math.max(0,(v.seats??0)-c.lv('seat_rm')),opt:[['std','Standard (3,000¥)'],['reinf','Reinforced for trolls (6,000¥)']],cost:(v,l,o)=>l*(o==='reinf'?6000:3000),cf:(v,l)=>l,load:(v,l,o)=>l*(o==='reinf'?160:10),
  ok:v=>v.drone||!v.seats?'No seats':null,d:'A bucket seat with a small rocket, stabilizers and a para-sail; includes the blow-out panels. Replacing a standard bucket seat costs 1 more CF and 10 kg more Load (160 kg reinforced).'},
 {id:'metavar',g:'Seats',n:'Metahuman-adjusted model',pg:'R2 p. 142–143',kind:'flag',cost:v=>1200*(v.seats||0),ok:(v,c)=>v.drone||!v.seats?'No seats':(c.has('adjctl')?'Includes adjusted controls already; remove those first':(c.has('seat_reinf')?'Remove the reinforced-seat swap first':null)),
  d:'The factory variant with every seat reinforced and the manual controls resized: 1,200¥ per seat. It costs more than swapping seats yourself because the maker also retunes performance for the heavier crew, so no CF or Load is lost. Harder to find where metahumans aren’t welcome.'},
 // MISC
 {id:'droptank',g:'Accessories',n:'Aircraft drop tanks (pairs)',pg:'R2 p. 140',kind:'qty',min:1,max:v=>Math.max(1,Math.floor(v.B/2)),cost:(v,l)=>8000*l,ok:(v,c)=>!(c.type==='plane'||c.type==='rotor')?'Aircraft only':null,fx:(s,l)=>{s.Sp=s.Sp.map(x=>Math.max(0,x-15*l)); s.Si-=1; s.H+=Math.floor(l/2);},
  d:'1,000 liters each, in pairs, in place of two external missile mounts per pair. −1 Signature, −15 Speed per pair, +1 Handling per two pairs. Can be jettisoned.'},
 {id:'amphib',up:'replace',g:'Accessories',n:'Amphibious package',pg:'R2 p. 140–141',kind:'level',min:1,max:()=>3,cost:(v,l)=>[0,2500,7500,15000][l],cf:(v,l)=>[0,0,2,4][l],ok:(v,c,l)=>!GROUND.has(c.type)||c.type==='bike'?'Ground vehicles only':(l===1&&c.type!=='car'?'Level 1 uses the wheels: wheeled vehicles only':null),
  d:'Level 1: wheels paddle at 15 m/turn, +2 Handling. Level 2: propeller, water Speed 30. Level 3: water-jets, water Speed 45. With seals and life support it can go under.'},
 {id:'antitheft',up:'replace',g:'Accessories',n:'Anti-theft system',pg:'R2 p. 141',kind:'level',min:1,max:()=>10,opt:[['none','No shock'],['shock','Standard shock system (+2,000¥)']],cost:(v,l,o)=>l*bracket(l,100,400,1000,5000)+(o==='shock'?2000:0),
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
 {id:'tires',g:'Accessories',n:'Tires (per tire)',pg:'R2 p. 146',kind:'qty',min:1,max:(v,c)=>c.type==='bike'?2:18,opt:()=>TIRES.map(t=>[t[0],t[1]]),cost:(v,l,o)=>l*tireCost(v,o),ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled vehicles only':null,
  d:'Every vehicle comes with suitable tires. Standard tires halve any suspension or Handling modification. Performance tires (or dual-purpose) are needed for improved suspension and drive-by-wire; off-road tires for off-road suspension. Rigger 2 assumes a vehicle with improved suspension or drive-by-wire already has dual-purpose tires. Runflats give 5/3 armor-vest protection. Price: Body × 50/75/125/250¥ each (+200¥ runflat).'},
 {id:'spare',g:'Accessories',n:'Spare tire',pg:'R2 p. 146',kind:'qty',min:1,max:()=>2,opt:()=>TIRES.map(t=>[t[0],t[1]]),cost:(v,l,o)=>l*tireCost(v,o),cf:(v,l)=>l*Math.floor(v.B/2),ok:(v,c)=>!WHEELED.has(c.type)?'Wheeled vehicles only':null,
  d:'Each spare takes CF equal to half the vehicle’s Body (rounded down).'},
 {id:'winch',g:'Accessories',n:'Winch',pg:'R2 p. 146',kind:'flag',opt:v=>CAPS.filter(x=>x<=capMax(WINCH,v.B)).map(x=>[String(x),fmtN(x)+' kg']),cost:(v,l,o)=>75*(+o||5),cf:()=>1,load:v=>v.B*2.5,ok:(v,c)=>!GROUND.has(c.type)?'Ground vehicles only':null,
  d:'Bumper winch to pull, tow or haul the vehicle up a cliff at 1 m/turn. Capacity up to the Winch Capacity Table for the Body; 75¥ per kg.'},
];
const BY=Object.fromEntries(M.map(m=>[m.id,m]));
const optsOf=(d,v)=>typeof d.opt==='function'?d.opt(v):d.opt;
const facLv=(v,id)=>v&&v.fac&&v.fac[id]?v.fac[id].lv:0, hasFac=(v,id)=>!!(v&&v.fac&&v.fac[id]);
function ctxOf(v,b){
  const mod=id=>b.mods.find(m=>m.id===id);
  const has=id=>!!mod(id)||hasFac(v,id);
  // qty kinds add factory and bought counts; level kinds take the higher (a bought level replaces or extends the factory one)
  const lv=id=>{const m=mod(id),d=BY[id],f=facLv(v,id),x=m?(d&&d.kind==='flag'?1:m.lv):0; return d&&d.kind==='qty'?f+x:Math.max(f,x);};
  const opt=id=>{const m=mod(id); return m?m.opt:(v.fac&&v.fac[id]?v.fac[id].opt:null);};
  const type=b.type||v.type, mil=!!b.mil, facRC=!!b.facRC, facRig=!!b.facRig;
  const hasRC=v.drone||facRC||has('rciface');
  const pilot=Math.max(v.P,hasRC?1:0,lv('pilot'));
  const sens=Math.max(v.Se,lv('sensor'));
  const mountsN=[...FIXED,...TURRETS].reduce((a,k)=>a+lv(k),0);
  const rmax=Math.max(lv('fx_ef')||lv('fx_if')||lv('rt_micro')?4:0,lv('tur_mini')||lv('rt_mini')?6:0,lv('tur_small')||lv('rt_small')||lv('fx_eh')||lv('fx_ih')?9:0,lv('tur_med')||lv('rt_med')?12:0);
  const bought=id=>{const m=mod(id); return m?m.lv:0;};
  const armor=v.A+bought('armor')+bought('carmor')+2*bought('ablative');
  return {has,lv,opt,bought,type,mil,facRC,facRig,hasRC,pilot,sens,mountsN,recoilMax:rmax,armor,B:v.B,rigged:v.drone||facRig||has('rigger')};
}
function minLv(d,v,c){ if(d.kind==='flag') return 1; const base=typeof d.min==='function'?d.min(v,c):(d.min||1);
  return d.kind==='level'&&hasFac(v,d.id)?Math.max(base,facLv(v,d.id)+1):base;}
function maxLv(d,v,c){ if(d.kind==='flag') return 1; const mx=d.max(v,c); return d.kind==='qty'?mx-facLv(v,d.id):mx;}
function calc(v,b){
  const c=ctxOf(v,b), bad=[], rows=[];
  const s={H:v.H,Hoff:v.Hoff,Sp:v.Sp.slice(),Ac:v.Ac,B:v.B,A:v.A,Si:v.Si,Au:v.Au,P:v.P,Se:v.Se,L0:v.L,Lbonus:0,Cplus:0,Cext:0,addArm:0};
  let cost=0,cf=0,load=0,sealCF=false; const seen=new Set(), gm=[];
  b.mods.forEach(m=>{const d=BY[m.id]; if(!d){bad.push('Unknown modification');return;}
    if(seen.has(m.id)) bad.push(d.n+' is listed twice'); seen.add(m.id);
    if(d.kind==='flag'&&hasFac(v,m.id)) bad.push(d.n+': already fitted at the factory');
    const l=d.kind==='flag'?1:m.lv, mn=minLv(d,v,c), mx=maxLv(d,v,c);
    if(d.kind!=='flag'&&(!(l>=mn)||!(l<=mx)||l!==Math.floor(l))) bad.push(`${d.n} ${l} is outside ${mn}–${mx}`);
    const os=optsOf(d,v); if(os&&os.length&&!os.some(o=>o[0]===m.opt)) bad.push(d.n+': pick an option');
    const why=d.ok?d.ok(v,c,l):null; if(why) bad.push(d.n+': '+why);
    // a factory level already sits in the listed Cargo and Load: "replace" upgrades pay the new level and the extra space;
    // incremental ones (armor-like) pay only for the levels added
    // a factory level is already in the listed Cargo, Load and stats. Replacement systems (ECM, sensors, packages) cost the
    // full price of the new level; incremental ones (RAM, baffles) cost the difference. Either way only the extra space counts.
    const f=d.kind==='level'?facLv(v,m.id):0, rep=d.up==='replace';
    const at=(fn,x)=>fn&&x>0?fn(v,x,m.opt,c):0;
    let co=Math.round(at(d.cost,l)-(f&&!rep?at(d.cost,f):0)), fcf=at(d.cf,l)-at(d.cf,f), ld=at(d.load,l)-at(d.load,f);
    fcf=Math.max(0,fcf); ld=Math.max(0,ld);
    if(/^seal_(gas|water|eng)$/.test(m.id)){fcf=sealCF||['seal_gas','seal_water','seal_eng'].some(k=>hasFac(v,k))?0:1; sealCF=true;}
    if(d.gm) gm.push(d.n);
    cost+=co; cf+=fcf; load+=ld;
    if(d.fx) d.fx(s,f&&!rep?l-f:l,m.opt,c);
    rows.push({m,d,l,cost:co,cf:fcf,load:ld,fac:f});
  });
  // aircraft missile pylons have their own cap (Body) instead of using firmpoints (R2 p. 133)
  const pts=Object.keys(MOUNTPTS).reduce((a,k)=>a+(k==='mis_ext'&&AIR.has(c.type)?0:MOUNTPTS[k]*c.lv(k)),0);
  // armor handling penalty: +1 per 6 points added (R2 p. 127)
  s.H+=Math.floor(s.addArm/6); if(s.Hoff!=null) s.Hoff+=Math.floor(s.addArm/6);
  // signature: new kinds of external mount each cut it by 1; factory ones are already in the listed Signature (R2 p. 131–135)
  const newKind=ids=>ids.some(k=>c.bought(k))&&!ids.some(k=>facLv(v,k));
  if(newKind(['fx_eh','fx_ef'])) s.Si-=1;
  if(TURRETS.some(k=>c.bought(k)&&c.opt(k)!=='pop')&&!TURRETS.some(k=>facLv(v,k))) s.Si-=1;
  if(c.bought('mis_ext')){ if(AIR.has(c.type)) s.Si-=Math.floor(c.lv('mis_ext')/2)-Math.floor(facLv(v,'mis_ext')/2); else if(!facLv(v,'mis_ext')) s.Si-=1; }
  // Speed: turbocharging and engine customization share the 1.5 × cap (R2 p. 120, 122); one level is always allowed
  const spGain=15*c.bought('turbo')+30*c.bought('eng_sp'), spCap=Math.max(Math.floor(Math.max(...v.Sp)*0.5),c.bought('eng_sp')?30:15);
  if(c.bought('turbo')&&c.bought('eng_sp')&&spGain>spCap) bad.push(`Speed: turbocharging and engine customization add ${spGain}; the cap is ${spCap} (1.5 × Speed, R2 p. 120–122)`);
  s.mask=c.lv('mask')||0;   // active thermal masking only counts while switched on (R2 p. 130), so it's shown beside Signature, not in it
  const Cmax=v.C+s.Cplus, Lmax=v.L+s.Lbonus;
  if(cf>Cmax+1e-9) bad.push(`Cargo space: needs ${fmtN(cf)} CF, the vehicle has ${fmtN(Cmax)} (R2 p. 120)`);
  if(load>Lmax+1e-9) bad.push(`Load: needs ${fmtN(load)} kg, the vehicle has ${fmtN(Lmax)} (R2 p. 120)`);
  const facPts=Object.keys(MOUNTPTS).reduce((a,k)=>a+(k==='mis_ext'&&AIR.has(c.type)?0:MOUNTPTS[k]*facLv(v,k)),0), ptsMax=Math.max(v.B,facPts);
  if(pts>ptsMax) bad.push(facPts>v.B?`Weapon mounts: its factory mounts already use ${facPts} points, over its Body of ${v.B}, so no more fit (R2 p. 131)`:`Mount points: this would use ${pts} of ${v.B} (Body)${facPts?`, counting ${facPts} for its factory mounts`:''}; a hardpoint takes 2, a firmpoint 1 (R2 p. 131)`);
  return {v,b,c,s,rows,cost,cf,load,pts,ptsMax,facPts,Cmax,Lmax,gm,bad,ok:!bad.length};
}
const clone=b=>({...b,mods:b.mods.map(m=>({...m}))});
function defOpt(d,v){const os=optsOf(d,v); return os&&os.length?os[0][0]:undefined;}
// legal levels for mod index i
function levels(v,b,i){const m=b.mods[i],d=BY[m.id]; if(d.kind==='flag') return [1]; const c=ctxOf(v,b); const out=[];
  for(let l=minLv(d,v,c),mx=maxLv(d,v,c);l<=mx;l++){const t=clone(b); t.mods[i].lv=l; if(calc(v,t).ok) out.push(l);} return out;}
function optChoices(v,b,i){const m=b.mods[i],d=BY[m.id],os=optsOf(d,v)||[]; return os.filter(o=>{const t=clone(b); t.mods[i].opt=o[0]; return calc(v,t).ok;});}
// what can be added right now (at its lowest level / first option that fits)
const ENG_GAIN={eng_sp:(v,l)=>`+${30*l} Speed`,eng_ac:(v,l)=>`+${2*l} Accel`,eng_ld:(v,l)=>`+${fmtN(v.B*50*l)} kg Load`};
function roomWhy(v,b,base,r,d){ // turn a raw capacity failure into "needs X, Y left" plus what would make room
  const last=r.bad[r.bad.length-1]||'';
  if(/^Load:/.test(last)){const need=r.load-base.load, left=Math.max(0,base.Lmax-base.load);
    const can=v.B>=1&&!b.mods.some(m=>m.id==='eng_ld');
    return `Not enough Load: needs ${fmtN(need)} kg, ${fmtN(left)} kg left of ${fmtN(base.Lmax)}.${can?` Engine customization: Load adds ${fmtN(v.B*50)} kg a level (R2 p. 120).`:''}`;}
  if(/^Cargo space:/.test(last)){const need=r.cf-base.cf, left=Math.max(0,base.Cmax-base.cf);
    return `Not enough cargo space: needs ${fmtN(need)} CF, ${fmtN(left)} CF left of ${fmtN(base.Cmax)}.${v.seats?' Taking out seats frees space (Seats, R2 p. 142).':''}`;}
  return last;}
function addable(v,b){const c=ctxOf(v,b), yes=[], no=[]; const base=calc(v,b);
  M.forEach(d=>{ if(b.mods.some(m=>m.id===d.id)) return; let why=null,got=null;
    if(d.kind==='flag'&&hasFac(v,d.id)){no.push({d,why:'Already fitted at the factory',fac:true});return;}
    const os=optsOf(d,v); const tryOpts=os&&os.length?os.map(o=>o[0]):[undefined];
    const mn=minLv(d,v,c), pre=d.ok?d.ok(v,c,mn):null;
    if(pre&&!/^Level 1 uses/.test(pre)) why=pre;
    else if(d.kind!=='flag'&&maxLv(d,v,c)<mn){why=hasFac(v,d.id)?(d.kind==='qty'?'Factory-fitted, and it already has the most this vehicle can take':'Factory-fitted at the highest level it can take'):d.id==='sensor'||d.id==='autonav'||d.id==='pilot'?'Already at the best rating available':'Not possible on this vehicle';}
    else for(const o of tryOpts){const t=clone(b); t.mods.push({id:d.id,lv:mn,opt:o}); const r=calc(v,t); if(r.ok){got={lv:mn,opt:o};break;} why=why||roomWhy(v,b,base,r,d);}
    if(why&&hasFac(v,d.id)&&/^Not enough/.test(why)) why='Factory-fitted. Another level: '+why.replace(/^Not enough /,'not enough ');
    if(got) yes.push({d,...got}); else no.push({d,why:(why||'').replace(d.n+': ','')});
  }); return {yes,no};}
// rebuild keeping every mod that is still legal, lowering levels where needed (handles stale saves and changed vehicle type)
function clamp(v,b){let r=clamp1(v,b,b.mods||[]); // second pass picks up mods whose prerequisite came later in the list
  for(let k=0;k<3&&r.droppedM.length;k++){const again=clamp1(v,r.b,r.droppedM,true); if(again.droppedM.length===r.droppedM.length){break;} r={b:again.b,droppedM:again.droppedM};}
  return {b:r.b,dropped:r.droppedM.map(m=>BY[m.id]?BY[m.id].n:m.id).filter(Boolean)};}
function clamp1(v,b,list,keep){const nb={...b,mods:keep?b.mods.map(m=>({...m})):[]}, dropped=[];
  list.forEach(m=>{const d=BY[m.id]; if(!d) return; if(nb.mods.some(x=>x.id===m.id)) return;
    const c=ctxOf(v,nb); const os=optsOf(d,v); let opt=m.opt; if(os&&os.length&&!os.some(o=>o[0]===opt)) opt=os[0][0];
    const mn=minLv(d,v,c), mx=maxLv(d,v,c); let l=d.kind==='flag'?1:Math.min(mx,Math.max(mn,Math.floor(+m.lv||mn)));
    let placed=false; for(;l>=mn;l--){nb.mods.push({id:m.id,lv:l,opt}); if(calc(v,nb).ok){placed=true;break;} nb.mods.pop();}
    if(!placed&&os&&os.length){for(const o of os){nb.mods.push({id:m.id,lv:mn,opt:o[0]}); if(calc(v,nb).ok){placed=true;break;} nb.mods.pop();}}
    if(!placed) dropped.push(m);
  }); return {b:nb,droppedM:dropped};}
const GROUPS=['Control','Protection','Weapon mounts','Electronics','Signature','Engine','Seats','Accessories'];
const typeName=t=>(TYPES.find(x=>x[0]===t)||[0,t])[1];
function statLine(v,s){const sp=a=>a.join('/'); const H=s.Hoff!=null?`${s.H}/${s.Hoff}`:s.H, H0=v.Hoff!=null?`${v.H}/${v.Hoff}`:v.H;
  return [['Handling',H0,H],['Speed',sp(v.Sp),sp(s.Sp)],['Accel',v.Ac,s.Ac],['Armor',v.A,s.A],(()=>{const b=s.mask?`${s.Si} (${s.Si+s.mask} masked)`:s.Si; return ['Signature',s.Si===v.Si?b:v.Si,b];})(),['Autonav',v.Au||'—',s.Au||'—'],['Pilot',v.P||'—',s.P||'—'],['Sensor',v.Se,s.Se]];}
// ---- Checklist UI (shared by both tools): every mod listed by group; tick to add, then pick level/count and option ----
const E=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const UI={open:{},hide:false};
// legal levels for installed mod i, each with the mod's cost at that level
function lvCost(v,b,i){const m=b.mods[i],d=BY[m.id]; if(d.kind==='flag') return []; const c=ctxOf(v,b), out=[];
  for(let l=minLv(d,v,c),mx=maxLv(d,v,c);l<=mx;l++){const t=clone(b); t.mods[i].lv=l; const r=calc(v,t); if(r.ok) out.push([l,r.rows[i].cost]);} return out;}
// factory equipment as a readable list
function facList(v){ if(!v.fac) return []; return Object.keys(v.fac).filter(id=>!v.fac[id].std).map(id=>{const d=BY[id],f=v.fac[id]; if(!d) return id;
  const os=optsOf(d,v)||[], o=f.opt?((os.find(x=>x[0]===f.opt)||[])[1]||f.opt):'';
  return d.n+(d.kind==='qty'&&f.lv?` ×${f.lv}`:d.kind==='level'&&f.lv?` ${f.lv}`:'')+(o?` (${o})`:'');});}
function factoryHTML(v){const L=facList(v); const seats=v.seats==null?'':v.seats?`${v.seats} seat${v.seats>1?'s':''}`:'no seats';
  const bits=[]; if(v.drone) bits.push('Remote control interface and rigger adaptation (standard on drones)');
  if(L.length) bits.push(L.join(', ')); if(v.other) bits.push(v.other);
  return `<p class="vck-fac"><b>Factory-fitted:</b> ${bits.length?E(bits.join('; ')):'nothing extra'}${seats?` · ${E(seats)}`:''}. <span>Already in the listed Cargo, Load and stats, so it costs no space here, but it counts toward mount points and level limits (R2 p. 120; vehicle entry ${E(String(v.pg).replace(/^R2 /,''))}).</span></p>`+
    (v.C2!=null?`<p class="vck-fac">Rigger 2 lists Cargo as ${E(v.raw.C)}; the build uses the first figure (${fmtN(v.C)} CF). Ask your GM before fitting mods into the second space.</p>`:'')+
    (/\(/.test(v.raw.Sp+v.raw.Si+v.raw.H)?`<p class="vck-fac">Bracketed figures in its entry (${E([v.raw.H,v.raw.Sp,v.raw.Si].filter(x=>/\(/.test(x)).join(', '))}) are an alternate mode; the build uses the main figures.</p>`:'');}
function checklist(v,b,key){
  const R=calc(v,b), A=addable(v,b), k=E(key);
  const have=new Map(R.rows.map((r,i)=>[r.m.id,{...r,i}])), yes=new Map(A.yes.map(x=>[x.d.id,x])), no=new Map(A.no.map(x=>[x.d.id,x]));
  const money=n=>fmtN(n)+'¥', extra=(cf,ld)=>(cf?' · '+fmtN(cf)+' CF':'')+(ld?' · '+fmtN(ld)+' kg':'');
  const price=(d,n)=>d.gm?'Price: GM sets it':n?money(n):'No parts cost';
  const groups=GROUPS.map(g=>{
    const L=M.filter(d=>d.g===g), nOn=L.filter(d=>have.has(d.id)).length, nYes=L.filter(d=>yes.has(d.id)).length, nFac=L.filter(d=>hasFac(v,d.id)&&!v.fac[d.id].std).length;
    const items=L.map(d=>{const h=have.get(d.id), y=yes.get(d.id), nx=no.get(d.id), id=E(d.id), fac=hasFac(v,d.id)&&!v.fac[d.id].std, fl=facLv(v,d.id);
      const facFlag=fac&&d.kind==='flag';
      if(!h&&!y&&!facFlag&&!fac&&UI.hide) return '';
      const facTxt=fac?`<span class="vck-tag">Factory${d.kind==='qty'&&fl?` ×${fl}`:d.kind==='level'&&fl?` level ${fl}`:''}</span>`:'';
      let ctl='';
      if(h){const os=optChoices(v,b,h.i), all=optsOf(d,v)||[];
        if(d.kind!=='flag') ctl+=`<label class="vck-s">${d.kind==='qty'?(fac?'Add':'How many'):(fac&&facLv(v,id)>0?'Upgrade to':fac?'Add levels':'Level')} <select data-vblv="${k}" data-vbid="${id}" aria-label="${E(d.n)} ${d.kind==='qty'?'count':'level'}">${lvCost(v,b,h.i).map(([l,co])=>`<option value="${l}"${l===h.l?' selected':''}>${l}${ENG_GAIN[id]?' · '+ENG_GAIN[id](v,l):''}${d.gm||!co?'':' · '+money(co)}</option>`).join('')}</select></label>`;
        if(os.length>1) ctl+=`<label class="vck-s">Option <select data-vbop="${k}" data-vbid="${id}" aria-label="${E(d.n)} option">${os.map(o=>`<option value="${E(o[0])}"${o[0]===h.m.opt?' selected':''}>${E(o[1])}</option>`).join('')}</select></label>`;
        else if(all.length>1&&os.length===1) ctl+=`<span class="vck-w">${E(os[0][1])} (only option that fits)</span>`;
        ctl+=`<span class="vck-n">${price(d,h.cost)}${extra(h.cf,h.load)}</span>`;
      } else if(y){const t={...b,mods:b.mods.concat([{id:d.id,lv:y.lv,opt:y.opt}])}, row=calc(v,t).rows.slice(-1)[0];
        ctl=`<span class="vck-n">${d.gm?(ENG_GAIN[d.id]?ENG_GAIN[d.id](v,1)+' a level · ':'')+'Price: GM sets it':!row.cost?'No parts cost':`${d.kind==='flag'?'':'from '}${money(row.cost)}${d.kind==='flag'?'':d.kind==='qty'?' each':' at level '+y.lv}`}${extra(row.cf,row.load)}</span>`;
      } else ctl=facFlag?'<span class="vck-w">Fitted at the factory</span>':`<span class="vck-w">${E(nx&&nx.why||'Doesn’t fit')}</span>`;
      const cls=h?'on':facFlag?'fac':y?'off':'no';
      return `<li class="vck ${cls}"><div class="vck-h"><label><input type="checkbox" data-vbck="${k}" data-vbid="${id}"${h||facFlag?' checked':''}${(!h&&!y)||facFlag?' disabled':''}> <b>${E(d.n)}</b>${facTxt}</label><span class="vck-p">${E(d.pg)}</span></div><div class="vck-c">${ctl}</div><details class="vck-d"><summary>What it does</summary><p>${E(d.d)}</p></details></li>`;}).join('');
    const open=g in UI.open?UI.open[g]:(nOn>0||(!R.rows.length&&g==='Control'));
    return `<details class="vgrp" data-vbgrp="${E(g)}"${open?' open':''}><summary><b>${E(g)}</b><span class="vgrp-n">${nOn?nOn+' added · ':''}${nFac?nFac+' factory · ':''}${nYes} more fit${UI.hide?'':` · ${L.length-nOn-nYes-L.filter(d=>!have.has(d.id)&&!yes.has(d.id)&&hasFac(v,d.id)&&d.kind==='flag').length} don’t`}</span></summary>${items?`<ul class="vcl">${items}</ul>`:'<p class="vck-w">Nothing else here fits this build.</p>'}</details>`;}).join('');
  const gmNote=R.gm.length?`<p class="vck-gm">Not in the total: ${E(R.gm.join(', '))}. Rigger 2 prices these from the original power plant’s cost, which the Vehicle List doesn’t give, so your GM sets the price (R2 p. 120, 130).</p>`:'';
  const sum=R.rows.length?`<p class="vck-sum"><b>Added:</b> ${R.rows.map(r=>{const os=optsOf(r.d,v)||[], o=(os.find(x=>x[0]===r.m.opt)||[])[1]; return E(r.d.n+(r.d.kind==='level'?' '+r.l:r.d.kind==='qty'?' ×'+r.l:'')+(o&&os.length>1?' ('+o.replace(/ \(.*$/,'')+')':''));}).join(' · ')}</p>`:'';
  return `<div class="vcheck">${factoryHTML(v)}${sum}<div class="vck-bar"><button type="button" class="vck-b" data-vball="1">Open all</button><button type="button" class="vck-b" data-vball="0">Close all</button><label class="vck-t"><input type="checkbox" data-vbhide="${k}"${UI.hide?' checked':''}> Hide ones that don’t fit</label></div>${gmNote}${groups}</div>`;}
// apply a checklist control to build b; returns true when it was one of ours
function act(v,b,el){const ds=el.dataset||{}, id=ds.vbid, ix=b.mods.findIndex(m=>m.id===id);
  if(ds.vbck!==undefined){ if(el.checked){ if(ix<0){const y=addable(v,b).yes.find(x=>x.d.id===id); if(y) b.mods.push({id,lv:y.lv,opt:y.opt});} } else if(ix>=0) b.mods.splice(ix,1); return true;}
  if(ds.vblv!==undefined){ if(ix>=0) b.mods[ix].lv=+el.value; return true;}
  if(ds.vbop!==undefined){ if(ix>=0) b.mods[ix].opt=el.value; return true;}
  if(ds.vbhide!==undefined){ UI.hide=el.checked; return true;}
  return false;}
const keyOf=el=>{const ds=el&&el.dataset||{}; for(const a of ['vbck','vblv','vbop','vbhide']) if(ds[a]!==undefined) return {a,k:ds[a],id:ds.vbid}; return null;};
// after a re-render, put focus back on the same control so keyboard and screen-reader users keep their place
function refocus(info){ if(!info||typeof document==='undefined') return; const at=a=>a.replace(/[A-Z]/g,x=>'-'+x.toLowerCase());
  const el=document.querySelector(`[data-${at(info.a)}="${CSS.escape(info.k)}"]${info.id?`[data-vbid="${CSS.escape(info.id)}"]`:''}`); if(el) el.focus({preventScroll:true});}
if(typeof document!=='undefined'){
  document.addEventListener('toggle',e=>{const d=e.target; if(d&&d.dataset&&d.dataset.vbgrp) UI.open[d.dataset.vbgrp]=d.open;},true);
  document.addEventListener('click',e=>{const bt=e.target.closest&&e.target.closest('[data-vball]'); if(!bt) return; const on=bt.dataset.vball==='1', root=bt.closest('.vcheck'); if(root) root.querySelectorAll('details.vgrp').forEach(x=>{x.open=on;}); GROUPS.forEach(g=>{UI.open[g]=on;});});
  const st=document.createElement('style'); st.textContent=`.vcheck{margin:8px 0}.vck-bar{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-bottom:4px}.vck-b{font:inherit;font-size:var(--t-sm);padding:4px 12px;border:1px solid var(--line);border-radius:4px;background:transparent;color:var(--ink);cursor:pointer}.vck-t{display:inline-flex;flex-direction:row;align-items:center;gap:4px;font-size:var(--t-sm);color:var(--muted);text-transform:none;letter-spacing:0;font-weight:400;margin:0}.vck-t input{width:24px;height:24px;margin:0}
.vgrp{border:1px solid var(--line);border-radius:var(--radius);margin:4px 0;padding:0 12px}.vgrp>summary{cursor:pointer;padding:8px 0;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline}.vgrp>summary b{font-size:var(--t-md)}.vgrp-n{font-size:var(--t-sm);color:var(--muted)}
.vcl{list-style:none;margin:0 0 4px;padding:0}.vck{border-top:1px solid var(--line);padding:8px 0}.vck-h{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.vck-h label{display:inline-flex;flex-direction:row;justify-content:flex-start;align-items:baseline;margin:0;font-weight:400;gap:8px;flex:1;min-width:12rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:var(--t-sm);color:var(--ink)}.vck-h input{min-width:0;padding:0;width:24px;height:24px;flex:none;margin:0;align-self:center;accent-color:var(--accent)}.vck-p{font-size:var(--t-xs);color:var(--muted)}
.vck-c{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;margin:4px 0 0 24px;font-size:var(--t-sm)}.vck-s{display:inline-flex;flex-direction:row;align-items:center;gap:4px;color:var(--muted);text-transform:none;letter-spacing:0;font-size:var(--t-sm)}.vck-s select{font:inherit;padding:4px 8px;border:1px solid var(--line);border-radius:4px;background:var(--panel,transparent);color:var(--ink)}
.vck-n{font-family:var(--mono,monospace);font-variant-numeric:tabular-nums}.vck-c>select{font:inherit;font-size:var(--t-sm);padding:4px 8px;border:1px solid var(--line);border-radius:4px;background:var(--panel,transparent);color:var(--ink);max-width:100%;min-width:0}.gsl .vck-c,.gsl .vck-d{margin-left:0}.gsl .vck-c>select{width:100%;max-width:32rem}.gsl .vck-h b{font-size:var(--t-sm)}.gsl .vck.on .vck-h b{color:var(--accent)}.vck.on{background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 10%,transparent),transparent 70%)}.vck.on .vck-h b{color:var(--accent)}.vck.no .vck-h label{cursor:default;color:var(--muted)}.vck.no input{opacity:.5}.vck-w{color:var(--muted);font-style:italic}
.vck-tag{font-size:var(--t-xs);font-weight:600;text-transform:uppercase;letter-spacing:.04em;border:1px solid var(--line);border-radius:4px;padding:0 4px;color:var(--muted);align-self:center}.vck.fac .vck-h b{color:var(--ink)}.vck.fac input{opacity:.7}.vck-fac{font-size:var(--t-xs);line-height:1.45;margin:4px 0 8px;color:var(--ink)}.vck-fac span{color:var(--muted)}.vck-sum{font-size:var(--t-sm);line-height:1.5;margin:4px 0 8px}.vck-gm{font-size:var(--t-xs);margin:4px 0;padding:8px 8px;border-left:3px solid var(--accent);color:var(--ink)}
.vck-d{margin:4px 0 0 24px;font-size:var(--t-sm)}.vck-d summary{cursor:pointer;color:var(--muted);width:max-content}.vck-d p{margin:4px 0 0;line-height:1.45;color:var(--ink)}`;
  (document.head||document.documentElement).appendChild(st);
}
return {TYPES,typeName,veh,M,BY,GROUPS,calc,clamp,levels,optChoices,addable,optsOf,ctxOf,statLine,minLv,maxLv,fmtN,AIR,GROUND,checklist,act,keyOf,refocus,UI,FACT,facList,ENG_GAIN};
})();
