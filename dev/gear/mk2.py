#!/usr/bin/env python3
"""Make gear/template2.html (the redesigned Gear Locker) from gear/template.html.
Same data, rules code and build-outs; new layout: sources panel, category picker, grouped list,
filters drawer, tabbed item panel, collapsible shopping list. Run from the scratchpad folder."""
import re,sys
s=open('gear/template.html').read()
n_ok=0
def rep(old,new,count=1):
    global s,n_ok
    k=s.count(old)
    if k!=count: sys.exit(f'expected {count}, found {k}: {old[:90]!r}')
    s=s.replace(old,new); n_ok+=1
def rerx(pat,new,flags=re.S):
    global s,n_ok
    s2,k=re.subn(pat,lambda m:new,s,count=1,flags=flags)
    if k!=1: sys.exit('regex miss: '+pat[:90])
    s=s2; n_ok+=1

# ---------- CSS: replace the layout block (grid .. kit) with the new layout ----------
rerx(r"\.grid\{display:grid;grid-template-columns:220px.*?\n\.empty\{", r""".grid{display:grid;grid-template-columns:minmax(290px,370px) minmax(0,1fr) minmax(290px,350px);gap:14px;align-items:start}
.grid.kitc{grid-template-columns:minmax(290px,370px) minmax(0,1fr) 64px}
.shelf,.tag,.kit{background:var(--panel);border:1px solid var(--line);border-radius:8px;min-width:0}
.shelf{display:flex;flex-direction:column;max-height:calc(100vh - 24px);position:sticky;top:calc(env(safe-area-inset-top,0px) + 8px);overflow:hidden}
.bhd{display:flex;flex-direction:column;gap:8px;padding:12px;border-bottom:1px solid var(--line)}
.lbl{font:600 .6875rem var(--body);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
#q{font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--panel2);color:var(--ink);width:100%;min-height:44px}
.brow{display:flex;gap:8px}
.catbtn{flex:1;min-width:0;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;padding:4px 12px;border-radius:6px;border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--panel));color:var(--ink);font:inherit;cursor:pointer}
.catbtn .cbt{display:flex;flex-direction:column;min-width:0}
.catbtn .cbd{font:600 .6875rem var(--body);letter-spacing:.07em;text-transform:uppercase;color:var(--accent)}
.catbtn .cbn{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.catbtn .cbn span{font:400 .8125rem var(--mono);color:var(--muted)}
.catbtn svg,.srcbtn svg,.kbtn svg{flex:none}
.ftog{min-height:48px;padding:0 12px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 .875rem var(--body);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ftog .fn{background:var(--accent);color:var(--accent-ink);border-radius:999px;min-width:20px;height:20px;font-size:.75rem;display:inline-flex;align-items:center;justify-content:center;padding:0 5px}
.fbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px;border:1px solid var(--line);border-radius:6px;background:var(--panel2)}
.fbar[hidden]{display:none}
.fbar .fl{display:flex;flex-direction:column;gap:3px;min-width:0}
.fbar .fl.wide{grid-column:1/-1}
.fbar .fl>span{font:600 .6875rem var(--body);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.fbar select,.fbar input{font:.875rem var(--body);border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:5px;padding:6px;max-width:100%;min-height:36px}
.fbar input[type=number]{width:100%}
.sortrow{display:flex;gap:6px}.sortrow select{flex:1;min-width:0}
.dir{font:600 .8125rem var(--mono);border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:5px;padding:3px 10px;cursor:pointer;min-height:36px}
.lv{display:flex;gap:4px}
.lv button{font:600 .75rem var(--mono);width:2.25rem;min-height:32px;border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:4px;cursor:pointer}
.lv button[aria-pressed="true"]{background:var(--ink);color:var(--panel);border-color:var(--ink)}
.fbar .clr{grid-column:1/-1;justify-self:end;font:600 .8125rem var(--body);background:none;border:0;color:var(--accent);cursor:pointer;padding:4px 0}
.achips{display:flex;flex-wrap:wrap;gap:6px}.achips:empty{display:none}
.achip{min-height:32px;padding:0 10px;border-radius:999px;border:1px solid var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--panel));color:var(--ink);font:500 .8125rem var(--body);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.lhd{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 12px;font-size:.8125rem;color:var(--muted)}
.linkb{background:none;border:0;color:var(--accent);font:600 .8125rem var(--body);cursor:pointer;min-height:32px;padding:0}
#list{overflow:auto;flex:1;min-height:120px}
.grph{position:sticky;top:0;z-index:1;width:100%;min-height:44px;display:flex;align-items:center;gap:8px;padding:0 12px;background:var(--panel2);border:0;border-top:1px solid var(--line);color:var(--ink);font:600 .875rem var(--body);cursor:pointer;text-align:left}
.grph .gl{flex:1;min-width:0}.grph .gr{font:400 .75rem var(--mono);color:var(--muted);white-space:nowrap}
.grph .gn{font:500 .75rem var(--mono);background:var(--line);border-radius:999px;padding:1px 8px}
.grph svg{transition:transform .15s}.grph[aria-expanded="true"] svg{transform:rotate(90deg)}
.item .stat{font:500 .75rem var(--mono);color:var(--ink);white-space:nowrap}
.item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:9px 12px 9px 30px;border:0;border-bottom:1px solid var(--line);cursor:pointer;background:none;border-left:3px solid transparent;width:100%;text-align:left;color:var(--ink);font:inherit}
.flat .item{padding-left:12px}
.item:hover{background:var(--panel2)}
.item[aria-current="true"]{background:var(--panel2);border-left-color:var(--accent)}
.item .nm{font-weight:600;overflow-wrap:anywhere}
.item .pr{font:500 .875rem var(--mono);color:var(--price);text-align:right;white-space:nowrap}
.item .sub{grid-column:1/-1;font-size:.8125rem;color:var(--muted);display:flex;gap:8px;align-items:center;min-width:0}
.item .sub .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.picker{position:absolute;left:0;right:0;bottom:0;background:var(--panel);border-top:1px solid var(--line);overflow:auto;padding:4px 12px 16px;z-index:5;display:flex;flex-direction:column;gap:12px}
.picker[hidden]{display:none}
.pk-d{display:flex;flex-direction:column;gap:6px}
.pk-h{display:flex;justify-content:space-between;align-items:baseline;padding-top:8px;font:600 .9375rem var(--display)}.pk-h span{font:400 .75rem var(--mono);color:var(--muted)}
.pk-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.pk-g button{min-height:44px;text-align:left;padding:6px 10px;border-radius:6px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);font:500 .8125rem var(--body);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:6px}
.pk-g button span:last-child{font:.75rem var(--mono);opacity:.8}
.pk-g button[aria-current="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.srcbtn,.kbtn{min-height:40px;padding:0 12px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 .875rem var(--body);cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.srcbtn[hidden]{display:none}
.srcbtn .n{font:400 .8125rem var(--mono);color:var(--muted)}
.srcp{background:var(--panel);border:1px solid var(--line);border-radius:8px;margin-bottom:14px}
.srcp[hidden]{display:none}
.srcp-h{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:1px solid var(--line)}
.srcp-h .note{flex:1 1 260px}
.srcp-a{display:flex;gap:6px}
.chipb{min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);font:500 .8125rem var(--body);cursor:pointer}
#books{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;padding:12px}
.bk{min-height:52px;text-align:left;border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:10px;background:var(--panel2);color:var(--ink);border:1px solid var(--line);cursor:pointer;font:inherit}
.bk[aria-pressed="true"]{border-color:var(--bc);background:color-mix(in srgb,var(--bc) 14%,var(--panel))}
.bk .bx{width:18px;height:18px;flex:none;border-radius:4px;border:2px solid var(--muted);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--panel)}
.bk[aria-pressed="true"] .bx{background:var(--bc);border-color:var(--bc)}
.bk .bt{display:flex;flex-direction:column;min-width:0}.bk .bt b{font-size:.8125rem}.bk .bt span{font:.75rem var(--mono);color:var(--muted)}
.tag{display:flex;flex-direction:column;min-height:420px}
.tag .thd{padding:18px 20px 8px}
.tabs{display:flex;flex-wrap:wrap;gap:2px;padding:0 12px;border-bottom:1px solid var(--line)}
.tabs button{min-height:44px;padding:0 14px;background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);font:600 .875rem var(--body);cursor:pointer}
.tabs button[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--accent)}
.tabs .tn{font:400 .75rem var(--mono);margin-left:4px}
.tpanel{padding:14px 20px 20px;flex:1}
.tbar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--line);background:var(--panel2);border-radius:0 0 8px 8px}
.tbar .tp{display:flex;flex-direction:column}.tbar .tp b{font:600 1.125rem var(--mono);color:var(--price)}.tbar .tp span{font-size:.75rem;color:var(--muted)}
.tbar .ta{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.btn.big{min-height:44px;padding:0 16px;font-size:.875rem}
.kit{position:sticky;top:calc(env(safe-area-inset-top,0px) + 8px);max-height:calc(100vh - 24px);display:flex;flex-direction:column;overflow:hidden}
.kit .khd{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line)}
.kit .khd b{font:600 1rem var(--display);letter-spacing:.02em}
.kit .kbody{overflow:auto;flex:1}
.kit .kg{padding:10px 14px 4px;font:600 .6875rem var(--body);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.kl{padding:8px 14px 10px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:6px;font-size:.875rem}
.kl .kt{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.kl .kt b{font-weight:600;min-width:0;overflow-wrap:anywhere}
.kl .c{font-family:var(--mono);color:var(--price);white-space:nowrap}
.kl .kn{font-size:.75rem;color:var(--muted)}
.kl .ka{display:flex;justify-content:space-between;align-items:center;gap:8px}
.qty{display:inline-flex;align-items:center;gap:6px}.qty span{font-family:var(--mono);min-width:22px;text-align:center}
.sq{width:34px;height:34px;border-radius:6px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);font-size:1rem;cursor:pointer}
.sq:disabled{opacity:.4;cursor:default}
.xb{min-height:34px;padding:0 10px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:500 .75rem var(--body);cursor:pointer}
.kfoot{border-top:1px solid var(--line);background:var(--panel2);padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.ktot{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ktot div{display:flex;flex-direction:column}.ktot b{font:600 1.125rem var(--mono)}
.klg{display:flex;flex-wrap:wrap;gap:6px}
.kwarn{font-size:.75rem;color:var(--warn)}
.kact{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.kact .btn{min-height:40px}.kact .full{grid-column:1/-1}
.krail{flex:1;min-height:360px;width:100%;background:none;border:0;color:var(--ink);padding:14px 4px;display:flex;flex-direction:column;align-items:center;gap:14px;cursor:pointer;font:inherit}
.krail .rn{background:var(--accent);color:var(--accent-ink);border-radius:999px;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font:700 .8125rem var(--mono)}
.krail .rv{writing-mode:vertical-rl;font:600 .9375rem var(--display);letter-spacing:.04em}
.krail .rt{writing-mode:vertical-rl;font:.8125rem var(--mono);color:var(--muted)}
.krail .rx{writing-mode:vertical-rl;font:700 .6875rem var(--body);padding:8px 2px;border-radius:999px;background:color-mix(in srgb,var(--price) 18%,var(--panel));color:var(--price)}
.lgl-legal{color:var(--good)}
.btn:disabled{opacity:.45;cursor:default}
.empty{""",)

