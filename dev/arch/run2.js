// node arch/run2.js <key|all> — phase 1 build, then 40 Karma + 500,000¥ + two initiations spent through the UI
const {chromium}=require('playwright');const fs=require('fs');const UI=require('./lib.js');
const S1=require('./specs.js'), S2=require('./specs2.js');
(async()=>{const want=process.argv[2]||'all'; const b=await chromium.launch(); fs.mkdirSync('arch/out2',{recursive:true});
for(const key of Object.keys(S2)){ if(want!=='all'&&want!==key) continue; const P2=S2[key];
  const ctx=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,acceptDownloads:true}); const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('builder: '+e.message)); const log=[]; const u=UI(page,log); const notes=[];
  const mark=async l=>notes.push({at:l,check:await u.check(),avail:await page.$eval('#advAvail',e=>e.innerText).catch(()=>''),nuyen:await page.$eval('#nuyenNow',e=>e.value).catch(()=>'')});
  await u.open();
  try{
    await S1[key](u,page,async()=>{}); await mark('creation done');
    const E=UI.est(page,log);
    await E.established(); const sc=await E.startingCash(); await E.karma(40); await E.payout(500000,'Run payouts'); await mark(`established; starting cash ${sc}¥ + 500,000¥; 40 Good Karma`);
    for(const how of P2.init||[]) await E.initiate(how); if(P2.init) await mark('after two initiations ('+P2.init.join(', ')+')');
    for(const [type,level,extra] of P2.power||[]) await u.power(type,level,extra); for(const [type,level] of P2.raisePower||[]) await u.raisePower(type,level); if(P2.power||P2.raisePower) await mark('power bought with the new power point');
    for(const [c,n,f] of P2.spells||[]) await u.spell(c,n,f); if(P2.spells) await mark('spells learned with Karma');
    // Gear Locker
    const lp=await ctx.newPage(); lp.on('pageerror',e=>errs.push('locker: '+e.message)); const G=UI.locker(lp,log); await G.open(); await G.clear();
    for(const [k,o] of P2.shop) await G.item(k,o||{});
    notes.push({at:'Gear Locker list',total:await G.total()}); await lp.screenshot({path:`arch/out2/${key}_locker.png`});
    await G.send(); await lp.close();
    const pk=await UI.pickup(page,log); notes.push({at:'Builder picked up the send',pk}); await mark('after the Gear Locker purchase');
    if(P2.after) await P2.after(page,u,log);
    for(const [k] of P2.karma||[]) await E.raise(k); for(const n of P2.learn||[]) await E.learn(n); await mark('after spending Karma');
  }catch(e){log.push('DRIVER ERROR '+e.message.split('\n')[0]);}
  await mark('final'); notes[notes.length-1].summary=await u.summary();
  await u.shot(`arch/out2/${key}.png`);
  for(const id of ['magicCard','deckCard','rigCard','sec-play','sec-gear']){const el=await page.$('#'+id); if(el&&await el.isVisible()) await el.screenshot({path:`arch/out2/${key}__${id}.png`}).catch(()=>{});}
  try{await u.exportSheet(`arch/out2/${key}_sheet.html`);}catch(e){log.push('export failed');}
  fs.writeFileSync(`arch/out2/${key}.json`,JSON.stringify({log,errs,notes},null,1));
  console.log('==',key,'| log:',log.join(' ; ')||'-','| errs:',errs.join(' ; ')||'-');
  for(const n of notes) console.log('  @'+n.at+': '+(n.check?n.check.slice(0,600):'')+(n.avail?' | KARMA '+n.avail:'')+(n.nuyen!==undefined&&n.nuyen!==''?' | ¥ '+n.nuyen:'')+(n.total?' TOTAL '+n.total:'')+(n.pk?' PICKUP '+JSON.stringify(n.pk).slice(0,400):''));
  await ctx.close();}
await b.close();})();
