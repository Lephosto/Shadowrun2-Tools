const SECN=['no','Blue','Green','Orange','Red']; // Security Code colors, core p. 165
/* Runner Builder 2: three modes on top of the Builder (Build / Game night / After the session).
   Reads the Builder's own state S and helpers, so every number matches the sheet. Rules cites are printed core pages. */
(function(){
'use strict';
const E=s=>esc(s);
const SIGN=x=>x>0?'+'+x:x<0?'−'+(-x):'+0';
const L4='LMSD', BOXES={L:1,M:3,S:6,D:10};
const d6x=()=>{let t=0,x;do{x=1+Math.floor(Math.random()*6);t+=x;}while(x===6&&t<60);return t;}; // Rule of Six (core p. 32)
const r20=(n,tn)=>tn<=6?`[[${n}d6>${tn}]]`:`[[${n}d6!!6>${tn}]]`;
// every damage code in the text (a gun can show two, e.g. flechette vs unarmored / armored): add Power, then levels (max D)
const bump=(d,lv)=>String(d||'').replace(/(\d+)([LMSD])/g,(m,n,l)=>n+L4[Math.min(3,L4.indexOf(l)+lv)]);
const pow=(d,p)=>String(d||'').replace(/(\d+)([LMSD])/g,(m,n,l)=>(+n+p)+l);
let ST={}; try{ST=JSON.parse(localStorage.getItem('sr2-b2')||'{}')||{};}catch(e){ST={};}
const keep=()=>{try{localStorage.setItem('sr2-b2',JSON.stringify({tab:B.tab}));}catch(e){}};
// per-session table state (not saved with the character)
const B={tab:ST.tab||'build',wid:'unarmed',mode:'s1',rng:0,amSel:'',sit:{},msit:{},gm:0,spend:0,force:0,dmgLv:'M',tnBase:4,fired:0,pool:null,poolMax:null,karma:null,roll:null,copy:null,
  gh:{kind:'ball',pow:9,lvl:'M',fl:true,att:0,spend:0,roll:null}, sk:{tn:4,res:''}, ini:null, af:{gk:0,kp:0,nin:0,nout:0,note:'',phys:null,stun:null,use:{},saved:''}};
// ---------- rules tables (core p. 89, 101) ----------
const VIS=[['n','Clear',0,0,0],['full','Full darkness',8,8,2],['min','Minimal light',6,2,2],['part','Partial light',2,0,1],['glare','Glare',2,2,2],['mist','Mist',2,0,0],['ls','Light smoke, fog, rain',4,2,0],['hs','Heavy smoke, fog, rain',6,4,0],['ts','Thermal smoke, heavy',6,4,6]]; // normal, natural low-light, natural thermographic
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
const HITS={ball:'Bullet (Ballistic armor)',imp:'Melee, unarmed or thrown (Impact armor)',flech:'Flechette',apds:'APDS',gel:'Gel round',mana:'Mana combat spell (Willpower)',phys:'Physical combat spell (Body)',icp:'IC or a decker attacks your persona',black:'Black IC (to your body)'};
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
  return `<div class="b2camo">${camoPickHTML(g.key,pat,`data-camo="${gi}"`,{cls:'b2f',kcls:'b2k'})}
    ${pat?sel(`data-camoside="${gi}"`,'Side out',[['day','Day side'],['night','Night side']],side):''}
    ${sel('data-terrain','Where you are',[['','Pick the terrain'],...CAMO_PATTERNS.map(p=>[p,p])],terr)}
    ${sel('data-tod','Time',[['day','Day'],['night','Night']],tod)}
    <div class="b2cfx">${!pat?(camoKind(g.key)==='mil'?'Standard military finish: no camouflage modifier.':'Pick the pattern this one was bought in.'):!terr?'Pick where you are to see the Perception modifier.':`<b>${fx.mod>0?'+':''}${fx.mod}</b> ${E(pat)} ${E(fx.txt)} (FoF p. 77).${wrong?' The '+side+' side is out at '+tod+'; the patterns are reversible (FoF p. 52), so turn it, or it’s the GM’s call.':''} Moving counts as “action very obvious” (core p. 185).`}</div></div>`;}
document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset) return; const d=t.dataset;
  if(d.camo!=null){const g=S.gear[+d.camo]; if(g){if(t.value) g.camo=t.value; else delete g.camo; render();} return;}
  if(d.camoside!=null){const g=S.gear[+d.camoside]; if(g){g.camoSide=t.value; render();} return;}
  if(d.terrain!=null){S.terrain=t.value; render(); return;}
  if(d.tod!=null){S.tod=t.value; render(); return;}});