# drop the old .kit / kitchip / back rules that the new layout replaces, and the old breakpoints
rerx(r"\.kitchip\{[^\n]*\n", "")
rerx(r"\.back\{display:none;[^\n]*\n@media \(max-width:760px\)\{\.back\{display:inline-block\}\}\n", ".back{display:none;font:600 .8125rem var(--body);color:var(--accent);text-decoration:none;margin-bottom:6px}\n")
rerx(r"\.kit\{margin-top:14px;.*?\.kit li \.c\{[^\n]*\n", "")
rerx(r"@media \(max-width:1100px\)\{\.grid\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.2fr\)\}[^\n]*\n@media \(max-width:760px\)\{[^\n]*\n",
"""@media (max-width:1180px){.grid,.grid.kitc{grid-template-columns:minmax(280px,340px) minmax(0,1fr)} .kit{grid-column:1/-1;position:static;max-height:none} .krail{min-height:0;flex-direction:row;justify-content:center;padding:12px} .krail .rv,.krail .rt,.krail .rx{writing-mode:horizontal-tb}}
@media (max-width:760px){.grid,.grid.kitc{grid-template-columns:minmax(0,1fr)} .shelf{position:relative;top:0;max-height:70vh} .back{display:inline-block} .tbar{position:sticky;bottom:0} .tblw th,.tblw td{padding:5px 7px} .pk-g{grid-template-columns:minmax(0,1fr)}}
""")
rep(".books{display:flex;flex-wrap:wrap;gap:6px}\n", "")
rep(".chip{font:600 .75rem var(--body);", ".chip{display:none;font:600 .75rem var(--body);")

