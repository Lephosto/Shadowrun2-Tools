const SECN=['no','Blue','Green','Orange','Red']; // Security Code colors, core p. 165
/* Runner Builder 2: three modes on top of the Builder (Build / Game night / After the session).
   Reads the Builder's own state S and helpers, so every number matches the sheet. Rules cites are printed core pages. */
(function(){
'use strict';
const E=s=>esc(s);
const SIGN=x=>x>0?'+'+x:x<0?'−'+(-x):'+0';
const L4='LMSD', BOXES={L:1,M:3,S:6,D:10};
// Rule of Six (core p. 32): only when the target number is over 6, and a die stops rolling again once it reaches the target number.
// parts (optional) collects each die's rolls, so a card can show an exploded die as 6+5.
const d6x=(tn,parts)=>{let t=0,x;const p=[];do{x=1+Math.floor(Math.random()*6);t+=x;p.push(x);}while(x===6&&tn>6&&t<tn&&t<60); if(parts) parts.push(p); return t;};
const r20=(n,tn)=>tn<=6?`[[${n}d6>${tn}]]`:`[[${n}d6!!6>${tn}]]`;
// every damage code in the text (a gun can show two, e.g. flechette vs unarmored / armored): add Power, then levels (max D)
const bump=(d,lv)=>String(d||'').replace(/(\d+)([LMSD])/g,(m,n,l)=>n+L4[Math.min(3,L4.indexOf(l)+lv)]);
const pow=(d,p)=>String(d||'').replace(/(\d+)([LMSD])/g,(m,n,l)=>(+n+p)+l);
let ST={}; try{ST=JSON.parse(localStorage.getItem('sr2-b2')||'{}')||{};}catch(e){ST={};}
const keep=()=>{try{localStorage.setItem('sr2-b2',JSON.stringify({tab:B.tab,gv:B.gv}));}catch(e){}};
// per-session table state (not saved with the character)
const B={tab:ST.tab||'build',gv:ST.gv==='gear'?'gear':'play',wid:'unarmed',mode:'s1',rng:0,amSel:'',sit:{},msit:{},gm:0,spend:0,force:0,dmgLv:'M',tnBase:4,fired:0,pool:null,poolMax:null,karma:null,roll:null,copy:null,
  gh:{kind:'ball',pow:9,lvl:'M',fl:true,att:0,spend:0,roll:null,kdSrc:[]}, sk:{tn:4,res:''}, ini:null, af:{gk:0,kp:0,kbuy:0,nin:0,nout:0,note:'',phys:null,stun:null,use:{},saved:''}, kfrom:'own', kvote:false, kdSrc:[], kOpen:null, tkOpen:false, sitOpen:false, vitOpen:false, faN:3};
// ---------- rules tables (core p. 89, 101) ----------
// Visibility Table (core p. 89). Columns: normal, low-light cybernetic/electronic, low-light natural, thermographic cybernetic/electronic, thermographic natural.
// "If the table listing is split by a slash, the first modifier is for cybernetic or electronic vision and the second for natural, metahuman vision."
// Thermal smoke: normal and low-light as heavy smoke; thermographic as normal vision in heavy smoke.
const VIS=[['n','Clear',0,0,0,0,0],['full','Full darkness',8,8,8,4,2],['min','Minimal light',6,4,2,4,2],['part','Partial light',2,1,0,2,1],['glare','Glare',2,4,2,4,2],['mist','Mist',2,2,0,0,0],['ls','Light smoke, fog, rain',4,4,2,0,0],['hs','Heavy smoke, fog, rain',6,6,4,1,0],['ts','Thermal smoke, heavy',6,6,4,6,6]];
const VISK=[['normal vision',2],['cybernetic low-light',3],['natural low-light',4],['cybernetic thermographic',5],['natural thermographic',6]];
const SITS=[['tgt','Target is',[['n','Moving normally',0],['run','Running',2],['still','Stationary',-1]]],
 ['cov','Target cover',[['n','In the open',0],['part','Partial cover',4],['blind','Can’t be seen (blind fire)',8]]],
 ['me','You are',[['n','Standing',0],['walk','Walking',1],['walkd','Walking, difficult ground',2],['run','Running',4],['rund','Running, difficult ground',6]]],
 ['melee','You’re in melee with',[['0','Nobody',0],['1','1 opponent',2],['2','2 opponents',4],['3','3 opponents',6]]],
 ['two','Second firearm',[['n','No',0],['y','Firing a second gun',2]]],
 ['multi','Other targets this phase',[['0','None',0],['1','1 more',2],['2','2 more',4]]]];
const MSITS=[['fr','Friends in the melee',[['0','None',0],['1','1 friend',-1],['2','2 friends',-2],['3','3 friends',-3],['4','4 or more',-4]]],
 ['of','Opponent’s friends',[['0','None',0],['1','1 friend',1],['2','2 friends',2],['3','3 friends',3],['4','4 or more',4]]],
 ['reach','Opponent’s reach',[['0','0: unarmed, knife',0],['1','1: sword, club, troll barehanded',1],['2','2: pole arm, whip',2],['3','3: troll with a pole arm',3]]],
 ['pos','Position',[['n','Even footing',0],['sup','Superior position',-1]]],
 ['prone','Opponent is',[['n','Standing',0],['prone','Prone',-2]]],
 ['mt','Other targets',[['0','None',0],['1','1 more',2],['2','2 more',4]]]];
// Base damage level of each combat spell as printed (core p. 151; The Grimoire p. 126-127). 's' marks Stun damage.
const SPELLDL={'Fireball':'S','Hellblast':'D','Mana Bolt':'S','Mana Dart':'L','Mana Missile':'M','Manaball':'M','Power Bolt':'S','Power Dart':'L','Power Missile':'M','Powerball':'M','Ram':'S','Sleep':'Ms',
 'Death Touch':'D','Fire Bolt':'S','Fire Cloud':'M','Fire Dart':'L','Fire Missile':'M','Mana Cloud':'M','Manablast':'M','Powerblast':'M','Ram Touch':'S','Slay (Race/Species)':'S','Spirit Bolt':'S','Sterilize':'D',
 'Stun Bolt':'Ss','Stun Cloud':'Ms','Stun Missile':'Ms','Stun Touch':'Ss','Stunball':'Ss','Stunblast':'Ss','Urban Renewal':'S','Wrecker':'S'};
const spellDL=n=>SPELLDL[String(n||'').replace(/ \((Grimoire|Awakenings)\)$/,'')]||null;
const HITS={ball:'Bullet (Ballistic armor)',imp:'Melee, unarmed or thrown (Impact armor)',blast:'Grenade or explosive blast (Impact armor)',flech:'Flechette',apds:'APDS',gel:'Gel round',mana:'Mana combat spell (Willpower)',phys:'Physical combat spell (Body)',icp:'IC or a decker attacks your persona',black:'Black IC (to your body)'};
// Hit codes (fix8, 2026-11-23): the shooter copies one line, the target pastes it into Got hit. Only text moves, and only when a person copies and pastes it.
const HITWORD={ball:'Bullet',flech:'Flechette',apds:'APDS',gel:'Gel',imp:'Melee',blast:'Blast',mana:'Mana spell',phys:'Physical spell'};
function hitKindOf(W){if(!W) return null; if(W.kind==='spell') return W.sp&&W.sp.ty==='M'?'mana':'phys'; if(W.kind==='melee') return 'imp'; if(W.kind==='gun'&&W.grenade) return 'blast';
  if(W.kind==='gun'||W.kind==='drone'){let t=''; if(W.gid){const at=(S.ammoT||{})[W.gid]; if(at&&at.in&&at.in.n) t=AMSHORT(at.in.t)||'';} return /flech/i.test(t)?'flech':/APDS/i.test(t)?'apds':/\bgel\b/i.test(t)?'gel':'ball';}
  return null;}
function hitCodeOf(W,dmg,succ,F){const k=hitKindOf(W); if(!k) return ''; if(!succ&&k!=='blast') return ''; // a miss sends nothing; a grenade still goes off where it lands (core p. 97)
  let p,l,st; if(k==='mana'||k==='phys'){p=F; l=W.lv; st=!!W.stun;} else {const d=String(dmg||''), m=(k==='flech'&&d.match(/(\d+)\s*([LMSD])\s*vs armored/))||d.match(/(\d+)\s*([LMSD])/); if(!m) return ''; p=+m[1]; l=m[2]; st=/stun/i.test(d)&&k!=='gel';} // flechette sends the weapon's own code; the target's sheet adds the level if they wear no armor (core p. 93)
  if(!p||!l) return ''; const nm=(W.kind==='spell'?W.sname:W.n)||''; return `Hit: ${HITWORD[k]} ${p}${l}${st?' Stun':''} · ${succ} success${succ===1?'':'es'}${nm?' · '+String(nm).replace(/ ×\d+$/,''):''}`;}
function hitParse(t){t=String(t||'').replace(/\s+/g,' ').trim(); const m=t.match(/^(?:hit\s*:?\s*)?(bullet|flechette|apds|gel|melee|blast|mana spell|physical spell)\s+(?:force\s+)?(\d{1,2})\s*([LMSD])\b(\s*stun)?\s*[·|,;\/-]?\s*(\d{1,2})\s+success/i); if(!m) return null;
  const k={bullet:'ball',flechette:'flech',apds:'apds',gel:'gel',melee:'imp',blast:'blast','mana spell':'mana','physical spell':'phys'}[m[1].toLowerCase()];
  return {kind:k,pow:+m[2],lvl:m[3].toUpperCase(),stun:!!m[4],att:+m[5],what:(t.split('·')[2]||'').trim()};}
function hitApply(){const h=hitParse(B.hitTxt); if(!h){B.hitMsg={t:'That line isn’t a hit code. A hit code looks like this: Hit: Bullet 9M · 3 successes · Ares Predator',bad:1}; return redraw();}
  let lv=h.lvl, fx=''; if(h.kind==='flech'){const ar=armorTotals(), bare=!(ar.b||ar.i)&&!(hasDerm()||gearLevel('body:Dermal Plating')); if(bare){lv=L4[Math.min(3,L4.indexOf(lv)+1)]; fx=' Flechette against no armor: one level higher (core p. 93).';} else fx=' Flechette against armor: no extra level (core p. 93).';}
  Object.assign(B.gh,{kind:h.kind,pow:h.pow,lvl:lv,stun:h.stun,att:h.att,roll:null,spend:0,fl:h.kind==='flech'?false:B.gh.fl}); B.hitMsg={t:`Filled in: ${HITS[h.kind]}, ${h.pow}${lv}${h.stun&&h.kind!=='gel'?' Stun':''}, ${h.att} success${h.att===1?'':'es'}${h.what?' ('+h.what+')':''}.${fx} Check it, pick your pool dice and roll.`}; redraw();}
// Core contacts (core p. 203-213): [id, name, page, Charisma, Intelligence, [[Etiquette, rating]...]]. Checked against the page images 2026-11-21.
const CTBOOK=[["bountyhunter", "Bounty Hunter", "p. 203", 1, 4, [["Etiquette (Corporate)", 3], ["Etiquette (Street)", 5]]], ["bartender", "Bartender", "p. 203", 3, 2, [["Etiquette (Street)", 4]]], ["companyman", "Company Man", "p. 204", 2, 4, [["Etiquette (Corporate)", 3]]], ["cityofficial", "City Official", "p. 204", 5, 3, [["Etiquette (Corporate)", 4], ["Etiquette (Tribal)", 3]]], ["corporatesecretary", "Corporate Secretary", "p. 205", 4, 4, [["Etiquette (Corporate)", 4]]], ["corporatesecurityguard", "Corporate Security Guard", "p. 205", 2, 2, [["Etiquette (Corporate)", 2]]], ["dwarftechnician", "Dwarf Technician", "p. 206", 2, 6, [["Etiquette (Street or Corporate)", 3]]], ["elvenhitman", "Elven Hitman", "p. 206", 2, 4, [["Etiquette (Corporate)", 3], ["Etiquette (Street)", 3]]], ["gangboss", "Gang Boss", "p. 207", 4, 4, [["Etiquette (Street)", 6]]], ["fixer", "Fixer", "p. 207", 3, 5, [["Etiquette (Street)", 5]]], ["humanispoliclubmember", "Humanis Policlub Member", "p. 208", 2, 2, [["Etiquette (Street)", 3]]], ["mechanic", "Mechanic", "p. 208", 2, 6, []], ["mediaproducer", "Media Producer", "p. 209", 5, 4, [["Etiquette (Corporate)", 4], ["Etiquette (Media)", 4], ["Etiquette (Street)", 4]]], ["metahumanrightsactivist", "Metahuman Rights Activist", "p. 209", 2, 2, [["Etiquette (Media)", 5]]], ["mrjohnson", "Mr. Johnson", "p. 210", 4, 6, [["Etiquette (Corporate)", 8]]], ["squatter", "Squatter", "p. 210", 1, 2, [["Etiquette (Street)", 3]]], ["streetdoc", "Street Doc", "p. 211", 2, 4, [["Etiquette (Street)", 3]]], ["streetcop", "Street Cop", "p. 211", 2, 3, [["Etiquette (Corporate)", 2], ["Etiquette (Street)", 4]]], ["talismonger", "Talismonger", "p. 212", 2, 3, [["Etiquette (Street)", 4]]], ["tribalchief", "Tribal Chief", "p. 212", 4, 4, [["Etiquette (Corporate)", 4], ["Etiquette (Tribal)", 8]]], ["trollbouncer", "Troll Bouncer", "p. 213", 1, 1, [["Etiquette (Street)", 2]]], ["yakuzaboss", "Yakuza Boss", "p. 213", 5, 6, [["Etiquette (Corporate)", 4], ["Etiquette (Street)", 5]]]];
const CTWORDS=[['fixer','fixer'],['fence','fixer'],['doc','streetdoc'],['talisman','talismonger'],['mechanic','mechanic'],['bartend','bartender'],['cop','streetcop'],['lone star','streetcop'],['johnson','mrjohnson'],['secretary','corporatesecretary'],['technician','dwarftechnician'],['gang','gangboss'],['yakuza','yakuzaboss'],['bouncer','trollbouncer'],['squatter','squatter'],['producer','mediaproducer'],['media','mediaproducer'],['activist','metahumanrightsactivist'],['chief','tribalchief'],['official','cityofficial'],['bounty','bountyhunter'],['hitman','elvenhitman'],['company man','companyman'],['security guard','corporatesecurityguard'],['humanis','humanispoliclubmember']];
function ctGuess(c){const t=((c.role||'')+' '+(c.name||'')).toLowerCase(); const w=CTWORDS.find(([k])=>t.includes(k)); return w?w[1]:'';}
function ctStats(c){if(!c) return null; if(c.cb==='own') return {n:'their own numbers',et:[['Etiquette',Math.max(0,+c.ce||0)]],cha:Math.max(0,+c.cc||0),int:Math.max(0,+c.ci||0),own:true};
  const id=c.cb==null?ctGuess(c):c.cb; const b=CTBOOK.find(x=>x[0]===id); return b?{n:b[1]+' (core '+b[2]+')',et:b[5],cha:b[3],int:b[4],id:b[0],guess:c.cb==null}:null;}
function ctEtq(st,c){if(!st) return null; if(!st.et.length||!st.et.some(x=>x[1]>0)) return {l:'no Etiquette: defaults to Charisma',r:st.cha,def:true}; const i=Math.min(st.et.length-1,Math.max(0,+c.cei||0)); const pick=c.cei!=null?st.et[i]:st.et.reduce((m,x)=>x[1]>m[1]?x:m,st.et[0]); return {l:pick[0],r:pick[1]};}
// ---------- Slotted chips (core p. 248; swapping one is a Simple Action, p. 82) ----------
// A slotted skillsoft replaces the runner's own rating for that skill, and ActiveSofts bring no Dice Pools.
function chipLines(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>g&&g.key&&GEARDB[g.key]&&GEARDB[g.key].soft&&GEARDB[g.key].soft!=='DataSoft');}
function chipInfo(g){return softOf(g,GEARDB[g.key].n);}
function chipSkill(g){return softLabel(chipInfo(g));} // what a roll is called: the specialization, else the concentration, else the skill
function chipKind(g){return softSpec(GEARDB[g.key].n).k;}
function chipRig(){const lv=k=>(typeof gearLevel==='function'?gearLevel(k):0)||0; const sw=Math.max(lv('body:Skillwires'),lv('body:Skillwire Plus'));
  const jacks=S.gear.filter(g=>g.key==='head:Chipjack').reduce((a,g)=>a+(+g.qty||1),0)+(sw?1:0);
  const mem=S.gear.filter(g=>/^head:Headware Memory/.test(g.key)).reduce((a,g)=>a+(+g.r||0)*(+g.qty||1),0);
  const dsl=S.gear.some(g=>g.key==='head:Datasoft Link'); return {sw,jacks,mem,dsl};}
function chipMp(g){const it=GEARDB[g.key]; return it.mp?+it.mp(+g.r||1)||0:0;}
function chipsOn(){return chipLines().filter(([g])=>g.slot);}
// why a chip can't be slotted next to the ones already in (or '' if it can)
function chipBlock(g,on){const R=chipRig(), it=GEARDB[g.key], v=chipInfo(g), k=chipKind(g), act=it.soft==='ActiveSoft';
  if(!v.sk&&k==='gen'||it.soft==='LinguaSoft'&&!v.sk) return 'pick the skill on the chip first'; if(k==='conc'&&!v.cc) return 'pick the concentration on the chip first'; if(k==='spec'&&!v.cs) return 'pick the specialization on the chip first';
  if(act&&/^(sorcery|conjuring)/i.test(v.sk)) return 'magic skills can’t be ActiveSofts (core p. 248)';
  if(act&&!R.sw) return 'ActiveSofts need skillwires (core p. 248)';
  const others=on.filter(([x])=>x!==g);
  if(act){const sum=others.filter(([x])=>GEARDB[x.key].soft==='ActiveSoft').reduce((a,[x])=>a+(+x.r||0),0)+(+g.r||0); if(sum>R.sw) return `ActiveSofts in use would total ${sum}, over Skillwires ${R.sw} (core p. 249)`;}
  if(g.mem){const used=others.filter(([x])=>x.mem).reduce((a,[x])=>a+chipMp(x),0)+chipMp(g); if(used>R.mem) return `needs ${chipMp(g)} Mp of headware memory; ${Math.max(0,R.mem-used+chipMp(g))} Mp free`; if(!act&&!R.dsl) return 'a KnowSoft in headware memory needs a datasoft link (core p. 248)';}
  else{const used=others.filter(([x])=>!x.mem).length+1; if(used>R.jacks) return R.jacks?`only ${R.jacks} chipjack${R.jacks>1?'s':''} (skillwires include one)`:'no chipjack';}
  return '';}
const chipEq=(a,b)=>String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();
// the slotted chip that covers this use of a skill: general chip for the skill, or a concentration/specialization chip by its label
function chipFor(skill,conc,spec){const on=chipsOn(); let best=null; on.forEach(([g])=>{const k=chipKind(g), v=chipInfo(g); const hit=k==='gen'?!!skill&&chipEq(v.sk,skill):k==='conc'?!!conc&&chipEq(v.cc,conc)&&(!skill||!v.sk||chipEq(v.sk,skill)):!!spec&&chipEq(v.cs,spec); if(hit&&(!best||+g.r>+best.r)) best=g;}); return best;}
function skillDiceNow(skill,conc,spec){const c=chipFor(skill,conc,spec); if(!c) return Object.assign(skillDiceFor(skill,conc,spec),{chip:false}); return {dice:+c.r||0,how:chipSkill(c)+' chip',ia:0,chip:GEARDB[c.key].soft};}
function skillPartsNow(sk){const parts=skillParts(sk), gen=chipFor(sk.name); return parts.map(p=>{const c=p.part==='gen'?gen:(p.part==='conc'?chipFor(sk.name,p.label,null):(chipFor(sk.name,sk.conc,p.label)||chipFor(sk.name,sk.conc,null)))||gen; return c?Object.assign({},p,{r:+c.r||0,chip:true}):p;});}
function partsNamed(name){const sk=S.skills.find(x=>x.name===name); if(sk) return skillPartsNow(sk); const c=chipFor(name); return c?[{part:'gen',label:name,r:+c.r||0,chip:true}]:[];}
function bestNow(re){const cs=chipsOn().filter(([g])=>chipKind(g)==='gen'&&re.test(chipInfo(g).sk)); return cs.length?Math.max(...cs.map(([g])=>+g.r||0)):bestRating(re);}
function chipNoPool(re){return chipsOn().some(([g])=>GEARDB[g.key].soft==='ActiveSoft'&&re.test(chipInfo(g).sk||chipSkill(g)));}
// general-skill chips for the Skill Web (it only ever uses general ratings, core p. 68); swHave() reads this
function chipHaveMap(){const m={}; chipsOn().forEach(([g])=>{const v=chipInfo(g); if(chipKind(g)==='gen'&&v.sk&&GEARDB[g.key].soft==='ActiveSoft'){const w=typeof swWebName==='function'?swWebName(v.sk):v.sk; m[w]=Math.max(m[w]||0,+g.r||0);}}); return m;}
function chipsHTML(){const L=chipLines(); if(!L.length) return ''; const R=chipRig(), on=chipsOn(); const actSum=on.filter(([g])=>GEARDB[g.key].soft==='ActiveSoft').reduce((a,[g])=>a+(+g.r||0),0), memUsed=on.filter(([g])=>g.mem).reduce((a,[g])=>a+chipMp(g),0), jUsed=on.filter(([g])=>!g.mem).length;
  return `<section class="b2pan b2chips b2span2"><div class="b2h"><h3>Slotted chips</h3><span class="note">Skillwires ${R.sw||'none'}${R.sw?` · ActiveSofts ${actSum}/${R.sw}`:''} · chipjacks ${jUsed}/${R.jacks}${R.mem?` · memory ${memUsed}/${R.mem} Mp`:''}</span></div>
   <div class="b2chipl">${L.map(([g,i])=>{const it=GEARDB[g.key], why=g.slot?'':chipBlock(g,on); return `<div class="b2sc${g.slot?' on':''}"><label class="b2chk"><input type="checkbox" data-b2chip="${i}" ${g.slot?'checked':''} ${!g.slot&&why?'disabled':''}> <b>${E(it.n.replace(/ \(general skill\)/,''))} ${+g.r||1}</b>${chipSkill(g)?`<span class="note">${E(softText(chipInfo(g),it.n))}</span>`:''}</label>
     <div class="sfps">${softPickHTML(it.n,Object.assign(chipInfo(g),g.oth?{oth:true}:{}),i,{disabled:!!g.slot,langs:(S.langs||[]).map(L=>L.name).filter(Boolean)})}</div>
     <label class="b2f"><span class="b2k">Runs from</span><select data-b2chipm="${i}" ${g.slot?'disabled':''}><option value="" ${!g.mem?'selected':''}>A chipjack</option><option value="1" ${g.mem?'selected':''}>Headware memory (${chipMp(g)} Mp)</option></select></label>
     ${why?`<span class="note">${E(why.charAt(0).toUpperCase()+why.slice(1))}.</span>`:''}</div>`;}).join('')}</div>
   <p class="note">While a chip is slotted, rolls for its skill use the chip’s rating only; your own rating, adept Improved Ability included, is set aside. ActiveSofts bring no Dice Pools: no Combat Pool on attacks with that skill, no Hacking Pool with a Computer chip, no Control Pool with a vehicle chip (core p. 248). Slotting or pulling a chip is a Simple Action (core p. 82). KnowSofts and LinguaSofts need only a chipjack, or headware memory plus a datasoft link.</p></section>`;}
// Initiative: physical, or one of the Matrix modes (core p. 178; VR2 decks use their own boosts)
function iniModes(T){const mx=T&&T.mx; if(!mx||typeof mxIniModes!=='function') return []; if(!(mx.hasDeck||mx.vr2||bestRating(/^computer/i)>0)) return []; return mxIniModes(mx);}
function iniNow(T){const m=iniModes(T).find(x=>x.id===B.inim); return m?{r:m.r,d:m.d,m}:{r:T.reaction,d:T.dice,m:null};}
// ---------- What you're wearing (core p. 242; SSC p. 39, 40, 70) ----------
// Pick one body armor, one helmet and one shield from what the runner carries; the rest stay owned but not worn (g.off).
// camouflage on the worn body armor: its pattern, which side is out, and where you are (FoF p. 52, 77)
function camoHTML(ar){const g=ar.bodyG; if(!g||typeof camoKind!=='function'||!camoKind(g.key)) return ''; const gi=S.gear.indexOf(g), pat=g.camo||'', terr=S.terrain||'', side=g.camoSide||'day', tod=S.tod||'day';
  const fx=camoEffect(pat,terr); const wrong=pat&&terr&&pat===terr&&side!==tod;
  const sel=(attr,lab,opts,cur)=>`<label class="b2f"><span class="b2k">${lab}</span><select ${attr}>${opts.map(([v,t])=>`<option value="${v}" ${v===cur?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  // fix8: the pattern is part of the garment (bought in one pattern, reversible day and night; FoF p. 52), so it is set on the gear row and shown in the Body armor menu, not picked here
  return `<div class="b2camo"><span class="b2k b2camoh">Camouflage · FoF p. 52, 77</span>
    ${sel('data-terrain','Where you are',[['','Pick the terrain'],...CAMO_PATTERNS.map(p=>[p,p])],terr)}
    ${pat?sel(`data-camoside="${gi}"`,'Side out',[['day','Day side'],['night','Night side']],side):''}
    ${sel('data-tod','Time',[['day','Day'],['night','Night']],tod)}
    <div class="b2cfx">${!pat?(camoKind(g.key)==='mil'?'Standard military finish: no camouflage modifier.':'No pattern recorded for this one: set it on its row under Gear.'):!terr?'Pick where you are to see the Perception modifier.':`<b>${SIGN(fx.mod)}</b> ${E(pat)} ${E(fx.txt)} (FoF p. 77).${wrong?' The '+side+' side is out at '+tod+'; the patterns are reversible (FoF p. 52), so turn it, or it’s the GM’s call.':''} Moving counts as “action very obvious” (core p. 185).`}</div></div>`;}
document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset) return; const d=t.dataset;
  if(d.camo!=null){const g=S.gear[+d.camo]; if(g){if(t.value) g.camo=t.value; else delete g.camo; render();} return;}
  if(d.camoside!=null){const g=S.gear[+d.camoside]; if(g){g.camoSide=t.value; render();} return;}
  if(d.terrain!=null){S.terrain=t.value; render(); return;}
  if(d.tod!=null){S.tod=t.value; render(); return;}});
