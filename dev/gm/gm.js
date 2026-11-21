/* SR2 GM Screen: catalog of baddies with filters, loadouts from Gear Locker data, encounter groups, table tracker.
   Rules: core p. 32 (Rule of Six/One), 78 (Initiative), 84 (Combat Pool), 86-89 (critters, ranged modifiers), 91-93 (damage resistance, armor),
   100-101 (melee), 112 (wounds), 187 (Professional and Threat Ratings). */
(function(){
'use strict';
const $=id=>document.getElementById(id), E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IT=Object.fromEntries(GMITEMS.map(x=>[x.id,x]));
const L4='LMSD', BOXES={L:1,M:3,S:6,D:10}, SIGN=x=>x>0?'+'+x:x<0?'−'+(-x):'0';
const d6x=()=>{let t=0,x;do{x=1+Math.floor(Math.random()*6);t+=x;}while(x===6&&t<60);return t;};
const rollN=n=>Array.from({length:Math.max(0,n)},d6x);
const r20=(n,tn)=>tn<=6?`[[${n}d6>${tn}]]`:`[[${n}d6!!6>${tn}]]`;
const KEY='sr2-gm-v1';
const ROLES=[['security','Security'],['corporate','Corporate'],['police','Police'],['gang','Gangs'],['street','Street'],['hired gun','Hired guns'],['magic','Magic users'],['decker','Deckers'],['rigger','Riggers'],['normal','Animals'],['para','Paranormal critters'],['dragon','Dragons']];
const TIER=['Easy','Medium','Hard','Difficult'];
const blank=()=>({custom:[],groups:[{id:'g1',name:'Group 1',on:true,m:[]}],enc:'New encounter',runners:[],dmg:{},ini:{},pools:{},threat:{},q:'',f:{kind:'all',roles:[],tier:[],src:[],flags:[]},sort:'name',sel:null,tab:'cat',load:{},tsel:null,mode:'atk'});
let G; try{G=Object.assign(blank(),JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){G=blank();}
const T={roll:null,copy:null,warn:'',atk:0,rng:0,gm:0,spend:0,tnb:4,dfd:4,gh:{kind:'ball',pow:9,lvl:'M',att:0},msg:''}; // per-session
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(G));}catch(e){}};
// ---------- catalog ----------
const ALL=()=>GMDATA.concat(G.custom);
const B=id=>ALL().find(b=>b.id===id);
const isCrit=b=>!!b.crit;
const proMax=b=>{const m=String(b.pro).match(/(\d)(?!.*\d)/); return m?+m[1]:null;};
function tier(b){ if(b.custom&&b.tierSet!=null) return b.tierSet;
  if(isCrit(b)){const m=/^(\d+)/.exec(b.atk||''); const p=m?+m[1]:6; return b.cls==='dragon'||p>=12?3:p>=9?2:p>=6?1:0;}
  if(b.arch) return 2; const p=proMax(b); return p?Math.min(3,Math.max(0,p-1)):1;}
const withdrawAt=b=>{const p=proMax(b); return isCrit(b)||b.arch||!p?99:[0,1,3,6,99][p];};
const flagsOf=b=>[b.m?'awakened':'',b.cy&&b.cy.length?'cyber':'',(b.ini[1]||1)>=2?'fast':'',String(b.a[6]).includes('(')?'dual':'',b.gear||!isCrit(b)||b.atk==='Humanoid'?'weapons':'',b.custom?'mine':''].filter(Boolean);
const FLAGS=[['awakened','Awakened'],['cyber','Cyberware'],['fast','2+ Initiative dice'],['dual','Dual-natured'],['weapons','Uses weapons'],['mine','Made by me']];
function matches(b){const f=G.f, q=G.q.trim().toLowerCase();
  if(q&&!(b.n+' '+(b.role||'')+' '+(b.cls||'')+' '+Object.keys(b.sk||{}).join(' ')+' '+(b.powers||'')+' '+(b.spellTxt||'')+' '+(b.cy||[]).join(' ')).toLowerCase().includes(q)) return false;
  if(f.kind==='npc'&&isCrit(b)) return false; if(f.kind==='crit'&&!isCrit(b)) return false;
  if(f.roles.length&&!f.roles.includes(b.cls||b.role)) return false;
  if(f.tier.length&&!f.tier.includes(tier(b))) return false;
  if(f.src.length&&!f.src.includes(b.src)) return false;
  const fl=flagsOf(b); if(f.flags.some(x=>!fl.includes(x))) return false; return true;}
const sorts={name:(a,b)=>a.n.localeCompare(b.n),ini:(a,b)=>(b.ini[0]+b.ini[1]*3.5)-(a.ini[0]+a.ini[1]*3.5),body:(a,b)=>b.a[0]-a.a[0],tier:(a,b)=>tier(b)-tier(a)||a.n.localeCompare(b.n),pool:(a,b)=>(b.pool||0)-(a.pool||0)};
// ---------- a stat block with a loadout ----------
function loadoutKeys(b){const L=[]; if(b.gear) L.push(['book','As in the book']); if(!isCrit(b)||b.atk==='Humanoid') ['easy','medium','hard','difficult'].forEach(k=>L.push([k,TIER[['easy','medium','hard','difficult'].indexOf(k)]])); L.push(['none','No gear']); if(!isCrit(b)||b.atk==='Humanoid') L.push(['custom','Custom']); return L;}
function loadItems(b,key,custom){const street=['gang','street'].includes(b.role); const LD=street?STREET_LOADOUTS:LOADOUTS;
  if(key==='book') return (b.gear||[]).map(([id,note])=>({id,note})); if(LD[key]) return LD[key].items.map(id=>({id,note:''})); if(key==='custom') return (custom||[]).map(id=>({id,note:''})); return [];}