# ---------- HTML skeleton ----------
rerx(r'<div class="wrap">\n<header>.*?<div id="sendDlg" class="sd" hidden></div>', '''<div class="wrap">
<header>
  <h1>SR2 Gear Locker<small>Core and ten sourcebooks · gear, spells, adept powers, Edges and Flaws, metavariants</small></h1>
  <div class="tools">
    <button type="button" class="srcbtn" id="srcBtn" aria-expanded="false" aria-controls="srcPanel"></button>
    <div class="charbar" id="charbar"></div>
    <label class="skin" for="skinSel">Colors <select id="skinSel"></select></label>
  </div>
</header>
<section class="srcp" id="srcPanel" aria-label="Sources" hidden>
  <div class="srcp-h"><button type="button" class="srcbtn" id="srcClose" aria-expanded="true" aria-controls="srcPanel" style="border-color:transparent;background:none"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg>Sources <span class="n" id="srcCount"></span></button>
    <span class="note">Only gear from the books you tick shows up. Your GM decides which books are in play.</span>
    <span class="srcp-a"><button type="button" class="chipb" id="srcAll">All books</button><button type="button" class="chipb" id="srcCore">Core only</button></span></div>
  <div id="books" role="group" aria-label="Books"></div>
</section>
<div class="grid" id="grid">
  <section class="shelf" aria-label="Browse">
    <div class="bhd">
      <label class="lbl" for="q">Search all <span id="qn"></span> items</label>
      <input id="q" type="search" placeholder="Name, maker, stat or book" autocomplete="off">
      <div class="brow">
        <button type="button" class="catbtn" id="catBtn" aria-expanded="false" aria-controls="picker"><span class="cbt"><span class="cbd" id="catDept"></span><span class="cbn"><b id="catName">All gear</b> <span id="count"></span></span></span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button>
        <button type="button" class="ftog" id="ftog" aria-expanded="false" aria-controls="fbar"></button>
      </div>
      <div class="fbar" id="fbar" aria-label="Filters" hidden></div>
      <div class="achips" id="achips"></div>
    </div>
    <div class="lhd"><span id="lnote"></span><button type="button" class="linkb" id="grpAll"></button></div>
    <div id="list" aria-label="Items"></div>
    <div class="picker" id="picker" role="dialog" aria-label="Pick a category" hidden></div>
  </section>
  <article class="tag" id="tag" aria-live="polite"></article>
  <aside class="kit" id="kit" aria-label="Shopping list"></aside>
</div>
<div id="sendDlg" class="sd" hidden></div>''')

# ---------- storage: its own key, seeded once from the old Locker ----------
rep("let st={books:{core:1,ssc:1,r2:1,vr2:1,fof:1,st:1,ct:1,csh:1,gr:1,aw:1,co:1},cat:'all',q:'',sort:'book',dir:1,f:{},sel:null,rate:{},kit:[]};",
    "let st={books:{core:1,ssc:1,r2:1,vr2:1,fof:1,st:1,ct:1,csh:1,gr:1,aw:1,co:1},cat:'all',q:'',sort:'book',dir:1,f:{},sel:null,rate:{},kit:[],tab:'overview',open:{},srcOpen:false,kitOpen:true};\nconst SKEY='sr2gear2';")
rep("try{const s=JSON.parse(localStorage.getItem('sr2gear')||'null'); if(s){",
    "try{const s=JSON.parse(localStorage.getItem(SKEY)||localStorage.getItem('sr2gear')||'null'); if(s){if(typeof s.kitOpen==='boolean') st.kitOpen=s.kitOpen; if(typeof s.srcOpen==='boolean') st.srcOpen=s.srcOpen; if(typeof s.tab==='string') st.tab=s.tab; if(typeof s.cat==='string') st.cat=s.cat; ")
rep("const save=()=>{try{localStorage.setItem('sr2gear',JSON.stringify({",
    "const save=()=>{try{localStorage.setItem(SKEY,JSON.stringify({kitOpen:st.kitOpen,srcOpen:st.srcOpen,tab:st.tab,cat:st.cat,")

# ---------- search covers everything ----------
rep("return ITEMS.filter(i=>(st.cat==='owned'?!!OWN[i.id]:visible(i)&&(st.cat==='all'||i.cat===st.cat)&&legalShows(i))&&",
    "const anyCat=!!words.length;\n  return ITEMS.filter(i=>(st.cat==='owned'&&!anyCat?!!OWN[i.id]:visible(i)&&(anyCat||st.cat==='all'||i.cat===st.cat)&&legalShows(i))&&")
rep("  const fs=filtersFor(st.cat);\n  for(const [k,v] of activeFilters())", "  const fs=st.q.trim()?[]:filtersFor(st.cat);\n  for(const [k,v] of activeFilters())")