function armorAgainst(ar){return {ball:ar.b,imp:ar.i,gel:ar.i,blast:ar.i,flech:Math.max(2*ar.i,ar.b),apds:Math.floor(ar.b/2)};} // core p. 93 (flechette), 95 (gel), 97 (blast), 277 (APDS)
function wearName(g){return (GEARDB[g.key]?GEARDB[g.key].n:g.key)+(g.camo?', '+g.camo:'');}
function wearLines(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>ASTAT[g.key]&&!g.at);}
function wearPanelHTML(){const h=wearHTML(); return `<section class="b2pan b2wearp" aria-label="Armor you are wearing">${h||'<div class="b2h"><h3>Wearing</h3></div><p class="note">No armor carried. Buy some under Gear; stashed armor doesn’t count.</p>'}</section>`;}
function wearHTML(){const L=wearLines(), ar=armorTotals(); if(!L.length&&!ar.parts.length) return '';
  const nm=wearName, BI=g=>{const a=ASTAT[g.key]; return a[0]+'/'+a[1];};
  const bodies=L.filter(([g])=>armorKind(g.key)==='body'), helms=L.filter(([g])=>armorKind(g.key)==='helmet'), shields=L.filter(([g])=>armorKind(g.key)==='shield'), fgs=L.filter(([g])=>armorKind(g.key)==='fg');
  const sas=bodies.filter(([g])=>g.hb&&g.hb.helmet&&HB.kind(g.key)==='secarmor');
  const curBody=ar.bodyG?S.gear.indexOf(ar.bodyG):-1, curShield=ar.shieldG?S.gear.indexOf(ar.shieldG):-1;
  const curHelm=ar.builtIn?'built':ar.helmG?String(S.gear.indexOf(ar.helmG)):ar.saG?'sa:'+S.gear.indexOf(ar.saG):'';
  const sel=(k,lab,opts,cur,dis)=>`<label class="b2f"><span class="b2k">${lab}</span><select data-wear="${k}"${dis?' disabled':''}>${opts.map(([v,t])=>`<option value="${v}" ${String(v)===String(cur)?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  const bodySel=bodies.length?sel('body','Body armor',[['','None'],...bodies.map(([g,i])=>[i,nm(g)+' '+BI(g)])],curBody):'';
  const helmOpts=ar.builtIn?[['built','Built into the '+nm(ar.builtIn)]]:[['','None'],...helms.map(([g,i])=>[i,nm(g)+' +'+BI(g)]),...sas.filter(([g])=>!g.off).map(([g,i])=>['sa:'+i,nm(g)+' helmet +1/2'])];
  const helmSel=helms.length||sas.length||ar.builtIn?sel('helm','Helmet',helmOpts,curHelm,!!ar.builtIn):'';
  const shSel=shields.length?sel('shield','Shield',[['','None'],...shields.map(([g,i])=>[i,nm(g)+' +'+BI(g)])],curShield):'';
  const fgChk=fgs.length?`<label class="b2chk b2wfg"><input type="checkbox" data-wear="fg" ${fgs.some(([g])=>!g.off)?'checked':''}> Forearm guards</label>`:'';
  const sign=(p,v)=>(p.plus&&v>=0?'+':'')+v;
  const parts=ar.parts.map(p=>`<div class="b2wrow"><span>${E(p.l)}</span><b>${p.k==='helmet'&&ar.builtIn?'in suit':sign(p,p.b)+' / '+sign(p,p.i)}</b></div>`).join('');
  const AV=armorAgainst(ar), vs=[['Bullets','Ballistic',AV.ball],['Melee, thrown, gel','Impact',AV.imp],['Grenade blast','Impact · core p. 97',AV.blast],['Flechette','double Impact or Ballistic · core p. 93',AV.flech],['APDS','Ballistic halved · core p. 277',AV.apds]];
  const notes=[];
  if(ar.fg) notes.push('Forearm guards: +1 Impact against melee only, not ranged (SSC p. 39).');
  if(ar.shieldG) notes.push('The shield adds on top of the helmet (table ruling).');
  if(ar.builtIn) notes.push('Core heavy armor already includes a helmet (core p. 242); another helmet doesn’t add.');
  if(ar.bodyG&&/^armor:Form-Fitting/.test(ar.bodyG.key)) notes.push('Form-fitting armor can’t be worn with any other body armor (SSC p. 40).');
  if(ar.derm) notes.push(`${hasDerm()?'Troll skin':''}${hasDerm()&&gearLevel('body:Dermal Plating')?' and ':''}${gearLevel('body:Dermal Plating')?'Dermal plating':''} add${hasDerm()&&gearLevel('body:Dermal Plating')?'':'s'} to Body for damage resistance, not to armor.`);
  if(ar.poolPenalty) notes.push(`This armor cuts Combat Pool by ${ar.poolPenalty} (core p. 84${booksOn().fof?'; FoF p. 54':''}).`);
  return `<div class="b2h"><h3>Wearing</h3><span class="b2wtot"><b>${ar.b} / ${ar.i}</b><small>Ballistic / Impact</small></span></div>
   <div class="b2wearsel">${bodySel}${helmSel}${shSel}${fgChk}</div>
   <div class="b2wgrid"><div class="b2wbox"><span class="b2k">How it adds up · core p. 242</span>${parts||'<div class="b2wrow"><span>Nothing worn</span><b>0 / 0</b></div>'}<div class="b2wrow tot"><b>Total</b><b>${ar.b} / ${ar.i}</b></div><p class="b2wvs1">Against: bullets ${AV.ball} · melee, thrown, gel and blasts ${AV.imp} · flechette ${AV.flech} · APDS ${AV.apds}</p></div>
   <div class="b2wbox b2wvs"><span class="b2k">Against what hits you</span>${vs.map(([n,w,v])=>`<div class="b2wrow"><span>${E(n)} <small>${E(w)}</small></span><b>${v}</b></div>`).join('')}</div></div>
   ${camoHTML(ar)}
   ${notes.length?`<p class="note b2wnote">${notes.map(E).join(' ')}</p>`:''}`;}
function wearPick(k,v){const L=wearLines(), set=(kind,keep)=>L.filter(([g])=>armorKind(g.key)===kind).forEach(([g,i])=>{if(String(i)===String(keep)) delete g.off; else g.off=true;});
  if(k==='body') set('body',v);
  else if(k==='helm'){const sa=String(v).startsWith('sa:')?String(v).slice(3):null; set('helmet',sa!=null?null:v); L.filter(([g])=>g.hb&&g.hb.helmet&&HB.kind(g.key)==='secarmor').forEach(([g,i])=>{if(sa!=null&&String(i)===sa) delete g.helmOff; else g.helmOff=true;});}
  else if(k==='shield') set('shield',v);
  else if(k==='fg') L.filter(([g])=>armorKind(g.key)==='fg').forEach(([g])=>{if(v) delete g.off; else g.off=true;});
  render();}
document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset||t.dataset.wear==null) return; wearPick(t.dataset.wear,t.type==='checkbox'?t.checked:t.value);});
const d6p=()=>1+Math.floor(Math.random()*6); // plain die: Initiative dice add up, no Rule of Six (core p. 32, 78)
// spell duration: the book's own code when the list has it (Grimoire, Awakenings), else by category (core p. 150-158)
function spellDur(n){const sp=spellFind(n); if(!sp) return null; if(sp.dur) return sp.dur; const c=sp.cat;
  if(c==='Combat') return 'I'; if(c==='Detection'||c==='Illusion') return 'S';
  if(c==='Health') return /^(Increase|Decrease|Oxygenate|Preserve|Prophylaxis)/.test(n)?'S':'P';
  if(c==='Manipulation') return /^(Acid|Fire Strike|Flame|Ice Sheet|Thunderclap|Clout|Lightning|Ball Lightning|Shatter)/.test(n)?'I':/^(Fashion|Ignite|Influence|Makeover)/.test(n)?'P':'S';
  return 'S';}
const DURN={I:'Instant',S:'Sustained',P:'Permanent'};
// Karma Pool rerolls are rolled by hand at the table: the tool only charges the Karma (1, then 2, 3 … on the same test) and takes the extra successes (core p. 191)
const sv=()=>{if(typeof save==='function') save();};
function tkGet(){if(!S.tk||typeof S.tk!=='object') S.tk={tot:0,left:0}; S.tk.tot=Math.max(0,+S.tk.tot||0); S.tk.left=Math.max(0,Math.min(S.tk.tot,+S.tk.left||0)); return S.tk;}
// Spend Karma (core p. 191): buy dice before a roll; after it, re-roll the failures (1, 2, 3...), buy a success (needs a real one; gone for good) or avoid an all-ones disaster.
// From your own Karma Pool or from Team Karma, which needs a majority vote of the players at the table (the GM breaks a tie).
function karmaTuck(R,ctx,kdMax){const T=sheetStats(), tk=tkGet(), team=B.kfrom==='team', vote=!!B.kvote, st=ctx==='gh'?B.gh:B, kd=(st.kdSrc||[]).length;
  const have=team?(vote?tk.left:0):B.karma, nat=R?R.r.filter(x=>x>=R.tn).length:0, fail=R?R.r.filter(x=>x<R.tn).length:0, ones=!!R&&R.r.length>0&&R.r.every(x=>x===1), done=!!(R&&R.oops), next=R?(R.kc||0)+1:1, open=B.kOpen===ctx;
  const line=`Spend Karma · yours ${B.karma}/${T.kpool}${tk.tot||tk.left?` · team ${tk.left}/${tk.tot}`:''}${kd?` · ${kd} Karma ${kd>1?'dice':'die'} ready`:''}${R&&(R.kc||R.ks||R.oops)?' · used on this roll':''}`;
  if(!open) return `<div class="b2kt"><button class="b2tuck" data-b2a="ktuck:${ctx}" aria-expanded="false"><span aria-hidden="true">▸</span> ${E(line)}</button></div>`;
  const kstep=(id,lab,val,canUp)=>`<div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Fewer ${E(lab)}" ${val>0?'':'disabled'}>−</button><b>${val}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="More ${E(lab)}" ${canUp?'':'disabled'}>+</button></div>`;
  const opt=(t,help,ctl)=>`<div class="b2kopt"><div><b>${t}</b><small>${help}</small></div>${ctl}</div>`;
  const why=team&&!vote?'Tick the team vote first.':'';
  return `<div class="b2kt open"><button class="b2tuck" data-b2a="ktuck:${ctx}" aria-expanded="true"><span aria-hidden="true">▾</span> ${E(line)}</button><div class="b2kpan">
   <div class="b2f b2pf"><span class="b2k">Spend from</span><div class="b2pills" role="radiogroup" aria-label="Spend from"><button type="button" class="b2pill${team?'':' on'}" role="radio" aria-checked="${!team}" data-b2a="kfrom:own">Your Karma Pool · ${B.karma}</button><button type="button" class="b2pill${team?' on':''}" role="radio" aria-checked="${team}" data-b2a="kfrom:team">Team Karma · ${tk.left}</button></div></div>
   ${team?`<label class="b2chk"><input type="checkbox" data-b2c="kvote" ${vote?'checked':''}> The team voted yes: a majority of the players at the table, and the GM breaks a tie (core p. 191)</label>`:''}
   <div class="b2kgrid">
    ${opt('Buy Karma dice',`1 point a die, up to ${kdMax} (your dice before any pool dice). They go into your next roll.`,kstep(ctx+':kd','Karma dice',kd,kd<kdMax&&have>=1))}
    ${opt(`Re-roll the ${R?fail+' ':''}failed dice`,`Costs ${next}. Each re-roll on the same test costs 1 more.`,`<button class="ghost" data-b2a="${ctx}:re" ${R&&!done&&fail&&have>=next?'':'disabled'}>Re-roll · −${next}</button>`)}
    ${opt('Buy 1 success',`Needs at least one real success. The point is gone for good${team?', from Team Karma too':': it comes off your sheet when you save After the session'}.`,`<button class="ghost" data-b2a="${ctx}:buy" ${R&&!done&&nat&&have>=1?'':'disabled'}>Buy · −1</button>`)}
    ${opt('Avoid disaster','All ones: 1 point makes it a plain failure. No more Karma on that test.',`<button class="ghost" data-b2a="${ctx}:oops" ${ones&&!done&&have>=1?'':'disabled'}>Avoid · −1</button>`)}
   </div>${why?`<p class="note">${why}</p>`:''}${R&&(R.kd||R.kc||R.ks||R.oops)?`<p class="note">On this roll: ${E(kNote(R))}.</p>`:''}
   <button class="b2tuck" data-b2a="tkopen" aria-expanded="${!!B.tkOpen}"><span aria-hidden="true">${B.tkOpen?'▾':'▸'}</span> Adjust Team Karma</button>
   ${B.tkOpen?`<div class="b2ctl"><div class="b2f"><span class="b2k">Team Karma left</span>${kstep('tkleft','Team Karma left',tk.left,tk.left<tk.tot)}</div><div class="b2f"><span class="b2k">Team Karma pool</span>${kstep('tktot','Team Karma pool',tk.tot,true)}</div></div><p class="note">Sheets don’t share this: whoever keeps it for the team sets it here. It refills every scene, and points spent buying successes are gone for good (core p. 191).</p>`:''}
  </div></div>`;}
function kNote(R){return [R.kd?R.kd+' Karma '+(R.kd>1?'dice':'die'):'',R.kc?'re-rolled '+(R.kc>1?R.kc+' times':'once'):'',R.ks?R.ks+' success'+(R.ks>1?'es':'')+' bought':'',R.oops?'disaster avoided':''].filter(Boolean).join(', ');}
function kPay(n){const tk=tkGet(); if(B.kfrom==='team'){if(!B.kvote||tk.left<n) return false; tk.left-=n; sv(); return true;} if(B.karma<n) return false; B.karma-=n; return true;}
function kdTake(st,mx){const L=st.kdSrc||[]; while(L.length>mx){const x=L.pop(); if(x==='team'){tkGet().left++; sv();} else B.karma++;} const n=L.length; st.kdSrc=[]; return n;}
function visCol(){const r=baseRace(); return r==='Troll'||r==='Dwarf'?4:r==='Elf'||r==='Ork'?3:2;}
// Every kind of vision this runner can use right now, with where it comes from: race, eye implants (on their own or as cybereye options),
// helmet vision options carried, and a low-light or thermographic scope on the weapon in hand (electronic vision, used through the scope).
// What the runner's eyes can do. Cybereyes replace the natural eyes (core p. 247: "retinal modification, rather than eye replacement"),
// so a runner with a pair of cybereyes loses natural low-light or thermographic vision. The books don't say this outright: GM call, see S.keepNatEyes.
// Eye options on their own (no cybereyes line) are retinal modifications and leave the natural eyes in place. One cybereye (single) leaves one natural eye.
function eyeKit(){const K={ll:'',th:'',flare:'',mag:0,magSrc:'',pair:false};
  const opt=(id,src)=>{id=String(id||''); if(/Low-Light Eyes$/.test(id)) K.ll=K.ll||src; if(/Thermographic Eyes$/.test(id)) K.th=K.th||src; if(/Flare Compensation$/.test(id)) K.flare=K.flare||src;
    const m=id.match(/(Optical|Electronic) Magnification (\d)$/); if(m&&+m[2]>K.mag){K.mag=+m[2]; K.magSrc=src;}};
  (S.gear||[]).forEach(g=>{if(g.at) return; const k=g.key||'';
    if(k==='head:Cybereyes'){if(!(g.hb&&g.hb.single)) K.pair=true; ((g.hb&&g.hb.opts)||[]).forEach(o=>opt(o&&(o.id||o),'cybereyes'));}
    else if(/^head:/.test(k)) opt(k,'eye implant');});
  return K;}
function natLost(){return eyeKit().pair&&!S.keepNatEyes;}
// Every kind of vision this runner can use right now: natural (unless cybereyes replaced it), eye implants, carried helmet vision options,
// and the scope on the weapon in hand when the shot is taken through the scope.
function visKinds(W){const K=[[2,'normal vision']], E=eyeKit(); const nat=visCol();
  if(!natLost()){ if(nat===3) K.push([4,'natural low-light']); if(nat===4) K.push([6,'natural thermographic']); }
  const has=new Map(), add=(col,src)=>{if(!has.has(col)) has.set(col,src);};
  if(E.ll) add(3,E.ll); if(E.th) add(5,E.th);
  (S.gear||[]).forEach(g=>{if(g.at||g.off) return; const k=g.key||''; if(k==='armor:Helmet option: Low-Light') add(3,'helmet'); if(k==='armor:Helmet option: Thermographic') add(5,'helmet');});
  if(W&&W.scope&&sightNow(W)==='scope') W.scope.forEach(v=>{if(/^low/i.test(v)) add(3,'scope'); if(/^therm/i.test(v)) add(5,'scope');});
  has.forEach((src,col)=>K.push([col,(col===3?'low-light':'thermographic')+' ('+src+')'])); return K;}
// Sights. Scopes may not be used with smartlink systems (core p. 240); cybereye magnification behaves like an imaging scope of its rating (SSC p. 85).
// With a smartlink on the gun the shooter picks one for each shot; without one the scope and eye optics are simply used.
function sightOpts(W){if(!W||W.kind!=='gun') return []; const E=eyeKit(), o=[];
  if(W.smartOn) o.push(['link','Smartlink ('+SIGN(W.aim)+')']);
  if((W.scope&&W.scope.length)||W.mag) o.push(['scope','Through the scope'+(W.mag?' (magnification '+W.mag+')':'')+(W.scope&&W.scope.length?' ('+W.scope.join(', ').toLowerCase()+')':'')]);
  if(E.mag) o.push(['eyes','Eye magnification '+E.mag+' ('+E.magSrc+')']);
  return o;}
function sightNow(W){const o=sightOpts(W); if(!W||!W.smartOn) return 'free'; const v=B.sit.sight; return o.some(x=>x[0]===v)?v:'link';}
// best vision for a condition: the lowest modifier among the kinds the runner has; Flare Compensation removes glare modifiers (core p. 247)
function visBest(v,K){let b=K[0]; K.forEach(k=>{if(v[k[0]]<v[b[0]]) b=k;}); return b;}
function visName(W){const K=visKinds(W); return K.length>1?'best of '+K.map(k=>k[1]).join(', '):'normal vision';}
// ---------- what this runner can attack with ----------
function attacks(){
  const T=sheetStats(), str=augAttr('str'), out=[]; const troll=baseRace()==='Troll'?1:0;
  // unarmed is always there (core p. 98-101)
  {const parts=partsNamed('Unarmed Combat'); const best=parts.reduce((m,p)=>p.r>m.r?p:m,{r:0,label:''}), uChip=parts.some(p=>p.chip);
   const ia=uChip?0:adeptOn()?S.powers.filter(p=>p.type==='improvedAbility'&&p.skill==='Unarmed Combat').reduce((a,p)=>a+(+p.n||0),0):0;
   const kh=adeptOn()?S.powers.find(p=>p.type==='killing'):null;
   out.push({id:'unarmed',grp:'base',kind:'melee',n:'Unarmed'+(best.label&&best.label!=='Unarmed Combat'?' ('+best.label+')':''),dice:best.r?best.r+ia:null,skill:uChip&&chipNoPool(/^unarmed/i)?0:(best.r||0),diceSrc:best.r?(best.label||'Unarmed Combat')+(uChip?' chip':'')+' '+best.r+(ia?' + Improved Ability '+ia:'')+(uChip&&chipNoPool(/^unarmed/i)?' (ActiveSoft: no Combat Pool, core p. 248)':''):'no skill: defaulting (core p. 66–68)',
     dmg:kh?str+(kh.level||'M'):str+'M Stun',note:kh?`Killing Hands: Physical, or ${str}M Stun if you choose (core p. 126)`:'(Strength)M Stun (core p. 101)',reach:troll});}
  S.gear.forEach((g,i)=>{const it=GEARDB[g.key]; if(!it) return; if(g.at&&isVehPlace(g.at)&&(WSTAT[g.key]||g.cat==='vweap')) return; const where=carried(g)?'on':'off'; // guns stowed on a vehicle show under Drones and vehicles
    if(MSTAT[g.key]){const [cc,reach,dmg,conc,msk]=MSTAT[g.key]; const sd=skillDiceNow(msk||'Armed Combat',conc,it.n);
      out.push({id:'g'+i,g,grp:where,kind:'melee',n:it.n,dice:sd.dice==null?null:sd.dice+(sd.ia||0),skill:sd.chip==='ActiveSoft'?0:(sd.dice||0),diceSrc:sd.dice==null?'no skill: defaulting (core p. 66–68)':sd.how+' '+sd.dice+(sd.chip==='ActiveSoft'?' (ActiveSoft: no Combat Pool, core p. 248)':''),dmg:strDmg(dmg,str),reach:reach+troll,note:(msk||'Armed Combat')+' · '+(it.pg||'')});}
    else if(WSTAT[g.key]){const [rt,cc,ammo,mode,dmg]=WSTAT[g.key]; const [sk,conc]=RT_SKILL[rt]||['Firearms','']; const sd=skillDiceNow(sk,conc,it.n); const gc=(typeof gunCalc==='function')?gunCalc(g):null;
      const fs=feedSpec(g.key); const fg=fs?feedGuns().find(x=>x.g===g):null;
      out.push({id:'g'+i,g,grp:where,kind:'gun',rt,n:it.n+((+g.qty||1)>1?' ×'+g.qty:''),dice:sd.dice==null?null:sd.dice+(sd.ia||0),skill:sd.chip==='ActiveSoft'?0:(sd.dice||0),diceSrc:sd.dice==null?'no skill: defaulting (core p. 66–68)':sd.how+' '+sd.dice+(sd.chip==='ActiveSoft'?' (ActiveSoft: no Combat Pool, core p. 248)':''),
        dmg:(gc&&gc.C.dmg)||strDmg(dmg,str),mode:String(mode||''),bands:typeof rangeBands==='function'?rangeBands(rt,g,str):(RANGES[rt]||['','','','']),grenade:rt==='grenade',gkey:g.key,scope:gc?(gc.C.parts||[]).filter(p=>p.vis).map(p=>p.vis):[],mag:gc?(gc.C.mag||0):0,smartOn:!!(gc&&gc.C.smart&&gc.C.userLv),aim:gc?gc.C.aim:0,aimTxt:gc?(gc.C.aimTxt||[]).filter(x=>!/pick the shooter/.test(x)).join(', '):'',rc:gc?(gc.C.rc||0):0,gid:fg?fg.gid:null,cap:fs?fs.cap:null,note:sk+' · '+(it.pg||'')});}});
  if(isMagician()){const mp=bestRating(/^sorcery/i)+powerFoci();
    S.powers.forEach((p,i)=>{const sp=spellFind(p.name); if(!sp||sp.cat!=='Combat') return;
      out.push({id:'sp'+i,grp:'spell',kind:'spell',sname:p.name,n:p.name+' (Force '+(+p.cost||1)+')',maxF:+p.cost||1,sp,dice:null,skill:mp,pool:mp,note:(sp.pg||'')+' · '+(sp.ty==='M'?'mana: target resists with Willpower':'physical: target resists with Body')});});
    S.powers.forEach((p,i)=>{const sp=spellFind(p.name); if(!sp||sp.cat==='Combat') return; const du=spellDur(p.name);
      out.push({id:'sc'+i,grp:'cast',kind:'cast',sname:p.name,n:p.name+' (Force '+(+p.cost||1)+')',maxF:+p.cost||1,sp,dur:du,dice:null,skill:mp,pool:mp,note:(sp.pg||'')+' · '+sp.cat+' · '+(DURN[du]||'')});});}
  // spirits the magician has called (kept on the sheet; spirit table core p. 144)
  (S.spirits||[]).forEach((x,i)=>{const F=+x.f||1, ST=SPIRITS[x.t]; if(!ST) return;
    out.push({id:'s'+i,grp:'spirit',kind:'spirit',n:ST.n+', Force '+F+((+x.sv||0)?' · '+x.sv+' service'+(x.sv>1?'s':''):''),dice:ST.dice?ST.dice(F):null,diceSrc:ST.dice?ST.dsrc(F):'powers: the GM sets the dice',dmg:ST.dmg?ST.dmg(F):'by power',ranged:!!ST.ranged,reach:ST.reach||0,f:F,note:ST.note(F)});});
  // drones and vehicles (R2 p. 58): a weapon stowed "at" a vehicle in Stash counts as mounted on it
  S.gear.forEach((v,vi)=>{if(!isVehG(v)||!GEARDB[v.key]) return; const vn=vehName(v), R=typeof R2OBJ!=='undefined'?R2OBJ[v.key]:null, rr=R?R.r:{};
    const sen=parseInt(rr.Se,10)||0, pil=parseInt(rr.P,10)||0, mods=((v.vb&&v.vb.mods)||[]).map(m=>m.id).join(','), gun=bestNow(/^gunnery/i), gunChip=chipNoPool(/^gunnery/i);
    S.gear.forEach((g,i)=>{if(g.at!==vn||!GEARDB[g.key]) return; const it=GEARDB[g.key]; let dmg=null,mode='';
      if(WSTAT[g.key]){dmg=strDmg(String(WSTAT[g.key][4]),0); mode=String(WSTAT[g.key][3]||'');}
      else if(g.cat==='vweap'){const m=/(\d+[LMSD])/.exec(it.s||''); if(m) dmg=m[1]; const mm=/\b(SS|SA|BF|FA)(\/(SS|SA|BF|FA))*\b/.exec(it.s||''); mode=mm?mm[0]:'SS';}
      if(!dmg) return;
      out.push({id:'v'+vi+'_'+i,grp:'drone',kind:'drone',n:vn+': '+it.n,veh:vn,dmg,mode,sen,pil,gun,gunChip,skill:gun,hasR2:!!R,mount:/ring/.test(mods)?'ring':/pintle/.test(mods)?'pintle':'fixed',note:(it.pg||'')+' · stowed on the '+vn+' in Stash'});});});
  // Matrix: Attack programs on the deck (core p. 175, 179)
  {const mx=typeof matrixInfo==='function'?matrixInfo():null; if(mx&&(mx.hasDeck||mx.vr2)) S.gear.forEach((g,i)=>{if(!GEARDB[g.key]) return; const r=+g.r||1;
    if(/^prog:/.test(g.key)&&!/^prog:(Attack|Persona)/.test(g.key)) return out.push({id:'u'+i,grp:'matrix',kind:'util',n:GEARDB[g.key].n+' '+r+(g.loaded?'':' (not loaded)'),rating:r,gi:i,loaded:!!g.loaded,hp:chipNoPool(/^computer/i)?0:(mx.pool||0),skill:r,dmg:'—',note:'Utility test: rating + Hacking Pool (up to the rating) against the node\u2019s System Rating; the node rolls its System Rating against your Evasion; you need more successes than the node plus its Security Code (core p. 174).'});
    if(!/^prog2?:Attack/.test(g.key||'')) return; const v2=/^prog2:/.test(g.key), lv=v2?((/-([LMSD])$/.exec(GEARDB[g.key].n)||[])[1]||'M'):null;
    out.push({id:'m'+i,grp:'matrix',kind:'matrix',n:GEARDB[g.key].n+' '+r+(g.loaded?'':' (not loaded)'),rating:r,v2,lv,gi:i,loaded:!!g.loaded,hp:chipNoPool(/^computer/i)?0:(mx.pool||0),skill:r,dmg:v2?r+lv:'1 box per extra success',
      note:v2?'Matrix 2.0 cybercombat: the utility’s rating plus Hacking Pool, against a target number set by the host’s Security Code and whether the target is Legitimate or Intruding (VR2 p. 123–124).':'Only while jacked in. A target resists; extra successes over theirs (and the node’s Security Code) are boxes; 10 crash it (core p. 179).'});});
   const dk2=typeof deckInfo==='function'?deckInfo():null; if(mx&&dk2&&dk2.vr2) out.push({id:'vsys',grp:'matrix',kind:'vsys',n:'System Test (VR2): Computer, helped by a utility',hp:chipNoPool(/^computer/i)?0:(mx.pool||0),skill:0,dmg:'—',loaded:true,note:'Matrix 2.0 System Test: your Computer skill against the subsystem’s rating, less the utility you run; the host rolls its Security Value against your Detection Factor (VR2 p. 18–19).'});}
  return out;
}
// spirit table, core p. 144 (F = Force); hermetics call elementals, shamans call nature spirits (core p. 140-144)
const SPIRITS={
 earth:{n:'Earth elemental',dice:F=>Math.max(1,F-2),dsrc:F=>'its Reaction (F−2 = '+Math.max(1,F-2)+') as the skill',dmg:F=>F+'S',reach:1,note:F=>'Attacks as Unarmed Combat, +1 reach. Engulf, Manifestation, Movement (core p. 144).'},
 fire:{n:'Fire elemental',dice:F=>F+1,dsrc:F=>'its Reaction (F+1 = '+(F+1)+') as the skill',dmg:F=>F+'M',ranged:1,note:F=>'Attacks as Ranged Combat, range Force × 2 = '+(F*2)+' m. Also Engulf, Flame Aura, Flame Projection, Guard (core p. 144).'},
 water:{n:'Water elemental',dice:F=>F,dsrc:F=>'its Force ('+F+') as the skill',dmg:F=>F+'S Stun',note:F=>'Attacks as Unarmed Combat for Stun. Engulf, Manifestation, Movement (core p. 144).'},
 air:{n:'Air elemental',note:F=>'Attacks through its powers: Engulf, Noxious Breath, Psychokinesis (core p. 144). The GM sets the dice.'},
 nature:{n:'Nature spirit',note:F=>'Works through its powers (Accident, Concealment, Confusion, Fear, Guard and so on by kind, core p. 144). The GM sets the dice.'}};