function sk(b,name){if(!b.sk) return 0; if(b.sk[name]!=null) return b.sk[name]; const k=Object.keys(b.sk).find(x=>x.startsWith(name)); return k?b.sk[k]:0;}
function build(b,key,custom){ // armor, attacks
  const items=loadItems(b,key,custom).filter(x=>IT[x.id]);
  let ab=0,ai=0,hb=0,hi=0; items.forEach(({id})=>{const a=IT[id].a; if(!a) return; if(/Helmet/.test(IT[id].n)&&!/option/.test(IT[id].n)){hb=Math.max(hb,a[0]);hi=Math.max(hi,a[1]);} else {ab=Math.max(ab,a[0]);ai=Math.max(ai,a[1]);}});
  if(isCrit(b)&&b.armC){ab=Math.max(ab,b.armC);ai=Math.max(ai,b.armC);}
  const arm=[ab+hb,ai+hi]; const str=+b.a[2]||0; const troll=b.race==='Troll'?1:0; const atks=[];
  const sd=s=>String(s||'').replace(/\(Str(?:\s*Min)?\s*([+-]\s*\d+)?\)/i,(m,k)=>String(str+(k?+k.replace(/\s/g,''):0)));
  if(isCrit(b)&&b.atk!=='Humanoid') atks.push({n:'Natural attack',dice:+b.a[7],skill:0,dmg:b.atk,kind:'melee',reach:b.reach||0,why:'Reaction '+b.a[7]+' (core p. 86)'});
  else {const u=sk(b,'Unarmed Combat'); atks.push({n:'Unarmed',dice:u||null,skill:u,dmg:str+'M Stun',kind:'melee',reach:troll,why:u?'Unarmed Combat '+u:'no skill: defaulting'});}
  items.forEach(({id,note})=>{const x=IT[id];
    if(x.m){const s=x.m[4]||'Armed Combat'; const r=sk(b,s); atks.push({n:x.n,dice:r||null,skill:r,dmg:sd(x.m[2]),kind:'melee',reach:(x.m[1]||0)+troll,why:r?s+' '+r:'no '+s+': defaulting',note});}
    else if(x.w){const s=(x.skill||['Firearms'])[0]; const r=sk(b,s)||(s==='Firearms'&&x.w[0]==='lmg'?sk(b,'Gunnery'):0);
      const smartGun=/smartgun|smartlink/i.test((x.s||'')+' '+(note||'')); const aim=b.smart&&smartGun?-2:b.goggles&&smartGun?-1:0;
      atks.push({n:x.n,dice:r||null,skill:r,dmg:sd(x.w[4]),kind:x.w[0]==='grenade'?'thrown':'gun',mode:x.w[3]||'',range:x.range,aim,aimWhy:aim===-2?'smartlink with a smartgun (core p. 89)':aim===-1?'smart goggles (core p. 89)':'',why:r?s+' '+r:'no '+s+': defaulting',note,id});}});
  (b.spells||[]).forEach(([n,f,ty])=>atks.push({n:n+' (Force '+f+')',dice:f,skill:b.mpool||sk(b,'Sorcery'),dmg:'by spell',kind:'spell',ty,why:'Force '+f+' + Magic Pool',spell:1}));
  const bodyR=(+b.a[0])+(b.derm||0);
  return {arm,atks,items,bodyR};}
// ---------- render: catalog ----------
function chip(group,v,l,on){return `<button class="chip" data-f="${group}" data-v="${E(v)}" aria-pressed="${on}">${E(l)}</button>`;}
function catHTML(){const L=ALL().filter(matches).sort(sorts[G.sort]||sorts.name); const f=G.f; const nf=f.roles.length+f.tier.length+f.src.length+f.flags.length+(f.kind!=='all'?1:0);
  const sel=B(G.sel)||null;
  return `<div class="cat"><section class="panel list" aria-label="Baddies">
   <div class="bhd"><label class="sr" for="q">Search</label><input id="q" type="search" placeholder="Search names, skills, powers, cyberware" value="${E(G.q)}">
    <div class="row"><button class="ftog" data-act="filters" aria-expanded="${!!T.fopen}">Filters${nf?` <span class="fn">${nf}</span>`:''}</button>
    <label class="sr" for="sort">Sort</label><select id="sort">${[['name','Name'],['tier','Difficulty'],['ini','Initiative'],['body','Body'],['pool','Combat Pool']].map(([v,l])=>`<option value="${v}" ${G.sort===v?'selected':''}>Sort: ${l}</option>`).join('')}</select></div>
    <div class="fbox" ${T.fopen?'':'hidden'}>
     <div class="fl"><span class="lbl">Kind</span><div class="chips">${[['all','Everything'],['npc','People'],['crit','Critters']].map(([v,l])=>`<button class="chip" data-kind="${v}" aria-pressed="${f.kind===v}">${l}</button>`).join('')}</div></div>
     <div class="fl"><span class="lbl">Difficulty <small>(Professional Rating, or the attack for critters)</small></span><div class="chips">${TIER.map((t,i)=>chip('tier',i,t,f.tier.includes(i))).join('')}</div></div>
     <div class="fl"><span class="lbl">Who they are</span><div class="chips">${ROLES.map(([v,l])=>chip('roles',v,l,f.roles.includes(v))).join('')}</div></div>
     <div class="fl"><span class="lbl">Has</span><div class="chips">${FLAGS.map(([v,l])=>chip('flags',v,l,f.flags.includes(v))).join('')}</div></div>
     <div class="fl"><span class="lbl">Book</span><div class="chips">${[['core','Core rulebook'],['csh','Corporate Security Handbook'],['mine','Mine']].map(([v,l])=>chip('src',v,l,f.src.includes(v))).join('')}</div></div>
     ${nf?'<button class="ghost sm" data-act="clearf">Clear filters</button>':''}</div>
    <span class="note">${L.length} of ${ALL().length}</span></div>
   <div class="items">${L.map(b=>`<button class="it" data-sel="${b.id}" aria-pressed="${G.sel===b.id}"><span class="itn"><b>${E(b.n)}</b><small>${E(isCrit(b)?(b.cls==='normal'?'Animal':b.cls==='dragon'?'Dragon':'Paranormal critter'):b.role)} · Body ${b.a[0]} · Init ${b.ini[0]}+${b.ini[1]}D6</small></span><span class="tier t${tier(b)}">${TIER[tier(b)]}</span></button>`).join('')||'<p class="note pad">Nothing matches. Loosen a filter.</p>'}</div></section>
   <section class="panel detail" aria-label="Stat block">${sel?detailHTML(sel):`<div class="pad"><h2>Pick a baddie</h2><p class="note">Pick one on the left to see the stat block, choose a loadout and add copies to a group. Or make your own with the button below.</p><button data-act="newblock">New stat block</button>${newFormHTML()}</div>`}</section></div>`;}