# ---------- books, categories, filters, list ----------
rerx(r"function renderBooks\(\)\{.*?\n\}\nfunction renderCats\(\)\{.*?\n\}\n", r'''function renderBooks(){
  const n={}; ITEMS.forEach(i=>{n[i.src]=(n[i.src]||0)+1;});
  $('books').innerHTML=Object.entries(BOOK).map(([k,[full,ab,c]])=>`<button type="button" class="bk" style="--bc:var(${c})" data-book="${k}" aria-pressed="${!!st.books[k]}"><span class="bx" aria-hidden="true">${st.books[k]?'✓':''}</span><span class="bt"><b>${esc(full)}</b><span>${esc(ab)} · ${fmt(n[k]||0)} items</span></span></button>`).join('');
  const on=Object.keys(BOOK).filter(k=>st.books[k]).length, all=Object.keys(BOOK).length, txt=on===all?`all ${all} books`:`${on} of ${all} books`;
  $('srcCount').textContent=txt; $('srcPanel').hidden=!st.srcOpen;
  $('srcBtn').hidden=st.srcOpen; $('srcBtn').setAttribute('aria-expanded',String(st.srcOpen));
  $('srcBtn').innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3.5h4.5A1.5 1.5 0 0 1 8 5v8a1.5 1.5 0 0 0-1.5-1.5H2zM14 3.5H9.5A1.5 1.5 0 0 0 8 5v8a1.5 1.5 0 0 1 1.5-1.5H14z"/></svg>Sources <span class="n">${txt}</span>`;
}
// departments for the category picker; any category not listed lands under "Other"
const DEPTS=[['Weapons',['melee','ranged','guns','ammo','boom']],['Armor',['armor']],['Cyberware and bioware',['head','body','bio']],['Matrix',['deck','prog','prog2','soft']],['Rigging',['r2veh','veh','rc','vweap']],['Magic',['magic','spell','power']],['Gear',['elec','surv','med','chem','tools']],['Character',['ef','meta']]];
function deptOf(c){const d=DEPTS.find(x=>x[1].includes(c)); return d?d[0]:c==='all'||c==='owned'?'':'Other';}
function catCounts(){const counts={}; ITEMS.forEach(i=>{if(visible(i)&&legalShows(i)) counts[i.cat]=(counts[i.cat]||0)+1;}); return counts;}
function renderCats(){
  const counts=catCounts(); const total=Object.values(counts).reduce((a,b)=>a+b,0);
  if(st.cat==='owned'&&!OWNC) st.cat='all';
  const btn=(c,l,n)=>`<button type="button" data-cat="${c}" aria-current="${st.cat===c}"><span>${esc(l)}</span><span>${fmt(n)}</span></button>`;
  const known=new Set(DEPTS.flatMap(d=>d[1])), other=DATA.cats.map(c=>c[0]).filter(c=>!known.has(c));
  const depts=DEPTS.concat(other.length?[['Other',other]]:[]).map(([d,cs])=>[d,cs.filter(c=>counts[c]||c===st.cat)]).filter(([,cs])=>cs.length);
  $('picker').innerHTML=`<div class="pk-d"><div class="pk-g" style="padding-top:10px">${btn('all','All gear',total)}${OWNC?btn('owned','Owned by '+shortName(OWNC),Object.keys(OWN).filter(k=>BYID[k]).length):''}</div></div>`+
    depts.map(([d,cs])=>`<div class="pk-d"><div class="pk-h">${esc(d)}<span>${fmt(cs.reduce((a,c)=>a+(counts[c]||0),0))}</span></div><div class="pk-g">${cs.map(c=>btn(c,CATN[c],counts[c]||0)).join('')}</div></div>`).join('');
  $('qn').textContent=fmt(total);
}
''')
rerx(r"function renderSortFilter\(\)\{.*?\n\}\nfunction renderList\(\)\{.*?\n\}\n", r'''const LGL_TXT={all:'Everything',permit:'Legal, with or without a permit',legal:'Legal, no permit needed'};
function renderSortFilter(){
  const S=sortsFor(st.cat); if(!S.some(s=>s.k===st.sort)){st.sort='book';st.dir=1;}
  const searching=!!st.q.trim(); const base=baseList(); const fs=searching?[]:filtersFor(st.cat);
  const parts=[`<label class="fl wide"><span>Show</span><select id="legalSel">${Object.entries(LGL_TXT).map(([k,l])=>`<option value="${k}" ${(st.legal||'all')===k?'selected':''}>${l}</option>`).join('')}</select></label>`,
    `<div class="fl wide"><span>Sort</span><div class="sortrow"><select class="sort" id="sort" aria-label="Sort by">${S.map(s=>`<option value="${s.k}" ${s.k===st.sort?'selected':''}>${esc(s.l)}</option>`).join('')}</select><button type="button" class="dir" id="dir" aria-label="Reverse sort order">${st.dir>0?'↑':'↓'}</button></div></div>`];
  fs.forEach(f=>{
    const v=st.f[f.k];
    if(f.type==='sel'){const o=f.opts(base); if(o.length<2&&!v) return; const ordered=f.k==='sub'&&st.cat==='guns'?o.sort((a,b)=>(WORDER.indexOf(a)+100)%200-(WORDER.indexOf(b)+100)%200):o.sort();
      parts.push(`<label class="fl"><span>${esc(f.l)}</span><select data-f="${f.k}" id="f-${f.k}"><option value="">All</option>${ordered.map(x=>`<option ${v===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`); return;}
    if(f.type==='lv'){const cur=v||[]; parts.push(`<div class="fl"><span>${esc(f.l)}</span><div class="lv" role="group" aria-label="${esc(f.l)}">${[...LV].map(x=>`<button type="button" data-fk="${f.k}" data-lv="${x}" aria-pressed="${cur.includes(x)}" title="${{L:'Light',M:'Moderate',S:'Serious',D:'Deadly'}[x]}">${x}</button>`).join('')}</div></div>`); return;}
    parts.push(`<label class="fl"><span>${esc(f.l)}</span><input type="number" data-f="${f.k}" id="f-${f.k}" step="${f.step||1}" min="0" value="${v??''}" inputmode="decimal"></label>`);
  });
  if(searching) parts.push(`<p class="note fl wide" style="margin:0">Searching every category. Category filters come back when the search is empty.</p>`);
  const act=searching?[]:activeFilters();
  $('fbar').innerHTML=parts.join('')+(act.length||(st.legal||'all')!=='all'?`<button type="button" class="clr" id="clrF">Clear filters</button>`:'');
  // active-filter chips under the buttons
  const chips=[];
  if((st.legal||'all')!=='all') chips.push(['legal',LGL_TXT[st.legal]]);
  act.forEach(([k,v])=>{const f=FILTERS.find(x=>x.k===k); if(!f) return; chips.push([k,f.l+': '+(Array.isArray(v)?v.join(' '):v)]);});
  $('achips').innerHTML=chips.map(([k,t])=>`<button type="button" class="achip" data-clrf="${esc(k)}" aria-label="Remove filter ${esc(t)}">${esc(t)} <span aria-hidden="true">×</span></button>`).join('');
  $('ftog').innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 4h12M4 8h8M6 12h4"/></svg>Filters${chips.length?`<span class="fn">${chips.length}</span>`:''}`;
}
// grouping: by sub-type inside a category, by category when searching or showing everything
function gkey(i){const byCat=!!st.q.trim()||st.cat==='all'||st.cat==='owned'; return byCat?'c:'+i.cat:'s:'+i.cat+':'+(i._.sub||'Other');}
function glabel(k){return k.startsWith('c:')?CATN[k.slice(2)]||k.slice(2):k.replace(/^s:[^:]*:/,'');}
function numPrice(i){if(i.sp||i.ef||i.mt||i.cat==='power'||i.mult!=null) return null; const p=costAt(i,i.r?i.r[0]:0); return typeof p==='number'&&isFinite(p)?p:null;}
function itemHTML(i){const sv=statFor(i); const byCat=gkey(i).startsWith('c:');
  return `<button type="button" class="item" data-id="${esc(i.id)}" aria-current="${st.sel===i.id}"><span class="nm">${esc(i.n)}${ownBadge(i)}${legalBadge(i)}</span><span class="pr">${priceLabel(i)}</span><span class="sub">${srcTag(i.src)}${sv?`<span class="stat">${esc(sv)}</span>`:''}<span class="t">${esc(i.s||pageRef(i))}</span></span></button>`;}
function renderList(){
  const L=filtered(); const tot=baseList().length, searching=!!st.q.trim();
  const counts=catCounts();
  $('catName').textContent=searching?'All categories':st.cat==='all'?'All gear':st.cat==='owned'?'Owned by '+shortName(OWNC):CATN[st.cat];
  $('catDept').textContent=searching?'Searching everywhere':deptOf(st.cat)||'Browse';
  $('count').textContent=searching?fmt(Object.values(counts).reduce((a,b)=>a+b,0)):fmt(tot);
  // groups in a stable order: guns by weapon class, everything else by first appearance in the books
  const order=[], G={};
  const seq=k=>{if(k.startsWith('c:')) return DATA.cats.findIndex(c=>c[0]===k.slice(2)); if(k.startsWith('s:guns:')){const w=WORDER.indexOf(glabel(k)); return w<0?99:w;} return -1;};
  ITEMS.forEach(i=>{const k=gkey(i); if(!(k in G)&&L.includes(i)){G[k]=[]; order.push(k);}});
  L.forEach(i=>G[gkey(i)].push(i));
  order.sort((a,b)=>{const x=seq(a),y=seq(b); return x>=0&&y>=0?x-y:0;});
  const sorted=st.sort!=='book'&&!(sortsFor(st.cat).find(x=>x.k===st.sort)||{}).group; // an explicit sort shows one sorted list
  const flat=order.length<=1||sorted;
  const auto=searching&&L.length<=40||L.length<=14;
  const isOpen=k=>flat||auto||!!st.open[k]||!!window.__allOpen;
  $('list').className=flat?'flat':'';
  const out=[];
  if(sorted&&order.length>1){order.length=0; order.push('*'); G['*']=L;}
  order.forEach(k=>{const items=G[k]; if(!items||!items.length) return;
    if(!flat){const ps=items.map(numPrice).filter(x=>x!=null); const lo=Math.min(...ps), hi=Math.max(...ps);
      const rg=ps.length?(lo===hi?fmt(lo)+'¥':fmt(lo)+'–'+fmt(hi)+'¥'):'';
      out.push(`<button type="button" class="grph" data-grp="${esc(k)}" aria-expanded="${isOpen(k)}"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg><span class="gl">${esc(glabel(k))}</span><span class="gr">${rg}</span><span class="gn">${items.length}</span></button>`);}
    if(isOpen(k)) items.forEach(i=>out.push(itemHTML(i)));
  });
  $('list').innerHTML=L.length?out.join(''):`<p class="empty">Nothing matches. Clear a filter, try fewer words, or switch more books on.</p>`;
  const anyClosed=!flat&&!auto&&order.some(k=>!st.open[k]);
  $('lnote').textContent=L.length?`${fmt(L.length)} item${L.length>1?'s':''}${flat?(sorted?' · sorted, groups off':''):` in ${order.length} groups`}`:'';
  $('grpAll').hidden=flat||auto; $('grpAll').textContent=anyClosed?'Open all':'Close all'; $('grpAll').dataset.v=anyClosed?'1':'0';
}
''')

