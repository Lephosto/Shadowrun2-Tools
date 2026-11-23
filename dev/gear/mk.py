s=open('gear/template.html').read(); d=open('gear_data.json').read()
s=s.replace('/*DATA*/null',d.replace('</','<\\/'),1)
open('gear/sr2-gear-locker.html','w').write('<meta charset="utf-8">\n'+s)  # checks open this bare file: say UTF-8, or Chrome can guess wrong under load
head='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
open('SR2_Gear_Locker.html','w').write(head+s+'\n</html>\n')