function detailHTML(b){const lk=loadoutKeys(b); const key=G.load[b.id]||(b.gear?'book':isCrit(b)?'none':'medium'); const X=build(b,key,(G.load[b.id+':c']||[]));
  const stat=(k,v)=>`<div class="st"><span class="lbl">${k}</span><b>${E(v)}</b></div>`;
  const a=b.a; const street=['gang','street'].includes(b.role); const LD=street?STREET_LOADOUTS:LOADOUTS;
  return `<div class="pad"><div class="dh"><div><h2>${E(b.n)}</h2><span class="note">${E(b.src==='csh'?'Corporate Security Handbook':b.src==='core'?'Core rulebook':'Your stat block')} · ${E(b.pg||'')}${b.pro&&!isCrit(b)?' · Professional Rating '+E(b.pro):''}</span></div><span class="tier t${tier(b)}">${TIER[tier(b)]}</span></div>
   <div class="stats">${stat('Body',a[0]+(b.derm?' (+'+b.derm+' dermal)':''))}${stat('Quick',a[1])}${stat('Str',a[2])}${stat('Cha',a[3])}${stat('Int',a[4])}${stat('Will',a[5])}${stat('Ess',a[6])}${b.m?stat('Magic',b.m):''}${stat('React',a[7])}${stat('Init',b.ini[0]+' + '+b.ini[1]+'D6')}${isCrit(b)?stat('Threat',G.threat[b.id]||0):stat('Combat Pool',b.pool)}${b.mpool?stat('Magic Pool',b.mpool):''}${stat('Armor',X.arm[0]+'/'+X.arm[1])}</div>
   ${b.at?`<p class="note">As printed: ${E(b.at)}.</p>`:''}
   ${b.sk?`<p><b>Skills:</b> ${E(Object.entries(b.sk).map(([k,v])=>k+' '+v).join(', '))}</p>`:''}
   ${b.cy&&b.cy.length?`<p><b>Cyberware:</b> ${E(b.cy.join(', '))}</p>`:''}
   ${b.powers?`<p><b>Powers:</b> ${E(b.powers)}</p>`:''}${b.spellTxt?`<p><b>Spells:</b> ${E(b.spellTxt)}</p>`:''}${b.deck?`<p><b>Deck:</b> ${E(b.deck)}</p>`:''}${b.drones?`<p><b>Drones:</b> ${E(b.drones)}</p>`:''}${b.note?`<p class="note">${E(b.note)}</p>`:''}
   ${!isCrit(b)||b.atk==='Humanoid'||1?`<div class="lo"><span class="lbl">Loadout</span><div class="chips" role="radiogroup" aria-label="Loadout">${lk.map(([k,l])=>`<button class="chip" role="radio" data-load="${k}" aria-checked="${key===k}">${E(l)}</button>`).join('')}</div>
    <span class="note">${key==='book'?'The gear printed with this character.':LD[key]?'Suggested by this tool for '+(street?'street toughs':'security and pros')+': '+LD[key].why+'. Not a book rule, so swap anything.':key==='custom'?'Pick any weapon or armor from the Gear Locker list.':'Nothing carried.'}</span>
    ${key==='custom'?`<div class="row"><label class="sr" for="addItem">Add an item</label><select id="addItem"><option value="">Add a weapon or armor…</option>${['guns','melee','ranged','boom','armor','body'].map(c=>`<optgroup label="${{guns:'Firearms',melee:'Melee',ranged:'Bows and throwing',boom:'Grenades',armor:'Armor',body:'Cyber weapons'}[c]}">${GMITEMS.filter(x=>x.cat===c&&(x.w||x.m||x.a)).map(x=>`<option value="${E(x.id)}">${E(x.n)} · ${E(x.s||'')}</option>`).join('')}</optgroup>`).join('')}</select></div>`:''}
    <ul class="gear">${X.items.map((x,i)=>`<li><b>${E(IT[x.id].n)}</b> <span class="note">${E(IT[x.id].s||'')}${x.note?' · '+E(x.note):''} · ${E(IT[x.id].pg||'')}</span>${key==='custom'?` <button class="ghost xs" data-rmitem="${i}" aria-label="Remove ${E(IT[x.id].n)}">×</button>`:''}</li>`).join('')||'<li class="note">No gear.</li>'}</ul></div>`:''}
   <div class="lbl">Attacks</div><div class="rows">${X.atks.map(t=>`<div class="r"><span><b>${E(t.n)}</b> <small>${E(t.why)}${t.aim?' · '+SIGN(t.aim)+' TN, '+t.aimWhy:''}${t.reach?' · reach '+t.reach:''}</small></span><b class="mono">${t.dice==null?'GM':t.dice} dice · ${E(t.dmg)}</b></div>`).join('')}</div>
   ${isCrit(b)?`<div class="row"><span class="lbl">Threat Rating <small>(extra dice on any test, core p. 86, 187)</small></span><button class="ghost sq" data-thr="-1" aria-label="Lower Threat">−</button><b class="mono">${G.threat[b.id]||0}</b><button class="ghost sq" data-thr="1" aria-label="Raise Threat">+</button></div>`:''}
   <div class="add"><label class="sr" for="addTo">Group</label><select id="addTo">${G.groups.map(g=>`<option value="${g.id}" ${T.addTo===g.id?'selected':''}>${E(g.name)}</option>`).join('')}<option value="new">New group…</option></select>
    <label class="sr" for="addN">How many</label><input id="addN" type="number" min="1" max="30" value="${T.addN||1}" inputmode="numeric"><button data-act="add">Add to group</button></div>
   <p class="note" aria-live="polite">${E(T.msg)}</p>
   ${b.custom?'<button class="ghost sm" data-act="delblock">Delete this stat block</button>':''}</div>`;}