# ---------- the item panel: header, tabs, sticky bar ----------
rerx(r"  const G=related\(i\);\n  \$\('tag'\)\.innerHTML=`<a class=\"back\".*?\n\}\nfunction kitPrice", r'''  const G=related(i);
  const isPrice=!(i.sp||i.ef||i.mt||i.cat==='power'||i.mult!=null);
  const priceTxt=isPrice?fmt(price)+'¥':esc(priceLabel(i));
  const build=[buildHTML(i),deckHTML(i),vehHTML(i),hostHTML(i)+gelHTML(i),cbHTML(i)].join('').trim();
  const canBuildIt=canBuild(i)||isDeck(i)||isVeh(i)||HB.isHost(i.id)||CB_PAGES.has(i.id);
  const buyable=!(i.sp||i.ef||i.mt||i.cat==='power');
  const runner=(ownNote(i)+wishNote(i,r)).trim();
  const tabs=[['overview','Overview'],...(build?[['build','Build-out']]:[]),['runner','For your runner'],['goes','Goes with',G.reduce((a,g)=>a+(g.list?g.list.length:0),0)]];
  const tab=tabs.some(t=>t[0]===st.tab)?st.tab:'overview';
  const panels={
    overview:`${i.s?`<p class="desc">${esc(i.s)}</p>`:''}${fxHTML(i)}${ratingCtl}${statsHTML(i,r)}${ratingTable(i,r)}${rangeHTML(i)}${gradeTable(i,r)}${spellTable(i)}${rulesFor(i)}${tagFgHTML(i)}${i.m1?'<p class="note">Matrix 1.0 item: VR2 replaces it if your table uses VR2.</p>':''}`,
    build,
    runner:runner||`<p class="note">${OWNC?'Nothing special to check against '+esc(shortName(OWNC))+' for this item.':'Pick a runner at the top (“Compare with”) to see nuyen, Essence and Body Index left, and whether they already own this.'}</p>`,
    goes:G.length?`<div class="links">${G.map(g=>`<div class="lgrp"><h4>${esc(g.title)}</h4>${g.note?`<p>${esc(g.note)}</p>`:''}${g.text?`<p>${esc(g.text)}</p>`:`<div class="pills">${g.list.map(x=>`<button type="button" class="pill ${visible(x)?'':'off'}" data-id="${esc(x.id)}" title="${esc(BOOK[x.src][0]+' '+pageRef(x))}">${srcTag(x.src)}${esc(x.n)}<span class="pp">${priceLabel(x)}</span></button>`).join('')}</div>`}</div>`).join('')}</div>`:'<p class="note">No pairings listed for this item.</p>'};
  const bar=!buyable?`<div class="tbar"><div class="tp"><b>${priceTxt}</b><span>${esc(CATN[i.cat])}: picked in the Runner Builder</span></div></div>`
    :canBuildIt?(tab==='build'?'':`<div class="tbar"><div class="tp"><b>${priceTxt}</b><span>Before add-ons</span></div><div class="ta"><button type="button" class="btn big" data-tab="build">Build it out and add</button></div></div>`)
    :`<div class="tbar"><div class="tp"><b>${priceTxt}</b><span>${i.r&&i.mult==null?esc(i.r[2])+' '+r:'Each'}</span></div><div class="ta"><button type="button" class="btn ghost big" data-send="item">Send to a character</button><button type="button" class="btn big" id="addKit">Add to shopping list</button></div></div>`;
  $('tag').innerHTML=`<div class="thd"><a class="back" href="#list" id="backList">↑ Back to the list</a><div class="kicker">${srcTag(i.src)}<span>${esc(BOOK[i.src][0])}</span><span>·</span><span>${esc(pageRef(i))}</span><span>·</span><span>${esc(CATN[i.cat])}${i._.sub?' › '+esc(i._.sub):''}</span></div>
   <h2>${esc(i.n)}</h2>
   <div class="price">${priceTxt}${i.r&&i.mult==null?` <span class="note">at ${esc(i.r[2].toLowerCase())} ${r}</span>`:''}</div>
   ${legalNote(i,r)}</div>
   <div class="tabs" role="tablist" aria-label="Item sections">${tabs.map(([k,l,n])=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${tab===k}">${l}${n?`<span class="tn">${n}</span>`:''}</button>`).join('')}</div>
   <div class="tpanel" role="tabpanel">${panels[tab]}</div>${bar}`;
}
function kitPrice''')

