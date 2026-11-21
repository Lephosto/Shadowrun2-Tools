// Skills and concentrations (core p. 70-77), shared by the Runner Builder's skill picker and both tools' skillsoft pickers.
const SW='A specific weapon, e.g. Ares Predator', SV='A specific vehicle model';
const SKILLDB={
 'Armed Combat':{cat:'Combat',concs:{'Edged Weapons':SW,'Pole Arms/Staff':SW,'Whips/Flails':SW,'Clubs':SW}},
 'Unarmed Combat':{cat:'Combat',concs:{'Subduing Combat':'','Cyber-Implant Weaponry':SW,'Martial Arts Style':'A specific technique, e.g. Strikes'}},
 'Demolitions':{cat:'Combat',concs:{'Commercial Explosives':'','Plastic Explosives':''}},
 'Firearms':{cat:'Combat',concs:{'Pistols':SW,'Rifles':SW,'Submachine Guns':SW,'Light Machine Guns':SW,'Grenade Launchers':SW,'Tasers':SW}},
 'Gunnery':{cat:'Combat',concs:{'Machine Guns':SW,'Missile/Rocket Launchers':SW,'Assault Cannon':SW,'Vehicle-Mounted Cannon':SW}},
 'Projectile Weapons':{cat:'Combat',concs:{'Bows':SW,'Crossbows':SW}},
 'Throwing Weapons':{cat:'Combat',concs:{'Shafted':SW,'Non-Aerodynamic':['Grenades','Knives'],'Aerodynamic':['Shuriken','Airfoil Grenades']}},
 'Athletics':{cat:'Physical',concs:{'Running':'','Climbing':'','Lifting':'','Jumping':'','Swimming':''}},
 'Stealth':{cat:'Physical',concs:{'Urban':'An aspect, e.g. Sneaking or Shadowing','Wilderness':'An aspect','Farmland':'An aspect'}},
 'Biotech':{cat:'Technical',concs:{'Transimplant Surgery':['Headware','Bodyware','Organic Replacements'],'Organ Culture':'An organ or limb','Replacement Construction':'An organ or limb','Extended Care':'','First Aid':'e.g. Combat Lifesaver'}},
 'Computer':{cat:'Technical',concs:{'Hardware':['Mainframes','Micros','Interface Tech','Implant Tech'],'Software':['Decking','Matrix Programming','Non-Matrix Programming','Interface Programming','Implant Programming']}},
 'Electronics':{cat:'Technical',concs:{'Control Systems':'','Electronic Warfare':'','Maglocks':'','Linking between Devices':'','Diagnostics':''}},
 'Conjuring':{cat:'Magical',concs:{'Elemental':['Fire','Water','Air','Earth'],'Nature Spirit':'A spirit type'}},
 'Sorcery':{cat:'Magical',concs:{'Spellcasting':['Combat','Detection','Health','Illusion','Manipulation'],'Ritual Sorcery':['Combat','Detection','Health','Illusion','Manipulation']}},
 'Etiquette':{cat:'Social',concs:{'Corporate':'','Matrix':'','Media':'','Street':'A subculture or gang','Tribal':'A tribe'}},
 'Interrogation':{cat:'Social',concs:{'Verbal':'','Machine-Aided':['Lie Detectors','Voice-Stress Analysis']}},
 'Leadership':{cat:'Social',concs:{'Political':['Strategy','Tactics','Morale'],'Military':['Strategy','Tactics','Morale'],'Commercial':['Strategy','Tactics','Morale']}},
 'Negotiation':{cat:'Social',concs:{'Bargain':'','Bribe':'','Fast Talk':''}},
 'Bike':{cat:'Vehicle',concs:{'Two-wheeler':SV,'Three-wheeler':SV,'Racing':SV}},
 'Car':{cat:'Vehicle',concs:{'Passenger Vehicle':SV,'Truck':SV,'Racing':SV,'Remote Operation':'A vehicle category'}},
 'Hovercraft':{cat:'Vehicle',concs:{'Passenger Craft':SV,'Transport Craft':SV,'Racing':SV,'Remote Operation':'A vehicle category'}},
 'Motorboat':{cat:'Vehicle',concs:{'Pleasure Craft':SV,'Transport':SV,'Racing':SV,'Remote Operation':'A vehicle category'}},
 'Rotor Craft':{cat:'Vehicle',concs:{'Tilt-Rotor':SV,'Fixed-Rotor':SV,'Remote Operation':'A vehicle category'}},
 'Sailboat':{cat:'Vehicle',concs:{'Pleasure Craft':SV,'Transport':SV,'Racing':SV}},
 'Vectored Thrust':{cat:'Vehicle',concs:{'Vertical Take-Off and Landing':SV,'LAV Craft':SV,'Remote Operation':'A vehicle category'}},
 'Winged Plane':{cat:'Vehicle',concs:{'Gliders':SV,'Jets':SV,'Propellers':SV,'Racing':SV,'Remote Operation':'A vehicle category'}},
 'Biology':{cat:'Knowledge',concs:{'Zoology':'','Botany':'','Medicine':'','Parazoology':'','Parabotany':''}},
 'Computer Theory':{cat:'Knowledge',concs:{'Hardware':['Mainframes','Micros','Interface Tech','Implant Tech'],'Software':['Decking','Matrix Programming','Non-Matrix Programming','Interface Programming','Implant Programming'],'Matrix Theory':''}},
 'Cybertechnology':{cat:'Knowledge',concs:{'Headware':'A specific device','Bodyware':'A specific device'}},
 'Magical Theory':{cat:'Knowledge',concs:{'Design':['Shamanic','Hermetic'],'History':'A continent'}},
 'Military Theory':{cat:'Knowledge',concs:{'Military History':'A continent or period','Tactics':['Air','Land','Sea']}},
 'Physical Sciences':{cat:'Knowledge',concs:{'Engineering':'','Physics':'','Chemistry':'','Geology':''}},
 'Psychology':{cat:'Knowledge',concs:{'Individual Behavior':'','Group Behavior':'','Deviant Behavior':''}},
 'Sociology':{cat:'Knowledge',concs:{'History':'','Anthropology':'','Archaeology':''}}
};
['Armed Combat','Firearms','Projectile Weapons','Throwing Weapons','Gunnery','Computer','Electronics','Biotech','Bike','Car','Hovercraft','Motorboat','Rotor Craft','Sailboat','Vectored Thrust','Winged Plane'].forEach(k=>{SKILLDB[k+' (B/R)']={cat:'Build/Repair',concs:{}};});
// ---------- Skillsofts (core p. 248): what skill a chip carries, down to concentration and specialization ----------
// ActiveSofts copy Active Skills (Combat, Physical, Technical, Social, Vehicle, B/R; never Sorcery or Conjuring);
// KnowSofts copy Knowledge Skills; LinguaSofts copy a language (core p. 70-72, 248).
const SOFT_CATS={ActiveSoft:['Combat','Physical','Technical','Social','Vehicle','Build/Repair'],KnowSoft:['Knowledge']};
function softSpec(itemName){const n=String(itemName||''); const t=/^ActiveSoft/.test(n)?'ActiveSoft':/^KnowSoft/.test(n)?'KnowSoft':/^LinguaSoft/.test(n)?'LinguaSoft':/^DataSoft/.test(n)?'DataSoft':''; return {t,k:/concentration/.test(n)?'conc':/specialization/.test(n)?'spec':'gen'};}
function softSkills(t){return Object.keys(SKILLDB).filter(n=>(SOFT_CATS[t]||[]).includes(SKILLDB[n].cat));}
function softConcs(sk){return SKILLDB[sk]?Object.keys(SKILLDB[sk].concs):[];}
function softSpecs(sk,cc){const v=SKILLDB[sk]&&SKILLDB[sk].concs[cc]; return Array.isArray(v)?{list:v,hint:''}:{list:null,hint:typeof v==='string'?v:''};}
// the skill a chip line carries; older lines only had the skill typed in their note
function softOf(o,itemName){const {k}=softSpec(itemName); if(o&&(o.sk||o.cc||o.cs)) return {sk:o.sk||'',cc:o.cc||'',cs:o.cs||''}; const n=String(o&&o.note||'').trim(); if(!n) return {sk:'',cc:'',cs:''};
  if(k==='gen') return {sk:n,cc:'',cs:''}; const hit=Object.keys(SKILLDB).find(s=>softConcs(s).some(c=>c.toLowerCase()===n.toLowerCase())); if(k==='conc') return hit?{sk:hit,cc:softConcs(hit).find(c=>c.toLowerCase()===n.toLowerCase()),cs:''}:{sk:'',cc:n,cs:''}; return {sk:'',cc:'',cs:n};}