function newFormHTML(){const N=T.nf||(T.nf={n:'',kind:'npc',role:'security',a:[4,4,4,3,3,3,'6',3],iniD:1,pro:2,sk:'Firearms 4, Unarmed Combat 3',atk:'7M',armC:0});
  const num=(i,l)=>`<label class="fl"><span class="lbl">${l}</span><input type="number" data-nf="a${i}" value="${N.a[i]}"></label>`;
  return `<details class="newb" ${T.nfOpen?'open':''}><summary>Type in a stat block</summary><div class="grid2">
   <label class="fl wide"><span class="lbl">Name</span><input data-nf="n" value="${E(N.n)}" placeholder="Renraku red samurai"></label>
   <label class="fl"><span class="lbl">Kind</span><select data-nf="kind"><option value="npc" ${N.kind==='npc'?'selected':''}>Person (uses Combat Pool)</option><option value="crit" ${N.kind==='crit'?'selected':''}>Critter (Threat dice, no pools)</option></select></label>
   <label class="fl"><span class="lbl">Who they are</span><select data-nf="role">${ROLES.map(([v,l])=>`<option value="${v}" ${N.role===v?'selected':''}>${l}</option>`).join('')}</select></label>
   ${num(0,'Body')}${num(1,'Quickness')}${num(2,'Strength')}${num(3,'Charisma')}${num(4,'Intelligence')}${num(5,'Willpower')}${num(7,'Reaction')}
   <label class="fl"><span class="lbl">Initiative dice</span><input type="number" data-nf="iniD" value="${N.iniD}"></label>
   <label class="fl"><span class="lbl">Professional Rating 1–4</span><input type="number" data-nf="pro" value="${N.pro}"></label>
   <label class="fl wide"><span class="lbl">Skills (name and rating, commas between)</span><input data-nf="sk" value="${E(N.sk)}"></label>
   <label class="fl"><span class="lbl">Critter attack code</span><input data-nf="atk" value="${E(N.atk)}"></label><label class="fl"><span class="lbl">Critter armor</span><input type="number" data-nf="armC" value="${N.armC}"></label>
   </div><p class="note">Combat Pool works itself out: (Quickness + Intelligence + Willpower) ÷ 2 (core p. 84). Critters attack with Reaction (p. 86).</p><button data-act="saveblock">Save stat block</button></details>`;}
// ---------- groups and encounter ----------
function groupsHTML(){return `<div class="enc"><section class="panel pad"><div class="dh"><h2>Groups</h2><button class="ghost sm" data-act="newgroup">New group</button></div>
  <label class="fl"><span class="lbl">Encounter name</span><input id="encName" value="${E(G.enc)}"></label>
  <p class="note">Tick a group to put it in the encounter. Each copy is tracked on its own: none of the books here has rules for treating a mob as one unit.</p>
  ${G.groups.map(g=>{const n=g.m.reduce((a,x)=>a+x.n,0); return `<div class="grp ${g.on?'on':''}"><div class="row"><input type="checkbox" data-gon="${g.id}" ${g.on?'checked':''} aria-label="Put ${E(g.name)} in the encounter"><label class="sr" for="gn-${g.id}">Group name</label><input id="gn-${g.id}" class="gname" data-gname="${g.id}" value="${E(g.name)}"><span class="note">${n} cop${n===1?'y':'ies'}</span><button class="ghost xs" data-gdel="${g.id}" aria-label="Delete ${E(g.name)}">×</button></div>
   ${g.m.map((x,i)=>{const b=B(x.b); return b?`<div class="mrow"><span>${E(b.n)} <small>${E((loadoutKeys(b).find(k=>k[0]===x.lo)||['',''])[1])}</small></span><button class="ghost sq" data-mn="${g.id}|${i}|-1" aria-label="One fewer">−</button><b class="mono">${x.n}</b><button class="ghost sq" data-mn="${g.id}|${i}|1" aria-label="One more">+</button></div>`:'';}).join('')||'<p class="note">Empty: add stat blocks from the catalog.</p>'}</div>`;}).join('')}</section>
  <section class="panel pad"><div class="dh"><h2>Runners</h2><button class="ghost sm" data-act="import">From the Runner Builder</button></div>
   <p class="note">Add the players’ runners by hand, or pull characters saved in the online Runner Builder on this device. Players can roll their own Initiative and call it out.</p>
   <div class="row"><label class="sr" for="rnName">Runner name</label><input id="rnName" placeholder="Runner name"><label class="sr" for="rnIni">Initiative</label><input id="rnIni" type="number" placeholder="Init" inputmode="numeric" style="width:6rem"><button data-act="addrunner">Add</button></div>
   ${T.imp?`<div class="imp">${T.imp.length?(T.imp.filter(c=>!G.runners.some(r=>r.from===c.id)).length>1?`<div class="row"><button class="ghost sm" data-act="impall">Add all</button></div>`:'')+T.imp.map((c,i)=>{const on=G.runners.some(r=>r.from===c.id); return `<div class="mrow"><span>${E(c.n)} <small>${c.r!=null?'Reaction '+c.r+' + '+c.d+'D6':'open it once in the new Builder to share stats'}</small></span>${on?'<span class="note">Added</span>':`<button class="ghost sm" data-imp="${i}">Add</button>`}</div>`;}).join(''):'<p class="note">No saved characters found on this device. The Builder must be open from the same site.</p>'}</div>`:''}
   ${G.runners.map((r,i)=>`<div class="mrow"><span><b>${E(r.n)}</b> <small>${r.r!=null?'Reaction '+r.r+' + '+r.d+'D6':''}</small></span><span class="note">Init</span><button class="ghost sq" data-ri="${i}|-1" aria-label="Lower ${E(r.n)} Initiative">−</button><b class="mono">${r.ini||'—'}</b><button class="ghost sq" data-ri="${i}|1" aria-label="Raise ${E(r.n)} Initiative">+</button>${r.r!=null?`<button class="ghost xs" data-rroll="${i}">Roll</button>`:''}<button class="ghost xs" data-rdel="${i}" aria-label="Remove ${E(r.n)}">×</button></div>`).join('')}</section></div>`;}
