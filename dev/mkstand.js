const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/'+(process.env.SRC||'sr2-builder.html')); await p.click('#btnNew');
const html=await p.evaluate(()=>window.__sr2.builderFile()); fs.writeFileSync('SR2_Runner_Builder.html',html);
const p2=await b.newPage();p2.on('pageerror',e=>errs.push('stand:'+e.message));await p2.goto('file://'+process.cwd()+'/SR2_Runner_Builder.html');
console.log(await p2.$eval('#bookRow',e=>e.innerText.replace(/\n/g,' | ')));
await p2.check('[data-book="vr2"]'); await p2.selectOption('#gCat','deck'); await p2.selectOption('#gItem','deck:Custom cyberdeck (VR2 à la carte)'); await p2.click('#gAdd');
console.log(await p2.$eval('#deckStats',e=>e.innerText.slice(0,120).replace(/\n/g,' ')));
console.log('errs',errs, html.length);await b.close();})();
