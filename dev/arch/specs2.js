// Phase 2: each runner gets 40 Good Karma, 500,000¥ and (if Awakened) two initiations, spent through the
// established-runner tools and the Gear Locker, the way a player would.
const R=['ammo:Regular Ammo (10 rounds)'];
module.exports={
 sam1:{karma:[['Willpower 2 → 3'],['Charisma 2 → 3'],['Pistols (concentration) 7 → 8'],['Armed Combat (skill) 4 → 5'],['Stealth (skill) 3 → 4']],learn:['Demolitions'],
  shop:[['r2veh:Eurocar Westwind 2000 (Turbo)'],['armor:Heavy Security Armor',{}],['guns:Ingram Smartgun'],['ammo:APDS Ammo (10 rounds)',{qty:4,forGun:'Ingram'}],['ammo:Spare Clip',{qty:3,forGun:'Ingram'}],
   ['bio:Damage Compensator',{rating:2}],['bio:Trauma Damper'],['bio:Platelet Factory'],['med:DocWagon Gold (1 year)'],['boom:Offensive Grenade',{qty:4}],['med:Trauma Patch',{qty:4}]]},
 sam2:{karma:[['Intelligence 3 → 4'],['Willpower 2 → 3'],['Submachine Guns (concentration) 6 → 7'],['Stealth (skill) 3 → 4']],
  shop:[['r2veh:Harley-Davidson Scorpion'],['armor:Full Heavy Armor'],['bio:Cerebral Booster',{rating:1}],['bio:Damage Compensator',{rating:2}],['head:Cybereyes',{ticks:['Thermographic Eyes','Flare Compensation']}],['med:DocWagon Platinum (1 year)'],['boom:Smoke Grenade',{qty:6}],['ammo:APDS Ammo (10 rounds)',{qty:6,forGun:'Ingram'}]]},
 deck1:{karma:[['Computer (skill) 6 → 7'],['Electronics (skill) 4 → 5'],['Willpower 4 → 5']],
  shop:[['deck:Response Increase 2'],['deck:Hitcher Jack',{rating:1}],['elec:Tacticom Portable Master Unit'],['armor:Armor Jacket'],['med:DocWagon Gold (1 year)']],
  after:async(p,u)=>{for(const [n,r] of [['Attack',8],['Sleaze',8],['Medic',6],['Analyze',6]]) await u.tick('#deckCard',n,r);}},
 deck2:{karma:[['Computer (skill) 6 → 7'],['Charisma 6 → 7'],['Negotiation (skill) 4 → 5']],
  shop:[['deck:Fuchi Cyber-6'],['armor:Armor Jacket'],['med:DocWagon Gold (1 year)'],['elec:Pocket Secretary']],
  after:async(p,u,log)=>{ // retire the old Cyber-4: remove it from Gear and see whether the programs follow the new deck
    const i=await p.$$eval('#gearBody tr',rows=>{for(const r of rows){if(/Fuchi Cyber-4/.test(r.innerText)){const q=r.querySelector('input[id^="g_q_"]'); if(q) return +q.id.slice(4);}} return -1;});
    if(i>=0){await p.locator(`#gearBody tr:has(#g_q_${i})`).locator('button[aria-label="Remove item"]').click(); await p.waitForTimeout(300);} else log.push('could not find the old Cyber-4 row');
    for(const [n,r] of [['Attack',6],['Sleaze',8],['Deception',8]]) await u.tick('#deckCard',n,r);}},
 rig1:{karma:[['Car (skill) 6 → 7'],['Gunnery (skill) 5 → 6'],['Reaction'],['Quickness 4 → 5']],
  shop:[['r2veh:Eurocar Westwind 2000 (Standard)'],['r2veh:Steel Lynx Ground Combat Drone'],['deck:Remote Control Deck',{ticks:[]}],['rc:Remote Control ECCM',{rating:2}],['armor:Armor Jacket'],['med:DocWagon Gold (1 year)']]},
 rig2:{karma:[['Gunnery (skill) 6 → 7'],['Quickness 3 → 4'],['Car (skill) 5 → 6']],
  shop:[['body:Vehicle Control Rig',{rating:2}],['r2veh:GMC Bulldog Step-Van (BC Var.)'],['r2veh:GM-Nissan Doberman',{qty:2}],['armor:Lined Coat'],['med:DocWagon Gold (1 year)']],
  after:async(p,u,log)=>{ // upgrading the rig: the old level 1 has to come out
    const i=await p.$$eval('#gearBody tr',rows=>{for(const r of rows){if(/Vehicle Control Rig/.test(r.innerText)){const rr=r.querySelector('input[id^="g_r_"]'); const q=r.querySelector('input[id^="g_q_"]'); if(rr&&rr.value==='1'&&q) return +q.id.slice(4);}} return -1;});
    if(i>=0){await p.locator(`#gearBody tr:has(#g_q_${i})`).locator('button[aria-label="Remove item"]').click(); await p.waitForTimeout(300);} else log.push('could not find the old VCR 1 row');}},
 adept1:{init:['self','self'],power:[['Improved Ability',null,{skill:'Stealth (0.25/die)'}]],
  shop:[['melee:Katana'],['armor:Partial Heavy Armor'],['r2veh:Harley-Davidson Scorpion'],['med:DocWagon Gold (1 year)'],['boom:AFR-7 Flash Grenade',{qty:4}],['bio:Damage Compensator',{rating:1}]]},
 adept2:{init:['groupOrd','groupOrd'],karma:[['Bond '],['Willpower 4 → 5'],['Athletics (skill) 4 → 5']],power:[['Improved Ability',null,{skill:'Armed Combat (0.5/die)'}]],
  shop:[['magic:Weapon Focus, Reach 1',{rating:1}],['armor:Full Heavy Armor'],['med:DocWagon Platinum (1 year)']]},
 mage1:{init:['group','group'],karma:[['Bond '],['Mana Bolt (spell) Force 5 → 6']],spells:[['Detection','Clairvoyance',3]],
  shop:[['magic:Power Focus',{rating:2}],['magic:Hermetic Library, chip',{rating:6}],['armor:Armor Jacket'],['med:DocWagon Gold (1 year)']]},
 mage2:{init:['selfOrd','selfOrd'],spells:[['Illusion','Chaos',4],['Health','Heal',4]],
  shop:[['magic:Spell Lock'],['magic:Hermetic Library, chip',{rating:5}],['armor:Lined Coat'],['med:DocWagon Gold (1 year)'],['magic:Power Focus',{rating:1}]]},
 shaman1:{init:['groupOrd','groupOrd'],karma:[['Bond '],['Heal (spell) Force 5 → 6']],spells:[['Manipulation','Armor',4]],
  shop:[['magic:Power Focus',{rating:1}],['magic:Medicine Lodge Materials',{rating:6}],['armor:Armor Jacket'],['med:DocWagon Gold (1 year)']]},
 shaman2:{init:['self','self'],
  shop:[['magic:Medicine Lodge Materials',{rating:5}],['magic:Spirit Focus',{rating:2}],['armor:Partial Heavy Armor'],['r2veh:Ford Americar']]},
 face1:{karma:[['Negotiation (skill) 5 → 6'],['Leadership (skill) 4 → 5'],['Willpower 4 → 5']],learn:['Etiquette (Street)'],
  shop:[['bio:Tailored Pheromones',{rating:3}],['r2veh:Eurocar Westwind 2000 (Standard)'],['armor:Lined Coat'],['elec:Pocket Secretary'],['med:DocWagon Platinum (1 year)'],['bio:Cerebral Booster',{rating:1}]]},
};
