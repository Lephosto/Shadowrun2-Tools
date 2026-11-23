// ---------- The shared header (all three tools) ----------
// Fills the tool links for where the page is running, and opens and closes the phone menu.
// On the site: builder.html, gear-locker.html, gm-screen.html. Offline: the SR2_*.html files side by side.
// Anywhere else (an artifact, a renamed file) the other tools have no address, so only the current one shows.
// Version (2026-11-23): build.py writes a short code for each build into BUILD. The header shows it, links between the
// tools on the site carry ?v=CODE so browsers fetch a fresh copy, and on the site the page checks version.txt and offers
// a refresh when a newer build is out. Saved characters live in browser storage for the whole site, so a refresh keeps them.
const SRHEAD=(()=>{
const BUILD='@SR2BUILD@'; const built=/^[0-9a-f]{7}$/.test(BUILD);
const SITE={builder:'builder.html',locker:'gear-locker.html',gm:'gm-screen.html'};
const FILE={builder:'SR2_Runner_Builder.html',locker:'SR2_Gear_Locker.html',gm:'SR2_GM_Screen.html'};
function hrefs(){const f=(location.pathname.split('/').pop()||'').toLowerCase();
  if(onSite()) return built?Object.fromEntries(Object.entries(SITE).map(([k,v])=>[k,v+'?v='+BUILD])):SITE;
  if(location.protocol==='file:'&&/^sr2_/.test(f)) return FILE;
  return null;}
function onSite(){return /^https?:$/.test(location.protocol)&&!/claude/.test(location.hostname);}
let lastCheck=0, armed=false;
function check(){if(!built||!onSite()) return; const now=Date.now(); if(lastCheck&&now-lastCheck<6e5) return; lastCheck=now;
  fetch('version.txt?t='+now,{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{t=String(t||'').trim(); if(/^[0-9a-f]{7}$/.test(t)&&t!==BUILD) notice(t);}).catch(()=>{});}
function notice(t){const h=document.getElementById('srh'); if(!h||document.getElementById('srhNew')) return; if(new URLSearchParams(location.search).get('v')===t) return; /* already asked for it: the site is still catching up */ const d=document.createElement('div'); d.id='srhNew'; d.className='srh-new'; d.setAttribute('role','status');
  d.innerHTML='<span>A newer version of this tool is out ('+t+'). Refreshing keeps your saved characters.</span><button type="button" class="ui-sec">Refresh</button>';
  d.querySelector('button').addEventListener('click',()=>{location.href=location.pathname+'?v='+t+location.hash;}); h.insertAdjacentElement('afterend',d);}
function init(tool){const h=document.getElementById('srh'); if(!h) return; const H=hrefs();
  if(built){let v=h.querySelector('.srh-ver'); if(!v){v=document.createElement('span'); v.className='srh-ver'; (h.querySelector('.srh-id')||h).appendChild(v);} v.textContent='Version '+BUILD; v.title='Which build of the tool this is';}
  check(); if(!armed){armed=true; document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') check();});}
  h.querySelectorAll('.srh-tools a[data-tool]').forEach(a=>{const t=a.dataset.tool;
    // safe to run again on a page that was saved after a first run (the Builder's standalone copy is one)
    if(t===tool){a.setAttribute('aria-current','page'); a.removeAttribute('href'); a.hidden=false; return;}
    a.removeAttribute('aria-current');
    if(H&&H[t]){a.href=H[t]; a.target='_blank'; a.rel='noopener'; a.hidden=false;} else {a.removeAttribute('href'); a.hidden=true;}});
  const b=h.querySelector('.srh-menu'); h.classList.remove('open'); if(b) b.setAttribute('aria-expanded','false');
  if(b) b.addEventListener('click',()=>{const o=!h.classList.contains('open'); h.classList.toggle('open',o); b.setAttribute('aria-expanded',String(o));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&h.classList.contains('open')){h.classList.remove('open'); if(b){b.setAttribute('aria-expanded','false'); b.focus();}}});}
function sub(text){const s=document.getElementById('srhSub'); if(s) s.textContent=text||'';}
return {init,sub,hrefs,build:built?BUILD:''};
})();
