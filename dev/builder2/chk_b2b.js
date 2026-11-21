// Runner Builder 2 check: drone, Matrix and spirit attacks on three made-up runners. Exits 1 on a failure.
const {chromium}=require('playwright'); let bad=0; const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m);}}; const seen={};
const mk=o=>Buffer.from(JSON.stringify(Object.assign({mode:'house',prio:{race:'',magic:'',attr:'',skills:'',res:''},attrs:{body:4,quick:5,str:3,cha:3,int:5,wil:5},powers:[],contacts:[],books:{ssc:true,r2:true,vr2:false,fof:true},established:true},o)),'utf8').toString('base64');
const C={
 rigger:mk({name:'Rig',race:'Human',magic:'none',skills:[{name:'Gunnery',rating:5,narrow:'none'}],gear:[{key:'r2veh:Steel Lynx Ground Combat Drone',qty:1,cat:'r2veh'},{key:'guns:Ingram Valiant',qty:1,cat:'guns',at:'Steel Lynx Ground Combat Drone'}]}),
 decker:mk({name:'Deck',race:'Human',magic:'none',skills:[{name:'Computer',rating:6,narrow:'none'}],gear:[{key:'deck:Fuchi Cyber-4',qty:1,cat:'deck'},{key:'prog:Attack',qty:1,cat:'prog',r:4,loaded:true}]}),
 mage:mk({name:'Mage',race:'Human',magic:'hermetic',skills:[{name:'Sorcery',rating:6,narrow:'none'}],spirits:[{t:'fire',f:4,sv:2}],powers:[{name:'Mana Bolt',cost:4},{name:'Armor',cost:3}]})};
(async()=>{const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1300,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/SR2_Runner_Builder_2.html');
 for(const [k,code] of Object.entries(C)){ await p.fill('#importBox',code); await p.click('#doImport'); await p.waitForTimeout(300); await p.click('#b2tabs [data-tab=night]');
  const want=await p.$$eval('[data-b2=wid] option',o=>o.map(x=>x.value).find(v=>/^(v|m|s\d)/.test(v))); if(!want){console.log('  no special attack'); continue;}
  await p.selectOption('[data-b2=wid]',want); await p.waitForTimeout(150);
  if(k==='rigger'){await p.selectOption('[data-b2=mode]','b1'); await p.click('[data-b2s=spend][data-d="1"]');}
  if(k==='mage'){ } 
  seen[k]=await p.$eval('#b2night .b2two',e=>e.innerText);
  await p.click('[data-b2a=copy]'); console.log('   copy:',await p.$eval('#b2r20',e=>e.value).catch(()=>'-'));
  if(k==='rigger'){await p.selectOption('[data-b2=dmode]','auto'); console.log('   auto:',(await p.$eval('#b2night .b2nums',e=>e.innerText)).replace(/\n+/g,' | '));}
  if(k==='mage'){console.log('   spirits panel:',(await p.$$eval('.b2pan h3',x=>x.map(y=>y.textContent))).join(','));
   await p.selectOption('[data-b2=spt]','earth'); await p.$eval('.b2more',d=>d.open=true); await p.click('[data-b2a=spadd]'); console.log('   after add:',await p.$$eval('[data-b2=wid] option',o=>o.map(x=>x.textContent).filter(t=>/elemental/.test(t)).join(' / ')));}
  if(k==='mage'){await p.selectOption('[data-b2=wid]','sp0'); const t0=+(await p.$eval('#b2night .b2r.tot b',e=>e.textContent)); await p.click('[data-b2a=susadd]'); await p.waitForTimeout(150);
   const t1=+(await p.$eval('#b2night .b2r.tot b',e=>e.textContent)); ok(t1===t0+2,'sustaining adds +2 ('+t0+' to '+t1+')');
   ok((await p.$eval('#b2night .b2drain',e=>e.innerText)).includes('with sustaining'),'Drain includes sustaining');
   await p.click('[data-b2sus="0"]'); await p.waitForTimeout(150); ok(+(await p.$eval('#b2night .b2r.tot b',e=>e.textContent))===t0,'dropping removes it');}
  await p.click('#b2tabs [data-tab=build]');
 }
 ok(/Gunnery 5 \+ half Sensor/.test(seen.rigger)&&/10D/.test(seen.rigger),'drone burst');
 ok(/Attack rating 4/.test(seen.decker),'matrix attack'); ok(/F\+1 = 5/.test(seen.mage)&&/4M/.test(seen.mage),'fire elemental');
 ok(!errs.length,'page errors '+errs.join(' | ')); console.log(bad?bad+' failed':'builder 2 drones, Matrix, spirits: all good'); await b.close(); process.exit(bad?1:0);})();
