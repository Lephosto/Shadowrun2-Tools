#!/usr/bin/env python3
"""One build for both tools.
1. shared/*.js is the single source for rules code used by both pages; it is injected between /*@shared:NAME*/ and /*@end:NAME*/.
2. The Runner Builder is the single source for item data; extract.js turns it into gear_data.json for the Gear Locker.
3. Writes the Gear Locker page, both offline files, and the GitHub site folder, then checks every shared block matches."""
import re,subprocess,shutil,os,sys
D=os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
SH={f[:-3]:open('shared/'+f).read().strip() for f in os.listdir('shared') if f.endswith('.js')}
def inject(path):
    s=open(path).read(); n=0
    for name,body in SH.items():
        pat=re.compile(r'/\*@shared:'+name+r'\*/\n.*?\n/\*@end:'+name+r'\*/',re.S)
        s,k=pat.subn(lambda m:'/*@shared:'+name+'*/\n'+body+'\n/*@end:'+name+'*/',s); n+=k
    open(path,'w').write(s); return n
nb=inject('sr2-builder.html'); nl=inject('gear/template.html')
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
for f in ['sr2-builder.html','gear/template.html','gear/sr2-gear-locker.html','SR2_Gear_Locker.html','SR2_Runner_Builder.html']:
    s=open(f).read()
    for name,body in SH.items():
        for m in re.finditer(r'/\*@shared:'+name+r'\*/\n(.*?)\n/\*@end:'+name+r'\*/',s,re.S):
            if m.group(1)!=body: bad.append((f,name))
if bad: print('MISMATCH',bad); sys.exit(1)
site='/home/claude/shadowrun2-tools'
if os.path.isdir(site) and not os.environ.get('NOSITE'):
    shutil.copy('SR2_Runner_Builder_2.html',site+'/builder.html'); shutil.copy('SR2_Runner_Builder.html',site+'/builder-classic.html')  # the redesigned Builder is live; the classic layout stays as a backup
    shutil.copy('SR2_Gear_Locker_2.html',site+'/gear-locker.html'); shutil.copy('SR2_GM_Screen.html',site+'/gm-screen.html')
print(f'built: shared blocks builder {nb}, locker {nl}; {len(SH)} shared modules; all blocks match')