const V2TN={1:[6,3],2:[5,4],3:[4,5],4:[3,6]}; // VR2 p. 123: host Security Code → target number against an Intruding / a Legitimate icon
const V2BOX={L:1,M:2,S:3,D:6}; // VR2 p. 124: boxes an icon fills for each damage level
const V2SUB=['Access','Control','Index','Files','Slave']; // VR2 p. 19: the subsystems a System Test is made against
function v2Utils(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>/^prog2:/.test(g.key||'')&&!/^prog2:Attack/.test(g.key)&&GEARDB[g.key]).map(([g,i])=>({i,n:GEARDB[g.key].n,r:+g.r||1,deg:+g.deg||0,loaded:!!g.loaded}));}
function v2Armor(){return v2Utils().filter(u=>u.n==='Armor'&&u.loaded).reduce((m,u)=>Math.max(m,Math.max(0,u.r-u.deg)),0);} // an Armor utility loses a point each time damage gets through (VR2 p. 99); g.deg counts them
const HSPT={L:5,M:10,S:15,D:20}; // Heal and Treat: turns to hold the spell (core p. 155)
const GRP={on:'Carried',off:'Not on you: stashed or in a vehicle',base:'Basic attacks',spell:'Combat spells',cast:'Other spells (cast them here)',spirit:'Spirits',drone:'Drones and vehicles',matrix:'Matrix (while jacked in)'};
// ---------- Game night ----------
function nightHTML(){
  const T=sheetStats(), ar=T.ar, w=T.wmod.m, A=attacks(); if(!A.find(a=>a.id===B.wid)){const by=(B.widBy||{})[S.id]; B.wid=(by&&A.find(a=>a.id===by)?by:(A.find(a=>a.grp==='on'&&a.id!=='unarmed')||A.find(a=>a.id!=='unarmed')||A[0]).id);} const W=A.find(a=>a.id===B.wid);
  const bodyR=augAttr('body')+hasDerm(), isMag=isMagician(), poolName=W.kind==='spell'?'Magic Pool':'Combat Pool';
  if(B._for!==S.id){B._for=S.id; B.inim=''; B.pool=T.cpool; B.poolMax=T.cpool; B.karma=T.kpool; B.mpool=null; B.hpool=null; B.hpMax=null; B.roll=null; B.gh.roll=null; B.ini=null; B.conjRes=''; B.spNote=''; B.drainHit=null; B.warn=''; B.anyway=false; B.vRes=''; B.vhRes=null; B.vLast=null; B.vEsc=null; B.drop=null; B.vitOpen=false; B.hitMsg=null; B.hitTxt='';} // each runner has their own pools
  if(B.poolMax!==T.cpool){B.poolMax=T.cpool; B.pool=T.cpool;} if(B.karma==null) B.karma=T.kpool;
  const mpMax=isMag?bestRating(/^sorcery/i)+powerFoci():0; if(B.mpool==null||B.mpMax!==mpMax){B.mpMax=mpMax;B.mpool=mpMax;}
  // fix8 (2026-11-23): the big stat tiles moved into the vitals line; Condition, Wearing and Initiative open from it as drop-downs
  if(!['cond'].concat(SHEETD).includes(B.drop)) B.drop=null;
  // condition monitor
  const dkI=typeof deckInfo==='function'?deckInfo():null; const B10=natBody(); const boxes=(k,n,ov)=>Array.from({length:n},(_,j)=>{const v=ov?11+j:j+1, on=v<=S[k]; const lv={1:'L',3:'M',6:'S',10:'D'}[v]||'';
    return `<button class="b2box${on?' on':''}${ov?' ov':''}${lv?' mk':''}" data-b2trk="${k}" data-v="${v}" aria-pressed="${on}" aria-label="${k==='phys'?'Physical':'Stun'} box ${v}${ov?' (overflow)':''}">${ov?'':lv}</button>`;}).join('');
  const cond=S.phys>10+B10?'Dead':S.phys>10?`Dying: overflow ${S.phys-10} of ${B10}`:S.phys>=10||S.stun>=10?'Unconscious':w?`Wound modifier +${w}`:'Unhurt';
  // attack
  const groups=['on','base','spell','cast','spirit','drone','matrix','off'].map(gk=>{const L=A.filter(a=>a.grp===gk); return L.length?`<optgroup label="${E(GRP[gk])}">${L.map(a=>`<option value="${a.id}" ${a.id===B.wid?'selected':''}>${E(a.n)}</option>`).join('')}</optgroup>`:'';}).join('');
  const rows=[]; let tn=4, ctl='', dmg=W.dmg, dmgNote='', rounds=0, dice=0, dSrc='', pmax=0, maxSp=0, spellF=0;
  const sel=(id,lab,opts,val,extra)=>`<label class="b2f"><span class="b2k">${E(lab)}</span><select data-b2="${id}"${extra||''}>${opts.map(([v,t])=>`<option value="${E(v)}" ${String(v)===String(val)?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  // Phase 3: one-tap buttons, and a Situation panel for what rarely changes between shots
  const pills=(id,lab,opts,val)=>`<div class="b2f b2pf"><span class="b2k">${E(lab)}</span><div class="b2pills" role="radiogroup" aria-label="${E(lab)}">${opts.map(([v,t])=>{const on=String(v)===String(val); return `<button type="button" class="b2pill${on?' on':''}" role="radio" aria-checked="${on}" data-b2p="${E(id)}" data-v="${E(v)}">${E(t)}</button>`;}).join('')}</div></div>`;
  let top='', situ='', poolCtl='', ammoLine=''; const sitSum=[]; const sitAdd=(short,v,force)=>{if(v||force) sitSum.push([short,v||0]);};
  const modePills=modes=>{const nm={s1:'Single shot',s2:'Second shot +1',b1:'Burst · 3 rounds',b2:'Second burst +3'}; const pm=modes.filter(m=>m[0][0]!=='f').map(m=>[m[0],nm[m[0]]||m[1]]); if(modes.some(m=>m[0][0]==='f')) pm.push(['fa','Full auto']);
    return pills('mode','Firing mode',pm,B.mode[0]==='f'?'fa':B.mode)+(B.mode[0]==='f'?step('fan','Full-auto rounds (3–10)',+B.mode.slice(1)):'');};
  const sitPills=(id,lab,opts,skip)=>{const cur=B.sit[id]||opts[0][0], o=opts.find(x=>x[0]===cur)||opts[0]; situ+=pills('sit:'+id,lab,opts.map(x=>[x[0],x[1]+(x[2]?' '+SIGN(x[2]):'')]),cur); if(o!==opts[0]){rows.push([o[1],lab.toLowerCase()+' · core p. 89',SIGN(o[2])]); tn+=o[2]; sitAdd(o[1].toLowerCase(),o[2]);}};
  const vc=visCol();
  if(W.kind==='gun'){
    const M=W.mode; const modes=[]; if(/SS|SA/.test(M)||!/BF|FA/.test(M)) modes.push(['s1','Single shot',1]); if(/SA/.test(M)) modes.push(['s2','Second shot this action',1]); if(/BF/.test(M)) modes.push(['b1','Burst (3 rounds)',3],['b2','Second burst this action',3]); if(/FA/.test(M)) [3,4,5,6,7,8,9,10].forEach(n=>modes.push(['f'+n,`Full-auto burst, ${n} rounds`,n]));
    if(!modes.find(m=>m[0]===B.mode)) B.mode=modes[0][0]; const md=modes.find(m=>m[0]===B.mode); rounds=md[2];
    top+=modePills(modes);
    top+=pills('rng','Range',W.bands.map((b,j)=>[j,['Short','Medium','Long','Extreme'][j]+' '+b+' m · '+[4,5,6,9][j]]),B.rng);
    if(W.grenade){const fall=/Defensive/.test(W.gkey)?'−1 Power per half meter':/Concussion|Offensive/.test(W.gkey)?'−1 Power per meter':'the falloff in its entry'; dmgNote=(dmgNote?dmgNote+' ':'')+`Grenades scatter: each success cuts the scatter and the GM places the blast. Power drops ${fall} from where it lands; anyone caught resists with Impact armor (Got hit: blast) (core p. 96–97).`;}
    const SO=sightOpts(W), sn=sightNow(W), EK=eyeKit(); if(W.smartOn&&SO.length>1) top+=sel('sit:sight','Sights',SO,sn);
    // magnification: moves the target that many range categories closer, never below Short (core p. 90, 240); scope and eye optics don't add together
    const mg=sn==='link'?0:sn==='scope'?W.mag:sn==='eyes'?EK.mag:Math.max(W.mag,EK.mag), rb=Math.max(0,B.rng-mg);
    tn=[4,5,6,9][rb]; rows.push(['Range',W.bands[B.rng]+' m'+(rb<B.rng?`, magnification ${mg} → ${['short','medium','long','extreme'][rb]} (${sn==='scope'?'scope':sn==='eyes'?EK.magSrc:W.mag>=EK.mag?'scope':EK.magSrc})`:'')+' · core p. 88',String(tn)]);
    const aimNow=sn==='link'||sn==='free'?W.aim:0; if(aimNow){rows.push(['Gun add-ons',W.aimTxt||'smartgun, laser · core p. 89–90',SIGN(aimNow)]); tn+=aimNow;} else if(W.aim) rows.push(['Smartlink','not with a scope or magnification · core p. 240','0']);
    let rec=0, why='';
    if(B.mode==='s2'){rec=1;why='second shot +1';} else if(B.mode==='b1'){rec=3;why='burst +3';} else if(B.mode==='b2'){rec=6;why='second burst, +6 in all';} else if(B.mode[0]==='f'){rec=B.fired+rounds;why=`+1 per round this phase (${B.fired} before + ${rounds})`;}
    if(rec){const net=Math.max(0,rec-W.rc); rows.push(['Recoil',why+(W.rc?', compensation −'+W.rc:'')+' · core p. 91',SIGN(net)]); tn+=net;}
    if(B.mode==='b1'||B.mode==='b2'){dmg=bump(pow(W.dmg,3),1); dmgNote='burst: +3 Power, +1 level (core p. 92)';}
    if(B.mode[0]==='f'){dmg=bump(pow(W.dmg,rounds),Math.floor(rounds/3)); dmgNote=`full auto: +${rounds} Power, +${Math.floor(rounds/3)} level (core p. 92–93); Complex Action`;}
    SITS.forEach(([id,lab,opts])=>sitPills(id,lab,opts));
    situ+=step('aim','Take Aim actions (max '+Math.floor((W.skill||0)/2)+')',B.aim||0);
    if(B.aim){rows.push(['Aimed shot',B.aim+' Simple Action'+(B.aim>1?'s':'')+' · core p. 82',SIGN(-B.aim)]); tn-=B.aim; sitAdd('aim '+B.aim,-B.aim);}
    if(W.gid){const at=(S.ammoT||{})[W.gid]; if(at){const types=amTypes(W.gid); ammoLine=`<div class="b2f b2wide b2ammo"><span class="b2k">Loaded</span><div class="b2am"><b>${at.in.n}${W.cap!=null?'/'+W.cap:''}</b> ${E(at.in.n?AMSHORT(at.in.t):'empty')}${at.clips.length?' · spare clips '+at.clips.map(c=>c.n).join(', '):''}
        ${types.length?`<select data-b2="amsel" aria-label="Ammo to load">${types.map(t=>`<option value="${E(t)}" ${t===at.sel?'selected':''}>${E(AMSHORT(t))} (${amPool(W.gid,t)} left)</option>`).join('')}</select><button class="ghost" data-b2a="load">Load</button>`:''}${at.clips.some(c=>c.n>0)?'<button class="ghost" data-b2a="swap">Change clip</button>':''}</div></div>`;
        if(at.in.n<rounds) dmgNote=(dmgNote?dmgNote+' · ':'')+'not enough rounds loaded';}}
  } else if(W.kind==='melee'){
    tn=4; rows.push(['Melee','opposed: the defender rolls too · core p. 100','4']);
    const vo=VIS.find(v=>v[0]===B.sit.vis);
    MSITS.forEach(([id,lab,opts])=>{const cur=B.msit[id]||opts[0][0], o=opts.find(x=>x[0]===cur)||opts[0];
      if(id==='reach'){top+=pills('msit:reach',lab+' (yours: '+W.reach+')',opts.map(x=>{const v=x[2]-W.reach; return [x[0],x[1]+(v?' · '+SIGN(v):'')];}),cur); const v=o[2]-W.reach; if(v){rows.push(['Reach '+W.reach+' vs '+o[2],'core p. 101',SIGN(v)]); tn+=v;} return;}
      situ+=pills('msit:'+id,lab,opts.map(x=>[x[0],x[1]+(x[2]?' '+SIGN(x[2]):'')]),cur); if(o!==opts[0]){rows.push([lab+': '+o[1].toLowerCase(),'core p. 101',SIGN(o[2])]); tn+=o[2]; sitAdd(o[1].toLowerCase(),o[2]);}});
    if(W.dice==null){top+=step('dfd','Defaulting dice (GM)',B.dfd||4); top+=step('tnb','Base target number (GM)',B.tnBase);}
  } else if(W.kind==='drone'){
    const M=W.mode; const modes=[]; if(/SS|SA/.test(M)||!/BF|FA/.test(M)) modes.push(['s1','Single shot',1]); if(/SA/.test(M)) modes.push(['s2','Second shot this phase',1]); if(/BF/.test(M)) modes.push(['b1','Burst (3 rounds)',3],['b2','Second burst this phase',3]); if(/FA/.test(M)) [3,4,5,6,7,8,9,10].forEach(n=>modes.push(['f'+n,`Full-auto burst, ${n} rounds`,n]));
    if(!modes.find(m=>m[0]===B.mode)) B.mode=modes[0][0]; const md=modes.find(m=>m[0]===B.mode); rounds=md[2];
    const mnt=B.mount||W.mount, auto=B.dmode==='auto';
    top+=sel('dmode','Who’s shooting',[['rig','You, rigged in: Gunnery'],['auto','The drone on its own: Pilot']],auto?'auto':'rig');
    top+=modePills(modes);
    situ+=sel('mount','Mount',[['fixed','Fixed mount or turret: recoil halved'],['ring','Ring mount: −6 recoil'],['pintle','Pintle mount: −2 recoil'],['none','No vehicle mount']],mnt);
    const vt=B.dtgt!=='p'; top+=sel('dtgt','Target',[['v','A vehicle or drone: sensor-enhanced gunnery'],['p','A person: ordinary ranged combat']],vt?'v':'p');
    if(vt){top+=step('tnb','Target’s Signature (GM)',B.tnBase); tn=B.tnBase; rows.push(['Target’s Signature','sensor-enhanced gunnery · R2 p. 58',String(tn)]);
    situ+=pills('urb','Where',[['n','Not urban'],['u','Urban, built-up +2']],B.urb||'n'); if(B.urb==='u'){rows.push(['Urban environment','R2 p. 58','+2']); tn+=2; sitAdd('urban',2);}
    situ+=pills('los','Line of sight',[['i','Interrupted'],['d','Direct and clear −3']],B.los||'i'); if(B.los==='d'){rows.push(['Direct line of sight','R2 p. 58','−3']); tn-=3; sitAdd('direct line of sight',-3);}}
    else {top+=pills('rng','Range (GM, from the weapon’s range table)',[0,1,2,3].map(j=>[j,['Short · 4','Medium · 5','Long · 6','Extreme · 9'][j]]),B.rng); tn=[4,5,6,9][B.rng]; rows.push(['Range','core p. 88; sensor-enhanced gunnery is for vehicle targets (R2 p. 58)',String(tn)]);
      SITS.forEach(([id,lab,opts])=>{if(id==='two'||id==='me') return; sitPills(id,lab,opts);});}
    let rec=0, why=''; if(B.mode==='s2'){rec=1;why='second shot +1';} else if(B.mode==='b1'){rec=3;why='burst +3';} else if(B.mode==='b2'){rec=6;why='second burst, +6 in all';} else if(B.mode[0]==='f'){rec=B.fired+rounds;why=`+1 per round this phase (${B.fired} before + ${rounds})`;}
    if(rec){const net=mnt==='fixed'?Math.floor(rec/2):mnt==='ring'?Math.max(0,rec-6):mnt==='pintle'?Math.max(0,rec-2):rec; rows.push(['Recoil',why+(mnt==='fixed'?', halved on the mount':mnt==='ring'?', ring −6':mnt==='pintle'?', pintle −2':'')+' · R2 p. 58',SIGN(net)]); tn+=net;}
    if(B.mode==='b1'||B.mode==='b2'){dmg=bump(pow(W.dmg,3),1); dmgNote='burst: +3 Power, +1 level (core p. 92)';}
    if(B.mode[0]==='f'){dmg=bump(pow(W.dmg,rounds),Math.floor(rounds/3)); dmgNote=`full auto: +${rounds} Power, +${Math.floor(rounds/3)} level (core p. 92–93)`;}
    dmgNote=(dmgNote?dmgNote+' · ':'')+'lock on first with a Sensor Test (R2 p. 28, 58); track belts by hand'+(W.hasR2?'':' · Sensor isn’t listed for this vehicle, so it counts as 0');
  } else if(W.kind==='matrix'&&W.v2){
    const sc=Math.max(1,Math.min(4,+B.v2sc||1)), st=B.v2st==='i'?'i':'l';
    top+=pills('v2sc','Host’s Security Code (GM)',[[1,'Blue'],[2,'Green'],[3,'Orange'],[4,'Red']],sc);
    top+=pills('v2st','The target is',[['l','Legitimate (IC, or on a passcode)'],['i','Intruding']],st);
    tn=V2TN[sc][st==='i'?0:1]; rows.push([SECN[sc]+' host, '+(st==='i'?'Intruding':'Legitimate')+' target','VR2 p. 123',String(tn)]);
    top+=step('mxm','Maneuvers, damage, options (GM)',SIGN(B.mxm||0)); if(B.mxm){rows.push(['Maneuvers, damage, options','VR2 p. 122–123',SIGN(B.mxm)]); tn+=B.mxm;}
    dmg=W.dmg; dmgNote='Power is the rating; every 2 successes raise the level a step. The target resists with Bod (IC: the host’s Security Value) against the Power less its Armor utility, and every 2 of its successes lower the level a step. Icon boxes: Light 1, Moderate 2, Serious 3, Deadly 6; 10 crash it (VR2 p. 123–124).';
  } else if(W.kind==='vsys'){
    const dk=typeof deckInfo==='function'?deckInfo():null, P=(dk&&dk.persona)||{}, ut=v2Utils(), cur=ut.find(u=>String(u.i)===String(B.vut))||null, sub=V2SUB.includes(B.vsub)?B.vsub:'Access';
    top+=sel('vsub','Subsystem',V2SUB.map(x=>[x,x]),sub);
    top+=step('tnb',sub+' Rating (GM): the target number',B.tnBase); tn=B.tnBase; rows.push([sub+' Rating','VR2 p. 19',String(tn)]);
    top+=sel('vut','Utility you run',[['','None']].concat(ut.map(u=>[String(u.i),u.n+' '+u.r+(u.loaded?'':' (not loaded)')])),cur?String(cur.i):'');
    if(cur&&cur.loaded){rows.push([cur.n+' '+cur.r,'VR2 p. 19','−'+cur.r]); tn-=cur.r;}
    const sl=ut.filter(u=>u.n==='Sleaze'&&u.loaded).reduce((m,u)=>Math.max(m,u.r),0), mask=+P.Masking||0, df=Math.max(1,Math.ceil((mask+sl)/2)); B._df=df;
    top+=step('vsv','Host’s Security Value (GM): its dice',B.vsv||4);
    dmg='—'; dmgNote=(cur&&!cur.loaded?'That utility isn’t in active memory, so it doesn’t help yet. ':'')+`The host rolls its Security Value (${B.vsv||4} dice) against your Detection Factor ${df} (Masking ${mask}${sl?' + Sleaze '+sl:''}, halved, rounded up; VR2 p. 18). You need more successes than the host, and every host success goes on your security tally either way (VR2 p. 19). Run the utility the operation calls for (VR2 p. 111, 161).`;
  } else if(W.kind==='matrix'){
    top+=step('tnb','Target number: the node’s System Rating (IC) or the decker’s Bod (GM)',B.tnBase); tn=B.tnBase; rows.push(['System Rating or Bod','core p. 179',String(tn)]);
    top+=sel('sec','Node’s Security Code (GM): successes to beat',[[0,'None (GM says no code)'],[1,'Blue: 1 success'],[2,'Green: 2 successes'],[3,'Orange: 3 successes'],[4,'Red: 4 successes']],Math.min(4,B.sec||0));
    dmgNote='successes beyond the target’s'+(B.sec?' and the '+SECN[Math.min(4,B.sec)]+' Security Code ('+Math.min(4,B.sec)+')':'')+' are boxes on its monitor (core p. 179)';
  } else if(W.kind==='util'){
    top+=step('tnb','Node’s System Rating (GM): the target number',B.tnBase); tn=B.tnBase; rows.push(['Node’s System Rating','core p. 174',String(tn)]);
    top+=sel('sec','Node’s Security Code (GM): successes to beat',[[0,'None (GM says no code)'],[1,'Blue: 1 success'],[2,'Green: 2 successes'],[3,'Orange: 3 successes'],[4,'Red: 4 successes']],Math.min(4,B.sec||0));
    const dk=typeof deckInfo==='function'?deckInfo():null; const ev=dk&&dk.persona?dk.persona.Evasion:0; B._ev=ev;
    dmgNote=`The System Rating is the target number; the Security Code color is how many extra successes you need (core p. 165). The node rolls ${tn} dice against your Evasion ${ev}; the utility runs if you get more successes than it does${B.sec?`, with at least ${Math.min(4,B.sec)} past its total for the ${SECN[Math.min(4,B.sec)]} code`:''} (core p. 165, 174).`;
  } else if(W.kind==='cast'){
    spellF=Math.max(1,Math.min(B.force||W.maxF,W.maxF)); B.force=spellF; top+=step('force','Force (up to '+W.maxF+')',spellF);
    const hk=/^(heal|treat)$/i.test(String(W.sname||'').trim())?(/^treat/i.test(W.sname)?'Treat':'Heal'):null; B._heal=null;
    if(hk){const base=hk==='Treat'?8:10, es=B.hEss==null?6:B.hEss, wl=B.hWl||'M', raw=+(base-es).toFixed(2);
      top+=`<label class="b2f"><span class="b2k">Target’s Essence</span><input type="number" inputmode="decimal" min="0" max="6" step="0.1" data-b2in="hess" value="${es}"></label>`;
      top+=sel('hwl','Target’s wound level (sets the Drain and the time)',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],wl);
      tn=Math.max(2,Math.ceil(raw)); B._heal={hk,base,es,wl,tn};
      rows.push([hk+': '+base+' − Essence '+es,'core p. 155',String(tn)]);
      dmg='Permanent'; dmgNote=(hk==='Treat'?'Treat works only within an hour of the injury; Heal works any time. ':'Heal works any time (Treat only within an hour of the injury). ')+`Each success heals one box, or goes into the time: hold the spell for ${HSPT[wl]} turns ÷ the successes put there. A set of injuries can be healed by magic only once (core p. 155).`+(raw%1&&raw>2?` Dice show whole numbers, so ${raw} needs a ${tn} or better.`:'');
    } else {
    top+=step('tnb','Target number (GM): the spell’s “Target” line',B.tnBase); tn=B.tnBase; rows.push(['Spell’s target number',W.sp.pg||'core p. 150–158',String(tn)]);
    dmg=DURN[W.dur]||'—'; dmgNote=(W.dur==='S'?'Sustained: add it under Sustaining when it works. ':'')+(W.sp.cat==='Health'?'Health spells: successes count against the spell’s target; a magician’s own tests get no Magic Pool help from others. ':'')+'Effects follow the spell’s description in the book.';}
  } else if(W.kind==='spirit'){
    if(W.ranged){top+=step('tnb','Base target number (GM)',B.tnBase); tn=B.tnBase; rows.push(['Base target number','Ranged Combat, range '+(W.f*2)+' m · core p. 144',String(tn)]);}
    else {tn=4; rows.push(['Melee','opposed: the defender rolls too · core p. 100','4']);}
    if(W.dice==null) top+=step('dfd','Dice (GM)',B.dfd||4);
    dmgNote=W.note;
  } else if(W.kind==='spell'){
    spellF=Math.max(1,Math.min(B.force||W.maxF,W.maxF)); B.force=spellF; top+=step('force','Force (up to '+W.maxF+')',spellF);
    top+=step('tnb',`Target’s ${W.sp.ty==='M'?'Willpower':'Body'} (GM)`,B.tnBase); tn=B.tnBase; rows.push([`Target’s ${W.sp.ty==='M'?'Willpower':'Body'}`,'combat spell · core p. 129',String(tn)]);
    const bl=spellDL(W.sname); if(bl){W.lv=bl[0]; W.stun=bl[1]==='s'; dmg=W.lv+(W.stun?' Stun':'')+' · Force '+spellF; dmgNote=`the spell’s own damage level (${(W.sp.pg||'core p. 151')}); successes stage it up as usual. The target resists against the Force; armor doesn’t help (core p. 129, 149)`;}
    else {top+=sel('dmglv','Spell’s damage level (from its entry)',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],B.dmgLv); W.lv=B.dmgLv; dmg=B.dmgLv+' · Force '+spellF; dmgNote='use the damage level printed in the spell’s entry. The target resists against the Force; armor doesn’t help (core p. 129, 149)';}
  }
  // visibility (all but Matrix): the column for this runner's eyes
  if(!['drone','matrix','util','cast'].includes(W.kind)){// melee uses the Visibility Table at half value, rounded down, except Full Darkness (core p. 102)
    const VK=visKinds(W), mel=W.kind==='melee', fl=eyeKit().flare, vm=(v,bk)=>v[0]==='glare'&&fl?0:mel&&v[0]!=='full'?Math.floor(v[bk[0]]/2):v[bk[0]];
    {const nat=visCol(); if(eyeKit().pair&&nat>2) situ+=`<label class="b2chk b2wide"><input type="checkbox" data-b2c="keepnat" ${S.keepNatEyes?'checked':''}> Cybereyes keep my natural ${nat===3?'low-light':'thermographic'} (GM call)</label>`;}
    situ+=pills('sit:vis','Light and air ('+visName(W)+')',VIS.map(v=>{const bk=visBest(v,VK), m=vm(v,bk); return [v[0],v[1]+(m?' '+SIGN(m):'')];}),B.sit.vis||'n'); const v=VIS.find(x=>x[0]===B.sit.vis); if(v&&v[0]!=='n'){const bk=visBest(v,VK), m=vm(v,bk); rows.push([v[1],(v[0]==='glare'&&fl?'Flare Compensation ('+fl+') removes it · core p. 247':'using '+bk[1]+(mel&&v[0]!=='full'?', half in melee · core p. 89, 102':' · core p. 89')),SIGN(m)]); tn+=m; sitAdd(v[1].toLowerCase(),m,1);}}
  situ+=step('gm','GM modifier',B.gm?SIGN(B.gm):'0'); if(B.gm){rows.push(['GM modifier','anything the tables don’t cover',SIGN(B.gm)]); tn+=B.gm; sitAdd('GM',B.gm);}
  if(w&&W.kind!=='spirit'&&!(W.kind==='drone'&&B.dmode==='auto')){rows.push(['Wounds','core p. 112','+'+w]); tn+=w;}
  {const sp=susPen(); if(sp&&W.kind!=='spirit'&&!(W.kind==='drone'&&B.dmode==='auto')){rows.push(['Sustaining '+susN()+' spell'+(susN()>1?'s':''),'+2 each · core p. 128',SIGN(sp)]); tn+=sp;}}
  if(W.kind==='melee'&&W.dice==null) tn+=B.tnBase-4;
  tn=Math.max(2,tn);
  // dice
  const aimLock=W.kind==='gun'&&(B.aim||0)>=2;
  if(W.kind==='spell'){maxSp=B.mpool; const sp=Math.min(B.spend,maxSp); dice=spellF+sp; dSrc='Force '+spellF+(sp?' + '+sp+' Magic Pool':'');}
  else if(W.kind==='matrix'||W.kind==='util'||W.kind==='vsys'){if(B.hpool==null||B.hpMax!==W.hp){B.hpMax=W.hp;B.hpool=W.hp;} maxSp=W.v2||W.kind==='vsys'?B.hpool:Math.min(B.hpool,W.rating); const sp=Math.min(B.spend,maxSp);
    if(W.kind==='vsys'){const sd=skillDiceNow('Computer','',''); dice=(sd.dice||0)+sp; dSrc=(sd.dice==null?'no Computer skill (GM call)':sd.how+' '+sd.dice)+(sp?' + '+sp+' Hacking Pool':'');}
    else {dice=W.rating+sp; dSrc=(W.kind==='util'?'program rating ':'Attack rating ')+W.rating+(sp?' + '+sp+' Hacking Pool':'');}}
  else if(W.kind==='cast'){maxSp=B.mpool; const sp=Math.min(B.spend,maxSp); dice=spellF+sp; dSrc='Force '+spellF+(sp?' + '+sp+' Magic Pool':'');}
  else if(W.kind==='spirit'){maxSp=0; dice=W.dice==null?(B.dfd||4):W.dice; dSrc=W.diceSrc;}
  else if(W.kind==='drone'){const auto=B.dmode==='auto', h=B.dtgt==='p'?0:Math.floor(W.sen/2); maxSp=auto||W.gunChip?0:Math.min(B.pool,W.gun||0); const sp=Math.min(B.spend,maxSp); dice=(auto?W.pil:W.gun)+h+sp; dSrc=(auto?'Pilot '+W.pil:'Gunnery '+(W.gunChip?'chip ':'')+W.gun+(W.gunChip?' (ActiveSoft: no Combat Pool, core p. 248)':''))+(B.dtgt==='p'?'':' + half Sensor ('+h+')')+(sp?' + '+sp+' Combat Pool':'');}
  else {maxSp=aimLock?0:Math.min(B.pool,W.skill||0); const sp=Math.min(B.spend,maxSp); dice=(W.dice==null?(B.dfd||4):W.dice)+sp; dSrc=(W.dice==null?'defaulting, GM-set':W.diceSrc)+(sp?' + '+sp+' Combat Pool':'');}
  const spend=Math.min(B.spend,maxSp);
  const kOK=!(W.kind==='spirit'||(W.kind==='drone'&&B.dmode==='auto')), kdBase=kOK?Math.max(0,dice-spend):0; B._kdMax=Object.assign(B._kdMax||{},{atk:kdBase});
  const kdA=Math.min((B.kdSrc||[]).length,kdBase); if(kdA){dice+=kdA; dSrc+=' + '+kdA+' Karma';}
  if((W.kind==='matrix'||W.kind==='util')&&!W.v2) poolCtl+=step('spend','Hacking Pool ('+B.hpool+' left, up to the rating '+W.rating+')',spend);
  else if(W.v2||W.kind==='vsys') poolCtl+=step('spend','Hacking Pool ('+B.hpool+' left; VR2 p. 18)',spend);
  else if(W.kind!=='spirit'&&W.kind!=='matrix'&&W.kind!=='util'&&W.kind!=='vsys'&&!(W.kind==='drone'&&B.dmode==='auto')) poolCtl+=step('spend',(W.kind==='cast'?'Magic Pool':poolName)+' ('+(W.kind==='spell'||W.kind==='cast'?B.mpool:B.pool)+' left'+(W.kind!=='spell'&&W.kind!=='cast'?', max '+maxSp+' on this attack':'')+')',spend);
  const notLoaded=(W.kind==='matrix'||W.kind==='util')&&!W.loaded;
  const nlG=notLoaded&&W.gi!=null?S.gear[W.gi]:null, nlDk=nlG&&typeof deckInfo==='function'?deckInfo():null, nlSz=nlG&&GEARDB[nlG.key]&&GEARDB[nlG.key].sz?GEARDB[nlG.key].sz(+nlG.r||1):0, tooBig=!!(nlDk&&nlSz>nlDk.am);
  const downNow=(S.phys>=10||S.stun>=10)&&!(W.kind==='drone'&&B.dmode==='auto'), crashedNow=['util','matrix','vsys'].includes(W.kind)&&(S.mxDmg||0)>=10; if(!downNow&&!crashedNow) B.anyway=false; const stopRoll=(downNow||crashedNow)&&!B.anyway;
  const anyBtn=B.anyway?' The GM let them act anyway.':' <button class="ghost" data-b2a="anyway">Act anyway (GM’s call)</button>';
  if(aimLock) rows.push(['No Combat Pool dice','aiming over more than one Combat Phase · core p. 82','—']);
  const rowsHTML=rows.map(([k,s,v],j)=>`<div class="b2r${j%2?' alt':''}"><span>${E(k)} <small>${E(s)}</small></span><b class="${/^\+[1-9]/.test(v)?'b2warn':/^−/.test(v)?'b2ok':''}">${E(v)}</b></div>`).join('')+`<div class="b2r tot"><span>Target number</span><b>${tn}</b></div>`;
  let drain='';
  if(W.kind==='spell'||W.kind==='cast'){const sp=W.sp, dt=Math.max(2,Math.floor(spellF/2)+(sp.m||0))+susPen(), dl=sp.lv, phys=spellF>magicNow(); drain=`<div class="b2drain"><b>Drain</b> ${E(drainText(sp,spellF))}${sp.lv==='W'&&B._heal?': '+({L:'Light',M:'Moderate',S:'Serious',D:'Deadly'})[B._heal.wl]:''}${susPen()?' (target number '+dt+' with sustaining)':''}${phys?' Physical (Force over Magic)':' Stun'} · resist with Willpower ${attrNow('wil')} plus Magic Pool held back; every 2 successes drop it a level (core p. 129). <button class="primary" data-b2a="drain">Roll Drain</button> ${resHTML(B.drainRes)}${B.drainHit?`<button class="primary" data-b2a="drmark">Mark the ${E(B.drainHit.what)}: ${B.drainHit.n} ${B.drainHit.phys?'Physical':'Stun'}</button>`:''}</div>`;}
  const rolled=B.roll?dieTiles(B.roll):'';
  const succ=B.roll?B.roll.r.filter(v=>v>=B.roll.tn).length+(B.roll.ks||0):0;
  let res=B.warn?B.warn:B.spNote&&B.roll&&W.kind==='spirit'?(B.roll.r.filter(v=>v>=B.roll.tn).length+' successes vs TN '+B.roll.tn+' · '+B.spNote):!B.roll?'Sixes roll again and add (Rule of Six, core p. 32).':B.roll.r.every(v=>v===1)&&!B.roll.ks?(B.roll.oops?'All ones, but Karma made it a plain failure (core p. 191).':'All ones: Rule of One (core p. 32).'):`${succ} success${succ===1?'':'es'}${kNote(B.roll)?' (Karma: '+kNote(B.roll)+')':''}`;
  if(B.roll&&W.kind==='cast'&&B._heal&&succ>0&&!B.warn){const T=HSPT[B._heal.wl], o=[]; for(let t=0;t<=Math.min(succ,4);t++){if(t===1) continue; const bx=succ-t; o.push(`${bx} box${bx===1?'':'es'} healed, held ${t?Math.round(T/t*10)/10:T} turns`);} res+=' · each one heals a box or goes into the time (one alone changes nothing): '+o.join('; ')+(succ>4?'; …':'')+' (boxes only up to the damage marked).';}
  if(B.roll&&W.grenade&&!B.warn) res+=succ?` · each success takes 2 m off the scatter (4 m for aerodynamic grenades and launchers); the GM rolls the scatter and places the blast (core p. 97). Thrown grenades come off in After the session, under Used up.`:' · no successes: it scatters the full distance the GM rolls, in a direction the GM rolls, and the GM places the blast (core p. 97). Thrown grenades come off in After the session, under Used up.';
  if(B.roll&&W.kind==='matrix'&&W.v2&&succ>0&&!B.warn){const i=Math.min(3,L4.indexOf(W.lv)+Math.floor(succ/2)); res+=` · it hits for ${W.rating}${L4[i]} before the target resists (VR2 p. 124).`;}
  if(B.roll&&B.roll.host){const H=B.roll.host; res+=` · the host rolled ${H.r.join(' ')} → ${H.k} vs your Detection Factor ${H.df}: `+(succ>H.k?'you win the test.':'the host wins; the operation fails.')+` Add ${H.k} to your security tally (VR2 p. 19).`;}
  let nodeFail=false; if(B.roll&&B.roll.node){const N=B.roll.node, sc=N.sec||0, runs=succ>N.k&&succ-N.k>=sc; nodeFail=!runs; res+=` · the node rolled ${N.r.join(' ')} → ${N.k} vs your Evasion ${N.ev}. You need more than ${N.k}${sc?`, with at least ${sc} past it for the ${SECN[sc]} code (${N.k+Math.max(sc,1)} in all)`:''}: `+(runs?'the utility runs.':'it doesn’t run.');}
  B._cur={W,tn,dice,dSrc,dmg,rounds,spend,rows,spellF,kd:kdA}; // used by the buttons
  const amods=`TN ${tn}: `+(rows.filter(([k,x,v])=>v&&!/^(\+?0|—|−0)$/.test(String(v))).map(([k,x,v])=>k+' '+v).join(', ')||'no modifiers')+` · ${dice} dice`;
  // got hit
  const G=B.gh, spellHit=G.kind==='mana'||G.kind==='phys', mxHit=G.kind==='icp', blackHit=G.kind==='black', derm=hasDerm()||gearLevel('body:Dermal Plating');
  const armV=armorAgainst(ar)[G.kind]||0;
  const armWhy=G.kind==='ball'?'Ballistic '+ar.b:G.kind==='imp'||G.kind==='blast'?'Impact '+ar.i:G.kind==='gel'?'Impact '+ar.i+' (gel)':G.kind==='flech'?`higher of double Impact (${2*ar.i}) or Ballistic (${ar.b})`:G.kind==='apds'?`Ballistic ${ar.b} halved, rounded down (GM call)`:'armor doesn’t help against spells';
  const hard=dkI?(+dkI.h||0):0;
  const v2d=!!(dkI&&dkI.vr2), v2a=v2d?v2Armor():0; const gPow=G.kind==='gel'?G.pow-2:G.pow, gTn=mxHit?(v2d?Math.max(2,G.pow-v2a):G.pow):blackHit?Math.max(2,G.pow-hard):(spellHit?G.pow:Math.max(2,gPow-armV))+susPen();
  let gLv=G.lvl; if(G.kind==='flech'&&G.fl&&derm) gLv=L4[Math.max(0,L4.indexOf(G.lvl)-1)];
  const mpcp=dkI?(+dkI.mpcp||0):0; if(mxHit&&(B.hpool==null)){const mx=typeof matrixInfo==='function'?matrixInfo():null; B.hpMax=mx&&!chipNoPool(/^computer/i)?mx.pool:0; B.hpool=B.hpMax;}
  const gBase=mxHit?(v2d?(+((dkI.persona||{}).Bod)||0):mpcp):(G.kind==='mana'||(blackHit&&G.stun))?attrNow('wil'):blackHit?natBody():bodyR, gSp=mxHit?Math.min(G.spend,B.hpool||0):spellHit?(isMag?Math.min(G.spend,B.mpool):0):blackHit?0:Math.min(G.spend,B.pool);
  const gPoolName=mxHit?'Hacking Pool':spellHit?'Magic Pool (spell defense)':'Combat Pool';
  let gRes=''; if(G.roll){const R=G.roll,k=R.r.filter(x=>x>=R.tn).length+(R.ks||0),pk=R.r.slice(R.r.length-R.pool).filter(x=>x>=R.tn).length; R.boxes=null; R.final=null;
    if(G.att===0&&R.kind!=='blast'){gRes=R.kind==='mana'||R.kind==='phys'?'The caster had no successes: the spell has no effect (core p. 131).':'The attacker had no successes: it misses, no damage (core p. 90–91).';}
    else if(R.kind==='icp'&&R.v2){const i=L4.indexOf(R.lvl)+Math.floor(G.att/2)-Math.floor(k/2); R.mx=true; if(i<0){R.boxes=0; gRes=`${k} success${k===1?'':'es'}: you stage it away, no damage.`;} else {const lv=L4[Math.min(3,i)]; R.boxes=V2BOX[lv]; gRes=`${k} success${k===1?'':'es'}: your icon takes ${lv} (${V2BOX[lv]} box${V2BOX[lv]>1?'es':''}; VR2 p. 124)`+(lv==='D'?'. VR2 p. 124 also says Deadly crashes the icon outright: GM call.':'.')+(v2a?' Marking it also takes a point off your Armor utility (VR2 p. 99).':'');}}
    else if(R.kind==='icp'){const n=Math.max(0,G.att-k); R.boxes=n; R.mx=true; gRes=`${k} success${k===1?'':'es'} vs ${G.att}: `+(n?`${n} box${n>1?'es':''} on your persona (10 crash the deck and dump you, core p. 179).`:'your persona shrugs it off.');}
    else if(R.kind==='black'){const n=Math.floor(Math.max(0,G.att-k)/2); R.boxes=n; gRes=`${k} success${k===1?'':'es'} vs the IC’s ${G.att}: `+(n?`${n} Light wound${n>1?'s':''} (${n} box${n>1?'es':''} ${R.stun?'Stun':'Physical'}; core p. 171).`:'no damage.');}
    else if((R.kind==='mana'||R.kind==='phys')&&k>G.att) gRes=`${k} successes vs the caster’s ${G.att}: you win, the spell doesn’t affect you (core p. 131).`;
    else if(R.pool&&pk>G.att&&!(R.kind==='mana'||R.kind==='phys'||R.kind==='blast')) gRes=`${k} successes; Combat Pool alone beat the attacker’s ${G.att}: a complete miss (core p. 91).`;
    else {const d=k-G.att, idx=L4.indexOf(R.lvl)+(d<0?Math.floor(-d/2):-Math.floor(d/2)); R.final=idx<0?null:L4[Math.min(3,idx)]; gRes=`${k} success${k===1?'':'es'} vs the attacker’s ${G.att}: `+(R.final?`takes ${R.final} ${R.stun?'Stun':'Physical'} (${BOXES[R.final]} box${BOXES[R.final]>1?'es':''}).`:'no damage.');}}
  if(G.roll&&kNote(G.roll)) gRes+=' Karma: '+kNote(G.roll)+'.';
  B._kdMax=Object.assign(B._kdMax||{},{gh:gBase}); const kdG=Math.min((G.kdSrc||[]).length,gBase);
  B._gh={gTn,gBase,gSp,gLv,armV,gPow,spellHit,kd:kdG}; B._ghv2=mxHit&&v2d;
  const ghRolled=G.roll?dieTiles(G.roll):'';
  // skills
  const skl=[]; S.skills.filter(x=>x.name).forEach(x=>skillPartsNow(x).forEach(p=>{if(p.r) skl.push([p.label,p.r,p.chip]);}));
  chipsOn().forEach(([g])=>{const n=chipSkill(g); if(n&&!skl.some(x=>chipEq(x[0],n))) skl.push([n,+g.r||0,true]);});
  Object.entries(advSkills()).forEach(([n,r])=>skl.push([n,r]));
  const ia=adeptOn()?S.powers.filter(p=>p.type==='improvedAbility'):[];
  // powers and spells
  let pw='';
  if(S.magic==='adept') pw=S.powers.map(p=>{const c=powerCost(p); const P=allPowers()[p.type||'custom']||POWERS.custom; return `<details class="b2card"><summary><b>${E(p.type==='custom'?p.name:P.label)}</b><small>${c.cost} PP${P.pg?' · '+E(P.pg):''}</small></summary><p>${E(c.desc||'')}</p></details>`;}).join('');
  else if(isMag) pw=S.powers.map(p=>{const sp=spellFind(p.name); return `<details class="b2card"><summary><b>${E(p.name)}</b><small>Force ${+p.cost||1}${sp?' · '+E(sp.cat)+' · '+(sp.ty==='M'?'mana':'physical')+(sp.pg?' · '+E(sp.pg):''):''}</small></summary><p>${sp?'Drain '+E(drainText(sp,+p.cost||1)):''}${p.note?' · '+E(p.note):''}</p></details>`;}).join('');
  const cbox=at=>B.copy&&(B.copy.at||'atk')===at?`<div class="b2copy"><label for="b2r20" class="b2k">${E(B.copy.msg)}</label><input id="b2r20" readonly value="${E(B.copy.text)}"></div>`:'';
  // hit codes (fix8): one line the shooter copies and the target pastes into Got hit; nothing is sent anywhere
  const hc=B.roll&&!(B.roll.r.every(v=>v===1)&&!B.roll.ks)?hitCodeOf(W,dmg,succ,spellF):''; B._hc=hc; const hitRow=hc&&!B.warn?`<div class="b2hit"><button type="button" class="ghost" data-b2a="hitcopy">Copy the hit</button><span class="mono">${E(hc)}</span>${B.hitCopied&&B.hitCopied.t===hc?`<span class="note" role="status">${B.hitCopied.ok?'Copied. Paste it into your table’s chat, or read it out; the target pastes it into Got hit.':'Select the line and copy it.'}</span>`:''}</div>`:'';
  const pasteRow=`<div class="b2paste"><label class="b2f"><span class="b2k">Paste a hit</span><input type="text" data-b2in="hitpaste" value="${E(B.hitTxt||'')}" placeholder="Hit: Bullet 9M · 3 successes" autocomplete="off" spellcheck="false"></label><button type="button" class="ghost" data-b2a="hitpaste">Paste</button></div>${B.hitMsg?`<p class="note${B.hitMsg.bad?' b2warn':''}" role="status">${E(B.hitMsg.t)}</p>`:''}`;
  const sitN=sitSum.reduce((a,x)=>a+x[1],0), sitLab=sitSum.length?`Situation: ${SIGN(sitN)} (${sitSum.map(x=>x[0]).join(', ')})`:'Situation: none';
  // phone tabs under the vitals line, and the More tests tabs on wider screens (fix8)
  const magN=isMag?'Magic':S.magic==='adept'?'Adept powers':'', magH=(isMag?susHTML()+spiritsHTML():'')+(pw?`<section class="b2pan"><div class="b2h"><h3>${S.magic==='adept'?'Adept powers':'Spells'}</h3></div>${pw}</section>`:''), vehH=vehHTML(), chipH=chipsHTML();
  const MT=[['skills','Skill checks'],...(chipH?[['chips','Slotted chips']]:[]),...(vehH?[['veh','Vehicle tests']]:[]),...(magH?[['magic',magN]]:[])];
  const mt=MT.some(x=>x[0]===B.mt)?B.mt:'skills';
  const NT=[['atk','Attack'],['hit','Got hit'],['tests','Tests'],...(magH?[['magic',isMag?'Magic':'Powers']]:[]),...(vehH?[['veh','Vehicles']]:[])];
  const nt=NT.some(x=>x[0]===B.nt)?B.nt:'atk', ntc=k=>k===nt?' nton':'';
  const ntCtl={atk:'b2nt-atk',hit:'b2nt-hit',tests:'b2mt-skills'+(chipH?' b2mt-chips':''),magic:'b2mt-magic',veh:'b2mt-veh'};
  const ntabs=`<div class="b2ntabs" role="tablist" aria-label="Game night">${NT.map(([k,l])=>`<button type="button" role="tab" data-b2a="nt" data-d="${k}" aria-selected="${k===nt}" aria-controls="${ntCtl[k]}">${E(l)}</button>`).join('')}</div>`;
  const mtp=(k,h,ntk,cls)=>`<div class="b2mtp${cls||''}${k===mt?' on':''}${ntk===nt?' nton':''}" id="b2mt-${k}"${MT.length>1?` role="tabpanel" aria-labelledby="b2mtt-${k}"`:''} data-mt="${k}" data-nt="${ntk}">${h}</div>`;
  const vit=(()=>{const tk=tkGet(), mb=n=>Array.from({length:10},(_,j)=>`<i class="${j<n?'on':''}"></i>`).join(''), ph=Math.min(10,S.phys), sn=Math.min(10,S.stun);
    const I=iniNow(T), ini=B.ini==null?'—':String(Math.max(0,B.ini-w)), passes=B.ini==null?'':(()=>{const o=[];for(let x=Math.max(0,B.ini-w);x>0;x-=10)o.push(x);return o.length>1?'acts on '+o.join(', '):'';})();
    let rd=''; if(W.kind==='gun'&&W.gid){const at=(S.ammoT||{})[W.gid]; if(at) rd=`<span class="b2vi"><span class="b2k">Rounds</span><b>${at.in.n}${W.cap!=null?'/'+W.cap:''}</b></span>`;}
    const boxes2=`<span class="b2mb"><span class="b2k">P</span>${mb(ph)}</span><span class="b2mb st"><span class="b2k">S</span>${mb(sn)}</span>`;
    const condTxt=`Physical ${S.phys}, Stun ${S.stun}`, dd=d=>`data-b2a="drop" data-d="${d}" aria-expanded="${B.drop===d}" aria-controls="b2vp-${d}"`;
    const wornN=ar.bodyG?wearName(ar.bodyG):'', ess=(6-essenceUsed()).toFixed(2).replace(/\.?0+$/,'');
    const items=`<button type="button" class="b2vbox" ${dd('cond')} aria-label="${condTxt}. Open the condition monitor">${boxes2}</button>
      <span class="b2vi${w?' b2warn':''}"><span class="b2k">Wounds</span><b>${w?`+${w} TN, −${w} Init`:'unhurt'}</b></span>
      <span class="b2vg"><button type="button" class="b2vi b2whyt" ${dd('ini')} aria-label="Initiative ${I.r}${w?' minus '+w:''} plus ${I.d}D6: how it adds up, where you are and Copy for Roll20"><span class="b2k">Initiative ${I.r}${w?' − '+w:''} + ${I.d}D6</span><b>${ini}</b>${passes?`<small>${passes}</small>`:''}</button><button type="button" class="primary b2vb" data-b2a="ini">Roll</button></span>
      <span class="b2vi"><button type="button" class="b2k b2whyt b2whyk" ${dd('cp')} aria-label="Combat Pool ${B.pool} of ${T.cpool}: how it adds up">Combat Pool</button><span class="b2vs"><button class="ghost" data-b2s="vpool" data-d="-1" aria-label="Combat Pool down one">−</button><b>${B.pool}/${T.cpool}</b><button class="ghost" data-b2s="vpool" data-d="1" aria-label="Combat Pool up one">+</button></span></span>
      ${isMag?`<button type="button" class="b2vi b2whyt" ${dd('mp')} aria-label="Magic Pool ${B.mpool} of ${mpMax}: how it adds up"><span class="b2k">Magic Pool</span><b>${B.mpool}/${mpMax}</b></button>`:''}
      <button type="button" class="b2vi b2whyt" ${dd('karma')} aria-label="Karma Pool ${B.karma} of ${T.kpool}: how it adds up"><span class="b2k">Karma</span><b>${B.karma}/${T.kpool}</b>${tk.tot?`<small>team ${tk.left}/${tk.tot}</small>`:''}</button>${rd}
      <button type="button" class="b2vi b2whyt" ${dd('body')} aria-label="Body ${augAttr('body')}: how it adds up"><span class="b2k">Body</span><b>${augAttr('body')}</b>${hasDerm()?`<small>+1 dermal: ${bodyR} to resist</small>`:''}</button>
      <button type="button" class="b2vchip" ${dd('wear')} aria-label="Armor ${ar.b} Ballistic, ${ar.i} Impact${wornN?', '+E(wornN):''}. Open Wearing"><span class="b2k">Armor <span aria-hidden="true">▾</span></span><b>${ar.b} / ${ar.i}</b>${wornN?`<small>${E(wornN)}</small>`:''}</button>
      <button type="button" class="b2vi b2whyt" ${dd('react')} aria-label="Reaction ${T.reaction}: how it adds up"><span class="b2k">Reaction</span><b>${T.reaction}</b></button>
      ${S.magic!=='none'?`<button type="button" class="b2vi b2whyt" ${dd('magic')} aria-label="Magic ${magicNow()}, Essence ${ess}: how it adds up"><span class="b2k">Magic</span><b>${magicNow()}</b><small>Essence ${ess}</small></button>`:''}
      ${isMag&&susN()?`<button type="button" class="b2vi b2whyt b2warn" ${dd('sus')} aria-label="Sustaining ${susN()} spells, plus ${susPen()} to every target number: which ones"><span class="b2k">Sustaining</span><b>${susN()}</b><small>+${susPen()} to every TN</small></button>`:''}`;
    const vp=(d,h,c)=>`<div class="b2vp${c?' '+c:''}" id="b2vp-${d}" data-p="${d}"${B.drop===d?'':' hidden'}><button type="button" class="ghost b2vx" data-b2a="drop" data-d="${d}">Close</button>${h}</div>`;
    const whyP=B.drop==='cp'?vp('cp',whyCp(T),'b2whysh'):B.drop==='mp'&&isMag?vp('mp',whyMp(mpMax),'b2whysh'):B.drop==='karma'?vp('karma',whyKarma(T),'b2whysh'):B.drop==='body'?vp('body',whyBody(),'b2whysh'):B.drop==='react'?vp('react',whyReact(T),'b2whysh'):B.drop==='magic'&&S.magic!=='none'?vp('magic',whyMagic(),'b2whysh'):B.drop==='sus'&&isMag?vp('sus',whySus(),'b2whysh'):'';
    return `<div class="b2vit${B.vitOpen?' open':''}" role="region" aria-label="Vitals"><div class="b2vrow" id="b2vrow">${items}</div>
     <button type="button" class="b2vtuck" data-b2a="vit" aria-expanded="${!!B.vitOpen}" aria-controls="b2vrow" aria-label="Vitals: ${condTxt}${w?', wounds +'+w:''}. Show more">${boxes2}${w?`<b class="b2warn">+${w}</b>`:''}<span class="b2vmore">${B.ini==null?'':'Init '+ini+' · '}Pool ${B.pool} · Karma ${B.karma}</span><span aria-hidden="true">${B.vitOpen?'▴':'▾'}</span></button>
     ${ntabs}
     ${SHEETD.includes(B.drop)?`<button type="button" class="b2vscrim" data-b2a="drop" data-d="${B.drop}" tabindex="-1" aria-label="${B.drop==='wear'?'Close Wearing':'Close'}"></button>`:''}<div class="b2vpan b2vpan-${B.drop||'none'}">${vp('cond',`<section class="b2pan" id="b2cond"><div class="b2h"><h3>Condition</h3><span class="${w||S.phys>10?'b2warn':'b2ok'}">${E(cond)}</span></div>
     <span class="b2k">Physical</span><div class="b2boxes">${boxes('phys',10)}<span class="b2ovl">overflow</span>${boxes('phys',B10,true)}</div>
     <span class="b2k">Stun</span><div class="b2boxes">${boxes('stun',10)}</div>
     ${S.phys>10&&S.phys<=10+B10?`<div class="b2dying"><b>Bleeding out.</b> One more box every 10 minutes until someone stabilizes you; past ${10+B10} boxes you’re dead (core p. 111). To stabilize (core p. 115): First Aid, a Biotech test at the Deadly target number (10, “special”) within the first hour, then your own natural Body test against 10 if it fails; a trauma patch gives another natural Body test against 4 + dermal armor. A Heal or Treat spell or a DocWagon crew also works. Karma Pool can reroll your own Body tests.</div>`:''}
     ${dkI&&!dkI.vr2?`<span class="b2k">Persona (Matrix)</span><div class="b2boxes">${Array.from({length:10},(_,j)=>{const v=j+1,on=v<=(S.mxDmg||0); return `<button class="b2box${on?' on':''}" data-b2trk="mxDmg" data-v="${v}" aria-pressed="${on}" aria-label="Persona box ${v}"></button>`;}).join('')}</div>${(S.mxDmg||0)>=10?'<p class="note b2warn">Crashed: the deck dumps you (dump shock, core p. 165, 179). It’s back to full when restarted.</p>':''}`:''}${T.wmod.pain?`<p class="note">Pain Resistance ${T.wmod.pain} is already taken off the wound modifier.</p>`:''}</section>`)}${vp('wear',wearPanelHTML())}${whyP}${vp('ini',`<section class="b2pan b2vini b2why" aria-label="Initiative: how it adds up"><div class="b2h"><h3>Initiative</h3><b class="b2whyb">${iniNow(T).r}${w?' − '+w:''} + ${iniNow(T).d}D6</b></div>
     <div class="b2rows">${whyRows(whyIniRows(T,w))}</div>
     ${iniModes(T).length?`<label class="b2f b2inim"><span class="b2k">Where</span><select data-b2="inim"><option value="" ${!B.inim?'selected':''}>Physical world: ${T.reaction} + ${T.dice}D6</option>${iniModes(T).map(m=>`<option value="${m.id}" ${B.inim===m.id?'selected':''}>Matrix, ${E(m.l.charAt(0).toLowerCase()+m.l.slice(1))}: ${m.r} + ${m.d}D6</option>`).join('')}</select></label>`:''}
     <div class="b2ini"><b>${B.ini==null?'—':Math.max(0,B.ini-w)}</b><span>${B.ini==null?'Roll to see your passes':'Acts on '+(()=>{const o=[];for(let x=Math.max(0,B.ini-w);x>0;x-=10)o.push(x);return o.join(', ')||'—';})()}</span></div>
     <div class="b2row"><button class="ghost" data-b2a="cini">Copy for Roll20</button></div>${cbox('ini')}<p class="note">Each pass is 10 lower; wounds come off the total (core p. 78).${iniNow(T).m?` In the Matrix, wired reflexes, magic and a VCR add nothing (core p. 178)${iniNow(T).m.id==='kb'?'; keyboard only halves Reaction, rounded down here, and keeps the response-increase dice':''}. Talking with the physical world by voice or screen costs 1D6 of Matrix Initiative under VR2 (p. 120).`:''}</p></section>`,'b2whysh')}</div></div>`;})();
  return `${vit}${gmHitsHTML()}<div class="b2top2">
   <section class="b2pan b2atk${ntc('atk')}" id="b2nt-atk" data-nt="atk" aria-label="Attack"><div class="b2h"><h3>Attack</h3><span class="note">pick and roll; what rarely changes between shots sits under Situation</span></div>
     <div class="b2atop"><div class="b2aw"><label class="b2f b2wide"><span class="b2k">Attack with</span><select data-b2="wid" class="b2wsel">${groups}</select></label>${ammoLine}</div><div class="b2amid">${top}</div><div class="b2apool">${poolCtl}</div></div>
     ${W.grp==='off'?'<p class="note b2warn">This one isn’t on you: move it to your carried gear in Stash before you can use it.</p>':''}
     <div class="b2sitbar"><button class="b2sitb${sitSum.length?' set':''}" data-b2a="sit" aria-expanded="${!!B.sitOpen}" aria-controls="b2sit">${E(sitLab)} <span aria-hidden="true">${B.sitOpen?'▴':'▾'}</span></button><button class="ghost" data-b2a="clear">Clear</button></div>
     ${B.sitOpen?`<div class="b2sitbg" data-b2a="sitdone"></div><div class="b2sit" id="b2sit" role="dialog" aria-label="Situation"><div class="b2sith"><b>Situation</b><span class="note">${E(sitLab.replace(/^Situation: /,''))}</span></div><div class="b2sitg">${situ}</div><div class="b2sitf"><button class="ghost" data-b2a="clear">Clear</button><button class="primary" data-b2a="sitdone">Done</button></div></div>`:''}
     <div class="b2one">
      <div class="b2res"><div class="b2nums"><div><span class="b2k">Dice</span><b>${dice}</b><small>${E(dSrc)}</small></div><div><span class="b2k">Target number</span><b class="b2warn">${tn}</b></div><div><span class="b2k">Damage</span><b>${E(dmg)}</b><small>${E(dmgNote||W.note||'')}</small></div></div>
       ${downNow?`<p class="b2warn" role="status">${S.phys>=10?"Physical track full: the runner is down and can’t act (core p. 112).":"Stun track full: the runner is unconscious (core p. 112)."} Heal or wake them first.${anyBtn}</p>`:""}${crashedNow?`<p class="b2warn" role="status">The deck has crashed: restart it before running programs (core p. 179).${downNow?"":anyBtn}</p>`:""}
       <div class="b2row"><button class="primary b2roll" data-b2a="roll" ${W.grp==='off'||notLoaded||stopRoll?'disabled':''}>Roll ${dice} dice${rounds?' · '+rounds+' round'+(rounds>1?'s':''):''}</button></div>
       ${notLoaded?(tooBig?`<p class="note b2warn">${E(GEARDB[nlG.key].n)} ${+nlG.r||1} is ${nlSz} Mp, more than the deck’s ${nlDk.am} Mp of active memory in all, so it can never be loaded (${nlDk.vr2?'VR2 p. 85':'core p. 172'}). Lower its rating or add active memory.</p>`:`<p class="note b2warn">This program isn’t in active memory. Load it first (a Simple Action to start; big programs take longer, core p. 173–174). <button class="ghost" data-b2a="mload">Load it</button></p>`):''}
       <div class="b2rc" aria-live="polite">${B.roll?`<b class="b2rc-big${nodeFail?' b2warn':''}">${E(res)}</b><div class="b2dice">${rolled}</div>`:`<p class="note">${E(res)}</p>`}</div>${whyCard('atk',amods,whyBox('Attack · '+W.n,`TN ${tn} · ${dice} dice`,[['Target number','','','h'],...rows.map(([k,s,v])=>{const m=String(s).match(/^(target is|target cover|you are|you’re in melee with|second firearm|other targets this phase) · (.*)$/); return m?[m[1].charAt(0).toUpperCase()+m[1].slice(1)+': '+k.charAt(0).toLowerCase()+k.slice(1),m[2],v,'tn']:[k,s,v,'tn'];}),['Target number','',String(tn),'t'],...whyDiceRows(dSrc,dice,['gun','melee'].includes(W.kind)&&!aimLock?['Combat Pool',maxSp]:null)]))}${hitRow}${kOK?karmaTuck(B.roll,'atk',kdBase):`<p class="note">Karma Pool is for your own tests; this is the ${W.kind==='spirit'?'spirit’s':'drone’s'} roll.</p>`}${drain}</div>
      <div class="b2aside"><button class="ghost" data-b2a="copy" ${W.grp==='off'?'disabled':''}>Copy for Roll20</button><button class="ghost" data-b2a="newact">New action: refresh pools</button><button class="ghost" data-b2a="newturn">New Combat Turn</button><button class="ghost" data-b2a="newscene">New scene</button>
       <p class="note">Pools refresh at the start of each of your actions (core p. 78, 84). A new Combat Turn also clears Initiative. A new scene refills Karma Pool and Team Karma (core p. 191).</p></div></div>${cbox('atk')}</section>
   <section class="b2pan b2gh${ntc('hit')}" id="b2nt-hit" data-nt="hit" aria-label="Got hit"><div class="b2h"><h3>Got hit</h3><span class="note">armor follows what you wear</span></div>
     ${pasteRow}
     <div class="b2ctl">${sel('gh:kind','What hit you',Object.entries(HITS),G.kind)}${step('gh:pow',spellHit?'Spell Force':mxHit?(v2d?'Attack’s Power (its rating)':'Node’s System Rating'):blackHit?'IC Rating':'Incoming Power',G.pow)}${(mxHit&&!v2d)||blackHit?'':sel('gh:lvl','Damage level',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],G.lvl)}${step('gh:att',spellHit?'Caster’s successes':mxHit||blackHit?'IC’s successes':'Attacker’s successes',G.att)}${G.kind==='gel'||mxHit?'':sel('gh:dt','Damage',[['p','Physical'],['s','Stun (Stun spells, stun weapons, pulled blows)']],G.stun?'s':'p')}${(spellHit&&!isMag)||blackHit?'':step('gh:spend',gPoolName+' ('+(mxHit?(B.hpool||0):spellHit?B.mpool:B.pool)+' left)',gSp)}
     ${G.kind==='flech'&&derm?`<label class="b2f b2wide b2chk"><input type="checkbox" data-b2c="gh:fl" ${G.fl?'checked':''}> The code already has flechette’s extra level (an “(f)” code)</label>`:''}</div>
     ${mxHit&&v2d?`<p class="note">Resist with your persona’s Bod plus Hacking Pool against the Power${v2a?' less your Armor utility ('+v2a+')':''}.${v2Utils().some(u=>u.n==='Armor'&&u.deg)?' Your Armor utility has lost '+v2Utils().filter(u=>u.n==='Armor').reduce((m,u)=>Math.max(m,u.deg),0)+' point(s); a fresh copy (Swap Memory) restores it. <button class="ghost" data-b2a="armfresh">Fresh copy loaded</button>':''} Every 2 attacker successes raise the level a step and every 2 of yours lower it; IC hits Moderate on Blue and Green hosts, Serious on Orange and Red (VR2 p. 123–124).${dkI.vr2&&dkI.vr2.d&&dkI.vr2.d.asist==='hot'?' On a hot deck, damage from white or gray IC also calls for a Willpower test against 2, 3 or 5 for Light, Moderate or Serious (+2 DNI only, −2 with an ICCM); failing it is 1 Stun box (VR2 p. 124).':''}</p>`:mxHit?'<p class="note">Resist with your MPCP plus Hacking Pool (core p. 179). Damage goes on the persona monitor below.</p>':blackHit?'<p class="note">Hanging tough: Body (Willpower for Stun) against the IC Rating; hardening counts as armor; every 2 extra IC successes is a Light wound (core p. 171). Jacking out is a Willpower test against the IC Rating.</p>':''}
     <div class="b2nums"><div><span class="b2k">Dice</span><b>${gBase+gSp+kdG}</b><small>${mxHit?(v2d?'persona Bod ':'MPCP ')+gBase:G.kind==='mana'||(blackHit&&G.stun)?'Willpower '+gBase:blackHit?'natural Body '+gBase:'Body '+bodyR+(hasDerm()?' with dermal armor':'')}${kdG?' + '+kdG+' Karma':''}${gSp?' + '+gSp+' '+gPoolName:''}</small></div><div><span class="b2k">If successes tie</span><b>${gLv}${G.kind==='gel'?' Stun':''}</b><small>${G.kind==='flech'&&G.fl&&derm?'dermal armor cancels flechette’s extra level (core p. 93)':G.kind==='gel'?'gel: Power −2, Stun (core p. 95)':G.kind==='apds'?'core p. 277':'core p. 91'}</small></div></div>
     <div class="b2row"><button class="primary" data-b2a="ghroll">Roll ${gBase+gSp+kdG} dice</button><button class="ghost" data-b2a="ghcopy">Copy for Roll20</button><button class="ghost" data-b2a="ghmark" ${G.roll&&(G.roll.final||G.roll.boxes)?'':'disabled'}>Mark it on the monitor</button></div>
     <div class="b2rc" aria-live="polite">${G.roll?`<b class="b2rc-big">${E(gRes)}</b><div class="b2dice">${ghRolled}</div>`:`<p class="note">Pool dice have an outline: if they alone beat the attacker, it’s a complete miss.</p>`}</div>${whyCard('gh',`TN ${gTn}: `+(spellHit?`Force ${G.pow}`:`Power ${gPow}, armor −${armV}`)+(susPen()?`, sustaining +${susPen()}`:'')+` · ${gBase+gSp+kdG} dice`,whyBox('Got hit · '+(HITS[G.kind]||'hit')+' '+G.pow+G.lvl,`TN ${gTn} · ${gBase+gSp+kdG} dice`,[['Target number','','','h'],[spellHit?'Spell Force':'Power'+(G.kind==='gel'?' ('+G.pow+' − 2 for gel)':''),'',String(spellHit?G.pow:gPow)],['Armor: '+armWhy,'',spellHit?'—':'−'+armV,'tn'],...(susPen()?[['Sustaining '+susN()+' spell'+(susN()>1?'s':''),'core p. 128','+'+susPen(),'tn']]:[]),['Target number',mxHit?'the node’s System Rating':blackHit?'IC Rating'+(hard?' − Hardening '+hard:''):spellHit?'':'never below 2 before sustaining',String(gTn),'t'],['Dice','','','h'],...(G.kind!=='mana'&&!mxHit&&!blackHit&&hasDerm()?[['Body','',String(augAttr('body'))],['Troll dermal armor','core p. 45','+1']]:[[mxHit?(v2d?'Persona Bod':'MPCP'):G.kind==='mana'||(blackHit&&G.stun)?'Willpower':blackHit?'Natural Body':'Body','',String(gBase)]]),...(kdG?[['Karma','','+'+kdG]]:[]),...(gSp?[[gPoolName,'','+'+gSp]]:!blackHit&&!(spellHit&&!isMag)?[[gPoolName,'','+0']]:[]),['Dice','',String(gBase+gSp+kdG),'t']]))}${karmaTuck(G.att?G.roll:null,'gh',gBase)}${cbox('gh')}</section>
  </div>
  <div class="b2mtw">${MT.length>1?`<div class="b2mtabs" role="tablist" aria-label="More tests">${MT.map(([k,l])=>`<button type="button" role="tab" id="b2mtt-${k}" data-b2a="mt" data-d="${k}" aria-selected="${k===mt}" aria-controls="b2mt-${k}">${E(l)}</button>`).join('')}</div>`:''}
   ${mtp('skills',`
   <section class="b2pan"><div class="b2h"><h3>Skill checks</h3>${step('sk:tn','Target number',B.sk.tn)}</div>
     <div class="b2skills">${skl.map(([n,r,ch])=>{const x=ch?0:ia.filter(p=>n===p.skill||n.startsWith(p.skill)).reduce((a,p)=>a+(+p.n||0),0); return `<div class="b2r${ch?' b2chipped':''}"><span>${E(n)}${ch?' <span class="b2tag">chip</span>':''}</span><b>${r}${x?'+'+x:''}</b><span class="b2row"><button class="ghost" data-b2k="${E(n)}" data-d="${r+x}">Roll</button><button class="ghost" data-b2k="${E(n)}" data-d="${r+x}" data-copy="1" aria-label="Copy ${E(n)} for Roll20">Roll20</button></span></div>`;}).join('')||'<p class="note">No skills.</p>'}</div>
     ${(()=>{if(typeof SKILLWEB==='undefined'||typeof swOptions!=='function') return ''; const have=swHave(); const L=SKILLWEB.SKILLS.filter(n=>!have[n]); if(!L.length) return ''; const tgt=L.includes(B.dft)?B.dft:L[0]; const o=swOptions(tgt,B.sk.tn)[0];
       return `<div class="b2ctl b2dft"><label class="b2f"><span class="b2k">Default on a skill you don’t have</span><select data-b2="dft">${L.map(n=>`<option value="${E(n)}" ${n===tgt?'selected':''}>${E(swLabel(n))}</option>`).join('')}</select></label>${o?`<div class="b2f"><span class="b2k">Best route (Skill Web, core p. 66–69)</span><span>${E(o.from)}${o.kind==='attr'?' (attribute)':''}: ${o.dice} dice, TN +${o.tn}</span></div><div class="b2f"><span class="b2k">&nbsp;</span><button class="primary" data-b2a="dfroll">Roll it</button></div>`:'<p class="note">No route: the GM decides.</p>'}</div>`;})()}
     ${(()=>{const L=(S.contacts||[]).filter(c=>c&&c.name); if(!L.length) return ''; const C=L[Math.min(L.length-1,+B.ctc||0)], st=ctStats(C), et=ctEtq(st,C), cur=C.cb==null?(st?st.id:''):C.cb;
       return `<div class="b2ctl b2cts"><label class="b2f"><span class="b2k">Ask a contact (legwork)</span><select data-b2="ctc">${L.map((c,i)=>`<option value="${i}" ${+B.ctc===i?'selected':''}>${E(c.name)}${c.role?' · '+E(c.role):''}${c.level&&c.level!=='Contact'?' ('+E(c.level)+')':''}</option>`).join('')}</select></label>
       <label class="b2f"><span class="b2k">Their numbers</span><select data-b2="ctb"><option value="" ${cur===''?'selected':''}>Not set: the GM rolls for them</option><option value="own" ${cur==='own'?'selected':''}>Type their numbers</option>${CTBOOK.map(b=>`<option value="${b[0]}" ${cur===b[0]?'selected':''}>Like the book’s ${E(b[1])} (core ${b[2]})</option>`).join('')}</select></label>
       ${cur==='own'?`<label class="b2f"><span class="b2k">Etiquette</span><input type="number" min="0" max="12" data-b2ct="ce" value="${+C.ce||0}" style="width:4.5em"></label><label class="b2f"><span class="b2k">Charisma</span><input type="number" min="0" max="12" data-b2ct="cc" value="${+C.cc||0}" style="width:4.5em"></label><label class="b2f"><span class="b2k">Intelligence</span><input type="number" min="0" max="12" data-b2ct="ci" value="${+C.ci||0}" style="width:4.5em"></label>`:''}
       ${st&&st.et.length>1?`<label class="b2f"><span class="b2k">Their Etiquette</span><select data-b2="cte">${st.et.map((x,i)=>`<option value="${i}" ${x===st.et.find(y=>y===et.l)||x[0]===et.l?'selected':''}>${E(x[0])} ${x[1]}</option>`).join('')}</select></label>`:''}</div>
       <div class="b2ctl"><button class="ghost" data-b2a="ctroll">You ask: your Etiquette</button>${st?`<button class="ghost" data-b2a="ctchk">They check around: ${E(et.l)} ${et.r}${et.def?' (+4)':''}, TN +2</button>`:''}</div>
       <p class="note">${st?`${E(C.name)} rolls as ${E(st.n)}${st.guess?' (matched from the role; change it above)':''}: Charisma ${st.cha}, Intelligence ${st.int}. `:''}Your Etiquette roll is how well you ask; the GM sets the target number from the information table. A baseline fee is their Etiquette × your successes × (their Charisma + Intelligence) × 10¥, then Negotiation (core p. 202). “Check around” is the contact’s own Etiquette Test at +2; any success and they report back in 2D6 hours (core p. 202). Buddies help more readily than Contacts.</p>`;})()}
     ${resHTML(B.sk.res,'Wound modifiers'+(susPen()?' and the +'+susPen()+' for sustaining':'')+' are added to the target number for you.')}${cbox('sk')}</section>`,'tests')}
   ${chipH?mtp('chips',chipH,'tests'):''}
   ${vehH?mtp('veh',vehH,'veh'):''}
   ${magH?mtp('magic',magH,'magic',' b2grid'):''}
  </div>`;
}
function spiritsHTML(){const L=S.spirits||[], herm=S.magic==='hermetic'; let t=B.spt||(herm?'earth':'nature'); if(herm&&t==='nature') t='earth'; if(!herm&&t!=='nature') t='nature'; B.spt=t;
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  return `<section class="b2pan"><div class="b2h"><h3>Spirits</h3><span class="note">${herm?'hermetics call elementals':'shamans call nature spirits'} (core p. 140–144)</span></div>
   ${L.map((x,i)=>`<div class="b2r"><span><b>${E(SPIRITS[x.t]?SPIRITS[x.t].n:x.t)}</b> <small>Force ${x.f}${x.on?' · called '+E(x.on):''}${x.t==='nature'?' · leaves at the next sunrise or sunset (core p. 139)':''}</small></span><span class="b2step"><small>services</small><button class="ghost" data-b2sv="${i}|-1" aria-label="One service used">−</button><b>${+x.sv||0}</b><button class="ghost" data-b2sv="${i}|1" aria-label="One more service">+</button><button class="ghost" data-b2sprm="${i}" aria-label="Release this spirit">Release</button></span></div>`).join('')||'<p class="note">None called. Add one to attack with it from the Attack panel.</p>'}
   <div class="b2ctl"><label class="b2f"><span class="b2k">Kind</span><select data-b2="spt">${(herm?[['earth','Earth elemental'],['fire','Fire elemental'],['water','Water elemental'],['air','Air elemental']]:[['nature','Nature spirit']]).map(([v,l])=>`<option value="${v}" ${t===v?'selected':''}>${l}</option>`).join('')}</select></label>${step('spf','Force',B.spf||3)}<div class="b2f"><span class="b2k">&nbsp;</span><button data-b2a="conjure">Conjure (roll)</button></div></div>
   ${B.drainHit&&B.drainHit.what==='conjuring Drain'?`<div class="b2row"><button class="primary" data-b2a="drmark">Mark the conjuring Drain: ${B.drainHit.n} ${B.drainHit.phys?'Physical':'Stun'}</button></div>`:''}${resHTML(B.conjRes,`Conjuring ${bestRating(/^conjuring/i)} dice against the Force; each success is a service, none means no spirit. Then Drain: Charisma ${attrNow('cha')} dice against the Force (core p. 139–140). No Magic Pool.`)}
   <details class="b2more"><summary>Rolled it at the table instead</summary><div class="b2ctl">${step('spsv','Services owed',B.spsv==null?1:B.spsv)}<div class="b2f"><span class="b2k">&nbsp;</span><button class="primary" data-b2a="spadd">Add spirit</button></div></div></details></section>`;}
