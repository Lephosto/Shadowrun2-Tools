import json,re
exec(open('pages.py').read().split('off={}')[0])
off=json.load(open('off.json'))
def fm(c):
  c=float(c)
  if c!=int(c): return {('%g'%c)}
  c=int(c); s={str(c)}
  if c>=1000: s|={f'{c:,}',f'{c:,}'.replace(',','.'),f'{c:,}'.replace(',',' ')}
  return s
out={'ok':[],'noname':[],'nocost':[],'noess':[]}
for it in D:
  bk=bookof(it); p=pgnum(it)
  if bk not in P or not p: continue
  pages=[P[bk][i] for i in range(p+off[bk]-1,p+off[bk]+2) if 0<=i<len(P[bk])]
  txt='\n'.join(pages); nt=norm(txt); w=key(it)
  if not (w and all(x in nt for x in w)): out['noname'].append([it['k'],it['pg']]); continue
  costs=[v for v in it['cost'].values() if isinstance(v,(int,float)) and v>0]
  ok=True
  if costs:
    c=costs[0]
    if not any(re.search(r'(?<![\d,.])'+re.escape(f)+r'(?![\d])',txt) for f in fm(c)):
      out['nocost'].append([it['k'],it['pg'],costs]); ok=False
  es=[v for v in it['ess'].values() if isinstance(v,(int,float)) and v>0]
  if es and ok:
    e=es[0]; f=('%g'%e).lstrip('0') if e<1 else '%g'%e
    if not re.search(r'(?<![\d])'+re.escape(f)+r'(?![\d])',txt) and not re.search(re.escape('%g'%e),txt):
      out['noess'].append([it['k'],it['pg'],es]); ok=False
  if ok: out['ok'].append(it['k'])
print({k:len(v) for k,v in out.items()})
json.dump(out,open('pres.json','w'),indent=0)
