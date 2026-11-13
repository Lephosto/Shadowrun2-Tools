#!/usr/bin/env python3
"""srfind.py REGEX [book ...]  -> every matching line with book, printed page and PDF page.
srfind.py --page BOOK PRINTED  -> print that printed page's text (and say which PDF page to render)."""
import sys,glob,re,json,os,signal
signal.signal(signal.SIGPIPE, signal.SIG_DFL)
D=os.path.dirname(os.path.abspath(__file__)); M=json.load(open(D+'/pagemap.json'))
def pdf_of(bk,pr):
  for f in sorted(glob.glob(f'{D}/pages/{bk}/p*.txt')):
    h=open(f).readline().split()
    if int(h[-1])==pr: return f,int(h[3])
  return None,None
if len(sys.argv)>1 and sys.argv[1]=='--page':
  bk,pr=sys.argv[2],int(sys.argv[3]); f,p=pdf_of(bk,pr)
  print(open(f).read() if f else 'not found'); print(f'(render: pdftoppm -f {p} -l {p} -r 110 -png "{M[bk]}")' if f else ''); sys.exit()
rx=re.compile(sys.argv[1],re.I); books=sys.argv[2:] or list(M)
for bk in books:
  for f in sorted(glob.glob(f'{D}/pages/{bk}/p*.txt')):
    L=open(f).read().split('\n'); h=L[0].split()
    for l in L[1:]:
      if rx.search(l): print(f'{bk:4} p.{h[-1]:>3} (pdf {h[3]:>3}) | {l.strip()[:150]}')
