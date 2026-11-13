// ---------- Gun build-out rules shared by both tools (core p. 238–241, SSC, FoF p. 57, 84–85) ----------
// Each page defines GBENV: item(key), visible(item), book(src), price(item), state(gun).
const ACC={
 'ammo:Bipod':{slot:['under'],conc:0,rc:2,ok:g=>PISTOL.has(wtype(g))?'Needs an under-barrel mount':null,fx:'A two-legged brace for firing sitting or lying down. 2 points of recoil compensation and no Concealability change.',pg:'core p. 240'},
 'ammo:Tripod':{slot:['under'],nocon:1,rc:6,ok:g=>HEAVYW.has(wtype(g))?null:'Heavy weapons only',fx:'A heavy, stable mount for heavy weapons. 6 points of recoil compensation. Not concealable.',pg:'core p. 241'},
 'ammo:Concealable Holster':{slot:['holster'],conc:2,ok:g=>PISTOL.has(wtype(g))?null:'Pistols only',fx:'Custom-fitted holster worn on the hip, small of the back, under the arm, forearm or ankle. +2 to the pistol’s Concealability, which is the target number for a Perception Test to spot it.',pg:'core p. 240'},
 'ammo:Gas Vent II':{slot:['barrel'],conc:-1,rc:2,fx:'Vents barrel gas to fight muzzle climb. 2 points of recoil compensation, −1 Concealability. Can’t be removed once fitted. (The table on core p. 256 lists Rating 1; the text on p. 240 says 2.)',pg:'core p. 240'},
 'ammo:Gas Vent III':{slot:['barrel'],conc:-2,rc:3,fx:'3 points of recoil compensation, −2 Concealability. Can’t be removed once fitted. (The table on core p. 256 lists Rating 2; the text on p. 240 says 3.)',pg:'core p. 240'},
 'ammo:Improved Gas Vent II':{slot:['barrel'],conc:0,rc:2,fx:'Lyco gas vent: 2 points of recoil compensation with no Concealability penalty. Weight .25 kg.',pg:'SSC p. 38'},
 'ammo:Improved Gas Vent III':{slot:['barrel'],conc:-1,rc:3,fx:'Lyco gas vent: 3 points of recoil compensation, −1 Concealability.',pg:'SSC p. 38'},
 'ammo:Improved Gas Vent IV':{slot:['barrel'],conc:-2,rc:4,fx:'Lyco gas vent: 4 points of recoil compensation, −2 Concealability.',pg:'SSC p. 38'},
 'ammo:Gyro Mount, Standard':{slot:['harness'],nocon:1,gyro:5,armor:1,ok:g=>RIFLE.has(wtype(g))||HEAVYW.has(wtype(g))?null:'Rifles and heavy weapons only',fx:'Upper-body harness with a stabilized arm that holds a rifle or heavy weapon. Cancels up to 5 points of recoil and movement modifiers combined, and stacks with recoil compensation. +1 Ballistic and Impact armor while worn. 5 minutes to strap in, 1 Complex Action to quick-release, 2 Complex Actions to attach or remove the gun.',pg:'core p. 240'},
 'ammo:Gyro Mount, Deluxe':{slot:['harness'],nocon:1,gyro:6,armor:1,ok:g=>RIFLE.has(wtype(g))||HEAVYW.has(wtype(g))?null:'Rifles and heavy weapons only',fx:'As the standard gyro mount but Rating 6: cancels up to 6 points of recoil and movement modifiers. +1 Ballistic and Impact armor while worn.',pg:'core p. 240'},
 'ammo:Improved Gyro Mount':{slot:['harness'],nocon:1,gyro:5,halfPool:1,ok:g=>RIFLE.has(wtype(g))||HEAVYW.has(wtype(g))?null:'Rifles and heavy weapons only',fx:'Vest-style gyro harness. Cancels recoil and movement modifiers up to Rating 5. While you wear it you get only half your Combat Pool and +4 to any melee attempt.',pg:'SSC p. 67'},
 'ammo:Deluxe Improved Gyro Mount':{slot:['harness'],nocon:1,gyro:7,halfPool:1,ok:g=>RIFLE.has(wtype(g))||HEAVYW.has(wtype(g))?null:'Rifles and heavy weapons only',fx:'Rating 7 version: cancels recoil and movement modifiers up to 7. Half Combat Pool and +4 to melee while worn.',pg:'SSC p. 67'},
 'ammo:Low-Light Scope':{slot:['top'],conc:-2,noSmart:1,vis:'Low-light',fx:'Low-light imaging through the scope. −2 Concealability, 1 Complex Action to fit or remove. Scopes can’t be used with a smartlink system.',pg:'core p. 240'},
 'ammo:Thermographic Scope':{slot:['top'],conc:-2,noSmart:1,vis:'Thermographic',fx:'Thermographic imaging through the scope. −2 Concealability, 1 Complex Action to fit or remove. Scopes can’t be used with a smartlink system.',pg:'core p. 240'},
 'ammo:Magnification 1 Scope':{slot:['top'],conc:-1,mag:1,noSmart:1,fx:'Moves the target one range category closer on the Weapon Range Table (core p. 88), never below Short. Medium (TN 5) becomes Short (TN 4). −1 Concealability. Can’t be used with a smartlink system.',pg:'core p. 240'},
 'ammo:Magnification 2 Scope':{slot:['top'],conc:-1,mag:2,noSmart:1,fx:'Moves the target two range categories closer, never below Short. Long (TN 6) becomes Short (TN 4). −1 Concealability. Can’t be used with a smartlink system.',pg:'core p. 240'},
 'ammo:Magnification 3 Scope':{slot:['top'],conc:-1,mag:3,noSmart:1,fx:'Moves the target three range categories closer, never below Short. Extreme (TN 9) becomes Short (TN 4). −1 Concealability. Can’t be used with a smartlink system.',pg:'core p. 240'},
 'ammo:Laser Sight':{slot:['top','under'],conc:-1,tn:-1,laser:1,noSmart:1,fx:'Puts a red dot on the target. −1 target number out to 50 meters; mist, smoke, fog or rain cancel it. Can’t be used with any smartlink system, so its −1 never stacks with smartlink bonuses. −1 Concealability, 1 Complex Action to fit or remove.',pg:'core p. 240, 90'},
 'ammo:Shock Pads':{slot:['stock'],conc:0,rc:1,ok:g=>((GUNFIT[g.id]||{}).int||[]).some(x=>/Folding|Retractable/.test(x[1]))?'Needs a rigid stock; this gun’s stock folds or retracts':RIFLE.has(wtype(g))&&!/Roomsweeper/.test(g.n)||HEAVYW.has(wtype(g))?null:'Needs a rigid rifle or shotgun stock, or a heavy weapon’s hip brace',fx:'Shock-absorbing pads on a rigid shoulder stock (not a folding stock) or a heavy weapon’s hip brace. 1 point of recoil compensation.',pg:'core p. 240'},
 'ammo:Silencer':{slot:['barrel'],conc:-2,notice:4,ok:g=>isRevolver(g)?'Revolvers can’t use silencers':wtype(g)==='smg'?'SMGs can’t use silencers (use a sound suppressor)':isShotgun(g)?'Shotguns can’t use silencers':autoCap(g)?'Silencers are for single-shot and semi-auto weapons only':null,fx:'Cuts the sound and flash of each shot. +4 target number for anyone trying to notice the shot or find the shooter. −2 Concealability, 1 Complex Action to fit or remove.',pg:'core p. 240'},
 'ammo:Sound Suppressor':{slot:['barrel'],conc:-2,notice:2,ok:g=>isShotgun(g)?'Shotguns can’t use sound suppressors':isRevolver(g)?'Revolvers can’t use sound suppressors':!autoCap(g)?'Sound suppressors are for burst and full-auto weapons (use a silencer)':null,fx:'For burst and full-auto weapons. +2 target number to notice the shot or find the shooter. Must be replaced every 300 rounds of burst or autofire. −2 Concealability, 2 Complex Actions to fit or remove.',pg:'core p. 241'},
 'ammo:Ares Light Fire 70 Silencer':{slot:['barrel'],conc:-1,notice:4,ok:g=>/Light Fire 70/.test(g.n)?null:'Fits only the Ares Light Fire 70',fx:'A silencer made for the Light Fire 70, half the weight of others. +4 target number to notice the shot (as a silencer), −1 Concealability.',pg:'SSC p. 17'},
 'ammo:Smartgun Adapter, external':{slot:['top','under'],conc:-2,smart:1,fx:'Makes the gun a smartgun. With smartlink cyberware you get −2 to your target number; with smart goggles, −1. Without one of those it’s dead weight. Moving it to another gun takes an hour of alignment. −2 Concealability.',pg:'core p. 241, 90'},
 'ammo:Smartlink II, external':{slot:['top','under'],conc:-2,smart:2,fx:'Smartlink Level II for the gun. Works as a normal smartgun (−2 with smartlink, −1 with goggles). If the shooter’s smartlink is also Level II: an extra −1 at long range and −2 at extreme range with a rangefinder; Called Shots take a +2 modifier (normally +4); and −1 for linked indirect fire such as under-barrel grenade launchers. Weight .75 kg, −2 Concealability.',pg:'FoF p. 57, 84–85'},
 'ammo:Smartlink II, internal (weapon)':{slot:['internal'],conc:0,smart:2,costMult:2.5,fx:'Smartlink Level II built into the gun for +250% of the gun’s price. Same benefits as the external version, with no Concealability penalty and no mount used.',pg:'FoF p. 57, 84–85'},
 'x:Smartgun system, internal':{n:'Smartgun system, internal',src:'core',slot:['internal'],conc:0,smart:1,costMult:1,fx:'Smartgun circuitry built into the gun. Fitting it after manufacture doubles the gun’s price. No mount used and no Concealability change.',pg:'core p. 241'},
 'ammo:Ultrasound Sight':{slot:['top'],conc:-2,halfVis:1,fx:'Maps the target area with coded sound. Halves visibility modifiers from dim light, darkness and invisibility, and also reveals magically invisible targets. Needs a retinal display or ultrasound goggles. Usable with all other targeting accessories, including smartlinks.',pg:'SSC p. 36'},
 'ammo:Rangefinder':{slot:['under'],conc:0,range:1,fx:'Feeds exact range to a smartlink or smart-goggle display. With Smartlink Level II on both gun and shooter it gives −1 at long range and −2 at extreme range (FoF p. 84). Needed for the Rangefinder Grenade Link.',pg:'SSC p. 37'},
 'ammo:Rangefinder Grenade Link':{slot:['other'],conc:0,extra:300,ok:g=>gunSlots(g).includes('under')||integral(g).some(x=>x.gl)?null:'Needs a gun that can carry a grenade launcher',fx:'Sets mini-grenades to airburst at the measured range, which ends scatter. Needs a rangefinder, a smartgun system, a 300¥ modification to the linked grenade launcher (included in the build price) and Ares Air-Timed Mini-Grenades (150¥ each).',pg:'SSC p. 68'},
 'ammo:Individualized Biometric Safety (IBS)':{slot:['other'],conc:0,fx:'The gun only fires for its registered owner. Works alongside smartlinks.',pg:'CSH p. 71'},
 'guns:Under-barrel Grenade Launcher':{slot:['under'],conc:-3,gl:1,ok:g=>wtype(g)==='assault'?null:wtype(g)==='smg'?'SMGs can’t take grenade launchers (core p. 238)':'Made as an under-barrel add-on for assault rifles (core p. 240); other guns are your GM’s call',fx:'Fires mini-grenades from its own magazine (6 rounds) with a thumb button or second trigger. −3 Concealability. Can’t be removed once fitted.',pg:'core p. 240'}
};
// effect text for other items (shown as "What it does")
const FX={
 'body:Smartlink':['The receptor for a smartgun. −2 to your target number when firing a smartgun (with smart goggles it’s only −1). Can’t be used with a laser sight or scope on the same gun. Using two guns at once cancels the bonus.','core p. 90, 241'],
 'body:Smartlink II':['Level II smartlink cyberware. With a Level II smartgun: −2 to target numbers as usual, plus −1 at long range and −2 at extreme range when a rangefinder is linked; Called Shots take +2 instead of the usual +4; and −1 for linked indirect fire such as under-barrel grenade launchers. Works with Level I smartguns but only gives the Level I −2 then.','FoF p. 57, 84–85'],
 'ammo:Smart Goggles':['Goggles linked by fiber-optic cable to a smartgun. −1 to the target number (smartlink cyberware gives −2). Low-light or infrared can be added for +1,000¥.','core p. 241, 90'],
 'ammo:Smartgoggles (Smartlink II)':['Level II smart goggles. −1 to the target number with a smartgun. The Level II extras need both the smartlink and the smartgun to be Level II.','FoF p. 57, 84–85'],
 'ammo:Regular Ammo (10 rounds)':['Standard rounds: use the gun’s own Damage Code. Each gun class shares ammo; shotguns of every kind share ammo. Concealability −1 per extra 10 rounds carried.','core p. 241, 256'],
 'ammo:Explosive Rounds (10)':['+1 Power. Firing through a barrier uses double its Barrier Rating, but the barrier takes damage as if it had half. If every Attack Test die is a 1, the round misfires and the shooter takes one attack at the normal Damage Code. Heat, flames or fireballs can cook them off.','core p. 93, 241'],
 'ammo:EX Explosive Rounds (10)':['+2 Power, otherwise as explosive rounds (including misfires on all 1s).','FoF p. 51'],
 'ammo:Flechette Rounds (10)':['+1 Damage Level against unarmored targets (9M becomes 9S). Against armor, use double the Impact rating or the Ballistic rating, whichever is higher. Barriers and vehicle armor count double. Dermal armor cancels the level increase.','core p. 93'],
 'ammo:Gel Rounds (10)':['Non-lethal. Power −2, same Damage Level, and all damage is Stun. Impact armor applies instead of Ballistic. Better chance of knockdown.','core p. 95'],
 'ammo:Stun Rounds (10)':['Riot-control rounds for large-bore guns like shotguns. Played as gel rounds: Power −2, Stun damage, Impact armor applies and Ballistic is useless.','core p. 95, 241'],
 'ammo:APDS Ammo (10 rounds)':['Armor-piercing discarding sabot. Halves Ballistic armor, and Barrier ratings when firing through them. Vehicle armor reduces its Power by half the armor rating (round down) and drops the Damage Level by one.','SSC p. 63'],
 'ammo:Tracer Rounds (10)':['Full-auto weapons only, loaded every third round. Shooters without a smartgun get an extra −1 at ranges past Short for every three rounds fired (−1 after three, −2 after six). In bursts, tracers add no Power but do raise the Damage Level as usual.','FoF p. 51'],
 'ammo:Spare Clip':['An empty clip for one specific gun. Not interchangeable, even between guns of the same class.','core p. 241']
};
Object.entries(ACC).forEach(([k,a])=>{if(!FX[k]) FX[k]=[a.fx,a.pg];});
// built-in features per gun: [slot or null, name, extra effects]
const L='ammo:Laser Sight', GV2='ammo:Gas Vent II', SIL='ammo:Silencer', SUP='ammo:Sound Suppressor', SMI='x:Smartgun system, internal';
const GUNFIT={
 'guns:Ares Viper Slivergun':{int:[['barrel',SIL]]},
 'guns:Uzi III':{int:[['top',L],[null,'Folding stock']]},
 'guns:Heckler & Koch HK227':{int:[['under',L],['barrel',GV2],[null,'Retractable stock']]},
 'guns:HK227-S':{int:[['under',L],['barrel',SIL],[null,'Retractable stock']]},
 'guns:Ingram Valiant':{int:[['stock','Hip-brace recoil pad',{rc:1}],['barrel',GV2]]},
 'guns:Ares MP Light Machine Gun':{int:[['stock','Hip-brace recoil pad',{rc:1}],['barrel',GV2]],note:'Core p. 238–239 says Ares LMGs share the Valiant’s hip-brace pad and gas vent.'},
 'guns:FN HAR':{int:[['top',L],['barrel',GV2],[null,'Folding stock']]},
 'guns:AK-98 (with grenade launcher)':{int:[['under','guns:Under-barrel Grenade Launcher']]},
 'guns:AK-97':{note:'Mounting a grenade launcher on the AK-97 is extremely difficult (core p. 239).'},
 'guns:AK-97 SMG/Carbine':{int:[[null,'Folding stock']]},
 'guns:Remington 750':{int:[['top','ammo:Magnification 1 Scope']],no:['under']},
 'guns:Remington 950':{int:[['top','ammo:Magnification 1 Scope']],no:['under']},
 'guns:Ranger Arms SM-3':{int:[['barrel','Gas vent (Rating 2) and silencer',{rc:2,notice:4}],['top','Magnification 3 scope with low-light or thermographic',{mag:3,noSmart:1}]],note:'Each turn it’s used as a combat weapon adds to the chance (2D6) it loses alignment: +2 to its target numbers (core p. 239).'},
 'guns:Defiance T-250':{no:['under']},
 'guns:Enfield AS-7':{int:[['top',L]]},
 'guns:Defiance Super Shock':{int:[['top','ammo:Low-Light Scope']]},
 'guns:Ares Light Fire 70':{note:'A matching silencer (650¥, −1 Concealability) is sold for it (SSC p. 17).'},
 'guns:Beretta Model 200ST':{int:[['stock','Detachable shoulder stock',{rc:1}]],note:'With the stock it can fire one burst as a Complex Action (SSC p. 19).'},
 'guns:Seco LD-120':{int:[[null,L]]},'guns:Browning Ultra-Power':{int:[[null,L]]},'guns:Colt Manhunter':{int:[[null,L]]},
 'guns:Ares Crusader Machine Pistol':{int:[['barrel',GV2]]},
 'guns:Ceska Black Scorpion':{int:[[null,'Folding stock',{rc:1}]]},'guns:Ceska Black Scorpion, standard clip':{int:[[null,'Folding stock',{rc:1}]]},
 'guns:Ares Predator II':{int:[['internal',SMI]]},
 'guns:Beretta Model 70':{int:[[null,L],['barrel',SUP]]},
 'guns:Heckler & Koch MP-5 TX':{int:[[null,L],['barrel',GV2]]},
 'guns:Ingram Smartgun':{int:[['internal',SMI],['barrel',GV2],[null,'Folding stock']]},
 'guns:Sandler TMP':{int:[[null,L],[null,'Folding stock',{rc:1}]]},
 'guns:SCK Model 100':{int:[['internal',SMI]]},
 'guns:Mossberg CMDT':{int:[[null,L]]},
 'guns:Mossberg CMDT/SM':{int:[[null,L],['internal',SMI]],note:'Built in, so the laser and smartgun are both there; their bonuses still don’t stack.'},
 'guns:Ruger 100 Sport Rifle':{int:[['top','ammo:Magnification 3 Scope']]},
 'guns:Walther MA-2100':{int:[['internal',SMI]]},
 'guns:Colt M22A2':{int:[['under','guns:Under-barrel Grenade Launcher'],['top','ammo:Magnification 2 Scope']]},
 'guns:H&K G12A3z':{int:[[null,L],['barrel',GV2]]},
 'guns:Samopal vz 88V':{int:[[null,L],['top','ammo:Magnification 2 Scope'],['barrel',GV2]]},
 'guns:Walther PB-120':{no:['under']},
 'guns:Hammerli Model 610S':{int:[[null,'Built-in recoil reduction',{rc:1}]],no:['under','barrel']},
 'guns:Savalette Guardian':{int:[['internal',SMI],[null,'Built-in recoil reduction',{rc:1}]],no:['under'],note:'Can fire one three-round burst as a Complex Action (FoF p. 28).'},
 'guns:Colt Cobra TZ-110':{int:[['barrel','Integral Gas-Vent II',{rc:1}],[null,'Folding stock']],no:['barrel'],note:'FoF p. 30 rates its integral gas vent at Recoil Reduction 1.'},
 'guns:Colt Cobra TZ-115':{int:[['barrel','Integral Gas-Vent II',{rc:1}],[null,L],[null,'Folding stock']],no:['barrel']},
 'guns:Colt Cobra TZ-118':{int:[['barrel','Integral Gas-Vent II',{rc:1}],['internal',SMI],[null,'Folding stock']],no:['barrel']},
 'guns:Ingram SuperMach 100':{int:[[null,'Built-in recoil reduction',{rc:3}]],no:['barrel']},
 'guns:Ares Alpha Combat Gun':{int:[['internal','Smartlink II (integral)',{smart:2}],['under','Mini-grenade launcher (integral)',{gl:1}]],no:['under']},
 'guns:Ares HVAR':{int:[['internal','Smartlink II (integral)',{smart:2,rc:3}]],no:['barrel']},
 'guns:Barret Model 121':{int:[['internal','Smartlink I (integral)',{smart:1}],['barrel','Integral silencer',{notice:4}],[null,'Blow-back recoil reduction',{rc:2}]],recoilMod:2,note:'Has its own +2 recoil modifier on top of normal recoil (FoF p. 35).'},
 'guns:Franchi SPAS-22':{int:[['internal','Smartlink II (integral)',{smart:2}],[null,'Folding stock (extended)',{rc:1}]],note:'Recoil reduction 1 only with the stock extended; folded, its Concealability is 4 (FoF p. 37).'},
 'guns:Ares HV MP-LMG':{int:[['internal','Smartlink II (integral)',{smart:2}],[null,'Built-in recoil reduction',{rc:3}]],no:['barrel']}
};
function gunSlots(g){const t=wtype(g),F=GUNFIT[g.id]||{};let s;
  if(t==='holdout') s=['holster','other'];
  else if(PISTOL.has(t)) s=['top','barrel','holster','internal','other'];
  else if(t==='smg') s=['top','barrel','under','internal','other'];
  else if(RIFLE.has(t)) s=['top','barrel','under','stock','harness','internal','other'];
  else if(HEAVYW.has(t)) s=['top','barrel','under','stock','harness','internal','other'];
  else s=[];
  return s.filter(x=>!(F.no||[]).includes(x));}