// vehicle tests (core p. 106-107): Position Test and Crash Test, with Control Pool for riggers
const VSKILLS=/^(Car|Bike|Hovercraft|Motorboat|Rotor Craft|Sailboat|Vectored Thrust|Winged Plane|Ship|Walker|LTA|Submarine)/i;
// Vehicle tests: Position, Crash and Escape (core p. 106-107) and the vehicle's own Damage Resistance Test (R2 p. 53, or core
// p. 108 with Rigger 2 off). One place works out the numbers so the panel and the roll agree.
const VDM=n=>n>=10?'Destroyed':n>=6?'Serious':n>=3?'Moderate':n>=1?'Light':'';
const VDMT=n=>n>=6?3:n>=3?2:n>=1?1:0; // vehicle damage modifier to tests that involve the vehicle (core p. 109)
const ESCM={o:-4,n:-2,r:0,t:2};          // Escape Test modifiers (core p. 107)
function vehCalc(){const V=S.gear.filter(g=>isVehG(g)&&GEARDB[g.key]); if(!V.length) return null;
  const vi=Math.min(B.vveh||0,V.length-1), v=V[vi], R=typeof R2OBJ!=='undefined'?R2OBJ[v.key]:null, rr=R?R.r:{}; const hand=parseInt(String(rr.H||'').split('/')[0],10)||4, cruise=parseInt(String(rr.Sp||'').split('/')[0],10)||0;
  const VS=typeof VSTAT!=='undefined'?VSTAT[v.key]:null; let body=VS?+VS[2]||0:null, armor=VS?+VS[3]||0:null;
  if(R&&v.vb&&v.vb.mods&&v.vb.mods.length&&typeof vbFixG==='function'){try{const vv=vbFixG(v), rc=VB.calc(vv,v.vb); if(vv&&vv.B!=null) body=+vv.B||0; if(rc&&rc.s&&rc.s.A!=null) armor=+rc.s.A||0;}catch(e){}}
  const sk=[]; S.skills.filter(x=>x.name&&VSKILLS.test(x.name)).forEach(x=>skillPartsNow(x).forEach(p=>{if(p.r) sk.push([p.label,p.r,p.chip]);})); chipsOn().forEach(([g])=>{const n=chipSkill(g), c=chipInfo(g); if(n&&(VSKILLS.test(c.sk)||VSKILLS.test(n))&&!sk.some(x=>chipEq(x[0],n))) sk.push([n,+g.r||0,true]);}); const ski=Math.min(B.vsk||0,Math.max(0,sk.length-1)); const skill=sk[ski]||['no vehicle skill: defaulting (GM)',0];
  const vcr=gearLevel('body:Vehicle Control Rig'), cp=vcr?Math.floor((attrNow('quick')+attrNow('int'))/2)+2*vcr:0; if(B.cpool==null||B.cpMax!==cp){B.cpMax=cp;B.cpool=cp;}
  const kind=['pos','crash','hit'].includes(B.vtest)?B.vtest:'pos', ter=B.vter||'n', vChip=!!skill[2]&&chipNoPool(VSKILLS), dmg=Math.max(0,Math.min(10,+v.vdmg||0)), vdm=VDMT(dmg), r2=!!booksOn().r2;
  const o={V,vi,v,hand,cruise,body,armor,sk,ski,skill,cp,kind,ter,vChip,dmg,vdm,r2};
  if(kind!=='hit'){const tm=(kind==='pos'?{o:0,n:1,r:2,t:4}:{o:-1,n:0,t:2,r:4})[ter]; o.tm=tm; o.tn=Math.max(2,hand+tm+vdm+woundMods().m+susPen()); o.sp=vChip?0:Math.min(B.vsp||0,B.cpool); o.dice=skill[1]+o.sp; return o;}
  const H=B.vh||(B.vh={pow:6,lvl:'M',att:1,av:false}); const bd=body!=null?body:Math.max(0,B.vhB||0), ar=armor!=null?armor:Math.max(0,B.vhA||0), L=L4.indexOf(H.lvl);
  o.H=H; o.bd=bd; o.ar=ar; o.lvl=H.av?H.lvl:(L>0?L4[L-1]:null); o.noPen=!H.av&&ar>0&&H.pow<=ar;
  // Rigger 2: armor takes its rating off the Power (half against AV); Body + Control Pool (no more than the driving skill) against that Power
  // core: armor works as a barrier, Power minus Body + armor (Body alone if unarmored), Body + half armor in dice; AV loses armor only
  const tnP=r2?H.pow-(H.av?Math.floor(ar/2):ar):(H.av?H.pow-ar:ar>0?H.pow-(bd+ar):H.pow-bd); o.tn=Math.max(2,tnP);
  o.cap=r2?skill[1]:Infinity; o.sp=vChip?0:Math.min(B.vsp||0,B.cpool,o.cap); o.dice=(r2||!ar?bd:bd+Math.floor(ar/2))+o.sp; o.pg=r2?'R2 p. 53':'core p. 108'; return o;}