# ---------- shopping list: grouped, quantities, collapsible ----------
rerx(r"function renderKit\(\)\{ kitChip\(\);.*?\n\}\nfunction select", r'''function kitStackable(k){return !(k.build||k.hb||k.vb||k.v2||k.pc!=null||k.loaded!=null)&&!!BYID[k.id]&&!kitFeed(BYID[k.id]);}
function renderKit(){ kitChip();
  $('grid').classList.toggle('kitc',!st.kitOpen);
  let c=0,e=0,bt=0; const lg={legal:0,permit:0,restricted:0,illegal:0};
  st.kit.forEach(k=>{const i=BYID[k.id]||{n:k.n,src:k.src||'core',cost:k.cost}; c+=kitPrice(k); e+=k.hb&&k.hc!=null?+(k.he||0):+(essAt(i,k.r)||0)*(k.q||1); bt+=+((i.bis?i.bis[k.r]:i.bi)||0);
    const L=BYID[k.id]?legalOf(i,k.r):null; lg[L?L.lv:'legal']=(lg[L?L.lv:'legal']||0)+1;});
  const cTxt=fmt(c)+'¥', eTxt=Math.round(e*100)/100;
  const lines=st.kit.length+(st.kit.length===1?' line':' lines');
  if(!st.kitOpen){
    $('kit').innerHTML=`<button type="button" class="krail" id="kitOpen" aria-expanded="false" aria-label="Open the shopping list: ${lines}, ${cTxt}"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg><span class="rn">${st.kit.length}</span><span class="rv">Shopping list</span><span class="rt">${cTxt}</span>${lg.restricted||lg.illegal?'<span class="rx">Restricted</span>':''}</button>`;
    return;}
  const KG=kitGuns(); const groups={};
  st.kit.forEach((k,ix)=>{const i=BYID[k.id]; const g=i?CATN[i.cat]:'Other'; (groups[g]=groups[g]||[]).push([k,ix]);});
  const order=DATA.cats.map(x=>x[1]).filter(g=>groups[g]).concat(groups.Other?['Other']:[]);
  const body=st.kit.length?order.map(g=>`<div class="kg">${esc(g)}</div>`+groups[g].map(([k,ix])=>{const i=BYID[k.id]||{n:k.n,src:k.src||'core',cost:k.cost}; const p=kitPrice(k);
      const es=k.hb&&k.hc!=null?+(k.he||0):+(essAt(i,k.r)||0)*(k.q||1);
      const note=[i.r&&!k.hb&&!k.noR?`${i.r[2]} ${k.r}`:'',k.gel?'gel-packs':'',k.bp&&k.bp.length?'With '+k.bp.join(', '):'',k.loaded?'loaded':''].filter(Boolean).join(' · ');
      return `<div class="kl"><div class="kt"><b>${srcTag(i.src)} ${esc(i.n)}</b><span class="c">${fmt(p)}¥${es?` · ${Math.round(es*100)/100} Ess`:''}</span></div>${note?`<span class="kn">${esc(note)}</span>`:''}${BYID[k.id]&&kitForGun(k.id)?kitFgHTML(k,ix,KG):''}
        <div class="ka">${kitStackable(k)?`<span class="qty" role="group" aria-label="Quantity of ${esc(i.n)}"><button type="button" class="sq" data-kq="${ix}" data-d="-1" aria-label="One fewer ${esc(i.n)}" ${(k.q||1)<=1?'disabled':''}>−</button><span>${k.q||1}</span><button type="button" class="sq" data-kq="${ix}" data-d="1" aria-label="One more ${esc(i.n)}">+</button></span>`:'<span></span>'}
        <span style="display:flex;gap:6px;align-items:center">${BYID[k.id]?legalBadge(i,k.r):''}${BYID[k.id]?`<button type="button" class="xb" data-kedit="${ix}">Open</button>`:''}<button type="button" class="xb" data-rm="${ix}" aria-label="Remove ${esc(i.n)}">Remove</button></span></div></div>`;}).join('')).join('')
    :`<p class="note" style="padding:14px">Empty. Pick something on the left and add it. Saved in this browser only.</p>`;
  const W=wishLines(OWNC,c,e,bt);
  $('kit').innerHTML=`<div class="khd"><b>Shopping list</b><span style="display:flex;gap:8px;align-items:center"><span class="note">${lines}</span><button type="button" class="sq" id="kitClose" aria-expanded="true" aria-label="Tuck the shopping list away"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg></button></span></div>
    <div class="kbody">${body}</div>
    <div class="kfoot"><div class="ktot"><div><span class="lbl">Total</span><b>${cTxt}</b></div><div><span class="lbl">Essence</span><b>${eTxt?'−'+eTxt:'0'}</b></div></div>
      ${st.kit.length?`<div class="klg">${['legal','permit','restricted','illegal'].filter(x=>lg[x]).map(x=>`<span class="lgl lgl-${x}" style="margin:0">${lg[x]} ${LEGAL_LV[x][1].toLowerCase()}</span>`).join('')}</div>`:''}
      ${lg.restricted||lg.illegal?'<span class="kwarn">Restricted gear needs the GM’s OK and a fixer (Shadowtech p. 103–104).</span>':''}
      ${W?`<div class="wish" style="margin:0"><b>${W.head.replace('this','the whole list')}</b><ul>${W.lines.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:''}
      <div class="kact"><button type="button" class="btn full" data-send="kit" ${st.kit.length?'':'disabled'}>Send to a character</button><button type="button" class="btn ghost" data-send="kit" ${st.kit.length?'':'disabled'}>Copy gear code</button><button type="button" class="btn ghost" id="clearKit" ${st.kit.length?'':'disabled'}>Clear list</button></div></div>`;
}
function select''')

