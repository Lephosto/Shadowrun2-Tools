// node arch/run.js <spec name|all>  — builds characters through the Builder UI and records what the player sees
const {chromium}=require('playwright');const fs=require('fs');const UI=require('./lib.js');
const SPECS=require('./specs.js');
(async()=>{const want=process.argv[2]||'all'; const b=await chromium.launch(); fs.mkdirSync('arch/out',{recursive:true});
for(const [key,spec] of Object.entries(SPECS)){ if(want!=='all'&&want!==key) continue;
  const ctx=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,acceptDownloads:true}); const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); const log=[]; const u=UI(page,log); const notes=[];
  await u.open();
  try{ await spec(u,page,async label=>{notes.push({at:label,check:await u.check(),inline:await u.inline()});}); }catch(e){log.push('DRIVER ERROR '+e.message.split('\n')[0]);}
  notes.push({at:'final',check:await u.check(),inline:await u.inline(),summary:await u.summary()});
  await u.shot(`arch/out/${key}.png`);
  for(const id of ['magicCard','deckCard','rigCard','sec-weap','sec-skills','sec-gear','sec-attr']){const el=await page.$('#'+id); if(el&&await el.isVisible()) await el.screenshot({path:`arch/out/${key}__${id}.png`}).catch(()=>{});} try{await u.exportSheet(`arch/out/${key}_sheet.html`);}catch(e){log.push('export failed '+e.message.split('\n')[0]);}
  fs.writeFileSync(`arch/out/${key}.json`,JSON.stringify({log,errs,notes},null,1));
  console.log('==',key,'| log:',log.join(' ; ')||'-','| errs:',errs.join(' ; ')||'-');
  for(const n of notes) console.log('  @'+n.at+': '+n.check.slice(0,900)+(n.inline.length?'  INLINE: '+n.inline.join(' / ').slice(0,500):''));
  await ctx.close();}
await b.close();})();