function vehHTML(){const o=vehCalc(); if(!o) return ''; const {V,vi,v,hand,cruise,sk,ski,skill,cp,kind,ter,vChip,dmg,vdm,r2}=o;
  const sel=(id,lab,opts,val)=>`<label class="b2f"><span class="b2k">${E(lab)}</span><select data-b2="${id}">${opts.map(([o,t])=>`<option value="${E(o)}" ${String(o)===String(val)?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  const num=(id,lab,val)=>`<label class="b2f"><span class="b2k">${E(lab)}</span><input type="number" min="0" inputmode="numeric" data-b2="${id}" value="${val==null||val===''?'':E(val)}" style="width:6rem"></label>`;
  const pool=cp&&!vChip?step('vsp','Control Pool ('+B.cpool+' left'+(kind==='hit'&&r2?', up to '+o.cap:'')+')',o.sp):cp?'<span class="note">Vehicle ActiveSoft: no Control Pool (core p. 248)</span>':'';
  const track=`<div class="b2r${dmg?' b2warn':''}"><span>Vehicle damage <small>${dmg?`${VDM(dmg)}: ${dmg} of 10 boxes${dmg<10?`, +${vdm} to its tests, driver’s Reaction −${vdm} for Initiative`:''} (core p. 109)`:'none marked'}</small></span><b>${dmg}/10</b></div>`;
  let ctl='', rows='', btn='', tail='', extra='';
  if(kind!=='hit'){
    ctl=sel('vter','Terrain',[['o','Open'],['n','Normal'],['r','Restricted'],['t','Tight']],ter)+pool;
    rows=`<div class="b2r"><span>Handling</span><b>${hand}</b></div><div class="b2r alt"><span>Terrain</span><b>${SIGN(o.tm)}</b></div>${vdm?`<div class="b2r"><span>Vehicle damage</span><b class="b2warn">+${vdm}</b></div>`:''}${woundMods().m?`<div class="b2r"><span>Wounds</span><b class="b2warn">+${woundMods().m}</b></div>`:''}<div class="b2r tot"><span>Target number</span><b>${o.tn}</b></div>`;
    btn=`<button class="primary" data-b2a="vroll">Roll ${o.dice} dice</button><button class="ghost" data-b2a="vref">New turn${kind==='pos'?': log it and refresh Control Pool':': refresh Control Pool'}</button>`;
    tail=kind==='pos'?`Each success moves you ${cruise||'cruising speed'} m; keep the count for the Escape Test (core p. 106–107).`:`Fail and you crash: Power ${Math.floor(cruise/10)} (cruising speed ÷ 10), damage by speed (core p. 107).`;
    if(kind==='pos') extra=chaseHTML(o,sel,step,num);}
  else {const H=o.H, known=o.body!=null;
    ctl=sel('vhk','Weapon',[['w','Ordinary weapon'],['av','Anti-vehicle (AV) munition']],H.av?'av':'w')+step('vhp','Incoming Power',H.pow)+sel('vhl','Damage level',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],H.lvl)+step('vha','Attacker’s successes',H.att)+(known?'':step('vhB','Vehicle Body',o.bd)+step('vhA','Vehicle armor',o.ar))+pool;
    rows=`<div class="b2r"><span>Body <small>${known?'from the vehicle':'typed in'}</small></span><b>${o.bd}</b></div><div class="b2r alt"><span>Armor</span><b>${o.ar}</b></div><div class="b2r"><span>Damage level <small>${H.av?'AV: not reduced':'one level lower against a vehicle'}</small></span><b>${o.lvl||'none'}</b></div><div class="b2r tot"><span>Target number <small>${r2?`Power ${H.pow} − ${H.av?'half armor '+Math.floor(o.ar/2):'armor '+o.ar}`:H.av?`Power ${H.pow} − armor ${o.ar}`:o.ar?`Power ${H.pow} − (Body + armor) ${o.bd+o.ar}`:`Power ${H.pow} − Body ${o.bd}`}</small></span><b>${o.tn}</b></div>`;
    const why=o.noPen?`Power ${H.pow} doesn’t beat armor ${o.ar}: no damage gets through (${o.pg}). Use the weapon’s base Power, before burst or full-auto.`:!o.lvl?`A Light weapon can’t hurt a vehicle unless it uses special ammunition (${o.pg}).`:!H.att?'The attacker had no successes: a miss.':(r2&&o.bd===0)?`Body 0: any success by the attacker destroys it (R2 p. 53).`:'';
    btn=why?`<p class="note b2warn">${E(why)}</p>`:`<button class="primary" data-b2a="vhit">Roll ${o.dice} dice</button>`;
    btn+=`<button class="ghost" data-b2a="vhmark" ${B.vhRes&&B.vhRes.boxes&&B.vhRes.vk===v.key+'|'+vi?'':'disabled'}>Mark it on the vehicle</button>${dmg?'<button class="ghost" data-b2a="vhfix">Repaired: clear the track</button>':''}`;
    tail=`${r2?`Body${o.cap?' + Control Pool (up to the skill, '+o.cap+')':''}`:`Body${o.ar?' + half armor':''}${cp?' + Control Pool':''}`} against the Power left after armor; standard staging. Serious damage from one attack means a Crash Test (${r2?'R2 p. 51':'core p. 107'}).`;}
  return `<section class="b2pan"><div class="b2h"><h3>Vehicle tests</h3><span class="note">chases, crashes and damage, core p. 106–109${r2?', R2 p. 53':''}</span></div>
   <div class="b2ctl">${sel('vveh','Vehicle',V.map((g,j)=>[j,vehName(g)]),vi)}${sel('vsk','Skill',sk.length?sk.map((x,j)=>[j,x[0]+' '+x[1]]):[[0,'none']],ski)}
   ${sel('vtest','Test',[['pos','Position Test (each turn of a chase)'],['crash','Crash Test (Serious damage, no driver action, a ram)'],['hit','Got hit: vehicle damage']],kind)}${ctl}</div>
   <div class="b2rows">${track}${rows}</div>
   <div class="b2row">${btn}</div>
   ${kind==='hit'?resHTML(B.vhRes,tail):resHTML(B.vRes,tail)}${extra}</section>`;}
