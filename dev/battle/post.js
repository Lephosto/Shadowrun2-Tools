// After the battle: each player opens their runner in the Builder and updates the sheet by hand, the way a player would.
// node battle/post.js <seed> [key]
const {chromium}=require('playwright'); const fs=require('fs'); const UI=require('../arch/lib.js');
const SEED=process.argv[2]||'8', ONLY=process.argv[3];
const B=JSON.parse(fs.readFileSync(`battle/result_${SEED}.json`)), A=JSON.parse(fs.readFileSync(`battle/after_${SEED}.json`));
const GUN={'Ares Predator II':['Ares Predator II','Regular','Shot',1],'Ingram Smartgun':['Ingram Smartgun','APDS','Burst',3]};
const PAY=25000, KARMA=5;   // GM award: 6 Karma each survivor = 5 Good Karma + 1 to the Karma Pool (core p. 190-191)
// what each player decides to change beyond the numbers
const PLAN={
 sam1:{use:[['Trauma Patch',3]]},
 adept1:{dropPowers:['Improved Ability','Killing Hands']},   // Magic 6 → 5: back down to 5 power points
};
(async()=>{const b=await chromium.launch(); fs.mkdirSync('battle/out',{recursive:true}); const report={};
for(const [key,r] of Object.entries(A.res)){ if(ONLY&&ONLY!==key) continue;
  const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const log=[]; const u=UI(p,log), E=UI.est(p,log); const seen={};
  await u.open(); await u.openJson(`arch/out2/${key}.char.json`);
  const name=await p.$eval('#fName',e=>e.value).catch(()=>key); seen.before=await u.summary();
  // 1. damage on the condition monitor
  const phys=Math.min(r.phys,10+r.body+1), stun=r.stun;
  if(phys){const btn=await p.$(`#trkPhys button[data-v="${phys}"]`); if(btn) await btn.click(); else log.push(`no Physical box ${phys} to click`); await p.waitForTimeout(150);}
  if(stun){await p.click(`#trkStun button[data-v="${stun}"]`); await p.waitForTimeout(150);}
  seen.wounds=await p.$eval('#woundNote',e=>e.innerText).catch(()=>'');
  if(!r.dead){
    // 2. lasting injuries and Magic loss
    if(r.magicLost||r.perm){await p.click('#injBox summary').catch(()=>{}); await p.waitForTimeout(100);
      if(r.magicLost){await p.fill('#inj_magic',String(r.magicLost)); await p.press('#inj_magic','Tab'); await p.waitForTimeout(450);}
      if(r.perm&&r.perm[0]==='attr'){const m={Body:'body',Strength:'str',Quickness:'quick',Intelligence:'int',Willpower:'wil',Reaction:'rea'}[r.perm[1]]; await p.fill(`#inj_${m}`,'1'); await p.press(`#inj_${m}`,'Tab'); await p.waitForTimeout(450);}
      if(r.perm&&r.perm[0]==='part'){await p.fill('#injNote',`${r.perm[1]} mangled; needs a replacement`); await p.press('#injNote','Tab'); await p.waitForTimeout(450);}}
    // 3. ammunition fired, through the ammo tracker
    for(const [gun,n] of Object.entries((B.runners[key]||{}).ammo||{})){const [label,type,btn,per]=GUN[gun]||[gun,'','Shot',1];
      const card=p.locator('#ammoTrack .amcard',{hasText:label}).first();
      if(!(await card.count())){log.push(`ammo tracker has no card for ${label}`); continue;}
      const sel=card.locator('select[data-amosel]'); if(await sel.count()){const v=await sel.evaluate((s,t)=>{const o=[...s.options].find(o=>o.text.startsWith(t)); return o?o.value:null;},type); if(v) await sel.selectOption(v); else log.push(`${label}: no ${type} ammo in the pool`);}
      const load=card.locator('button[data-amo="load"]'); if(await load.isDisabled()){log.push(`${label}: nothing to load (no ammo bought for it)`); continue;}
      await load.click(); await p.waitForTimeout(150);
      for(let i=0;i<Math.ceil(n/per);i++){const f=p.locator('#ammoTrack .amcard',{hasText:label}).first().locator(`button[data-amo="fire"]`,{hasText:btn}); if(await f.isDisabled()){log.push(`${label}: gun ran dry after ${i*per} rounds`); break;} await f.click(); await p.waitForTimeout(60);}
      seen['ammo_'+label]=await p.locator('#ammoTrack .amcard',{hasText:label}).first().innerText();}
    // 4. consumables used
    for(const [item,n] of (PLAN[key]||{}).use||[]){const i=await p.$$eval('#gearBody tr',(rows,it)=>{for(const r of rows){if(r.innerText.includes(it)){const q=r.querySelector('input[id^="g_q_"]'); if(q) return +q.id.slice(4);}} return -1;},item);
      if(i<0){log.push(`no ${item} line`); continue;} const q=+(await p.inputValue(`#g_q_${i}`)); await p.fill(`#g_q_${i}`,String(Math.max(0,q-n))); await p.press(`#g_q_${i}`,'Tab'); await p.waitForTimeout(450); seen['used_'+item]=`${q} → ${q-n}`;}
    // 5. power points after Magic loss
    for(const pw of (PLAN[key]||{}).dropPowers||[]){const i=await p.$$eval('#magicCard select[id^="p_ty_"]',(ss,t)=>{const s=ss.find(s=>s.options[s.selectedIndex].text.startsWith(t)); return s?+s.id.slice(5):-1;},pw); if(i<0){log.push(`no ${pw} power`); continue;} await u.removePower(i);}
    seen.powerBudget=await p.$eval('#powerBudget',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>'');
    // 6. Karma and nuyen
    const k0=+(await p.inputValue('#kEarned'))||0; await p.fill('#kEarned',String(k0+KARMA)); await p.press('#kEarned','Tab'); await p.waitForTimeout(450);
    const kp=+(await p.inputValue('#kPoolBonus'))||0; await p.fill('#kPoolBonus',String(kp+1)); await p.press('#kPoolBonus','Tab'); await p.waitForTimeout(450);
    await E.payout(PAY,'Run payout: the Redmond warehouse job');
    if(r.bill){await p.fill('#nyAmt',String(r.bill)); await p.fill('#nyNote',r.doc?`Hospital (DocWagon ${r.doc} discount)`:'Street doc in the ork underground'); await p.click('#nySpend'); await p.waitForTimeout(200);}
  }
  seen.after=await u.summary(); seen.check=await u.check(); seen.nuyen=await E.nuyen(); seen.karma=await E.karmaLeft();
  await p.$eval('#sec-play',e=>e.scrollIntoView()).catch(()=>{}); const pl=await p.$('#sec-play'); if(pl) await pl.screenshot({path:`battle/out/${key}_inplay.png`}).catch(()=>{});
  await u.exportSheet(`battle/out/${key}_sheet.html`); await u.exportJson(`battle/out/${key}.char.json`);
  report[key]={name,log,errs,seen}; console.log('==',key,name,'| log:',log.join(' ; ')||'-','| errs:',errs.join(' ; ')||'-');
  await ctx.close();}
fs.writeFileSync(`battle/out/post_${ONLY||'all'}.json`,JSON.stringify(report,null,1)); await b.close();})();