// ---------- the table ----------
function copies(){const out=[]; G.groups.filter(g=>g.on).forEach(g=>g.m.forEach((x,mi)=>{const b=B(x.b); if(!b) return; for(let i=1;i<=x.n;i++) out.push({id:g.id+'-'+mi+'-'+i,b,g,lo:x.lo,cl:x.cl,name:b.n+' '+i+(g.m.filter(y=>y.b===x.b).length>1?' ('+(loadoutKeys(b).find(k=>k[0]===x.lo)||['',''])[1]+')':'')});})); return out;}
const D=id=>G.dmg[id]||{p:0,s:0};
const lv=n=>n>=10?4:n>=6?3:n>=3?2:n>=1?1:0;
const wm=id=>Math.min(3,lv(Math.min(10,D(id).p)))+Math.min(3,lv(D(id).s));
const poolLeft=c=>G.pools[c.id]==null?(isCrit(c.b)||(G.threat[c.b.id]||0)?0:c.b.pool||0):G.pools[c.id];
function status(c){const d=D(c.id), worst=Math.max(d.p,d.s);
  if(d.p>10+c.b.a[0]) return ['Dead','bad']; if(d.p>10) return ['Dying: overflow '+(d.p-10)+' of '+c.b.a[0],'bad']; if(d.p>=10) return ['Down','bad']; if(d.s>=10) return ['Unconscious','bad'];
  if(worst>=withdrawAt(c.b)) return ['Wants out: Willpower (4) test to stay (core p. 187)','warn']; const w=wm(c.id); return [w?'Wounded: +'+w+' to target numbers':'Fighting',w?'warn':'ok'];}
function tableHTML(){const C=copies(); const order=C.map(c=>{const raw=G.ini[c.id], w=wm(c.id), v=raw==null?null:Math.max(0,raw-w); return {c,v};}).concat(G.runners.map((r,i)=>({r,i,v:r.ini||null})))
   .sort((a,b)=>(b.v??-1)-(a.v??-1));
  const box=(c,k,i)=>{const d=D(c.id), on=i<=d[k], mk={1:'L',3:'M',6:'S',10:'D'}[i]||''; return `<button class="bx ${on?'lit '+k:''} ${mk?'mk':''}" data-bx="${c.id}|${k}|${i}" aria-pressed="${on}" aria-label="${E(c.name)} ${k==='p'?'Physical':'Stun'} box ${i}${mk?' ('+mk+')':''}"></button>`;};
  const passes=v=>{const o=[];for(let x=v;x>0;x-=10)o.push(x);return o.join(', ');};
  const sel=C.find(c=>c.id===G.tsel);
  return `<section class="panel pad"><div class="dh"><h2>${E(G.enc)} · ${C.length} enem${C.length===1?'y':'ies'}, ${G.runners.length} runner${G.runners.length===1?'':'s'}</h2>
    <div class="row"><button data-act="rollini">Roll enemy Initiative</button><button class="ghost" data-act="copyini">Copy for Roll20</button><button class="ghost" data-act="newturn">New Combat Turn</button></div></div>
   <p class="note">Highest goes first; each extra pass is 10 lower (core p. 78). Wounds come off Initiative and are added to every target number (core p. 112).</p>
   ${C.length||G.runners.length?`<div class="order">${order.map(o=>o.c?(()=>{const c=o.c,[st,cls]=status(c),pl=poolLeft(c); return `<div class="orow ${G.tsel===c.id?'sel':''}"><b class="ini">${o.v==null?'—':o.v}</b><span class="on"><b>${E(c.name)}</b><small>${E(c.g.name)} · ${c.b.ini[0]}+${c.b.ini[1]}D6${o.v?' · acts on '+passes(o.v):''}${isCrit(c.b)?(G.threat[c.b.id]?' · Threat '+G.threat[c.b.id]:''):' · Combat Pool '+pl+'/'+c.b.pool}</small></span>
      <span class="trk"><span class="lbl">P</span>${Array.from({length:10},(_,i)=>box(c,'p',i+1)).join('')}</span><span class="trk"><span class="lbl">S</span>${Array.from({length:10},(_,i)=>box(c,'s',i+1)).join('')}</span>
      <span class="stt ${cls}">${E(st)}</span><button class="ghost sm" data-tsel="${c.id}" aria-pressed="${G.tsel===c.id}">${G.tsel===c.id?'Selected':'Act or resist'}</button></div>`;})():`<div class="orow runner"><b class="ini">${o.v||'—'}</b><span class="on"><b>${E(o.r.n)}</b><small>runner${o.r.r!=null?' · '+o.r.r+'+'+o.r.d+'D6':''}${o.v?' · acts on '+passes(o.v):''}</small></span><span class="rini"><button class="ghost sq" data-ri="${o.i}|-1" aria-label="Lower ${E(o.r.n)} Initiative">−</button><button class="ghost sq" data-ri="${o.i}|1" aria-label="Raise ${E(o.r.n)} Initiative">+</button>${o.r.r!=null?`<button class="ghost xs" data-rroll="${o.i}">Roll</button>`:''}</span></div>`).join('')}</div>`:'<p class="note">No one in the fight yet. Tick a group under Encounter and add the runners.</p>'}
   </section>${sel?actHTML(sel):''}${T.copy?`<div class="panel pad copy"><label for="r20" class="lbl">${E(T.copy.msg)}</label><input id="r20" readonly value="${E(T.copy.text)}"></div>`:''}`;}