// a running tally for a chase: the other side's successes, the gap and who escapes (core p. 106-107)
function chaseHTML(o,sel,step,num){const C=B.chase||(B.chase={turn:1,log:[]}), L=B.vLast&&B.vLast.vk===o.v.key+'|'+o.vi?B.vLast:null, it=B.vint||'f', J=Math.max(0,B.vopp||0), jIn=B.vopp!=null;
  let say=[]; if(L){const k=L.k, mine=it==='x'?Math.floor(k/2)*L.cruise:k*L.cruise, oc=+B.vocs||0, theirs=oc?J*oc:null;
    say.push(it==='x'?`${k} attack${k===1?'':'s'} on them; you may open or close the gap by ${mine} m (core p. 106).`:`You move ${mine} m; each passenger gets ${Math.floor(k/2)} attack${Math.floor(k/2)===1?'':'s'}.`);
    if(jIn&&B.vdist!=null&&B.vdist!==''&&theirs!=null&&it!=='x'){const d=+B.vdist, nd=it==='f'?d+mine-theirs:d-mine+theirs;
      say.push(nd<=d&&it==='p'?`You close to ${Math.max(0,nd)} m; you may pick any distance from ${Math.max(0,nd)} to ${d} m (core p. 106).`:nd<d&&it==='f'?`They gain on you: ${Math.max(0,nd)} m apart (they pick between that and ${d} m).`:`The gap is ${Math.max(0,nd)} m.`); if(nd<1) say.push('Under 1 m: either driver can ram (core p. 107).');}
    const em=ESCM[o.ter];
    if(!jIn) say.push('Put in their successes to see the gap and who escapes.');
    else if(it==='f') say.push(k>J?`You beat their ${J}: they make an Escape Test against target number ${Math.max(2,k-J+em)} (net ${k-J}, terrain ${SIGN(em)}) with the best Intelligence among those who can see you. No successes and you’re away (core p. 107).`:`They matched or beat your ${k}: no escape this turn.`);
    else if(it==='p') say.push(J>k?`They beat your ${k}: you make an Escape Test against target number ${Math.max(2,J-k+em)} (net ${J-k}, terrain ${SIGN(em)}) or they get away.`:`You matched or beat their ${J}: they can’t get away this turn.`);}
  const esc=L&&jIn&&it==='p'&&J>L.k;
  return `<div class="b2sub"><h4>Chase tally <span class="note">turn ${C.turn}</span></h4>
   <div class="b2ctl">${sel('vint','You are',[['f','Fleeing'],['p','Pursuing'],['x','Fighting']],it)}${step('vopp','Their successes',jIn?J:'—')}${num('vocs','Their cruising speed (m)',B.vocs)}${num('vdist','Distance now (m)',B.vdist)}</div>
   ${L?`<ul class="b2tally">${say.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:'<p class="note">Roll the Position Test, then put in the other side’s successes.</p>'}
   ${esc?`<div class="b2row"><button class="ghost" data-b2a="vesc">Roll the Escape Test (Intelligence ${attrNow('int')})</button></div>`:''}${resHTML(B.vEsc)}
   ${C.log.length?`<details class="b2sub"><summary>Earlier turns (${C.log.length})</summary><ul class="b2tally">${C.log.map(x=>`<li>${E(x)}</li>`).join('')}</ul></details><div class="b2row"><button class="ghost" data-b2a="vchase">New chase: clear the tally</button></div>`:''}</div>`;}
// sustaining spells: +2 to every target number of the magician's own tests, per spell; at most Sorcery spells at once (core p. 128, 129)
const susN=()=>isMagician()?(S.sus||[]).length:0;
const susPen=()=>2*susN();
// "Why this number" (fix9): read-only breakdowns that open from a dotted number on the vitals line or a roll card's summary
// line, under the popover rules in the tools handbook. A row is [label, source and page, value, tone]: tone 'tn' colours +N
// amber and −N green (target numbers), 'bad' amber, 'h' a heading, 't' a total. Every total is the Builder's own number;
// an 'Other' row shows any gap, so a breakdown can never disagree with the line.
const WHYD=['ini','cp','mp','karma','body','react','magic','sus','atk','gh'];
const SHEETD=['wear'].concat(WHYD);
function gpg(k){const p=(GEARDB[k]||{}).pg||''; return /^p\./.test(p)?'core '+p:p;}
function powPg(t){const p=((typeof POWERS!=='undefined'&&POWERS[t])||(typeof XPOWERS!=='undefined'&&XPOWERS[t])||{}).pg||''; return /^p\./.test(p)?'core '+p:p;}
function whyRows(L){return L.map(([k,s,v,t])=>t==='h'?`<div class="b2r b2rh"><span>${E(k)}</span></div>`:`<div class="b2r${t==='t'?' tot':''}"><span>${E(k)}${s?` <small>${E(s)}</small>`:''}</span><b class="${t==='tn'?(/^\+[1-9]/.test(v)?'b2warn':/^−[1-9]/.test(v)?'b2ok':''):t==='bad'?'b2warn':''}">${E(String(v))}</b></div>`).join('');}
function whyBox(title,big,L,o){o=o||{}; return `<section class="b2pan b2why" aria-label="${E(title)}: how it adds up"><div class="b2h"><h3>${E(title)}</h3><b class="b2whyb">${E(big)}</b></div>${o.sub?`<p class="note b2whys">${E(o.sub)}</p>`:''}<div class="b2rows">${whyRows(L)}</div>${o.extra||''}${o.note?`<p class="note">${E(o.note)}</p>`:''}</section>`;}
function whyWired(){return S.gear.filter(g=>g.key==='body:Wired Reflexes').reduce((m,g)=>Math.max(m,+g.r||0),0);}
function whyReactRows(T){const qb=bioAug('quick'), q=attrEff('quick')+qb, ib=bioAug('int'), i=attrNow('int')+ib, base=Math.floor((q+i)/2), L=[];
  const qx=[boost('quick')?'improved +'+boost('quick'):'',qb?'bioware +'+qb:''].filter(Boolean).join(', ');
  L.push([`Quickness ${q}${qx?' ('+qx+')':''} + Intelligence ${i}${ib?' (cerebral booster +'+ib+')':''}`,'halved, rounded down · core p. 45',String(base)]);
  let sum=base; const add=(k,s,n)=>{if(n){L.push([k,s,SIGN(n)]); sum+=n;}};
  add('Lasting injury','core p. 113–114',-Math.max(0,Math.floor(+((S.inj||{}).rea)||0)));
  add('Asceticism ordeal','initiation',-ascLoss('rea'));
  add('Suprathyroid Gland',gpg('bio:Suprathyroid Gland'),has('bio:Suprathyroid Gland')?1:0);
  if(adeptOn()) add('Increased Reaction','adept power · '+powPg('incReaction'),S.powers.filter(p=>p.type==='incReaction').reduce((a,p)=>a+(+p.n||0),0));
  const wr=whyWired(), bo=gearLevel('body:Boosted Reflexes'), re=gearLevel('body:Reaction Enhancer');
  add('Wired Reflexes '+wr,gpg('body:Wired Reflexes'),2*wr); add('Boosted Reflexes '+bo,gpg('body:Boosted Reflexes'),[0,0,1,2][bo]||0); add('Reaction Enhancer '+re,gpg('body:Reaction Enhancer'),re);
  add('Enhanced Articulation',gpg('bio:Enhanced Articulation'),S.gear.some(g=>g.key==='bio:Enhanced Articulation')?1:0);
  if(sum!==T.reaction) L.push(['Other','',SIGN(T.reaction-sum)]);
  return L;}
function whyIniRows(T,w){const I=iniNow(T), L=[];
  if(I.m) L.push(['Matrix · core p. 178','','','h'],[I.m.l,'',`${I.m.r} + ${I.m.d}D6`]);
  else {L.push(['Reaction · core p. 45','','','h'],...whyReactRows(T),['Reaction','',String(T.reaction),'t'],['Dice · core p. 78','','','h'],['Base die','','1D6']);
    let d=1; const add=(k,s,n)=>{if(n){L.push([k,s,'+'+n+'D6']); d+=n;}};
    const wr=whyWired(), bo=gearLevel('body:Boosted Reflexes'), sa=gearLevel('bio:Synaptic Accelerator');
    add('Synaptic Accelerator '+sa,gpg('bio:Synaptic Accelerator'),sa); add('Boosted Reflexes '+bo,gpg('body:Boosted Reflexes'),[0,1,1,2][bo]||0); add('Wired Reflexes '+wr,gpg('body:Wired Reflexes'),wr);
    if(adeptOn()){const ir=S.powers.filter(p=>p.type==='incReflexes').reduce((a,p)=>a+(+p.level||1),0); add('Increased Reflexes '+ir,'adept power · '+powPg('incReflexes'),ir);}
    if(d!==T.dice) L.push(['Other','','+'+(T.dice-d)+'D6']);}
  if(w) L.push(['Wounds','come off the total · core p. 78, 112','−'+w,'bad']);
  L.push(['Initiative','',`${I.r}${w?' − '+w:''} + ${I.d}D6`,'t']); return L;}
function whyCp(T){const qA=augAttr('quick'), i=attrNow('int')+bioAug('int'), wl=attrNow('wil'), base=Math.floor((qA+i+wl)/2);
  const L=[['How it adds up · core p. 84','','','h'],[`Quickness ${qA} + Intelligence ${i} + Willpower ${wl}`,'halved, rounded down',String(base)]]; let sum=base;
  const cs=adeptOn()?S.powers.filter(p=>p.type==='combatSense').reduce((a,p)=>a+(+p.level||1),0):0; if(cs){L.push(['Combat Sense '+cs,'adept power · '+powPg('combatSense'),'+'+cs]); sum+=cs;}
  const pen=T.ar.poolPenalty; if(pen){L.push(['Armor too heavy for your Quickness','core p. 84'+(booksOn().fof?'; FoF p. 54':''),'−'+pen,'bad']); sum-=pen;}
  if(Math.max(0,sum)!==T.cpool) L.push(['Other','',SIGN(T.cpool-Math.max(0,sum))]);
  L.push(['Combat Pool','',String(T.cpool),'t']);
  return whyBox('Combat Pool',B.pool+'/'+T.cpool,L,{sub:'Refills at the start of each of your actions (core p. 78, 84).',note:'The − and + on the line spend and give back dice; nothing in here changes the pool.'});}
function whyKarma(T){const human=baseRace()==='Human', st=human||S.mode!=='standard'?1:2, add=+S.kPoolBonus||0, tk=tkGet();
  const why=human?'human · core p. 47':S.mode==='standard'?'metahuman · core p. 47':S.mode==='more'?'More Metahumans rule · core p. 47':'house rule: metahumans start at 1 · core p. 47';
  const L=[['How it adds up','','','h'],['Starting pool',why,String(st)]]; if(add) L.push(['Added in play','the number on the Runner tab · core p. 191','+'+add]);
  if(st+add!==T.kpool) L.push(['Other','',SIGN(T.kpool-st-add)]);
  L.push(['Karma Pool','',String(T.kpool),'t']); if(tk.tot) L.push(['Team Karma','shared with the team · core p. 191',tk.left+'/'+tk.tot]);
  return whyBox('Karma Pool',B.karma+'/'+T.kpool,L,{sub:'Refills at each new scene (core p. 191).',note:'Spend it in Spend Karma under Attack and Got hit; nothing in here spends it.'});}
function whyBody(){const n=attrNow('body'), rm=(R().mod||{}).body||0, inj=Math.max(0,Math.floor(+((S.inj||{}).body)||0))+ascLoss('body'), L=[['How it adds up','','','h']];
  L.push(['Natural Body',[rm?`${baseRace().toLowerCase()} ${SIGN(rm)} included · core p. 45`:'',inj?`lasting loss −${inj} included`:''].filter(Boolean).join('; '),String(n)]);
  let sum=n; const add=(k,s,v)=>{if(v){L.push([k,s,SIGN(v)]); sum+=v;}};
  add('Improved Physical Attribute (Body)','adept power · '+powPg('improvedAttr'),boost('body'));
  const ti=has('body:Bone Lacing, Titanium'), al=has('body:Bone Lacing, Aluminum'), pl=has('body:Bone Lacing, Plastic');
  if(ti||al||pl) add('Bone Lacing, '+(ti?'Titanium':al?'Aluminum':'Plastic'),gpg('body:Bone Lacing, Titanium'),ti?2:1);
  const ds=gearLevel('body:Dermal Sheath'); add('Dermal Sheath '+ds,gpg('body:Dermal Sheath'),ds?ds+1:0);
  add('Suprathyroid Gland',gpg('bio:Suprathyroid Gland'),has('bio:Suprathyroid Gland')?1:0);
  const dp=gearLevel('body:Dermal Plating'); add('Dermal Plating '+dp,gpg('body:Dermal Plating'),dp);
  const ab=augAttr('body'); if(sum!==ab) L.push([typeof cbOn==='function'&&cbOn()?'Cyberlimbs':'Other','',SIGN(ab-sum)]);
  L.push(['Body','',String(ab),'t']);
  if(hasDerm()) L.push(['When you resist damage','','','h'],['Troll dermal armor','core p. 45','+1'],['Body to resist','',String(ab+1),'t']);
  return whyBox('Body',String(ab),L,{sub:'What you roll to resist damage, before Combat Pool.'});}
function whyReact(T){return whyBox('Reaction',String(T.reaction),[['How it adds up · core p. 45','','','h'],...whyReactRows(T),['Reaction','',String(T.reaction),'t']],{sub:'Also the base of your Initiative.'});}
function whyMagic(){const ess=6-essenceUsed(), f=x=>String(+x.toFixed(2)), L=[['Essence','','','h'],['Starting Essence','','6']];
  const im=S.gear.filter(g=>(+g.ess||0)>0&&GEARDB[g.key]).map(g=>[GEARDB[g.key].n+(g.r?' '+g.r:''),gpg(g.key),(+g.ess||0)*(+g.qty||1)]);
  im.slice(0,8).forEach(x=>L.push([x[0],x[1],'−'+f(x[2])])); if(im.length>8) L.push([`${im.length-8} more`,'','−'+f(im.slice(8).reduce((a,x)=>a+x[2],0))]);
  const sum=6-im.reduce((a,x)=>a+x[2],0); if(Math.abs(sum-ess)>0.001) L.push(['Other','returned Essence or bioware Body Index',(ess>sum?'+':'−')+f(Math.abs(ess-sum))]);
  L.push(['Essence','',f(ess),'t'],['Magic · core p. 45','','','h'],['Essence, rounded down','',String(Math.max(0,Math.floor(ess)))]);
  let m=Math.max(0,Math.floor(ess)); const g=Math.max(0,initGrade()); if(g){L.push(['Initiate grade '+g,'','+'+g]); m+=g;}
  const lo=injLoss('magic'); if(lo){L.push(['Magic lost','core p. 115','−'+lo,'bad']); m-=lo;}
  if(Math.max(0,m)!==magicNow()) L.push(['Other','',SIGN(magicNow()-Math.max(0,m))]);
  L.push(['Magic','',String(magicNow()),'t']); return whyBox('Magic',String(magicNow()),L,{sub:'Essence '+f(ess)});}
function whyMp(mpMax){const so=bestRating(/^sorcery/i), L=[['How it adds up · core p. 85','','','h'],['Sorcery','',String(so)]]; let sum=so;
  S.gear.filter(g=>g.key==='magic:Power Focus'&&focusBonded(g)).forEach(g=>{const r=+g.r||0; if(r){L.push(['Power focus, Force '+r,'bonded · '+gpg('magic:Power Focus'),'+'+r]); sum+=r;}});
  if(sum!==mpMax) L.push(['Other','',SIGN(mpMax-sum)]); L.push(['Magic Pool','',String(mpMax),'t']);
  return whyBox('Magic Pool',B.mpool+'/'+mpMax,L,{sub:'For spellcasting and spell defense.'});}
function whySus(){const L=[['Spells held · core p. 128','','','h']].concat((S.sus||[]).map(x=>[x.n,'Force '+x.f+(x.on?' · on '+x.on:''),'+2','bad'])); L.push(['To every target number','',SIGN(susPen()),'t']);
  return whyBox('Sustaining',SIGN(susPen()),L,{note:'Drop a spell with Drop it in the Sustaining panel under Magic; nothing in here changes what you hold.'});}
// dice rows from a roll's source line ("Firearms 4 + 2 Combat Pool + 1 Karma"); pool = [name, max] adds a +0 row when none is spent
function whyDiceRows(src,dice,pool){const P=String(src||'').split(' + '), L=[['Dice','','','h']];
  P.forEach((p,j)=>{let m; if(j>0&&(m=p.match(/^(\d+) (.+)$/))) L.push([m[2],'','+'+m[1]]); else if((m=p.match(/^(.*\S) (\d+)$/))) L.push([m[1],'',j?'+'+m[2]:m[2]]); else if((m=p.match(/^(.*)\((\d+)\)$/))) L.push([m[1].trim(),'','+'+m[2]]); else L.push([p,'','']);});
  if(pool&&pool[1]>0&&!P.some(p=>p.indexOf(pool[0])>=0)) L.push([pool[0],'up to '+pool[1]+' on this roll · core p. 84','+0']);
  L.push(['Dice','',String(dice),'t']); return L;}
// a roll card's summary line, as the dotted trigger, with its breakdown beside it
function whyCard(d,line,box){return `<div class="b2whyw"><button type="button" class="b2rc-mods b2whyt b2whym" data-b2a="drop" data-d="${d}" aria-expanded="${B.drop===d}" aria-controls="b2vp-${d}">${E(line)}</button><div class="b2vp b2whyc b2whysh" id="b2vp-${d}" data-p="${d}"${B.drop===d?'':' hidden'}><button type="button" class="ghost b2vx" data-b2a="drop" data-d="${d}">Close</button>${box}</div></div>`;}
function susHTML(){const L=S.sus||[], max=bestRating(/^sorcery/i), names=S.powers.filter(p=>p&&p.name&&spellDur(p.name)==='S').map(p=>[p.name,+p.cost||1]);
  return `<section class="b2pan"><div class="b2h"><h3>Sustaining</h3><span class="${L.length?'b2warn':'note'}">${L.length?'+'+2*L.length+' to every target number':'nothing sustained'}</span></div>
   <p class="note">Each spell you keep going adds +2 to all your other tests, Drain and damage resistance included, until you drop it (a Free Action, core p. 81, 128). You can hold up to your Sorcery skill (${max}) at once.</p>
   ${L.map((x,i)=>`<div class="b2r"><span><b>${E(x.n)}</b> <small>Force ${x.f}${x.on?' · on '+E(x.on):''}</small></span><button class="ghost" data-b2sus="${i}">Drop it</button></div>`).join('')}
   ${names.length?`<div class="b2ctl"><label class="b2f"><span class="b2k">Spell you’re sustaining</span><select data-b2="susp">${names.map(([n,f])=>`<option value="${E(n)}" ${B.susp===n?'selected':''}>${E(n)} (Force ${f})</option>`).join('')}</select></label><label class="b2f"><span class="b2k">On whom</span><input data-b2in="suson" value="${E(B.suson||'')}" placeholder="Yourself, or who"></label><div class="b2f"><span class="b2k">&nbsp;</span><button data-b2a="susadd" ${L.length>=max?'disabled':''}>Sustain it</button></div></div>`:'<p class="note">No Sustained spells on the sheet: Instant and Permanent spells can’t be sustained (core p. 128).</p>'}
   ${L.some(x=>x.on&&x.on.trim()&&!/^(me|myself|yourself|self)$/i.test(x.on.trim()))?'<p class="note">Spells on other runners change their numbers too (an Increase Reflexes die, Armor points): they track that on their own sheet.</p>':''}
   ${L.length>=max&&max?'<p class="note b2warn">That’s your limit: drop one before sustaining another.</p>':''}</section>`;}
function rollN(n,tn){const r=[],parts=[];for(let i=0;i<n;i++) r.push(d6x(tn,parts)); r.parts=parts; return r;}
// ---- one roll card for every test (Phase 2 of the redesign) ----
// dieTiles: successes solid, misses outlined, pool dice dashed; a die that rolled again (Rule of Six) gets a ring and its sum, e.g. 6+5
function dieTiles(R){if(!R||!R.r) return ''; const P=R.parts||R.r.parts||[], pool=R.pool||0;
  return R.r.map((v,j)=>{const ex=P[j]&&P[j].length>1?P[j].join('+'):''; return `<span class="b2dw"><span class="b2die${v>=R.tn?' hit':''}${j>=R.r.length-pool?' pool':''}${ex?' ex':''}">${v}</span>${ex?`<small>${ex}</small>`:''}</span>`;}).join('');}
// RR: a result to show, from the dice and the target number; o = {head, mods, tail, pool}
function RR(r,tn,o){return Object.assign({r:r.slice(),parts:r.parts||[],tn,k:r.filter(x=>x>=tn).length,one:!!r.length&&r.every(x=>x===1)},o||{});}
function resHTML(x,fb){if(!x) return fb?`<p class="note">${E(fb)}</p>`:''; if(typeof x==='string') return `<p class="note">${E(x)}</p>`; if(Array.isArray(x)) return x.map(y=>resHTML(y)).join('');
  const big=x.one?'All ones: Rule of One':`${x.k} success${x.k===1?'':'es'}`;
  return `<div class="b2rc" aria-live="polite"><div class="b2rc-h"><b class="b2rc-big${x.one?' b2warn':''}">${big}</b>${x.head?`<span class="b2rc-for">${E(x.head)}</span>`:''}</div><div class="b2dice">${dieTiles(x)}</div>${x.mods?`<div class="b2rc-mods">${E(x.mods)}</div>`:''}${x.tail?`<p class="b2rc-t">${E(x.tail)}</p>`:''}</div>`;}
const wsMods=(w,sp)=>(w?', wounds +'+w:'')+(sp?', sustaining +'+sp:'');
function copyOut(text,msg,at){let ok=false; try{if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>{},()=>{}); ok=true;}}catch(e){}
  B.copy={text,at:at||'atk',msg:ok?msg+(at==='hit'?': copied. Paste it into your table’s chat, or read it out.':': copied. Paste it into the Roll20 chat.'):msg+': select this and copy it.'};}
function who(){return S.handle||S.name||'Runner';}
function act(a){const C=B._cur, W=C&&C.W; B.warn='';
  if(a==='anyway'){B.anyway=true; return redraw();}
  if(a==='ini'){const T=sheetStats(), I=iniNow(T); B.ini=I.r+Array.from({length:I.d},d6p).reduce((x,y)=>x+y,0);}
  else if(a==='cini'){const T=sheetStats(), I=iniNow(T); copyOut(`&{template:default} {{name=${who()}: ${I.m?'Matrix ':''}Initiative}} {{Initiative=[[${I.r-T.wmod.m}+${I.d}d6]]}}`,'Initiative','ini');}
  else if(a==='roll'||a==='copy'){
    if(W.kind==='gun'&&W.gid){const at=(S.ammoT||{})[W.gid]; if(at){if(at.in.n<C.rounds){B.warn='Not enough rounds loaded: load or change the clip first.'; return redraw();} ammoAct(W.gid,'fire',C.rounds);}}
    if(W.kind==='gun'||W.kind==='drone') B.fired+=C.rounds;
    if(W.kind==='spell'||W.kind==='cast') B.mpool-=C.spend; else if(W.kind==='matrix'||W.kind==='util'||W.kind==='vsys') B.hpool-=C.spend; else B.pool-=C.spend; B.spend=0;
    const kd=kdTake(B,C.kd||0); if(a==='roll'){B.roll={r:rollN(C.dice,C.tn),tn:C.tn,pool:C.spend,kc:0,ks:0,kd}; B.copy=null;
      if(W.kind==='vsys'){const df=Math.max(2,B._df||2), hr=rollN(B.vsv||4,df); B.roll.host={r:hr,k:hr.filter(x=>x>=df).length,df:B._df||2};}
      if(W.kind==='util'){const ev=B._ev||0, nr=rollN(B.tnBase,Math.max(2,ev)); B.roll.node={r:nr,k:nr.filter(x=>x>=Math.max(2,ev)).length,ev,sec:Math.min(4,B.sec||0)};}
      if(W.kind==='spirit'){const x=(S.spirits||[])[+W.id.slice(1)]; if(x){x.sv=Math.max(0,(+x.sv||0)-1); if(!x.sv) B.warn=null; B.spNote=x.sv?`${x.sv} service${x.sv>1?'s':''} left.`:'That was its last service: it leaves (core p. 140).'; if(!x.sv) S.spirits.splice(+W.id.slice(1),1); render(); return;}}}
    else {const why=C.rows.map(r=>r[0].toLowerCase()+' '+r[2]).join(', '); let t=`&{template:default} {{name=${who()}: ${W.n}}} {{Dice=${C.dice} (${C.dSrc})}} {{Target number=${C.tn} (${why})}} {{Successes=${r20(C.dice,C.tn)}}} {{Damage=${C.dmg}}}`;
      if((W.kind==='util'||(W.kind==='matrix'&&!W.v2))&&B.sec){const sc=Math.min(4,B.sec); t+=` {{Security Code=${SECN[sc]}: needs ${sc} more success${sc>1?'es':''} than ${W.kind==='util'?'the node rolls':'the target rolls'} (core p. ${W.kind==='util'?174:179})}}`;} else if(W.kind==='util') t+=` {{Needs=more successes than the node rolls (core p. 174)}}`;
      if(W.kind==='vsys') t+=` {{Host=${r20(B.vsv||4,Math.max(2,B._df||2))} vs Detection Factor ${B._df||2}: more successes than the host wins; host successes go on the security tally (VR2 p. 19)}}`;
      if(W.kind==='gun'&&W.gid){const at=S.ammoT[W.gid]; t+=` {{Rounds=${C.rounds} fired, ${at.in.n} left}}`;}
      if(W.kind==='spell'){const dt=Math.max(2,Math.floor(C.spellF/2)+(W.sp.m||0))+susPen(); t+=` {{Drain=${r20(attrNow('wil')+B.mpool,dt)} vs ${drainText(W.sp,C.spellF)}${C.spellF>magicNow()?' Physical':' Stun'}}}`;}
      copyOut(t,'Attack'); B.roll=null;}
    if(W.kind==='gun'&&W.gid){render(); return;}}
  else if(a==='kfrom:own'||a==='kfrom:team'){B.kfrom=a.slice(6);}
  else if(a.startsWith('ktuck:')){const c=a.slice(6); B.kOpen=B.kOpen===c?null:c;}
  else if(a==='tkopen'){B.tkOpen=!B.tkOpen;}
  else if(/^(atk|gh):(re|buy|oops)$/.test(a)){const [c,op]=a.split(':'), R=c==='gh'?B.gh.roll:B.roll; if(R&&!R.oops){
    if(op==='re'){const n=(R.kc||0)+1, P=R.parts||R.r.parts; if(R.r.some(x=>x<R.tn)&&kPay(n)){R.kc=n; R.r.forEach((v,j)=>{if(v<R.tn){const t=[]; R.r[j]=d6x(R.tn,t); if(P) P[j]=t[0];}});}}
    else if(op==='buy'){if(R.r.some(x=>x>=R.tn)&&kPay(1)){R.ks=(R.ks||0)+1; if(B.kfrom==='team'){const tk=tkGet(); tk.tot=Math.max(0,tk.tot-1); sv();} else B.af.kbuy=(B.af.kbuy||0)+1;}}
    else if(op==='oops'){if(R.r.length&&R.r.every(x=>x===1)&&kPay(1)) R.oops=true;}}}
  else if(a==='vref'){const o=vehCalc(); const L=B.vLast; if(o&&o.kind==='pos'&&L){const C=B.chase||(B.chase={turn:1,log:[]}); const it=B.vint||'f', J=Math.max(0,B.vopp||0), mine=it==='x'?Math.floor(L.k/2)*L.cruise:L.k*L.cruise, oc=+B.vocs||0;
      if(B.vopp!=null&&B.vdist!=null&&B.vdist!==''&&oc&&it!=='x'){const d=+B.vdist; B.vdist=Math.max(0,it==='f'?d+mine-J*oc:d-mine+J*oc);}
      C.log.push(`Turn ${C.turn}: ${({f:'fleeing',p:'pursuing',x:'fighting'})[it]}, you ${L.k} vs them ${B.vopp==null?'?':J}${B.vdist!=null&&B.vdist!==''?`, ${B.vdist} m apart`:''}${B.vEsc?' · Escape Test '+B.vEsc.k+' successes':''}`); C.turn++;}
    B.cpool=B.cpMax; B.vRes=''; B.vLast=null; B.vEsc=null; B.vopp=null; return redraw();}
  else if(a==='vchase'){B.chase={turn:1,log:[]}; B.vLast=null; B.vEsc=null; B.vopp=null; B.vdist=''; return redraw();}
  else if(a==='vesc'){const o=vehCalc(), L=B.vLast; if(!o||!L) return; const J=Math.max(0,B.vopp||0), em=ESCM[o.ter], tn=Math.max(2,J-L.k+em), r=rollN(attrNow('int'),tn), k=r.filter(x=>x>=tn).length;
    B.vEsc=RR(r,tn,{head:'Escape Test',mods:`TN ${tn}: net ${J-L.k}, terrain ${SIGN(em)} · Intelligence ${attrNow('int')}`,tail:k?'You keep them in sight.':'No successes: they got away (core p. 107).'});}
  else if(a==='vroll'){const o=vehCalc(); if(!o||o.kind==='hit') return; B.cpool=(B.cpool||0)-o.sp; B.vsp=0;
    const r=rollN(o.dice,o.tn), k=r.filter(x=>x>=o.tn).length; const imp=o.cruise>200?'D':o.cruise>60?'S':o.cruise>20?'M':'L';
    const vm=`TN ${o.tn}: Handling ${o.hand}, terrain ${o.tm>=0?'+'+o.tm:'−'+(-o.tm)}${o.vdm?', vehicle damage +'+o.vdm:''}${wsMods(woundMods().m,susPen())} · ${o.skill[0]||'defaulting (GM)'} ${o.skill[1]}${o.sp?' + Control Pool '+o.sp:''}`;
    if(o.kind==='pos'){B.vLast={k,cruise:o.cruise,vk:o.v.key+'|'+o.vi}; B.vEsc=null;}
    B.vRes=RR(r,o.tn,{head:o.kind==='pos'?'Position Test':'Crash Test',mods:vm,pool:o.sp,tail:o.kind==='pos'?`${k*o.cruise} m, ${Math.floor(k/2)} attack${Math.floor(k/2)===1?'':'s'} per passenger. Put their successes in the chase tally below.`:(k?'No crash.':`Crash: ${Math.floor(o.cruise/10)}${imp} to the vehicle (Body + half armor resists, no Control Pool; passengers take what gets through, Impact armor only, core p. 107).`)});}
  else if(a==='vhit'){const o=vehCalc(); if(!o||o.kind!=='hit'||o.noPen||!o.lvl||!o.H.att) return; B.cpool=(B.cpool||0)-o.sp; B.vsp=0; const H=o.H;
    const r=rollN(o.dice,o.tn), k=r.filter(x=>x>=o.tn).length; let fin=null, txt;
    if(o.r2&&o.bd===0){fin='D'; txt='Body 0: destroyed (R2 p. 53).';}
    else {const d=k-H.att, idx=L4.indexOf(o.lvl)+(d<0?Math.floor(-d/2):-Math.floor(d/2)); fin=idx<0?null:L4[Math.min(3,idx)];
      txt=fin?`${k} success${k===1?'':'es'} vs the attacker’s ${H.att}: the vehicle takes ${fin==='D'?'Deadly (destroyed)':fin} (${BOXES[fin]} box${BOXES[fin]>1?'es':''}).${fin==='S'||fin==='D'?` Serious or worse from one attack: make a Crash Test (${o.r2?'R2 p. 51':'core p. 107'}).`:''}`:(o.r2&&o.sp>H.att?`No damage, and the ${o.sp} Control Pool dice used are more than the attacker’s ${H.att} successes: a complete miss (R2 p. 53).`:`${k} success${k===1?'':'es'} vs the attacker’s ${H.att}: no damage.`);}
    B.vhRes=Object.assign(RR(r,o.tn,{head:'Vehicle Damage Resistance Test',mods:`TN ${o.tn} · ${o.dice-o.sp} dice${o.sp?' + Control Pool '+o.sp:''} (${o.pg})`,pool:o.sp,tail:txt}),{boxes:fin?BOXES[fin]:0,fin,vk:o.v.key+'|'+o.vi});}
  else if(a==='vhmark'){const o=vehCalc(), R=B.vhRes; if(!o||!R||!R.boxes||R.vk!==o.v.key+'|'+o.vi) return; o.v.vdmg=Math.min(10,(+o.v.vdmg||0)+R.boxes); B.vhRes=null; if(o.v.vdmg>=10) B.vRes='The vehicle is destroyed: an automatic crash (core p. 107).'; render(); return;}
  else if(a==='vhfix'){const o=vehCalc(); if(o){delete o.v.vdmg; B.vhRes=null; render(); return;}}
  else if(a==='dfroll'){const have=swHave(); const L=SKILLWEB.SKILLS.filter(n=>!have[n]); const tgt=L.includes(B.dft)?B.dft:L[0]; const o=tgt?swOptions(tgt,B.sk.tn)[0]:null; if(o){const tn=B.sk.tn+o.tn+woundMods().m+susPen(), r=rollN(o.dice,tn), k=r.filter(x=>x>=tn).length; B.sk.res=RR(r,tn,{head:`${swLabel(tgt)} by defaulting to ${o.from}`,mods:`TN ${tn}: base ${B.sk.tn}, route +${o.tn}${wsMods(woundMods().m,susPen())} · ${o.dice} dice`});}}
  else if(a==='ctroll'){const C=(S.contacts||[]).filter(c=>c&&c.name)[+B.ctc||0]; const parts=partsNamed('Etiquette'); const best=parts.reduce((m,p)=>p.r>m.r?p:m,{r:0,label:'Etiquette'}); let dice=best.r, how=best.label+(best.chip?' chip':'')+' '+best.r; if(!dice){const o=typeof swOptions==='function'?swOptions('Etiquette',B.sk.tn)[0]:null; if(o){dice=o.dice; how='defaulting to '+o.from;} else {dice=attrNow('cha'); how='Charisma';}}
    const tn=B.sk.tn+woundMods().m+susPen(), r=rollN(dice,tn), k=r.filter(x=>x>=tn).length; const st=ctStats(C), et=ctEtq(st,C||{}); B.sk.res=RR(r,tn,{head:`Asking ${C?C.name:'a contact'} (${how})`,mods:`TN ${tn}: base ${B.sk.tn}${wsMods(woundMods().m,susPen())} · ${dice} dice`,tail:`${k&&st&&et&&et.r?`Baseline fee: ${et.r} × ${k} × (${st.cha} + ${st.int}) × 10 = ${(et.r*k*(st.cha+st.int)*10).toLocaleString()}¥, before Negotiation (core p. 202). `:''}The GM decides what they know and what it costs.`});}
  else if(a==='ctchk'){const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)], st=ctStats(C), et=ctEtq(st,C||{}); if(!st) return; const tn=B.sk.tn+2+(et.def?4:0), r=rollN(et.r,tn), k=r.filter(x=>x>=tn).length, h=d6p()+d6p();
    B.sk.res=`${C.name} checks around (${et.l} ${et.r}): ${r.join(' ')||'no dice'} → ${k} success${k===1?'':'es'} vs TN ${tn} (your TN ${B.sk.tn} + 2${et.def?' + 4 for defaulting':''}). ${k?`They get word back in ${h} hours (2D6), or when the GM says.`:'Nothing turns up this time.'} The cost is worked out as if they’d known it already (core p. 202).`;}
  else if(a==='kref'){B.karma=sheetStats().kpool;}
  else if(a==='mload'){const g=S.gear[W.gi]; const dk=g&&typeof deckInfo==='function'?deckInfo():null, sz=g&&GEARDB[g.key]&&GEARDB[g.key].sz?GEARDB[g.key].sz(+g.r||1):0; if(dk&&sz>dk.am){B.warn=`${GEARDB[g.key].n} ${+g.r||1} is ${sz} Mp and the deck has ${dk.am} Mp of active memory in all: it can never be loaded (${dk.vr2?'VR2 p. 85':'core p. 172'}).`; return redraw();} if(g){const was=S.gear.map(x=>!!x.loaded); g.loaded=true; render(); const bumped=S.gear.some((x,j)=>x!==g&&was[j]&&!x.loaded);
    if(!g.loaded||bumped){S.gear.forEach((x,j)=>{x.loaded=was[j]||undefined;}); g.loaded=false; render(); B.warn='Not enough free active memory to load it: unload another program in the deck’s program list first (core p. 173).'; redraw();} return;}}
  else if(a==='conjure'){const F=B.spf||3, sk=bestRating(/^conjuring/i), w=woundMods().m, tn=F+w+susPen(), r=rollN(sk,tn), k=r.filter(x=>x>=tn).length, cha=attrNow('cha');
    const lv0=F>2*cha?'D':F>cha?'S':F*2<cha?'L':'M', phys=F>cha, dr=rollN(cha,F), dk=dr.filter(x=>x>=F).length, di=L4.indexOf(lv0)-Math.floor(dk/2), dl=di<0?null:L4[di];
    const t=B.spt||(S.magic==='hermetic'?'earth':'nature'); const d=new Date(); const on=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(k) S.spirits=(S.spirits||[]).concat([{t,f:F,sv:k,on}]); B.drainHit=dl?{n:BOXES[dl],phys,what:'conjuring Drain'}:null;
    B.conjRes=[RR(r,tn,{head:`Conjuring a ${SPIRITS[t].n.toLowerCase()}, Force ${F}`,mods:`TN ${tn}: Force ${F}${wsMods(w,susPen())} · Conjuring ${sk} dice`,tail:k?`It comes, owing ${k} service${k>1?'s':''}.`:'No spirit comes.'}),
      RR(dr,F,{head:`Drain: ${lv0} ${phys?'Physical':'Stun'}`,mods:`TN ${F} (the Force) · Charisma ${cha} dice`,tail:(dl?`Take ${dl} ${phys?'Physical':'Stun'}: Mark the Drain below.`:'No Drain.')+(dl==='D'?' Drain that knocks you out frees the spirit (core p. 139–140).':'')})];
    render(); return;}
  else if(a==='newact'||a==='newturn'||a==='newscene'){const T=sheetStats(); B.pool=T.cpool; B.mpool=B.mpMax; B.hpool=B.hpMax; B.roll=null; B.fired=0; B.kvote=false; // pools refresh each action (core p. 78, 84)
    if(a!=='newact') B.ini=null; if(a==='newscene'){B.karma=T.kpool; const tk=tkGet(); tk.left=tk.tot; sv();}} // Karma Pool and Team Karma refill each scene (core p. 191)
  else if(a==='newphase'){B.fired=0;}
  else if(a==='clear'){const sg=B.sit.sight, rc=B.msit.reach; B.sit=sg?{sight:sg}:{}; B.msit=rc?{reach:rc}:{}; B.gm=0;B.aim=0;B.urb=null;B.los=null;B.mount=null;}
  else if(a==='sit'){B.sitOpen=!B.sitOpen;} else if(a==='sitdone'){B.sitOpen=false;}
  else if(a==='vit'){B.vitOpen=!B.vitOpen; B.drop=null;}
  else if(a==='hitcopy'){const t=B._hc; if(!t) return; let ok=false; try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>{},()=>{}); ok=true;}}catch(e){} B.hitCopied={t,ok};}
  else if(a==='hitpaste'){const inp=document.querySelector('#b2night [data-b2in="hitpaste"]'); B.hitTxt=inp?inp.value:(B.hitTxt||''); if(!B.hitTxt.trim()&&navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(x=>{B.hitTxt=String(x||''); hitApply();},()=>{B.hitMsg={t:'Paste the line into the box first: this browser didn’t share the clipboard.',bad:1}; redraw();}); return;} return hitApply();}
  else if(a==='jumpcond'){B.vitOpen=false; B.drop='cond';}
  else if(a==='load'||a==='swap'){if(W.gid){if(a==='load'&&B.amSel) S.ammoT[W.gid].sel=B.amSel; ammoAct(W.gid,a); render(); return;}}
  else if(a==='drain'){const sp=W.sp, F=C.spellF, dt=Math.max(2,Math.floor(F/2)+(sp.m||0))+susPen(), n=attrNow('wil')+B.mpool, r=rollN(n,dt), k=r.filter(x=>x>=dt).length; const lv0=sp.lv==='W'?(W.kind==='cast'&&B._heal?B._heal.wl:null):sp.lv==='X'?null:sp.lv;
    const dm=`TN ${dt}: half the Force (${F})${sp.m?(sp.m>0?' +':' −')+Math.abs(sp.m):''}${susPen()?', sustaining +'+susPen():''} · Willpower ${attrNow('wil')} + Magic Pool ${B.mpool}`;
    B.drainHit=null; if(!lv0) B.drainRes=RR(r,dt,{head:'Drain',mods:dm,tail:'The Drain level depends on the target (core p. 129).'}); else {const idx=L4.indexOf(lv0)-Math.floor(k/2); if(idx>=0) B.drainHit={n:BOXES[L4[idx]],phys:F>magicNow(),what:'Drain'}; B.drainRes=RR(r,dt,{head:'Drain',mods:dm,tail:idx<0?'No Drain.':`${L4[idx]} ${F>magicNow()?'Physical':'Stun'} Drain. Mark it below.`});}}
  else if(a==='drmark'){const h=B.drainHit; if(h){if(h.phys) S.phys=Math.min(10+natBody()+1,S.phys+h.n); else {const tot=S.stun+h.n; S.stun=Math.min(10,tot); if(tot>10) S.phys=Math.min(10+natBody()+1,S.phys+(tot-10));} B.drainHit=null; render(); return;}}
  else if(a==='ghroll'){const g=B._gh, k=B.gh.kind; const kd=kdTake(B.gh,g.kd||0); B.gh.roll={r:rollN(g.gBase+kd+g.gSp,g.gTn),pool:g.gSp,tn:g.gTn,lvl:g.gLv,v2:k==='icp'&&!!B._ghv2,stun:k==='gel'||(!!B.gh.stun&&k!=='icp'),kind:k,kc:0,ks:0,kd}; if(k==='icp') B.hpool=Math.max(0,(B.hpool||0)-g.gSp); else if(k==='mana'||k==='phys') B.mpool=Math.max(0,B.mpool-g.gSp); else B.pool-=g.gSp; B.gh.spend=0;}
  else if(a==='ghcopy'){const g=B._gh; B.pool-=g.gSp; copyOut(`&{template:default} {{name=${who()} resists ${B.gh.pow}${B.gh.lvl}, ${HITS[B.gh.kind].toLowerCase()}}} {{Target number=${g.gTn}${g.spellHit?' (the Force)':' (Power '+g.gPow+' − armor '+g.armV+')'}}} {{Resist dice=${r20(g.gBase,g.gTn)}}}`+(g.gSp?` {{Combat Pool=${r20(g.gSp,g.gTn)}}}`:'')+` {{If successes tie=${g.gLv}${B.gh.kind==='gel'?' Stun':''}; every 2 more than the attacker drops a level}}`,'Damage resistance','gh'); B.gh.spend=0;}
  else if(a==='armfresh'){S.gear.forEach(g=>{if(g.key==='prog2:Armor') delete g.deg;}); render(); return;}
  else if(a==='ghmark'){const R=B.gh.roll; const n=R?(R.boxes!=null&&R.boxes!==undefined&&(R.mx||R.kind==='black')?R.boxes:R.final?BOXES[R.final]:0):0;
    if(R&&n){if(R.mx){S.mxDmg=Math.min(10,(S.mxDmg||0)+n); if(R.v2){const a=v2Utils().filter(u=>u.n==='Armor'&&u.loaded&&u.r-u.deg>0).sort((x,y)=>(y.r-y.deg)-(x.r-x.deg))[0]; if(a){const g=S.gear[a.i]; g.deg=(+g.deg||0)+1;}}} else if(R.stun){const tot=S.stun+n; S.stun=Math.min(10,tot); if(tot>10) S.phys=Math.min(10+natBody()+1,S.phys+(tot-10)); /* Stun past 10 carries into Physical, core p. 111 */} else S.phys=Math.min(10+natBody()+1,S.phys+n); B.gh.roll=null; render(); return;}}
  redraw();}
function stepper(id,d){
  if(id==='aim'){const W=B._cur.W; B.aim=Math.max(0,Math.min(Math.floor((W.skill||0)/2),(B.aim||0)+d));}
  else if(id==='sec'){B.sec=Math.max(0,Math.min(4,(B.sec||0)+d));}
  else if(id==='spf'){B.spf=Math.max(1,(B.spf||3)+d);} else if(id==='spsv'){B.spsv=Math.max(0,(B.spsv==null?1:B.spsv)+d);}
  else if(id==='gm') B.gm+=d; else if(id==='spend') B.spend=Math.max(0,B.spend+d); else if(id==='force') B.force=Math.max(1,(B.force||1)+d);
  else if(id==='tnb') B.tnBase=Math.max(2,B.tnBase+d); else if(id==='mxm') B.mxm=(B.mxm||0)+d; else if(id==='vsv') B.vsv=Math.max(1,(B.vsv||4)+d); else if(id==='dfd') B.dfd=Math.max(1,(B.dfd||4)+d);
  else if(id==='gh:pow'){B.gh.pow=Math.max(1,B.gh.pow+d);B.gh.roll=null;} else if(id==='gh:att') B.gh.att=Math.max(0,B.gh.att+d); else if(id==='gh:spend') B.gh.spend=Math.max(0,B.gh.spend+d);
  else if(id==='sk:tn') B.sk.tn=Math.max(2,B.sk.tn+d);
  else if(id==='vsp'){B.vsp=Math.max(0,Math.min(B.cpool||0,(B.vsp||0)+d));}
  else if(id==='vopp') B.vopp=Math.max(0,(B.vopp||0)+d);
  else if(id==='vhp'||id==='vha'){const H=B.vh||(B.vh={pow:6,lvl:'M',att:1,av:false}); if(id==='vhp') H.pow=Math.max(1,H.pow+d); else H.att=Math.max(0,H.att+d); B.vhRes=null;}
  else if(id==='vhB'||id==='vhA'){B[id]=Math.max(0,(B[id]||0)+d); B.vhRes=null;}
  else if(id==='atk:kd'||id==='gh:kd'){const c=id.slice(0,-3), st=c==='gh'?B.gh:B, mx=(B._kdMax||{})[c]||0; st.kdSrc=st.kdSrc||[];
    if(d>0){if(st.kdSrc.length<mx&&kPay(1)) st.kdSrc.push(B.kfrom==='team'?'team':'own');} else if(st.kdSrc.length){const x=st.kdSrc.pop(); if(x==='team'){tkGet().left++; sv();} else B.karma++;}}
  else if(id==='tkleft'||id==='tktot'){const tk=tkGet(); if(id==='tktot'){tk.tot=Math.max(0,tk.tot+d); tk.left=Math.min(tk.left,tk.tot); if(d>0&&tk.left===tk.tot-1) tk.left=tk.tot;} else tk.left=Math.max(0,Math.min(tk.tot,tk.left+d)); sv();}
  else if(id==='vpool'){const T=sheetStats(); B.pool=Math.max(0,Math.min(T.cpool,B.pool+d));}
  else if(id==='fan'){B.faN=Math.max(3,Math.min(10,(+B.mode.slice(1)||B.faN||3)+d)); B.mode='f'+B.faN;}
  else if(id.startsWith('af:')){const k=id.slice(3), stepv={nin:1000,nout:1000}[k]||1; if(k.startsWith('u:')){const u=k.slice(2); B.af.use[u]=Math.max(0,(B.af.use[u]||0)+d);} else B.af[k]=Math.max(0,(B.af[k]==null?(k==='phys'?S.phys:k==='stun'?S.stun:0):B.af[k])+d*stepv); B.af.saved=''; return redrawAfter();}
  redraw();}
// ---------- After the session ----------
function snaps(){try{return JSON.parse(localStorage.getItem('sr2-b2-snaps-'+(S.id||'x'))||'[]');}catch(e){return [];}}
function consumables(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>GEARDB[g.key]&&(g.cat==='med'||g.cat==='boom'||(/^ammo:.*(Ammo|Rounds)/.test(g.key))));}
function afterHTML(){const a=B.af, ny=S.nuyenNow===''||S.nuyenNow==null?0:+S.nuyenNow, ka=karmaAvail(), T=sheetStats();
  const dead=S.phys>10+natBody(), held=dead&&!a.lives; const ph=held||a.phys==null?S.phys:a.phys, st=a.stun==null?S.stun:a.stun;
  const field=(k,lab,help,v,unit)=>`<div class="b2af"><div><b>${E(lab)}</b><small>${E(help)}</small></div><div class="b2step"><button class="ghost" data-b2s="af:${k}" data-d="-1" aria-label="Less ${E(lab)}">−</button><input type="number" inputmode="numeric" data-b2n="af:${k}" value="${v}" aria-label="${E(lab)}"><button class="ghost" data-b2s="af:${k}" data-d="1" aria-label="More ${E(lab)}">+</button><span class="mono">${E(unit)}</span></div></div>`;
  const cons=consumables(); const left=([g])=>/^ammo:/.test(g.key)?(+g.qty||1)*10-(+g.used||0):(+g.qty||1);
  const diff=[['Good Karma available',ka,ka+a.gk],['Karma Pool',T.kpool,T.kpool+a.kp-(a.kbuy||0)],['Nuyen on hand',fmt(ny)+'¥',fmt(ny+a.nin-a.nout)+'¥'],['Physical / Stun',S.phys+' / '+S.stun,ph+' / '+st],...((S.mxDmg||0)>0?[['Persona (Matrix)',String(S.mxDmg),'0 (the deck restarts)']]:[]),
    ...cons.filter(([g])=>a.use['c'+S.gear.indexOf(g)]).map(([g,i])=>[g.name||GEARDB[g.key].n,left([g,i]),left([g,i])-(a.use['c'+i]||0)])];
  const neg=ny+a.nin-a.nout<0, over=cons.some(([g,i])=>left([g,i])-(a.use['c'+i]||0)<0);
  const notes=[]; if(neg) notes.push(['bad','Nuyen would go below zero. Check the numbers.']); if(over) notes.push(['bad','More used up than the sheet shows. Saving sets those to zero.']);
  if(a.kbuy) notes.push(['',`${a.kbuy} Karma Pool point${a.kbuy>1?'s':''} spent buying successes ${a.kbuy>1?'are':'is'} gone for good; earned Karma replaces ${a.kbuy>1?'them':'it'} (core p. 191).`]);
  const sus=isMagician()?(S.sus||[]):[]; if(sus.length) diff.push(['Sustained spells',sus.map(x=>x.n).join(', '),a.keepSus?'kept':'dropped']); notes.push(['',`After saving, spend any new Karma under Spend Good Karma on the ${S.established?'Runner':'Build'} tab.`]); // always shown, so the Save button doesn't move while someone is reaching for it
  notes.push(['',practicing()?'Practice session: this is undone when you end practice.':'This updates the real sheet. For a practice run, start a practice session at the top first.']);
  const sn=snaps();
  return `<div class="b2grid b2afgrid"><section class="b2pan b2afmain"><div class="b2h"><h3>What happened at the table</h3></div>
   ${dead?`<div class="b2warn b2dead" role="status"><p>This runner is dead: Physical damage ran more than their Body (${natBody()}) past the track (core p. 111). Healing doesn’t apply, and the boxes stay as they are, unless the GM rules otherwise.</p><label class="b2f b2chk"><input type="checkbox" data-b2c="af:lives" ${a.lives?'checked':''}> The GM says they live</label></div>`:''}
   ${field('gk','Good Karma earned','what the GM awarded (core p. 190–191)',a.gk,'K')}${field('kp','Added to the Karma Pool','if the GM gave a Karma Pool point',a.kp,'K')}${field('kbuy','Karma Pool burned','points spent buying successes (core p. 191); the Attack panel counts them for you',a.kbuy||0,'K')}
   ${field('nin','Nuyen in','pay, loot sold',a.nin,'¥')}${field('nout','Nuyen out','bribes, bills, gifts',a.nout,'¥')}
   <label class="b2f b2wide"><span class="b2k">Note for the nuyen log</span><input type="text" data-b2t="af:note" value="${E(a.note)}" placeholder="the run, who paid, what the GM ruled"></label>
   ${held?`<p class="note">Physical boxes stay at ${S.phys} unless the GM says they live.</p>`:field('phys','Physical boxes still marked','carried to next session',ph,'box')}${field('stun','Stun boxes still marked','usually rested off',st,'box')}
   <div id="b2heal">${healHTML(held?0:S.phys,S.stun)}</div>
   ${cons.length?`<h4>Used up</h4>`+cons.map(([g,i])=>field('u:c'+i,(g.name||GEARDB[g.key].n),(/^ammo:/.test(g.key)?'rounds':'items')+' left: '+left([g,i]),a.use['c'+i]||0,/^ammo:/.test(g.key)?'rd':'ea')).join(''):''}
   <p class="note">Ammo in guns and clips is counted in the ammo tracker; here count rounds that came out of the boxes.</p></section>
  <section class="b2pan"><div class="b2h"><h3>What changes on the sheet</h3></div><div id="b2afd"><div class="b2rows">${diff.map(([k,x,y],j)=>`<div class="b2r${j%2?' alt':''}"><span>${E(k)}</span><span class="mono">${E(x)} → <b>${E(y)}</b></span></div>`).join('')}</div>
   ${notes.map(([c,t])=>`<p class="note ${c==='bad'?'b2bad':''}">${E(t)}</p>`).join('')}</div>
   ${sus.length?`<label class="b2f b2chk"><input type="checkbox" data-b2c="af:keepSus" ${a.keepSus?'checked':''}> Keep sustaining ${E(sus.map(x=>x.n).join(', '))} into the next session</label>`:''}
   <button data-b2a="afsave" ${neg?'disabled':''}>Save a snapshot and update the sheet</button><p class="note" role="status">${E(a.saved)}</p>
   <h4>Snapshots</h4>${sn.length?sn.map((x,j)=>`<div class="b2r"><span>${E(x.t)}</span><button class="ghost" data-b2snap="${j}">Restore</button></div>`).join(''):'<p class="note">None yet. Each save keeps the sheet as it was, so a session can be undone.</p>'}</section></div>`;}
function afSave(){const a=B.af; const sn=snaps(); const d=new Date(), ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  sn.unshift({t:ds+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' · before this update',s:JSON.stringify(S)}); try{localStorage.setItem('sr2-b2-snaps-'+(S.id||'x'),JSON.stringify(sn.slice(0,10)));}catch(e){}
  S.kEarned=(+S.kEarned||0)+a.gk; S.kPoolBonus=(+S.kPoolBonus||0)+a.kp-(a.kbuy||0);
  const ny=S.nuyenNow===''||S.nuyenNow==null?0:+S.nuyenNow; S.nyLog=S.nyLog||[];
  if(a.nin){S.nyLog.push({d:ds,amt:a.nin,note:a.note||'After the session'});} if(a.nout){S.nyLog.push({d:ds,amt:-a.nout,note:a.note||'After the session'});} if(a.nin||a.nout) S.nuyenNow=ny+a.nin-a.nout;
  if(a.phys!=null&&!(S.phys>10+natBody()&&!a.lives)) S.phys=a.phys; if(a.stun!=null) S.stun=a.stun; S.mxDmg=0; // persona damage ends with the run: a crashed deck is back to full once restarted (core p. 179)
  consumables().forEach(([g,i])=>{const u=a.use['c'+i]||0; if(!u) return; if(/^ammo:/.test(g.key)) g.used=Math.min((+g.qty||1)*10,(+g.used||0)+u); else {g.qty=Math.max(0,(+g.qty||1)-u);}});
  if(!a.keepSus&&isMagician()) S.sus=[];
  S.gear=S.gear.filter(g=>!(GEARDB[g.key]&&(g.cat==='med'||g.cat==='boom')&&(+g.qty)<=0));
  B.af={gk:0,kp:0,kbuy:0,nin:0,nout:0,note:'',phys:null,stun:null,use:{},keepSus:false,saved:'Saved. The sheet is updated and the old version is kept as a snapshot.'}; render();}

// ---------- healing: a suggestion only, the player still sets the boxes (core p. 112–113) ----------
const HEAL=[null,{n:'Light',wtn:2,tn:4,base:[24,'hrs'],min:[2,'hrs'],life:'Low'},{n:'Moderate',wtn:4,tn:6,base:[10,'days'],min:[1,'day'],life:'Middle'},{n:'Serious',wtn:6,tn:8,base:[20,'days'],min:[2,'days'],life:'High'},{n:'Deadly',wtn:null,tn:10,base:[30,'days'],min:[3,'days'],life:'Hospitalized'}];
const lvOf=b=>b>=10?4:b>=6?3:b>=3?2:b>=1?1:0;
const p1=t=>t<=1?1:t<=6?(7-Math.max(2,t))/6:p1(t-6)/6;
function healHTML(phys,stun){phys=+phys||0; stun=+stun||0; if(!phys&&!stun) return '';
  const body=natBody(), wil=attrNow('wil'), wm=lvOf(Math.min(10,phys))>0?Math.min(3,lvOf(phys)):0, sm=lvOf(Math.min(10,stun))>0?Math.min(3,lvOf(stun)):0, mods=wm+sm;
  const out=[];
  if(stun){const d=Math.max(body,wil), t=2+mods, e=Math.max(0.5,d*p1(t)); out.push(`<b>Stun ${stun}:</b> rest and roll ${d===wil?'Willpower':'Body'} (${d}) against ${t}${mods?` (2 + ${mods} for wounds)`:''}. Each box takes 60 minutes ÷ successes; with about ${Math.round(e*10)/10} successes that's roughly ${Math.round(stun*60/Math.max(1,Math.round(e)))} minutes for all ${stun} (core p. 112).`);}
  if(phys){const L=lvOf(Math.min(10,phys)); const H=HEAL[L]; const e=t=>Math.max(1,Math.round(body*p1(t)));
    const first=H.wtn==null?'Deadly wounds always need a doctor.':`First a Body (${body}) test against ${H.wtn}: any success means it heals without a doctor; none means it needs medical attention.`;
    const steps=[]; for(let l=L;l>=1;l--){const h=HEAL[l]; const s=e(h.tn); const raw=h.base[0]/s, unit=h.base[1]; steps.push(`${h.n} → ${l>1?HEAL[l-1].n:'healed'}: ${h.base[0]} ${h.base[1]} ÷ ${s} success${s>1?'es':''} ≈ ${Math.round(raw*10)/10} ${unit} (never under ${h.min[0]} ${h.min[1]}; ${h.life} lifestyle or better)`);}
    out.push(`<b>Physical ${phys} (${H.n}):</b> ${first} Each level then heals in stages, natural Body (${body}) against the Healing Table (core p. 113):<br>${steps.join('<br>')}`);}
  return `<div class="b2heal"><h4>Healing, as a guide</h4>${out.map(x=>`<p class="note">${x}</p>`).join('')}<p class="note">Rough numbers from average dice. Roll it at the table, add First Aid, a doctor or magic as the GM rules, then set the boxes above.</p></div>`;}
