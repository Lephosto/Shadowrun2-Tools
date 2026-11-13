import json,re,collections
D=json.load(open('geardb.json'))
B={'core':'core','SSC':'ssc','CT':'ct','FoF':'fof','ST':'st','CSH':'csh','AW':'aw','R2':'r2','VR2':'vr2'}
def norm(s): return re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()
P={}
for k,v in B.items():
  P[k]=open(v+'.txt',errors='ignore').read().split('\f')
def bookof(it):
  m=re.match(r'^([A-Za-z0-9]+) p',it['pg']); return m.group(1) if m else 'core'
def pgnum(it):
  m=re.search(r'p\. ?(\d+)',it['pg']); return int(m.group(1)) if m else None
def key(it):
  n=re.sub(r'\(.*?\)','',it['n']).replace('Helmet option:','').strip(); return [w for w in norm(n).split() if len(w)>2]
off={}
for bk in B:
  items=[it for it in D if bookof(it)==bk and pgnum(it)]
  best=None
  for o in range(-5,40):
    sc=0
    for it in items:
      i=pgnum(it)+o
      if 0<=i<len(P[bk]):
        t=norm(P[bk][i]); w=key(it)
        if w and all(x in t for x in w): sc+=1
    if best is None or sc>best[1]: best=(o,sc)
  off[bk]=best[0]; print(bk,'offset',best,'of',len(items))
json.dump(off,open('off.json','w'))
