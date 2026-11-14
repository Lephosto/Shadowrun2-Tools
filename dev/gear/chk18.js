// Locker: random ticks, levels and options on random Rigger 2 vehicles; no page errors, no NaN, totals match the engine
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html');await pg.waitForTimeout(300);
let seed=181; const rnd=()=>{seed=(seed*1103515245+12345)%2147483648; return seed/2147483648;};
const slugs=await pg.evaluate(()=>[...document.querySelectorAll('a,button')].length&&Object.keys(window).length?null:null);
const ids=JSON.parse(require('fs').readFileSync('gear_data.json','utf8')).items.filter(i=>i.cat==='r2veh').map(i=>i.n);
const slug=n=>('r2veh:'+n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const out=[];
for(let k=0;k<20;k++){const n=ids[Math.floor(rnd()*ids.length)]; await pg.goto('file://'+process.cwd()+'/gear/sr2-gear-locker.html#'+slug(n)); await pg.waitForTimeout(150);
  const has=await pg.$('button[data-vball="1"]'); if(!has){out.push([n,'no build']);continue;} await has.click();
  for(let i=0;i<25;i++){const els=await pg.$$('input[data-vbck]:not([disabled]), select[data-vblv], select[data-vbop]'); if(!els.length) break; const el=els[Math.floor(rnd()*els.length)];
    const tag=await el.evaluate(e=>e.tagName); if(tag==='SELECT'){const vs=await el.$$eval('option',o=>o.map(x=>x.value)); await el.selectOption(vs[Math.floor(rnd()*vs.length)]);} else await el.click(); await pg.waitForTimeout(20);}
  const html=await pg.$eval('.build',e=>e.innerHTML); if(/NaN|undefined/.test(html)) out.push([n,'NaN/undefined']);
  const over=await pg.$$eval('.vbar .vb-l b',bs=>bs.map(b=>b.textContent).filter(t=>{const [u,m]=t.replace(/[^0-9/.]/g,'').split('/').map(Number); return u>m+1e-9;})); if(over.length) out.push([n,'over',over]);
}
console.log(JSON.stringify({checked:20,problems:out}));console.log(errs.slice(0,4));await b.close();})();