// ---------- hits sent from the GM screen on this device: the player chooses to apply them ----------
const HITKEY='sr2-gm-hits';
function gmHits(){try{const L=JSON.parse(localStorage.getItem(HITKEY)||'[]'); return Array.isArray(L)?L:[];}catch(e){return [];}}
function gmHitsMine(){return gmHits().filter(h=>h&&h.id===S.id);}
function gmHitsHTML(){const H=gmHitsMine(); if(!H.length) return ''; const p=H.reduce((a,h)=>a+(+h.p||0),0), s=H.reduce((a,h)=>a+(+h.s||0),0);
  return `<section class="b2pan b2gmhit"><div class="b2h"><h3>From the GM screen</h3><span class="note">${H.length} hit${H.length>1?'s':''}</span></div><p>The GM marked <b>${p?p+' Physical':''}${p&&s?' and ':''}${s?s+' Stun':''}</b> on ${E(S.handle||S.name||'this runner')}. Apply it to your monitor?</p><div class="b2row"><button data-b2a="gmhit:yes">Apply</button><button class="ghost" data-b2a="gmhit:no">Dismiss</button></div></section>`;}
function gmHitsDone(apply){const H=gmHitsMine(); if(apply){const p=H.reduce((a,h)=>a+(+h.p||0),0), s=H.reduce((a,h)=>a+(+h.s||0),0); S.phys=Math.max(0,(+S.phys||0)+p); S.stun=Math.min(10,Math.max(0,(+S.stun||0)+s));}
  try{localStorage.setItem(HITKEY,JSON.stringify(gmHits().filter(h=>!(h&&h.id===S.id))));}catch(e){} render();}
