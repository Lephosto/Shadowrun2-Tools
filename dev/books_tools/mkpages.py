# Per-page text + printed-page map for every book. Printed numbers are read from page headers/footers,
# then a consistent offset is filled across runs (handles color inserts and unnumbered plates).
import subprocess,re,json,os,collections
A='/mnt/user-data/attachments/5b264a23-4e63-5f6c-b1a2-f1fa85b002fe/'; U='/mnt/user-data/uploads/'
F={'core':U+'Shadowrun_2nd_Edition_Core_Rulebook_searchable.pdf','ssc':A+'16081f2a-Street_Samurai_Catalog_searchable.pdf','r2':U+'Rigger_2_searchable.pdf','vr2':A+'a792e631-Virtual_Realities_2.0_searchable.pdf','fof':A+'2f0ba6c0-Fields_of_Fire_searchable.pdf','st':A+'2becc94f-Shadowtech_searchable.pdf','ct':A+'6ad209d9-Cybertechnology_searchable.pdf','csh':U+'Corporate_Security_Handbook_searchable.pdf','gr':A+'dd90b0e9-Shadowrun_-_The_Grimoire_Manual_of_Practical_Thaumaturgy_searchable.pdf','aw':U+'Awakenings_-_New_Magic_in_2057_searchable.pdf','src':U+'Shadowrun_Companion_-_Beyond_the_Shadows__searchable_.pdf','cs':U+'Corporate_Shadowfiles_searchable.pdf'}
out={}
for bk,f in F.items():
  t=subprocess.run(['pdftotext','-layout',f,'-'],capture_output=True,text=True).stdout.split('\f')
  n=len(t); cand={}
  for i,pg in enumerate(t):
    L=[l.strip() for l in pg.split('\n') if l.strip()]
    edge=L[:3]+L[-4:]
    nums=[]
    for l in edge:
      for m in re.finditer(r'(?:PAGE\s+|^|\s)(\d{1,3})(?:\s|$)',l):
        v=int(m.group(1))
        if 1<=v<=400 and len(l)<90: nums.append(v)
    if nums: cand[i]=nums
  # vote for offset (pdfindex - printed) in sliding windows
  offs={}
  for i,ns in cand.items():
    for v in ns: offs.setdefault(i,[]).append(i+1-v)
  best=[None]*n
  for i in range(n):
    c=collections.Counter()
    for j in range(max(0,i-6),min(n,i+7)):
      for o in offs.get(j,[]): c[o]+=1
    if c:
      o,k=c.most_common(1)[0]
      if k>=3: best[i]=o
  # fill gaps by nearest known
  for i in range(n):
    if best[i] is None:
      near=[(abs(i-j),best[j]) for j in range(n) if best[j] is not None]
      best[i]=min(near)[1] if near else 0
  printed=[i+1-best[i] for i in range(n)]
  d=f'pages/{bk}'; os.makedirs(d,exist_ok=True)
  for i,pg in enumerate(t):
    open(f'{d}/p{i+1:03d}.txt','w').write(f'### {bk} pdf {i+1} printed {printed[i]}\n'+re.sub(r'[ \t]{3,}',' | ',pg))
  segs=[]; prev=None
  for i in range(n):
    o=best[i]
    if o!=prev: segs.append([i+1,o]); prev=o
  out[bk]={'file':f,'pdf_pages':n,'offset_runs':segs}
  print(bk,n,'offset runs (start pdf page, pdf-printed):',segs[:12])
json.dump(out,open('pagemap.json','w'),indent=1)
