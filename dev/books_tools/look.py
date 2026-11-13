# usage: look.py BOOK PDFPAGE "word1|word2" [pad] -> writes img/BOOK_PAGE.png cropped around matching words
import sys,subprocess,re,os
from PIL import Image
A='/mnt/user-data/attachments/5b264a23-4e63-5f6c-b1a2-f1fa85b002fe/'; U='/mnt/user-data/uploads/'
F={'core':U+'Shadowrun_2nd_Edition_Core_Rulebook_searchable.pdf','ssc':A+'16081f2a-Street_Samurai_Catalog_searchable.pdf','r2':U+'Rigger_2_searchable.pdf','vr2':A+'a792e631-Virtual_Realities_2.0_searchable.pdf','fof':A+'2f0ba6c0-Fields_of_Fire_searchable.pdf','st':A+'2becc94f-Shadowtech_searchable.pdf','ct':A+'6ad209d9-Cybertechnology_searchable.pdf','csh':U+'Corporate_Security_Handbook_searchable.pdf','gr':A+'dd90b0e9-Shadowrun_-_The_Grimoire_Manual_of_Practical_Thaumaturgy_searchable.pdf','aw':U+'Awakenings_-_New_Magic_in_2057_searchable.pdf','src':U+'Shadowrun_Companion_-_Beyond_the_Shadows__searchable_.pdf'}
bk,pg,q=sys.argv[1],int(sys.argv[2]),sys.argv[3]; pad=int(sys.argv[4]) if len(sys.argv)>4 else 60
out=f'/home/claude/books/img/{bk}_{pg}'
subprocess.run(['pdftoppm','-f',str(pg),'-l',str(pg),'-r','130','-png','-singlefile',F[bk],out],check=True)
bb=subprocess.run(['pdftotext','-f',str(pg),'-l',str(pg),'-bbox',F[bk],'-'],capture_output=True,text=True).stdout
pw=float(re.search(r'<page width="([\d.]+)"',bb).group(1))
im=Image.open(out+'.png'); s=im.width/pw
ys=[ (float(m.group(2)),float(m.group(4))) for m in re.finditer(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>',bb) if re.search(q,m.group(5),re.I)]
if not ys: im.save(out+'_c.png'); print('no match; full page',out+'_c.png'); sys.exit()
y0=max(0,min(a for a,b in ys)*s-pad); y1=min(im.height,max(b for a,b in ys)*s+pad)
im.crop((0,int(y0),im.width,int(y1))).save(out+'_c.png'); print(out+'_c.png',len(ys),'matches')