// ---------- practice session: work on the runner, then put the sheet back ----------
const PKEY=()=>'sr2-b2-practice-'+(S.id||'x');
function practicing(){try{return !!localStorage.getItem(PKEY());}catch(e){return false;}}
function practiceStart(){try{localStorage.setItem(PKEY(),JSON.stringify(S));}catch(e){alert('This browser won’t let the page save a copy, so a practice session can’t start.'); return;} render();}
function practiceEnd(keep){let snap=null; try{snap=localStorage.getItem(PKEY()); localStorage.removeItem(PKEY());}catch(e){} if(snap&&!keep){S=Object.assign(blank(),JSON.parse(snap));} render();}
function practiceBar(){const b=$('b2prac'); if(!b) return; const on=practicing(); document.body.classList.toggle('b2prac',on); const btn=$('b2pracBtn'); if(btn){btn.textContent=on?'End practice':'Practice session'; btn.setAttribute('aria-pressed',String(on));}
  {const pm=$('b2pracMenu'); if(pm){pm.textContent=on?'End practice':'Practice session'; pm.setAttribute('aria-pressed',String(on));} const wb=$('b2who'); if(wb&&wb.firstChild){const nm=(S.name||'New runner')+(S.concept?' · '+S.concept:''); wb.firstChild.textContent=nm; wb.setAttribute('aria-label',nm+'. Open the runner list');}}
  b.hidden=!on; if(on) b.innerHTML=`<b>Practice session.</b> <span>Roll, take damage, log Karma and spend it: when you end practice, the sheet goes back to how it was.</span><button data-b2a="prac:end">End practice and put the sheet back</button><button class="ghost" data-b2a="prac:keep">Keep these changes</button>`;}
// ---------- Build: pinned budget strip and issues ----------
function stripHTML(){const c=S._calc||{}; const iss=[...document.querySelectorAll('#issues li')].filter(li=>!li.classList.contains('ok')&&!li.classList.contains('info')); const bad=iss.filter(li=>li.classList.contains('bad')).length;
  const chip=(k,v,cls)=>`<span class="b2chip ${cls||''}"><small>${E(k)}</small><b>${E(v)}</b></span>`;
  return (S.established?'':chip('Resources left',c.resLeft==null?'—':fmt(c.resLeft)+'¥',c.resLeft<0?'bad':''))+chip('Essence',c.ess==null?'—':String(c.ess))+(c.awake?chip('Magic',String(c.magic)):'')+chip('Good Karma',String(karmaAvail()),karmaAvail()<0?'bad':'')+chip('Nuyen',c.nuyen==null?'—':fmt(c.nuyen)+'¥')
   +`<button class="b2chip ${bad?'bad':iss.length?'warn':'ok'}" data-b2a="drawer" aria-expanded="${!!B.drawer}"><small>Checklist</small><b>${iss.length?iss.length+' to check':'all good'}</b></button>`;}
// the GM screen can read these few numbers from this browser (Initiative order); nothing else leaves the sheet
function shareGM(){const T=sheetStats(); const g={r:T.reaction,d:T.dice,cp:T.cpool,b:augAttr('body')+hasDerm(),a:[T.ar.b,T.ar.i]}; const o=S._gm||{};
  if(o.r!==g.r||o.d!==g.d||o.cp!==g.cp||o.b!==g.b||String(o.a)!==String(g.a)){S._gm=g; save();}}
// ---------- mount ----------
function dropPlace(n){const v=n&&n.querySelector('.b2vit'), pan=v&&v.querySelector('.b2vpan'), lap=window.matchMedia('(min-width:40.0625em)').matches; if(pan) pan.style.left='';
  if(n&&lap&&(B.drop==='atk'||B.drop==='gh')){ // fix9: a roll card's breakdown opens under its line, or above it when there's more room there (popover rule 2)
    const p=n.querySelector('#b2vp-'+B.drop), t=p&&p.parentElement.querySelector('.b2whym'); if(!p||!t) return; p.classList.remove('up'); p.style.maxHeight='none'; p.style.top='';
    const h=p.offsetHeight, lim=()=>Math.max(0,v?v.getBoundingClientRect().bottom:0); let r=t.getBoundingClientRect(), below=innerHeight-r.bottom-8, above=r.top-lim()-8;
    if(h>below&&h>above){window.scrollBy(0,r.top-lim()-8); r=t.getBoundingClientRect(); below=innerHeight-r.bottom-8; above=r.top-lim()-8;} // no room either side: bring the line up under the vitals line first
    if(h>below&&h>above){const room=innerHeight-lim()-12; p.style.top=(lim()+4-p.parentElement.getBoundingClientRect().top)+'px'; p.style.maxHeight=Math.max(160,room)+'px'; return;} // still too tall: cover its own line, which it repeats
    const up=h>below&&above>below; p.classList.toggle('up',up); p.style.maxHeight=Math.max(160,up?above:below)+'px'; return;}
  if(!pan||!B.drop||!lap) return;
  const o=v.querySelector(`.b2vrow [data-b2a="drop"][data-d="${B.drop}"]`); if(!o||o.offsetParent===null) return; const a=o.closest('.b2vg')||o, x=a.getBoundingClientRect().left-v.getBoundingClientRect().left;
  pan.style.left=Math.max(0,Math.min(x,v.clientWidth-pan.offsetWidth))+'px'; // fix8: the drop-down opens under the thing that was clicked
  const p=pan.querySelector('#b2vp-'+B.drop); if(p&&!p.hidden){p.style.maxHeight='none'; const over=p.getBoundingClientRect().bottom-innerHeight+8; if(over>0) window.scrollBy(0,over); // fix9: runs past the window? let the vitals line stick at the top first (popover rule 2)
    p.style.maxHeight=Math.max(160,innerHeight-p.getBoundingClientRect().top-8)+'px';}}
function dropClose(){if(!B.drop&&!B.vitOpen) return false; B.drop=null; B.vitOpen=false; const n=document.getElementById('b2night'); if(n){const v=n.querySelector('.b2vit'); if(v) v.classList.remove('open'); n.querySelectorAll('.b2vp').forEach(p=>p.hidden=true); n.querySelectorAll('.b2vscrim').forEach(x=>x.remove()); n.querySelectorAll('[data-b2a="drop"],[data-b2a="vit"]').forEach(b=>b.setAttribute('aria-expanded','false'));} return true;}
function redraw(){const n=$('b2night'); if(n&&B.tab==='night'){const f=document.activeElement, d=f&&n.contains(f)&&f.dataset?f.dataset:null;
  const q=d?(d.b2?`[data-b2="${d.b2}"]`:d.b2p?`[data-b2p="${d.b2p}"][data-v="${d.v}"]`:d.b2s?`[data-b2s="${d.b2s}"][data-d="${d.d}"]`:d.b2a?`[data-b2a="${d.b2a}"]${d.d?`[data-d="${d.d}"]`:''}`:d.b2c?`[data-b2c="${d.b2c}"]`:null):null;
  n.innerHTML=nightHTML(); dropPlace(n); if(q){let e=null; try{e=n.querySelector(q);}catch(x){} if(e&&!e.disabled&&e.offsetParent!==null) e.focus({preventScroll:true});}}}
function afTotals(){const n=$('b2after'); if(!n||B.tab!=='after') return; const tmp=document.createElement('div'); tmp.innerHTML=afterHTML(); {const h1=n.querySelector('#b2heal'), h2=tmp.querySelector('#b2heal'); if(h1&&h2) h1.innerHTML=h2.innerHTML;} const a=n.querySelector('#b2afd'), b=tmp.querySelector('#b2afd'); if(a&&b) a.innerHTML=b.innerHTML; const s1=n.querySelector('[data-b2a="afsave"]'), s2=tmp.querySelector('[data-b2a="afsave"]'); if(s1&&s2) s1.disabled=s2.disabled; n.querySelectorAll('[data-b2n]').forEach(i=>{const j=tmp.querySelector(`[data-b2n="${i.dataset.b2n}"]`); if(j&&i!==document.activeElement) i.value=j.value;});}
function redrawAfter(){const n=$('b2after'); if(n&&B.tab==='after') n.innerHTML=afterHTML();}
function redrawStrip(){try{practiceBar();}catch(e){}
const s=$('b2strip'); if(s) s.innerHTML=stripHTML(); {const j=document.querySelector('.jump'); if(j) document.documentElement.style.setProperty('--jumpH',j.offsetHeight+'px'); const st=$('b2strip'); document.documentElement.style.setProperty('--stripH',(st&&st.offsetParent!==null?st.offsetHeight:0)+'px');} {const wv=$('b2wearBuild'); if(wv&&B.tab==='build'&&!(document.activeElement&&wv.contains(document.activeElement)&&document.activeElement.tagName==='SELECT')){const h=wearHTML(); wv.hidden=!h; wv.innerHTML=h;}} const d=$('b2drawer'); if(d){d.hidden=!B.drawer||B.tab!=='build'; if(B.drawer) d.innerHTML=`<div class="b2h"><h3>Checklist</h3><button class="ghost" data-b2a="drawer">Close</button></div><ul class="issues">${$('issues').innerHTML}</ul>`;}}
// Game night has two views (Phase 2, 2026-11-22): Play (the table panels) and Gear and ammo (ammo tracker, nuyen log, Stash, Deck, Rigging, Skillsofts)
function gvSync(){document.body.classList.toggle('b2gear',B.tab==='night'&&B.gv==='gear'); const g=$('b2gv'); if(g) g.querySelectorAll('[data-gv]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.gv===B.gv)));}
function setGv(v){B.gv=v; keep(); gvSync(); if(v==='play') redraw(); window.scrollTo(0,0);}
function setTab(t){if(t==='market'&&!S.established) t='build'; B.tab=t; keep(); document.body.classList.toggle('b2gn',t==='night'); document.body.classList.toggle('b2af',t==='after'); document.body.classList.toggle('b2mk',t==='market'); gvSync();
  if(typeof sessionSet==='function') sessionSet(t==='night',true);
  document.querySelectorAll('#b2tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===t)));
  if(t==='night') redraw(); if(t==='after') redrawAfter(); if(t==='market'&&window.SR2MK) SR2MK.draw(); redrawStrip(); window.scrollTo(0,0);}
function mount(){
  const nav=$('jump'); if(!nav||$('b2tabs')) return;
  const tabs=document.createElement('div'); tabs.id='b2tabs'; tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Mode');
  tabs.innerHTML=[['build','Build'],['market','Marketplace','Market'],['night','Game night'],['after','After the session','After']].map(([k,l,sh])=>`<button role="tab" data-tab="${k}" aria-selected="${B.tab===k}"${k==='market'&&!S.established?' hidden':''}>${sh?`<span class="b2tl">${l}</span><span class="b2ts" aria-hidden="true">${sh}</span>`:l}</button>`).join(''); // phones show the short labels on one row (fix8)
  nav.insertBefore(tabs,nav.firstChild);
  {const pb=document.createElement('button'); pb.id='b2pracBtn'; pb.type='button'; pb.className='ghost b2pracb'; pb.dataset.b2a='prac'; pb.textContent='Practice session'; tabs.after(pb);
   // phones (fix8): Practice session sits in Menu, and the runner's name at the top opens the runner list there
   const ctl=$('srhCtl'); if(ctl&&!$('b2pracMenu')){const pm=document.createElement('button'); pm.id='b2pracMenu'; pm.type='button'; pm.className='ghost'; pm.dataset.b2a='prac'; pm.textContent='Practice session'; ctl.appendChild(pm);}
   const sub=$('srhSub'); if(sub&&!$('b2who')){const wb=document.createElement('button'); wb.id='b2who'; wb.type='button'; wb.setAttribute('aria-controls','srhCtl'); wb.innerHTML='<span></span><span aria-hidden="true">▾</span>'; sub.after(wb);
     wb.addEventListener('click',()=>{const h=$('srh'), mb=h&&h.querySelector('.srh-menu'); if(h&&mb&&!h.classList.contains('open')) mb.click(); const r=$('rosterSel'); if(r) r.focus();});}
   const bar=document.createElement('div'); bar.id='b2prac'; bar.className='b2pracbar'; bar.hidden=true; bar.setAttribute('role','status'); nav.after(bar);}
  window.addEventListener('storage',e=>{if(e.key===HITKEY&&B.tab==='night') redraw();});
  // on the public site, link the GM screen next to the Gear Locker link
  // the GM screen link now lives in the shared header (SRHEAD)
  const strip=document.createElement('div'); strip.id='b2strip'; strip.setAttribute('aria-label','Budget'); nav.after(strip);
  const drawer=document.createElement('div'); drawer.id='b2drawer'; drawer.hidden=true; strip.after(drawer);
  const lay=document.querySelector('.layout'); const night=document.createElement('section'); night.id='b2night'; night.className='b2wrap'; night.setAttribute('aria-label','Game night');
  const after=document.createElement('section'); after.id='b2after'; after.className='b2wrap'; after.setAttribute('aria-label','After the session'); const gv=document.createElement('div'); gv.id='b2gv'; gv.setAttribute('role','tablist'); gv.setAttribute('aria-label','Game night view'); gv.innerHTML='<button role="tab" type="button" data-gv="play">Play</button><button role="tab" type="button" data-gv="gear">Gear and ammo</button>'; gv.addEventListener('click',e=>{const b=e.target.closest('[data-gv]'); if(b) setGv(b.dataset.gv);});
  const market=document.createElement('section'); market.id='b2market'; market.className='b2wrap'; market.setAttribute('aria-label','Marketplace');
  lay.before(gv); lay.before(night); lay.before(after); lay.before(market);
  // laptops (fix8): Play | Gear and ammo sits at the end of the mode-tab row, so Game night starts higher; phones keep it under the row
  {const mq=window.matchMedia('(min-width:40.0625em)'), place=()=>{if(mq.matches){if(gv.parentElement!==nav) nav.appendChild(gv);} else if(gv.nextElementSibling!==night) night.before(gv); try{redrawStrip();}catch(e){}};
   place(); if(mq.addEventListener) mq.addEventListener('change',place); else if(mq.addListener) mq.addListener(place);}
  document.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-b2p],[data-b2a],[data-b2s],[data-b2trk],[data-b2k],[data-b2snap],[data-b2sv],[data-b2sprm],[data-b2sus]'); if(!t||!t.closest('#b2tabs,#b2night,#b2after,#b2strip,#b2drawer,#b2pracBtn,#b2pracMenu,#b2prac')) return;
    if(t.dataset.tab) return setTab(t.dataset.tab);
    if(t.dataset.b2a==='drawer'){B.drawer=!B.drawer; return redrawStrip();}
    if(t.dataset.b2a==='afsave') return afSave();
    if(t.dataset.b2a==='prac'){if(practicing()){if(confirm('End practice and put the sheet back the way it was?')) practiceEnd(false);} else practiceStart(); return;}
    if(t.dataset.b2a==='prac:end') return practiceEnd(false);
    if(t.dataset.b2a==='prac:keep'){if(confirm('Keep everything from this practice session on the real sheet?')) practiceEnd(true); return;}
    if(t.dataset.b2a==='gmhit:yes') return gmHitsDone(true);
    if(t.dataset.b2a==='gmhit:no') return gmHitsDone(false);
    if(t.dataset.b2a==='susadd'){const ok=S.powers.filter(p=>p&&p.name&&spellDur(p.name)==='S'); const nm=ok.some(p=>p.name===B.susp)?B.susp:(ok[0]||{}).name; const p=ok.find(x=>x.name===nm); if(p&&(S.sus||[]).length<bestRating(/^sorcery/i)){S.sus=(S.sus||[]).concat([Object.assign({n:p.name,f:+p.cost||1},B.suson&&B.suson.trim()?{on:B.suson.trim()}:{})]); B.suson='';} render(); return;}
    if(t.dataset.b2sus!=null){S.sus.splice(+t.dataset.b2sus,1); render(); return;}
    if(t.dataset.b2a==='spadd'){const d=new Date(); S.spirits=(S.spirits||[]).concat([{t:B.spt||(S.magic==='hermetic'?'earth':'nature'),f:B.spf||3,sv:B.spsv==null?1:B.spsv,on:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}]); render(); return;}
    if(t.dataset.b2sv){const [i,d]=t.dataset.b2sv.split('|'); const x=(S.spirits||[])[+i]; if(x){x.sv=Math.max(0,(+x.sv||0)+(+d));} render(); return;}
    if(t.dataset.b2sprm!=null){S.spirits.splice(+t.dataset.b2sprm,1); render(); return;}
    if(t.dataset.b2p){if(t.disabled) return; if(setB2(t.dataset.b2p,t.dataset.v)) redraw(); return;}
    if(t.dataset.b2a==='drop'){const d=t.dataset.d; B.drop=B.drop===d?null:d; B.vitOpen=false; return redraw();}
    if(t.dataset.b2a==='mt'){B.mt=t.dataset.d; B.drop=null; B.vitOpen=false; return redraw();}
    if(t.dataset.b2a==='nt'){B.nt=t.dataset.d; B.drop=null; B.vitOpen=false; redraw(); const n=$('b2night'); if(n&&n.getBoundingClientRect().top<0) window.scrollTo(0,0); return;}
    if(t.dataset.b2a) return act(t.dataset.b2a);
    if(t.dataset.b2s) return stepper(t.dataset.b2s,+t.dataset.d);
    if(t.dataset.b2trk){const k=t.dataset.b2trk, v=+t.dataset.v; S[k]=(S[k]||0)===v?v-1:v; render(); return;}
    if(t.dataset.b2k){const n=+t.dataset.d, w=woundMods().m, sp=susPen(), tn=B.sk.tn+w+sp, nm=t.dataset.b2k;
      if(t.dataset.copy){copyOut(`&{template:default} {{name=${who()}: ${nm}}} {{Target number=${tn}${w||sp?' ('+[w?'wounds +'+w:'',sp?'sustaining +'+sp:''].filter(Boolean).join(', ')+')':''}}} {{Successes=${r20(n,tn)}}}`,nm,'sk');}
      else {const r=rollN(n,tn), k=r.filter(x=>x>=tn).length; B.sk.res=RR(r,tn,{head:nm,mods:`TN ${tn}: base ${B.sk.tn}${wsMods(w,sp)} · ${n} dice`}); B.copy=null;}
      return redraw();}
    if(t.dataset.b2snap!=null){const sn=snaps()[+t.dataset.b2snap]; if(sn&&confirm('Put the sheet back to “'+sn.t+'”? The current sheet becomes a snapshot first.')){const cur=JSON.stringify(S); const L=snaps(); L.unshift({t:'Before restoring '+sn.t,s:cur}); try{localStorage.setItem('sr2-b2-snaps-'+(S.id||'x'),JSON.stringify(L.slice(0,10)));}catch(e){} S=Object.assign(blank(),JSON.parse(sn.s)); render();}}});
  // After the session inputs: handled here first, so the page-wide change handler doesn't re-render and swallow the next click
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.closest||!t.closest('#b2after')) return; const n=t.dataset.b2n, c=t.dataset.b2c, tx=t.dataset.b2t; if(!n&&!c&&!tx) return; e.stopPropagation();
    if(n){const f=n.slice(3), v=Math.max(0,Math.round(+t.value||0)); if(f.startsWith('u:')) B.af.use[f.slice(2)]=v; else B.af[f]=v; B.af.saved=''; keep(); return afTotals();}
    if(c==='af:keepSus'){B.af.keepSus=t.checked; return afTotals();}
    if(c==='af:lives'){B.af.lives=t.checked; if(!t.checked) B.af.phys=null; return redrawAfter();}
    if(tx){B.af.note=t.value; return;}},true);
  document.addEventListener('change',e=>{const t=e.target; if(!t.closest||!t.closest('#b2night,#b2after')) return;
    const k=t.dataset.b2, c=t.dataset.b2c, n=t.dataset.b2n, tx=t.dataset.b2t;
    if(k){if(setB2(k,t.value)) redraw(); return;}
    if(c==='gh:fl'){B.gh.fl=t.checked;B.gh.roll=null;}
    else if(c==='kvote'){B.kvote=t.checked;}
    else if(c==='keepnat'){S.keepNatEyes=t.checked; sv();}
    else if(n){const f=n.slice(3), v=Math.max(0,Math.round(+t.value||0)); if(f.startsWith('u:')) B.af.use[f.slice(2)]=v; else B.af[f]=v; B.af.saved=''; return afTotals();}
    else if(c==='af:keepSus'){B.af.keepSus=t.checked; return afTotals();}
    else if(tx){B.af.note=t.value; return;}
    else return;
    redraw();});
function setB2(k,v){const t={value:v};
    if(k==='wid'){B.wid=t.value; B.widBy=B.widBy||{}; B.widBy[S.id]=t.value;B.mode='s1';B.rng=0;B.roll=null;B.spend=0;B.aim=0;B.force=0;B.mount=null;}
    else if(k==='mode') B.mode=t.value==='fa'?'f'+(B.faN||3):t.value; else if(k==='dmode'){B.dmode=t.value; B.spend=0;} else if(k==='mount') B.mount=t.value; else if(k==='urb') B.urb=t.value; else if(k==='los') B.los=t.value; else if(k==='spt') B.spt=t.value; else if(k==='susp') B.susp=t.value; else if(k==='hwl'){B.hWl=t.value; B.drainHit=null; B.drainRes=null;} else if(k==='v2sc'){B.v2sc=+t.value; B.roll=null;} else if(k==='v2st'){B.v2st=t.value; B.roll=null;} else if(k==='vsub'){B.vsub=t.value; B.roll=null;} else if(k==='vut'){B.vut=t.value; B.roll=null;} else if(k==='rng') B.rng=+t.value; else if(k==='dmglv') B.dmgLv=t.value; else if(k==='amsel') B.amSel=t.value;
    else if(k&&k.startsWith('sit:')) B.sit[k.slice(4)]=t.value; else if(k&&k.startsWith('msit:')) B.msit[k.slice(5)]=t.value;
    else if(k==='gh:kind'){B.gh.kind=t.value;B.gh.roll=null;} else if(k==='gh:lvl'){B.gh.lvl=t.value;B.gh.roll=null;} else if(k==='gh:dt'){B.gh.stun=t.value==='s';B.gh.roll=null;} else if(k==='dtgt'){B.dtgt=t.value;B.rng=0;} else if(k==='dft'){B.dft=t.value;} else if(k==='sec'){B.sec=Math.max(0,Math.min(4,+t.value||0)); B.roll=null;} else if(k==='ctc'){B.ctc=+t.value;} else if(k==='inim'){B.inim=t.value; B.ini=null;} else if(k==='ctb'||k==='cte'){const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)]; if(C){if(k==='ctb') {C.cb=t.value; delete C.cei;} else C.cei=+t.value; if(typeof save==='function') save();}} else if(k==='vveh'){B.vveh=+t.value;B.vRes='';B.vhRes=null;B.vLast=null;} else if(k==='vint'){B.vint=t.value;} else if(k==='vocs'){B.vocs=t.value===''?'':Math.max(0,Math.round(+t.value||0));} else if(k==='vdist'){B.vdist=t.value===''?'':Math.max(0,Math.round(+t.value||0));} else if(k==='vhl'||k==='vhk'){const H=B.vh||(B.vh={pow:6,lvl:'M',att:1,av:false}); if(k==='vhl') H.lvl=t.value; else H.av=t.value==='av'; B.vhRes=null;} else if(k==='vsk'){B.vsk=+t.value;} else if(k==='vtest'){B.vtest=t.value;B.vRes='';} else if(k==='vter'){B.vter=t.value;}
    else return false;
    return true;}
  document.addEventListener('input',e=>{const t=e.target; if(t&&t.dataset&&t.dataset.b2in==='suson') B.suson=t.value; if(t&&t.dataset&&t.dataset.b2in==='hitpaste'){B.hitTxt=t.value; if(e.inputType==='insertFromPaste'&&hitParse(t.value)) hitApply();}});
  // drop-downs from the vitals line close on a click elsewhere or Escape; the tab rows move with the arrow keys
  document.addEventListener('click',e=>{if(!(B.drop||B.vitOpen)||B.tab!=='night') return; const t=e.target; if(t&&t.closest&&t.closest('.b2vit, .b2whyc, .b2whym')) return; dropClose();},true);
  document.addEventListener('keydown',e=>{const t=e.target;
    if(e.key==='Escape'&&B.tab==='night'&&(B.drop||B.vitOpen)){const d=B.drop; dropClose(); const o=document.querySelector(d?`#b2night [data-b2a="drop"][data-d="${d}"]`:'#b2night [data-b2a="vit"]'); if(o&&o.offsetParent!==null) o.focus(); return;}
    if(t&&t.dataset&&t.dataset.b2in==='hitpaste'&&e.key==='Enter'){e.preventDefault(); return act('hitpaste');}
    if(t&&t.getAttribute&&t.getAttribute('role')==='tab'&&t.closest&&t.closest('.b2mtabs,.b2ntabs')&&/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)){const L=[...t.parentElement.querySelectorAll('[role=tab]')], i=L.indexOf(t), n=e.key==='Home'?0:e.key==='End'?L.length-1:(i+(e.key==='ArrowRight'?1:-1)+L.length)%L.length; e.preventDefault(); L[n].click(); const f=document.querySelector(`#b2night [data-b2a="${t.dataset.b2a}"][data-d="${L[n].dataset.d}"]`); if(f) f.focus();}});
  document.addEventListener('change',e=>{const t=e.target; if(t&&t.dataset&&t.dataset.b2in==='hess'){const v=parseFloat(t.value); B.hEss=isNaN(v)?6:Math.max(0,Math.min(6,Math.round(v*10)/10)); B.roll=null; redraw();}});
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset) return; const d=t.dataset;
    if(d.b2chip!=null){const g=S.gear[+d.b2chip]; if(!g) return; if(t.checked){const why=chipBlock(g,chipsOn()); if(why){t.checked=false; return;} g.slot=true;} else delete g.slot; B.hpool=null; B.hpMax=null; render(); return;}
    if(d.b2chipm!=null){const g=S.gear[+d.b2chipm]; if(!g) return; if(t.value) g.mem=true; else delete g.mem; render(); return;}});
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset||!t.dataset.b2ct) return; const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)]; if(!C) return; C[t.dataset.b2ct]=Math.max(0,Math.min(12,Math.floor(+t.value||0))); if(typeof save==='function') save(); redraw();});
  const _render=render; render=function(){_render.apply(this,arguments); try{shareGM();}catch(e){} try{if(typeof xferCheck==='function') xferCheck();}catch(e){} try{redraw(); redrawAfter(); redrawStrip(); if(window.SR2MK){if(B.tab==='market'&&!S.established) setTab('build'); SR2MK.draw();}}catch(e){console.error(e);}};
  try{ if(localStorage.getItem('sr2-builder-session')==='1'&&!ST.tab) B.tab='night'; }catch(e){}
  setTab(B.tab);
}
window.SR2B2={B,attacks,nightHTML,afterHTML,setTab,hitParse,hitCodeOf}; window.SR2CT={CTBOOK,ctStats,ctGuess,skillDiceNow}; window.chipHaveMap=chipHaveMap; // the Skill Web (swHave) counts slotted chips
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
