import json,glob,re
RUNS={'core':[[1,2],[135,10],[247,26]],'ssc':[[1,1]],'r2':[[1,1],[84,9]],'vr2':[[1,8]],'fof':[[1,2]],'st':[[1,2],[71,10]],'ct':[[1,1]],
 'csh':[[1,1],[82,9]],'gr':[[1,9]],'aw':[[1,1]],'src':[[1,1]],'cs':[[1,1]]}
NAME={'core':'Shadowrun 2nd Edition core rulebook','ssc':'Street Samurai Catalog','r2':'Rigger 2','vr2':'Virtual Realities 2.0','fof':'Fields of Fire','st':'Shadowtech',
 'ct':'Cybertechnology','csh':'Corporate Security Handbook','gr':'The Grimoire (2nd ed.)','aw':'Awakenings: New Magic in 2057','src':'Shadowrun Companion: Beyond the Shadows','cs':'Corporate Shadowfiles'}
old=json.load(open('pagemap.json')) if False else {}
def off(bk,p):
  o=0
  for s,v in RUNS[bk]:
    if p>=s: o=v
  return o
M={}
for bk in RUNS:
  fs=sorted(glob.glob(f'pages/{bk}/p*.txt'))
  for f in fs:
    p=int(re.search(r'p(\d+)',f).group(1)); t=open(f).read().split('\n',1)[1]
    open(f,'w').write(f'### {bk} pdf {p} printed {p-off(bk,p)}\n'+t)
  M[bk]={'name':NAME[bk],'pdf_pages':len(fs),'pdf_minus_printed':RUNS[bk]}
json.dump(M,open('pagemap.json','w'),indent=1); print('ok')
