// every R2 vehicle: stock build must be clean; factory mounts within Body; stats parse to numbers
const fs=require('fs');const s=fs.readFileSync('sr2-builder.html','utf8');
eval(fs.readFileSync('shared/vehicles.js','utf8').replace('const VB=','global.VB='));
const R=eval(s.match(/const R2VEH=(\[[\s\S]*?\]);\n/)[1]); const VT=JSON.parse(s.match(/const VTYPE=(\{.*?\});\n/)[1]);
let bad=[];
R.forEach(([n,c,pg,ref,H,Sp,Ac,B,A,Si,Au,P,Se,C,L])=>{const t=VT[n]||['car',0]; const v=VB.veh(n,c,pg,{H,Sp,Ac,B,A,Si,Au,P,Se,C,L},t[0],t[1]);
  const r=VB.calc(v,{type:t[0],mods:[]}); if(!r.ok) bad.push([n,r.bad]);
  for(const k of ['H','Ac','B','A','Si','C','L']) if(!isFinite(v[k])) bad.push([n,'nan',k]);
  if(v.Sp.some(x=>!isFinite(x)||x>3000)) bad.push([n,'Sp',v.Sp]);
  const A2=VB.addable(v,{type:t[0],mods:[]}); // every addable must be addable for real
  A2.yes.forEach(x=>{const r2=VB.calc(v,{type:t[0],mods:[{id:x.d.id,lv:x.lv,opt:x.opt}]}); if(!r2.ok) bad.push([n,'addable but bad',x.d.id,r2.bad]);});
});
console.log('vehicles',R.length,'problems',bad.length); bad.slice(0,20).forEach(x=>console.log(JSON.stringify(x)));