function softLabel(v){return (v&&(v.cs||v.cc||v.sk))||'';}
function softText(v,itemName){const {t}=softSpec(itemName); if(!v||!softLabel(v)) return ''; return t==='LinguaSoft'?v.sk:[v.sk,v.cc,v.cs].filter(Boolean).join(' › ');}
// dropdowns for one chip: skill, then concentration, then specialization (each only when the chip type needs it)
function softPickHTML(itemName,v,key,o){o=o||{}; const {t,k}=softSpec(itemName); const q=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); const dis=o.disabled?' disabled':'';
  const lab=(l,inner)=>`<label class="sfp"><span class="sfpk">${l}</span>${inner}</label>`, A=f=>`data-sfp="${q(key)}" data-sff="${f}"${dis}`;
  if(t==='DataSoft'||!t) return '';
  if(t==='LinguaSoft') return lab('Language',`<input ${A('sk')} value="${q(v.sk)}" placeholder="e.g. Japanese"${o.langs&&o.langs.length?` list="sfpLang_${q(key)}"`:''}>${o.langs&&o.langs.length?`<datalist id="sfpLang_${q(key)}">${o.langs.map(n=>`<option value="${q(n)}">`).join('')}</datalist>`:''}`);
  const L=softSkills(t), known=L.includes(v.sk), other=!!v.sk&&!known||v.oth;
  let h=lab('Skill',`<select ${A('sk')}><option value="" ${!v.sk&&!v.oth?'selected':''}>Pick the skill</option>${L.map(n=>`<option value="${q(n)}" ${v.sk===n?'selected':''}>${q(n)}</option>`).join('')}${t==='KnowSoft'?`<option value="__other" ${other?'selected':''}>Other (type it)</option>`:''}</select>`);
  if(other) h+=lab('Knowledge skill',`<input ${A('sko')} value="${q(known?'':v.sk)}" placeholder="e.g. Seattle Gangs">`);
  if(k!=='gen'){const C=known?softConcs(v.sk):[]; h+=C.length?lab('Concentration',`<select ${A('cc')}><option value="" ${!v.cc?'selected':''}>Pick one</option>${C.map(n=>`<option value="${q(n)}" ${v.cc===n?'selected':''}>${q(n)}</option>`).join('')}</select>`):lab('Concentration',`<input ${A('cc')} value="${q(v.cc)}" placeholder="${v.sk?'Name it':'Pick the skill first'}">`);}
  if(k==='spec'){const S2=v.sk&&v.cc?softSpecs(v.sk,v.cc):{list:null,hint:''}; h+=S2.list?lab('Specialization',`<select ${A('cs')}><option value="" ${!v.cs?'selected':''}>Pick one</option>${S2.list.map(n=>`<option value="${q(n)}" ${v.cs===n?'selected':''}>${q(n)}</option>`).join('')}</select>`):lab('Specialization',`<input ${A('cs')} value="${q(v.cs)}" placeholder="${q(S2.hint||(v.cc?'Name it':'Pick the concentration first'))}">`);}
  return h;}
// apply one dropdown change to a chip's {sk,cc,cs}; a new skill clears the concentration, a new concentration clears the specialization
function softSet(v,f,val){v=Object.assign({sk:'',cc:'',cs:''},v); val=String(val||'').trim();
  if(f==='sk'){if(val==='__other'){v.oth=true; v.sk='';} else {delete v.oth; if(val!==v.sk){v.sk=val; v.cc=''; v.cs='';}}}
  else if(f==='sko'){v.oth=true; v.sk=val; v.cc=''; v.cs='';}
  else if(f==='cc'){if(val!==v.cc){v.cc=val; v.cs='';}}
  else if(f==='cs') v.cs=val;
  return v;}