function canBuild(g){return g&&g.cat==='guns'&&g.w&&!NOACC.has(wtype(g));}
function accName(k){const it=GBENV.item(k); return ACC[k]&&ACC[k].n||(it&&it.n)||k;}
function integral(g){return ((GUNFIT[g.id]||{}).int||[]).map(([slot,k,x])=>{const a=ACC[k]||{};return Object.assign({},a,{slot,n:ACC[k]?accName(k):k,id:ACC[k]?k:null,conc:0,nocon:0,cost:0,integral:1,fx:a.fx},x||{});});}
function accVisible(k){const it=GBENV.item(k); if(it) return GBENV.visible(it); if(/^ammo:|^guns:/.test(k)) return false; return GBENV.book(ACC[k].src||'core');}
function accFor(g,slot){const out=[],no=[];Object.entries(ACC).forEach(([k,a])=>{if(!a.slot.includes(slot)||!accVisible(k))return;const why=a.ok?a.ok(g):null;(why?no:out).push({k,why});});return {out,no};}
function parseCode(d){const m=/^(\d+)([LMSD])(.*)$/.exec(d||'');return m?{p:+m[1],l:m[2],rest:m[3]}:null;}
const LVL='LMSD';
function buildCalc(g){
  const B=GBENV.state(g), ints=integral(g), slots=gunSlots(g);
  const chosen=slots.map(s=>B[s]&&ACC[B[s]]&&!ints.some(x=>x.slot===s)?Object.assign({slot:s,id:B[s],n:accName(B[s])},ACC[B[s]]):null).filter(Boolean);
  const parts=ints.concat(chosen), gunCost=g.cost||0, warn=[];
  let conc=g.w[1], nocon=false, rc=0, gyro=0, smart=0, laser=0, mag=0, notice=0, cost=gunCost, noSmart=[], range=0, halfVis=0, armor=0, halfPool=0, gl=0;
  parts.forEach(p=>{ if(p.nocon) nocon=true; if(!p.integral&&p.conc) conc=conc==null?null:conc+p.conc; rc+=p.rc||0; gyro=Math.max(gyro,p.gyro||0); smart=Math.max(smart,p.smart||0); if(p.laser) laser=1; mag=Math.max(mag,p.mag||0); notice=Math.max(notice,p.notice||0); if(p.noSmart&&!p.laser) noSmart.push(p.n); if(p.range) range=1; if(p.halfVis) halfVis=1; armor=Math.max(armor,p.armor||0); if(p.halfPool) halfPool=1; if(p.gl) gl=1;
    if(!p.integral){ const it=GBENV.item(p.id); cost+=p.costMult!=null?Math.round(gunCost*p.costMult):(it?GBENV.price(it):0); cost+=p.extra||0; }});
  // smartlink and the shooter's receptor
  const link=B.link||'none', userLv=link==='smartlink2'||link==='goggles2'?2:link==='none'?0:1, goggles=/goggles/.test(link);
  let aim=0, aimTxt=[];
  if(smart&&userLv){aim=goggles?-1:-2;aimTxt.push(`${goggles?'Smart goggles':'Smartlink'} with a smartgun ${String(aim).replace('-','−')}`);}
  else if(smart&&!userLv) aimTxt.push('Smartgun: pick the shooter’s smartlink or smart goggles to get its bonus');
  else if(!smart&&userLv) warn.push('The shooter has a '+(goggles?'smart goggles':'smartlink')+' but the gun isn’t a smartgun. Add a smartgun adapter, Smartlink II or an internal smartgun system.');
  if(laser){ if(aim) {warn.push('A laser sight can’t be used with a smartlink system (core p. 240). Its −1 doesn’t add.');} else {aim=-1;aimTxt.push('Laser sight −1 (to 50 m; not in smoke, fog, mist or rain)');} }
  if(smart&&userLv&&noSmart.length) warn.push(`${noSmart.join(' and ')} can’t be used with a smartlink system (core p. 240). Pick one or the other for each shot.`);
  const lv2=smart>=2&&userLv>=2;
  if(smart>=2&&userLv===1) warn.push('Smartlink II extras need Level II on both the gun and the shooter (FoF p. 57). You get the Level I bonus only.');
  if(userLv===2&&smart===1) warn.push('A Level II smartlink with a Level I smartgun gives the Level I bonus only (FoF p. 57).');
  const ext=[];
  if(lv2){ ext.push('Called Shots take +2 instead of +4'); if(range) ext.push('Rangefinder: −1 more at long range, −2 more at extreme'); else ext.push('Add a rangefinder for −1 at long and −2 at extreme range'); if(gl) ext.push('−1 for the linked grenade launcher’s indirect fire'); }
  if(parts.some(p=>p.id==='ammo:Rangefinder Grenade Link')){ if(!gl) warn.push('The Rangefinder Grenade Link needs a grenade launcher on the gun.'); if(!range) warn.push('The Rangefinder Grenade Link needs a rangefinder (Ares Z2 or similar).'); if(!smart) warn.push('The Rangefinder Grenade Link works through a smartgun system.'); }
  if(gyro&&halfPool) warn.push('Improved gyro mount: half Combat Pool and +4 to melee while you wear it (SSC p. 67).');
  // Concealability
  const concTxt=nocon||conc==null?'Not concealable':String(conc);
  // recoil
  const heavy=['mmg','hmg'].includes(wtype(g))||isShotgun(g), extraR=(GUNFIT[g.id]||{}).recoilMod||0;
  const mo=modes(g), rows=[];
  const R=(label,raw)=>{const base=raw+extraR, unc=Math.max(0,base-rc), dbl=heavy?unc*2:unc, fin=Math.max(0,dbl-gyro);rows.push([label,base,rc,heavy?'×2':'—',gyro,fin]);};
  if(extraR) R('Any shot',0);
  if(/SA/.test(mo)) R('Semi-auto, 2nd shot',1);
  if(/BF/.test(mo)){R('Burst',3);R('2nd burst',6);}
  if(/FA/.test(mo)){R('Full-auto, 3 rds',3);R('Full-auto, 6 rds',6);R('Full-auto, 10 rds',10);}
  // damage with ammo
  const d=parseCode(g.w[4]), am=B.ammo; let dmg=g.w[4], dmgNote='';
  if(d){ const L2=(l,n)=>LVL[Math.min(3,LVL.indexOf(l)+n)];
    if(am==='ammo:Explosive Rounds (10)'){dmg=(d.p+1)+d.l+d.rest;dmgNote='Misfires on all 1s.';}
    else if(am==='ammo:EX Explosive Rounds (10)'){dmg=(d.p+2)+d.l+d.rest;dmgNote='Misfires on all 1s.';}
    else if(am==='ammo:Gel Rounds (10)'||am==='ammo:Stun Rounds (10)'){dmg=(d.p-2)+d.l+' Stun';dmgNote='Impact armor applies, not Ballistic.';}
    else if(am==='ammo:Flechette Rounds (10)'){dmg=`${d.p}${L2(d.l,1)} vs unarmored, ${d.p}${d.l} vs armored`;dmgNote='Armor: double Impact or Ballistic, whichever is higher.';}
    else if(am==='ammo:APDS Ammo (10 rounds)'){dmgNote='Target’s Ballistic armor is halved.';}
    else if(am==='ammo:Tracer Rounds (10)'){dmgNote=/FA/.test(mo)?'Non-smart shooters: −1 more past Short range per 3 rounds fired.':'Tracers need a full-auto weapon.';}
  }
  if(am==='ammo:Stun Rounds (10)'&&!isShotgun(g)) warn.push('Stun rounds are made for large-bore guns like shotguns (core p. 241).');
  // slot conflicts
  if(armor) ext.push('Gyro harness: +'+armor+' Ballistic and Impact armor while worn');
  if(halfVis) ext.push('Ultrasound: halves darkness and invisibility modifiers');
  return {parts,ints,chosen,slots,conc:concTxt,rc,gyro,aim,aimTxt,ext,mag,notice,cost,warn,rows,heavy,extraR,dmg,dmgNote,armor,halfVis,smart,userLv};
}