# select(): open the item's group; keep the tab when it still applies
rep("  st.sel=id; const i=BYID[id];\n", "  st.sel=id; const i=BYID[id]; if(i) st.open[gkey(i)]=true;\n")
rep("  if(scroll&&window.innerWidth<=760) $('tag').scrollIntoView({block:'start'});", "  if(scroll&&window.innerWidth<=760) $('tag').scrollIntoView({block:'start'}); $('picker').hidden=true; $('catBtn').setAttribute('aria-expanded','false');")

# ---------- events ----------
rep("  const c=e.target.closest('[data-cat]'); if(c){setCat(c.dataset.cat); return;}",
r"""  const c=e.target.closest('[data-cat]'); if(c){if(st.q){st.q=''; $('q').value='';} setCat(c.dataset.cat); $('picker').hidden=true; $('catBtn').setAttribute('aria-expanded','false'); return;}
  if(e.target.closest('#catBtn')){const p=$('picker'); p.hidden=!p.hidden; $('catBtn').setAttribute('aria-expanded',String(!p.hidden)); if(!p.hidden){p.style.top=($('catBtn').getBoundingClientRect().bottom-document.querySelector('.shelf').getBoundingClientRect().top+8)+'px'; const cur=p.querySelector('[aria-current="true"]'); if(cur) cur.focus();} return;}
  if(e.target.closest('#ftog')){const f=$('fbar'); f.hidden=!f.hidden; $('ftog').setAttribute('aria-expanded',String(!f.hidden)); return;}
  const gh=e.target.closest('[data-grp]'); if(gh){const k=gh.dataset.grp; st.open[k]=gh.getAttribute('aria-expanded')!=='true'; renderList(); const b=$('list').querySelector(`[data-grp="${CSS.escape(k)}"]`); if(b) b.focus(); return;}
  if(e.target.closest('#grpAll')){const v=$('grpAll').dataset.v==='1'; filtered().forEach(i=>{st.open[gkey(i)]=v;}); renderList(); return;}
  const cf=e.target.closest('[data-clrf]'); if(cf){const k=cf.dataset.clrf; if(k==='legal'){st.legal='all'; save(); renderCats();} else delete st.f[k]; renderSortFilter(); renderList(); return;}
  const tb=e.target.closest('[data-tab]'); if(tb){st.tab=tb.dataset.tab; save(); renderTag(); const t=document.querySelector(`.tabs [data-tab="${st.tab}"]`); if(t) t.focus(); return;}
  if(e.target.closest('#srcBtn')||e.target.closest('#srcClose')){st.srcOpen=!st.srcOpen; save(); renderBooks(); const f=st.srcOpen?$('srcClose'):$('srcBtn'); if(f) f.focus(); return;}
  if(e.target.closest('#srcAll')||e.target.closest('#srcCore')){const core=!!e.target.closest('#srcCore'); Object.keys(BOOK).forEach(k=>{st.books[k]=core?(k==='core'?1:0):1;}); save(); renderBooks(); renderCats(); renderSortFilter(); renderList(); if(st.sel) renderTag(); return;}
  if(e.target.closest('#kitClose')||e.target.closest('#kitOpen')){st.kitOpen=!st.kitOpen; save(); renderKit(); const f=st.kitOpen?$('kitClose'):$('kitOpen'); if(f) f.focus(); return;}
  const kq=e.target.closest('[data-kq]'); if(kq){const k=st.kit[+kq.dataset.kq]; if(k){k.q=Math.max(1,(k.q||1)+(+kq.dataset.d)); save(); renderKit(); const b=$('kit').querySelector(`[data-kq="${kq.dataset.kq}"][data-d="${kq.dataset.d}"]`); if(b&&!b.disabled) b.focus();} return;}
  const ke=e.target.closest('[data-kedit]'); if(ke){const k=st.kit[+ke.dataset.kedit]; if(k&&BYID[k.id]){if(k.build||k.vb||k.hb||k.v2) st.tab='build'; select(k.id,true);} return;}""")
rep("  const b=e.target.closest('[data-book]'); if(b){const k=b.dataset.book; st.books[k]=st.books[k]?0:1; save(); renderBooks(); renderCats(); renderSortFilter(); renderList(); if(st.sel) renderTag(); return;}",
    "  const b=e.target.closest('[data-book]'); if(b){const k=b.dataset.book; st.books[k]=st.books[k]?0:1; save(); renderBooks(); renderCats(); renderSortFilter(); renderList(); if(st.sel) renderTag(); const f=$('books').querySelector(`[data-book=\"${k}\"]`); if(f) f.focus(); return;}")