function wearLines(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>ASTAT[g.key]&&!g.at);}
function wearPanelHTML(){const h=wearHTML(); return `<section class="b2pan b2wearp" aria-label="Armor you are wearing">${h||'<div class="b2h"><h3>Wearing</h3></div><p class="note">No armor carried. Buy some under Gear; stashed armor doesn’t count.</p>'}</section>`;}
function wearHTML(){const L=wearLines(), ar=armorTotals(); if(!L.length&&!ar.parts.length) return '';
  const nm=g=>GEARDB[g.key]?GEARDB[g.key].n:g.key, BI=g=>{const a=ASTAT[g.key]; return a[0]+'/'+a[1];};
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
  const parts=ar.parts.map(p=>`<span class="b2wp b2wp-${p.k}"><span>${E(p.l)}</span><b>${p.k==='helmet'&&ar.builtIn?'in suit':sign(p,p.b)+'/'+sign(p,p.i)}</b></span>`).join('<span class="b2wop" aria-hidden="true">·</span>');
  const notes=[];
  if(ar.fg) notes.push('Forearm guards: +1 Impact against melee only, not ranged (SSC p. 39).');
  if(ar.shieldG) notes.push('The shield adds on top of the helmet (table ruling).');
  if(ar.builtIn) notes.push('Core heavy armor already includes a helmet (core p. 242); another helmet doesn’t add.');
  if(ar.bodyG&&/^armor:Form-Fitting/.test(ar.bodyG.key)) notes.push('Form-fitting armor can’t be worn with any other body armor (SSC p. 40).');
  if(ar.derm) notes.push(`${hasDerm()?'Troll skin':''}${hasDerm()&&gearLevel('body:Dermal Plating')?' and ':''}${gearLevel('body:Dermal Plating')?'Dermal plating':''} add${hasDerm()&&gearLevel('body:Dermal Plating')?'':'s'} to Body for damage resistance, not to armor.`);
  if(ar.poolPenalty) notes.push(`This armor cuts Combat Pool by ${ar.poolPenalty} (core p. 84${booksOn().fof?'; FoF p. 54':''}).`);
  return `<div class="b2h"><h3>Wearing</h3><span class="b2wtot"><b>${ar.b} / ${ar.i}</b><small>Ballistic / Impact</small></span></div>
   <div class="b2wearsel">${bodySel}${helmSel}${shSel}${fgChk}</div>${camoHTML(ar)}
   ${parts?`<div class="b2wparts">${parts}<span class="b2wop" aria-hidden="true">=</span><span class="b2wp b2wp-tot"><span>Total</span><b>${ar.b}/${ar.i}</b></span></div>`:''}
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
function karmaHTML(R,key){if(!R) return ''; const next=(R.kc||0)+1; return `<div class="b2karma"><span class="b2k">Karma Pool, rolled by hand</span><div class="b2row"><button class="ghost" data-b2a="${key}" ${B.karma>=next?'':'disabled'}>Reroll my failures: −${next} Karma Pool</button>${R.kc?`<div class="b2step"><button class="ghost" data-b2s="${key}x" data-d="-1" aria-label="Fewer successes from rerolls">−</button><b>+${R.kx||0}</b><button class="ghost" data-b2s="${key}x" data-d="1" aria-label="More successes from rerolls">+</button></div><small>successes from ${R.kc} reroll${R.kc>1?'s':''}</small>`:''}</div><small>Pick up the dice that failed, roll them for real and add what hits. Each reroll on the same test costs 1 more (core p. 191). Karma Pool left: ${B.karma}. <button class="ghost" data-b2a="kref">New scene: refresh it</button></small></div>`;}
function visCol(){const r=baseRace(); return r==='Troll'||r==='Dwarf'?4:r==='Elf'||r==='Ork'?3:2;}
function visName(){return ['','','normal vision','natural low-light','natural thermographic'][visCol()];}
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
        dmg:(gc&&gc.C.dmg)||strDmg(dmg,str),mode:String(mode||''),bands:RANGES[rt]||['','','',''],aim:gc?gc.C.aim:0,aimTxt:gc?(gc.C.aimTxt||[]).filter(x=>!/pick the shooter/.test(x)).join(', '):'',rc:gc?(gc.C.rc||0):0,gid:fg?fg.gid:null,cap:fs?fs.cap:null,note:sk+' · '+(it.pg||'')});}});
  if(isMagician()){const mp=bestRating(/^sorcery/i)+powerFoci();
    S.powers.forEach((p,i)=>{const sp=spellFind(p.name); if(!sp||sp.cat!=='Combat') return;
      out.push({id:'sp'+i,grp:'spell',kind:'spell',n:p.name+' (Force '+(+p.cost||1)+')',maxF:+p.cost||1,sp,dice:null,skill:mp,pool:mp,note:(sp.pg||'')+' · '+(sp.ty==='M'?'mana: target resists with Willpower':'physical: target resists with Body')});});
    S.powers.forEach((p,i)=>{const sp=spellFind(p.name); if(!sp||sp.cat==='Combat') return; const du=spellDur(p.name);
      out.push({id:'sc'+i,grp:'cast',kind:'cast',n:p.name+' (Force '+(+p.cost||1)+')',maxF:+p.cost||1,sp,dur:du,dice:null,skill:mp,pool:mp,note:(sp.pg||'')+' · '+sp.cat+' · '+(DURN[du]||'')});});}
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
    if(!/^prog2?:Attack/.test(g.key||'')) return; const v2=/^prog2:/.test(g.key);
    out.push({id:'m'+i,grp:'matrix',kind:'matrix',n:GEARDB[g.key].n+' '+r+(g.loaded||v2?'':' (not loaded)'),rating:r,v2,gi:i,loaded:!!g.loaded||v2,hp:chipNoPool(/^computer/i)?0:(mx.pool||0),skill:r,dmg:v2?'VR2: '+((/-([LMSD])$/.exec(GEARDB[g.key].n)||[])[1]||'?')+' damage, VR2 rules':'1 box per extra success',
      note:v2?'Virtual Realities 2.0 has its own Matrix combat rules (VR2 p. 98 on): the GM sets dice and target number here.':'Only while jacked in. A target resists; extra successes over theirs (and the node’s Security Code) are boxes; 10 crash it (core p. 179).'});});}
  return out;
}
// spirit table, core p. 144 (F = Force); hermetics call elementals, shamans call nature spirits (core p. 140-144)
const SPIRITS={
 earth:{n:'Earth elemental',dice:F=>Math.max(1,F-2),dsrc:F=>'its Reaction (F−2 = '+Math.max(1,F-2)+') as the skill',dmg:F=>F+'S',reach:1,note:F=>'Attacks as Unarmed Combat, +1 reach. Engulf, Manifestation, Movement (core p. 144).'},
 fire:{n:'Fire elemental',dice:F=>F+1,dsrc:F=>'its Reaction (F+1 = '+(F+1)+') as the skill',dmg:F=>F+'M',ranged:1,note:F=>'Attacks as Ranged Combat, range Force × 2 = '+(F*2)+' m. Also Engulf, Flame Aura, Flame Projection, Guard (core p. 144).'},
 water:{n:'Water elemental',dice:F=>F,dsrc:F=>'its Force ('+F+') as the skill',dmg:F=>F+'S Stun',note:F=>'Attacks as Unarmed Combat for Stun. Engulf, Manifestation, Movement (core p. 144).'},
 air:{n:'Air elemental',note:F=>'Attacks through its powers: Engulf, Noxious Breath, Psychokinesis (core p. 144). The GM sets the dice.'},
 nature:{n:'Nature spirit',note:F=>'Works through its powers (Accident, Concealment, Confusion, Fear, Guard and so on by kind, core p. 144). The GM sets the dice.'}};
const GRP={on:'Carried',off:'Not on you: stashed or in a vehicle',base:'Basic attacks',spell:'Combat spells',cast:'Other spells (cast them here)',spirit:'Spirits',drone:'Drones and vehicles',matrix:'Matrix (while jacked in)'};
// ---------- Game night ----------
function nightHTML(){
  const T=sheetStats(), ar=T.ar, w=T.wmod.m, A=attacks(); if(!A.find(a=>a.id===B.wid)){const by=(B.widBy||{})[S.id]; B.wid=(by&&A.find(a=>a.id===by)?by:(A.find(a=>a.grp==='on'&&a.id!=='unarmed')||A.find(a=>a.id!=='unarmed')||A[0]).id);} const W=A.find(a=>a.id===B.wid);
  const bodyR=augAttr('body')+hasDerm(), isMag=isMagician(), poolName=W.kind==='spell'?'Magic Pool':'Combat Pool';
  if(B._for!==S.id){B._for=S.id; B.inim=''; B.pool=T.cpool; B.poolMax=T.cpool; B.karma=T.kpool; B.mpool=null; B.hpool=null; B.hpMax=null; B.roll=null; B.gh.roll=null; B.ini=null; B.conjRes=''; B.spNote='';} // each runner has their own pools
  if(B.poolMax!==T.cpool){B.poolMax=T.cpool; B.pool=T.cpool;} if(B.karma==null) B.karma=T.kpool;
  const mpMax=isMag?bestRating(/^sorcery/i)+powerFoci():0; if(B.mpool==null||B.mpMax!==mpMax){B.mpMax=mpMax;B.mpool=mpMax;}
  const big=[['Body',String(augAttr('body')),hasDerm()?'+1 dermal: '+bodyR+' to resist':bodyR+' dice to resist'],['Armor',ar.b+' / '+ar.i,'Ballistic / Impact worn'],['Reaction',String(T.reaction),''],['Initiative',`${T.reaction-w} + ${T.dice}D6`,w?'wounds −'+w:''],
    ['Combat Pool',`${B.pool} / ${T.cpool}`,'refreshes each action'],['Karma Pool',`${B.karma} / ${T.kpool}`,''],...(S.magic!=='none'?[['Magic',String(magicNow()),'Essence '+(6-essenceUsed()).toFixed(2).replace(/\.?0+$/,'')]]:[]),...(isMag?[['Magic Pool',`${B.mpool} / ${mpMax}`,'']]:[]),['Wounds',w?'+'+w:'0','to every target number'],...(isMag&&susN()?[['Sustaining',susN()+' spell'+(susN()>1?'s':''),'+'+susPen()+' to every target number']]:[])];
  const tile=([k,v,sub])=>`<div class="b2t"><span class="b2k">${E(k)}</span><b class="b2v${k==='Wounds'&&w?' b2warn':''}">${E(v)}</b><span class="b2s">${E(sub)}</span></div>`;
  // condition monitor
  const dkI=typeof deckInfo==='function'?deckInfo():null; const B10=natBody(); const boxes=(k,n,ov)=>Array.from({length:n},(_,j)=>{const v=ov?11+j:j+1, on=v<=S[k]; const lv={1:'L',3:'M',6:'S',10:'D'}[v]||'';
    return `<button class="b2box${on?' on':''}${ov?' ov':''}${lv?' mk':''}" data-b2trk="${k}" data-v="${v}" aria-pressed="${on}" aria-label="${k==='phys'?'Physical':'Stun'} box ${v}${ov?' (overflow)':''}">${ov?'':lv}</button>`;}).join('');
  const cond=S.phys>10+B10?'Dead':S.phys>10?`Dying: overflow ${S.phys-10} of ${B10}`:S.phys>=10||S.stun>=10?'Unconscious':w?`Wound modifier +${w}`:'Unhurt';
  // attack
  const groups=['on','base','spell','cast','spirit','drone','matrix','off'].map(gk=>{const L=A.filter(a=>a.grp===gk); return L.length?`<optgroup label="${E(GRP[gk])}">${L.map(a=>`<option value="${a.id}" ${a.id===B.wid?'selected':''}>${E(a.n)}</option>`).join('')}</optgroup>`:'';}).join('');
  const rows=[]; let tn=4, ctl='', dmg=W.dmg, dmgNote='', rounds=0, dice=0, dSrc='', pmax=0, maxSp=0, spellF=0;
  const sel=(id,lab,opts,val,extra)=>`<label class="b2f"><span class="b2k">${E(lab)}</span><select data-b2="${id}"${extra||''}>${opts.map(([v,t])=>`<option value="${E(v)}" ${String(v)===String(val)?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  const vc=visCol();
  if(W.kind==='gun'){
    const M=W.mode; const modes=[]; if(/SS|SA/.test(M)||!/BF|FA/.test(M)) modes.push(['s1','Single shot',1]); if(/SA/.test(M)) modes.push(['s2','Second shot this action',1]); if(/BF/.test(M)) modes.push(['b1','Burst (3 rounds)',3],['b2','Second burst this action',3]); if(/FA/.test(M)) [3,4,5,6,7,8,9,10].forEach(n=>modes.push(['f'+n,`Full-auto burst, ${n} rounds`,n]));
    if(!modes.find(m=>m[0]===B.mode)) B.mode=modes[0][0]; const md=modes.find(m=>m[0]===B.mode); rounds=md[2];
    ctl+=sel('mode','Firing',modes.map(m=>[m[0],m[1]]),B.mode);
    ctl+=sel('rng','Range',W.bands.map((b,j)=>[j,['Short','Medium','Long','Extreme'][j]+' '+b+' m']),B.rng);
    tn=[4,5,6,9][B.rng]; rows.push(['Range',W.bands[B.rng]+' m · core p. 88',String(tn)]);
    if(W.aim){rows.push(['Gun add-ons',W.aimTxt||'smartgun, laser · core p. 89–90',SIGN(W.aim)]); tn+=W.aim;}
    let rec=0, why='';
    if(B.mode==='s2'){rec=1;why='second shot +1';} else if(B.mode==='b1'){rec=3;why='burst +3';} else if(B.mode==='b2'){rec=6;why='second burst, +6 in all';} else if(B.mode[0]==='f'){rec=B.fired+rounds;why=`+1 per round this phase (${B.fired} before + ${rounds})`;}
    if(rec){const net=Math.max(0,rec-W.rc); rows.push(['Recoil',why+(W.rc?', compensation −'+W.rc:'')+' · core p. 91',SIGN(net)]); tn+=net;}
    if(B.mode==='b1'||B.mode==='b2'){dmg=bump(pow(W.dmg,3),1); dmgNote='burst: +3 Power, +1 level (core p. 92)';}
    if(B.mode[0]==='f'){dmg=bump(pow(W.dmg,rounds),Math.floor(rounds/3)); dmgNote=`full auto: +${rounds} Power, +${Math.floor(rounds/3)} level (core p. 92–93); Complex Action`;}
    SITS.forEach(([id,lab,opts])=>{ctl+=sel('sit:'+id,lab,opts.map(o=>[o[0],o[1]+(o[2]?' ('+SIGN(o[2])+')':'')]),B.sit[id]||opts[0][0]); const o=opts.find(x=>x[0]===B.sit[id]); if(o&&o!==opts[0]){rows.push([o[1],lab.toLowerCase()+' · core p. 89',SIGN(o[2])]); tn+=o[2];}});
    ctl+=step('aim','Take Aim actions (max '+Math.floor((W.skill||0)/2)+')',B.aim||0);
    if(B.aim){rows.push(['Aimed shot',B.aim+' Simple Action'+(B.aim>1?'s':'')+' · core p. 82',SIGN(-B.aim)]); tn-=B.aim;}
    if(W.gid){const at=(S.ammoT||{})[W.gid]; if(at){const types=amTypes(W.gid); ctl+=`<div class="b2f b2wide"><span class="b2k">Loaded</span><div class="b2am"><b>${at.in.n}${W.cap!=null?'/'+W.cap:''}</b> ${E(at.in.n?AMSHORT(at.in.t):'empty')}${at.clips.length?' · spare clips '+at.clips.map(c=>c.n).join(', '):''}
        ${types.length?`<select data-b2="amsel" aria-label="Ammo to load">${types.map(t=>`<option value="${E(t)}" ${t===at.sel?'selected':''}>${E(AMSHORT(t))} (${amPool(W.gid,t)} left)</option>`).join('')}</select><button class="ghost" data-b2a="load">Load</button>`:''}${at.clips.some(c=>c.n>0)?'<button class="ghost" data-b2a="swap">Change clip</button>':''}</div></div>`;
        if(at.in.n<rounds) dmgNote=(dmgNote?dmgNote+' · ':'')+'not enough rounds loaded';}}
  } else if(W.kind==='melee'){
    tn=4; rows.push(['Melee','opposed: the defender rolls too · core p. 100','4']);
    const vo=VIS.find(v=>v[0]===B.sit.vis);
    MSITS.forEach(([id,lab,opts])=>{ctl+=sel('msit:'+id,id==='reach'?lab+' (yours: '+W.reach+')':lab,opts.map(o=>{const v=id==='reach'?o[2]-W.reach:o[2]; return [o[0],o[1]+(v?' ('+SIGN(v)+')':'')];}),B.msit[id]||opts[0][0]);
      const o=opts.find(x=>x[0]===(B.msit[id]||opts[0][0])); if(id==='reach'){const v=o[2]-W.reach; if(v){rows.push(['Reach '+W.reach+' vs '+o[2],'core p. 101',SIGN(v)]); tn+=v;} return;} if(o!==opts[0]){rows.push([lab+': '+o[1].toLowerCase(),'core p. 101',SIGN(o[2])]); tn+=o[2];}});
    if(W.dice==null){ctl+=step('dfd','Defaulting dice (GM)',B.dfd||4); ctl+=step('tnb','Base target number (GM)',B.tnBase);}
  } else if(W.kind==='drone'){
    const M=W.mode; const modes=[]; if(/SS|SA/.test(M)||!/BF|FA/.test(M)) modes.push(['s1','Single shot',1]); if(/SA/.test(M)) modes.push(['s2','Second shot this phase',1]); if(/BF/.test(M)) modes.push(['b1','Burst (3 rounds)',3],['b2','Second burst this phase',3]); if(/FA/.test(M)) [3,4,5,6,7,8,9,10].forEach(n=>modes.push(['f'+n,`Full-auto burst, ${n} rounds`,n]));
    if(!modes.find(m=>m[0]===B.mode)) B.mode=modes[0][0]; const md=modes.find(m=>m[0]===B.mode); rounds=md[2];
    const mnt=B.mount||W.mount, auto=B.dmode==='auto';
    ctl+=sel('dmode','Who’s shooting',[['rig','You, rigged in: Gunnery'],['auto','The drone on its own: Pilot']],auto?'auto':'rig');
    ctl+=sel('mode','Firing',modes.map(m=>[m[0],m[1]]),B.mode);
    ctl+=sel('mount','Mount',[['fixed','Fixed mount or turret: recoil halved'],['ring','Ring mount: −6 recoil'],['pintle','Pintle mount: −2 recoil'],['none','No vehicle mount']],mnt);
    const vt=B.dtgt!=='p'; ctl+=sel('dtgt','Target',[['v','A vehicle or drone: sensor-enhanced gunnery'],['p','A person: ordinary ranged combat']],vt?'v':'p');
    if(vt){ctl+=step('tnb','Target’s Signature (GM)',B.tnBase); tn=B.tnBase; rows.push(['Target’s Signature','sensor-enhanced gunnery · R2 p. 58',String(tn)]);
    ctl+=sel('urb','Where',[['n','Not urban',0],['u','Urban: industrial or built-up (+2)',2]],B.urb||'n'); if(B.urb==='u'){rows.push(['Urban environment','R2 p. 58','+2']); tn+=2;}
    ctl+=sel('los','Line of sight',[['i','Interrupted (0)'],['d','Direct and clear (−3)']],B.los||'i'); if(B.los==='d'){rows.push(['Direct line of sight','R2 p. 58','−3']); tn-=3;}}
    else {ctl+=sel('rng','Range (GM, from the weapon’s range table)',[0,1,2,3].map(j=>[j,['Short','Medium','Long','Extreme'][j]]),B.rng); tn=[4,5,6,9][B.rng]; rows.push(['Range','core p. 88; sensor-enhanced gunnery is for vehicle targets (R2 p. 58)',String(tn)]);
      SITS.forEach(([id,lab,opts])=>{if(id==='two'||id==='me') return; ctl+=sel('sit:'+id,lab,opts.map(o=>[o[0],o[1]+(o[2]?' ('+SIGN(o[2])+')':'')]),B.sit[id]||opts[0][0]); const o=opts.find(x=>x[0]===B.sit[id]); if(o&&o!==opts[0]){rows.push([o[1],lab.toLowerCase()+' · core p. 89',SIGN(o[2])]); tn+=o[2];}});}
    let rec=0, why=''; if(B.mode==='s2'){rec=1;why='second shot +1';} else if(B.mode==='b1'){rec=3;why='burst +3';} else if(B.mode==='b2'){rec=6;why='second burst, +6 in all';} else if(B.mode[0]==='f'){rec=B.fired+rounds;why=`+1 per round this phase (${B.fired} before + ${rounds})`;}
    if(rec){const net=mnt==='fixed'?Math.floor(rec/2):mnt==='ring'?Math.max(0,rec-6):mnt==='pintle'?Math.max(0,rec-2):rec; rows.push(['Recoil',why+(mnt==='fixed'?', halved on the mount':mnt==='ring'?', ring −6':mnt==='pintle'?', pintle −2':'')+' · R2 p. 58',SIGN(net)]); tn+=net;}
    if(B.mode==='b1'||B.mode==='b2'){dmg=bump(pow(W.dmg,3),1); dmgNote='burst: +3 Power, +1 level (core p. 92)';}
    if(B.mode[0]==='f'){dmg=bump(pow(W.dmg,rounds),Math.floor(rounds/3)); dmgNote=`full auto: +${rounds} Power, +${Math.floor(rounds/3)} level (core p. 92–93)`;}
    dmgNote=(dmgNote?dmgNote+' · ':'')+'lock on first with a Sensor Test (R2 p. 28, 58); track belts by hand'+(W.hasR2?'':' · Sensor isn’t listed for this vehicle, so it counts as 0');
  } else if(W.kind==='matrix'){
    ctl+=step('tnb','Target number: the node’s System Rating (IC) or the decker’s Bod (GM)',B.tnBase); tn=B.tnBase; rows.push(['System Rating or Bod','core p. 179',String(tn)]);
    if(!W.v2){ctl+=sel('sec','Node’s Security Code (GM): successes to beat',[[0,'None (GM says no code)'],[1,'Blue: 1 success'],[2,'Green: 2 successes'],[3,'Orange: 3 successes'],[4,'Red: 4 successes']],Math.min(4,B.sec||0));} else ctl+=step('dfd','Dice (GM, VR2 rules)',B.dfd||4);
    dmgNote=W.v2?W.note:'successes beyond the target’s'+(B.sec?' and the '+SECN[Math.min(4,B.sec)]+' Security Code ('+Math.min(4,B.sec)+')':'')+' are boxes on its monitor (core p. 179)';
  } else if(W.kind==='util'){
    ctl+=step('tnb','Node’s System Rating (GM): the target number',B.tnBase); tn=B.tnBase; rows.push(['Node’s System Rating','core p. 174',String(tn)]);
    ctl+=sel('sec','Node’s Security Code (GM): successes to beat',[[0,'None (GM says no code)'],[1,'Blue: 1 success'],[2,'Green: 2 successes'],[3,'Orange: 3 successes'],[4,'Red: 4 successes']],Math.min(4,B.sec||0));
    const dk=typeof deckInfo==='function'?deckInfo():null; const ev=dk&&dk.persona?dk.persona.Evasion:0; B._ev=ev;
    dmgNote=`The System Rating is the target number; the Security Code color is how many extra successes you need (core p. 165). The node rolls ${tn} dice against your Evasion ${ev}; the utility runs if you get more successes than it does${B.sec?`, with at least ${Math.min(4,B.sec)} past its total for the ${SECN[Math.min(4,B.sec)]} code`:''} (core p. 165, 174).`;
  } else if(W.kind==='cast'){
    spellF=Math.max(1,Math.min(B.force||W.maxF,W.maxF)); B.force=spellF; ctl+=step('force','Force (up to '+W.maxF+')',spellF);
    ctl+=step('tnb','Target number (GM): the spell’s “Target” line',B.tnBase); tn=B.tnBase; rows.push(['Spell’s target number',W.sp.pg||'core p. 150–158',String(tn)]);
    dmg=DURN[W.dur]||'—'; dmgNote=(W.dur==='S'?'Sustained: add it under Sustaining when it works. ':'')+(W.sp.cat==='Health'?'Health spells: successes count against the spell’s target; a magician’s own tests get no Magic Pool help from others. ':'')+'Effects follow the spell’s description in the book.';
  } else if(W.kind==='spirit'){
    if(W.ranged){ctl+=step('tnb','Base target number (GM)',B.tnBase); tn=B.tnBase; rows.push(['Base target number','Ranged Combat, range '+(W.f*2)+' m · core p. 144',String(tn)]);}
    else {tn=4; rows.push(['Melee','opposed: the defender rolls too · core p. 100','4']);}
    if(W.dice==null) ctl+=step('dfd','Dice (GM)',B.dfd||4);
    dmgNote=W.note;
  } else if(W.kind==='spell'){
    spellF=Math.max(1,Math.min(B.force||W.maxF,W.maxF)); B.force=spellF; ctl+=step('force','Force (up to '+W.maxF+')',spellF);
    ctl+=step('tnb',`Target’s ${W.sp.ty==='M'?'Willpower':'Body'} (GM)`,B.tnBase); tn=B.tnBase; rows.push([`Target’s ${W.sp.ty==='M'?'Willpower':'Body'}`,'combat spell · core p. 129',String(tn)]);
    ctl+=sel('dmglv','Spell’s damage level',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],B.dmgLv); dmg=B.dmgLv+' · Force '+spellF; dmgNote='target resists against the Force; armor doesn’t help (core p. 129, 149)';
  }
  // visibility (all but Matrix): the column for this runner's eyes
  if(!['drone','matrix','util','cast'].includes(W.kind)){ctl+=sel('sit:vis','Light and air ('+visName()+')',VIS.map(v=>[v[0],v[1]+(v[vc]?' ('+SIGN(v[vc])+')':'')]),B.sit.vis||'n'); const v=VIS.find(x=>x[0]===B.sit.vis); if(v&&v[0]!=='n'){rows.push([v[1],visName()+' · core p. 89',SIGN(v[vc])]); tn+=v[vc];}}
  ctl+=step('gm','GM modifier',B.gm?SIGN(B.gm):'0'); if(B.gm){rows.push(['GM modifier','anything the tables don’t cover',SIGN(B.gm)]); tn+=B.gm;}
  if(w&&W.kind!=='spirit'&&!(W.kind==='drone'&&B.dmode==='auto')){rows.push(['Wounds','core p. 112','+'+w]); tn+=w;}
  {const sp=susPen(); if(sp&&W.kind!=='spirit'&&!(W.kind==='drone'&&B.dmode==='auto')){rows.push(['Sustaining '+susN()+' spell'+(susN()>1?'s':''),'+2 each · core p. 128',SIGN(sp)]); tn+=sp;}}
  if(W.kind==='melee'&&W.dice==null) tn+=B.tnBase-4;
  tn=Math.max(2,tn);
  // dice
  const aimLock=W.kind==='gun'&&(B.aim||0)>=2;
  if(W.kind==='spell'){maxSp=B.mpool; const sp=Math.min(B.spend,maxSp); dice=spellF+sp; dSrc='Force '+spellF+(sp?' + '+sp+' Magic Pool':'');}
  else if(W.kind==='matrix'||W.kind==='util'){if(B.hpool==null||B.hpMax!==W.hp){B.hpMax=W.hp;B.hpool=W.hp;} maxSp=W.v2?0:Math.min(B.hpool,W.rating); const sp=Math.min(B.spend,maxSp); dice=(W.v2?(B.dfd||4):W.rating)+sp; dSrc=(W.v2?'GM-set (VR2 rules)':(W.kind==='util'?'program rating ':'Attack rating ')+W.rating)+(sp?' + '+sp+' Hacking Pool':'');}
  else if(W.kind==='cast'){maxSp=B.mpool; const sp=Math.min(B.spend,maxSp); dice=spellF+sp; dSrc='Force '+spellF+(sp?' + '+sp+' Magic Pool':'');}
  else if(W.kind==='spirit'){maxSp=0; dice=W.dice==null?(B.dfd||4):W.dice; dSrc=W.diceSrc;}
  else if(W.kind==='drone'){const auto=B.dmode==='auto', h=B.dtgt==='p'?0:Math.floor(W.sen/2); maxSp=auto||W.gunChip?0:Math.min(B.pool,W.gun||0); const sp=Math.min(B.spend,maxSp); dice=(auto?W.pil:W.gun)+h+sp; dSrc=(auto?'Pilot '+W.pil:'Gunnery '+(W.gunChip?'chip ':'')+W.gun+(W.gunChip?' (ActiveSoft: no Combat Pool, core p. 248)':''))+(B.dtgt==='p'?'':' + half Sensor ('+h+')')+(sp?' + '+sp+' Combat Pool':'');}
  else {maxSp=aimLock?0:Math.min(B.pool,W.skill||0); const sp=Math.min(B.spend,maxSp); dice=(W.dice==null?(B.dfd||4):W.dice)+sp; dSrc=(W.dice==null?'defaulting, GM-set':W.diceSrc)+(sp?' + '+sp+' Combat Pool':'');}
  const spend=Math.min(B.spend,maxSp);
  if((W.kind==='matrix'||W.kind==='util')&&!W.v2) ctl+=step('spend','Hacking Pool ('+B.hpool+' left, up to the rating '+W.rating+')',spend);
  else if(W.kind!=='spirit'&&W.kind!=='matrix'&&W.kind!=='util'&&!(W.kind==='drone'&&B.dmode==='auto')) ctl+=step('spend',(W.kind==='cast'?'Magic Pool':poolName)+' ('+(W.kind==='spell'||W.kind==='cast'?B.mpool:B.pool)+' left'+(W.kind!=='spell'&&W.kind!=='cast'?', max '+maxSp+' on this attack':'')+')',spend);
  const notLoaded=(W.kind==='matrix'||W.kind==='util')&&!W.loaded;
  if(aimLock) rows.push(['No Combat Pool dice','aiming over more than one Combat Phase · core p. 82','—']);
  const rowsHTML=rows.map(([k,s,v],j)=>`<div class="b2r${j%2?' alt':''}"><span>${E(k)} <small>${E(s)}</small></span><b class="${/^\+[1-9]/.test(v)?'b2warn':/^−/.test(v)?'b2ok':''}">${E(v)}</b></div>`).join('')+`<div class="b2r tot"><span>Target number</span><b>${tn}</b></div>`;
  let drain='';
  if(W.kind==='spell'||W.kind==='cast'){const sp=W.sp, dt=Math.max(2,Math.floor(spellF/2)+(sp.m||0))+susPen(), dl=sp.lv, phys=spellF>magicNow(); drain=`<div class="b2drain"><b>Drain</b> ${E(drainText(sp,spellF))}${susPen()?' (target number '+dt+' with sustaining)':''}${phys?' Physical (Force over Magic)':' Stun'} · resist with Willpower ${attrNow('wil')} plus Magic Pool held back; every 2 successes drop it a level (core p. 129). <button class="ghost" data-b2a="drain">Roll Drain</button> <span aria-live="polite">${E(B.drainRes||'')}</span></div>`;}
  const rolled=B.roll?B.roll.r.map((v,j)=>`<span class="b2die${v>=B.roll.tn?' hit':''}${j>=B.roll.r.length-B.roll.pool?' pool':''}">${v}</span>`).join(''):'';
  const succ=B.roll?B.roll.r.filter(v=>v>=B.roll.tn).length+(B.roll.kx||0):0;
  let res=B.warn?B.warn:B.spNote&&B.roll&&W.kind==='spirit'?(B.roll.r.filter(v=>v>=B.roll.tn).length+' successes vs TN '+B.roll.tn+' · '+B.spNote):!B.roll?'Sixes roll again and add (Rule of Six, core p. 32).':B.roll.r.every(v=>v===1)&&!B.roll.kx?'All ones: Rule of One (core p. 32).':`${succ} success${succ===1?'':'es'} vs TN ${B.roll.tn}${B.roll.kx?' (with '+B.roll.kx+' from Karma rerolls)':''}`;
  let nodeFail=false; if(B.roll&&B.roll.node){const N=B.roll.node, sc=N.sec||0, runs=succ>N.k&&succ-N.k>=sc; nodeFail=!runs; res+=` · the node rolled ${N.r.join(' ')} → ${N.k} vs your Evasion ${N.ev}. You need more than ${N.k}${sc?`, with at least ${sc} past it for the ${SECN[sc]} code (${N.k+Math.max(sc,1)} in all)`:''}: `+(runs?'the utility runs.':'it doesn’t run.');}
  B._cur={W,tn,dice,dSrc,dmg,rounds,spend,rows,spellF}; // used by the buttons
  // got hit
  const G=B.gh, spellHit=G.kind==='mana'||G.kind==='phys', mxHit=G.kind==='icp', blackHit=G.kind==='black', derm=hasDerm()||gearLevel('body:Dermal Plating');
  const armV=G.kind==='ball'?ar.b:G.kind==='imp'||G.kind==='gel'?ar.i:G.kind==='flech'?Math.max(2*ar.i,ar.b):G.kind==='apds'?Math.floor(ar.b/2):0;
  const armWhy=G.kind==='ball'?'Ballistic '+ar.b:G.kind==='imp'?'Impact '+ar.i:G.kind==='gel'?'Impact '+ar.i+' (gel)':G.kind==='flech'?`higher of double Impact (${2*ar.i}) or Ballistic (${ar.b})`:G.kind==='apds'?`Ballistic ${ar.b} halved, rounded down (GM call)`:'armor doesn’t help against spells';
  const hard=dkI?(+dkI.h||0):0;
  const gPow=G.kind==='gel'?G.pow-2:G.pow, gTn=mxHit?G.pow:blackHit?Math.max(2,G.pow-hard):(spellHit?G.pow:Math.max(2,gPow-armV))+susPen();
  let gLv=G.lvl; if(G.kind==='flech'&&G.fl&&derm) gLv=L4[Math.max(0,L4.indexOf(G.lvl)-1)];
  const mpcp=dkI?(+dkI.mpcp||0):0; if(mxHit&&(B.hpool==null)){const mx=typeof matrixInfo==='function'?matrixInfo():null; B.hpMax=mx&&!chipNoPool(/^computer/i)?mx.pool:0; B.hpool=B.hpMax;}
  const gBase=mxHit?mpcp:(G.kind==='mana'||(blackHit&&G.stun))?attrNow('wil'):blackHit?natBody():bodyR, gSp=mxHit?Math.min(G.spend,B.hpool||0):spellHit?(isMag?Math.min(G.spend,B.mpool):0):blackHit?0:Math.min(G.spend,B.pool);
  const gPoolName=mxHit?'Hacking Pool':spellHit?'Magic Pool (spell defense)':'Combat Pool';
  let gRes=''; if(G.roll){const R=G.roll,k=R.r.filter(x=>x>=R.tn).length+(R.kx||0),pk=R.r.slice(R.r.length-R.pool).filter(x=>x>=R.tn).length; R.boxes=null; R.final=null;
    if(G.att===0){gRes=R.kind==='mana'||R.kind==='phys'?'The caster had no successes: the spell has no effect (core p. 131).':'The attacker had no successes: it misses, no damage (core p. 90–91).';}
    else if(R.kind==='icp'){const n=Math.max(0,G.att-k); R.boxes=n; R.mx=true; gRes=`${k} success${k===1?'':'es'} vs ${G.att}: `+(n?`${n} box${n>1?'es':''} on your persona (10 crash the deck and dump you, core p. 179).`:'your persona shrugs it off.');}
    else if(R.kind==='black'){const n=Math.floor(Math.max(0,G.att-k)/2); R.boxes=n; gRes=`${k} success${k===1?'':'es'} vs the IC’s ${G.att}: `+(n?`${n} Light wound${n>1?'s':''} (${n} box${n>1?'es':''} ${R.stun?'Stun':'Physical'}; core p. 171).`:'no damage.');}
    else if((R.kind==='mana'||R.kind==='phys')&&k>G.att) gRes=`${k} successes vs the caster’s ${G.att}: you win, the spell doesn’t affect you (core p. 131).`;
    else if(R.pool&&pk>G.att&&!(R.kind==='mana'||R.kind==='phys')) gRes=`${k} successes; Combat Pool alone beat the attacker’s ${G.att}: a complete miss (core p. 91).`;
    else {const d=k-G.att, idx=L4.indexOf(R.lvl)+(d<0?Math.floor(-d/2):-Math.floor(d/2)); R.final=idx<0?null:L4[Math.min(3,idx)]; gRes=`${k} success${k===1?'':'es'} vs the attacker’s ${G.att}: `+(R.final?`takes ${R.final} ${R.stun?'Stun':'Physical'} (${BOXES[R.final]} box${BOXES[R.final]>1?'es':''}).`:'no damage.');}}
  B._gh={gTn,gBase,gSp,gLv,armV,gPow,spellHit};
  const ghRolled=G.roll?G.roll.r.map((v,j)=>`<span class="b2die${v>=G.roll.tn?' hit':''}${j>=G.roll.r.length-G.roll.pool?' pool':''}">${v}</span>`).join(''):'';
  // skills
  const skl=[]; S.skills.filter(x=>x.name).forEach(x=>skillPartsNow(x).forEach(p=>{if(p.r) skl.push([p.label,p.r,p.chip]);}));
  chipsOn().forEach(([g])=>{const n=chipSkill(g); if(n&&!skl.some(x=>chipEq(x[0],n))) skl.push([n,+g.r||0,true]);});
  Object.entries(advSkills()).forEach(([n,r])=>skl.push([n,r]));
  const ia=adeptOn()?S.powers.filter(p=>p.type==='improvedAbility'):[];
  // powers and spells
  let pw='';
  if(S.magic==='adept') pw=S.powers.map(p=>{const c=powerCost(p); const P=allPowers()[p.type||'custom']||POWERS.custom; return `<details class="b2card"><summary><b>${E(p.type==='custom'?p.name:P.label)}</b><small>${c.cost} PP${P.pg?' · '+E(P.pg):''}</small></summary><p>${E(c.desc||'')}</p></details>`;}).join('');
  else if(isMag) pw=S.powers.map(p=>{const sp=spellFind(p.name); return `<details class="b2card"><summary><b>${E(p.name)}</b><small>Force ${+p.cost||1}${sp?' · '+E(sp.cat)+' · '+(sp.ty==='M'?'mana':'physical')+(sp.pg?' · '+E(sp.pg):''):''}</small></summary><p>${sp?'Drain '+E(drainText(sp,+p.cost||1)):''}${p.note?' · '+E(p.note):''}</p></details>`;}).join('');
  const copyBox=B.copy?`<div class="b2copy"><label for="b2r20" class="b2k">${E(B.copy.msg)}</label><input id="b2r20" readonly value="${E(B.copy.text)}"></div>`:'';
  return `${gmHitsHTML()}<div class="b2big">${big.map(tile).join('')}</div>
  <div class="b2grid b2ngrid">
   <section class="b2pan"><div class="b2h"><h3>Initiative</h3><span class="mono">${iniNow(T).r} + ${iniNow(T).d}D6${w?' − '+w:''}</span></div>
     ${iniModes(T).length?`<label class="b2f b2inim"><span class="b2k">Where</span><select data-b2="inim"><option value="" ${!B.inim?'selected':''}>Physical world: ${T.reaction} + ${T.dice}D6</option>${iniModes(T).map(m=>`<option value="${m.id}" ${B.inim===m.id?'selected':''}>Matrix, ${E(m.l.charAt(0).toLowerCase()+m.l.slice(1))}: ${m.r} + ${m.d}D6</option>`).join('')}</select></label>`:''}
     <div class="b2ini"><b>${B.ini==null?'—':Math.max(0,B.ini-w)}</b><span>${B.ini==null?'Roll to see your passes':'Acts on '+(()=>{const o=[];for(let x=Math.max(0,B.ini-w);x>0;x-=10)o.push(x);return o.join(', ')||'—';})()}</span></div>
     <div class="b2row"><button data-b2a="ini">Roll Initiative</button><button class="ghost" data-b2a="cini">Copy for Roll20</button></div><p class="note">Each pass is 10 lower; wounds come off the total (core p. 78).${iniNow(T).m?` In the Matrix, wired reflexes, magic and a VCR add nothing (core p. 178)${iniNow(T).m.id==='kb'?'; keyboard only halves Reaction, rounded down here, and keeps the response-increase dice':''}. Talking with the physical world by voice or screen costs 1D6 of Matrix Initiative under VR2 (p. 120).`:''}</p></section>
   <section class="b2pan"><div class="b2h"><h3>Condition</h3><span class="${w||S.phys>10?'b2warn':'b2ok'}">${E(cond)}</span></div>
     <span class="b2k">Physical</span><div class="b2boxes">${boxes('phys',10)}<span class="b2ovl">overflow</span>${boxes('phys',B10,true)}</div>
     <span class="b2k">Stun</span><div class="b2boxes">${boxes('stun',10)}</div>
     ${S.phys>10&&S.phys<=10+B10?`<div class="b2dying"><b>Bleeding out.</b> One more box every 10 minutes until someone stabilizes you; past ${10+B10} boxes you’re dead (core p. 111). To stabilize (core p. 115): First Aid, a Biotech test at the Deadly target number (10, “special”) within the first hour, then your own natural Body test against 10 if it fails; a trauma patch gives another natural Body test against 4 + dermal armor. A Heal or Treat spell or a DocWagon crew also works. Karma Pool can reroll your own Body tests.</div>`:''}
     ${dkI&&!dkI.vr2?`<span class="b2k">Persona (Matrix)</span><div class="b2boxes">${Array.from({length:10},(_,j)=>{const v=j+1,on=v<=(S.mxDmg||0); return `<button class="b2box${on?' on':''}" data-b2trk="mxDmg" data-v="${v}" aria-pressed="${on}" aria-label="Persona box ${v}"></button>`;}).join('')}</div>${(S.mxDmg||0)>=10?'<p class="note b2warn">Crashed: the deck dumps you (dump shock, core p. 165, 179). It’s back to full when restarted.</p>':''}`:''}${T.wmod.pain?`<p class="note">Pain Resistance ${T.wmod.pain} is already taken off the wound modifier.</p>`:''}</section>
   ${wearPanelHTML()}
   <section class="b2pan b2full"><div class="b2h"><h3>Attack</h3><span class="note">weapon, mode, ammo and modifiers in one place; rolling or copying spends rounds and pool dice</span></div>
     <label class="b2f b2wide"><span class="b2k">Attack with</span><select data-b2="wid" class="b2wsel">${groups}</select></label>
     ${W.grp==='off'?'<p class="note b2warn">This one isn’t on you: move it to your carried gear in Stash before you can use it.</p>':''}
     <div class="b2ctl">${ctl}<div class="b2f"><span class="b2k">&nbsp;</span><button class="ghost" data-b2a="clear">Clear modifiers</button></div></div>
     <div class="b2two"><div class="b2rows">${rowsHTML}</div>
      <div class="b2res"><div class="b2nums"><div><span class="b2k">Dice</span><b>${dice}</b><small>${E(dSrc)}</small></div><div><span class="b2k">Target number</span><b class="b2warn">${tn}</b></div><div><span class="b2k">Damage</span><b>${E(dmg)}</b><small>${E(dmgNote||W.note||'')}</small></div></div>
       <div class="b2row"><button data-b2a="roll" ${W.grp==='off'||notLoaded?'disabled':''}>Roll ${dice} dice${rounds?' · '+rounds+' round'+(rounds>1?'s':''):''}</button><button class="ghost" data-b2a="copy" ${W.grp==='off'?'disabled':''}>Copy for Roll20</button><button class="ghost" data-b2a="newact">New action: refresh pools</button>${(W.kind==='gun'||W.kind==='drone')&&/FA|BF|SA/.test(W.mode)?'<button class="ghost" data-b2a="newphase">New Combat Phase</button>':''}</div>
       ${notLoaded?`<p class="note b2warn">This program isn’t in active memory. Load it first (a Simple Action to start; big programs take longer, core p. 173–174). <button class="ghost" data-b2a="mload">Load it</button></p>`:''}
       <div class="b2dice" aria-live="polite">${rolled}</div><b class="${nodeFail?'b2warn':succ?'b2ok':''}">${E(res)}</b>${karmaHTML(B.roll,'karma')}${drain}</div></div>${copyBox}</section>
   <section class="b2pan"><div class="b2h"><h3>Got hit</h3><span class="note">armor follows what you wear</span></div>
     <div class="b2ctl">${sel('gh:kind','What hit you',Object.entries(HITS),G.kind)}${step('gh:pow',spellHit?'Spell Force':mxHit?'Node’s System Rating':blackHit?'IC Rating':'Incoming Power',G.pow)}${mxHit||blackHit?'':sel('gh:lvl','Damage level',[['L','Light'],['M','Moderate'],['S','Serious'],['D','Deadly']],G.lvl)}${step('gh:att',spellHit?'Caster’s successes':mxHit||blackHit?'IC’s successes':'Attacker’s successes',G.att)}${G.kind==='gel'||mxHit?'':sel('gh:dt','Damage',[['p','Physical'],['s','Stun (Stun spells, stun weapons, pulled blows)']],G.stun?'s':'p')}${(spellHit&&!isMag)||blackHit?'':step('gh:spend',gPoolName+' ('+(mxHit?(B.hpool||0):spellHit?B.mpool:B.pool)+' left)',gSp)}
     ${G.kind==='flech'&&derm?`<label class="b2f b2wide b2chk"><input type="checkbox" data-b2c="gh:fl" ${G.fl?'checked':''}> The code already has flechette’s extra level (an “(f)” code)</label>`:''}</div>
     <div class="b2rows"><div class="b2r"><span>${spellHit?'Spell Force':'Power'+(G.kind==='gel'?' ('+G.pow+' − 2 for gel)':'')}</span><b>${spellHit?G.pow:gPow}</b></div><div class="b2r alt"><span>Armor: ${E(armWhy)}</span><b>${spellHit?'—':'−'+armV}</b></div>${susPen()?`<div class="b2r"><span>Sustaining ${susN()} spell${susN()>1?'s':''} <small>core p. 128</small></span><b class="b2warn">+${susPen()}</b></div>`:''}<div class="b2r tot"><span>Target number${mxHit?' (the node’s System Rating)':blackHit?' (IC Rating'+(hard?' − Hardening '+hard:'')+')':spellHit?'':' (never below 2 before sustaining)'}</span><b>${gTn}</b></div></div>${mxHit?'<p class="note">Resist with your MPCP plus Hacking Pool (core p. 179). Damage goes on the persona monitor below.</p>':blackHit?'<p class="note">Hanging tough: Body (Willpower for Stun) against the IC Rating; hardening counts as armor; every 2 extra IC successes is a Light wound (core p. 171). Jacking out is a Willpower test against the IC Rating.</p>':''}
     <div class="b2nums"><div><span class="b2k">Dice</span><b>${gBase+gSp}</b><small>${mxHit?'MPCP '+gBase:G.kind==='mana'||(blackHit&&G.stun)?'Willpower '+gBase:blackHit?'natural Body '+gBase:'Body '+bodyR+(hasDerm()?' with dermal armor':'')}${gSp?' + '+gSp+' '+gPoolName:''}</small></div><div><span class="b2k">If successes tie</span><b>${gLv}${G.kind==='gel'?' Stun':''}</b><small>${G.kind==='flech'&&G.fl&&derm?'dermal armor cancels flechette’s extra level (core p. 93)':G.kind==='gel'?'gel: Power −2, Stun (core p. 95)':G.kind==='apds'?'core p. 277':'core p. 91'}</small></div></div>
     <div class="b2row"><button data-b2a="ghroll">Roll ${gBase+gSp} dice</button><button class="ghost" data-b2a="ghcopy">Copy for Roll20</button><button class="ghost" data-b2a="ghmark" ${G.roll&&(G.roll.final||G.roll.boxes)?'':'disabled'}>Mark it on the monitor</button></div>
     <div class="b2dice" aria-live="polite">${ghRolled}</div><b>${E(gRes||'Pool dice have an outline: if they alone beat the attacker, it’s a complete miss.')}</b>${G.roll&&G.att?karmaHTML(G.roll,'ghk'):''}</section>
   ${chipsHTML()}
   <section class="b2pan"><div class="b2h"><h3>Skill checks</h3>${step('sk:tn','Target number',B.sk.tn)}</div>
     <div class="b2skills">${skl.map(([n,r,ch])=>{const x=ch?0:ia.filter(p=>n===p.skill||n.startsWith(p.skill)).reduce((a,p)=>a+(+p.n||0),0); return `<div class="b2r${ch?' b2chipped':''}"><span>${E(n)}${ch?' <span class="b2tag">chip</span>':''}</span><b>${r}${x?'+'+x:''}</b><span class="b2row"><button class="ghost" data-b2k="${E(n)}" data-d="${r+x}">Roll</button><button class="ghost" data-b2k="${E(n)}" data-d="${r+x}" data-copy="1" aria-label="Copy ${E(n)} for Roll20">Roll20</button></span></div>`;}).join('')||'<p class="note">No skills.</p>'}</div>
     ${(()=>{if(typeof SKILLWEB==='undefined'||typeof swOptions!=='function') return ''; const have=swHave(); const L=SKILLWEB.SKILLS.filter(n=>!have[n]); if(!L.length) return ''; const tgt=L.includes(B.dft)?B.dft:L[0]; const o=swOptions(tgt,B.sk.tn)[0];
       return `<div class="b2ctl b2dft"><label class="b2f"><span class="b2k">Default on a skill you don’t have</span><select data-b2="dft">${L.map(n=>`<option value="${E(n)}" ${n===tgt?'selected':''}>${E(swLabel(n))}</option>`).join('')}</select></label>${o?`<div class="b2f"><span class="b2k">Best route (Skill Web, core p. 66–69)</span><span>${E(o.from)}${o.kind==='attr'?' (attribute)':''}: ${o.dice} dice, TN +${o.tn}</span></div><div class="b2f"><span class="b2k">&nbsp;</span><button class="ghost" data-b2a="dfroll">Roll it</button></div>`:'<p class="note">No route: the GM decides.</p>'}</div>`;})()}
     ${(()=>{const L=(S.contacts||[]).filter(c=>c&&c.name); if(!L.length) return ''; const C=L[Math.min(L.length-1,+B.ctc||0)], st=ctStats(C), et=ctEtq(st,C), cur=C.cb==null?(st?st.id:''):C.cb;
       return `<div class="b2ctl b2cts"><label class="b2f"><span class="b2k">Ask a contact (legwork)</span><select data-b2="ctc">${L.map((c,i)=>`<option value="${i}" ${+B.ctc===i?'selected':''}>${E(c.name)}${c.role?' · '+E(c.role):''}${c.level&&c.level!=='Contact'?' ('+E(c.level)+')':''}</option>`).join('')}</select></label>
       <label class="b2f"><span class="b2k">Their numbers</span><select data-b2="ctb"><option value="" ${cur===''?'selected':''}>Not set: the GM rolls for them</option><option value="own" ${cur==='own'?'selected':''}>Type their numbers</option>${CTBOOK.map(b=>`<option value="${b[0]}" ${cur===b[0]?'selected':''}>Like the book’s ${E(b[1])} (core ${b[2]})</option>`).join('')}</select></label>
       ${cur==='own'?`<label class="b2f"><span class="b2k">Etiquette</span><input type="number" min="0" max="12" data-b2ct="ce" value="${+C.ce||0}" style="width:4.5em"></label><label class="b2f"><span class="b2k">Charisma</span><input type="number" min="0" max="12" data-b2ct="cc" value="${+C.cc||0}" style="width:4.5em"></label><label class="b2f"><span class="b2k">Intelligence</span><input type="number" min="0" max="12" data-b2ct="ci" value="${+C.ci||0}" style="width:4.5em"></label>`:''}
       ${st&&st.et.length>1?`<label class="b2f"><span class="b2k">Their Etiquette</span><select data-b2="cte">${st.et.map((x,i)=>`<option value="${i}" ${x===st.et.find(y=>y===et.l)||x[0]===et.l?'selected':''}>${E(x[0])} ${x[1]}</option>`).join('')}</select></label>`:''}</div>
       <div class="b2ctl"><button class="ghost" data-b2a="ctroll">You ask: your Etiquette</button>${st?`<button class="ghost" data-b2a="ctchk">They check around: ${E(et.l)} ${et.r}${et.def?' (+4)':''}, TN +2</button>`:''}</div>
       <p class="note">${st?`${E(C.name)} rolls as ${E(st.n)}${st.guess?' (matched from the role; change it above)':''}: Charisma ${st.cha}, Intelligence ${st.int}. `:''}Your Etiquette roll is how well you ask; the GM sets the target number from the information table. A baseline fee is their Etiquette × your successes × (their Charisma + Intelligence) × 10¥, then Negotiation (core p. 202). “Check around” is the contact’s own Etiquette Test at +2; any success and they report back in 2D6 hours (core p. 202). Buddies help more readily than Contacts.</p>`;})()}
     <p class="note" aria-live="polite">${E(B.sk.res||'Wound modifiers'+(susPen()?' and the +'+susPen()+' for sustaining':'')+' are added to the target number for you.')}</p></section>
   ${vehHTML()}
   ${isMag?susHTML():''}
   ${isMag?spiritsHTML():''}
   ${pw?`<section class="b2pan"><div class="b2h"><h3>${S.magic==='adept'?'Adept powers':'Spells'}</h3></div>${pw}</section>`:''}
  </div>`;
}
function spiritsHTML(){const L=S.spirits||[], herm=S.magic==='hermetic'; const t=B.spt||(herm?'earth':'nature');
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  return `<section class="b2pan"><div class="b2h"><h3>Spirits</h3><span class="note">${herm?'hermetics call elementals':'shamans call nature spirits'} (core p. 140–144)</span></div>
   ${L.map((x,i)=>`<div class="b2r"><span><b>${E(SPIRITS[x.t]?SPIRITS[x.t].n:x.t)}</b> <small>Force ${x.f}${x.on?' · called '+E(x.on):''}${x.t==='nature'?' · leaves at the next sunrise or sunset (core p. 139)':''}</small></span><span class="b2step"><small>services</small><button class="ghost" data-b2sv="${i}|-1" aria-label="One service used">−</button><b>${+x.sv||0}</b><button class="ghost" data-b2sv="${i}|1" aria-label="One more service">+</button><button class="ghost" data-b2sprm="${i}" aria-label="Release this spirit">Release</button></span></div>`).join('')||'<p class="note">None called. Add one to attack with it from the Attack panel.</p>'}
   <div class="b2ctl"><label class="b2f"><span class="b2k">Kind</span><select data-b2="spt">${[['earth','Earth elemental'],['fire','Fire elemental'],['water','Water elemental'],['air','Air elemental'],['nature','Nature spirit']].map(([v,l])=>`<option value="${v}" ${t===v?'selected':''}>${l}</option>`).join('')}</select></label>${step('spf','Force',B.spf||3)}<div class="b2f"><span class="b2k">&nbsp;</span><button data-b2a="conjure">Conjure (roll)</button></div></div>
   <p class="note" aria-live="polite">${E(B.conjRes||`Conjuring ${bestRating(/^conjuring/i)} dice against the Force; each success is a service, none means no spirit. Then Drain: Charisma ${attrNow('cha')} dice against the Force (core p. 139–140). No Magic Pool.`)}</p>
   <details class="b2more"><summary>Rolled it at the table instead</summary><div class="b2ctl">${step('spsv','Services owed',B.spsv==null?1:B.spsv)}<div class="b2f"><span class="b2k">&nbsp;</span><button data-b2a="spadd">Add spirit</button></div></div></details></section>`;}
// vehicle tests (core p. 106-107): Position Test and Crash Test, with Control Pool for riggers
const VSKILLS=/^(Car|Bike|Hovercraft|Motorboat|Rotor Craft|Sailboat|Vectored Thrust|Winged Plane|Ship|Walker|LTA|Submarine)/i;
function vehHTML(){const V=S.gear.filter(g=>isVehG(g)&&GEARDB[g.key]); if(!V.length) return '';
  const vi=Math.min(B.vveh||0,V.length-1), v=V[vi], R=typeof R2OBJ!=='undefined'?R2OBJ[v.key]:null, rr=R?R.r:{}; const hand=parseInt(String(rr.H||'').split('/')[0],10)||4, cruise=parseInt(String(rr.Sp||'').split('/')[0],10)||0;
  const sk=[]; S.skills.filter(x=>x.name&&VSKILLS.test(x.name)).forEach(x=>skillPartsNow(x).forEach(p=>{if(p.r) sk.push([p.label,p.r,p.chip]);})); chipsOn().forEach(([g])=>{const n=chipSkill(g), v=chipInfo(g); if(n&&(VSKILLS.test(v.sk)||VSKILLS.test(n))&&!sk.some(x=>chipEq(x[0],n))) sk.push([n,+g.r||0,true]);}); const ski=Math.min(B.vsk||0,Math.max(0,sk.length-1)); const skill=sk[ski]||['no vehicle skill: defaulting (GM)',0];
  const vcr=gearLevel('body:Vehicle Control Rig'), cp=vcr?Math.floor((attrNow('quick')+attrNow('int'))/2)+2*vcr:0; if(B.cpool==null||B.cpMax!==cp){B.cpMax=cp;B.cpool=cp;}
  const kind=B.vtest||'pos', ter=B.vter||'n'; const POS={o:0,n:1,r:2,t:4}, CR={o:-1,n:0,t:2,r:4}; const tm=(kind==='pos'?POS:CR)[ter];
  const tn=Math.max(2,hand+tm+woundMods().m+susPen()); const vChip=!!skill[2]&&chipNoPool(VSKILLS), sp=vChip?0:Math.min(B.vsp||0,B.cpool), dice=skill[1]+sp;
  const sel=(id,lab,opts,val)=>`<label class="b2f"><span class="b2k">${E(lab)}</span><select data-b2="${id}">${opts.map(([o,t])=>`<option value="${E(o)}" ${String(o)===String(val)?'selected':''}>${E(t)}</option>`).join('')}</select></label>`;
  const step=(id,lab,val)=>`<div class="b2f"><span class="b2k">${E(lab)}</span><div class="b2step"><button class="ghost" data-b2s="${id}" data-d="-1" aria-label="Lower ${E(lab)}">−</button><b>${E(val)}</b><button class="ghost" data-b2s="${id}" data-d="1" aria-label="Raise ${E(lab)}">+</button></div></div>`;
  return `<section class="b2pan"><div class="b2h"><h3>Vehicle tests</h3><span class="note">chases and crashes, core p. 106–107</span></div>
   <div class="b2ctl">${sel('vveh','Vehicle',V.map((g,j)=>[j,vehName(g)]),vi)}${sel('vsk','Skill',sk.length?sk.map((x,j)=>[j,x[0]+' '+x[1]]):[[0,'none']],ski)}
   ${sel('vtest','Test',[['pos','Position Test (each turn of a chase)'],['crash','Crash Test (Serious damage, no driver action, a ram)']],kind)}
   ${sel('vter','Terrain',[['o','Open'],['n','Normal'],['r','Restricted'],['t','Tight']],ter)}${cp&&!vChip?step('vsp','Control Pool ('+B.cpool+' left)',sp):cp?'<span class="note">Vehicle ActiveSoft: no Control Pool (core p. 248)</span>':''}</div>
   <div class="b2rows"><div class="b2r"><span>Handling</span><b>${hand}</b></div><div class="b2r alt"><span>Terrain</span><b>${SIGN(tm)}</b></div>${woundMods().m?`<div class="b2r"><span>Wounds</span><b class="b2warn">+${woundMods().m}</b></div>`:''}<div class="b2r tot"><span>Target number</span><b>${tn}</b></div></div>
   <div class="b2row"><button data-b2a="vroll">Roll ${dice} dice</button><button class="ghost" data-b2a="vref">New turn: refresh Control Pool</button></div>
   <p class="note" aria-live="polite">${E(B.vRes||(kind==='pos'?`Each success moves you ${cruise||'cruising speed'} m and every 2 give each passenger an attack; keep the count for the Escape Test (core p. 106–107).`:`Fail and you crash: Power ${Math.floor(cruise/10)} (cruising speed ÷ 10), damage by speed (core p. 107).`))}</p></section>`;}
// sustaining spells: +2 to every target number of the magician's own tests, per spell; at most Sorcery spells at once (core p. 128, 129)
const susN=()=>isMagician()?(S.sus||[]).length:0;
const susPen=()=>2*susN();
function susHTML(){const L=S.sus||[], max=bestRating(/^sorcery/i), names=S.powers.filter(p=>p&&p.name&&spellDur(p.name)==='S').map(p=>[p.name,+p.cost||1]);
  return `<section class="b2pan"><div class="b2h"><h3>Sustaining</h3><span class="${L.length?'b2warn':'note'}">${L.length?'+'+2*L.length+' to every target number':'nothing sustained'}</span></div>
   <p class="note">Each spell you keep going adds +2 to all your other tests, Drain and damage resistance included, until you drop it (a Free Action, core p. 81, 128). You can hold up to your Sorcery skill (${max}) at once.</p>
   ${L.map((x,i)=>`<div class="b2r"><span><b>${E(x.n)}</b> <small>Force ${x.f}${x.on?' · on '+E(x.on):''}</small></span><button class="ghost" data-b2sus="${i}">Drop it</button></div>`).join('')}
   ${names.length?`<div class="b2ctl"><label class="b2f"><span class="b2k">Spell you’re sustaining</span><select data-b2="susp">${names.map(([n,f])=>`<option value="${E(n)}" ${B.susp===n?'selected':''}>${E(n)} (Force ${f})</option>`).join('')}</select></label><label class="b2f"><span class="b2k">On whom</span><input data-b2in="suson" value="${E(B.suson||'')}" placeholder="Yourself, or who"></label><div class="b2f"><span class="b2k">&nbsp;</span><button data-b2a="susadd" ${L.length>=max?'disabled':''}>Sustain it</button></div></div>`:'<p class="note">No Sustained spells on the sheet: Instant and Permanent spells can’t be sustained (core p. 128).</p>'}
   ${L.some(x=>x.on&&x.on.trim()&&!/^(me|myself|yourself|self)$/i.test(x.on.trim()))?'<p class="note">Spells on other runners change their numbers too (an Increase Reflexes die, Armor points): they track that on their own sheet.</p>':''}
   ${L.length>=max&&max?'<p class="note b2warn">That’s your limit: drop one before sustaining another.</p>':''}</section>`;}
function rollN(n){const r=[];for(let i=0;i<n;i++) r.push(d6x()); return r;}
function copyOut(text,msg){let ok=false; try{if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>{},()=>{}); ok=true;}}catch(e){}
  B.copy={text,msg:ok?msg+': copied. Paste it into the Roll20 chat.':msg+': select this and copy it.'};}
function who(){return S.handle||S.name||'Runner';}
function act(a){const C=B._cur, W=C&&C.W; B.warn='';
  if(a==='ini'){const T=sheetStats(), I=iniNow(T); B.ini=I.r+Array.from({length:I.d},d6p).reduce((x,y)=>x+y,0);}
  else if(a==='cini'){const T=sheetStats(), I=iniNow(T); copyOut(`&{template:default} {{name=${who()}: ${I.m?'Matrix ':''}Initiative}} {{Initiative=[[${I.r-T.wmod.m}+${I.d}d6]]}}`,'Initiative');}
  else if(a==='roll'||a==='copy'){
    if(W.kind==='gun'&&W.gid){const at=(S.ammoT||{})[W.gid]; if(at){if(at.in.n<C.rounds){B.warn='Not enough rounds loaded: load or change the clip first.'; return redraw();} ammoAct(W.gid,'fire',C.rounds);}}
    if(W.kind==='gun'||W.kind==='drone') B.fired+=C.rounds;
    if(W.kind==='spell') B.mpool-=C.spend; else if(W.kind==='matrix') B.hpool-=C.spend; else B.pool-=C.spend; B.spend=0;
    if(a==='roll'){B.roll={r:rollN(C.dice),tn:C.tn,pool:C.spend,kc:0,kx:0}; B.copy=null;
      if(W.kind==='util'){const nr=rollN(B.tnBase), ev=B._ev||0; B.roll.node={r:nr,k:nr.filter(x=>x>=Math.max(2,ev)).length,ev,sec:Math.min(4,B.sec||0)};}
      if(W.kind==='spirit'){const x=(S.spirits||[])[+W.id.slice(1)]; if(x){x.sv=Math.max(0,(+x.sv||0)-1); if(!x.sv) B.warn=null; B.spNote=x.sv?`${x.sv} service${x.sv>1?'s':''} left.`:'That was its last service: it leaves (core p. 140).'; if(!x.sv) S.spirits.splice(+W.id.slice(1),1); render(); return;}}}
    else {const why=C.rows.map(r=>r[0].toLowerCase()+' '+r[2]).join(', '); let t=`&{template:default} {{name=${who()}: ${W.n}}} {{Dice=${C.dice} (${C.dSrc})}} {{Target number=${C.tn} (${why})}} {{Successes=${r20(C.dice,C.tn)}}} {{Damage=${C.dmg}}}`;
      if((W.kind==='util'||(W.kind==='matrix'&&!W.v2))&&B.sec){const sc=Math.min(4,B.sec); t+=` {{Security Code=${SECN[sc]}: needs ${sc} more success${sc>1?'es':''} than ${W.kind==='util'?'the node rolls':'the target rolls'} (core p. ${W.kind==='util'?174:179})}}`;} else if(W.kind==='util') t+=` {{Needs=more successes than the node rolls (core p. 174)}}`;
      if(W.kind==='gun'&&W.gid){const at=S.ammoT[W.gid]; t+=` {{Rounds=${C.rounds} fired, ${at.in.n} left}}`;}
      if(W.kind==='spell'){const dt=Math.max(2,Math.floor(C.spellF/2)+(W.sp.m||0))+susPen(); t+=` {{Drain=${r20(attrNow('wil')+B.mpool,dt)} vs ${drainText(W.sp,C.spellF)}${C.spellF>magicNow()?' Physical':' Stun'}}}`;}
      copyOut(t,'Attack'); B.roll=null;}
    if(W.kind==='gun'&&W.gid){render(); return;}}
  else if(a==='karma'||a==='ghk'){const R=a==='karma'?B.roll:B.gh.roll; if(R){const c=(R.kc||0)+1; if(B.karma>=c){B.karma-=c; R.kc=c;}}}
  else if(a==='vroll'||a==='vref'){if(a==='vref'){B.cpool=B.cpMax; B.vRes=''; return redraw();} const V=S.gear.filter(g=>isVehG(g)&&GEARDB[g.key]); const v=V[Math.min(B.vveh||0,V.length-1)]; if(!v) return; const R=typeof R2OBJ!=='undefined'?R2OBJ[v.key]:null, rr=R?R.r:{}; const hand=parseInt(String(rr.H||'').split('/')[0],10)||4, cruise=parseInt(String(rr.Sp||'').split('/')[0],10)||0;
    const sk=[]; S.skills.filter(x=>x.name&&VSKILLS.test(x.name)).forEach(x=>skillPartsNow(x).forEach(p=>{if(p.r) sk.push([p.label,p.r,p.chip]);})); chipsOn().forEach(([g])=>{const n=chipSkill(g), v=chipInfo(g); if(n&&(VSKILLS.test(v.sk)||VSKILLS.test(n))&&!sk.some(x=>chipEq(x[0],n))) sk.push([n,+g.r||0,true]);}); const skill=sk[Math.min(B.vsk||0,Math.max(0,sk.length-1))]||['',0];
    const kind=B.vtest||'pos', ter=B.vter||'n', tm=(kind==='pos'?{o:0,n:1,r:2,t:4}:{o:-1,n:0,t:2,r:4})[ter], tn=Math.max(2,hand+tm+woundMods().m+susPen()); const sp=skill[2]&&chipNoPool(VSKILLS)?0:Math.min(B.vsp||0,B.cpool||0); B.cpool=(B.cpool||0)-sp; B.vsp=0;
    const r=rollN(skill[1]+sp), k=r.filter(x=>x>=tn).length; const imp=cruise>200?'D':cruise>60?'S':cruise>20?'M':'L';
    B.vRes=kind==='pos'?`${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn}: ${k*cruise} m, ${Math.floor(k/2)} attack${Math.floor(k/2)===1?'':'s'} per passenger. Note ${k} for the Escape Test.`:`${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn}: `+(k?'no crash.':`crash: ${Math.floor(cruise/10)}${imp} to the vehicle (Body + half armor resists; passengers take what gets through, Impact armor only, core p. 107).`);}
  else if(a==='dfroll'){const have=swHave(); const L=SKILLWEB.SKILLS.filter(n=>!have[n]); const tgt=L.includes(B.dft)?B.dft:L[0]; const o=tgt?swOptions(tgt,B.sk.tn)[0]:null; if(o){const tn=B.sk.tn+o.tn+woundMods().m+susPen(), r=rollN(o.dice), k=r.filter(x=>x>=tn).length; B.sk.res=`${swLabel(tgt)} by defaulting to ${o.from}: ${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn} (base ${B.sk.tn} + ${o.tn} for the route${woundMods().m?' + wounds':''}${susPen()?' + sustaining':''}).`;}}
  else if(a==='ctroll'){const C=(S.contacts||[]).filter(c=>c&&c.name)[+B.ctc||0]; const parts=partsNamed('Etiquette'); const best=parts.reduce((m,p)=>p.r>m.r?p:m,{r:0,label:'Etiquette'}); let dice=best.r, how=best.label+(best.chip?' chip':'')+' '+best.r; if(!dice){const o=typeof swOptions==='function'?swOptions('Etiquette',B.sk.tn)[0]:null; if(o){dice=o.dice; how='defaulting to '+o.from;} else {dice=attrNow('cha'); how='Charisma';}}
    const tn=B.sk.tn+woundMods().m+susPen(), r=rollN(dice), k=r.filter(x=>x>=tn).length; const st=ctStats(C), et=ctEtq(st,C||{}); B.sk.res=`Asking ${C?C.name:'a contact'} (${how}): ${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn}.${k&&st&&et&&et.r?` Baseline fee: ${et.r} × ${k} × (${st.cha} + ${st.int}) × 10 = ${(et.r*k*(st.cha+st.int)*10).toLocaleString()}¥, before Negotiation (core p. 202).`:''} The GM decides what they know and what it costs.`;}
  else if(a==='ctchk'){const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)], st=ctStats(C), et=ctEtq(st,C||{}); if(!st) return; const tn=B.sk.tn+2+(et.def?4:0), r=rollN(et.r), k=r.filter(x=>x>=tn).length, h=d6p()+d6p();
    B.sk.res=`${C.name} checks around (${et.l} ${et.r}): ${r.join(' ')||'no dice'} → ${k} success${k===1?'':'es'} vs TN ${tn} (your TN ${B.sk.tn} + 2${et.def?' + 4 for defaulting':''}). ${k?`They get word back in ${h} hours (2D6), or when the GM says.`:'Nothing turns up this time.'} The cost is worked out as if they’d known it already (core p. 202).`;}
  else if(a==='kref'){B.karma=sheetStats().kpool;}
  else if(a==='mload'){const g=S.gear[W.gi]; if(g){const was=S.gear.map(x=>!!x.loaded); g.loaded=true; render(); const bumped=S.gear.some((x,j)=>x!==g&&was[j]&&!x.loaded);
    if(!g.loaded||bumped){S.gear.forEach((x,j)=>{x.loaded=was[j]||undefined;}); g.loaded=false; render(); B.warn='Not enough free active memory to load it: unload another program in the deck’s program list first (core p. 173).'; redraw();} return;}}
  else if(a==='conjure'){const F=B.spf||3, sk=bestRating(/^conjuring/i), w=woundMods().m, tn=F+w+susPen(), r=rollN(sk), k=r.filter(x=>x>=tn).length, cha=attrNow('cha');
    const lv0=F>2*cha?'D':F>cha?'S':F*2<cha?'L':'M', phys=F>cha, dr=rollN(cha), dk=dr.filter(x=>x>=F).length, di=L4.indexOf(lv0)-Math.floor(dk/2), dl=di<0?null:L4[di];
    const t=B.spt||(S.magic==='hermetic'?'earth':'nature'); const d=new Date(); const on=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(k) S.spirits=(S.spirits||[]).concat([{t,f:F,sv:k,on}]);
    B.conjRes=`Conjuring ${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn}: `+(k?`the ${SPIRITS[t].n.toLowerCase()} comes, owing ${k} service${k>1?'s':''}.`:'no spirit comes.')+` Drain (Charisma ${cha} vs ${F}, ${lv0} ${phys?'Physical':'Stun'}): ${dr.join(' ')} → ${dk}: `+(dl?`take ${dl} ${phys?'Physical':'Stun'} (mark it on the monitor).`:'no Drain.')+(dl==='D'?' Drain that knocks you out frees the spirit (core p. 139–140).':'');
    render(); return;}
  else if(a==='newact'){const T=sheetStats(); B.pool=T.cpool; B.mpool=B.mpMax; B.hpool=B.hpMax; B.roll=null;}
  else if(a==='newphase'){B.fired=0;}
  else if(a==='clear'){B.sit={};B.msit={};B.gm=0;B.aim=0;}
  else if(a==='load'||a==='swap'){if(W.gid){if(a==='load'&&B.amSel) S.ammoT[W.gid].sel=B.amSel; ammoAct(W.gid,a); render(); return;}}
  else if(a==='drain'){const sp=W.sp, F=C.spellF, dt=Math.max(2,Math.floor(F/2)+(sp.m||0))+susPen(), n=attrNow('wil')+B.mpool, r=rollN(n), k=r.filter(x=>x>=dt).length; const lv0=sp.lv==='W'||sp.lv==='X'?null:sp.lv;
    if(!lv0) B.drainRes=`${r.join(' ')} → ${k} successes vs TN ${dt}; the Drain level depends on the target (core p. 129).`; else {const idx=L4.indexOf(lv0)-Math.floor(k/2); B.drainRes=`${r.join(' ')} → ${k} success${k===1?'':'es'}: `+(idx<0?'no Drain.':`${L4[idx]} ${F>magicNow()?'Physical':'Stun'} Drain.`);}}
  else if(a==='ghroll'){const g=B._gh, k=B.gh.kind; B.gh.roll={r:rollN(g.gBase+g.gSp),pool:g.gSp,tn:g.gTn,lvl:g.gLv,stun:k==='gel'||(!!B.gh.stun&&k!=='icp'),kind:k,kc:0,kx:0}; if(k==='icp') B.hpool=Math.max(0,(B.hpool||0)-g.gSp); else if(k==='mana'||k==='phys') B.mpool=Math.max(0,B.mpool-g.gSp); else B.pool-=g.gSp; B.gh.spend=0;}
  else if(a==='ghcopy'){const g=B._gh; B.pool-=g.gSp; copyOut(`&{template:default} {{name=${who()} resists ${B.gh.pow}${B.gh.lvl}, ${HITS[B.gh.kind].toLowerCase()}}} {{Target number=${g.gTn}${g.spellHit?' (the Force)':' (Power '+g.gPow+' − armor '+g.armV+')'}}} {{Resist dice=${r20(g.gBase,g.gTn)}}}`+(g.gSp?` {{Combat Pool=${r20(g.gSp,g.gTn)}}}`:'')+` {{If successes tie=${g.gLv}${B.gh.kind==='gel'?' Stun':''}; every 2 more than the attacker drops a level}}`,'Damage resistance'); B.gh.spend=0;}
  else if(a==='ghmark'){const R=B.gh.roll; const n=R?(R.boxes!=null&&R.boxes!==undefined&&(R.mx||R.kind==='black')?R.boxes:R.final?BOXES[R.final]:0):0;
    if(R&&n){if(R.mx) S.mxDmg=Math.min(10,(S.mxDmg||0)+n); else if(R.stun){const tot=S.stun+n; S.stun=Math.min(10,tot); if(tot>10) S.phys=Math.min(10+natBody()+1,S.phys+(tot-10)); /* Stun past 10 carries into Physical, core p. 111 */} else S.phys=Math.min(10+natBody()+1,S.phys+n); B.gh.roll=null; render(); return;}}
  redraw();}
function stepper(id,d){
  if(id==='aim'){const W=B._cur.W; B.aim=Math.max(0,Math.min(Math.floor((W.skill||0)/2),(B.aim||0)+d));}
  else if(id==='sec'){B.sec=Math.max(0,Math.min(4,(B.sec||0)+d));}
  else if(id==='spf'){B.spf=Math.max(1,(B.spf||3)+d);} else if(id==='spsv'){B.spsv=Math.max(0,(B.spsv==null?1:B.spsv)+d);}
  else if(id==='gm') B.gm+=d; else if(id==='spend') B.spend=Math.max(0,B.spend+d); else if(id==='force') B.force=Math.max(1,(B.force||1)+d);
  else if(id==='tnb') B.tnBase=Math.max(2,B.tnBase+d); else if(id==='dfd') B.dfd=Math.max(1,(B.dfd||4)+d);
  else if(id==='gh:pow'){B.gh.pow=Math.max(1,B.gh.pow+d);B.gh.roll=null;} else if(id==='gh:att') B.gh.att=Math.max(0,B.gh.att+d); else if(id==='gh:spend') B.gh.spend=Math.max(0,B.gh.spend+d);
  else if(id==='sk:tn') B.sk.tn=Math.max(2,B.sk.tn+d);
  else if(id==='vsp'){B.vsp=Math.max(0,Math.min(B.cpool||0,(B.vsp||0)+d));}
  else if(id==='karmax'||id==='ghkx'){const R=id==='karmax'?B.roll:B.gh.roll; if(R){const fail=R.r.filter(x=>x<R.tn).length; R.kx=Math.max(0,Math.min(fail,(R.kx||0)+d));}}
  else if(id.startsWith('af:')){const k=id.slice(3), stepv={nin:1000,nout:1000}[k]||1; if(k.startsWith('u:')){const u=k.slice(2); B.af.use[u]=Math.max(0,(B.af.use[u]||0)+d);} else B.af[k]=Math.max(0,(B.af[k]==null?(k==='phys'?S.phys:k==='stun'?S.stun:0):B.af[k])+d*stepv); B.af.saved=''; return redrawAfter();}
  redraw();}
// ---------- After the session ----------
function snaps(){try{return JSON.parse(localStorage.getItem('sr2-b2-snaps-'+(S.id||'x'))||'[]');}catch(e){return [];}}
function consumables(){return S.gear.map((g,i)=>[g,i]).filter(([g])=>GEARDB[g.key]&&(g.cat==='med'||g.cat==='boom'||(/^ammo:.*(Ammo|Rounds)/.test(g.key))));}
function afterHTML(){const a=B.af, ny=S.nuyenNow===''||S.nuyenNow==null?0:+S.nuyenNow, ka=karmaAvail(), T=sheetStats();
  const ph=a.phys==null?S.phys:a.phys, st=a.stun==null?S.stun:a.stun;
  const field=(k,lab,help,v,unit)=>`<div class="b2af"><div><b>${E(lab)}</b><small>${E(help)}</small></div><div class="b2step"><button class="ghost" data-b2s="af:${k}" data-d="-1" aria-label="Less ${E(lab)}">−</button><input type="number" inputmode="numeric" data-b2n="af:${k}" value="${v}" aria-label="${E(lab)}"><button class="ghost" data-b2s="af:${k}" data-d="1" aria-label="More ${E(lab)}">+</button><span class="mono">${E(unit)}</span></div></div>`;
  const cons=consumables(); const left=([g])=>/^ammo:/.test(g.key)?(+g.qty||1)*10-(+g.used||0):(+g.qty||1);
  const diff=[['Good Karma available',ka,ka+a.gk],['Karma Pool',T.kpool,T.kpool+a.kp],['Nuyen on hand',fmt(ny)+'¥',fmt(ny+a.nin-a.nout)+'¥'],['Physical / Stun',S.phys+' / '+S.stun,ph+' / '+st],
    ...cons.filter(([g])=>a.use['c'+S.gear.indexOf(g)]).map(([g,i])=>[g.name||GEARDB[g.key].n,left([g,i]),left([g,i])-(a.use['c'+i]||0)])];
  const neg=ny+a.nin-a.nout<0, over=cons.some(([g,i])=>left([g,i])-(a.use['c'+i]||0)<0);
  const notes=[]; if(neg) notes.push(['bad','Nuyen would go below zero. Check the numbers.']); if(over) notes.push(['bad','More used up than the sheet shows. Saving sets those to zero.']);
  const sus=isMagician()?(S.sus||[]):[]; if(sus.length) diff.push(['Sustained spells',sus.map(x=>x.n).join(', '),a.keepSus?'kept':'dropped']); notes.push(['','After saving, spend any new Karma under Spend Good Karma in Build.']); // always shown, so the Save button doesn't move while someone is reaching for it
  notes.push(['',practicing()?'Practice session: this is undone when you end practice.':'This updates the real sheet. For a practice run, start a practice session at the top first.']);
  const sn=snaps();
  return `<div class="b2grid b2afgrid"><section class="b2pan b2afmain"><div class="b2h"><h3>What happened at the table</h3></div>
   ${field('gk','Good Karma earned','what the GM awarded (core p. 190–191)',a.gk,'K')}${field('kp','Added to the Karma Pool','if the GM gave a Karma Pool point',a.kp,'K')}
   ${field('nin','Nuyen in','pay, loot sold',a.nin,'¥')}${field('nout','Nuyen out','bribes, bills, gifts',a.nout,'¥')}
   <label class="b2f b2wide"><span class="b2k">Note for the nuyen log</span><input type="text" data-b2t="af:note" value="${E(a.note)}" placeholder="the run, who paid, what the GM ruled"></label>
   ${field('phys','Physical boxes still marked','carried to next session',ph,'box')}${field('stun','Stun boxes still marked','usually rested off',st,'box')}
   <div id="b2heal">${healHTML(S.phys,S.stun)}</div>
   ${cons.length?`<h4>Used up</h4>`+cons.map(([g,i])=>field('u:c'+i,(g.name||GEARDB[g.key].n),(/^ammo:/.test(g.key)?'rounds':'items')+' left: '+left([g,i]),a.use['c'+i]||0,/^ammo:/.test(g.key)?'rd':'ea')).join(''):''}
   <p class="note">Ammo in guns and clips is counted in the ammo tracker; here count rounds that came out of the boxes.</p></section>
  <section class="b2pan"><div class="b2h"><h3>What changes on the sheet</h3></div><div id="b2afd"><div class="b2rows">${diff.map(([k,x,y],j)=>`<div class="b2r${j%2?' alt':''}"><span>${E(k)}</span><span class="mono">${E(x)} → <b>${E(y)}</b></span></div>`).join('')}</div>
   ${notes.map(([c,t])=>`<p class="note ${c==='bad'?'b2bad':''}">${E(t)}</p>`).join('')}</div>
   ${sus.length?`<label class="b2f b2chk"><input type="checkbox" data-b2c="af:keepSus" ${a.keepSus?'checked':''}> Keep sustaining ${E(sus.map(x=>x.n).join(', '))} into the next session</label>`:''}
   <button data-b2a="afsave" ${neg?'disabled':''}>Save a snapshot and update the sheet</button><p class="note" role="status">${E(a.saved)}</p>
   <h4>Snapshots</h4>${sn.length?sn.map((x,j)=>`<div class="b2r"><span>${E(x.t)}</span><button class="ghost" data-b2snap="${j}">Restore</button></div>`).join(''):'<p class="note">None yet. Each save keeps the sheet as it was, so a session can be undone.</p>'}</section></div>`;}
function afSave(){const a=B.af; const sn=snaps(); const d=new Date(), ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  sn.unshift({t:ds+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' · before this update',s:JSON.stringify(S)}); try{localStorage.setItem('sr2-b2-snaps-'+(S.id||'x'),JSON.stringify(sn.slice(0,10)));}catch(e){}
  S.kEarned=(+S.kEarned||0)+a.gk; S.kPoolBonus=(+S.kPoolBonus||0)+a.kp;
  const ny=S.nuyenNow===''||S.nuyenNow==null?0:+S.nuyenNow; S.nyLog=S.nyLog||[];
  if(a.nin){S.nyLog.push({d:ds,amt:a.nin,note:a.note||'After the session'});} if(a.nout){S.nyLog.push({d:ds,amt:-a.nout,note:a.note||'After the session'});} if(a.nin||a.nout) S.nuyenNow=ny+a.nin-a.nout;
  if(a.phys!=null) S.phys=a.phys; if(a.stun!=null) S.stun=a.stun;
  consumables().forEach(([g,i])=>{const u=a.use['c'+i]||0; if(!u) return; if(/^ammo:/.test(g.key)) g.used=Math.min((+g.qty||1)*10,(+g.used||0)+u); else {g.qty=Math.max(0,(+g.qty||1)-u);}});
  if(!a.keepSus&&isMagician()) S.sus=[];
  S.gear=S.gear.filter(g=>!(GEARDB[g.key]&&(g.cat==='med'||g.cat==='boom')&&(+g.qty)<=0));
  B.af={gk:0,kp:0,nin:0,nout:0,note:'',phys:null,stun:null,use:{},keepSus:false,saved:'Saved. The sheet is updated and the old version is kept as a snapshot.'}; render();}

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
function redraw(){const n=$('b2night'); if(n&&B.tab==='night'){const f=document.activeElement, id=f&&f.dataset?(f.dataset.b2||f.dataset.b2s+'|'+f.dataset.d||f.dataset.b2a):null; n.innerHTML=nightHTML(); if(id){const q=n.querySelector(`[data-b2="${id}"]`)||n.querySelector(`[data-b2a="${id}"]`); if(q) q.focus();}}}
function afTotals(){const n=$('b2after'); if(!n||B.tab!=='after') return; const tmp=document.createElement('div'); tmp.innerHTML=afterHTML(); {const h1=n.querySelector('#b2heal'), h2=tmp.querySelector('#b2heal'); if(h1&&h2) h1.innerHTML=h2.innerHTML;} const a=n.querySelector('#b2afd'), b=tmp.querySelector('#b2afd'); if(a&&b) a.innerHTML=b.innerHTML; const s1=n.querySelector('[data-b2a="afsave"]'), s2=tmp.querySelector('[data-b2a="afsave"]'); if(s1&&s2) s1.disabled=s2.disabled; n.querySelectorAll('[data-b2n]').forEach(i=>{const j=tmp.querySelector(`[data-b2n="${i.dataset.b2n}"]`); if(j&&i!==document.activeElement) i.value=j.value;});}
function redrawAfter(){const n=$('b2after'); if(n&&B.tab==='after') n.innerHTML=afterHTML();}
function redrawStrip(){try{practiceBar();}catch(e){}
const s=$('b2strip'); if(s) s.innerHTML=stripHTML(); {const j=document.querySelector('.jump'); if(j) document.documentElement.style.setProperty('--jumpH',j.offsetHeight+'px');} {const wv=$('b2wearBuild'); if(wv&&B.tab==='build'&&!(document.activeElement&&wv.contains(document.activeElement)&&document.activeElement.tagName==='SELECT')){const h=wearHTML(); wv.hidden=!h; wv.innerHTML=h;}} const d=$('b2drawer'); if(d){d.hidden=!B.drawer||B.tab!=='build'; if(B.drawer) d.innerHTML=`<div class="b2h"><h3>Checklist</h3><button class="ghost" data-b2a="drawer">Close</button></div><ul class="issues">${$('issues').innerHTML}</ul>`;}}
function setTab(t){B.tab=t; keep(); document.body.classList.toggle('b2gn',t==='night'); document.body.classList.toggle('b2af',t==='after');
  if(typeof sessionSet==='function') sessionSet(t==='night',true);
  document.querySelectorAll('#b2tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===t)));
  if(t==='night') redraw(); if(t==='after') redrawAfter(); redrawStrip(); window.scrollTo(0,0);}
function mount(){
  const nav=$('jump'); if(!nav||$('b2tabs')) return;
  const tabs=document.createElement('div'); tabs.id='b2tabs'; tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Mode');
  tabs.innerHTML=[['build','Build'],['night','Game night'],['after','After the session']].map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${B.tab===k}">${l}</button>`).join('');
  nav.insertBefore(tabs,nav.firstChild);
  {const pb=document.createElement('button'); pb.id='b2pracBtn'; pb.type='button'; pb.className='ghost b2pracb'; pb.dataset.b2a='prac'; pb.textContent='Practice session'; tabs.after(pb);
   const bar=document.createElement('div'); bar.id='b2prac'; bar.className='b2pracbar'; bar.hidden=true; bar.setAttribute('role','status'); nav.after(bar);}
  window.addEventListener('storage',e=>{if(e.key===HITKEY&&B.tab==='night') redraw();});
  // on the public site, link the GM screen next to the Gear Locker link
  {const f=(location.pathname.split('/').pop()||'').toLowerCase(); if(/^https?:$/.test(location.protocol)&&!/claude/.test(location.hostname)&&/builder\.html$/.test(f)){const lt=$('lockerTop'); if(lt){const x=document.createElement('span'); x.className='note'; x.innerHTML=' · <a href="gm-screen.html" target="_blank" rel="noopener">GM screen ↗</a>'; lt.after(x);}}}
  const strip=document.createElement('div'); strip.id='b2strip'; strip.setAttribute('aria-label','Budget'); nav.after(strip);
  const drawer=document.createElement('div'); drawer.id='b2drawer'; drawer.hidden=true; strip.after(drawer);
  const lay=document.querySelector('.layout'); const night=document.createElement('section'); night.id='b2night'; night.className='b2wrap'; night.setAttribute('aria-label','Game night');
  const after=document.createElement('section'); after.id='b2after'; after.className='b2wrap'; after.setAttribute('aria-label','After the session'); lay.before(night); lay.before(after);
  document.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-b2a],[data-b2s],[data-b2trk],[data-b2k],[data-b2snap],[data-b2sv],[data-b2sprm],[data-b2sus]'); if(!t||!t.closest('#b2tabs,#b2night,#b2after,#b2strip,#b2drawer,#b2pracBtn,#b2prac')) return;
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
    if(t.dataset.b2a) return act(t.dataset.b2a);
    if(t.dataset.b2s) return stepper(t.dataset.b2s,+t.dataset.d);
    if(t.dataset.b2trk){const k=t.dataset.b2trk, v=+t.dataset.v; S[k]=(S[k]||0)===v?v-1:v; render(); return;}
    if(t.dataset.b2k){const n=+t.dataset.d, w=woundMods().m, sp=susPen(), tn=B.sk.tn+w+sp, nm=t.dataset.b2k;
      if(t.dataset.copy){copyOut(`&{template:default} {{name=${who()}: ${nm}}} {{Target number=${tn}${w||sp?' ('+[w?'wounds +'+w:'',sp?'sustaining +'+sp:''].filter(Boolean).join(', ')+')':''}}} {{Successes=${r20(n,tn)}}}`,nm);}
      else {const r=rollN(n), k=r.filter(x=>x>=tn).length; B.sk.res=`${nm}: ${r.join(' ')} → ${k} success${k===1?'':'es'} vs TN ${tn}${r.every(x=>x===1)?' (Rule of One)':''}`; B.copy=null;}
      return redraw();}
    if(t.dataset.b2snap!=null){const sn=snaps()[+t.dataset.b2snap]; if(sn&&confirm('Put the sheet back to “'+sn.t+'”? The current sheet becomes a snapshot first.')){const cur=JSON.stringify(S); const L=snaps(); L.unshift({t:'Before restoring '+sn.t,s:cur}); try{localStorage.setItem('sr2-b2-snaps-'+(S.id||'x'),JSON.stringify(L.slice(0,10)));}catch(e){} S=Object.assign(blank(),JSON.parse(sn.s)); render();}}});
  // After the session inputs: handled here first, so the page-wide change handler doesn't re-render and swallow the next click
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.closest||!t.closest('#b2after')) return; const n=t.dataset.b2n, c=t.dataset.b2c, tx=t.dataset.b2t; if(!n&&!c&&!tx) return; e.stopPropagation();
    if(n){const f=n.slice(3), v=Math.max(0,Math.round(+t.value||0)); if(f.startsWith('u:')) B.af.use[f.slice(2)]=v; else B.af[f]=v; B.af.saved=''; keep(); return afTotals();}
    if(c==='af:keepSus'){B.af.keepSus=t.checked; return afTotals();}
    if(tx){B.af.note=t.value; return;}},true);
  document.addEventListener('change',e=>{const t=e.target; if(!t.closest||!t.closest('#b2night,#b2after')) return;
    const k=t.dataset.b2, c=t.dataset.b2c, n=t.dataset.b2n, tx=t.dataset.b2t;
    if(k==='wid'){B.wid=t.value; B.widBy=B.widBy||{}; B.widBy[S.id]=t.value;B.mode='s1';B.rng=0;B.roll=null;B.spend=0;B.aim=0;B.force=0;B.mount=null;}
    else if(k==='mode') B.mode=t.value; else if(k==='dmode'){B.dmode=t.value; B.spend=0;} else if(k==='mount') B.mount=t.value; else if(k==='urb') B.urb=t.value; else if(k==='los') B.los=t.value; else if(k==='spt') B.spt=t.value; else if(k==='susp') B.susp=t.value; else if(k==='rng') B.rng=+t.value; else if(k==='dmglv') B.dmgLv=t.value; else if(k==='amsel') B.amSel=t.value;
    else if(k&&k.startsWith('sit:')) B.sit[k.slice(4)]=t.value; else if(k&&k.startsWith('msit:')) B.msit[k.slice(5)]=t.value;
    else if(k==='gh:kind'){B.gh.kind=t.value;B.gh.roll=null;} else if(k==='gh:lvl'){B.gh.lvl=t.value;B.gh.roll=null;} else if(k==='gh:dt'){B.gh.stun=t.value==='s';B.gh.roll=null;} else if(k==='dtgt'){B.dtgt=t.value;B.rng=0;} else if(k==='dft'){B.dft=t.value;} else if(k==='sec'){B.sec=Math.max(0,Math.min(4,+t.value||0)); B.roll=null;} else if(k==='ctc'){B.ctc=+t.value;} else if(k==='inim'){B.inim=t.value; B.ini=null;} else if(k==='ctb'||k==='cte'){const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)]; if(C){if(k==='ctb') {C.cb=t.value; delete C.cei;} else C.cei=+t.value; if(typeof save==='function') save();}} else if(k==='vveh'){B.vveh=+t.value;B.vRes='';} else if(k==='vsk'){B.vsk=+t.value;} else if(k==='vtest'){B.vtest=t.value;B.vRes='';} else if(k==='vter'){B.vter=t.value;}
    else if(c==='gh:fl'){B.gh.fl=t.checked;B.gh.roll=null;}
    else if(n){const f=n.slice(3), v=Math.max(0,Math.round(+t.value||0)); if(f.startsWith('u:')) B.af.use[f.slice(2)]=v; else B.af[f]=v; B.af.saved=''; return afTotals();}
    else if(c==='af:keepSus'){B.af.keepSus=t.checked; return afTotals();}
    else if(tx){B.af.note=t.value; return;}
    else return;
    redraw();});
  document.addEventListener('input',e=>{const t=e.target; if(t&&t.dataset&&t.dataset.b2in==='suson') B.suson=t.value;});
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset) return; const d=t.dataset;
    if(d.b2chip!=null){const g=S.gear[+d.b2chip]; if(!g) return; if(t.checked){const why=chipBlock(g,chipsOn()); if(why){t.checked=false; return;} g.slot=true;} else delete g.slot; B.hpool=null; B.hpMax=null; render(); return;}
    if(d.b2chipm!=null){const g=S.gear[+d.b2chipm]; if(!g) return; if(t.value) g.mem=true; else delete g.mem; render(); return;}});
  document.addEventListener('change',e=>{const t=e.target; if(!t||!t.dataset||!t.dataset.b2ct) return; const L=(S.contacts||[]).filter(c=>c&&c.name), C=L[Math.min(L.length-1,+B.ctc||0)]; if(!C) return; C[t.dataset.b2ct]=Math.max(0,Math.min(12,Math.floor(+t.value||0))); if(typeof save==='function') save(); redraw();});
  const _render=render; render=function(){_render.apply(this,arguments); try{shareGM();}catch(e){} try{if(typeof xferCheck==='function') xferCheck();}catch(e){} try{redraw(); redrawAfter(); redrawStrip();}catch(e){console.error(e);}};
  try{ if(localStorage.getItem('sr2-builder-session')==='1'&&!ST.tab) B.tab='night'; }catch(e){}
  setTab(B.tab);
}
window.SR2B2={B,attacks,nightHTML,afterHTML,setTab}; window.chipHaveMap=chipHaveMap; // the Skill Web (swHave) counts slotted chips
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