function actHTML(c){const b=c.b, X=build(b,c.lo,c.cl), w=wm(c.id), th=G.threat[b.id]||0, pl=poolLeft(c); const atk=G.mode==='atk';
  const step=(id,l,v)=>`<div class="fl"><span class="lbl">${l}</span><div class="row"><button class="ghost sq" data-st="${id}|-1" aria-label="Lower ${E(l)}">−</button><b class="mono big">${E(v)}</b><button class="ghost sq" data-st="${id}|1" aria-label="Raise ${E(l)}">+</button></div></div>`;
  let ctl='',rows=[],tn=0,dice=0,src='',dmg='',res='';
  if(atk){const A=X.atks[Math.min(T.atk,X.atks.length-1)]; T.cur={A};
    ctl+=`<label class="fl wide"><span class="lbl">Attack with</span><select id="atkSel">${X.atks.map((a,i)=>`<option value="${i}" ${i===T.atk?'selected':''}>${E(a.n)} · ${a.dice==null?'GM':a.dice} dice · ${E(a.dmg)}</option>`).join('')}</select></label>`;
    if(A.kind==='gun'&&A.range){ctl+=`<label class="fl"><span class="lbl">Range</span><select id="rngSel">${A.range.map((r,i)=>`<option value="${i}" ${T.rng===i?'selected':''}>${['Short','Medium','Long','Extreme'][i]} ${typeof r==='number'?(i?'to ':'0-')+r*(+b.a[2]||1):E(r)} m</option>`).join('')}</select></label>`; tn=[4,5,6,9][T.rng]; rows.push(['Range','core p. 88',tn]);}
    else if(A.kind==='spell'){ctl+=step('tnb','Target’s '+(A.ty==='mana'?'Willpower':'Body')+' (GM)',T.tnb); tn=T.tnb; rows.push(['Target’s '+(A.ty==='mana'?'Willpower':'Body'),'core p. 129',tn]);}
    else if(A.kind==='thrown'){ctl+=step('tnb','Base target number (GM)',T.tnb); tn=T.tnb; rows.push(['Base target number','thrown, core p. 96–97',tn]);}
    else {tn=4; rows.push(['Melee','opposed: the defender rolls too · core p. 100',4]);}
    if(A.aim){rows.push([A.aimWhy,'',A.aim]); tn+=A.aim;}
    ctl+=step('gm','Modifiers (GM): cover, light, movement, reach',SIGN(T.gm)); if(T.gm){rows.push(['Modifiers','core p. 89, 101',T.gm]); tn+=T.gm;}
    if(w){rows.push(['Wounds','core p. 112',w]); tn+=w;} tn=Math.max(2,tn);
    if(A.dice==null) ctl+=step('dfd','Defaulting dice (GM)',T.dfd);
    const maxSp=isCrit(b)||th?0:Math.min(pl,A.spell?0:A.skill||0), sp=Math.min(T.spend,maxSp);
    if(!isCrit(b)&&!th&&!A.spell) ctl+=step('spend','Combat Pool ('+pl+' left, max '+maxSp+')',sp);
    dice=(A.dice==null?T.dfd:A.dice)+sp+th; src=A.why+(sp?' + '+sp+' Combat Pool':'')+(th?' + Threat '+th:''); dmg=A.dmg; T.cur={A,dice,tn,sp,th,src};
  } else {const g=T.gh, armB=g.kind==='ball'?X.arm[0]:g.kind==='imp'||g.kind==='gel'?X.arm[1]:g.kind==='flech'?Math.max(2*X.arm[1],X.arm[0]):g.kind==='apds'?Math.floor(X.arm[0]/2):0; const spellHit=g.kind==='spell';
    const pow=g.kind==='gel'?g.pow-2:g.pow; tn=spellHit?g.pow:Math.max(2,pow-armB);
    ctl+=`<label class="fl wide"><span class="lbl">What hit them</span><select id="ghKind">${[['ball','Bullet (Ballistic armor)'],['imp','Melee, unarmed or thrown (Impact armor)'],['flech','Flechette'],['apds','APDS'],['gel','Gel round'],['spell','Combat spell (no armor)']].map(([v,l])=>`<option value="${v}" ${g.kind===v?'selected':''}>${l}</option>`).join('')}</select></label>`;
    ctl+=step('pow',spellHit?'Spell Force':'Incoming Power',g.pow)+`<label class="fl"><span class="lbl">Damage level</span><select id="ghLvl">${['L','M','S','D'].map(v=>`<option ${g.lvl===v?'selected':''}>${v}</option>`).join('')}</select></label>`+step('att','Attacker’s successes',g.att);
    const maxSp=isCrit(b)||th?0:pl, sp=Math.min(T.spend,maxSp); if(maxSp) ctl+=step('spend','Combat Pool ('+pl+' left)',sp);
    rows=[[spellHit?'Spell Force':'Power'+(g.kind==='gel'?' (−2 for gel)':''),'',pow],['Armor '+(g.kind==='flech'?'(higher of double Impact or Ballistic)':g.kind==='apds'?'(Ballistic halved, GM rounds)':g.kind==='imp'||g.kind==='gel'?'(Impact)':spellHit?'(none)':'(Ballistic)'),'core p. 91–93, 277',-armB]];
    dice=X.bodyR+sp+th; src='Body '+X.bodyR+(sp?' + '+sp+' Combat Pool':'')+(th?' + Threat '+th:''); dmg=g.lvl+(g.kind==='gel'?' Stun':''); T.cur={dice,tn,sp,th,src,lvl:g.lvl,stun:g.kind==='gel'};}
  if(T.roll&&T.roll.cid===c.id){const R=T.roll,k=R.r.filter(x=>x>=R.tn).length;
    if(R.res){const pk=R.r.slice(R.r.length-R.pool).filter(x=>x>=R.tn).length; if(R.pool&&pk>T.gh.att) res=`${k} successes; pool or Threat dice alone beat the attacker’s ${T.gh.att}: a complete miss (core p. 91, 187).`; else {const d=k-T.gh.att, idx=L4.indexOf(R.lvl)+(d<0?Math.floor(-d/2):-Math.floor(d/2)); R.final=idx<0?null:L4[Math.min(3,idx)]; res=`${k} success${k===1?'':'es'} vs the attacker’s ${T.gh.att}: `+(R.final?`takes ${R.final} ${R.stun?'Stun':'Physical'} (${BOXES[R.final]} box${BOXES[R.final]>1?'es':''}).`:'no damage.');}}
    else res=R.r.every(x=>x===1)?'All ones: Rule of One (core p. 32).':`${k} success${k===1?'':'es'} vs TN ${R.tn}`;}
  const rowsH=rows.map(([k,s,v],i)=>`<div class="r ${i%2?'alt':''}"><span>${E(k)} <small>${E(s)}</small></span><b class="mono">${typeof v==='number'&&i>0?SIGN(v):v}</b></div>`).join('')+`<div class="r tot"><span>Target number</span><b class="mono">${tn}</b></div>`;
  return `<section class="panel pad act"><div class="dh"><h2>${E(c.name)} ${atk?'attacks':'gets hit'}</h2><div class="chips" role="tablist">${[['atk','Attack'],['res','Resist damage']].map(([m,l])=>`<button class="chip" role="tab" data-mode="${m}" aria-selected="${G.mode===m}">${l}</button>`).join('')}</div></div>
   <div class="two"><div class="ctl">${ctl}</div><div class="resb"><div class="rows">${rowsH}</div>
   <div class="nums"><div><span class="lbl">Dice</span><b>${dice}</b><small>${E(src)}</small></div><div><span class="lbl">Target number</span><b class="warn">${tn}</b></div><div><span class="lbl">${atk?'Damage':'If successes tie'}</span><b>${E(dmg)}</b></div></div>
   <div class="row"><button data-act="${atk?'roll':'rres'}">Roll ${dice} dice</button><button class="ghost" data-act="${atk?'copyatk':'copyres'}">Copy for Roll20</button>${atk?'':`<button class="ghost" data-act="mark" ${T.roll&&T.roll.cid===c.id&&T.roll.final?'':'disabled'}>Mark it on the monitor</button>`}<button class="ghost" data-act="refresh">New action: refresh pool</button></div>
   <div class="dice">${T.roll&&T.roll.cid===c.id?T.roll.r.map((v,i)=>`<span class="die ${v>=T.roll.tn?'hit':''} ${i>=T.roll.r.length-T.roll.pool?'pool':''}">${v}</span>`).join(''):''}</div><b>${E(res||'Pool and Threat dice have an outline; sixes roll again and add (core p. 32).')}</b></div></div></section>`;}
