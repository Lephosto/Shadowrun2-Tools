// ---------- The shared header (all three tools) ----------
// Fills the tool links for where the page is running, and opens and closes the phone menu.
// On the site: builder.html, gear-locker.html, gm-screen.html. Offline: the SR2_*.html files side by side.
// Anywhere else (an artifact, a renamed file) the other tools have no address, so only the current one shows.
const SRHEAD=(()=>{
const SITE={builder:'builder.html',locker:'gear-locker.html',gm:'gm-screen.html'};
const FILE={builder:'SR2_Runner_Builder.html',locker:'SR2_Gear_Locker.html',gm:'SR2_GM_Screen.html'};
function hrefs(){const f=(location.pathname.split('/').pop()||'').toLowerCase();
  if(/^https?:$/.test(location.protocol)&&!/claude/.test(location.hostname)) return SITE;
  if(location.protocol==='file:'&&/^sr2_/.test(f)) return FILE;
  return null;}
function init(tool){const h=document.getElementById('srh'); if(!h) return; const H=hrefs();
  h.querySelectorAll('.srh-tools a[data-tool]').forEach(a=>{const t=a.dataset.tool;
    // safe to run again on a page that was saved after a first run (the Builder's standalone copy is one)
    if(t===tool){a.setAttribute('aria-current','page'); a.removeAttribute('href'); a.hidden=false; return;}
    a.removeAttribute('aria-current');
    if(H&&H[t]){a.href=H[t]; a.target='_blank'; a.rel='noopener'; a.hidden=false;} else {a.removeAttribute('href'); a.hidden=true;}});
  const b=h.querySelector('.srh-menu'); h.classList.remove('open'); if(b) b.setAttribute('aria-expanded','false');
  if(b) b.addEventListener('click',()=>{const o=!h.classList.contains('open'); h.classList.toggle('open',o); b.setAttribute('aria-expanded',String(o));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&h.classList.contains('open')){h.classList.remove('open'); if(b){b.setAttribute('aria-expanded','false'); b.focus();}}});}
function sub(text){const s=document.getElementById('srhSub'); if(s) s.textContent=text||'';}
return {init,sub,hrefs};
})();
