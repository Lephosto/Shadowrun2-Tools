// Builder: ammo tracker (pool -> gun and spare clips -> fired)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/sr2-builder.html');
await p.evaluate(()=>{const X=window.__sr2,S=X.S; S.gear=[{key:'guns:Mossberg CMDT/SM',qty:1},{key:'guns:Defiance T-250',qty:1},{key:'guns:FN MAG-5 MMG',qty:1},
 {key:'ammo:Spare Clip',qty:3},{key:'ammo:Regular Ammo (10 rounds)',qty:4},{key:'ammo:Gel Rounds (10)',qty:2},{key:'ammo:Regular Ammo (10 rounds)',qty:12}]; X.render();
 const id=S.gear.map(g=>g.gid); S.gear[3].forGun=id[0]; S.gear[4].forGun=id[0]; S.gear[5].forGun=id[0]; S.gear[6].forGun=id[2]; X.render();});
const ids=await p.evaluate(()=>window.__sr2.S.gear.filter(g=>g.gid).map(g=>g.gid));
const st=()=>p.evaluate(()=>{const S=window.__sr2.S;return {T:JSON.parse(JSON.stringify(S.ammoT)),used:S.gear.map(g=>g.used||0)};});
const click=async(gid,act,n)=>{await p.click(`button[data-amo="${act}"][data-gid="${gid}"]${n?`[data-amn="${n}"]`:''}`);};
const M=ids[0], T=ids[1], G=ids[2];
await click(M,'load'); let a=await st(); const t1=a.T[M].in.n===8&&a.used[4]===8;
await click(M,'fill'); a=await st(); const t2=a.T[M].clips.map(c=>c.n).join()==='8,8,8'&&a.used[4]===32;
await click(M,'fire',3); await click(M,'fire',3); await click(M,'fire',1); a=await st(); const t3=a.T[M].in.n===1;
await click(M,'swap'); a=await st(); const t4=a.T[M].in.n===8&&a.T[M].clips.map(c=>c.n).sort().join()==='1,8,8';
// switch to gel and fill: regular rounds in clips go back to the pool
await p.selectOption(`select[data-amosel="${M}"]`,'ammo:Gel Rounds (10)'); await click(M,'fill'); a=await st();
const t5=a.T[M].clips.every(c=>c.t==='ammo:Gel Rounds (10)')&&a.used[5]===20&&a.used[4]===15&&a.T[M].clips.map(c=>c.n).join()==="8,8,4"; // 17 regular back to the pool, 20 gel taken
const gunAmmoTxt=await p.$eval('#weapBody',e=>e.innerText.includes('In gun 8/8 regular'));
// T-250: no clips, internal magazine load; untagged ammo? none untagged -> no pool
const tCard=await p.evaluate(gid=>!!document.querySelector(`button[data-amo="load"][data-gid="${gid}"][disabled]`),T);
// MMG belt
await click(G,'load'); a=await st(); const t6=a.T[G].in.n===120&&a.used[6]===120;
await click(G,'fire',10); a=await st(); const t7=a.T[G].in.n===110;
// lower spare clip qty to 1: extra clips' rounds return
await p.evaluate(()=>{const X=window.__sr2;X.S.gear[3].qty=1;X.render();}); a=await st(); const t8=a.T[M].clips.length===1;
await click(M,'unload'); a=await st(); const t9=!a.used[4]&&!a.used[5]?false:true;
const fired=7; const t10=a.used[4]===fired; // only fired regular rounds remain used
await p.reload(); const t11=await p.evaluate(()=>!!window.__sr2.S.ammoT&&Object.keys(window.__sr2.S.ammoT).length===3);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
const r={t1,t2,t3,t4,t5,gunAmmoTxt,tCard,t6,t7,t8,t10,t11,sw,errs,used:a.used};
const ok=Object.entries(r).every(([k,v])=>k==='used'||k==='errs'?true:k==='sw'?v<=390:v===true)&&!errs.length;
console.log(JSON.stringify({ok,...r}));await b.close(); if(!ok) process.exit(1);})();