// ---------- page ----------
function render(){save(); const t=G.tab; document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===t)));
  const f=document.activeElement, fid=f&&f.id, pos=f&&f.selectionStart;
  $('view').innerHTML=t==='cat'?catHTML():t==='enc'?groupsHTML():tableHTML();
  const C=copies(); $('tabEnc').textContent=`Encounter (${C.length})`;
  if(fid){const el=$(fid); if(el){el.focus(); try{if(pos!=null&&el.setSelectionRange) el.setSelectionRange(pos,pos);}catch(e){}}}}
function copyOut(text,msg){let ok=false; try{if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>{},()=>{}); ok=true;}}catch(e){} T.copy={text,msg:ok?msg+': copied. Paste it into the Roll20 chat.':msg+': select this and copy it.'};}
function importList(){const out=[], seen=new Set(); const add=(d)=>{if(!d||seen.has(d.id)) return; seen.add(d.id); const g=d._gm; out.push({id:d.id,n:d.handle||d.name||'Runner',r:g?g.r:null,d:g?g.d:null});};
  try{const cur=JSON.parse(localStorage.getItem('sr2-builder-v1')||'null'); add(cur);}catch(e){}
  try{(JSON.parse(localStorage.getItem('sr2-builder-roster')||'[]')||[]).forEach(x=>add(x.data));}catch(e){} return out;}
