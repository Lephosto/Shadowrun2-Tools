#!/usr/bin/env python3
"""One build for both tools.
1. shared/*.js is the single source for rules code used by both pages; it is injected between /*@shared:NAME*/ and /*@end:NAME*/.
   shared/*.css (tokens.css, ui.css) is the single source for the look of all three tools, injected the same way into each tool's styles.
2. The Runner Builder is the single source for item data; extract.js turns it into gear_data.json for the Gear Locker.
3. Writes the Gear Locker page, both offline files, and the GitHub site folder, then checks every shared block matches."""
import re,subprocess,shutil,os,sys
D=os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
SH={f.rsplit('.',1)[0]:open('shared/'+f).read().strip() for f in os.listdir('shared') if f.endswith(('.js','.css'))}
assert len(SH)==len([f for f in os.listdir('shared') if f.endswith(('.js','.css'))]), 'a .js and a .css in shared/ share a name'
def inject(path):
    s=open(path).read(); n=0
    for name,body in SH.items():
        pat=re.compile(r'/\*@shared:'+name+r'\*/\n.*?\n/\*@end:'+name+r'\*/',re.S)
        s,k=pat.subn(lambda m:'/*@shared:'+name+'*/\n'+body+'\n/*@end:'+name+'*/',s); n+=k
    open(path,'w').write(s); return n
nb=inject('sr2-builder.html'); nl=inject('gear/template.html'); ng=inject('gm/gm.css')+inject('gm/gm.html')
open('_builder_src.html','w').write('<meta charset="utf-8">\n'+open('sr2-builder.html').read())
env=dict(os.environ,SRC='_builder_src.html')
for js in ['extract.js','mkstand.js']:
    r=subprocess.run(['node',js],env=env,capture_output=True,text=True)
    if r.returncode or 'errs [' in r.stdout and 'errs []' not in r.stdout: print(js,r.stdout[-400:],r.stderr[-400:]); sys.exit(1)
subprocess.run(['python3','gear/mk.py'],check=True)
subprocess.run(['python3','gear/mk2.py'],check=True,stdout=subprocess.DEVNULL)  # Gear Locker 2 (new layout), built from the same template
subprocess.run(['python3','builder2/mkb2.py'],check=True,stdout=subprocess.DEVNULL)  # Runner Builder 2 (Build / Game night / After the session) on top of the Builder
subprocess.run(['python3','gm/mkgm.py'],check=True,stdout=subprocess.DEVNULL)  # GM screen, with Gear Locker items embedded
# verify
bad=[]
for f in ['sr2-builder.html','gear/template.html','gm/gm.css','gm/gm.html','gear/sr2-gear-locker.html','SR2_Gear_Locker.html','SR2_Runner_Builder.html','SR2_Runner_Builder_2.html','SR2_Gear_Locker_2.html','SR2_GM_Screen.html']:
    s=open(f).read()
    for name,body in SH.items():
        for m in re.finditer(r'/\*@shared:'+name+r'\*/\n(.*?)\n/\*@end:'+name+r'\*/',s,re.S):
            if m.group(1)!=body: bad.append((f,name))
if bad: print('MISMATCH',bad); sys.exit(1)
CSSN=[n for n in SH if os.path.exists('shared/'+n+'.css')]
miss=[(f,n) for f in ['SR2_Runner_Builder_2.html','SR2_Gear_Locker_2.html','SR2_GM_Screen.html'] for n in CSSN+['srhead'] if '/*@shared:'+n+'*/\n'+SH[n]+'\n/*@end:'+n+'*/' not in open(f).read()]
if miss: print('MISSING shared CSS',miss); sys.exit(1)
# version stamp (2026-11-23): a short code from the three built pages (the Builder's embedded blank runner, with its random id and
# timestamps, left out, so the same sources give the same code). shared/srhead.js shows it, adds ?v=CODE to the links between the tools, and compares it with version.txt on the site.
import hashlib
PAGES=['SR2_Runner_Builder_2.html','SR2_Gear_Locker_2.html','SR2_GM_Screen.html']
# only the real embed element: the Builder's export code also contains '<script>window.__SR2_EMBED=' inside a template, and a loose
# pattern there swallowed ~200 KB of the Builder's own code, so changes near the end of its script didn't change the code (fixed 2026-11-23)
EMB=r'<script>window\.__SR2_EMBED=[^<]*</script>'
if len(re.findall(EMB,open(PAGES[0]).read()))!=1: sys.exit('version stamp: expected exactly one embedded runner in the Builder page')
VER=hashlib.sha1(''.join(re.sub(EMB,'',open(f).read()) for f in PAGES).encode()).hexdigest()[:7]
for f in PAGES+['SR2_Runner_Builder.html','SR2_Gear_Locker.html']:
    if os.path.exists(f): s=open(f).read(); open(f,'w').write(s.replace('@SR2BUILD@',VER))
open('version.txt','w').write(VER+'\n')
site='/home/claude/shadowrun2-tools'
if os.path.isdir(site) and not os.environ.get('NOSITE'):
    shutil.copy('SR2_Runner_Builder_2.html',site+'/builder.html')  # the classic layout was retired 2026-11-21
    shutil.copy('SR2_Gear_Locker_2.html',site+'/gear-locker.html'); shutil.copy('SR2_GM_Screen.html',site+'/gm-screen.html'); shutil.copy('version.txt',site+'/version.txt')
print(f'built: shared blocks builder {nb}, locker {nl}, gm {ng}; {len(SH)} shared modules; all blocks match; version {VER}')
