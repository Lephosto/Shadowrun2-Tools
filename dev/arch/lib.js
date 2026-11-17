// Drive the Runner Builder the way a player would: visible controls only (clicks, typing, dropdowns).
const fs=require('fs');
const FILE='file://'+process.cwd()+'/SR2_Runner_Builder.html';
module.exports=function(page,log){
  const p=page, L=m=>log.push(m);
  const self={
    async open(){await p.goto(FILE); await p.waitForTimeout(400);},
    async rules(mode){await p.click(`#sec-rules button[data-mode="${mode}"]`);},
    async prio(o){for(const [c,l] of Object.entries(o)) await p.click(`#sec-prio button[data-cat="${c}"][data-l="${l}"]`);},
    async id(o){if(o.name) await p.fill('#fName',o.name);
      if(o.handle) await p.fill('#fHandle',o.handle);
      if(o.race) await p.selectOption('#fRace',o.race);
      if(o.magic) await p.selectOption('#fMagic',o.magic);
      if(o.trad) await p.fill('#fTradition',o.trad);
      if(o.concept) await p.fill('#fConcept',o.concept);},
    async attrs(o){const m={body:'a_body',qui:'a_quick',str:'a_str',cha:'a_cha',int:'a_int',wil:'a_wil'}; for(const [k,v] of Object.entries(o)){await p.fill('#'+m[k],String(v)); await p.press('#'+m[k],'Tab'); await p.waitForTimeout(420);}},
    async skill(name,r,conc,spec){await p.click('#addSkill'); const i=(await p.$$('#sec-skills select[id^="s_ns_"]')).length-1;
      await p.selectOption(`#s_ns_${i}`,{label:name}).catch(e=>L(`skill "${name}" not in list`)); await p.fill(`#s_r_${i}`,String(r)); await p.press(`#s_r_${i}`,'Tab'); await p.waitForTimeout(420);
      if(conc){await p.selectOption(`#s_n_${i}`,{label:spec?'Specialization':'Concentration'}); await p.waitForTimeout(50);
        const cs=await p.$(`#s_cs_${i}`); if(cs&&(await cs.evaluate(e=>e.tagName))==='SELECT') await p.selectOption(`#s_cs_${i}`,{label:conc}).catch(()=>L(`concentration "${conc}" not offered for ${name}`)); else if(cs) await p.fill(`#s_cs_${i}`,conc);
        if(spec){const ss=await p.$(`#s_s_${i}`); if(ss){if((await ss.evaluate(e=>e.tagName))==='SELECT') await p.selectOption(`#s_s_${i}`,{label:spec}).catch(()=>L(`spec "${spec}" not offered`)); else await p.fill(`#s_s_${i}`,spec);}}}
      return i;},
    async lang(name,r){await p.click('#addLang'); const i=(await p.$$('#sec-skills input[id^="lg_n_"]')).length-1; await p.fill(`#lg_n_${i}`,name); await p.fill(`#lg_r_${i}`,String(r)); await p.press(`#lg_r_${i}`,'Tab'); await p.waitForTimeout(420);},
    async raisePower(type,level){const n=(await p.$$('#magicCard select[id^="p_ty_"]')).length; for(let i=0;i<n;i++){const t=await p.$eval(`#p_ty_${i}`,e=>e.options[e.selectedIndex].text).catch(()=>''); if(t.startsWith(type)){await p.selectOption(`#p_level_${i}`,{label:level}).catch(()=>L(`can't set ${type} to ${level}`)); await p.waitForTimeout(150); return;}} L(`no ${type} row to raise`);},
    async power(type,level,extra){await p.click('#addPower'); const i=(await p.$$('#magicCard select[id^="p_ty_"]')).length-1;
      await p.selectOption(`#p_ty_${i}`,{label:type}).catch(()=>L(`power "${type}" not offered`)); await p.waitForTimeout(60);
      if(level!=null){const s=await p.$(`#p_level_${i}`); if(s) await p.selectOption(`#p_level_${i}`,{label:level}).catch(async()=>{L(`power level "${level}" not offered for ${type}: ${(await s.evaluate(e=>[...e.options].map(o=>o.text).join('/')))}`);});}
      if(extra){for(const [lab,val] of Object.entries(extra)){const sel=await p.$$(`#magicCard tr:nth-child(${i+1}) select`); let done=false; for(const s of sel){const ok=await s.evaluate((e,v)=>[...e.options].some(o=>o.text===v),val); if(ok){await s.selectOption({label:val}); done=true; break;}} if(!done) L(`power ${type}: no choice "${val}"`);}}
      return i;},
    async totem(t){await p.selectOption('#totem',{label:t}).catch(()=>L(`totem ${t} not offered`));},
    async spell(cat,name,force){await p.selectOption('#spCat',{label:cat}); await p.selectOption('#spName',{label:name}).catch(()=>L(`spell ${name} not offered`)); await p.fill('#spForce',String(force)); await p.click('#spAdd');},
    async gear(cat,label,o={}){await p.selectOption('#gCat',cat); const ok=await p.selectOption('#gItem',{label}).then(()=>true).catch(()=>false); if(!ok){L(`gear "${label}" not in ${cat}`); return -1;}
      const before=(await p.$$('#gearBody input[id^="g_q_"]')).length; await p.click('#gAdd'); await p.waitForTimeout(60);
      // the new row: find by highest-numbered g_q_ id
      const ids=await p.$$eval('#gearBody input[id^="g_q_"]',x=>x.map(e=>+e.id.slice(4))); const i=Math.max(...ids);
      if(o.rating!=null){const r=await p.$(`#g_r_${i}`); if(r){if((await r.evaluate(e=>e.tagName))==='SELECT') await r.selectOption(String(o.rating)).catch(async()=>L(`${label}: rating ${o.rating} not offered`)); else {await r.fill(String(o.rating)); await r.press('Tab'); await p.waitForTimeout(420);}} else L(`${label}: no rating box`);}
      if(o.qty!=null){await p.fill(`#g_q_${i}`,String(o.qty)); await p.press(`#g_q_${i}`,'Tab'); await p.waitForTimeout(420);}
      if(o.grade){await p.selectOption(`#g_gr_${i}`,{label:o.grade}).catch(()=>L(`${label}: grade ${o.grade} not offered`));}
      return i;},
    async contact(name,rating,level){const n=(await p.$$('#sec-contacts input[id^="c_n_"]')); let i=-1; for(let k=0;k<n.length;k++){if(!(await n[k].inputValue())){i=k;break;}} if(i<0){await p.click('#addContact'); i=n.length;}
      await p.fill(`#c_n_${i}`,name); if(rating) await p.fill(`#c_r_${i}`,String(rating)); if(level) await p.selectOption(`#c_l_${i}`,{label:level}).catch(()=>{});},
    // tick a checklist row (programs, vehicle mods, host options) by its visible name, then pick a level/rating if given
    async tick(scope,name,level){
      const ob=p.locator(scope+' button:has-text("Open all")').first(); if(await ob.count()) {await ob.click().catch(()=>{}); await p.waitForTimeout(100);}
      const found=await p.evaluate(([sc,n])=>{for(const b of document.querySelectorAll(sc+' input[type=checkbox]')){const li=b.closest('li')||b.closest('label'); const lab=(b.closest('label')||li); const t=(lab.innerText||'').trim(); if(t===n){b.setAttribute('data-tk','1'); const d=b.closest('details'); if(d) d.open=true; return true;}} return false;},[scope,name]);
      if(!found){L(`no tick box "${name}" in ${scope}`); return false;}
      const box=p.locator(scope+' input[data-tk="1"]').first();
      if(await box.isDisabled()){const why=await box.evaluate(b=>(b.closest('li')||b).innerText.replace(/\s+/g,' ').slice(0,200)); L(`"${name}" greyed out: ${why}`); await p.evaluate(()=>document.querySelectorAll('[data-tk]').forEach(b=>b.removeAttribute('data-tk'))); return false;}
      if(!(await box.isChecked())) await box.click(); await p.waitForTimeout(200);
      if(level!=null){const r=await p.evaluate(([sc,n,v])=>{for(const b of document.querySelectorAll(sc+' input[type=checkbox]')){const lab=b.closest('label'); if(lab&&lab.innerText.trim()===n){const li=b.closest('li'); const s=li&&li.querySelector('select'); if(!s) return 'nomenu'; const o=[...s.options].find(o=>o.value===String(v)||o.text.trim().split(' ')[0]===String(v)); if(!o) return 'nolevel:'+[...s.options].map(o=>o.text).join('/'); s.value=o.value; s.dispatchEvent(new Event('change',{bubbles:true})); return 'ok';}} return 'gone';},[scope,name,level]);
        if(r!=='ok') L(`"${name}" level ${level}: ${r.slice(0,200)}`); await p.waitForTimeout(200);}
      await p.evaluate(()=>document.querySelectorAll('[data-tk]').forEach(b=>b.removeAttribute('data-tk'))); return true;},
    async removeGear(i){const row=p.locator(`#gearBody tr:has(#g_q_${i})`); await row.locator('button[aria-label="Remove item"]').click(); await p.waitForTimeout(150);},
    async removePower(i){const row=p.locator(`#magicCard tr:has(#p_ty_${i}), #magicCard tr:has(#p_n_${i})`).first(); await row.locator('button:has-text("×")').click(); await p.waitForTimeout(150);},
    async cash(){await p.click('#rollCash').catch(()=>{});},
    async check(){return p.$eval('#sec-check',e=>e.innerText.replace(/\n+/g,' | ')).catch(()=>'');},
    async summary(){return p.$eval('#sec-sum',e=>e.innerText.replace(/\n+/g,' | ')).catch(()=>'');},
    async inline(){return p.$$eval('.bad-text,.warn-text,.err',x=>x.filter(e=>e.offsetParent&&e.innerText.trim()).map(e=>e.innerText.trim().slice(0,160)));},
    async exportSheet(path){const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#expSheet')]); await dl.saveAs(path);},
    async shot(path){await p.screenshot({path,fullPage:true});},
  };
  return self;
};

// ---- established-runner steps and the Gear Locker (phase 2) ----
module.exports.est=function(p,log){const L=m=>log.push(m); const T=420;
 const type=async(sel,v)=>{await p.fill(sel,String(v)); await p.press(sel,'Tab'); await p.waitForTimeout(T);};
 return {
  async established(){await p.check('#established'); await p.waitForTimeout(200);},
  async karma(n){await type('#kEarned',n);},
  async startingCash(){const t=await p.$eval('#sec-gear',e=>{const m=e.innerText.match(/Starting cash\s+([\d,]+)¥\s*$/m)||e.innerText.match(/Starting cash[^\n]*\n?\s*([\d,]+)¥/); return m?m[1]:null;}); if(!t){L('could not read starting cash'); return 0;} const v=+t.replace(/,/g,''); await type('#nuyenNow',v); return v;},
  async payout(amt,note){await p.fill('#nyAmt',String(amt)); await p.fill('#nyNote',note); await p.click('#nyAdd'); await p.waitForTimeout(200);},
  async raise(start){const v=await p.$eval('#advPick',(s,st)=>{const o=[...s.options].find(o=>o.text.startsWith(st)); return o?o.value:null;},start); if(!v){L(`no Karma option "${start}"`); return false;} await p.selectOption('#advPick',v); await p.click('#advBuy'); await p.waitForTimeout(200); return true;},
  async learn(name){await p.fill('#advNewName',name); await p.click('#advNew'); await p.waitForTimeout(200);},
  async initiate(how){const box=await p.$('#initBox'); if(!box||await box.evaluate(e=>e.hidden)){L('no initiation option shown'); return false;} await p.selectOption('#initHow',how); await p.click('#initBuy'); await p.waitForTimeout(200); return true;},
  async karmaLeft(){return p.$eval('#advAvail',e=>e.innerText).catch(()=>'?');},
  async nuyen(){return p.$eval('#nuyenNow',e=>e.value);},
 };};
module.exports.locker=function(lp,log){const L=m=>log.push(m); const FILE='file://'+process.cwd()+'/SR2_Gear_Locker.html';
 const slug=k=>k.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return {
  async open(){await lp.goto(FILE); await lp.waitForTimeout(400); await lp.evaluate(()=>{});},
  async item(key,o={}){await lp.goto(FILE+'#'+slug(key)); await lp.waitForTimeout(300);
    const title=await lp.$eval('#tag h2,#tag h1,#tag .tt',e=>e.innerText).catch(()=>''); 
    if(o.rating!=null){const r=await lp.$('#rsl'); if(r){await r.evaluate((e,v)=>{e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));},String(o.rating)); await lp.waitForTimeout(120);} else L(`${key}: no rating slider`);}
    if(o.slots){for(const [slot,lab] of Object.entries(o.slots)){const sel=`#tag select[data-gbs="L"][data-slot="${slot}"]`; const v=await lp.$$eval(sel+' option',(op,l)=>{const m=op.find(x=>!x.disabled&&x.text.includes(l)); return m?m.value:null;},lab).catch(()=>null); if(v==null){L(`${key}: no "${lab}" for the ${slot} slot`); continue;} await lp.selectOption(sel,v); await lp.waitForTimeout(120);}}
    if(o.ticks){for(const n of o.ticks){const ok=await lp.evaluate(n=>{for(const b of document.querySelectorAll('#tag input[type=checkbox]')){const lab=b.closest('label'); if(lab&&lab.innerText.trim()===n){if(b.disabled) return 'disabled'; if(!b.checked) b.click(); return 'ok';}} return 'none';},n); if(ok!=='ok') L(`${key}: option "${n}" ${ok}`); await lp.waitForTimeout(120);}}
    if(o.untick){for(const n of o.untick){await lp.evaluate(n=>{for(const b of document.querySelectorAll('#tag input[type=checkbox]')){const lab=b.closest('label'); if(lab&&lab.innerText.trim().startsWith(n)&&b.checked) b.click();}},n); await lp.waitForTimeout(120);}}
    if(o.forGun){const v=await lp.$$eval('#tfg option',(op,l)=>{const m=op.find(x=>x.text.includes(l)); return m?m.value:null;},o.forGun).catch(()=>null); if(v) {await lp.selectOption('#tfg',v);} else L(`${key}: no gun "${o.forGun}" offered`);}
    const btn=await lp.$('#addBuild')||await lp.$('#addHost')||await lp.$('#addVeh')||await lp.$('#addDeck')||await lp.$('#addKit'); if(!btn){L(`${key}: no add button (${title||'item not found'})`); return false;}
    for(let i=0;i<(o.qty||1);i++){await btn.click(); await lp.waitForTimeout(120);} return true;},
  async total(){return lp.$eval('#kit .tot',e=>e.innerText).catch(()=>'?');},
  async send(){await lp.click('#kit [data-send="kit"]'); await lp.waitForTimeout(250);},
  async clear(){const b=await lp.$('#clearKit'); if(b){await b.click(); await lp.waitForTimeout(150);}},
 };};
module.exports.pickup=async function(p,log){await p.reload(); await p.waitForTimeout(500); const bar=await p.$('#xferBar'); if(!bar||await bar.evaluate(e=>e.hidden)){log.push('Gear Locker send not offered in the Builder'); return null;}
  const txt=await bar.innerText(); const pay=await p.$('#xferPay'); const payOn=pay?await pay.isChecked():null; await p.click('#xferAdd'); await p.waitForTimeout(400);
  return {bar:txt.replace(/\s+/g,' ').slice(0,300),payOn,msg:await p.$eval('#saveState',e=>e.innerText).catch(()=>'')};};