document.addEventListener('click',e=>{const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.tab){G.tab=d.tab; T.copy=null; return render();}
  if(d.sel){G.sel=d.sel; T.msg=''; T.nfOpen=false; return render();}
  if(d.kind){G.f.kind=d.kind; return render();}
  if(d.f){const L=G.f[d.f], v=d.f==='tier'?+d.v:d.v; const i=L.indexOf(v); if(i<0) L.push(v); else L.splice(i,1); return render();}
  if(d.load){G.load[G.sel]=d.load; return render();}
  if(d.rmitem!=null){const k=G.sel+':c'; (G.load[k]=G.load[k]||[]).splice(+d.rmitem,1); return render();}
  if(d.thr){G.threat[G.sel]=Math.max(0,(G.threat[G.sel]||0)+(+d.thr)); return render();}
  if(d.gon){const g=G.groups.find(x=>x.id===d.gon); if(g) g.on=!g.on; return render();}
  if(d.gdel){if(G.groups.length>1) G.groups=G.groups.filter(x=>x.id!==d.gdel); else {G.groups[0].m=[]; T.msg='Emptied '+G.groups[0].name+'.';} return render();}
  if(d.mn){const [gid,i,dl]=d.mn.split('|'); const g=G.groups.find(x=>x.id===gid); const m=g.m[+i]; m.n+=(+dl); if(m.n<=0) g.m.splice(+i,1); return render();}
  if(d.ri){const [i,dl]=d.ri.split('|'); const r=G.runners[+i]; r.ini=Math.max(0,(r.ini||0)+(+dl)); return render();}
  if(d.rroll){const r=G.runners[+d.rroll]; r.ini=r.r+rollN(r.d).reduce((a,x)=>a+x,0); return render();}
  if(d.rdel){G.runners.splice(+d.rdel,1); return render();}
  if(d.imp){const c=T.imp[+d.imp]; if(!G.runners.some(r=>r.from===c.id)) G.runners.push({n:c.n,r:c.r,d:c.d,ini:0,from:c.id}); return render();}
  if(d.bx){const [cid,k,i]=d.bx.split('|'); const cur=D(cid); const v=+i; G.dmg[cid]={...cur,[k]:cur[k]===v?v-1:v}; return render();}
  if(d.tsel){G.tsel=d.tsel; T.roll=null; T.spend=0; T.atk=0; T.rng=0; return render();}
  if(d.mode){G.mode=d.mode; T.roll=null; T.spend=0; return render();}
  if(d.st){const [id,dl]=d.st.split('|'), n=+dl; if(id==='gm') T.gm+=n; else if(id==='spend') T.spend=Math.max(0,T.spend+n); else if(id==='tnb') T.tnb=Math.max(2,T.tnb+n); else if(id==='dfd') T.dfd=Math.max(1,T.dfd+n); else if(id==='pow') T.gh.pow=Math.max(1,T.gh.pow+n); else if(id==='att') T.gh.att=Math.max(0,T.gh.att+n); return render();}
  const a=d.act; if(!a) return; const C=copies(), c=C.find(x=>x.id===G.tsel);
  if(a==='filters'){T.fopen=!T.fopen;}
  else if(a==='clearf'){G.f={kind:'all',roles:[],tier:[],src:[],flags:[]};}
  else if(a==='add'){const b=B(G.sel); let gid=$('addTo').value; const n=Math.max(1,Math.min(30,+$('addN').value||1)); T.addN=n;
    if(gid==='new'){gid='g'+Date.now().toString(36); G.groups.push({id:gid,name:'Group '+(G.groups.length+1),on:true,m:[]});}
    const g=G.groups.find(x=>x.id===gid); const lo=G.load[b.id]||(b.gear?'book':isCrit(b)?'none':'medium'); const cl=lo==='custom'?(G.load[b.id+':c']||[]).slice():null;
    const ex=g.m.find(x=>x.b===b.id&&x.lo===lo&&JSON.stringify(x.cl||null)===JSON.stringify(cl)); if(ex) ex.n+=n; else g.m.push({b:b.id,n,lo,cl}); T.addTo=gid; T.addN=1; T.msg=`Added ${n} × ${b.n} to ${g.name}.`;}
  else if(a==='newgroup'){G.groups.push({id:'g'+Date.now().toString(36),name:'Group '+(G.groups.length+1),on:true,m:[]});}
  else if(a==='newblock'){T.nfOpen=true;}
  else if(a==='saveblock'){const N=T.nf; if(!N.n.trim()){T.msg='Give it a name first.'; return render();} const skm={}; String(N.sk).split(',').forEach(x=>{const m=x.trim().match(/^(.*?)\s+(\d+)$/); if(m) skm[m[1]]=+m[2];});
    const a8=N.a.map((v,i)=>i===6?v:+v||0); const crit=N.kind==='crit'; const id='u'+Date.now().toString(36);
    G.custom.push({id,n:N.n.trim(),src:'mine',pg:'typed in by the GM',role:crit?'para':N.role,cls:crit?'para':undefined,crit:crit?1:0,custom:1,a:a8,ini:[a8[7],Math.max(1,+N.iniD||1)],pool:crit?0:Math.floor((a8[1]+a8[4]+a8[5])/2),pro:crit?'critter':String(Math.min(4,Math.max(1,+N.pro||2))),sk:skm,atk:crit?N.atk:undefined,armC:+N.armC||0});
    G.sel=id; T.nf=null; T.nfOpen=false;}
  else if(a==='delblock'){G.custom=G.custom.filter(x=>x.id!==G.sel); G.groups.forEach(g=>g.m=g.m.filter(x=>x.b!==G.sel)); G.sel=null;}
  else if(a==='import'){T.imp=importList();}
  else if(a==='impall'){(T.imp||[]).forEach(c=>{if(!G.runners.some(r=>r.from===c.id)) G.runners.push({n:c.n,r:c.r,d:c.d,ini:0,from:c.id});});}
  else if(a==='addrunner'){const n=$('rnName').value.trim(); if(!n) return $('rnName').focus(); G.runners.push({n,ini:+$('rnIni').value||0,r:null,d:null});}
  else if(a==='rollini'){C.forEach(x=>{G.ini[x.id]=x.b.ini[0]+rollN(x.b.ini[1]).reduce((s,y)=>s+y,0);});}
  else if(a==='copyini'){copyOut(`&{template:default} {{name=${G.enc}: enemy Initiative}} `+C.map(x=>`{{${x.name}=[[${x.b.ini[0]}+${x.b.ini[1]}d6${wm(x.id)?'-'+wm(x.id):''}]]}}`).join(' '),'Initiative');}
  else if(a==='newturn'){G.ini={}; G.pools={}; G.runners.forEach(r=>r.ini=0); T.roll=null;}
  else if(c&&(a==='roll'||a==='rres')){const K=T.cur; G.pools[c.id]=poolLeft(c)-K.sp; T.roll={cid:c.id,r:rollN(K.dice),tn:K.tn,pool:K.sp+K.th,res:a==='rres',lvl:K.lvl,stun:K.stun}; T.spend=0; T.copy=null;}
  else if(c&&a==='copyatk'){const K=T.cur; G.pools[c.id]=poolLeft(c)-K.sp; copyOut(`&{template:default} {{name=${c.name}: ${K.A.n}}} {{Dice=${K.dice} (${K.src})}} {{Target number=${K.tn}}} {{Successes=${r20(K.dice,K.tn)}}} {{Damage=${K.A.dmg}}}`,'Attack'); T.spend=0;}
  else if(c&&a==='copyres'){const K=T.cur; G.pools[c.id]=poolLeft(c)-K.sp; copyOut(`&{template:default} {{name=${c.name} resists ${T.gh.pow}${T.gh.lvl}}} {{Target number=${K.tn}}} {{Body=${r20(c.b.a[0]+(c.b.derm||0),K.tn)}}}`+(K.sp+K.th?` {{Pool or Threat=${r20(K.sp+K.th,K.tn)}}}`:'')+` {{If successes tie=${T.gh.lvl}}}`,'Damage resistance'); T.spend=0;}
  else if(c&&a==='mark'){const R=T.roll; if(R&&R.final){const cur=D(c.id), k=R.stun?'s':'p'; G.dmg[c.id]={...cur,[k]:Math.min(k==='p'?11+c.b.a[0]:10,cur[k]+BOXES[R.final])}; T.roll=null;}}
  else if(c&&a==='refresh'){delete G.pools[c.id];}
  render();});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='sort'){G.sort=t.value;} else if(t.id==='addItem'&&t.value){const k=G.sel+':c'; (G.load[k]=G.load[k]||[]).push(t.value);}
  else if(t.dataset.gname){const g=G.groups.find(x=>x.id===t.dataset.gname); g.name=t.value||g.name;}
  else if(t.id==='encName'){G.enc=t.value||'Encounter';} else if(t.id==='atkSel'){T.atk=+t.value; T.rng=0; T.roll=null;} else if(t.id==='rngSel'){T.rng=+t.value;}
  else if(t.id==='ghKind'){T.gh.kind=t.value; T.roll=null;} else if(t.id==='ghLvl'){T.gh.lvl=t.value; T.roll=null;}
  else if(t.dataset.nf){const k=t.dataset.nf; if(k[0]==='a'&&/^a\d$/.test(k)) T.nf.a[+k[1]]=+t.value; else T.nf[k]=t.value; T.nfOpen=true; return;}
  else if(t.id==='addTo'||t.id==='addN'){T.addTo=$('addTo').value; T.addN=+$('addN').value||1; return;}
  else return; render();});
let qt; document.addEventListener('input',e=>{if(e.target.id==='q'){G.q=e.target.value; clearTimeout(qt); qt=setTimeout(render,200);}});
window.SR2GM={G,T,copies,build,render};
render();
})();
