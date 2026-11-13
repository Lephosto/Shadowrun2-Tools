// ---------- Color modes, shared by both tools ----------
// Each page defines SKINENV = {map:{paletteKey:'--its-token'}, sel:'id of the <select>'}. The choice is saved under 'sr2-skin',
// so both tools on the same site open in the same colors. System/Light/Dark use the page's own tokens; the skins set every token inline.
const SKIN=(()=>{
const KEY='sr2-skin';
const P={
  matrix:{label:'Matrix (green screen)',base:'dark',mono:true,bg:'#020a04',panel:'#06140b',panel2:'#0b2013',ink:'#c2ffd2',muted:'#6cbc86',line:'#1d4a2c',accent:'#3dff7f',accentInk:'#021006',accentSoft:'#0e3a1d',ok:'#3dff7f',okSoft:'#0e3a1d',warn:'#e8ff66',warnSoft:'#2b3410',bad:'#ff6a5f',badSoft:'#3a1411',price:'#9dffbc'},
  neon:{label:'Neon (Seattle at night)',base:'dark',bg:'#0d0718',panel:'#160d26',panel2:'#211339',ink:'#f4ebff',muted:'#b19dd0',line:'#3b2662',accent:'#ff4fae',accentInk:'#1a0310',accentSoft:'#3f1337',ok:'#33f0d2',okSoft:'#0e3535',warn:'#ffd447',warnSoft:'#3a2e10',bad:'#ff6682',badSoft:'#401425',price:'#33f0d2'},
  amber:{label:'Amber terminal',base:'dark',mono:true,bg:'#110b02',panel:'#1b1306',panel2:'#271b09',ink:'#ffdcaa',muted:'#c9a066',line:'#4c3615',accent:'#ffb31a',accentInk:'#1a1000',accentSoft:'#3e2b07',ok:'#cbe26e',okSoft:'#2a3110',warn:'#ffd166',warnSoft:'#3d2c0a',bad:'#ff7f59',badSoft:'#3e1b0e',price:'#ffcb52'},
  paper:{label:'Paper (printed sheet)',base:'light',bg:'#ebe3d2',panel:'#fbf7ee',panel2:'#f2eadb',ink:'#2a2016',muted:'#6a5a44',line:'#d5c6ab',accent:'#8c2a10',accentInk:'#ffffff',accentSoft:'#f3ddd0',ok:'#3b6a1d',okSoft:'#e3ebd1',warn:'#875700',warnSoft:'#f3e2c0',bad:'#a3221a',badSoft:'#f4d7d1',price:'#8c2a10'},
  contrast:{label:'High contrast',base:'dark',bg:'#000000',panel:'#000000',panel2:'#141414',ink:'#ffffff',muted:'#dadada',line:'#9a9a9a',accent:'#ffe600',accentInk:'#000000',accentSoft:'#332e00',ok:'#66ff94',okSoft:'#0a2a12',warn:'#ffbe57',warnSoft:'#332000',bad:'#ff7a7a',badSoft:'#3a0d0d',price:'#8adcff'}
};
const LIST=[['system','Match my device'],['light','Light'],['dark','Dark'],...Object.entries(P).map(([k,v])=>[k,v.label])];
let set=[];
const env=()=>(typeof SKINENV!=='undefined'?SKINENV:{map:{}});
function get(){try{const v=localStorage.getItem(KEY); return LIST.some(x=>x[0]===v)?v:'system';}catch(e){return 'system';}}
function apply(id,save){const R=document.documentElement, E=env();
  set.forEach(t=>R.style.removeProperty(t)); set=[]; R.style.removeProperty('color-scheme'); R.removeAttribute('data-skin');
  if(id==='light'||id==='dark') R.setAttribute('data-theme',id); else R.removeAttribute('data-theme');
  const p=P[id];
  if(p){R.setAttribute('data-theme',p.base); R.setAttribute('data-skin',id); R.style.setProperty('color-scheme',p.base);
    Object.entries(E.map).forEach(([k,tok])=>{const v=k==='font'?(p.mono?E.mono:null):p[k]; if(v){R.style.setProperty(tok,v); set.push(tok);}});}
  if(save){try{localStorage.setItem(KEY,id);}catch(e){}}
  const s=E.sel&&document.getElementById(E.sel); if(s&&s.value!==id) s.value=id;}
function options(cur){return LIST.map(([k,l])=>`<option value="${k}"${k===cur?' selected':''}>${l}</option>`).join('');}
function init(){const E=env(); const s=E.sel&&document.getElementById(E.sel); const cur=get();
  if(s){s.innerHTML=options(cur); s.addEventListener('change',()=>apply(s.value,true));}
  apply(cur,false);
  window.addEventListener('storage',e=>{if(e.key===KEY) apply(get(),false);});}
return {P,LIST,get,apply,init};
})();