rep("  if(e.target.id==='ftog'){const sh=document.querySelector('.shelf'); const o=sh.classList.toggle('fopen'); e.target.setAttribute('aria-expanded',o); return;}\n", "")
rep("  if(e.target.id==='dir'){st.dir=-st.dir; renderSortFilter(); renderList(); return;}",
    "  if(e.target.id==='dir'){st.dir=-st.dir; renderSortFilter(); renderList(); const d=$('dir'); if(d) d.focus(); return;}")
rep("  const it=e.target.closest('[data-id]'); if(it){select(it.dataset.id,true); return;}",
    "  const it=e.target.closest('[data-id]'); if(it){const fromList=!!it.closest('#list'); select(it.dataset.id,true); if(fromList){const el=$('list').querySelector(`[data-id=\"${CSS.escape(it.dataset.id)}\"]`); if(el) el.focus({preventScroll:true});} return;}")
rep("  if(e.target.closest('#kitchip')){e.preventDefault(); $('kit').scrollIntoView({block:'start'}); return;}\n", "")
rep("  if(e.target.id==='q'){st.q=e.target.value; renderSortFilter(); renderList(); return;}",
    "  if(e.target.id==='q'){st.q=e.target.value; $('picker').hidden=true; renderSortFilter(); renderList(); return;}")
rep("$('catSel').addEventListener('change',e=>setCat(e.target.value));\n$('legalSel').value=st.legal||'all';\n$('legalSel').addEventListener('change',e=>{st.legal=e.target.value; save(); renderCats(); renderList();});\n$('sort').addEventListener('change',e=>{st.sort=e.target.value; const s=SORTS.find(x=>x.k===st.sort); st.dir=s&&s.d?s.d:1; renderSortFilter(); renderList();});",
    """document.addEventListener('change',e=>{
  if(e.target.id==='legalSel'){st.legal=e.target.value; save(); renderCats(); renderSortFilter(); renderList(); const s=$('legalSel'); if(s) s.focus(); return;}
  if(e.target.id==='sort'){st.sort=e.target.value; const s=SORTS.find(x=>x.k===st.sort); st.dir=s&&s.d?s.d:1; renderSortFilter(); renderList(); const x=$('sort'); if(x) x.focus(); return;}});
document.addEventListener('keydown',e=>{if(e.key!=='Escape') return; if(!$('picker').hidden){$('picker').hidden=true; $('catBtn').setAttribute('aria-expanded','false'); $('catBtn').focus();}});""")
rep("  if(e.target.dataset&&e.target.dataset.f){const f=e.target.dataset.f; const v=e.target.value; st.f[f]=e.target.type==='number'?(v===''?'':+v):v; renderList(); if(e.target.tagName==='SELECT'){renderSortFilter();} return;}",
    "  if(e.target.dataset&&e.target.dataset.f){const f=e.target.dataset.f; const v=e.target.value; st.f[f]=e.target.type==='number'?(v===''?'':+v):v; renderList(); if(e.target.tagName==='SELECT'){renderSortFilter(); const x=$('f-'+f); if(x) x.focus();} else {const n=$('achips'); renderSortFilter(); const x=$('f-'+f); if(x){x.focus(); try{x.setSelectionRange(99,99);}catch(_){}}} return;}")
rep("  const btns=[...$('list').querySelectorAll('.item')]; let ix=btns.findIndex(b=>b.dataset.id===st.sel);",
    "  const btns=[...$('list').querySelectorAll('.item')]; if(!btns.length) return; let ix=btns.findIndex(b=>b.dataset.id===st.sel);")
rep("  if(!['ArrowDown','ArrowUp'].includes(e.key)) return; e.preventDefault();", "  if(!['ArrowDown','ArrowUp'].includes(e.key)||!e.target.classList.contains('item')) return; e.preventDefault();")
# keep the old "clear filters" too clearing legality
rep("  if(e.target.id==='clrF'){st.f={}; renderSortFilter(); renderList(); return;}",
    "  if(e.target.id==='clrF'){st.f={}; st.legal='all'; save(); renderCats(); renderSortFilter(); renderList(); return;}")
# setCat closes the picker, resets the filter drawer for the new category
rep("function setCat(c){st.cat=c; st.f={}; renderCats(); renderSortFilter(); renderList();}",
    "function setCat(c){st.cat=c; st.f={}; save(); renderCats(); renderSortFilter(); renderList(); $('list').scrollTop=0;}")
rep("if(location.hash) fromHash(); else select('guns:Ares Predator');",
    "$('q').value=st.q||'';\nif(location.hash) fromHash(); else select('guns:Ares Predator');")
# title
pass  # the redesigned page is now the main Gear Locker, same title
rep(".empty{", open('gear/v2ui.css').read()+".empty{")
rep("function renderTag(){", open('gear/v2ui.js').read()+"\nfunction renderTag(){")
rep("const build=[buildHTML(i),deckHTML(i),vehHTML(i),hostHTML(i)+gelHTML(i),cbHTML(i)]", "const build=[buildHTML2(i),deckHTML2(i),vehHTML2(i),hostHTML2(i)+gelHTML(i),cbHTML2(i)]")
a=s.index('function deckHTML(i){'); b=s.index('\n}\n',a)+3; src=s[a:b]
h0=src.index("  const sel=(f,lab,opts,cur,fmtO)"); h1=src.index("  // programs:")
p0=h1; p1=src.index("  const nUtil=")
w0=src.index("  // matrix stats inputs"); w1=src.index("  const facts=[fact('MPCP'")
parts="function deckParts(i,C){const B=C.B, M=C.M;\n"+src[h0:h1]+src[p0:p1]+src[w0:w1]+"  return {hw:ctl,sets,who};}\n"
s=s[:b]+parts+s[b:]; n_ok+=1
open('gear/template2.html','w').write(s)
d=open('gear_data.json').read()
page=s.replace('/*DATA*/null',d.replace('</','<\\/'),1)
head='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
open('gear/sr2-gear-locker2.html','w').write(page)
open('SR2_Gear_Locker_2.html','w').write(head+page+'\n</html>\n')
print('template2 written,',n_ok,'edits')
