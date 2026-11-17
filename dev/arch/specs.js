// Each archetype: a legal build, plus deliberate mistakes along the way to see whether the Builder catches them.
const T=420;
const typeIn=async(p,sel,v)=>{await p.fill(sel,String(v)); await p.press(sel,'Tab'); await p.waitForTimeout(T);};
module.exports={
 sam1: async(u,p,mark)=>{ // Human street samurai, standard rules
  await u.rules('standard'); await u.prio({race:'D',magic:'E',attr:'B',skills:'C',res:'A'});
  await u.id({name:'Rafael Ortiz',handle:'Razor',race:'Human',magic:'none',concept:'Ex-corporate security turned runner'});
  await u.attrs({body:5,qui:7,str:5,cha:2,int:4,wil:1}); await mark('Quickness 7 typed (human max 6)');
  await u.attrs({body:5,qui:6,str:5,cha:2,int:4,wil:2});
  const fi=await u.skill('Firearms',7); await mark('Firearms 7 typed (creation max 6)'); await typeIn(p,`#s_r_${fi}`,6);
  await p.selectOption(`#s_n_${fi}`,{label:'Concentration'}); await p.selectOption(`#s_cs_${fi}`,{label:'Pistols'}); await p.waitForTimeout(T);
  await u.skill('Armed Combat',4); await u.skill('Unarmed Combat',4); await u.skill('Stealth',3); await u.skill('Athletics',3); await u.skill('Car',2); await u.skill('Etiquette',2,'Street');
  const wi=await u.gear('body','Wired Reflexes',{rating:3}); await u.gear('body','Smartlink'); await u.gear('body','Dermal Plating',{rating:2}); const mr=await u.gear('body','Muscle Replacement',{rating:2}); await u.gear('head','Cybereyes');
  await mark('Essence overspent (wired 3, smartlink, plating 2, muscle 2, eyes)');
  await typeIn(p,`#g_r_${wi}`,2); await typeIn(p,`#g_r_${mr}`,1); await mark('fixed: wired 2, muscle replacement 1');
  await u.gear('guns','Ares Predator II'); await u.gear('guns','Heckler & Koch HK227'); await u.gear('armor','Armor Jacket'); await u.gear('melee','Katana');
  await u.gear('ammo','Regular Ammo (10 rounds)',{qty:6}); await u.gear('ammo','Spare Clip',{qty:4}); await u.gear('med','Medkit'); await u.gear('med','Trauma Patch',{qty:2});
  await u.contact('Mack, fixer',1,'Contact'); await u.contact('Dina, street doc',1,'Contact'); await u.cash();
 },
 sam2: async(u,p,mark)=>{ // Ork bioware samurai, "any race, any priority" house rule
  await u.rules('house'); await u.prio({race:'E',magic:'D',attr:'B',skills:'C',res:'A'});
  await u.id({name:'Gorrin Teague',handle:'Tusk',race:'Ork',magic:'none',concept:'Redmond Barrens enforcer with clinic-grown muscle'});
  await u.attrs({body:6,qui:5,str:5,cha:2,int:4,wil:2});
  await u.skill('Firearms',5,'Submachine Guns'); await u.skill('Armed Combat',5); await u.skill('Unarmed Combat',4); await u.skill('Athletics',4); await u.skill('Stealth',3); await u.skill('Car',3);
  await u.gear('bio','Muscle Augmentation',{rating:2}); await u.gear('bio','Synaptic Accelerator',{rating:1}); await u.gear('bio','Enhanced Articulation'); await u.gear('bio','Platelet Factory');
  const wr=await u.gear('body','Wired Reflexes',{rating:1}); await mark('Wired Reflexes on top of a Synaptic Accelerator (ST p. 28: not compatible)');
  await u.removeGear(wr); await u.gear('body','Smartlink'); await u.gear('body','Dermal Plating',{rating:1});
  await u.gear('bio','Suprathyroid Gland'); await mark('Body Index with Suprathyroid');
  await u.gear('guns','Ingram Smartgun'); await u.gear('guns','AK-97 SMG/Carbine'); await u.gear('armor','Armor Jacket'); await u.gear('melee','Sword');
  await u.gear('ammo','APDS Ammo (10 rounds)',{qty:4}); await u.gear('ammo','Regular Ammo (10 rounds)',{qty:6});
  await u.contact('Smiling Lu, fence',1,'Contact'); await u.contact('Brick, ork gang boss',1,'Contact'); await u.cash();
 },
 deck1: async(u,p,mark)=>{ // Human decker, standard rules, Fuchi Cyber-6
  await u.rules('standard'); await u.prio({race:'D',magic:'E',attr:'C',skills:'B',res:'A'});
  await u.id({name:'Wen Zhao',handle:'Glitch',race:'Human',magic:'none',concept:'Ex-Renraku code monkey'});
  await u.attrs({body:2,qui:4,str:2,cha:2,int:6,wil:4});
  await u.skill('Computer',6); await u.skill('Computer (B/R)',4); await u.skill('Electronics',4); await u.skill('Firearms',3); await u.skill('Etiquette',3,'Matrix'); await u.skill('Stealth',3); await u.skill('Negotiation',3); await u.skill('Athletics',2); await u.skill('Car',2);
  await u.gear('head','Datajack'); await u.gear('deck','Fuchi Cyber-6');
  for(const [n,r] of [['Bod',6],['Evasion',6],['Masking',6],['Sensors',6]]) await u.tick('#deckCard',n,r);
  await mark('persona chips 6/6/6/6 (limit 3 x MPCP = 24)');
  await u.tick('#deckCard','Bod',9); await mark('Bod 9 on an MPCP 8 deck'); await u.tick('#deckCard','Bod',6);
  for(const [n,r] of [['Attack',6],['Sleaze',6],['Deception',5],['Analyze',4],['Browse',4],['Medic',4],['Shield',3]]) await u.tick('#deckCard',n,r);
  await mark('programs');
  await u.gear('deck','Response Increase 3'); await mark('tried Response Increase 3 on MPCP 8 (max MPCP/4 = 2)');
  await u.gear('guns','Ares Predator II'); await u.gear('armor','Lined Coat'); await u.gear('elec','Pocket Secretary');
  await u.contact('Ms. Kim, Renraku mid-level',1,'Contact'); await u.contact('Spider, decker friend',1,'Contact'); await u.cash();
 },
 deck2: async(u,p,mark)=>{ // Elf decker, house rule, Cyber-4
  await u.rules('house'); await u.prio({race:'E',magic:'D',attr:'C',skills:'B',res:'A'});
  await u.id({name:'Aislinn Moore',handle:'Byte',race:'Elf',magic:'none',concept:'Decker who talks her way in first'});
  await u.attrs({body:2,qui:3,str:1,cha:4,int:6,wil:4});
  await u.skill('Computer',6); await u.skill('Electronics',5); await u.skill('Negotiation',4); await u.skill('Etiquette',4,'Corporate'); await u.skill('Firearms',3); await u.skill('Stealth',3); await u.skill('Athletics',2); await u.skill('Car',3);
  await u.gear('head','Datajack'); await u.gear('deck','Fuchi Cyber-4'); await u.gear('deck','Response Increase 1');
  for(const [n,r] of [['Bod',4],['Evasion',4],['Masking',5],['Sensors',3],['Sleaze',6],['Deception',6],['Browse',4],['Analyze',3]]) await u.tick('#deckCard',n,r);
  await mark('Cyber-4 programs');
  await u.gear('guns','Ares Predator II'); await u.gear('armor','Lined Coat');
  await u.contact('Rico, Mr. Johnson',1,'Contact'); await u.contact('Old Zed, info broker',1,'Contact'); await u.cash();
 },
 rig1: async(u,p,mark)=>{ // Human rigger, standard rules
  await u.rules('standard'); await u.prio({race:'D',magic:'E',attr:'C',skills:'B',res:'A'});
  await u.id({name:'Dale Pruitt',handle:'Gearjammer',race:'Human',magic:'none',concept:'Smuggler with a van full of drones'});
  await u.attrs({body:3,qui:4,str:2,cha:2,int:6,wil:3});
  await u.skill('Car',6); await u.skill('Gunnery',5); await u.skill('Electronics',4); await u.skill('Car (B/R)',4); await u.skill('Electronics (B/R)',3); await u.skill('Firearms',3); await u.skill('Etiquette',2); await u.skill('Stealth',3);
  const vcr=await u.gear('body','Vehicle Control Rig',{rating:3}); await mark('VCR level 3 at creation'); await typeIn(p,`#g_r_${vcr}`,2);
  await u.gear('head','Datajack'); await u.gear('deck','Remote Control Deck');
  await u.gear('r2veh','GMC Bulldog Step-Van (Standard)'); await u.gear('r2veh','GM-Nissan Doberman',{qty:2}); await u.gear('r2veh','Steel Lynx Ground Combat Drone');
  await u.gear('rc','Remote Control Encryption Module'); await u.gear('guns','Ares Predator II'); await u.gear('armor','Lined Coat');
  await mark('rigger kit');
  await u.contact('Mama Rosa, mechanic',1,'Contact'); await u.contact('Ty, smuggler',1,'Contact'); await u.cash();
 },
 rig2: async(u,p,mark)=>{ // Dwarf rigger, house rule, cranial remote deck
  await u.rules('house'); await u.prio({race:'E',magic:'D',attr:'C',skills:'B',res:'A'});
  await u.id({name:'Brannoc Hale',handle:'Wrench',race:'Dwarf',magic:'none',concept:'Drone tinkerer'});
  await u.attrs({body:4,qui:4,str:2,cha:1,int:6,wil:3});
  await u.skill('Gunnery',6); await u.skill('Car',5); await u.skill('Electronics',5); await u.skill('Electronics (B/R)',4); await u.skill('Car (B/R)',4); await u.skill('Firearms',3); await u.skill('Etiquette',3);
  await u.gear('body','Vehicle Control Rig',{rating:1}); await u.gear('head','Remote Control Deck, cranial (CRD)'); await u.gear('r2veh','GM-Nissan Doberman'); await u.gear('r2veh','Steel Lynx Ground Combat Drone');
  await u.gear('guns','Ares Predator II'); await u.gear('armor','Armor Jacket');
  await mark('dwarf rigger kit');
  await u.contact('Hugo, parts dealer',1,'Contact'); await u.contact('Neela, fixer',1,'Contact'); await u.cash();
 },
 adept1: async(u,p,mark)=>{ // Human physical adept, standard rules
  await u.rules('standard'); await u.prio({race:'E',magic:'B',attr:'A',skills:'C',res:'D'});
  await u.id({name:'Mai Tran',handle:'Ghost',race:'Human',magic:'adept',trad:'Way of the warrior',concept:'Silent infiltrator'});
  await u.attrs({body:6,qui:6,str:5,cha:2,int:5,wil:6});
  await u.skill('Unarmed Combat',6); await u.skill('Armed Combat',4); await u.skill('Athletics',4); await u.skill('Stealth',4); await u.skill('Firearms',4); await u.skill('Etiquette',2);
  await u.power('Increased Reflexes','+2 dice'); await u.power('Killing Hands','(Str)M'); await u.power('Improved Ability',null,{skill:'Stealth (0.25/die)'}); await u.power('Combat Sense','Level 1');
  await mark('powers at book cost (Increased Reflexes +2 = 4)');
  await p.check('#irErrata'); await p.waitForTimeout(200); await mark('errata ticked (Increased Reflexes +2 = 3)');
  const extra=await u.power('Increased Reflexes','+3 dice'); await mark('second Increased Reflexes at +3 (over power points)'); await u.removePower(extra);
  const dj=await u.gear('head','Datajack'); await mark('datajack on an adept'); await u.removeGear(dj);
  await u.removePower(2); await u.gear('armor','Armor Jacket'); await u.gear('guns','Ares Predator II'); await u.gear('med','Medkit');
  await u.contact('Sensei Okoye',1,'Contact'); await u.contact('Jax, fixer',1,'Contact'); await u.cash();
 },
 adept2: async(u,p,mark)=>{ // Troll adept, house rule, Magic C
  await u.rules('house'); await u.prio({race:'E',magic:'C',attr:'A',skills:'B',res:'D'}); await u.id({magic:'adept'}); await mark('troll adept at Magic C under the house rule (adepts need B)'); await u.prio({magic:'B',skills:'C'});
  await u.id({name:'Oskar Rook',handle:'Rook',race:'Troll',magic:'adept',concept:'Bare-knuckle bodyguard'});
  await u.attrs({body:6,qui:5,str:6,cha:3,int:5,wil:5});
  await u.skill('Unarmed Combat',6); await u.skill('Armed Combat',5); await u.skill('Athletics',4); await u.skill('Stealth',3); await u.skill('Firearms',4); await u.skill('Car',2);
  await u.power('Killing Hands','(Str)S'); await u.power('Improved Ability',null,{skill:'Unarmed Combat (0.5/die)'}); await u.power('Increased Reflexes','+1 die'); await u.power('Combat Sense','Level 1');
  await mark('troll adept powers');
  await u.gear('armor','Armor Jacket'); await u.gear('guns','Ares Predator II');
  await u.contact('Mother Hesk, talismonger',1,'Contact'); await u.contact('Vance, club owner',1,'Contact'); await u.cash();
 },
 mage1: async(u,p,mark)=>{ // Human hermetic, standard rules, Resources B for foci
  await u.rules('standard'); await u.prio({race:'E',magic:'A',attr:'C',skills:'D',res:'B'});
  await u.id({name:'Elena Vasquez',handle:'Sigil',race:'Human',magic:'hermetic',trad:'Hermetic',concept:'MIT&T dropout combat mage'});
  await u.attrs({body:3,qui:3,str:2,cha:3,int:4,wil:5});
  await u.skill('Sorcery',6); await u.skill('Conjuring',5); await u.skill('Magical Theory',4); await u.skill('Etiquette',3); await u.skill('Stealth',2);
  await u.spell('Combat','Mana Bolt',5); await u.spell('Combat','Powerball',4); await u.spell('Detection','Detect Enemies',3); await u.spell('Health','Heal',4); await u.spell('Illusion','Improved Invisibility',3); await u.spell('Manipulation','Armor',3);
  await mark('six spells');
  await u.spell('Combat','Fireball',7); await mark('Fireball at Force 7 (creation max 6)');
  await u.gear('magic','Power Focus',{rating:1}); await u.gear('magic','Spell Lock'); await u.gear('magic','Hermetic Library, chip',{rating:4}); await u.gear('armor','Lined Coat'); await u.gear('guns','Ares Predator II');
  await mark('foci bought: spells 28 + bonding 6 = 34 of 35 Force Points');
  await u.contact('Prof. Adler, MIT&T',1,'Contact'); await u.contact('Nix, fixer',1,'Contact'); await u.cash();
 },
 mage2: async(u,p,mark)=>{ // Elf hermetic, standard rules (Race A, Magic B)
  await u.rules('standard'); await u.prio({race:'A',magic:'B',attr:'C',skills:'D',res:'E'});
  await u.id({name:'Caelan Rhys',handle:'Wisp',race:'Elf',magic:'hermetic',trad:'Hermetic',concept:'Elven illusionist'});
  await u.attrs({body:2,qui:3,str:2,cha:3,int:4,wil:6});
  await u.skill('Sorcery',6); await u.skill('Conjuring',4); await u.skill('Magical Theory',4); await u.skill('Etiquette',3); await u.skill('Stealth',3);
  await u.spell('Combat','Mana Bolt',4); await u.spell('Health','Heal',4); await mark('elf spells: 8 of 5 Force Points (Resources E)'); await u.removePower(1); await u.removePower(0); await u.spell('Combat','Mana Bolt',3); await u.spell('Illusion','Invisibility',2);
  const dj=await u.gear('head','Datajack'); await mark('datajack on a magician'); await u.removeGear(dj);
  await u.gear('armor','Lined Coat'); await mark('Resources E (500) with a Lined Coat (700)'); await u.removeGear(await p.$$eval('#gearBody input[id^="g_q_"]',x=>Math.max(...x.map(e=>+e.id.slice(4)))));
  await u.contact('Siobhan, talismonger',1,'Contact'); await u.contact('Felix, bartender',1,'Contact'); await u.cash();
 },
 shaman1: async(u,p,mark)=>{ // Human Dog shaman, standard rules
  await u.rules('standard'); await u.prio({race:'E',magic:'A',attr:'B',skills:'C',res:'D'});
  await u.id({name:'Joseph Twofeathers',handle:'Patch',race:'Human',magic:'shamanic',trad:'Dog',concept:'Street shaman and healer'});
  await u.totem('Dog');
  await u.attrs({body:4,qui:4,str:3,cha:5,int:4,wil:4});
  await u.skill('Sorcery',6); await u.skill('Conjuring',6); await u.skill('Etiquette',3,'Street'); await u.skill('Stealth',3); await u.skill('Firearms',3); await u.skill('Biotech',3,'First Aid');
  await u.spell('Detection','Detect Enemies',4); await u.spell('Health','Heal',5); await u.spell('Combat','Stun Bolt (Grimoire)',4); await u.spell('Illusion','Invisibility',3); await u.spell('Manipulation','Armor',4);
  await mark('dog shaman spells (20 of 15 Force Points)'); await u.removePower(4); await u.removePower(3);
  await u.gear('magic','Medicine Lodge Materials',{rating:3}); await u.gear('magic','Reusable Fetish, Health'); await mark('Dog shaman lodge + fetish'); await u.gear('armor','Lined Coat'); await u.gear('med','Medkit');
  await u.contact('Auntie Mae, soup kitchen',1,'Contact'); await u.contact('Officer Diaz, Lone Star',1,'Contact'); await u.cash();
 },
 shaman2: async(u,p,mark)=>{ // Ork Bear shaman, house rule
  await u.rules('house'); await u.prio({race:'E',magic:'A',attr:'B',skills:'C',res:'D'});
  await u.id({name:'Marta Grell',handle:'Ursa',race:'Ork',magic:'shamanic',trad:'Bear',concept:'Healer of the Ork Underground'});
  await u.totem('Bear');
  await u.attrs({body:5,qui:4,str:4,cha:4,int:4,wil:3});
  await u.skill('Sorcery',6); await u.skill('Conjuring',5); await u.skill('Biotech',4,'First Aid'); await u.skill('Unarmed Combat',3); await u.skill('Etiquette',3); await u.skill('Stealth',3);
  await u.spell('Health','Heal',5); await u.spell('Health','Treat',4); await u.spell('Combat','Mana Bolt',3); await u.spell('Detection','Detect Enemies',3);
  await mark('bear shaman spells');
  await u.gear('magic','Medicine Lodge Materials',{rating:2}); await u.gear('armor','Armor Jacket'); await u.gear('med','Medkit');
  await u.contact('Old Gruff, Underground elder',1,'Contact'); await u.contact('Doc Mbeki, clinic',1,'Contact'); await u.cash();
 },
 face1: async(u,p,mark)=>{ // Elf face, house rule
  await u.rules('house'); await u.prio({race:'E',magic:'D',attr:'B',skills:'A',res:'C'});
  await u.id({name:'Julian Sterling',handle:'Silk',race:'Elf',magic:'none',concept:'Smooth-talking negotiator'});
  await u.attrs({body:3,qui:4,str:2,cha:7,int:5,wil:3}); await mark('Charisma 7 points + elf 2 = 9 (elf max 8)');
  await u.attrs({body:3,qui:4,str:2,cha:6,int:5,wil:4});
  const ng=await u.skill('Negotiation',6); await p.selectOption(`#s_n_${ng}`,{label:'Concentration'}); await p.waitForTimeout(200); await mark('Negotiation concentration list: '+(await p.$eval(`#s_cs_${ng}`,e=>e.tagName==='SELECT'?[...e.options].map(o=>o.text).join('/'):'free text'))); await p.selectOption(`#s_cs_${ng}`,{index:1}).catch(()=>p.fill(`#s_cs_${ng}`,'Bargaining')); await p.waitForTimeout(420); await u.skill('Etiquette',6,'Corporate'); await u.skill('Leadership',4); await u.skill('Firearms',4); await u.skill('Stealth',4); await u.skill('Car',3); await u.skill('Computer',3); await u.skill('Athletics',3); await u.skill('Biotech',3);
  await u.lang('Japanese',4);
  await u.gear('bio','Tailored Pheromones',{rating:2}); await u.gear('guns','Ares Predator II'); await u.gear('armor','Lined Coat'); await u.gear('elec','Pocket Secretary'); await u.gear('elec','Wrist Phone');
  await mark('face kit');
  await u.contact('Ms. Tanaka, Mitsuhama',1,'Contact'); await u.contact('Lucky, fixer',1,'Contact'); await u.contact('Rhonda, club owner',1,'Contact'); await u.cash();
 },
};
